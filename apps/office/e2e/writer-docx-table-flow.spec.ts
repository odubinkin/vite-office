/** @fileoverview Repeated DOCX table headers through the production Writer file controls. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../src/package/source/zippackage/document-archive";

test("Writer preserves a DOCX table headline through browser storage and mobile reopen", /** Checks the pinned header fixture with the actual Open and Export dialogs. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf64264.docx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const heading = page.getByRole("columnheader").filter({ hasText: "Repeating Table Header" });
  await page.goto("/writer");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(heading.first()).toBeVisible();
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf64264", exact: true }).click();
  await expect(heading.first()).toBeVisible();

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing DOCX table download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(buffer);
  const xml = await archive.readTextEntry("word/document.xml");
  expect(xml.match(/<w:tblHeader w:val="true"\/>/gu)).toHaveLength(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    name: "Reopened table.docx",
    buffer,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  await expect(page.getByRole("button", { name: "Reopened table", exact: true })).toBeVisible();
  await expect(heading.first()).toBeVisible();
});

test("Writer uses the named first-row flag when opening a DOCX table style", /** Exercises named look precedence through the worker and visible table semantics. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const original = await readFile(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf167843_tblLook_firstRow_tblHeader.docx",
      import.meta.url,
    ),
  );
  const archive = await DocumentArchive.open(original);
  const writer = new DocumentArchiveWriter();
  for (const name of archive.getEntryNames()) {
    if (name !== "word/document.xml") writer.putNextEntry(name, await archive.readEntry(name));
    else {
      const xml = await archive.readTextEntry(name);
      const look = '<w:tblLook w:val="04A0" w:firstRow="0" />';
      expect(xml).toContain(look);
      writer.putNextEntry(
        name,
        new TextEncoder().encode(xml.replace(look, '<w:tblLook w:val="04A0" w:firstRow="1"/>')),
      );
    }
  }
  const enabled = Buffer.from(await writer.finish());
  const mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const open = page.getByRole("button", { name: "Open", exact: true });
  const headings = page.getByRole("columnheader", { name: "No Header", exact: true });
  await page.goto("/writer");

  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByLabel("Browse")
    .setInputFiles({ name: "First row off.docx", buffer: original, mimeType });
  await expect(page.getByRole("cell", { name: "No Header", exact: true }).first()).toBeVisible();
  await expect(headings).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByLabel("Browse")
    .setInputFiles({ name: "First row on.docx", buffer: enabled, mimeType });
  await expect(headings.first()).toBeVisible();

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing styled DOCX download.");
  const exported = await DocumentArchive.open(await readFile(path));
  const styles = await exported.readTextEntry("word/styles.xml");
  expect(styles).toMatch(
    /<w:style[^>]*w:styleId="TableGrid">.*?<w:tblStylePr w:type="firstRow">.*?<w:tblHeader\/>/u,
  );
  const xml = await exported.readTextEntry("word/document.xml");
  expect(xml).toContain('<w:tblStyle w:val="TableGrid"/>');
  expect(xml).toContain('<w:tblLook w:val="07e0" w:firstRow="1"/>');
});

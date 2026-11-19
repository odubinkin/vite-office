/** @fileoverview Repeated DOCX table headers through the production Writer file controls. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../src/package/source/zippackage/document-archive";

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

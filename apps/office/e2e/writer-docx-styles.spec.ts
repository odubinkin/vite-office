/** @fileoverview Production Writer DOCX styles and tables through Chromium file import and export. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../src/package/source/zippackage/document-archive";

test("Writer downloads and reopens the named styles from a DOCX", /** Verifies the shipped file dialog at desktop and mobile widths. @param root0 - Browser fixtures. @param root0.page - Actual Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf138345_charStyleHighlight.docx",
      import.meta.url,
    ),
  );
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await expect(editor).toHaveText("An orange background is so nice.");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf138345_charStyleHighlight", exact: true }).click();
  await expect(editor).toHaveText("An orange background is so nice.");

  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const download = await finished;
  const path = await download.path();
  if (path === null) throw new Error("Chromium did not expose the completed DOCX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  const document = await archive.readTextEntry("word/document.xml");
  expect(document).toContain('<w:rStyle w:val="charBackground"/>');
  expect(document).toMatch(/<w:pgSz w:orient="landscape" w:w="\d+" w:h="\d+"\/>/);
  expect(document).toContain('<w:pgMar w:left="1134" w:right="1134"');
  expect(await archive.readTextEntry("word/styles.xml")).not.toContain("<w:highlight");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "reopened-named-styles.docx",
  });
  await expect(page.getByText("reopened-named-styles", { exact: true })).toBeVisible();
  await expect(editor).toHaveText("An orange background is so nice.");
});

test("Writer downloads and reopens nested DOCX tables", /** Exercises the existing Writer file UI with the pinned nested-table fixture. @param browser - Playwright fixtures. @param browser.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const file = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf131260.docx",
      import.meta.url,
    ),
  );
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(file);
  const tables = page.locator("[data-writer-table] > table");
  await expect(tables).toHaveCount(3);

  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await finished).path();
  if (path === null) throw new Error("Chromium did not expose the completed DOCX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  expect((await archive.readTextEntry("word/document.xml")).match(/<w:tbl>/gu)).toHaveLength(3);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "reopened-nested-tables.docx",
  });
  await expect(page.getByText("reopened-nested-tables", { exact: true })).toBeVisible();
  await expect(tables).toHaveCount(3);
});

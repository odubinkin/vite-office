/** @fileoverview Native SpreadsheetML text through the existing Calc browser document flows. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

/** Downloads the current Calc workbook through the existing menu. @param page - Chromium page. @returns Actual XLSX bytes. */
async function downloadXlsx(page: Page): Promise<Buffer> {
  const completed = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await completed).path();
  if (!path) throw new Error("Missing XLSX download.");
  return readFile(path);
}

test("Calc preserves XLSX escaped text through browser storage and download", /** Drives upload, primary browser storage, download and mobile reopen of the actual fixture. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/escape-unicode.xlsx",
      import.meta.url,
    ),
  );
  const upload = page
    .getByRole("tabpanel", { name: "On computer", exact: true })
    .locator('input[type="file"]');
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await upload.setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15000 });

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "escape-unicode", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15000 });

  const bytes = await downloadXlsx(page);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  expect(await archive.readTextEntry("xl/sharedStrings.xml")).toContain(
    "Line 1&#10;Line 2&#10;Line 3&#10;Line 4",
  );
  expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toMatch(
    /<c r="B2"[^>]*t="s"><v>\d+<\/v><\/c>/u,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await upload.setInputFiles({
    buffer: bytes,
    name: "reopened-text.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByText("reopened-text", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15000 });
});

test("Calc preserves formatted XLSX runs through primary ODS and download", /** Verifies actual Open, storage reopen and XLSX download on desktop and mobile. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/preserve_space.xlsx",
      import.meta.url,
    ),
  );
  const upload = page
    .getByRole("tabpanel", { name: "On computer", exact: true })
    .locator('input[type="file"]');
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await upload.setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15000 });

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "preserve_space", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15000 });
  const first = await downloadXlsx(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await upload.setInputFiles({
    buffer: first,
    name: "reopened-rich-text.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15000 });
  const second = await downloadXlsx(page);

  for (const bytes of [first, second]) {
    const archive = await DocumentArchive.open(new Uint8Array(bytes));
    expect(await archive.readTextEntry("xl/sharedStrings.xml")).toMatch(
      /<rPr><b val="true"\/>.*?<\/rPr><t xml:space="preserve">123&#10;<\/t>/u,
    );
  }
});

test("Calc preserves XLSX theme references after opening the primary ODS copy", /** Verifies native theme and color style output after an actual Worker-backed storage reload. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/CalcThemeTest.xlsx",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByRole("tabpanel", { name: "On computer", exact: true })
    .locator('input[type="file"]')
    .setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15000 });

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "CalcThemeTest", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15000 });
  const archive = await DocumentArchive.open(new Uint8Array(await downloadXlsx(page)));
  expect(await archive.readTextEntry("xl/theme/theme1.xml")).toContain(
    '<a:accent1><a:srgbClr val="4472C4"/></a:accent1>',
  );
  const styles = await archive.readTextEntry("xl/styles.xml");
  expect(styles).toContain('<color theme="7"/>');
  expect(styles).toContain('<fgColor theme="4"/>');
});

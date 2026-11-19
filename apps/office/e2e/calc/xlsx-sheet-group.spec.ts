/** @fileoverview XLSX worksheet group through the actual Calc browser view and download. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

const xlsxType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Selects the first and fifth sheets in the native five-sheet fixture. @returns XLSX fixture bytes. */
async function groupedWorkbook(): Promise<Buffer> {
  const archive = await DocumentArchive.open(
    await readFile(
      new URL(
        "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/sheet-names.xlsx",
        import.meta.url,
      ),
    ),
  );
  const writer = new DocumentArchiveWriter();
  for (const part of archive.getEntryNames()) {
    const payload =
      part === "xl/worksheets/sheet1.xml"
        ? new TextEncoder().encode(
            (await archive.readTextEntry(part)).replace(
              "<sheetView ",
              '<sheetView tabSelected="1" ',
            ),
          )
        : await archive.readEntry(part);
    writer.putNextEntry(part, payload);
  }
  return Buffer.from(await writer.finish());
}

test("Calc restores XLSX grouped worksheet tabs for actual editing and export", /** Checks the imported group, edit commands and downloaded XLSX through the Chromium workbench. @param browser - Browser fixtures. @param browser.page - Actual Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  const open = page.getByRole("button", { name: "Open", exact: true });
  const sheets = page.getByRole("tablist", { name: "Sheets" });
  const first = sheets.getByRole("tab", { name: "S&P", exact: true });
  const active = sheets.getByRole("tab", { name: "C>D", exact: true });
  const other = sheets.getByRole("tab", { name: "Sam's Club", exact: true });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await groupedWorkbook(),
    name: "Grouped sheets.xlsx",
    mimeType: xlsxType,
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(active).toHaveAttribute("aria-selected", "true");
  await expect(active).toHaveAttribute("aria-current", "page");
  await expect(other).toHaveAttribute("aria-selected", "false");

  await page.getByRole("gridcell", { name: /^B2(?:\s|$)/u }).click();
  await page.keyboard.type("42");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("gridcell", { name: /^B2(?:\s|$)/u })).toHaveText("42");
  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing grouped worksheet XLSX download.");
  const buffer = await readFile(path);
  const exported = await DocumentArchive.open(buffer);
  for (const tab of [1, 5]) {
    const sheet = await exported.readTextEntry(`xl/worksheets/sheet${tab}.xml`);
    expect(sheet).toContain('tabSelected="true"');
    expect(sheet).toMatch(/<c r="B2"[^>]*><v>42<\/v><\/c>/u);
  }
  expect(await exported.readTextEntry("xl/worksheets/sheet2.xml")).toContain('tabSelected="false"');
  await page.setViewportSize({ width: 430, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByLabel("Browse")
    .setInputFiles({ buffer, name: "Grouped sheets reopened.xlsx", mimeType: xlsxType });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(active).toHaveAttribute("aria-current", "page");
  await expect(active).toHaveAttribute("aria-selected", "true");
  await other.click();
  await expect(other).toHaveAttribute("aria-selected", "true");
  await expect(first).toHaveAttribute("aria-selected", "false");
  await expect(active).toHaveAttribute("aria-selected", "false");
});

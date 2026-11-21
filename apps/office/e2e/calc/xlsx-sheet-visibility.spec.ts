/** @fileoverview Original XLSX sheet visibility through the native Calc file and tab controls. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("Calc opens and exports a workbook with hidden sheets", /** Checks actual XLSX, primary ODS and existing sheet controls. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/hidden_sheets.xlsx",
      import.meta.url,
    ),
  );
  const sheetTabs = page.getByRole("tablist", { name: "Sheets" });
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(sheetTabs.getByRole("tab")).toHaveText(["Sheet2"]);
  await page.getByRole("menuitem", { name: "Sheet", exact: true }).click();
  await page.getByRole("menuitem", { name: "Show Sheet…" }).click();
  const show = page.getByRole("dialog", { name: "Show Sheet" });
  await expect(show.getByRole("listbox", { name: "Hidden Sheets" })).toHaveValues(["0"]);
  await show.getByRole("button", { name: "OK" }).click();
  await expect(sheetTabs.getByRole("tab")).toHaveText(["Sheet1", "Sheet2"]);
  await sheetTabs.getByRole("tab", { name: "Sheet2" }).click();
  const cell = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  await cell.click();
  await page.keyboard.type("42");
  await page.keyboard.press("Enter");
  await expect(cell).toHaveText("42");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Hidden sheets copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Hidden sheets copy", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(cell).toHaveText("42");
  await expect(sheetTabs.getByRole("tab", { name: "Sheet2" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.getByRole("menuitem", { name: "Sheet", exact: true }).click();
  await page.getByRole("menuitem", { name: "Navigate" }).click();
  await page.getByRole("menuitem", { name: "Go to Sheet…" }).click();
  await expect(page.getByRole("listbox").getByRole("option")).toHaveText(["Sheet1", "Sheet2"]);
  await page.getByRole("button", { name: "Cancel" }).click();

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing XLSX download.");
  const archive = await DocumentArchive.open(new Uint8Array(await readFile(path)));
  const workbook = await archive.readTextEntry("xl/workbook.xml");
  expect(workbook).toContain('<workbookView activeTab="1" showSheetTabs="true"/>');
  expect(workbook.match(/state="hidden"/g)).toHaveLength(1);
});

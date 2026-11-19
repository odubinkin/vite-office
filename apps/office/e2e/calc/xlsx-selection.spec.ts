/** @fileoverview Exports the actual Calc grid's selection through the existing XLSX file controls. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("Calc exports disjoint marks with the native XLSX active range index", /** Verifies live marks, workbook XML and cursor restoration in production Chromium. @param browser - Chromium fixtures. @param browser.page - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  const grid = page.getByRole("grid", { name: "Spreadsheet" });
  /** Queries one visible sheet cell without matching its formatted content. @param name - Cell address. @returns Actual cell. */
  function cell(name: string) {
    return grid.locator(`[role="gridcell"][aria-label="${name}"]`);
  }
  await cell("A1").click();
  await page.keyboard.type("42");
  await page.keyboard.press("Enter");
  await cell("B2").click();
  await cell("C3").click({ modifiers: ["Shift"] });
  await cell("E5").click({ modifiers: ["ControlOrMeta"] });
  await expect(cell("C3")).toHaveAttribute("aria-selected", "true");
  await expect(cell("E5")).toHaveAttribute("aria-selected", "true");
  await expect(cell("D4")).toHaveAttribute("aria-selected", "false");
  await expect(page.getByRole("textbox", { name: "Name Box" })).toHaveValue("E5");

  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Missing XLSX selection download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(buffer);
  const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(xml.match(/<selection[^>]*\/>/u)?.[0]).toBe(
    '<selection pane="topLeft" activeCell="E5" activeCellId="1" sqref="B2:C3 E5"/>',
  );

  await page.setViewportSize({ width: 430, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "XLSX marks downloaded.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Name Box" })).toHaveValue("E5");
  await expect(cell("C3")).toHaveAttribute("aria-selected", "false");
});

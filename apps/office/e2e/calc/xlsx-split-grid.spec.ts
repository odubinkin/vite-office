/** @fileoverview Production Chromium coverage of normal split windows loaded from XLSX. */
import { readFile } from "node:fs/promises";
import { expect, test, type Locator } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

const spreadsheetML = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Creates a normal two-axis view in the pinned workbook's active sheet. @returns Local XLSX bytes. */
async function splitWorkbook(): Promise<Buffer> {
  const source = await DocumentArchive.open(
    await readFile(
      new URL(
        "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/sheet-names.xlsx",
        import.meta.url,
      ),
    ),
  );
  const writer = new DocumentArchiveWriter();
  for (const part of source.getEntryNames()) {
    const content =
      part !== "xl/worksheets/sheet5.xml"
        ? await source.readEntry(part)
        : new TextEncoder().encode(
            (await source.readTextEntry(part))
              .replace(
                '<sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>',
                '<sheetViews><sheetView topLeftCell="B3" workbookViewId="0"><pane xSplit="5100" ySplit="3600" topLeftCell="G12" activePane="bottomRight" state="split"/><selection pane="bottomRight" activeCell="G12" sqref="G12"/></sheetView></sheetViews>',
              )
              .replace(
                "<sheetData/>",
                '<sheetData><row r="12"><c r="G12"><v>42</v></c></row></sheetData>',
              ),
          );
    writer.putNextEntry(part, content);
  }
  return Buffer.from(await writer.finish());
}

/** Queries the current first cell for one view pane. @param grid - Spreadsheet. @param part - Native view part. @returns First cell. */
function firstCell(grid: Locator, part: number): Locator {
  return grid.locator(`[data-calc-pane="${part}"]`).first();
}

test("Calc scrolls both pairs of normal XLSX panes independently", /** Verifies pane pairing, activation and storage in the built application. @param browser - Chromium fixtures. @param browser.page - Actual browser page. @returns Completion. */ async ({
  page,
}) => {
  const grid = page.getByRole("grid", { name: "Spreadsheet" });
  const open = page.getByRole("button", { name: "Open", exact: true });
  const name = page.getByRole("textbox", { name: "Name Box" });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await splitWorkbook(),
    name: "Normal split.xlsx",
    mimeType: spreadsheetML,
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(firstCell(grid, 0)).toHaveAttribute("aria-label", "B3");
  await expect(firstCell(grid, 1)).toHaveAttribute("aria-label", "G3");
  await expect(firstCell(grid, 2)).toHaveAttribute("aria-label", "B12");
  await expect(firstCell(grid, 3)).toHaveAttribute("aria-label", "G12");
  await expect(name).toHaveValue("G12");

  const top = await firstCell(grid, 0).boundingBox();
  if (!top) throw new Error("Top left split pane is missing.");
  await page.mouse.move(top.x + 8, top.y + 8);
  await page.mouse.wheel(120, 72);
  await expect(firstCell(grid, 0)).not.toHaveAttribute("aria-label", "B3");
  await expect(firstCell(grid, 1)).not.toHaveAttribute("aria-label", "G3");
  await expect(firstCell(grid, 2)).not.toHaveAttribute("aria-label", "B12");
  await expect(firstCell(grid, 3)).toHaveAttribute("aria-label", "G12");
  const first = await firstCell(grid, 0).getAttribute("aria-label");
  if (!first) throw new Error("Missing first position after scrolling.");
  const bottom = await firstCell(grid, 3).boundingBox();
  if (!bottom) throw new Error("Bottom right split pane is missing.");
  await page.mouse.move(bottom.x + 8, bottom.y + 8);
  await page.mouse.wheel(120, 72);
  await expect(firstCell(grid, 3)).not.toHaveAttribute("aria-label", "G12");
  await expect(firstCell(grid, 0)).toHaveAttribute("aria-label", first);
  const second = await firstCell(grid, 3).getAttribute("aria-label");
  if (!second) throw new Error("Missing second position after scrolling.");

  const right = await firstCell(grid, 1).boundingBox();
  if (!right) throw new Error("Top right split pane is missing.");
  // The first cell can be partially clipped. Choose a point a cell away from its clipped edges.
  await page.mouse.click(right.x + 110, right.y + 25);
  await expect(grid).toHaveAttribute("aria-activedescendant", /-1$/u);
  const cursor = await name.inputValue();
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Normal split saved");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Normal split saved", exact: true }).click();
  await expect(firstCell(grid, 0)).toHaveAttribute("aria-label", first);
  await expect(firstCell(grid, 3)).toHaveAttribute("aria-label", second);
  await expect(grid).toHaveAttribute("aria-activedescendant", /-1$/u);
  await expect(name).toHaveValue(cursor);

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(buffer);
  const xml = await archive.readTextEntry("xl/worksheets/sheet5.xml");
  expect(xml).toMatch(new RegExp(`<sheetView [^>]*topLeftCell="${first}"`, "u"));
  expect(xml.match(/<pane[^>]*\/>/u)?.[0]).toBe(
    `<pane xSplit="5100" ySplit="3600" topLeftCell="${second}" activePane="topRight" state="split"/>`,
  );
  await page.setViewportSize({ width: 430, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Normal split downloaded.xlsx",
    mimeType: spreadsheetML,
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(firstCell(grid, 0)).toHaveAttribute("aria-label", first);
  await expect(firstCell(grid, 3)).toHaveAttribute("aria-label", second);
  await expect(name).toHaveValue(cursor);
});

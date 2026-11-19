/** @fileoverview Browser regression for frozen pane rendering and file view state. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test.use({ viewport: { width: 1440, height: 900 } });

test("Calc keeps the frozen XLSX rows and columns stationary while scrolling", /** Runs the pinned freeze-pane fixture through the actual grid and XLSX download. @param fixtures - Chromium fixtures. @param fixtures.page - Browser page. @returns Completion. */ async ({
  page,
}) => {
  const source = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/freezePaneStartCell.xlsx",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(source);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const grid = page.getByRole("grid", { name: "Spreadsheet" });
  const corner = grid.locator('[data-calc-column="0"][data-calc-row="0"]');
  const fixedColumn = grid.locator('[data-calc-column="0"][data-calc-row="10"]');
  const fixedRow = grid.locator('[data-calc-column="5"][data-calc-row="0"]');
  await expect(corner).toBeInViewport();
  await expect(fixedColumn).toBeInViewport();
  await expect(fixedRow).toBeInViewport();
  const initial = await corner.boundingBox();
  const name = page.getByRole("textbox", { name: "Name Box" });
  await expect(name).toHaveValue("F11");
  await grid.evaluate(
    /** Scrolls both actual DOM axes. @param element - Spreadsheet viewport. @returns Nothing. */ (
      element,
    ) => {
      element.scrollTop += 47;
      element.scrollLeft += 1000;
    },
  );
  await expect(fixedColumn).toHaveCount(0);
  await expect(fixedRow).toHaveCount(0);
  expect(await corner.boundingBox()).toEqual(initial);
  await expect(name).toHaveValue("F11");

  /** Reads the moving origin while allowing for the fixture's hidden fixed column and row. @returns First cell of the movable pane. */
  function movingOrigin(): Promise<string | null | undefined> {
    return grid.evaluate(
      /** Locates each movable axis in the real grid. @param element - Spreadsheet viewport. @returns First movable cell label. */
      (element) => {
        const column = Array.from(
          element.querySelectorAll<HTMLElement>('[data-calc-row="0"][data-calc-column]'),
        ).find(
          /** Skips the fixed columns. @param cell - Visible cell. @returns Whether it can scroll horizontally. */
          (cell) => Number(cell.dataset.calcColumn) >= 5,
        )?.dataset.calcColumn;
        const row = Array.from(
          element.querySelectorAll<HTMLElement>('[data-calc-column="0"][data-calc-row]'),
        ).find(
          /** Skips the fixed rows. @param cell - Visible cell. @returns Whether it can scroll vertically. */
          (cell) => Number(cell.dataset.calcRow) >= 10,
        )?.dataset.calcRow;
        return element
          .querySelector(`[data-calc-column="${column}"][data-calc-row="${row}"]`)
          ?.getAttribute("aria-label");
      },
    );
  }
  const origin = await movingOrigin();
  expect(origin).toMatch(/^[A-Z]+[1-9][0-9]*$/u);

  await corner.dblclick();
  await expect(page.getByRole("textbox", { name: "Edit cell A1" })).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(name).toHaveValue("A1");
  expect(await corner.boundingBox()).toEqual(initial);
  await expect.poll(movingOrigin).toBe(origin);

  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Scrolled frozen worksheet");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Scrolled frozen worksheet", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(movingOrigin).toBe(origin);
  await expect(name).toHaveValue("A1");

  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const output = await (await download).path();
  if (!output) throw new Error("Missing frozen worksheet XLSX download.");
  const archive = await DocumentArchive.open(await readFile(output));
  const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(xml.match(/<pane[^>]*\/>/u)?.[0]).toBe(
    `<pane xSplit="5" ySplit="10" topLeftCell="${origin}" activePane="bottomRight" state="frozen"/>`,
  );
});

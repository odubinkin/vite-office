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
  const delta = await grid.evaluate(
    /** Measures native scrolling before Calc can repaint in its scroll handler. @param element - Spreadsheet viewport. @returns Cell displacement on each axis. */
    (element) => {
      const before = [
        '[data-calc-column="0"][data-calc-row="0"]',
        '[data-calc-column="0"][data-calc-row="10"]',
        '[data-calc-column="5"][data-calc-row="0"]',
      ].map(
        /** Finds and measures a cell in each frozen region. @param selector - Cell selector. @returns Cell and its original screen position. */
        (selector) => {
          const cell = element.querySelector(selector);
          if (!cell) throw new Error(`Missing frozen pane cell ${selector}`);
          const { x, y } = cell.getBoundingClientRect();
          return { cell, x, y };
        },
      );
      const { scrollLeft, scrollTop } = element;
      element.scrollLeft += 7;
      element.scrollTop += 5;
      const movement = before.map(
        /** Compares the screen position in the same browser task. @param position - Cell and original screen position. @returns Horizontal and vertical movement in pixels. */
        ({ cell, x, y }) => {
          const after = cell.getBoundingClientRect();
          return [after.x - x, after.y - y];
        },
      );
      element.scrollLeft = scrollLeft;
      element.scrollTop = scrollTop;
      return movement;
    },
  );
  expect(delta).toEqual([
    [0, 0],
    [0, -5],
    [-7, 0],
  ]);
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

test("Calc freezes the first row from View even when it is scrolled out of the grid", /** Checks the production freeze command, scroll behavior and XLSX pane output. @param fixtures - Chromium fixtures. @param fixtures.page - Page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  const grid = page.getByRole("grid", { name: "Spreadsheet" });
  const top = grid.locator('[data-calc-column="0"][data-calc-row="0"]');
  await expect(top).toBeInViewport();
  await grid.evaluate(
    /** Scrolls the first row out of the body. @param element - Grid viewport. @returns Nothing. */
    (element) => {
      element.scrollTop += 100;
    },
  );
  await expect(top).toHaveCount(0);
  await page.getByRole("menuitem", { name: "View", exact: true }).click();
  await page.getByRole("menuitem", { name: "Freeze Cells", exact: true }).click();
  await page.getByRole("menuitem", { name: "Freeze First Row", exact: true }).click();
  await expect(top).toBeInViewport();
  const before = await top.boundingBox();
  await grid.evaluate(
    /** Scrolls the lower pane while leaving the first row fixed. @param element - Grid viewport. @returns Nothing. */
    (element) => {
      element.scrollTop += 100;
    },
  );
  await expect(top).toBeInViewport();
  expect(await top.boundingBox()).toEqual(before);

  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const output = await (await download).path();
  if (!output) throw new Error("Missing XLSX download after freezing first row.");
  const archive = await DocumentArchive.open(await readFile(output));
  const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(xml.match(/<pane[^>]*\/>/u)?.[0]).toMatch(
    /<pane xSplit="0" ySplit="1" [^>]*state="frozen"\/>/u,
  );
});

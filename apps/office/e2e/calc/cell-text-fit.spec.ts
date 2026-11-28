/** @fileoverview Measures the actual Calc text fit through Format Cells and grid resizing. */
import { expect, test, type Page } from "@playwright/test";

/** Opens the actual Calc alignment page through the menu. @param page - Workbook page. @returns Alignment dialog. */
async function alignment(page: Page) {
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: /^Format Cells/ }).click();
  const dialog = page.getByRole("dialog", { name: "Format Cells" });
  await dialog.getByRole("tab", { name: "Alignment" }).click();
  return dialog;
}

/** Edits the actual active cell. @param page - Workbook page. @param value - Text to enter. @returns Completion. */
async function enter(page: Page, value: string): Promise<void> {
  await page.getByRole("textbox", { name: "Input line", exact: true }).fill(value);
  await page.getByRole("button", { name: "Accept input", exact: true }).click();
}

/** Sets width using Calc's original column dialog. @param page - Workbook page. @param width - Metric width. @returns Completion. */
async function resizeColumn(page: Page, width: string): Promise<void> {
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Columns", exact: true }).click();
  await page.getByRole("menuitem", { name: "Column Width…", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Width", exact: true }).fill(width);
  await page.getByRole("button", { name: "OK", exact: true }).click();
}

test("fills with whole styled runs and keeps the cell accessible name through width changes and undo", /** Uses actual browser text metrics in the cell. @param fixtures - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await enter(page, "AB");
  const cell = page.getByRole("gridcell", { name: "A1 AB", exact: true });
  const dialog = await alignment(page);
  await dialog
    .getByRole("combobox", { name: "Horizontal", exact: true })
    .selectOption({ label: "Filled" });
  await dialog.getByRole("button", { name: "OK", exact: true }).click();

  const repetitions = cell
    .locator('span[aria-hidden="true"]:visible')
    .filter({ hasText: /^AB(?:AB)*$/u });
  await expect(repetitions).toHaveCount(1);
  const old = (await repetitions.textContent())?.length ?? 0;
  await resizeColumn(page, "2in");
  await expect
    .poll(
      /** Measures the additional visual runs after resizing. @returns New repeated text length. */ async () =>
        (await repetitions.textContent())?.length ?? 0,
    )
    .toBeGreaterThan(old);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(repetitions).toHaveText("AB".repeat(old / 2));
  const name = page.getByRole("textbox", { name: "Name Box", exact: true });
  await name.fill("A1:B1");
  await name.press("Enter");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Merge and Unmerge Cells", exact: true }).click();
  await page.getByRole("menuitem", { name: "Merge Cells", exact: true }).click();
  await expect(cell).toHaveAttribute("aria-colspan", "2");
  await expect
    .poll(
      /** Measures the wider merged text box. @returns Text length of whole additional copies. */ async () =>
        (await repetitions.textContent())?.length ?? 0,
    )
    .toBeGreaterThan(old);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(repetitions).toHaveText("AB".repeat(old / 2));
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(repetitions).toHaveCount(0);
  await expect(cell).toHaveCount(1);
});

test("shrinks only while needed and gives line wrapping priority", /** Measures rendered font sizes as Calc applies and overrides shrinking. @param fixtures - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  const value = "The full Calc cell text is wider than one column";
  await enter(page, value);
  const cell = page.getByRole("gridcell", { name: `A1 ${value}`, exact: true });
  const painted = cell.getByText(value, { exact: true }).filter({ visible: true });
  const fontSize = /** Reads the actual rendered font size. @returns CSS pixels. */ () =>
    painted.evaluate(
      /** Reads the DOM font size. @param node - Rendered script run. @returns CSS pixel size. */ (
        node,
      ) => parseFloat(getComputedStyle(node).fontSize),
    );
  const original = await fontSize();
  const dialog = await alignment(page);
  await dialog.getByRole("checkbox", { name: "Shrink to fit cell size" }).check();
  await dialog.getByRole("button", { name: "OK", exact: true }).click();
  await expect.poll(fontSize).toBeLessThan(original);

  await resizeColumn(page, "6in");
  await expect.poll(fontSize).toBe(original);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(fontSize).toBeLessThan(original);
  await page.getByRole("button", { name: "Wrap Text", exact: true }).click();
  await expect(cell).toHaveCSS("white-space", "pre-wrap");
  await expect.poll(fontSize).toBe(original);
});

test("shows overflow marks for a number that cannot shrink into the cell", /** Keeps the original number after the bounded scale attempt. @param fixtures - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await enter(page, "12345");
  const cell = page.getByRole("gridcell", { name: "A1 12345", exact: true });
  const dialog = await alignment(page);
  await dialog.getByRole("checkbox", { name: "Shrink to fit cell size" }).check();
  await dialog.getByRole("button", { name: "OK", exact: true }).click();
  await resizeColumn(page, "0.02in");
  await expect(cell.getByText("###", { exact: true }).filter({ visible: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(cell.getByText("###", { exact: true })).toHaveCount(0);
  await expect(cell).toHaveAccessibleName("A1 12345");
});

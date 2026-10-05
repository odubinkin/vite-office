/** @fileoverview Checks real Chromium selected-row formatting and native ring history. */
import { test, expect } from "@playwright/test";
test("Writer selected row character formatting covers full cells and survives Undo Redo", /** Checks actual table selection behavior. @param root0 - Current owner. @param root0.page - Browser owner. @returns Operation result. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Insert Table" }).click();
  await page
    .getByLabel("Table size")
    .locator("..")
    .getByRole("button", { name: "More Options" })
    .click();
  await page
    .getByRole("dialog", { name: "Insert Table" })
    .getByRole("button", { name: "Insert" })
    .click();
  const first = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true }),
    second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("First");
  await page.keyboard.press("Enter");
  const tail = page.getByLabel("Row 1 column 1 paragraph 2", { exact: true });
  await page.keyboard.type("Tail");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Second");
  await page.getByRole("button", { name: "Select row 1 in Table1" }).click();
  const table = page.getByRole("table", { name: "Table1" }),
    bold = page.getByRole("button", { name: "Bold", exact: true });
  await bold.click();
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  for (const cell of [first, tail, second]) await expect(cell.locator("strong")).toHaveCount(1);
  await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(bold).toHaveAttribute("aria-pressed", "false");
  for (const cell of [first, tail, second]) await expect(cell.locator("strong")).toHaveCount(0);
  await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  for (const cell of [first, tail, second]) await expect(cell.locator("strong")).toHaveCount(1);
  await expect(first).toHaveText("First");
  await expect(tail).toHaveText("Tail");
  await expect(second).toHaveText("Second");
});

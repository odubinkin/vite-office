/** @fileoverview Checks actual Chromium clipboard insertion into native selected table cell rings. */
import { selectBrowserTableRow } from "../test-support/table-mouse-e2e";
import { test, expect } from "@playwright/test";
test("Writer selected row paste appends in every cell and retains native Undo selection", /** Exercises native clipboard ownership and history. @param root0 - Native test input. @param root0.page - Native test input. @returns Test result. */ async ({
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
    second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true }),
    keep = page.getByLabel("Row 2 column 1 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("First");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Tail");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Second");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Keep");
  await selectBrowserTableRow(page, "Table1", 1);
  const table = page.getByRole("table", { name: "Table1" });
  await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  await first.evaluate(
    /** Exercises native clipboard ownership and history. @param element - Native test input. @returns Test result. */ (
      element,
    ) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", "X");
      element.dispatchEvent(
        new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData }),
      );
    },
  );
  await expect(first).toHaveText("First");
  await expect(second).toHaveText("SecondX");
  await expect(page.getByLabel("Row 1 column 1 paragraph 2", { exact: true })).toHaveText("TailX");
  await expect(keep).toHaveText("Keep");
  await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(second).toHaveText("Second");
  await expect(page.getByLabel("Row 1 column 1 paragraph 2", { exact: true })).toHaveText("Tail");
  await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(second).toHaveText("SecondX");
  await expect(page.getByLabel("Row 1 column 1 paragraph 2", { exact: true })).toHaveText("TailX");
  await expect(table.locator("th, td")).toHaveCount(4);
  await expect(keep).toHaveText("Keep");
});

/** @fileoverview Checks real Chromium row deletion preserves cells and one native history boundary. */
import { selectBrowserTableRow } from "../test-support/table-mouse-e2e";
import { test, expect } from "@playwright/test";
test.describe("Writer native table deletion", /** Verifies native selected text deletion.  @returns Operation result. */ () => {
  for (const key of ["Delete", "Backspace"]) {
    test(
      "Writer selected row " + key + " preserves table cells and native Undo Redo",
      /** Verifies native selected text deletion. @param root0 - Current owner. @param root0.page - Browser owner. @returns Operation result. */ async ({
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
        await page.keyboard.press(key);
        await expect(first).toHaveText("");
        await expect(second).toHaveText("");
        await expect(keep).toHaveText("Keep");
        await expect(page.getByLabel("Row 1 column 1 paragraph 2", { exact: true })).toHaveCount(0);
        await expect(table.locator("th, td")).toHaveCount(4);
        await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(0);
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(first).toHaveText("First");
        await expect(second).toHaveText("Second");
        await expect(page.getByLabel("Row 1 column 1 paragraph 2", { exact: true })).toHaveText(
          "Tail",
        );
        await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(first).toHaveText("");
        await expect(second).toHaveText("");
        await page.keyboard.type("New");
        await expect(first).toHaveText("New");
        await expect(second).toHaveText("");
        await expect(keep).toHaveText("Keep");
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(first).toHaveText("");
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(first).toHaveText("First");
        await expect(second).toHaveText("Second");
        await expect(keep).toHaveText("Keep");
      },
    );
  }
});

/** @fileoverview Chromium checks native Table Insert rows commands, caret ownership and history. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(
    "native row menu and caret width=" + width,
    /** Exercises actual menu slots and original cell editing. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Insert Table", exact: true }).click();
      await page.getByRole("button", { name: "2 columns, 2 rows", exact: true }).click();
      await page.keyboard.type("Original");
      const table = page.getByRole("table", { name: "Table1" });
      for (const behind of [false, true]) {
        await page.getByRole("button", { name: "Table", exact: true }).click();
        await page.getByRole("menuitem", { name: "Insert", exact: true }).hover();
        await page
          .getByRole("menuitem", {
            name: behind ? "Insert Rows Below" : "Insert Rows Above",
            exact: true,
          })
          .click();
        await expect(table.locator("tr")).toHaveCount(3);
        const original = page.getByLabel("Row " + (behind ? 1 : 2) + " column 1 paragraph 1", {
          exact: true,
        });
        await expect(original).toHaveText("Original");
        for (let cycle = 0; cycle < 2; cycle++) {
          await page.keyboard.press("Control+z");
          await expect(table.locator("tr")).toHaveCount(2);
          await page.keyboard.press("Control+y");
          await expect(table.locator("tr")).toHaveCount(3);
        }
        await page.keyboard.type("X");
        await expect(original).toHaveText("OriginalX");
        await page.keyboard.press("Control+z");
        await page.keyboard.press("Control+z");
        await expect(table.locator("tr")).toHaveCount(2);
      }
    },
  );

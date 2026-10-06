/** @fileoverview Chromium verifies native column menus, width conservation and original cell caret history. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(
    "native column insertion width=" + width,
    /** Uses actual menu slots and native editing caret. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Insert Table", exact: true }).click();
      await page.getByRole("button", { name: "2 columns, 2 rows", exact: true }).click();
      await page.keyboard.type("Original");
      const table = page.getByRole("table", { name: "Table1" }),
        before = await table.boundingBox();
      if (before === null) throw new Error("Missing native table geometry");
      for (const behind of [false, true]) {
        await page.getByRole("button", { name: "Table", exact: true }).click();
        await page.getByRole("menuitem", { name: "Insert", exact: true }).hover();
        await page
          .getByRole("menuitem", {
            name: behind ? "Insert Columns After" : "Insert Columns Before",
            exact: true,
          })
          .click();
        await expect(table.locator("col")).toHaveCount(3);
        const after = await table.boundingBox();
        if (after === null) throw new Error("Missing inserted table");
        expect(after.width).toBeCloseTo(before.width, 1);
        const original = page.getByLabel("Row 1 column " + (behind ? 1 : 2) + " paragraph 1", {
          exact: true,
        });
        await expect(original).toHaveText("Original");
        for (let cycle = 0; cycle < 2; cycle++) {
          await page.keyboard.press("Control+z");
          await expect(table.locator("col")).toHaveCount(2);
          await page.keyboard.press("Control+y");
          await expect(table.locator("col")).toHaveCount(3);
        }
        await page.keyboard.type("X");
        await expect(original).toHaveText("OriginalX");
        await page.keyboard.press("Control+z");
        await page.keyboard.press("Control+z");
        await expect(table.locator("col")).toHaveCount(2);
      }
    },
  );

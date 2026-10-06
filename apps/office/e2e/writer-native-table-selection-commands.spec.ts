/** @fileoverview Chromium checks native table selection menus and actual selected-cell editing/history. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(
    "native table selection menu width=" + width,
    /** Executes actual native menu slots and document editing. @param fixtures - Browser fixtures. @param fixtures.page - Page. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Insert Table", exact: true }).click();
      await page.getByRole("button", { name: "2 columns, 2 rows", exact: true }).click();
      await page.keyboard.type("Cell");
      const table = page.getByRole("table", { name: "Table1" });
      for (const [label, count] of [
        ["Select Cell", 1],
        ["Select Row", 2],
        ["Select Column", 2],
        ["Select Table", 4],
      ] as const) {
        await page.getByRole("button", { name: "Table", exact: true }).click();
        await page.getByRole("menuitem", { name: "Select", exact: true }).hover();
        await page.getByRole("menuitem", { name: label, exact: true }).click();
        await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(count);
        await page.keyboard.type("X");
        await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(0);
        await expect(
          page.getByLabel(
            label === "Select Table" ? "Row 2 column 2 paragraph 1" : "Row 1 column 1 paragraph 1",
            { exact: true },
          ),
        ).toHaveText("X");
        if (label === "Select Table")
          await expect(page.getByLabel("Row 1 column 1 paragraph 1", { exact: true })).toHaveText(
            "",
          );
        await page.keyboard.press("Control+z");
        await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(count);
        await expect(page.getByLabel("Row 1 column 1 paragraph 1", { exact: true })).toHaveText(
          "Cell",
        );
        await page.getByLabel("Row 1 column 1 paragraph 1", { exact: true }).click();
      }
    },
  );

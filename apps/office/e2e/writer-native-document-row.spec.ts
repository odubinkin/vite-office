/** @fileoverview Chromium exercises document-owned default row insertion from a styled final cell. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(`document-owned styled final-row Tab width=${width}`, /** Verifies actual caret, backward traversal and bounded native row history. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Insert Table", exact: true }).click();
    await page.getByRole("button", { name: "2 columns, 1 rows", exact: true }).click();
    await page.keyboard.press("Tab");
    await page.keyboard.type("original");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Tab");
    const table = page.getByRole("table", { name: "Table1" }),
      fresh = page.getByLabel("Row 2 column 1 paragraph 1", { exact: true }),
      last = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true });
    await expect(table.locator("tr")).toHaveCount(2);
    await expect(last).toHaveText("original");
    await expect(fresh).toHaveText("");
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.keyboard.press("Control+z");
      await expect(table.locator("tr")).toHaveCount(1);
      await expect(last).toHaveText("original");
      await page.keyboard.press("Control+y");
      await expect(table.locator("tr")).toHaveCount(2);
    }
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.type("X");
    await expect(last).toHaveText("Xoriginal");
  });

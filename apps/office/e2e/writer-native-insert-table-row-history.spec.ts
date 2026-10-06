/** @fileoverview Chromium insertion history composes recreated tables, appended rows and cell text. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(`native inserted table and appended row history width=${width}`, /** Verifies actual Tab and undo/redo after table graph reconstruction. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Insert Table", exact: true }).click();
    await page.getByRole("button", { name: "2 columns, 2 rows", exact: true }).click();
    for (let index = 0; index < 4; index++) await page.keyboard.press("Tab");
    const table = page.getByRole("table", { name: "Table1" }),
      cell = page.getByLabel("Row 3 column 1 paragraph 1", { exact: true });
    await expect(table.locator("tr")).toHaveCount(3);
    await page.keyboard.type("fresh");
    await expect(cell).toHaveText("fresh");
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.keyboard.press("Control+z");
      await page.keyboard.press("Control+z");
      await page.keyboard.press("Control+z");
      await expect(table).toHaveCount(0);
      await page.keyboard.press("Control+y");
      await page.keyboard.press("Control+y");
      await page.keyboard.press("Control+y");
      await expect(table.locator("tr")).toHaveCount(3);
      await expect(cell).toHaveText("fresh");
    }
  });

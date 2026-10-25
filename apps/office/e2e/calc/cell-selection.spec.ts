/** @fileoverview Actual Calc shared menu and native grid accelerator selection over canonical row/column marks. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390]) {
  test(`Calc row and column selection at ${width}px`, /** Checks visible range expansion,cursor retention,shared menu routing and real platform keys. @param fixtures - Browser fixtures. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records actual page failures. @param error - Browser exception. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    const grid = page.getByRole("grid");
    await grid.getByRole("gridcell", { name: "B2", exact: true }).click();
    await grid.getByRole("gridcell", { name: "C4", exact: true }).click({ modifiers: ["Shift"] });
    await page.getByRole("menubar").getByRole("menuitem", { name: "Edit", exact: true }).click();
    await page.getByRole("menuitem", { name: "Select", exact: true }).click();
    await page.getByRole("menuitem", { name: "Select Row", exact: true }).click();
    await expect(grid.getByRole("gridcell", { name: "A2", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(grid.getByRole("gridcell", { name: "A4", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(grid.getByRole("gridcell", { name: "A1", exact: true })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await expect(grid).toHaveAttribute("aria-activedescendant", /-0-1-1$/);
    await expect(grid).toBeFocused();
    await grid.getByRole("gridcell", { name: "B2", exact: true }).click();
    await page.getByRole("menubar").getByRole("menuitem", { name: "Edit", exact: true }).click();
    await page.getByRole("menuitem", { name: "Select", exact: true }).click();
    await page.getByRole("menuitem", { name: "Select Column", exact: true }).click();
    await expect(grid.getByRole("gridcell", { name: "B1", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(grid.getByRole("gridcell", { name: "A1", exact: true })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await expect(grid).toHaveAttribute("aria-activedescendant", /-0-1-1$/);
    await grid.getByRole("gridcell", { name: "B2", exact: true }).click();
    await page.keyboard.press("Shift+Space");
    await expect(grid.getByRole("gridcell", { name: "A2", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await grid.getByRole("gridcell", { name: "B2", exact: true }).click();
    const mac = await page.evaluate(
      /** Reads the real browser platform for the original accelerator variant. @returns Whether Mac. */ () =>
        /Mac/.test(navigator.platform),
    );
    await page.keyboard.press(mac ? "Alt+Space" : "Control+Space");
    await expect(grid.getByRole("gridcell", { name: "B1", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(grid.getByRole("gridcell", { name: "C1", exact: true })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await page.screenshot({ path: `output/playwright/task33-cell-selection-${width}.png` });
    expect(errors).toEqual([]);
  });
}

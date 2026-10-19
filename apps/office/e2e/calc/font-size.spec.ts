/** @fileoverview Actual shared Writer font-size selector over Calc selection,painting and shared undo at desktop/mobile widths. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390]) {
  test(`Calc font-size selection and undo at ${width}px`, /** Exercises only actual visible controls and platform input. @param fixtures - Browser fixture. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records actual application exceptions. @param error - Error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    const grid = page.getByRole("grid"),
      size = page.getByRole("combobox", { name: "Font Size", exact: true }),
      a1 = grid.getByRole("gridcell", { name: "A1", exact: true }),
      b2 = grid.getByRole("gridcell", { name: "B2", exact: true });
    await expect(size).toBeEnabled();
    await expect(size).toHaveValue("10");
    await page.getByRole("textbox", { name: "Input line", exact: true }).fill("Font sample");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await size.selectOption("18");
    await expect(a1).toHaveCSS("font-size", "24px");
    await expect(a1).toHaveText("Font sample");
    await b2.click({ modifiers: ["Shift"] });
    await expect(size).toHaveValue("");
    await size.selectOption("24");
    await expect(a1).toHaveCSS("font-size", "32px");
    await expect(b2).toHaveCSS("font-size", "32px");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(a1).toHaveCSS("font-size", "24px");
    await expect(size).toHaveValue("");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(size).toHaveValue("24");
    await expect(b2).toHaveCSS("font-size", "32px");
    await page.screenshot({ path: `output/playwright/task34-font-size-${width}.png` });
    expect(errors).toEqual([]);
  });
}

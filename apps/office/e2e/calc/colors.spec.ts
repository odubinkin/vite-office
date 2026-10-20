/** @fileoverview Actual shared Writer color palettes, native recent defaults, cell painting and Calc history in Chromium. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390]) {
  test(`Calc shared font/background colors at ${width}px`, /** Uses visible widgets and real native document history. @param fixtures - Browser fixture. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records real application exceptions. @param error - Browser error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    const a1 = page.getByRole("gridcell", { name: "A1", exact: true }),
      b2 = page.getByRole("gridcell", { name: "B2", exact: true });
    await page.getByRole("textbox", { name: "Input line", exact: true }).fill("Color sample");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await page.getByRole("button", { name: "Font Color", exact: true }).click();
    await expect(a1).toHaveCSS("color", "rgb(201, 33, 30)");
    await page.getByLabel("Font Color palette", { exact: true }).click();
    await page.getByRole("button", { name: "Font Color #ff0000", exact: true }).click();
    await expect(a1).toHaveCSS("color", "rgb(255, 0, 0)");
    await page.getByRole("button", { name: "Background Color", exact: true }).click();
    await expect(a1).toHaveCSS("background-color", "rgb(255, 255, 0)");
    await page.getByLabel("Background Color palette", { exact: true }).click();
    await page.getByRole("button", { name: "Background Color #00a933", exact: true }).click();
    await expect(a1).toHaveCSS("background-color", "rgb(0, 169, 51)");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(a1).toHaveCSS("background-color", "rgb(255, 255, 0)");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(a1).toHaveCSS("background-color", "rgb(0, 169, 51)");
    await b2.click({ modifiers: ["Shift"] });
    await page.getByRole("button", { name: "Font Color", exact: true }).click();
    await expect(b2).toHaveCSS("color", "rgb(255, 0, 0)");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(b2).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(a1).toHaveCSS("color", "rgb(255, 0, 0)");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(b2).toHaveCSS("color", "rgb(255, 0, 0)");
    await page.getByLabel("Background Color palette", { exact: true }).click();
    await page.getByRole("button", { name: "None", exact: true }).click();
    await expect(a1).toHaveCSS("background-color", "oklch(0.962 0.018 272.314)");
    await page.getByLabel("Font Color palette", { exact: true }).click();
    await page.getByRole("button", { name: "Automatic", exact: true }).click();
    await expect(a1).toHaveCSS("color", "rgb(0, 0, 0)");
    await page.getByLabel("Background Color palette", { exact: true }).click();
    await page.getByRole("button", { name: "Background Color #000000", exact: true }).click();
    await expect(a1).toHaveCSS("color", "rgb(255, 255, 255)");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(a1).toHaveCSS("color", "rgb(0, 0, 0)");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(a1).toHaveCSS("color", "rgb(255, 0, 0)");
    await page.getByLabel("Background Color palette", { exact: true }).click();
    await page.getByRole("button", { name: "Background Color #ffff00", exact: true }).click();
    await page.screenshot({ path: test.info().outputPath(`calc-colors-${width}.png`) });
    expect(
      await page.evaluate(
        /** Reads real viewport overflow. @returns Actual document width. */ () =>
          document.documentElement.scrollWidth,
      ),
    ).toBeLessThanOrEqual(width);
    expect(errors).toEqual([]);
  });
}

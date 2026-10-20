/** @fileoverview Actual shared Calc alignment controls,explicit menu semantics and plain-cell geometry in Chromium. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390]) {
  test(`Calc native alignment at ${width}px`, /** Formats real cells exclusively through shared visible widgets. @param fixtures - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records application failures. @param error - Browser exception. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    const input = page.getByRole("textbox", { name: "Input line", exact: true }),
      a1 = page.getByRole("gridcell", { name: "A1", exact: true }),
      b1 = page.getByRole("gridcell", { name: "B1", exact: true });
    await input.fill("17");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await b1.click();
    await input.fill("Tall");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await page.getByRole("combobox", { name: "Font Size", exact: true }).selectOption("36");
    await a1.click();
    await expect(a1).toHaveCSS("text-align", "right");
    const left = page.getByRole("button", { name: "Align Left", exact: true });
    await left.click();
    await expect(left).toHaveAttribute("aria-pressed", "true");
    await expect(a1).toHaveCSS("text-align", "left");
    await left.click();
    await expect(left).toHaveAttribute("aria-pressed", "false");
    await expect(a1).toHaveCSS("text-align", "right");
    await page.getByRole("button", { name: "Align Center", exact: true }).click();
    await expect(a1).toHaveCSS("text-align", "center");
    await page.getByRole("button", { name: "Align Top", exact: true }).click();
    const top = await a1.locator(":scope > div").boundingBox();
    await page.getByRole("button", { name: "Center Vertically", exact: true }).click();
    const middle = await a1.locator(":scope > div").boundingBox();
    await page.getByRole("button", { name: "Align Bottom", exact: true }).click();
    const bottom = await a1.locator(":scope > div").boundingBox();
    expect(top).not.toBeNull();
    expect(middle).not.toBeNull();
    expect(bottom).not.toBeNull();
    if (!top || !middle || !bottom) throw new Error("Missing actual cell text geometry");
    expect(middle.y).toBeGreaterThan(top.y + 5);
    expect(bottom.y).toBeGreaterThan(middle.y + 5);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(a1).toHaveCSS("justify-content", "center");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(a1).toHaveCSS("justify-content", "flex-end");
    for (let count = 0; count < 2; count++) {
      await page.getByRole("menuitem", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Align Text", exact: true }).click();
      await page.getByRole("menuitemcheckbox", { name: "Right", exact: true }).click();
      await expect(a1).toHaveCSS("text-align", "right");
      await expect(page.getByRole("button", { name: "Align Right", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }
    await a1.click();
    await page.keyboard.press("Control+l");
    await expect(a1).toHaveCSS("text-align", "left");
    await page.keyboard.press("Control+l");
    await expect(a1).toHaveCSS("text-align", "right");
    await page.screenshot({ path: test.info().outputPath(`calc-alignment-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

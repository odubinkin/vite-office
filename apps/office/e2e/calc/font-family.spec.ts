/** @fileoverview Shared Writer font selector, native mixed-script painting and Calc history in Chromium. */
import { pickComboBoxEntry } from "../shared/combo-box";
import { expect, test } from "@playwright/test";
for (const width of [1280, 390]) {
  test(`Calc shared font-family selection at ${width}px`, /** Exercises visible controls over the real document. @param fixtures - Browser fixture. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Collects application exceptions. @param error - Browser error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    const font = page.getByRole("combobox", { name: "Font Name", exact: true }),
      a1 = page.getByRole("gridcell", { name: "A1", exact: true }),
      b2 = page.getByRole("gridcell", { name: "B2", exact: true });
    await expect(font).toBeEnabled();
    const initial = await font.inputValue();
    expect(initial).not.toBe("");
    await page.getByRole("textbox", { name: "Input line", exact: true }).fill("Latin漢عربي😀");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    const originalSelection = await font.inputValue();
    await pickComboBoxEntry(font, "Liberation Mono");
    await expect(font).toHaveValue("Liberation Mono");
    await expect(page.getByRole("grid")).toBeFocused();
    await expect(a1).toHaveText("Latin漢عربي😀");
    const runs = a1.locator("span:not(:has(span))");
    await expect(runs).toHaveCount(3);
    for (const run of await runs.all())
      await expect(run).toHaveCSS("font-family", /Liberation Mono/);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(font).toHaveValue(originalSelection);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(font).toHaveValue("Liberation Mono");
    await b2.click({ modifiers: ["Shift"] });
    await expect(font).toHaveValue("");
    await font.fill("Arial");
    await font.press("Enter");
    await expect(font).toHaveValue("Arial");
    for (const run of await runs.all()) await expect(run).toHaveCSS("font-family", /Arial/);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(font).toHaveValue("");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(font).toHaveValue("Arial");
    await font.locator("..").locator("[data-office-combobox-toggle]").click();
    await expect(page.getByRole("listbox", { name: "Font Name", exact: true })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath(`calc-font-family-${width}.png`) });
    await font.press("Escape");
    await expect(page.getByRole("grid")).toBeFocused();
    expect(errors).toEqual([]);
  });
}

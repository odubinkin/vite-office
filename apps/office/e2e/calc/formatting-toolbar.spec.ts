/** @fileoverview Native cell formatting composition rendered by actual shared Writer controls at desktop/mobile sizes. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const labels = [
  "Font Name",
  "Font Size",
  "Bold",
  "Italic",
  "Underline",
  "Font Color",
  "Background Color",
  "Align Left",
  "Align Center",
  "Align Right",
  "Align Top",
  "Center Vertically",
  "Align Bottom",
  "Wrap Text",
  "Merge and Center Cells",
  "Merge Cells",
  "Unmerge Cells",
  "Currency",
  "Percent",
  "Number",
  "Date",
  "Add Decimal Place",
  "Delete Decimal Place",
  "Increase",
  "Decrease",
  "Borders (Shift to overwrite)",
  "Border Style",
  "Border Color",
  "Conditional",
  "Left-To-Right",
  "Right-To-Left",
  "Text direction from left to right",
  "Text direction from top to bottom",
];
for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 600 },
]) {
  test(`native cell formatting toolbar at ${viewport.width}x${viewport.height}`, /** Checks actual production state and shared Writer geometry/accessibility. @param root0 - Isolated fixture. @param root0.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records actual application failures. @param error - Browser error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    const bar = page.getByRole("toolbar", { name: "Calc formatting toolbar" });
    await expect(bar.getByRole("combobox")).toHaveCount(2);
    await expect(bar.getByRole("button")).toHaveCount(31);
    expect(
      await bar
        .locator("button,select")
        .evaluateAll(
          /** Reads actual resource order. @param nodes - Rendered controls. @returns Labels. */ (
            nodes,
          ) =>
            nodes
              .filter(
                /** Keeps actual toolbar placements outside palette dropdowns. @param node - Rendered node. @returns Whether a toolbar placement. */ (
                  node,
                ) => !node.closest("[data-office-palette]"),
              )
              .map(
                /** Reads native command label. @param node - Control. @returns Label. */ (node) =>
                  node.getAttribute("aria-label"),
              ),
        ),
    ).toEqual(labels);
    await expect(bar.getByRole("combobox", { name: "Font Name", exact: true })).toBeEnabled();
    await expect(bar.getByRole("combobox", { name: "Font Name", exact: true })).not.toHaveValue("");
    await expect(bar.getByRole("combobox", { name: "Font Size", exact: true })).toBeEnabled();
    await expect(bar.getByRole("combobox", { name: "Font Size", exact: true })).toHaveValue("10");
    for (let index = 0; index < 31; index++) {
      const button = bar.getByRole("button").nth(index);
      if (index < 11) await expect(button).toBeEnabled();
      else await expect(button).toBeDisabled();
      if (index < 3) await expect(button).toHaveText(["B", "I", "U"][index] as string);
      else if (index === 3 || index === 4) await expect(button).toHaveText(index === 3 ? "A" : "▨");
      else await expect(button.locator("svg")).toHaveCount(1);
      expect((await button.boundingBox())?.width).toBe(32);
    }
    expect(
      await page.evaluate(
        /** Reads actual viewport overflow. @returns Document width. */ () =>
          document.documentElement.scrollWidth,
      ),
    ).toBeLessThanOrEqual(viewport.width);
    expect((await page.getByRole("grid").boundingBox())?.height).toBeGreaterThan(40);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({
      path: test.info().outputPath(`calc-formatting-${viewport.width}.png`),
    });
    await page.getByRole("textbox", { name: "Input line", exact: true }).fill("9");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await expect(page.getByRole("gridcell", { name: "A1", exact: true })).toHaveText("9");
    await bar.getByRole("button", { name: "Bold", exact: true }).click();
    const cell = page.getByRole("gridcell", { name: "A1", exact: true });
    await expect(cell).toHaveCSS("font-weight", "700");
    await expect(bar.getByRole("button", { name: "Bold", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("grid").focus();
    await page.keyboard.press("Control+i");
    await expect(cell).toHaveCSS("font-style", "italic");
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    await page.getByRole("menuitemcheckbox", { name: "Double Underline", exact: true }).click();
    await expect(cell).toHaveCSS("text-decoration-style", "double");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(cell).toHaveCSS("text-decoration-line", "none");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(cell).toHaveCSS("text-decoration-style", "double");
    await expect(bar.getByRole("button", { name: "Underline", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.screenshot({
      animations: "disabled",
      path: test.info().outputPath(`calc-character-formatting-${viewport.width}.png`),
    });
    expect(errors).toEqual([]);
  });
}

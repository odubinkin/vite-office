/** @fileoverview Native Calc standardbar composition,shared Writer icon geometry and real bindings in the built browser. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const labels = [
  "Open",
  "Export Directly as PDF",
  "Print",
  "Print Preview",
  "Cut",
  "Copy",
  "Paste",
  "Clone Formatting",
  "Clear",
  "Undo",
  "Redo",
  "Find and Replace",
  "Spelling",
  "Row",
  "Column",
  "Sort",
  "Sort Ascending",
  "Sort Descending",
  "AutoFilter",
  "Image",
  "Chart",
  "Pivot Table",
  "Symbol",
  "Hyperlink",
  "Comment",
  "Headers and Footers",
  "Print Area",
  "Freeze Panes",
  "Split Window",
  "Draw Functions",
];
for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 600 },
]) {
  test(`complete source standard toolbar at ${viewport.width}x${viewport.height}`, /** Exercises real production controls and full axe rules. @param root0 - Fixture. @param root0.page - Browser page. @returns Completion. */ async ({
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
    const toolbar = page.getByRole("toolbar", { name: "Calc standard toolbar" });
    const buttons = toolbar.getByRole("button");
    await expect(buttons).toHaveCount(30);
    expect(
      await buttons.evaluateAll(
        /** Reads actual visible resources and geometry. @param nodes - Toolbar controls. @returns Labels. */ (
          nodes,
        ) =>
          nodes.map(
            /** Reads source label. @param node - Button. @returns Label. */ (node) =>
              node.getAttribute("aria-label"),
          ),
      ),
    ).toEqual(labels);
    for (let index = 0; index < labels.length; index++) {
      const button = buttons.nth(index);
      await expect(button.locator("svg")).toHaveCount(1);
      if (index === 0 || labels[index] === "Clear") await expect(button).toBeEnabled();
      else await expect(button).toBeDisabled();
    }
    const geometry = await toolbar.evaluate(
      /** Reads actual layout without overriding browser measurements. @param node - Toolbar. @returns Width evidence. */ (
        node,
      ) => ({
        width: node.clientWidth,
        content: node.scrollWidth,
        body: document.documentElement.scrollWidth,
        buttons: [...node.querySelectorAll("button")].map(
          /** Measures fixed shared button width. @param button - Control. @returns Width. */ (
            button,
          ) => button.getBoundingClientRect().width,
        ),
      }),
    );
    expect(geometry.width).toBeLessThanOrEqual(viewport.width);
    expect(geometry.body).toBeLessThanOrEqual(viewport.width);
    for (const width of geometry.buttons) expect(width).toBe(36);
    if (viewport.width === 390) expect(geometry.content).toBeGreaterThan(geometry.width);
    await page.getByRole("textbox", { name: "Input line", exact: true }).fill("7");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await expect(page.getByRole("gridcell", { name: "A1", exact: true })).toHaveText("7");
    await toolbar.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(page.getByRole("gridcell", { name: "A1", exact: true })).toHaveText("");
    await toolbar.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(page.getByRole("gridcell", { name: "A1", exact: true })).toHaveText("7");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

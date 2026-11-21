/** @fileoverview Connected Calc standard toolbar commands, compact icon geometry and real bindings. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const labels = [
  "Open",
  "Clear",
  "Undo",
  "Redo",
  "Headers and Footers",
  "Print Area",
  "Freeze Panes",
  "Split Window",
];
for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 600 },
]) {
  test(`connected standard toolbar at ${viewport.width}x${viewport.height}`, /** Exercises real production controls and full axe rules. @param root0 - Fixture. @param root0.page - Browser page. @returns Completion. */ async ({
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
    await expect(buttons).toHaveCount(labels.length);
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
      if (labels[index] === "Undo" || labels[index] === "Redo") await expect(button).toBeDisabled();
      else await expect(button).toBeEnabled();
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
    for (const width of geometry.buttons) expect(width).toBe(28);
    expect(geometry.content).toBe(geometry.width);
    await toolbar.getByRole("button", { name: "Headers and Footers" }).click();
    const editor = page.getByRole("dialog", { name: /^Headers\/Footers/ });
    const left = editor.getByRole("textbox", { name: "Left area" });
    await left.pressSequentially("Page ");
    await editor.getByRole("button", { name: "Page Number", exact: true }).click();
    await expect(left).toHaveText("Page 1");
    await left.press("ControlOrMeta+a");
    await editor.getByRole("button", { name: "Bold", exact: true }).click();
    await expect(left.locator("span").first()).toHaveCSS("font-weight", "700");
    await editor.getByRole("button", { name: "Text Attributes", exact: true }).click();
    const attributes = page.getByRole("dialog", { name: "Text Attributes" });
    await attributes.getByRole("tab", { name: "Position" }).click();
    await attributes.getByRole("combobox", { name: "Position", exact: true }).selectOption("1");
    await attributes.getByRole("button", { name: "OK", exact: true }).click();
    await expect(left.locator("span").first()).toHaveCSS("vertical-align", "super");
    await editor.getByRole("button", { name: "Cancel", exact: true }).click();
    const menu = page.getByRole("menubar", { name: "Calc menu" });
    await expect(menu.getByRole("menuitem", { name: "Help", exact: true })).toHaveCount(0);
    await menu.getByRole("menuitem", { name: "File", exact: true }).click();
    const file = page.getByRole("menu", { name: "File menu", exact: true });
    await expect(file.getByRole("menuitem", { name: "Export…", exact: true })).toBeEnabled();
    await expect(file.getByRole("menuitem", { name: "Print…", exact: true })).toHaveCount(0);
    await file.press("Escape");
    await page.getByRole("textbox", { name: "Input line", exact: true }).fill("7");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await expect(page.getByRole("gridcell", { name: /^A1(?:\s|$)/ })).toHaveText("7");
    await toolbar.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(page.getByRole("gridcell", { name: /^A1(?:\s|$)/ })).toHaveText("");
    await toolbar.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(page.getByRole("gridcell", { name: /^A1(?:\s|$)/ })).toHaveText("7");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

/**
 * @fileoverview Exercises the built foundation workbench in Chromium and checks its accessibility tree with axe.
 */

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("loads the Writer structural workspace and supports keyboard-visible suite selection" /**
 * Verifies the production bundle, targetable Writer chrome, accessible editing, keyboard suite selection, and configured axe rules.
 *
 * @param root0 - Playwright fixture object provided for the isolated test.
 * @param root0.page - Isolated Chromium page used for navigation and accessibility assertions.
 * @returns A promise that resolves after all browser and accessibility assertions pass.
 */, async function verifyStaticFoundation({ page }): Promise<void> {
  await page.goto("/");

  await expect(page.getByRole("region", { name: "Writer workspace" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Writer menu bar" })).toBeVisible();
  await expect(page.getByRole("toolbar", { name: "Writer standard toolbar" })).toBeVisible();
  await expect(
    page
      .getByRole("toolbar", { name: "Writer standard toolbar" })
      .getByRole("button", { name: "Download text" }),
  ).toHaveCount(0);
  await expect(page.getByRole("toolbar", { name: "Writer formatting toolbar" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Writer document canvas" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Writer document body" })).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Writer properties sidebar" }),
  ).toBeVisible();
  await expect(page.getByRole("status", { name: "Writer status bar" })).toBeVisible();
  const writerEditor = page.getByRole("textbox", { name: "Writer document text" });
  await expect(writerEditor).toBeVisible();
  await expect(writerEditor).toHaveAttribute("contenteditable", "true");
  await writerEditor.fill("A browser-authored paragraph.");
  await expect(page.getByRole("button", { name: "Undo" })).toBeEnabled();
  await page.getByRole("button", { name: "Styles" }).click();
  await page.getByRole("menuitem", { name: "Heading 1" }).click();
  await expect(writerEditor).toHaveCSS("font-size", "24px");
  await expect(writerEditor).toHaveCSS("font-weight", "700");
  await expect(
    page.getByRole("complementary", { name: "Writer properties sidebar" }),
  ).toContainText("Heading 1");
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Align center" }).click();
  await expect(writerEditor).toHaveCSS("text-align", "center");
  await expect(page.getByRole("button", { name: "Align center" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText("Centered")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add paragraph" })).toHaveCount(0);
  await writerEditor.evaluate(
    /**
     * Places the Chromium selection at the end of the controlled contenteditable paragraph before testing Enter.
     *
     * @param element - Browser-rendered Writer paragraph whose contents own the desired collapsed caret.
     * @returns Nothing; the document selection receives the collapsed end-of-paragraph range.
     */
    function placeCaretAtParagraphEnd(element: HTMLElement): void {
      const selection = window.getSelection();
      if (selection === null)
        throw new Error("Browser selection must be available for Writer E2E coverage.");
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );
  await writerEditor.press("Enter");
  const trailingWriterParagraph = page.getByRole("textbox", { name: "Writer paragraph 2" });
  await expect(trailingWriterParagraph).toBeVisible();
  await expect(trailingWriterParagraph).toHaveText("");
  await expect(trailingWriterParagraph).toBeFocused();
  await expect(trailingWriterParagraph).toHaveCSS("font-size", "24px");
  await expect(trailingWriterParagraph).toHaveCSS("text-align", "center");
  await trailingWriterParagraph.press("Backspace");
  await expect(trailingWriterParagraph).toHaveCount(0);
  await expect(writerEditor).toHaveText("A browser-authored paragraph.");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("menuitem", { name: "Undo" }).click();
  await expect(trailingWriterParagraph).toBeVisible();
  await writerEditor.evaluate(
    /**
     * Restores the leading paragraph's end caret before checking Delete removes its following paragraph break.
     *
     * @param element - Browser-rendered leading Writer paragraph that owns the collapsed caret.
     * @returns Nothing; the document selection receives the collapsed end-of-paragraph range.
     */
    function placeCaretAtLeadingParagraphEnd(element: HTMLElement): void {
      const selection = window.getSelection();
      if (selection === null)
        throw new Error("Browser selection must be available for Writer E2E coverage.");
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );
  await writerEditor.press("Delete");
  await expect(trailingWriterParagraph).toHaveCount(0);
  await expect(writerEditor).toHaveText("A browser-authored paragraph.");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("menuitem", { name: "Undo" }).click();
  await expect(trailingWriterParagraph).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("menuitem", { name: "Undo" }).click();
  await expect(trailingWriterParagraph).toHaveCount(0);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("menuitem", { name: "Undo" }).click();
  await expect(writerEditor).toHaveCSS("text-align", "left");

  const calcButton = page.getByRole("button", { name: "Calc, Foundation only" });
  await calcButton.focus();
  await expect(calcButton).toBeFocused();
  await calcButton.press("Enter");
  await expect(page.getByRole("heading", { name: "Browser workbench foundation" })).toBeVisible();
  await expect(page.getByText("Calc: Foundation only")).toBeVisible();
  await expect(writerEditor).toBeHidden();
  await expect(page.getByText("No editor features enabled")).toBeVisible();

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityResults.violations).toEqual([]);
});

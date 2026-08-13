/** @fileoverview Exercises pinned Writer bullets and numbering commands in the production Chromium bundle. */

import { expect, test } from "@playwright/test";

test("Writer bullets and numbering" /** Verifies Format submenu and text-object toolbar list controls retain editable text while rendering Writer markers. @param root0 - Playwright fixture object. @param root0.page - Chromium page exercising the built browser application. @returns A promise resolved after list commands, inheritance, and removal are asserted. */, async function verifiesWriterLists({
  page,
}): Promise<void> {
  await page.goto("/");
  const firstParagraph = page.getByRole("textbox", { name: "Writer document text" });
  await firstParagraph.fill("First list item");
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Bullets and Numbering" }).click();
  await page.getByRole("menuitem", { exact: true, name: "Ordered List" }).click();
  const firstMarker = page.getByTestId("writer-list-marker-writer-paragraph-1");
  await expect(firstMarker).toHaveText("1.");
  await expect(firstParagraph).toHaveText("First list item");
  await expect(firstParagraph).toHaveAttribute("data-list-kind", "numbered");
  await firstParagraph.evaluate(
    /** Places a collapsed selection at the editable paragraph end before Writer Enter handling. @param element - Browser paragraph that owns the caret. @returns Nothing; the browser selection is updated. */
    function placeCaretAtEnd(element: HTMLElement): void {
      const selection = window.getSelection();
      if (selection === null)
        throw new Error("Writer list E2E requires browser selection support.");
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );
  await firstParagraph.press("Enter");
  const secondParagraph = page.getByRole("textbox", { name: "Writer paragraph 2" });
  await expect(secondParagraph).toBeFocused();
  await secondParagraph.fill("Second list item");
  await expect(page.getByTestId("writer-list-marker-writer-paragraph-2")).toHaveText("2.");
  await page
    .getByRole("toolbar", { name: "Writer formatting toolbar" })
    .getByRole("button", { name: "Unordered List" })
    .click();
  await expect(page.getByTestId("writer-list-marker-writer-paragraph-2")).toHaveText("•");
  await expect(secondParagraph).toHaveText("Second list item");
  await expect(secondParagraph).toHaveAccessibleDescription(/Paragraph list: Unordered List/);
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Bullets and Numbering" }).click();
  await page.getByRole("menuitem", { name: "Remove Bullets" }).click();
  await expect(page.getByTestId("writer-list-marker-writer-paragraph-2")).toHaveCount(0);
  await expect(secondParagraph).toHaveText("Second list item");
});

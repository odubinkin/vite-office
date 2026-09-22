/** @fileoverview Exercises pinned Writer bullets and numbering commands in the production Chromium bundle. */

import { expect, test } from "@playwright/test";

test("Writer bullets and numbering" /** Verifies Format submenu and persistent formatting/list toolbar controls retain editable text while rendering Writer markers. @param root0 - Playwright fixture object. @param root0.page - Chromium page exercising the built browser application. @returns A promise resolved after list commands, inheritance, and removal are asserted. */, async function verifiesWriterLists({
  page,
}): Promise<void> {
  await page.goto("/writer");
  const firstParagraph = page.getByRole("textbox", { name: "Writer document text" });
  await firstParagraph.fill("First list item");
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Lists" }).click();
  await page.getByRole("menuitemradio", { exact: true, name: "Ordered List" }).click();
  const firstProjectionId = await firstParagraph.getAttribute("data-writer-paragraph-id");
  const firstMarker = page.locator(`[data-writer-list-marker="${firstProjectionId}"]`);
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
  const secondProjectionId = await secondParagraph.getAttribute("data-writer-paragraph-id");
  await secondParagraph.fill("Second list item");
  const secondMarker = page.locator(`[data-writer-list-marker="${secondProjectionId}"]`);
  await expect(secondMarker).toHaveText("2.");
  const formattingToolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" });
  await expect(formattingToolbar.getByRole("button", { name: "Bold" })).toBeVisible();
  await expect(
    formattingToolbar.getByRole("button", { exact: true, name: "Decrease" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Lists" }).click();
  await page.getByRole("menuitemradio", { exact: true, name: "Unordered List" }).click();
  await expect(secondMarker).toHaveText("•");
  await expect(secondParagraph).toHaveText("Second list item");
  await expect(secondParagraph).toHaveAccessibleDescription(/Paragraph list: Unordered List/);
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Lists" }).click();
  await page.getByRole("menuitem", { name: "Demote Outline Level" }).click();
  await expect(secondParagraph).toHaveAttribute("data-list-level", "1");
  expect(
    await secondParagraph.evaluate(
      /** Reads document indentation applied to the list wrapper rather than editable paragraph text. @param element - Nested Writer list paragraph. @returns Rendered inline start margin. */
      function readListIndent(element: HTMLElement): string {
        return (element.parentElement as HTMLElement).style.marginInlineStart;
      },
    ),
  ).toBe("36pt");
  await page
    .getByRole("toolbar", { name: "Writer formatting toolbar" })
    .getByRole("button", { exact: true, name: "Decrease" })
    .click();
  await expect(secondParagraph).toHaveAttribute("data-list-level", "0");
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Lists" }).click();
  await page.getByRole("menuitemradio", { name: "No List" }).click();
  await expect(secondMarker).toHaveCount(0);
  await expect(secondParagraph).toHaveText("Second list item");
});

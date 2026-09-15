/** @fileoverview Verifies production Writer keyboard and pointer selections span the bounded document without disrupting normal paragraph editing. */

import { expect, test } from "@playwright/test";

test("supports document-wide selection through Ctrl/Cmd+A and pointer dragging" /** Verifies real Chromium keeps Enter editing intact while keyboard and pointer selection cover more than one Writer paragraph. @param root0 - Playwright fixture object for the isolated browser flow. @param root0.page - Chromium page used to edit, select, and inspect Writer text. @returns A promise resolved after browser-native document selection behavior is asserted. */, async function verifiesDocumentWideSelection({
  page,
}): Promise<void> {
  await page.goto("/writer");
  const firstParagraph = page.getByRole("textbox", { name: "Writer document text" });
  await firstParagraph.fill("First Writer paragraph");
  await firstParagraph.press("Enter");
  const secondParagraph = page.getByRole("textbox", { name: "Writer paragraph 2" });
  const firstProjectionId = await firstParagraph.getAttribute("data-writer-paragraph-id");
  const secondProjectionId = await secondParagraph.getAttribute("data-writer-paragraph-id");
  await secondParagraph.fill("Second Writer paragraph");
  await secondParagraph.click();
  await page.keyboard.press("Home");
  await page.keyboard.down("Shift");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.up("Shift");
  const shiftSelection = await secondParagraph.evaluate(
    /** Reads paragraph ownership for a native Shift+Arrow range crossing the paragraph break. @returns Stable Writer paragraph IDs at the browser endpoints. */
    function readShiftSelection(): Readonly<{
      anchor: string | undefined;
      focus: string | undefined;
    }> {
      const selection = window.getSelection();
      const paragraphId =
        /** Resolves the Writer paragraph owning a native endpoint. @param node - Selection endpoint node. @returns Stable paragraph ID, if projected. */ (
          node: Node | null,
        ): string | undefined =>
          (node instanceof Element ? node : node?.parentElement)?.closest<HTMLElement>(
            "[data-writer-paragraph-id]",
          )?.dataset.writerParagraphId;
      return {
        anchor: paragraphId(selection?.anchorNode ?? null),
        focus: paragraphId(selection?.focusNode ?? null),
      };
    },
  );
  expect(shiftSelection.anchor).toBe(secondProjectionId);
  expect(shiftSelection.focus).toBe(firstProjectionId);
  await secondParagraph.press("Control+A");
  const selectAllSelection = await secondParagraph.evaluate(
    /**
     * Reads the browser selection after the Writer-owned Select All shortcut.
     *
     * @returns Visible browser selection text or an empty string when no selection exists.
     */
    function readWriterDocumentSelection(): string {
      return window.getSelection()?.toString() ?? "";
    },
  );
  expect(selectAllSelection).toContain("First Writer paragraph");
  expect(selectAllSelection).toContain("Second Writer paragraph");
  const firstPoint = await firstParagraph.evaluate(
    /**
     * Resolves a real rendered character position for the forward pointer anchor.
     * @param paragraph - First rendered Writer paragraph.
     * @returns Viewport point at UTF-16 offset five.
     */
    function resolveFirstPointerPoint(paragraph): Readonly<{ x: number; y: number }> {
      const range = document.createRange();
      range.setStart(paragraph.firstChild as Text, 5);
      range.setEnd(paragraph.firstChild as Text, 6);
      const rectangle = range.getBoundingClientRect();
      return { x: rectangle.x, y: rectangle.y + rectangle.height / 2 };
    },
  );
  const secondPoint = await secondParagraph.evaluate(
    /**
     * Resolves a real rendered character position for the forward pointer focus.
     * @param paragraph - Second rendered Writer paragraph.
     * @returns Viewport point at UTF-16 offset six.
     */
    function resolveSecondPointerPoint(paragraph): Readonly<{ x: number; y: number }> {
      const range = document.createRange();
      range.setStart(paragraph.firstChild as Text, 6);
      range.setEnd(paragraph.firstChild as Text, 7);
      const rectangle = range.getBoundingClientRect();
      return { x: rectangle.x, y: rectangle.y + rectangle.height / 2 };
    },
  );
  await page.mouse.move(firstPoint.x, firstPoint.y);
  await page.mouse.down();
  await page.mouse.move(secondPoint.x, secondPoint.y, { steps: 8 });
  await page.mouse.up();
  const pointerSelection = await secondParagraph.evaluate(
    /**
     * Reads the browser selection created by a pointer drag from the first Writer paragraph into the second.
     *
     * @returns Visible browser selection text or an empty string when no selection exists.
     */
    function readPointerWriterSelection(): Readonly<{ anchorOffset: number; focusOffset: number }> {
      const selection = window.getSelection();
      return {
        anchorOffset: selection?.anchorOffset ?? -1,
        focusOffset: selection?.focusOffset ?? -1,
      };
    },
  );
  expect(pointerSelection).toEqual({ anchorOffset: 5, focusOffset: 6 });
  await page.mouse.move(secondPoint.x, secondPoint.y);
  await page.mouse.down();
  await page.mouse.move(firstPoint.x, firstPoint.y, { steps: 8 });
  await page.mouse.up();
  const reversePointerSelection = await secondParagraph.evaluate(
    /**
     * Reads the browser selection created by a reverse pointer drag from the second Writer paragraph into the first.
     *
     * @returns Visible browser selection text or an empty string when no selection exists.
     */
    function readReversePointerWriterSelection(): Readonly<{
      anchorOffset: number;
      focusOffset: number;
    }> {
      const selection = window.getSelection();
      return {
        anchorOffset: selection?.anchorOffset ?? -1,
        focusOffset: selection?.focusOffset ?? -1,
      };
    },
  );
  expect(reversePointerSelection).toEqual({ anchorOffset: 6, focusOffset: 5 });
});

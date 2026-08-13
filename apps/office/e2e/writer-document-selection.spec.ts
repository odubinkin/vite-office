/** @fileoverview Verifies production Writer keyboard and pointer selections span the bounded document without disrupting normal paragraph editing. */

import { expect, test } from "@playwright/test";

test("supports document-wide selection through Ctrl/Cmd+A and pointer dragging" /** Verifies real Chromium keeps Enter editing intact while keyboard and pointer selection cover more than one Writer paragraph. @param root0 - Playwright fixture object for the isolated browser flow. @param root0.page - Chromium page used to edit, select, and inspect Writer text. @returns A promise resolved after browser-native document selection behavior is asserted. */, async function verifiesDocumentWideSelection({
  page,
}): Promise<void> {
  await page.goto("/");
  const firstParagraph = page.getByRole("textbox", { name: "Writer document text" });
  await firstParagraph.fill("First Writer paragraph");
  await firstParagraph.press("Enter");
  const secondParagraph = page.getByRole("textbox", { name: "Writer paragraph 2" });
  await expect(secondParagraph).toBeFocused();
  await secondParagraph.fill("Second Writer paragraph");
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
  const firstBox = await firstParagraph.boundingBox();
  const secondBox = await secondParagraph.boundingBox();
  if (firstBox === null || secondBox === null)
    throw new Error("Writer paragraphs must have measurable boxes for pointer selection coverage.");
  await page.evaluate(
    /**
     * Makes pointer geometry deterministic so the browser-facing selection bridge can be checked at partial text offsets.
     *
     * @param coordinates - Vertical paragraph bounds used to select the deterministic text endpoint.
     * @returns Nothing; the page-local caret resolver is replaced for this isolated test page.
     */
    function installDeterministicCaretRanges(
      coordinates: Readonly<{ secondParagraphY: number }>,
    ): void {
      document.caretRangeFromPoint =
        /** Resolves a repeatable Writer paragraph endpoint from the drag row. @param _x - Ignored horizontal coordinate. @param y - Viewport vertical coordinate that determines the test paragraph. @returns Collapsed range at the asserted partial offset. */
        function resolveWriterTestCaret(_x, y): Range {
          const paragraph = document.querySelectorAll<HTMLParagraphElement>(
            "[data-writer-paragraph-id]",
          )[y < coordinates.secondParagraphY ? 0 : 1] as HTMLParagraphElement;
          const range = document.createRange();
          range.setStart(paragraph.firstChild as Text, y < coordinates.secondParagraphY ? 5 : 6);
          range.collapse(true);
          return range;
        };
    },
    { secondParagraphY: secondBox.y },
  );
  await page.mouse.move(firstBox.x + 8, firstBox.y + firstBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    secondBox.x + Math.min(96, secondBox.width - 2),
    secondBox.y + secondBox.height / 2,
    {
      steps: 8,
    },
  );
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
  await page.mouse.move(secondBox.x + 8, secondBox.y + secondBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    firstBox.x + Math.min(96, firstBox.width - 2),
    firstBox.y + firstBox.height / 2,
    {
      steps: 8,
    },
  );
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

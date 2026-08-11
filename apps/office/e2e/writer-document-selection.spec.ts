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
    function readPointerWriterSelection(): string {
      return window.getSelection()?.toString() ?? "";
    },
  );
  expect(pointerSelection).toContain("First Writer");
  expect(pointerSelection).toContain("Second Writer");
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
    function readReversePointerWriterSelection(): string {
      return window.getSelection()?.toString() ?? "";
    },
  );
  expect(reversePointerSelection).toContain("First Writer");
  expect(reversePointerSelection).toContain("Second Writer");
});

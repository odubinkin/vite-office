/** @fileoverview Verifies production Writer direct character commands preserve semantic text runs through the pinned toolbar, menu, shortcut, history, and native Copy boundary. */

import { expect, test } from "@playwright/test";

test("Writer direct character formatting" /**
 * Verifies same-paragraph Bold, Italic, and Underline commands render semantic runs, survive Undo/Redo, and export portable Copy HTML.
 *
 * @param root0 - Playwright fixture object supplied for this isolated Chromium interaction.
 * @param root0.page - Chromium page hosting the built static Writer workbench.
 * @returns A promise resolved after browser-visible formatting and ClipboardEvent payloads are asserted.
 */, async function formatsWriterCharacters({ page }): Promise<void> {
  const pageErrors: string[] = [];
  page.on(
    "pageerror",
    /** Retains one uncaught browser error for the final crash assertion. @param error - Uncaught page error. @returns Nothing; pageErrors receives its message. */ function retainPageError(
      error,
    ): void {
      pageErrors.push(error.message);
    },
  );
  await page.goto("/writer");
  const writerEditor = page.getByRole("textbox", { name: "Writer document text" });
  await writerEditor.fill("Formatted Writer body");
  await writerEditor.evaluate(
    /** Selects all visible text in the editable Writer paragraph. @param element - Writer editing host that receives the native selection. @returns Nothing; browser selection is replaced. */
    function selectWriterText(element: HTMLElement): void {
      const selection = window.getSelection();
      if (selection === null)
        throw new Error("Writer character formatting requires browser selection support.");
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );
  await page.getByRole("button", { name: "Bold" }).click();
  await expect(writerEditor.locator("strong")).toHaveText("Formatted Writer body");
  await writerEditor.evaluate(
    /** Restores a complete selection after React renders direct-format run elements. @param element - Writer editing host that owns the runs. @returns Nothing; browser selection is replaced. */
    function reselectWriterText(element: HTMLElement): void {
      const selection = window.getSelection();
      if (selection === null)
        throw new Error("Writer character formatting requires browser selection support.");
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Text" }).click();
  await page.getByRole("menuitem", { name: "Italic" }).click();
  await expect(writerEditor.locator("strong em")).toHaveText("Formatted Writer body");
  await writerEditor.evaluate(
    /** Restores native selection before the Ctrl/Cmd shortcut. @param element - Writer editing host that owns the semantic runs. @returns Nothing; browser selection is replaced. */
    function selectForUnderline(element: HTMLElement): void {
      const selection = window.getSelection();
      if (selection === null)
        throw new Error("Writer character formatting requires browser selection support.");
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );
  await page.keyboard.press("Control+u");
  await expect(writerEditor.locator("strong em span")).toHaveCSS(
    "text-decoration-line",
    "underline",
  );
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(writerEditor.locator("strong em span")).toHaveCount(0);
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(writerEditor.locator("strong em span")).toHaveCount(1);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("menuitem", { name: "Select All" }).click();
  const clipboardPayload = await writerEditor.evaluate(
    /** Dispatches a native-shaped Copy event and reads the Writer-provided rich MIME value. @param element - Writer paragraph beneath the document-body Copy listener. @returns Sanitized browser Copy representations. */
    function readFormattedWriterCopy(
      element: HTMLElement,
    ): Readonly<{ html: string; plainText: string }> {
      const clipboardData = new DataTransfer();
      element
        .closest("article")
        ?.dispatchEvent(
          new ClipboardEvent("copy", { bubbles: true, cancelable: true, clipboardData }),
        );
      return {
        html: clipboardData.getData("text/html"),
        plainText: clipboardData.getData("text/plain"),
      };
    },
  );
  expect(clipboardPayload.plainText).toBe("Formatted Writer body");
  expect(clipboardPayload.html).toContain('<strong><em><span style="text-decoration: underline">');
  expect(clipboardPayload.html).not.toContain("Paragraph style:");
  await writerEditor.evaluate(
    /** Focuses and selects the formatted editable subtree immediately before native deletion. @param element - Writer editing host whose browser-owned descendant will be removed. @returns Nothing; the live selection covers the complete formatted text. */ function selectFormattedWriterText(
      element: HTMLElement,
    ): void {
      element.focus();
      const selection = window.getSelection();
      if (selection === null) return;
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );
  await page.keyboard.press("Backspace");
  await expect(writerEditor).toHaveText("");
  await writerEditor.pressSequentially("Recovered");
  await expect(writerEditor).toHaveText("Recovered");
  expect(pageErrors).toEqual([]);
});

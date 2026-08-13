/** @fileoverview Verifies production Writer Cut and Paste replace a same-paragraph selection through safe browser clipboard MIME data. */

import { expect, test } from "@playwright/test";

test("Writer Cut and Paste" /** Verifies native clipboard shortcuts retain Writer direct formatting, menu placement, and history behavior without a backend. @param root0 - Playwright fixture object. @param root0.page - Chromium page hosting the static Writer workbench. @returns A promise resolved after the bounded clipboard flow is asserted. */, async function cutsAndPastesWriterText({
  page,
}): Promise<void> {
  await page.goto("/");
  const writerEditor = page.getByRole("textbox", { name: "Writer document text" });
  await writerEditor.fill("Cut this");
  const cutPayload = await writerEditor.evaluate(
    /** Selects all Writer text and dispatches a native-shaped Cut event. @param element - Editable Writer paragraph. @returns Clipboard MIME values supplied by Writer's document event handler. */
    function cutWriterText(element: HTMLElement): Readonly<{ html: string; plainText: string }> {
      const selection = window.getSelection();
      if (selection === null) throw new Error("Writer Cut requires browser selection support.");
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
      const clipboardData = new DataTransfer();
      element.dispatchEvent(
        new ClipboardEvent("cut", { bubbles: true, cancelable: true, clipboardData }),
      );
      return {
        html: clipboardData.getData("text/html"),
        plainText: clipboardData.getData("text/plain"),
      };
    },
  );
  expect(cutPayload.plainText).toBe("Cut this");
  expect(cutPayload.html).toContain("Cut this");
  await expect(writerEditor).toHaveText("");
  await writerEditor.evaluate(
    /** Dispatches a native-shaped rich Paste event after Cut's restored collapsed caret. @param element - Editable Writer paragraph. @returns Nothing; the document handler owns the immutable insertion. */
    function pasteWriterText(element: HTMLElement): void {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/html", "<strong>Pasted</strong>");
      clipboardData.setData("text/plain", "Pasted");
      element.dispatchEvent(
        new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData }),
      );
    },
  );
  await expect(writerEditor.locator("strong")).toHaveText("Pasted");
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("menuitem", { name: "Cut" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Paste" })).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(writerEditor).toHaveText("");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(writerEditor.locator("strong")).toHaveText("Pasted");
});

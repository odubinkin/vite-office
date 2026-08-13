/** @fileoverview Verifies production Writer native copy events expose sanitized rich clipboard payloads for another browser editor. */

import { expect, test } from "@playwright/test";

test("copies visible formatted Writer content through the native browser copy event" /**
 * Verifies production copy-event data omits accessibility descriptions and retains bounded inline paragraph styles for another rich editor.
 *
 * @param root0 - Playwright fixture object provided for the isolated browser flow.
 * @param root0.page - Isolated Chromium page used for Writer and native ClipboardEvent interactions.
 * @returns A promise that resolves after the copied rich MIME payloads are inspected.
 */, async function copiesFormattedWriterContent({ page }): Promise<void> {
  await page.goto("/");
  const writerEditor = page.getByRole("textbox", { name: "Writer document text" });
  await writerEditor.fill("Copied Writer heading");
  await page.getByRole("button", { name: "Styles" }).click();
  await page.getByRole("menuitem", { name: "Heading 1" }).click();
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Align center" }).click();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("menuitem", { name: "Select All" }).click();
  const clipboardPayload = await writerEditor.evaluate(
    /**
     * Dispatches a native-shaped copy event against the production Writer document and reads its ClipboardEvent data.
     *
     * @param element - Rendered Writer paragraph whose ancestor owns the copy-event listener.
     * @returns Browser clipboard representations written by the production document-body handler.
     */
    function readNativeWriterCopyPayload(element: HTMLElement): {
      html: string;
      plainText: string;
    } {
      const clipboardData = new DataTransfer();
      const copyEvent = new ClipboardEvent("copy", {
        bubbles: true,
        cancelable: true,
        clipboardData,
      });
      element.closest("article")?.dispatchEvent(copyEvent);
      return {
        html: clipboardData.getData("text/html"),
        plainText: clipboardData.getData("text/plain"),
      };
    },
  );
  expect(clipboardPayload.plainText).toBe("Copied Writer heading");
  expect(clipboardPayload.plainText).not.toContain("Paragraph style:");
  expect(clipboardPayload.html).toBe(
    '<p style="text-align: center; font-size: 1.5rem; font-weight: 700; line-height: 2.25rem;">Copied Writer heading</p>',
  );
});

test("Writer list clipboard" /**
 * Verifies Select All transfers complete ordered Writer paragraphs as semantic HTML and readable plain text.
 *
 * @param root0 - Playwright fixture object provided for the isolated browser flow.
 * @param root0.page - Isolated Chromium page used for Writer and native ClipboardEvent interactions.
 * @returns A promise that resolves after semantic list clipboard data is inspected.
 */, async function copiesSemanticWriterLists({ page }): Promise<void> {
  await page.goto("/");
  const firstParagraph = page.getByRole("textbox", { name: "Writer document text" });
  await firstParagraph.fill("First item");
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Bullets and Numbering" }).click();
  await page.getByRole("menuitem", { exact: true, name: "Ordered List" }).click();
  await firstParagraph.evaluate(
    /** Places the browser typing caret at the first list item's end. @param element - Editable first list paragraph. @returns Nothing; the browser selection is updated. */
    function placeCaretAtEnd(element: HTMLElement): void {
      const selection = window.getSelection();
      if (selection === null)
        throw new Error("Writer clipboard list test requires browser selection support.");
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );
  await firstParagraph.press("Enter");
  const secondParagraph = page.getByRole("textbox", { name: "Writer paragraph 2" });
  await secondParagraph.fill("Second item");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("menuitem", { name: "Select All" }).click();
  const clipboardPayload = await firstParagraph.evaluate(
    /** Dispatches a native copy event and checks that a detached rich target parses a real ordered list. @param element - Rendered Writer paragraph beneath the copy-event owner. @returns MIME data plus a detached target's semantic list count. */
    function readNativeWriterListCopyPayload(element: HTMLElement): {
      html: string;
      plainText: string;
      orderedListItemCount: number;
    } {
      const clipboardData = new DataTransfer();
      const copyEvent = new ClipboardEvent("copy", {
        bubbles: true,
        cancelable: true,
        clipboardData,
      });
      element.closest("article")?.dispatchEvent(copyEvent);
      const target = document.createElement("div");
      target.contentEditable = "true";
      target.innerHTML = clipboardData.getData("text/html");
      return {
        html: clipboardData.getData("text/html"),
        plainText: clipboardData.getData("text/plain"),
        orderedListItemCount: target.querySelectorAll("ol > li").length,
      };
    },
  );
  expect(clipboardPayload.html).toContain("<ol>");
  expect(clipboardPayload.html).toContain("<li");
  expect(clipboardPayload.orderedListItemCount).toBe(2);
  expect(clipboardPayload.plainText).toBe("    1. First item\n    2. Second item");
  expect(clipboardPayload.plainText).not.toContain("Paragraph style:");
  expect(clipboardPayload.plainText).not.toContain("Paragraph list:");
});

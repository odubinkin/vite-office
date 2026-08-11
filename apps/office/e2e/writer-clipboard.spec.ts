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

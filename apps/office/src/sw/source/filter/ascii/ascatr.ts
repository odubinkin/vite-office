/**
 * @fileoverview Serializes prepared Writer selections to readable plain text, following LibreOffice Writer's `sw/source/filter/ascii/ascatr.cxx` ownership boundary.
 */

import type { WriterClipboardParagraph } from "../../uibase/dochdl/swdtflvr";

/**
 * Serializes a prepared Writer transfer document to plain text with LibreOffice-like list labels for multiple complete list items.
 *
 * @param paragraphs - Ordered selected Writer paragraphs prepared by the transfer handler.
 * @returns Newline-separated visible plain text without accessibility-only descriptions.
 */
export function serializeWriterClipboardPlainText(
  paragraphs: readonly WriterClipboardParagraph[],
): string {
  const completeListItemCount = paragraphs.filter(isCompleteListItem).length;
  return paragraphs
    .map(
      /**
       * Serializes one transfer paragraph, using a list marker only when the copy contains multiple complete list items.
       *
       * @param paragraph - Prepared visible Writer paragraph.
       * @returns Readable plain text for the paragraph.
       */
      function serializeParagraph(paragraph): string {
        if (completeListItemCount < 2 || !isCompleteListItem(paragraph)) return paragraph.text;
        return `    ${paragraph.marker ?? getFallbackListMarker(paragraph)} ${paragraph.text}`;
      },
    )
    .join("\n");
}

/**
 * Checks whether a transfer paragraph represents a complete semantic list item.
 *
 * @param paragraph - Prepared Writer paragraph inspected without mutation.
 * @returns True for complete bullet and numbered list items.
 */
function isCompleteListItem(paragraph: WriterClipboardParagraph): boolean {
  return paragraph.listKind !== "none";
}

/**
 * Supplies a stable readable marker when a DOM list marker is unavailable during a test or browser selection.
 *
 * @param paragraph - Selected list paragraph missing its rendered marker metadata.
 * @returns Bullet or first ordered-list marker appropriate to the bounded list kind.
 */
function getFallbackListMarker(paragraph: WriterClipboardParagraph): string {
  return paragraph.listKind === "bullet" ? "•" : "1.";
}

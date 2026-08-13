/**
 * @fileoverview Serializes prepared Writer list paragraphs as portable HTML, following LibreOffice Writer's `sw/source/filter/html/htmlnumwriter.cxx` format-writer ownership.
 */

import type { WriterClipboardParagraph } from "../../uibase/dochdl/swdtflvr";

/**
 * Serializes a prepared Writer transfer document to HTML, grouping adjacent complete equal-kind list items into semantic lists.
 *
 * @param paragraphs - Ordered selected Writer paragraphs prepared by the transfer handler.
 * @returns Portable rich HTML that preserves ordinary paragraph and semantic list boundaries.
 */
export function serializeWriterClipboardHtml(
  paragraphs: readonly WriterClipboardParagraph[],
): string {
  let html = "";
  let index = 0;
  while (index < paragraphs.length) {
    const paragraph = paragraphs[index] as WriterClipboardParagraph;
    if (paragraph.listKind === "none") {
      html += serializeParagraphHtml(paragraph);
      index += 1;
      continue;
    }
    const listItems: WriterClipboardParagraph[] = [];
    while (paragraphs[index]?.listKind === paragraph.listKind) {
      listItems.push(paragraphs[index] as WriterClipboardParagraph);
      index += 1;
    }
    html += serializeListHtml(paragraph.listKind, listItems);
  }
  return html;
}

/**
 * Serializes one non-list or partially selected Writer paragraph to portable rich HTML.
 *
 * @param paragraph - Prepared paragraph outside a semantic list group.
 * @returns Escaped inline-styled paragraph HTML.
 */
function serializeParagraphHtml(paragraph: WriterClipboardParagraph): string {
  return `<p style="${paragraph.style}">${escapeHtml(paragraph.text)}</p>`;
}

/**
 * Serializes one contiguous Writer list transfer group with its original list semantics.
 *
 * @param listKind - Bullet or numbered list kind represented by every list item.
 * @param paragraphs - Ordered complete list items in the group.
 * @returns Semantic unordered or ordered list HTML.
 */
function serializeListHtml(
  listKind: "bullet" | "numbered",
  paragraphs: readonly WriterClipboardParagraph[],
): string {
  const items = paragraphs.map(serializeListItemHtml).join("");
  if (listKind === "bullet") return `<ul>${items}</ul>`;
  const start = getOrderedListStart(paragraphs[0]?.marker);
  return start === 1 ? `<ol>${items}</ol>` : `<ol start="${start}">${items}</ol>`;
}

/**
 * Converts one complete list item into portable semantic list-item HTML.
 *
 * @param paragraph - Selected Writer list item with bounded inline presentation.
 * @returns Escaped semantic list-item HTML.
 */
function serializeListItemHtml(paragraph: WriterClipboardParagraph): string {
  return `<li style="${paragraph.style}">${escapeHtml(paragraph.text)}</li>`;
}

/**
 * Reads a valid visible Writer numbering marker for the `start` attribute of a selected ordered-list fragment.
 *
 * @param marker - Browser-visible marker produced for the first selected list item.
 * @returns Positive ordered-list start value, defaulting to one for absent or malformed markers.
 */
function getOrderedListStart(marker: string | undefined): number {
  if (marker === undefined) return 1;
  const match = /^(\d+)\.$/.exec(marker);
  if (match === null) return 1;
  const start = Number(match[1]);
  return Number.isSafeInteger(start) && start > 0 ? start : 1;
}

/**
 * Escapes selected plain text before it becomes clipboard HTML content.
 *
 * @param text - Visible Writer text selected by the user.
 * @returns HTML-safe text that preserves every visible character literally.
 */
function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

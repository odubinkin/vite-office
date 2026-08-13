/**
 * @fileoverview Serializes prepared Writer list paragraphs as portable HTML, following LibreOffice Writer's `sw/source/filter/html/htmlnumwriter.cxx` format-writer ownership.
 */

import type { WriterClipboardParagraph } from "../../uibase/dochdl/swdtflvr";

/**
 * Serializes a prepared Writer transfer document to HTML, grouping adjacent complete list items into balanced semantic nested lists.
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
    while (
      paragraphs[index] !== undefined &&
      (paragraphs[index] as WriterClipboardParagraph).listKind !== "none"
    ) {
      listItems.push(paragraphs[index] as WriterClipboardParagraph);
      index += 1;
    }
    html += serializeListHtml(listItems);
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
  return `<p style="${paragraph.style}">${paragraph.html ?? escapeHtml(paragraph.text)}</p>`;
}

/**
 * Serializes one contiguous Writer list transfer group with its bounded kind and level semantics.
 *
 * @param paragraphs - Ordered complete list items in the group.
 * @returns Semantic unordered or ordered list HTML.
 */
function serializeListHtml(paragraphs: readonly WriterClipboardParagraph[]): string {
  const firstParagraph = paragraphs[0] as WriterClipboardParagraph;
  const baseLevel = firstParagraph.listLevel;
  const listFrames: WriterListFrame[] = [];
  let html = "";
  let previousLevel = 0;
  paragraphs.forEach(
    /** Serializes one list item while preserving valid nesting and bounded mixed-kind transitions. @param paragraph - Complete selected list item. @param index - Zero-based position inside the contiguous transfer group. @returns Nothing; serialized markup is appended to the enclosing writer. */
    function serializeNestedListItem(paragraph, index): void {
      const level = getRelativeListLevel(
        paragraph.listLevel,
        baseLevel,
        previousLevel,
        index === 0,
      );
      while (listFrames.length > level + 1)
        html += closeListFrame(listFrames.pop() as WriterListFrame);
      const currentFrame = listFrames[listFrames.length - 1];
      if (
        currentFrame !== undefined &&
        listFrames.length === level + 1 &&
        currentFrame.kind !== paragraph.listKind
      ) {
        html += closeListFrame(listFrames.pop() as WriterListFrame);
      }
      if (listFrames.length === level + 1) {
        html += "</li>";
      } else {
        const frame = createListFrame(paragraph);
        listFrames.push(frame);
        html += frame.openingTag;
      }
      html += openListItemHtml(paragraph);
      previousLevel = level;
    },
  );
  while (listFrames.length > 0) html += closeListFrame(listFrames.pop() as WriterListFrame);
  return html;
}

/** Describes one open semantic list writer frame. */
interface WriterListFrame {
  /** List presentation used by every direct item in this semantic frame. */
  readonly kind: "bullet" | "numbered";
  /** Opening HTML tag, including a numbered-fragment start when needed. */
  readonly openingTag: string;
}

/**
 * Creates one semantic list writer frame for a selected Writer list item.
 *
 * @param paragraph - First direct item written into the newly opened list frame.
 * @returns Immutable list frame with a valid semantic opening tag.
 */
function createListFrame(paragraph: WriterClipboardParagraph): WriterListFrame {
  if (paragraph.listKind === "bullet") return { kind: "bullet", openingTag: "<ul>" };
  const start = getOrderedListStart(paragraph.marker);
  return { kind: "numbered", openingTag: start === 1 ? "<ol>" : `<ol start="${start}">` };
}

/**
 * Closes the current list item and its containing semantic list frame.
 *
 * @param frame - Open semantic list frame being completed.
 * @returns Balanced closing HTML for the direct item and list container.
 */
function closeListFrame(frame: WriterListFrame): string {
  return `</li>${frame.kind === "bullet" ? "</ul>" : "</ol>"}`;
}

/**
 * Normalizes one stored Writer level to the valid semantic depth for the current selected list fragment.
 *
 * The browser paragraph model permits a user to demote an item without materializing empty intermediate list items.
 * Clipboard HTML cannot represent an empty ancestor list item semantically, so upward jumps are limited to one level.
 *
 * @param storedLevel - Raw non-negative list level stored by the Writer paragraph.
 * @param baseLevel - First selected list item's raw level, treated as the fragment root.
 * @param previousLevel - Previous normalized semantic level in this contiguous transfer group.
 * @param isFirst - Whether this item starts the selected semantic list group.
 * @returns Non-negative semantic nesting level with no unrepresentable empty ancestor jump.
 */
function getRelativeListLevel(
  storedLevel: number,
  baseLevel: number,
  previousLevel: number,
  isFirst: boolean,
): number {
  if (isFirst) return 0;
  const relativeLevel = Math.max(0, storedLevel - baseLevel);
  return Math.min(relativeLevel, previousLevel + 1);
}

/**
 * Opens one complete list item without closing it, allowing a following nested semantic list to remain inside the item.
 *
 * @param paragraph - Selected Writer list item with bounded inline presentation.
 * @returns Escaped opening semantic list-item HTML.
 */
function openListItemHtml(paragraph: WriterClipboardParagraph): string {
  return `<li style="${paragraph.style}">${paragraph.html ?? escapeHtml(paragraph.text)}`;
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

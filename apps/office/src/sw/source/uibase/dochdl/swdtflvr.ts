/**
 * @fileoverview Prepares an isolated browser Writer transfer document from a native selection, mirroring LibreOffice Writer's `sw/source/uibase/dochdl/swdtflvr.cxx` ownership boundary.
 */

import { serializeWriterClipboardHtml } from "../../filter/html/htmlnumwriter";
import { serializeWriterClipboardPlainText } from "../../filter/ascii/ascatr";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";

/** Describes the two clipboard representations emitted for a visible Writer selection. */
export interface WriterClipboardSelection {
  /** Sanitized rich HTML with the selected Writer paragraphs' bounded presentation styles inline. */
  readonly html: string;
  /** Sanitized plain text containing only visible selected paragraph text. */
  readonly plainText: string;
}

/** Describes one selected Writer paragraph in the transfer document before a format writer serializes it. */
export interface WriterClipboardParagraph {
  /** Complete list selection kind, or none when the selection is partial or the paragraph is ordinary body text. */
  readonly listKind: "bullet" | "none" | "numbered";
  /** Zero-based bounded Writer list level used by nested HTML and ASCII format writers. */
  readonly listLevel: number;
  /** Browser-visible list marker used only by the ASCII writer. */
  readonly marker: string | undefined;
  /** Portable paragraph-level presentation CSS. */
  readonly style: string;
  /** Visible selected paragraph text. */
  readonly text: string;
}

/** Identifies rendered editable paragraphs eligible for Writer clipboard serialization. */
const writerParagraphSelector = "[data-writer-paragraph-id]";

/**
 * Builds clipboard data from selected visible Writer paragraphs while deliberately excluding adjacent accessibility descriptions.
 *
 * @param selection - Native browser selection owned by the Writer document or no selection when the browser cannot expose one.
 * @param document - Document that contains the rendered Writer paragraph controls.
 * @returns Visible plain text and inline-styled HTML, or undefined when no Writer paragraph text is selected.
 */
export function createWriterClipboardSelection(
  selection: Selection | null,
  document: Document = globalThis.document,
): WriterClipboardSelection | undefined {
  if (selection === null || selection.isCollapsed || selection.rangeCount !== 1) return undefined;
  const selectionRange = selection.getRangeAt(0);
  const paragraphs = Array.from(document.querySelectorAll<HTMLElement>(writerParagraphSelector))
    .filter(
      /**
       * Retains only visible Writer paragraph nodes intersected by the native selection range.
       *
       * @param paragraph - Rendered editable Writer paragraph inspected without mutation.
       * @returns True when the paragraph contributes visible selected text.
       */
      function intersectsSelection(paragraph): boolean {
        return selectionRange.intersectsNode(paragraph);
      },
    )
    .map(
      /**
       * Converts one selected Writer paragraph into a format-neutral transfer record.
       *
       * @param paragraph - Rendered editable Writer paragraph intersected by the selection.
       * @returns Clipboard-ready visible paragraph data for an HTML or ASCII writer.
       */
      function serializeParagraph(paragraph): WriterClipboardParagraph {
        const text = getSelectedParagraphText(selectionRange, paragraph);
        const isCompleteList = isCompleteListParagraph(selectionRange, paragraph, text);
        return {
          listKind: isCompleteList ? getWriterListKind(paragraph) : "none",
          listLevel: isCompleteList ? getWriterListLevel(paragraph) : 0,
          marker: paragraph.dataset.listMarker,
          style: getParagraphInlineStyle(paragraph),
          text,
        };
      },
    );
  if (paragraphs.length === 0) return undefined;
  return {
    html: serializeWriterClipboardHtml(paragraphs),
    plainText: serializeWriterClipboardPlainText(paragraphs),
  };
}

/**
 * Checks whether a selected paragraph is a complete list item eligible for semantic list transfer.
 *
 * @param selectionRange - Native range intersecting the paragraph.
 * @param paragraph - Editable Writer paragraph inspected without mutation.
 * @param selectedText - Already clipped visible selection text.
 * @returns True only for a complete selected bullet or numbered Writer paragraph.
 */
function isCompleteListParagraph(
  selectionRange: Range,
  paragraph: HTMLElement,
  selectedText: string,
): boolean {
  return (
    getWriterListKind(paragraph) !== "none" &&
    selectedText === paragraph.textContent &&
    selectionRange.intersectsNode(paragraph)
  );
}

/**
 * Reads the bounded list kind from one browser Writer paragraph.
 *
 * @param paragraph - Editable paragraph exposing serialized list state through a data attribute.
 * @returns Supported list kind or none for absent and unsupported values.
 */
function getWriterListKind(paragraph: HTMLElement): WriterClipboardParagraph["listKind"] {
  const kind = paragraph.dataset.listKind;
  return kind === "bullet" || kind === "numbered" ? kind : "none";
}

/**
 * Reads a safe non-negative list level from one browser Writer paragraph.
 *
 * @param paragraph - Editable paragraph exposing serialized list state through a data attribute.
 * @returns Zero for missing or malformed browser values, otherwise the stored integer clamped to the document-model bound.
 */
function getWriterListLevel(paragraph: HTMLElement): number {
  const level = Number(paragraph.dataset.listLevel);
  return Number.isInteger(level) && level >= 0 ? Math.min(level, WRITER_MAX_LIST_LEVEL) : 0;
}

/**
 * Extracts the selected text intersection between a native selection and one Writer paragraph.
 *
 * @param selectionRange - Native range that intersects the Writer paragraph.
 * @param paragraph - Rendered editable Writer paragraph whose visible contents are clipped to the selection.
 * @returns Selected visible text from the paragraph without sibling accessibility descriptions.
 */
function getSelectedParagraphText(selectionRange: Range, paragraph: HTMLElement): string {
  const paragraphRange = paragraph.ownerDocument.createRange();
  paragraphRange.selectNodeContents(paragraph);
  const selectedRange = paragraphRange.cloneRange();
  if (selectionRange.compareBoundaryPoints(Range.START_TO_START, paragraphRange) > 0)
    selectedRange.setStart(selectionRange.startContainer, selectionRange.startOffset);
  if (selectionRange.compareBoundaryPoints(Range.END_TO_END, paragraphRange) < 0)
    selectedRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
  return selectedRange.toString();
}

/**
 * Produces portable inline CSS for the paragraph-level style and alignment currently modeled by Writer.
 *
 * @param paragraph - Rendered Writer paragraph whose bounded data attributes define the copied presentation.
 * @returns Semicolon-separated CSS suitable for the clipboard HTML paragraph element.
 */
function getParagraphInlineStyle(paragraph: HTMLElement): string {
  const alignment = paragraph.dataset.alignment;
  const textAlign =
    alignment === "center" || alignment === "right" || alignment === "justify" ? alignment : "left";
  const isHeading = paragraph.dataset.style === "heading-1";
  return isHeading
    ? `text-align: ${textAlign}; font-size: 1.5rem; font-weight: 700; line-height: 2.25rem;`
    : `text-align: ${textAlign}; font-size: 1rem; font-weight: 400; line-height: 1.75rem;`;
}

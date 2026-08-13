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
  /** Sanitized semantic inline HTML for the selected text, retaining bounded direct character formatting. */
  readonly html?: string;
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
          html: getSelectedParagraphHtml(selectionRange, paragraph),
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
 * Extracts and whitelists selected inline Writer formatting without inheriting editable-host metadata or accessibility descriptions.
 *
 * @param selectionRange - Native range that intersects the Writer paragraph.
 * @param paragraph - Editable Writer paragraph whose selected semantic inline nodes are copied.
 * @returns Safe inline HTML limited to strong, em, and single-underline spans.
 */
function getSelectedParagraphHtml(selectionRange: Range, paragraph: HTMLElement): string {
  const paragraphRange = paragraph.ownerDocument.createRange();
  paragraphRange.selectNodeContents(paragraph);
  const selectedRange = paragraphRange.cloneRange();
  if (selectionRange.compareBoundaryPoints(Range.START_TO_START, paragraphRange) > 0)
    selectedRange.setStart(selectionRange.startContainer, selectionRange.startOffset);
  if (selectionRange.compareBoundaryPoints(Range.END_TO_END, paragraphRange) < 0)
    selectedRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
  const container = paragraph.ownerDocument.createElement("div");
  container.append(selectedRange.cloneContents());
  const html = sanitizeWriterInlineHtml(container);
  return wrapUniformWriterInlineFormatting(selectionRange, paragraph, html);
}

/**
 * Restores a semantic direct-format ancestor lost by browser Range cloning of a text-only partial selection.
 *
 * @param selectionRange - Native selection already constrained to one Writer paragraph.
 * @param paragraph - Editable Writer paragraph delimiting allowed direct-format ancestors.
 * @param html - Sanitized selected fragment emitted by the detached clone.
 * @returns Original HTML unless both endpoints share the same supported inline-format ancestor chain.
 */
function wrapUniformWriterInlineFormatting(
  selectionRange: Range,
  paragraph: HTMLElement,
  html: string,
): string {
  const startAncestors = getWriterInlineAncestors(selectionRange.startContainer, paragraph);
  const endAncestors = getWriterInlineAncestors(selectionRange.endContainer, paragraph);
  if (
    startAncestors.length === 0 ||
    startAncestors.length !== endAncestors.length ||
    startAncestors.some(
      /** Compares an ancestor in the start chain with its matching end-chain formatting element. @param ancestor - Start endpoint ancestor. @param index - Matching ancestor index. @returns True only for equal semantic elements. */
      function hasDifferentAncestor(ancestor, index): boolean {
        return (
          getWriterInlineTag(ancestor) !== getWriterInlineTag(endAncestors[index] as HTMLElement)
        );
      },
    )
  )
    return html;
  return startAncestors.reduceRight(
    /** Rebuilds shared semantic wrappers around the selected fragment from innermost to outermost. @param content - Already wrapped selected HTML. @param ancestor - Supported direct-format ancestor. @returns Next wrapped semantic HTML. */
    function wrapInlineContent(content, ancestor): string {
      const tag = getWriterInlineTag(ancestor);
      return tag === "strong"
        ? `<strong>${content}</strong>`
        : tag === "em"
          ? `<em>${content}</em>`
          : `<span style="text-decoration: underline">${content}</span>`;
    },
    html,
  );
}

/** Finds supported direct-format ancestors between a selection endpoint and its editable Writer paragraph. @param node - Selection endpoint node. @param paragraph - Editable Writer paragraph that terminates the search. @returns Supported ancestors from outermost to innermost. */
function getWriterInlineAncestors(node: Node, paragraph: HTMLElement): readonly HTMLElement[] {
  const ancestors: HTMLElement[] = [];
  let current = node instanceof HTMLElement ? node : node.parentElement;
  while (current !== null && current !== paragraph) {
    if (getWriterInlineTag(current) !== undefined) ancestors.unshift(current);
    current = current.parentElement;
  }
  return ancestors;
}

/** Resolves an emitted direct-format element to its safe clipboard tag. @param element - Candidate editable descendant. @returns Semantic clipboard tag, or undefined for untrusted markup. */
function getWriterInlineTag(element: HTMLElement): "em" | "strong" | "underline" | undefined {
  if (element.tagName === "STRONG") return "strong";
  if (element.tagName === "EM") return "em";
  return element.style.textDecoration === "underline" ? "underline" : undefined;
}

/** Whitelists the exact semantic inline elements emitted by the bounded Writer run renderer. @param container - Detached selected-fragment container. @returns Escaped plain text plus bounded semantic inline HTML. */
function sanitizeWriterInlineHtml(container: HTMLElement): string {
  return Array.from(container.childNodes)
    .map(
      /** Serializes one selected node through the bounded Writer inline whitelist. @param node - Detached selected DOM node. @returns Safe selected inline HTML. */
      function serializeInlineNode(node): string {
        if (node instanceof Text) return escapeWriterClipboardHtml(node.data);
        /* v8 ignore next -- Range clones from the editable Writer renderer contain only text nodes and emitted elements; this is retained as a defensive DOM-boundary fallback. */
        if (!(node instanceof HTMLElement)) return "";
        const content = sanitizeWriterInlineHtml(node);
        if (node.tagName === "STRONG") return `<strong>${content}</strong>`;
        if (node.tagName === "EM") return `<em>${content}</em>`;
        return node.style.textDecoration === "underline"
          ? `<span style="text-decoration: underline">${content}</span>`
          : content;
      },
    )
    .join("");
}

/** Escapes browser-selected Writer text before it becomes clipboard HTML. @param text - Selected visible text node content. @returns HTML-safe text. */
function escapeWriterClipboardHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

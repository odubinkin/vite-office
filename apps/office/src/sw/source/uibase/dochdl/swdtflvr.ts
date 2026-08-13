/**
 * @fileoverview Converts a native Writer selection into visible plain text and bounded rich HTML without accessibility-only descriptions.
 */

/** Describes the two clipboard representations emitted for a visible Writer selection. */
export interface WriterClipboardSelection {
  /** Sanitized rich HTML with the selected Writer paragraphs' bounded presentation styles inline. */
  readonly html: string;
  /** Sanitized plain text containing only visible selected paragraph text. */
  readonly plainText: string;
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
  const selectedParagraphs = Array.from(
    document.querySelectorAll<HTMLElement>(writerParagraphSelector),
  )
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
       * Converts one selected Writer paragraph into its visible text and bounded inline HTML.
       *
       * @param paragraph - Rendered editable Writer paragraph intersected by the selection.
       * @returns Clipboard-ready visible text and the matching paragraph HTML.
       */
      function serializeParagraph(paragraph): { html: string; text: string } {
        const text = getSelectedParagraphText(selectionRange, paragraph);
        return {
          html: `<p style="${getParagraphInlineStyle(paragraph)}">${escapeHtml(text)}</p>`,
          text,
        };
      },
    );
  if (selectedParagraphs.length === 0) return undefined;
  return {
    html: selectedParagraphs.map(selectHtml).join(""),
    plainText: selectedParagraphs.map(selectText).join("\n"),
  };
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

/**
 * Extracts serialized rich HTML from one selected Writer paragraph.
 *
 * @param paragraph - Clipboard-ready paragraph serialization.
 * @returns Inline-styled HTML paragraph string.
 */
function selectHtml(paragraph: Readonly<{ html: string; text: string }>): string {
  return paragraph.html;
}

/**
 * Extracts visible plain text from one selected Writer paragraph.
 *
 * @param paragraph - Clipboard-ready paragraph serialization.
 * @returns Visible selected Writer text.
 */
function selectText(paragraph: Readonly<{ html: string; text: string }>): string {
  return paragraph.text;
}

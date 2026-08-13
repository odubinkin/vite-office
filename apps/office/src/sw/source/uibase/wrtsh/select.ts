/**
 * @fileoverview Provides browser-DOM selection and collapsed-caret primitives at the LibreOffice `sw/source/uibase/wrtsh/select.cxx` ownership boundary without coupling them to React state.
 */

/**
 * Reads a collapsed browser selection as a UTF-16 offset relative to one editable Writer paragraph.
 *
 * @param paragraphElement - Editable paragraph that must contain the selection's caret endpoint.
 * @returns Caret offset for a collapsed in-paragraph selection, or undefined when the browser selection cannot be safely split.
 */
export function getWriterCollapsedCaretOffset(
  paragraphElement: HTMLParagraphElement,
): number | undefined {
  const selection = globalThis.getSelection();
  if (selection === null || !selection.isCollapsed || selection.rangeCount !== 1) return undefined;
  const caretRange = selection.getRangeAt(0);
  if (!paragraphElement.contains(caretRange.startContainer)) return undefined;
  const precedingRange = caretRange.cloneRange();
  precedingRange.selectNodeContents(paragraphElement);
  precedingRange.setEnd(caretRange.startContainer, caretRange.startOffset);
  return precedingRange.toString().length;
}

/**
 * Focuses one Writer paragraph and restores a bounded collapsed caret offset across its text-run body.
 *
 * @param paragraph - Rendered Writer paragraph that should receive browser focus.
 * @param offset - Requested UTF-16 caret offset, clamped to the currently rendered text length.
 * @returns Nothing; selection is left unchanged when the browser cannot safely restore a text caret.
 */
export function restoreWriterCollapsedCaret(paragraph: HTMLParagraphElement, offset: number): void {
  const selection = globalThis.getSelection();
  /* c8 ignore next -- Writer requires browser selection support to mount its editable document body. */
  if (selection === null) return;
  paragraph.focus();
  const range = document.createRange();
  const caret = getWriterTextCaretPoint(paragraph, offset);
  range.setStart(caret.node, caret.offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Resolves one clamped paragraph-relative text offset to a browser Range boundary point.
 *
 * @param paragraph - Editable Writer paragraph whose descendant text nodes are inspected.
 * @param requestedOffset - Requested UTF-16 offset from the paragraph's visible-text start.
 * @returns A text-node position when visible text exists, otherwise the paragraph start.
 */
function getWriterTextCaretPoint(
  paragraph: HTMLParagraphElement,
  requestedOffset: number,
): Readonly<{ node: Node; offset: number }> {
  const walker = paragraph.ownerDocument.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
  let remaining = Math.max(0, requestedOffset);
  let lastTextNode: Text | undefined;
  let textNode = walker.nextNode();
  while (textNode instanceof Text) {
    lastTextNode = textNode;
    if (remaining <= textNode.length) return { node: textNode, offset: remaining };
    remaining -= textNode.length;
    textNode = walker.nextNode();
  }
  if (lastTextNode !== undefined) return { node: lastTextNode, offset: lastTextNode.length };
  return { node: paragraph, offset: 0 };
}

/**
 * Resolves one non-empty native selection to bounded UTF-16 offsets inside a single Writer paragraph host.
 *
 * @param selection - Current browser selection or null when unavailable.
 * @returns Paragraph identity and range offsets, or undefined for collapsed, cross-paragraph, or non-Writer selections.
 */
export function getWriterSameParagraphSelection(
  selection: Selection | null,
): Readonly<{ end: number; paragraphId: string; start: number }> | undefined {
  if (selection === null || selection.isCollapsed || selection.rangeCount !== 1) return undefined;
  const range = selection.getRangeAt(0);
  const startParagraph = getWriterSelectionParagraph(range.startContainer);
  const endParagraph = getWriterSelectionParagraph(range.endContainer);
  if (startParagraph === undefined || endParagraph === undefined || startParagraph !== endParagraph)
    return undefined;
  const paragraphRange = startParagraph.ownerDocument.createRange();
  paragraphRange.selectNodeContents(startParagraph);
  const start = getWriterRangeOffset(paragraphRange, range.startContainer, range.startOffset);
  const end = getWriterRangeOffset(paragraphRange, range.endContainer, range.endOffset);
  /* v8 ignore next -- A live non-collapsed Range contained by one paragraph always has two representable, distinct text offsets. */
  if (start === undefined || end === undefined || start === end) return undefined;
  return {
    end: Math.max(start, end),
    paragraphId: startParagraph.dataset.writerParagraphId as string,
    start: Math.min(start, end),
  };
}

/** Finds the Writer editable paragraph enclosing one selection container. @param node - Browser text or element node from a selection endpoint. @returns Enclosing Writer paragraph, or undefined outside the editor. */
function getWriterSelectionParagraph(node: Node): HTMLParagraphElement | undefined {
  const element = node instanceof HTMLElement ? node : node.parentElement;
  /* v8 ignore next -- Native Range endpoint nodes supplied here always expose a parent element. */
  return element?.closest<HTMLParagraphElement>("[data-writer-paragraph-id]") ?? undefined;
}

/** Converts one range endpoint to a UTF-16 offset from an editable paragraph start. @param paragraphRange - Complete editable paragraph range. @param node - Endpoint node contained by the paragraph. @param offset - Native endpoint offset. @returns UTF-16 offset, or undefined when the endpoint cannot be represented safely. */
function getWriterRangeOffset(
  paragraphRange: Range,
  node: Node,
  offset: number,
): number | undefined {
  try {
    const prefix = paragraphRange.cloneRange();
    prefix.setEnd(node, offset);
    return prefix.toString().length;
    /* v8 ignore next -- Browser Range endpoint validation is defensive; selections returned by a live Range cannot otherwise be invalid here. */
  } catch {
    /* v8 ignore next -- The fallback is only reachable if a browser violates the live Range endpoint contract. */
    return undefined;
  }
}

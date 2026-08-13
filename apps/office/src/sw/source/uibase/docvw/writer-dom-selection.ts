/**
 * @fileoverview Provides browser-DOM selection and collapsed-caret primitives used by the Writer document editor without coupling them to React state.
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
 * Focuses one Writer paragraph and restores a bounded collapsed caret offset inside its plain-text body.
 *
 * @param paragraph - Rendered Writer paragraph that should receive browser focus.
 * @param offset - Requested UTF-16 caret offset, clamped to the currently rendered text length.
 * @returns Nothing; selection is left unchanged when the browser cannot safely restore a text caret.
 */
export function restoreWriterCollapsedCaret(paragraph: HTMLParagraphElement, offset: number): void {
  const textNode = paragraph.firstChild;
  const selection = globalThis.getSelection();
  /* c8 ignore next -- Writer requires browser selection support to mount its editable document body. */
  if (selection === null) return;
  paragraph.focus();
  const range = document.createRange();
  if (textNode instanceof Text) range.setStart(textNode, Math.min(offset, textNode.length));
  else range.setStart(paragraph, 0);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

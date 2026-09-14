/**
 * @fileoverview Adapts native browser selections to Writer model positions without claiming
 * ownership of LibreOffice `sw/source/uibase/wrtsh/select.cxx` model selection behavior.
 */

import type { WriterCursorSelection } from "../../source/uibase/wrtsh/wrtsh";

/** Resolves a rendered editable paragraph from its stable Writer text-node identity. */
export type WriterParagraphElementResolver = (
  paragraphId: string,
) => HTMLParagraphElement | undefined;

/** Replaceable browser selection surface used by the document editor. */
export interface BrowserWriterSelectionEnvironment {
  readonly document: Document;
  readonly getSelection: () => Selection | null;
}

/** Converts native browser selection state to and from canonical Writer positions. */
export class BrowserWriterSelectionMapper {
  /** Creates a mapper without capturing browser globals in React code. @param environment - Injected DOM surface. @param resolveParagraph - Mounted paragraph lookup. @returns Nothing. */
  public constructor(
    private readonly environment: BrowserWriterSelectionEnvironment,
    private readonly resolveParagraph: WriterParagraphElementResolver,
  ) {}

  /** Reads the current direction-preserving Writer selection. @returns Canonical coordinates or undefined outside the projection. */
  public Read(): WriterCursorSelection | undefined {
    return getWriterDomSelection(this.environment.getSelection());
  }

  /** Restores canonical selection into the single browser editing host. @param cursor - Writer cursor projection. @returns Whether restoration succeeded. */
  public Restore(cursor: WriterCursorSelection): boolean {
    const current = this.Read();
    if (
      current !== undefined &&
      current.point.paragraphId === cursor.point.paragraphId &&
      current.point.offset === cursor.point.offset &&
      current.mark?.paragraphId === cursor.mark?.paragraphId &&
      current.mark?.offset === cursor.mark?.offset
    )
      return true;
    return restoreWriterDomSelection(
      cursor,
      this.resolveParagraph,
      this.environment.getSelection(),
    );
  }

  /** Subscribes to native selection changes. @param listener - Canonical selection consumer. @returns Cleanup callback. */
  public Subscribe(listener: (selection: WriterCursorSelection) => void): () => void {
    const synchronize =
      /** Converts and publishes one native selection change. @returns Nothing. */ (): void => {
        const selection = this.Read();
        if (selection !== undefined) listener(selection);
      };
    this.environment.document.addEventListener("selectionchange", synchronize);
    return /** Removes the native selection listener. @returns Nothing. */ () =>
      this.environment.document.removeEventListener("selectionchange", synchronize);
  }
}

/**
 * Converts one native browser selection to Writer point-and-mark coordinates.
 *
 * Selection.focus is Writer's moving point and Selection.anchor is its fixed mark, matching
 * SwPaM direction rather than flattening every range to ordered start/end offsets.
 *
 * @param selection - Current browser selection or null when unavailable.
 * @returns Direction-preserving Writer selection, or undefined outside mounted Writer paragraphs.
 */
export function getWriterDomSelection(
  selection: Selection | null,
): WriterCursorSelection | undefined {
  if (
    selection === null ||
    selection.rangeCount !== 1 ||
    !(selection.focusNode instanceof Node) ||
    !(selection.anchorNode instanceof Node)
  )
    return undefined;
  const point = getWriterDomPosition(selection.focusNode, selection.focusOffset);
  if (point === undefined) return undefined;
  if (selection.isCollapsed) return { point };
  const mark = getWriterDomPosition(selection.anchorNode, selection.anchorOffset);
  return mark === undefined ? undefined : { mark, point };
}

/**
 * Restores one shell-owned SwPaM projection into the native browser Selection.
 *
 * @param cursor - Canonical point-and-mark coordinates.
 * @param resolveParagraph - Mounted paragraph lookup owned by the view adapter.
 * @param browserSelection - Injected native selection surface.
 * @returns True when every endpoint was mounted and the native selection was restored.
 */
export function restoreWriterDomSelection(
  cursor: WriterCursorSelection,
  resolveParagraph: WriterParagraphElementResolver,
  browserSelection: Selection | null = globalThis.getSelection(),
): boolean {
  const selection = browserSelection;
  /* c8 ignore next -- Writer requires browser selection support to mount its editable body. */
  if (selection === null) return false;
  const pointParagraph = resolveParagraph(cursor.point.paragraphId);
  const markParagraph =
    cursor.mark === undefined ? undefined : resolveParagraph(cursor.mark.paragraphId);
  if (pointParagraph === undefined || (cursor.mark !== undefined && markParagraph === undefined))
    return false;
  if (
    cursor.mark !== undefined &&
    markParagraph !== undefined &&
    markParagraph !== pointParagraph &&
    cursor.mark.offset === 0 &&
    cursor.point.offset === (pointParagraph.textContent?.length ?? 0) &&
    (markParagraph.compareDocumentPosition(pointParagraph) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  ) {
    const range = pointParagraph.ownerDocument.createRange();
    range.setStartBefore(markParagraph);
    range.setEndAfter(pointParagraph);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }
  const point = getWriterTextCaretPoint(pointParagraph, cursor.point.offset);
  if (cursor.mark === undefined || markParagraph === undefined) {
    pointParagraph.focus();
    const range = pointParagraph.ownerDocument.createRange();
    range.setStart(point.node, point.offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }
  const mark = getWriterTextCaretPoint(markParagraph, cursor.mark.offset);
  selection.setBaseAndExtent(mark.node, mark.offset, point.node, point.offset);
  return true;
}

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
  restoreWriterDomSelection(
    {
      point: { offset, paragraphId: paragraph.dataset.writerParagraphId as string },
    },
    /** Resolves the one supplied paragraph whose identity constructed the cursor above. @returns Supplied paragraph. */ () =>
      paragraph,
  );
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
  const cursor = getWriterDomSelection(selection);
  if (
    cursor?.mark === undefined ||
    cursor.point.paragraphId !== cursor.mark.paragraphId ||
    cursor.point.offset === cursor.mark.offset
  )
    return undefined;
  return {
    end: Math.max(cursor.mark.offset, cursor.point.offset),
    paragraphId: cursor.point.paragraphId,
    start: Math.min(cursor.mark.offset, cursor.point.offset),
  };
}

/**
 * Resolves a collapsed native selection to one editable Writer paragraph caret.
 *
 * @param selection - Current browser selection or null when the browser exposes none.
 * @returns Stable Writer paragraph identity and UTF-16 caret offset, or undefined outside one editable Writer paragraph.
 */
export function getWriterCollapsedParagraphCaret(
  selection: Selection | null,
): Readonly<{ offset: number; paragraphId: string }> | undefined {
  const cursor = getWriterDomSelection(selection);
  return cursor?.mark === undefined ? cursor?.point : undefined;
}

/** Converts one native endpoint to a paragraph-relative Writer model position. @param node - Native endpoint node. @param offset - Native endpoint offset. @returns Writer position or undefined outside the editable body. */
function getWriterDomPosition(
  node: Node,
  offset: number,
): WriterCursorSelection["point"] | undefined {
  const paragraph = getWriterSelectionParagraph(node);
  if (paragraph === undefined) return undefined;
  const paragraphRange = paragraph.ownerDocument.createRange();
  paragraphRange.selectNodeContents(paragraph);
  const writerOffset = getWriterRangeOffset(paragraphRange, node, offset);
  /* v8 ignore next -- A live native Selection endpoint is a valid Range endpoint by construction. */
  return writerOffset === undefined
    ? undefined
    : { offset: writerOffset, paragraphId: paragraph.dataset.writerParagraphId as string };
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

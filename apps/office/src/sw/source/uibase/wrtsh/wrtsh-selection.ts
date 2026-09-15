/**
 * @fileoverview Defines browser-neutral SwPaM projections and selection validation from
 * pinned LibreOffice `sw/source/uibase/wrtsh/select.cxx`.
 */

import type {
  SwTextNode as WriterParagraph,
  WriterCharacterAttributes,
} from "../../core/txtnode/ndtxt";
import type { SwUndoCursorState } from "../../core/undo/undobj";

/** Shell-owned temporary extended-text-input state corresponding to LibreOffice SwExtTextInput. */
export interface WriterCompositionState {
  /** Cursor or selection replaced when the composition is committed. */
  readonly cursor: SwUndoCursorState;
  /** Latest browser composition text, not yet written into SwDoc. */
  text: string;
}

/** Stable browser-neutral coordinate used to synchronize a Writer SwPaM with a rendered view. */
export interface WriterCursorPosition {
  /** Stable Writer text-node identity. */
  readonly paragraphId: string;
  /** UTF-16 content offset inside the text node. */
  readonly offset: number;
}

/** Direction-preserving projection of the persistent Writer point-and-mark cursor. */
export interface WriterCursorSelection {
  /** Optional fixed selection endpoint. */
  readonly mark?: WriterCursorPosition;
  /** Moving caret or selection endpoint. */
  readonly point: WriterCursorPosition;
}

/** Describes one browser-resolved range after conversion to Writer model coordinates. */
export interface WriterParagraphTextRange {
  /** Exclusive UTF-16 range end relative to the text node. */
  readonly end: number;
  /** Stable identity of the SwTextNode containing both endpoints. */
  readonly paragraphId: string;
  /** Inclusive UTF-16 range start relative to the text node. */
  readonly start: number;
}

/** Validates one stable cursor offset against its current Writer text node. @param paragraph - Target text node. @param offset - Candidate UTF-16 offset. @returns Whether the position is representable. */
export function isWriterCursorOffset(paragraph: WriterParagraph, offset: number): boolean {
  return Number.isInteger(offset) && offset >= 0 && offset <= paragraph.Len();
}

/** Compares two direction-preserving browser-neutral cursor projections. @param left - Current selection. @param right - Candidate selection. @returns True when point and optional mark are identical. */
export function areWriterCursorSelectionsEqual(
  left: WriterCursorSelection,
  right: WriterCursorSelection,
): boolean {
  return (
    left.point.paragraphId === right.point.paragraphId &&
    left.point.offset === right.point.offset &&
    left.mark?.paragraphId === right.mark?.paragraphId &&
    left.mark?.offset === right.mark?.offset
  );
}

/** Returns an ordered non-empty same-node selection. @param selection - Cursor projection. @returns Bounded range or undefined. */
export function getWriterSelectedTextRange(
  selection: WriterCursorSelection,
): WriterParagraphTextRange | undefined {
  if (selection.mark === undefined || selection.mark.paragraphId !== selection.point.paragraphId)
    return undefined;
  const start = Math.min(selection.point.offset, selection.mark.offset);
  const end = Math.max(selection.point.offset, selection.mark.offset);
  return start === end ? undefined : { end, paragraphId: selection.point.paragraphId, start };
}

/** Creates an undo cursor state from canonical node references. @param point - Moving endpoint node. @param pointOffset - Moving endpoint offset. @param mark - Optional fixed endpoint node. @param markOffset - Optional fixed endpoint offset. @param activeParagraph - Active node. @param pendingCharacterAttributes - Pending caret attributes. @returns Complete undo cursor state. */
export function createWriterUndoCursorState(
  point: WriterParagraph,
  pointOffset: number,
  mark: WriterParagraph | undefined,
  markOffset: number | undefined,
  activeParagraph: WriterParagraph,
  pendingCharacterAttributes: WriterCharacterAttributes,
): SwUndoCursorState {
  return {
    activeParagraph,
    ...(mark === undefined || markOffset === undefined
      ? {}
      : { mark: { node: mark, offset: markOffset } }),
    pendingCharacterAttributes: { ...pendingCharacterAttributes },
    point: { node: point, offset: pointOffset },
  };
}

/** Creates a collapsed undo cursor endpoint. @param paragraphId - Target node identity. @param offset - UTF-16 content offset. @param pendingCharacterAttributes - Pending caret attributes. @returns Complete undo cursor state. */
export function createWriterCollapsedCursorState(
  paragraph: WriterParagraph,
  offset: number,
  pendingCharacterAttributes: WriterCharacterAttributes,
): SwUndoCursorState {
  return {
    activeParagraph: paragraph,
    pendingCharacterAttributes: { ...pendingCharacterAttributes },
    point: { node: paragraph, offset },
  };
}

/** Converts an ordered paragraph range to a direction-preserving selection. @param range - Same-node text range. @returns Point-and-mark selection. */
export function createWriterRangeSelection(range: WriterParagraphTextRange): WriterCursorSelection {
  return {
    mark: { offset: range.start, paragraphId: range.paragraphId },
    point: { offset: range.end, paragraphId: range.paragraphId },
  };
}

/**
 * @fileoverview Defines browser-neutral SwPaM projections and selection validation from
 * pinned LibreOffice `sw/source/uibase/wrtsh/select.cxx`.
 */

import type { WriterParagraph } from "../../core/doc/writer";

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

/** @fileoverview Defines view-only Writer selection coordinates used by DOM projection adapters. */

/** View-only endpoint keyed by a projection-owned paragraph identity. */
export interface WriterCursorPosition {
  readonly offset: number;
  readonly paragraphId: string;
}

/** Direction-preserving DOM projection of a canonical SwPaM. */
export interface WriterCursorSelection {
  readonly mark?: WriterCursorPosition;
  readonly point: WriterCursorPosition;
}

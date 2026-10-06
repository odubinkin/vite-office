/** @fileoverview Writer insertion flags and options from pinned itabenum.hxx. */

/** Native table insertion bit values. */
export const SwInsertTableFlags = Object.freeze({
  NONE: 0x00,
  DefaultBorder: 0x01,
  Headline: 0x02,
  SplitLayout: 0x08,
  HeadlineNoBorder: 0x0a,
  All: 0x0b,
});

/** Native insertion options retain header styling independently of repeated rows. */
export interface SwInsertTableOptions {
  readonly mnInsMode: number;
  readonly mnRowsToRepeat: number;
}

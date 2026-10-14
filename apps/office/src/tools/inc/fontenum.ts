/** @fileoverview Original strikeout and emphasis declarations; other font enums and diagnostics remain in their existing/pending owners. */
/** Original unscoped strikeout enumerators, including ABI-size sentinel as a value only. */
export enum FontStrikeout {
  STRIKEOUT_NONE = 0,
  STRIKEOUT_SINGLE = 1,
  STRIKEOUT_DOUBLE = 2,
  STRIKEOUT_DONTKNOW = 3,
  STRIKEOUT_BOLD = 4,
  STRIKEOUT_SLASH = 5,
  STRIKEOUT_X = 6,
  FontStrikeout_FORCE_EQUAL_SIZE = 2147483647,
}
/** Original emphasis bit values; native typed_flags uses mask0x300f. */
export enum FontEmphasisMark {
  NONE = 0,
  Dot = 1,
  Circle = 2,
  Disc = 3,
  Accent = 4,
  Style = 15,
  PosAbove = 4096,
  PosBelow = 8192,
}

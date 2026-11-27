/** @fileoverview Native recording and visibility flags for Writer redlines. */

/** The original per-document flags independently of the editor's view state. */
export enum RedlineFlags {
  NONE = 0,
  On = 0x001,
  Ignore = 0x002,
  ShowInsert = 0x010,
  ShowDelete = 0x020,
  ShowMask = 0x030,
  DeleteRedlines = 0x100,
  DontCombineRedlines = 0x400,
}

/** @fileoverview Original reference modes, row/column flags and ScGlobal boundary from pinned sc/inc/global.hxx. */
export { ScGlobal } from "../source/core/data/global";
/** Original insertion/deletion, copy, movement and sheet reorder discriminator. */
export enum UpdateRefMode {
  URM_INSDEL = 0,
  URM_COPY = 1,
  URM_MOVE = 2,
  URM_REORDER = 3,
}
/** Original UInt8 column/row flags; typed bit operations allow only the four mask bits. */
export enum CRFlags {
  NONE = 0x00,
  Hidden = 0x01,
  ManualBreak = 0x02,
  Filtered = 0x04,
  ManualSize = 0x08,
  All = 0x0f,
}

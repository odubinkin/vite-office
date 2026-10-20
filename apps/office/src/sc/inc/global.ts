/** @fileoverview Original cell types, reference modes, row/column flags and ScGlobal boundary from pinned sc/inc/global.hxx. */
import { convert } from "../../o3tl/inc/unit_conversion";
export { ScGlobal } from "../source/core/data/global";
/** Original cell variant discriminator; declaration order defines native values zero through four. */
export enum CellType {
  CELLTYPE_NONE = 0,
  CELLTYPE_VALUE = 1,
  CELLTYPE_STRING = 2,
  CELLTYPE_FORMULA = 3,
  CELLTYPE_EDIT = 4,
}
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

/** Original object output modes on a page, from global.hxx. */
export enum ScVObjMode {
  VOBJ_MODE_SHOW = 0,
  VOBJ_MODE_HIDE = 1,
}

/** Original input states from global.hxx;TYPE accepts text while TABLE/TOP own caret navigation. */
export enum ScInputMode {
  SC_INPUT_NONE = 0,
  SC_INPUT_TYPE = 1,
  SC_INPUT_TABLE = 2,
  SC_INPUT_TOP = 3,
}

/** Consumed native attribute-copy flags; content/object flag operations remain separate. */
export enum InsertDeleteFlags {
  NONE = 0x0000,
  STRING = 0x0004,
  EDITATTR = 0x0100,
  NOCAPTIONS = 0x8000,
  HARDATTR = 0x0020,
  STYLES = 0x0040,
  ATTRIB = 0x0060,
}

/** Original standard row-height correction in twips. */
export const STD_ROWHEIGHT_DIFF = 23;

/** Original integer macro-recording helper; even HMM rounding precedes UInt16 item narrowing. @param twips - Integral twips. @returns Even hundredths of a millimetre. */
export function TwipsToEvenHMM(twips: number): number {
  return Number(convert(BigInt(twips), 127n, 144n) * 2n);
}
/** Original64pt standard column width in twips. */
export const STD_COL_WIDTH = 1280;
/** Original1m maximum column width rounded to integral twips. */
export const MAX_COL_WIDTH = 56693;
/** Original direct/optimal/show/visible-optimal/original size mode identities. */
export enum ScSizeMode {
  SC_SIZE_DIRECT = 0,
  SC_SIZE_OPTIMAL = 1,
  SC_SIZE_SHOW = 2,
  SC_SIZE_VISOPT = 3,
  SC_SIZE_ORIGINAL = 4,
}

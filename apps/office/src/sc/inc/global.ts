/** @fileoverview Original cell types, reference modes, row/column flags and ScGlobal boundary from pinned sc/inc/global.hxx. */
import { convert, Length } from "../../o3tl/inc/unit_conversion";
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

/** Original formula/note clone flags from global.hxx. Only Default is consumed by this copy profile. */
export enum ScCloneFlags {
  Default = 0x0000,
  StartListening = 0x0001,
  NoMakeAbsExternal = 0x0002,
  NamesToLocal = 0x0004,
  AdjustCrossSheetRefs = 0x0008,
}

/** Consumed native attribute-copy flags; content/object flag operations remain separate. */
export enum InsertDeleteFlags {
  NONE = 0x0000,
  VALUE = 0x0001,
  DATETIME = 0x0002,
  STRING = 0x0004,
  NOTE = 0x0008,
  FORMULA = 0x0010,
  HARDATTR = 0x0020,
  STYLES = 0x0040,
  OBJECTS = 0x0080,
  EDITATTR = 0x0100,
  ADDNOTES = 0x0400,
  OUTLINE = 0x0800,
  SPECIAL_BOOLEAN = 0x1000,
  FORGETCAPTIONS = 0x2000,
  SPARKLINES = 0x4000,
  NOCAPTIONS = 0x8000,
  ATTRIB = 0x0060,
  CONTENTS = 0x481f,
  ALL = 0x49ff,
  AUTOFILL = 0x4977,
}

/** Original standard row-height correction in twips. */
export const STD_ROWHEIGHT_DIFF = 23;

/** Original integer macro-recording helper; even HMM rounding precedes UInt16 item narrowing. @param twips - Integral twips. @returns Even hundredths of a millimetre. */
export function TwipsToEvenHMM(twips: number): number {
  return Number(convert(BigInt(twips), 127n, 144n) * 2n);
}
/** Original64pt standard column width in twips. */
export const STD_COL_WIDTH = 1280;
/** Original extra width for optimal columns, two millimetres converted to integral twips. */
export const STD_EXTRA_WIDTH = Number(convert(2n, Length.mm, Length.twip));
/** Original1m maximum column width rounded to integral twips. */
export const MAX_COL_WIDTH = 56693;
/** Original maximum row height in twips. */
export const MAX_ROW_HEIGHT = 56693;
/** Original direct/optimal/show/visible-optimal/original size mode identities. */
export enum ScSizeMode {
  SC_SIZE_DIRECT = 0,
  SC_SIZE_OPTIMAL = 1,
  SC_SIZE_SHOW = 2,
  SC_SIZE_VISOPT = 3,
  SC_SIZE_ORIGINAL = 4,
}

/** Original indentation step in twips. */
export const SC_INDENT_STEP = 200;

/** Original aggregate/subtotal row and error flags;ordinary iterator consumers use NONE. */
export enum SubtotalFlags {
  NONE = 0x00,
  IgnoreNestedStAg = 0x08,
  IgnoreErrVal = 0x04,
  IgnoreHidden = 0x02,
  IgnoreFiltered = 0x01,
}

/** Original directional order from global.hxx used by native outer-function reference traversal. */
export enum ScDirection {
  DIR_BOTTOM,
  DIR_RIGHT,
  DIR_TOP,
  DIR_LEFT,
}

/** Original attribute query mask values from global.hxx. */
export enum HasAttrFlags {
  NONE = 0x0000,
  Lines = 0x0001,
  Merged = 0x0002,
  Overlapped = 0x0004,
  Protected = 0x0008,
  Shadow = 0x0010,
  NeedHeight = 0x0020,
  ShadowRight = 0x0040,
  ShadowDown = 0x0080,
  AutoFilter = 0x0100,
  Conditional = 0x0200,
  Rotate = 0x0400,
  NotOverlapped = 0x0800,
  RightOrCenter = 0x1000,
}

/** Original global.hxx paste arithmetic discriminator. */
export enum ScPasteFunc {
  NONE,
  ADD,
  SUB,
  MUL,
  DIV,
}
/** Original global.hxx insertion modes,including INS_NONE4. */
export enum InsCellCmd {
  INS_CELLSDOWN,
  INS_CELLSRIGHT,
  INS_INSROWS_BEFORE,
  INS_INSCOLS_BEFORE,
  INS_NONE,
  INS_INSROWS_AFTER,
  INS_INSCOLS_AFTER,
}

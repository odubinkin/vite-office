/** @fileoverview Original cell types, reference modes, row/column flags and ScGlobal boundary from pinned sc/inc/global.hxx. */
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

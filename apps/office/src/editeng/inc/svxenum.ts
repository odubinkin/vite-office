/** @fileoverview Declares the currently represented native numbering types from pinned include/editeng/svxenum.hxx and NumberingType.idl. */
/** Native sal_Int16 numbering identifiers; other numbering families remain unimplemented. */
export enum SvxNumType {
  SVX_NUM_ARABIC = 4,
  SVX_NUM_NUMBER_NONE = 5,
  SVX_NUM_CHAR_SPECIAL = 6,
  SVX_NUM_BITMAP = 8,
}

/** Original fixed-int cell alignment enum. */
export enum SvxCellHorJustify {
  Standard = 0,
  Left = 1,
  Center = 2,
  Right = 3,
  Block = 4,
  Repeat = 5,
}

/** Original fixed-int cell alignment enum. */
export enum SvxCellVerJustify {
  Standard = 0,
  Top = 1,
  Center = 2,
  Bottom = 3,
  Block = 4,
}

/** Original fixed-int cell alignment enum. */
export enum SvxCellJustifyMethod {
  Auto = 0,
  Distribute = 1,
}

/** Original fixed-int cell orientation values. */
export enum SvxCellOrientation {
  Standard = 0,
  TopBottom = 1,
  BottomUp = 2,
  Stacked = 3,
}

/** Original native shadow positions, including its End sentinel. */
export enum SvxShadowLocation {
  NONE,
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
  End,
}

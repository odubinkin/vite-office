/** @fileoverview Declares the currently represented native numbering types from pinned include/editeng/svxenum.hxx and NumberingType.idl. */
/** Native sal_Int16 numbering identifiers; other numbering families remain unimplemented. */
export enum SvxNumType {
  SVX_NUM_ARABIC = 4,
  SVX_NUM_NUMBER_NONE = 5,
  SVX_NUM_CHAR_SPECIAL = 6,
  SVX_NUM_BITMAP = 8,
}

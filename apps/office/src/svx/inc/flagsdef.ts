/** @fileoverview Original TabulatorDisableFlags from flagsdef.hxx; mask tests retain native any-bit semantics. */
/** Original individual radio bits and group masks. */
export enum TabulatorDisableFlags {
  TypeLeft = 0x0001,
  TypeRight = 0x0002,
  TypeCenter = 0x0004,
  TypeDecimal = 0x0008,
  TypeMask = 0x000f,
  FillNone = 0x0010,
  FillPoint = 0x0020,
  FillDashLine = 0x0040,
  FillSolidLine = 0x0080,
  FillSpecial = 0x0100,
  FillMask = 0x01f0,
}

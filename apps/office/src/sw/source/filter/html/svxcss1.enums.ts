/** @fileoverview Original CSS1 header enums from svxcss1.hxx; declaration-only ownership has no parser initialization dependency. */
/** Original CSS script flags. */
export enum Css1ScriptFlags {
  Western = 1,
  CJK = 2,
  CTL = 4,
  AllMask = 7,
}
/** Original SvxCSS1PageBreak values, independent of the eventual Writer break item. */
export enum SvxCSS1PageBreak {
  NONE = 0,
  AUTO = 1,
  ALWAYS = 2,
  AVOID = 3,
  LEFT = 4,
  RIGHT = 5,
}

/** Original CSS1 length family, including distinct automatic margins used by native table construction. */
export enum SvxCSS1LengthType {
  SVX_CSS1_LTYPE_NONE = 0,
  SVX_CSS1_LTYPE_AUTO = 1,
  SVX_CSS1_LTYPE_TWIP = 2,
  SVX_CSS1_LTYPE_PERCENTAGE = 3,
}

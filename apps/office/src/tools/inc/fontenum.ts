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

/** Original unscoped italic enum and native size sentinel. */
export enum FontItalic {
  ITALIC_NONE = 0,
  ITALIC_OBLIQUE = 1,
  ITALIC_NORMAL = 2,
  ITALIC_DONTKNOW = 3,
  FontItalic_FORCE_EQUAL_SIZE = 2147483647,
}

/** Original unscoped weight enum and native size sentinel. */
export enum FontWeight {
  WEIGHT_DONTKNOW = 0,
  WEIGHT_THIN = 1,
  WEIGHT_ULTRALIGHT = 2,
  WEIGHT_LIGHT = 3,
  WEIGHT_SEMILIGHT = 4,
  WEIGHT_NORMAL = 5,
  WEIGHT_MEDIUM = 6,
  WEIGHT_SEMIBOLD = 7,
  WEIGHT_BOLD = 8,
  WEIGHT_ULTRABOLD = 9,
  WEIGHT_BLACK = 10,
  FontWeight_FORCE_EQUAL_SIZE = 2147483647,
}

/** Original family enumerators from fontenum.hxx, including its native enum-size sentinel. */
export enum FontFamily {
  FAMILY_DONTKNOW,
  FAMILY_DECORATIVE,
  FAMILY_MODERN,
  FAMILY_ROMAN,
  FAMILY_SCRIPT,
  FAMILY_SWISS,
  FAMILY_SYSTEM,
  FontFamily_FORCE_EQUAL_SIZE = 2147483647,
}
/** Original pitch enumerators and native enum-size sentinel. */
export enum FontPitch {
  PITCH_DONTKNOW,
  PITCH_FIXED,
  PITCH_VARIABLE,
  FontPitch_FORCE_EQUAL_SIZE = 2147483647,
}

/** Original underline/overline style enumerators and native enum-size sentinel. */
export enum FontLineStyle {
  LINESTYLE_NONE,
  LINESTYLE_SINGLE,
  LINESTYLE_DOUBLE,
  LINESTYLE_DOTTED,
  LINESTYLE_DONTKNOW,
  LINESTYLE_DASH,
  LINESTYLE_LONGDASH,
  LINESTYLE_DASHDOT,
  LINESTYLE_DASHDOTDOT,
  LINESTYLE_SMALLWAVE,
  LINESTYLE_WAVE,
  LINESTYLE_DOUBLEWAVE,
  LINESTYLE_BOLD,
  LINESTYLE_BOLDDOTTED,
  LINESTYLE_BOLDDASH,
  LINESTYLE_BOLDLONGDASH,
  LINESTYLE_BOLDDASHDOT,
  LINESTYLE_BOLDDASHDOTDOT,
  LINESTYLE_BOLDWAVE,
  FontLineStyle_FORCE_EQUAL_SIZE = 2147483647,
}

/** Original text alignment enum and size sentinel from fontenum.hxx. */
export enum TextAlign {
  ALIGN_TOP,
  ALIGN_BASELINE,
  ALIGN_BOTTOM,
  TextAlign_FORCE_EQUAL_SIZE = 2147483647,
}

/** Original width classification and native enum-size sentinel. */
export enum FontWidth {
  WIDTH_DONTKNOW,
  WIDTH_ULTRA_CONDENSED,
  WIDTH_EXTRA_CONDENSED,
  WIDTH_CONDENSED,
  WIDTH_SEMI_CONDENSED,
  WIDTH_NORMAL,
  WIDTH_SEMI_EXPANDED,
  WIDTH_EXPANDED,
  WIDTH_EXTRA_EXPANDED,
  WIDTH_ULTRA_EXPANDED,
  FontWidth_FORCE_EQUAL_SIZE = 2147483647,
}

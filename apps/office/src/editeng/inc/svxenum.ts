/** @fileoverview Declares represented native formatting enums from pinned include/editeng/svxenum.hxx and NumberingType.idl. */
import * as NumberingType from "../../offapi/com/sun/star/style/NumberingType";
/* eslint-disable @typescript-eslint/prefer-literal-enum-member -- Original SvxNumType aliases the shared IDL constants, avoiding duplicated literal definitions. */
/** All original SvxNumType aliases retain declared sal_Int16 values; formatting/service support is separate. */
export enum SvxNumType {
  SVX_NUM_CHARS_UPPER_LETTER = NumberingType.CHARS_UPPER_LETTER,
  SVX_NUM_CHARS_LOWER_LETTER = NumberingType.CHARS_LOWER_LETTER,
  SVX_NUM_ROMAN_UPPER = NumberingType.ROMAN_UPPER,
  SVX_NUM_ROMAN_LOWER = NumberingType.ROMAN_LOWER,
  SVX_NUM_ARABIC = NumberingType.ARABIC,
  SVX_NUM_NUMBER_NONE = NumberingType.NUMBER_NONE,
  SVX_NUM_CHAR_SPECIAL = NumberingType.CHAR_SPECIAL,
  SVX_NUM_PAGEDESC = NumberingType.PAGE_DESCRIPTOR,
  SVX_NUM_BITMAP = NumberingType.BITMAP,
  SVX_NUM_CHARS_UPPER_LETTER_N = NumberingType.CHARS_UPPER_LETTER_N,
  SVX_NUM_CHARS_LOWER_LETTER_N = NumberingType.CHARS_LOWER_LETTER_N,
  SVX_NUM_TRANSLITERATION = NumberingType.TRANSLITERATION,
  SVX_NUM_NATIVE_NUMBERING = NumberingType.NATIVE_NUMBERING,
  SVX_NUM_FULL_WIDTH_ARABIC = NumberingType.FULLWIDTH_ARABIC,
  SVX_NUM_CIRCLE_NUMBER = NumberingType.CIRCLE_NUMBER,
  SVX_NUM_NUMBER_LOWER_ZH = NumberingType.NUMBER_LOWER_ZH,
  SVX_NUM_NUMBER_UPPER_ZH = NumberingType.NUMBER_UPPER_ZH,
  SVX_NUM_NUMBER_UPPER_ZH_TW = NumberingType.NUMBER_UPPER_ZH_TW,
  SVX_NUM_TIAN_GAN_ZH = NumberingType.TIAN_GAN_ZH,
  SVX_NUM_DI_ZI_ZH = NumberingType.DI_ZI_ZH,
  SVX_NUM_NUMBER_TRADITIONAL_JA = NumberingType.NUMBER_TRADITIONAL_JA,
  SVX_NUM_AIU_FULLWIDTH_JA = NumberingType.AIU_FULLWIDTH_JA,
  SVX_NUM_AIU_HALFWIDTH_JA = NumberingType.AIU_HALFWIDTH_JA,
  SVX_NUM_IROHA_FULLWIDTH_JA = NumberingType.IROHA_FULLWIDTH_JA,
  SVX_NUM_IROHA_HALFWIDTH_JA = NumberingType.IROHA_HALFWIDTH_JA,
  SVX_NUM_NUMBER_UPPER_KO = NumberingType.NUMBER_UPPER_KO,
  SVX_NUM_NUMBER_HANGUL_KO = NumberingType.NUMBER_HANGUL_KO,
  SVX_NUM_HANGUL_JAMO_KO = NumberingType.HANGUL_JAMO_KO,
  SVX_NUM_HANGUL_SYLLABLE_KO = NumberingType.HANGUL_SYLLABLE_KO,
  SVX_NUM_HANGUL_CIRCLED_JAMO_KO = NumberingType.HANGUL_CIRCLED_JAMO_KO,
  SVX_NUM_HANGUL_CIRCLED_SYLLABLE_KO = NumberingType.HANGUL_CIRCLED_SYLLABLE_KO,
  SVX_NUM_CHARS_ARABIC = NumberingType.CHARS_ARABIC,
  SVX_NUM_CHARS_THAI = NumberingType.CHARS_THAI,
  SVX_NUM_CHARS_HEBREW = NumberingType.CHARS_HEBREW,
  SVX_NUM_CHARS_NEPALI = NumberingType.CHARS_NEPALI,
  SVX_NUM_CHARS_KHMER = NumberingType.CHARS_KHMER,
  SVX_NUM_CHARS_LAO = NumberingType.CHARS_LAO,
  SVX_NUM_CHARS_TIBETAN = NumberingType.CHARS_TIBETAN,
  SVX_NUM_CHARS_CYRILLIC_UPPER_LETTER_BG = NumberingType.CHARS_CYRILLIC_UPPER_LETTER_BG,
  SVX_NUM_CHARS_CYRILLIC_LOWER_LETTER_BG = NumberingType.CHARS_CYRILLIC_LOWER_LETTER_BG,
  SVX_NUM_CHARS_CYRILLIC_UPPER_LETTER_N_BG = NumberingType.CHARS_CYRILLIC_UPPER_LETTER_N_BG,
  SVX_NUM_CHARS_CYRILLIC_LOWER_LETTER_N_BG = NumberingType.CHARS_CYRILLIC_LOWER_LETTER_N_BG,
  SVX_NUM_CHARS_CYRILLIC_UPPER_LETTER_RU = NumberingType.CHARS_CYRILLIC_UPPER_LETTER_RU,
  SVX_NUM_CHARS_CYRILLIC_LOWER_LETTER_RU = NumberingType.CHARS_CYRILLIC_LOWER_LETTER_RU,
  SVX_NUM_CHARS_CYRILLIC_UPPER_LETTER_N_RU = NumberingType.CHARS_CYRILLIC_UPPER_LETTER_N_RU,
  SVX_NUM_CHARS_CYRILLIC_LOWER_LETTER_N_RU = NumberingType.CHARS_CYRILLIC_LOWER_LETTER_N_RU,
  SVX_NUM_CHARS_PERSIAN = NumberingType.CHARS_PERSIAN,
  SVX_NUM_CHARS_MYANMAR = NumberingType.CHARS_MYANMAR,
  SVX_NUM_CHARS_CYRILLIC_UPPER_LETTER_SR = NumberingType.CHARS_CYRILLIC_UPPER_LETTER_SR,
  SVX_NUM_CHARS_CYRILLIC_LOWER_LETTER_SR = NumberingType.CHARS_CYRILLIC_LOWER_LETTER_SR,
  SVX_NUM_CHARS_CYRILLIC_UPPER_LETTER_N_SR = NumberingType.CHARS_CYRILLIC_UPPER_LETTER_N_SR,
  SVX_NUM_CHARS_CYRILLIC_LOWER_LETTER_N_SR = NumberingType.CHARS_CYRILLIC_LOWER_LETTER_N_SR,
  SVX_NUM_CHARS_GREEK_UPPER_LETTER = NumberingType.CHARS_GREEK_UPPER_LETTER,
  SVX_NUM_CHARS_GREEK_LOWER_LETTER = NumberingType.CHARS_GREEK_LOWER_LETTER,
  SVX_NUM_CHARS_ARABIC_ABJAD = NumberingType.CHARS_ARABIC_ABJAD,
  SVX_NUM_CHARS_PERSIAN_WORD = NumberingType.CHARS_PERSIAN_WORD,
  SVX_NUM_NUMBER_HEBREW = NumberingType.NUMBER_HEBREW,
  SVX_NUM_NUMBER_ARABIC_INDIC = NumberingType.NUMBER_ARABIC_INDIC,
  SVX_NUM_NUMBER_EAST_ARABIC_INDIC = NumberingType.NUMBER_EAST_ARABIC_INDIC,
  SVX_NUM_NUMBER_INDIC_DEVANAGARI = NumberingType.NUMBER_INDIC_DEVANAGARI,
  SVX_NUM_TEXT_NUMBER = NumberingType.TEXT_NUMBER,
  SVX_NUM_TEXT_CARDINAL = NumberingType.TEXT_CARDINAL,
  SVX_NUM_TEXT_ORDINAL = NumberingType.TEXT_ORDINAL,
  SVX_NUM_SYMBOL_CHICAGO = NumberingType.SYMBOL_CHICAGO,
  SVX_NUM_ARABIC_ZERO = NumberingType.ARABIC_ZERO,
  SVX_NUM_ARABIC_ZERO3 = NumberingType.ARABIC_ZERO3,
  SVX_NUM_ARABIC_ZERO4 = NumberingType.ARABIC_ZERO4,
  SVX_NUM_ARABIC_ZERO5 = NumberingType.ARABIC_ZERO5,
  SVX_NUM_SZEKELY_ROVAS = NumberingType.SZEKELY_ROVAS,
  SVX_NUM_CHARS_CYRILLIC_UPPER_LETTER_UK = NumberingType.CHARS_CYRILLIC_UPPER_LETTER_UK,
  SVX_NUM_CHARS_CYRILLIC_LOWER_LETTER_UK = NumberingType.CHARS_CYRILLIC_LOWER_LETTER_UK,
  SVX_NUM_CHARS_CYRILLIC_UPPER_LETTER_N_UK = NumberingType.CHARS_CYRILLIC_UPPER_LETTER_N_UK,
  SVX_NUM_CHARS_CYRILLIC_LOWER_LETTER_N_UK = NumberingType.CHARS_CYRILLIC_LOWER_LETTER_N_UK,
}
/* eslint-enable @typescript-eslint/prefer-literal-enum-member */

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

/** Original writing-position modes, including the declaration-end marker. */
export enum SvxEscapement {
  Off,
  Superscript,
  Subscript,
  End,
}

/** Original case-related formatting modes and declaration-end marker. */
export enum SvxCaseMap {
  NotMapped,
  Uppercase,
  Lowercase,
  Capitalize,
  SmallCaps,
  End,
}

/** Original paragraph absolute height rule. */
export enum SvxLineSpaceRule {
  Auto,
  Fix,
  Min,
}
/** Original additional line spacing rule. */
export enum SvxInterLineSpaceRule {
  Off,
  Prop,
  Fix,
}

/** @fileoverview Original MinusSign Unicode-unit translator and concrete ignore module. */
import { transliteration_Ignore } from "./transliteration_Ignore";
/** Original translator. @param unit - Native sal_Unicode. @returns Mapped unit or skip marker. */
function ignoreMinusSign_ja_JP_translator(unit: number): number {
  switch (unit) {
    case 0x2212: // MINUS SIGN
    case 0x002d: // HYPHEN-MINUS
    case 0x2010: // HYPHEN
    case 0x2011: // NON-BREAKING HYPHEN
    case 0x2012: // FIGURE DASH
    case 0x2013: // EN DASH
    case 0x2014: // EM DASH
    case 0x2015: // HORIZONTAL BAR
    case 0xff0d: // FULLWIDTH HYPHEN-MINUS
    case 0xff70: // HALFWIDTH KATAKANA-HIRAGANA PROLONGED SOUND MARK
      return 0x30fc; // KATAKANA-HIRAGANA PROLONGED SOUND MARK
  }
  return unit;
}
/** Original initialized function-only module. */
export class ignoreMinusSign_ja_JP extends transliteration_Ignore {
  /** Original pointer fields and service names. @returns Module. */
  constructor() {
    super();
    this.func = ignoreMinusSign_ja_JP_translator;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreMinusSign_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreMinusSign_ja_JP";
  }
}

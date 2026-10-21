/** @fileoverview Original MiddleDot Unicode-unit translator and concrete ignore module. */
import { transliteration_Ignore } from "./transliteration_Ignore";
/** Original translator. @param unit - Native sal_Unicode. @returns Mapped unit or skip marker. */
function ignoreMiddleDot_ja_JP_translator(unit: number): number {
  switch (unit) {
    case 0x30fb: // KATAKANA MIDDLE DOT
    case 0xff65: // HALFWIDTH KATAKANA MIDDLE DOT
      // no break;
      return 0xffff; // Skip this character
  }
  return unit;
}
/** Original initialized function-only module. */
export class ignoreMiddleDot_ja_JP extends transliteration_Ignore {
  /** Original pointer fields and service names. @returns Module. */
  constructor() {
    super();
    this.func = ignoreMiddleDot_ja_JP_translator;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreMiddleDot_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreMiddleDot_ja_JP";
  }
}

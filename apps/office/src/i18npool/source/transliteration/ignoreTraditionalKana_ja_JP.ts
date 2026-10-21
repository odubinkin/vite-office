/** @fileoverview Original traditional Kana four-case translator and ignore module. */
import { transliteration_Ignore } from "./transliteration_Ignore";
/** Original historical WI/WE mapping. @param unit - Native Unicode unit. @returns Modern unit or identity. */
function ignoreTraditionalKana_ja_JP_translator(unit: number): number {
  switch (unit) {
    case 0x3090: // HIRAGANA LETTER WI
      return 0x3044; // HIRAGANA LETTER I

    case 0x3091: // HIRAGANA LETTER WE
      return 0x3048; // HIRAGANA LETTER E

    case 0x30f0: // KATAKANA LETTER WI
      return 0x30a4; // KATAKANA LETTER I

    case 0x30f1: // KATAKANA LETTER WE
      return 0x30a8; // KATAKANA LETTER E
  }
  return unit;
}
/** Original function-only ignore module. */
export class ignoreTraditionalKana_ja_JP extends transliteration_Ignore {
  /** Original function and names. @returns Module. */
  constructor() {
    super();
    this.func = ignoreTraditionalKana_ja_JP_translator;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreTraditionalKana_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreTraditionalKana_ja_JP";
  }
}

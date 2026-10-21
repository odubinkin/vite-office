/** @fileoverview Original ZiZu Unicode-unit translator and concrete ignore module. */
import { transliteration_Ignore } from "./transliteration_Ignore";
/** Original translator. @param unit - Native sal_Unicode. @returns Mapped unit or skip marker. */
function ignoreZiZu_ja_JP_translator(unit: number): number {
  switch (unit) {
    case 0x30c2: // KATAKANA LETTER DI
      return 0x30b8; // KATAKANA LETTER ZI

    case 0x3062: // HIRAGANA LETTER DI
      return 0x3058; // HIRAGANA LETTER ZI

    case 0x30c5: // KATAKANA LETTER DU
      return 0x30ba; // KATAKANA LETTER ZU

    case 0x3065: // HIRAGANA LETTER DU
      return 0x305a; // HIRAGANA LETTER ZU
  }
  return unit;
}
/** Original initialized function-only module. */
export class ignoreZiZu_ja_JP extends transliteration_Ignore {
  /** Original pointer fields and service names. @returns Module. */
  constructor() {
    super();
    this.func = ignoreZiZu_ja_JP_translator;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreZiZu_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreZiZu_ja_JP";
  }
}

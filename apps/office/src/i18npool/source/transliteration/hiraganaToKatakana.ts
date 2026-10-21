/** @fileoverview Original hiraganaToKatakana scalar translator and one-to-one module. */
import { transliteration_OneToOne } from "./transliteration_OneToOne";
/** Original complete kana intervals. @param unit - Native Unicode unit. @returns Mapped unit or identity. */
function toKatakana(unit: number): number {
  if ((12353 <= unit && unit <= 12438) || (12445 <= unit && unit <= 12447)) return unit + 96;
  return unit;
}
/** Original initialized directional kana module. */
export class hiraganaToKatakana extends transliteration_OneToOne {
  /** Original function/table pointers and names. @returns Module. */
  constructor() {
    super();
    this.func = toKatakana;
    this.table = null;
    this.transliterationName = "hiraganaToKatakana";
    this.implementationName = "com.sun.star.i18n.Transliteration.HIRAGANA_KATAKANA";
  }
}

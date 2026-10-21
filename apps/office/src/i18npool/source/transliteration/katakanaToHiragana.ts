/** @fileoverview Original katakanaToHiragana scalar translator and one-to-one module. */
import { transliteration_OneToOne } from "./transliteration_OneToOne";
/** Original complete kana intervals. @param unit - Native Unicode unit. @returns Mapped unit or identity. */
function toHiragana(unit: number): number {
  if ((12449 <= unit && unit <= 12534) || (12541 <= unit && unit <= 12543)) return unit + -96;
  return unit;
}
/** Original initialized directional kana module. */
export class katakanaToHiragana extends transliteration_OneToOne {
  /** Original function/table pointers and names. @returns Module. */
  constructor() {
    super();
    this.func = toHiragana;
    this.table = null;
    this.transliterationName = "katakanaToHiragana";
    this.implementationName = "com.sun.star.i18n.Transliteration.KATAKANA_HIRAGANA";
  }
}

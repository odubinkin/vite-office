/** @fileoverview Original Kashida deletion translator and native concrete ignore module. */
import { transliteration_Ignore } from "./transliteration_Ignore";
/** Original translator returns the ignore-loop skip sentinel. @param unit - Unicode unit. @returns Mapped unit or0xffff. */
function ignoreKashida_CTL_translator(unit: number): number {
  return unit === 0x0640 ? 0xffff : unit;
}
/** Original initialized function-only module. */
export class ignoreKashida_CTL extends transliteration_Ignore {
  /** Original pointer fields and names. @returns Module. */
  constructor() {
    super();
    this.func = ignoreKashida_CTL_translator;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreKashida_CTL";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreKashida_CTL";
  }
}

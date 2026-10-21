/** @fileoverview Original BaFa pair mapping table and concrete ignore module. */
import { transliteration_Ignore, type Mapping } from "./transliteration_Ignore";
const BaFa: readonly Mapping[] = [
  { previousChar: 12532, currentChar: 12449, replaceChar: 12496, two2one: true },
  { previousChar: 12436, currentChar: 12353, replaceChar: 12400, two2one: true },
  { previousChar: 12501, currentChar: 12449, replaceChar: 12495, two2one: true },
  { previousChar: 12405, currentChar: 12353, replaceChar: 12399, two2one: true },
  { previousChar: 0, currentChar: 0, replaceChar: 0, two2one: true },
];
/** Original initialized pair-only module. */
export class ignoreBaFa_ja_JP extends transliteration_Ignore {
  /** Original pointer fields and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = null;
    this.map = BaFa;
    this.transliterationName = "ignoreBaFa_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreBaFa_ja_JP";
  }
}

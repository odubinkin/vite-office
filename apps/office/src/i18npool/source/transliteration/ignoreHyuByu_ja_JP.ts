/** @fileoverview Original HyuByu pair mapping table and concrete ignore module. */
import { transliteration_Ignore, type Mapping } from "./transliteration_Ignore";
const HyuByu: readonly Mapping[] = [
  { previousChar: 12501, currentChar: 12517, replaceChar: 12498, two2one: false },
  { previousChar: 12405, currentChar: 12421, replaceChar: 12402, two2one: false },
  { previousChar: 12532, currentChar: 12517, replaceChar: 12499, two2one: false },
  { previousChar: 12436, currentChar: 12421, replaceChar: 12403, two2one: false },
  { previousChar: 0, currentChar: 0, replaceChar: 0, two2one: false },
];
/** Original initialized pair-only module. */
export class ignoreHyuByu_ja_JP extends transliteration_Ignore {
  /** Original pointer fields and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = null;
    this.map = HyuByu;
    this.transliterationName = "ignoreHyuByu_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreHyuByu_ja_JP";
  }
}

/** @fileoverview Original TiJi pair table and concrete ignore module. */
import { transliteration_Ignore, type Mapping } from "./transliteration_Ignore";
const TiJi: readonly Mapping[] = [
  { previousChar: 0x30c4, currentChar: 0x30a3, replaceChar: 0x30c1, two2one: true },
  { previousChar: 0x30c6, currentChar: 0x30a3, replaceChar: 0x30c1, two2one: true },
  { previousChar: 0x3064, currentChar: 0x3043, replaceChar: 0x3061, two2one: true },
  { previousChar: 0x3066, currentChar: 0x3043, replaceChar: 0x3061, two2one: true },
  { previousChar: 0x30c7, currentChar: 0x30a3, replaceChar: 0x30b8, two2one: true },
  { previousChar: 0x3067, currentChar: 0x3043, replaceChar: 0x3058, two2one: true },
  { previousChar: 0, currentChar: 0, replaceChar: 0, two2one: true },
];
/** Original initialized pair-only module. */
export class ignoreTiJi_ja_JP extends transliteration_Ignore {
  /** Original pointer fields and service names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = null;
    this.map = TiJi;
    this.transliterationName = "ignoreTiJi_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreTiJi_ja_JP";
  }
}

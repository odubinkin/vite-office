/** @fileoverview Original SeZe pair table and concrete ignore module. */
import { transliteration_Ignore, type Mapping } from "./transliteration_Ignore";
const SeZe: readonly Mapping[] = [
  { previousChar: 0x30b7, currentChar: 0x30a7, replaceChar: 0x30bb, two2one: true },
  { previousChar: 0x3057, currentChar: 0x3047, replaceChar: 0x305b, two2one: true },
  { previousChar: 0x30b8, currentChar: 0x30a7, replaceChar: 0x30bc, two2one: true },
  { previousChar: 0x3058, currentChar: 0x3047, replaceChar: 0x305c, two2one: true },
  { previousChar: 0, currentChar: 0, replaceChar: 0, two2one: true },
];
/** Original initialized pair-only module. */
export class ignoreSeZe_ja_JP extends transliteration_Ignore {
  /** Original pointer fields and service names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = null;
    this.map = SeZe;
    this.transliterationName = "ignoreSeZe_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreSeZe_ja_JP";
  }
}

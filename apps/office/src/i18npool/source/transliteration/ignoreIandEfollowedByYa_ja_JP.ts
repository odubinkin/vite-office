/** @fileoverview Original ignoreIandEfollowedByYa_ja_JP tables,context loop and identity source offsets. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { asNonConstRange, type Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { oneToOneMapping } from "../../../i18nutil/inc/oneToOneMapping";
import { transliteration_Ignore } from "./transliteration_Ignore";
const IandE = [
  { first: 0x30a3, second: 0x0000 },
  { first: 0x30a4, second: 0x0000 },
  { first: 0x30a7, second: 0x0000 },
  { first: 0x30a8, second: 0x0000 },
  { first: 0x30ad, second: 0x0000 },
  { first: 0x30ae, second: 0x0000 },
  { first: 0x30b1, second: 0x0000 },
  { first: 0x30b2, second: 0x0000 },
  { first: 0x30b7, second: 0x0000 },
  { first: 0x30b8, second: 0x0000 },
  { first: 0x30bb, second: 0x0000 },
  { first: 0x30bc, second: 0x0000 },
  { first: 0x30c1, second: 0x0000 },
  { first: 0x30c2, second: 0x0000 },
  { first: 0x30c6, second: 0x0000 },
  { first: 0x30c7, second: 0x0000 },
  { first: 0x30cb, second: 0x0000 },
  { first: 0x30cd, second: 0x0000 },
  { first: 0x30d2, second: 0x0000 },
  { first: 0x30d3, second: 0x0000 },
  { first: 0x30d4, second: 0x0000 },
  { first: 0x30d8, second: 0x0000 },
  { first: 0x30d9, second: 0x0000 },
  { first: 0x30da, second: 0x0000 },
  { first: 0x30df, second: 0x0000 },
  { first: 0x30e1, second: 0x0000 },
  { first: 0x30ea, second: 0x0000 },
  { first: 0x30ec, second: 0x0000 },
  { first: 0x30f0, second: 0x0000 },
  { first: 0x30f1, second: 0x0000 },
  { first: 0x30f6, second: 0x0000 },
  { first: 0x30f8, second: 0x0000 },
  { first: 0x30f9, second: 0x0000 },
];
/** Original contextual ignore module;constructor fields follow the header macro. */
export class ignoreIandEfollowedByYa_ja_JP extends transliteration_Ignore {
  /** Original null fields and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreIandEfollowedByYa_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreIandEfollowedByYa_ja_JP";
  }
  /** Original previous/current loop over the requested UTF16 fragment. @param input - Native source. @param start - Unit start. @param count - Unit count. @param offset - Optional actual output sequence. @returns Owned folded value. */
  public override foldingImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const table = new oneToOneMapping(IandE, IandE.length * 4);
    const output = new Uint16Array(count),
      source = input.getStr();
    let read = start,
      written = 0;
    if (offset !== null) {
      offset.realloc(count);
      const range = asNonConstRange(offset);
      for (let i = 0; i < count; i++) range.operatorIndex(i, 4)[0] = start + i;
    }
    let previous = source[read++] as number;
    while (--count > 0) {
      const current = source[read++] as number;
      if (current === 0x30e3 || current === 0x30e4) {
        if (table.get(previous) !== previous) {
          output[written++] = previous;
          output[written++] = 0x30a2;
          previous = source[read++] as number;
          count--;
          continue;
        }
      }
      output[written++] = previous;
      previous = current;
    }
    if (count === 0) output[written++] = previous;
    if (offset !== null) offset.realloc(written);
    return new OUString(output.subarray(0, written), written);
  }
}

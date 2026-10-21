/** @fileoverview Original ignoreKiKuFollowedBySa_ja_JP tables,context loop and identity source offsets. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { asNonConstRange, type Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { transliteration_Ignore } from "./transliteration_Ignore";
/** Original contextual ignore module;constructor fields follow the header macro. */
export class ignoreKiKuFollowedBySa_ja_JP extends transliteration_Ignore {
  /** Original null fields and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreKiKuFollowedBySa_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreKiKuFollowedBySa_ja_JP";
  }
  /** Original previous/current loop over the requested UTF16 fragment. @param input - Native source. @param start - Unit start. @param count - Unit count. @param offset - Optional actual output sequence. @returns Owned folded value. */
  public override foldingImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
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
      if (previous === 0x30af) {
        if (0x30b5 <= current && current <= 0x30be) {
          output[written++] = 0x30ad;
          output[written++] = current;
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

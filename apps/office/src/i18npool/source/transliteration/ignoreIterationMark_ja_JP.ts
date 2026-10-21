/** @fileoverview Original ignoreIterationMark_ja_JP tables,context loop and identity source offsets. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { asNonConstRange, type Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { oneToOneMapping } from "../../../i18nutil/inc/oneToOneMapping";
import { transliteration_Ignore } from "./transliteration_Ignore";
const ignoreIterationMark_ja_JP_mappingTable = [
  { first: 0x3046, second: 0x3094 },
  { first: 0x304b, second: 0x304c },
  { first: 0x304d, second: 0x304e },
  { first: 0x304f, second: 0x3050 },
  { first: 0x3051, second: 0x3052 },
  { first: 0x3053, second: 0x3054 },
  { first: 0x3055, second: 0x3056 },
  { first: 0x3057, second: 0x3058 },
  { first: 0x3059, second: 0x305a },
  { first: 0x305b, second: 0x305c },
  { first: 0x305d, second: 0x305e },
  { first: 0x305f, second: 0x3060 },
  { first: 0x3061, second: 0x3062 },
  { first: 0x3064, second: 0x3065 },
  { first: 0x3066, second: 0x3067 },
  { first: 0x3068, second: 0x3069 },
  { first: 0x306f, second: 0x3070 },
  { first: 0x3072, second: 0x3073 },
  { first: 0x3075, second: 0x3076 },
  { first: 0x3078, second: 0x3079 },
  { first: 0x307b, second: 0x307c },
  { first: 0x309d, second: 0x309e },
  { first: 0x30a6, second: 0x30f4 },
  { first: 0x30ab, second: 0x30ac },
  { first: 0x30ad, second: 0x30ae },
  { first: 0x30af, second: 0x30b0 },
  { first: 0x30b1, second: 0x30b2 },
  { first: 0x30b3, second: 0x30b4 },
  { first: 0x30b5, second: 0x30b6 },
  { first: 0x30b7, second: 0x30b8 },
  { first: 0x30b9, second: 0x30ba },
  { first: 0x30bb, second: 0x30bc },
  { first: 0x30bd, second: 0x30be },
  { first: 0x30bf, second: 0x30c0 },
  { first: 0x30c1, second: 0x30c2 },
  { first: 0x30c4, second: 0x30c5 },
  { first: 0x30c6, second: 0x30c7 },
  { first: 0x30c8, second: 0x30c9 },
  { first: 0x30cf, second: 0x30d0 },
  { first: 0x30d2, second: 0x30d3 },
  { first: 0x30d5, second: 0x30d6 },
  { first: 0x30d8, second: 0x30d9 },
  { first: 0x30db, second: 0x30dc },
  { first: 0x30ef, second: 0x30f7 },
  { first: 0x30f0, second: 0x30f8 },
  { first: 0x30f1, second: 0x30f9 },
  { first: 0x30f2, second: 0x30fa },
  { first: 0x30fd, second: 0x30fe },
];
/** Original contextual ignore module;constructor fields follow the header macro. */
export class ignoreIterationMark_ja_JP extends transliteration_Ignore {
  /** Original null fields and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreIterationMark_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreIterationMark_ja_JP";
  }
  /** Original previous/current loop over the requested UTF16 fragment. @param input - Native source. @param start - Unit start. @param count - Unit count. @param offset - Optional actual output sequence. @returns Owned folded value. */
  public override foldingImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const table = new oneToOneMapping(
      ignoreIterationMark_ja_JP_mappingTable,
      ignoreIterationMark_ja_JP_mappingTable.length * 4,
    );
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
      let current = source[read++] as number;
      switch (current) {
        case 0x30fd:
        case 0x309d:
        case 0x3005:
          current = previous;
          break;
        case 0x30fe:
        case 0x309e:
          current = table.get(previous);
          break;
      }
      output[written++] = previous;
      previous = current;
    }
    if (count === 0) output[written++] = previous;
    if (offset !== null) offset.realloc(written);
    return new OUString(output.subarray(0, written), written);
  }
}

/** @fileoverview Original width table owners and voiced-mark scalar/string composition/decomposition with actual UTF16 offset sequences. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Sequence, SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { WIDTHFOLDING_DONT_USE_COMBINED_VU } from "../../inc/widthfolding";
import { oneToOneMappingWithFlag } from "../../inc/oneToOneMapping";
import type { oneToOneMapping } from "../../inc/oneToOneMapping";
import {
  full2half,
  half2full,
  decomposition_table,
  composition_table,
  FULL2HALF_NORMAL,
  FULL2HALF_ASC_FUNCTION,
  FULL2HALF_KATAKANA_ONLY,
  HALF2FULL_NORMAL,
  HALF2FULL_JIS_FUNCTION,
  HALF2FULL_KATAKANA_ONLY,
} from "./widthfolding_data";
/** Source-defined independent function-local static owners; initialization occurs only when each original getter is called. */
const tables: (oneToOneMappingWithFlag | null)[] = Array(6).fill(null);
/** Original static widthfolding API; a readonly ESM record adapts the stateless C++ class. Original allocation syntax uses JavaScript typed arrays and existing native value boundaries. */
export const widthfolding = {
  /** Original Katakana-only voiced-mark decomposition,including repeated absolute offsets and mutable Sequence COW. @param input - Native source. @param start - UTF16 start. @param count - Unit count. @param offset - Optional output. @returns Owned decomposed value. */
  decompose_ja_voiced_sound_marks(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const output = new Uint16Array(count * 2),
      source = input.getStr();
    let read = start,
      written = 0,
      position = 0,
      offsetIndex = 0;
    let pointer: SequenceElements | null = null;
    if (offset !== null) {
      offset.realloc(count * 2);
      pointer = offset.getArray() as SequenceElements;
      position = start;
    }
    while (count-- > 0) {
      const unit = source[read++] as number;
      if (0x30a0 <= unit && unit <= 0x30ff) {
        const row = decomposition_table[unit - 0x3040] as {
          decomposited_character_1: number;
          decomposited_character_2: number;
        };
        if (row.decomposited_character_1 !== 0) {
          output[written++] = row.decomposited_character_1;
          output[written++] = row.decomposited_character_2;
          if (offset !== null) {
            ((pointer as SequenceElements).get(offsetIndex++ * 4) as [number])[0] = position;
            ((pointer as SequenceElements).get(offsetIndex++ * 4) as [number])[0] = position++;
          }
          continue;
        }
      }
      output[written++] = unit;
      if (offset !== null)
        ((pointer as SequenceElements).get(offsetIndex++ * 4) as [number])[0] = position++;
    }
    if (offset !== null) offset.realloc(written);
    return new OUString(output.subarray(0, written), written);
  },
  /** Original voiced/semi-voiced composition loop; a contracted output maps to the second unit and empty input only reallocates final offsets. @param input - Native source. @param start - UTF16 start. @param count - Unit count. @param offset - Optional output. @param flags - Original default zero and JIS VU behavior. @returns Owned composed value. */
  compose_ja_voiced_sound_marks(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
    flags = 0,
  ): OUString {
    const output = new Uint16Array(count),
      source = input.getStr();
    let read = start,
      written = 0;
    if (count > 0) {
      let position = 0,
        offsetIndex = 0;
      let pointer: SequenceElements | null = null;
      if (offset !== null) {
        offset.realloc(count);
        pointer = offset.getArray() as SequenceElements;
        position = start;
      }
      let previous = source[read++] as number;
      while (--count > 0) {
        const current = source[read++] as number;
        let j = current - 0x3099;
        if (2 <= j && j <= 3) j -= 2;
        if (0 <= j && j <= 1) {
          const i = previous - 0x3040;
          let compose = false;
          if (0 <= i && i <= 0x30ff - 0x3040 && (composition_table[i] as Uint16Array)[j])
            compose = true;
          if (previous === 0x30a6 && flags & WIDTHFOLDING_DONT_USE_COMBINED_VU) compose = false;
          if (compose) {
            if (offset !== null) {
              position++;
              ((pointer as SequenceElements).get(offsetIndex++ * 4) as [number])[0] = position++;
            }
            output[written++] = (composition_table[i] as Uint16Array)[j] as number;
            previous = source[read++] as number;
            count--;
            continue;
          }
        }
        if (offset !== null)
          ((pointer as SequenceElements).get(offsetIndex++ * 4) as [number])[0] = position++;
        output[written++] = previous;
        previous = current;
      }
      if (count === 0) {
        if (offset !== null)
          ((pointer as SequenceElements).get(offsetIndex * 4) as [number])[0] = position;
        output[written++] = previous;
      }
    }
    if (offset !== null) offset.realloc(written);
    return new OUString(output.subarray(0, written), written);
  },

  /** Original independent getfull2halfTable static and makeIndex call. @returns Shared original table owner. */
  getfull2halfTable(): oneToOneMapping {
    if (tables[0] === null)
      tables[0] = new oneToOneMappingWithFlag(full2half, full2half.length * 6, FULL2HALF_NORMAL);
    const table = tables[0] as oneToOneMappingWithFlag;
    table.makeIndex();
    return table;
  },
  /** Original independent gethalf2fullTable static and makeIndex call. @returns Shared original table owner. */
  gethalf2fullTable(): oneToOneMapping {
    if (tables[1] === null)
      tables[1] = new oneToOneMappingWithFlag(half2full, half2full.length * 6, HALF2FULL_NORMAL);
    const table = tables[1] as oneToOneMappingWithFlag;
    table.makeIndex();
    return table;
  },
  /** Original ASC getter owns a separate static flagged table. @returns Shared original table owner. */
  getfull2halfTableForASC(): oneToOneMapping {
    if (tables[2] === null)
      tables[2] = new oneToOneMappingWithFlag(
        full2half,
        full2half.length * 6,
        FULL2HALF_ASC_FUNCTION,
      );
    const table = tables[2] as oneToOneMappingWithFlag;
    table.makeIndex();
    return table;
  },
  /** Original JIS getter owns a separate static flagged table. @returns Shared original table owner. */
  gethalf2fullTableForJIS(): oneToOneMapping {
    if (tables[3] === null)
      tables[3] = new oneToOneMappingWithFlag(
        half2full,
        half2full.length * 6,
        HALF2FULL_JIS_FUNCTION,
      );
    const table = tables[3] as oneToOneMappingWithFlag;
    table.makeIndex();
    return table;
  },
  /** Original full-kana getter owns a separate static table. @returns Shared original table owner. */
  getfullKana2halfKanaTable(): oneToOneMapping {
    if (tables[4] === null)
      tables[4] = new oneToOneMappingWithFlag(
        full2half,
        full2half.length * 6,
        FULL2HALF_KATAKANA_ONLY,
      );
    const table = tables[4] as oneToOneMappingWithFlag;
    table.makeIndex();
    return table;
  },
  /** Original half-kana getter owns a separate static table. @returns Shared original table owner. */
  gethalfKana2fullKanaTable(): oneToOneMapping {
    if (tables[5] === null)
      tables[5] = new oneToOneMappingWithFlag(
        half2full,
        half2full.length * 6,
        HALF2FULL_KATAKANA_ONLY,
      );
    const table = tables[5] as oneToOneMappingWithFlag;
    table.makeIndex();
    return table;
  },
  /** Original scalar Katakana decomposition sentinel. @param inChar - Native sal_Unicode argument. @returns Original unit or0xffff marker. */
  decompose_ja_voiced_sound_marksChar2Char(inChar: number): number {
    const unit = inChar & 0xffff;
    if (0x30a0 <= unit && unit <= 0x30ff) {
      const i = unit - 0x3040;
      if ((decomposition_table[i] as { decomposited_character_1: number }).decomposited_character_1)
        return 0xffff;
    }
    return unit;
  },
  /** Original unguarded composition-table lookup; callers provide the original valid ranges. @param c1 - First native unit. @param c2 - Original combining mark. @returns Initialized composition unit. */
  getCompositionChar(c1: number, c2: number): number {
    return (composition_table[(c1 & 0xffff) - 0x3040] as Uint16Array)[
      (c2 & 0xffff) - 0x3099
    ] as number;
  },
} as const;

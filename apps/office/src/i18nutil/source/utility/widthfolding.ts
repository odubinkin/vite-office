/** @fileoverview Original static table owners, lazy indexed getters, scalar decomposition and composition lookup. */
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
/** Original static widthfolding API; a readonly ESM record adapts the stateless C++ class. Sequence/string operations remain unimplemented. */
export const widthfolding = {
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

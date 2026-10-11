/** @fileoverview Complete original widthfolding_data.h rows, preserving duplicates and initialized units. */
import data from "./widthfolding_data.json";
import type { UnicodePairWithFlag } from "../../inc/oneToOneMapping";
export const FULL2HALF_NORMAL = data.constants.FULL2HALF_NORMAL;
export const FULL2HALF_ASC_FUNCTION = data.constants.FULL2HALF_ASC_FUNCTION;
export const FULL2HALF_KATAKANA_ONLY = data.constants.FULL2HALF_KATAKANA_ONLY;
export const HALF2FULL_NORMAL = data.constants.HALF2FULL_NORMAL;
export const HALF2FULL_JIS_FUNCTION = data.constants.HALF2FULL_JIS_FUNCTION;
export const HALF2FULL_KATAKANA_ONLY = data.constants.HALF2FULL_KATAKANA_ONLY;
/** Original decomposition row. */
export interface decomposition_table_entry_t {
  readonly decomposited_character_1: number;
  readonly decomposited_character_2: number;
}
export const decomposition_table: readonly decomposition_table_entry_t[] =
  data.decomposition_table.map(
    /** Preserves original row fields. @param row - Complete initialized pair. @returns Original row. */
    (row) => ({
      decomposited_character_1: row[0] as number,
      decomposited_character_2: row[1] as number,
    }),
  );
export const composition_table = data.composition_table.map(
  /** Retains both initialized composition units. @param row - Original pair. @returns Original unit storage. */
  (row) => new Uint16Array(row),
);
/** Creates the complete original flagged row owners without filtering or ordering. @param rows - Full initialized source rows. @returns Actual borrowed row owners. */
function flaggedRows(rows: number[][]): readonly UnicodePairWithFlag[] {
  return rows.map(
    /** Preserves each original flag and both units. @param row - Complete row. @returns Original row owner. */ (
      row,
    ) => ({ first: row[0] as number, second: row[1] as number, flag: row[2] as number }),
  );
}
export const full2half = flaggedRows(data.full2half);
export const half2full = flaggedRows(data.half2full);

/** @fileoverview Native matrix search in the common VLOOKUP/HLOOKUP interpreter. */
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScMatValType } from "../../../inc/types";
import { ScMatrix, type ScMatrixValue } from "../../../inc/scmatrix";
import { GetCollator, type ScQueryItem } from "./queryentry";

/** Searches the first matrix column or row, with native sorted and exact rules. @param matrix - Lookup table. @param count - Length of the search axis. @param index - Result row or column offset. @param horizontal - Search across the first row. @param sorted - Selects the ordered search. @param key - Query entry value. @returns Owned matched result or absence. */
export function CalculateMatrixLookup(
  matrix: ScMatrix,
  count: number,
  index: number,
  horizontal: boolean,
  sorted: boolean,
  key: ScQueryItem,
): ScMatrixValue | undefined {
  let match = -1;
  let matchIsNumber = false;
  for (let offset = 0; offset < count; ++offset) {
    const candidate = matrix.Get(horizontal ? offset : 0, horizontal ? 0 : offset);
    try {
      const numeric = ScMatrix.IsValueType(candidate.nType);
      if (typeof key === "number") {
        if (!numeric) continue;
        if (!sorted) {
          if (candidate.fVal !== key) continue;
          match = offset;
          break;
        }
        if (!(candidate.fVal <= key)) break;
      } else if (sorted) {
        if (
          !numeric &&
          GetCollator().compare(text(candidate.GetString().getString()), key.text) > 0
        ) {
          if (offset === 0) continue;
          break;
        }
      } else {
        if (candidate.nType === ScMatValType.String) {
          if (text(candidate.GetString().getIgnoreCaseString()) !== key.ignoreCase) continue;
        } else if (!horizontal || numeric || key.text.length) continue;
        match = offset;
        break;
      }
      match = offset;
      matchIsNumber = numeric;
    } finally {
      candidate.dispose();
    }
  }
  if (match < 0 || (typeof key !== "number" && matchIsNumber)) return undefined;
  return matrix.Get(horizontal ? match : index, horizontal ? index : match);
}

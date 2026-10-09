/** @fileoverview Original Calc reference transpose and area-growth geometry, reusing existing coordinate owners. */
import { ScAddress, ScRange } from "../../../inc/address";
import type { SCCOL, SCROW, SCTAB } from "../../../inc/types";
import type { ScAddressDocument } from "./address";
import { ScRefUpdateRes } from "../inc/refupdat";

/** Original static reference-update owner; numerical methods retain their native source responsibilities. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Original ScRefUpdate owns static operations at this public boundary.
export class ScRefUpdate {
  /** Transposes one coordinate with native temporary widths and repeated sheet wrapping. @param col - Raw column. @param row - Raw row. @param tab - Raw sheet. @param doc - Existing document getter view, with positive table count. @param source - Original source. @param dest - Destination. @returns Native output-reference coordinates. */
  public static DoTranspose(
    col: SCCOL,
    row: SCROW,
    tab: SCTAB,
    doc: ScAddressDocument,
    source: ScRange,
    dest: ScAddress,
  ): [SCCOL, SCROW, SCTAB] {
    const dz = ((dest.Tab() - source.aStart.Tab()) << 16) >> 16;
    if (dz) {
      let newTab = ((tab + dz) << 16) >> 16;
      const count = doc.GetTableCount();
      while (newTab < 0) newTab = ((newTab + count) << 16) >> 16;
      while (newTab >= count) newTab = ((newTab - count) << 16) >> 16;
      tab = newTab;
    }
    const relX = ((col - source.aStart.Col()) << 16) >> 16;
    const relY = (row - source.aStart.Row()) | 0;
    return [((dest.Col() + relY) << 16) >> 16, (dest.Row() + relX) | 0, tab];
  }

  /** Updates only references entirely contained by the original source. @param doc - Document getter view. @param source - Source range. @param dest - Destination. @param ref - Receiving range. @returns Original update result. */
  public static UpdateTranspose(
    doc: ScAddressDocument,
    source: ScRange,
    dest: ScAddress,
    ref: ScRange,
  ): ScRefUpdateRes {
    let result = ScRefUpdateRes.UR_NOTHING;
    if (source.Contains(ref)) {
      const [col1, row1, tab1] = ref.aStart.GetVars();
      const [col2, row2, tab2] = ref.aEnd.GetVars();
      const first = ScRefUpdate.DoTranspose(col1, row1, tab1, doc, source, dest);
      const second = ScRefUpdate.DoTranspose(col2, row2, tab2, doc, source, dest);
      ref.aStart.Set(...first);
      ref.aEnd.Set(...second);
      result = ScRefUpdateRes.UR_UPDATED;
    }
    return result;
  }

  /** Grows matching references with both predicates calculated before mutation and native header-row allowance. @param area - Original area. @param growX - Signed column growth. @param growY - Signed row growth. @param ref - Receiving range. @returns Original update result. */
  public static UpdateGrow(
    area: ScRange,
    growX: SCCOL,
    growY: SCROW,
    ref: ScRange,
  ): ScRefUpdateRes {
    let result = ScRefUpdateRes.UR_NOTHING;
    const updateX =
      growX !== 0 &&
      ref.aStart.Col() === area.aStart.Col() &&
      ref.aEnd.Col() === area.aEnd.Col() &&
      ref.aStart.Row() >= area.aStart.Row() &&
      ref.aEnd.Row() <= area.aEnd.Row() &&
      ref.aStart.Tab() >= area.aStart.Tab() &&
      ref.aEnd.Tab() <= area.aEnd.Tab();
    const updateY =
      growY !== 0 &&
      ref.aStart.Col() >= area.aStart.Col() &&
      ref.aEnd.Col() <= area.aEnd.Col() &&
      (ref.aStart.Row() === area.aStart.Row() || ref.aStart.Row() === area.aStart.Row() + 1) &&
      ref.aEnd.Row() === area.aEnd.Row() &&
      ref.aStart.Tab() >= area.aStart.Tab() &&
      ref.aEnd.Tab() <= area.aEnd.Tab();
    if (updateX) {
      ref.aEnd.SetCol(((ref.aEnd.Col() + growX) << 16) >> 16);
      result = ScRefUpdateRes.UR_UPDATED;
    }
    if (updateY) {
      ref.aEnd.SetRow((ref.aEnd.Row() + growY) | 0);
      result = ScRefUpdateRes.UR_UPDATED;
    }
    return result;
  }
}

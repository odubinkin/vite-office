/** @fileoverview Original rtftok table-cell shading values and percentage thresholds. */
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { RtfDocumentImplContext, RtfState } from "./rtfdocumentimpl.context";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";
import { RTFValue } from "./rtfvalue";

const cellShadeLimits = [
  [1, N.LN_Value_ST_Shd_clear],
  [750, N.LN_Value_ST_Shd_pct5],
  [1100, N.LN_Value_ST_Shd_pct10],
  [1350, N.LN_Value_ST_Shd_pct12],
  [1750, N.LN_Value_ST_Shd_pct15],
  [2250, N.LN_Value_ST_Shd_pct20],
  [2750, N.LN_Value_ST_Shd_pct25],
  [3250, N.LN_Value_ST_Shd_pct30],
  [3600, N.LN_Value_ST_Shd_pct35],
  [3850, N.LN_Value_ST_Shd_pct37],
  [4250, N.LN_Value_ST_Shd_pct40],
  [4750, N.LN_Value_ST_Shd_pct45],
  [5250, N.LN_Value_ST_Shd_pct50],
  [5750, N.LN_Value_ST_Shd_pct55],
  [6100, N.LN_Value_ST_Shd_pct60],
  [6350, N.LN_Value_ST_Shd_pct62],
  [6750, N.LN_Value_ST_Shd_pct65],
  [7250, N.LN_Value_ST_Shd_pct70],
  [7750, N.LN_Value_ST_Shd_pct75],
  [8250, N.LN_Value_ST_Shd_pct80],
  [8600, N.LN_Value_ST_Shd_pct85],
  [8850, N.LN_Value_ST_Shd_pct87],
  [9250, N.LN_Value_ST_Shd_pct90],
  [9750, N.LN_Value_ST_Shd_pct95],
] as const;

/** Applies original cell shading to the current group's cell sprms. @param this - Actual RTF reader. @param name - Native control. @param value - Authored parameter. @param state - Current group. @returns Whether consumed. */
export function dispatchTableShading(
  this: RtfDocumentImplContext,
  name: string,
  value: number,
  state: RtfState,
): boolean {
  if (name === "clshdng") {
    const shade =
      cellShadeLimits.find(
        /** Selects the first source upper bound greater than the parameter. @param limit - Source threshold and value. @returns Whether it matches. */ ([
          limit,
        ]) => value < limit,
      )?.[1] ?? N.LN_Value_ST_Shd_solid;
    putNestedAttribute(
      state.tableCellSprms,
      N.LN_CT_TcPrBase_shd,
      N.LN_CT_Shd_val,
      new RTFValue(shade),
    );
    return true;
  }
  if (name === "clcbpat" || name === "clcbpatraw") {
    putNestedAttribute(
      state.tableCellSprms,
      N.LN_CT_TcPrBase_shd,
      N.LN_CT_Shd_fill,
      new RTFValue(this["getColorTable"](value).toInt32()),
    );
    return true;
  }
  return false;
}

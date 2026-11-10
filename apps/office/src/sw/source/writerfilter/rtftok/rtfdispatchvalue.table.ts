/** @fileoverview Original rtftok table-cell shading values and percentage thresholds. */
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { RtfDocumentImplContext, RtfState } from "./rtfdocumentimpl.context";
import { putNestedAttribute, putNestedSprm } from "./rtfdocumentimpl.properties";
import { RTFSprms } from "./rtfsprm";
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

const floatingTableValues = new Map<string, number>([
  ["tposx", N.LN_CT_TblPPr_tblpX],
  ["tposy", N.LN_CT_TblPPr_tblpY],
  ["tdfrmtxtLeft", N.LN_CT_TblPPr_leftFromText],
  ["tdfrmtxtRight", N.LN_CT_TblPPr_rightFromText],
  ["tdfrmtxtTop", N.LN_CT_TblPPr_topFromText],
  ["tdfrmtxtBottom", N.LN_CT_TblPPr_bottomFromText],
]);

/** Routes the original floating table numeric values into tblpPr on the current native row. @param name - Actual control. @param value - Signed RTF value. @param state - Current parser group. @returns Whether consumed. */
export function dispatchFloatingTableValue(name: string, value: number, state: RtfState): boolean {
  const attribute = floatingTableValues.get(name);
  if (attribute === undefined) return false;
  putNestedAttribute(state.tableRowSprms, N.LN_CT_TblPrBase_tblpPr, attribute, new RTFValue(value));
  return true;
}

/** Dispatches the original RTF row's preferred width and table indent resource attributes. @param name - Actual RTF keyword. @param value - Native numeric parameter. @param state - Current parser group. @returns Whether consumed. */
export function dispatchTableMeasure(name: string, value: number, state: RtfState): boolean {
  const row = state.tableRowSprms;
  if (name === "tblind") {
    putTableIndent(row, value);
    return true;
  }
  const attribute =
    name === "trftsWidth"
      ? N.LN_CT_TblWidth_type
      : name === "trwWidth"
        ? N.LN_CT_TblWidth_w
        : undefined;
  if (attribute === undefined) return false;
  putNestedAttribute(row, N.LN_CT_TblPrBase_tblW, attribute, new RTFValue(value));
  return true;
}

/** Writes the original table-indent measure. @param row - Native row property owner. @param width - Indent in twips. @returns Nothing. */
export function putTableIndent(row: RTFSprms, width: number): void {
  putNestedAttribute(
    row,
    N.LN_CT_TblPrBase_tblInd,
    N.LN_CT_TblWidth_type,
    new RTFValue(N.LN_Value_ST_TblWidth_dxa),
  );
  const cellMargin = row.find(N.LN_CT_TblPrBase_tblCellMar);
  const left = cellMargin.get()?.getSprms().find(N.LN_CT_TcMar_left);
  const measure = left?.get()?.getAttributes().find(N.LN_CT_TblWidth_w);
  try {
    width -= measure?.get()?.getInt() ?? 0;
  } finally {
    measure?.dispose();
    left?.dispose();
    cellMargin.dispose();
  }
  putNestedAttribute(row, N.LN_CT_TblPrBase_tblInd, N.LN_CT_TblWidth_w, new RTFValue(width));
}

const cellPadding = new Map<string, number>([
  ["clpadl", N.LN_CT_TcMar_top],
  ["clpadt", N.LN_CT_TcMar_left],
  ["clpadr", N.LN_CT_TcMar_right],
  ["clpadb", N.LN_CT_TcMar_bottom],
]);
const rowPadding = new Map<string, number>([
  ["trpaddt", N.LN_CT_TcMar_top],
  ["trpaddl", N.LN_CT_TcMar_left],
  ["trpaddr", N.LN_CT_TcMar_right],
  ["trpaddb", N.LN_CT_TcMar_bottom],
  ["trpaddft", N.LN_CT_TcMar_top],
  ["trpaddfl", N.LN_CT_TcMar_left],
  ["trpaddfr", N.LN_CT_TcMar_right],
  ["trpaddfb", N.LN_CT_TcMar_bottom],
]);

/** Emits the original table or cell margins, including the RTF half-gap fallback. @param name - Actual RTF control. @param value - Native value. @param state - Current group. @param defaults - Original default cell sprms for the active text stream. @returns Whether consumed. */
export function dispatchTableMargin(
  name: string,
  value: number,
  state: RtfState,
  defaults: RTFSprms,
): boolean {
  const cell = cellPadding.get(name);
  const row = rowPadding.get(name);
  if (cell === undefined && row === undefined && name !== "trgaph") return false;
  const attrs = new RTFSprms();
  try {
    if (name === "trgaph") {
      if (value > 0) {
        attrs.set(N.LN_CT_TblWidth_type, new RTFValue(N.LN_Value_ST_TblWidth_dxa));
        attrs.set(N.LN_CT_TblWidth_w, new RTFValue(value));
        putNestedSprm(
          state.tableRowSprms,
          N.LN_CT_TblPrBase_tblCellMar,
          N.LN_CT_TblCellMar_left,
          new RTFValue(attrs),
        );
        putNestedSprm(
          state.tableRowSprms,
          N.LN_CT_TblPrBase_tblCellMar,
          N.LN_CT_TblCellMar_right,
          new RTFValue(attrs),
        );
      }
    } else if (cell !== undefined) {
      attrs.set(N.LN_CT_TblWidth_type, new RTFValue(N.LN_Value_ST_TblWidth_dxa));
      attrs.set(N.LN_CT_TblWidth_w, new RTFValue(value));
      putNestedSprm(state.tableCellSprms, N.LN_CT_TcPrBase_tcMar, cell, new RTFValue(attrs));
    } else if (row !== undefined) {
      const unit = name.startsWith("trpaddf");
      if (unit) {
        if (value === 3) attrs.set(N.LN_CT_TblWidth_type, new RTFValue(N.LN_Value_ST_TblWidth_dxa));
      } else attrs.set(N.LN_CT_TblWidth_w, new RTFValue(value));
      const put = unit ? putNestedAttribute : putNestedSprm;
      put(state.tableRowSprms, N.LN_CT_TblPrBase_tblCellMar, row, new RTFValue(attrs));
      put(state.tableCellSprms, N.LN_CT_TcPrBase_tcMar, row, new RTFValue(attrs));
      put(defaults, N.LN_CT_TcPrBase_tcMar, row, new RTFValue(attrs));
    }
  } finally {
    attrs.dispose();
  }
  return true;
}

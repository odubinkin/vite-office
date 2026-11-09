/** @fileoverview Original RTF row and cell text-direction flags and their native sprm destinations. */
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { RunType, type RtfState } from "./rtfdocumentimpl.context";
import { RTFValue } from "./rtfvalue";

const cellDirections = new Map<string, number>([
  ["cltxlrtb", N.LN_Value_ST_TextDirection_lrTb],
  ["cltxtbrl", N.LN_Value_ST_TextDirection_tbRl],
  ["cltxbtlr", N.LN_Value_ST_TextDirection_btLr],
  ["cltxlrtbv", N.LN_Value_ST_TextDirection_lrTbV],
  ["cltxtbrlv", N.LN_Value_ST_TextDirection_tbRlV],
]);

/** Original flag dispatch into the current group-owned row or cell sprm set. @param name - Native token spelling. @param state - Actual parser state. @returns Whether the flag was consumed. */
export function dispatchTableDirection(name: string, state: RtfState): boolean {
  if (name === "rtlrow" || name === "ltrrow") {
    state.runType = RunType.NONE;
    state.tableRowSprms.set(N.LN_CT_TblPrBase_bidiVisual, new RTFValue(name === "rtlrow" ? 1 : 0));
    return true;
  }
  const direction = cellDirections.get(name);
  if (direction === undefined) return false;
  state.tableCellSprms.set(N.LN_CT_TcPrBase_textDirection, new RTFValue(direction));
  return true;
}

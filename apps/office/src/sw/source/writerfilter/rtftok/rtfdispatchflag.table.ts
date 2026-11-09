/** @fileoverview Original RTF row and cell flags and their native sprm destinations. */
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";
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

const floatingTableFlags: ReadonlyMap<string, readonly [number, string]> = new Map([
  ["tpvpara", [N.LN_CT_TblPPr_vertAnchor, "text"]],
  ["tpvmrg", [N.LN_CT_TblPPr_vertAnchor, "margin"]],
  ["tpvpg", [N.LN_CT_TblPPr_vertAnchor, "page"]],
  ["tphcol", [N.LN_CT_TblPPr_horzAnchor, "text"]],
  ["tphmrg", [N.LN_CT_TblPPr_horzAnchor, "margin"]],
  ["tphpg", [N.LN_CT_TblPPr_horzAnchor, "page"]],
  ["tposyc", [N.LN_CT_TblPPr_tblpYSpec, "center"]],
  ["tposyb", [N.LN_CT_TblPPr_tblpYSpec, "bottom"]],
  ["tposxc", [N.LN_CT_TblPPr_tblpXSpec, "center"]],
  ["tposxr", [N.LN_CT_TblPPr_tblpXSpec, "right"]],
]);

/** Routes the original positioned-table flags into the current row modifier set. @param name - Actual tokenizer control. @param state - Current parser group. @returns Whether consumed. */
function dispatchFloatingTableFlag(name: string, state: RtfState): boolean {
  const entry = floatingTableFlags.get(name);
  if (entry) {
    const value = OUString.createFromAscii(new TextEncoder().encode(entry[1] + "\0"));
    try {
      putNestedAttribute(
        state.tableRowSprms,
        N.LN_CT_TblPrBase_tblpPr,
        entry[0],
        new RTFValue(value),
      );
    } finally {
      value.dispose();
    }
    return true;
  }
  if (name !== "tabsnoovrlp") return false;
  state.tableRowSprms.set(
    N.LN_CT_TblPrBase_tblOverlap,
    new RTFValue(N.LN_Value_ST_TblOverlap_never),
  );
  return true;
}

/** Original flag dispatch into the current group-owned row or cell sprm set. @param name - Native token spelling. @param state - Actual parser state. @returns Whether the flag was consumed. */
export function dispatchTableFlag(name: string, state: RtfState): boolean {
  if (name === "rtlrow" || name === "ltrrow") {
    state.runType = RunType.NONE;
    state.tableRowSprms.set(N.LN_CT_TblPrBase_bidiVisual, new RTFValue(name === "rtlrow" ? 1 : 0));
    return true;
  }
  if (name === "clvmgf" || name === "clvmrg" || name === "clmgf" || name === "clmrg") {
    const vertical = name === "clvmgf" || name === "clvmrg";
    const restart = name === "clvmgf" || name === "clmgf";
    state.tableCellSprms.set(
      vertical ? N.LN_CT_TcPrBase_vMerge : N.LN_CT_TcPrBase_hMerge,
      new RTFValue(restart ? N.LN_Value_ST_Merge_restart : N.LN_Value_ST_Merge_continue),
    );
    return true;
  }
  const direction = cellDirections.get(name);
  if (direction === undefined) return dispatchFloatingTableFlag(name, state);
  state.tableCellSprms.set(N.LN_CT_TcPrBase_textDirection, new RTFValue(direction));
  return true;
}

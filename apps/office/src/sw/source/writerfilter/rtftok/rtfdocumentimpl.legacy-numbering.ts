/** @fileoverview Original PN destination value/flag and afterPopState numbering-table production on the actual RTF reader. */
import type { RtfDocumentImplContext, RtfState } from "./rtfdocumentimpl.context";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { RTFValue } from "./rtfvalue";
import { RTFSprms, RTFConflictPolicy } from "./rtfsprm";
import { putNestedAttribute, putNestedSprm } from "./rtfdocumentimpl.properties";
import { stringValue } from "./rtfdocumentimpl.character";
import { QueueNumberingTable } from "./rtfdocumentimpl.numbering";
/** Original destination dispatch precedes style-entry handling and selects the actual owned text buffer. @param name - Keyword. @param state - Actual group. @returns Whether consumed. */
export function DispatchLegacyNumberingDestination(name: string, state: RtfState): boolean {
  if (state.destination === "skip") return false;
  if (name === "pn" || name === "pntxta" || name === "pntxtb") {
    state.destination = name;
    state.currentDestinationText = state.destinationText;
    state.starred = false;
    return true;
  }
  if (name === "pntext") {
    state.destination = "skip";
    state.starred = false;
    return true;
  }
  return false;
}
/** Original consumed legacy flags/values retain fixed IDs, raw starts and source ASCII-only font properties. @param this - Actual reader. @param name - Keyword. @param parameter - Original value/default. @param state - Actual group. @returns Whether consumed. */
export function DispatchLegacyNumbering(
  this: RtfDocumentImplContext,
  name: string,
  parameter: number | undefined,
  state: RtfState,
): boolean {
  if (name === "pnlvlbody") state.tableAttributes.set(N.LN_CT_AbstractNum_nsid, new RTFValue(2));
  else if (name === "pnlvlblt") {
    state.tableAttributes.set(N.LN_CT_AbstractNum_nsid, new RTFValue(1));
    putNestedAttribute(
      state.tableSprms,
      N.LN_CT_Lvl_numFmt,
      N.LN_CT_NumFmt_val,
      new RTFValue(N.LN_Value_ST_NumberFormat_bullet),
    );
  } else if (name === "pndec")
    putNestedAttribute(
      state.tableSprms,
      N.LN_CT_Lvl_numFmt,
      N.LN_CT_NumFmt_val,
      new RTFValue(N.LN_Value_ST_NumberFormat_decimal),
    );
  else if (name === "pnstart")
    state.tableSprms.set(N.LN_CT_Lvl_start, new RTFValue(parameter ?? 0));
  else if (name === "pnf") {
    const attributes = new RTFSprms();
    try {
      attributes.set(N.LN_CT_Fonts_ascii, stringValue(this["fonts"].get(parameter ?? 0) ?? ""));
      putNestedSprm(
        state.tableSprms,
        N.LN_CT_Lvl_rPr,
        N.LN_EG_RPrBase_rFonts,
        new RTFValue(attributes),
      );
    } finally {
      attributes.dispose();
    }
  } else return false;
  return true;
}
/** Original pop emits an independent abstract/concrete table and then references it from the parent's actual paragraph properties. @param this - Actual reader. @param state - Popped original group. @returns Nothing. */
export function FinishLegacyNumbering(this: RtfDocumentImplContext, state: RtfState): void {
  const parent = this["states"].at(-1);
  if (!parent) return;
  if (state.destination === "pntxta" || state.destination === "pntxtb") {
    const value = state.destinationText.makeStringAndClear();
    try {
      parent.tableAttributes.set(
        state.destination === "pntxta" ? N.LN_CT_LevelSuffix_val : N.LN_CT_LevelText_val,
        new RTFValue(value, true),
      );
    } finally {
      value.dispose();
    }
    return;
  }
  if (state.destination !== "pn") return;
  const id = state.tableAttributes.find(N.LN_CT_AbstractNum_nsid);
  try {
    if (!id.is()) return;
    const before = state.tableAttributes.find(N.LN_CT_LevelText_val),
      after = state.tableAttributes.find(N.LN_CT_LevelSuffix_val);
    let pattern = "%1";
    try {
      const prefix = before.get()?.getString(),
        suffix = after.get()?.getString();
      try {
        pattern = (prefix ? text(prefix) : "") + pattern + (suffix ? text(suffix) : "");
      } finally {
        prefix?.dispose();
        suffix?.dispose();
      }
    } finally {
      before.dispose();
      after.dispose();
    }
    const textAttributes = new RTFSprms(),
      levelAttributes = new RTFSprms(),
      levelSprms = new RTFSprms(),
      abstractAttributes = new RTFSprms(),
      abstractSprms = new RTFSprms(),
      numberingAttributes = new RTFSprms(),
      numberingSprms = new RTFSprms(),
      table = new RTFSprms();
    try {
      textAttributes.set(N.LN_CT_LevelText_val, stringValue(pattern));
      levelAttributes.set(N.LN_CT_Lvl_ilvl, new RTFValue(0));
      for (const property of [N.LN_CT_Lvl_numFmt, N.LN_CT_Lvl_start, N.LN_CT_Lvl_rPr]) {
        const value = state.tableSprms.find(property);
        try {
          if (value.is()) levelSprms.set(property, value);
        } finally {
          value.dispose();
        }
      }
      levelSprms.set(N.LN_CT_Lvl_lvlText, new RTFValue(textAttributes));
      abstractAttributes.set(N.LN_CT_AbstractNum_abstractNumId, id);
      abstractSprms.set(
        N.LN_CT_AbstractNum_lvl,
        new RTFValue(levelAttributes, levelSprms),
        RTFConflictPolicy.Append,
      );
      table.set(
        N.LN_CT_Numbering_abstractNum,
        new RTFValue(abstractAttributes, abstractSprms),
        RTFConflictPolicy.Append,
      );
      numberingAttributes.set(N.LN_CT_AbstractNum_nsid, id);
      numberingSprms.set(N.LN_CT_Num_abstractNumId, id);
      table.set(
        N.LN_CT_Numbering_num,
        new RTFValue(numberingAttributes, numberingSprms),
        RTFConflictPolicy.Append,
      );
      QueueNumberingTable.call(this, table);
      putNestedSprm(
        parent.paragraphSprms,
        N.LN_CT_PPrBase_numPr,
        N.LN_CT_NumPr_ilvl,
        new RTFValue(0),
        RTFConflictPolicy.ReplaceAtStart,
      );
      putNestedSprm(
        parent.paragraphSprms,
        N.LN_CT_PPrBase_numPr,
        N.LN_CT_NumPr_numId,
        id,
        RTFConflictPolicy.ReplaceAtStart,
      );
    } finally {
      for (const value of [
        textAttributes,
        levelAttributes,
        levelSprms,
        abstractAttributes,
        abstractSprms,
        numberingAttributes,
        numberingSprms,
        table,
      ])
        value.dispose();
    }
  } finally {
    id.dispose();
  }
}
import { text } from "../../core/unocore/unocrsrhelper";

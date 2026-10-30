/** @fileoverview Original LEVELTEXT/LEVELNUMBERS beforePop/afterPop responsibilities on the actual parser state. */
import type { RtfDocumentImplContext, RtfState } from "./rtfdocumentimpl.context";
import { RTFSprms } from "./rtfsprm";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";
import { stringValue } from "./rtfdocumentimpl.character";
import { text } from "../../core/unocore/unocrsrhelper";
/** Original resolveChars uses the collected first character only to test the terminator, then appends its final signed char variable. @param state - Saved parser state. @param firstByte - First collected byte or zero. @param lastByte - Signed char left by the native read loop. @returns Nothing. */
export function ReadLevelNumbers(state: RtfState, firstByte: number, lastByte: number): void {
  if (firstByte !== 59) state.levelNumbers.push(lastByte);
}
/** Original destination finalization preserves malformed-level validity and UTF16 position counting. @param this - Actual reader. @param state - Popped state. @returns Nothing. */
export function FinishListLevelGroup(this: RtfDocumentImplContext, state: RtfState): void {
  const parent = this["states"].at(-1);
  if (!parent) return;
  if (state.destination === "leveltext") {
    const raw = state.levelText,
      length = raw.charCodeAt(0);
    putNestedAttribute(
      parent.tableSprms,
      N.LN_CT_Lvl_lvlText,
      N.LN_CT_LevelText_val,
      stringValue(length < raw.length ? raw.slice(1, length + 1) : raw, true),
    );
  } else if (state.destination === "levelnumbers") {
    if (parent.destination !== "levelnumbers") {
      const level = state.tableSprms.find(N.LN_CT_Lvl_lvlText);
      try {
        if (level.is()) {
          const value = level.operatorDereference().getAttributes().find(N.LN_CT_LevelText_val);
          try {
            if (value.is()) {
              const native = value.operatorDereference().getString();
              let result = "";
              try {
                if (state.levelNumbersValid) {
                  const original = text(native);
                  let replacements = 1;
                  for (let i = 0; i < original.length; ++i)
                    result += state.levelNumbers.includes(i + 1)
                      ? `%${replacements++ + state.listLevelNum + 1 - state.levelNumbers.length}`
                      : original[i];
                }
              } finally {
                native.dispose();
              }
              putNestedAttribute(
                state.tableSprms,
                N.LN_CT_Lvl_lvlText,
                N.LN_CT_LevelText_val,
                stringValue(result, true),
              );
            }
          } finally {
            value.clear();
          }
        }
      } finally {
        level.clear();
      }
    }
    parent.tableSprms.dispose();
    parent.tableSprms = new RTFSprms(state.tableSprms);
    if (parent.destination === "levelnumbers" || parent.destination === "listlevel")
      parent.levelNumbersValid = state.levelNumbersValid;
  } else if (state.destination === "listlevel") {
    state.tableAttributes.set(N.LN_CT_Lvl_ilvl, new RTFValue(parent.listLevelNum++));
    const value = new RTFValue(state.tableAttributes, state.tableSprms);
    if (parent.destination === "lfolevel") parent.tableSprms.set(N.LN_CT_NumLvl_lvl, value);
    else parent.listLevelEntries.set(N.LN_CT_AbstractNum_lvl, value, RTFConflictPolicy.Append);
  } else if (state.destination === "lfolevel") {
    state.tableAttributes.set(N.LN_CT_NumLvl_ilvl, new RTFValue(parent.listLevelNum++));
    parent.tableSprms.set(
      N.LN_CT_Num_lvlOverride,
      new RTFValue(state.tableAttributes, state.tableSprms),
      RTFConflictPolicy.Append,
    );
  } else if (state.destination === "list") {
    for (const [id, value] of state.listLevelEntries)
      state.tableSprms.set(id, value, RTFConflictPolicy.Append);
    const value = new RTFValue(state.tableAttributes, state.tableSprms);
    this["m_aListTableSprms"].set(N.LN_CT_Numbering_abstractNum, value, RTFConflictPolicy.Append);
    this["m_aListTable"].get(state.currentListIndex)?.clear();
    this["m_aListTable"].set(state.currentListIndex, new SvRef(value));
    this["m_nListLevel"] = -1;
    this["m_aInvalidListTableFirstIndents"].set(
      state.currentListIndex,
      new Map(this["m_aInvalidListLevelFirstIndents"]),
    );
    this["m_aInvalidListLevelFirstIndents"].clear();
  } else if (state.destination === "listoverridetable") {
    QueueListTable.call(this);
  } else if (state.destination === "listoverride") {
    if (parent.destination === "listoverride") {
      parent.tableSprms.dispose();
      parent.tableSprms = new RTFSprms(state.tableSprms);
      parent.tableAttributes.dispose();
      parent.tableAttributes = new RTFSprms(state.tableAttributes);
    } else {
      this["m_aListOverrideTable"].set(state.currentListOverrideIndex, state.currentListIndex);
      this["m_aListTableSprms"].set(
        N.LN_CT_Numbering_num,
        new RTFValue(state.tableAttributes, state.tableSprms),
        RTFConflictPolicy.Append,
      );
    }
  }
}
import { RTFValue } from "./rtfvalue";
import { RTFConflictPolicy } from "./rtfsprm";

import { QueueListTable } from "./rtfdocumentimpl.numbering";

import { SvRef } from "../../../../tools/inc/ref";

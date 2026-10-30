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
    parent.listLevelNum++;
    const level = this["currentListLevels"].at(-1);
    if (level) {
      level.tableSprms.dispose();
      level.tableSprms = new RTFSprms(state.tableSprms);
    }
  }
}

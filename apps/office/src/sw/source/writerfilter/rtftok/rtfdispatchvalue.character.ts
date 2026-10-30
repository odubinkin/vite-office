/** @fileoverview Consumed associated font/size dispatch from rtfdispatchvalue.cxx and weight/posture dispatch from RTFDocumentImpl::dispatchToggle. */
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { RunType, type RtfState, type RtfDocumentImplContext } from "./rtfdocumentimpl.context";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";
import { stringValue } from "./rtfdocumentimpl.character";
import { RTFSprms, RTFConflictPolicy } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
/** Original associated controls choose resource identities from saved RunType, not from the control's associated prefix or visible text. F alone changes the current encoding. @param name - Actual keyword. @param parameter - Optional lexical parameter. @param state - Actual group. @param this - Original reader. @returns Whether consumed. */
export function dispatchAssociatedCharacter(
  this: RtfDocumentImplContext,
  name: string,
  parameter: number | undefined,
  state: RtfState,
): boolean {
  if (
    state.destination === "listlevel" &&
    (name === "strike" || name === "striked" || name === "kerning")
  ) {
    const id =
      name === "kerning"
        ? N.LN_EG_RPrBase_kern
        : name === "strike"
          ? N.LN_EG_RPrBase_strike
          : N.LN_EG_RPrBase_dstrike;
    state.tableSprms.set(
      id,
      new RTFValue(name === "kerning" ? (parameter ?? 0) : Number(parameter !== 0)),
    );
    return true;
  }
  const complex =
    state.runType === RunType.HICH ||
    state.runType === RunType.RTLCH_LTRCH_1 ||
    state.runType === RunType.LTRCH_RTLCH_2;
  if (name === "f" || name === "af") {
    const index = parameter ?? 0;
    const id =
      state.runType === RunType.RTLCH_LTRCH_1 || state.runType === RunType.LTRCH_RTLCH_2
        ? N.LN_CT_Fonts_cs
        : state.runType === RunType.DBCH
          ? N.LN_CT_Fonts_eastAsia
          : N.LN_CT_Fonts_ascii;
    if (state.destination === "listlevel") {
      const fonts = new RTFSprms(),
        run = new RTFSprms(),
        empty = new RTFSprms();
      try {
        fonts.set(id, stringValue(this["fonts"].get(index) ?? ""));
        run.set(N.LN_EG_RPrBase_rFonts, new RTFValue(fonts));
        state.tableSprms.set(N.LN_CT_Lvl_rPr, new RTFValue(empty, run), RTFConflictPolicy.Append);
      } finally {
        fonts.dispose();
        run.dispose();
        empty.dispose();
      }
      return true;
    }
    putNestedAttribute(
      state.characterSprms,
      N.LN_EG_RPrBase_rFonts,
      id,
      stringValue(this["fonts"].get(index) ?? ""),
    );
    state.fontIndex = index;
    if (name === "f")
      state.currentCodepage = this["fontCodepages"].get(index) ?? this["defaultCodepage"];
    return true;
  }
  if (name === "fs" || name === "afs") {
    (state.destination === "listlevel" ? state.tableSprms : state.characterSprms).set(
      complex ? N.LN_EG_RPrBase_szCs : N.LN_EG_RPrBase_sz,
      new RTFValue(parameter ?? 24),
    );
    return true;
  }
  if (name === "b" || name === "ab" || name === "i" || name === "ai") {
    const bold = name === "b" || name === "ab";
    (state.destination === "listlevel" ? state.tableSprms : state.characterSprms).set(
      bold
        ? complex
          ? N.LN_EG_RPrBase_bCs
          : N.LN_EG_RPrBase_b
        : complex
          ? N.LN_EG_RPrBase_iCs
          : N.LN_EG_RPrBase_i,
      new RTFValue(Number(parameter !== 0)),
    );
    return true;
  }
  return false;
}

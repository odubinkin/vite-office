/** @fileoverview Original RTF numbering value dispatch and complete getNumberFormat table from rtfdispatchvalue.cxx. */
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { RTFValue } from "./rtfvalue";
import { RTFSprms } from "./rtfsprm";
import { putNestedAttribute, putNestedSprm } from "./rtfdocumentimpl.properties";
import { stringValue } from "./rtfdocumentimpl.character";
import type { RtfState } from "./rtfdocumentimpl.context";
/** Original49-entry map; undefined RTF codes explicitly choose none. */
const formats = [
  N.LN_Value_ST_NumberFormat_decimal,
  N.LN_Value_ST_NumberFormat_upperRoman,
  N.LN_Value_ST_NumberFormat_lowerRoman,
  N.LN_Value_ST_NumberFormat_upperLetter,
  N.LN_Value_ST_NumberFormat_lowerLetter,
  N.LN_Value_ST_NumberFormat_ordinal,
  N.LN_Value_ST_NumberFormat_cardinalText,
  N.LN_Value_ST_NumberFormat_ordinalText,
  N.LN_Value_ST_NumberFormat_none,
  N.LN_Value_ST_NumberFormat_none,
  N.LN_Value_ST_NumberFormat_ideographDigital,
  N.LN_Value_ST_NumberFormat_japaneseCounting,
  N.LN_Value_ST_NumberFormat_aiueo,
  N.LN_Value_ST_NumberFormat_iroha,
  N.LN_Value_ST_NumberFormat_decimalFullWidth,
  N.LN_Value_ST_NumberFormat_decimalHalfWidth,
  N.LN_Value_ST_NumberFormat_japaneseLegal,
  N.LN_Value_ST_NumberFormat_japaneseDigitalTenThousand,
  N.LN_Value_ST_NumberFormat_decimalEnclosedCircleChinese,
  N.LN_Value_ST_NumberFormat_decimalFullWidth2,
  N.LN_Value_ST_NumberFormat_aiueoFullWidth,
  N.LN_Value_ST_NumberFormat_irohaFullWidth,
  N.LN_Value_ST_NumberFormat_decimalZero,
  N.LN_Value_ST_NumberFormat_bullet,
  N.LN_Value_ST_NumberFormat_ganada,
  N.LN_Value_ST_NumberFormat_chosung,
  N.LN_Value_ST_NumberFormat_decimalEnclosedFullstop,
  N.LN_Value_ST_NumberFormat_decimalEnclosedParen,
  N.LN_Value_ST_NumberFormat_decimalEnclosedCircleChinese,
  N.LN_Value_ST_NumberFormat_ideographEnclosedCircle,
  N.LN_Value_ST_NumberFormat_ideographTraditional,
  N.LN_Value_ST_NumberFormat_ideographZodiac,
  N.LN_Value_ST_NumberFormat_ideographZodiacTraditional,
  N.LN_Value_ST_NumberFormat_taiwaneseCounting,
  N.LN_Value_ST_NumberFormat_ideographLegalTraditional,
  N.LN_Value_ST_NumberFormat_taiwaneseCountingThousand,
  N.LN_Value_ST_NumberFormat_taiwaneseDigital,
  N.LN_Value_ST_NumberFormat_chineseCounting,
  N.LN_Value_ST_NumberFormat_chineseLegalSimplified,
  N.LN_Value_ST_NumberFormat_chineseCountingThousand,
  N.LN_Value_ST_NumberFormat_decimal,
  N.LN_Value_ST_NumberFormat_koreanDigital,
  N.LN_Value_ST_NumberFormat_koreanCounting,
  N.LN_Value_ST_NumberFormat_koreanLegal,
  N.LN_Value_ST_NumberFormat_koreanDigital2,
  N.LN_Value_ST_NumberFormat_hebrew1,
  N.LN_Value_ST_NumberFormat_arabicAlpha,
  N.LN_Value_ST_NumberFormat_hebrew2,
  N.LN_Value_ST_NumberFormat_arabicAbjad,
] as const;
/** Original signed-index RTF numbering conversion. @param parameter - Source code. @returns Original OOXML resource ID. */
export function getNumberFormat(parameter: number): number {
  return formats[parameter] ?? N.LN_Value_ST_NumberFormat_none;
}
/** Native values that target an actual list-level table, leaving group state/levelnumbers admission with the reader. @param name - Keyword. @param parameter - Original value/default. @param state - Actual parser group. @returns Whether consumed. */
export function dispatchNumberingValue(
  name: string,
  parameter: number | undefined,
  state: RtfState,
): boolean {
  const value = parameter ?? (name === "levellegal" ? 1 : 0);
  if (name === "levelnfc") {
    putNestedAttribute(
      state.tableSprms,
      N.LN_CT_Lvl_numFmt,
      N.LN_CT_NumFmt_val,
      new RTFValue(getNumberFormat(value)),
    );
    return true;
  }
  if (name === "levelstartat" || name === "levellegal") {
    state.tableSprms.set(
      name === "levelstartat" ? N.LN_CT_Lvl_start : N.LN_CT_Lvl_isLgl,
      new RTFValue(value),
    );
    return true;
  }
  if (name === "leveljc") {
    state.tableSprms.set(
      N.LN_CT_Lvl_lvlJc,
      new RTFValue(
        value === 0
          ? N.LN_Value_ST_Jc_left
          : value === 1
            ? N.LN_Value_ST_Jc_center
            : value === 2
              ? N.LN_Value_ST_Jc_right
              : 0,
      ),
    );
    return true;
  }
  if (name === "levelfollow") {
    const suffix = ["tab", "space", "nothing"][value];
    if (suffix !== undefined) state.tableSprms.set(N.LN_CT_Lvl_suff, stringValue(suffix));
    return true;
  }
  if (name === "fi" || name === "li") {
    if (state.levelNumbersValid)
      putNestedAttribute(
        state.tableSprms,
        N.LN_CT_PPrBase_ind,
        name === "fi" ? N.LN_CT_Ind_firstLine : N.LN_CT_Ind_left,
        new RTFValue(value),
      );
    return true;
  }
  if (name === "tx") {
    const attributes = new RTFSprms();
    try {
      attributes.set(N.LN_CT_TabStop_pos, new RTFValue(value));
      putNestedSprm(
        state.tableSprms,
        N.LN_CT_PPrBase_tabs,
        N.LN_CT_Tabs_tab,
        new RTFValue(attributes),
      );
    } finally {
      attributes.dispose();
    }
    return true;
  }
  return false;
}

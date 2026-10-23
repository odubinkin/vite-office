/** @fileoverview Original GetWhichOfScript from hints.cxx over genuine existing application language fields. */
import * as H from "../../../inc/hintids";
import * as ScriptType from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { GetI18NScriptTypeOfLanguage } from "../../../../svl/inc/languageoptions";
import { getConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
const maps = [
  [H.RES_CHRATR_LANGUAGE, H.RES_CHRATR_CJK_LANGUAGE, H.RES_CHRATR_CTL_LANGUAGE],
  [H.RES_CHRATR_FONT, H.RES_CHRATR_CJK_FONT, H.RES_CHRATR_CTL_FONT],
  [H.RES_CHRATR_FONTSIZE, H.RES_CHRATR_CJK_FONTSIZE, H.RES_CHRATR_CTL_FONTSIZE],
  [H.RES_CHRATR_WEIGHT, H.RES_CHRATR_CJK_WEIGHT, H.RES_CHRATR_CTL_WEIGHT],
  [H.RES_CHRATR_POSTURE, H.RES_CHRATR_CJK_POSTURE, H.RES_CHRATR_CTL_POSTURE],
] as const;
/** Original family remapping; WEAK borrows the actual application locale language, other unknown scripts select Latin. @param which - Native attribute identity. @param script - Native i18n script. @returns Script-specific original Which. */
export function GetWhichOfScript(which: number, script: number): number {
  for (const map of maps) {
    if (!(map as readonly number[]).includes(which)) continue;
    if (script === ScriptType.WEAK)
      script = GetI18NScriptTypeOfLanguage(getConfiguredSystemLanguage());
    return map[script === ScriptType.COMPLEX ? 2 : script === ScriptType.ASIAN ? 1 : 0];
  }
  return which;
}

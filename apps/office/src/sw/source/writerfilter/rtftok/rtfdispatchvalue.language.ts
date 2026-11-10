/** @fileoverview Native RTF language value dispatch and associated script selection from rtfdispatchvalue.cxx. */
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { LanguageType } from "../../../../i18nlangtag/inc/lang";
import { RTFValue } from "./rtfvalue";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";
import { RunType, type RtfState, type RtfDocumentImplContext } from "./rtfdocumentimpl.context";
/** Original character/default language controls; malformed default nesting is intentionally preserved. @param name - Actual control keyword. @param parameter - Native signed input before UInt16 conversion. @param state - Current parser group. @param this - Actual reader owner. @returns Whether dispatched. */
export function dispatchLanguageValue(
  this: RtfDocumentImplContext,
  name: string,
  parameter: number,
  state: RtfState,
): boolean {
  if (!["lang", "alang", "langfe", "deflang", "adeflang"].includes(name)) return false;
  const tag = new LanguageTag(LanguageType(parameter));
  const value = new RTFValue(tag.getBcp47());
  if (name === "deflang" || name === "adeflang") {
    // dispatchValue initializes nSprm=0; these original branches never assign it.
    putNestedAttribute(
      state.characterSprms,
      name === "deflang" ? N.LN_EG_RPrBase_lang : N.LN_CT_Language_bidi,
      0,
      value,
    );
    return true;
  }
  const id =
    name === "langfe" || state.runType === RunType.DBCH
      ? N.LN_CT_Language_eastAsia
      : state.runType === RunType.HICH ||
          state.runType === RunType.RTLCH_LTRCH_1 ||
          state.runType === RunType.LTRCH_RTLCH_2
        ? N.LN_CT_Language_bidi
        : N.LN_CT_Language_val;
  putNestedAttribute(state.characterSprms, N.LN_EG_RPrBase_lang, id, value);
  if (name === "lang" && this["m_aTextBuffer"].m_bNeedPap)
    putNestedAttribute(state.paragraphSprms, N.LN_EG_RPrBase_lang, id, value);
  return true;
}

/** @fileoverview Native SwTextNode::GetLang range selection from thints.cxx, using actual named and automatic style owners. */
import type { SwTextNode } from "./ndtxt";
import { CharFormat } from "../text/atrstck";
import { g_pBreakIt } from "../bastyp/breakit";
import { GetWhichOfScript } from "../attr/hints";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { LANGUAGE_DONTKNOW, LANGUAGE_NONE } from "../../../../i18nlangtag/inc/lang";
import { getConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { RES_CHRATR_LANGUAGE, RES_CHRATR_NOHYPHEN, RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
/** Source language precedence and zero-length boundary policy, including source no-hyphen query's distinct result. INET style resolution remains with its unported visited-URL owner. @param node - Actual node. @param begin - Native start. @param length - Native length. @param script - Explicit script or zero to detect. @param noneIfNoHyphenation - Original policy. @returns Native language identity. */
export function GetTextNodeLanguage(
  node: SwTextNode,
  begin: number,
  length: number,
  script: number,
  noneIfNoHyphenation: boolean,
): number {
  let result: number = LANGUAGE_DONTKNOW;
  if (!script) script = g_pBreakIt.GetRealScriptOfText(node.GetText(), begin);
  const which = noneIfNoHyphenation
    ? RES_CHRATR_NOHYPHEN
    : GetWhichOfScript(RES_CHRATR_LANGUAGE, script);
  const end = begin + length;
  for (const hint of node.GetpSwpHints()?.entries() ?? []) {
    const start = hint.GetStart();
    if (end < start) break;
    if (
      which !== hint.Which() &&
      !(
        (hint.IsCharFormatAttr() || hint.Which() === RES_TXTATR_AUTOFMT) &&
        CharFormat.IsItemIncluded(which, hint)
      )
    )
      continue;
    const limit = hint.GetEnd();
    if (length) {
      if (start >= end || begin >= limit) continue;
    } else if (begin !== start || (start !== limit && begin !== 0)) {
      if (start >= begin) continue;
      if (hint.DontExpand() ? begin >= limit : begin > limit) continue;
    }
    const item = CharFormat.GetItem(hint, which);
    if (noneIfNoHyphenation) {
      if (item instanceof SfxBoolItem && item.GetValue()) return LANGUAGE_NONE;
      continue;
    }
    if (!(item instanceof SvxLanguageItem))
      throw new Error("Writer language hint requires SvxLanguageItem.");
    const language = item.GetLanguage();
    if ((start <= begin && end <= limit) || result === LANGUAGE_DONTKNOW) result = language;
  }
  if (result === LANGUAGE_DONTKNOW && !noneIfNoHyphenation) {
    result = (node.GetSwAttrSet().Get(which) as SvxLanguageItem).GetLanguage();
    if (result === LANGUAGE_DONTKNOW) result = getConfiguredSystemLanguage();
  }
  return result;
}

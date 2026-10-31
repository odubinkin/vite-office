/** @fileoverview Consumed native ParseStyleOptions class/ID/inline declaration order from htmlcss1.cxx. */
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { LANGUAGE_DONTKNOW } from "../../../../i18nlangtag/inc/lang";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import * as H from "../../../inc/hintids";
import type { SwHTMLParser } from "./swhtml";
import { SwCSS1Parser } from "./htmlcss1";
import type { SvxCSS1PropertyInfo } from "./svxcss1.types";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { MIN_BORDER_DIST } from "../../../inc/swtypes";
/** Original class/ID merge followed by inline CSS, LANG and DIR. @param parser - Actual parser. @param style - Inline declarations. @param id - ID. @param className - Class. @param items - Actual set. @param info - Native info. @param language - Optional original LANG value. @param direction - Optional original DIR value. @returns Whether any source option applied. */
export function ParseStyleOptions(
  parser: SwHTMLParser,
  style: string,
  id: string,
  className: string,
  items: SfxItemSet,
  info: SvxCSS1PropertyInfo,
  language?: string,
  direction?: string,
): boolean {
  let result = false;
  if (className) {
    const [name] = SwCSS1Parser.GetScriptFromClass(className);
    const entry = parser.m_pCSS1Parser.GetClass(name);
    if (entry) {
      SwCSS1Parser.MergeStyles(entry.GetItemSet(), entry.GetPropertyInfo(), items, info, false);
      result = true;
    }
  }
  if (id) {
    const entry = parser.m_pCSS1Parser.GetId(id);
    if (entry)
      SwCSS1Parser.MergeStyles(
        entry.GetItemSet(),
        entry.GetPropertyInfo(),
        items,
        info,
        !!className,
      );
    info.m_aId = id;
    result = true;
  }
  if (style) {
    parser.m_pCSS1Parser.ParseStyleOption(style, items, info);
    result = true;
  }
  if (result) info.SetBoxItem(items, MIN_BORDER_DIST);
  if (language) {
    const value = LanguageTag.convertToLanguageTypeWithFallback(unicode(language));
    if (value !== LANGUAGE_DONTKNOW) {
      const item = new SvxLanguageItem(value, H.RES_CHRATR_LANGUAGE);
      try {
        for (const which of [
          H.RES_CHRATR_LANGUAGE,
          H.RES_CHRATR_CJK_LANGUAGE,
          H.RES_CHRATR_CTL_LANGUAGE,
        ]) {
          item.SetWhich(which);
          items.Put(item);
        }
      } finally {
        item.Dispose();
      }
      result = true;
    }
  }
  if (direction) {
    const name = direction.replace(
      /[A-Z]/g,
      /** Native ASCII-only case fold. @param value - ASCII uppercase unit. @returns Lowercase unit. */ (
        value,
      ) => value.toLowerCase(),
    );
    const value =
      name === "ltr"
        ? SvxFrameDirection.Horizontal_LR_TB
        : name === "rtl"
          ? SvxFrameDirection.Horizontal_RL_TB
          : SvxFrameDirection.Environment;
    if (value !== SvxFrameDirection.Environment) {
      const item = new SvxFrameDirectionItem(value, H.RES_FRAMEDIR);
      try {
        items.Put(item);
      } finally {
        item.Dispose();
      }
      result = true;
    }
  }
  return result;
}

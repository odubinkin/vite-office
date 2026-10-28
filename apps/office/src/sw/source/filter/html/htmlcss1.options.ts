/** @fileoverview Consumed native ParseStyleOptions class/ID/inline declaration order from htmlcss1.cxx. */
import type { SwHTMLParser } from "./swhtml";
import { SwCSS1Parser } from "./htmlcss1";
import type { SvxCSS1PropertyInfo } from "./svxcss1.types";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
/** Original map merge and ID retention followed by inline CSS. Border/language/direction producers remain separate consumed paths. @param parser - Actual parser. @param style - Inline declarations. @param id - ID. @param className - Class. @param items - Actual set. @param info - Native info. @returns Whether any source option applied. */
export function ParseStyleOptions(
  parser: SwHTMLParser,
  style: string,
  id: string,
  className: string,
  items: SfxItemSet,
  info: SvxCSS1PropertyInfo,
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
  return result;
}

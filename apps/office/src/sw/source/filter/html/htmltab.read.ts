/** @fileoverview Original fresh-table construction block of SwHTMLParser::BuildTable from htmltab.cxx. Recursive token reading/materialization remain the separate native caller responsibility; no table reader or layout result is simulated here. */
import type { SwHTMLParser } from "./swhtml";
import { HTMLTable } from "./htmltab";
import { HTMLTableOptions } from "./htmltab.options";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SvxCSS1LengthType as L } from "./svxcss1.enums";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { HtmlOptionId as O, HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
/** Original fresh-table branch reads current native lexer options, applies CSS auto-margin parent alignment, publishes the ID bookmark and installs the real intermediate table. @param parser - Actual importer. @param parentAdjust - Original inherited adjustment. @param parentHead - Original parent-header flag. @param parentSection - Original parent-section flag. @param hasToFly - Original floating admission. @returns Actual registered table. */
export function CreateHTMLTable(
  parser: SwHTMLParser,
  parentAdjust: A,
  parentHead = false,
  parentSection = false,
  hasToFly = false,
): HTMLTable {
  parser.m_xTable = null;
  let style = "";
  const options = parser.GetOptions();
  for (let i = options.length; i;) {
    const option = options[--i];
    if (option?.GetToken() === O.STYLE) style = option.GetString();
  }
  if (style) {
    const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap()),
      info = new SvxCSS1PropertyInfo();
    if (
      parser.ParseStyleOptions(style, "", "", items, info) &&
      info.m_eLeftMarginType === L.SVX_CSS1_LTYPE_AUTO &&
      info.m_eRightMarginType === L.SVX_CSS1_LTYPE_AUTO
    )
      parentAdjust = A.Center;
  }
  const tableOptions = new HTMLTableOptions(options, parentAdjust);
  if (tableOptions.aId) parser.InsertBookmark(tableOptions.aId);
  const current = new HTMLTable(parser, parentHead, parentSection, hasToFly, tableOptions);
  parser.m_xTable = current;
  parser.SaveState(T.NONE);
  return current;
}

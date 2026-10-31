/** @fileoverview Native definition-list methods split from swhtml.cxx to retain the original parser/context owner within authored module size limits. */
import type { SwHTMLParser } from "./swhtml";
import { HtmlTokenId as T, HtmlOptionId as O, getOnToken } from "../../../../svtools/inc/htmltokn";
import { HTMLAttrContext, SwHTMLAppendMode as A } from "./htmlctxt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { RES_MARGIN_TEXTLEFT } from "../../../inc/hintids";
import { SvxTextLeftMarginItem } from "../../../../editeng/inc/lrspitem";
const lists = new Set([
  T.DEFLIST_ON,
  T.DIRLIST_ON,
  T.MENULIST_ON,
  T.ORDERLIST_ON,
  T.UNORDERLIST_ON,
]);
/** Original DL open preserves shared list depth spacing and current-DD-sensitive margin accumulation. @param parser - Actual parser. @returns Nothing. */
export function NewDefList(parser: SwHTMLParser): void {
  const space = parser.GetNumInfo().GetDepth() + parser["m_nDefListDeep"] === 0;
  if (parser.m_pPam.GetPoint().GetContentIndex())
    parser.AppendTextNode(space ? A.AM_SPACE : A.AM_SOFTNOSPACE);
  else if (space) parser.AddParSpace();
  parser["m_nDefListDeep"] = (parser["m_nDefListDeep"] + 1) & 0xffff;
  let inDD = false;
  for (let index = parser.m_aContexts.length; index > parser.m_nContextStMin;) {
    const token = parser.m_aContexts[--index]?.GetToken();
    if (token === T.DD_ON) {
      inDD = true;
      break;
    }
    if (token !== undefined && lists.has(token)) break;
  }
  const context = new HTMLAttrContext(T.DEFLIST_ON),
    left: [number] = [0],
    right: [number] = [0],
    indent: [number] = [0];
  parser.GetMarginsFromContext(left, right, indent);
  if (!inDD && parser["m_nDefListDeep"] > 1) {
    const style = parser.m_xDoc.GetTextFormatColl("list-contents");
    left[0] =
      (left[0] +
        ((style.GetAttrSet().Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft() &
          0xffff)) &
      0xffff;
  }
  context.SetMargins(left[0], right[0], indent[0]);
  const style = parser["GetStyleOption"](O.STYLE),
    id = parser["GetStyleOption"](O.ID),
    cls = parser["GetStyleOption"](O.CLASS),
    language = parser["GetStyleOption"](O.LANG),
    dir = parser["GetStyleOption"](O.DIR);
  if (style || id || cls || language || dir) {
    const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
    try {
      const info = new SvxCSS1PropertyInfo();
      if (parser.ParseStyleOptions(style, id, cls, items, info, language))
        parser.InsertAttrs(items, info, context);
    } finally {
      items.Dispose();
    }
  }
  parser.PushContext(context);
  if (parser["m_nDefListDeep"] > 1) parser.SetTextCollAttrs(context);
}
/** Original DL close uses soft spacing and decrements depth even if no matching context is found. @param parser - Actual parser. @returns Nothing. */
export function EndDefList(parser: SwHTMLParser): void {
  const space = parser.GetNumInfo().GetDepth() + parser["m_nDefListDeep"] === 1;
  if (parser.m_pPam.GetPoint().GetContentIndex())
    parser.AppendTextNode(space ? A.AM_SPACE : A.AM_SOFTNOSPACE);
  else if (space) parser.AddParSpace();
  if (parser["m_nDefListDeep"]) --parser["m_nDefListDeep"];
  const context = parser.PopContext(T.DEFLIST_ON);
  if (context) {
    parser.EndContext(context);
    parser.SetAttr();
  }
  parser.SetTextCollAttrs();
}
/** Original DT/DD open scans only the current list scope and creates implicit depth without a synthetic DL context. @param parser - Actual parser. @param token - Opening item. @returns Nothing. */
export function NewDefListItem(parser: SwHTMLParser, token: T): void {
  let inside = false;
  for (let index = parser.m_aContexts.length; index > parser.m_nContextStMin;) {
    const type = parser.m_aContexts[--index]?.GetToken();
    if (type === T.DEFLIST_ON) {
      inside = true;
      break;
    }
    if (type !== undefined && lists.has(type)) break;
  }
  if (!inside) {
    parser["m_nDefListDeep"] = (parser["m_nDefListDeep"] + 1) & 0xffff;
    parser["m_nOpenParaToken"] = token;
  }
  parser.NewTextFormatColl(token, token === T.DD_ON ? P.COLL_HTML_DD : P.COLL_HTML_DT);
}
/** Original item close searches through inline contexts but cannot cross a list boundary; explicit closes do not append a paragraph. @param parser - Actual parser. @param token - Matching close or NONE. @returns Nothing. */
export function EndDefListItem(parser: SwHTMLParser, token = T.NONE): void {
  if (token === T.NONE && parser.m_pPam.GetPoint().GetContentIndex())
    parser.AppendTextNode(A.AM_SOFTNOSPACE);
  const opening = getOnToken(token);
  for (let index = parser.m_aContexts.length; index > parser.m_nContextStMin;) {
    const candidate = parser.m_aContexts[--index] as HTMLAttrContext,
      type = candidate.GetToken();
    if (lists.has(type)) break;
    if ((type === T.DD_ON || type === T.DT_ON) && (opening === T.NONE || opening === type)) {
      parser.m_aContexts.splice(index, 1);
      parser.EndContext(candidate);
      parser.SetAttr();
      break;
    }
  }
}
/** Original NextToken definition-list cases preserve EndPara versus EndDefListItem ordering. @param parser - Actual parser. @param token - Current native token. @returns Whether consumed. */
export function DispatchDefList(parser: SwHTMLParser, token: T): boolean {
  if (token === T.DEFLIST_ON || token === T.DEFLIST_OFF) {
    if (parser["m_nOpenParaToken"] !== T.NONE) parser.EndPara();
    if (token === T.DEFLIST_ON) NewDefList(parser);
    else {
      EndDefListItem(parser);
      EndDefList(parser);
    }
    return true;
  }
  if (token === T.DD_ON || token === T.DT_ON) {
    if (parser["m_nOpenParaToken"] !== T.NONE) parser.EndPara();
    EndDefListItem(parser);
    NewDefListItem(parser, token);
    return true;
  }
  if (token === T.DD_OFF || token === T.DT_OFF) {
    EndDefListItem(parser, token);
    return true;
  }
  return false;
}

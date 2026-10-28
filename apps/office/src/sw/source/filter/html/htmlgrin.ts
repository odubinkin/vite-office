/** @fileoverview Native no-HREF anchor context/name and deferred bookmark producers from htmlgrin.cxx. URL-bearing hyperlink production remains a separate pending consumer. */
import type { SwHTMLParser } from "./swhtml";
import { HTMLAttr } from "./swhtml.attr";
import { HTMLAttrContext } from "./htmlctxt";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { HtmlTokenId as T, HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import { RES_FLTR_BOOKMARK } from "../../../inc/hintids";
import { cMarkSeparator } from "../../../inc/swtypes";
import { decodeUnambiguous } from "../../../../tools/source/fsys/urlobj";
import { cssAsciiLower } from "./svxcss1.properties";
/** Native point-bookmark producer appends to the actual pending queue with no table/head ownership. @param parser - Actual parser. @param name - Source name. @returns Nothing. */
export function InsertBookmark(parser: SwHTMLParser, name: string): void {
  const item = new SfxStringItem(RES_FLTR_BOOKMARK, name);
  try {
    parser.m_aSetAttrTab.push(new HTMLAttr(parser.m_pPam.GetPoint(), item, null, null));
  } finally {
    item.Dispose();
  }
}
/** Consumed native anchor context, style/ID and no-HREF named-target branch; it never treats a URL-bearing anchor name as a standalone bookmark. @param parser - Actual parser. @returns Nothing. */
export function NewAnchor(parser: SwHTMLParser): void {
  const old = parser.PopContext(T.ANCHOR_ON);
  if (old) parser.EndContext(old);
  let name = "",
    style = "",
    id = "",
    className = "",
    hasHref = false;
  for (const option of [...parser.GetOptions()].reverse()) {
    switch (option.GetToken()) {
      case O.NAME:
        name = option.GetString();
        break;
      case O.ID:
        id = option.GetString();
        break;
      case O.STYLE:
        style = option.GetString();
        break;
      case O.CLASS:
        className = option.GetString();
        break;
      case O.HREF:
        hasHref = true;
        break;
    }
  }
  if (name) {
    const decoded = decodeUnambiguous(name),
      index = decoded.lastIndexOf(cMarkSeparator);
    if (index !== -1) {
      const suffix = cssAsciiLower(decoded.slice(index + 1).replaceAll(" ", ""));
      if (["region", "frame", "graphic", "ole", "table", "outline", "text"].includes(suffix))
        name = "";
    }
  }
  const context = new HTMLAttrContext(T.ANCHOR_ON);
  if (style || id || className) {
    const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
    try {
      const info = new SvxCSS1PropertyInfo();
      if (parser.ParseStyleOptions(style, id, className, items, info))
        parser.InsertAttrs(items, info, context, true);
    } finally {
      items.Dispose();
    }
  }
  // Native HREF anchors produce SwFormatINetFormat rather than a point mark;
  // SmartRel2Abs and that producer are not implemented in this fragment.
  if (!hasHref && name) parser.InsertBookmark(name);
  parser.PushContext(context);
}

/** @fileoverview Native anchor context, URI-backed internet attributes and deferred bookmark producers from htmlgrin.cxx. */
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
import { SwCSS1Parser } from "./htmlcss1";
import { INetURLObject } from "../../../../tools/source/fsys/urlobj.object";
import { SmartRel2Abs } from "../../../../svl/source/misc/urihelper";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
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
/** Native anchor context, style/ID and hyperlink-versus-point-target production for the represented document slice. @param parser - Actual parser. @returns Nothing. */
export function NewAnchor(parser: SwHTMLParser): void {
  const old = parser.PopContext(T.ANCHOR_ON);
  if (old) parser.EndContext(old);
  let name = "",
    style = "",
    id = "",
    className = "",
    hasHref = false,
    href = "",
    target = "";
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
        href = option.GetString();
        hasHref = true;
        break;
      case O.TARGET:
        target = option.GetString();
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
  const [strippedClass] = SwCSS1Parser.GetScriptFromClass(className, false);
  if (style || id || strippedClass) {
    const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
    try {
      const info = new SvxCSS1PropertyInfo();
      if (parser.ParseStyleOptions(style, id, className, items, info))
        parser.InsertAttrs(items, info, context, true);
    } finally {
      items.Dispose();
    }
  }
  if (hasHref) {
    href = href
      ? SmartRel2Abs(new INetURLObject(parser.m_sBaseURL), href, null, false)
      : new INetURLObject(parser.m_aPathToFile).GetPartBeforeLastName();
    parser.m_pCSS1Parser.SetATagStyles();
    const item = new SwFormatINetFormat(href, target);
    try {
      item.SetName(name);
      parser.InsertAttr(parser.m_xAttrTab.pINetFormat, item, context);
    } finally {
      item.Dispose();
    }
  } else if (name) parser.InsertBookmark(name);
  parser.PushContext(context);
}

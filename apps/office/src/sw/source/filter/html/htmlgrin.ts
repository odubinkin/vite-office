/** @fileoverview Native anchor context, URI-backed internet attributes and deferred bookmark producers from htmlgrin.cxx. */
import type { SwHTMLParser } from "./swhtml";
import type { HTMLTable } from "./htmltab";
import { SwContentNode } from "../../core/docnode/node";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwNodes } from "../../core/docnode/nodes";
import { SwNodeIndex, SwPaM, SwPosition } from "../../core/crsr/pam";
import { CutTextToEnd } from "../../core/txtnode/ndtxt-join";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import * as H from "../../../inc/hintids";

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
    target = "",
    language = "";
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
      case O.LANG:
        language = option.GetString();
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
  if (style || id || strippedClass || language) {
    const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
    try {
      const info = new SvxCSS1PropertyInfo();
      if (parser.ParseStyleOptions(style, id, className, items, info, language))
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

/** Original CanRemoveNode admits preceding content. Transparent SwSectionNode is not represented by the current fixed/table/cell section types. @param parser - Actual importer. @param index - Current actual node offset. @returns Original admission for represented node kinds. */
export function CanRemoveNode(parser: SwHTMLParser, index: number): boolean {
  return parser.m_xDoc.GetNodes().at(index - 1) instanceof SwContentNode;
}
/** Original cleanup closes pending attributes before deleting, moves complete contents with CutText, repositions actual marks in source order and finally resets the cursor mark. The explicit table borrows the original current-table field across the source fragment split. @param parser - Actual importer. @param current - Actual current table, or null outside tables. @returns Nothing. */
export function StripTrailingPara(parser: SwHTMLParser, current: HTMLTable | null): void {
  const pam = parser.m_pPam,
    point = pam.GetPoint(),
    node = point.GetNode(),
    nodes = parser.m_xDoc.GetNodes(),
    index = node.GetIndex();
  let smallFont = false;
  if (!point.GetContentIndex()) {
    if (
      node instanceof SwContentNode &&
      node.StartOfSectionNode().GetIndex() + 2 <
        node.StartOfSectionNode().EndOfSectionNode().GetIndex() &&
      CanRemoveNode(parser, index)
    ) {
      parser.SetAttr(false);
      if (node instanceof SwTextNode && node.Len()) {
        const previous = nodes.at(index - 1);
        if (previous instanceof SwTextNode) CutTextToEnd(node, previous);
      }
      const access = parser.m_xDoc.GetIDocumentMarkAccess();
      for (const mark of access.GetAllMarks()) {
        const markIndex = mark.GetMarkPos().GetNodeIndex();
        if (markIndex === index) {
          const previousIndex = new SwNodeIndex(point.GetNode()),
            previous = SwNodes.GoPrevious(previousIndex);
          if (!previous) return;
          const position = new SwPosition(previous, previous.Len()),
            range = new SwPaM(position);
          position.Dispose();
          try {
            access.RepositionMark(mark, range);
          } finally {
            range.Dispose();
          }
        } else if (markIndex > index) break;
      }
      const deleted = point.GetNode(),
        previous = SwNodes.GoPrevious(point);
      if (!previous) throw new Error("assert(trailing paragraph predecessor)");
      point.SetContent(previous.Len());
      pam.SetMark();
      pam.DeleteMark();
      if (!(deleted instanceof SwTextNode))
        throw new Error("Unsupported non-text paragraph deletion");
      nodes.removeTextNode(deleted);
    } else if (node instanceof SwTextNode && current) smallFont = true;
  }
  // Nonempty as-character-graphic-only cells require the unrepresented FLYCNT owner.
  if (smallFont && node instanceof SwTextNode) {
    for (const which of [
      H.RES_CHRATR_FONTSIZE,
      H.RES_CHRATR_CJK_FONTSIZE,
      H.RES_CHRATR_CTL_FONTSIZE,
    ]) {
      const item = new SvxFontHeightItem(40, 100, which);
      try {
        node.SetAttr(item);
      } finally {
        item.Dispose();
      }
    }
  }
}

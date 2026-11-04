/** @fileoverview Native consumed InsertAttrs context margins, spacing and deferred item insertion from htmlctxt.cxx. */
import type { SwHTMLParser } from "./swhtml";
import { HTMLAttrContext } from "./htmlctxt";
import { NewAttr, InsertAttrAtPoint, type HTMLAttrHead } from "./swhtml.attr";
import type { SvxCSS1PropertyInfo } from "./svxcss1.types";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
  SvxIndentValue,
} from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import * as H from "../../../inc/hintids";
/** Native consumed context arithmetic followed by original item-head dispatch. @param parser - Actual parser owner. @param items - Native item set. @param info - Native CSS flags. @param context - New unpushed context. @param charLevel - Original character-level selector. @returns Nothing. */
export function InsertAttrs(
  parser: SwHTMLParser,
  items: SfxItemSet,
  info: SvxCSS1PropertyInfo,
  context: HTMLAttrContext,
  charLevel: boolean,
): void {
  if (!charLevel) parser.m_pCSS1Parser.SetFormatBreak(items, info);
  const oldLeft: [number] = [0],
    oldRight: [number] = [0],
    oldIndent: [number] = [0];
  parser.GetMarginsFromContext(oldLeft, oldRight, oldIndent, parser.m_aContexts.at(-1) === context);
  const left: [number] = [oldLeft[0]],
    right: [number] = [oldRight[0]],
    indent: [number] = [oldIndent[0]];
  context.GetMargins(left, right, indent);
  if (info.m_bLeftMargin)
    left[0] =
      info.m_nLeftMargin < 0 && -info.m_nLeftMargin > oldLeft[0]
        ? 0
        : (oldLeft[0] + (info.m_nLeftMargin & 0xffff)) & 0xffff;
  if (info.m_bRightMargin)
    right[0] =
      info.m_nRightMargin < 0 && -info.m_nRightMargin > oldRight[0]
        ? 0
        : (oldRight[0] + (info.m_nRightMargin & 0xffff)) & 0xffff;
  const first = items.GetItemIfSet(H.RES_MARGIN_FIRSTLINE, false);
  if (info.m_bTextIndent && first instanceof SvxFirstLineIndentItem)
    indent[0] = first.ResolveTextFirstLineOffset();
  context.SetMargins(left[0], right[0], indent[0]);
  const tab = parser.m_xAttrTab;
  for (const [head, item] of [
    [
      tab.pFirstLineIndent,
      new SvxFirstLineIndentItem(SvxIndentValue.twips(indent[0]), H.RES_MARGIN_FIRSTLINE),
    ],
    [
      tab.pTextLeftMargin,
      new SvxTextLeftMarginItem(SvxIndentValue.twips(left[0]), H.RES_MARGIN_TEXTLEFT),
    ],
    [tab.pRightMargin, new SvxRightMarginItem(SvxIndentValue.twips(right[0]), H.RES_MARGIN_RIGHT)],
  ] as readonly (readonly [HTMLAttrHead, SfxPoolItem])[]) {
    try {
      if (NewAttr(parser, tab, head, item) && head[0]) parser.EndAttr(head[0], false);
    } finally {
      item.Dispose();
    }
  }
  for (const item of items.entries()) {
    if (item instanceof SvxFontHeightItem && item.GetProp() !== 100) continue;
    if (item instanceof SvxULSpaceItem && (!info.m_bTopMargin || !info.m_bBottomMargin)) {
      const upper: [number] = [0],
        lower: [number] = [0];
      parser.GetULSpaceFromContext(upper, lower);
      const copy = item.Clone();
      try {
        if (!info.m_bTopMargin) copy.SetUpper(upper[0]);
        if (!info.m_bBottomMargin) copy.SetLower(lower[0]);
        parser.InsertAttr(tab.pULSpace, copy, context);
        context.SetULSpace(copy.GetUpper(), copy.GetLower());
      } finally {
        copy.Dispose();
      }
      continue;
    }
    if (item.Which() === H.RES_BACKGROUND) {
      // The current model owns paragraph RES_BACKGROUND but has no native
      // RES_CHRATR_BACKGROUND. Do not substitute the distinct highlight item.
      if (!charLevel) parser.InsertAttr(tab.pBrush, item, context);
      continue;
    }
    if (item.Which() === H.RES_BOX) {
      // Native character-level conversion requires RES_CHRATR_BOX, which this core
      // does not own. A paragraph box is not a substitute for that character item.
      if (!charLevel) parser.InsertAttr(tab.pBox, item, context);
      continue;
    }
    const head = GetAttrTabEntry(parser, item.Which());
    if (head) parser.InsertAttr(head, item, context);
  }
  if (info.m_aId) parser.InsertBookmark(info.m_aId);
}

import { GetAttrTabEntry } from "./htmlcss1.attr";

/** Original InsertAttr overload dispatch across htmlctxt.cxx/swhtml.cxx responsibility fragments; context and point attributes retain their original ownership. @param parser - Actual importer. @param headOrItem - Native head or item. @param itemOrAtStart - Item or queue-front selector. @param context - Actual context for head form. @returns Nothing. */
export function InsertAttr(
  parser: SwHTMLParser,
  headOrItem: HTMLAttrHead | SfxPoolItem,
  itemOrAtStart: SfxPoolItem | boolean,
  context?: HTMLAttrContext,
): void {
  if (typeof itemOrAtStart === "boolean")
    InsertAttrAtPoint(parser, headOrItem as SfxPoolItem, itemOrAtStart);
  else {
    if (!context) throw new Error("assert(HTML attribute context)");
    const head = headOrItem as HTMLAttrHead;
    if (NewAttr(parser, parser.m_xAttrTab, head, itemOrAtStart) && head[0])
      context.GetAttrs().push(head[0]);
  }
}

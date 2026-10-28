/** @fileoverview Native consumed InsertAttrs context margins, spacing and deferred item insertion from htmlctxt.cxx. */
import type { SwHTMLParser } from "./swhtml";
import { HTMLAttrContext } from "./htmlctxt";
import { NewAttr, type HTMLAttrHead } from "./swhtml.attr";
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
  const heads = new Map<number, HTMLAttrHead>([
    [H.RES_CHRATR_WEIGHT, tab.pBold],
    [H.RES_CHRATR_CJK_WEIGHT, tab.pBoldCJK],
    [H.RES_CHRATR_CTL_WEIGHT, tab.pBoldCTL],
    [H.RES_CHRATR_POSTURE, tab.pItalic],
    [H.RES_CHRATR_CJK_POSTURE, tab.pItalicCJK],
    [H.RES_CHRATR_CTL_POSTURE, tab.pItalicCTL],
    [H.RES_CHRATR_FONTSIZE, tab.pFontHeight],
    [H.RES_CHRATR_CJK_FONTSIZE, tab.pFontHeightCJK],
    [H.RES_CHRATR_CTL_FONTSIZE, tab.pFontHeightCTL],
    [H.RES_CHRATR_FONT, tab.pFont],
    [H.RES_CHRATR_CJK_FONT, tab.pFontCJK],
    [H.RES_CHRATR_CTL_FONT, tab.pFontCTL],
    [H.RES_PARATR_LINESPACING, tab.pLineSpacing],
    [H.RES_CHRATR_UNDERLINE, tab.pUnderline],
    [H.RES_CHRATR_COLOR, tab.pFontColor],
    [H.RES_CHRATR_CROSSEDOUT, tab.pStrike],
    [H.RES_PARATR_ADJUST, tab.pAdjust],
    [H.RES_MARGIN_FIRSTLINE, tab.pFirstLineIndent],
    [H.RES_MARGIN_TEXTLEFT, tab.pTextLeftMargin],
    [H.RES_MARGIN_RIGHT, tab.pRightMargin],
    [H.RES_UL_SPACE, tab.pULSpace],
  ]);
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
    const head = heads.get(item.Which());
    if (head) parser.InsertAttr(head, item, context);
  }
  if (info.m_aId) parser.InsertBookmark(info.m_aId);
}

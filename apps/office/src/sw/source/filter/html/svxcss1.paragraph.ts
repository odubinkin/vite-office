/** @fileoverview Native CSS1 text-indent, margin and paragraph background-color handlers from svxcss1.cxx. */
import { CSS1Token as T, type ConstCSS1Expression } from "./parcss1.h";
import { aItemIds } from "./svxcss1";
import type { SvxCSS1PropertyInfo } from "./svxcss1.types";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
  SvxIndentValue,
} from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { Color, COL_TRANSPARENT } from "../../../../tools/inc/color";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT } from "../../../inc/hintids";
import { cssAsciiLower } from "./svxcss1.properties";
/** Native admitted margin length; bare numbers and percentages do not produce a value. @param expression - Native expression. @returns Twips or absent. */
function marginLength(expression: ConstCSS1Expression): number | undefined {
  if (expression.GetType() === T.LENGTH) return expression.GetSLength();
  if (expression.GetType() === T.PIXLENGTH) {
    const pixels = expression.GetNumber();
    if (pixels < 2147483647 / 2 && pixels > -2147483648 / 2) return Math.trunc(pixels) * 15;
  }
  return undefined;
}
/** Source side setters retain signed property info separately from unsigned item values. @param side - Top/right/bottom/left. @param value - Twips. @param set - Actual set. @param info - Actual flags. @returns Nothing. */
function marginSide(side: number, value: number, set: SfxItemSet, info: SvxCSS1PropertyInfo): void {
  const narrowed = Math.max(0, value) & 0xffff;
  if (side === 1 || side === 3) {
    const item =
      side === 3
        ? new SvxTextLeftMarginItem(SvxIndentValue.twips(narrowed), RES_MARGIN_TEXTLEFT)
        : new SvxRightMarginItem(SvxIndentValue.twips(narrowed), RES_MARGIN_RIGHT);
    try {
      set.Put(item);
    } finally {
      item.Dispose();
    }
    if (side === 3) {
      info.m_bLeftMargin = true;
      info.m_nLeftMargin = value;
    } else {
      info.m_bRightMargin = true;
      info.m_nRightMargin = value;
    }
  } else {
    const old = set.GetItemIfSet(aItemIds.nULSpace, false);
    const item =
      old instanceof SvxULSpaceItem ? old.Clone() : new SvxULSpaceItem(aItemIds.nULSpace);
    if (side === 0) {
      item.SetUpper(narrowed);
      info.m_bTopMargin = true;
    } else {
      item.SetLower(narrowed);
      info.m_bBottomMargin = true;
    }
    try {
      set.Put(item);
    } finally {
      item.Dispose();
    }
  }
}
/** Consumed native paragraph-property dispatch, preserving source token admission and nontransactional shorthand behavior. @param property - Folded property. @param expression - Native chain. @param set - Actual target. @param info - Native flags. @returns Whether property recognized. */
export function ParseCSS1ParagraphProperty(
  property: string,
  expression: ConstCSS1Expression,
  set: SfxItemSet,
  info: SvxCSS1PropertyInfo,
): boolean {
  if (property === "background-color") {
    const color = new Color(),
      type = expression.GetType();
    let transparent = false,
      valid = false;
    if (type === T.RGB) valid = expression.GetColor(color);
    else if ([T.IDENT, T.HEXCOLOR, T.STRING].includes(type)) {
      transparent = cssAsciiLower(expression.GetString()) === "transparent";
      if (!transparent) valid = expression.GetColor(color);
    }
    if (transparent || valid) {
      const item = new SvxBrushItem(transparent ? COL_TRANSPARENT : color, aItemIds.nBrush);
      try {
        set.Put(item);
      } finally {
        item.Dispose();
      }
    }
    return true;
  }
  if (property === "text-indent") {
    let indent: number | undefined;
    if (expression.GetType() === T.LENGTH) {
      const value = expression.GetNumber();
      const rounded = Math.sign(value) * Math.round(Math.abs(value));
      indent = Math.max(-32768, Math.min(32767, rounded));
    } else if (expression.GetType() === T.PIXLENGTH) {
      const value = marginLength(expression);
      if (value !== undefined) indent = (value << 16) >> 16;
    }
    if (indent !== undefined) {
      const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(indent), RES_MARGIN_FIRSTLINE);
      try {
        set.Put(item);
      } finally {
        item.Dispose();
      }
      info.m_bTextIndent = true;
    }
    return true;
  }
  const side = ["margin-top", "margin-right", "margin-bottom", "margin-left"].indexOf(property);
  if (side !== -1) {
    if ((side === 1 || side === 3) && expression.GetString() === "auto") {
      if (side === 3) {
        info.m_bLeftMargin = true;
        info.m_eLeftMarginType = 1;
      } else {
        info.m_bRightMargin = true;
        info.m_eRightMarginType = 1;
      }
    }
    const value = marginLength(expression);
    if (value !== undefined) marginSide(side, value, set, info);
    return true;
  }
  if (property !== "margin") return false;
  const values: (number | undefined)[] = [undefined, undefined, undefined, undefined];
  let current: ConstCSS1Expression | undefined = expression;
  for (
    let index = 0;
    current && index < 4 && !current.GetOp();
    ++index, current = current.GetNext()
  ) {
    const value = marginLength(current);
    if (value === undefined) continue;
    if (index === 0) values.fill(value);
    else if (index === 1) values[1] = values[3] = value;
    else values[index] = value;
  }
  for (const side of [3, 1, 0, 2]) {
    const value = values[side];
    if (value !== undefined) marginSide(side, value, set, info);
  }
  return true;
}

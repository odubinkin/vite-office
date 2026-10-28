/** @fileoverview Native lcl_GetAttribHeight standard layout arithmetic; script-specific, wrapped and rotated device layout remains unported. */
import type { ScPatternAttr } from "../../../inc/patattr";
import {
  ATTR_FONT_HEIGHT,
  ATTR_CJK_FONT_HEIGHT,
  ATTR_CTL_FONT_HEIGHT,
  ATTR_FONT_EMPHASISMARK,
  ATTR_MARGIN,
  ATTR_LINEBREAK,
  ATTR_STACKED,
  ATTR_ROTATE_VALUE,
  ATTR_HOR_JUSTIFY,
} from "../../../inc/scitems";
import type { SvxFontHeightItem } from "../../../../editeng/source/items/textitem";
import type { SvxEmphasisMarkItem } from "../../../../editeng/source/items/textitem.effects";
import type { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify } from "../../../../editeng/inc/svxenum";
import type { SvxMarginItem } from "../../../../svx/inc/algitem";
import { FontEmphasisMark } from "../../../../tools/inc/fontenum";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { ScRotateValueItem } from "../../../inc/attrib";
import { STD_ROWHEIGHT_DIFF } from "../../../inc/global";
/** Identifies the current uniform-script, unwrapped and unrotated standard path without guessing glyph scripts or metrics. @param pattern - Actual attributes. @returns Whether the represented algorithm applies. */
export function supportsStandardRowHeight(pattern: ScPatternAttr): boolean {
  const height = (pattern.GetItem(ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight();
  return (
    height === (pattern.GetItem(ATTR_CJK_FONT_HEIGHT) as SvxFontHeightItem).GetHeight() &&
    height === (pattern.GetItem(ATTR_CTL_FONT_HEIGHT) as SvxFontHeightItem).GetHeight() &&
    (pattern.GetItem(ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue() !==
      SvxCellHorJustify.Block &&
    !(pattern.GetItem(ATTR_LINEBREAK) as SfxBoolItem).GetValue() &&
    !(pattern.GetItem(ATTR_STACKED) as SfxBoolItem).GetValue() &&
    (pattern.GetItem(ATTR_ROTATE_VALUE) as ScRotateValueItem).GetValue() === 0
  );
}
/** Original attribute-only standard row height, retaining native UInt16 arithmetic. Float conversion outside the native representable domain is not certified. @param pattern - Actual attributes. @param fontHeightId - Script height identity. @param minHeight - Minimum twips. @returns UInt16 height. */
export function lcl_GetAttribHeight(
  pattern: ScPatternAttr,
  fontHeightId: number,
  minHeight: number,
): number {
  let height = (pattern.GetItem(fontHeightId) as SvxFontHeightItem).GetHeight() & 0xffff;
  height = Math.trunc(height * 1.18) & 0xffff;
  if (
    (pattern.GetItem(ATTR_FONT_EMPHASISMARK) as SvxEmphasisMarkItem).GetEmphasisMark() !==
    FontEmphasisMark.NONE
  )
    height = (height + Math.trunc(height / 4)) & 0xffff;
  const margin = pattern.GetItem(ATTR_MARGIN) as SvxMarginItem;
  height = (height + margin.GetTopMargin() + margin.GetBottomMargin()) & 0xffff;
  if (height > STD_ROWHEIGHT_DIFF) height -= STD_ROWHEIGHT_DIFF;
  if (height < minHeight) height = minHeight;
  return height;
}

import type { ScColumn } from "../../../inc/column";
import { ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
/** Original column2.cxx applies the format through the real pooled attribute path. @param this - Actual column. @param row - Row. @param key - Formatter key. @returns Nothing. */
export function SetNumberFormat(this: ScColumn, row: number, key: number): void {
  const item = new SfxUInt32Item(ATTR_VALUE_FORMAT, key);
  try {
    this.ApplyAttr(row, item);
  } finally {
    item.Dispose();
  }
}

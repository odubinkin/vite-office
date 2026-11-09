/** @fileoverview Native non-graphic SvxBrushItem and DrawingLayer fill conversion from unobrushitemhelper.cxx. */
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import {
  XATTR_FILLCOLOR,
  XATTR_FILLSTYLE,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILL_FIRST,
  XATTR_FILL_LAST,
} from "../../inc/xdef";
import { XFillStyleItem } from "../../inc/xfillit0";
import { XFillColorItem } from "../../inc/xflclit";
import { XFillTransparenceItem } from "../../inc/xfltrit";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import { COL_AUTO, Color } from "../../../tools/inc/color";
/** Converts every represented brush constructor/value state through the original GPOS_NONE branch.
 * @param brush - Actual non-graphic brush; graphics are not represented by this kernel's SvxBrushItem.
 * @param target - Actual destination item set.
 * @returns Nothing.
 */
export function setSvxBrushItemAsFillAttributesToTargetSet(
  brush: SvxBrushItem,
  target: SfxItemSet,
): void {
  // Preserve the original exclusive upper bound despite the inclusive fill range.
  for (
    let which = XATTR_FILL_FIRST as number;
    target.Count() !== 0 && which < XATTR_FILL_LAST;
    which++
  )
    target.ClearItem(which);
  const transparency = 255 - brush.GetColor().GetAlpha();
  if (transparency !== 0xff) {
    target.Put(new XFillStyleItem(FillStyle.SOLID));
    const color = new XFillColorItem("", brush.GetColor().GetRGBColor());
    color.setComplexColor(brush.getComplexColor());
    target.Put(color);
    target.Put(new XFillTransparenceItem(Math.trunc((transparency * 100 + 127) / 254)));
  } else {
    target.Put(new XFillStyleItem(FillStyle.NONE));
    target.Put(new XFillColorItem("", brush.GetColor().GetRGBColor()));
  }
}

/** Projects the native solid or absent drawing fill to an owned brush. @param source - Actual drawing item set. @param which - Native brush Which. @param searchInParents - Original inheritance selector. @param xmlImportHack - Original transparent color retention flag. @returns Native brush. */
export function getSvxBrushItemFromSourceSet(
  source: SfxItemSet,
  which: number,
  searchInParents = true,
  xmlImportHack = false,
): SvxBrushItem {
  const style = source.GetItemIfSet(XATTR_FILLSTYLE, searchInParents) as XFillStyleItem | undefined;
  const fill = source.Get(XATTR_FILLCOLOR, searchInParents) as XFillColorItem;
  const color = new Color(fill.GetColorValue());
  if (!style || style.GetValue() === FillStyle.NONE) {
    if (!xmlImportHack && color.toUInt32() !== 0) color.assign(COL_AUTO);
    color.SetAlpha(0);
    return new SvxBrushItem(color, which);
  }
  if (style.GetValue() !== FillStyle.SOLID) return new SvxBrushItem(which);
  const transparency = (
    source.Get(XATTR_FILLTRANSPARENCE, searchInParents) as XFillTransparenceItem
  ).GetValue();
  if (transparency)
    color.SetAlpha(255 - Math.min(254, Math.trunc((transparency * 254) / 100) & 0xff));
  return new SvxBrushItem(color, fill.getComplexColor(), which);
}

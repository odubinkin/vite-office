/** @fileoverview Native non-graphic SvxBrushItem to DrawingLayer fill conversion from unobrushitemhelper.cxx. */
import type { SvxBrushItem } from "../../../editeng/inc/brushitem";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import { XATTR_FILL_FIRST, XATTR_FILL_LAST } from "../../inc/xdef";
import { XFillStyleItem } from "../../inc/xfillit0";
import { XFillColorItem } from "../../inc/xflclit";
import { XFillTransparenceItem } from "../../inc/xfltrit";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
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

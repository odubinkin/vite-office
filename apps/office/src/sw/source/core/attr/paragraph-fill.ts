/** @fileoverview Resolves Writer paragraph DrawingLayer fill and legacy brush attributes. */
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { XATTR_FILLCOLOR, XATTR_FILLSTYLE, XATTR_FILLTRANSPARENCE } from "../../../../svx/inc/xdef";
import { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import type { XFillColorItem } from "../../../../svx/inc/xflclit";
import { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import { setSvxBrushItemAsFillAttributesToTargetSet } from "../../../../svx/source/unodraw/unobrushitemhelper";
import { RES_BACKGROUND } from "../../../inc/hintids";

/** Owns the converted native item values for the represented fill modes. */
export interface ParagraphFillItems {
  readonly style: XFillStyleItem;
  readonly color: XFillColorItem;
  readonly transparency: XFillTransparenceItem;
}

/** Adapts a local brush through the existing native DrawingLayer conversion. @param scope - Local item set. @returns Converted brush value or none when it is absent or a drawing fill is authored. */
export function getLocalParagraphBrushFill(scope: SfxItemSet): ParagraphFillItems | undefined {
  if (scope.GetItemIfSet(XATTR_FILLSTYLE, false)) return undefined;
  const brush = scope.GetItemIfSet(RES_BACKGROUND, false);
  if (!(brush instanceof SvxBrushItem)) return undefined;
  const pool = scope.GetPool();
  const set = new SfxItemSet(pool, [
    [XATTR_FILLSTYLE, XATTR_FILLCOLOR],
    [XATTR_FILLTRANSPARENCE, XATTR_FILLTRANSPARENCE],
  ]);
  try {
    setSvxBrushItemAsFillAttributesToTargetSet(brush, set);
    const style = brush.GetGraphic()
      ? new XFillStyleItem(FillStyle.BITMAP)
      : (set.Get(XATTR_FILLSTYLE) as XFillStyleItem).Clone();
    return {
      style,
      color: (set.Get(XATTR_FILLCOLOR) as XFillColorItem).Clone(),
      transparency: (set.Get(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).Clone(),
    };
  } finally {
    set.Dispose();
  }
}

/** Borrows current native values and resolves old brush-based styles at the same scope. @param items - Effective paragraph item set. @returns Current native fill attributes. */
export function getParagraphFillItems(items: SfxItemSet): ParagraphFillItems {
  let transparency: XFillTransparenceItem | undefined;
  for (let scope: SfxItemSet | undefined = items; scope; scope = scope.GetParent()) {
    transparency ??= scope.GetItemIfSet(XATTR_FILLTRANSPARENCE, false) as
      XFillTransparenceItem | undefined;
    const style = scope.GetItemIfSet(XATTR_FILLSTYLE, false) as XFillStyleItem | undefined;
    if (style)
      return {
        style,
        color: items.Get(XATTR_FILLCOLOR) as XFillColorItem,
        transparency: transparency ?? (items.Get(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem),
      };
    const brush = getLocalParagraphBrushFill(scope);
    if (brush) return { ...brush, transparency: transparency ?? brush.transparency };
  }
  return {
    style: new XFillStyleItem(FillStyle.NONE),
    color: items.Get(XATTR_FILLCOLOR) as XFillColorItem,
    transparency: transparency ?? new XFillTransparenceItem(),
  };
}

/** Compares a formatting delta with the effective Writer paragraph item. @param paragraph - Actual selection node. @param item - Requested item. @returns Whether the value is already effective. */
export function paragraphFormattingItemEquals(paragraph: SwTextNode, item: SfxPoolItem): boolean {
  if (item instanceof XFillStyleItem)
    return getParagraphFillItems(paragraph.GetSwAttrSet()).style.equals(item);
  if (item instanceof XFillTransparenceItem)
    return getParagraphFillItems(paragraph.GetSwAttrSet()).transparency.equals(item);
  return paragraph.GetAttr(item.Which()).equals(item);
}

/** Paints the native paragraph solid fill and uniform opacity. @param items - Effective paragraph attributes. @returns Browser fill color. */
export function writerParagraphBackgroundColor(items: SfxItemSet): string {
  const { style, color, transparency } = getParagraphFillItems(items);
  if (style.GetValue() !== FillStyle.SOLID || transparency.GetValue() === 100) return "transparent";
  const rgb = color.GetColorValue();
  if (transparency.GetValue() === 0)
    return `#${(rgb.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
  return `rgba(${rgb.GetRed()}, ${rgb.GetGreen()}, ${rgb.GetBlue()}, ${(100 - transparency.GetValue()) / 100})`;
}

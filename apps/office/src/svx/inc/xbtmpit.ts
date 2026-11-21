/** @fileoverview DrawingLayer named bitmap fill and its two independent mode items. */
import type { Graphic } from "../../vcl/source/gdi/graph";
import { BitmapMode } from "../../offapi/com/sun/star/drawing/BitmapMode";
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import type { SfxItemSet } from "../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
import { NameOrIndex } from "./xit";
import { XATTR_FILLBITMAP, XATTR_FILLBMP_STRETCH, XATTR_FILLBMP_TILE } from "./xdef";

/** Original XFillBitmapItem owns its name and immutable embedded graphic. */
export class XFillBitmapItem extends NameOrIndex {
  /** Initializes a named graphic or the original empty bitmap default. @param name - Palette name. @param graphic - Embedded image. @returns Item. */
  constructor(
    name = "",
    private readonly graphic?: Graphic,
  ) {
    super(XATTR_FILLBITMAP, name);
  }
  /** Borrows the bitmap graphic. @returns Embedded graphic or absence. */
  GetGraphic(): Graphic | undefined {
    return this.graphic;
  }
  /** Clones the item and shares the immutable graphic value. @returns Independent item. */
  override Clone(): XFillBitmapItem {
    return new XFillBitmapItem(this.GetName(), this.graphic);
  }
  /** Compares the native name and graphic values. @param other - Candidate item. @returns Whether equal. */
  override equals(other: SfxPoolItem): boolean {
    if (!(other instanceof XFillBitmapItem) || !super.equals(other)) return false;
    const left = this.graphic,
      right = other.graphic;
    if (left === right) return true;
    if (!left || !right || left.mediaType !== right.mediaType) return false;
    const bytes = right.GetNativeData(),
      value = left.GetNativeData();
    const leftSize = left.GetPrefSize(),
      rightSize = right.GetPrefSize();
    return (
      leftSize.Width() === rightSize.Width() &&
      leftSize.Height() === rightSize.Height() &&
      value.length === bytes.length &&
      value.every(
        /** Compares encoded image bytes. @param byte - Byte. @param index - Offset. @returns Whether equal. */ (
          byte,
          index,
        ) => byte === bytes[index],
      )
    );
  }
}

/** Resolves native fill mode, giving tiling precedence over stretching. @param items - Actual drawing items. @returns Effective mode. */
export function getBitmapMode(items: SfxItemSet): BitmapMode {
  if ((items.Get(XATTR_FILLBMP_TILE) as SfxBoolItem).GetValue()) return BitmapMode.REPEAT;
  return (items.Get(XATTR_FILLBMP_STRETCH) as SfxBoolItem).GetValue()
    ? BitmapMode.STRETCH
    : BitmapMode.NO_REPEAT;
}

/** Stores the original independent bitmap mode item values. @param items - Page or frame items. @param mode - Bitmap mode. @returns Nothing. */
export function setBitmapMode(items: SfxItemSet, mode: BitmapMode): void {
  items.Put(new SfxBoolItem(XATTR_FILLBMP_STRETCH, mode === BitmapMode.STRETCH));
  items.Put(new SfxBoolItem(XATTR_FILLBMP_TILE, mode === BitmapMode.REPEAT));
}

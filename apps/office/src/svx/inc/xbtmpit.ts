/** @fileoverview DrawingLayer named bitmap fill and its two independent mode items. */
import type { Graphic } from "../../vcl/source/gdi/graph";
import { BitmapMode } from "../../offapi/com/sun/star/drawing/BitmapMode";
import { RectanglePoint } from "../../offapi/com/sun/star/drawing/RectanglePoint";
import { SfxInt32Item, SfxUInt16Item } from "../../svl/source/items/intitem";
import { convert, Length } from "../../o3tl/inc/unit_conversion";
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { SfxEnumItem } from "../../svl/inc/eitem";
import type { SfxItemSet } from "../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
import { NameOrIndex } from "./xit";
import {
  XATTR_FILLBITMAP,
  XATTR_FILLBMP_STRETCH,
  XATTR_FILLBMP_TILE,
  XATTR_FILLBMP_POS,
  XATTR_FILLBMP_SIZEX,
  XATTR_FILLBMP_SIZEY,
  XATTR_FILLBMP_SIZELOG,
  XATTR_FILLBMP_TILEOFFSETX,
  XATTR_FILLBMP_TILEOFFSETY,
  XATTR_FILLBMP_POSOFFSETX,
  XATTR_FILLBMP_POSOFFSETY,
} from "./xdef";

/** DrawingLayer fill geometry properties and their individual native item identities. */
export const bitmapGeometryWhich = {
  sizeX: XATTR_FILLBMP_SIZEX,
  sizeY: XATTR_FILLBMP_SIZEY,
  logicalSize: XATTR_FILLBMP_SIZELOG,
  point: XATTR_FILLBMP_POS,
  positionX: XATTR_FILLBMP_POSOFFSETX,
  positionY: XATTR_FILLBMP_POSOFFSETY,
  offsetX: XATTR_FILLBMP_TILEOFFSETX,
  offsetY: XATTR_FILLBMP_TILEOFFSETY,
} as const;

/** Native storage boundary, before item pool units and UNO member conversion. */
export const bitmapGeometryIds: readonly number[] = Object.values(bitmapGeometryWhich);

/** Original bitmap anchor enum item. */
export class XFillBmpPosItem extends SfxEnumItem<RectanglePoint> {
  /** Initializes the original center default. @param point - Drawing point. @returns Item. */
  constructor(point = RectanglePoint.MIDDLE_MIDDLE) {
    super(XATTR_FILLBMP_POS, point);
  }
  /** Copies the actual stored reference point. @returns Independent item. */
  override Clone(): XFillBmpPosItem {
    return new XFillBmpPosItem(this.GetValue());
  }
}

/** Identifies the two signed/physical metric items. @param which - Item identity. @returns Whether a size. */
export function isBitmapSize(which: number): boolean {
  return which === XATTR_FILLBMP_SIZEX || which === XATTR_FILLBMP_SIZEY;
}

/** Converts nonnegative sizes to Writer's item-pool units, preserving signed percentages. @param value - XML or UNO value. @returns Stored size. */
export function bitmapSizeToTwips(value: number): number {
  return value <= 0 ? value : Number(convert(BigInt(value), Length.mm100, Length.twip));
}

/** Converts nonnegative item-pool sizes to UNO hundredths of a millimetre. @param value - Pooled value. @returns UNO size. */
export function bitmapSizeToMm100(value: number): number {
  return value <= 0 ? value : Number(convert(BigInt(value), Length.twip, Length.mm100));
}

/** Builds the native signed, unsigned or boolean bitmap value. @param which - Geometry item identity. @param value - Stored scalar. @returns Pooled item value. */
export function createBitmapGeometryItem(
  which: number,
  value?: number | boolean,
): SfxInt32Item | SfxUInt16Item | SfxBoolItem | XFillBmpPosItem {
  if (which === XATTR_FILLBMP_SIZELOG)
    return new SfxBoolItem(which, value === undefined || value === true);
  if (which === XATTR_FILLBMP_POS)
    return new XFillBmpPosItem(typeof value === "number" ? (value as RectanglePoint) : undefined);
  const number = typeof value === "number" ? value : 0;
  if (which === XATTR_FILLBMP_TILEOFFSETX || which === XATTR_FILLBMP_TILEOFFSETY)
    return new SfxUInt16Item(which, number & 0xffff);
  return new SfxInt32Item(which, number);
}

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

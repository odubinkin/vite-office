/** @fileoverview Native image subpage exchange for page-style bitmap fills. */
import { BitmapMode } from "../../../offapi/com/sun/star/drawing/BitmapMode";
import { RectanglePoint } from "../../../offapi/com/sun/star/drawing/RectanglePoint";
import type { SfxItemSet } from "../../../svl/inc/itemset";
import {
  XATTR_FILLBITMAP,
  XATTR_FILLBMP_POS,
  XATTR_FILLBMP_STRETCH,
  XATTR_FILLBMP_TILE,
} from "../../../svx/inc/xdef";
import {
  getBitmapMode,
  setBitmapMode,
  XFillBitmapItem,
  XFillBmpPosItem,
} from "../../../svx/inc/xbtmpit";
import type { Graphic } from "../../../vcl/source/gdi/graph";

/** Owns the native selected bitmap and represented image placement fields. */
export class SvxBitmapTabPage {
  private image: XFillBitmapItem;
  private mode: BitmapMode;
  private position: RectanglePoint;
  private readonly originalImage: XFillBitmapItem;
  private readonly originalMode: BitmapMode;
  private readonly originalPosition: RectanglePoint;

  /** Reads the actual image and mode currently represented by the native input. @param items - Page style attributes. @returns Bitmap page. */
  constructor(items: SfxItemSet) {
    this.originalImage = this.image = items.Get(XATTR_FILLBITMAP) as XFillBitmapItem;
    this.originalMode = this.mode = getBitmapMode(items);
    this.originalPosition = this.position = (
      items.Get(XATTR_FILLBMP_POS) as XFillBmpPosItem
    ).GetValue();
  }

  /** Reads the current native bitmap item. @returns Bitmap including the native graphic. */
  GetBitmap(): XFillBitmapItem {
    return this.image;
  }

  /** Reads the native bitmap placement mode. @returns Current mode. */
  GetMode(): BitmapMode {
    return this.mode;
  }

  /** Reads the native reference point for non-stretched images. @returns Position. */
  GetPosition(): RectanglePoint {
    return this.position;
  }

  /** Selects the imported embedded image. @param name - Image name. @param graphic - Native graphic. @returns Nothing. */
  SetBitmap(name: string, graphic: Graphic): void {
    this.image = new XFillBitmapItem(name, graphic);
  }

  /** Changes the image style. @param mode - Original bitmap mode. @returns Nothing. */
  SetMode(mode: BitmapMode): void {
    this.mode = mode;
  }

  /** Changes the image anchor. @param position - Named native rectangle point. @returns Nothing. */
  SetPosition(position: RectanglePoint): void {
    this.position = position;
  }

  /** Clears image output owned by this page. @param output - Dialog exchange set. @returns Nothing. */
  ClearOutput(output: SfxItemSet): void {
    output.ClearItem(XATTR_FILLBITMAP);
    output.ClearItem(XATTR_FILLBMP_STRETCH);
    output.ClearItem(XATTR_FILLBMP_TILE);
    output.ClearItem(XATTR_FILLBMP_POS);
  }

  /** Exchanges the native image and changed placement items. @param output - Dialog exchange set. @returns Nothing. */
  FillItemSet(output: SfxItemSet): void {
    if (!this.image.equals(this.originalImage)) output.Put(this.image);
    if (this.mode !== this.originalMode) setBitmapMode(output, this.mode);
    if (this.position !== this.originalPosition) output.Put(new XFillBmpPosItem(this.position));
  }
}

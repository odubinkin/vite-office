/** @fileoverview Pooled Area page exchange for represented solid and absent fills. */
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import type { SfxItemSet } from "../../../svl/inc/itemset";
import {
  XATTR_FILLCOLOR,
  XATTR_FILLSTYLE,
  XATTR_FILLUSESLIDEBACKGROUND,
} from "../../../svx/inc/xdef";
import { XFillStyleItem } from "../../../svx/inc/xfillit0";
import { XFillColorItem } from "../../../svx/inc/xflclit";
import { XFillUseSlideBackgroundItem } from "../../../svx/inc/xfilluseslidebackgrounditem";
import { SvxBitmapTabPage } from "./tpbitmap";
import type { Color } from "../../../tools/inc/color";

/** Owns the original Area fill selection and solid color exchange. */
export class SvxAreaTabPage {
  private readonly originalStyle: XFillStyleItem | undefined;
  private readonly originalColor: XFillColorItem | undefined;
  private style: FillStyle | undefined;
  private color: XFillColorItem | undefined;
  private selected = false;
  public readonly bitmap: SvxBitmapTabPage | undefined;

  /** Borrows the input snapshot for the dialog lifetime. @param input - Effective fill items. @param showBitmap - Whether image fill belongs to this format. @returns Area page. */
  constructor(input: SfxItemSet, showBitmap = false) {
    this.bitmap = showBitmap ? new SvxBitmapTabPage(input) : undefined;
    this.originalStyle = (
      showBitmap ? input.Get(XATTR_FILLSTYLE) : input.GetItemIfSet(XATTR_FILLSTYLE, false)
    ) as XFillStyleItem | undefined;
    this.originalColor = (
      showBitmap ? input.Get(XATTR_FILLCOLOR) : input.GetItemIfSet(XATTR_FILLCOLOR, false)
    ) as XFillColorItem | undefined;
    this.style = this.originalStyle?.GetValue();
    this.color = this.originalColor;
  }

  /** Reads the active fill family including an indeterminate selection. @returns Native fill style. */
  GetFillStyle(): FillStyle | undefined {
    return this.style;
  }

  /** Reads the pending solid fill color. @returns Native color or mixed selection. */
  GetColor(): Readonly<Color> | undefined {
    return this.color?.GetColorValue();
  }

  /** Reads the source identity of the pending preset. @returns Swatch name if selected. */
  GetColorName(): string | undefined {
    return this.color?.GetName() || undefined;
  }

  /** Reads the original color for the old-color preview. @returns Starting native color. */
  GetOriginalColor(): Readonly<Color> | undefined {
    return this.originalStyle?.GetValue() === FillStyle.SOLID
      ? this.originalColor?.GetColorValue()
      : undefined;
  }

  /** Applies one of the represented native Area buttons. @param style - Chosen fill family. @returns Nothing. */
  SelectFillType(style: FillStyle.NONE | FillStyle.SOLID | FillStyle.BITMAP): void {
    this.style = style;
    this.selected = true;
  }

  /** Changes the active solid color. @param color - Native opaque RGB value. @param name - Portfolio name or hexadecimal color identity. @returns Nothing. */
  SetColor(color: Readonly<Color>, name: string): void {
    this.color = new XFillColorItem(name, color);
  }

  /** Exchanges only Area page items in the dialog output. @param output - Actual dialog exchange item set. @returns Nothing. */
  FillItemSet(output: SfxItemSet): void {
    output.ClearItem(XATTR_FILLSTYLE);
    output.ClearItem(XATTR_FILLCOLOR);
    output.ClearItem(XATTR_FILLUSESLIDEBACKGROUND);
    this.bitmap?.ClearOutput(output);
    if (this.style === FillStyle.BITMAP && this.bitmap?.GetBitmap().GetGraphic()) {
      if (this.selected) output.Put(new XFillStyleItem(FillStyle.BITMAP), true);
      this.bitmap.FillItemSet(output);
      return;
    }
    if (!this.selected && this.color === this.originalColor) return;

    if (this.style === FillStyle.NONE && this.selected) {
      output.Put(new XFillStyleItem(FillStyle.NONE), true);
      output.Put(new XFillUseSlideBackgroundItem(false), true);
    } else if (this.style === FillStyle.SOLID) {
      output.Put(new XFillStyleItem(FillStyle.SOLID), true);
      if (this.color) output.Put(this.color);
    }
  }
}

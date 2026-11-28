/** @fileoverview Calc's consumed color and no-fill branches from SvxBkgTabPage. */
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { SID_ATTR_BRUSH } from "../../../editeng/inc/editids";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import type { SfxItemSet } from "../../../svl/inc/itemset";
import {
  XATTR_FILLCOLOR,
  XATTR_FILLSTYLE,
  XATTR_FILL_FIRST,
  XATTR_FILL_LAST,
} from "../../../svx/inc/xdef";
import type { XFillColorItem } from "../../../svx/inc/xflclit";
import { setSvxBrushItemAsFillAttributesToTargetSet } from "../../../svx/source/unodraw/unobrushitemhelper";
import { COL_TRANSPARENT } from "../../../tools/inc/color";
import { SvxAreaTabPage } from "./tparea";

/** Exchanges the native cell brush with the shared Area color page. */
export class SvxBkgTabPage {
  private readonly which: number;
  private readonly original: SvxBrushItem;
  private readonly attributes: SfxItemSet;
  private page: SvxAreaTabPage;

  /** Resolves the cell brush slot and prepares the original drawing fill ranges. @param input - Selection attributes. @returns Background page. */
  constructor(input: SfxItemSet) {
    this.which = input.GetPool().GetWhichIDFromSlotID(SID_ATTR_BRUSH);
    this.original = input.Get(this.which) as SvxBrushItem;
    this.attributes = input.Clone(false);
    this.attributes.MergeRange(XATTR_FILL_FIRST, XATTR_FILL_LAST);
    this.page = this.createAreaPage();
  }

  /** Borrows the original palette and preview page. @returns Active Area model. */
  GetAreaPage(): SvxAreaTabPage {
    return this.page;
  }

  /** Restores the fill and original color preview. @returns Nothing. */
  Reset(): void {
    this.page = this.createAreaPage();
  }

  /** Converts the Area response using the pinned full brush-color comparison. @param output - Dialog output. @returns Nothing. */
  FillItemSet(output: SfxItemSet): void {
    const updates = this.attributes.Clone(false);
    try {
      this.page.FillItemSet(updates);
      const style = this.page.GetFillStyle();
      if (style === FillStyle.NONE) {
        if (updates.GetItemIfSet(XATTR_FILLSTYLE, false))
          output.Put(new SvxBrushItem(COL_TRANSPARENT, this.which), true);
        return;
      }
      if (style !== FillStyle.SOLID) return;
      const fill = (updates.GetItemIfSet(XATTR_FILLCOLOR, false) ??
        this.attributes.GetItemIfSet(XATTR_FILLCOLOR, false)) as XFillColorItem | undefined;
      if (!fill) return;
      const color = fill.GetColorValue();
      if (this.original.GetColor().toUInt32() !== color.toUInt32())
        output.Put(new SvxBrushItem(color, fill.getComplexColor(), this.which), true);
    } finally {
      updates.Dispose();
    }
  }

  /** Reuses the native drawing-layer conversion and generic Area owner. @returns Fresh Area model. */
  private createAreaPage(): SvxAreaTabPage {
    setSvxBrushItemAsFillAttributesToTargetSet(this.original, this.attributes);
    return new SvxAreaTabPage(this.attributes);
  }

  /** Releases the temporary drawing item set. @returns Nothing. */
  Dispose(): void {
    this.attributes.Dispose();
  }
}

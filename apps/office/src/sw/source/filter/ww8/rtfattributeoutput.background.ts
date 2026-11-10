/** @fileoverview Original RTF paragraph and table background output and palette inputs. */
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { XATTR_FILLCOLOR, XATTR_FILLSTYLE } from "../../../../svx/inc/xdef";
import type { XFillColorItem } from "../../../../svx/inc/xflclit";
import type { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import { getSvxBrushItemFromSourceSet } from "../../../../svx/source/unodraw/unobrushitemhelper";
import { COL_AUTO, type Color } from "../../../../tools/inc/color";
import { RES_BACKGROUND } from "../../../inc/hintids";
import { writerColorValue } from "../../core/attr/swatrset";
import type { SwFrameFormat } from "../../core/layout/atrfrm";

/** Selects the original effective RTF cell background from table, row and cell. @param table - Native table format. @param row - Native row format. @param cell - Native cell format. @returns Original selected color. */
export function TableBackgroundColor(
  table: SwFrameFormat,
  row: SwFrameFormat,
  cell: SwFrameFormat,
): Readonly<Color> {
  const tableBrush = table.GetAttrSet().GetItem(RES_BACKGROUND) as SvxBrushItem | undefined,
    rowBrush = row.GetAttrSet().GetItem(RES_BACKGROUND) as SvxBrushItem | undefined,
    cellBrush = cell.GetAttrSet().GetItemIfSet(RES_BACKGROUND) as SvxBrushItem | undefined;
  const cellColor = cellBrush?.GetColor();
  if (cellColor && !cellColor.equals(COL_AUTO)) return cellColor;
  const rowColor = rowBrush?.GetColor();
  if (rowColor && !rowColor.equals(COL_AUTO)) return rowColor;
  return tableBrush?.GetColor() ?? COL_AUTO;
}

/** Original paragraph brush emitter writes only opaque backgrounds. @param brush - Native paragraph brush. @param index - Current RTF color table. @returns RTF controls. */
export function FormatBackground(
  brush: SvxBrushItem | undefined,
  index: (color: string) => number,
): string {
  const color = brush?.GetColor();
  return color && !color.IsTransparent() ? `\\cbpat${index(writerColorValue(color))}` : "";
}

/** Projects a direct native drawing fill when no direct legacy brush already supplied it. @param set - Native paragraph or style item set. @param index - Current RTF color table. @returns RTF controls. */
export function FormatParagraphFill(set: SfxItemSet, index: (color: string) => number): string {
  const fill = set.GetItemIfSet(XATTR_FILLSTYLE, false) as XFillStyleItem | undefined;
  if (fill?.GetValue() !== FillStyle.SOLID || set.GetItemIfSet(RES_BACKGROUND, false)) return "";
  const brush = getSvxBrushItemFromSourceSet(set, RES_BACKGROUND);
  try {
    return FormatBackground(brush, index);
  } finally {
    brush.Dispose();
  }
}

/** Indexes the original represented brush and drawing fill colors before the color table is written. @param set - Native paragraph or style set. @param index - RTF palette registration. @returns Nothing. */
export function IndexParagraphBackgrounds(
  set: SfxItemSet,
  index: (color: Readonly<Color>) => number,
): void {
  const brush = set.GetItemIfSet(RES_BACKGROUND) as SvxBrushItem | undefined;
  const fill = set.GetItemIfSet(XATTR_FILLCOLOR) as XFillColorItem | undefined;
  const color = brush?.GetColor();
  if (color && !color.IsTransparent()) index(color);
  if (fill) index(fill.GetColorValue());
}

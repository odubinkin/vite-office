/** @fileoverview Writer filter border-item export boundary corresponding to xmlexpit.cxx. Browser presentation shorthand retains its existing adapter behavior without moving native item ownership into shared xmloff. */
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import type { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import type { OdfTableVisualProperties } from "../../../../xmloff/source/table/XMLTableImport";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { RES_BACKGROUND, RES_FRAMEDIR } from "../../../inc/hintids";
import { writerColorValue, type SwAttrSet } from "../../core/attr/swatrset";
import {
  XMLBorderHdl,
  XMLBorderWidthHdl,
  borderStyleToken,
  type OdfBoxProperties,
} from "../../../../xmloff/source/style/bordrhdl";

/** Exports the original direct brush color and writing direction for table styles. @param items - Actual frame item set. @returns Filter-only visual properties. */
export function exportFrameVisualProperties(items: SwAttrSet): OdfTableVisualProperties {
  const brush = items.GetItemIfSet(RES_BACKGROUND, false) as SvxBrushItem | undefined,
    direction = items.GetItemIfSet(RES_FRAMEDIR, false) as SvxFrameDirectionItem | undefined;
  const color = brush?.GetColor();
  const background =
    color === undefined
      ? undefined
      : color.IsTransparent()
        ? "transparent"
        : writerColorValue(color);
  if (direction === undefined) return { background };
  const any = new Any();
  try {
    const mode: [number] = [0];
    const writingMode =
      direction.QueryValue(any) && any.extract(mode, "sal_Int16") ? mode[0] : undefined;
    return { background, writingMode };
  } finally {
    any.dispose();
  }
}

/** Formats native twip values for the existing presentation shorthand control. @param line - Native line. @returns Presentation input. */
export function exportBorderShorthand(line: SvxBorderLine | undefined): string {
  if (line === undefined || line.isEmpty()) return "none";
  return `${line.GetWidth() / 20}pt ${borderStyleToken(line.GetBorderLineStyle())} #${(line.GetColor().toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Exports all four native edges without collapsing authored independent values. @param item - Native item. @returns Filter-only properties. */
export function exportBoxProperties(item: SvxBoxItem | undefined): OdfBoxProperties {
  if (item === undefined) return {};
  const result: Record<string, number | string | undefined> = {},
    border = new XMLBorderHdl(),
    compound = new XMLBorderWidthHdl();
  for (const [edge, suffix] of ["Top", "Bottom", "Left", "Right"].entries()) {
    const value = SvxBoxItem.SvxLineToLine(item.GetLine(edge), true);
    result[`padding${suffix}`] = item.GetDistance(edge, true);
    result[`border${suffix}`] = border.exportXML(value);
    result[`borderLineWidth${suffix}`] = compound.exportXML(value);
  }
  return result;
}

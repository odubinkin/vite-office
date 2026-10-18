/** @fileoverview Writer filter border-item export boundary corresponding to xmlexpit.cxx. Browser presentation shorthand retains its existing adapter behavior without moving native item ownership into shared xmloff. */
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import {
  XMLBorderHdl,
  XMLBorderWidthHdl,
  borderStyleToken,
  type OdfBoxProperties,
} from "../../../../xmloff/source/style/bordrhdl";

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

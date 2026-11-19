/** @fileoverview Writer filter border-item export boundary corresponding to xmlexpit.cxx. Browser presentation shorthand retains its existing adapter behavior without moving native item ownership into shared xmloff. */
import type { SvxShadowItem } from "../../../../editeng/source/items/frmitems.shadow";
import { SvxShadowLocation } from "../../../../editeng/inc/svxenum";
import {
  cppu_detail_getUnoType_ShadowFormat as shadowType,
  ShadowFormat,
} from "../../../../offapi/com/sun/star/table/ShadowFormat";
import { XMLShadowPropHdl } from "../../../../xmloff/source/style/shadwhdl";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import type { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import type { OdfTableVisualProperties } from "../../../../xmloff/source/table/XMLTableImport";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { RES_BACKGROUND, RES_FRAMEDIR, RES_BOX, RES_SHADOW } from "../../../inc/hintids";
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

/** Writes the original ODF page layout box, shadow and gutter properties. @param master - Actual page frame. @param formatLength - Twips to ODF length converter. @returns XML attributes. */
export function exportPageLayoutBox(
  master: SwFrameFormat,
  formatLength: (value: number) => string,
): string {
  const items = master.GetAttrSet();
  const box = exportBoxProperties(items.GetItemIfSet(RES_BOX, false) as SvxBoxItem | undefined);
  const attributes: string[] = [];
  for (const side of ["Top", "Bottom", "Left", "Right"] as const) {
    const suffix = side.toLowerCase();
    const padding = box[`padding${side}`];
    const border = box[`border${side}`];
    const lineWidth = box[`borderLineWidth${side}`];
    if (padding !== undefined) attributes.push(`fo:padding-${suffix}="${formatLength(padding)}"`);
    if (border !== undefined) attributes.push(`fo:border-${suffix}="${border}"`);
    if (lineWidth !== undefined)
      attributes.push(`style:border-line-width-${suffix}="${lineWidth}"`);
  }
  const shadow = items.GetItemIfSet(RES_SHADOW, false) as SvxShadowItem | undefined;
  if (shadow && shadow.GetLocation() !== SvxShadowLocation.NONE) {
    const value = new Any();
    try {
      const format = new ShadowFormat();
      if (shadow.QueryValue(value, 0x80) && value.extract(format, shadowType))
        attributes.push(`style:shadow="${new XMLShadowPropHdl().exportXML(format)}"`);
    } finally {
      value.dispose();
    }
  }
  const gutter = master.GetLRSpace().GetGutterMargin();
  if (gutter) attributes.push(`loext:margin-gutter="${formatLength(gutter)}"`);
  return attributes.length ? ` ${attributes.join(" ")}` : "";
}

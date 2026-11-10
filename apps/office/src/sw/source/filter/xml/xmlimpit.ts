/** @fileoverview Writer filter item-mapping boundary corresponding to xmlimpit.cxx. Existing browser-shaped border properties are mapped here; shared xmloff handlers own published UNO values only. Full native item mapper/Any pipeline remains unported. */
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import type { OdfTableVisualProperties } from "../../../../xmloff/source/table/XMLTableImport";
import { RES_BACKGROUND, RES_FRAMEDIR } from "../../../inc/hintids";
import { writerColorFromPrimitive } from "../../core/attr/swatrset";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import {
  XMLBorderHdl,
  XMLBorderWidthHdl,
  type OdfBoxProperties,
} from "../../../../xmloff/source/style/bordrhdl";

/** Imports the original background and writing-mode members into the actual table frame item set. @param format - Native format. @param value - Source table-style values. @returns Nothing. */
export function importFrameVisualProperties(
  format: SwFrameFormat,
  value: OdfTableVisualProperties,
): void {
  if (value.background !== undefined) {
    const item = (format.GetAttrSet().Get(RES_BACKGROUND) as SvxBrushItem).Clone();
    try {
      if (value.background === "transparent") item.GetColor().SetAlpha(0);
      else item.SetColor(writerColorFromPrimitive(value.background, "transparent"));
      format.SetFormatAttr(item);
    } finally {
      item.Dispose();
    }
  }
  if (value.writingMode !== undefined) {
    const item = new SvxFrameDirectionItem(SvxFrameDirection.Environment, RES_FRAMEDIR);
    try {
      if (item.PutValue(value.writingMode)) format.SetFormatAttr(item);
    } finally {
      item.Dispose();
    }
  }
}

/** Converts four independent filter properties to an owned item. @param value - ODF properties or presentation shorthand. @param which - Destination native identity. @returns Native item or absent for an empty declaration. */
export function importBoxProperties(
  value: OdfBoxProperties,
  which: number,
): SvxBoxItem | undefined {
  if (
    !Object.keys(value).some(
      /** Finds a represented property. @param key - Property name. @returns Whether supplied. */
      (key) =>
        (key.startsWith("border") || key.startsWith("padding")) &&
        value[key as keyof OdfBoxProperties] !== undefined,
    )
  )
    return undefined;
  const item = new SvxBoxItem(which),
    border = new XMLBorderHdl(),
    compound = new XMLBorderWidthHdl();
  for (const [edge, suffix] of ["Top", "Bottom", "Left", "Right"].entries()) {
    const distance = value[`padding${suffix}` as keyof OdfBoxProperties] ?? value.padding;
    if (typeof distance === "number") item.SetDistance(distance, edge);
    const text = value[`border${suffix}` as keyof OdfBoxProperties] ?? value.border;
    const widthText =
      value[`borderLineWidth${suffix}` as keyof OdfBoxProperties] ?? value.borderLineWidth;
    const target = { value: SvxBoxItem.SvxLineToLine(undefined, true) };
    if (typeof text === "string") {
      if (!border.importXML(text, target)) throw new Error(`Unsupported ODF cell border: ${text}`);
      if (typeof widthText === "string" && !compound.importXML(widthText, target))
        throw new Error(`Unsupported ODF border widths: ${widthText}`);
      // Native member order is top/bottom/left/right = 3/4/1/2.
      item.PutValue(target.value, ([3, 4, 1, 2][edge] as number) | 0x80);
    }
  }
  return item;
}

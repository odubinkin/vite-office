/** @fileoverview Writer filter item-mapping boundary corresponding to xmlimpit.cxx. Existing browser-shaped border properties are mapped here; shared xmloff handlers own published UNO values only. Full native item mapper/Any pipeline remains unported. */
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import {
  XMLBorderHdl,
  XMLBorderWidthHdl,
  type OdfBoxProperties,
} from "../../../../xmloff/source/style/bordrhdl";

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

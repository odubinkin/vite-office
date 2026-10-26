/** @fileoverview Browser transport for the represented native DrawingLayer solid-fill items. */
import type { SfxPoolItem, SfxPoolItemSnapshot } from "../../svl/source/items/poolitem";
import { Color, ColorTransparency } from "../../tools/inc/color";
import { XFillStyleItem } from "../inc/xfillit0";
import { XFillColorItem } from "../inc/xflclit";
import { XFillTransparenceItem } from "../inc/xfltrit";
import { XFillUseSlideBackgroundItem } from "../inc/xfilluseslidebackgrounditem";
import {
  XATTR_FILLSTYLE,
  XATTR_FILLCOLOR,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILLUSESLIDEBACKGROUND,
} from "../inc/xdef";
import type { FillStyle } from "../../offapi/com/sun/star/drawing/FillStyle";
import { encodeComplexColor, decodeComplexColor } from "../../docmodel/browser/complex-color-codec";
/** Encodes actual native values without flattening palette names/indices or complex colors. @param item - Native item. @returns Record or null for other families. */
export function encodeFillItem(item: SfxPoolItem): SfxPoolItemSnapshot | null {
  if (
    item instanceof XFillStyleItem ||
    item instanceof XFillTransparenceItem ||
    item instanceof XFillUseSlideBackgroundItem
  )
    return { which: item.Which(), value: item.GetValue() };
  if (item instanceof XFillColorItem) {
    // Palette-indexed values retain a private resolved-color field, whose native
    // getter has a non-indexed precondition. Preserve that real copy payload at
    // this Worker boundary without detaching or changing the source owner.
    const color = item.IsIndex()
      ? (item as unknown as { readonly m_aColor: Readonly<Color> }).m_aColor
      : item.GetColorValue();
    return {
      which: item.Which(),
      value: {
        name: item.GetName(),
        index: item.GetPalIndex(),
        color: color.toUInt32(),
        complex: encodeComplexColor(item.getComplexColor()),
      },
    };
  }
  return null;
}
/** Restores native drawing item types and validates only their actual wire fields. @param snapshot - Untrusted item record. @returns Native item or null for other families. */
export function decodeFillItem(snapshot: SfxPoolItemSnapshot): SfxPoolItem | null {
  const value = snapshot.value;
  switch (snapshot.which) {
    case XATTR_FILLSTYLE:
      if (!integer(value, -2147483648, 2147483647)) throw new Error("FillStyle record is invalid.");
      return new XFillStyleItem(value as FillStyle);
    case XATTR_FILLTRANSPARENCE:
      if (!integer(value, 0, 100)) throw new Error("Fill transparency record is invalid.");
      return new XFillTransparenceItem(value);
    case XATTR_FILLUSESLIDEBACKGROUND:
      if (typeof value !== "boolean") throw new Error("Slide background record is invalid.");
      return new XFillUseSlideBackgroundItem(value);
    case XATTR_FILLCOLOR: {
      if (value === null || typeof value !== "object" || Array.isArray(value))
        throw new Error("Fill color record is invalid.");
      const record = value as Record<string, unknown>;
      if (
        typeof record.name !== "string" ||
        !integer(record.index, -2147483648, 2147483647) ||
        !integer(record.color, 0, 0xffffffff)
      )
        throw new Error("Fill color record is invalid.");
      const item = new XFillColorItem(
        record.index,
        new Color(ColorTransparency, record.color, "ColorTransparencyTag"),
      );
      item.SetName(record.name);
      item.setComplexColor(decodeComplexColor(record.complex));
      return item;
    }
    default:
      return null;
  }
}
/** Validates one wire integer without narrowing it. @param value - Candidate. @param minimum - Inclusive lower bound. @param maximum - Inclusive upper bound. @returns Whether admitted. */
function integer(value: unknown, minimum: number, maximum: number): value is number {
  return (
    typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum
  );
}

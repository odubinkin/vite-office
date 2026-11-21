/** @fileoverview Browser transport for native DrawingLayer solid and bitmap fill items. */
import type { SfxPoolItem, SfxPoolItemSnapshot } from "../../svl/source/items/poolitem";
import { Color, ColorTransparency } from "../../tools/inc/color";
import { XFillStyleItem } from "../inc/xfillit0";
import { XFillColorItem } from "../inc/xflclit";
import { XFillTransparenceItem } from "../inc/xfltrit";
import { XFillUseSlideBackgroundItem } from "../inc/xfilluseslidebackgrounditem";
import { XFillBitmapItem } from "../inc/xbtmpit";
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { Graphic } from "../../vcl/source/gdi/graph";
import { Size } from "../../tools/inc/gen";
import {
  XATTR_FILLSTYLE,
  XATTR_FILLCOLOR,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILLUSESLIDEBACKGROUND,
  XATTR_FILLBITMAP,
  XATTR_FILLBMP_STRETCH,
  XATTR_FILLBMP_TILE,
} from "../inc/xdef";
import type { FillStyle } from "../../offapi/com/sun/star/drawing/FillStyle";
import { encodeComplexColor, decodeComplexColor } from "../../docmodel/browser/complex-color-codec";
/** Encodes actual native values without flattening palette names/indices or complex colors. @param item - Native item. @returns Record or null for other families. */
export function encodeFillItem(item: SfxPoolItem): SfxPoolItemSnapshot | null {
  if (item instanceof XFillBitmapItem) {
    const graphic = item.GetGraphic();
    if (!graphic) return { which: XATTR_FILLBITMAP, value: [item.GetName()] };
    const size = graphic.GetPrefSize();
    return {
      which: XATTR_FILLBITMAP,
      value: [
        item.GetName(),
        graphic.mediaType,
        encodeBitmapBytes(graphic.GetNativeData()),
        size.Width(),
        size.Height(),
      ],
    };
  }
  if (
    item instanceof SfxBoolItem &&
    (item.Which() === XATTR_FILLBMP_TILE || item.Which() === XATTR_FILLBMP_STRETCH)
  )
    return { which: item.Which(), value: item.GetValue() };
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
    case XATTR_FILLBMP_TILE:
    case XATTR_FILLBMP_STRETCH:
      if (typeof value !== "boolean") throw new Error("Fill bitmap mode record is invalid.");
      return new SfxBoolItem(snapshot.which, value);
    case XATTR_FILLBITMAP: {
      if (!Array.isArray(value) || typeof value[0] !== "string")
        throw new Error("Fill bitmap record is invalid.");
      if (value.length === 1) return new XFillBitmapItem(value[0]);
      const [name, mediaType, encoded, width, height] = value;
      if (
        value.length !== 5 ||
        (mediaType !== "image/png" && mediaType !== "image/jpeg") ||
        typeof encoded !== "string" ||
        !integer(width, 0, Number.MAX_SAFE_INTEGER) ||
        !integer(height, 0, Number.MAX_SAFE_INTEGER)
      )
        throw new Error("Fill bitmap record is invalid.");
      const raw = atob(encoded);
      if (!raw.length || btoa(raw) !== encoded)
        throw new Error("Fill bitmap image data is invalid.");
      const data = Uint8Array.from(
        raw,
        /** Converts a base64-decoded binary character to its byte. @param character - One byte. @returns Byte. */
        (character) => character.charCodeAt(0),
      );
      return new XFillBitmapItem(name, new Graphic(data, mediaType, new Size(width, height)));
    }
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

/** Serializes bytes within the scalar snapshot contract. @param bytes - Embedded image. @returns Padded Base64. */
function encodeBitmapBytes(bytes: Uint8Array): string {
  let raw = "";
  for (let offset = 0; offset < bytes.length; offset += 32768)
    raw += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return btoa(raw);
}
/** Validates one wire integer without narrowing it. @param value - Candidate. @param minimum - Inclusive lower bound. @param maximum - Inclusive upper bound. @returns Whether admitted. */
function integer(value: unknown, minimum: number, maximum: number): value is number {
  return (
    typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum
  );
}

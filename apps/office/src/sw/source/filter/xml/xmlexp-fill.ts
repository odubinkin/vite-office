/** @fileoverview Consumed native paragraph fill value projection for Writer XML export. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import { XFillColorItem } from "../../../../svx/inc/xflclit";
import { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import {
  XATTR_FILLBITMAP,
  XATTR_FILLBMP_STRETCH,
  XATTR_FILLBMP_TILE,
  XATTR_FILLSTYLE,
  XATTR_FILLCOLOR,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILLUSESLIDEBACKGROUND,
} from "../../../../svx/inc/xdef";
import type {
  OdfBitmapFillProperties,
  OdfBitmapGeometry,
  OdfFillProperties,
} from "../../../../xmloff/source/draw/fill-properties";
import type { SvXMLGraphicHelper } from "../../../../xmloff/source/core/xmlgrhlp";
import { exportImageStyle } from "../../../../xmloff/source/style/ImageStyle";
import {
  bitmapGeometryWhich,
  bitmapSizeToMm100,
  getBitmapMode,
  isBitmapSize,
  type createBitmapGeometryItem,
  XFillBitmapItem,
} from "../../../../svx/inc/xbtmpit";
/** Native registered fill fields; the Writer paragraph map has no slide-background property. */
export const XML_FILL_WHICH_IDS = [
  XATTR_FILLSTYLE,
  XATTR_FILLCOLOR,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILLUSESLIDEBACKGROUND,
] as const;
/** Reads only actual direct items, preserving parent inheritance in ODF styles. @param set - Actual source item set. @returns Direct native fill fields. */
export function getFillProperties(set: SfxItemSet | undefined): OdfFillProperties {
  if (set === undefined) return {};
  const style = set.GetItemIfSet(XATTR_FILLSTYLE, false),
    color = set.GetItemIfSet(XATTR_FILLCOLOR, false),
    transparency = set.GetItemIfSet(XATTR_FILLTRANSPARENCE, false);
  if (
    (style !== undefined && !(style instanceof XFillStyleItem)) ||
    (color !== undefined && !(color instanceof XFillColorItem)) ||
    (transparency !== undefined && !(transparency instanceof XFillTransparenceItem))
  )
    throw new Error("ODT paragraph fill item is invalid.");
  return {
    ...(style instanceof XFillStyleItem ? { fillStyle: style.GetValue() } : {}),
    ...(color instanceof XFillColorItem
      ? { fillColor: color.GetColorValue().GetRGBColor().toUInt32() }
      : {}),
    ...(transparency instanceof XFillTransparenceItem
      ? { fillTransparency: transparency.GetValue() }
      : {}),
  };
}

/** Queries direct bitmap geometry and projects native twips into XML property units. @param set - Actual item set. @returns Authored geometry. */
export function getBitmapGeometry(set: SfxItemSet): OdfBitmapGeometry | undefined {
  const geometry: Record<string, number | boolean> = {};
  for (const [key, which] of Object.entries(bitmapGeometryWhich)) {
    const item = set.GetItemIfSet(which, false);
    if (!item) continue;
    const value = (item as ReturnType<typeof createBitmapGeometryItem>).GetValue();
    geometry[key] =
      typeof value === "number" && isBitmapSize(which) ? bitmapSizeToMm100(value) : value;
  }
  return Object.keys(geometry).length ? (geometry as OdfBitmapGeometry) : undefined;
}

/** Reads the named direct graphic only while its fill style is bitmap. @param items - Actual fill items. @returns Authored bitmap item. */
export function getBitmapFillItem(items: SfxItemSet): XFillBitmapItem | undefined {
  const style = items.Get(XATTR_FILLSTYLE);
  if (!(style instanceof XFillStyleItem) || style.GetValue() !== FillStyle.BITMAP) return undefined;
  const bitmap = items.GetItemIfSet(XATTR_FILLBITMAP, false);
  return bitmap instanceof XFillBitmapItem ? bitmap : undefined;
}

/** Projects the represented graphic style name, mode and authored geometry. @param items - Actual frame attributes. @param styles - Document bitmap names. @returns Graphic style deltas. */
export function getBitmapFillProperties(
  items: SfxItemSet,
  styles: XMLBitmapStyleExport | undefined,
): OdfBitmapFillProperties {
  const bitmap = getBitmapFillItem(items);
  const image = bitmap && styles?.registerBitmap(bitmap);
  const geometry = getBitmapGeometry(items);
  const directMode =
    items.GetItemIfSet(XATTR_FILLBMP_TILE, false) ||
    items.GetItemIfSet(XATTR_FILLBMP_STRETCH, false);
  return {
    ...(image === undefined ? {} : { bitmapName: image.name }),
    ...(geometry === undefined ? {} : { bitmapGeometry: geometry }),
    ...(directMode ? { bitmapMode: getBitmapMode(items) } : {}),
  };
}

/** Named drawing image definitions shared by the exported ODT streams. */
export class XMLBitmapStyleExport {
  private readonly images = new Map<string, string>();

  /** Binds the named styles table to the original package graphic helper. @param graphics - Optional graphic sink. @returns Export helper. */
  constructor(private readonly graphics?: SvXMLGraphicHelper) {}

  /** Collects a named bitmap and reserves its XML image definition. @param bitmap - Native bitmap item. @returns Package path and public name when embedded. */
  registerBitmap(bitmap: XFillBitmapItem): { name: string; href: string } | undefined {
    const graphic = bitmap.GetGraphic();
    if (!this.graphics || !graphic) return undefined;
    const href = this.graphics.saveGraphic({
      bytes: graphic.GetNativeData(),
      mediaType: graphic.mediaType,
    });
    const baseName = bitmap.GetName() || "Bitmap";
    let name = baseName;
    for (let suffix = 1; this.images.has(name) && this.images.get(name) !== href; ++suffix)
      name = `${baseName} ${suffix}`;
    this.images.set(name, href);
    return { name, href };
  }

  /** Writes declarations collected by the ODT writers. @returns Named drawing styles. */
  exportStyles(): string {
    let result = "";
    for (const [name, href] of this.images) result += exportImageStyle(name, href);
    return result;
  }
}

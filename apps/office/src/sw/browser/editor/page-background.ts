/** @fileoverview Browser paint of native Writer page-style fills. */
import type { CSSProperties } from "react";
import { BitmapMode } from "../../../offapi/com/sun/star/drawing/BitmapMode";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import { RectanglePoint } from "../../../offapi/com/sun/star/drawing/RectanglePoint";
import type { SfxItemSet } from "../../../svl/inc/itemset";
import {
  XATTR_FILLBITMAP,
  XATTR_FILLCOLOR,
  XATTR_FILLSTYLE,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILLBMP_POS,
  XATTR_FILLBMP_POSOFFSETX,
  XATTR_FILLBMP_POSOFFSETY,
  XATTR_FILLBMP_SIZEX,
  XATTR_FILLBMP_SIZEY,
} from "../../../svx/inc/xdef";
import {
  getBitmapMode,
  type XFillBitmapItem,
  type XFillBmpPosItem,
} from "../../../svx/inc/xbtmpit";
import type { SfxInt32Item } from "../../../svl/inc/intitem";
import { graphicImageSource } from "../../../vcl/browser/graphic-image-source";
import type { XFillStyleItem } from "../../../svx/inc/xfillit0";
import type { XFillColorItem } from "../../../svx/inc/xflclit";
import type { XFillTransparenceItem } from "../../../svx/inc/xfltrit";
import type { SwDoc } from "../../source/core/doc/doc";
import { ResolvePageFrameFormat } from "../../source/core/layout/hffrm";
import type { SwPageFrame } from "../../source/core/layout/newfrm";

/** Converts a native signed bitmap size into browser coordinates. @param authored - Twips or negative percent. @param preferred - Graphic intrinsic twips. @returns CSS physical length or percentage. */
function bitmapExtent(authored: number, preferred: number): string {
  if (authored < 0) return `${-authored}%`;
  return authored || preferred ? `${(authored || preferred) / 15}px` : "auto";
}

/** Offsets the chosen anchor by a percentage of the tile's size, as in SdrFillGraphicAttribute. @param anchor - Browser anchor percentage. @param offset - Native tile-relative offset. @param authored - Twips or negative percent. @param preferred - Intrinsic twips. @returns CSS background position. */
function bitmapPosition(
  anchor: number,
  offset: number,
  authored: number,
  preferred: number,
): string {
  if (!offset) return `${anchor}%`;
  if (authored < 0) return `${anchor + (-authored * offset) / 100}%`;
  const shift = ((authored || preferred) * offset) / 1500;
  return `calc(${anchor}% ${shift < 0 ? "-" : "+"} ${Math.abs(shift)}px)`;
}

/** Paints the native bitmap mode and its reference-point geometry. @param item - Image item. @param mode - Tiling, no repeat, or stretch. @param point - Native anchor. @param geometry - Optional authored bitmap size and position offsets. @returns Browser background configuration. */
export function bitmapFillStyle(
  item: XFillBitmapItem,
  mode: BitmapMode,
  point: RectanglePoint,
  geometry?: SfxItemSet,
): CSSProperties | undefined {
  const graphic = item.GetGraphic();
  if (!graphic) return undefined;
  const source = `url("${graphicImageSource(graphic)}")`;
  if (mode === BitmapMode.STRETCH)
    return { backgroundImage: source, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" };
  /** Reads a bitmap geometry attribute in its stored units. @param which - Item Which. @returns Native scalar. */
  function readGeometry(which: number): number {
    return (geometry?.Get(which) as SfxInt32Item | undefined)?.GetValue() ?? 0;
  }
  const size = graphic.GetPrefSize();
  const repeat = mode === BitmapMode.REPEAT;
  const width = readGeometry(XATTR_FILLBMP_SIZEX);
  const height = readGeometry(XATTR_FILLBMP_SIZEY);
  const x = bitmapPosition(
    (point % 3) * 50,
    repeat ? readGeometry(XATTR_FILLBMP_POSOFFSETX) : 0,
    width,
    size.Width(),
  );
  const y = bitmapPosition(
    Math.floor(point / 3) * 50,
    repeat ? readGeometry(XATTR_FILLBMP_POSOFFSETY) : 0,
    height,
    size.Height(),
  );
  return {
    backgroundImage: source,
    backgroundSize: `${bitmapExtent(width, size.Width())} ${bitmapExtent(height, size.Height())}`,
    backgroundRepeat: repeat ? "repeat" : "no-repeat",
    backgroundPosition: `${x} ${y}`,
  };
}

/** Projects the current physical page format into the background paint layer. @param document - Current Writer document. @param page - Original physical page. @param previous - Previous page, if any. @returns Background-layer CSS. */
export function writerPageBackgroundStyle(
  document: SwDoc,
  page: SwPageFrame,
  previous?: SwPageFrame,
): CSSProperties | undefined {
  const descriptor = document.FindPageDesc(page.descriptor.name);
  if (!descriptor) return undefined;
  const items = ResolvePageFrameFormat(descriptor, page, previous).GetAttrSet();
  const style = (items.Get(XATTR_FILLSTYLE) as XFillStyleItem).GetValue();
  const color = (items.Get(XATTR_FILLCOLOR) as XFillColorItem).GetColorValue();
  const transparency = (items.Get(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue();
  let paint: CSSProperties | undefined;
  if (style === FillStyle.SOLID)
    paint = {
      backgroundColor: `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`,
    };
  else if (style === FillStyle.BITMAP)
    paint = bitmapFillStyle(
      items.Get(XATTR_FILLBITMAP) as XFillBitmapItem,
      getBitmapMode(items),
      (items.Get(XATTR_FILLBMP_POS) as XFillBmpPosItem).GetValue(),
      items,
    );
  if (!paint) return undefined;
  return {
    ...paint,
    inset: 0,
    opacity: (100 - transparency) / 100,
  };
}

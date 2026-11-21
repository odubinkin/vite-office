/** @fileoverview Compatible ODF brush image export from XMLBackgroundImageExport.cxx. */
import { BitmapMode } from "../../../offapi/com/sun/star/drawing/BitmapMode";
import { RectanglePoint } from "../../../offapi/com/sun/star/drawing/RectanglePoint";
import { exportBitmapMode } from "../draw/fill-properties";
import { escapeXml } from "../text/txtparae";

/** Original background properties supplied by the export property map. */
export interface OdfBackgroundImageExport {
  readonly href: string;
  readonly mode?: BitmapMode;
  readonly point?: RectanglePoint;
  readonly transparency?: number;
}

/** Emits the legacy GraphicLocation, defaulting an absent position to AREA. @param image - Package image and optional brush attributes. @returns Original background image element. */
export function exportBackgroundImage(image: OdfBackgroundImageExport): string {
  const mode = image.mode ?? BitmapMode.STRETCH;
  const point = image.point ?? RectanglePoint.MIDDLE_MIDDLE;
  const position =
    mode === BitmapMode.NO_REPEAT
      ? ` style:position="${["top", "center", "bottom"][Math.floor(point / 3)]} ${["left", "center", "right"][point % 3]}"`
      : "";
  const repeat = mode === BitmapMode.REPEAT ? "" : ` style:repeat="${exportBitmapMode(mode)}"`;
  const opacity =
    image.transparency === undefined ? "" : ` draw:opacity="${100 - image.transparency}%"`;
  return `<style:background-image xlink:href="${escapeXml(image.href)}" xlink:type="simple" xlink:actuate="onLoad"${position}${repeat}${opacity}/>`;
}

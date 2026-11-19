/** @fileoverview System color palette of the original OOXML graphic helper. */
import { Color } from "../../../tools/inc/color";

const palette = new Map([
  ["3dDkShadow", 0x716f64],
  ["3dLight", 0xf1efe2],
  ["activeBorder", 0xd4d0c8],
  ["activeCaption", 0x0054e3],
  ["appWorkspace", 0x808080],
  ["background", 0x004e98],
  ["btnFace", 0xece9d8],
  ["btnHighlight", 0xffffff],
  ["btnShadow", 0xaca899],
  ["btnText", 0],
  ["captionText", 0xffffff],
  ["gradientActiveCaption", 0x3d95ff],
  ["gradientInactiveCaption", 0xd8e4f8],
  ["grayText", 0xaca899],
  ["highlight", 0x316ac5],
  ["highlightText", 0xffffff],
  ["hotLight", 0x000080],
  ["inactiveBorder", 0xd4d0c8],
  ["inactiveCaption", 0x7a96df],
  ["inactiveCaptionText", 0xd8e4f8],
  ["infoBk", 0xffffe1],
  ["infoText", 0],
  ["menu", 0xffffff],
  ["menuBar", 0xece9d8],
  ["menuHighlight", 0x316ac5],
  ["menuText", 0],
  ["scrollBar", 0xd4d0c8],
  ["window", 0xffffff],
  ["windowFrame", 0],
  ["windowText", 0],
]);

/** Resolves a native system token and falls back to the color supplied by the source. @param token - Original color name. @param fallback - Optional lexical fallback color. @returns Resolved color or absence. */
export function getSystemColor(token: string, fallback?: Color): Color | undefined {
  const value = palette.get(token);
  return value === undefined ? fallback : new Color(value);
}

/** Original desktop output device density bound at the host's OOXML filter boundary. */
export class GraphicHelper {
  private readonly pixelPerHmmX: number;
  private readonly pixelPerHmmY: number;

  /** Uses the device's converted 100000 hundredths of a millimeter on each axis. @param pixelPerMeterX - Horizontal device extent. @param pixelPerMeterY - Vertical device extent. @returns Graphic helper. */
  constructor(pixelPerMeterX: number, pixelPerMeterY: number) {
    this.pixelPerHmmX = pixelPerMeterX / 100000;
    this.pixelPerHmmY = pixelPerMeterY / 100000;
  }

  /** Converts device X pixels with the original rounding. @param pixel - Horizontal pixels. @returns Hundredths of a millimeter. */
  convertScreenPixelXToHmm(pixel: number): number {
    return convertScreenPixelToHmm(pixel, this.pixelPerHmmX);
  }

  /** Converts device Y pixels with the original rounding. @param pixel - Vertical pixels. @returns Hundredths of a millimeter. */
  convertScreenPixelYToHmm(pixel: number): number {
    return convertScreenPixelToHmm(pixel, this.pixelPerHmmY);
  }
}

/** Keeps the original device guard and scale. @param pixel - Device coordinate. @param pixelPerHmm - Active axis scale. @returns Rounded physical coordinate. */
function convertScreenPixelToHmm(pixel: number, pixelPerHmm: number): number {
  return pixelPerHmm > 0 ? Math.trunc(pixel / pixelPerHmm + 0.5) : 0;
}

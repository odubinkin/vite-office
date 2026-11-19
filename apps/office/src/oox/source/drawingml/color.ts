/** @fileoverview DrawingML RGB/HSL conversion and Excel luminance transformations. */
import { Color } from "../../../tools/inc/color";

const maxPercent = 100_000;
const maxDegree = 360 * 60_000;

/** Applies the original Excel tint amount and conversion through integer DrawingML HSL channels. @param color - Original RGB. @param amount - Absolute tint in DrawingML percentage units. @param lighten - Whether to add the positive luminance offset. @returns Resolved RGB. */
export function applyExcelTint(color: Readonly<Color>, amount: number, lighten: boolean): Color {
  const r = color.GetRed() / 255;
  const g = color.GetGreen() / 255;
  const b = color.GetBlue() / 255;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  const luminance = Math.round(((min + max) / 2) * maxPercent);
  let saturation = 0;
  let hue = 0;
  if (delta > 0) {
    const degrees =
      max === r
        ? ((g - b) / delta) * 60 + 360
        : max === g
          ? ((b - r) / delta) * 60 + 120
          : ((r - g) / delta) * 60 + 240;
    hue = Math.round(degrees * 60_000) % maxDegree;
    saturation = Math.round(
      (delta / (luminance <= maxPercent / 2 ? min + max : 2 - max - min)) * maxPercent,
    );
  }
  const modified = Math.trunc((luminance * (maxPercent - amount)) / maxPercent);
  const result = modified + (lighten ? amount : 0);
  if (modified === 0 || result === maxPercent) saturation = 0;
  if (saturation === 0) {
    const gray = Math.round((result / maxPercent) * 255);
    return new Color(gray, gray, gray);
  }
  const sector = (hue / maxDegree) * 6;
  const lum = (2 * result) / maxPercent - 1;
  const channel =
    /** Computes one original sector channel followed by saturation and luminance. @param position - Sector offset. @returns RGB byte. */ (
      position: number,
    ): number => {
      const phase = (sector + position) % 6;
      const base = Math.min(1, Math.max(0, 2 - phase, phase - 4));
      const saturated = (base - 0.5) * (saturation / maxPercent) + 0.5;
      return Math.round((lum < 0 ? saturated * (lum + 1) : 1 - (1 - saturated) * (1 - lum)) * 255);
    };
  return new Color(channel(0), channel(4), channel(2));
}

/** @fileoverview Browser CSS boundary for actual native Color channels; no document state is retained here. */
import { Color, ColorAlpha } from "../../tools/inc/color";
/** Projects source alpha and channels to CSS without changing the native value. @param color - Actual native value. @returns CSS color. */
export function browserColor(color: Readonly<Color>): string {
  if (color.GetAlpha() === 0) return "transparent";
  if (color.GetAlpha() !== 255)
    return `rgba(${color.GetRed()}, ${color.GetGreen()}, ${color.GetBlue()}, ${color.GetAlpha() / 255})`;
  return `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Reads an actual computed sRGB CSS color into the native eight-bit value domain. Other host color spaces remain unknown instead of inventing native channels. @param value - Actual computed CSS color serialization. @returns Native channels or unknown. */
export function browserComputedColor(value: string): Color | undefined {
  const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(value);
  if (match === null) return undefined;
  const red = Number(match[1]),
    green = Number(match[2]),
    blue = Number(match[3]),
    alpha = match[4] === undefined ? 1 : Number(match[4]);
  if (red > 255 || green > 255 || blue > 255 || !Number.isFinite(alpha) || alpha < 0 || alpha > 1)
    return undefined;
  return new Color(ColorAlpha, Math.round(alpha * 255), red, green, blue, "ColorAlphaTag");
}

/** @fileoverview Browser CSS boundary for actual native Color channels; no document state is retained here. */
import type { Color } from "../../tools/inc/color";
/** Projects source alpha and channels to CSS without changing the native value. @param color - Actual native value. @returns CSS color. */
export function browserColor(color: Readonly<Color>): string {
  if (color.GetAlpha() === 0) return "transparent";
  if (color.GetAlpha() !== 255)
    return `rgba(${color.GetRed()}, ${color.GetGreen()}, ${color.GetBlue()}, ${color.GetAlpha() / 255})`;
  return `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}

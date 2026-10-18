/** @fileoverview Original basic Color luminance/contrast bodies from color.cxx; advanced color spaces remain unported. */
import type { Color } from "../../inc/color";
/** Original nonlinear normalization. @param value - Channel/255. @returns Linearized value. */
function NormalizeRGB(value: number): number {
  return value < 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}
/** Original WCAG2.1 weighted value truncated to byte. @param color - Actual color. @returns Luminance. */
export function GetWCAGLuminance(color: Readonly<Color>): number {
  return Math.trunc(
    (NormalizeRGB(color.GetRed() / 255) * 0.2126 +
      NormalizeRGB(color.GetGreen() / 255) * 0.7152 +
      NormalizeRGB(color.GetBlue() / 255) * 0.0722) *
      255,
  );
}
/** Original full-packed default-shape exception. @param color - Actual color. @returns Dark predicate. */
export function IsDark(color: Readonly<Color>): boolean {
  return color.toUInt32() === 0x729fcf
    ? color.GetLuminance() <= 62
    : color.GetWCAGLuminance() <= 87;
}
/** Original three channel increase and clamp. @param color - Actual mutable color. @param value - Native byte. @returns Nothing. */
export function IncreaseLuminance(color: Color, value: number): void {
  color.SetRed(Math.min(255, Math.max(0, color.GetRed() + value)));
  color.SetGreen(Math.min(255, Math.max(0, color.GetGreen() + value)));
  color.SetBlue(Math.min(255, Math.max(0, color.GetBlue() + value)));
}
/** Original three channel decrease and clamp. @param color - Actual mutable color. @param value - Native byte. @returns Nothing. */
export function DecreaseLuminance(color: Color, value: number): void {
  color.SetRed(Math.min(255, Math.max(0, color.GetRed() - value)));
  color.SetGreen(Math.min(255, Math.max(0, color.GetGreen() - value)));
  color.SetBlue(Math.min(255, Math.max(0, color.GetBlue() - value)));
}
/** Original bounded positive byte contrast formula; ordinaryJSround matches native fround here without a numeric-library port. @param color - Actual mutable color. @param value - Native byte. @returns Nothing. */
export function DecreaseContrast(color: Color, value: number): void {
  if (value !== 0) {
    const m = (128 - 0.4985 * value) / 128,
      off = 128 - m * 128;
    color.SetRed(Math.round(color.GetRed() * m + off));
    color.SetGreen(Math.round(color.GetGreen() * m + off));
    color.SetBlue(Math.round(color.GetBlue() * m + off));
  }
}

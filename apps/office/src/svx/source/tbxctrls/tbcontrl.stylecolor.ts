/** @fileoverview Extracted SvxStyleBox SetupEntry color decisions and TestColorsVisible; actual pool item lookup and device/UI settings remain caller-owned. */
import { Color, COL_AUTO } from "../../../tools/inc/color";
import type { Rectangle } from "../../../tools/inc/gen";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";

/** Original TestColorsVisible copies the foreground and preserves alpha, including the automatic sentinel. @param foreground - Actual style foreground. @param background - Actual row or device background. @returns Independent adjusted value. */
export function testStylePreviewColorsVisible(
  foreground: Readonly<Color>,
  background: Readonly<Color>,
): Color {
  const result = new Color(foreground);
  if (
    foreground.IsDark() === background.IsDark() &&
    foreground.IsBright() === background.IsBright()
  ) {
    const luminance = result.GetLuminance();
    if (luminance > 120 && luminance < 140) result.DecreaseLuminance(30);
    else result.DecreaseContrast(60);
  }
  return result;
}

/** Consumed SetupEntry paint operations; background flattens the source GetBackground().GetColor() access without inventing a Wallpaper object. */
export interface StylePreviewColorDevice {
  SetTextColor(color: Readonly<Color>): void;
  SetFillColor(color: Readonly<Color>): void;
  GetBackgroundColor(): Readonly<Color>;
  DrawRect(rectangle: Rectangle): void;
}

/** Values read from actual optional preview items by the owning style pool; undefined retains original missing-item behavior. */
export interface StylePreviewColorItems {
  readonly foreground?: Readonly<Color>;
  readonly fillStyle?: FillStyle;
  readonly fillColor?: Readonly<Color>;
}

/** Original SetupEntry UI text-color assignment before shell/style lookup. @param device - Actual output device. @param selected - Actual popup selection. @param windowText - Actual StyleSettings window text. @param highlightText - Actual StyleSettings highlighted text. @returns Nothing. */
export function initializeStylePreviewTextColor(
  device: StylePreviewColorDevice,
  selected: boolean,
  windowText: Readonly<Color>,
  highlightText: Readonly<Color>,
): void {
  device.SetTextColor(selected ? highlightText : windowText);
}

/** Original later SetupEntry color block, after successful preview-item lookup. Only SOLID backgrounds are drawn, and selected rows suppress style colors. @param device - Actual output device. @param rectangle - Actual row. @param selected - Actual popup selection. @param items - Actual item values. @returns Nothing. */
export function applyStylePreviewColors(
  device: StylePreviewColorDevice,
  rectangle: Rectangle,
  selected: boolean,
  items: StylePreviewColorItems,
): void {
  let foreground: Readonly<Color> = COL_AUTO;
  let background: Readonly<Color> = COL_AUTO;
  if (items.foreground !== undefined && !selected) foreground = items.foreground;
  const style = items.fillStyle !== undefined && !selected ? items.fillStyle : FillStyle.NONE;
  if (style === FillStyle.SOLID) {
    if (items.fillColor !== undefined) background = items.fillColor;
    if (!background.equals(COL_AUTO)) {
      device.SetFillColor(background);
      device.DrawRect(rectangle);
    }
  }
  if (!foreground.equals(COL_AUTO) || !background.equals(COL_AUTO))
    foreground = testStylePreviewColorsVisible(
      foreground,
      !background.equals(COL_AUTO) ? background : device.GetBackgroundColor(),
    );
  if (!foreground.equals(COL_AUTO)) device.SetTextColor(foreground);
}

/** @fileoverview Native FontNameBox item sizing and DrawPreview from svtools/source/control/ctrlbox.cxx, over an actual paint-device boundary. */
import { Font } from "../../../vcl/source/font/font";
import { Size } from "../../../tools/inc/gen";
import { UScriptCode as S } from "../../../external/icu/source/common/unicode/uscript";
import {
  canRenderNameOfSelectedFont,
  isSymbolFont,
  makeShortMinimalTextForScript,
  makeShortRepresentativeSymbolTextForSelectedFont,
  makeShortRepresentativeTextForScript,
  makeShortRepresentativeTextForSelectedFont,
  type FontSampleDevice,
} from "../misc/sampletext";

/** Device-space ink rectangle, without imposing a separate text layout engine. */
export interface FontPreviewBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** Actual paint/measurement contracts consumed by FontNameBox; the browser implements them with Canvas. */
export interface FontNamePreviewDevice extends FontSampleDevice {
  SetFont(font: Font): void;
  GetTextBoundRect(text: string): FontPreviewBounds | undefined;
  GetTextColor(): string;
  SetTextColor(color: string): void;
  DrawText(x: number, y: number, text: string): void;
}

const emptyBounds: FontPreviewBounds = { left: 0, top: 0, width: 0, height: 0 };
const fallbackScripts = [
  S.USCRIPT_ARABIC,
  S.USCRIPT_HEBREW,
  S.USCRIPT_BENGALI,
  S.USCRIPT_GURMUKHI,
  S.USCRIPT_GUJARATI,
  S.USCRIPT_ORIYA,
  S.USCRIPT_TAMIL,
  S.USCRIPT_TELUGU,
  S.USCRIPT_KANNADA,
  S.USCRIPT_MALAYALAM,
  S.USCRIPT_SINHALA,
  S.USCRIPT_DEVANAGARI,
  S.USCRIPT_THAI,
  S.USCRIPT_LAO,
  S.USCRIPT_GEORGIAN,
  S.USCRIPT_TIBETAN,
  S.USCRIPT_SYRIAC,
  S.USCRIPT_MYANMAR,
  S.USCRIPT_ETHIOPIC,
  S.USCRIPT_KHMER,
  S.USCRIPT_MONGOLIAN,
  S.USCRIPT_KOREAN,
  S.USCRIPT_JAPANESE,
  S.USCRIPT_HAN,
  S.USCRIPT_SIMPLIFIED_HAN,
  S.USCRIPT_TRADITIONAL_HAN,
  S.USCRIPT_GREEK,
] as const;

/** Retains the original 52-digit width and integer 1.6 text-height sizing. @param digitWidth - Device's approximate digit width. @param textHeight - UI text height. @returns Native item extent. */
export function getFontNamePreviewSize(digitWidth: number, textHeight: number): Size {
  return new Size(digitWidth * 52, Math.trunc((textHeight * 16) / 10));
}

/** Original five-pixel height reduction, retaining the last rectangle on a failed measurement. @param text - Measured text. @param height - Available row height. @param font - Mutable local preview font. @param device - Actual output device. @param previous - Last native rectangle value. @returns Native width and retained rectangle. */
function shrinkFontToFit(
  text: string,
  height: number,
  font: Font,
  device: FontNamePreviewDevice,
  previous: FontPreviewBounds,
): Readonly<{ width: number; bounds: FontPreviewBounds }> {
  let bounds = previous;
  while (font.GetFontHeight() > 0) {
    const measured = device.GetTextBoundRect(text);
    if (measured === undefined) break;
    bounds = measured;
    if (bounds.height <= height) return { width: bounds.width, bounds };
    font.SetFontHeight(font.GetFontHeight() - 5);
    device.SetFont(font);
  }
  return { width: 0, bounds };
}

/** Draws one original font preview: readable name, native script/symbol sample, fitting and selection colors. @param metric - Actual family metric metadata. @param device - Actual measurement/paint device. @param itemSize - Item extent. @param selected - Native selected-row state. @param colors - Current UI style colors. @param origin - Native top-left device position. @returns Nothing. */
export function drawFontNamePreview(
  metric: Font,
  device: FontNamePreviewDevice,
  itemSize: Size,
  selected: boolean,
  colors: Readonly<{ text: string; highlightText: string }>,
  origin: Readonly<{ x: number; y: number }> = { x: 0, y: 0 },
): void {
  const oldColor = device.GetTextColor();
  const oldFont = new Font(device.GetFont());
  device.SetTextColor(selected ? colors.highlightText : colors.text);
  try {
    const x = origin.x + 5;
    const height = itemSize.Height();
    const symbol = isSymbolFont(metric);
    const font = new Font(metric);
    font.SetFontSize(new Size(oldFont.GetFontSize().Width(), oldFont.GetFontHeight() + 5));
    device.SetFont(font);
    let bounds = emptyBounds;
    let ownFont = canRenderNameOfSelectedFont(device);
    const name = metric.GetFamilyName();
    if (ownFont) {
      const measured = shrinkFontToFit(name, height, font, device, bounds);
      bounds = measured.bounds;
      ownFont = measured.width !== 0;
    }
    if (!ownFont) {
      device.SetFont(oldFont);
      bounds = device.GetTextBoundRect(name) ?? bounds;
    }
    let vertical = Math.trunc((height - bounds.height) / 2) - bounds.top;
    device.DrawText(x, origin.y + vertical, name);
    const textX = x + bounds.width + 10;
    if (!ownFont) device.SetFont(font);

    let sample = "";
    if (!symbol && (name.charCodeAt(0) <= 122 || !ownFont))
      sample = makeShortRepresentativeTextForSelectedFont(device);
    if (sample.length === 0 && !ownFont) {
      for (const script of fallbackScripts) {
        const candidate = makeShortRepresentativeTextForScript(script);
        if (candidate.length !== 0 && device.HasGlyphs(font, candidate) === -1) {
          sample = candidate;
          break;
        }
      }
      // Native code runs the minimal loop even when the preceding loop found a sample.
      for (const script of [S.USCRIPT_HEBREW, S.USCRIPT_GREEK]) {
        const candidate = makeShortMinimalTextForScript(script);
        if (candidate.length !== 0 && device.HasGlyphs(font, candidate) === -1) {
          sample = candidate;
          break;
        }
      }
    }
    if (symbol || (!ownFont && sample.length === 0))
      sample = makeShortRepresentativeSymbolTextForSelectedFont(device);
    if (sample.length !== 0) {
      const space = itemSize.Width() - textX - 5;
      if (space >= 0) {
        const measured = shrinkFontToFit(sample, height, font, device, bounds);
        bounds = measured.bounds;
        let width = measured.width;
        while (width > space || width > itemSize.Width()) {
          sample = sample.slice(0, -1);
          const rectangle = device.GetTextBoundRect(sample);
          if (rectangle !== undefined) bounds = rectangle;
          width = rectangle === undefined ? 0 : rectangle.width;
        }
        if (sample.length !== 0 && width !== 0) {
          vertical = Math.trunc((height - bounds.height) / 2) - bounds.top;
          device.DrawText(textX + space - width, origin.y + vertical, sample);
        }
      }
    }
  } finally {
    device.SetFont(oldFont);
    device.SetTextColor(oldColor);
  }
}

/** @fileoverview Browser output-device boundary for physical VCL text width in Writer twip map mode. */
import type { ConstFont } from "../source/font/font";
import { FontFamily, FontItalic } from "../../tools/inc/fontenum";
import { browserFontFamily, cssWeight } from "./font-family";
import { quoteFontFamily } from "./font-preview-device";

const contexts = new WeakMap<Document, CanvasRenderingContext2D>();

/** Measures actual shaped Canvas text with the selected VCL font and native range. @param document - Host document. @param font - Native VCL font in twips. @param text - Source string. @param start - UTF16 start. @param length - UTF16 length. @returns Width in twips. */
export function measureBrowserTextWidth(
  document: Document,
  font: ConstFont,
  text: string,
  start: number,
  length: number,
): number {
  if (!length) return 0;
  if (font.GetFontHeight() <= 0)
    throw new Error("Writer output device requires a positive font height.");
  let context = contexts.get(document);
  if (context === undefined) {
    const created = document.createElement("canvas").getContext("2d");
    if (created === null) throw new Error("Writer output device is unavailable.");
    contexts.set(document, created);
    context = created;
  }
  const family = font.GetFontFamily(),
    generic =
      family === FontFamily.FAMILY_ROMAN
        ? "roman"
        : family === FontFamily.FAMILY_SWISS
          ? "swiss"
          : family === FontFamily.FAMILY_MODERN
            ? "modern"
            : undefined;
  const fontNames = font.GetFamilyName().split(";").map(quoteFontFamily).join(";"),
    names = browserFontFamily(fontNames, generic);
  const italic = font.GetItalic();
  const style =
    italic === FontItalic.ITALIC_NONE || italic === FontItalic.ITALIC_DONTKNOW
      ? "normal"
      : italic === FontItalic.ITALIC_OBLIQUE
        ? "oblique"
        : "italic";
  context.font = `${style} ${cssWeight(font.GetWeight())} ${font.GetFontHeight() / 15}px ${names}`;
  const width = context.measureText(text.slice(start, start + length)).width;
  if (!Number.isFinite(width) || width < 0)
    throw new Error("Writer output device could not measure text width.");
  return Math.round(width * 15);
}

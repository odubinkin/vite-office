/** @fileoverview Actual Canvas font preview device; physical character maps and OS/2 capabilities come from acquired face data, never CSS fallback probes. */
import { Font } from "../source/font/font";
import type { FontCharMap } from "../source/font/fontcharmap";
import type { FontCapabilities } from "../inc/fontcapabilities";
import { hasGlyphsInFontCharMap } from "../source/outdev/font";

/** Metadata read from one actual registered physical face. */
export interface BrowserFontPreviewFace {
  readonly renderingFamily?: string | undefined;
  readonly characterMap?: FontCharMap | undefined;
  readonly capabilities?: FontCapabilities | undefined;
  readonly style?: string | undefined;
  readonly weight?: string | undefined;
}

/** Quotes one physical family as a CSS string, preserving control characters as hexadecimal escapes. @param family - Exact physical name. @returns Single-family CSS value. */
export function quoteFontFamily(family: string): string {
  return `"${family.replace(
    /[\\"\p{Cc}]/gu,
    /** Escapes a CSS string unit without interpreting the family as a fallback list. @param char - Original unit. @returns CSS escape. */
    (char) => `\\${char.charCodeAt(0).toString(16)} `,
  )}"`;
}

/** Native-compatible read/paint methods implemented by the real browser Canvas context. */
export class BrowserFontPreviewDevice {
  private font: Font;
  private color: string;
  private readonly uiFamily: string;

  /** Binds actual Canvas and acquired face data; UI font descriptors come from getComputedStyle. @param context - Real drawing context. @param uiFont - UI family and pixel size. @param uiStyle - Actual UI style,weight and color. @param face - Actual current physical-face lookup. @returns Device. */
  public constructor(
    private readonly context: CanvasRenderingContext2D,
    uiFont: Font,
    private readonly uiStyle: Readonly<{ style: string; weight: string; color: string }>,
    private readonly face: (family: string) => BrowserFontPreviewFace | undefined,
  ) {
    this.font = new Font(uiFont);
    this.uiFamily = uiFont.GetFamilyName();
    this.color = uiStyle.color;
    this.SetFont(uiFont);
    this.SetTextColor(uiStyle.color);
    context.textBaseline = "alphabetic";
    context.textAlign = "left";
  }

  /** Returns current native font metadata. @returns Font. */
  public GetFont(): Font {
    return this.font;
  }

  /** Selects a copied native font value and its actual browser descriptors. @param font - Current font. @returns Nothing. */
  public SetFont(font: Font): void {
    this.font = new Font(font);
    const name = font.GetFamilyName();
    const ui = name === this.uiFamily;
    const face = this.face(name);
    const style = ui ? this.uiStyle.style : (face?.style ?? "normal");
    const weight = ui ? this.uiStyle.weight : (face?.weight ?? "400");
    // The computed UI family is already a valid CSS fallback list; physical names are single strings.
    const family = ui ? this.uiFamily : quoteFontFamily(face?.renderingFamily ?? name);
    this.context.font = `${style} ${weight} ${font.GetFontHeight()}px ${family}`;
  }

  /** Uses the original glyph loop over actual physical face data. @param font - Face whose glyphs are requested. @param text - Requested UTF16 text. @returns Source failure offset or minus one. */
  public HasGlyphs(font: Font, text: string): number {
    return hasGlyphsInFontCharMap(this.face(font.GetFamilyName())?.characterMap, text);
  }

  /** Rejects missing/default maps like native OutputDevice::GetFontCharMap. @returns Actual usable map or no map. */
  public GetFontCharMap(): FontCharMap | undefined {
    const map = this.face(this.font.GetFamilyName())?.characterMap;
    return map !== undefined && !map.IsDefaultMap() ? map : undefined;
  }

  /** Returns the actual face's advertised coverage, retaining absent versus empty bitsets. @returns Capabilities or no data. */
  public GetFontCapabilities(): FontCapabilities | undefined {
    return this.face(this.font.GetFamilyName())?.capabilities;
  }

  /** Measures actual glyph ink with Canvas rather than approximating widths from character counts. @param text - Text. @returns Integer device rectangle, or no rectangle for empty/unsupported metrics. */
  public GetTextBoundRect(text: string) {
    if (text.length === 0) return undefined;
    const measured = this.context.measureText(text);
    const left = Math.floor(-measured.actualBoundingBoxLeft);
    const top = Math.floor(-measured.actualBoundingBoxAscent);
    const right = Math.ceil(measured.actualBoundingBoxRight);
    const bottom = Math.ceil(measured.actualBoundingBoxDescent);
    if (![left, top, right, bottom].every(Number.isFinite)) return undefined;
    return { left, top, width: right - left, height: bottom - top };
  }

  /** Reads the actual device color. @returns CSS color. */
  public GetTextColor(): string {
    return this.color;
  }

  /** Updates the real Canvas paint color. @param color - Current style color. @returns Nothing. */
  public SetTextColor(color: string): void {
    this.color = color;
    this.context.fillStyle = color;
  }

  /** Draws real text at the source-computed position. @param x - Device x. @param y - Baseline y. @param text - Source-selected sample or name. @returns Nothing. */
  public DrawText(x: number, y: number, text: string): void {
    this.context.fillText(text, x, y);
  }
}

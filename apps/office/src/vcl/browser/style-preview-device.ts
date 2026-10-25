/** @fileoverview Actual Canvas text device for source style preview algorithms; CSS descriptor projection follows native SVG export, while browser font metrics/shaping remain browser-owned. */
import { Font, type ConstFont } from "../source/font/font";
import { Rectangle, Size, type ReadonlySize, type ReadonlyPoint } from "../../tools/inc/gen";
import { FontItalic, FontWeight, TextAlign } from "../../tools/inc/fontenum";
import { quoteFontFamily } from "./font-preview-device";
import { Color } from "../../tools/inc/color";
import { MapUnit, MapToO3tlLength } from "../../tools/inc/mapunit";
import { Length, convert } from "../../o3tl/inc/unit_conversion";
import { browserColor } from "./color";

/** Actual host paint state; undefined line color explicitly disables the native rectangle outline. */
export interface BrowserStylePreviewPaintState {
  readonly background: Readonly<Color>;
  readonly fillColor: Readonly<Color>;
  readonly lineColor: Readonly<Color> | undefined;
}

/** Explicit host-device unavailability;core model/item errors are not swallowed by preview hosts. */
export class BrowserStylePreviewUnavailable extends Error {}

/** Actual text-output operation after source font choice,scaling and baseline conversion; browser SVG can supply native decorated text while Canvas retains actual metrics. */
export interface BrowserStylePreviewText {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly font: ConstFont;
  readonly cssFont: string;
  readonly color: string;
}
/** Actual browser text-paint boundary; no layout or font decision is delegated to this callback. */
export type BrowserStylePreviewTextSink = (text: BrowserStylePreviewText) => void;

/** Original default MapMode length resolution and lcl_logicToPixel rounding,projected to browser CSS pixels (96per inch) before the actual backing-store DPR transform. Font-relative/native application units are not guessed. @param size - Actual logical size. @param unit - Actual shell map unit. @returns Integral CSS-pixel size. */
export function stylePreviewLogicToCssPixel(size: ReadonlySize, unit: MapUnit): Size {
  const length = MapToO3tlLength(unit);
  if (length === Length.invalid)
    throw new BrowserStylePreviewUnavailable("Style preview requires an absolute shell map unit.");
  const factor = unit === MapUnit.MapPixel ? 1 / 96 : convert(1, length, Length.in);
  /** Retains original multiply order and std::llround ties away from zero. @param n - Native signed logical extent. @returns Source rounded pixel extent. */
  function pixel(n: number): number {
    const value = n * factor * 96;
    return value < 0 ? Math.ceil(value - 0.5) : Math.floor(value + 0.5);
  }
  return new Size(pixel(size.Width()), pixel(size.Height()));
}

/** Original CSS weight projection from SVGAttributeWriter::SetFontAttr; SEMILIGHT and unknown values use400. @param weight - Actual stored weight. @returns CSS weight. */
function cssWeight(weight: FontWeight): number {
  switch (weight) {
    case FontWeight.WEIGHT_THIN:
      return 100;
    case FontWeight.WEIGHT_ULTRALIGHT:
      return 200;
    case FontWeight.WEIGHT_LIGHT:
      return 300;
    case FontWeight.WEIGHT_MEDIUM:
      return 500;
    case FontWeight.WEIGHT_SEMIBOLD:
      return 600;
    case FontWeight.WEIGHT_BOLD:
      return 700;
    case FontWeight.WEIGHT_ULTRABOLD:
      return 800;
    case FontWeight.WEIGHT_BLACK:
      return 900;
    default:
      return 400;
  }
}

/** Real Canvas adapter for the consumed zero-average-width style-font path; this does not implement native font matching or EditEngine script analysis. */
export class BrowserStylePreviewDevice {
  private font: Font;
  private readonly uiFamily: string;
  private readonly background: Readonly<Color>;
  private fillColor: Readonly<Color>;
  private readonly lineColor: Readonly<Color> | undefined;
  /** Binds real Canvas and an actual UI font whose family is the computed CSS family list. @param context - Actual Canvas context. @param uiFont - Actual UI family and stored pixel font values. @param color - Actual UI text color. @param paint - Explicit host background, fill and outline state. @param textSink - Optional actual browser SVG text output. @returns Device. */
  constructor(
    private readonly context: CanvasRenderingContext2D,
    uiFont: ConstFont,
    color: string,
    paint: BrowserStylePreviewPaintState,
    private readonly textSink?: BrowserStylePreviewTextSink,
  ) {
    this.font = new Font(uiFont);
    this.uiFamily = uiFont.GetFamilyName();
    this.background = Object.freeze(new Color(paint.background));
    this.fillColor = Object.freeze(new Color(paint.fillColor));
    this.lineColor =
      paint.lineColor === undefined ? undefined : Object.freeze(new Color(paint.lineColor));
    context.textBaseline = "alphabetic";
    context.textAlign = "left";
    context.fillStyle = color;
    this.SetFont(uiFont);
  }
  /** Original SetTextColor value is projected without discarding alpha. @param color - Actual native color. @returns Nothing. */
  public SetTextColor(color: Readonly<Color>): void {
    this.context.fillStyle = browserColor(color);
  }
  /** Independent native rectangle fill state does not change text color. @param color - Actual fill value. @returns Nothing. */
  public SetFillColor(color: Readonly<Color>): void {
    this.fillColor = Object.freeze(new Color(color));
  }
  /** Consumed GetBackground().GetColor() result is the explicit host background. @returns Background value. */
  public GetBackgroundColor(): Readonly<Color> {
    return this.background;
  }
  /** Normalizes nonempty source rectangles like OutputDevice::DrawRect. Fill spans inclusive extents; the outline excludes the final edge as CairoCommon::drawRect does. Browser rasterization is not native pixel parity. @param rectangle - Actual source row. @returns Nothing. */
  public DrawRect(rectangle: Rectangle): void {
    if (rectangle.IsEmpty()) return;
    const left = Math.min(rectangle.Left(), rectangle.Right()),
      top = Math.min(rectangle.Top(), rectangle.Bottom()),
      width = Math.abs(rectangle.Right() - rectangle.Left()) + 1,
      height = Math.abs(rectangle.Bottom() - rectangle.Top()) + 1;
    this.context.save();
    try {
      this.context.fillStyle = browserColor(this.fillColor);
      this.context.fillRect(left, top, width, height);
      if (this.lineColor !== undefined) {
        this.context.strokeStyle = browserColor(this.lineColor);
        this.context.lineWidth = 1;
        this.context.strokeRect(left, top, width - 1, height - 1);
      }
    } finally {
      this.context.restore();
    }
  }
  /** Returns actual copied device font state. @returns Current font. */
  public GetFont(): Font {
    return this.font;
  }
  /** Projects original SVG CSS style/weight values and preserves the actual family identity. Native arbitrary average-width matching is unavailable through Canvas and is not guessed. @param value - Actual font. @returns Nothing. */
  public SetFont(value: ConstFont): void {
    if (value.GetAverageFontWidth() !== 0 || value.GetFontHeight() <= 0)
      throw new BrowserStylePreviewUnavailable(
        "Canvas style preview requires a positive height and default average width.",
      );
    const italic = value.GetItalic();
    const style =
      italic === FontItalic.ITALIC_NONE
        ? "normal"
        : italic === FontItalic.ITALIC_OBLIQUE
          ? "oblique"
          : "italic";
    const family =
      value.GetFamilyName() === this.uiFamily
        ? this.uiFamily
        : quoteFontFamily(value.GetFamilyName());
    this.context.font = `${style} ${cssWeight(value.GetWeight())} ${value.GetFontHeight()}px ${family}`;
    this.font = new Font(value);
  }
  /** Original alignment offset uses ascent for TOP,zero for BASELINE and negative descent otherwise;actual ascent/descent are exposed by Canvas. @param metrics - Actual Canvas metrics. @returns Device baseline offset or unavailable metrics. */
  private baselineOffset(metrics: TextMetrics): number | undefined {
    const align = this.font.GetAlignment();
    if (align === TextAlign.ALIGN_BASELINE) return 0;
    const offset =
      align === TextAlign.ALIGN_TOP
        ? metrics.fontBoundingBoxAscent
        : -metrics.fontBoundingBoxDescent;
    return Number.isFinite(offset) ? offset : undefined;
  }
  /** Measures actual substring ink in the original whole-string/UTF16 request shape. Browser floor/ceil encloses actual Canvas ink;native approxValue/raster equality is not claimed. @param text - Entire style label. @param start - UTF16 start. @param length - UTF16 length. @returns Closed-edge rectangle or unknown metrics. */
  public GetTextBoundRect(text: string, start: number, length: number): Rectangle | undefined {
    const fragment = text.slice(start, start + length);
    if (fragment.length === 0) return new Rectangle();
    const metrics = this.context.measureText(fragment),
      offset = this.baselineOffset(metrics);
    if (offset === undefined) return undefined;
    const left = -metrics.actualBoundingBoxLeft,
      right = metrics.actualBoundingBoxRight;
    const top = -metrics.actualBoundingBoxAscent,
      bottom = metrics.actualBoundingBoxDescent;
    if (![left, right, top, bottom].every(Number.isFinite)) return undefined;
    if (left === right && top === bottom) return new Rectangle();
    return new Rectangle(
      Math.floor(left),
      Math.floor(top + offset),
      Math.ceil(right),
      Math.ceil(bottom + offset),
    );
  }
  /** Uses actual advance width and the native positive-width nearest-integer boundary. @param text - Entire style label. @param start - UTF16 start. @param length - UTF16 length. @returns Rounded advance. */
  public GetTextWidth(text: string, start: number, length: number): number {
    return Math.round(this.context.measureText(text.slice(start, start + length)).width);
  }
  /** Draws actual text at the source-computed position with the original alignment offset. Missing device metrics fail explicitly rather than drawing at an invented baseline. @param point - Actual source pen. @param text - Entire label. @param start - UTF16 start. @param length - UTF16 length. @returns Nothing. */
  public DrawText(point: ReadonlyPoint, text: string, start: number, length: number): void {
    const fragment = text.slice(start, start + length);
    const offset = this.baselineOffset(this.context.measureText(fragment));
    if (offset === undefined)
      throw new BrowserStylePreviewUnavailable(
        "Canvas style preview font metrics are unavailable.",
      );
    if (this.textSink !== undefined)
      this.textSink({
        text: fragment,
        x: point.X(),
        y: point.Y() + offset,
        font: new Font(this.font),
        cssFont: this.context.font,
        color: this.context.fillStyle as string,
      });
    else this.context.fillText(fragment, point.X(), point.Y() + offset);
  }
}

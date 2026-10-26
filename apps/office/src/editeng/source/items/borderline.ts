/** @fileoverview Implements the represented native SvxBorderLine value and width arithmetic. */
import { BorderLineStyle } from "../../../offapi/com/sun/star/table/BorderLineStyle";
import { BorderWidthImpl } from "../../../svtools/source/control/ctrlbox";
import { Color, ColorTransparency } from "../../../tools/inc/color";
export { BorderLineStyle as SvxBorderLineStyle };

/** Rounds signed metrics as native BigInt::Scale(double), with ties away from zero. @param value - Metric. @param scale - Scale factor. @returns Rounded metric. */
export function roundBorderMetric(value: number, scale: number): number {
  const product = value * scale;
  return product < 0 ? -Math.floor(-product + 0.5) : Math.floor(product + 0.5);
}

/** Converts native twip width to the Word/RTF line-width contract from editeng borderline.cxx. */
export function ConvertBorderWidthToWord(style: BorderLineStyle, width: number): number {
  if (width === 0) return 0;
  switch (style) {
    case BorderLineStyle.SOLID:
    case BorderLineStyle.DOTTED:
    case BorderLineStyle.DASHED:
    case BorderLineStyle.FINE_DASHED:
    case BorderLineStyle.DASH_DOT:
    case BorderLineStyle.DASH_DOT_DOT:
      return width;
    case BorderLineStyle.DOUBLE:
    case BorderLineStyle.DOUBLE_THIN:
      return Math.max(1, width / 3);
    case BorderLineStyle.THINTHICK_MEDIUMGAP:
    case BorderLineStyle.THICKTHIN_MEDIUMGAP:
    case BorderLineStyle.EMBOSSED:
    case BorderLineStyle.ENGRAVED:
      return Math.max(1, width / 2);
    case BorderLineStyle.THINTHICK_SMALLGAP:
    case BorderLineStyle.THICKTHIN_SMALLGAP:
      return Math.max(1, width - 30);
    case BorderLineStyle.THINTHICK_LARGEGAP:
    case BorderLineStyle.THICKTHIN_LARGEGAP:
      return Math.max(1, width - 45);
    case BorderLineStyle.OUTSET:
    case BorderLineStyle.INSET:
      return Math.max(1, (width - 15) / 2);
    case BorderLineStyle.NONE:
      return 0;
    default:
      return 0;
  }
}

/** Reconstructs a native twip width from Word/RTF border width and line style. */
export function ConvertBorderWidthFromWord(
  style: BorderLineStyle,
  wordWidth: number,
  wordLineStyle = 0,
): number {
  const width = wordWidth === 0 ? 15 : wordWidth;
  switch (style) {
    case BorderLineStyle.SOLID:
      return wordLineStyle === 2 ? width * 2 : wordLineStyle === 5 ? Math.max(width, 1) : width;
    case BorderLineStyle.DOTTED:
    case BorderLineStyle.DASHED:
    case BorderLineStyle.DASH_DOT:
    case BorderLineStyle.DASH_DOT_DOT:
      return width;
    case BorderLineStyle.FINE_DASHED:
      return width > 0 && width < 20 ? 20 : width;
    case BorderLineStyle.DOUBLE:
      return width * 3;
    case BorderLineStyle.THINTHICK_MEDIUMGAP:
    case BorderLineStyle.THICKTHIN_MEDIUMGAP:
    case BorderLineStyle.EMBOSSED:
    case BorderLineStyle.ENGRAVED:
      return width * 2;
    case BorderLineStyle.THINTHICK_SMALLGAP:
    case BorderLineStyle.THICKTHIN_SMALLGAP:
      return width + 30;
    case BorderLineStyle.THINTHICK_LARGEGAP:
    case BorderLineStyle.THICKTHIN_LARGEGAP:
      return width + 45;
    case BorderLineStyle.OUTSET:
    case BorderLineStyle.INSET:
      return width * 2 + 15;
    default:
      return 0;
  }
}

/** Primitive browser transport state; theme colors remain unrepresented. */
export interface BorderLineRecord {
  readonly color: number;
  readonly width: number;
  readonly style: BorderLineStyle;
  readonly scale: number;
  readonly mirror: boolean;
  readonly useLeftTop: boolean;
  readonly implementation: readonly [number, number, number, number];
}

/** Owns a native line independently of any CSS serialization. */
export class SvxBorderLine {
  private readonly color = new Color();
  private scale = 1;
  private mirror = false;
  private useLeftTop = false;
  private implementation: BorderWidthImpl;
  /** Creates the native black, zero-width, solid default. @param color - Borrowed optional native Color, copied into the owner. @param width - Authored total twips. @param style - Native style. @returns Nothing. */
  public constructor(
    color: Readonly<Color> | null = null,
    private width = 0,
    private style = BorderLineStyle.SOLID,
  ) {
    if (color !== null) this.color.assign(color);
    this.width = Math.trunc(width);
    this.implementation = SvxBorderLine.getWidthImpl(style);
  }
  /** Creates the source-defined fixed and variable width implementation. @param style - Native numeric style. @returns Component arithmetic. */
  public static getWidthImpl(style: BorderLineStyle): BorderWidthImpl {
    switch (style) {
      case BorderLineStyle.SOLID:
      case BorderLineStyle.DOTTED:
      case BorderLineStyle.DASHED:
      case BorderLineStyle.FINE_DASHED:
      case BorderLineStyle.DASH_DOT:
      case BorderLineStyle.DASH_DOT_DOT:
        return new BorderWidthImpl(1, 1, 0, 0);
      case BorderLineStyle.DOUBLE:
        return new BorderWidthImpl(7, 1 / 3, 1 / 3, 1 / 3);
      case BorderLineStyle.DOUBLE_THIN:
        return new BorderWidthImpl(4, 10, 10, 1);
      case BorderLineStyle.THINTHICK_SMALLGAP:
        return new BorderWidthImpl(1, 1, 15, 15);
      case BorderLineStyle.THINTHICK_MEDIUMGAP:
        return new BorderWidthImpl(7, 0.5, 0.25, 0.25);
      case BorderLineStyle.THINTHICK_LARGEGAP:
        return new BorderWidthImpl(4, 30, 15, 1);
      case BorderLineStyle.THICKTHIN_SMALLGAP:
        return new BorderWidthImpl(2, 15, 1, 15);
      case BorderLineStyle.THICKTHIN_MEDIUMGAP:
        return new BorderWidthImpl(7, 0.25, 0.5, 0.25);
      case BorderLineStyle.THICKTHIN_LARGEGAP:
        return new BorderWidthImpl(4, 15, 30, 1);
      case BorderLineStyle.EMBOSSED:
      case BorderLineStyle.ENGRAVED:
        return new BorderWidthImpl(7, 0.25, 0.25, 0.5);
      case BorderLineStyle.OUTSET:
        return new BorderWidthImpl(6, 15, 0.5, 0.5);
      case BorderLineStyle.INSET:
        return new BorderWidthImpl(5, 0.5, 15, 0.5);
      default:
        return new BorderWidthImpl(0, 0, 0, 0);
    }
  }
  /** Reads final native color. @returns Borrowed const native color. */
  public GetColor(): Readonly<Color> {
    return this.color;
  }
  /** Changes final native color. @param color - Native color copied into this owner. @returns Nothing. */
  public SetColor(color: Readonly<Color>): void {
    this.color.assign(color);
  }
  /** Reads authored total width before metric scaling. @returns Twips. */
  public GetWidth(): number {
    return this.width;
  }
  /** Changes total width. @param width - Twips. @returns Nothing. */
  public SetWidth(width: number): void {
    this.width = Math.trunc(width);
  }
  /** Reads the native style. @returns Style ID. */
  public GetBorderLineStyle(): BorderLineStyle {
    return this.style;
  }
  /** Changes the style and its component implementation. @param style - Native style. @returns Nothing. */
  public SetBorderLineStyle(style: BorderLineStyle): void {
    this.style = style;
    this.implementation = SvxBorderLine.getWidthImpl(style);
    this.useLeftTop = style >= 10 && style <= 13;
  }
  /** Replaces the metric scale, as native ScaleMetrics does. @param scale - Scale factor. @returns Nothing. */
  public ScaleMetrics(scale: number): void {
    this.scale = scale;
  }
  /** Enables native mirrored line widths. @returns Nothing. */
  public SetMirrorWidths(): void {
    this.mirror = true;
  }
  /** Reads the unsigned scaled outer component. @returns Twips. */
  public GetOutWidth(): number {
    return (
      roundBorderMetric(
        this.mirror
          ? this.implementation.GetLine2(this.width)
          : this.implementation.GetLine1(this.width),
        this.scale,
      ) & 0xffff
    );
  }
  /** Reads the unsigned scaled inner component. @returns Twips. */
  public GetInWidth(): number {
    return (
      roundBorderMetric(
        this.mirror
          ? this.implementation.GetLine1(this.width)
          : this.implementation.GetLine2(this.width),
        this.scale,
      ) & 0xffff
    );
  }
  /** Reads the unsigned scaled gap. @returns Twips. */
  public GetDistance(): number {
    return roundBorderMetric(this.implementation.GetGap(this.width), this.scale) & 0xffff;
  }
  /** Reads the sum of scaled line components and gap. @returns Twips. */
  public GetScaledWidth(): number {
    return (this.GetOutWidth() + this.GetInWidth() + this.GetDistance()) & 0xffff;
  }
  /** Reports a native empty line. @returns Whether empty. */
  public isEmpty(): boolean {
    return this.implementation.IsEmpty() || this.style === BorderLineStyle.NONE || this.width === 0;
  }
  /** Reports a native double implementation. @returns Whether double. */
  public isDouble(): boolean {
    return this.implementation.IsDouble();
  }
  /** Infers native double variants and custom ratios from ODF components. @param style - Requested style. @param outer - Outer twips. @param inner - Inner twips. @param gap - Gap twips. @returns Nothing. */
  public GuessLinesWidths(style: BorderLineStyle, outer: number, inner = 0, gap = 0): void {
    if (style === BorderLineStyle.NONE)
      style = outer > 0 && inner > 0 ? BorderLineStyle.DOUBLE : BorderLineStyle.SOLID;
    if (style === BorderLineStyle.DOUBLE) {
      for (const candidate of [3, 15, 4, 5, 6, 7, 8, 9]) {
        const width = SvxBorderLine.getWidthImpl(candidate).GuessWidth(outer, inner, gap);
        if (width !== 0) {
          this.SetBorderLineStyle(candidate);
          this.width = width;
          return;
        }
      }
      this.SetBorderLineStyle(style);
      this.width = outer + inner + gap;
      if (this.width !== 0)
        this.implementation = new BorderWidthImpl(
          7,
          outer / this.width,
          inner / this.width,
          gap / this.width,
        );
    } else {
      this.SetBorderLineStyle(style);
      if (outer === 0 && inner > 0 && [0, 1, 2, 14, 16, 17].includes(style))
        [outer, inner] = [inner, outer];
      this.width = this.implementation.GuessWidth(outer, inner, gap);
    }
  }
  /** Copies every represented native field. @returns Owned line copy. */
  public Clone(): SvxBorderLine {
    const line = new SvxBorderLine(this.color, this.width, this.style);
    line.scale = this.scale;
    line.mirror = this.mirror;
    line.useLeftTop = this.useLeftTop;
    line.implementation = this.implementation.Clone();
    return line;
  }
  /** Compares represented native fields; native equality does not compare scale. @param other - Candidate. @returns Whether equal. */
  public equals(other: SvxBorderLine): boolean {
    return (
      this.color.equals(other.color) &&
      this.width === other.width &&
      this.style === other.style &&
      this.mirror === other.mirror &&
      this.useLeftTop === other.useLeftTop &&
      this.implementation.equals(other.implementation)
    );
  }
  /** Exposes complete represented primitive state at the browser transport boundary. @returns Native line record. */
  public toJSON(): BorderLineRecord {
    return {
      color: this.color.toUInt32(),
      width: this.width,
      style: this.style,
      scale: this.scale,
      mirror: this.mirror,
      useLeftTop: this.useLeftTop,
      implementation: this.implementation.toJSON(),
    };
  }
  /** Restores already validated transport state, including custom double widths. @param value - Validated record. @returns Owned native line. */
  public static FromRecord(value: BorderLineRecord): SvxBorderLine {
    const line = new SvxBorderLine(
      new Color(ColorTransparency, value.color, "ColorTransparencyTag"),
      value.width,
      value.style,
    );
    line.scale = value.scale;
    line.mirror = value.mirror;
    line.useLeftTop = value.useLeftTop;
    line.implementation = new BorderWidthImpl(...value.implementation);
    return line;
  }
}

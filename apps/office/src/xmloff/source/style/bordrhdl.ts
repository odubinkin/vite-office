/** @fileoverview Imports and exports represented native border properties from bordrhdl.cxx. */
import { BorderLine2 } from "../../../offapi/com/sun/star/table/BorderLine2";
import { BorderLineStyle } from "../../../offapi/com/sun/star/table/BorderLineStyle";
import { SvXMLUnitConverter } from "../core/xmluconv";

/** Filter-only ODF border and distance properties; scalar fields never enter the kernel. */
export interface OdfBoxProperties {
  readonly padding?: number | undefined;
  readonly paddingTop?: number | undefined;
  readonly paddingBottom?: number | undefined;
  readonly paddingLeft?: number | undefined;
  readonly paddingRight?: number | undefined;
  readonly border?: string | undefined;
  readonly borderTop?: string | undefined;
  readonly borderBottom?: string | undefined;
  readonly borderLeft?: string | undefined;
  readonly borderRight?: string | undefined;
  readonly borderLineWidth?: string | undefined;
  readonly borderLineWidthTop?: string | undefined;
  readonly borderLineWidthBottom?: string | undefined;
  readonly borderLineWidthLeft?: string | undefined;
  readonly borderLineWidthRight?: string | undefined;
}
/** Native ODF style token values. */
const borderStyles: Readonly<Record<string, BorderLineStyle>> = {
  none: 32767,
  hidden: 32767,
  solid: 0,
  dotted: 1,
  dashed: 2,
  double: 3,
  groove: 11,
  ridge: 10,
  outset: 12,
  inset: 13,
  "fine-dashed": 14,
  "double-thin": 15,
  "dash-dot": 16,
  "dash-dot-dot": 17,
};
/** Shared pure source token spelling also used by the Writer presentation boundary; not an invented native class API. Converts native style to the source ODF token. @param style - Native style. @returns ODF token. */
export function borderStyleToken(style: number): string {
  if (style === BorderLineStyle.NONE) return "solid";
  if (style >= 3 && style <= 9) return "double";
  return (
    Object.entries(borderStyles).find(
      /** Finds the canonical style token. @param entry - Token/value pair. @returns Whether matching. */
      ([, value]) => value === style,
    )?.[0] ?? "solid"
  );
}
/** Owns the native border shorthand parser at the XML boundary. */
export class XMLBorderHdl {
  /** Imports native style, width and color without clearing omitted fields. @param text - ODF shorthand. @param target - In/out UNO line. @param converter - Core measure device. @returns Whether valid. */
  public importXML(
    text: string,
    target: { value: BorderLine2 },
    converter = new SvXMLUnitConverter("mm100"),
  ): boolean {
    let style: number | undefined,
      width: number | undefined,
      color: number | undefined,
      named = false;
    for (const token of text.trim().split(/\s+/u)) {
      if (width === undefined && ["thin", "middle", "thick"].includes(token)) {
        width = ({ thin: 1, middle: 35, thick: 88 } as Record<string, number>)[token];
        named = true;
      } else if (style === undefined && borderStyles[token] !== undefined)
        style = borderStyles[token];
      else if (color === undefined && /^#[0-9a-f]{6}$/iu.test(token))
        color = parseInt(token.slice(1), 16);
      else if (width === undefined) {
        const metric = converter.convertMeasureToCore(token, 0, 65535);
        if (metric === null) return false;
        width = metric;
      } else return false;
    }
    if (style === undefined || (style !== BorderLineStyle.NONE && width === undefined))
      return false;
    const value = new BorderLine2(target.value);
    if (style === BorderLineStyle.NONE || (!named && width === 0)) {
      value.InnerLineWidth = 0;
      value.OuterLineWidth = 0;
      value.LineDistance = 0;
      value.LineWidth = 0;
    } else {
      value.LineWidth = width as number;
      if (!named) value.LineStyle = style;
    }
    if (color !== undefined) value.Color = color;
    target.value = value;
    return true;
  }
  /** Exports a native UNO line using ODF style tokens. @param value - MM100 line value. @returns ODF shorthand. */
  public exportXML(value: BorderLine2): string {
    if (value.LineWidth === 0) return "none";
    const pointWidth = Math.round(((value.LineWidth * 72) / 2540) * 100) / 100;
    return `${pointWidth}pt ${borderStyleToken(value.LineStyle)} #${(value.Color & 0xffffff).toString(16).padStart(6, "0")}`;
  }
}
/** Owns native inner/gap/outer compound-width properties. */
export class XMLBorderWidthHdl {
  /** Imports the three source-ordered widths. @param text - Inner, gap, outer measures. @param target - In/out UNO line. @param converter - Core measure device. @returns Whether valid. */
  public importXML(
    text: string,
    target: { value: BorderLine2 },
    converter = new SvXMLUnitConverter("mm100"),
  ): boolean {
    const tokens = text.trim().split(/\s+/u);
    if (tokens.length < 3) return false;
    const widths = tokens.slice(0, 3).map(
      /** Converts one native component. @param token - Measure. @returns Metric or failure. */
      (token) => converter.convertMeasureToCore(token, 0, 500),
    );
    if (widths.includes(null)) return false;
    const value = new BorderLine2(target.value);
    value.InnerLineWidth = widths[0] as number;
    value.LineDistance = widths[1] as number;
    value.OuterLineWidth = widths[2] as number;
    target.value = value;
    return true;
  }
  /** Exports a represented compound line when native style permits it. @param value - UNO line. @param converter - XML measure device. @returns Triple or absent. */
  public exportXML(
    value: BorderLine2,
    converter = new SvXMLUnitConverter("mm100"),
  ): string | undefined {
    if (
      !((value.LineStyle >= 3 && value.LineStyle <= 9) || value.LineStyle === 15) ||
      (value.LineDistance === 0 && value.InnerLineWidth === 0)
    )
      return undefined;
    return [value.InnerLineWidth, value.LineDistance, value.OuterLineWidth]
      .map(
        /** Exports one component. @param width - MM100 metric. @returns XML measure. */
        (width) => converter.convertMeasureToXML(width),
      )
      .join(" ");
  }
}

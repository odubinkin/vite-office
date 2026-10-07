/** @fileoverview Imports and exports represented native border properties from bordrhdl.cxx. */
import { SvxBoxItem, type BorderLine2 } from "../../../editeng/source/items/frmitems";
import { SvxBorderLineStyle, type SvxBorderLine } from "../../../editeng/source/items/borderline";
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
const borderStyles: Readonly<Record<string, SvxBorderLineStyle>> = {
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
/** Converts native style to the source ODF token. @param style - Native style. @returns ODF token. */
function borderStyleToken(style: number): string {
  if (style === SvxBorderLineStyle.NONE) return "solid";
  if (style >= 3 && style <= 9) return "double";
  return (
    Object.entries(borderStyles).find(
      /** Finds the canonical style token. @param entry - Token/value pair. @returns Whether matching. */
      ([, value]) => value === style,
    )?.[0] ?? "solid"
  );
}
/** Formats native twip values for the existing presentation shorthand control. @param line - Native line. @returns Presentation input. */
export function exportBorderShorthand(line: SvxBorderLine | undefined): string {
  if (line === undefined || line.isEmpty()) return "none";
  return `${line.GetWidth() / 20}pt ${borderStyleToken(line.GetBorderLineStyle())} #${(line.GetColor() & 0xffffff).toString(16).padStart(6, "0")}`;
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
    if (style === undefined || (style !== SvxBorderLineStyle.NONE && width === undefined))
      return false;
    const value = { ...target.value };
    if (style === SvxBorderLineStyle.NONE || (!named && width === 0)) {
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
    if (tokens.length !== 3) return false;
    const widths = tokens.map(
      /** Converts one native component. @param token - Measure. @returns Metric or failure. */
      (token) => converter.convertMeasureToCore(token, 0, 500),
    );
    if (widths.includes(null)) return false;
    target.value = {
      ...target.value,
      InnerLineWidth: widths[0] as number,
      LineDistance: widths[1] as number,
      OuterLineWidth: widths[2] as number,
    };
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

/** Converts four independent filter properties to an owned item. @param value - ODF properties or presentation shorthand. @param which - Destination native identity. @returns Native item or absent for an empty declaration. */
export function importBoxProperties(
  value: OdfBoxProperties,
  which: number,
): SvxBoxItem | undefined {
  if (
    !Object.keys(value).some(
      /** Finds a represented property. @param key - Property name. @returns Whether supplied. */
      (key) =>
        (key.startsWith("border") || key.startsWith("padding")) &&
        value[key as keyof OdfBoxProperties] !== undefined,
    )
  )
    return undefined;
  const item = new SvxBoxItem(which),
    border = new XMLBorderHdl(),
    compound = new XMLBorderWidthHdl();
  for (const [edge, suffix] of ["Top", "Bottom", "Left", "Right"].entries()) {
    const distance = value[`padding${suffix}` as keyof OdfBoxProperties] ?? value.padding;
    if (typeof distance === "number") item.SetDistance(distance, edge);
    const text = value[`border${suffix}` as keyof OdfBoxProperties] ?? value.border;
    const widthText =
      value[`borderLineWidth${suffix}` as keyof OdfBoxProperties] ?? value.borderLineWidth;
    const target = { value: SvxBoxItem.SvxLineToLine(undefined, true) };
    if (typeof text === "string") {
      if (!border.importXML(text, target)) throw new Error(`Unsupported ODF cell border: ${text}`);
      if (typeof widthText === "string" && !compound.importXML(widthText, target))
        throw new Error(`Unsupported ODF border widths: ${widthText}`);
      // Native member order is top/bottom/left/right = 3/4/1/2.
      item.PutValue(target.value, ([3, 4, 1, 2][edge] as number) | 0x80);
    }
  }
  return item;
}
/** Exports all four native edges without collapsing authored independent values. @param item - Native item. @returns Filter-only properties. */
export function exportBoxProperties(item: SvxBoxItem | undefined): OdfBoxProperties {
  if (item === undefined) return {};
  const result: Record<string, number | string | undefined> = {},
    border = new XMLBorderHdl(),
    compound = new XMLBorderWidthHdl();
  for (const [edge, suffix] of ["Top", "Bottom", "Left", "Right"].entries()) {
    const value = SvxBoxItem.SvxLineToLine(item.GetLine(edge), true);
    result[`padding${suffix}`] = item.GetDistance(edge, true);
    result[`border${suffix}`] = border.exportXML(value);
    result[`borderLineWidth${suffix}`] = compound.exportXML(value);
  }
  return result;
}

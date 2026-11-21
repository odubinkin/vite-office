/** @fileoverview Consumed page and story properties from the ODF page master style map. */
import { SvXMLIgnoreContext, SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { Converter } from "../../../sax/source/tools/converter";
import { PageStyleLayout } from "../../../offapi/com/sun/star/style/PageStyleLayout";
import { TextGridMode } from "../../../offapi/com/sun/star/text/TextGridMode";

const pageUsage = new Map<string, PageStyleLayout>([
  ["all", PageStyleLayout.ALL],
  ["left", PageStyleLayout.LEFT],
  ["right", PageStyleLayout.RIGHT],
  ["mirrored", PageStyleLayout.MIRRORED],
]);

/** Reads the original page-usage attribute from the layout element. @param value - Authored token. @returns Recognized usage. */
export function importPageUsage(value: string | null): PageStyleLayout | undefined {
  return value === null ? undefined : pageUsage.get(value);
}

/** Writes the original token for an authored non-default usage. @param value - Native layout. @returns Attribute or empty string. */
export function exportPageUsage(value: PageStyleLayout): string {
  if (value !== PageStyleLayout.ALL)
    for (const [token, layout] of pageUsage)
      if (layout === value) return ` style:page-usage="${token}"`;
  return "";
}

/** Native page margins expressed in UNO hundredths of a millimetre. */
export type OdfPageMargins = Partial<
  Record<"TopMargin" | "BottomMargin" | "LeftMargin" | "RightMargin", number>
>;

/** Reads the shorthand fallback or the independently authored side, including signed horizontal distances. @param attributes - Layout properties. @returns Original authored margins. */
export function importPageMargins(attributes: FastAttributeList): {
  margins: OdfPageMargins;
  explicit: ReadonlySet<string>;
} {
  const margins: OdfPageMargins = {};
  const explicit = new Set<string>();
  const all = attributes.get(XMLToken.FO_MARGIN);
  for (const [name, token, minimum] of [
    ["TopMargin", XMLToken.FO_MARGIN_TOP, 0],
    ["BottomMargin", XMLToken.FO_MARGIN_BOTTOM, 0],
    ["LeftMargin", XMLToken.FO_MARGIN_LEFT, -0x80000000],
    ["RightMargin", XMLToken.FO_MARGIN_RIGHT, -0x80000000],
  ] as const) {
    const source = attributes.get(token);
    const direct = source === null ? null : Converter.convertMeasure(source, "mm100", minimum);
    if (direct !== null) explicit.add(name);
    const value = direct ?? (all === null ? null : Converter.convertMeasure(all, "mm100", minimum));
    if (value !== null) margins[name] = value;
  }
  return { margins, explicit };
}

/** Recognized page-grid property values in native application order. */
export type OdfPageGridProperty = readonly [
  property: string,
  type: "bool" | "sal_Int16" | "sal_Int32",
  value: number | boolean,
];

/** Reads one original boolean or leaves the setting unset. @param value - Attribute value. @returns Parsed flag. */
export function importPageBool(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  const result: [boolean] = [false];
  return Converter.convertBool(result, value) ? result[0] : undefined;
}

/** Reads the represented original page grid style map. @param attributes - Page-layout attributes. @returns Ordered grid property vector. */
export function importPageGrid(attributes: FastAttributeList): OdfPageGridProperty[] {
  const grid: OdfPageGridProperty[] = [];
  const color = attributes.get(XMLToken.STYLE_LAYOUT_GRID_COLOR);
  const rgb: [number] = [0];
  if (color !== null && Converter.convertColor(rgb, color))
    grid.push(["GridColor", "sal_Int32", rgb[0]]);
  const lines = attributes.get(XMLToken.STYLE_LAYOUT_GRID_LINES);
  const count: [number] = [0];
  if (lines !== null && Converter.convertNumber(count, lines) && count[0] >= 0)
    grid.push(["GridLines", "sal_Int16", Math.min(count[0], 32767)]);
  for (const [name, token] of [
    ["GridBaseHeight", XMLToken.STYLE_LAYOUT_GRID_BASE_HEIGHT],
    ["GridRubyHeight", XMLToken.STYLE_LAYOUT_GRID_RUBY_HEIGHT],
  ] as const) {
    const source = attributes.get(token);
    const value = source === null ? null : Converter.convertMeasure(source, "mm100", 0);
    if (value !== null) grid.push([name, "sal_Int32", value]);
  }
  const mode = attributes.get(XMLToken.STYLE_LAYOUT_GRID_MODE);
  if (mode === "none" || mode === "line" || mode === "both")
    grid.push([
      "GridMode",
      "sal_Int16",
      mode === "none"
        ? TextGridMode.NONE
        : mode === "line"
          ? TextGridMode.LINES
          : TextGridMode.LINES_AND_CHARS,
    ]);
  const base = attributes.get(XMLToken.STYLE_LAYOUT_GRID_BASE_WIDTH);
  const width = base === null ? null : Converter.convertMeasure(base, "mm100", 0);
  if (width !== null) grid.push(["GridBaseWidth", "sal_Int32", width]);
  for (const [name, token] of [
    ["RubyBelow", XMLToken.STYLE_LAYOUT_GRID_RUBY_BELOW],
    ["GridPrint", XMLToken.STYLE_LAYOUT_GRID_PRINT],
    ["GridDisplay", XMLToken.STYLE_LAYOUT_GRID_DISPLAY],
    ["GridSnapToChars", XMLToken.STYLE_LAYOUT_GRID_SNAP_TO],
    ["StandardPageMode", XMLToken.STYLE_LAYOUT_GRID_STANDARD_MODE],
  ] as const) {
    const value = importPageBool(attributes.get(token));
    if (value !== undefined) grid.push([name, "bool", value]);
  }
  return grid;
}

/** Original page-style height, body distance and two independent dynamic flags. */
export interface OdfPageStoryGeometry {
  readonly height?: number;
  readonly bodyDistance?: number;
  readonly isDynamicHeight?: boolean;
  readonly dynamicSpacing?: boolean;
}

/** Receives geometry in the header or footer's original page-layout properties child. */
export class XMLPageHeaderFooterStyleContext extends SvXMLImportContext {
  /** Selects the body-facing margin for this story. @param header - Whether header. @param collect - Parsed properties receiver. @returns Context. */
  constructor(
    private readonly header: boolean,
    private readonly collect: (geometry: OdfPageStoryGeometry) => void,
  ) {
    super();
  }

  /** Reads the original measure and boolean properties from their namespaces. @param token - Child token. @param attributes - Original XML attributes. @returns Completed leaf context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (token !== XMLToken.STYLE_HEADER_FOOTER_PROPERTIES) return new SvXMLIgnoreContext();
    const converter = new SvXMLUnitConverter("twip");
    const min = attributes.get(XMLToken.FO_MIN_HEIGHT);
    const fixed = attributes.get(XMLToken.SVG_HEIGHT);
    const distance =
      attributes.get(this.header ? XMLToken.FO_MARGIN_BOTTOM : XMLToken.FO_MARGIN_TOP) ??
      attributes.get(XMLToken.FO_MARGIN);
    const dynamic = attributes.get(XMLToken.STYLE_DYNAMIC_SPACING);
    const height = min === null ? null : converter.convertMeasureToCore(min);
    const fixedHeight = fixed === null ? null : converter.convertMeasureToCore(fixed);
    const bodyDistance = distance === null ? null : converter.convertMeasureToCore(distance);
    this.collect({
      ...(height !== null
        ? { height, isDynamicHeight: true }
        : fixedHeight !== null
          ? { height: fixedHeight, isDynamicHeight: false }
          : {}),
      ...(bodyDistance === null ? {} : { bodyDistance }),
      ...(dynamic === "true" || dynamic === "false" ? { dynamicSpacing: dynamic === "true" } : {}),
    });
    return new SvXMLIgnoreContext();
  }
}

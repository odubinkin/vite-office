/** @fileoverview Consumed page and story properties from the ODF page master style map. */
import { SvXMLIgnoreContext, SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { Converter } from "../../../sax/source/tools/converter";
import { PageStyleLayout } from "../../../offapi/com/sun/star/style/PageStyleLayout";
import { TextGridMode } from "../../../offapi/com/sun/star/text/TextGridMode";
import {
  importBitmapFillProperties,
  importFillProperties,
  type OdfBitmapFillProperties,
  type OdfFillProperties,
} from "../draw/fill-properties";
import {
  XMLBackgroundImageContext,
  importBackgroundColor,
  type OdfBackgroundImage,
  type OdfBackgroundColor,
} from "./XMLBackgroundImageContext";

const pageUsage = new Map<string, PageStyleLayout>([
  ["all", PageStyleLayout.ALL],
  ["left", PageStyleLayout.LEFT],
  ["right", PageStyleLayout.RIGHT],
  ["mirrored", PageStyleLayout.MIRRORED],
]);

/** Original token order for merged style:print properties. */
export const pagePrintTokens = [
  "annotations",
  "charts",
  "drawings",
  "formulas",
  "grid",
  "headers",
  "objects",
  "zero-values",
] as const;

/** Reads the original space-delimited print tokens, including an explicit empty list. @param value - Authored attribute or absence. @returns Recognized print tokens or absence. */
export function importPagePrint(value: string | null): ReadonlySet<string> | undefined {
  return value === null ? undefined : new Set(value.split(" "));
}

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

/** Authored common DrawingLayer page fill plus the older brush properties. */
export interface OdfPageBackground
  extends OdfFillProperties, OdfBitmapFillProperties, OdfBackgroundColor {
  readonly image?: OdfBackgroundImage;
}

/** Imports the modern and legacy page fills while preserving which fields were supplied. */
export class XMLPagePropertySetContext extends SvXMLImportContext {
  private readonly background: OdfPageBackground;
  private image: OdfPageBackground["image"];

  /** Reads the non-element fill properties before visiting background children. @param attributes - Page or story properties. @param collect - Completed background receiver. @returns Context. */
  constructor(
    attributes: FastAttributeList,
    private readonly collect: (fill: OdfPageBackground) => void,
  ) {
    super();
    this.background = {
      ...importFillProperties(attributes),
      ...importBitmapFillProperties(attributes),
      ...importBackgroundColor(attributes),
    };
  }

  /** Routes the legacy bitmap to its source context. @param token - Child token. @param attributes - Image attributes. @returns Child context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (token === XMLToken.STYLE_BACKGROUND_IMAGE)
      return new XMLBackgroundImageContext(
        attributes,
        /** Retains the completed legacy property. @param image - Original placement and source. @returns Nothing. */
        (image) => {
          this.image = image;
        },
      );
    return new SvXMLIgnoreContext();
  }

  /** Publishes the background after all child properties are available. @returns Nothing. */
  override endFastElement(): void {
    this.collect({
      ...this.background,
      ...(this.image === undefined ? {} : { image: this.image }),
    });
  }
}

/** Original page-story geometry, margins and independent dynamic flags. */
export interface OdfPageStoryGeometry {
  readonly height?: number;
  readonly bodyDistance?: number;
  readonly leftMargin?: number;
  readonly rightMargin?: number;
  readonly isDynamicHeight?: boolean;
  readonly dynamicSpacing?: boolean;
  readonly background?: OdfPageBackground;
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
    const allMargins = attributes.get(XMLToken.FO_MARGIN);
    const distance =
      attributes.get(this.header ? XMLToken.FO_MARGIN_BOTTOM : XMLToken.FO_MARGIN_TOP) ??
      allMargins;
    const left = attributes.get(XMLToken.FO_MARGIN_LEFT) ?? allMargins;
    const right = attributes.get(XMLToken.FO_MARGIN_RIGHT) ?? allMargins;
    const leftMargin = left === null ? null : converter.convertMeasureToCore(left);
    const rightMargin = right === null ? null : converter.convertMeasureToCore(right);
    const dynamic = attributes.get(XMLToken.STYLE_DYNAMIC_SPACING);
    const height = min === null ? null : converter.convertMeasureToCore(min);
    const fixedHeight = fixed === null ? null : converter.convertMeasureToCore(fixed);
    const bodyDistance = distance === null ? null : converter.convertMeasureToCore(distance);
    const geometry = {
      ...(height !== null
        ? { height, isDynamicHeight: true }
        : fixedHeight !== null
          ? { height: fixedHeight, isDynamicHeight: false }
          : {}),
      ...(bodyDistance === null ? {} : { bodyDistance }),
      ...(leftMargin === null ? {} : { leftMargin }),
      ...(rightMargin === null ? {} : { rightMargin }),
      ...(dynamic === "true" || dynamic === "false" ? { dynamicSpacing: dynamic === "true" } : {}),
    };
    return new XMLPagePropertySetContext(
      attributes,
      /** Publishes complete header or footer properties. @param background - Completed fill. @returns Nothing. */
      (background) => this.collect({ ...geometry, background }),
    );
  }
}

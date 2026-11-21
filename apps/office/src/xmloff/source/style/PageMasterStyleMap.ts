/** @fileoverview Consumed page and story properties from the ODF page master style map. */
import { SvXMLIgnoreContext, SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { Converter } from "../../../sax/source/tools/converter";
import { PageStyleLayout } from "../../../offapi/com/sun/star/style/PageStyleLayout";
import { TextGridMode } from "../../../offapi/com/sun/star/text/TextGridMode";
import { BitmapMode } from "../../../offapi/com/sun/star/drawing/BitmapMode";
import { RectanglePoint as P } from "../../../offapi/com/sun/star/drawing/RectanglePoint";
import { importFillProperties, type OdfFillProperties } from "../draw/fill-properties";

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
export interface OdfPageBackground extends OdfFillProperties {
  readonly bitmapName?: string;
  readonly bitmapMode?: BitmapMode;
  readonly bitmapGeometry?: OdfBitmapGeometry;
  readonly backgroundColor?: number | "transparent";
  readonly backgroundTransparency?: number;
  readonly image?: {
    readonly href: string;
    readonly mode: BitmapMode;
    readonly point?: P;
    readonly transparency?: number;
  };
}

/** Drawing bitmap dimensions use signed percentages or whole hundredths of a millimetre. */
export interface OdfBitmapGeometry {
  readonly sizeX?: number;
  readonly sizeY?: number;
  readonly logicalSize?: boolean;
  readonly point?: P;
  readonly positionX?: number;
  readonly positionY?: number;
  readonly offsetX?: number;
  readonly offsetY?: number;
}

const rectanglePoints = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];
const units100 = new SvXMLUnitConverter("mm100");

/** Reads one native percent through the shared SAX converter. @param raw - XML text. @returns Numeric percent when recognized. */
function parsePercent(raw: string): number | undefined {
  const value: [number] = [0];
  return Converter.convertPercent(value, raw) ? value[0] : undefined;
}

/** Reads the bitmap portion of the original property map in SAX order. @param attributes - Page layout attributes. @returns Authored native properties. */
function importBitmapGeometry(attributes: FastAttributeList): OdfBitmapGeometry {
  const geometry: { -readonly [K in keyof OdfBitmapGeometry]: OdfBitmapGeometry[K] } = {};
  for (const [token, raw] of attributes) {
    if (token === XMLToken.DRAW_FILL_IMAGE_WIDTH || token === XMLToken.DRAW_FILL_IMAGE_HEIGHT) {
      geometry.logicalSize = !raw.includes("%");
      const value = geometry.logicalSize ? units100.convertMeasureToCore(raw) : parsePercent(raw);
      if (value !== null && value !== undefined)
        geometry[token === XMLToken.DRAW_FILL_IMAGE_WIDTH ? "sizeX" : "sizeY"] =
          geometry.logicalSize ? value : -value | 0;
    } else if (token === XMLToken.DRAW_FILL_IMAGE_REF_POINT) {
      const point = rectanglePoints.indexOf(raw);
      if (point >= 0) geometry.point = point as P;
    } else if (
      token === XMLToken.DRAW_FILL_IMAGE_REF_POINT_X ||
      token === XMLToken.DRAW_FILL_IMAGE_REF_POINT_Y
    ) {
      const value = parsePercent(raw);
      if (value !== undefined)
        geometry[token === XMLToken.DRAW_FILL_IMAGE_REF_POINT_X ? "positionX" : "positionY"] =
          value;
    } else if (token === XMLToken.DRAW_TILE_REPEAT_OFFSET) {
      const [percent, axis] = raw.split(" ");
      const value = parsePercent(percent ?? "");
      if (value !== undefined && (axis === "horizontal" || axis === "vertical"))
        geometry[axis === "horizontal" ? "offsetX" : "offsetY"] = value;
    }
  }
  return geometry;
}

/** Exports the original signed bitmap size and repeat-offset properties. @param geometry - Direct page layout values. @returns Attribute fragments. */
export function exportBitmapGeometry(geometry: OdfBitmapGeometry): string[] {
  const result: string[] = [];
  for (const [axis, value] of [
    ["width", geometry.sizeX],
    ["height", geometry.sizeY],
  ] as const)
    if (value !== undefined)
      result.push(
        `draw:fill-image-${axis}="${value < 0 ? `${-value}%` : units100.convertMeasureToXML(value)}"`,
      );
  if (geometry.point !== undefined)
    result.push(`draw:fill-image-ref-point="${rectanglePoints[geometry.point]}"`);
  if (geometry.positionX !== undefined)
    result.push(`draw:fill-image-ref-point-x="${geometry.positionX}%"`);
  if (geometry.positionY !== undefined)
    result.push(`draw:fill-image-ref-point-y="${geometry.positionY}%"`);
  if (geometry.offsetX !== undefined && (geometry.offsetX !== 0 || geometry.offsetY === undefined))
    result.push(`draw:tile-repeat-offset="${geometry.offsetX}% horizontal"`);
  else if (geometry.offsetY !== undefined)
    result.push(`draw:tile-repeat-offset="${geometry.offsetY}% vertical"`);
  return result;
}

/** Translates the original legacy position tokens to their drawing point. @param raw - Legacy style position. @returns Position if recognized. */
function importLegacyPoint(raw: string): P | undefined {
  let point = P.MIDDLE_MIDDLE,
    horizontal = false,
    vertical = false;
  for (const token of raw.split(" ")) {
    if (horizontal && vertical) return undefined;
    if (token.includes("%")) {
      const value = parsePercent(token);
      if (value === undefined) return undefined;
      if (!horizontal) {
        point = value < 25 ? P.LEFT_TOP : value < 75 ? P.MIDDLE_MIDDLE : P.RIGHT_BOTTOM;
        horizontal = true;
      } else {
        // The second percent passes a left-column point to the native vertical merge.
        point = mergeLegacyVertical(
          point,
          value < 25 ? P.LEFT_TOP : value < 75 ? P.LEFT_MIDDLE : P.LEFT_BOTTOM,
        );
        vertical = true;
      }
    } else if (token === "center") {
      if (horizontal) point = mergeLegacyVertical(point, P.MIDDLE_MIDDLE);
      else if (vertical) point = Math.floor(point / 3) * 3 + 1;
      else point = P.MIDDLE_MIDDLE;
    } else if (token === "left" || token === "right") {
      const column = token === "left" ? 0 : 2;
      if (vertical) point = Math.floor(point / 3) * 3 + column;
      else if (!horizontal) point = 3 + column;
      else return undefined;
      horizontal = true;
    } else if (token === "top" || token === "bottom") {
      const row = token === "top" ? 0 : 2;
      if (horizontal) point = mergeLegacyVertical(point, row * 3 + 1);
      else if (!vertical) point = row * 3 + 1;
      else return undefined;
      vertical = true;
    } else return undefined;
  }
  return point;
}

/** Applies the source GraphicLocation vertical merge. @param point - Current point. @param vertical - Point contributed by the vertical token. @returns Merged point. */
function mergeLegacyVertical(point: P, vertical: P): P {
  const column = point % 3;
  if (column === 1) return vertical;
  const row = vertical === P.MIDDLE_TOP ? 0 : vertical === P.MIDDLE_MIDDLE ? 1 : 2;
  return row * 3 + column;
}

/** Writes the native legacy vertical then horizontal position. @param point - Bitmap anchor. @returns Position tokens. */
export function exportLegacyBitmapPosition(point: P): string {
  return `${["top", "center", "bottom"][Math.floor(point / 3)]} ${["left", "center", "right"][point % 3]}`;
}

/** Reads the native drawing bitmap mode token. @param value - Authored repeat token. @returns Native mode. */
function importBitmapMode(value: string | null): BitmapMode | undefined {
  if (value === "repeat") return BitmapMode.REPEAT;
  if (value === "stretch") return BitmapMode.STRETCH;
  if (value === "no-repeat") return BitmapMode.NO_REPEAT;
  return undefined;
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
    const bitmapName = attributes.get(XMLToken.DRAW_FILL_IMAGE_NAME);
    const bitmapMode = importBitmapMode(attributes.get(XMLToken.STYLE_REPEAT));
    const background = attributes.get(XMLToken.FO_BACKGROUND_COLOR);
    const color: [number] = [0],
      transparency: [number] = [0];
    const alpha = attributes.get(XMLToken.STYLE_BACKGROUND_TRANSPARENCY);
    this.background = {
      ...importFillProperties(attributes),
      ...(bitmapName === null ? {} : { bitmapName }),
      ...(bitmapMode === undefined ? {} : { bitmapMode }),
      bitmapGeometry: importBitmapGeometry(attributes),
      ...(background === "transparent"
        ? { backgroundColor: "transparent" }
        : background !== null && Converter.convertColor(color, background)
          ? { backgroundColor: color[0] }
          : {}),
      ...(alpha !== null &&
      Converter.convertPercent(transparency, alpha) &&
      transparency[0] >= 0 &&
      transparency[0] <= 100
        ? { backgroundTransparency: transparency[0] }
        : {}),
    };
  }

  /** Reads the legacy page background link and its placement. @param token - Child token. @param attributes - Image attributes. @returns Leaf context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (token === XMLToken.STYLE_BACKGROUND_IMAGE) {
      const href = attributes.get(XMLToken.XLINK_HREF);
      if (href) {
        const opacity = attributes.get(XMLToken.DRAW_OPACITY);
        const value: [number] = [0];
        const transparent =
          opacity !== null &&
          Converter.convertPercent(value, opacity) &&
          value[0] >= 0 &&
          value[0] < 100;
        let mode = BitmapMode.REPEAT;
        let point: P | undefined;
        for (const [key, raw] of attributes) {
          if (key === XMLToken.STYLE_POSITION) {
            const authored = importLegacyPoint(raw);
            if (authored !== undefined) {
              point = authored;
              mode = BitmapMode.NO_REPEAT;
            }
          } else if (key === XMLToken.STYLE_REPEAT) {
            const authored = importBitmapMode(raw);
            if (
              authored !== undefined &&
              !(authored === BitmapMode.NO_REPEAT && point !== undefined)
            ) {
              mode = authored;
              point = authored === BitmapMode.NO_REPEAT ? P.MIDDLE_MIDDLE : undefined;
            }
          }
        }
        this.image = {
          href,
          mode,
          ...(point === undefined ? {} : { point }),
          ...(transparent ? { transparency: 100 - value[0] } : {}),
        };
      }
    }
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

/** Original page-style height, body distance and two independent dynamic flags. */
export interface OdfPageStoryGeometry {
  readonly height?: number;
  readonly bodyDistance?: number;
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
    const distance =
      attributes.get(this.header ? XMLToken.FO_MARGIN_BOTTOM : XMLToken.FO_MARGIN_TOP) ??
      attributes.get(XMLToken.FO_MARGIN);
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
      ...(dynamic === "true" || dynamic === "false" ? { dynamicSpacing: dynamic === "true" } : {}),
    };
    return new XMLPagePropertySetContext(
      attributes,
      /** Publishes complete header or footer properties. @param background - Completed fill. @returns Nothing. */
      (background) => this.collect({ ...geometry, background }),
    );
  }
}

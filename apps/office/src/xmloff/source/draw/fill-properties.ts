/** @fileoverview Represented Writer fill map and value conversion from txtprmap.cxx/sdpropls.cxx/xmlbahdl.cxx. */
import { BitmapMode } from "../../../offapi/com/sun/star/drawing/BitmapMode";
import { RectanglePoint as P } from "../../../offapi/com/sun/star/drawing/RectanglePoint";
import { encodeStyleName, SvXMLUnitConverter } from "../core/xmluconv";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import { Converter } from "../../../sax/source/tools/converter";
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
/** Represented native paragraph fill properties. */
export interface OdfFillProperties {
  readonly fillStyle?: number;
  readonly fillColor?: number;
  readonly fillTransparency?: number;
}
/** Original aXML_FillStyle_EnumMap, including native order. */
const styles = [
  ["none", FillStyle.NONE],
  ["solid", FillStyle.SOLID],
  ["bitmap", FillStyle.BITMAP],
  ["gradient", FillStyle.GRADIENT],
  ["hatch", FillStyle.HATCH],
] as const;
/** Imports source enum/color/NEG_PERCENT16 fields, ignoring failed native handlers. @param attributes - Actual SAX attributes. @returns Successfully converted properties. */
export function importFillProperties(attributes: FastAttributeList): OdfFillProperties {
  const rawStyle = attributes.get(T.DRAW_FILL),
    rawColor = attributes.get(T.DRAW_FILL_COLOR),
    rawOpacity = attributes.get(T.DRAW_OPACITY);
  const style = styles.find(
    /** Looks up the original exact enum token. @param entry - Source map entry. @returns Whether equal. */ (
      entry,
    ) => entry[0] === rawStyle,
  );
  const color: [number] = [0],
    opacity: [number] = [0];
  return {
    ...(style === undefined ? {} : { fillStyle: style[1] }),
    ...(rawColor === null || !Converter.convertColor(color, rawColor)
      ? {}
      : { fillColor: color[0] }),
    ...(rawOpacity === null ||
    !Converter.convertPercent(opacity, rawOpacity) ||
    opacity[0] < 0 ||
    opacity[0] > 100
      ? {}
      : { fillTransparency: 100 - opacity[0] }),
  };
}
/** Exports native enum/color and inverted percent fields through the actual SAX converter. @param properties - Direct source values. @returns ODF paragraph attributes. */
export function exportFillProperties(properties: OdfFillProperties): string[] {
  const result: string[] = [],
    style = styles.find(
      /** Looks up a mapped native enum. @param entry - Source map entry. @returns Whether equal. */ (
        entry,
      ) => entry[1] === properties.fillStyle,
    );
  if (style !== undefined) result.push(`draw:fill="${style[0]}"`);
  if (properties.fillColor !== undefined) {
    const color: [string] = [""];
    Converter.convertColor(color, properties.fillColor);
    result.push(`draw:fill-color="${color[0]}"`);
  }
  if (properties.fillTransparency !== undefined) {
    const opacity: [string] = [""];
    Converter.convertPercent(opacity, 100 - properties.fillTransparency);
    result.push(`draw:opacity="${opacity[0]}"`);
  }
  return result;
}

/** Name, mode and geometry fields shared by Writer page and graphic maps. */
export interface OdfBitmapFillProperties {
  readonly bitmapName?: string;
  readonly bitmapMode?: BitmapMode;
  readonly bitmapGeometry?: OdfBitmapGeometry;
}

/** Reads the native drawing bitmap mode token. @param value - Authored repeat token. @returns Native mode. */
export function importBitmapMode(value: string | null): BitmapMode | undefined {
  if (value === "repeat") return BitmapMode.REPEAT;
  if (value === "stretch") return BitmapMode.STRETCH;
  if (value === "no-repeat") return BitmapMode.NO_REPEAT;
  return undefined;
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

/** Reads the bitmap portion of the original property map in SAX order. @param attributes - Drawing fill attributes. @returns Authored native properties. */
function importBitmapGeometry(attributes: FastAttributeList): OdfBitmapGeometry {
  const geometry: { -readonly [K in keyof OdfBitmapGeometry]: OdfBitmapGeometry[K] } = {};
  for (const [token, raw] of attributes) {
    if (token === T.DRAW_FILL_IMAGE_WIDTH || token === T.DRAW_FILL_IMAGE_HEIGHT) {
      geometry.logicalSize = !raw.includes("%");
      const value = geometry.logicalSize ? units100.convertMeasureToCore(raw) : parsePercent(raw);
      if (value !== null && value !== undefined)
        geometry[token === T.DRAW_FILL_IMAGE_WIDTH ? "sizeX" : "sizeY"] = geometry.logicalSize
          ? value
          : -value | 0;
    } else if (token === T.DRAW_FILL_IMAGE_REF_POINT) {
      const point = rectanglePoints.indexOf(raw);
      if (point >= 0) geometry.point = point as P;
    } else if (token === T.DRAW_FILL_IMAGE_REF_POINT_X || token === T.DRAW_FILL_IMAGE_REF_POINT_Y) {
      const value = parsePercent(raw);
      if (value !== undefined)
        geometry[token === T.DRAW_FILL_IMAGE_REF_POINT_X ? "positionX" : "positionY"] = value;
    } else if (token === T.DRAW_TILE_REPEAT_OFFSET) {
      const [percent, axis] = raw.split(" ");
      const value = parsePercent(percent ?? "");
      if (value !== undefined && (axis === "horizontal" || axis === "vertical"))
        geometry[axis === "horizontal" ? "offsetX" : "offsetY"] = value;
    }
  }
  return geometry;
}

/** Exports the original signed bitmap size and repeat-offset properties. @param geometry - Direct native values. @returns Attribute fragments. */
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

/** Imports drawing bitmap properties without writing absent geometry members. @param attributes - Authored property list. @returns Bitmap properties. */
export function importBitmapFillProperties(attributes: FastAttributeList): OdfBitmapFillProperties {
  const bitmapName = attributes.get(T.DRAW_FILL_IMAGE_NAME);
  const bitmapMode = importBitmapMode(attributes.get(T.STYLE_REPEAT));
  const bitmapGeometry = importBitmapGeometry(attributes);
  return {
    ...(bitmapName === null ? {} : { bitmapName }),
    ...(bitmapMode === undefined ? {} : { bitmapMode }),
    ...(Object.keys(bitmapGeometry).length ? { bitmapGeometry } : {}),
  };
}

/** Converts the original bitmap repeat mode. @param mode - Native bitmap mode. @returns XML token. */
export function exportBitmapMode(mode: BitmapMode): string {
  return mode === BitmapMode.STRETCH
    ? "stretch"
    : mode === BitmapMode.NO_REPEAT
      ? "no-repeat"
      : "repeat";
}

/** Writes shared DrawingLayer bitmap attributes for the original graphic property maps. @param properties - Authored bitmap members. @returns XML attributes. */
export function exportBitmapFillProperties(properties: OdfBitmapFillProperties): string[] {
  const attrs = properties.bitmapGeometry ? exportBitmapGeometry(properties.bitmapGeometry) : [];
  if (properties.bitmapName !== undefined)
    attrs.push(`draw:fill-image-name="${encodeStyleName(properties.bitmapName)}"`);
  if (properties.bitmapMode !== undefined)
    attrs.push(`style:repeat="${exportBitmapMode(properties.bitmapMode)}"`);
  return attrs;
}

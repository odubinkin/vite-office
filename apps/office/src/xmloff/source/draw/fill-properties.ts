/** @fileoverview Represented Writer fill map and value conversion from txtprmap.cxx/sdpropls.cxx/xmlbahdl.cxx. */
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

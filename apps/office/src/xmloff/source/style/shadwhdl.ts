/** @fileoverview Native ODF text and page ShadowFormat lexical property handler. */
import { ShadowFormat } from "../../../offapi/com/sun/star/table/ShadowFormat";
import { ShadowLocation } from "../../../offapi/com/sun/star/table/ShadowLocation";
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLUnitConverter } from "../core/xmluconv";

const units = new SvXMLUnitConverter("mm100");
const max = 2147483647;

/** Maps original ODF shadow values to the UNO representation. */
export class XMLShadowPropHdl {
  /** Reads native shadows, including default grey, explicit none and signed offsets. @param value - ODF style:shadow value. @returns Parsed UNO value or failure. */
  importXML(value: string): ShadowFormat | undefined {
    const result = new ShadowFormat();
    result.Location = ShadowLocation.BOTTOM_RIGHT;
    const color: [number] = [0x808080];
    let foundColor = false;
    let valid = false;
    const tokens = value.trim().split(/\s+/u).values();
    for (const token of tokens) {
      if (token === "none") {
        result.Location = ShadowLocation.NONE;
        valid = true;
        break;
      }
      if (!foundColor && token.startsWith("#")) {
        if (!Converter.convertColor(color, token)) return undefined;
        valid = foundColor = true;
        continue;
      }
      const x = units.convertMeasureToCore(token);
      const yToken = x === null ? undefined : tokens.next().value;
      const y = yToken === undefined ? 0 : units.convertMeasureToCore(yToken);
      valid = x !== null && y !== null;
      if (x === null || y === null) continue;
      result.Location =
        x < 0
          ? y < 0
            ? ShadowLocation.TOP_LEFT
            : ShadowLocation.BOTTOM_LEFT
          : y < 0
            ? ShadowLocation.TOP_RIGHT
            : ShadowLocation.BOTTOM_RIGHT;
      const width = Math.min(Math.abs(x), max) + Math.min(Math.abs(y), max);
      valid = width <= max;
      if (valid) result.ShadowWidth = width >> 1;
    }
    if (!valid) return undefined;
    if (foundColor) result.Color = color[0];
    return result;
  }

  /** Writes the original RGB value and equal signed diagonal offsets. @param value - UNO shadow. @returns ODF shadow value. */
  exportXML(value: Readonly<ShadowFormat>): string {
    const { Location: location, ShadowWidth: width } = value;
    if (location < ShadowLocation.TOP_LEFT || location > ShadowLocation.BOTTOM_RIGHT) return "none";
    const x =
      location === ShadowLocation.TOP_LEFT || location === ShadowLocation.BOTTOM_LEFT
        ? -width
        : width;
    const y =
      location === ShadowLocation.TOP_LEFT || location === ShadowLocation.TOP_RIGHT
        ? -width
        : width;
    const color: [string] = [""];
    Converter.convertColor(color, value.Color);
    return `${color[0]} ${units.convertMeasureToXML(x)} ${units.convertMeasureToXML(y)}`;
  }
}

/** @fileoverview Native ODF CharKerning property handler for fo:letter-spacing. */
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { SvXMLUnitConverter } from "../core/xmluconv";

/** Reads and writes the original signed short text spacing value. */
export class XMLKerningPropHdl {
  /** Parses normal or a signed length into the core property. @param text - XML value. @param value - Native output. @param converter - Configured unit converter. @returns Conversion success. */
  importXML(text: string, value: Any, converter: SvXMLUnitConverter): boolean {
    const measure = text === "normal" ? 0 : converter.convertMeasureToCore(text);
    value.insert([((measure ?? 0) << 16) >> 16], "sal_Int16");
    return measure !== null;
  }

  /** Emits normal for zero and the configured length for signed values. @param output - XML string reference. @param value - Native short. @param converter - Configured unit converter. @returns Conversion success. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    const measure: [number] = [0];
    if (!value.extract(measure, "sal_Int16")) return false;
    output[0] = measure[0] === 0 ? "normal" : converter.convertMeasureToXML(measure[0]);
    return true;
  }
}

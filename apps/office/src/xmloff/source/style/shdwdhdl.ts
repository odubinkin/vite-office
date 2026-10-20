/** @fileoverview Original XMLShadowedPropHdl exact lexical bool projection and unchanged-output failure contract from shdwdhdl.cxx. */
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { SvXMLUnitConverter } from "../core/xmluconv";
/** Original stateless shadowed text property handler. */
export class XMLShadowedPropHdl {
  /** Only exact none disables shadow;all other strings are accepted. @param input - Original XML. @param value - Actual Any. @param converter - Unused native converter. @returns True. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    value.insert([input !== "none"], "bool");
    return true;
  }
  /** Original true spelling is fixed1pt1pt;failed extraction leaves output unchanged. @param output - Existing XML. @param value - Actual Any. @param converter - Unused converter. @returns Success. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const shadow: [boolean] = [false];
    if (!value.extract(shadow, "bool")) return false;
    output[0] = shadow[0] ? "1pt 1pt" : "none";
    return true;
  }
}

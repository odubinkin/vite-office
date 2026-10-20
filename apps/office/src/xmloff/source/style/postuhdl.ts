/** @fileoverview Original XMLPosturePropHdl over actual FontSlant Any and shared VCL enum conversion. */
import type { SvXMLUnitConverter } from "../core/xmluconv";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FontItalic } from "../../../tools/inc/fontenum";
import { ConvertFontSlant } from "../../../vcl/inc/unohelp";
import {
  cppu_detail_getUnoType_FontSlant as slantType,
  type FontSlant,
} from "../../../offapi/com/sun/star/awt/FontSlant";
/** Original XML posture tokens and native italic values. */
const aPostureGenericMapping = [
  ["normal", FontItalic.ITALIC_NONE],
  ["italic", FontItalic.ITALIC_NORMAL],
  ["oblique", FontItalic.ITALIC_OBLIQUE],
] as const;
/** Original posture property handler; source unit converter contract is retained. */
export class XMLPosturePropHdl {
  /** Imports exact mapped enum text into actual FontSlant Any. @param input - XML. @param value - Destination. @param unitConverter - Source converter contract; unused by this handler. @returns Native success. */
  importXML(input: string, value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    for (const [token, posture] of aPostureGenericMapping)
      if (input === token) {
        value.insert([ConvertFontSlant(posture, "FontItalic")], slantType);
        return true;
      }
    return false;
  }
  /** Exports exact enum or signed32 fallback through original slant conversion. @param output - XML destination. @param value - Actual Any. @param unitConverter - Source converter contract; unused by this handler. @returns Native success. */
  exportXML(output: [string], value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    const slant: [number] = [0];
    if (!value.extract(slant, slantType) && !value.extract(slant, "sal_Int32")) return false;
    const posture = ConvertFontSlant(slant[0] as FontSlant, "FontSlant");
    for (const [token, item] of aPostureGenericMapping)
      if (item === posture) {
        output[0] = token;
        return true;
      }
    return false;
  }
}

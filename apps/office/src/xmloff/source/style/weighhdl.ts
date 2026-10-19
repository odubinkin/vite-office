/** @fileoverview XMLFontWeightPropHdl original mapping,nearest/tie import and first-upper-bound export over actual UNO Any; string references use scalar output slots. */
import type { SvXMLUnitConverter } from "../core/xmluconv";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FontWeight as W } from "../../../offapi/com/sun/star/awt/FontWeight";
import { Converter } from "../../../sax/source/tools/converter";
/** Original ordered map,including both DONTKNOW entries. */
const aFontWeightMap: readonly (readonly [number, number])[] = [
  [W.DONTKNOW, 0],
  [W.THIN, 100],
  [W.ULTRALIGHT, 200],
  [W.LIGHT, 300],
  [W.SEMILIGHT, 350],
  [W.NORMAL, 400],
  [W.MEDIUM, 500],
  [W.SEMIBOLD, 600],
  [W.BOLD, 700],
  [W.ULTRABOLD, 800],
  [W.BLACK, 900],
  [W.DONTKNOW, 1000],
];
/** Original weight-property handler; source unit converter parameter is retained. */
export class XMLFontWeightPropHdl {
  /** Imports normal/bold or native bounded numeric weights into a real float Any. @param input - XML. @param value - Destination. @param unitConverter - Source converter contract; unused by this handler. @returns Native success. */
  importXML(input: string, value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    const weight: [number] = [0];
    let valid: boolean;
    if (input === "normal") {
      weight[0] = 400;
      valid = true;
    } else if (input === "bold") {
      weight[0] = 700;
      valid = true;
    } else valid = Converter.convertNumber(weight, input, 100, 900);
    if (!valid) return false;
    // Successful conversion clamps to100..900,covered by the original ordered map.
    for (let index = 0; ; index++) {
      const left = aFontWeightMap[index] as readonly [number, number],
        right = aFontWeightMap[index + 1] as readonly [number, number];
      if (weight[0] >= left[1] && weight[0] <= right[1]) {
        value.insert([weight[0] - left[1] < right[1] - weight[0] ? left[0] : right[0]], "float");
        return true;
      }
    }
  }
  /** Exports native float then signed32 Any fallback without replacing failed output. @param output - XML destination. @param value - Actual Any. @param unitConverter - Source converter contract; unused by this handler. @returns Native success. */
  exportXML(output: [string], value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    const weight: [number] = [0];
    if (!value.extract(weight, "float")) {
      const integer: [number] = [0];
      if (!value.extract(integer, "sal_Int32")) return false;
      weight[0] = Math.fround(integer[0]);
    }
    let result = 0;
    for (const pair of aFontWeightMap)
      if (weight[0] <= pair[0]) {
        result = pair[1];
        break;
      }
    output[0] = result === 400 ? "normal" : result === 700 ? "bold" : String(result);
    return true;
  }
}

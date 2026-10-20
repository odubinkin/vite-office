/** @fileoverview Original XMLConstantsPropertyHandler normal token map and enum/integer Any contracts;tokens are ordinary strings in the existing shared SAX adapter. */
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import type { SvXMLUnitConverter } from "../core/xmluconv";
/** Original non-owning map and fallback token. */
export class XMLConstantsPropertyHandler {
  /** Borrows original token/value pairs and original required default token. @param map - Original mapping. @param fallback - Native default token or null for XML_TOKEN_INVALID. @returns Handler. */
  constructor(
    private readonly map: readonly (readonly [string, number])[],
    private readonly fallback: string | null,
  ) {}
  /** Original signed16 insertion;failed token matching leaves Any untouched. @param input - XML. @param value - Actual Any. @param converter - Unused converter. @returns Success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const match = this.map.find(
      /** Finds exact original token. @param entry - Map entry. @returns Match. */ (entry) =>
        entry[0] === input,
    );
    if (!match) return false;
    value.insert([(match[1] << 16) >> 16], "sal_Int16");
    return true;
  }
  /** Original enum2int equivalent retains range-failure true/unchanged-output and unmapped false/empty-output behavior. @param output - Existing XML. @param value - Actual Any. @param converter - Unused converter. @returns Source bool. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const number: [number] = [0];
    if (value.hasValue() && value.getValueTypeClass() === TypeClass.ENUM)
      number[0] = (value.getValue() as [number])[0];
    else if (!value.extract(number, "sal_Int32")) return false;
    if (number[0] < 0 || number[0] > 65535) return true;
    const match = this.map.find(
      /** Finds original value. @param entry - Map entry. @returns Match. */ (entry) =>
        entry[1] === number[0],
    );
    output[0] = match?.[0] ?? this.fallback ?? "";
    return match !== undefined || this.fallback !== null;
  }
}

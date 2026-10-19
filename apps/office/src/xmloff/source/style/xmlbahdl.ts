/** @fileoverview Consumed XMLColorTransparentPropHdl and XMLIsTransparentPropHdl from xmlbahdl.cxx over genuine Any. Token enums are passed as their original lexical string at this existing SAX boundary. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Converter } from "../../../sax/source/tools/converter";
import type { SvXMLUnitConverter } from "../core/xmluconv";
/** Original transparent color handler,including failed-import Any assignment. */
export class XMLColorTransparentPropHdl {
  /** Retains original token fallback. @param transparent - Native lexical token or null for XML_TOKEN_INVALID. @returns Handler. */
  constructor(private readonly transparent: string | null = null) {}
  /** Imports every nontransparent source through native SAX conversion. @param input - XML text. @param value - Destination Any. @param converter - Source contract. @returns Success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    if (input === (this.transparent ?? "transparent")) return false;
    const color: [number] = [0];
    const success = Converter.convertColor(color, input);
    value.insert(color, "sal_Int32");
    return success;
  }
  /** Preserves prior transparent merge output before numeric color export. @param output - XML output. @param value - Color Any. @param converter - Source contract. @returns Success. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    if (output[0] === (this.transparent ?? "transparent")) return false;
    const color: [number] = [0];
    if (!value.extract(color, "sal_Int32")) return false;
    const buffer: [string] = [""];
    Converter.convertColor(buffer, color[0]);
    output[0] = buffer[0];
    return true;
  }
}
/** Original complementary bool handler for a shared color attribute. */
export class XMLIsTransparentPropHdl {
  /** Captures the source token and polarity. @param transparent - Native lexical token or null for XML_TOKEN_INVALID. @param transparentPropertyValue - Original bTransPropValue. @returns Handler. */
  constructor(
    private readonly transparent: string | null = null,
    private readonly transparentPropertyValue = true,
  ) {}
  /** Original exact-token equality and polarity,including noncolor inputs. @param input - XML text. @param value - Destination Any. @param converter - Source contract. @returns True. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    value.insert(
      [(input === (this.transparent ?? "transparent")) === this.transparentPropertyValue],
      "bool",
    );
    return true;
  }
  /** Caller supplies actual bool Any,matching the source doAccess precondition. @param output - Shared attribute output. @param value - Bool Any. @param converter - Source contract. @returns Whether emitted. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const boolean: [boolean] = [false];
    value.extract(boolean, "bool");
    const isTransparent = this.transparentPropertyValue ? boolean[0] : !boolean[0];
    if (!isTransparent) return false;
    output[0] = this.transparent ?? "transparent";
    return true;
  }
}

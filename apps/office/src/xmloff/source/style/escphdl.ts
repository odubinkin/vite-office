/** @fileoverview Original XMLEscapementPropHdl and XMLEscapementHeightPropHdl merged attribute contracts from escphdl.cxx; exact ASCII-space token enumeration retains empty fields. */
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { SvXMLUnitConverter } from "../core/xmluconv";
import { Converter } from "../../../sax/source/tools/converter";
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
} from "../../../editeng/inc/escapementitem.constants";
/** Original signed16 offset handler. */
export class XMLEscapementPropHdl {
  /** Reads only the first original token. @param input - Native XML view. @param value - Actual Any. @param converter - Unused converter. @returns Source success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const token = input.split(" ")[0] as string,
      offset: [number] = [0];
    if (token === "sub") offset[0] = DFLT_ESC_AUTO_SUB;
    else if (token === "super") offset[0] = DFLT_ESC_AUTO_SUPER;
    else if (!Converter.convertPercent(offset, token)) return false;
    value.insert([(offset[0] << 16) >> 16], "sal_Int16");
    return true;
  }
  /** Failed numeric extraction erases output; automatic sentinels retain source spelling. @param output - Existing merged string. @param value - Actual Any. @param converter - Unused converter. @returns Whether nonempty. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const offset: [number] = [0];
    output[0] = "";
    if (value.extract(offset, "sal_Int32"))
      output[0] =
        offset[0] === DFLT_ESC_AUTO_SUPER
          ? "super"
          : offset[0] === DFLT_ESC_AUTO_SUB
            ? "sub"
            : `${offset[0]}%`;
    return output[0] !== "";
  }
}
/** Original signed8 height handler; native item PutValue owns the separate logical1..100 admission. */
export class XMLEscapementHeightPropHdl {
  /** Reads exactly the second token when present; only position0 with no second token defaults100. @param input - Original XML view. @param value - Actual Any. @param converter - Unused converter. @returns Source success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    if (input === "small-caps") return false;
    const tokens = input.split(" "),
      height: [number] = [0];
    if (tokens.length > 1) {
      if (!Converter.convertPercent(height, tokens[1] as string)) return false;
    } else
      height[0] =
        Converter.convertPercent(height, tokens[0] as string) && height[0] === 0
          ? 100
          : DFLT_ESC_PROP;
    value.insert([(height[0] << 24) >> 24], "sal_Int8");
    return true;
  }
  /** Appends to the previous offset without erasing it on failed extraction. @param output - Merged XML destination. @param value - Actual Any. @param converter - Unused converter. @returns Whether nonempty. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const height: [number] = [0];
    if (value.extract(height, "sal_Int32"))
      output[0] += `${output[0] !== "" ? " " : ""}${height[0]}%`;
    return output[0] !== "";
  }
}

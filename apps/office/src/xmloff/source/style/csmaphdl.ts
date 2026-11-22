/** @fileoverview Native fo:text-transform and fo:font-variant property handlers from csmaphdl.cxx. */
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import * as CaseMap from "../../../offapi/com/sun/star/style/CaseMap";

const transforms = new Map([
  ["none", CaseMap.NONE],
  ["lowercase", CaseMap.LOWERCASE],
  ["uppercase", CaseMap.UPPERCASE],
  ["capitalize", CaseMap.TITLE],
]);

/** Converts the native unsigned case-map values for text-transform. */
export class XMLCaseMapPropHdl {
  /** Imports an exact transform token. @param input - XML token. @param value - Property Any. @returns Whether converted. */
  importXML(input: string, value: Any): boolean {
    const mode = transforms.get(input);
    if (mode === undefined) return false;
    value.insert([mode], "sal_uInt16");
    return true;
  }

  /** Writes the token for an admitted transform. @param output - XML output. @param value - Property Any. @returns Whether emitted. */
  exportXML(output: [string], value: Any): boolean {
    const mode: [number] = [0];
    if (!value.extract(mode, "sal_uInt16")) return false;
    for (const [token, scalar] of transforms) {
      if (scalar === mode[0]) {
        output[0] = token;
        return true;
      }
    }
    return false;
  }
}

/** Converts the two font-variant values understood by the native case map. */
export class XMLCaseMapVariantHdl {
  /** Imports a signed case-map value. @param input - XML token. @param value - Property Any. @returns Whether converted. */
  importXML(input: string, value: Any): boolean {
    if (input !== "small-caps" && input !== "normal") return false;
    value.insert([input === "small-caps" ? CaseMap.SMALLCAPS : CaseMap.NONE], "sal_Int16");
    return true;
  }

  /** Writes normal or small-caps and clears the output on failure. @param output - XML output. @param value - Property Any. @returns Whether emitted. */
  exportXML(output: [string], value: Any): boolean {
    const mode: [number] = [0];
    output[0] = "";
    if (!value.extract(mode, "sal_uInt16")) return false;
    if (mode[0] === CaseMap.NONE) output[0] = "normal";
    else if (mode[0] === CaseMap.SMALLCAPS) output[0] = "small-caps";
    return output[0] !== "";
  }
}

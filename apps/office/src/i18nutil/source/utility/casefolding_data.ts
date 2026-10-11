/** @fileoverview Complete original casefolding_data.h arrays, preserving initialized type/value and three-unit extra mappings. */
import data from "./casefolding_data.json";
import type { Mapping, Value } from "../../inc/casefolding";

export const CaseMappingIndex = new Int8Array(data.CaseMappingIndex);
export const CaseMappingValue: readonly Value[] = data.CaseMappingValue.map(
  /** Retains each initialized original Value struct. @param fields - Original type and value words. @returns Table value. */
  (fields) => ({ type: fields[0] as number, value: fields[1] as number }),
);
export const MaxCaseMappingExtras = data.MaxCaseMappingExtras;
export const CaseMappingExtra: readonly Mapping[] = data.CaseMappingExtra.map(
  /** Retains each initialized original Mapping struct. @param fields - Original type/count/map tuple. @returns Three-unit mapping. */
  (fields) => {
    const [type, nmap, map] = fields as [number, number, number[]];
    return { type, nmap, map: new Uint16Array(map) };
  },
);

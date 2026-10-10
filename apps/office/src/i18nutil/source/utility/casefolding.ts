/** @fileoverview Original conditional Mapping owners and cased_letter table predicate from casefolding.cxx. */
import { MappingType, type Mapping } from "../../inc/casefolding";
import { CaseMappingIndex, CaseMappingValue } from "./casefolding_data";
import conditions from "./casefolding_conditions.json";

/** Initializes the complete native const Mapping array without selecting payload fields. @param rows - Original initialized type/count/three-unit rows. @returns Original mapping owners. */
function mappingArray(rows: (number | number[])[][]): readonly Mapping[] {
  return rows.map(
    /** Copies every initialized native Mapping member. @param row - Original struct initializer. @returns Initialized three-unit Mapping. */
    (row) => {
      const [type, nmap, map] = row as [number, number, number[]];
      return { type, nmap, map: new Uint16Array(map) };
    },
  );
}

export const mapping_03a3 = mappingArray(conditions.mapping_03a3);
export const mapping_0307 = mappingArray(conditions.mapping_0307);
export const mapping_004a = mappingArray(conditions.mapping_004a);
export const mapping_012e = mappingArray(conditions.mapping_012e);
export const mapping_00cc = mappingArray(conditions.mapping_00cc);
export const mapping_00cd = mappingArray(conditions.mapping_00cd);
export const mapping_0128 = mappingArray(conditions.mapping_0128);
export const mapping_0049 = mappingArray(conditions.mapping_0049);
export const mapping_0069 = mappingArray(conditions.mapping_0069);
export const mapping_0130 = mappingArray(conditions.mapping_0130);

/** Original internal UTF16 cased-letter predicate used for the final-sigma condition. @param ch - Native sal_Unicode argument. @returns Original table mask result. */
export function cased_letter(ch: number): boolean {
  const unit = ch & 0xffff;
  const msb = unit >> 8;
  const cmi = CaseMappingIndex[msb] as number;
  if (cmi < 0) return false;
  const cmv_idx = (cmi << 8) + (unit & 0xff);
  return Boolean(
    (CaseMappingValue[cmv_idx] as { type: number }).type & MappingType.CasedLetterMask,
  );
}

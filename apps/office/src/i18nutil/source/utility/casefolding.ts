/** @fileoverview Original conditional Mapping owners and cased_letter table predicate from casefolding.cxx. */
import {
  MappingType,
  type Mapping,
  type MappingConstReference,
  type Value,
} from "../../inc/casefolding";
import {
  CaseMappingIndex,
  CaseMappingValue,
  CaseMappingExtra,
  MaxCaseMappingExtras,
} from "./casefolding_data";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import {
  isHighSurrogate,
  isLowSurrogate,
  combineSurrogates,
  splitSurrogates,
} from "../../../sal/inc/rtl/character";
import {
  u_tolower,
  u_toupper,
  u_totitle,
  u_foldCase,
} from "../../../external/icu/source/common/unicode/uchar";
import { U_FOLD_CASE_DEFAULT } from "../../../external/icu/source/common/unicode/stringoptions";
import conditions from "./casefolding_conditions.json";

/** Initializes the complete native const Mapping array without selecting payload fields. @param rows - Original initialized type/count/three-unit rows. @returns Original mapping owners. */
function mappingArray(rows: (number | number[])[][]): readonly MappingConstReference[] {
  return rows.map(
    /** Copies every initialized native Mapping member. @param row - Original struct initializer. @returns Initialized three-unit Mapping. */
    (row) => {
      const [type, nmap, map] = row as [number, number, number[]];
      return { type, nmap, map: new Uint16Array(map) };
    },
  );
}

/** Original type_i macro's simple lowercase i/j check. @param ch - UTF16 unit. @returns Native predicate. */
function type_i(ch: number): boolean {
  return ch === 0x0069 || ch === 0x006a;
}

/** Original accent_above macro, including its disjoint combining-mark ranges. @param ch - UTF16 unit. @returns Native predicate. */
function accent_above(ch: number): boolean {
  return (
    (ch >= 0x0300 && ch <= 0x0314) ||
    (ch >= 0x033d && ch <= 0x0344) ||
    ch === 0x0346 ||
    (ch >= 0x034a && ch <= 0x034c)
  );
}

const lt = Uint8Array.of(0x6c, 0x74),
  tr = Uint8Array.of(0x74, 0x72),
  az = Uint8Array.of(0x61, 0x7a);

/** Original const-reference conditional selection; positions and lengths retain the original caller contract. @param str - Allocated UTF16 input. @param pos - Native position. @param len - Native logical length. @param aLocale - Borrowed original Locale. @param nMappingType - Original mapping flags. @returns Borrowed original conditional array entry. */
export function getConditionalValue(
  str: Uint16Array,
  pos: number,
  len: number,
  aLocale: LocaleConstReference,
  nMappingType: MappingType,
): MappingConstReference {
  /** Original langIs macro's exact ASCII comparison. @param lang - Original two-byte literal. @returns Exact language equality. */
  const langIs =
    /** Original langIs macro exact literal comparison. @param lang - Two-byte ASCII literal. @returns Exact equality. */ (
      lang: Uint8Array,
    ): boolean => aLocale.Language.equalsAsciiL(lang, 2);
  switch (str[pos]) {
    case 0x03a3:
      return (
        !(pos < len && cased_letter(str[pos + 1] as number)) &&
        pos > 0 &&
        cased_letter(str[pos - 1] as number)
          ? mapping_03a3[0]
          : mapping_03a3[1]
      ) as MappingConstReference;
    case 0x0307:
      return (
        ((nMappingType === MappingType.LowerToUpper && langIs(lt)) ||
          (nMappingType === MappingType.UpperToLower && (langIs(tr) || langIs(az)))) &&
        pos > 0 &&
        type_i(str[pos - 1] as number)
          ? mapping_0307[0]
          : mapping_0307[1]
      ) as MappingConstReference;
    case 0x0130:
      return (
        langIs(tr) || langIs(az) ? mapping_0130[0] : mapping_0130[1]
      ) as MappingConstReference;
    case 0x0069:
      return (
        langIs(tr) || langIs(az) ? mapping_0069[0] : mapping_0069[1]
      ) as MappingConstReference;
    // The upstream pos > len conditions are retained; see CALC-035.
    case 0x0049:
      return (
        langIs(lt) && pos > len && accent_above(str[pos + 1] as number)
          ? mapping_0049[0]
          : langIs(tr) || langIs(az)
            ? mapping_0049[1]
            : mapping_0049[2]
      ) as MappingConstReference;
    case 0x004a:
      return (
        langIs(lt) && pos > len && accent_above(str[pos + 1] as number)
          ? mapping_004a[0]
          : mapping_004a[1]
      ) as MappingConstReference;
    case 0x012e:
      return (
        langIs(lt) && pos > len && accent_above(str[pos + 1] as number)
          ? mapping_012e[0]
          : mapping_012e[1]
      ) as MappingConstReference;
    case 0x00cc:
      return (langIs(lt) ? mapping_00cc[0] : mapping_00cc[1]) as MappingConstReference;
    case 0x00cd:
      return (langIs(lt) ? mapping_00cd[0] : mapping_00cd[1]) as MappingConstReference;
    case 0x0128:
      return (langIs(lt) ? mapping_0128[0] : mapping_0128[1]) as MappingConstReference;
  }
  throw new RuntimeException();
}

/** Adapts the original Mapping struct value copy, including unused initialized units. @param source - Borrowed native struct. @returns Independent value copy. */
function copyMapping(source: MappingConstReference): Mapping {
  return {
    type: source.type,
    nmap: source.nmap,
    map: Uint16Array.of(source.map[0] as number, source.map[1] as number, source.map[2] as number),
  };
}

/** Original scalar mapping: UTF16 tails, table/extra/conditional selection and verified ICU scalar fallback. @param str - Allocated UTF16 input. @param pos - Native position. @param len - Native logical length. @param aLocale - Borrowed original Locale. @param nMappingType - Original flags. @returns Independent Mapping value. */
export function getValue(
  str: Uint16Array,
  pos: number,
  len: number,
  aLocale: LocaleConstReference,
  nMappingType: MappingType,
): Mapping {
  if (pos > 0 && isHighSurrogate(str[pos - 1] as number) && isLowSurrogate(str[pos] as number))
    return { type: 0, nmap: 0, map: new Uint16Array(3) };
  const dummy: Mapping = { type: 0, nmap: 1, map: Uint16Array.of(str[pos] as number, 0, 0) };
  const c =
    pos + 1 < len && isHighSurrogate(str[pos] as number) && isLowSurrogate(str[pos + 1] as number)
      ? combineSurrogates(str[pos] as number, str[pos + 1] as number)
      : (str[pos] as number);
  let address = -1;
  if (c < CaseMappingIndex.length * 256) address = CaseMappingIndex[c >> 8] as number;
  if (address >= 0) {
    address = (address << 8) + (c & 0xff);
    const entry = CaseMappingValue[address] as Value;
    if (entry.type & nMappingType) {
      if (entry.type & MappingType.NotValue) {
        if (entry.value === 0)
          return copyMapping(getConditionalValue(str, pos, len, aLocale, nMappingType));
        for (let map = entry.value; map < entry.value + MaxCaseMappingExtras; map++) {
          const extra = CaseMappingExtra[map] as MappingConstReference;
          if (extra.type & nMappingType) {
            if (extra.type & MappingType.NotValue)
              return copyMapping(getConditionalValue(str, pos, len, aLocale, nMappingType));
            return copyMapping(extra);
          }
        }
        throw new RuntimeException();
      }
      dummy.map[0] = entry.value;
      return dummy;
    }
  }
  let value = c;
  switch (nMappingType) {
    case MappingType.ToLower:
    case MappingType.UpperToLower:
      value = u_tolower(c);
      break;
    case MappingType.ToUpper:
    case MappingType.LowerToUpper:
      value = u_toupper(c);
      break;
    case MappingType.ToTitle:
      value = u_totitle(c);
      break;
    case MappingType.SimpleFolding:
    case MappingType.FullFolding:
      value = u_foldCase(c, U_FOLD_CASE_DEFAULT);
      break;
  }
  dummy.nmap = splitSurrogates(value, dummy.map);
  return dummy;
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

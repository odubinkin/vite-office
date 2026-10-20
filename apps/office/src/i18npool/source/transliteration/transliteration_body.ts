/** @fileoverview Consumed native transliterateImpl branches: uppercase and full case folding with optional original-offset output. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { getValue } from "../../../i18nutil/source/utility/casefolding";
import { MappingType, NMAPPINGMAX } from "../../../i18nutil/inc/casefolding";

/** Native transliterateImpl loop for consumed fixed mapping states. Typed-array storage erases native stack/heap selection. @param inStr - Original UTF-16 input. @param startPos - Input start. @param nCount - Input unit count. @param locale - Mapping locale. @param mappingType - Original mapping state. @param offsets - Optional per-output-unit source offsets. @returns Mapped native string. */
function transliterateImpl(
  inStr: OUStringConstReference,
  startPos: number,
  nCount: number,
  locale: LocaleConstReference,
  mappingType: MappingType,
  offsets?: number[],
): OUString {
  const input = inStr.getStr().subarray(startPos),
    output = new Uint16Array(nCount * NMAPPINGMAX);
  let written = 0;
  for (let i = 0; i < nCount; i++) {
    const mapping = getValue(input, i, nCount, locale, mappingType);
    output.set(mapping.map.subarray(0, mapping.nmap), written);
    if (offsets !== undefined) for (let j = 0; j < mapping.nmap; j++) offsets.push(i + startPos);
    written += mapping.nmap;
  }
  return new OUString(output.subarray(0, written), written);
}
/** Original ToUpper mapping operation with nullptr offsets. Caller owns valid signed32 bounds and the original classifier clamp. @param inStr - Original input. @param startPos - UTF-16 start. @param nCount - Count. @param locale - Original locale. @returns Native mapped value. */
export function transliterateUppercase(
  inStr: OUStringConstReference,
  startPos: number,
  nCount: number,
  locale: LocaleConstReference,
): OUString {
  return transliterateImpl(inStr, startPos, nCount, locale, MappingType.ToUpper);
}
/** FullFolding state used by native Transliteration_caseignore, including expansion offsets. @param inStr - Input. @param startPos - First input unit. @param nCount - Unit count. @param locale - Original locale. @returns Mapped value and original offsets. */
export function transliterateCaseFolding(
  inStr: OUStringConstReference,
  startPos: number,
  nCount: number,
  locale: LocaleConstReference,
): { text: OUString; offsets: readonly number[] } {
  const offsets: number[] = [];
  return {
    text: transliterateImpl(inStr, startPos, nCount, locale, MappingType.FullFolding, offsets),
    offsets,
  };
}

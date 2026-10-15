/** @fileoverview Original no-offset transliterateImpl operation specialized to CharClass ToUpper state. No full transliteration service, buffer/lifetime engine or other mapping modes are fabricated. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { getValue } from "../../../i18nutil/source/utility/casefolding";
import { MappingType, NMAPPINGMAX } from "../../../i18nutil/inc/casefolding";

/** Original ToUpper mapping loop with nullptr offsets. Caller supplies valid nonnegative signed32 positions/counts within the original logical input; the classifier owns its original clamp. JS typed data erases the native stack/heap distinction. @param inStr - Actual const input. @param startPos - Original UTF16 position. @param nCount - Logical selected count. @param locale - Original locale state. @returns Actual original Unicode value. */
export function transliterateUppercase(
  inStr: OUStringConstReference,
  startPos: number,
  nCount: number,
  locale: LocaleConstReference,
): OUString {
  const input = inStr.getStr().subarray(startPos),
    output = new Uint16Array(nCount * NMAPPINGMAX);
  let written = 0;
  for (let i = 0; i < nCount; i++) {
    const mapping = getValue(input, i, nCount, locale, MappingType.ToUpper);
    output.set(mapping.map.subarray(0, mapping.nmap), written);
    written += mapping.nmap;
  }
  return new OUString(output.subarray(0, written), written);
}

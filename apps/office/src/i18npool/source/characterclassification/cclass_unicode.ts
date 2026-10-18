/** @fileoverview Original cclass_Unicode::toUpper field operation with its exact range clamp; class/service construction and other classification operations remain unimplemented. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { transliterateUppercase } from "../transliteration/transliteration_body";

/** Original full/range uppercase query over actual prepared input/locale; native caller preconditions exclude negative or invalid signed32 bounds. @param Text - Actual input. @param nPos - UTF16 start. @param nCount - Requested count. @param rLocale - Original locale. @returns Original mapped value. */
export function toUpper(
  Text: OUStringConstReference,
  nPos: number,
  nCount: number,
  rLocale: LocaleConstReference,
): OUString {
  const length = Text.getLength();
  if (nPos >= length) return new OUString();
  if (nCount + nPos > length) nCount = length - nPos;
  return transliterateUppercase(Text, nPos, nCount, rLocale);
}

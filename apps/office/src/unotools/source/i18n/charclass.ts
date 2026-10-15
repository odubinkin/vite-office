/** @fileoverview Original CharClass uppercase field query over prepared Locale state, using actual shared classification/mapping owners. This is not a fake CharClass or UNO provider. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { toUpper } from "../../../i18npool/source/characterclassification/cclass_unicode";

/** Original whole-string overload after projecting its existing getMyLocale state. @param rStr - Actual input. @param locale - Prepared original state. @returns Actual mapped value. */
export function uppercase(rStr: OUStringConstReference, locale: LocaleConstReference): OUString;
/** Original explicit-range overload after projecting its existing locale state. @param rStr - Actual input. @param locale - Prepared original state. @param nPos - Valid UTF16 start. @param nCount - Valid selected count. @returns Actual mapped value. */
export function uppercase(
  rStr: OUStringConstReference,
  locale: LocaleConstReference,
  nPos: number,
  nCount: number,
): OUString;
/** Preserves original full/range query and catch-only-UNO-Exception fallback. Diagnostic logging and full service/LanguageTag construction remain outside this field binding. @param rStr - Actual input. @param locale - Prepared original state. @param nPos - Default zero. @param nCount - Default full length. @returns Original uppercase value or unchanged range on a native UNO failure. */
export function uppercase(
  rStr: OUStringConstReference,
  locale: LocaleConstReference,
  nPos = 0,
  nCount = rStr.getLength(),
): OUString {
  try {
    return toUpper(rStr, nPos, nCount, locale);
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    return new OUString(rStr.getStr().subarray(nPos, nPos + nCount), nCount);
  }
}

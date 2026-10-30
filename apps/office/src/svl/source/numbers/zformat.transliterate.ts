/** @fileoverview Original free impTransliterate string/buffer overloads from zformat.cxx over actual NatNum metadata, original ID-to-Locale conversion and NativeNumberWrapper. Represented callers currently admit modes0..11. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import type { SvNumberNatNumConstReference } from "./zformat.natnum";
/** Original string conversion uses the native modifier's locale, independently of current formatting language. The existing source conversion group binds LanguageTag(rNum.GetLang()).getLocale() without a fabricated LanguageTag facade. @param input - Original borrowed string. @param number - Actual metadata. @param native - Actual wrapper. @returns Owned conversion result. */
export function impTransliterateImpl(
  input: OUStringConstReference,
  number: SvNumberNatNumConstReference,
  native: NativeNumberWrapper,
): OUString {
  const locale = convertLanguageToLocale(number.GetLang(), false);
  try {
    return native.getNativeNumberStringParams(
      input,
      locale,
      number.GetNatNum(),
      number.GetParams(),
    );
  } finally {
    locale.dispose();
  }
}
/** Original complete-modifier predicate and string/buffer overloads; buffers borrow their actual pointer field and assign only after the native result is returned. @param input - Actual string or mutable buffer. @param number - Original metadata. @param native - Actual service owner. @returns Owned string, or nothing for in-place buffer conversion. */
export function impTransliterate(
  input: OUStringBuffer,
  number: SvNumberNatNumConstReference,
  native: NativeNumberWrapper,
): void;
/** Original string/buffer overload binding. @param input - Actual source owner. @param number - Actual metadata. @param native - Native-number wrapper. @returns Original owned string or in-place result. */
export function impTransliterate(
  input: OUStringConstReference,
  number: SvNumberNatNumConstReference,
  native: NativeNumberWrapper,
): OUString;
/** Original string/buffer overload binding. @param input - Actual source owner. @param number - Actual metadata. @param native - Native-number wrapper. @returns Original owned string or in-place result. */
export function impTransliterate(
  input: OUStringConstReference | OUStringBuffer,
  number: SvNumberNatNumConstReference,
  native: NativeNumberWrapper,
): OUString | void {
  if (input instanceof OUStringBuffer) {
    if (number.IsComplete()) {
      const result = impTransliterateImpl(OUString.unacquired(input), number, native);
      try {
        input.assign(result);
      } finally {
        result.dispose();
      }
    }
  } else
    return number.IsComplete() ? impTransliterateImpl(input, number, native) : new OUString(input);
}

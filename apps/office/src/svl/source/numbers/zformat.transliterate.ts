/** @fileoverview Original free impTransliterate string/buffer overloads from zformat.cxx over actual NatNum metadata, original ID-to-Locale conversion and NativeNumberWrapper. Numeric, logical and time callers admit the original modes including NatNum12. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import type { SvNumberNatNumConstReference } from "./zformat.natnum";
/** Original string implementation uses the modifier's locale, independently of current formatting language. @param input - Borrowed string. @param number - Metadata. @param native - Wrapper. @returns Owned conversion. */
export function impTransliterateImpl(
  input: OUStringConstReference,
  number: SvNumberNatNumConstReference,
  native: NativeNumberWrapper,
): OUString;
/** Original buffer implementation assigns only after the service returns. @param input - Actual buffer. @param number - Metadata. @param native - Wrapper. @returns Nothing. */
export function impTransliterateImpl(
  input: OUStringBuffer,
  number: SvNumberNatNumConstReference,
  native: NativeNumberWrapper,
): void;
/** Original string/buffer overloads share locale resolution and preserve actual buffer storage on service failure. @param input - Actual owner. @param number - Metadata. @param native - Wrapper. @returns Owned string or in-place assignment. */
export function impTransliterateImpl(
  input: OUStringConstReference | OUStringBuffer,
  number: SvNumberNatNumConstReference,
  native: NativeNumberWrapper,
): OUString | void {
  if (input instanceof OUStringBuffer) {
    const result = impTransliterateImpl(OUString.unacquired(input), number, native);
    try {
      input.assign(result);
    } finally {
      result.dispose();
    }
    return;
  }
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
    if (number.IsComplete()) impTransliterateImpl(input, number, native);
  } else
    return number.IsComplete() ? impTransliterateImpl(input, number, native) : new OUString(input);
}

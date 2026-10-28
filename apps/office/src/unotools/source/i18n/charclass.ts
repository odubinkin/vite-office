/** @fileoverview Original CharClass uppercase field query over prepared Locale state, using actual shared classification/mapping owners. This is not a fake CharClass or UNO provider. */
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import {
  getCharacterType,
  KCharacterType,
  toUpper,
} from "../../../i18npool/source/characterclassification/cclass_unicode";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";

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

/** Original immutable-language CharClass over the already implemented character-classification service operations. */
export class CharClass {
  private readonly locale: Locale;
  /** Original nonempty UTF-16 ASCII digit scan used by the CSV sheet option. @param value - String view. @returns Whether every code unit is an ASCII digit. */
  static isAsciiNumeric(value: string): boolean {
    if (!value.length) return false;
    for (let index = 0; index < value.length; index++) {
      const code = value.charCodeAt(index);
      if (code < 48 || code > 57) return false;
    }
    return true;
  }
  /** Owns the prepared Locale projection of the source LanguageTag. @param locale - Initial locale.  @returns Constructed instance. */
  constructor(locale: LocaleConstReference) {
    this.locale = new Locale(locale);
  }
  /** Original borrowed getMyLocale result. @returns Current locale. */
  getMyLocale(): Readonly<Locale> {
    return this.locale;
  }
  /** Original whole-string/range uppercase overloads. @param value - Input. @param range - Optional native position/count pair. @returns Uppercased value. */
  uppercase(
    value: OUStringConstReference,
    ...range: [] | [position: number, count: number]
  ): OUString {
    return range.length === 0
      ? uppercase(value, this.locale)
      : uppercase(value, this.locale, range[0], range[1]);
  }
  /** Original classifier forwarding with catch-only-UNO-Exception zero fallback. @param value - Input. @param position - UTF-16 offset. @returns Native KCharacterType mask. */
  getCharacterType(value: OUStringConstReference, position: number): number {
    try {
      return getCharacterType(value, position);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return 0;
    }
  }
  /** Original ASCII fast path and KCharacterType::DIGIT fallback. @param value - Input. @param position - UTF-16 offset. @returns Digit classification. */
  isDigit(value: OUStringConstReference, position: number): boolean {
    const code = value.getStr()[position] as number;
    if (code < 128) return code >= 48 && code <= 57;
    try {
      return (getCharacterType(value, position) & KCharacterType.DIGIT) !== 0;
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return false;
    }
  }
  /** Original all-codepoint isNumeric overload. @param value - Input. @returns Whether every codepoint is a digit. */
  isNumeric(value: OUStringConstReference): boolean {
    if (!value.getLength()) return false;
    try {
      const position: [number] = [0];
      while (position[0] < value.getLength()) {
        if (!this.isDigit(value, position[0])) return false;
        value.iterateCodePoints(position);
      }
      return true;
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return false;
    }
  }
  /** Original single-position isLetter ASCII fast path and nCharClassLetterType mask. @param value - Native UTF16 string. @param position - Source offset. @returns Letter classification. */
  isLetter(value: OUStringConstReference, position: number): boolean {
    const unit = value.getStr()[position] as number;
    if (unit < 128) return (unit >= 65 && unit <= 90) || (unit >= 97 && unit <= 122);
    try {
      return (
        (getCharacterType(value, position) &
          (KCharacterType.UPPER |
            KCharacterType.LOWER |
            KCharacterType.TITLE_CASE |
            KCharacterType.LETTER)) !==
        0
      );
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return false;
    }
  }
  /** Original ASCII alphanumeric fast path and letter-or-numeric type mask. @param value - Input. @param position - UTF-16 offset. @returns Classification. */
  isLetterNumeric(value: OUStringConstReference, position: number): boolean {
    const code = value.getStr()[position] as number;
    if (code < 128)
      return (
        (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
      );
    try {
      return (
        (getCharacterType(value, position) &
          (KCharacterType.ALPHA | KCharacterType.LETTER | KCharacterType.DIGIT)) !==
        0
      );
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return false;
    }
  }
  /** Releases the owned locale after dependent scanners stop borrowing it. @returns Nothing. */
  dispose(): void {
    this.locale.dispose();
  }
}

/** @fileoverview Original SvNumberformat::LocaleType and bounded locale-prefix hexadecimal decoding. */
import {
  LANGUAGE_DONTKNOW,
  LANGUAGE_SYSTEM,
  LANGUAGE_NF_SYSTEM_TIME,
  LANGUAGE_NF_SYSTEM_DATE,
} from "../../../i18nlangtag/inc/lang";
import { convertToHex } from "../../../o3tl/inc/numeric";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Original locale substitution tags. */
export enum Substitute {
  NONE,
  TIME,
  LONGDATE,
}
/** Original private compiled-format locale metadata; no locale lookup or normalization is performed by decoding. */
export class LocaleType {
  meLanguage = LANGUAGE_DONTKNOW;
  meLanguageWithoutLocaleData = LANGUAGE_DONTKNOW;
  meSubstitute = Substitute.NONE;
  mnNumeralShape = 0;
  mnCalendarType = 0;
  /** Original default and raw uint32 constructors. @param raw - Optional original extended locale code. @returns Locale metadata. */
  constructor(raw?: number) {
    if (raw === undefined) return;
    raw >>>= 0;
    this.meLanguage = raw & 0xffff;
    if (this.meLanguage === LANGUAGE_NF_SYSTEM_TIME) {
      this.meSubstitute = Substitute.TIME;
      this.meLanguage = LANGUAGE_SYSTEM;
    } else if (this.meLanguage === LANGUAGE_NF_SYSTEM_DATE) {
      this.meSubstitute = Substitute.LONGDATE;
      this.meLanguage = LANGUAGE_SYSTEM;
    }
    raw >>>= 16;
    this.mnCalendarType = raw & 255;
    raw >>>= 8;
    this.mnNumeralShape = raw & 255;
  }
  /** Original active generateCode branch. The upstream numeral/calendar serialization block remains disabled by #if0. @returns Owned uppercase code without leading zeros. */
  generateCode(): OUString {
    const buffer = new OUStringBuffer();
    try {
      let value =
        this.meLanguageWithoutLocaleData === LANGUAGE_DONTKNOW
          ? this.meLanguage
          : this.meLanguageWithoutLocaleData;
      if (this.meLanguage === LANGUAGE_SYSTEM) {
        switch (this.meSubstitute) {
          case Substitute.NONE:
            break;
          case Substitute.TIME:
            value = LANGUAGE_NF_SYSTEM_TIME;
            break;
          case Substitute.LONGDATE:
            value = LANGUAGE_NF_SYSTEM_DATE;
            break;
        }
      }
      for (let index = 0; index < 4; ++index) {
        const digit = (value & 0xf000) >>> 12;
        if (digit || buffer.getLength() !== 0 || index === 3)
          buffer.append(Uint16Array.of(digit < 10 ? 48 + digit : 65 + digit - 10));
        value = (value << 4) & 0xffff;
      }
      return buffer.makeStringAndClear();
    } finally {
      buffer.dispose();
    }
  }
  /** Original plain-locale test includes substitution, calendar and numeral flags. @returns Whether the prefix is plain. */
  isPlainLocale(): boolean {
    return this.meSubstitute === Substitute.NONE && !this.mnCalendarType && !this.mnNumeralShape;
  }
  /** Binding of compiler-generated value assignment. @param source - Actual source metadata. @returns This owner. */
  assign(source: LocaleType): this {
    this.meLanguage = source.meLanguage;
    this.meLanguageWithoutLocaleData = source.meLanguageWithoutLocaleData;
    this.meSubstitute = source.meSubstitute;
    this.mnNumeralShape = source.mnNumeralShape;
    this.mnCalendarType = source.mnCalendarType;
    return this;
  }
}
/** Original bounded locale parser consumes at most eight hex units and preserves the source closing-bracket/cursor rule. @param value - Logical source view. @param position - In/out native cursor. @returns Actual parsed locale metadata or original unknown state. */
export function ImpGetLocaleType(value: Uint16Array, position: [number]): LocaleType {
  let number = 0,
    unit = 0;
  const start = position[0],
    length = value.length;
  while (position[0] < length && position[0] - start < 8) {
    unit = value[position[0]] as number;
    if (unit === 93) break;
    const digit = convertToHex(unit);
    if (digit === -1) return new LocaleType();
    number = (number * 16 + digit) >>> 0;
    ++position[0];
  }
  return unit === 93 || position[0] === length ? new LocaleType(number) : new LocaleType();
}

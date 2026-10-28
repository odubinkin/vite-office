/** @fileoverview Original extended locale calendar/numeral insertion from zformat.cxx; source language predicates and modifier IDs are retained. */
import {
  LANGUAGE_ARABIC_PRIMARY_ONLY,
  LANGUAGE_ARABIC_SAUDI_ARABIA,
  LANGUAGE_BENGALI,
  LANGUAGE_BURMESE,
  LANGUAGE_CHINESE_HONGKONG,
  LANGUAGE_CHINESE_LSO,
  LANGUAGE_CHINESE_MACAU,
  LANGUAGE_CHINESE_SIMPLIFIED,
  LANGUAGE_CHINESE_SINGAPORE,
  LANGUAGE_CHINESE_TRADITIONAL,
  LANGUAGE_DONTKNOW,
  LANGUAGE_ENGLISH_US,
  LANGUAGE_FARSI,
  LANGUAGE_GUJARATI,
  LANGUAGE_HINDI,
  LANGUAGE_JAPANESE,
  LANGUAGE_KANNADA,
  LANGUAGE_KHMER,
  LANGUAGE_KOREAN,
  LANGUAGE_LAO,
  LANGUAGE_MALAYALAM,
  LANGUAGE_MARATHI,
  LANGUAGE_MONGOLIAN_MONGOLIAN_CHINA,
  LANGUAGE_MONGOLIAN_MONGOLIAN_LSO,
  LANGUAGE_MONGOLIAN_MONGOLIAN_MONGOLIA,
  LANGUAGE_NEPALI,
  LANGUAGE_ODIA,
  LANGUAGE_PUNJABI,
  LANGUAGE_PUNJABI_ARABIC_LSO,
  LANGUAGE_TAMIL,
  LANGUAGE_TELUGU,
  LANGUAGE_THAI,
  LANGUAGE_TIBETAN,
  LANGUAGE_TIGRIGNA_ETHIOPIA,
  primary,
} from "../../../i18nlangtag/inc/lang";
import { MsLangId } from "../../../i18nlangtag/inc/mslangid";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import type { LocaleType } from "./zformat.locale";
/** Assigns an original calendar literal through actual string ownership. @param target - Original output. @param value - Source literal. @returns Nothing. */
function assignLiteral(target: OUString, value: string): void {
  const literal = unicode(value);
  try {
    target.moveAssign(literal);
  } finally {
    literal.dispose();
  }
}
/** Original calendar/numeral mapping with borrowed actual compiled-entry locale metadata. @param locale - Actual owner field. @param buffer - Actual mutable code. @param position - Prefix insertion offset. @param language - Original language reference. @param temporary - Decoded locale prefix. @returns Owned source calendar modifier. */
export function ImpObtainCalendarAndNumerals(
  locale: LocaleType,
  buffer: OUStringBuffer,
  position: number,
  language: [number],
  temporary: LocaleType,
): OUString {
  const sCalendar = new OUString();
  try {
    let nNatNum = 0;
    const nLocaleLang = MsLangId.getRealLanguage(locale.meLanguage);
    const nTmpLocaleLang = MsLangId.getRealLanguage(temporary.meLanguage);
    /* NOTE: enhancement to allow other possible locale dependent
     * calendars and numerals. BUT only if our locale data allows it! For LCID
     * numerals and calendars see
     * http://office.microsoft.com/en-us/excel/HA010346351033.aspx
     * Calendar is inserted after
     * all prefixes have been consumed as it is actually a format modifier
     * and not a prefix.
     * Currently calendars are tied to the locale of the entire number
     * format, e.g. [~buddhist] in en_US doesn't work.
     * => Having different locales in sub formats does not work!
     * */
    /* TODO: calendars could be tied to a sub format's NatNum info
     * instead, or even better be available for any locale. Needs a
     * different implementation of GetCal() and locale data calendars.
     * */
    switch (temporary.mnCalendarType & 0x7f) {
      case 0x03: // Gengou calendar
        // Only Japanese language support Gengou calendar.
        // It is an implicit "other" calendar where E, EE, R and RR
        // automatically switch to and YY and YYYY switch to Gregorian. Do
        // not add the "[~gengou]" modifier.
        if (nLocaleLang != LANGUAGE_JAPANESE) {
          language[0] = locale.meLanguage = LANGUAGE_JAPANESE;
        }
        break;
      case 0x05: // Korean Dangi calendar
        assignLiteral(sCalendar, "[~dangi]");
        // Only Korean language support dangi calendar
        if (nLocaleLang != LANGUAGE_KOREAN) {
          language[0] = locale.meLanguage = LANGUAGE_KOREAN;
        }
        break;
      case 0x06: // Hijri calendar
      case 0x17: // same?
        assignLiteral(sCalendar, "[~hijri]");
        // Only Arabic or Farsi languages support Hijri calendar
        if (primary(nLocaleLang) != LANGUAGE_ARABIC_PRIMARY_ONLY && nLocaleLang != LANGUAGE_FARSI) {
          if (
            primary(nTmpLocaleLang) == LANGUAGE_ARABIC_PRIMARY_ONLY ||
            nTmpLocaleLang == LANGUAGE_FARSI
          ) {
            language[0] = locale.meLanguage = temporary.meLanguage;
          } else {
            language[0] = locale.meLanguage = LANGUAGE_ARABIC_SAUDI_ARABIA;
          }
        }
        break;
      case 0x07: // Buddhist calendar
        assignLiteral(sCalendar, "[~buddhist]");
        // Only Thai or Lao languages support Buddhist calendar
        if (nLocaleLang != LANGUAGE_THAI && nLocaleLang != LANGUAGE_LAO) {
          if (nTmpLocaleLang == LANGUAGE_THAI || nTmpLocaleLang == LANGUAGE_LAO) {
            language[0] = locale.meLanguage = temporary.meLanguage;
          } else {
            language[0] = locale.meLanguage = LANGUAGE_THAI;
          }
        }
        break;
      case 0x08: // Hebrew calendar
        assignLiteral(sCalendar, "[~jewish]");
        // Many languages (but not all) support Jewish calendar
        // Unable to find any logic => keep same language
        break;
      case 0x0e: // unknown calendar
      case 0x0f: // unknown calendar
      case 0x10: // Indian calendar (unsupported)
      case 0x11: // unknown calendar
      case 0x12: // unknown calendar
      case 0x13: // unknown calendar
      default: // other calendars (see tdf#36038) are not handle by LibO
        break;
    }
    /** Reference language for each numeral ID */
    const aNumeralIDtoLanguage: readonly number[] = [
      LANGUAGE_DONTKNOW, // 0x00
      LANGUAGE_ENGLISH_US, // 0x01
      LANGUAGE_ARABIC_SAUDI_ARABIA, // 0x02 + all Arabic
      LANGUAGE_FARSI, // 0x03
      LANGUAGE_HINDI, // 0x04 + Devanagari
      LANGUAGE_BENGALI, // 0x05
      LANGUAGE_PUNJABI, // 0x06
      LANGUAGE_GUJARATI, // 0x07
      LANGUAGE_ODIA, // 0x08
      LANGUAGE_TAMIL, // 0x09
      LANGUAGE_TELUGU, // 0x0A
      LANGUAGE_KANNADA, // 0x0B
      LANGUAGE_MALAYALAM, // 0x0C
      LANGUAGE_THAI, // 0x0D
      LANGUAGE_LAO, // 0x0E
      LANGUAGE_TIBETAN, // 0x0F
      LANGUAGE_BURMESE, // 0x10
      LANGUAGE_TIGRIGNA_ETHIOPIA, // 0x11
      LANGUAGE_KHMER, // 0x12
      LANGUAGE_MONGOLIAN_MONGOLIAN_MONGOLIA, // 0x13
      LANGUAGE_DONTKNOW, // 0x14
      LANGUAGE_DONTKNOW, // 0x15
      LANGUAGE_DONTKNOW, // 0x16
      LANGUAGE_DONTKNOW, // 0x17
      LANGUAGE_DONTKNOW, // 0x18
      LANGUAGE_DONTKNOW, // 0x19
      LANGUAGE_DONTKNOW, // 0x1A
      LANGUAGE_JAPANESE, // 0x1B
      LANGUAGE_JAPANESE, // 0x1C
      LANGUAGE_JAPANESE, // 0x1D
      LANGUAGE_CHINESE_SIMPLIFIED, // 0x1E
      LANGUAGE_CHINESE_SIMPLIFIED, // 0x1F
      LANGUAGE_CHINESE_SIMPLIFIED, // 0x20
      LANGUAGE_CHINESE_TRADITIONAL, // 0x21
      LANGUAGE_CHINESE_TRADITIONAL, // 0x22
      LANGUAGE_CHINESE_TRADITIONAL, // 0x23
      LANGUAGE_KOREAN, // 0x24
      LANGUAGE_KOREAN, // 0x25
      LANGUAGE_KOREAN, // 0x26
      LANGUAGE_KOREAN, // 0x27
    ];

    const nNumeralID = temporary.mnNumeralShape & 0x7f;
    const nReferenceLanguage =
      nNumeralID <= 0x27 ? (aNumeralIDtoLanguage[nNumeralID] as number) : LANGUAGE_DONTKNOW;

    switch (nNumeralID) {
      // Regular cases: all languages with same primary mask use same numerals
      case 0x03: // Perso-Arabic (Farsi) numerals
      case 0x05: // Bengali numerals
      case 0x06: // Punjabi numerals
      case 0x07: // Gujarati numerals
      case 0x08: // Odia (Orya) numerals
      case 0x09: // Tamil numerals
      case 0x0a: // Telugu numerals
      case 0x0b: // Kannada numerals
      case 0x0c: // Malayalam numerals
      case 0x0d: // Thai numerals
      case 0x0e: // Lao numerals
      case 0x0f: // Tibetan numerals
      case 0x10: // Burmese (Myanmar) numerals
      case 0x11: // Tigrigna (Ethiopia) numerals
      case 0x12: // Khmer numerals
        if (primary(nLocaleLang) != primary(nReferenceLanguage)) {
          if (primary(nTmpLocaleLang) == primary(nReferenceLanguage)) {
            language[0] = locale.meLanguage = temporary.meLanguage;
          } else {
            language[0] = locale.meLanguage = nReferenceLanguage;
          }
        }
        break;
      // Special cases
      case 0x04: // Devanagari (Hindi) numerals
        // same numerals (Devanagari) for languages with different primary masks
        if (
          nLocaleLang != LANGUAGE_HINDI &&
          nLocaleLang != LANGUAGE_MARATHI &&
          primary(nLocaleLang) != primary(LANGUAGE_NEPALI)
        ) {
          if (
            nTmpLocaleLang == LANGUAGE_HINDI ||
            nTmpLocaleLang == LANGUAGE_MARATHI ||
            primary(nTmpLocaleLang) == primary(LANGUAGE_NEPALI)
          ) {
            language[0] = locale.meLanguage = temporary.meLanguage;
          } else {
            language[0] = locale.meLanguage = LANGUAGE_HINDI;
          }
        }
        break;
      case 0x13: // Mongolian numerals
        // not all Mongolian languages use Mongolian numerals
        if (
          nLocaleLang != LANGUAGE_MONGOLIAN_MONGOLIAN_MONGOLIA &&
          nLocaleLang != LANGUAGE_MONGOLIAN_MONGOLIAN_CHINA &&
          nLocaleLang != LANGUAGE_MONGOLIAN_MONGOLIAN_LSO
        ) {
          if (
            nTmpLocaleLang == LANGUAGE_MONGOLIAN_MONGOLIAN_MONGOLIA ||
            nTmpLocaleLang == LANGUAGE_MONGOLIAN_MONGOLIAN_CHINA ||
            nTmpLocaleLang == LANGUAGE_MONGOLIAN_MONGOLIAN_LSO
          ) {
            language[0] = locale.meLanguage = temporary.meLanguage;
          } else {
            language[0] = locale.meLanguage = LANGUAGE_MONGOLIAN_MONGOLIAN_MONGOLIA;
          }
        }
        break;
      case 0x02: // Eastern-Arabic numerals
        // all arabic primary mask + LANGUAGE_PUNJABI_ARABIC_LSO
        if (
          primary(nLocaleLang) != LANGUAGE_ARABIC_PRIMARY_ONLY &&
          nLocaleLang != LANGUAGE_PUNJABI_ARABIC_LSO
        ) {
          if (
            primary(nTmpLocaleLang) == LANGUAGE_ARABIC_PRIMARY_ONLY ||
            nTmpLocaleLang != LANGUAGE_PUNJABI_ARABIC_LSO
          ) {
            language[0] = locale.meLanguage = temporary.meLanguage;
          } else {
            language[0] = locale.meLanguage = nReferenceLanguage;
          }
        }
        break;
      // CJK numerals
      case 0x1b: // simple Asian numerals, Japanese
      case 0x1c: // financial Asian numerals, Japanese
      case 0x1d: // Arabic fullwidth numerals, Japanese
      case 0x24: // simple Asian numerals, Korean
      case 0x25: // financial Asian numerals, Korean
      case 0x26: // Arabic fullwidth numerals, Korean
      case 0x27: // Korean Hangul numerals
      case 0x1e: // simple Asian numerals, Chinese-PRC
      case 0x1f: // financial Asian numerals, Chinese-PRC
      case 0x20: // Arabic fullwidth numerals, Chinese-PRC
      case 0x21: // simple Asian numerals, Chinese-Taiwan
      case 0x22: // financial Asian numerals, Chinese-Taiwan
      case 0x23: // Arabic fullwidth numerals, Chinese-Taiwan
        if ([0x1b, 0x1c, 0x1d, 0x24, 0x25, 0x26, 0x27].includes(nNumeralID)) {
          // Japanese and Korean are regular
          if (primary(nLocaleLang) != primary(nReferenceLanguage)) {
            if (primary(nTmpLocaleLang) == primary(nReferenceLanguage)) {
              language[0] = locale.meLanguage = temporary.meLanguage;
            } else {
              language[0] = locale.meLanguage = nReferenceLanguage;
            }
          }
        }
        nNatNum = nNumeralID == 0x27 ? 9 : ((nNumeralID - 0x1b) % 3) + 1;
        // [NatNum1] simple numerals
        // [natNum2] financial numerals
        // [NatNum3] Arabic fullwidth numerals
        // Chinese simplified and Chinese traditional have same primary mask
        // Chinese-PRC
        if (
          nReferenceLanguage == LANGUAGE_CHINESE_SIMPLIFIED &&
          nLocaleLang != LANGUAGE_CHINESE_SIMPLIFIED &&
          nLocaleLang != LANGUAGE_CHINESE_SINGAPORE &&
          nLocaleLang != LANGUAGE_CHINESE_LSO
        ) {
          if (
            nTmpLocaleLang == LANGUAGE_CHINESE_SIMPLIFIED ||
            nTmpLocaleLang == LANGUAGE_CHINESE_SINGAPORE ||
            nTmpLocaleLang == LANGUAGE_CHINESE_LSO
          ) {
            language[0] = locale.meLanguage = temporary.meLanguage;
          } else {
            language[0] = locale.meLanguage = LANGUAGE_CHINESE_SIMPLIFIED;
          }
        }
        // Chinese-Taiwan
        else if (
          nReferenceLanguage == LANGUAGE_CHINESE_TRADITIONAL &&
          nLocaleLang != LANGUAGE_CHINESE_TRADITIONAL &&
          nLocaleLang != LANGUAGE_CHINESE_HONGKONG &&
          nLocaleLang != LANGUAGE_CHINESE_MACAU
        ) {
          if (
            nTmpLocaleLang == LANGUAGE_CHINESE_TRADITIONAL ||
            nTmpLocaleLang == LANGUAGE_CHINESE_HONGKONG ||
            nTmpLocaleLang == LANGUAGE_CHINESE_MACAU
          ) {
            language[0] = locale.meLanguage = temporary.meLanguage;
          } else {
            language[0] = locale.meLanguage = LANGUAGE_CHINESE_TRADITIONAL;
          }
        }
        break;
    }
    if (nNumeralID >= 0x02 && nNumeralID <= 0x13) nNatNum = 1;
    if (nNatNum) {
      const begin = unicode("[NatNum"),
        end = unicode("]");
      try {
        buffer.insert(
          position,
          new StringConcat(new StringConcat(begin, OUString.number(nNatNum)), end),
        );
      } finally {
        end.dispose();
        begin.dispose();
      }
    }
    return sCalendar;
  } catch (error) {
    sCalendar.dispose();
    throw error;
  }
}

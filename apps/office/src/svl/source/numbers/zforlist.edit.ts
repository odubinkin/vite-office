/** @fileoverview Original edit-format selection and builtin language remapping consumed by ScColumn::ParseString. */
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { approxFloor } from "../../../sal/inc/rtl/math";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import type { Accessor } from "../../inc/nfengine";
import {
  NfIndexTableOffset as N,
  SvNumFormatType as T,
  SV_COUNTRY_LANGUAGE_OFFSET,
  SV_MAX_COUNT_STANDARD_FORMATS,
} from "../../inc/zforlist";
import type { SvNFLanguageData, SvNFFormatData } from "./zforlist";
import type { SvNumberformatConstReference } from "./zformat";
import { GetFormatIndex, GetTimeFormat, GetStandardFormat } from "./zforlist.standard";
/** Original simple-builtin guard and policy-driven locale offset substitution. @param current - Language owner. @param native - Native-number service. @param policy - Source accessor. @param format - Input key. @param language - Target language. @returns Remapped builtin or original custom key. */
export function GetFormatForLanguageIfBuiltIn(
  current: SvNFLanguageData,
  native: NativeNumberWrapper,
  policy: Accessor,
  format: number,
  language: number,
): number {
  format >>>= 0;
  language = current.ImpResolveLanguage(language);
  if (
    (format < SV_COUNTRY_LANGUAGE_OFFSET && language === current.GetIniLanguage()) ||
    format % SV_COUNTRY_LANGUAGE_OFFSET > SV_MAX_COUNT_STANDARD_FORMATS
  )
    return format;
  const offset = policy.mGetCLOffset(current, native, language);
  return (offset + (format % SV_COUNTRY_LANGUAGE_OFFSET)) >>> 0;
}
/** Original date/time edit-key selection, preserving ISO widths, fractions and duration thresholds. @param current - Language owner. @param table - Actual table. @param native - Native-number service. @param policy - Source accessor. @param number - Cell value. @param key - Display key. @param type - Display category. @param format - Borrowed display entry. @param forLocale - Original optional editing locale. @returns Actual edit key. */
export function GetEditFormat(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  native: NativeNumberWrapper,
  policy: Accessor,
  number: number,
  key: number,
  type: number,
  format: SvNumberformatConstReference | null,
  forLocale = LANGUAGE_DONTKNOW,
): number {
  const language = format ? format.GetLanguage() : LANGUAGE_SYSTEM;
  if (forLocale === LANGUAGE_DONTKNOW) forLocale = language;
  switch (type) {
    case T.DATE: {
      const iso =
        key === GetFormatIndex(current, policy, native, N.NF_DATE_DIN_YYYYMMDD, language) ||
        key === GetFormatIndex(current, policy, native, N.NF_DATE_DIN_YYMMDD, language) ||
        key === GetFormatIndex(current, policy, native, N.NF_DATE_DIN_MMDD, language) ||
        !!format?.IsIso8601(0);
      if (approxFloor(number) !== number)
        return GetFormatIndex(
          current,
          policy,
          native,
          iso ? N.NF_DATETIME_ISO_YYYYMMDD_HHMMSS : N.NF_DATETIME_SYS_DDMMYYYY_HHMMSS,
          forLocale,
        );
      return GetFormatIndex(
        current,
        policy,
        native,
        iso ? N.NF_DATE_ISO_YYYYMMDD : N.NF_DATE_SYS_DDMMYYYY,
        forLocale,
      );
    }
    case T.TIME:
      if (number < 0 || number >= 1)
        return Math.abs(number) * 24 < 0x7fff
          ? GetTimeFormat(current, table, native, policy, number, forLocale, true)
          : GetFormatIndex(current, policy, native, N.NF_DATETIME_SYS_DDMMYYYY_HHMMSS, forLocale);
      return GetStandardFormat(current, table, native, policy, number, key, type, forLocale);
    case T.DURATION:
      return GetTimeFormat(current, table, native, policy, number, forLocale, true);
    case T.DATETIME:
      for (const index of [
        N.NF_DATETIME_ISO_YYYYMMDDTHHMMSS,
        N.NF_DATETIME_ISO_YYYYMMDDTHHMMSS000,
        N.NF_DATETIME_ISO_YYYYMMDD_HHMMSS000,
      ])
        if (key === GetFormatIndex(current, policy, native, index, language))
          return GetFormatIndex(current, policy, native, index, forLocale);
      if (
        key ===
          GetFormatIndex(current, policy, native, N.NF_DATETIME_ISO_YYYYMMDD_HHMMSS, language) ||
        format?.IsIso8601(0)
      )
        return GetFormatIndex(
          current,
          policy,
          native,
          N.NF_DATETIME_ISO_YYYYMMDD_HHMMSS,
          forLocale,
        );
      return GetFormatIndex(current, policy, native, N.NF_DATETIME_SYS_DDMMYYYY_HHMMSS, forLocale);
    case T.NUMBER:
      return GetStandardFormat(current, table, native, policy, type, forLocale);
    default:
      return GetStandardFormat(current, table, native, policy, number, key, type, forLocale);
  }
}

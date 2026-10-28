/** @fileoverview Original read/write engine policy callbacks over actual format-table and external readonly-cache owners. */
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import type { Accessor } from "../../inc/nfengine";
import { NUMBERFORMAT_ENTRY_NOT_FOUND as NONE } from "../../inc/zforlist";
import type { SvNFFormatData, SvNFLanguageData } from "./zforlist";
import { CacheFormatRW, FindFormatRW, CacheFormatRO, FindFormatRO } from "./zforlist.index";
/** Original writable locale lookup. @param table - Actual table. @param current - Actual language. @param native - Native-number service. @param language - Requested language. @returns Locale block. */
export function GetCLOffsetRW(
  table: SvNFFormatData,
  current: SvNFLanguageData,
  native: NativeNumberWrapper,
  language: number,
): number {
  return table.ImpGenerateCL(current, native, language);
}
/** Original readonly lookup requires prior generation and does not change current language. @param table - Actual table. @param _current - Original unused language argument. @param _native - Original unused native-number argument. @param language - Requested language. @returns Existing block. */
export function GetCLOffsetRO(
  table: SvNFFormatData,
  _current: SvNFLanguageData,
  _native: NativeNumberWrapper,
  language: number,
): number {
  const offset = table.ImpGetCLOffset(language);
  if (offset > table["fields"].MaxCLOffset)
    throw new Error("assert(Language must have already been encountered)");
  return offset;
}
/** Original writable currency policy. @param table - Actual table. @param current - Actual language. @param native - Native-number service. @param offset - Locale block. @param language - Currency language. @returns Default currency key. */
export function DefaultCurrencyRW(
  table: SvNFFormatData,
  current: SvNFLanguageData,
  native: NativeNumberWrapper,
  offset: number,
  language: number,
): number {
  return language === LANGUAGE_SYSTEM
    ? table.ImpGetDefaultSystemCurrencyFormat(current, native)
    : table.ImpGetDefaultCurrencyFormat(current, native, offset, language);
}
/** Original readonly currency policy with checked preconditions and no generation. @param table - Actual table. @param _current - Original unused language. @param _native - Original unused service. @param offset - Locale block. @param language - Currency language. @returns Previously cached currency. */
export function DefaultCurrencyRO(
  table: SvNFFormatData,
  _current: SvNFLanguageData,
  _native: NativeNumberWrapper,
  offset: number,
  language: number,
): number {
  const result =
    language === LANGUAGE_SYSTEM
      ? table["fields"].nDefaultSystemCurrencyFormat[0]
      : table["fields"].aDefaultFormatKeys.get((offset + 20) >>> 0);
  if (result === undefined || result === NONE)
    throw new Error("assert(default currency must have already been encountered)");
  return result;
}
/** Original four owner-bound writable policy closures. @param table - Actual mutable format table. @returns Source accessor. */
export function GetRWPolicy(table: SvNFFormatData): Accessor {
  return {
    /** Original table capture. @param current - Language. @param native - Service. @param language - Requested language. @returns Block. */
    mGetCLOffset: (current, native, language) => GetCLOffsetRW(table, current, native, language),
    /** Original table capture. @param search - Search key. @param format - Format key. @returns Nothing. */
    mCacheFormat: (search, format) => CacheFormatRW(table, search, format),
    /** Original table capture. @param search - Search key. @returns Cached key. */
    mFindFormat: (search) => FindFormatRW(table, search),
    /** Original table capture. @param current - Language. @param native - Service. @param offset - Block. @param language - Currency language. @returns Currency key. */
    mGetDefaultCurrency: (current, native, offset, language) =>
      DefaultCurrencyRW(table, current, native, offset, language),
  };
}
/** Original readonly closures retain a distinct caller-owned temporary map. @param table - Actual format table. @param cache - Actual per-thread cache binding. @returns Source accessor. */
export function GetROPolicy(table: SvNFFormatData, cache: Map<number, number>): Accessor {
  const lookupSnapshot = new Map(cache);
  return {
    /** Original table capture. @param current - Language. @param native - Service. @param language - Requested language. @returns Block. */
    mGetCLOffset: (current, native, language) => GetCLOffsetRO(table, current, native, language),
    /** Original temporary-cache capture. @param search - Search key. @param format - Format key. @returns Nothing. */
    mCacheFormat: (search, format) => CacheFormatRO(cache, search, format),
    /** Original owner-cache precedence. @param search - Search key. @returns Cached key. */
    mFindFormat: (search) => FindFormatRO(table, lookupSnapshot, search),
    /** Original table capture. @param current - Language. @param native - Service. @param offset - Block. @param language - Currency language. @returns Currency key. */
    mGetDefaultCurrency: (current, native, offset, language) =>
      DefaultCurrencyRO(table, current, native, offset, language),
  };
}

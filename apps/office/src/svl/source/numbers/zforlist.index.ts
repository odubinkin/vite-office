/** @fileoverview Original zforlist.cxx builtin runtime-key table, index conversion, default selection and format-key caches. All table queries use the actual SvNFFormatData and SvNumberformat owners. */
import {
  NfIndexTableOffset as N,
  NUMBERFORMAT_ENTRY_NOT_FOUND,
  SV_COUNTRY_LANGUAGE_OFFSET,
  SV_MAX_COUNT_STANDARD_FORMATS,
  SvNumFormatType as T,
} from "../../inc/zforlist";
import type { SvNFFormatData } from "./zforlist";
/** Original ZF_STANDARD runtime-key base. */
export const ZF_STANDARD = 0;
/** Original ZF_STANDARD_PERCENT runtime-key base. */
export const ZF_STANDARD_PERCENT = 10;
/** Original ZF_STANDARD_CURRENCY runtime-key base. */
export const ZF_STANDARD_CURRENCY = 20;
/** Original ZF_STANDARD_DATE runtime-key base. */
export const ZF_STANDARD_DATE = 30;
/** Original ZF_STANDARD_TIME runtime-key base. */
export const ZF_STANDARD_TIME = 60;
/** Original ZF_STANDARD_DURATION runtime-key base. */
export const ZF_STANDARD_DURATION = ZF_STANDARD_TIME + 4;
/** Original ZF_STANDARD_DATETIME runtime-key base. */
export const ZF_STANDARD_DATETIME = 70;
/** Original ZF_STANDARD_SCIENTIFIC runtime-key base. */
export const ZF_STANDARD_SCIENTIFIC = 80;
/** Original ZF_STANDARD_FRACTION runtime-key base. */
export const ZF_STANDARD_FRACTION = 85;
/** Original ZF_STANDARD_DATE_SYS_DMMMYYYY runtime-key base. */
export const ZF_STANDARD_DATE_SYS_DMMMYYYY = ZF_STANDARD_DATE + 10;
/** Original ZF_STANDARD_DATE_SYS_DMMMMYYYY runtime-key base. */
export const ZF_STANDARD_DATE_SYS_DMMMMYYYY = ZF_STANDARD_DATE + 11;
/** Original ZF_STANDARD_DATE_SYS_NNDMMMYY runtime-key base. */
export const ZF_STANDARD_DATE_SYS_NNDMMMYY = ZF_STANDARD_DATE + 12;
/** Original ZF_STANDARD_DATE_SYS_NNDMMMMYYYY runtime-key base. */
export const ZF_STANDARD_DATE_SYS_NNDMMMMYYYY = ZF_STANDARD_DATE + 13;
/** Original ZF_STANDARD_DATE_SYS_NNNNDMMMMYYYY runtime-key base. */
export const ZF_STANDARD_DATE_SYS_NNNNDMMMMYYYY = ZF_STANDARD_DATE + 14;
/** Original ZF_STANDARD_DATE_DIN_DMMMYYYY runtime-key base. */
export const ZF_STANDARD_DATE_DIN_DMMMYYYY = ZF_STANDARD_DATE + 15;
/** Original ZF_STANDARD_DATE_DIN_DMMMMYYYY runtime-key base. */
export const ZF_STANDARD_DATE_DIN_DMMMMYYYY = ZF_STANDARD_DATE + 16;
/** Original ZF_STANDARD_DATE_DIN_MMDD runtime-key base. */
export const ZF_STANDARD_DATE_DIN_MMDD = ZF_STANDARD_DATE + 17;
/** Original ZF_STANDARD_DATE_DIN_YYMMDD runtime-key base. */
export const ZF_STANDARD_DATE_DIN_YYMMDD = ZF_STANDARD_DATE + 18;
/** Original ZF_STANDARD_DATE_DIN_YYYYMMDD runtime-key base. */
export const ZF_STANDARD_DATE_DIN_YYYYMMDD = ZF_STANDARD_DATE + 19;
/** Original ZF_STANDARD_DATE_WW runtime-key base. */
export const ZF_STANDARD_DATE_WW = ZF_STANDARD_DATE + 20;
/** Original ZF_STANDARD_LOGICAL runtime-key base. */
export const ZF_STANDARD_LOGICAL = SV_MAX_COUNT_STANDARD_FORMATS - 1;
/** Original ZF_STANDARD_TEXT runtime-key base. */
export const ZF_STANDARD_TEXT = SV_MAX_COUNT_STANDARD_FORMATS;
/** Original indexTable in NfIndexTableOffset order; these runtime keys are not the enum ordinals. */
export const indexTable: readonly number[] = [
  ZF_STANDARD, // NF_NUMBER_STANDARD
  ZF_STANDARD + 1, // NF_NUMBER_INT
  ZF_STANDARD + 2, // NF_NUMBER_DEC2
  ZF_STANDARD + 3, // NF_NUMBER_1000INT
  ZF_STANDARD + 4, // NF_NUMBER_1000DEC2
  ZF_STANDARD + 5, // NF_NUMBER_SYSTEM
  ZF_STANDARD_SCIENTIFIC, // NF_SCIENTIFIC_000E000
  ZF_STANDARD_SCIENTIFIC + 1, // NF_SCIENTIFIC_000E00
  ZF_STANDARD_PERCENT, // NF_PERCENT_INT
  ZF_STANDARD_PERCENT + 1, // NF_PERCENT_DEC2
  ZF_STANDARD_FRACTION, // NF_FRACTION_1D
  ZF_STANDARD_FRACTION + 1, // NF_FRACTION_2D
  ZF_STANDARD_CURRENCY, // NF_CURRENCY_1000INT
  ZF_STANDARD_CURRENCY + 1, // NF_CURRENCY_1000DEC2
  ZF_STANDARD_CURRENCY + 2, // NF_CURRENCY_1000INT_RED
  ZF_STANDARD_CURRENCY + 3, // NF_CURRENCY_1000DEC2_RED
  ZF_STANDARD_CURRENCY + 4, // NF_CURRENCY_1000DEC2_CCC
  ZF_STANDARD_CURRENCY + 5, // NF_CURRENCY_1000DEC2_DASHED
  ZF_STANDARD_DATE, // NF_DATE_SYSTEM_SHORT
  ZF_STANDARD_DATE + 8, // NF_DATE_SYSTEM_LONG
  ZF_STANDARD_DATE + 7, // NF_DATE_SYS_DDMMYY
  ZF_STANDARD_DATE + 6, // NF_DATE_SYS_DDMMYYYY
  ZF_STANDARD_DATE + 9, // NF_DATE_SYS_DMMMYY
  ZF_STANDARD_DATE_SYS_DMMMYYYY, // NF_DATE_SYS_DMMMYYYY
  ZF_STANDARD_DATE_DIN_DMMMYYYY, // NF_DATE_DIN_DMMMYYYY
  ZF_STANDARD_DATE_SYS_DMMMMYYYY, // NF_DATE_SYS_DMMMMYYYY
  ZF_STANDARD_DATE_DIN_DMMMMYYYY, // NF_DATE_DIN_DMMMMYYYY
  ZF_STANDARD_DATE_SYS_NNDMMMYY, // NF_DATE_SYS_NNDMMMYY
  ZF_STANDARD_DATE + 1, // NF_DATE_DEF_NNDDMMMYY
  ZF_STANDARD_DATE_SYS_NNDMMMMYYYY, // NF_DATE_SYS_NNDMMMMYYYY
  ZF_STANDARD_DATE_SYS_NNNNDMMMMYYYY, // NF_DATE_SYS_NNNNDMMMMYYYY
  ZF_STANDARD_DATE_DIN_MMDD, // NF_DATE_DIN_MMDD
  ZF_STANDARD_DATE_DIN_YYMMDD, // NF_DATE_DIN_YYMMDD
  ZF_STANDARD_DATE_DIN_YYYYMMDD, // NF_DATE_DIN_YYYYMMDD
  ZF_STANDARD_DATE + 2, // NF_DATE_SYS_MMYY
  ZF_STANDARD_DATE + 3, // NF_DATE_SYS_DDMMM
  ZF_STANDARD_DATE + 4, // NF_DATE_MMMM
  ZF_STANDARD_DATE + 5, // NF_DATE_QQJJ
  ZF_STANDARD_DATE_WW, // NF_DATE_WW
  ZF_STANDARD_TIME, // NF_TIME_HHMM
  ZF_STANDARD_TIME + 1, // NF_TIME_HHMMSS
  ZF_STANDARD_TIME + 2, // NF_TIME_HHMMAMPM
  ZF_STANDARD_TIME + 3, // NF_TIME_HHMMSSAMPM
  ZF_STANDARD_TIME + 4, // NF_TIME_HH_MMSS
  ZF_STANDARD_TIME + 5, // NF_TIME_MMSS00
  ZF_STANDARD_TIME + 6, // NF_TIME_HH_MMSS00
  ZF_STANDARD_DATETIME, // NF_DATETIME_SYSTEM_SHORT_HHMM
  ZF_STANDARD_DATETIME + 1, // NF_DATETIME_SYS_DDMMYYYY_HHMMSS
  ZF_STANDARD_LOGICAL, // NF_BOOLEAN
  ZF_STANDARD_TEXT, // NF_TEXT
  ZF_STANDARD_DATETIME + 2, // NF_DATETIME_SYS_DDMMYYYY_HHMM
  ZF_STANDARD_FRACTION + 2, // NF_FRACTION_3D
  ZF_STANDARD_FRACTION + 3, // NF_FRACTION_2
  ZF_STANDARD_FRACTION + 4, // NF_FRACTION_4
  ZF_STANDARD_FRACTION + 5, // NF_FRACTION_8
  ZF_STANDARD_FRACTION + 6, // NF_FRACTION_16
  ZF_STANDARD_FRACTION + 7, // NF_FRACTION_10
  ZF_STANDARD_FRACTION + 8, // NF_FRACTION_100
  ZF_STANDARD_DATETIME + 3, // NF_DATETIME_ISO_YYYYMMDD_HHMMSS
  ZF_STANDARD_DATETIME + 4, // NF_DATETIME_ISO_YYYYMMDD_HHMMSS000
  ZF_STANDARD_DATETIME + 5, // NF_DATETIME_ISO_YYYYMMDDTHHMMSS
  ZF_STANDARD_DATETIME + 6, // NF_DATETIME_ISO_YYYYMMDDTHHMMSS000
];

/** Original builtin-index to locale-block-key conversion. Native negative/out-of-domain enum array access is not certified. @param offset - NfIndexTableOffset. @param localeOffset - Native uint32 locale block. @returns Runtime key or missing sentinel. */
export function ImpGetFormatIndex(offset: number, localeOffset: number): number {
  offset |= 0;
  localeOffset >>>= 0;
  if (offset >= N.NF_INDEX_TABLE_ENTRIES) return NUMBERFORMAT_ENTRY_NOT_FOUND;
  if (indexTable[offset] === NUMBERFORMAT_ENTRY_NOT_FOUND) return NUMBERFORMAT_ENTRY_NOT_FOUND;
  return (localeOffset + (indexTable[offset] as number)) >>> 0;
}
/** Original inverse lookup scans the complete table and preserves its not-built-in return. @param format - Native uint32 key. @returns Enum offset or NF_INDEX_TABLE_ENTRIES. */
export function GetIndexTableOffset(format: number): number {
  const offset = (format >>> 0) % SV_COUNTRY_LANGUAGE_OFFSET;
  if (offset > SV_MAX_COUNT_STANDARD_FORMATS) return N.NF_INDEX_TABLE_ENTRIES;
  for (let j = 0; j < N.NF_INDEX_TABLE_ENTRIES; ++j) if (indexTable[j] === offset) return j;
  return N.NF_INDEX_TABLE_ENTRIES;
}
/** Original category-specific search/cache key. @param type - Category. @param offset - Native locale block. @returns Search key. */
export function ImpGetSearchOffset(type: number, offset: number): number {
  offset >>>= 0;
  let search: number;
  switch (type) {
    case T.DATE:
      search = offset + ZF_STANDARD_DATE;
      break;
    case T.TIME:
      search = offset + ZF_STANDARD_TIME;
      break;
    case T.DATETIME:
      search = offset + ZF_STANDARD_DATETIME;
      break;
    case T.DURATION:
      search = offset + ZF_STANDARD_DURATION;
      break;
    case T.PERCENT:
      search = offset + ZF_STANDARD_PERCENT;
      break;
    case T.SCIENTIFIC:
      search = offset + ZF_STANDARD_SCIENTIFIC;
      break;
    default:
      search = offset + ZF_STANDARD;
  }
  return search >>> 0;
}
/** Original uncached default search begins at find(CLOffset), never lower_bound, and preserves fixed fallback keys. @param table - Actual table owner. @param type - Native category. @param offset - Native locale block. @returns Standard/default key. */
export function ImpGetDefaultFormat(table: SvNFFormatData, type: number, offset: number): number {
  offset >>>= 0;
  let result = NUMBERFORMAT_ENTRY_NOT_FOUND;
  const stop = (offset + SV_COUNTRY_LANGUAGE_OFFSET) >>> 0,
    entries = table["fields"].aFTable,
    keys = [...entries.keys()].sort(
      /** Preserves std::map unsigned-key order. @param left - First key. @param right - Second key. @returns Order. */ (
        left,
        right,
      ) => left - right,
    );
  let i = keys.indexOf(offset);
  while (i >= 0 && i < keys.length) {
    const key = keys[i] as number;
    if (key < offset || key >= stop) break;
    const entry = entries.get(key) as NonNullable<ReturnType<SvNFFormatData["GetEntry"]>>;
    if (entry.IsStandard() && entry.GetMaskedType() === type) {
      result = key;
      break;
    }
    ++i;
  }
  if (result === NUMBERFORMAT_ENTRY_NOT_FOUND)
    switch (type) {
      case T.DATE:
        result = offset + ZF_STANDARD_DATE;
        break;
      case T.TIME:
        result = offset + ZF_STANDARD_TIME + 1;
        break;
      case T.DATETIME:
        result = offset + ZF_STANDARD_DATETIME;
        break;
      case T.DURATION:
        result = offset + ZF_STANDARD_DURATION;
        break;
      case T.PERCENT:
        result = offset + ZF_STANDARD_PERCENT + 1;
        break;
      case T.SCIENTIFIC:
        result = offset + ZF_STANDARD_SCIENTIFIC;
        break;
      default:
        result = offset + ZF_STANDARD;
    }
  return result >>> 0;
}
/** Original cache miss sentinel distinguishes a cached zero. @param keys - Actual cache map. @param search - Native uint32 search. @returns Cached key or missing sentinel. */
export function FindCachedDefaultFormat(keys: ReadonlyMap<number, number>, search: number): number {
  return keys.get(search >>> 0) ?? NUMBERFORMAT_ENTRY_NOT_FOUND;
}
/** Original mutable-owner cache write. @param table - Actual format owner. @param search - Native uint32 search. @param format - Native uint32 result. @returns Nothing. */
export function CacheFormatRW(table: SvNFFormatData, search: number, format: number): void {
  table["fields"].aDefaultFormatKeys.set(search >>> 0, format >>> 0);
}
/** Original mutable-policy cache query. @param table - Actual owner. @param search - Search key. @returns Cached key. */
export function FindFormatRW(table: SvNFFormatData, search: number): number {
  return table.FindCachedDefaultFormat(search);
}
/** Original readonly policy writes only to its external per-thread map. @param cache - Actual temporary map. @param search - Search key. @param format - Runtime key. @returns Nothing. */
export function CacheFormatRO(cache: Map<number, number>, search: number, format: number): void {
  cache.set(search >>> 0, format >>> 0);
}
/** Original readonly policy prefers the owner's cache before its temporary map. @param table - Actual owner. @param cache - External map. @param search - Search key. @returns Key or sentinel. */
export function FindFormatRO(
  table: SvNFFormatData,
  cache: ReadonlyMap<number, number>,
  search: number,
): number {
  const format = table.FindCachedDefaultFormat(search);
  return format !== NUMBERFORMAT_ENTRY_NOT_FOUND ? format : FindCachedDefaultFormat(cache, search);
}

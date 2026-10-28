/** @fileoverview Original standard/builtin format selection, cache dispatch and time-format overloads from zforlist.cxx. */
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import type { Accessor } from "../../inc/nfengine";
import {
  NfIndexTableOffset as N,
  SvNumFormatType as T,
  NUMBERFORMAT_ENTRY_NOT_FOUND as NONE,
} from "../../inc/zforlist";
import type { SvNFFormatData, SvNFLanguageData } from "./zforlist";
import {
  ImpGetFormatIndex,
  ImpGetDefaultFormat as FindDefault,
  ImpGetSearchOffset,
  ZF_STANDARD_FRACTION,
  ZF_STANDARD_LOGICAL,
  ZF_STANDARD_TEXT,
} from "./zforlist.index";
/** Original builtin key query resolves UNKNOWN then invokes the actual policy. @param current - Language owner. @param policy - Source accessor. @param native - Native-number service. @param index - Source builtin ordinal. @param language - Requested language. @returns Actual format key or sentinel. */
export function GetFormatIndex(
  current: SvNFLanguageData,
  policy: Accessor,
  native: NativeNumberWrapper,
  index: number,
  language: number,
): number {
  language = current.ImpResolveLanguage(language);
  return ImpGetFormatIndex(index, policy.mGetCLOffset(current, native, language));
}
/** Original policy-aware default cache lookup. @param table - Actual table. @param policy - Source accessor. @param type - Category. @param offset - Locale block. @returns Selected key. */
function defaultFormat(
  table: SvNFFormatData,
  policy: Accessor,
  type: number,
  offset: number,
): number {
  const search = ImpGetSearchOffset(type, offset),
    cached = policy.mFindFormat(search);
  if (cached !== NONE) return cached;
  const result = FindDefault(table, type, offset);
  policy.mCacheFormat(search, result);
  return result;
}
/** Original ImpGetStandardFormat dispatch. @param current - Language owner. @param table - Actual table. @param native - Native-number service. @param policy - Source accessor. @param type - Requested category. @param offset - Locale block. @param language - Resolved language. @returns Real standard key. */
export function ImpGetStandardFormat(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  native: NativeNumberWrapper,
  policy: Accessor,
  type: number,
  offset: number,
  language: number,
): number {
  switch (type) {
    case T.CURRENCY:
      return policy.mGetDefaultCurrency(current, native, offset, language);
    case T.DURATION:
      return ImpGetFormatIndex(N.NF_TIME_HH_MMSS, offset);
    case T.DATE:
    case T.TIME:
    case T.DATETIME:
    case T.PERCENT:
    case T.SCIENTIFIC:
      return defaultFormat(table, policy, type, offset);
    case T.FRACTION:
      return (offset + ZF_STANDARD_FRACTION) >>> 0;
    case T.LOGICAL:
      return (offset + ZF_STANDARD_LOGICAL) >>> 0;
    case T.TEXT:
      return (offset + ZF_STANDARD_TEXT) >>> 0;
    default:
      return offset;
  }
}
/** Original special standard-time key comparison. @param key - Actual key. @param offset - Locale block. @returns Whether source preserves the key. */
function special(key: number, offset: number): boolean {
  return (
    key === ImpGetFormatIndex(N.NF_TIME_MMSS00, offset) ||
    key === ImpGetFormatIndex(N.NF_TIME_HH_MMSS00, offset) ||
    key === ImpGetFormatIndex(N.NF_TIME_HH_MMSS, offset)
  );
}
/** Original time-format selection, including fractional-second rounding and negative/duration rules. @param current - Language owner. @param table - Actual table. @param native - Native-number service. @param policy - Source accessor. @param number - Serial-day value. @param language - Requested language. @param forceDuration - Duration flag. @returns Selected format key. */
export function GetTimeFormat(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  native: NativeNumberWrapper,
  policy: Accessor,
  number: number,
  language: number,
  forceDuration: boolean,
): number {
  const sign = number < 0;
  if (sign) number = -number;
  const seconds = number * 86400;
  if (Math.floor(seconds + 0.5) * 100 !== Math.floor(seconds * 100 + 0.5))
    return GetFormatIndex(
      current,
      policy,
      native,
      forceDuration || sign || seconds >= 3600 ? N.NF_TIME_HH_MMSS00 : N.NF_TIME_MMSS00,
      language,
    );
  if (forceDuration || sign || number >= 1)
    return GetFormatIndex(current, policy, native, N.NF_TIME_HH_MMSS, language);
  return GetStandardFormat(current, table, native, policy, T.TIME, language);
}
/** Original three standard-selection overloads, using argument count to bind the erased native overload types. @param current - Language owner. @param table - Actual table. @param native - Native-number service. @param policy - Source accessor. @param args - Original overload arguments. @returns Selected format key. */
export function GetStandardFormat(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  native: NativeNumberWrapper,
  policy: Accessor,
  ...args:
    | [type: number, language: number]
    | [key: number, type: number, language: number]
    | [value: number, key: number, type: number, language: number]
): number {
  if (args.length === 4) {
    const [value, key, type, language] = args,
      resolved = current.ImpResolveLanguage(language),
      offset = policy.mGetCLOffset(current, native, resolved);
    if (special(key >>> 0, offset)) return key >>> 0;
    switch (type) {
      case T.DURATION:
        return GetTimeFormat(current, table, native, policy, value, language, true);
      case T.TIME:
        return GetTimeFormat(current, table, native, policy, value, language, false);
      default:
        return GetStandardFormat(current, table, native, policy, type, language);
    }
  }
  const language = current.ImpResolveLanguage(args[args.length - 1] as number),
    offset = policy.mGetCLOffset(current, native, language);
  if (args.length === 3 && special(args[0] >>> 0, offset)) return args[0] >>> 0;
  return ImpGetStandardFormat(
    current,
    table,
    native,
    policy,
    args[args.length - 2] as number,
    offset,
    language,
  );
}
/** Original General standard selection. @param current - Language owner. @param table - Actual table. @param native - Native-number service. @param policy - Source accessor. @param language - Requested language. @returns Actual General key. */
export function GetStandardIndex(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  native: NativeNumberWrapper,
  policy: Accessor,
  language: number,
): number {
  return GetStandardFormat(current, table, native, policy, T.NUMBER, language);
}

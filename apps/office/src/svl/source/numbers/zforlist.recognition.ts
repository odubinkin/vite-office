/** @fileoverview Original public formatter recognition orchestration and system-format substitution from zforlist.cxx. */
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { DateOrder } from "../../../unotools/source/i18n/localedatawrapper";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import type { Accessor } from "../../inc/nfengine";
import {
  NfIndexTableOffset as N,
  SvNumFormatType as T,
  SV_COUNTRY_LANGUAGE_OFFSET,
} from "../../inc/zforlist";
import { SvNumberFormatter, type SvNFFormatData, type SvNFLanguageData } from "./zforlist";
import type { SvNumberformat } from "./zformat";
import { GetStandardFormat, GetFormatIndex } from "./zforlist.standard";
/** Original substitution is separate from exact table lookup so substituted entries remain visible. @param current - Actual language owner. @param table - Actual table. @param native - Native-number service. @param policy - Source accessor. @param format - Borrowed candidate. @param realKey - Optional key output. @returns Borrowed real format or original pointer. */
export function ImpSubstituteEntry(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  native: NativeNumberWrapper,
  policy: Accessor,
  format: SvNumberformat | null,
  realKey: [number] | null,
): SvNumberformat | null {
  if (!format || !format.IsSubstituted()) return format;
  let key: number;
  if (format.IsSystemTimeFormat())
    key = GetStandardFormat(current, table, native, policy, T.TIME, LANGUAGE_SYSTEM);
  else if (format.IsSystemLongDateFormat())
    key = GetFormatIndex(current, policy, native, N.NF_DATE_SYSTEM_LONG, LANGUAGE_SYSTEM);
  else return format;
  if (realKey) realKey[0] = key;
  return table.GetFormatEntry(key);
}
/** Original typed recognition dispatch: General fast path, text refusal, compatibility and exact date/time/ISO key selection. @param current - Actual language owner. @param table - Actual table. @param native - Native-number service. @param policy - Source accessor. @param value - Source cell input. @param key - In/out format key. @param output - Numeric output. @param options - Native scanner flags. @returns Recognition result. */
export function IsNumberFormat(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  native: NativeNumberWrapper,
  policy: Accessor,
  value: OUStringConstReference,
  key: [number],
  output: [number],
  options: number,
): boolean {
  key[0] >>>= 0;
  let format =
      key[0] === 0
        ? null
        : ImpSubstituteEntry(current, table, native, policy, table.GetFormatEntry(key[0]), null),
    type: number;
  if (!format) {
    current.ChangeIntl(current.GetIniLanguage());
    type = T.NUMBER;
  } else {
    type = format.GetMaskedType();
    if (type === T.ALL) type = T.DEFINED;
    current.ChangeIntl(format.GetLanguage());
    if (key[0] % SV_COUNTRY_LANGUAGE_OFFSET === 0) {
      if (type !== T.NUMBER) throw new Error("assert(FType == SvNumFormatType::NUMBER)");
      format = null;
    }
  }
  const recognized: [number] = [type],
    scanner = current.pStringScanner;
  const result =
    type === T.TEXT
      ? false
      : scanner.IsNumberFormat(value, recognized, output, format, native, options);
  if (result && !SvNumberFormatter.IsCompatible(type, recognized[0])) {
    const language = current.fields.ActLnge[0];
    switch (recognized[0]) {
      case T.DATE:
        key[0] = scanner.CanForceToIso8601(DateOrder.Invalid)
          ? GetFormatIndex(current, policy, native, N.NF_DATE_DIN_YYYYMMDD, language)
          : GetStandardFormat(current, table, native, policy, recognized[0], language);
        break;
      case T.TIME:
        if (scanner.GetDecPos())
          key[0] = GetFormatIndex(
            current,
            policy,
            native,
            scanner.GetNumericsCount() > 3 || output[0] < 0
              ? N.NF_TIME_HH_MMSS00
              : N.NF_TIME_MMSS00,
            language,
          );
        else if (output[0] >= 1 || output[0] < 0)
          key[0] = GetFormatIndex(current, policy, native, N.NF_TIME_HH_MMSS, language);
        else key[0] = GetStandardFormat(current, table, native, policy, recognized[0], language);
        break;
      case T.DATETIME:
        if (scanner.HasIso8601Tsep())
          key[0] = GetFormatIndex(
            current,
            policy,
            native,
            scanner.GetDecPos()
              ? N.NF_DATETIME_ISO_YYYYMMDDTHHMMSS000
              : N.NF_DATETIME_ISO_YYYYMMDDTHHMMSS,
            language,
          );
        else if (scanner.CanForceToIso8601(DateOrder.Invalid))
          key[0] = GetFormatIndex(
            current,
            policy,
            native,
            scanner.GetDecPos()
              ? N.NF_DATETIME_ISO_YYYYMMDD_HHMMSS000
              : N.NF_DATETIME_ISO_YYYYMMDD_HHMMSS,
            language,
          );
        else key[0] = GetStandardFormat(current, table, native, policy, recognized[0], language);
        break;
      default:
        key[0] = GetStandardFormat(current, table, native, policy, recognized[0], language);
    }
  }
  return result;
}

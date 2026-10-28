/** @fileoverview Original locale-block generation, PutEntry and default-currency table ownership from zforlist.cxx. */
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import {
  NUMBERFORMAT_ENTRY_NOT_FOUND as NONE,
  SV_COUNTRY_LANGUAGE_OFFSET,
  SvNumFormatType as T,
} from "../../inc/zforlist";
import { SvNumberFormatter, type SvNFFormatData, type SvNFLanguageData } from "./zforlist";
import { SvNumberformat } from "./zformat";
/** Original language-switch then missing-block initialization; diagnostic-only locale catalog checks are erased. @param table - Actual table. @param current - Actual language. @param native - Native-number service. @param language - Requested language. @returns Existing or generated block. */
export function ImpGenerateCL(
  table: SvNFFormatData,
  current: SvNFLanguageData,
  native: NativeNumberWrapper,
  language: number,
): number {
  current.ChangeIntl(language);
  let offset = table.ImpGetCLOffset(current.fields.ActLnge[0]);
  if (offset > table["fields"].MaxCLOffset) {
    table["fields"].MaxCLOffset = (table["fields"].MaxCLOffset + SV_COUNTRY_LANGUAGE_OFFSET) >>> 0;
    table.ImpGenerateFormats(current, native, table["fields"].MaxCLOffset, false);
    offset = table["fields"].MaxCLOffset;
  }
  return offset;
}
/** Original compiled-entry insertion and duplicate result semantics. @param table - Actual table. @param current - Actual language. @param native - Native-number service. @param code - Mutable source code. @param check - Error position. @param type - Output category. @param key - Output key. @param language - Requested language. @param replaceBoolean - Original Boolean replacement flag. @returns Whether a new entry was inserted. */
export function PutEntry(
  table: SvNFFormatData,
  current: SvNFLanguageData,
  native: NativeNumberWrapper,
  code: OUString,
  check: [number],
  type: [number],
  key: [number],
  language: number,
  replaceBoolean = true,
): boolean {
  key[0] = 0;
  if (code.isEmpty()) {
    check[0] = 1;
    return false;
  }
  language = current.ImpResolveLanguage(language);
  current.ChangeIntl(language);
  const actualLanguage: [number] = [language],
    format = new SvNumberformat(
      code,
      current.GetFormatScanner(),
      current.pStringScanner,
      native,
      check,
      actualLanguage,
      replaceBoolean,
    );
  let transferred = false;
  try {
    if (check[0] !== 0) return false;
    const checkedType = format.GetType();
    if (checkedType !== T.UNDEFINED) {
      format.SetType(checkedType | T.DEFINED);
      type[0] = checkedType;
    } else {
      format.SetType(T.DEFINED);
      type[0] = T.DEFINED;
    }
    const offset = table.ImpGenerateCL(current, native, actualLanguage[0]);
    key[0] = table.ImpIsEntry(format.GetFormatstring(), offset, actualLanguage[0]);
    if (key[0] !== NONE) return false;
    const standard = table.GetFormatEntry(offset) as SvNumberformat,
      position = (offset + standard.GetLastInsertKey()) >>> 0,
      next = (position + 1) >>> 0;
    if (next - offset >= SV_COUNTRY_LANGUAGE_OFFSET || table["fields"].aFTable.has(next))
      return false;
    table["fields"].aFTable.set(next, format);
    transferred = true;
    key[0] = next;
    standard.SetLastInsertKey(key[0] - offset);
    return true;
  } finally {
    if (!transferred) format.dispose();
  }
}
/** Original lazily generated system currency entry and stored key. @param table - Actual table. @param current - Actual language. @param native - Native-number service. @returns Actual currency format key. */
export function ImpGetDefaultSystemCurrencyFormat(
  table: SvNFFormatData,
  current: SvNFLanguageData,
  native: NativeNumberWrapper,
): number {
  if (table["fields"].nDefaultSystemCurrencyFormat[0] === NONE) {
    const formats: OUString[] = [],
      check: [number] = [0],
      type: [number] = [T.UNDEFINED],
      key = table["fields"].nDefaultSystemCurrencyFormat;
    try {
      const selected = current.GetCurrencyFormatStrings(
        formats,
        SvNumberFormatter.GetCurrencyEntry(LANGUAGE_SYSTEM),
        false,
      );
      table.PutEntry(
        current,
        native,
        formats[selected] as OUString,
        check,
        type,
        key,
        LANGUAGE_SYSTEM,
      );
    } finally {
      for (const format of formats) format.dispose();
    }
  }
  return table["fields"].nDefaultSystemCurrencyFormat[0];
}
/** Original cache/lower_bound search, generated-currency insertion and final old automatic fallback. @param table - Actual table. @param current - Actual language. @param native - Native-number service. @param offset - Locale block. @param language - Currency language. @returns Actual selected key. */
export function ImpGetDefaultCurrencyFormat(
  table: SvNFFormatData,
  current: SvNFLanguageData,
  native: NativeNumberWrapper,
  offset: number,
  language: number,
): number {
  offset >>>= 0;
  const search = (offset + 20) >>> 0;
  let result = table["fields"].aDefaultFormatKeys.get(search) ?? NONE;
  if (result === NONE) {
    const stop = (offset + SV_COUNTRY_LANGUAGE_OFFSET) >>> 0;
    const keys = [...table["fields"].aFTable.keys()].sort(
      /** Original map unsigned-key ordering. @param left - First key. @param right - Second key. @returns Ordering. */ (
        left,
        right,
      ) => left - right,
    );
    for (const key of keys) {
      if (key < offset) continue;
      if (key >= stop) break;
      const entry = table.GetFormatEntry(key) as SvNumberformat;
      if (entry.IsStandard() && entry.GetType() & T.CURRENCY) {
        result = key;
        break;
      }
    }
    if (result === NONE) {
      const formats: OUString[] = [],
        check: [number] = [0],
        type: [number] = [T.UNDEFINED],
        key: [number] = [result];
      try {
        const selected = current.GetCurrencyFormatStrings(
          formats,
          SvNumberFormatter.GetCurrencyEntry(language),
          false,
        );
        if (formats.length) {
          table.PutEntry(
            current,
            native,
            formats[selected] as OUString,
            check,
            type,
            key,
            language,
          );
          result = key[0];
        }
      } finally {
        for (const format of formats) format.dispose();
      }
      if (result === NONE) result = (offset + 23) >>> 0;
      else table.GetFormatEntry(result)?.SetStandard();
    }
    table["fields"].aDefaultFormatKeys.set(search, result);
  }
  return result;
}

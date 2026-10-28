/** @fileoverview Original additional builtin generation over actual format/Sequence owners, following ImpGenerateAdditionalFormats in zforlist.cxx. */
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { NumberFormatCode } from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import type { XNumberFormatCode } from "../../../offapi/com/sun/star/i18n/XNumberFormatCode";
import { CURRENCY } from "../../../offapi/com/sun/star/i18n/KNumberFormatUsage";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { ImpAdjustFormatCodeDefault, type SvNFFormatData, type SvNFLanguageData } from "./zforlist";
import { NfIndexTableOffset as N, SV_COUNTRY_LANGUAGE_OFFSET } from "../../inc/zforlist";
/** Original two additional-format passes with temporary currency-index/default mutations and bounded locale-block allocation. Diagnostic-only changing-system flags are erased. @param table - Actual table owner. @param current - Actual language owner. @param native - Original native-number provider. @param offset - Locale block. @param mapper - Actual code provider. @returns Nothing. */
export function ImpGenerateAdditionalFormats(
  table: SvNFFormatData,
  current: SvNFLanguageData,
  native: NativeNumberWrapper,
  offset: number,
  mapper: XNumberFormatCode,
): void {
  offset >>>= 0;
  const standard = table.GetFormatEntry(offset);
  if (!standard) return;
  const locale = new Locale(current.fields.locale),
    scanner = current.GetFormatScanner(),
    language = current.fields.ActLnge;
  try {
    let position = (offset + standard.GetLastInsertKey()) >>> 0;
    const currencies = mapper.getAllFormatCode(CURRENCY, locale);
    try {
      const count = currencies.getLength();
      ImpAdjustFormatCodeDefault(currencies.getArray() as SequenceElements, count);
      for (let index = 0; index < count; ++index) {
        if (position - offset >= SV_COUNTRY_LANGUAGE_OFFSET) break;
        const code = NumberFormatCode.borrowed(currencies.operatorIndex(index));
        if (
          code.Index < N.NF_INDEX_TABLE_RESERVED_START &&
          code.Index !== N.NF_CURRENCY_1000DEC2_CCC
        ) {
          const original = code.Index,
            defaultFlag = code.Default;
          code.Index = original + count + N.NF_INDEX_TABLE_ENTRIES;
          code.Default = false;
          try {
            const format = table.ImpInsertFormat(
              scanner,
              language,
              code,
              (position + 1) >>> 0,
              native,
            );
            if (format) {
              format.SetAdditionalBuiltin();
              ++position;
            }
          } finally {
            code.Index = original;
            code.Default = defaultFlag;
          }
        }
      }
    } finally {
      currencies.dispose();
    }
    const additional = mapper.getAllFormatCodes(locale);
    try {
      for (let index = 0; index < additional.getLength(); ++index) {
        if (position - offset >= SV_COUNTRY_LANGUAGE_OFFSET) break;
        const code = NumberFormatCode.borrowed(additional.operatorIndex(index));
        if (code.Index >= N.NF_INDEX_TABLE_RESERVED_START) {
          const format = table.ImpInsertFormat(
            scanner,
            language,
            code,
            (position + 1) >>> 0,
            native,
          );
          if (format) {
            format.SetAdditionalBuiltin();
            ++position;
          }
        }
      }
    } finally {
      additional.dispose();
    }
    standard.SetLastInsertKey(position - offset);
  } finally {
    locale.dispose();
  }
}

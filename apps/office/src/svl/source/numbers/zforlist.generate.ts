/** @fileoverview Original ImpGenerateFormats standard-entry generation fragment; actual format/table/language owners remain in zforlist.ts. */
import { type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XNumberFormatCode } from "../../../offapi/com/sun/star/i18n/XNumberFormatCode";
import { NumberFormatCode } from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import { FIXED_NUMBER } from "../../../offapi/com/sun/star/i18n/KNumberFormatUsage";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import {
  NfIndexTableOffset as Offset,
  SvNumFormatType,
  SV_MAX_COUNT_STANDARD_FORMATS,
} from "../../inc/zforlist";
import type { ImpSvNumberformatScan } from "./zforscan";
import { SvNumberformat } from "./zformat";
import { ImpAdjustFormatCodeDefault, ImpGetFormatCodeIndex, type SvNFFormatData } from "./zforlist";
import { ZF_STANDARD_LOGICAL, ZF_STANDARD_TEXT } from "./zforlist.index";
/** Original General-number phase of ImpGenerateFormats,not a replacement for the remaining builtin/table generator. The admitted scanner is in native non-conversion mode;actual prepared locale/scanner/language/decimal fields are supplied explicitly,without a fake SvNFLanguageData service. @param table - Actual owning format table. @param mapper - Actual source-code mapper. @param locale - Original locale. @param scanner - Actual prepared scanner. @param language - Original ActLnge field. @param decimal - Original decimal separator field. @param offset - Native locale block offset. @returns Nothing. */
export function generateStandardNumberFormat(
  table: SvNFFormatData,
  mapper: XNumberFormatCode,
  locale: LocaleConstReference,
  scanner: ImpSvNumberformatScan,
  language: [number],
  decimal: OUStringConstReference,
  offset: number,
): void {
  offset >>>= 0;
  const formats = mapper.getAllFormatCode(FIXED_NUMBER, locale);
  try {
    ImpAdjustFormatCodeDefault(formats.getArray() as SequenceElements, formats.getLength());
    const index = ImpGetFormatCodeIndex(formats, Offset.NF_NUMBER_STANDARD, decimal);
    const standard = table.ImpInsertFormat(
      scanner,
      language,
      NumberFormatCode.borrowed(formats.operatorIndex(index)),
      (offset + Offset.NF_NUMBER_STANDARD) >>> 0,
    );
    if (standard) {
      standard.SetType(SvNumFormatType.NUMBER);
      standard.SetStandard();
      standard.SetLastInsertKey(SV_MAX_COUNT_STANDARD_FORMATS);
    }
    for (const [key, type] of [
      [ZF_STANDARD_LOGICAL, SvNumFormatType.LOGICAL],
      [ZF_STANDARD_TEXT, SvNumFormatType.TEXT],
    ] as const) {
      const code =
          key === ZF_STANDARD_TEXT ? unicode("@") : new OUString(scanner.GetBooleanString()),
        check: [number] = [0];
      try {
        const format = new SvNumberformat(
          code,
          scanner,
          scanner.GetCurrentLanguageData().pStringScanner,
          scanner.getColorCallback().GetNatNum(),
          check,
          language,
        );
        format.SetType(type);
        format.SetStandard();
        table.InsertStandardFormat((offset + key) >>> 0, format);
      } finally {
        code.dispose();
      }
    }
  } finally {
    formats.dispose();
  }
}

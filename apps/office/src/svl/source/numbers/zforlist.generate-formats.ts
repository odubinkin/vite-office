/** @fileoverview Original complete builtin-generation sequence from zforlist.cxx, composing actual mapper, language, scanner and format-table owners. */
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { NumberFormatCode } from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import * as Usage from "../../../offapi/com/sun/star/i18n/KNumberFormatUsage";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { createNumberFormatCodeMapper } from "../../../unotools/source/i18n/localedatawrapper";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import {
  NfIndexTableOffset as N,
  SvNumFormatType,
  SV_MAX_COUNT_STANDARD_FORMATS,
} from "../../inc/zforlist";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import {
  ImpAdjustFormatCodeDefault,
  ImpGetFormatCodeIndex,
  type SvNFFormatData,
  type SvNFLanguageData,
} from "./zforlist";
import { ImpGetFormatIndex, ZF_STANDARD_LOGICAL, ZF_STANDARD_TEXT } from "./zforlist.index";
import { SvNumberformat } from "./zformat";
import { ImpGenerateAdditionalFormats } from "./zforlist.generate-additional";
/** Original repeated locale-code insertion in exactly the source usage/index order. Native enum ordinals are mapped through the original runtime-key table. @param table - Actual table owner. @param current - Actual current language. @param native - Actual native-number service. @param offset - Locale block. @param noAdditional - Source changing-system flag. @returns Nothing. */
export function ImpGenerateFormats(
  table: SvNFFormatData,
  current: SvNFLanguageData,
  native: NativeNumberWrapper,
  offset: number,
  noAdditional: boolean,
): void {
  offset >>>= 0;
  const scanner = current.GetFormatScanner(),
    oldConvertMode = scanner.GetConvertMode();
  if (oldConvertMode) scanner.SetConvertMode(false);
  const locale = new Locale(current.fields.locale),
    mapper = createNumberFormatCodeMapper();
  try {
    const numbers = mapper.getAllFormatCode(Usage.FIXED_NUMBER, locale);
    try {
      ImpAdjustFormatCodeDefault(numbers.getArray() as SequenceElements, numbers.getLength());
      const selected = ImpGetFormatCodeIndex(
        numbers,
        N.NF_NUMBER_STANDARD,
        current.GetNumDecimalSep(),
      );
      const standard = table.ImpInsertFormat(
        scanner,
        current.fields.ActLnge,
        NumberFormatCode.borrowed(numbers.operatorIndex(selected)),
        offset,
        native,
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
            current.pStringScanner,
            native,
            check,
            current.fields.ActLnge,
          );
          format.SetType(type);
          format.SetStandard();
          table.InsertStandardFormat((offset + key) >>> 0, format);
        } finally {
          code.dispose();
        }
      }
      for (const index of [
        N.NF_NUMBER_INT,
        N.NF_NUMBER_DEC2,
        N.NF_NUMBER_1000INT,
        N.NF_NUMBER_1000DEC2,
        N.NF_NUMBER_SYSTEM,
      ]) {
        const selected = ImpGetFormatCodeIndex(numbers, index, current.GetNumDecimalSep());
        table.ImpInsertFormat(
          scanner,
          current.fields.ActLnge,
          NumberFormatCode.borrowed(numbers.operatorIndex(selected)),
          ImpGetFormatIndex(index, offset),
          native,
        );
      }
    } finally {
      numbers.dispose();
    }
    /** Original repeated getAllFormatCode/default adjustment/index lookup/insert calls. @param usage - Source usage. @param indices - Source insertion order. @param adjust - Whether the native group adjusts defaults. @returns Nothing. */
    function insertGroup(usage: number, indices: readonly number[], adjust = true): void {
      const formats = mapper.getAllFormatCode(usage, locale);
      try {
        if (adjust)
          ImpAdjustFormatCodeDefault(formats.getArray() as SequenceElements, formats.getLength());
        for (const index of indices) {
          const selected = ImpGetFormatCodeIndex(formats, index, current.GetNumDecimalSep()),
            borrowed = NumberFormatCode.borrowed(formats.operatorIndex(selected));
          if (usage === Usage.CURRENCY) {
            const code = new NumberFormatCode(borrowed);
            try {
              code.Default = false;
              table.ImpInsertFormat(
                scanner,
                current.fields.ActLnge,
                code,
                ImpGetFormatIndex(index, offset),
                native,
              );
            } finally {
              code.dispose();
            }
          } else
            table.ImpInsertFormat(
              scanner,
              current.fields.ActLnge,
              borrowed,
              ImpGetFormatIndex(index, offset),
              native,
            );
        }
      } finally {
        formats.dispose();
      }
    }
    insertGroup(Usage.PERCENT_NUMBER, [N.NF_PERCENT_INT, N.NF_PERCENT_DEC2]);
    insertGroup(
      Usage.CURRENCY,
      [
        N.NF_CURRENCY_1000INT,
        N.NF_CURRENCY_1000DEC2,
        N.NF_CURRENCY_1000INT_RED,
        N.NF_CURRENCY_1000DEC2_RED,
        N.NF_CURRENCY_1000DEC2_CCC,
        N.NF_CURRENCY_1000DEC2_DASHED,
      ],
      false,
    );
    insertGroup(Usage.DATE, [
      N.NF_DATE_SYSTEM_SHORT,
      N.NF_DATE_DEF_NNDDMMMYY,
      N.NF_DATE_SYS_MMYY,
      N.NF_DATE_SYS_DDMMM,
      N.NF_DATE_MMMM,
      N.NF_DATE_QQJJ,
      N.NF_DATE_SYS_DDMMYYYY,
      N.NF_DATE_SYS_DDMMYY,
      N.NF_DATE_SYSTEM_LONG,
      N.NF_DATE_SYS_DMMMYY,
      N.NF_DATE_SYS_DMMMYYYY,
      N.NF_DATE_SYS_DMMMMYYYY,
      N.NF_DATE_SYS_NNDMMMYY,
      N.NF_DATE_SYS_NNDMMMMYYYY,
      N.NF_DATE_SYS_NNNNDMMMMYYYY,
      N.NF_DATE_DIN_DMMMYYYY,
      N.NF_DATE_DIN_DMMMMYYYY,
      N.NF_DATE_DIN_MMDD,
      N.NF_DATE_DIN_YYMMDD,
      N.NF_DATE_DIN_YYYYMMDD,
    ]);
    insertGroup(Usage.TIME, [
      N.NF_TIME_HHMM,
      N.NF_TIME_HHMMSS,
      N.NF_TIME_HHMMAMPM,
      N.NF_TIME_HHMMSSAMPM,
      N.NF_TIME_HH_MMSS,
      N.NF_TIME_MMSS00,
      N.NF_TIME_HH_MMSS00,
    ]);
    insertGroup(Usage.DATE_TIME, [
      N.NF_DATETIME_SYSTEM_SHORT_HHMM,
      N.NF_DATETIME_SYS_DDMMYYYY_HHMMSS,
      N.NF_DATETIME_SYS_DDMMYYYY_HHMM,
    ]);
    const keywords = scanner.GetKeywords(),
      single = new NumberFormatCode();
    try {
      single.Usage = Usage.DATE_TIME;
      /** Original generated code assignment and insertion. @param value - Owned source expression result. @param index - Source builtin index. @returns Borrowed entry. */
      function insertCode(value: OUString, index: number) {
        try {
          single.Code = value;
          return table.ImpInsertFormat(
            scanner,
            current.fields.ActLnge,
            single,
            ImpGetFormatIndex(index, offset),
            native,
          );
        } finally {
          value.dispose();
        }
      }
      /** Original keyword/literal concatenation on UTF16 owners. @param separator - Space or quoted T. @param decimal - Optional fractional-second separator. @returns Owned code. */
      function isoCode(separator: string, decimal?: OUStringConstReference | string): OUString {
        const buffer = new OUStringBuffer();
        try {
          for (const part of [
            keywords[K.YYYY],
            "-",
            keywords[K.MM],
            "-",
            keywords[K.DD],
            separator,
            keywords[K.HH],
            ":",
            keywords[K.MMI],
            ":",
            keywords[K.SS],
            ...(decimal === undefined ? [] : [decimal, "000"]),
          ]) {
            if (typeof part === "string") {
              const literal = unicode(part);
              try {
                buffer.append(literal);
              } finally {
                literal.dispose();
              }
            } else buffer.append(part as OUStringConstReference);
          }
          return buffer.makeStringAndClear();
        } finally {
          buffer.dispose();
        }
      }
      let format = insertCode(isoCode(" "), N.NF_DATETIME_ISO_YYYYMMDD_HHMMSS);
      if (!format) throw new Error("assert(pFormat)");
      format = insertCode(
        isoCode(" ", current.GetLocaleData().getTime100SecSep()),
        N.NF_DATETIME_ISO_YYYYMMDD_HHMMSS000,
      );
      if (!format) throw new Error("assert(pFormat)");
      format = insertCode(isoCode('"T"'), N.NF_DATETIME_ISO_YYYYMMDDTHHMMSS);
      if (!format) throw new Error("assert(pFormat)");
      const comment = unicode("ISO 8601"),
        dot = unicode(".");
      try {
        format.SetComment(comment);
        format = insertCode(
          isoCode('"T"', current.GetLocaleData().getTime100SecSep().equals(dot) ? "." : ","),
          N.NF_DATETIME_ISO_YYYYMMDDTHHMMSS000,
        );
        if (!format) throw new Error("assert(pFormat)");
        format.SetComment(comment);
      } finally {
        comment.dispose();
        dot.dispose();
      }
      insertGroup(Usage.SCIENTIFIC_NUMBER, [N.NF_SCIENTIFIC_000E000, N.NF_SCIENTIFIC_000E00]);
      single.Usage = Usage.FRACTION_NUMBER;
      for (const [index, pattern] of [
        [N.NF_FRACTION_1D, "# ?/?"],
        [N.NF_FRACTION_2D, "# ??/??"],
        [N.NF_FRACTION_3D, "# ???/???"],
        [N.NF_FRACTION_2, "# ?/2"],
        [N.NF_FRACTION_4, "# ?/4"],
        [N.NF_FRACTION_8, "# ?/8"],
        [N.NF_FRACTION_16, "# ??/16"],
        [N.NF_FRACTION_10, "# ??/10"],
        [N.NF_FRACTION_100, "# ??/100"],
      ] as const)
        insertCode(unicode(pattern), index);
      insertCode(new OUString(keywords[K.WW] as OUStringConstReference), N.NF_DATE_WW);
      if (!noAdditional) ImpGenerateAdditionalFormats(table, current, native, offset, mapper);
    } finally {
      single.dispose();
    }
  } finally {
    mapper.dispose();
    locale.dispose();
  }
  if (oldConvertMode) scanner.SetConvertMode(true);
}

/** @fileoverview Writer's native number-format expansion for value field types. */
import { LANGUAGE_NONE, LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { getConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { doubleToUStringBuffer } from "../../../../sal/inc/rtl/math";
import { rtl_math_StringFormat } from "../../../../sal/inc/rtl/math-values";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import {
  NfIndexTableOffset,
  NUMBERFORMAT_ENTRY_NOT_FOUND,
  SV_COUNTRY_LANGUAGE_OFFSET,
  SvNumFormatType,
} from "../../../../svl/inc/zforlist";
import { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist.formatter";
import type { SwDoc } from "../doc/doc";

/** Resolves original language-sensitive built-in formats. @param language - Field language. @param format - Formatter key. @returns Locale used for the field. */
function getLanguageOfFormat(language: number, format: number): number {
  if (language === LANGUAGE_NONE) return LANGUAGE_SYSTEM;
  if (language === getConfiguredSystemLanguage()) {
    switch (SvNumberFormatter.GetIndexTableOffset(format)) {
      case NfIndexTableOffset.NF_NUMBER_SYSTEM:
      case NfIndexTableOffset.NF_DATE_SYSTEM_SHORT:
      case NfIndexTableOffset.NF_DATE_SYSTEM_LONG:
      case NfIndexTableOffset.NF_DATETIME_SYSTEM_SHORT_HHMM:
        return LANGUAGE_SYSTEM;
    }
  }
  return language;
}

/** Original document-owned value field type for represented date and time fields. */
export class SwValueFieldType {
  /** Binds calculation and formatting to the original document. @param document - Owning Writer model. @returns The initialized SwValueFieldType instance. */
  public constructor(private readonly document: SwDoc) {}

  /** Borrows the owning document. @returns Native document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Maps the value field format into the destination's number-format table. @param format - Source key. @param destination - Destination model. @returns Destination key or zero. */
  public CopyFormatToDocument(format: number, destination: SwDoc): number {
    if (!format) return 0;
    const entry = this.document.GetNumberFormatter().GetEntry(format);
    if (!entry) return 0;
    const code = new OUString(entry.GetFormatstring());
    const key: [number] = [0];
    try {
      destination.GetNumberFormatter().PutEntry(code, [0], [0], key, entry.GetLanguage());
      return key[0] === NUMBERFORMAT_ENTRY_NOT_FOUND ? 0 : key[0];
    } finally {
      code.dispose();
    }
  }

  /** Expands a native value using the field's configured format and language. @param value - Numeric value. @param format - Document format key. @param language - Field language. @returns Presentation. */
  public ExpandValue(value: number, format: number, language = LANGUAGE_SYSTEM): string {
    const formatter = this.document.GetNumberFormatter();
    const locale = getLanguageOfFormat(language, format);
    if (format < SV_COUNTRY_LANGUAGE_OFFSET && locale !== LANGUAGE_SYSTEM) {
      const entry = formatter.GetEntry(format);
      if (entry && entry.GetLanguage() !== language) {
        const translated = formatter.GetFormatForLanguageIfBuiltIn(format, locale);
        if (translated !== format) format = translated;
        else {
          const code = new OUString(entry.GetFormatstring());
          const key: [number] = [format];
          try {
            formatter.PutandConvertEntry(
              code,
              [0],
              [SvNumFormatType.DEFINED],
              key,
              entry.GetLanguage(),
              locale,
              false,
            );
            format = key[0];
          } finally {
            code.dispose();
          }
        }
      }
    }

    const output = new OUString();
    try {
      if (formatter.IsTextFormat(format)) {
        const current = formatter.GetROLanguageData();
        current.ChangeIntl(locale);
        const buffer = new OUStringBuffer();
        try {
          doubleToUStringBuffer(
            buffer,
            value,
            rtl_math_StringFormat.rtl_math_StringFormat_F,
            12,
            current.GetNumDecimalSep().getStr()[0] ?? 46,
            true,
          );
          const input = buffer.makeStringAndClear();
          try {
            formatter.GetOutputString(input, format, output, [null]);
          } finally {
            input.dispose();
          }
        } finally {
          buffer.dispose();
        }
      } else formatter.GetOutputString(value, format, output, [null]);
      return text(output);
    } finally {
      output.dispose();
    }
  }
}

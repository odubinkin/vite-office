/** @fileoverview Consumed XMLNumberFormatAttributesExportHelper value-type and currency attributes from numehelp.cxx. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { approxEqual } from "../../../sal/inc/rtl/math";
import { doubleToString } from "../../../sal/rtl/strtmpl.math";
import { convertDaysToDuration } from "../../../sax/source/tools/converter.duration";
import { SvNumFormatType as T } from "../../../svl/inc/zforlist";
import { SvNumberFormatter } from "../../../svl/source/numbers/zforlist.formatter";
import type { DateConstReference } from "../../../tools/source/datetime/tdate";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { escapeXml } from "../text/txtparae";

/** Reads the currency identifier from the native format, preferring the ISO abbreviation. @param formatter - Format table. @param key - Native format key. @returns Currency value or empty. */
export function getCurrencySymbol(formatter: SvNumberFormatter, key: number): string {
  const entry = formatter.GetEntry(key);
  if (!entry || !(entry.GetType() & T.CURRENCY)) return "";
  const symbol = new OUString();
  const extension = new OUString();
  try {
    if (entry.GetNewCurrencySymbol(symbol, extension)) {
      const value = text(symbol);
      const currency = SvNumberFormatter.GetCurrencyEntry(entry.GetLanguage());
      if (value === text(currency.GetSymbol())) return text(currency.GetBankSymbol());
      return value === "€" ? "EUR" : value;
    }
    return text(SvNumberFormatter.GetCurrencyEntry(entry.GetLanguage()).GetBankSymbol());
  } finally {
    symbol.dispose();
    extension.dispose();
  }
}

/** Writes the value attributes selected from the native format type. @param formatter - Document formats. @param key - Effective cell format. @param value - Numeric cell result. @param nullDate - Workbook serial day zero. @returns ODF attributes. */
export function writeNumberFormatAttributes(
  formatter: SvNumberFormatter,
  key: number,
  value: number,
  nullDate: DateConstReference,
): string {
  const type = formatter.GetType(key) & ~T.DEFINED;
  switch (type) {
    case T.DATE:
    case T.DATETIME:
      return ` office:value-type="date" office:date-value="${SvXMLUnitConverter.convertDaysToDateTime(value, nullDate)}"`;
    case T.TIME:
    case T.DURATION:
      return ` office:value-type="time" office:time-value="${convertDaysToDuration(value)}"`;
    case T.LOGICAL:
      return ` office:value-type="boolean" office:boolean-value="${approxEqual(value, 1) ? "true" : value === 0 ? "false" : doubleToString(value)}"`;
    case T.CURRENCY: {
      const symbol = getCurrencySymbol(formatter, key);
      return ` office:value-type="currency"${symbol ? ` office:currency="${escapeXml(symbol)}"` : ""} office:value="${doubleToString(value)}"`;
    }
    case T.PERCENT:
      return ` office:value-type="percentage" office:value="${doubleToString(value)}"`;
    default:
      return ` office:value-type="float" office:value="${doubleToString(value)}"`;
  }
}

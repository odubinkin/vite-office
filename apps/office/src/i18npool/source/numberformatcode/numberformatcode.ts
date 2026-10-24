/** @fileoverview Original NumberFormatCodeMapper selection,enum conversion and four-entry locale cache over genuine FormatElement/NumberFormatCode values and shared Sequence ownership. Service-manager creation,UNO interface ABI and native mutex scheduling are not represented. */
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  cppu_detail_getUnoType_NumberFormatCode,
  NumberFormatCode,
  type NumberFormatCodeAddress,
} from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import type { FormatElementAddress } from "../../../offapi/com/sun/star/i18n/FormatElement";
import * as Type from "../../../offapi/com/sun/star/i18n/KNumberFormatType";
import * as Usage from "../../../offapi/com/sun/star/i18n/KNumberFormatUsage";
import { getLocaleAllFormats } from "../localedata/localedata";
/** Original compiled Sequence<NumberFormatCode> value specialization. */
const Codes = Sequence.specialize<NumberFormatCodeAddress>(
  cppu_detail_getUnoType_NumberFormatCode,
  40,
);
/** Original private static mapping responsibility;JS primitive text represents its local temporary string value. @param type - Original short selector. @returns Original field text or empty. */
export function mapElementTypeShortToString(type: number): string {
  switch (type) {
    case Type.SHORT:
      return "short";
    case Type.MEDIUM:
      return "medium";
    case Type.LONG:
      return "long";
    default:
      return "";
  }
}
/** Original static exact,case-sensitive type mapping including its SHORT fallback. @param type - Source UTF16 field text. @returns Native short selector. */
export function mapElementTypeStringToShort(type: string): number {
  if (type === "short") return Type.SHORT;
  if (type === "medium") return Type.MEDIUM;
  if (type === "long") return Type.LONG;
  return Type.SHORT;
}
/** Original static usage mapping preserves all eight literal names. @param usage - Original short selector. @returns Source text or empty. */
export function mapElementUsageShortToString(usage: number): string {
  switch (usage) {
    case Usage.DATE:
      return "DATE";
    case Usage.TIME:
      return "TIME";
    case Usage.DATE_TIME:
      return "DATE_TIME";
    case Usage.FIXED_NUMBER:
      return "FIXED_NUMBER";
    case Usage.FRACTION_NUMBER:
      return "FRACTION_NUMBER";
    case Usage.PERCENT_NUMBER:
      return "PERCENT_NUMBER";
    case Usage.CURRENCY:
      return "CURRENCY";
    case Usage.SCIENTIFIC_NUMBER:
      return "SCIENTIFIC_NUMBER";
    default:
      return "";
  }
}
/** Original static usage mapping retains its distinct zero fallback. @param usage - Original UTF16 field text. @returns Native short selector. */
export function mapElementUsageStringToShort(usage: string): number {
  if (usage === "DATE") return Usage.DATE;
  if (usage === "TIME") return Usage.TIME;
  if (usage === "DATE_TIME") return Usage.DATE_TIME;
  if (usage === "FIXED_NUMBER") return Usage.FIXED_NUMBER;
  if (usage === "FRACTION_NUMBER") return Usage.FRACTION_NUMBER;
  if (usage === "PERCENT_NUMBER") return Usage.PERCENT_NUMBER;
  if (usage === "CURRENCY") return Usage.CURRENCY;
  if (usage === "SCIENTIFIC_NUMBER") return Usage.SCIENTIFIC_NUMBER;
  return 0;
}
/** Borrows one actual source string member without acquiring or copying it. @param row - Native compound lvalues. @param offset - Original generated member offset. @returns Borrowed live string. */
function stringField(row: FormatElementAddress, offset: number) {
  return OUString.unacquired(row.get(offset) as rtl_uStringSlot);
}
/** Original std::u16string_view comparison representation preserves UTF16 units. @param row - Actual source row. @param offset - Member offset. @returns Logical field text. */
function fieldText(row: FormatElementAddress, offset: number): string {
  const value = stringField(row, offset);
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}
/** Original member constructor copies real string owners and scalar fields. @param row - Actual FormatElement. @returns Owned return value. */
function codeFrom(row: FormatElementAddress): NumberFormatCode {
  return new NumberFormatCode(
    mapElementTypeStringToShort(fieldText(row, 24)),
    mapElementUsageStringToShort(fieldText(row, 32)),
    stringField(row, 0),
    stringField(row, 8),
    stringField(row, 16),
    (row.get(40) as [number])[0],
    (row.get(42) as [boolean])[0],
  );
}
/** Original containerToSequence copies actual initialized struct values before vector destruction. @param values - Owned native vector elements. @returns Owned Sequence. */
function containerToSequence(values: NumberFormatCode[]): Sequence<NumberFormatCodeAddress> {
  const cells = new Map<number, NumberFormatCodeAddress>();
  try {
    for (let index = 0; index < values.length; ++index)
      cells.set(index * 40, values[index] as NumberFormatCode);
    return new Codes(cells, values.length);
  } finally {
    for (const value of values) value.dispose();
  }
}

/** Original consumed XNumberFormatCode service owner;the actual embedded LocaleData field binding replaces only native service-manager lookup. */
export class NumberFormatCodeMapper {
  private readonly m_aFormatElementCache: [Locale, Sequence<FormatElementAddress>][] = [];
  /** Original default selection checks default,type and usage in source order. @param type - Native short type. @param usage - Native short usage. @param locale - Borrowed original locale. @returns Owned selected value or original all-zero/empty struct. */
  getDefault(type: number, usage: number, locale: LocaleConstReference): NumberFormatCode {
    type = (type << 16) >> 16;
    usage = (usage << 16) >> 16;
    const elementType = mapElementTypeShortToString(type),
      elementUsage = mapElementUsageShortToString(usage),
      formats = this.getFormats(locale);
    for (let index = 0; index < formats.getLength(); ++index) {
      const row = formats.operatorIndex(index);
      if (
        (row.get(42) as [boolean])[0] &&
        fieldText(row, 24) === elementType &&
        fieldText(row, 32) === elementUsage
      )
        return new NumberFormatCode(
          type,
          usage,
          stringField(row, 0),
          stringField(row, 8),
          stringField(row, 16),
          (row.get(40) as [number])[0],
          true,
        );
    }
    return new NumberFormatCode();
  }
  /** Original index lookup does not fall back to a different format code. @param formatIndex - Native short index. @param locale - Original locale. @returns Selected value or original empty struct. */
  getFormatCode(formatIndex: number, locale: LocaleConstReference): NumberFormatCode {
    formatIndex = (formatIndex << 16) >> 16;
    const formats = this.getFormats(locale);
    for (let index = 0; index < formats.getLength(); ++index) {
      const row = formats.operatorIndex(index);
      if ((row.get(40) as [number])[0] === formatIndex) return codeFrom(row);
    }
    return new NumberFormatCode();
  }
  /** Original filtered vector preserves native catalog order and exact usage equality. @param usage - Native short usage. @param locale - Original locale. @returns Owned Sequence of actual struct values. */
  getAllFormatCode(usage: number, locale: LocaleConstReference): Sequence<NumberFormatCodeAddress> {
    usage = (usage << 16) >> 16;
    const formats = this.getFormats(locale),
      values: NumberFormatCode[] = [];
    for (let index = 0; index < formats.getLength(); ++index) {
      const row = formats.operatorIndex(index);
      if (mapElementUsageStringToShort(fieldText(row, 32)) === usage) values.push(codeFrom(row));
    }
    return containerToSequence(values);
  }
  /** Original transform returns every row in both original sections. @param locale - Original locale. @returns Owned Sequence. */
  getAllFormatCodes(locale: LocaleConstReference): Sequence<NumberFormatCodeAddress> {
    const formats = this.getFormats(locale),
      values: NumberFormatCode[] = [];
    for (let index = 0; index < formats.getLength(); ++index)
      values.push(codeFrom(formats.operatorIndex(index)));
    return containerToSequence(values);
  }
  /** Original cache compares complete Locale values and never refreshes hit order;strict size>3 intentionally retains four entries (CALC-271). @param locale - Borrowed query. @returns Borrowed cached sequence. */
  private getFormats(locale: LocaleConstReference): Sequence<FormatElementAddress> {
    for (const [cached, formats] of this.m_aFormatElementCache)
      if (cached.equals(locale)) return formats;
    const formats = getLocaleAllFormats(locale);
    if (this.m_aFormatElementCache.length > 3) {
      const oldest = this.m_aFormatElementCache.shift() as [Locale, Sequence<FormatElementAddress>];
      oldest[1].dispose();
      oldest[0].dispose();
    }
    this.m_aFormatElementCache.push([new Locale(locale), formats]);
    return formats;
  }
  /** Original cache element destruction releases each Sequence before its Locale value. @returns Nothing. */
  dispose(): void {
    for (const [locale, formats] of this.m_aFormatElementCache) {
      formats.dispose();
      locale.dispose();
    }
    this.m_aFormatElementCache.length = 0;
  }
}

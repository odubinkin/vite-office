/** @fileoverview Generated LocaleDataImpl decimal,measurement and transliteration field bindings with original locale-name fallback;no complete UNO service facade is fabricated. */
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { MsLangId } from "../../../i18nlangtag/inc/mslangid";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  decomposeCanonicalLanguageTag,
  getFallbackStrings,
} from "../../../i18nlangtag/source/languagetag/languagetag";
import {
  cppu_detail_getUnoType_FormatElement,
  type FormatElementAddress,
} from "../../../offapi/com/sun/star/i18n/FormatElement";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import calendars from "./data/calendars.json" with { type: "json" };
import currencies from "./data/currencies.json" with { type: "json" };
import dateAcceptancePatterns from "./data/date-acceptance-patterns.json" with { type: "json" };
import dateSeparators from "./data/date-separators.json" with { type: "json" };
import separators from "./data/decimal-separators.json" with { type: "json" };
import languageCountryInfo from "./data/language-country-info.json" with { type: "json" };
import longDateSeparators from "./data/long-date-separators.json" with { type: "json" };
import measurements from "./data/measurement-systems.json" with { type: "json" };
import numberFormats from "./data/number-formats.json" with { type: "json" };
import numeric from "./data/numeric-separators.json" with { type: "json" };
import reservedWords from "./data/reserved-words.json" with { type: "json" };
import timeFields from "./data/time-fields.json" with { type: "json" };
import transliterations from "./data/transliterations.json" with { type: "json" };
/** Original Sequence<OUString> value specialization. */
const Strings = Sequence.specialize<ReturnType<OUString["getDataAddress"]>>("OUString", 8);
/** Original compiled Sequence<FormatElement> specialization over the real generated compound type. */
const Formats = Sequence.specialize<FormatElementAddress>(cppu_detail_getUnoType_FormatElement, 48);
/** Actual ordered LC_TRANSLITERATION resources,including source ref resolution. */
const transliterationResources = new Map<string, readonly string[]>(
  Object.entries(transliterations),
);
/** Original FormatElement scalar payload projected from actual generated locale arrays. */
export interface LocaleFormatElement {
  formatCode: string;
  formatName: string;
  formatKey: string;
  formatType: string;
  formatUsage: string;
  formatIndex: number;
  isDefault: boolean;
}
/** Source-generated LC_FORMAT and LC_FORMAT_1 fields in native order. */
const numberFormatResources = new Map<string, readonly LocaleFormatElement[]>(
  Object.entries(numberFormats),
);
/** Original default LC_CALENDAR name arrays with generated section refs resolved. */
const calendarResources = new Map<string, readonly LocaleCalendarData[]>(Object.entries(calendars));
/** Original generated getDateAcceptancePatterns_ arrays in source order. */
const dateAcceptanceResources = new Map<string, readonly string[]>(
  Object.entries(dateAcceptancePatterns),
);
/** Original source-ordered LC_CURRENCY rows after generated section references. */
const currencyResources = new Map<string, readonly LocaleCurrency[]>(Object.entries(currencies));
/** Native LC_CTYPE separators used in long-date input and format matching. */
const longDateResources = new Map<string, LocaleLongDateSeparators>(
  Object.entries(longDateSeparators),
);
/** Original generated LocaleDataItem2 long-date separator fields. */
export interface LocaleLongDateSeparators {
  readonly dayOfWeek: string;
  readonly day: string;
  readonly month: string;
}
/** Original Currency2 fields consumed by the locale wrapper and number-format currency table. */
export interface LocaleCurrency {
  readonly id: string;
  readonly symbol: string;
  readonly bankSymbol: string;
  readonly name: string;
  readonly decimalPlaces: number;
  readonly default: boolean;
  readonly usedInCompatibleFormatCodes: boolean;
  readonly legacyOnly: boolean;
}
/** CalendarItem2 name fields consumed by CalendarWrapper and number input scanning. */
export interface LocaleCalendarItem {
  readonly full: string;
  readonly abbreviated: string;
}
/** Ordered source default-calendar name sections; alternate calendars remain separate. */
export interface LocaleCalendarItems {
  readonly id: string;
  readonly months: readonly LocaleCalendarItem[];
  readonly genitiveMonths: readonly LocaleCalendarItem[];
  readonly partitiveMonths: readonly LocaleCalendarItem[];
  readonly days: readonly LocaleCalendarItem[];
}
/** Original CalendarItem2 scalar fields decoded from generated locale resources. */
export interface LocaleCalendarItemData extends LocaleCalendarItem {
  readonly id: string;
  readonly narrow: string;
}
/** Original Calendar2 resource fields in source calendar order; service owners copy scalar state before mutation. */
export interface LocaleCalendarData {
  readonly id: string;
  readonly isDefault: boolean;
  readonly startOfWeek: string;
  readonly minimumDays: number;
  readonly days: readonly LocaleCalendarItemData[];
  readonly months: readonly LocaleCalendarItemData[];
  readonly genitiveMonths: readonly LocaleCalendarItemData[];
  readonly partitiveMonths: readonly LocaleCalendarItemData[];
  readonly eras: readonly LocaleCalendarItemData[];
}
/** Actual embedded decimal resource values;no current Intl data is substituted. */
const resources = new Map<string, string>(Object.entries(separators));
/** Original LC_CTYPE measurement resource values. */
const measurementResources = new Map<string, string>(Object.entries(measurements));
/** Uses the real native language-only fallback owner instead of a second projected lookup table. @param name - Prepared service language. @returns Source service name. */
function fallbackServiceName(name: string): string {
  const query = new Locale(),
    language = unicode(name);
  query.Language = language;
  language.dispose();
  try {
    const locale = MsLangId.getFallbackLocale(query);
    try {
      return text(locale.Language) === "qlt"
        ? text(locale.Variant).replaceAll("-", "_")
        : text(locale.Language) + (text(locale.Country) ? "_" + text(locale.Country) : "");
    } finally {
      locale.dispose();
    }
  } finally {
    query.dispose();
  }
}
/** Original lookup-table exact or language-only fallback over the selected generated resource field. @param name - Locale service name. @param values - Source field table. @returns Selected field resource, absent when the native service would not be found. */
function lookup<T>(name: string, values: ReadonlyMap<string, T>): T | undefined {
  return (
    values.get(name) ?? (!name.includes("_") ? values.get(fallbackServiceName(name)) : undefined)
  );
}
/** Prepared-locale generated-field query with actual Locale value input. This is a field-specific browser resource binding, not an implementation of the whole LocaleData service. @param locale - Native locale triplet. @param values - Source field table. @returns Original field value. */
function getLocaleDataField<T>(locale: LocaleConstReference, values: ReadonlyMap<string, T>): T {
  const language = text(locale.Language),
    country = text(locale.Country),
    variant = text(locale.Variant);
  const first =
    language === "qlt" ? variant.replaceAll("-", "_") : language + (country ? "_" + country : "");
  const direct = lookup(first, values);
  if (direct !== undefined) return direct;
  if (language === "qlt") {
    for (const candidate of getFallbackStrings(decomposeCanonicalLanguageTag(variant))) {
      const value = lookup(candidate.replaceAll("-", "_"), values);
      if (value !== undefined) return value;
    }
  } else if (country) {
    const value = lookup(language, values);
    if (value !== undefined) return value;
  }
  return values.get("en_US") as T;
}

/** Original LC_INFO fields projected from LCInfoNode/getLanguageCountryInfo;this is not a fabricated UNO LanguageCountryInfo value/ABI. */
export interface LocaleLanguageCountryInfo {
  Language: string;
  LanguageDefaultName: string;
  Country: string;
  CountryDefaultName: string;
  Variant: string;
}
/** Original five ordered LC_INFO fields for all registered locale services. */
const languageCountryResources = new Map<string, LocaleLanguageCountryInfo>(
  Object.entries(languageCountryInfo),
);
/** Source-generated original LC_CTYPE DateSeparator after native ref resolution. */
const dateResources = new Map<string, string>(Object.entries(dateSeparators));
/** Actual referenced LC_CTYPE time fields in native registered-locale order. */
const timeResources = new Map<
  string,
  { timeSeparator: string; time100SecSeparator: string; timeAM: string; timePM: string }
>(Object.entries(timeFields));
/** Generated LC_MISC TRUE_WORD/FALSE_WORD fields after native ref and missing-field fallback. */
const reservedResources = new Map<string, { trueWord: string; falseWord: string }>(
  Object.entries(reservedWords),
);
/** Actual loaded LC_INFO fields use the same native service resolution as other fields;the caller receives its own value projection. @param locale - Original requested locale. @returns Loaded locale identity fields. */
export function getLocaleLanguageCountryInfo(
  locale: LocaleConstReference,
): LocaleLanguageCountryInfo {
  return { ...getLocaleDataField(locale, languageCountryResources) };
}
/** Returns source-ordered default-calendar names using the native locale service fallback. @param locale - Requested locale. @returns Pinned LC_CALENDAR name sections. */
export function getLocaleCalendarItems(locale: LocaleConstReference): LocaleCalendarItems {
  const source = getLocaleCalendars(locale).find(
    /** Original default-calendar selection. @param calendar - Source row. @returns Default flag. */
    (calendar) => calendar.isDefault,
  ) as LocaleCalendarData;
  return {
    id: source.id,
    months: source.months.map(
      /** Computes the item result. @param item - Item. @returns The computed result. */ (
        item,
      ) => ({ full: item.full, abbreviated: item.abbreviated }),
    ),
    genitiveMonths: source.genitiveMonths.map(
      /** Computes the item result. @param item - Item. @returns The computed result. */ (
        item,
      ) => ({ full: item.full, abbreviated: item.abbreviated }),
    ),
    partitiveMonths: source.partitiveMonths.map(
      /** Computes the item result. @param item - Item. @returns The computed result. */ (
        item,
      ) => ({ full: item.full, abbreviated: item.abbreviated }),
    ),
    days: source.days.map(
      /** Computes the item result. @param item - Item. @returns The computed result. */ (
        item,
      ) => ({ full: item.full, abbreviated: item.abbreviated }),
    ),
  };
}
/** Original getAllCalendars2 resource lookup through the existing locale-service fallback. Arrays and rows are immutable decoded input for the actual calendar service. @param locale - Requested locale. @returns Ordered source calendar data. */
export function getLocaleCalendars(locale: LocaleConstReference): readonly LocaleCalendarData[] {
  return getLocaleDataField(locale, calendarResources);
}
/** Original generated date acceptance patterns, including those derived from the edit format. @param locale - Requested locale. @returns Independent ordered pattern values. */
export function getLocaleDateAcceptancePatterns(locale: LocaleConstReference): string[] {
  return [...getLocaleDataField(locale, dateAcceptanceResources)];
}
/** Original getAllCurrencies source order and locale-service fallback, with independently owned value rows. @param locale - Requested locale. @returns Currency2 scalar rows. */
export function getLocaleCurrencies(locale: LocaleConstReference): LocaleCurrency[] {
  return getLocaleDataField(locale, currencyResources).map(
    /** Computes the row result. @param row - Row. @returns The computed result. */ (row) => ({
      ...row,
    }),
  );
}
/** Original getLocaleItem2 long-date fields, resolved through the same locale service/ref chain. @param locale - Requested locale. @returns Independent scalar fields. */
export function getLocaleLongDateSeparators(
  locale: LocaleConstReference,
): LocaleLongDateSeparators {
  return { ...getLocaleDataField(locale, longDateResources) };
}
/** Original installed-locale enumeration follows aLibTable, not sorted LC_INFO keys. Every caller owns its returned Locale values. @returns Source-ordered installed locales. */
export function getAllInstalledLocaleNames(): Locale[] {
  return Object.keys(currencies).map(
    /** Computes the name result. @param name - Name. @returns The computed result. */ (name) => {
      const info = languageCountryResources.get(name);
      if (!info) throw new Error(`Pinned locale identity is absent: ${name}`);
      const language = unicode(info.Language),
        country = unicode(info.Country),
        variant = unicode(info.Variant);
      try {
        return new Locale(language, country, variant);
      } finally {
        variant.dispose();
        country.dispose();
        language.dispose();
      }
    },
  );
}
/** Original date-separator field with the same locale/ref fallback. @param locale - Requested locale. @returns Source date separator. */
export function getLocaleDateSeparator(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, dateResources);
}
/** Original LocaleDataItem2 hundredth-second separator from generated LC_CTYPE. @param locale - Requested locale. @returns Source field. */
export function getLocaleTime100SecSeparator(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, timeResources).time100SecSeparator;
}
/** Original LocaleDataItem2 time separator from generated LC_CTYPE. @param locale - Requested locale. @returns Source field. */
export function getLocaleTimeSeparator(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, timeResources).timeSeparator;
}
/** Original locale AM token from generated LC_CTYPE. @param locale - Requested locale. @returns Source field. */
export function getLocaleTimeAM(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, timeResources).timeAM;
}
/** Original locale PM token from generated LC_CTYPE. @param locale - Requested locale. @returns Source field. */
export function getLocaleTimePM(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, timeResources).timePM;
}
/** Original reservedWords TRUE_WORD slot. @param locale - Requested locale. @returns Loaded native word. */
export function getLocaleTrueWord(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, reservedResources).trueWord;
}
/** Original reservedWords FALSE_WORD slot. @param locale - Requested locale. @returns Loaded native word. */
export function getLocaleFalseWord(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, reservedResources).falseWord;
}

/** Original decimal field through shared locale-name fallback resolution. @param locale - Prepared locale. @returns Separator. */
export function getLocaleDecimalSeparator(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, resources);
}
/** Original getAllFormats field projection over the same native locale resolver;each call returns independent value rows,without a whole UNO service facade. @param locale - Prepared native locale. @returns Both original format sections with generated ref/currency replacements. */
export function getLocaleFormatElements(locale: LocaleConstReference): LocaleFormatElement[] {
  return getLocaleDataField(locale, numberFormatResources).map(
    /** Copies the native value record. @param row - Embedded source fields. @returns Independent value. */ (
      row,
    ) => ({ ...row }),
  );
}
/** Original getAllFormats value transport over the same generated fields. Actual shared compound construction owns all five strings;temporary source values are released after Sequence copies them. @param locale - Original queried locale. @returns Owned original FormatElement sequence. */
export function getLocaleAllFormats(locale: LocaleConstReference): Sequence<FormatElementAddress> {
  const rows = getLocaleDataField(locale, numberFormatResources),
    values: OUString[] = [],
    elements = new Map<number, FormatElementAddress>();
  try {
    for (let index = 0; index < rows.length; ++index) {
      const row = rows[index] as LocaleFormatElement,
        fields = new Map<number, unknown>();
      for (const [offset, text] of [
        [0, row.formatCode],
        [8, row.formatName],
        [16, row.formatKey],
        [24, row.formatType],
        [32, row.formatUsage],
      ] as const) {
        const value = unicode(text);
        values.push(value);
        fields.set(offset, value.getDataAddress());
      }
      fields.set(40, [(row.formatIndex << 16) >> 16]);
      fields.set(42, [row.isDefault]);
      elements.set(index * 48, fields);
    }
    return new Formats(elements, rows.length);
  } finally {
    for (let index = values.length - 1; index >= 0; --index) (values[index] as OUString).dispose();
  }
}
/** Original MeasurementSystem field through the same locale-name fallback resolution. @param locale - Prepared locale. @returns Source field text. */
export function getLocaleMeasurementSystem(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, measurementResources);
}

/** Original decimalSeparatorAlternative field through shared native lookup. @param locale - Prepared locale. @returns Alternate separator. */
export function getLocaleDecimalSeparatorAlternate(locale: LocaleConstReference): string {
  return getLocaleDataField(
    locale,
    new Map(
      Object.entries(numeric).map(
        /** Reads actual alternate field. @param entry - Resource. @returns Field. */ ([
          name,
          value,
        ]) => [name, value.alternate],
      ),
    ),
  );
}
/** Original thousandSeparator field through shared native lookup. @param locale - Prepared locale. @returns Group separator. */
export function getLocaleThousandSeparator(locale: LocaleConstReference): string {
  return getLocaleDataField(
    locale,
    new Map(
      Object.entries(numeric).map(
        /** Reads actual grouping field. @param entry - Resource. @returns Field. */ ([
          name,
          value,
        ]) => [name, value.thousand],
      ),
    ),
  );
}

/** Original getTransliterations field resource binding with native fallback and real Sequence string values;not a whole LocaleData service facade. @param locale - Prepared native locale. @returns Owned ordered module-name sequence. */
export function getLocaleTransliterations(
  locale: LocaleConstReference,
): Sequence<ReturnType<OUString["getDataAddress"]>> {
  const names = getLocaleDataField(locale, transliterationResources);
  const values: OUString[] = [],
    cells = new Map<number, ReturnType<OUString["getDataAddress"]>>();
  try {
    for (let i = 0; i < names.length; i++) {
      const value = unicode(names[i] as string);
      values.push(value);
      cells.set(i * 8, value.getDataAddress());
    }
    return new Strings(cells, names.length);
  } finally {
    for (const value of values) value.dispose();
  }
}

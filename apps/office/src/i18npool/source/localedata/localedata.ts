/** @fileoverview Generated LocaleDataImpl decimal,measurement and transliteration field bindings with original locale-name fallback;no complete UNO service facade is fabricated. */
import transliterations from "./data/transliterations.json" with { type: "json" };
import languageCountryInfo from "./data/language-country-info.json" with { type: "json" };
import dateSeparators from "./data/date-separators.json" with { type: "json" };
import numberFormats from "./data/number-formats.json" with { type: "json" };
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import numeric from "./data/numeric-separators.json" with { type: "json" };
import separators from "./data/decimal-separators.json" with { type: "json" };
import measurements from "./data/measurement-systems.json" with { type: "json" };
import { MsLangId } from "../../../i18nlangtag/inc/mslangid";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  cppu_detail_getUnoType_FormatElement,
  type FormatElementAddress,
} from "../../../offapi/com/sun/star/i18n/FormatElement";
import {
  getFallbackStrings,
  decomposeCanonicalLanguageTag,
} from "../../../i18nlangtag/source/languagetag/languagetag";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
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
/** Extracts the native string units, excluding OUString's logical trailing terminator. @param value - Shared string reference. @returns JS text. */
function text(value: LocaleConstReference["Language"]): string {
  return String.fromCharCode(...value.getStr().slice(0, value.getLength()));
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
/** Actual loaded LC_INFO fields use the same native service resolution as other fields;the caller receives its own value projection. @param locale - Original requested locale. @returns Loaded locale identity fields. */
export function getLocaleLanguageCountryInfo(
  locale: LocaleConstReference,
): LocaleLanguageCountryInfo {
  return { ...getLocaleDataField(locale, languageCountryResources) };
}
/** Original date-separator field with the same locale/ref fallback. @param locale - Requested locale. @returns Source date separator. */
export function getLocaleDateSeparator(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, dateResources);
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

/** @fileoverview Browser resource binding for the actual LocaleDataImpl numeric decimal field, preserving source first-name/language/default fallback and qlt fallback order. No UNO service facade is fabricated. */
import numeric from "./data/numeric-separators.json" with { type: "json" };
import separators from "./data/decimal-separators.json" with { type: "json" };
import measurements from "./data/measurement-systems.json" with { type: "json" };
import { MsLangId } from "../../../i18nlangtag/inc/mslangid";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  getFallbackStrings,
  decomposeCanonicalLanguageTag,
} from "../../../i18nlangtag/source/languagetag/languagetag";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
/** Actual embedded source resource values; no current Intl decimal data is substituted. */
const resources = new Map<string, string>(Object.entries(separators));
/** Original LC_CTYPE measurement resource values. */
const measurementResources = new Map<string, string>(Object.entries(measurements));
/** Uses the real native language-only fallback owner instead of a second projected lookup table. @param name - Prepared service language. @returns Source service name. */
function fallbackServiceName(name: string): string {
  const locale = MsLangId.getFallbackLocale(
    new Locale(unicode(name), new OUString(), new OUString()),
  );
  return text(locale.Language) === "qlt"
    ? text(locale.Variant).replaceAll("-", "_")
    : text(locale.Language) + (text(locale.Country) ? "_" + text(locale.Country) : "");
}
/** Original lookup-table exact or language-only fallback. @param name - Locale service name. @param values - Source field table. @returns Decimal resource, absent when the native service would not be found. */
function lookup(name: string, values: ReadonlyMap<string, string>): string | undefined {
  return (
    values.get(name) ?? (!name.includes("_") ? values.get(fallbackServiceName(name)) : undefined)
  );
}
/** Extracts the native string units, excluding OUString's logical trailing terminator. @param value - Shared string reference. @returns JS text. */
function text(value: LocaleConstReference["Language"]): string {
  return String.fromCharCode(...value.getStr().slice(0, value.getLength()));
}
/** Prepared-locale decimalSeparator field query with actual Locale value input. This is a field-specific browser resource binding, not an implementation of the whole LocaleData service. @param locale - Native locale triplet. @param values - Source field table. @returns Original decimal separator. */
function getLocaleDataField(
  locale: LocaleConstReference,
  values: ReadonlyMap<string, string>,
): string {
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
  return values.get("en_US") as string;
}

/** Original decimal field through shared locale-name fallback resolution. @param locale - Prepared locale. @returns Separator. */
export function getLocaleDecimalSeparator(locale: LocaleConstReference): string {
  return getLocaleDataField(locale, resources);
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

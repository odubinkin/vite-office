/** @fileoverview Browser resource binding for the actual LocaleDataImpl numeric decimal field, preserving source first-name/language/default fallback and qlt fallback order. No UNO service facade is fabricated. */
import separators from "./data/decimal-separators.json" with { type: "json" };
import measurements from "./data/measurement-systems.json" with { type: "json" };
import languageFallbacks from "../../../i18nlangtag/source/isolang/locale-fallbacks.json" with { type: "json" };
import {
  getFallbackStrings,
  decomposeCanonicalLanguageTag,
} from "../../../i18nlangtag/source/languagetag/languagetag";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
/** Actual embedded source resource values; no current Intl decimal data is substituted. */
const resources = new Map<string, string>(Object.entries(separators));
/** Source-projected language-only lookup results, including original language-ID overrides. */
const measurementResources = new Map<string, string>(Object.entries(measurements));
const defaults = new Map<string, string>(Object.entries(languageFallbacks));
/** Original lookup-table exact or language-only fallback. @param name - Locale service name. @param values - Source field table. @returns Decimal resource, absent when the native service would not be found. */
function lookup(name: string, values: ReadonlyMap<string, string>): string | undefined {
  return (
    values.get(name) ??
    (!name.includes("_")
      ? values.get(
          defaults.get(
            name.replace(
              /[A-Z]/g,
              /** Original ASCII-only case conversion. @param unit - Uppercase ASCII unit. @returns Lowercase ASCII. */ (
                unit,
              ) => unit.toLowerCase(),
            ),
          ) ?? "en_US",
        )
      : undefined)
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

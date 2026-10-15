/** @fileoverview Browser resource binding for the actual LocaleDataImpl numeric decimal field, preserving source first-name/language/default fallback and qlt fallback order. No UNO service facade is fabricated. */
import separators from "./data/decimal-separators.json" with { type: "json" };
import languageFallbacks from "../../../i18nlangtag/source/isolang/locale-fallbacks.json" with { type: "json" };
import { getFallbackStrings } from "../../../i18nlangtag/source/languagetag/languagetag";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
/** Actual embedded source resource values; no current Intl decimal data is substituted. */
const resources = new Map<string, string>(Object.entries(separators));
/** Source-projected language-only lookup results, including original language-ID overrides. */
const defaults = new Map<string, string>(Object.entries(languageFallbacks));
/** Original lookup-table exact or language-only fallback. @param name - Locale service name. @returns Decimal resource, absent when the native service would not be found. */
function lookup(name: string): string | undefined {
  return (
    resources.get(name) ??
    (!name.includes("_")
      ? resources.get(
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
/** Prepared-locale decimalSeparator field query with actual Locale value input. This is a field-specific browser resource binding, not an implementation of the whole LocaleData service. @param locale - Native locale triplet. @returns Original decimal separator. */
export function getLocaleDecimalSeparator(locale: LocaleConstReference): string {
  const language = text(locale.Language),
    country = text(locale.Country),
    variant = text(locale.Variant);
  const first =
    language === "qlt" ? variant.replaceAll("-", "_") : language + (country ? "_" + country : "");
  const direct = lookup(first);
  if (direct !== undefined) return direct;
  if (language === "qlt") {
    const parts = variant.split("-"),
      lang = parts.shift() as string;
    const script = /^[A-Za-z]{4}$/.test(parts[0] ?? "") ? (parts.shift() as string) : "";
    const region =
      parts[0] && /^(?:[A-Z]{2}|[0-9]{3})$/.test(parts[0]) ? (parts.shift() as string) : "";
    const extension = parts.findIndex(
      /** Original extension boundary after variants. @param part - Subtag. @returns Singleton flag. */ (
        part,
      ) => part.length === 1,
    );
    const variants = (extension < 0 ? parts : parts.slice(0, extension)).join("-");
    for (const candidate of getFallbackStrings({
      tag: variant,
      language: lang,
      country: region,
      script,
      variants,
    })) {
      const value = lookup(candidate.replaceAll("-", "_"));
      if (value !== undefined) return value;
    }
  } else if (country) {
    const value = lookup(language);
    if (value !== undefined) return value;
  }
  return separators.en_US;
}

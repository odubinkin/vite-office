/** @fileoverview Native ODF locale attribute merging and output from chrlohdl.cxx. */
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import type { LanguageType } from "../../../i18nlangtag/inc/lang";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";

/** Locale member selected by the four source XML property handlers. */
export type LocaleAttribute = "tag" | "language" | "script" | "country";

/** One source locale Any accumulates the fields in XML attribute order. */
export class XMLCharLocale {
  private language = "";
  private country = "";
  private variant = "";

  /** Merges the native locale field and preserves a full tag over decomposed attributes. @param field - Source property kind. @param value - XML attribute value. @returns Nothing. */
  importXML(field: LocaleAttribute, value: string): void {
    if (value === "none") return;
    if (field === "language") {
      if (!this.variant) this.language = value;
      else if (!this.language && this.variant.startsWith("-")) {
        this.variant = value + this.variant + (this.country ? "-" + this.country : "");
        this.language = "qlt";
      }
    } else if (field === "script") {
      if (this.variant) return;
      this.variant = this.language + "-" + value;
      if (this.language) {
        if (this.country) this.variant += "-" + this.country;
        this.language = "qlt";
      }
    } else if (field === "country") {
      if (this.country) return;
      this.country = value;
      if (this.variant.length >= 7 && this.language === "qlt") {
        const separator = this.variant.indexOf("-");
        if (separator >= 2 && this.variant.indexOf("-", separator + 1) < 0)
          this.variant += "-" + value;
      }
    } else this.importTag(value);
  }

  /** Keeps the upstream fallback for short RFC language tags and prior locale fields. @param value - RFC language tag. @returns Nothing. */
  private importTag(value: string): void {
    if (value.length >= 7) {
      this.variant = value;
      this.language = "qlt";
      return;
    }
    if (!value || this.language === "qlt") return;
    const separator = value.indexOf("-");
    const language =
      separator >= 2 && separator <= 3
        ? value.slice(0, separator)
        : separator < 0 && value.length >= 2 && value.length <= 3
          ? value
          : "";
    const country = language && language.length + 3 === value.length ? value.slice(-2) : "";
    if ((language && language !== this.language) || (country && country !== this.country)) {
      this.language ||= language;
      this.country ||= country;
      if (language === this.language && country === this.country) return;
    } else if (language || country) return;
    this.variant = value;
    this.language = "qlt";
  }

  /** Converts the combined UNO locale through the source language registry. @returns Native language identity. */
  getLanguageType(): LanguageType {
    const locale = new Locale();
    const language = unicode(this.language);
    const country = unicode(this.country);
    const variant = unicode(this.variant);
    try {
      locale.Language.assign(language);
      locale.Country.assign(country);
      locale.Variant.assign(variant);
      return LanguageTag.convertToLanguageType(locale, false);
    } finally {
      variant.dispose();
      country.dispose();
      language.dispose();
      locale.dispose();
    }
  }
}

/** Exports the ODF 1.2+ source locale fields; extended tags retain their full variant and ISO components where defined. @param languageType - Native item language. @returns Fields admitted by the original handlers. */
export function exportCharLocale(
  languageType: LanguageType,
): Partial<Record<LocaleAttribute, string>> {
  const locale = LanguageTag.convertToLocale(languageType, false);
  try {
    if (locale.Variant.isEmpty())
      return { language: text(locale.Language) || "none", country: text(locale.Country) || "none" };
    const language = new OUString(),
      script = new OUString(),
      country = new OUString();
    try {
      new LanguageTag(locale).getIsoLanguageScriptCountry(language, script, country);
      const result: Partial<Record<LocaleAttribute, string>> = { tag: text(locale.Variant) };
      if (!language.isEmpty()) {
        result.language = text(language);
        if (!script.isEmpty()) result.script = text(script);
      }
      if (!country.isEmpty()) result.country = text(country);
      return result;
    } finally {
      country.dispose();
      script.dispose();
      language.dispose();
    }
  } finally {
    locale.dispose();
  }
}

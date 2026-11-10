/** @fileoverview Original complete LanguageTag::getFallbackStrings ISO branch and original non-ISO candidate kernel, retaining required original constructor binding. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { text } from "../isolang/isolang.tables";
import { getNonIsoFallbackCandidates } from "./languagetag";

/** Original consumed public member surface, not a replacement LanguageTag implementation. */
export interface LanguageTagFallbackOwner {
  /** Original language getter. @returns Owned value. */
  getLanguage(): OUString;
  /** Original country getter. @returns Owned value. */
  getCountry(): OUString;
  /** Original ISO decision. @returns Source predicate. */
  isIsoLocale(): boolean;
  /** Original BCP47 getter. @returns Borrowed field. */
  getBcp47(): OUStringConstReference;
  /** Original variants getter. @returns Owned value. */
  getVariants(): OUString;
  /** Original script predicate. @returns Source predicate. */
  hasScript(): boolean;
  /** Original script getter. @returns Owned value. */
  getScript(): OUString;
}

/** Original source temporary used by the Catalan legacy branch and the known-set initializer. */
export interface LanguageTagFallbackValue {
  /** Original public member. @param includeFull - Include original complete tag. @returns Ordered candidates. */
  getFallbackStrings(includeFull: boolean): readonly string[];
  /** Binding for original temporary destruction. @returns Nothing. */
  dispose(): void;
}

/** Original BCP47 constructor dependency, only used in the exact ca-XV branch. */
export type LanguageTagStringFactory = (tag: string) => LanguageTagFallbackValue;

/** Original complete fallback member over genuine getter/ISO decisions. Values use logical strings for native vector elements. @param this - Original public owner members. @param includeFull - Original source flag. @param createTag - Original string constructor binding, never a guessed substitute. @returns Ordered candidates with original duplicates and special cases. */
export function getFallbackStrings(
  this: LanguageTagFallbackOwner,
  includeFull: boolean,
  createTag: LanguageTagStringFactory,
): string[] {
  const languageValue = this.getLanguage();
  try {
    const countryValue = this.getCountry();
    try {
      const language = text(languageValue),
        country = text(countryValue),
        result: string[] = [];
      if (this.isIsoLocale()) {
        if (country.length !== 0) {
          if (includeFull) result.push(language + "-" + country);
          if (language === "zh") {
            if (country === "HK" || country === "MO") result.push(language + "-TW");
            else if (country !== "CN") result.push(language + "-CN");
            result.push(language);
          } else if (language === "sh") {
            result.push("sr-Latn-" + country, "sr-Latn", "sh", "sr-" + country, "sr");
          } else if (language === "ca" && country === "XV") {
            const replacement = createTag("ca-ES-valencia");
            let fallbacks: readonly string[];
            try {
              fallbacks = replacement.getFallbackStrings(true);
            } finally {
              replacement.dispose();
            }
            // Original temporary ends before inserting the returned vector.
            result.push(...fallbacks);
          } else if (language === "ku") {
            if (country === "TR" || country === "SY")
              result.push("kmr-Latn-" + country, "kmr-" + country, "kmr-Latn", "kmr", language);
            else if (country === "IQ" || country === "IR") result.push("ckb-" + country, "ckb");
          } else if (language === "kmr" && (country === "TR" || country === "SY")) {
            result.push("ku-Latn-" + country, "ku-" + country, language, "ku");
          } else if (language === "ckb" && (country === "IQ" || country === "IR")) {
            result.push("ku-Arab-" + country, "ku-" + country, language);
          } else result.push(language);
        } else {
          if (includeFull) result.push(language);
          if (language === "sh") result.push("sr-Latn", "sr");
          else if (language === "pli") result.push("pi-Latn", "pi");
        }
        return result;
      }
      const bcp47 = this.getBcp47();
      if (includeFull) result.push(text(bcp47));
      if (text(bcp47) === "en-GB-oed") result.push("en-GB-oxendict");
      else if (text(bcp47) === "en-GB-oxendict") result.push("en-GB-oed");
      const variants = this.getVariants();
      try {
        let script = "";
        if (this.hasScript()) {
          const value = this.getScript();
          try {
            script = text(value);
          } finally {
            value.dispose();
          }
        }
        result.push(
          ...getNonIsoFallbackCandidates({
            tag: text(bcp47),
            language,
            country,
            script,
            variants: text(variants),
          }),
        );
        return result;
      } finally {
        variants.dispose();
      }
    } finally {
      countryValue.dispose();
    }
  } finally {
    languageValue.dispose();
  }
}

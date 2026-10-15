/** @fileoverview Original non-ISO LanguageTag::getFallbackStrings order over already decomposed language-tag values; canonicalization and parsing remain separate responsibilities. */
/** Original field values read by the fallback algorithm, after language-tag parsing. */
export interface LanguageTagFallbackFields {
  readonly tag: string;
  readonly language: string;
  readonly country: string;
  readonly script: string;
  readonly variants: string;
}
/** Original non-ISO branch used by LocaleDataImpl for qlt locales; the caller already tried the full service name. The source spelling krm is deliberately preserved. @param fields - Original parsed fields. @returns Ordered fallbacks without the full tag. */
export function getFallbackStrings(fields: LanguageTagFallbackFields): string[] {
  const { tag, language, country, script, variants } = fields,
    result: string[] = [];
  if (tag === "en-GB-oed") result.push("en-GB-oxendict");
  else if (tag === "en-GB-oxendict") result.push("en-GB-oed");
  /** Appends a synthesized candidate only when different from the original tag. @param candidate - Candidate. @returns Nothing. */
  const append =
    /** Appends an original fallback distinct from the full tag. @param candidate - Candidate. @returns Nothing. */ (
      candidate: string,
    ): void => {
      if (candidate !== tag) result.push(candidate);
    };
  if (script) {
    let haveLanguageScriptVariant = false;
    if (country) {
      if (variants) {
        append(language + "-" + script + "-" + country + "-" + variants);
        append(language + "-" + script + "-" + variants);
        haveLanguageScriptVariant = true;
      }
      append(language + "-" + script + "-" + country);
      if (language === "sr" && script === "Latn") {
        if (country === "CS") result.push("sr-Latn-YU", "sh-CS", "sh-YU");
        else result.push("sh-" + country);
      } else if (language === "pi" && script === "Latn") result.push("pli");
      else if (language === "krm" && script === "Latn" && (country === "TR" || country === "SY"))
        result.push("ku-" + country);
    }
    if (variants && !haveLanguageScriptVariant) append(language + "-" + script + "-" + variants);
    append(language + "-" + script);
    if (language === "sr" && script === "Latn") result.push("sh");
    else if (language === "ku" && script === "Arab") result.push("ckb");
    else if (language === "krm" && script === "Latn" && !country) result.push("ku");
  }
  let haveLanguageVariant = false;
  const validVariant =
    variants.length >= 5 ||
    (variants.length === 4 && variants.charAt(0) >= "0" && variants.charAt(0) <= "9");
  if (country) {
    if (variants) {
      append(language + "-" + country + "-" + variants);
      if (tag === "ca-ES-valencia") result.push("ca-XV");
      if (validVariant) {
        append(language + "-" + variants);
        haveLanguageVariant = true;
      }
    }
    append(language + "-" + country);
  }
  if (variants && !haveLanguageVariant && validVariant) append(language + "-" + variants);
  if (country && language === "sr" && country === "CS") result.push("sr-YU");
  if (language && language !== tag) result.push(language);
  return result;
}

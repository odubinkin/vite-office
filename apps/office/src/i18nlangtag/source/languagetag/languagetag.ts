/** @fileoverview Original non-ISO LanguageTag::getFallbackStrings order over already decomposed language-tag values; canonicalization remains separate; general prepared canonical-tag fields use actual liblangtag parsing/getters, while the enclosing LanguageTag value service remains separate. */
import { isIsoCountry } from "./languagetag.fields";
import { unicode } from "../isolang/isolang.tables";
import { Extraction, simpleExtract } from "./languagetag.extract";
import {
  lt_tag_new,
  lt_tag_get_language,
  lt_tag_get_script,
  lt_tag_get_region,
  lt_tag_get_variants,
} from "../../../external/liblangtag/liblangtag/lt-tag";
import { lt_tag_parse } from "../../../external/liblangtag/liblangtag/lt-tag.parse";
import { lt_lang_get_tag } from "../../../external/liblangtag/liblangtag/lt-lang";
import { lt_script_get_tag } from "../../../external/liblangtag/liblangtag/lt-script";
import { lt_region_get_tag } from "../../../external/liblangtag/liblangtag/lt-region";
import { lt_variant_get_tag } from "../../../external/liblangtag/liblangtag/lt-variant";
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
  const result: string[] = [];
  if (fields.tag === "en-GB-oed") result.push("en-GB-oxendict");
  else if (fields.tag === "en-GB-oxendict") result.push("en-GB-oed");
  result.push(...getNonIsoFallbackCandidates(fields));
  return result;
}

/** Original non-ISO component candidate group after the deprecated-tag prefix, allowing the full member to retain original getter/prefix order. @param fields - Actual source field snapshots. @returns Ordered component candidates. */
export function getNonIsoFallbackCandidates(fields: LanguageTagFallbackFields): string[] {
  const { tag, language, country, script, variants } = fields,
    result: string[] = [];
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

/** Uses native simple/cached fields and empty private-tag fields for already canonical BCP47 values. Other shapes now use actual liblangtag parser/getter contracts, without a second string-splitting grammar; this prepared canonical-input binding does not implement the enclosing LanguageTag constructor/canonicalization/registration service. @param tag - Canonical value from a native qlt Locale variant. @returns Fields consumed by getFallbackStrings. */
export function decomposeCanonicalLanguageTag(tag: string): LanguageTagFallbackFields {
  const fields = { language: "", script: "", country: "", region: "", variants: "" },
    extraction = simpleExtract(tag, fields);
  if (
    extraction === Extraction.EXTRACTED_LSC ||
    extraction === Extraction.EXTRACTED_LV ||
    extraction === Extraction.EXTRACTED_LR ||
    extraction === Extraction.EXTRACTED_X ||
    extraction === Extraction.EXTRACTED_X_JOKER
  )
    return {
      tag,
      language: fields.language,
      script: fields.script,
      country: fields.country,
      variants: fields.variants,
    };
  const parsed = lt_tag_new();
  // Original component getters read the actual parsed owner, including a parsed prefix on failure.
  lt_tag_parse(parsed, tag);
  const language = lt_lang_get_tag(lt_tag_get_language(parsed)) ?? "";
  const script = lt_script_get_tag(lt_tag_get_script(parsed)) ?? "";
  const region = lt_region_get_tag(lt_tag_get_region(parsed)) ?? "";
  const regionValue = unicode(region);
  let country: string;
  try {
    country = isIsoCountry(regionValue) ? region : "";
  } finally {
    regionValue.dispose();
  }
  let variants = "";
  for (const variant of lt_tag_get_variants(parsed) ?? []) {
    const value = lt_variant_get_tag(variant);
    if (value !== null) {
      if (variants.length !== 0) variants += "-";
      variants += value;
    }
  }
  return { tag, language, country, script, variants };
}

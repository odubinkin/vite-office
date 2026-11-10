/** @fileoverview Original LanguageTagImpl component getters/cache and LanguageTag ISO predicates; the enclosing canonicalization/registration owner remains separate. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  lt_tag_get_language,
  lt_tag_get_script,
  lt_tag_get_region,
  lt_tag_get_variants,
  type Tag,
} from "../../../external/liblangtag/liblangtag/lt-tag";
import { lt_lang_get_tag } from "../../../external/liblangtag/liblangtag/lt-lang";
import { lt_script_get_tag } from "../../../external/liblangtag/liblangtag/lt-script";
import { lt_region_get_tag } from "../../../external/liblangtag/liblangtag/lt-region";
import { lt_variant_get_tag } from "../../../external/liblangtag/liblangtag/lt-variant";
import { text, unicode } from "../isolang/isolang.tables";
import { Decision as D } from "./languagetag.conversion";
import { Extraction, simpleExtract } from "./languagetag.extract";

/** Actual private member fields and original canonicalization dependency consumed by this source responsibility fragment. */
export interface LanguageTagFieldState {
  readonly maBcp47: OUString;
  readonly maCachedLanguage: OUString;
  readonly maCachedScript: OUString;
  readonly maCachedCountry: OUString;
  readonly maCachedVariants: OUString;
  mbCachedLanguage: boolean;
  mbCachedScript: boolean;
  mbCachedCountry: boolean;
  mbCachedVariants: boolean;
  readonly mpImplLangtag: Tag | null;
  /** Original enclosing-owner member; component getters do not replace canonicalization. @returns Whether canonicalization changed the tag. */
  synCanonicalize(): boolean;
}

/** Original ASCII-only language predicate, without registry membership or case normalization. @param value - Original Unicode field. @returns Whether it has two or three lowercase ASCII units. */
export function isIsoLanguage(value: OUStringConstReference): boolean {
  const input = value.getStr(),
    length = value.getLength();
  return (
    (length === 2 || length === 3) &&
    input
      .subarray(0, length)
      .every(
        /** Tests source lowercase bounds. @param unit - UTF16 unit. @returns ASCII lowercase. */ (
          unit,
        ) => unit >= 97 && unit <= 122,
      )
  );
}

/** Original country predicate accepts empty and exactly two uppercase ASCII units. @param value - Original region field. @returns Source predicate. */
export function isIsoCountry(value: OUStringConstReference): boolean {
  const input = value.getStr(),
    length = value.getLength();
  return (
    length === 0 ||
    (length === 2 &&
      (input[0] as number) >= 65 &&
      (input[0] as number) <= 90 &&
      (input[1] as number) >= 65 &&
      (input[1] as number) <= 90)
  );
}

/** Original script predicate accepts empty or exact title-cased ASCII shape. @param value - Original script field. @returns Source predicate. */
export function isIsoScript(value: OUStringConstReference): boolean {
  const input = value.getStr(),
    length = value.getLength();
  return (
    length === 0 ||
    (length === 4 &&
      (input[0] as number) >= 65 &&
      (input[0] as number) <= 90 &&
      input
        .subarray(1, 4)
        .every(
          /** Tests source lowercase bounds. @param unit - UTF16 unit. @returns ASCII lowercase. */ (
            unit,
          ) => unit >= 97 && unit <= 122,
        ))
  );
}

/** Original complete simple-field cache update. Numeric region output is deliberately not copied into country. @param this - Original private owner. @returns Whether the original extractor admitted a cacheable shape. */
export function cacheSimpleLSCV(this: LanguageTagFieldState): boolean {
  const fields = { language: "", script: "", country: "", region: "", variants: "" };
  const extracted = simpleExtract(text(this.maBcp47), fields);
  const result =
    extracted === Extraction.EXTRACTED_LSC ||
    extracted === Extraction.EXTRACTED_LV ||
    extracted === Extraction.EXTRACTED_LR;
  if (result) {
    const values = [fields.language, fields.script, fields.country, fields.variants];
    const outputs = [
      this.maCachedLanguage,
      this.maCachedScript,
      this.maCachedCountry,
      this.maCachedVariants,
    ];
    for (let i = 0; i < outputs.length; i++) {
      const value = unicode(values[i] as string);
      try {
        (outputs[i] as OUString).assign(value);
      } finally {
        value.dispose();
      }
    }
    this.mbCachedLanguage =
      this.mbCachedScript =
      this.mbCachedCountry =
      this.mbCachedVariants =
        true;
  }
  return result;
}

/** Original language extraction after actual owner canonicalization; liblangtag fields retain its registered primary language. @param this - Original private owner. @returns Independently owned extracted language. */
export function getLanguageFromLangtag(this: LanguageTagFieldState): OUString {
  this.synCanonicalize();
  if (this.maBcp47.getLength() === 0) return new OUString();
  if (this.mpImplLangtag)
    return unicode(lt_lang_get_tag(lt_tag_get_language(this.mpImplLangtag)) ?? "");
  return this.mbCachedLanguage || cacheSimpleLSCV.call(this)
    ? new OUString(this.maCachedLanguage)
    : new OUString();
}

/** Original script extraction, retaining absent suppress-script fields from liblangtag. @param this - Original private owner. @returns Independently owned script. */
export function getScriptFromLangtag(this: LanguageTagFieldState): OUString {
  this.synCanonicalize();
  if (this.maBcp47.getLength() === 0) return new OUString();
  if (this.mpImplLangtag)
    return unicode(lt_script_get_tag(lt_tag_get_script(this.mpImplLangtag)) ?? "");
  return this.mbCachedScript || cacheSimpleLSCV.call(this)
    ? new OUString(this.maCachedScript)
    : new OUString();
}

/** Original raw region extraction. The source simple-cache branch reads maCachedCountry, not the extractor's numeric region. @param this - Original private owner. @returns Independently owned raw region. */
export function getRegionFromLangtag(this: LanguageTagFieldState): OUString {
  this.synCanonicalize();
  if (this.maBcp47.getLength() === 0) return new OUString();
  if (this.mpImplLangtag)
    return unicode(lt_region_get_tag(lt_tag_get_region(this.mpImplLangtag)) ?? "");
  return this.mbCachedCountry || cacheSimpleLSCV.call(this)
    ? new OUString(this.maCachedCountry)
    : new OUString();
}

/** Original variants in source list order, with hyphens only between emitted fields. @param this - Original private owner. @returns Independently owned variants. */
export function getVariantsFromLangtag(this: LanguageTagFieldState): OUString {
  this.synCanonicalize();
  if (this.maBcp47.getLength() === 0) return new OUString();
  if (this.mpImplLangtag) {
    let variants = "";
    for (const variant of lt_tag_get_variants(this.mpImplLangtag) ?? []) {
      const tag = lt_variant_get_tag(variant);
      if (tag !== null) {
        if (variants.length !== 0) variants += "-";
        variants += tag;
      }
    }
    return unicode(variants);
  }
  return this.mbCachedVariants || cacheSimpleLSCV.call(this)
    ? new OUString(this.maCachedVariants)
    : new OUString();
}

/** Original private borrowed getter, including empty-result caching. @param this - Original private owner. @returns Borrowed cache field. */
export function getLanguage(this: LanguageTagFieldState): OUStringConstReference {
  if (!this.mbCachedLanguage) {
    const value = getLanguageFromLangtag.call(this);
    try {
      this.maCachedLanguage.assign(value);
    } finally {
      value.dispose();
    }
    this.mbCachedLanguage = true;
  }
  return this.maCachedLanguage;
}

/** Original private borrowed script getter. @param this - Original private owner. @returns Borrowed cache field. */
export function getScript(this: LanguageTagFieldState): OUStringConstReference {
  if (!this.mbCachedScript) {
    const value = getScriptFromLangtag.call(this);
    try {
      this.maCachedScript.assign(value);
    } finally {
      value.dispose();
    }
    this.mbCachedScript = true;
  }
  return this.maCachedScript;
}

/** Original country getter clears non-ISO regions only on its uncached branch. @param this - Original private owner. @returns Borrowed cache field. */
export function getCountry(this: LanguageTagFieldState): OUStringConstReference {
  if (!this.mbCachedCountry) {
    const value = getRegionFromLangtag.call(this);
    try {
      this.maCachedCountry.assign(value);
    } finally {
      value.dispose();
    }
    if (!isIsoCountry(this.maCachedCountry)) this.maCachedCountry.clear();
    this.mbCachedCountry = true;
  }
  return this.maCachedCountry;
}

/** Original raw region getter always delegates, without the country cache predicate. @param this - Original private owner. @returns Independently owned region. */
export function getRegion(this: LanguageTagFieldState): OUString {
  return getRegionFromLangtag.call(this);
}

/** Original private variants getter and empty-result caching. @param this - Original private owner. @returns Borrowed cache field. */
export function getVariants(this: LanguageTagFieldState): OUStringConstReference {
  if (!this.mbCachedVariants) {
    const value = getVariantsFromLangtag.call(this);
    try {
      this.maCachedVariants.assign(value);
    } finally {
      value.dispose();
    }
    this.mbCachedVariants = true;
  }
  return this.maCachedVariants;
}

/** Original ISO decision caches shared with the enclosing LanguageTagImpl. */
export interface LanguageTagIsoState extends LanguageTagFieldState {
  meIsIsoLocale: D;
  meIsIsoODF: D;
}

/** Original ISO Locale query uses the raw region getter, not the country getter that can clear it. @param this - Actual private owner. @returns Original cached decision. */
export function isIsoLocale(this: LanguageTagIsoState): boolean {
  if (this.meIsIsoLocale === D.DECISION_DONTKNOW) {
    this.synCanonicalize();
    let result = this.maBcp47.getLength() === 0;
    if (!result && this.maBcp47.getLength() <= 6 && isIsoLanguage(getLanguage.call(this))) {
      const region = getRegion.call(this);
      try {
        result = isIsoCountry(region);
      } finally {
        region.dispose();
      }
    }
    this.meIsIsoLocale = result ? D.DECISION_YES : D.DECISION_NO;
  }
  return this.meIsIsoLocale === D.DECISION_YES;
}

/** Original ISO/ODF query preserves script-first evaluation, raw region distinction and length/variant gates. @param this - Actual private owner. @returns Original cached decision. */
export function isIsoODF(this: LanguageTagIsoState): boolean {
  if (this.meIsIsoODF === D.DECISION_DONTKNOW) {
    this.synCanonicalize();
    if (!isIsoScript(getScript.call(this))) {
      this.meIsIsoODF = D.DECISION_NO;
      return false;
    }
    if (isIsoLocale.call(this)) {
      this.meIsIsoODF = D.DECISION_YES;
      return true;
    }
    let result = false;
    if (this.maBcp47.getLength() <= 11 && isIsoLanguage(getLanguage.call(this))) {
      const region = getRegion.call(this);
      try {
        result =
          isIsoCountry(region) &&
          isIsoScript(getScript.call(this)) &&
          getVariants.call(this).getLength() === 0;
      } finally {
        region.dispose();
      }
    }
    this.meIsIsoODF = result ? D.DECISION_YES : D.DECISION_NO;
  }
  return this.meIsIsoODF === D.DECISION_YES;
}

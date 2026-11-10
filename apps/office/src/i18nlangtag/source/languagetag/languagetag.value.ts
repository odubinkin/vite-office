/** @fileoverview Actual shared normal LibreOffice LanguageTag value and lazy front-end contracts. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import {
  LanguageType,
  LANGUAGE_SYSTEM,
  LANGUAGE_DONTKNOW,
  LANGUAGE_SPANISH_DATED,
} from "../../inc/lang";
import { MsLangId } from "../../inc/mslangid";
import { text, unicode, lower } from "../isolang/isolang.tables";
import { handleVendorVariant } from "./languagetag.conversion";
import {
  convertToLocale,
  convertToBcp47,
  convertToLanguageType,
  convertToLanguageTypeWithFallback,
  convertToLocaleWithFallback,
} from "./languagetag.static";
import {
  ScriptType,
  PrivateUse,
  createValueState,
  isIsoLanguage,
  isIsoCountry,
  isIsoScript,
} from "./languagetag.state";
import {
  registerImpl,
  isOnTheFlyID,
  getOnTheFlyScriptType,
  setConfiguredSystemLanguage,
  disableParsing,
  isParsingDisabled,
} from "./languagetag.registry";
import type { LanguageTagImpl } from "./languagetag.impl";
import { getIsoFallbackStrings } from "./languagetag.iso-fallback";
import { getFallbackStrings } from "./languagetag";
import { lt_tag_new } from "../../../external/liblangtag/liblangtag/lt-tag";
import { lt_tag_parse } from "../../../external/liblangtag/liblangtag/lt-tag.parse";
import { lt_tag_canonicalize } from "../../../external/liblangtag/liblangtag/lt-tag.canonicalize";

const emptyBcp47 = new OUString(),
  emptyLocale = new Locale();
/** Source normal constructor/reset domain;POSIX rtl_Locale is a separate unsupported API. */
export type LanguageTagInput =
  number | string | OUStringConstReference | LocaleConstReference | LanguageTag;

/** Actual normal value owner,sharing semantic implementations via native registries. */
export class LanguageTag {
  static readonly ScriptType = ScriptType;
  static readonly PrivateUse = PrivateUse;
  static readonly isOnTheFlyID = isOnTheFlyID;
  static readonly getOnTheFlyScriptType = getOnTheFlyScriptType;
  static readonly disable_lt_tag_parse = disableParsing;
  static readonly isIsoLanguage = isIsoLanguage;
  static readonly isIsoCountry = isIsoCountry;
  static readonly isIsoScript = isIsoScript;
  static readonly convertToLocale = convertToLocale;
  static readonly convertToBcp47 = convertToBcp47;
  static readonly convertToLanguageType = convertToLanguageType;
  static readonly convertToLanguageTypeWithFallback = convertToLanguageTypeWithFallback;
  static readonly convertToLocaleWithFallback = convertToLocaleWithFallback;
  readonly #state = createValueState();

  /** Creates the normal source number/string/Locale/copy value or ODF four-field value. @param args - Actual constructor arguments;the string form includes the original canonicalize flag. @returns Actual LanguageTag. */
  constructor(
    ...args:
      | [input?: LanguageTagInput | undefined, canonicalize?: boolean | undefined]
      | [
          input: OUStringConstReference,
          language: OUStringConstReference,
          script: OUStringConstReference,
          country: OUStringConstReference,
        ]
  ) {
    const s = this.#state;
    if (args.length === 4) {
      const [bcp, languageValue, script, country] = args;
      s.maBcp47.assign(bcp);
      s.mnLangID = LANGUAGE_DONTKNOW;
      s.mbSystemLocale = !s.maBcp47.getLength() && !languageValue.getLength();
      s.mbInitializedBcp47 = !!s.maBcp47.getLength();
      if (s.mbSystemLocale || s.mbInitializedBcp47) return;
      const language = text(languageValue),
        scriptText = text(script),
        countryText = text(country);
      if (!scriptText) {
        s.maBcp47.assign(unicode(language + "-" + countryText));
        s.maLocale.Language.assign(languageValue);
        s.maLocale.Country.assign(country);
      } else {
        s.maBcp47.assign(
          unicode(language + "-" + scriptText + (countryText ? "-" + countryText : "")),
        );
        s.maLocale.Language.assign(unicode("qlt"));
        s.maLocale.Country.assign(country);
        s.maLocale.Variant.assign(s.maBcp47);
      }
      s.mbInitializedBcp47 = s.mbInitializedLocale = true;
      return;
    }
    const [input = LANGUAGE_SYSTEM, canonicalize = false] = args;
    if (input instanceof LanguageTag) {
      this.assign(input);
    } else if (typeof input === "number") {
      s.mnLangID = LanguageType(input);
      s.mbSystemLocale = s.mnLangID === LANGUAGE_SYSTEM;
      s.mbInitializedLangID = !s.mbSystemLocale;
    } else if (typeof input !== "string" && "Language" in input) {
      s.maLocale.assign(input);
      s.mnLangID = LANGUAGE_DONTKNOW;
      s.mbSystemLocale = !input.Language.getLength();
      handleVendorVariant(s.maLocale);
    } else {
      s.maBcp47.assign(typeof input === "string" ? unicode(input) : input);
      s.mnLangID = LANGUAGE_DONTKNOW;
      s.mbSystemLocale = !s.maBcp47.getLength();
      s.mbInitializedBcp47 = !s.mbSystemLocale;
      if (canonicalize) {
        this.#getImpl().canonicalize();
        this.#syncFromImpl();
      }
    }
  }

  /** Original defaulted memberwise copy assignment;physical ownership remains with JS GC. @param other - Actual source value. @returns This. */
  assign(other: LanguageTag): this {
    const s = this.#state,
      source = other.#state;
    s.maLocale.assign(source.maLocale);
    s.maBcp47.assign(source.maBcp47);
    s.mnLangID = source.mnLangID;
    s.mbSystemLocale = source.mbSystemLocale;
    s.mbInitializedBcp47 = source.mbInitializedBcp47;
    s.mbInitializedLocale = source.mbInitializedLocale;
    s.mbInitializedLangID = source.mbInitializedLangID;
    s.mbIsFallback = source.mbIsFallback;
    s.mpImpl = source.mpImpl;
    return this;
  }

  /** Resets exactly the source normal value fields. @param input - String,Locale or numeric ID. @returns This. */
  reset(input: number | string | OUStringConstReference | LocaleConstReference): this {
    const s = this.#state;
    s.mpImpl = null;
    s.maLocale.assign(new Locale());
    s.maBcp47.clear();
    s.mnLangID = LANGUAGE_SYSTEM;
    s.mbSystemLocale = true;
    s.mbInitializedBcp47 = s.mbInitializedLocale = s.mbInitializedLangID = s.mbIsFallback = false;
    if (typeof input === "number") {
      s.mnLangID = LanguageType(input);
      s.mbSystemLocale = s.mnLangID === LANGUAGE_SYSTEM;
      s.mbInitializedLangID = !s.mbSystemLocale;
    } else if (typeof input !== "string" && "Language" in input) {
      s.maLocale.assign(input);
      s.mbSystemLocale = !input.Language.getLength();
      s.mbInitializedLocale = !s.mbSystemLocale;
      handleVendorVariant(s.maLocale);
    } else {
      s.maBcp47.assign(typeof input === "string" ? unicode(input) : input);
      s.mbSystemLocale = !s.maBcp47.getLength();
      s.mbInitializedBcp47 = !s.mbSystemLocale;
    }
    return this;
  }

  /** Releases the value's own locale and tag string. The semantic implementation is shared. @returns Nothing. */
  dispose(): void {
    this.#state.maLocale.dispose();
    this.#state.maBcp47.dispose();
    this.#state.mpImpl = null;
  }

  /** Queries source system origin,not the resolved ID. @returns Origin flag. */
  isSystemLocale(): boolean {
    return this.#state.mbSystemLocale;
  }
  /** Borrows actual cached string,leaving SYSTEM unresolved when requested. @param resolve - Source resolution flag. @returns Actual Unicode reference. */
  getBcp47(resolve = true): OUStringConstReference {
    const s = this.#state;
    if (!resolve && s.mbSystemLocale) return emptyBcp47;
    if (!s.mbInitializedBcp47) this.#syncVarsFromImpl();
    if (!s.mbInitializedBcp47) {
      this.#getImpl().getBcp47();
      this.#syncFromImpl();
    }
    return s.maBcp47;
  }
  /** Borrows actual native triplet,optionally without resolving SYSTEM. @param resolve - Source resolution flag. @returns Native Locale reference. */
  getLocale(resolve = true): LocaleConstReference {
    const s = this.#state;
    if (!resolve && s.mbSystemLocale) return emptyLocale;
    if (!s.mbInitializedLocale) this.#syncVarsFromImpl();
    if (!s.mbInitializedLocale) {
      if (s.mbInitializedBcp47) this.#getImpl().convertBcp47ToLocale();
      else this.#getImpl().convertLangToLocale();
      this.#syncFromImpl();
    }
    return s.maLocale;
  }
  /** Gets native raw or dynamically registered ID,retaining source lazy order. @param resolve - Resolve SYSTEM. @returns Native UInt16 identity. */
  getLanguageType(resolve = true): number {
    const s = this.#state;
    if (!resolve && s.mbSystemLocale) return LANGUAGE_SYSTEM;
    if (!s.mbInitializedLangID) this.#syncVarsFromImpl();
    if (!s.mbInitializedLangID) {
      if (s.mbInitializedBcp47) {
        this.#getImpl().convertBcp47ToLang();
        this.#syncFromImpl();
      } else {
        this.#getImpl().convertLocaleToLang(true);
        this.#syncFromImpl();
        if (
          (!s.mbSystemLocale && s.mnLangID === LANGUAGE_SYSTEM) ||
          s.mnLangID === LANGUAGE_DONTKNOW
        )
          this.#synCanonicalize();
      }
    }
    return s.mnLangID;
  }

  /** Source language query returns an independent Unicode value. @returns Language. */
  getLanguage(): OUString {
    const impl = this.#getImpl();
    if (impl.mbCachedLanguage) return new OUString(impl.maCachedLanguage);
    const value = new OUString(impl.getLanguage());
    this.#syncFromImpl();
    return value;
  }
  /** Source script query. @returns Script. */
  getScript(): OUString {
    const impl = this.#getImpl();
    if (impl.mbCachedScript) return new OUString(impl.maCachedScript);
    const value = new OUString(impl.getScript());
    this.#syncFromImpl();
    return value;
  }
  /** Source country query,which differs from a numeric region. @returns Country. */
  getCountry(): OUString {
    const impl = this.#getImpl();
    if (impl.mbCachedCountry) return new OUString(impl.maCachedCountry);
    const value = new OUString(impl.getCountry());
    this.#syncFromImpl();
    return value;
  }
  /** Source variants query. @returns Variants. */
  getVariants(): OUString {
    const impl = this.#getImpl();
    if (impl.mbCachedVariants) return new OUString(impl.maCachedVariants);
    const value = new OUString(impl.getVariants());
    this.#syncFromImpl();
    return value;
  }
  /** Combines source language/script queries. @returns New value. */
  getLanguageAndScript(): OUString {
    const language = text(this.getLanguage()),
      script = text(this.getScript());
    return unicode(language + (script ? "-" + script : ""));
  }
  /** Source script presence wrapper. @returns Presence. */
  hasScript(): boolean {
    const value = this.#getImpl().hasScript();
    this.#syncFromImpl();
    return value;
  }
  /** Source cached script metadata. @returns Type. */
  getScriptType(): ScriptType {
    return this.#getImpl().getScriptType();
  }
  /** Source first-wins metadata update. @param type - Script type. @returns Nothing. */
  setScriptType(type: ScriptType): void {
    this.#getImpl().setScriptType(type);
  }
  /** Source ISO Locale wrapper. @returns Decision. */
  isIsoLocale(): boolean {
    const value = this.#getImpl().isIsoLocale();
    this.#syncFromImpl();
    return value;
  }
  /** Source ISO ODF wrapper. @returns Decision. */
  isIsoODF(): boolean {
    const value = this.#getImpl().isIsoODF();
    this.#syncFromImpl();
    return value;
  }
  /** Source instance validity wrapper,including known fast paths. @returns Decision. */
  isValidBcp47(): boolean {
    const value = this.#getImpl().isValidBcp47();
    this.#syncFromImpl();
    return value;
  }

  /** Writes original independent ISO-compatible fields. @param language - Output. @param script - Output. @param country - Output. @returns Nothing. */
  getIsoLanguageScriptCountry(language: OUString, script: OUString, country: OUString): void {
    if (this.isIsoODF()) {
      language.assign(this.getLanguage());
      script.assign(this.getScript());
      country.assign(this.getCountry());
    } else {
      const l = this.getLanguage(),
        s = this.getScript(),
        c = this.getCountry();
      language.assign(isIsoLanguage(l) ? l : new OUString());
      script.assign(isIsoScript(s) ? s : new OUString());
      country.assign(isIsoCountry(c) ? c : new OUString());
    }
  }

  /** Preserves complete original fallback order over actual native fields. @param include - Include full tag. @returns Fresh actual Unicode values. */
  getFallbackStrings(include: boolean): OUString[] {
    const language = text(this.getLanguage()),
      country = text(this.getCountry());
    if (this.isIsoLocale()) return getIsoFallbackStrings(language, country, include).map(unicode);
    const tag = text(this.getBcp47()),
      values = include ? [tag] : [];
    values.push(
      ...getFallbackStrings({
        tag,
        language,
        country,
        script: text(this.getScript()),
        variants: text(this.getVariants()),
      }),
    );
    return values.map(unicode);
  }
  /** Preserves source fallback replacement and one-time flag. @returns This. */
  makeFallback(): this {
    if (!this.#state.mbIsFallback) {
      const current = this.getLocale();
      let fallback = MsLangId.Conversion.lookupFallbackLocale(current);
      if (
        text(current.Language) !== text(fallback.Language) ||
        text(current.Country) !== text(fallback.Country) ||
        text(current.Variant) !== text(fallback.Variant)
      ) {
        if (
          text(current.Language) !== "en" &&
          text(fallback.Language) === "en" &&
          text(fallback.Country) === "US"
        )
          for (const tag of this.getFallbackStrings(false)) {
            fallback = MsLangId.Conversion.lookupFallbackLocale(new LanguageTag(tag).getLocale());
            if (text(fallback.Language) !== "en" || text(fallback.Country) !== "US") break;
          }
        this.reset(fallback);
      }
      this.#state.mbIsFallback = true;
    }
    return this;
  }
  /** Returns source Microsoft compatibility spelling. @returns BCP47 or dated Spanish form. */
  getBcp47MS(): OUString {
    return this.getLanguageType() === LANGUAGE_SPANISH_DATED
      ? unicode("es-ES_tradnl")
      : new OUString(this.getBcp47());
  }
  /** Source operator== semantics with unresolved SYSTEM. @param other - Actual value. @returns Equality. */
  Equals(other: LanguageTag): boolean {
    if (this.isSystemLocale() && other.isSystemLocale()) return true;
    if (this.#state.mbInitializedLangID && other.#state.mbInitializedLangID)
      return (
        this.#state.mnLangID === other.#state.mnLangID &&
        this.isSystemLocale() === other.isSystemLocale()
      );
    return text(this.getBcp47(false)) === text(other.getBcp47(false));
  }
  /** Source equals semantics resolving mixed SYSTEM origins. @param other - Actual value. @returns Equality. */
  equals(other: LanguageTag): boolean {
    return this.isSystemLocale() === other.isSystemLocale()
      ? this.Equals(other)
      : text(this.getBcp47()) === text(other.getBcp47());
  }
  /** Source operator< logical UTF16 ASCII-insensitive order. @param other - Actual value. @returns Ordering. */
  LessThan(other: LanguageTag): boolean {
    return lower(text(this.getBcp47(false))) < lower(text(other.getBcp47(false)));
  }

  /** Source configured-system update with native refusal rules. @param language - Native ID. @returns Nothing. */
  static setConfiguredSystemLanguage(language: number): void {
    setConfiguredSystemLanguage(LanguageType(language));
  }
  /** Source static parser validation bypasses known-locale fast paths. @param input - Actual Unicode input. @param output - Optional canonical output,also set when private policy rejects. @param policy - Source private/local-use policy. @returns Native validity. */
  static isValidBcp47(
    input: OUStringConstReference,
    output?: OUString,
    policy = PrivateUse.ALLOW,
  ): boolean {
    const tag = lt_tag_new();
    if (isParsingDisabled() || !lt_tag_parse(tag, text(input))) return false;
    const result = lt_tag_canonicalize(tag);
    if (result === null) return false;
    let valid = true;
    if (policy !== PrivateUse.ALLOW) {
      const language = tag.language?.tag;
      if (language === "qlt") valid = false;
      else if (!(policy === PrivateUse.ALLOW_ART_X && language === "art") && tag.privateuse)
        valid = false;
    }
    if (output) output.assign(unicode(result));
    return valid;
  }

  /** Obtains the actual shared native implementation and synchronizes new registrations. @returns Native owner. */
  #getImpl(): LanguageTagImpl {
    if (!this.#state.mpImpl) {
      this.#state.mpImpl = registerImpl(this.#state);
      this.#syncVarsFromRawImpl();
    }
    return this.#state.mpImpl;
  }
  /** Copies only original mutable front-end variables. @returns Nothing. */
  #syncVarsFromRawImpl(): void {
    const s = this.#state,
      impl = s.mpImpl;
    if (!impl) return;
    s.maBcp47.assign(impl.maBcp47);
    s.maLocale.assign(impl.maLocale);
    s.mnLangID = impl.mnLangID;
    s.mbInitializedBcp47 = impl.mbInitializedBcp47;
    s.mbInitializedLocale = impl.mbInitializedLocale;
    s.mbInitializedLangID = impl.mbInitializedLangID;
  }
  /** Preserves source registration versus direct synchronization. @returns Nothing. */
  #syncVarsFromImpl(): void {
    if (!this.#state.mpImpl) this.#getImpl();
    else this.#syncVarsFromRawImpl();
  }
  /** Re-registers changed identities only after syncing native mutable values. @returns Nothing. */
  #syncFromImpl(): void {
    const s = this.#state,
      impl = this.#getImpl(),
      again =
        (s.mbInitializedBcp47 && text(s.maBcp47) !== text(impl.maBcp47)) ||
        (s.mbInitializedLangID && s.mnLangID !== impl.mnLangID);
    this.#syncVarsFromRawImpl();
    if (again) s.mpImpl = registerImpl(s);
  }
  /** Source wrapper for final remap synchronization. @returns Whether changed. */
  #synCanonicalize(): boolean {
    const changed = this.#getImpl().synCanonicalize();
    if (changed) this.#syncFromImpl();
    return changed;
  }
}

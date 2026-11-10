/** @fileoverview Actual normal LanguageTagImpl value/cache/conversion owner; physical lifetime machinery is erased. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { MsLangId } from "../../inc/mslangid";
import { LANGUAGE_SYSTEM, LANGUAGE_DONTKNOW } from "../../inc/lang";
import { text, unicode } from "../isolang/isolang.tables";
import {
  Decision as D,
  convertLangToLocale,
  convertLocaleToBcp47,
  convertLangToBcp47,
  getBcp47,
  type LanguageTagConversionState,
} from "./languagetag.conversion";
import { Extraction as E, simpleExtract } from "./languagetag.extract";
import { canonicalize } from "./languagetag.canonical";
import {
  ScriptType,
  isIsoLanguage,
  isIsoCountry,
  isIsoScript,
  type LanguageTagValueState,
} from "./languagetag.state";
import { registerOnTheFly } from "./languagetag.registry";
import { lt_tag_copy, type Tag } from "../../../external/liblangtag/liblangtag/lt-tag";

/** Native private implementation for supported normal constructors and queries. */
export class LanguageTagImpl implements LanguageTagConversionState {
  readonly maLocale = new Locale();
  readonly maBcp47 = new OUString();
  readonly maCachedLanguage = new OUString();
  readonly maCachedScript = new OUString();
  readonly maCachedCountry = new OUString();
  readonly maCachedVariants = new OUString();
  readonly maCachedGlibcString = new OUString();
  mpImplLangtag: Tag | null = null;
  mnLangID: number;
  meScriptType = ScriptType.UNKNOWN;
  meIsValid = D.DECISION_DONTKNOW;
  meIsIsoLocale = D.DECISION_DONTKNOW;
  meIsIsoODF = D.DECISION_DONTKNOW;
  meIsLiblangtagNeeded = D.DECISION_DONTKNOW;
  mbSystemLocale: boolean;
  mbInitializedBcp47: boolean;
  mbInitializedLocale: boolean;
  mbInitializedLangID: boolean;
  mbCachedLanguage = false;
  mbCachedScript = false;
  mbCachedCountry = false;
  mbCachedVariants = false;
  mbCachedGlibcString = false;

  /** Copies actual constructor or implementation values. @param state - Native front-end fields or implementation copy source. @returns Real private implementation. */
  constructor(state: LanguageTagValueState | LanguageTagImpl) {
    this.maLocale.assign(state.maLocale);
    this.maBcp47.assign(state.maBcp47);
    this.mnLangID = state.mnLangID;
    this.mbSystemLocale = state.mbSystemLocale;
    this.mbInitializedBcp47 = state.mbInitializedBcp47;
    this.mbInitializedLocale = state.mbInitializedLocale;
    this.mbInitializedLangID = state.mbInitializedLangID;
    if (state instanceof LanguageTagImpl) this.assign(state);
  }

  /** Preserves source implementation assignment and actual parser copy semantics. @param other - Actual source. @returns This. */
  assign(other: LanguageTagImpl): this {
    if (other === this) return this;
    this.maLocale.assign(other.maLocale);
    for (const key of [
      "maBcp47",
      "maCachedLanguage",
      "maCachedScript",
      "maCachedCountry",
      "maCachedVariants",
      "maCachedGlibcString",
    ] as const)
      this[key].assign(other[key]);
    this.mpImplLangtag = other.mpImplLangtag ? lt_tag_copy(other.mpImplLangtag) : null;
    for (const key of [
      "mnLangID",
      "meScriptType",
      "meIsValid",
      "meIsIsoLocale",
      "meIsIsoODF",
      "meIsLiblangtagNeeded",
      "mbSystemLocale",
      "mbInitializedBcp47",
      "mbInitializedLocale",
      "mbInitializedLangID",
      "mbCachedLanguage",
      "mbCachedScript",
      "mbCachedCountry",
      "mbCachedVariants",
      "mbCachedGlibcString",
    ] as const)
      Object.assign(this, { [key]: other[key] });
    return this;
  }

  /** Calls the actual private canonicalization responsibility. @returns Whether BCP47 changed. */
  canonicalize(): boolean {
    return canonicalize(this);
  }

  /** Preserves lazy canonicalization and initialized-conversion synchronization. @returns Whether BCP47 changed. */
  synCanonicalize(): boolean {
    let changed = false;
    if (this.meIsLiblangtagNeeded !== D.DECISION_NO && !this.mpImplLangtag) {
      changed = this.canonicalize();
      if (changed) {
        if (this.mbInitializedLocale) this.convertBcp47ToLocale();
        if (this.mbInitializedLangID) this.convertBcp47ToLang();
      }
    }
    return changed;
  }

  /** Reuses actual shared native conversion group. @returns Borrowed Unicode value. */
  getBcp47(): OUStringConstReference {
    return getBcp47(this);
  }
  /** Reuses actual native conversion. @returns Nothing. */
  convertLangToLocale(): void {
    convertLangToLocale(this);
  }
  /** Reuses actual native conversion. @returns Nothing. */
  convertLangToBcp47(): void {
    convertLangToBcp47(this);
  }
  /** Reuses actual native conversion. @returns Nothing. */
  convertLocaleToBcp47(): void {
    convertLocaleToBcp47(this);
  }

  /** Converts actual Locale to a native known or dynamic ID. @param allowOnTheFly - Source registration control. @returns Whether legacy names remapped BCP47. */
  convertLocaleToLang(allowOnTheFly: boolean): boolean {
    let remapped = false;
    if (this.mbSystemLocale) this.mnLangID = MsLangId.getRealLanguage(LANGUAGE_SYSTEM);
    else {
      this.mnLangID = MsLangId.Conversion.convertLocaleToLanguage(this.maLocale);
      if (this.mnLangID === LANGUAGE_DONTKNOW) {
        this.mnLangID = MsLangId.Conversion.convertIsoNamesToLanguage(
          this.maLocale.Language,
          this.maLocale.Country,
          true,
        );
        if (this.mnLangID !== LANGUAGE_DONTKNOW) {
          const original = text(this.maBcp47);
          this.convertLangToLocale();
          this.convertLocaleToBcp47();
          remapped = text(this.maBcp47) !== original;
        }
      }
      if (this.mnLangID === LANGUAGE_DONTKNOW && allowOnTheFly && this.isValidBcp47()) {
        if (this.getCountry().getLength() === 0 && this.isIsoODF()) {
          const locale = MsLangId.Conversion.lookupFallbackLocale(this.maLocale);
          if (text(locale.Language) !== "en" || text(this.getLanguage()) === "en") {
            this.mnLangID = MsLangId.Conversion.convertLocaleToLanguage(locale);
            if (this.mnLangID !== LANGUAGE_DONTKNOW)
              this.mnLangID = MsLangId.getPrimaryLanguage(this.mnLangID);
          }
        }
        registerOnTheFly(this, this.mnLangID);
      }
    }
    this.mbInitializedLangID = true;
    return remapped;
  }

  /** Preserves qlt versus ISO triplet conversion. @returns Nothing. */
  convertBcp47ToLocale(): void {
    if (this.isIsoLocale()) {
      this.maLocale.Language.assign(this.getLanguageFromLangtag());
      this.maLocale.Country.assign(this.getRegionFromLangtag());
      this.maLocale.Variant.clear();
    } else {
      this.maLocale.Language.assign(unicode("qlt"));
      this.maLocale.Country.assign(this.getCountry());
      this.maLocale.Variant.assign(this.maBcp47);
    }
    this.mbInitializedLocale = true;
  }

  /** Preserves system origin and ordinary BCP47-to-ID conversion. @returns Nothing. */
  convertBcp47ToLang(): void {
    if (this.mbSystemLocale) this.mnLangID = MsLangId.getRealLanguage(LANGUAGE_SYSTEM);
    else {
      if (!this.mbInitializedLocale) this.convertBcp47ToLocale();
      this.convertLocaleToLang(true);
    }
    this.mbInitializedLangID = true;
  }

  /** Caches the original structural fields,discarding numeric region from country. @returns Whether extraction succeeded. */
  cacheSimpleLSCV(): boolean {
    const fields = { language: "", script: "", country: "", region: "", variants: "" },
      decision = simpleExtract(text(this.maBcp47), fields),
      success =
        decision === E.EXTRACTED_LSC || decision === E.EXTRACTED_LV || decision === E.EXTRACTED_LR;
    if (success) {
      this.maCachedLanguage.assign(unicode(fields.language));
      this.maCachedScript.assign(unicode(fields.script));
      this.maCachedCountry.assign(unicode(fields.country));
      this.maCachedVariants.assign(unicode(fields.variants));
      this.mbCachedLanguage =
        this.mbCachedScript =
        this.mbCachedCountry =
        this.mbCachedVariants =
          true;
    }
    return success;
  }

  /** Reads the actual parsed or native structural language. @returns Independent source value. */
  getLanguageFromLangtag(): OUString {
    this.synCanonicalize();
    if (!this.maBcp47.getLength()) return new OUString();
    if (this.mpImplLangtag) return unicode(this.mpImplLangtag.language?.tag ?? "");
    return this.mbCachedLanguage || this.cacheSimpleLSCV()
      ? new OUString(this.maCachedLanguage)
      : new OUString();
  }
  /** Reads the actual parsed or native structural script. @returns Independent source value. */
  getScriptFromLangtag(): OUString {
    this.synCanonicalize();
    if (!this.maBcp47.getLength()) return new OUString();
    if (this.mpImplLangtag) return unicode(this.mpImplLangtag.script?.tag ?? "");
    return this.mbCachedScript || this.cacheSimpleLSCV()
      ? new OUString(this.maCachedScript)
      : new OUString();
  }
  /** Reads original region behavior,including the cached-country fallback. @returns Region value. */
  getRegionFromLangtag(): OUString {
    this.synCanonicalize();
    if (!this.maBcp47.getLength()) return new OUString();
    if (this.mpImplLangtag) return unicode(this.mpImplLangtag.region?.tag ?? "");
    return this.mbCachedCountry || this.cacheSimpleLSCV()
      ? new OUString(this.maCachedCountry)
      : new OUString();
  }
  /** Reads actual registered variants only. @returns Variant value. */
  getVariantsFromLangtag(): OUString {
    this.synCanonicalize();
    if (!this.maBcp47.getLength()) return new OUString();
    if (this.mpImplLangtag)
      return unicode(
        this.mpImplLangtag.variants
          .map(
            /** Reads actual immutable variant spelling. @param variant - Native value. @returns Tag. */ (
              variant,
            ) => variant.tag,
          )
          .join("-"),
      );
    return this.mbCachedVariants || this.cacheSimpleLSCV()
      ? new OUString(this.maCachedVariants)
      : new OUString();
  }
  /** Borrows native cached language. @returns Unicode field. */
  getLanguage(): OUStringConstReference {
    if (!this.mbCachedLanguage) {
      this.maCachedLanguage.assign(this.getLanguageFromLangtag());
      this.mbCachedLanguage = true;
    }
    return this.maCachedLanguage;
  }
  /** Borrows native cached script. @returns Unicode field. */
  getScript(): OUStringConstReference {
    if (!this.mbCachedScript) {
      this.maCachedScript.assign(this.getScriptFromLangtag());
      this.mbCachedScript = true;
    }
    return this.maCachedScript;
  }
  /** Borrows country cache,clearing non-ISO regions only on this path. @returns Unicode field. */
  getCountry(): OUStringConstReference {
    if (!this.mbCachedCountry) {
      this.maCachedCountry.assign(this.getRegionFromLangtag());
      if (!isIsoCountry(this.maCachedCountry)) this.maCachedCountry.clear();
      this.mbCachedCountry = true;
    }
    return this.maCachedCountry;
  }
  /** Reads original uncached region wrapper. @returns Region value. */
  getRegion(): OUString {
    return this.getRegionFromLangtag();
  }
  /** Borrows native variants cache. @returns Unicode field. */
  getVariants(): OUStringConstReference {
    if (!this.mbCachedVariants) {
      this.maCachedVariants.assign(this.getVariantsFromLangtag());
      this.mbCachedVariants = true;
    }
    return this.maCachedVariants;
  }
  /** Queries the cached script. @returns Presence. */
  hasScript(): boolean {
    if (!this.mbCachedScript) this.getScript();
    return this.maCachedScript.getLength() !== 0;
  }
  /** Reads source script metadata. @returns Script type. */
  getScriptType(): ScriptType {
    return this.meScriptType;
  }
  /** Preserves original first non-UNKNOWN script metadata. @param type - Requested type. @returns Nothing. */
  setScriptType(type: ScriptType): void {
    if (this.meScriptType === ScriptType.UNKNOWN) this.meScriptType = type;
  }

  /** Original lazy ISO Locale predicate. @returns Native decision. */
  isIsoLocale(): boolean {
    if (this.meIsIsoLocale === D.DECISION_DONTKNOW) {
      this.synCanonicalize();
      this.meIsIsoLocale =
        !this.maBcp47.getLength() ||
        (this.maBcp47.getLength() <= 6 &&
          isIsoLanguage(this.getLanguage()) &&
          isIsoCountry(this.getRegion()))
          ? D.DECISION_YES
          : D.DECISION_NO;
    }
    return this.meIsIsoLocale === D.DECISION_YES;
  }
  /** Original lazy ISO ODF predicate,not the full validity check. @returns Native decision. */
  isIsoODF(): boolean {
    if (this.meIsIsoODF === D.DECISION_DONTKNOW) {
      this.synCanonicalize();
      if (!isIsoScript(this.getScript())) {
        this.meIsIsoODF = D.DECISION_NO;
        return false;
      }
      if (this.isIsoLocale()) {
        this.meIsIsoODF = D.DECISION_YES;
        return true;
      }
      this.meIsIsoODF =
        this.maBcp47.getLength() <= 11 &&
        isIsoLanguage(this.getLanguage()) &&
        isIsoCountry(this.getRegion()) &&
        isIsoScript(this.getScript()) &&
        this.getVariants().getLength() === 0
          ? D.DECISION_YES
          : D.DECISION_NO;
    }
    return this.meIsIsoODF === D.DECISION_YES;
  }
  /** Original lazy validity decision. @returns Whether known or parsed valid. */
  isValidBcp47(): boolean {
    if (this.meIsValid === D.DECISION_DONTKNOW) this.synCanonicalize();
    return this.meIsValid === D.DECISION_YES;
  }
}

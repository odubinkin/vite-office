/** @fileoverview Original LanguageTag value constructors, registered implementation sharing, synchronization, consumed getters/reset and fallback binding. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { LanguageType, LANGUAGE_SYSTEM, LANGUAGE_DONTKNOW } from "../../inc/lang";
import { MsLangId } from "../../inc/mslangid";
import { LanguageTagValueState, LanguageTagScriptType } from "./languagetag.value-state";
import { LanguageTagImpl } from "./languagetag.impl";
import { ImplPtr } from "../../runtime/implementation-pointer";
import {
  registerImpl,
  systemLocale,
  isOnTheFlyID,
  getOnTheFlyScriptType,
} from "./languagetag.registration";
import { getKnowns } from "./languagetag.knowns";
import { getFallbackStrings } from "./languagetag.fallback";
import { handleVendorVariant, convertToBcp47 } from "./languagetag.conversion";
import { disable_lt_tag_parse } from "./languagetag.canonicalize";
import { isIsoLanguage, isIsoCountry, isIsoScript } from "./languagetag.fields";
import { unicode, text } from "../isolang/isolang.tables";
const emptyBcp47 = new OUString();
const emptyLocale = new Locale();

/** Original public value owner; unconsumed platform/display APIs are not advertised as implemented. */
export class LanguageTag extends LanguageTagValueState {
  readonly mpImpl = new ImplPtr<LanguageTagImpl>();
  mbIsFallback = false;
  static readonly ScriptType = LanguageTagScriptType;
  /** Original default/numeric, BCP47, Locale and implicit-copy constructors. @param input - Original constructor operand. @param canonicalize - Original BCP47 constructor flag only. @returns Value owner. */
  constructor(
    input: number | OUStringConstReference | LocaleConstReference | LanguageTag = LANGUAGE_SYSTEM,
    canonicalize = false,
  ) {
    super(input instanceof LanguageTag ? input : undefined);
    if (input instanceof LanguageTag) {
      this.mpImpl.assign(input.mpImpl);
      this.mbIsFallback = input.mbIsFallback;
    } else if (typeof input === "number") {
      this.mnLangID = LanguageType(input);
      this.mbSystemLocale = this.mnLangID === LANGUAGE_SYSTEM;
      this.mbInitializedLangID = !this.mbSystemLocale;
    } else if ("Language" in input) {
      this.maLocale.assign(input);
      this.mbSystemLocale = input.Language.getLength() === 0;
      handleVendorVariant(this.maLocale);
    } else {
      this.maBcp47.assign(input);
      this.mbSystemLocale = input.getLength() === 0;
      this.mbInitializedBcp47 = !this.mbSystemLocale;
      if (canonicalize) {
        this.getImpl().canonicalize();
        this.syncFromImpl();
      }
    }
  }
  /** Original original string-temporary constructor binding for fallback. @param tag - Source ASCII BCP47 literal. @returns Owned value. */
  private static fromString(tag: string): LanguageTag {
    const value = unicode(tag);
    try {
      return new LanguageTag(value);
    } finally {
      value.dispose();
    }
  }
  /** Original numeric constructor binding used by the free static known set. @param id - Raw defined ID. @returns Owned value. */
  private static fromID(id: number): LanguageTag {
    return new LanguageTag(id);
  }
  /** Original private getImpl and initial value synchronization. @returns Borrowed implementation. */
  private getImpl(): LanguageTagImpl {
    if (!this.mpImpl.get()) {
      const registered = registerImpl(
        this,
        /** Original implementation constructor. @param state - Public value fields. @returns New private implementation. */ (
          state,
        ) =>
          new LanguageTagImpl(
            state,
            /** Original numeric constructor avoids string-canonicalization recursion. @returns Shared known set. */ () =>
              getKnowns(LanguageTag.fromID),
          ),
      );
      try {
        this.mpImpl.assign(registered);
      } finally {
        registered.dispose();
      }
      this.syncVarsFromRawImpl();
    }
    return this.mpImpl.get() as LanguageTagImpl;
  }
  /** Original raw synchronization deliberately does not copy system origin or fallback state. @returns Nothing. */
  private syncVarsFromRawImpl(): void {
    const impl = this.mpImpl.get();
    if (!impl) return;
    this.mbInitializedBcp47 = impl.mbInitializedBcp47;
    this.maBcp47.assign(impl.maBcp47);
    this.mbInitializedLocale = impl.mbInitializedLocale;
    this.maLocale.assign(impl.maLocale);
    this.mbInitializedLangID = impl.mbInitializedLangID;
    this.mnLangID = impl.mnLangID;
  }
  /** Original lazy mutable-field synchronization. @returns Nothing. */
  private syncVarsFromImpl(): void {
    if (!this.mpImpl.get()) this.getImpl();
    else this.syncVarsFromRawImpl();
  }
  /** Original compare/sync/re-registration sequence. @returns Nothing. */
  private syncFromImpl(): void {
    const impl = this.getImpl();
    const register =
      (this.mbInitializedBcp47 && !this.maBcp47.equals(impl.maBcp47)) ||
      (this.mbInitializedLangID && this.mnLangID !== impl.mnLangID);
    this.syncVarsFromRawImpl();
    if (register) {
      const pointer = registerImpl(
        this,
        /** Original implementation constructor. @param state - Source fields. @returns Private value. */ (
          state,
        ) =>
          new LanguageTagImpl(
            state,
            /** Original lazy numeric binding. @returns Known set. */ () =>
              getKnowns(LanguageTag.fromID),
          ),
      );
      try {
        this.mpImpl.assign(pointer);
      } finally {
        pointer.dispose();
      }
    }
  }
  /** Original synchronized canonicalization. @returns Changed flag. */
  private synCanonicalize(): boolean {
    const changed = this.getImpl().synCanonicalize();
    if (changed) this.syncFromImpl();
    return changed;
  }
  /** Original borrowed BCP47 query, retaining unresolved SYSTEM empty reference. @param resolveSystem - Original resolution policy. @returns Borrowed value field. */
  getBcp47(resolveSystem = true): OUStringConstReference {
    if (!resolveSystem && this.mbSystemLocale) return emptyBcp47;
    if (!this.mbInitializedBcp47) this.syncVarsFromImpl();
    if (!this.mbInitializedBcp47) {
      this.getImpl().getBcp47();
      this.syncFromImpl();
    }
    return this.maBcp47;
  }
  /** Original borrowed Locale query and its BCP47-versus-ID priority. @param resolveSystem - Original resolution policy. @returns Borrowed Locale fields. */
  getLocale(resolveSystem = true): LocaleConstReference {
    if (!resolveSystem && this.mbSystemLocale) return emptyLocale;
    if (!this.mbInitializedLocale) this.syncVarsFromImpl();
    if (!this.mbInitializedLocale) {
      const impl = this.getImpl();
      if (this.mbInitializedBcp47) impl.convertBcp47ToLocale();
      else impl.convertLangToLocale();
      this.syncFromImpl();
    }
    return this.maLocale;
  }
  /** Original ID query, including the separate redundant-information canonicalization point. @param resolveSystem - Original resolution policy. @returns Raw original ID. */
  getLanguageType(resolveSystem = true): number {
    if (!resolveSystem && this.mbSystemLocale) return LANGUAGE_SYSTEM;
    if (!this.mbInitializedLangID) this.syncVarsFromImpl();
    if (!this.mbInitializedLangID) {
      const impl = this.getImpl();
      if (this.mbInitializedBcp47) {
        impl.convertBcp47ToLang();
        this.syncFromImpl();
      } else {
        impl.convertLocaleToLang(true);
        this.syncFromImpl();
        if (
          (!this.mbSystemLocale && this.mnLangID === LANGUAGE_SYSTEM) ||
          this.mnLangID === LANGUAGE_DONTKNOW
        )
          this.synCanonicalize();
      }
    }
    return this.mnLangID;
  }
  /** Original owned language getter and cache-hit synchronization bypass. @returns Owned string. */
  getLanguage(): OUString {
    const impl = this.getImpl();
    if (impl.mbCachedLanguage) return new OUString(impl.maCachedLanguage);
    const value = new OUString(impl.getLanguage());
    try {
      this.syncFromImpl();
      return value;
    } catch (error) {
      value.dispose();
      throw error;
    }
  }
  /** Original owned script getter. @returns Owned string. */
  getScript(): OUString {
    const impl = this.getImpl();
    if (impl.mbCachedScript) return new OUString(impl.maCachedScript);
    const value = new OUString(impl.getScript());
    try {
      this.syncFromImpl();
      return value;
    } catch (error) {
      value.dispose();
      throw error;
    }
  }
  /** Original language-and-script concatenation, retaining the component getter order. @returns Owned string. */
  getLanguageAndScript(): OUString {
    const language = this.getLanguage();
    try {
      const script = this.getScript();
      try {
        if (script.getLength() !== 0) {
          const combined = unicode(text(language) + "-" + text(script));
          try {
            language.assign(combined);
          } finally {
            combined.dispose();
          }
        }
      } finally {
        script.dispose();
      }
      return language;
    } catch (error) {
      language.dispose();
      throw error;
    }
  }
  /** Original stored script-type query, without mutable-field synchronization. @returns Shared implementation type. */
  getScriptType(): LanguageTagScriptType {
    return this.getImpl().meScriptType;
  }
  /** Original first-known-type assignment policy. @param type - Original script type. @returns Nothing. */
  setScriptType(type: LanguageTagScriptType): void {
    const impl = this.getImpl();
    if (impl.meScriptType === LanguageTagScriptType.UNKNOWN) impl.meScriptType = type;
  }
  /** Original owned country getter. @returns Owned string. */
  getCountry(): OUString {
    const impl = this.getImpl();
    if (impl.mbCachedCountry) return new OUString(impl.maCachedCountry);
    const value = new OUString(impl.getCountry());
    try {
      this.syncFromImpl();
      return value;
    } catch (error) {
      value.dispose();
      throw error;
    }
  }
  /** Original owned variants getter. @returns Owned string. */
  getVariants(): OUString {
    const impl = this.getImpl();
    if (impl.mbCachedVariants) return new OUString(impl.maCachedVariants);
    const value = new OUString(impl.getVariants());
    try {
      this.syncFromImpl();
      return value;
    } catch (error) {
      value.dispose();
      throw error;
    }
  }
  /** Original script predicate. @returns Source decision. */
  hasScript(): boolean {
    const result = this.getImpl().hasScript();
    this.syncFromImpl();
    return result;
  }
  /** Original ISO predicate. @returns Source decision. */
  isIsoLocale(): boolean {
    const result = this.getImpl().isIsoLocale();
    this.syncFromImpl();
    return result;
  }
  /** Original ODF predicate. @returns Source decision. */
  isIsoODF(): boolean {
    const result = this.getImpl().isIsoODF();
    this.syncFromImpl();
    return result;
  }
  /** Original validity predicate. @returns Source decision. */
  isValidBcp47(): boolean {
    const result = this.getImpl().isValidBcp47();
    this.syncFromImpl();
    return result;
  }
  /** Original fallback member and actual original temporary constructor. @param includeFull - Original flag. @returns Original ordered vector. */
  getFallbackStrings(includeFull: boolean): string[] {
    return getFallbackStrings.call(this, includeFull, LanguageTag.fromString);
  }
  /** Original system-origin query; mutable-field synchronization does not change this origin. @returns Source origin flag. */
  isSystemLocale(): boolean {
    return this.mbSystemLocale;
  }
  /** Original resetVars and constructor-overload-specific reset semantics. @param input - Original reset operand. @returns This original value. */
  reset(input: number | OUStringConstReference | LocaleConstReference): this {
    this.mpImpl.reset();
    const empty = new Locale();
    try {
      this.maLocale.assign(empty);
    } finally {
      empty.dispose();
    }
    this.maBcp47.clear();
    this.mnLangID = LANGUAGE_SYSTEM;
    this.mbSystemLocale = true;
    this.mbInitializedBcp47 =
      this.mbInitializedLocale =
      this.mbInitializedLangID =
      this.mbIsFallback =
        false;
    if (typeof input === "number") {
      this.mnLangID = LanguageType(input);
      this.mbSystemLocale = this.mnLangID === LANGUAGE_SYSTEM;
      this.mbInitializedLangID = !this.mbSystemLocale;
    } else if ("Language" in input) {
      this.maLocale.assign(input);
      this.mbSystemLocale = input.Language.getLength() === 0;
      this.mbInitializedLocale = !this.mbSystemLocale;
      handleVendorVariant(this.maLocale);
    } else {
      this.maBcp47.assign(input);
      this.mbSystemLocale = input.getLength() === 0;
      this.mbInitializedBcp47 = !this.mbSystemLocale;
    }
    return this;
  }
  /** Original pointer/member destruction; implementation maps retain their own references. @returns Nothing. */
  override dispose(): void {
    this.mpImpl.dispose();
    super.dispose();
  }
  /** Original configured-language guard, system pointer reset and immediate re-registration. @param id - Original raw ID. @returns Nothing. */
  static setConfiguredSystemLanguage(id: number): void {
    id = LanguageType(id);
    if (id === LANGUAGE_DONTKNOW || id === LANGUAGE_SYSTEM) return;
    MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(id);
    systemLocale.reset();
    const tag = new LanguageTag(LANGUAGE_SYSTEM);
    try {
      const pointer = registerImpl(
        tag,
        /** Original implementation constructor. @param state - Original fields. @returns Implementation. */ (
          state,
        ) =>
          new LanguageTagImpl(
            state,
            /** Original known set. @returns Known set. */ () => getKnowns(LanguageTag.fromID),
          ),
      );
      pointer.dispose();
    } finally {
      tag.dispose();
    }
  }
  /** Original one-way parser disable. @returns Nothing. */
  static disable_lt_tag_parse(): void {
    disable_lt_tag_parse();
  }
  /** Original string/numeric static converters, returning a copy before the temporary value is destroyed. @param input - Original ID or BCP47. @param resolveSystem - Original resolution flag. @returns Owned Locale. */
  static convertToLocale(input: number | OUStringConstReference, resolveSystem = true): Locale {
    if (
      !resolveSystem &&
      (typeof input === "number"
        ? LanguageType(input) === LANGUAGE_SYSTEM ||
          MsLangId.getRealLanguage(LanguageType(input)) !== LanguageType(input)
        : input.getLength() === 0)
    )
      return new Locale();
    const tag = new LanguageTag(input);
    try {
      return new Locale(tag.getLocale(resolveSystem));
    } finally {
      tag.dispose();
    }
  }
  /** Original Locale/numeric static BCP47 conversion, preserving the numeric recursion guard. @param input - Original Locale or language ID. @param resolveSystem - Locale overload resolution flag. @returns Owned string. */
  static convertToBcp47(input: number | LocaleConstReference, resolveSystem = true): OUString {
    if (typeof input !== "number") {
      if (input.Language.getLength() !== 0) return convertToBcp47(input);
      return resolveSystem ? LanguageTag.convertToBcp47(LANGUAGE_SYSTEM) : new OUString();
    }
    const locale = LanguageTag.convertToLocale(input);
    try {
      return locale.Language.getLength() === 0 ? new OUString() : convertToBcp47(locale);
    } finally {
      locale.dispose();
    }
  }
  /** Original static ISO language predicate. @param value - Original field. @returns Predicate. */
  static isIsoLanguage(value: OUStringConstReference): boolean {
    return isIsoLanguage(value);
  }
  /** Original static ISO country predicate. @param value - Original field. @returns Predicate. */
  static isIsoCountry(value: OUStringConstReference): boolean {
    return isIsoCountry(value);
  }
  /** Original static ISO script predicate. @param value - Original field. @returns Predicate. */
  static isIsoScript(value: OUStringConstReference): boolean {
    return isIsoScript(value);
  }
  /** Original dynamic-ID range predicate. @param id - Raw ID. @returns Predicate. */
  static isOnTheFlyID(id: number): boolean {
    return isOnTheFlyID(LanguageType(id));
  }
  /** Original registered script-type lookup. @param id - Raw ID. @returns Stored script type. */
  static getOnTheFlyScriptType(id: number): number {
    return getOnTheFlyScriptType(id);
  }
}

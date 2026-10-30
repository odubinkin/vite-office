/** @fileoverview Actual LanguageTagImpl owner binding the original component/canonicalization/conversion groups and registry; no constructor or registration substitute. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { lt_tag_copy, type Tag } from "../../../external/liblangtag/liblangtag/lt-tag";
import { LanguageTagValueState, LanguageTagScriptType } from "./languagetag.value-state";
import * as conversion from "./languagetag.conversion";
import * as fields from "./languagetag.fields";
import * as canonical from "./languagetag.canonicalize";
import * as localeState from "./languagetag.locale-state";
import { convertLocaleToLang } from "./languagetag.locale-id";
import { registerOnTheFly } from "./languagetag.registration";
import type { ImplPtr } from "../../runtime/implementation-pointer";
/** Original registered implementation value; shared pointer control blocks are separately bound. */
export class LanguageTagImpl
  extends LanguageTagValueState
  implements canonical.LanguageTagCanonicalState
{
  readonly maCachedLanguage = new OUString();
  readonly maCachedScript = new OUString();
  readonly maCachedCountry = new OUString();
  readonly maCachedVariants = new OUString();
  readonly maCachedGlibcString = new OUString();
  mpImplLangtag: Tag | null = null;
  mbCachedLanguage = false;
  mbCachedScript = false;
  mbCachedCountry = false;
  mbCachedVariants = false;
  mbCachedGlibcString = false;
  meIsValid = conversion.Decision.DECISION_DONTKNOW;
  meIsIsoODF = conversion.Decision.DECISION_DONTKNOW;
  meIsLiblangtagNeeded = conversion.Decision.DECISION_DONTKNOW;
  meScriptType = LanguageTagScriptType.UNKNOWN;
  /** Original public-value/copy implementation constructors. @param source - Original source value or implementation. @param knowns - Original free known-set binding. @returns Implementation. */
  constructor(
    source: LanguageTagValueState,
    readonly knowns: canonical.KnownTagSetProvider,
  ) {
    super(source);
    if (source instanceof LanguageTagImpl) this.assign(source);
  }
  /** Original implementation copy assignment, including source cached flags/tag value. @param source - Borrowed source. @returns Nothing. */
  assign(source: LanguageTagImpl): void {
    if (source === this) return;
    this.assignValueState(source);
    this.maCachedLanguage.assign(source.maCachedLanguage);
    this.maCachedScript.assign(source.maCachedScript);
    this.maCachedCountry.assign(source.maCachedCountry);
    this.maCachedVariants.assign(source.maCachedVariants);
    this.maCachedGlibcString.assign(source.maCachedGlibcString);
    this.mpImplLangtag = source.mpImplLangtag ? lt_tag_copy(source.mpImplLangtag) : null;
    this.meScriptType = source.meScriptType;
    this.meIsValid = source.meIsValid;
    this.meIsIsoLocale = source.meIsIsoLocale;
    this.meIsIsoODF = source.meIsIsoODF;
    this.meIsLiblangtagNeeded = source.meIsLiblangtagNeeded;
    this.mbCachedLanguage = source.mbCachedLanguage;
    this.mbCachedScript = source.mbCachedScript;
    this.mbCachedCountry = source.mbCachedCountry;
    this.mbCachedVariants = source.mbCachedVariants;
    this.mbCachedGlibcString = source.mbCachedGlibcString;
  }
  /** Original implementation copy construction. @returns Independent implementation value. */
  copy(): LanguageTagImpl {
    return new LanguageTagImpl(this, this.knowns);
  }
  /** Original destructor with managed liblangtag storage and explicit shared string member release. @returns Nothing. */
  override dispose(): void {
    this.mpImplLangtag = null;
    this.maCachedGlibcString.dispose();
    this.maCachedVariants.dispose();
    this.maCachedCountry.dispose();
    this.maCachedScript.dispose();
    this.maCachedLanguage.dispose();
    super.dispose();
  }
  /** Original canonicalization. @returns Changed flag. */
  canonicalize(): boolean {
    return canonical.canonicalize.call(this, this.knowns);
  }
  /** Original synchronized canonicalization. @returns Changed flag. */
  synCanonicalize(): boolean {
    return canonical.synCanonicalize.call(this, this.knowns);
  }
  /** Original validity. @returns Decision. */
  isValidBcp47(): boolean {
    return canonical.isValidBcp47.call(this);
  }
  /** Original ISO Locale. @returns Decision. */
  isIsoLocale(): boolean {
    return fields.isIsoLocale.call(this);
  }
  /** Original ISO/ODF. @returns Decision. */
  isIsoODF(): boolean {
    return fields.isIsoODF.call(this);
  }
  /** Original borrowed language. @returns Cached field. */
  getLanguage() {
    return fields.getLanguage.call(this);
  }
  /** Original borrowed script. @returns Cached field. */
  getScript() {
    return fields.getScript.call(this);
  }
  /** Original borrowed country. @returns Cached field. */
  getCountry() {
    return fields.getCountry.call(this);
  }
  /** Original raw region. @returns Owned value. */
  getRegion() {
    return fields.getRegion.call(this);
  }
  /** Original borrowed variants. @returns Cached field. */
  getVariants() {
    return fields.getVariants.call(this);
  }
  /** Original script predicate. @returns Whether script exists. */
  hasScript(): boolean {
    if (!this.mbCachedScript) this.getScript();
    return this.maCachedScript.getLength() !== 0;
  }
  /** Original borrowed BCP47. @returns Value field. */
  getBcp47() {
    return conversion.getBcp47(this);
  }
  /** Original ID-to-Locale. @returns Nothing. */
  convertLangToLocale(): void {
    conversion.convertLangToLocale(this);
  }
  /** Original Locale-to-BCP47. @returns Nothing. */
  convertLocaleToBcp47(): void {
    conversion.convertLocaleToBcp47(this);
  }
  /** Original BCP47-to-Locale. @returns Nothing. */
  convertBcp47ToLocale(): void {
    localeState.convertBcp47ToLocale.call(this);
  }
  /** Original BCP47-to-ID. @returns Nothing. */
  convertBcp47ToLang(): void {
    localeState.convertBcp47ToLang.call(this);
  }
  /** Original Locale-to-ID. @param allow - Original dynamic-registration policy. @returns Remapped flag. */
  convertLocaleToLang(allow: boolean): boolean {
    return convertLocaleToLang.call(this, allow);
  }
  /** Original owned implementation-pointer return from dynamic registration. @param id - Suggested raw ID. @returns Owned source pointer. */
  registerOnTheFly(id: number): ImplPtr<LanguageTagImpl> {
    return registerOnTheFly(this, id);
  }
}

/** @fileoverview Original shared LanguageTag/LanguageTagImpl value fields, including actual implicit Locale/OUString copy/destruction binding. */
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { LANGUAGE_DONTKNOW } from "../../inc/lang";
import { Decision, type LanguageTagConversionState } from "./languagetag.conversion";
/** Original nested LanguageTag script-type values. */
export enum LanguageTagScriptType {
  UNKNOWN = 0,
  WESTERN = 1,
  CJK = 2,
  CTL = 3,
  RTL = 4,
}
/** Actual original value fields common to the public value and its registered implementation. */
export class LanguageTagValueState implements LanguageTagConversionState {
  readonly maLocale: Locale;
  readonly maBcp47: OUString;
  mnLangID = LANGUAGE_DONTKNOW;
  mbSystemLocale = false;
  mbInitializedBcp47 = false;
  mbInitializedLocale = false;
  mbInitializedLangID = false;
  meIsIsoLocale = Decision.DECISION_DONTKNOW;
  /** Copies original shared value fields or initializes their original empty defaults. @param source - Optional original source state. @returns Value state. */
  constructor(source?: LanguageTagConversionState) {
    this.maLocale = source ? new Locale(source.maLocale) : new Locale();
    this.maBcp47 = source ? new OUString(source.maBcp47) : new OUString();
    if (source) this.assignValueState(source);
  }
  /** Original field copy; derived implementation decision/cache fields have their own copy group. @param source - Actual original fields. @returns Nothing. */
  assignValueState(source: LanguageTagConversionState): void {
    this.maLocale.assign(source.maLocale);
    this.maBcp47.assign(source.maBcp47);
    this.mnLangID = source.mnLangID;
    this.mbSystemLocale = source.mbSystemLocale;
    this.mbInitializedBcp47 = source.mbInitializedBcp47;
    this.mbInitializedLocale = source.mbInitializedLocale;
    this.mbInitializedLangID = source.mbInitializedLangID;
  }
  /** Original reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.maBcp47.dispose();
    this.maLocale.dispose();
  }
}

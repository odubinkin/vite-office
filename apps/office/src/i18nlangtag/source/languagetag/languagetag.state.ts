/** @fileoverview Actual normal LanguageTag front-end fields and original static ISO predicates. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { LANGUAGE_SYSTEM } from "../../inc/lang";
import { text } from "../isolang/isolang.tables";
import type { LanguageTagImpl } from "./languagetag.impl";

/** Original nested script values; UNKNOWN remains first-wins metadata. */
export enum ScriptType {
  UNKNOWN = 0,
  WESTERN = 1,
  CJK = 2,
  CTL = 3,
  RTL = 4,
}
/** Original static validation private/local-use policy. */
export enum PrivateUse {
  ALLOW = 0,
  DISALLOW = 1,
  ALLOW_ART_X = 2,
}

/** Source-private front-end member values shared only by its responsibility files. */
export interface LanguageTagValueState {
  readonly maLocale: Locale;
  readonly maBcp47: OUString;
  mnLangID: number;
  mbSystemLocale: boolean;
  mbInitializedBcp47: boolean;
  mbInitializedLocale: boolean;
  mbInitializedLangID: boolean;
  mbIsFallback: boolean;
  mpImpl: LanguageTagImpl | null;
}

/** Creates exact resetVars defaults using actual shared values. @returns Front-end fields. */
export function createValueState(): LanguageTagValueState {
  return {
    maLocale: new Locale(),
    maBcp47: new OUString(),
    mnLangID: LANGUAGE_SYSTEM,
    mbSystemLocale: true,
    mbInitializedBcp47: false,
    mbInitializedLocale: false,
    mbInitializedLangID: false,
    mbIsFallback: false,
    mpImpl: null,
  };
}

/** Original case-sensitive static ISO language shape, not registration validation. @param language - Actual Unicode value. @returns Native predicate. */
export function isIsoLanguage(language: OUStringConstReference): boolean {
  const value = text(language);
  return (value.length === 2 || value.length === 3) && !/[^a-z]/.test(value);
}
/** Original case-sensitive ISO country shape, including empty. @param country - Actual Unicode value. @returns Native predicate. */
export function isIsoCountry(country: OUStringConstReference): boolean {
  const value = text(country);
  return value.length === 0 || (value.length === 2 && !/[^A-Z]/.test(value));
}
/** Original case-sensitive ISO script shape, including empty. @param script - Actual Unicode value. @returns Native predicate. */
export function isIsoScript(script: OUStringConstReference): boolean {
  const value = text(script);
  return value.length === 0 || (value.length === 4 && /^[A-Z][a-z]{3}$/.test(value));
}

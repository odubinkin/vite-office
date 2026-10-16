/** @fileoverview Complete native private LanguageTag ID/Locale/BCP47 conversion-state methods; no replacement public LanguageTag/parser or physical ownership machinery. */
import { MsLangId } from "../../inc/mslangid";
import { LANGUAGE_SYSTEM } from "../../inc/lang";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../isolang/isolang.tables";

/** Original private three-state decision values, in source order. */
export enum Decision {
  DECISION_DONTKNOW,
  DECISION_NO,
  DECISION_YES,
}

/** Actual mutable native fields used by this private conversion group; the enclosing LanguageTagImpl and its other responsibilities are separate. */
export interface LanguageTagConversionState {
  readonly maLocale: Locale;
  readonly maBcp47: OUString;
  mnLangID: number;
  mbSystemLocale: boolean;
  mbInitializedBcp47: boolean;
  mbInitializedLocale: boolean;
  mbInitializedLangID: boolean;
  meIsIsoLocale: Decision;
}

/** Native constructor/reset vendor cleanup, preserving the case-sensitive qlt marker. @param locale - Actual mutable native value. @returns Nothing. */
export function handleVendorVariant(locale: Locale): void {
  if (locale.Variant.getLength() !== 0 && text(locale.Language) !== "qlt") locale.Variant.clear();
}

/** Complete native private Locale conversion without resolving SYSTEM or canonicalizing fields. @param locale - Actual native value. @returns Independent actual Unicode value. */
export function convertToBcp47(locale: LocaleConstReference): OUString {
  if (locale.Language.getLength() === 0) return new OUString();
  if (text(locale.Language) === "qlt") return new OUString(locale.Variant);
  if (locale.Country.getLength() === 0) return new OUString(locale.Language);
  return unicode(text(locale.Language) + "-" + text(locale.Country));
}

/** Native ID-to-Locale transition: resolve an uninitialized SYSTEM ID once, retain system origin and other raw IDs. @param state - Actual conversion fields. @returns Nothing. */
export function convertLangToLocale(state: LanguageTagConversionState): void {
  if (state.mbSystemLocale && !state.mbInitializedLangID) {
    state.mnLangID = MsLangId.getRealLanguage(LANGUAGE_SYSTEM);
    state.mbInitializedLangID = true;
  }
  state.maLocale.assign(MsLangId.Conversion.convertLanguageToLocale(state.mnLangID, false));
  state.mbInitializedLocale = true;
}

/** Native Locale-to-BCP47 transition, including SYSTEM fallback and qlt decision side effect. The total private converter also returns empty for the source diagnostic bad-luck empty-Locale branch. @param state - Actual conversion fields. @returns Nothing. */
export function convertLocaleToBcp47(state: LanguageTagConversionState): void {
  if (state.mbSystemLocale && !state.mbInitializedLocale) convertLangToLocale(state);
  if (state.maLocale.Language.getLength() === 0)
    state.maLocale.assign(MsLangId.Conversion.convertLanguageToLocale(LANGUAGE_SYSTEM, false));
  if (text(state.maLocale.Language) === "qlt") {
    state.maBcp47.assign(state.maLocale.Variant);
    state.meIsIsoLocale = Decision.DECISION_NO;
  } else state.maBcp47.assign(convertToBcp47(state.maLocale));
  state.mbInitializedBcp47 = true;
}

/** Native ID-to-BCP47 transition reuses an initialized Locale without resolving the ID again. @param state - Actual conversion fields. @returns Nothing. */
export function convertLangToBcp47(state: LanguageTagConversionState): void {
  if (!state.mbInitializedLocale) convertLangToLocale(state);
  convertLocaleToBcp47(state);
  state.mbInitializedBcp47 = true;
}

/** Native private lazy getter; cache hits return the same borrowed field without conversion or normalization. This is not the public getBcp47(resolveSystem) wrapper. @param state - Actual conversion fields. @returns Borrowed const actual Unicode field. */
export function getBcp47(state: LanguageTagConversionState): OUStringConstReference {
  if (!state.mbInitializedBcp47) {
    if (state.mbInitializedLocale) convertLocaleToBcp47(state);
    else convertLangToBcp47(state);
  }
  return state.maBcp47;
}

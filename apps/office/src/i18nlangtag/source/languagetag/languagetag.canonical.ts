/** @fileoverview Actual LanguageTagImpl known-locale fast path and external parser fallback. */
import { Decision as D, convertToBcp47 } from "./languagetag.conversion";
import { Extraction as E, simpleExtract } from "./languagetag.extract";
import { MsLangId } from "../../inc/mslangid";
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM } from "../../inc/lang";
import { text, unicode } from "../isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { lt_tag_new } from "../../../external/liblangtag/liblangtag/lt-tag";
import { lt_tag_parse } from "../../../external/liblangtag/liblangtag/lt-tag.parse";
import { lt_tag_canonicalize } from "../../../external/liblangtag/liblangtag/lt-tag.canonicalize";
import type { DiagnosticSlot } from "../../../external/liblangtag/liblangtag/lt-error";
import type { LanguageTagImpl } from "./languagetag.impl";
import { getKnowns, isParsingDisabled } from "./languagetag.registry";

/** Preserves native canonicalization and each temporary/init/decision side effect. @param state - Actual private owner. @returns Whether the BCP47 value changed. */
export function canonicalize(state: LanguageTagImpl): boolean {
  let changed = false;
  state.getBcp47();
  if (state.meIsLiblangtagNeeded === D.DECISION_DONTKNOW) {
    let temporaryLocale = false,
      temporaryLangID = false;
    if (!state.mbInitializedLocale && !state.mbInitializedLangID) {
      if (state.mbSystemLocale) {
        state.mnLangID = MsLangId.getRealLanguage(LANGUAGE_SYSTEM);
        state.mbInitializedLangID = true;
      } else {
        const fields = { language: "", script: "", country: "", region: "", variants: "" },
          extraction = simpleExtract(text(state.maBcp47), fields);
        if (extraction !== E.EXTRACTED_NONE) {
          if (
            extraction === E.EXTRACTED_LSC ||
            extraction === E.EXTRACTED_LV ||
            extraction === E.EXTRACTED_LR
          ) {
            const normalized = [
              fields.language,
              fields.script,
              fields.country,
              fields.region,
              fields.variants,
            ]
              .filter(Boolean)
              .join("-");
            if (text(state.maBcp47) !== normalized) {
              state.maBcp47.assign(unicode(normalized));
              changed = true;
            }
          }
          if (
            (extraction === E.EXTRACTED_LSC && !fields.script) ||
            extraction === E.EXTRACTED_C_LOCALE
          ) {
            state.maLocale.Language.assign(unicode(fields.language));
            state.maLocale.Country.assign(unicode(fields.country));
          } else {
            state.maLocale.Language.assign(unicode("qlt"));
            state.maLocale.Country.assign(unicode(fields.country));
            state.maLocale.Variant.assign(state.maBcp47);
          }
          temporaryLocale = state.mbInitializedLocale = true;
        }
      }
    }
    if (state.mbInitializedLangID && !state.mbInitializedLocale) state.convertLangToLocale();
    if (state.mbInitializedLocale) {
      if (!state.mbInitializedLangID) {
        if (state.convertLocaleToLang(false)) changed = true;
        if (temporaryLocale || state.mnLangID === LANGUAGE_DONTKNOW) temporaryLangID = true;
      }
      if (state.mnLangID !== LANGUAGE_DONTKNOW && state.mnLangID !== LANGUAGE_SYSTEM)
        state.meIsLiblangtagNeeded = D.DECISION_NO;
      else if (getKnowns().has(text(state.maBcp47))) state.meIsLiblangtagNeeded = D.DECISION_NO;
      const override = MsLangId.Conversion.getOverride(state.maLocale);
      if (
        override.Language.getLength() &&
        (text(override.Language) !== text(state.maLocale.Language) ||
          text(override.Country) !== text(state.maLocale.Country) ||
          text(override.Variant) !== text(state.maLocale.Variant))
      ) {
        state.maBcp47.assign(convertToBcp47(override));
        changed = true;
        state.meIsIsoLocale = state.meIsIsoODF = D.DECISION_DONTKNOW;
        state.meIsLiblangtagNeeded = D.DECISION_NO;
      }
    }
    if (temporaryLocale) {
      state.mbInitializedLocale = false;
      state.maLocale.assign(new Locale());
    }
    if (temporaryLangID) {
      state.mbInitializedLangID = false;
      state.mnLangID = LANGUAGE_DONTKNOW;
    }
  }
  if (state.meIsLiblangtagNeeded === D.DECISION_NO) {
    state.meIsValid = D.DECISION_YES;
    return changed;
  }
  state.meIsLiblangtagNeeded = D.DECISION_YES;
  state.mpImplLangtag ??= lt_tag_new();
  const error: DiagnosticSlot = { error: null };
  if (!isParsingDisabled() && lt_tag_parse(state.mpImplLangtag, text(state.maBcp47), error)) {
    if (!error.error) {
      const result = lt_tag_canonicalize(state.mpImplLangtag, error);
      if (result !== null) {
        if (text(state.maBcp47) !== result) {
          state.maBcp47.assign(unicode(result));
          changed = true;
          state.meIsIsoLocale = state.meIsIsoODF = D.DECISION_DONTKNOW;
          if (!lt_tag_parse(state.mpImplLangtag, result, error)) {
            state.meIsValid = D.DECISION_NO;
            return changed;
          }
        }
        state.meIsValid = D.DECISION_YES;
        return changed;
      }
    }
  }
  state.meIsValid = D.DECISION_NO;
  return changed;
}

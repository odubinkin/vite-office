/** @fileoverview Original LanguageTagImpl BCP47-to-Locale/ID member transitions using the source component and ISO decision owners. */
import type { LanguageTagCanonicalState } from "./languagetag.canonicalize";
import {
  isIsoLocale,
  getLanguageFromLangtag,
  getRegionFromLangtag,
  getCountry,
} from "./languagetag.fields";
import { convertLocaleToLang } from "./languagetag.locale-id";
import { MsLangId } from "../../inc/mslangid";
import { LANGUAGE_SYSTEM } from "../../inc/lang";
import { unicode } from "../isolang/isolang.tables";

/** Original Locale rebuild; ISO uses raw region while qlt uses the country getter and full BCP47. @param this - Actual original private owner. @returns Nothing. */
export function convertBcp47ToLocale(this: LanguageTagCanonicalState): void {
  if (isIsoLocale.call(this)) {
    const language = getLanguageFromLangtag.call(this);
    try {
      this.maLocale.Language.assign(language);
    } finally {
      language.dispose();
    }
    const region = getRegionFromLangtag.call(this);
    try {
      this.maLocale.Country.assign(region);
    } finally {
      region.dispose();
    }
    this.maLocale.Variant.clear();
  } else {
    const marker = unicode("qlt");
    try {
      this.maLocale.Language.assign(marker);
    } finally {
      marker.dispose();
    }
    this.maLocale.Country.assign(getCountry.call(this));
    this.maLocale.Variant.assign(this.maBcp47);
  }
  this.mbInitializedLocale = true;
}

/** Original BCP47-to-ID transition and registration policy, preserving system handling and Locale-first order. @param this - Actual original private owner. @returns Nothing. */
export function convertBcp47ToLang(this: LanguageTagCanonicalState): void {
  if (this.mbSystemLocale) this.mnLangID = MsLangId.getRealLanguage(LANGUAGE_SYSTEM);
  else {
    if (!this.mbInitializedLocale) convertBcp47ToLocale.call(this);
    convertLocaleToLang.call(this, true);
  }
  this.mbInitializedLangID = true;
}

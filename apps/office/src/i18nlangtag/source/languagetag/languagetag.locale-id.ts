/** @fileoverview Original LanguageTagImpl Locale-to-ID remapping and optional on-the-fly registration dispatch; registry ownership remains with the enclosing owner. */
import { type LanguageTagConversionState } from "./languagetag.conversion";
import { type LanguageTagFieldState, getCountry, getLanguage } from "./languagetag.fields";
import { MsLangId } from "../../inc/mslangid";
import { primary, LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM } from "../../inc/lang";
import { OUString } from "../../../sal/inc/rtl/ustring";

/** Actual original fields and source member dependencies; no synthetic registration implementation is supplied. */
export interface LanguageTagLocaleToLangState
  extends LanguageTagConversionState, LanguageTagFieldState {
  /** Original ID-to-Locale conversion member. @returns Nothing. */
  convertLangToLocale(): void;
  /** Original Locale-to-BCP47 conversion member. @returns Nothing. */
  convertLocaleToBcp47(): void;
  /** Original validity query. @returns Whether the current tag is valid. */
  isValidBcp47(): boolean;
  /** Original ISO/ODF query. @returns Original predicate. */
  isIsoODF(): boolean;
  /** Original registration owner dispatch; returned ImplPtr is ignored by this member upstream. @param id - Suggested original ID. @returns Enclosing owner's original implementation pointer. */
  registerOnTheFly(id: number): { dispose(): void } | null;
}

/** Original Locale-to-ID member, including remapped-name refresh and source last-resort suppression. @param this - Actual private owner. @param allowOnTheFlyID - Original registration policy. @returns Whether BCP47 was remapped. */
export function convertLocaleToLang(
  this: LanguageTagLocaleToLangState,
  allowOnTheFlyID: boolean,
): boolean {
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
        const original = new OUString(this.maBcp47);
        try {
          this.convertLangToLocale();
          this.convertLocaleToBcp47();
          remapped = !this.maBcp47.equals(original);
        } finally {
          original.dispose();
        }
      }
    }
    if (this.mnLangID === LANGUAGE_DONTKNOW && allowOnTheFlyID && this.isValidBcp47()) {
      if (getCountry.call(this).getLength() === 0 && this.isIsoODF()) {
        const locale = MsLangId.Conversion.lookupFallbackLocale(this.maLocale);
        try {
          if (
            !locale.Language.equalsAsciiL(Uint8Array.of(101, 110), 2) ||
            getLanguage.call(this).equalsAsciiL(Uint8Array.of(101, 110), 2)
          ) {
            this.mnLangID = MsLangId.Conversion.convertLocaleToLanguage(locale);
            if (this.mnLangID !== LANGUAGE_DONTKNOW) this.mnLangID = primary(this.mnLangID);
          }
        } finally {
          locale.dispose();
        }
      }
      const registered = this.registerOnTheFly(this.mnLangID);
      registered?.dispose();
    }
  }
  this.mbInitializedLangID = true;
  return remapped;
}

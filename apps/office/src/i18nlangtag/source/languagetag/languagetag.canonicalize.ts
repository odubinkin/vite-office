/** @fileoverview Original LanguageTagImpl canonicalization/synchronization member group over existing conversion and liblangtag owners; enclosing registration and known-tag initialization remain separate. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { MsLangId } from "../../inc/mslangid";
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM } from "../../inc/lang";
import { text, unicode } from "../isolang/isolang.tables";
import { Decision as D, getBcp47, convertToBcp47 } from "./languagetag.conversion";
import { Extraction as E, simpleExtract } from "./languagetag.extract";
import type { LanguageTagLocaleToLangState } from "./languagetag.locale-id";
import { convertLocaleToLang } from "./languagetag.locale-id";
import { lt_tag_new, type Tag } from "../../../external/liblangtag/liblangtag/lt-tag";
import { lt_tag_parse } from "../../../external/liblangtag/liblangtag/lt-tag.parse";
import { lt_tag_canonicalize } from "../../../external/liblangtag/liblangtag/lt-tag.canonicalize";
import type { DiagnosticSlot } from "../../../external/liblangtag/liblangtag/lt-error";

/** Original free getKnowns dependency, kept lazy so known Locale/ID paths do not invoke the fallback-set initializer. */
export type KnownTagSetProvider = () => ReadonlySet<string>;

/** Actual private fields and original member dependencies used by this responsibility group. */
export interface LanguageTagCanonicalState extends LanguageTagLocaleToLangState {
  mpImplLangtag: Tag | null;
  meIsLiblangtagNeeded: D;
  meIsValid: D;
  meIsIsoLocale: D;
  meIsIsoODF: D;
  /** Original post-canonicalization Locale refresh. @returns Nothing. */
  convertBcp47ToLocale(): void;
  /** Original post-canonicalization ID refresh. @returns Nothing. */
  convertBcp47ToLang(): void;
}

let lt_tag_parse_disabled = false;
/** Original one-way parser disable, shared by callers in this process. @returns Nothing. */
export function disable_lt_tag_parse(): void {
  lt_tag_parse_disabled = true;
}

/** Assigns a logical source string through the actual shared owner and releases its temporary. @param target - Actual field. @param value - Source logical UTF16. @returns Nothing. */
function assign(target: OUString, value: string): void {
  const temporary = unicode(value);
  try {
    target.assign(temporary);
  } finally {
    temporary.dispose();
  }
}

/** Original LanguageTagImpl::canonicalize, with its original free known-set lookup supplied by the enclosing owner binding. @param this - Actual private fields and member dependencies. @param getKnowns - Original lazy known-tag set owner, not a replacement fallback algorithm. @returns Whether BCP47 changed, independently of validity. */
export function canonicalize(
  this: LanguageTagCanonicalState,
  getKnowns: KnownTagSetProvider,
): boolean {
  let changed = false;
  getBcp47(this);
  if (this.meIsLiblangtagNeeded === D.DECISION_DONTKNOW) {
    let temporaryLocale = false,
      temporaryLangID = false;
    if (!this.mbInitializedLocale && !this.mbInitializedLangID) {
      if (this.mbSystemLocale) {
        this.mnLangID = MsLangId.getRealLanguage(LANGUAGE_SYSTEM);
        this.mbInitializedLangID = true;
      } else {
        const fields = { language: "", script: "", country: "", region: "", variants: "" };
        const extracted = simpleExtract(text(this.maBcp47), fields);
        if (extracted !== E.EXTRACTED_NONE) {
          if (
            extracted === E.EXTRACTED_LSC ||
            extracted === E.EXTRACTED_LV ||
            extracted === E.EXTRACTED_LR
          ) {
            let rebuilt = fields.language;
            for (const component of [fields.script, fields.country, fields.region, fields.variants])
              if (component.length !== 0) rebuilt += "-" + component;
            if (text(this.maBcp47) !== rebuilt) {
              assign(this.maBcp47, rebuilt);
              changed = true;
            }
          }
          if (
            (extracted === E.EXTRACTED_LSC && fields.script.length === 0) ||
            extracted === E.EXTRACTED_C_LOCALE
          ) {
            assign(this.maLocale.Language, fields.language);
            assign(this.maLocale.Country, fields.country);
          } else {
            assign(this.maLocale.Language, "qlt");
            assign(this.maLocale.Country, fields.country);
            this.maLocale.Variant.assign(this.maBcp47);
          }
          temporaryLocale = this.mbInitializedLocale = true;
        }
      }
    }
    if (this.mbInitializedLangID && !this.mbInitializedLocale) this.convertLangToLocale();
    if (this.mbInitializedLocale) {
      if (!this.mbInitializedLangID) {
        if (convertLocaleToLang.call(this, false)) changed = true;
        if (temporaryLocale || this.mnLangID === LANGUAGE_DONTKNOW) temporaryLangID = true;
      }
      if (this.mnLangID !== LANGUAGE_DONTKNOW && this.mnLangID !== LANGUAGE_SYSTEM)
        this.meIsLiblangtagNeeded = D.DECISION_NO;
      else if (getKnowns().has(text(this.maBcp47))) this.meIsLiblangtagNeeded = D.DECISION_NO;
      const replacement = MsLangId.Conversion.getOverride(this.maLocale);
      try {
        if (replacement.Language.getLength() !== 0 && !replacement.equals(this.maLocale)) {
          const tag = convertToBcp47(replacement);
          try {
            this.maBcp47.assign(tag);
          } finally {
            tag.dispose();
          }
          changed = true;
          this.meIsIsoLocale = this.meIsIsoODF = D.DECISION_DONTKNOW;
          this.meIsLiblangtagNeeded = D.DECISION_NO;
        }
      } finally {
        replacement.dispose();
      }
    }
    if (temporaryLocale) {
      this.mbInitializedLocale = false;
      const empty = new Locale();
      try {
        this.maLocale.assign(empty);
      } finally {
        empty.dispose();
      }
    }
    if (temporaryLangID) {
      this.mbInitializedLangID = false;
      this.mnLangID = LANGUAGE_DONTKNOW;
    }
  }
  if (this.meIsLiblangtagNeeded === D.DECISION_NO) {
    this.meIsValid = D.DECISION_YES;
    return changed;
  }
  this.meIsLiblangtagNeeded = D.DECISION_YES;
  if (!this.mpImplLangtag) this.mpImplLangtag = lt_tag_new();
  const error: DiagnosticSlot = { error: null };
  if (!lt_tag_parse_disabled && lt_tag_parse(this.mpImplLangtag, text(this.maBcp47), error)) {
    if (error.error === null) {
      const tag = lt_tag_canonicalize(this.mpImplLangtag, error);
      if (tag !== null) {
        if (text(this.maBcp47) !== tag) {
          assign(this.maBcp47, tag);
          changed = true;
          this.meIsIsoLocale = this.meIsIsoODF = D.DECISION_DONTKNOW;
          if (!lt_tag_parse(this.mpImplLangtag, tag, error)) {
            this.meIsValid = D.DECISION_NO;
            return changed;
          }
        }
        this.meIsValid = D.DECISION_YES;
        return changed;
      }
    }
  }
  this.meIsValid = D.DECISION_NO;
  return changed;
}

/** Original synchronization guard and ordered refreshes: Locale before ID, only after a changed canonicalization. @param this - Actual original private owner. @param getKnowns - Original free lazy known set. @returns Whether canonicalization changed BCP47. */
export function synCanonicalize(
  this: LanguageTagCanonicalState,
  getKnowns: KnownTagSetProvider,
): boolean {
  let changed = false;
  if (this.meIsLiblangtagNeeded !== D.DECISION_NO && !this.mpImplLangtag) {
    changed = canonicalize.call(this, getKnowns);
    if (changed) {
      if (this.mbInitializedLocale) this.convertBcp47ToLocale();
      if (this.mbInitializedLangID) this.convertBcp47ToLang();
    }
  }
  return changed;
}

/** Original cached validity query; diagnostics do not synthesize validity if the enclosing state remains unknown. @param this - Actual private owner. @returns Original decision. */
export function isValidBcp47(this: LanguageTagCanonicalState): boolean {
  if (this.meIsValid === D.DECISION_DONTKNOW) this.synCanonicalize();
  return this.meIsValid === D.DECISION_YES;
}

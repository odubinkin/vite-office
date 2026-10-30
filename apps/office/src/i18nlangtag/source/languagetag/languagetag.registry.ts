/** @fileoverview Original semantic BCP47/ID/system registries and finite on-the-fly IDs; no physical ownership engine. */
import { LanguageTagImpl } from "./languagetag.impl";
import { LanguageTag } from "./languagetag.value";
import { ScriptType, createValueState, type LanguageTagValueState } from "./languagetag.state";
import { MsLangId } from "../../inc/mslangid";
import {
  LANGUAGE_DONTKNOW,
  LANGUAGE_SYSTEM,
  LANGUAGE_ON_THE_FLY_START as START,
  LANGUAGE_ON_THE_FLY_END as END,
  LANGUAGE_ON_THE_FLY_SUB_START as SUB_START,
  LANGUAGE_ON_THE_FLY_SUB_END as SUB_END,
} from "../../inc/lang";
import { text, lower } from "../isolang/isolang.tables";
import { convertToBcp47 } from "./languagetag.conversion";

const mapBcp47 = new Map<string, LanguageTagImpl>(),
  mapLangID = new Map<number, LanguageTagImpl>();
let systemLocale: LanguageTagImpl | null = null,
  dontKnow: LanguageTagImpl | null = null,
  nextLanguage = 0,
  parsingDisabled = false,
  knowns: Set<string> | null = null;

/** Source-known fallbacks built via actual numeric LanguageTag values and registry side effects. @returns Case-sensitive known strings. */
export function getKnowns(): ReadonlySet<string> {
  if (!knowns) {
    const values = new Set<string>();
    for (const row of MsLangId.getDefinedLanguagetags())
      for (const value of new LanguageTag(row.mnLang).getFallbackStrings(true))
        values.add(text(value));
    knowns = values;
  }
  return knowns;
}

/** Preserves native one-way parser-disable switch. @returns Nothing. */
export function disableParsing(): void {
  parsingDisabled = true;
}
/** Queries actual source switch. @returns Whether disabled. */
export function isParsingDisabled(): boolean {
  return parsingDisabled;
}

/** Allocates the next semantic UInt16 language identity. @returns Original ID or zero after exhaustion. */
function getNextOnTheFlyLanguage(): number {
  if (!nextLanguage) nextLanguage = MsLangId.makeLangID(SUB_START, START);
  else if (MsLangId.getPrimaryLanguage(nextLanguage) !== END) nextLanguage++;
  else {
    const sub = MsLangId.getSubLanguage(nextLanguage);
    if (sub === SUB_END) return 0;
    nextLanguage = MsLangId.makeLangID(sub + 1, START);
  }
  return nextLanguage;
}

/** Original finite dynamic range predicate. @param language - Native ID. @returns Membership. */
export function isOnTheFlyID(language: number): boolean {
  const primary = MsLangId.getPrimaryLanguage(language),
    sub = MsLangId.getSubLanguage(language);
  return START <= primary && primary <= END && SUB_START <= sub && sub <= SUB_END;
}
/** Original registration criterion for generated or suggested primary IDs. @param language - Native ID. @returns Native predicate. */
function isKnownOnTheFlyID(language: number): boolean {
  return (
    language !== LANGUAGE_DONTKNOW &&
    language !== LANGUAGE_SYSTEM &&
    (isOnTheFlyID(language) || language === MsLangId.getPrimaryLanguage(language))
  );
}
/** Implements source insert-not-overwrite semantics. @param id - Native ID. @param impl - Actual owner. @returns Nothing. */
function insertID(id: number, impl: LanguageTagImpl): void {
  if (!mapLangID.has(id)) mapLangID.set(id, impl);
}
/** Inserts an ASCII-case-insensitive native tag key. @param tag - Original value. @param impl - New owner. @returns Stored owner and insertion flag. */
function insertBcp(
  tag: string,
  impl: LanguageTagImpl,
): { value: LanguageTagImpl; inserted: boolean } {
  const key = lower(tag),
    old = mapBcp47.get(key);
  if (old) return { value: old, inserted: false };
  mapBcp47.set(key, impl);
  return { value: impl, inserted: true };
}

/** Original on-the-fly registration and suggested-ID collision rules. @param state - Actual implementation. @param suggested - Source suggested identity. @returns Registered owner or null for empty input. */
export function registerOnTheFly(
  state: LanguageTagImpl,
  suggested: number,
): LanguageTagImpl | null {
  if (!state.mbInitializedBcp47 && state.mbInitializedLocale) {
    state.maBcp47.assign(convertToBcp47(state.maLocale));
    state.mbInitializedBcp47 = state.maBcp47.getLength() !== 0;
  }
  if (!state.maBcp47.getLength()) return null;
  const key = lower(text(state.maBcp47));
  let impl = mapBcp47.get(key),
    other = false;
  if (impl) {
    if (impl !== state) {
      state.assign(impl);
      other = true;
    }
  } else {
    impl = new LanguageTagImpl(state);
    mapBcp47.set(key, impl);
  }
  if (!other || !impl.mbInitializedLangID) {
    if (!suggested || suggested === LANGUAGE_DONTKNOW) suggested = getNextOnTheFlyLanguage();
    else {
      const current = mapLangID.get(suggested);
      if (current && text(current.maBcp47) !== text(state.maBcp47))
        suggested = getNextOnTheFlyLanguage();
    }
    if (!suggested) return impl;
    impl.mnLangID = suggested;
    impl.mbInitializedLangID = true;
    if (impl !== state) {
      state.mnLangID = suggested;
      state.mbInitializedLangID = true;
    }
  }
  insertID(impl.mnLangID, impl);
  return impl;
}

/** Registers the actual front-end values,including system and round-trip shortcuts. @param state - Source front-end fields. @returns Shared native implementation. */
export function registerImpl(state: LanguageTagValueState): LanguageTagImpl {
  if (state.mbSystemLocale) {
    if (systemLocale) return systemLocale;
    if (!state.mbInitializedLangID) {
      state.mnLangID = MsLangId.getRealLanguage(LANGUAGE_SYSTEM);
      state.mbInitializedLangID = state.mnLangID !== LANGUAGE_SYSTEM;
    }
  }
  if (state.mbInitializedLangID) {
    if (state.mnLangID === LANGUAGE_DONTKNOW) {
      dontKnow ??= new LanguageTagImpl(state);
      return dontKnow;
    }
    if (systemLocale && systemLocale.mnLangID === state.mnLangID) return systemLocale;
  }
  if (!state.mbInitializedLangID && !state.mbInitializedBcp47) {
    if (
      !state.mbInitializedLocale &&
      (state.mbSystemLocale || state.maLocale.Language.getLength() !== 0)
    )
      state.mbInitializedLocale = true;
    state.maBcp47.assign(convertToBcp47(state.maLocale));
    state.mbInitializedBcp47 = state.maBcp47.getLength() !== 0;
  }
  if (
    state.mbInitializedBcp47 &&
    systemLocale &&
    text(systemLocale.maBcp47) === text(state.maBcp47)
  )
    return systemLocale;
  let impl: LanguageTagImpl;
  if (state.mbInitializedLangID) {
    const existing = mapLangID.get(state.mnLangID);
    if (existing) impl = existing;
    else {
      impl = new LanguageTagImpl(state);
      mapLangID.set(state.mnLangID, impl);
      if (!impl.mbInitializedLocale) impl.convertLangToLocale();
      const language = MsLangId.Conversion.convertLocaleToLanguage(impl.maLocale);
      if (!impl.mbInitializedBcp47) impl.convertLocaleToBcp47();
      if (language === impl.mnLangID) insertBcp(text(impl.maBcp47), impl);
    }
  } else if (state.maBcp47.getLength()) {
    const originalKey = lower(text(state.maBcp47)),
      existing = mapBcp47.get(originalKey);
    if (existing) impl = existing;
    else {
      impl = new LanguageTagImpl(state);
      mapBcp47.set(originalKey, impl);
      if (impl.synCanonicalize()) {
        const canonical = insertBcp(text(impl.maBcp47), impl);
        if (!canonical.inserted && canonical.value !== impl) {
          impl = canonical.value;
          mapBcp47.set(originalKey, impl);
        }
      }
      if (!impl.mbInitializedLangID) {
        if (!impl.mbInitializedLocale) impl.convertBcp47ToLocale();
        if (!impl.mbInitializedLangID) impl.convertLocaleToLang(true);
        let insert = isKnownOnTheFlyID(impl.mnLangID);
        if (!insert && impl.mnLangID !== LANGUAGE_DONTKNOW) {
          const bcp47 = convertToBcp47(
            MsLangId.Conversion.convertLanguageToLocale(impl.mnLangID, true),
          );
          insert = text(bcp47) === text(impl.maBcp47);
        }
        if (insert) insertID(impl.mnLangID, impl);
      }
    }
  } else impl = new LanguageTagImpl(state);
  if (state.mbSystemLocale && state.mbInitializedLangID) systemLocale = impl;
  return impl;
}

/** Original dynamic-ID script metadata lookup. @param id - Registered ID. @returns Metadata or UNKNOWN. */
export function getOnTheFlyScriptType(id: number): ScriptType {
  return mapLangID.get(id)?.getScriptType() ?? ScriptType.UNKNOWN;
}

/** Replaces the source system selection and prepares its actual registry owner. @param language - Non-system,non-unknown ID. @returns Nothing. */
export function setConfiguredSystemLanguage(language: number): void {
  if (language === LANGUAGE_SYSTEM || language === LANGUAGE_DONTKNOW) return;
  MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(language);
  systemLocale = null;
  // Source explicitly registers the new system owner,without requesting a public conversion.
  registerImpl(createValueState());
}

/** @fileoverview Original LanguageTag shared BCP47/ID maps, system/unknown caches, dynamic IDs and registration algorithms. JS maps retain source insertion/share decisions; mutex/ordered-tree layout is erased. */
import { ImplPtr } from "../../runtime/implementation-pointer";
import type { LanguageTagImpl } from "./languagetag.impl";
import type { LanguageTagValueState } from "./languagetag.value-state";
import { MsLangId } from "../../inc/mslangid";
import {
  LANGUAGE_SYSTEM,
  LANGUAGE_DONTKNOW,
  LanguageType,
  primary,
  LANGUAGE_ON_THE_FLY_START,
  LANGUAGE_ON_THE_FLY_END,
  LANGUAGE_ON_THE_FLY_SUB_START,
  LANGUAGE_ON_THE_FLY_SUB_END,
} from "../../inc/lang";
import { convertToBcp47 } from "./languagetag.conversion";
import { text, lower } from "../isolang/isolang.tables";
const mapBcp47 = new Map<string, ImplPtr<LanguageTagImpl>>();
const mapLangID = new Map<number, ImplPtr<LanguageTagImpl>>();
export const systemLocale = new ImplPtr<LanguageTagImpl>();
const dontKnow = new ImplPtr<LanguageTagImpl>();
let nextOnTheFly = 0;
/** Original primary/sub-language range predicate. @param id - Original raw ID. @returns Whether source reserves it dynamically. */
export function isOnTheFlyID(id: number): boolean {
  const p = primary(id),
    sub = id >>> 10;
  return (
    p >= LANGUAGE_ON_THE_FLY_START &&
    p <= LANGUAGE_ON_THE_FLY_END &&
    sub >= LANGUAGE_ON_THE_FLY_SUB_START &&
    sub <= LANGUAGE_ON_THE_FLY_SUB_END
  );
}
/** Original range allocation and zero after exhaustion. @returns Next raw ID or zero. */
function getNextOnTheFlyLanguage(): number {
  if (nextOnTheFly === 0)
    nextOnTheFly = (LANGUAGE_ON_THE_FLY_SUB_START << 10) | LANGUAGE_ON_THE_FLY_START;
  else if (primary(nextOnTheFly) !== LANGUAGE_ON_THE_FLY_END) nextOnTheFly++;
  else {
    const sub = nextOnTheFly >>> 10;
    if (sub === LANGUAGE_ON_THE_FLY_SUB_END) return 0;
    nextOnTheFly = ((sub + 1) << 10) | LANGUAGE_ON_THE_FLY_START;
  }
  return nextOnTheFly;
}
/** Original insert without replacement; a successful map value owns its pointer. @param map - Original map. @param key - Original comparison key. @param pointer - Borrowed owned pointer. @returns Source entry and insertion flag. */
function insert<K>(
  map: Map<K, ImplPtr<LanguageTagImpl>>,
  key: K,
  pointer: ImplPtr<LanguageTagImpl>,
): { pointer: ImplPtr<LanguageTagImpl>; inserted: boolean } {
  const existing = map.get(key);
  if (existing) return { pointer: existing, inserted: false };
  const copy = pointer.copy();
  map.set(key, copy);
  return { pointer: copy, inserted: true };
}
/** Original get-known-dynamic/suggested-primary predicate. @param id - Raw ID. @returns Source insertion policy. */
function knownOnTheFlyID(id: number): boolean {
  return (
    id !== LANGUAGE_DONTKNOW && id !== LANGUAGE_SYSTEM && (isOnTheFlyID(id) || id === primary(id))
  );
}
/** Original registerOnTheFly, returning an owned pointer whose ignored return must still be destroyed. @param source - Actual original implementation. @param suggestion - Source suggested ID. @returns Owned implementation pointer. */
export function registerOnTheFly(
  source: LanguageTagImpl,
  suggestion: number,
): ImplPtr<LanguageTagImpl> {
  const pointer = new ImplPtr<LanguageTagImpl>();
  try {
    if (!source.mbInitializedBcp47 && source.mbInitializedLocale) {
      const bcp = convertToBcp47(source.maLocale);
      try {
        source.maBcp47.assign(bcp);
      } finally {
        bcp.dispose();
      }
      source.mbInitializedBcp47 = source.maBcp47.getLength() !== 0;
    }
    if (source.maBcp47.getLength() === 0) return pointer;
    const key = lower(text(source.maBcp47)),
      existing = mapBcp47.get(key);
    let other = false;
    if (existing) {
      pointer.assign(existing);
      if (pointer.get() !== source) {
        source.assign(pointer.get() as LanguageTagImpl);
        other = true;
      }
    } else {
      pointer.reset(source.copy());
      insert(mapBcp47, key, pointer);
    }
    const target = pointer.get() as LanguageTagImpl;
    if (!other || !target.mbInitializedLangID) {
      if (suggestion === 0 || suggestion === LANGUAGE_DONTKNOW)
        suggestion = getNextOnTheFlyLanguage();
      else {
        const idEntry = mapLangID.get(suggestion)?.get();
        if (idEntry && !idEntry.maBcp47.equals(source.maBcp47))
          suggestion = getNextOnTheFlyLanguage();
      }
      if (suggestion === 0) return pointer;
      target.mnLangID = suggestion;
      target.mbInitializedLangID = true;
      if (target !== source) {
        source.mnLangID = suggestion;
        source.mbInitializedLangID = true;
      }
    }
    insert(mapLangID, target.mnLangID, pointer);
    return pointer;
  } catch (error) {
    pointer.dispose();
    throw error;
  }
}
/** Original numeric/string implementation constructor boundary. */
export type ImplementationFactory = (state: LanguageTagValueState) => LanguageTagImpl;
/** Original shared registration, preserving original shortcuts, round trips, alias sharing and non-replacing cross insertion. @param state - Actual public value fields. @param create - Original implementation constructor. @returns Owned registered implementation pointer. */
export function registerImpl(
  state: LanguageTagValueState,
  create: ImplementationFactory,
): ImplPtr<LanguageTagImpl> {
  if (state.mbSystemLocale) {
    if (systemLocale.get()) return systemLocale.copy();
    if (!state.mbInitializedLangID) {
      state.mnLangID = MsLangId.getRealLanguage(LANGUAGE_SYSTEM);
      state.mbInitializedLangID = state.mnLangID !== LANGUAGE_SYSTEM;
    }
  }
  if (state.mbInitializedLangID) {
    if (state.mnLangID === LANGUAGE_DONTKNOW) {
      if (!dontKnow.get()) dontKnow.reset(create(state));
      return dontKnow.copy();
    }
    if (systemLocale.get()?.mnLangID === state.mnLangID) return systemLocale.copy();
  }
  if (!state.mbInitializedLangID && !state.mbInitializedBcp47) {
    if (
      !state.mbInitializedLocale &&
      (state.mbSystemLocale || state.maLocale.Language.getLength() !== 0)
    )
      state.mbInitializedLocale = true;
    const bcp = convertToBcp47(state.maLocale);
    try {
      state.maBcp47.assign(bcp);
    } finally {
      bcp.dispose();
    }
    state.mbInitializedBcp47 = state.maBcp47.getLength() !== 0;
  }
  if (state.mbInitializedBcp47 && systemLocale.get()?.maBcp47.equals(state.maBcp47))
    return systemLocale.copy();
  const pointer = new ImplPtr<LanguageTagImpl>();
  try {
    if (state.mbInitializedLangID) {
      const existing = mapLangID.get(state.mnLangID);
      if (existing) pointer.assign(existing);
      else {
        pointer.reset(create(state));
        insert(mapLangID, state.mnLangID, pointer);
        const target = pointer.get() as LanguageTagImpl;
        if (!target.mbInitializedLocale) target.convertLangToLocale();
        const roundTrip = MsLangId.Conversion.convertLocaleToLanguage(target.maLocale);
        if (!target.mbInitializedBcp47) target.convertLocaleToBcp47();
        if (roundTrip === target.mnLangID) insert(mapBcp47, lower(text(target.maBcp47)), pointer);
      }
    } else if (state.maBcp47.getLength() !== 0) {
      const key = lower(text(state.maBcp47)),
        existing = mapBcp47.get(key);
      if (existing) pointer.assign(existing);
      else {
        pointer.reset(create(state));
        const original = insert(mapBcp47, key, pointer);
        let target = pointer.get() as LanguageTagImpl;
        if (target.synCanonicalize()) {
          const canonical = insert(mapBcp47, lower(text(target.maBcp47)), pointer);
          if (!canonical.inserted && canonical.pointer.get() !== target) {
            original.pointer.assign(canonical.pointer);
            pointer.assign(canonical.pointer);
            target = pointer.get() as LanguageTagImpl;
          }
        }
        if (!target.mbInitializedLangID) {
          if (!target.mbInitializedLocale) target.convertBcp47ToLocale();
          if (!target.mbInitializedLangID) target.convertLocaleToLang(true);
          let crossInsert = knownOnTheFlyID(target.mnLangID);
          if (!crossInsert && target.mnLangID !== LANGUAGE_DONTKNOW) {
            const locale = MsLangId.Conversion.convertLanguageToLocale(target.mnLangID, true);
            try {
              const bcp = convertToBcp47(locale);
              try {
                crossInsert = bcp.equals(target.maBcp47);
              } finally {
                bcp.dispose();
              }
            } finally {
              locale.dispose();
            }
          }
          if (crossInsert) insert(mapLangID, target.mnLangID, pointer);
        }
      }
    } else pointer.reset(create(state));
    if (state.mbSystemLocale && state.mbInitializedLangID) systemLocale.assign(pointer);
    return pointer;
  } catch (error) {
    pointer.dispose();
    throw error;
  }
}
/** Original registered script-type query. @param id - Raw registered ID. @returns Original script type or UNKNOWN. */
export function getOnTheFlyScriptType(id: number): number {
  return mapLangID.get(LanguageType(id))?.get()?.meScriptType ?? 0;
}

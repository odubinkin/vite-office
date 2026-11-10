/** @fileoverview Original RBBI cache declarations and consumed iterator-owner contract. Concrete iterator/engine factory installation is separate; no substitute owner is constructed here. */
import type { UText } from "./unicode/utext";
import type { RBBIForwardData, RBBIReverseData } from "./rbbidata.h";
import type { LanguageBreakEngine } from "./brkeng.h";
import type { DictionaryCache } from "./rbbi_cache";
/** Original UpdatePositionValues enum. */
export enum UpdatePositionValues {
  RetainCachePosition = 0,
  UpdateCachePosition = 1,
}
/** Actual original iterator fields/methods consumed by the caches. */
export interface RuleBasedBreakIteratorCacheOwner {
  fPosition: number;
  fRuleStatusIndex: number;
  fDone: boolean;
  fDictionaryCharCount: number;
  fText: UText;
  fData: RBBIForwardData & RBBIReverseData;
  fDictionaryCache: DictionaryCache;
  fIsPhraseBreaking: boolean;
  /** Original forward method. @returns Raw rule boundary. */
  handleNext(): number;
  /** Original safe reverse method. @param position - Native index. @returns Restart point. */
  handleSafePrevious(position: number): number;
  /** Original engine lookup. @param codepoint - Input. @param locale - Locale ID. @returns Actual engine or null. */
  getLanguageBreakEngine(codepoint: number, locale: string | null): LanguageBreakEngine | null;
  /** Original requested/valid/actual locale query. @param type - Locale selector. @param status - Shared status. @returns Locale ID. */
  getLocaleID(type: number, status: [number]): string | null;
}
export { BreakCache, DictionaryCache } from "./rbbi_cache";

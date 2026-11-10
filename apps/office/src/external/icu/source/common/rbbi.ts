/** @fileoverview Original ICU78.3 rule-data iterator ownership, public boundary operations and forward/safe reverse state machines. */
import { UTextStorage, type OpenUText, type UText } from "./unicode/utext";
import { BreakCache, DictionaryCache, type RuleBasedBreakIteratorCacheOwner } from "./rbbi_cache.h";
import { RBBIDataWrapper } from "./rbbidata";
import type { UDataMemory } from "./udatamem.h";
import { ICULanguageBreakFactory, UnhandledEngine } from "./brkeng";
import type { LanguageBreakEngine } from "./brkeng.h";
import { ECleanupCommonType, ucln_common_registerCleanup } from "./ucln_cmn.h";
import { UInitOnce, umtx_initOnce } from "./umutex.h";
import { Locale } from "./locid";
import { LocaleBased } from "./locbased";
import { ULocDataLocaleType } from "./unicode/uloc";
import { U_FAILURE } from "./unicode/utypes";
import {
  utext_getNativeIndex,
  utext_setNativeIndex,
  utext_next32,
  utext_previous32,
  utext_openUChars,
  utext_close,
  utext_clone,
  utext_char32At,
  utext_nativeLength,
} from "./utext";
import { ucptrie_get } from "./ucptrie";
import { RBBI_BOF_REQUIRED, type RBBIForwardData, type RBBIReverseData } from "./rbbidata.h";
/** Original fields consumed by the private safe reverse method. */
export interface RuleBasedBreakIteratorReverseState {
  fText: UText;
  fData: RBBIReverseData;
}
/** Original safe reverse method locates a safe restart point without changing iterator position/status/end fields. @param this - Actual prepared iterator fields. @param fromPosition - Original native UTF16 position. @returns Safe restart point or DONE. */
export function handleSafePrevious(
  this: RuleBasedBreakIteratorReverseState,
  fromPosition: number,
): number {
  const table = this.fData.fReverseTable;
  utext_setNativeIndex(this.fText, fromPosition);
  // Preserve source ordering: fData was already dereferenced before this null check.
  if (this.fData === null || utext_getNativeIndex(this.fText) === 0) return -1;
  let c = utext_previous32(this.fText),
    state = 1;
  const data = table.fTableData,
    rowLength = table.fRowLen / data.BYTES_PER_ELEMENT;
  let row = rowLength * state;
  for (; c !== -1; c = utext_previous32(this.fText)) {
    const category = ucptrie_get(this.fData.fTrie, c);
    state = data[row + 3 + category] as number;
    row = rowLength * state;
    if (state === 0) break;
  }
  return utext_getNativeIndex(this.fText);
}
/** Original fields consumed and mutated by the private forward method; no substitute iterator state owner or factory. */
export interface RuleBasedBreakIteratorForwardState {
  fText: UText;
  fData: RBBIForwardData;
  fPosition: number;
  fRuleStatusIndex: number;
  fDictionaryCharCount: number;
  fDone: boolean;
  fLookAheadMatches: Int32Array | null;
}
/** Original forward state machine; generic typed row views erase only the source template instantiation. @param this - Actual prepared iterator fields. @returns Following raw rule boundary or UBRK_DONE. */
export function handleNext(this: RuleBasedBreakIteratorForwardState): number {
  const table = this.fData.fForwardTable,
    data = table.fTableData,
    rowLength = table.fRowLen / data.BYTES_PER_ELEMENT,
    initial = this.fPosition;
  this.fRuleStatusIndex = 0;
  this.fDictionaryCharCount = 0;
  utext_setNativeIndex(this.fText, initial);
  let result = initial,
    c = utext_next32(this.fText);
  if (c === -1) {
    this.fDone = true;
    return -1;
  }
  let state = 1,
    row = rowLength * state,
    category = 0,
    mode = 1;
  if (table.fFlags & RBBI_BOF_REQUIRED) {
    category = 2;
    mode = 0;
  }
  for (;;) {
    if (c === -1) {
      if (mode === 2) break;
      mode = 2;
      category = 1;
    }
    if (mode === 1) {
      category = ucptrie_get(this.fData.fTrie, c);
      this.fDictionaryCharCount += Number(category >= table.fDictCategoriesStart);
    }
    state = data[row + 3 + category] as number;
    row = rowLength * state;
    const accepting = data[row] as number;
    if (accepting === 1) {
      if (mode !== 0) result = utext_getNativeIndex(this.fText);
      this.fRuleStatusIndex = data[row + 2] as number;
    } else if (accepting > 1) {
      const ahead = (this.fLookAheadMatches as Int32Array)[accepting] as number;
      if (ahead >= 0) {
        this.fRuleStatusIndex = data[row + 2] as number;
        this.fPosition = ahead;
        return ahead;
      }
    }
    const rule = data[row + 1] as number;
    // Preserve ICU-20837: accept completed lookahead before recording this row's slash position.
    if (rule > 1) (this.fLookAheadMatches as Int32Array)[rule] = utext_getNativeIndex(this.fText);
    if (state === 0) break;
    if (mode === 1) c = utext_next32(this.fText);
    else if (mode === 0) mode = 1;
  }
  if (result === initial) {
    utext_setNativeIndex(this.fText, initial);
    utext_next32(this.fText);
    result = utext_getNativeIndex(this.fText);
    this.fRuleStatusIndex = 0;
  }
  this.fPosition = result;
  return result;
}

let gLanguageBreakFactories: ICULanguageBreakFactory[] | null = null;
const gLanguageBreakFactoriesInitOnce = new UInitOnce();

/** Original cleanup of the common factory owners. @returns True. */
function rbbi_cleanup(): boolean {
  if (gLanguageBreakFactories !== null) {
    for (const factory of gLanguageBreakFactories) factory.dispose();
    gLanguageBreakFactories = null;
  }
  gLanguageBreakFactoriesInitOnce.reset();
  return true;
}

/** Original default ICU factory initialization in the build without a local service hook. @param status - Sticky status. @returns Nothing. */
function initLanguageFactories(status: [number]): void {
  if (!U_FAILURE(status[0])) gLanguageBreakFactories = [new ICULanguageBreakFactory()];
  ucln_common_registerCleanup(ECleanupCommonType.UCLN_COMMON_RBBI, rbbi_cleanup);
}

/** Original shared language-factory lookup. @param c - Input code point. @param locale - Requested locale. @returns Borrowed engine or null. */
function getLanguageBreakEngineFromFactory(
  c: number,
  locale: string | null,
): LanguageBreakEngine | null {
  const status: [number] = [0];
  umtx_initOnce(gLanguageBreakFactoriesInitOnce, initLanguageFactories, status);
  const factories = gLanguageBreakFactories;
  if (U_FAILURE(status[0]) || factories === null) return null;
  for (let i = factories.length - 1; i >= 0; --i) {
    const engine = (factories[i] as ICULanguageBreakFactory).getEngineFor(c, locale);
    if (engine !== null) return engine;
  }
  return null;
}

/** Original UDataMemory-backed iterator, rule cache and dictionary engine owner. */
export class RuleBasedBreakIterator implements RuleBasedBreakIteratorCacheOwner {
  private readonly text = new UTextStorage();
  private data: RBBIDataWrapper | null = null;
  private breakCache: BreakCache | null = null;
  private dictionaryCache: DictionaryCache | null = null;
  private fLanguageBreakEngines: LanguageBreakEngine[] | null = null;
  private fUnhandledBreakEngine: UnhandledEngine | null = null;
  private requestLocale = Locale.getRoot();
  private validLocale = Locale.getRoot();
  private actualLocale = Locale.getRoot();
  fErrorCode = 0;
  fPosition = 0;
  fRuleStatusIndex = 0;
  fDone = false;
  fDictionaryCharCount = 0;
  fLookAheadMatches: Int32Array | null = null;
  fIsPhraseBreaking = false;

  /** Original common initialization followed by adoption of the passed rule handle. @param memory - Actual opened rule handle. @param status - Sticky status. @param dictionaryFactory - Rule-package dictionary variant when provided. @returns Iterator owner. */
  constructor(
    memory: UDataMemory | null,
    status: [number],
    private readonly dictionaryFactory?: ICULanguageBreakFactory,
  ) {
    utext_openUChars(this.text, null, 0, status);
    const dictionaryCache = new DictionaryCache(this, status);
    const breakCache = new BreakCache(this, status);
    if (U_FAILURE(status[0])) this.fErrorCode = status[0];
    else {
      this.dictionaryCache = dictionaryCache;
      this.breakCache = breakCache;
    }

    this.data = new RBBIDataWrapper(memory, status);
    if (U_FAILURE(status[0])) return;
    const size = this.fData.fForwardTable.fLookAheadResultsSize;
    if (size > 0) this.fLookAheadMatches = new Int32Array(size);
  }

  /** Borrowed provider after successful initialization. @returns Actual text. */
  get fText(): OpenUText {
    return this.text as OpenUText;
  }

  /** Borrowed rule wrapper after successful initialization. @returns Actual rule fields. */
  get fData(): RBBIDataWrapper & RBBIForwardData & RBBIReverseData {
    return this.data as RBBIDataWrapper & RBBIForwardData & RBBIReverseData;
  }

  /** Borrowed dictionary cache after successful initialization. @returns Actual cache. */
  get fDictionaryCache(): DictionaryCache {
    return this.dictionaryCache as DictionaryCache;
  }

  /** Original iterator engine lookup, with a per-iterator last-priority reject engine. @param codepoint - Input scalar. @param locale - Requested locale ID. @returns Borrowed engine or null. */
  getLanguageBreakEngine(codepoint: number, locale: string | null): LanguageBreakEngine | null {
    const engines = (this.fLanguageBreakEngines ??= []);
    for (let i = engines.length - 1; i >= 0; --i) {
      const engine = engines[i] as LanguageBreakEngine;
      if (engine.handles(codepoint, locale)) return engine;
    }
    const engine =
      this.dictionaryFactory === undefined
        ? getLanguageBreakEngineFromFactory(codepoint, locale)
        : this.dictionaryFactory.getEngineFor(codepoint, locale);
    if (engine !== null) {
      engines.push(engine);
      return engine;
    }
    if (this.fUnhandledBreakEngine === null) {
      this.fUnhandledBreakEngine = new UnhandledEngine();
      engines.unshift(this.fUnhandledBreakEngine);
    }
    this.fUnhandledBreakEngine.handleCharacter(codepoint);
    return this.fUnhandledBreakEngine;
  }

  /** Publishes the original locale identities selected by the ICU resource constructor. @param requested - Original request. @param valid - Selected locale resource. @param actual - Actual rule locale. @returns Nothing. */
  setLocaleIDs(requested: Locale, valid: Locale, actual: Locale): void {
    this.requestLocale = new Locale(requested);
    this.validLocale = new Locale(valid);
    this.actualLocale = new Locale(actual);
  }

  /** Original three root defaults and locale lookup after resource construction. @param type - Locale selector. @param status - Sticky status. @returns Locale ID. */
  getLocaleID(type: number, status: [number]): string | null {
    if (U_FAILURE(status[0])) return null;
    if (type === ULocDataLocaleType.ULOC_REQUESTED_LOCALE) return this.requestLocale.getName();
    return LocaleBased.getLocaleID(this.validLocale, this.actualLocale, type, status);
  }

  /** Original rule forward dispatch over this owner. @returns Boundary or DONE. */
  handleNext(): number {
    return handleNext.call(this);
  }

  /** Original safe reverse dispatch over this owner. @param position - Starting native index. @returns Restart point or DONE. */
  handleSafePrevious(position: number): number {
    return handleSafePrevious.call(this, position);
  }

  /** Original UText setter for the rule iteration API. @param text - Open input provider. @param status - Sticky status. @returns Nothing. */
  setText(text: OpenUText, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    (this.breakCache as BreakCache).reset();
    this.fDictionaryCache.reset();
    utext_clone(this.text, text, false, true, status);
    this.first();
  }

  /** Original borrowed-text clone. @param fillIn - Destination or null. @param status - Sticky status. @returns Cloned provider. */
  getUText(fillIn: UTextStorage | null, status: [number]): UTextStorage | null {
    return utext_clone(fillIn, this.fText, false, true, status);
  }

  /** Original beginning boundary and current-state publication. @returns Zero. */
  first(): number {
    const cache = this.breakCache as BreakCache;
    if (!cache.seek(0)) cache.populateNear(0, [0]);
    cache.current();
    return 0;
  }

  /** Original end boundary with isBoundary side effects. @returns End offset. */
  last(): number {
    const position = utext_nativeLength(this.fText);
    this.isBoundary(position);
    return position;
  }

  /** Original iteration position. @returns Current boundary offset. */
  current(): number {
    return this.fPosition;
  }

  /** Original forward or counted movement. @param count - Signed movement count when present. @returns Boundary or DONE. */
  next(count?: number): number {
    if (count === undefined) {
      (this.breakCache as BreakCache).next();
      return this.fDone ? -1 : this.fPosition;
    }
    if (count === 0) return this.current();
    let result = 0;
    if (count > 0) {
      for (; count > 0 && result !== -1; --count) result = this.next();
    } else {
      for (; count < 0 && result !== -1; ++count) result = this.previous();
    }
    return result;
  }

  /** Original preceding movement from the current boundary. @returns Boundary or DONE. */
  previous(): number {
    (this.breakCache as BreakCache).previous([0]);
    return this.fDone ? -1 : this.fPosition;
  }

  /** Original following query, normalizing input to a codepoint start. @param position - Native index. @returns Boundary or DONE. */
  following(position: number): number {
    if (position < 0) return this.first();
    utext_setNativeIndex(this.fText, position);
    (this.breakCache as BreakCache).following(utext_getNativeIndex(this.fText), [0]);
    return this.fDone ? -1 : this.fPosition;
  }

  /** Original preceding query and end clamping. @param position - Native index. @returns Boundary or DONE. */
  preceding(position: number): number {
    if (position > utext_nativeLength(this.fText)) return this.last();
    utext_setNativeIndex(this.fText, position);
    (this.breakCache as BreakCache).preceding(utext_getNativeIndex(this.fText), [0]);
    return this.fDone ? -1 : this.fPosition;
  }

  /** Original boundary predicate with cursor advancement. @param position - Native index. @returns Whether the original position is a boundary. */
  isBoundary(position: number): boolean {
    if (position < 0) {
      this.first();
      return false;
    }
    utext_setNativeIndex(this.fText, position);
    const adjusted = utext_getNativeIndex(this.fText);
    const cache = this.breakCache as BreakCache;
    let result = false;
    if (cache.seek(adjusted) || cache.populateNear(adjusted, [0]))
      result = cache.current() === position;
    if (result && adjusted < position && utext_char32At(this.fText, position) === -1) return false;
    if (!result) this.next();
    return result;
  }

  /** Original largest rule tag for the current boundary. @returns Rule tag. */
  getRuleStatus(): number {
    const table = this.fData.fRuleStatusTable as Int32Array;
    return table[this.fRuleStatusIndex + (table[this.fRuleStatusIndex] as number)] as number;
  }

  /** Original destructor order for the represented text, rule and cache ownership. @returns Nothing. */
  dispose(): void {
    utext_close(this.text);
    this.data?.removeReference();
    this.data = null;
    this.breakCache = null;
    this.dictionaryCache = null;
    this.fLanguageBreakEngines = null;
    this.fUnhandledBreakEngine = null;
    this.fLookAheadMatches = null;
  }
}

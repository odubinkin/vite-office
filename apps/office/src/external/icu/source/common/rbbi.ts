/** @fileoverview Original ICU78.3 RuleBasedBreakIterator state machines and public UTF16 word boundary operations. */
import type { RBBIDataWrapper } from "./rbbidata";
import { ucptrie_get } from "./ucptrie";
import { dictionaryNativeIndex } from "./dictbe";
import type { ICULanguageBreakFactory } from "./brkeng";
import { BreakCache, DictionaryCache, type BreakBoundary } from "./rbbi_cache";

/** Raw native DFA candidate and its dictionary admission count. */
export interface RuleBreakCandidate extends BreakBoundary {
  readonly dictionaryCount: number;
}

/** Original rule owner and its public boundary cache. */
export class RuleBasedBreakIterator {
  private fPosition = 0;
  private fRuleStatusIndex = 0;
  private fDictionaryCharCount = 0;
  private readonly fLookAheadMatches: Int32Array;
  private readonly cache: BreakCache;

  /** Owns the forward iterator state for one immutable UTF16 input. @param fData - Native compiled rules. @param text - UTF16 input. @param factory - Actual prepared word dictionaries for public refinement. @param locale - ICU requested locale. @param phrase - Native phrase selector. @returns Iterator. */
  constructor(
    private readonly fData: RBBIDataWrapper,
    private text: string,
    factory?: ICULanguageBreakFactory,
    locale = "",
    phrase = false,
  ) {
    this.fLookAheadMatches = new Int32Array(fData.fForwardTable.fLookAheadResultsSize).fill(-1);
    this.cache = new BreakCache(
      this,
      text,
      new DictionaryCache(text, fData, factory, locale, phrase),
    );
  }

  /** Changes the native UTF16 input and resets its break caches. @param text - New source text. @returns Nothing. */
  setText(text: string): void {
    this.text = text;
    this.cache.setText(text);
    this.first();
  }

  /** Selects the beginning of the native UTF16 text. @returns Position zero. */
  first(): number {
    this.cache.seek(0);
    this.cache.done = false;
    return this.publish();
  }

  /** Selects the end of the native UTF16 text. @returns Native end position. */
  last(): number {
    this.isBoundary(this.text.length);
    return this.text.length;
  }

  /** Returns the selected public position even after DONE. @returns Native boundary. */
  current(): number {
    return this.fPosition;
  }

  /** Advances the original number of cached public boundaries. @param count - Signed steps. @returns Native position or DONE. */
  next(count = 1): number {
    let result = this.current();
    for (; count > 0 && result !== -1; --count) {
      this.cache.next();
      result = this.publish();
    }
    for (; count < 0 && result !== -1; ++count) result = this.previous();
    return result;
  }

  /** Moves to the preceding cached boundary. @returns Native position or DONE. */
  previous(): number {
    this.cache.previous();
    return this.publish();
  }

  /** Selects the first boundary after the supplied native offset. @param offset - UTF16 offset. @returns Native position or DONE. */
  following(offset: number): number {
    if (offset < 0) return this.first();
    this.cache.seek(dictionaryNativeIndex(this.text, offset));
    this.cache.done = false;
    return this.next();
  }

  /** Selects the last boundary before the supplied native offset. @param offset - UTF16 offset. @returns Native position or DONE. */
  preceding(offset: number): number {
    if (offset > this.text.length) return this.last();
    const position = dictionaryNativeIndex(this.text, offset);
    this.cache.seek(position);
    if (this.cache.boundary().position === position) return this.previous();
    this.cache.done = false;
    return this.publish();
  }

  /** Tests the exact source offset and positions the iterator at or after it. @param offset - UTF16 offset. @returns Whether the original offset was a boundary. */
  isBoundary(offset: number): boolean {
    if (offset < 0) {
      this.first();
      return false;
    }
    this.cache.seek(dictionaryNativeIndex(this.text, offset));
    this.cache.done = false;
    if (this.publish() === offset) return true;
    this.next();
    return false;
  }

  /** Publishes the original cache's cursor and rule status. @returns Native position or DONE. */
  private publish(): number {
    const boundary = this.cache.boundary();
    this.fPosition = boundary.position;
    this.fRuleStatusIndex = boundary.status;
    return this.cache.done ? -1 : boundary.position;
  }

  /** Runs the native forward DFA from a cache-owned boundary. @param position - Native start. @returns Candidate, status and dictionary count. */
  handleNextFrom(position: number): RuleBreakCandidate {
    this.fPosition = position;
    const end = this.handleNext();
    return {
      position: end,
      status: this.fRuleStatusIndex,
      dictionaryCount: this.fDictionaryCharCount,
    };
  }

  /** Uses the compiled safe reverse table to choose a restart offset. @param from - Native starting offset. @returns Safe position or DONE. */
  handleSafePrevious(from: number): number {
    let position = dictionaryNativeIndex(this.text, from);
    if (position === 0) return -1;
    let state = 1;
    while (position > 0) {
      position = dictionaryNativeIndex(this.text, position - 1);
      const category = ucptrie_get(this.fData.fTrie, this.text.codePointAt(position) as number);
      state = this.fData.fReverseTable.row(state, 3 + category);
      if (state === 0) break;
    }
    return position;
  }

  /** Native handleNext before dictionary refinement or public break caching. @returns Next candidate boundary, or -1 at the end. */
  handleNext(): number {
    this.fRuleStatusIndex = 0;
    this.fDictionaryCharCount = 0;
    const initial = this.fPosition;
    let position = initial;
    let code = this.text.codePointAt(position);
    if (code === undefined) return -1;
    position += code > 0xffff ? 2 : 1;
    const first = position;
    const table = this.fData.fForwardTable;
    let state = 1,
      category = 0,
      result = initial,
      mode = 0;
    if (table.fFlags & 2) {
      category = 2;
      mode = 1;
    }

    for (;;) {
      if (code === undefined) {
        if (mode === 2) break;
        mode = 2;
        category = 1;
      }
      if (mode === 0 && code !== undefined) {
        category = ucptrie_get(this.fData.fTrie, code);
        if (category >= table.fDictCategoriesStart) ++this.fDictionaryCharCount;
      }
      state = table.row(state, 3 + category);
      const accepting = table.row(state, 0);
      if (accepting === 1) {
        if (mode !== 1) result = position;
        this.fRuleStatusIndex = table.row(state, 2);
      } else if (accepting > 1) {
        const lookAhead = this.fLookAheadMatches[accepting] as number;
        if (lookAhead >= 0) {
          this.fRuleStatusIndex = table.row(state, 2);
          this.fPosition = lookAhead;
          return lookAhead;
        }
      }
      const rule = table.row(state, 1);
      if (rule > 1) this.fLookAheadMatches[rule] = position;
      if (!state) break;
      if (mode === 0) {
        code = this.text.codePointAt(position);
        if (code !== undefined) position += code > 0xffff ? 2 : 1;
      } else if (mode === 1) mode = 0;
    }
    if (result === initial) {
      result = first;
      this.fRuleStatusIndex = 0;
    }
    this.fPosition = result;
    return result;
  }

  /** Borrows the dictionary-character admission from the latest rule-machine run. @returns Native count. */
  getDictionaryCharCount(): number {
    return this.fDictionaryCharCount;
  }

  /** Borrows the status selected by the latest rule-machine run. @returns Largest matching rule status. */
  getRuleStatus(): number {
    return this.fData.getRuleStatus(this.fRuleStatusIndex);
  }
}

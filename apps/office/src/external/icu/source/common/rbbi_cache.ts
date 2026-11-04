/** @fileoverview Original ICU78.3 RBBI dictionary and circular boundary caches. Exact source thresholds, refill strategy and statuses are retained; actual iterator/engine owners must satisfy the source contract. */
import { UVector32 } from "./uvectr32.h";
import { UErrorCode, U_FAILURE, U_SUCCESS } from "./unicode/utypes";
import { ULocDataLocaleType } from "./unicode/uloc";
import {
  utext_setNativeIndex,
  utext_getNativeIndex,
  utext_next32,
  utext_current32,
  utext_getPreviousNativeIndex,
  utext_nativeLength,
} from "./utext";
import { ucptrie_get } from "./ucptrie";
import {
  UpdatePositionValues as Update,
  type RuleBasedBreakIteratorCacheOwner,
} from "./rbbi_cache.h";
/** Source unreachable macro projects to a JavaScript trap; valid cache invariants exclude this path. @returns Never. */
function unreachable(): never {
  throw new Error("UPRV_UNREACHABLE_EXIT");
}
/** Original dictionary cache owns boundary storage separately from the main circular cache. */
export class DictionaryCache {
  readonly fBreaks: UVector32;
  fPositionInCache = -1;
  fStart = 0;
  fLimit = 0;
  fFirstRuleStatusIndex = 0;
  fOtherRuleStatusIndex = 0;
  /** Original constructor. @param fBI - Actual iterator owner. @param status - Shared status. @returns Cache. */
  constructor(
    public fBI: RuleBasedBreakIteratorCacheOwner,
    status: [number],
  ) {
    this.fBreaks = new UVector32(status);
  }
  /** Original reset clears fields and logical vector length. @returns Nothing. */
  reset(): void {
    this.fPositionInCache = -1;
    this.fStart = this.fLimit = this.fFirstRuleStatusIndex = this.fOtherRuleStatusIndex = 0;
    this.fBreaks.removeAllElements();
  }
  /** Original sequential/random following lookup preserves output arguments on failure. @param from - Source position. @param result - Output boundary. @param statusIndex - Output rule status. @returns Found. */
  following(from: number, result: [number], statusIndex: [number]): boolean {
    if (from >= this.fLimit || from < this.fStart) {
      this.fPositionInCache = -1;
      return false;
    }
    if (
      this.fPositionInCache >= 0 &&
      this.fPositionInCache < this.fBreaks.size() &&
      this.fBreaks.elementAti(this.fPositionInCache) === from
    ) {
      if (++this.fPositionInCache >= this.fBreaks.size()) {
        this.fPositionInCache = -1;
        return false;
      }
      result[0] = this.fBreaks.elementAti(this.fPositionInCache);
      statusIndex[0] = this.fOtherRuleStatusIndex;
      return true;
    }
    for (
      this.fPositionInCache = 0;
      this.fPositionInCache < this.fBreaks.size();
      ++this.fPositionInCache
    ) {
      const r = this.fBreaks.elementAti(this.fPositionInCache);
      if (r > from) {
        result[0] = r;
        statusIndex[0] = this.fOtherRuleStatusIndex;
        return true;
      }
    }
    return unreachable();
  }
  /** Original preceding lookup selects the first boundary's distinct status. @param from - Source position. @param result - Output boundary. @param statusIndex - Output rule status. @returns Found. */
  preceding(from: number, result: [number], statusIndex: [number]): boolean {
    if (from <= this.fStart || from > this.fLimit) {
      this.fPositionInCache = -1;
      return false;
    }
    if (from === this.fLimit) this.fPositionInCache = this.fBreaks.size() - 1;
    if (
      this.fPositionInCache > 0 &&
      this.fPositionInCache < this.fBreaks.size() &&
      this.fBreaks.elementAti(this.fPositionInCache) === from
    ) {
      const r = this.fBreaks.elementAti(--this.fPositionInCache);
      result[0] = r;
      statusIndex[0] = r === this.fStart ? this.fFirstRuleStatusIndex : this.fOtherRuleStatusIndex;
      return true;
    }
    if (this.fPositionInCache === 0) {
      this.fPositionInCache = -1;
      return false;
    }
    for (
      this.fPositionInCache = this.fBreaks.size() - 1;
      this.fPositionInCache >= 0;
      --this.fPositionInCache
    ) {
      const r = this.fBreaks.elementAti(this.fPositionInCache);
      if (r < from) {
        result[0] = r;
        statusIndex[0] =
          r === this.fStart ? this.fFirstRuleStatusIndex : this.fOtherRuleStatusIndex;
        return true;
      }
    }
    return unreachable();
  }
  /** Original engine consumer; actual language engines are supplied only by the real iterator owner. @param start - Range start. @param end - Range end. @param first - First-boundary status. @param other - Remaining status. @returns Nothing. */
  populateDictionary(start: number, end: number, first: number, other: number): void {
    if (end - start <= 1) return;
    this.reset();
    this.fFirstRuleStatusIndex = first;
    this.fOtherRuleStatusIndex = other;
    const bi = this.fBI,
      text = bi.fText,
      status: [number] = [UErrorCode.U_ZERO_ERROR];
    let found = 0,
      current: number;
    utext_setNativeIndex(text, start);
    let c = utext_current32(text),
      category = ucptrie_get(bi.fData.fTrie, c);
    const dictStart = bi.fData.fForwardTable.fDictCategoriesStart;
    while (U_SUCCESS(status[0])) {
      while ((current = utext_getNativeIndex(text)) < end && category < dictStart) {
        utext_next32(text);
        c = utext_current32(text);
        category = ucptrie_get(bi.fData.fTrie, c);
      }
      if (current >= end) break;
      const engine = bi.getLanguageBreakEngine(
        c,
        bi.getLocaleID(ULocDataLocaleType.ULOC_REQUESTED_LOCALE, status),
      );
      if (engine !== null)
        found += engine.findBreaks(text, current, end, this.fBreaks, bi.fIsPhraseBreaking, status);
      c = utext_current32(text);
      category = ucptrie_get(bi.fData.fTrie, c);
    }
    if (found > 0) {
      if (start < this.fBreaks.elementAti(0)) this.fBreaks.insertElementAt(start, 0, status);
      if (end > this.fBreaks.peeki()) this.fBreaks.push(end, status);
      this.fPositionInCache = 0;
      this.fStart = this.fBreaks.elementAti(0);
      this.fLimit = this.fBreaks.peeki();
    }
  }
}
/** Original128-slot circular cache with separate logical/cache/iterator positions. */
export class BreakCache {
  private fStartBufIdx = 0;
  private fEndBufIdx = 0;
  private fTextIdx = 0;
  private fBufIdx = 0;
  private readonly fBoundaries = new Int32Array(128);
  private readonly fStatuses = new Uint16Array(128);
  private readonly fSideBuffer: UVector32;
  /** Original constructor initializes the side buffer then resets the cache even with incoming status failure. @param fBI - Actual owner. @param status - Shared status. @returns Cache. */
  constructor(
    private fBI: RuleBasedBreakIteratorCacheOwner,
    status: [number],
  ) {
    this.fSideBuffer = new UVector32(status);
    this.reset();
  }
  /** Original circular index masking. @param index - Signed index. @returns Wrapped index. */
  private static modChunkSize(index: number): number {
    return index & 127;
  }
  /** Original cache reset does not publish into the iterator. @param position - Starting boundary. @param status - Rule status. @returns Nothing. */
  reset(position = 0, status = 0): void {
    this.fStartBufIdx = this.fEndBufIdx = this.fBufIdx = 0;
    this.fTextIdx = position;
    this.fBoundaries[0] = position;
    this.fStatuses[0] = status;
  }
  /** Original current publication clears done. @returns Current boundary. */
  current(): number {
    this.fBI.fPosition = this.fTextIdx;
    this.fBI.fRuleStatusIndex = this.fStatuses[this.fBufIdx] as number;
    this.fBI.fDone = false;
    return this.fTextIdx;
  }
  /** Original inline fast path deliberately leaves done untouched. @returns Nothing. */
  next(): void {
    if (this.fBufIdx === this.fEndBufIdx) this.nextOL();
    else {
      this.fBufIdx = BreakCache.modChunkSize(this.fBufIdx + 1);
      this.fTextIdx = this.fBI.fPosition = this.fBoundaries[this.fBufIdx] as number;
      this.fBI.fRuleStatusIndex = this.fStatuses[this.fBufIdx] as number;
    }
  }
  /** Original refill path publishes done from populateFollowing. @returns Nothing. */
  nextOL(): void {
    this.fBI.fDone = !this.populateFollowing();
    this.fBI.fPosition = this.fTextIdx;
    this.fBI.fRuleStatusIndex = this.fStatuses[this.fBufIdx] as number;
  }
  /** Original previous refill/fast path. @param status - Shared status. @returns Nothing. */
  previous(status: [number]): void {
    if (U_FAILURE(status[0])) return;
    const initial = this.fBufIdx;
    if (this.fBufIdx === this.fStartBufIdx) this.populatePreceding(status);
    else {
      this.fBufIdx = BreakCache.modChunkSize(this.fBufIdx - 1);
      this.fTextIdx = this.fBoundaries[this.fBufIdx] as number;
    }
    this.fBI.fDone = this.fBufIdx === initial;
    this.fBI.fPosition = this.fTextIdx;
    this.fBI.fRuleStatusIndex = this.fStatuses[this.fBufIdx] as number;
  }
  /** Original following composition. @param start - Pinned native position. @param status - Shared status. @returns Nothing. */
  following(start: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    if (start === this.fTextIdx || this.seek(start) || this.populateNear(start, status)) {
      this.fBI.fDone = false;
      this.next();
    }
  }
  /** Original preceding composition. @param start - Pinned native position. @param status - Shared status. @returns Nothing. */
  preceding(start: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    if (start === this.fTextIdx || this.seek(start) || this.populateNear(start, status)) {
      if (start === this.fTextIdx) this.previous(status);
      else this.current();
    }
  }
  /** Original wrapped binary search leaves the cache on the boundary at or before input. @param position - Pinned source position. @returns In cached range. */
  seek(position: number): boolean {
    if (
      position < (this.fBoundaries[this.fStartBufIdx] as number) ||
      position > (this.fBoundaries[this.fEndBufIdx] as number)
    )
      return false;
    if (position === this.fBoundaries[this.fStartBufIdx]) {
      this.fBufIdx = this.fStartBufIdx;
      this.fTextIdx = this.fBoundaries[this.fBufIdx] as number;
      return true;
    }
    if (position === this.fBoundaries[this.fEndBufIdx]) {
      this.fBufIdx = this.fEndBufIdx;
      this.fTextIdx = this.fBoundaries[this.fBufIdx] as number;
      return true;
    }
    let min = this.fStartBufIdx,
      max = this.fEndBufIdx;
    while (min !== max) {
      let probe = Math.trunc((min + max + (min > max ? 128 : 0)) / 2);
      probe = BreakCache.modChunkSize(probe);
      if ((this.fBoundaries[probe] as number) > position) max = probe;
      else min = BreakCache.modChunkSize(probe + 1);
    }
    this.fBufIdx = BreakCache.modChunkSize(max - 1);
    this.fTextIdx = this.fBoundaries[this.fBufIdx] as number;
    return true;
  }
  /** Original source-near refill strategy;15/4 are the pinned ICU constants. @param position - Pinned native index. @param status - Shared status. @returns Success. */
  populateNear(position: number, status: [number]): boolean {
    if (U_FAILURE(status[0])) return false;
    let boundary = -1,
      ruleStatus = 0,
      retain = false;
    if (
      position > (this.fBoundaries[this.fStartBufIdx] as number) - 15 &&
      position < (this.fBoundaries[this.fEndBufIdx] as number) + 15
    )
      retain = true;
    else if (position <= 15) boundary = 0;
    else {
      const backup = this.fBI.handleSafePrevious(position);
      if (
        (this.fBoundaries[this.fEndBufIdx] as number) < position &&
        (this.fBoundaries[this.fEndBufIdx] as number) >= backup - 15
      )
        retain = true;
      else if (backup < 15) {
        boundary = 0;
        retain = (this.fBoundaries[this.fStartBufIdx] as number) <= position + 15;
      } else {
        this.fBI.fPosition = backup;
        boundary = this.fBI.handleNext();
        if (boundary !== -1 && boundary <= backup + 4) {
          utext_setNativeIndex(this.fBI.fText, boundary);
          if (backup === utext_getPreviousNativeIndex(this.fBI.fText))
            boundary = this.fBI.handleNext();
        }
        if (boundary === -1) boundary = utext_nativeLength(this.fBI.fText);
        ruleStatus = this.fBI.fRuleStatusIndex;
      }
    }
    if (!retain) this.reset(boundary, ruleStatus);
    if ((this.fBoundaries[this.fEndBufIdx] as number) < position) {
      while ((this.fBoundaries[this.fEndBufIdx] as number) < position)
        if (!this.populateFollowing()) unreachable();
      this.fBufIdx = this.fEndBufIdx;
      this.fTextIdx = this.fBoundaries[this.fBufIdx] as number;
      while (this.fTextIdx > position) this.previous(status);
      return true;
    }
    if ((this.fBoundaries[this.fStartBufIdx] as number) > position) {
      while ((this.fBoundaries[this.fStartBufIdx] as number) > position)
        this.populatePreceding(status);
      this.fBufIdx = this.fStartBufIdx;
      this.fTextIdx = this.fBoundaries[this.fBufIdx] as number;
      while (this.fTextIdx < position) this.next();
      if (this.fTextIdx > position) this.previous(status);
      return true;
    }
    return true;
  }
  /** Original following refill reuses dictionary boundaries and reads at most6extra non-dictionary segments. @returns Added boundary. */
  populateFollowing(): boolean {
    const from = this.fBoundaries[this.fEndBufIdx] as number,
      fromStatus = this.fStatuses[this.fEndBufIdx] as number,
      position: [number] = [0],
      ruleStatus: [number] = [0];
    if (this.fBI.fDictionaryCache.following(from, position, ruleStatus)) {
      this.addFollowing(position[0], ruleStatus[0], Update.UpdateCachePosition);
      return true;
    }
    this.fBI.fPosition = from;
    position[0] = this.fBI.handleNext();
    if (position[0] === -1) return false;
    ruleStatus[0] = this.fBI.fRuleStatusIndex;
    if (this.fBI.fDictionaryCharCount > 0) {
      this.fBI.fDictionaryCache.populateDictionary(from, position[0], fromStatus, ruleStatus[0]);
      if (this.fBI.fDictionaryCache.following(from, position, ruleStatus)) {
        this.addFollowing(position[0], ruleStatus[0], Update.UpdateCachePosition);
        return true;
      }
    }
    this.addFollowing(position[0], ruleStatus[0], Update.UpdateCachePosition);
    for (let count = 0; count < 6; ++count) {
      position[0] = this.fBI.handleNext();
      if (position[0] === -1 || this.fBI.fDictionaryCharCount > 0) break;
      this.addFollowing(position[0], this.fBI.fRuleStatusIndex, Update.RetainCachePosition);
    }
    return true;
  }
  /** Original preceding refill buffers interleaved dictionary/rule boundaries before inserting them backwards. @param status - Shared status. @returns Added boundary. */
  populatePreceding(status: [number]): boolean {
    if (U_FAILURE(status[0])) return false;
    const from = this.fBoundaries[this.fStartBufIdx] as number;
    if (from === 0) return false;
    const position: [number] = [0],
      positionStatus: [number] = [0];
    if (this.fBI.fDictionaryCache.preceding(from, position, positionStatus)) {
      this.addPreceding(position[0], positionStatus[0], Update.UpdateCachePosition);
      return true;
    }
    let backup = from;
    do {
      backup -= 30;
      if (backup <= 0) backup = 0;
      else backup = this.fBI.handleSafePrevious(backup);
      if (backup === -1 || backup === 0) {
        position[0] = 0;
        positionStatus[0] = 0;
      } else {
        this.fBI.fPosition = backup;
        position[0] = this.fBI.handleNext();
        if (position[0] <= backup + 4) {
          utext_setNativeIndex(this.fBI.fText, position[0]);
          if (backup === utext_getPreviousNativeIndex(this.fBI.fText))
            position[0] = this.fBI.handleNext();
        }
        positionStatus[0] = this.fBI.fRuleStatusIndex;
      }
    } while (position[0] >= from);
    this.fSideBuffer.removeAllElements();
    this.fSideBuffer.addElement(position[0], status);
    this.fSideBuffer.addElement(positionStatus[0], status);
    do {
      const previous = (this.fBI.fPosition = position[0]),
        previousStatus = positionStatus[0];
      position[0] = this.fBI.handleNext();
      positionStatus[0] = this.fBI.fRuleStatusIndex;
      if (position[0] === -1) break;
      let handled = false;
      if (this.fBI.fDictionaryCharCount !== 0) {
        const end = position[0];
        this.fBI.fDictionaryCache.populateDictionary(
          previous,
          end,
          previousStatus,
          positionStatus[0],
        );
        let dictionaryPrevious = previous;
        while (this.fBI.fDictionaryCache.following(dictionaryPrevious, position, positionStatus)) {
          handled = true;
          if (position[0] >= from) break;
          this.fSideBuffer.addElement(position[0], status);
          this.fSideBuffer.addElement(positionStatus[0], status);
          dictionaryPrevious = position[0];
        }
      }
      if (!handled && position[0] < from) {
        this.fSideBuffer.addElement(position[0], status);
        this.fSideBuffer.addElement(positionStatus[0], status);
      }
    } while (position[0] < from);
    let success = false;
    if (!this.fSideBuffer.isEmpty()) {
      positionStatus[0] = this.fSideBuffer.popi();
      position[0] = this.fSideBuffer.popi();
      this.addPreceding(position[0], positionStatus[0], Update.UpdateCachePosition);
      success = true;
    }
    while (!this.fSideBuffer.isEmpty()) {
      positionStatus[0] = this.fSideBuffer.popi();
      position[0] = this.fSideBuffer.popi();
      if (!this.addPreceding(position[0], positionStatus[0], Update.RetainCachePosition)) break;
    }
    return success;
  }
  /** Original append drops6old entries on a full ring. @param position - New boundary. @param status - Rule status. @param update - Position policy. @returns Nothing. */
  addFollowing(position: number, status: number, update: Update): void {
    const index = BreakCache.modChunkSize(this.fEndBufIdx + 1);
    if (index === this.fStartBufIdx)
      this.fStartBufIdx = BreakCache.modChunkSize(this.fStartBufIdx + 6);
    this.fBoundaries[index] = position;
    this.fStatuses[index] = status;
    this.fEndBufIdx = index;
    if (update === Update.UpdateCachePosition) {
      this.fBufIdx = index;
      this.fTextIdx = position;
    }
  }
  /** Original prepend can refuse insertion to retain the current cache slot. @param position - New boundary. @param status - Rule status. @param update - Position policy. @returns Success. */
  addPreceding(position: number, status: number, update: Update): boolean {
    const index = BreakCache.modChunkSize(this.fStartBufIdx - 1);
    if (index === this.fEndBufIdx) {
      if (this.fBufIdx === this.fEndBufIdx && update === Update.RetainCachePosition) return false;
      this.fEndBufIdx = BreakCache.modChunkSize(this.fEndBufIdx - 1);
    }
    this.fBoundaries[index] = position;
    this.fStatuses[index] = status;
    this.fStartBufIdx = index;
    if (update === Update.UpdateCachePosition) {
      this.fBufIdx = index;
      this.fTextIdx = position;
    }
    return true;
  }
}

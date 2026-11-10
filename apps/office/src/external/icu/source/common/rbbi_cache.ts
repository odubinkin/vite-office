/** @fileoverview Original ICU78.3 dictionary and circular break caches for the contiguous UTF16 word iterator. */
import type { RuleBasedBreakIterator } from "./rbbi";
import type { RBBIDataWrapper } from "./rbbidata";
import { UnhandledEngine, type ICULanguageBreakFactory, type LanguageBreakEngine } from "./brkeng";
import { dictionaryNativeIndex, nextDictionaryIndex } from "./dictbe";
import { ucptrie_get } from "./ucptrie";
import { U_FAILURE } from "./unicode/utypes";

/** Native break position with its status-table index. */
export interface BreakBoundary {
  readonly position: number;
  readonly status: number;
}

/** Original dictionary refinement and per-iterator language engine lookup. */
export class DictionaryCache {
  private breaks: number[] = [];
  private positionInCache = -1;
  private start = 0;
  private limit = 0;
  private firstStatus = 0;
  private otherStatus = 0;
  private readonly unhandled = new UnhandledEngine();
  private readonly engines: LanguageBreakEngine[] = [this.unhandled];

  /** Binds the original immutable text, rule data and native factory. @param text - Source. @param data - Compiled ICU rules. @param factory - Prepared native data factory. @param locale - Requested locale. @param phrase - Original phrase selector. @returns Cache. */
  constructor(
    private text: string,
    private readonly data: RBBIDataWrapper,
    private readonly factory: ICULanguageBreakFactory | undefined,
    private readonly locale: string,
    private readonly phrase: boolean,
  ) {}

  /** Changes the native input and clears boundaries while retaining loaded language engines. @param text - New UTF16 input. @returns Nothing. */
  setText(text: string): void {
    this.text = text;
    this.reset();
  }

  /** Clears native dictionary range, boundary list and status references. @returns Nothing. */
  private reset(): void {
    this.breaks = [];
    this.positionInCache = -1;
    this.start = this.limit = this.firstStatus = this.otherStatus = 0;
  }

  /** Subdivides a source DFA boundary pair using registered dictionary engines. @param from - Initial boundary. @param to - Following rule boundary. @returns Nothing. */
  populateDictionary(from: BreakBoundary, to: BreakBoundary): void {
    if (to.position - from.position <= 1) return;
    this.reset();
    this.firstStatus = from.status;
    this.otherStatus = to.status;
    const cursor: [number] = [from.position],
      status: [number] = [0];
    const dictStart = this.data.fForwardTable.fDictCategoriesStart;
    let found = 0;
    while (!U_FAILURE(status[0]) && cursor[0] < to.position) {
      const code = this.text.codePointAt(cursor[0]) as number;
      if (ucptrie_get(this.data.fTrie, code) < dictStart) {
        cursor[0] = nextDictionaryIndex(this.text, cursor[0]);
        continue;
      }
      const before = cursor[0];
      found += this.getLanguageBreakEngine(code).findBreaks(
        this.text,
        cursor,
        before,
        to.position,
        this.breaks,
        this.phrase,
        status,
      );
      if (!U_FAILURE(status[0]) && cursor[0] <= before)
        throw new Error("ICU dictionary engine did not consume its selected character.");
    }
    if (found > 0) {
      if (from.position < (this.breaks[0] as number)) this.breaks.unshift(from.position);
      if (to.position > (this.breaks.at(-1) as number)) this.breaks.push(to.position);
      this.positionInCache = 0;
      this.start = this.breaks[0] as number;
      this.limit = this.breaks.at(-1) as number;
    }
  }

  /** Returns the next cached dictionary boundary and its inherited status. @param from - Native position. @returns Following boundary or null. */
  following(from: number): BreakBoundary | null {
    if (from >= this.limit || from < this.start) {
      this.positionInCache = -1;
      return null;
    }
    if (this.positionInCache >= 0 && this.breaks[this.positionInCache] === from)
      ++this.positionInCache;
    else {
      this.positionInCache = 0;
      while ((this.breaks[this.positionInCache] as number) <= from) ++this.positionInCache;
    }
    const position = this.breaks[this.positionInCache];
    if (position === undefined) {
      this.positionInCache = -1;
      return null;
    }
    return { position, status: this.otherStatus };
  }

  /** Returns the original preceding dictionary boundary. @param from - Native position. @returns Preceding boundary or null. */
  preceding(from: number): BreakBoundary | null {
    if (from <= this.start || from > this.limit) {
      this.positionInCache = -1;
      return null;
    }
    if (from === this.limit) this.positionInCache = this.breaks.length - 1;
    if (this.positionInCache > 0 && this.breaks[this.positionInCache] === from)
      --this.positionInCache;
    else if (this.positionInCache === 0) {
      this.positionInCache = -1;
      return null;
    } else {
      this.positionInCache = this.breaks.length - 1;
      while ((this.breaks[this.positionInCache] as number) >= from) --this.positionInCache;
    }
    const position = this.breaks[this.positionInCache] as number;
    return { position, status: position === this.start ? this.firstStatus : this.otherStatus };
  }

  /** Reuses iterator-local engines before consulting the shared ICU factory. @param code - Current scalar. @returns Actual or unhandled engine. */
  private getLanguageBreakEngine(code: number): LanguageBreakEngine {
    for (let i = this.engines.length - 1; i >= 0; --i) {
      const engine = this.engines[i] as LanguageBreakEngine;
      if (engine.handles(code, this.locale)) return engine;
    }
    if (this.factory === undefined)
      throw new Error("ICU word dictionaries have not been prepared.");
    const engine = this.factory.getEngineFor(code, this.locale);
    if (engine !== null) {
      this.engines.push(engine);
      return engine;
    }
    this.unhandled.handleCharacter(code);
    return this.unhandled;
  }
}

const CACHE_SIZE = 128;
const CACHE_MASK = CACHE_SIZE - 1;
const CACHE_NEAR = 15;
const DONE = -1;

/** Original circular boundary cache and safe-reverse refill algorithm. */
export class BreakCache {
  private readonly boundaries = new Int32Array(CACHE_SIZE);
  private readonly statuses = new Uint16Array(CACHE_SIZE);
  private startIndex = 0;
  private endIndex = 0;
  private index = 0;
  done = false;

  /** Shares the actual rule iterator and dictionary cache. @param owner - Native rule iterator. @param text - Contiguous UTF16 input. @param dictionary - Native dictionary cache. @returns Cache. */
  constructor(
    private readonly owner: Pick<RuleBasedBreakIterator, "handleNextFrom" | "handleSafePrevious">,
    private text: string,
    private readonly dictionary: DictionaryCache,
  ) {}

  /** Resets both original caches for a new UTF16 input. @param text - New native input. @returns Nothing. */
  setText(text: string): void {
    this.text = text;
    this.reset({ position: 0, status: 0 });
    this.dictionary.setText(text);
  }

  /** Borrows the selected boundary without changing completion state. @returns Current native boundary. */
  boundary(): BreakBoundary {
    return this.at(this.index);
  }

  /** Moves one boundary forward, refilling when necessary. @returns Nothing. */
  next(): void {
    if (this.index === this.endIndex) this.done = !this.populateFollowing();
    else this.index = (this.index + 1) & CACHE_MASK;
  }

  /** Moves one boundary backward, refilling when necessary. @returns Nothing. */
  previous(): void {
    const initial = this.index;
    if (this.index === this.startIndex) this.populatePreceding();
    else this.index = (this.index - 1) & CACHE_MASK;
    this.done = this.index === initial;
  }

  /** Selects the exact or preceding boundary for a clipped, scalar-aligned offset. @param position - Native offset. @returns Nothing. */
  seek(position: number): void {
    const start = this.boundaries[this.startIndex] as number,
      end = this.boundaries[this.endIndex] as number;
    if (position < start || position > end) {
      this.populateNear(position);
      return;
    }
    if (position === start) this.index = this.startIndex;
    else if (position === end) this.index = this.endIndex;
    else {
      let low = this.startIndex,
        high = this.endIndex;
      while (low !== high) {
        const probe = ((low + high + (low > high ? CACHE_SIZE : 0)) >> 1) & CACHE_MASK;
        if ((this.boundaries[probe] as number) > position) high = probe;
        else low = (probe + 1) & CACHE_MASK;
      }
      this.index = (high - 1) & CACHE_MASK;
    }
  }

  /** Reads a cached native boundary. @param index - Ring index. @returns Position and status. */
  private at(index: number): BreakBoundary {
    return { position: this.boundaries[index] as number, status: this.statuses[index] as number };
  }

  /** Resets the circular cache around a known boundary. @param value - Source boundary. @returns Nothing. */
  private reset(value: BreakBoundary): void {
    this.startIndex = this.endIndex = this.index = 0;
    this.boundaries[0] = value.position;
    this.statuses[0] = value.status;
  }

  /** Finds the first known rule boundary after a safe reverse location. @param safe - Safe native position. @returns Rule candidate. */
  private afterSafe(safe: number): BreakBoundary {
    let result = this.owner.handleNextFrom(safe);
    if (
      result.position !== DONE &&
      result.position <= safe + 4 &&
      dictionaryNativeIndex(this.text, result.position - 1) === safe
    )
      result = this.owner.handleNextFrom(result.position);
    return result;
  }

  /** Repositions using the original native safe-point and cache locality rules. @param position - Requested native offset. @returns Nothing. */
  private populateNear(position: number): void {
    const start = this.boundaries[this.startIndex] as number,
      end = this.boundaries[this.endIndex] as number;
    if (!(position > start - CACHE_NEAR && position < end + CACHE_NEAR)) {
      if (position <= CACHE_NEAR) this.reset({ position: 0, status: 0 });
      else {
        const safe = this.owner.handleSafePrevious(position);
        if (!(end < position && end >= safe - CACHE_NEAR)) {
          if (safe < CACHE_NEAR) {
            if (start > position + CACHE_NEAR) this.reset({ position: 0, status: 0 });
          } else {
            const boundary = this.afterSafe(safe);
            this.reset(
              boundary.position === DONE
                ? { position: this.text.length, status: boundary.status }
                : boundary,
            );
          }
        }
      }
    }
    if ((this.boundaries[this.endIndex] as number) < position) {
      while ((this.boundaries[this.endIndex] as number) < position) {
        if (!this.populateFollowing())
          throw new Error("ICU break cache could not reach the requested offset.");
      }
      this.index = this.endIndex;
      while (this.boundary().position > position) this.previous();
    } else if ((this.boundaries[this.startIndex] as number) > position) {
      while ((this.boundaries[this.startIndex] as number) > position) this.populatePreceding();
      this.index = this.startIndex;
      while (this.boundary().position < position) this.next();
      if (this.boundary().position > position) this.previous();
    }
  }

  /** Appends the next native boundary and original six plain-rule lookahead entries. @returns Whether appended. */
  private populateFollowing(): boolean {
    const from = this.at(this.endIndex);
    let refined = this.dictionary.following(from.position);
    if (refined !== null) {
      this.addFollowing(refined, true);
      return true;
    }
    let candidate = this.owner.handleNextFrom(from.position);
    if (candidate.position === DONE) return false;
    if (candidate.dictionaryCount > 0) {
      this.dictionary.populateDictionary(from, candidate);
      refined = this.dictionary.following(from.position);
      if (refined !== null) {
        this.addFollowing(refined, true);
        return true;
      }
    }
    this.addFollowing(candidate, true);
    for (let i = 0; i < 6; ++i) {
      candidate = this.owner.handleNextFrom(candidate.position);
      if (candidate.position === DONE || candidate.dictionaryCount > 0) break;
      this.addFollowing(candidate, false);
    }
    return true;
  }

  /** Refills preceding boundaries by finding a safe point and scanning forward to the current ring. @returns Nothing. */
  private populatePreceding(): void {
    const from = this.boundaries[this.startIndex] as number;
    if (from === 0) return;
    const refined = this.dictionary.preceding(from);
    if (refined !== null) {
      this.addPreceding(refined, true);
      return;
    }
    let safe = from,
      boundary: BreakBoundary;
    do {
      safe -= 30;
      safe = safe <= 0 ? 0 : this.owner.handleSafePrevious(safe);
      boundary = safe <= 0 ? { position: 0, status: 0 } : this.afterSafe(safe);
    } while (boundary.position >= from);

    const side: BreakBoundary[] = [boundary];
    do {
      let previous = boundary;
      const candidate = this.owner.handleNextFrom(previous.position);
      boundary = candidate;
      if (boundary.position === DONE) break;
      let usedDictionary = false;
      if (candidate.dictionaryCount > 0) {
        this.dictionary.populateDictionary(previous, candidate);
        for (;;) {
          const next = this.dictionary.following(previous.position);
          if (next === null) break;
          usedDictionary = true;
          boundary = next;
          if (boundary.position >= from) break;
          side.push(boundary);
          previous = boundary;
        }
      }
      if (!usedDictionary && boundary.position < from) side.push(boundary);
    } while (boundary.position < from);

    const closest = side.pop() as BreakBoundary;
    this.addPreceding(closest, true);
    for (let next = side.pop(); next !== undefined; next = side.pop())
      if (!this.addPreceding(next, false)) break;
  }

  /** Adds a following native boundary, evicting the source six-entry block. @param value - Boundary. @param update - Whether to move the cursor. @returns Nothing. */
  private addFollowing(value: BreakBoundary, update: boolean): void {
    const index = (this.endIndex + 1) & CACHE_MASK;
    if (index === this.startIndex) this.startIndex = (this.startIndex + 6) & CACHE_MASK;
    this.boundaries[index] = value.position;
    this.statuses[index] = value.status;
    this.endIndex = index;
    if (update) this.index = index;
  }

  /** Prepends a native boundary when doing so retains the requested cursor. @param value - Boundary. @param update - Whether to move the cursor. @returns Whether inserted. */
  private addPreceding(value: BreakBoundary, update: boolean): boolean {
    const index = (this.startIndex - 1) & CACHE_MASK;
    if (index === this.endIndex) {
      if (this.index === this.endIndex && !update) return false;
      this.endIndex = (this.endIndex - 1) & CACHE_MASK;
    }
    this.boundaries[index] = value.position;
    this.statuses[index] = value.status;
    this.startIndex = index;
    if (update) this.index = index;
    return true;
  }
}

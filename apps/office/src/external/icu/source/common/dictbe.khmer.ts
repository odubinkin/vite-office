/** @fileoverview ICU78.3 Khmer word engine with LibreOffice's pinned dictionary and cluster-scan patch. */
import {
  DictionaryBreakEngine,
  dictionaryNativeIndex,
  dictionarySetContains,
  nextDictionaryIndex,
} from "./dictbe";
import type { DictionaryMatcher } from "./dictionarydata";
import sets from "./dictbe.khmer.sets.json" with { type: "json" };

const ZWSP = 0x200b;
const WJ = 0x2060;
const COENG = 0x17d2;
const CLUSTER_LIMIT = 3;
const BADSNLP = 256 * 20;
const INFINITY_COST = 0x7fffffff;
const MAX_WORD_SIZE = 20;

const punctuation = [0x3a, 0x3a, 0x17d4, 0x17d7, 0x17d9, 0x17d9];
const ignored = {
  /** Original Khmer dictionary ignores both joiners and WJ in the patched match loop. @param code - Scalar. @returns Membership. */
  contains(code: number): boolean {
    return code === 0x200c || code === 0x200d || code === WJ;
  },
};

/** Original scans clone UText and move its cursor independently of integer scan counters. */
class KhmerText {
  index: number;
  /** Creates the cloned UTF16 cursor. @param text - Source. @param index - Requested native offset. @returns Cursor. */
  constructor(
    private readonly text: string,
    index: number,
  ) {
    this.index = dictionaryNativeIndex(text, index);
  }
  /** Borrows the native scalar or U_SENTINEL. @returns Current scalar. */
  current(): number {
    return this.text.codePointAt(this.index) ?? -1;
  }
  /** Returns the scalar consumed at the old native index. @returns Consumed scalar or sentinel. */
  next(): number {
    const code = this.current();
    this.index = nextDictionaryIndex(this.text, this.index);
    return code;
  }
  /** Returns the scalar at the previous native index. @returns Consumed scalar or sentinel. */
  previous(): number {
    if (!this.index) return -1;
    this.index = dictionaryNativeIndex(this.text, this.index - 1);
    return this.current();
  }
}

/** Original beginning-of-span punctuation scan. @param text - Source. @param start - Unit preceding the handled span. @returns ZWSP presence and native break permission. */
function scanBeforeStart(text: string, start: number): [boolean, boolean] {
  const cursor = new KhmerText(text, start);
  let code = cursor.current(),
    doBreak = true;
  while (start >= 0) {
    if (!dictionarySetContains(sets.skipStart, code)) return [code === ZWSP, doBreak];
    --start;
    code = cursor.previous();
    doBreak = false;
  }
  return [false, doBreak];
}

/** Original end scan advances the cursor but uses the scalar returned by next(). @param text - Source. @param end - Handled end. @returns Effective end, ZWSP presence and native break permission. */
function scanAfterEnd(text: string, end: number): [number, boolean, boolean] {
  const cursor = new KhmerText(text, end);
  let code = cursor.current(),
    doBreak = !dictionarySetContains(sets.noBreakBefore, code);
  while (end < text.length) {
    if (!dictionarySetContains(sets.skipEnd, code)) return [end, code === ZWSP, doBreak];
    ++end;
    code = cursor.next();
    doBreak = false;
  }
  return [end, false, doBreak];
}

/** Original backward cluster scan including virama plus base and ignored joiners. @param cursor - Native cloned cursor. @param textStart - Scan lower bound. @returns Counter-based cluster position. */
function scanBackClusters(cursor: KhmerText, textStart: number): number {
  let code = 0,
    start = cursor.index;
  while (start > textStart) {
    code = cursor.previous();
    --start;
    if (!dictionarySetContains(sets.skipEnd, code)) break;
  }
  for (let i = 0; i < CLUSTER_LIMIT; ++i) {
    while (start > textStart) {
      while (ignored.contains(code)) code = cursor.previous();
      if (!dictionarySetContains(sets.khmerMarks, code)) {
        if (!dictionarySetContains(sets.khmerBase, code)) break;
        code = cursor.previous();
        if (!dictionarySetContains(sets.viramas, code)) {
          cursor.next();
          code = cursor.current();
          break;
        }
        --start;
      }
      code = cursor.previous();
      --start;
    }
    if (!dictionarySetContains(sets.khmerBase, code) || start < textStart) break;
    code = cursor.previous();
    --start;
  }
  return start + 1;
}

/** Original forward cluster scan uses an independent end counter. @param cursor - Native cloned cursor. @param textEnd - Scan upper bound. @returns Counter-based cluster position. */
function scanFwdClusters(cursor: KhmerText, textEnd: number): number {
  let code = cursor.current(),
    end = cursor.index;
  while (end < textEnd && dictionarySetContains(sets.skipStart, code)) {
    cursor.next();
    code = cursor.current();
    ++end;
  }
  for (let i = 0; i < CLUSTER_LIMIT; ++i) {
    while (ignored.contains(code)) {
      cursor.next();
      code = cursor.current();
    }
    if (!dictionarySetContains(sets.khmerBase, code)) {
      --end;
      break;
    }
    while (end < textEnd) {
      cursor.next();
      code = cursor.current();
      ++end;
      if (!dictionarySetContains(sets.khmerMarks, code)) break;
      if (dictionarySetContains(sets.viramas, code)) {
        cursor.next();
        code = cursor.current();
        ++end;
        if (!dictionarySetContains(sets.khmerBase, code)) break;
      }
    }
  }
  return end;
}

/** Original mutable no-break window around an inhibitor. */
interface KhmerBreakWindow {
  before: number;
  after: number;
}

/** Searches for the next ZWSP or WJ and updates the original cluster window. @param text - Source. @param start - Mutable scan start. @param end - Scan upper bound. @param window - Native output bounds. @returns Whether an inhibitor was found. */
function scanWJ(text: string, start: [number], end: number, window: KhmerBreakWindow): boolean {
  let position = start[0],
    nextStart = position,
    found = false;
  const cursor = new KhmerText(text, position);
  while (position < end) {
    const code = cursor.current();
    if (code === ZWSP || code === WJ) {
      nextStart = position + 1;
      if (!found) window.before = scanBackClusters(cursor, start[0]);
      found = true;
      cursor.next();
      window.after = scanFwdClusters(cursor, end);
      position = window.after + 1;
      continue;
    }
    ++position;
    cursor.next();
  }
  if (!found && position >= end) {
    start[0] = window.before = window.after = position;
    return false;
  }
  start[0] = nextStart;
  return true;
}

/** Applies the source unknown-word fallback including Khmer base/mark clusters. @param text - Source. @param start - Starting unit. @param end - Handled extent. @returns Native candidate length and cost. */
function unknownCandidate(text: string, start: number, end: number): [number, number] {
  const cursor = new KhmerText(text, start);
  let code = cursor.current();
  if (dictionarySetContains(punctuation, code) || ignored.contains(code) || code === ZWSP)
    return [1, 0];
  if (!dictionarySetContains(sets.khmerBase, code)) return [1, BADSNLP];
  do {
    cursor.next();
    code = cursor.current();
    if (cursor.index >= end) break;
    if (code === COENG) {
      cursor.next();
      code = cursor.current();
      if (!dictionarySetContains(sets.khmerBase, code) || cursor.index >= end) break;
      cursor.next();
      code = cursor.current();
      if (cursor.index >= end) break;
    }
  } while (dictionarySetContains(sets.khmerMarks, code) || ignored.contains(code));
  return [cursor.index - start, BADSNLP];
}

/** Computes the native weighted segmentation before cluster-window filtering. @param text - Source. @param start - Range start. @param end - Range end. @param dictionary - Patched Khmer dictionary. @returns Reversed tentative positions relative to range start. */
function tentativeBoundaries(
  text: string,
  start: number,
  end: number,
  dictionary: DictionaryMatcher,
): number[] {
  let size = end - start;
  const best = new Int32Array(size + 1).fill(INFINITY_COST),
    previous = new Int32Array(size + 1).fill(INFINITY_COST);
  best[0] = 0;
  const lengths = new Array<number>(MAX_WORD_SIZE).fill(0),
    values = new Array<number>(MAX_WORD_SIZE).fill(0);
  let candidateSize = MAX_WORD_SIZE;
  for (let i = 0; i < size; ++i) {
    if (best[i] === INFINITY_COST) continue;
    const index = start + i,
      position: [number] = [dictionaryNativeIndex(text, index)];
    let count = dictionary.matches(
      text,
      position,
      size - i,
      MAX_WORD_SIZE,
      null,
      lengths,
      values,
      null,
      ignored,
      2,
    );
    for (let j = 0; j < count; ++j) {
      const length = j < candidateSize ? (lengths[j] as number) : 0;
      if (length + i >= size) continue;
      const code = text.codePointAt(dictionaryNativeIndex(text, index + length)) ?? -1;
      if (dictionarySetContains(sets.khmerMarks, code) || code === COENG) {
        if (j < candidateSize) {
          lengths.copyWithin(j, j + 1, candidateSize);
          values.copyWithin(j, j + 1, candidateSize);
          --candidateSize;
        }
        --j;
        --count;
      }
    }
    if (count === 0) {
      const [length, cost] = unknownCandidate(text, index, end);
      if (candidateSize > 0) {
        lengths[0] = length;
        values[0] = cost;
      }
      count = 1;
    }
    for (let j = 0; j < count; ++j) {
      const value = j < candidateSize ? (values[j] as number) : 0;
      const cost = ((best[i] as number) + value) | 0;
      let length = j < candidateSize ? (lengths[j] as number) : 0;
      const cursor = new KhmerText(text, index + length);
      while (
        length + i < size &&
        (dictionarySetContains(punctuation, cursor.current()) || ignored.contains(cursor.current()))
      ) {
        ++length;
        cursor.next();
      }
      const target = length + i;
      if (cost < (best[target] ?? 0)) {
        const prior = previous[i] as number;
        previous[target] = value === BADSNLP ? (prior < 0 ? prior : -i) : i;
        best[target] = cost;
      }
    }
  }

  while (size >= 0 && best[size] === INFINITY_COST) --size;
  if (size < 0) return [size];
  const boundaries: number[] = [];
  for (let i = size; i !== INFINITY_COST; i = previous[i] ?? 0) {
    i = Math.abs(i);
    boundaries.push(i);
  }
  return boundaries;
}

/** Original Khmer engine registered with the LibreOffice replacement dictionary. */
export class KhmerBreakEngine extends DictionaryBreakEngine {
  /** Binds the actual Khmer dictionary. @param dictionary - Native patched Khmer matcher. @returns Engine. */
  constructor(private readonly dictionary: DictionaryMatcher) {
    super(sets.khmerWord);
  }

  /** Applies the original Khmer no-break windows and weighted segmentation. @param text - UTF16 source. @param position - Native cursor. @param rangeStart - Handled range start. @param rangeEnd - Handled range end. @param foundBreaks - Native output stack. @returns Original number of appended boundaries. */
  protected divideUpDictionaryRange(
    text: string,
    position: [number],
    rangeStart: number,
    rangeEnd: number,
    foundBreaks: number[],
  ): number {
    const originalCount = foundBreaks.length,
      [startZwsp, breakStart] =
        rangeStart > 0 ? scanBeforeStart(text, rangeStart - 1) : [false, false],
      initAfter = scanFwdClusters(new KhmerText(text, rangeStart), rangeEnd),
      [scanEnd, endZwsp, breakEnd] = scanAfterEnd(text, rangeEnd),
      finalBefore = scanBackClusters(new KhmerText(text, rangeEnd - 1), rangeStart);

    // Khmer's original fTypes bitmask is always at least UBRK_LINE.
    if (finalBefore < initAfter) {
      if (breakStart) foundBreaks.push(rangeStart);
      if (breakEnd) foundBreaks.push(rangeEnd);
      return foundBreaks.length - originalCount;
    }

    const window: KhmerBreakWindow = { before: 0, after: 0 };
    scanWJ(text, [rangeStart], rangeEnd, window);
    if (startZwsp || initAfter >= window.before) {
      window.after = initAfter;
      window.before = 0;
    }
    if (
      (endZwsp || (window.after > finalBefore && window.after < rangeEnd)) &&
      window.before > finalBefore
    )
      window.before = finalBefore;

    const boundaries = tentativeBoundaries(text, rangeStart, rangeEnd, this.dictionary);
    for (let i = boundaries.length - 1; i >= 0; --i) {
      const point = boundaries[i] as number;
      if (!point && !breakStart) continue;
      position[0] = point + rangeStart;
      while (position[0] > window.after && scanWJ(text, position, scanEnd, window)) {
        // The original scan mutates the tentative boundary until the window covers it.
      }
      if (position[0] < window.before) foundBreaks.push(position[0]);
    }
    if (!breakEnd && (foundBreaks.at(-1) ?? 0) >= rangeEnd) foundBreaks.pop();
    return foundBreaks.length - originalCount;
  }
}

/** @fileoverview Original ICU dictionary span owner and Southeast Asian dictionary break engines. */
import type { LanguageBreakEngine } from "./brkeng.h";
import type { DictionaryMatcher } from "./dictionarydata";
import ranges from "./dictbe.sea.sets.json" with { type: "json" };
import {
  utext_current32,
  utext_getNativeIndex,
  utext_moveIndex32,
  utext_next32,
  utext_previous32,
  utext_setNativeIndex,
  type UText,
} from "./unicode/utext";
import { U_FAILURE, U_SUCCESS } from "./unicode/utypes";
import { UnicodeSet } from "./uniset";
import type { UVector32 } from "./uvectr32.h";

/** Base engine keeps the constructor's compact character set and limits runs to its members. */
export abstract class DictionaryBreakEngine implements LanguageBreakEngine {
  /** Receives the original compact character set from the derived constructor. @param fSet - Native engine set. @returns Engine owner. */
  protected constructor(private readonly fSet: UnicodeSet) {}

  /** Tests the actual script-specific character set. @param c - Candidate scalar. @param locale - Original unused argument. @returns Whether this engine handles the character. */
  handles(c: number, locale: string | null): boolean {
    void locale;
    return this.fSet.contains(c);
  }

  /** Finds the contiguous dictionary span and restores its end after subdivision. @param text - Provider. @param startPos - Requested start. @param endPos - Requested limit. @param foundBreaks - Output owner. @param isPhraseBreaking - Original phrase flag. @param status - Shared source status. @returns Number of boundaries. */
  findBreaks(
    text: UText,
    startPos: number,
    endPos: number,
    foundBreaks: UVector32,
    isPhraseBreaking: boolean,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    utext_setNativeIndex(text, startPos);
    const start = utext_getNativeIndex(text) | 0;
    let current: number;
    let c = utext_current32(text);
    while ((current = utext_getNativeIndex(text) | 0) < endPos && this.fSet.contains(c)) {
      utext_next32(text);
      c = utext_current32(text);
    }
    const result = this.divideUpDictionaryRange(
      text,
      start,
      current,
      foundBreaks,
      isPhraseBreaking,
      status,
    );
    utext_setNativeIndex(text, current);
    return result;
  }

  /** Divides an already located dictionary run. @param text - Provider. @param rangeStart - Native start. @param rangeEnd - Native limit. @param foundBreaks - Output owner. @param isPhraseBreaking - Original phrase flag. @param status - Shared status. @returns Number of boundaries. */
  protected abstract divideUpDictionaryRange(
    text: UText,
    rangeStart: number,
    rangeEnd: number,
    foundBreaks: UVector32,
    isPhraseBreaking: boolean,
    status: [number],
  ): number;
}

const POSSIBLE_WORD_LIST_MAX = 20;

/** Original per-position cache of candidate code-unit and code-point lengths. */
class PossibleWord {
  private count = 0;
  private readonly prefix: [number] = [0];
  private offset = -1;
  private mark = 0;
  private current = 0;
  private readonly cuLengths = new Int32Array(POSSIBLE_WORD_LIST_MAX);
  private readonly cpLengths = new Int32Array(POSSIBLE_WORD_LIST_MAX);

  /** Caches a dictionary match and selects the longest full word. @param text - Provider. @param dict - Adopted matcher. @param rangeEnd - Native run limit. @returns Number of candidates. */
  candidates(text: UText, dict: DictionaryMatcher, rangeEnd: number): number {
    const start = utext_getNativeIndex(text) | 0;
    if (start !== this.offset) {
      this.offset = start;
      this.count = dict.matches(
        text,
        rangeEnd - start,
        this.cuLengths.length,
        this.cuLengths,
        this.cpLengths,
        null,
        this.prefix,
      );
      if (this.count <= 0) utext_setNativeIndex(text, start);
    }
    if (this.count > 0)
      utext_setNativeIndex(text, start + (this.cuLengths[this.count - 1] as number));
    this.current = this.count - 1;
    this.mark = this.current;
    return this.count;
  }

  /** Moves after the marked word. @param text - Provider. @returns Native word length. */
  acceptMarked(text: UText): number {
    const length = this.cuLengths[this.mark] as number;
    utext_setNativeIndex(text, this.offset + length);
    return length;
  }

  /** Moves to the next shorter candidate if available. @param text - Provider. @returns Whether a shorter candidate exists. */
  backUp(text: UText): boolean {
    if (this.current <= 0) return false;
    utext_setNativeIndex(text, this.offset + (this.cuLengths[--this.current] as number));
    return true;
  }

  /** Returns the dictionary's longest prefix. @returns Prefix length in code points. */
  longestPrefix(): number {
    return this.prefix[0];
  }

  /** Marks the currently selected candidate. @returns Nothing. */
  markCurrent(): void {
    this.mark = this.current;
  }

  /** Returns the marked candidate's code-point length. @returns Length. */
  markedCPLength(): number {
    return this.cpLengths[this.mark] as number;
  }
}

const LOOKAHEAD = 3;
const ROOT_COMBINE_THRESHOLD = 3;
const PREFIX_COMBINE_THRESHOLD = 3;
const MIN_WORD = 2;
const MIN_WORD_SPAN = MIN_WORD * 2;
const THAI_PAIYANNOI = 0x0e2f;
const THAI_MAIYAMOK = 0x0e46;

/** Original constructor sets grouped by the source boundary test that reads each. */
interface SoutheastAsianSets {
  word: readonly number[];
  begin: readonly number[];
  end: readonly number[];
  mark: readonly number[];
}

/** Shared implementation of the identical Lao, Burmese and Khmer loops and the common Thai steps. */
abstract class SoutheastAsianBreakEngine extends DictionaryBreakEngine {
  private readonly fBeginWordSet: UnicodeSet;
  private readonly fEndWordSet: UnicodeSet;
  private readonly fMarkSet: UnicodeSet;

  /** Adopts the original matcher and constructor sets. @param fDictionary - Adopted matcher. @param sets - Native constructor output. @param status - Sticky source status. @param fSuffixSet - Original Thai suffix set, or null for the other scripts. @returns Engine owner. */
  protected constructor(
    private readonly fDictionary: DictionaryMatcher,
    sets: SoutheastAsianSets,
    status: [number],
    private readonly fSuffixSet: UnicodeSet | null = null,
  ) {
    super(new UnicodeSet(U_SUCCESS(status[0]) ? sets.word : []));
    this.fBeginWordSet = new UnicodeSet(sets.begin);
    this.fEndWordSet = new UnicodeSet(sets.end);
    this.fMarkSet = new UnicodeSet(sets.mark);
  }

  /** Releases the adopted native dictionary image. @returns Nothing. */
  dispose(): void {
    this.fDictionary.dispose();
  }

  /** Retains the source candidate lookahead, resynchronization and boundary writes. @param text - Provider. @param rangeStart - Native start. @param rangeEnd - Native limit. @param foundBreaks - Output owner. @param _isPhraseBreaking - Original unused argument. @param status - Shared status. @returns Number of boundaries. */
  protected divideUpDictionaryRange(
    text: UText,
    rangeStart: number,
    rangeEnd: number,
    foundBreaks: UVector32,
    _isPhraseBreaking: boolean,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    const suffixSet = this.fSuffixSet;
    if (suffixSet !== null) {
      utext_setNativeIndex(text, rangeStart);
      utext_moveIndex32(text, MIN_WORD_SPAN);
      if (utext_getNativeIndex(text) >= rangeEnd) return 0;
      utext_setNativeIndex(text, rangeStart);
    } else if (rangeEnd - rangeStart < MIN_WORD_SPAN) return 0;

    let wordsFound = 0;
    let current: number;
    const words = [new PossibleWord(), new PossibleWord(), new PossibleWord()];
    utext_setNativeIndex(text, rangeStart);
    while (U_SUCCESS(status[0]) && (current = utext_getNativeIndex(text) | 0) < rangeEnd) {
      let cuWordLength = 0;
      let cpWordLength = 0;
      const first = words[wordsFound % LOOKAHEAD] as PossibleWord;
      const candidates = first.candidates(text, this.fDictionary, rangeEnd);
      if (candidates > 0) {
        if (candidates > 1 && utext_getNativeIndex(text) < rangeEnd) {
          const second = words[(wordsFound + 1) % LOOKAHEAD] as PossibleWord;
          const third = words[(wordsFound + 2) % LOOKAHEAD] as PossibleWord;
          foundBest: do {
            if (second.candidates(text, this.fDictionary, rangeEnd) > 0) {
              first.markCurrent();
              if (utext_getNativeIndex(text) >= rangeEnd) break;
              do {
                if (third.candidates(text, this.fDictionary, rangeEnd) !== 0) {
                  first.markCurrent();
                  break foundBest;
                }
              } while (second.backUp(text));
            }
          } while (first.backUp(text));
        }
        cuWordLength = first.acceptMarked(text);
        cpWordLength = first.markedCPLength();
        ++wordsFound;
      }

      if ((utext_getNativeIndex(text) | 0) < rangeEnd && cpWordLength < ROOT_COMBINE_THRESHOLD) {
        const next = words[wordsFound % LOOKAHEAD] as PossibleWord;
        if (
          next.candidates(text, this.fDictionary, rangeEnd) <= 0 &&
          (cuWordLength === 0 || next.longestPrefix() < PREFIX_COMBINE_THRESHOLD)
        ) {
          let remaining = rangeEnd - (current + cuWordLength);
          let chars = 0;
          for (;;) {
            const pcIndex = utext_getNativeIndex(text) | 0;
            const pc = utext_next32(text);
            const pcSize = (utext_getNativeIndex(text) | 0) - pcIndex;
            chars += pcSize;
            remaining -= pcSize;
            if (remaining <= 0) break;
            const uc = utext_current32(text);
            if (this.fEndWordSet.contains(pc) && this.fBeginWordSet.contains(uc)) {
              const following = words[(wordsFound + 1) % LOOKAHEAD] as PossibleWord;
              const numCandidates = following.candidates(text, this.fDictionary, rangeEnd);
              utext_setNativeIndex(text, current + cuWordLength + chars);
              if (numCandidates > 0) break;
            }
          }
          if (cuWordLength <= 0) ++wordsFound;
          cuWordLength += chars;
        } else utext_setNativeIndex(text, current + cuWordLength);
      }

      let currPos: number;
      while (
        (currPos = utext_getNativeIndex(text) | 0) < rangeEnd &&
        this.fMarkSet.contains(utext_current32(text))
      ) {
        utext_next32(text);
        cuWordLength += (utext_getNativeIndex(text) | 0) - currPos;
      }

      if (suffixSet !== null && (utext_getNativeIndex(text) | 0) < rangeEnd && cuWordLength > 0) {
        const next = words[wordsFound % LOOKAHEAD] as PossibleWord;
        let uc: number;
        if (
          next.candidates(text, this.fDictionary, rangeEnd) <= 0 &&
          suffixSet.contains((uc = utext_current32(text)))
        ) {
          if (uc === THAI_PAIYANNOI) {
            if (!suffixSet.contains(utext_previous32(text))) {
              utext_next32(text);
              const paiyannoiIndex = utext_getNativeIndex(text) | 0;
              utext_next32(text);
              cuWordLength += (utext_getNativeIndex(text) | 0) - paiyannoiIndex;
              uc = utext_current32(text);
            } else utext_next32(text);
          }
          if (uc === THAI_MAIYAMOK) {
            if (utext_previous32(text) !== THAI_MAIYAMOK) {
              utext_next32(text);
              const maiyamokIndex = utext_getNativeIndex(text) | 0;
              utext_next32(text);
              cuWordLength += (utext_getNativeIndex(text) | 0) - maiyamokIndex;
            } else utext_next32(text);
          }
        } else utext_setNativeIndex(text, current + cuWordLength);
      }

      if (cuWordLength > 0) foundBreaks.push(current + cuWordLength, status);
    }

    if (foundBreaks.peeki() >= rangeEnd) {
      foundBreaks.popi();
      --wordsFound;
    }
    return wordsFound | 0;
  }
}

/** Original Thai dictionary engine and its additional suffix set. */
export class ThaiBreakEngine extends SoutheastAsianBreakEngine {
  /** Adopts the original Thai matcher. @param dictionary - Original dictionary. @param status - Sticky source status. @returns Engine owner. */
  constructor(dictionary: DictionaryMatcher, status: [number]) {
    super(dictionary, ranges.thai, status, new UnicodeSet(ranges.thai.suffix));
  }
}

/** Original Lao dictionary engine. */
export class LaoBreakEngine extends SoutheastAsianBreakEngine {
  /** Adopts the original Lao matcher. @param dictionary - Original dictionary. @param status - Sticky source status. @returns Engine owner. */
  constructor(dictionary: DictionaryMatcher, status: [number]) {
    super(dictionary, ranges.lao, status);
  }
}

/** Original Burmese dictionary engine. */
export class BurmeseBreakEngine extends SoutheastAsianBreakEngine {
  /** Adopts the original Burmese matcher. @param dictionary - Original dictionary. @param status - Sticky source status. @returns Engine owner. */
  constructor(dictionary: DictionaryMatcher, status: [number]) {
    super(dictionary, ranges.burmese, status);
  }
}

/** Original Khmer dictionary engine. */
export class KhmerBreakEngine extends SoutheastAsianBreakEngine {
  /** Adopts the original Khmer matcher. @param dictionary - Original dictionary. @param status - Sticky source status. @returns Engine owner. */
  constructor(dictionary: DictionaryMatcher, status: [number]) {
    super(dictionary, ranges.khmer, status);
  }
}

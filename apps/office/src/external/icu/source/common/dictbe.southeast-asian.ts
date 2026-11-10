/** @fileoverview Original ICU78.3 Thai, Lao and Burmese dictionary break algorithms from dictbe.cpp. */
import {
  DictionaryBreakEngine,
  PossibleWord,
  dictionarySetContains,
  nextDictionaryIndex,
} from "./dictbe";
import type { DictionaryMatcher } from "./dictionarydata";

const LOOKAHEAD = 3;
const ROOT_COMBINE_THRESHOLD = 3;
const PREFIX_COMBINE_THRESHOLD = 3;
const MIN_WORD_SPAN = 4;
const THAI_PAIYANNOI = 0x0e2f;
const THAI_MAIYAMOK = 0x0e46;

/** Original engine constructor UnicodeSets evaluated with pinned ICU78.3. Mark sets include the native ASCII space addition. */
const thaiWord = [3585, 3642, 3648, 3662],
  thaiMarks = [32, 32, 3633, 3633, 3636, 3642, 3655, 3662],
  thaiBegin = [0x0e01, 0x0e2e, 0x0e40, 0x0e44],
  thaiEnd = [3585, 3632, 3634, 3642, 3653, 3662],
  laoWord = [
    3713, 3714, 3716, 3716, 3718, 3722, 3724, 3747, 3749, 3749, 3751, 3773, 3776, 3780, 3782, 3782,
    3784, 3790, 3804, 3807,
  ],
  laoMarks = [32, 32, 3761, 3761, 3764, 3772, 3784, 3790],
  laoBegin = [0x0e81, 0x0eae, 0x0ec0, 0x0ec4, 0x0edc, 0x0edd],
  laoEnd = [
    3713, 3714, 3716, 3716, 3718, 3722, 3724, 3747, 3749, 3749, 3751, 3773, 3782, 3782, 3784, 3790,
    3804, 3807,
  ],
  burmeseWord = [4096, 4159, 4176, 4239, 4250, 4255, 43488, 43503, 43514, 43518, 43616, 43647],
  burmeseMarks = [
    32, 32, 4139, 4158, 4182, 4185, 4190, 4192, 4194, 4196, 4199, 4205, 4209, 4212, 4226, 4237,
    4239, 4239, 4250, 4253, 43493, 43493, 43643, 43645,
  ],
  burmeseBegin = [0x1000, 0x102a];

/** The three original engines share the candidate and resynchronization loop. */
class SoutheastAsianBreakEngine extends DictionaryBreakEngine {
  /** Binds the original per-script sets and suffix selector. @param dictionary - Actual ICU dictionary. @param word - Handled word set. @param marks - Combining mark set. @param begin - Resynchronization begin set. @param end - Resynchronization end set. @param thai - Native Thai admission and suffix rules. @returns Engine. */
  constructor(
    private readonly dictionary: DictionaryMatcher,
    word: readonly number[],
    private readonly marks: readonly number[],
    private readonly begin: readonly number[],
    private readonly end: readonly number[],
    private readonly thai: boolean,
  ) {
    super(word);
  }

  /** Executes the original candidate lookahead, resynchronization and mark loop. @param text - Source. @param position - Native cursor. @param rangeStart - Handled start. @param rangeEnd - Handled end. @param foundBreaks - Original break stack. @returns Number of added breaks. */
  protected divideUpDictionaryRange(
    text: string,
    position: [number],
    rangeStart: number,
    rangeEnd: number,
    foundBreaks: number[],
  ): number {
    if (this.thai) {
      let probe = rangeStart;
      for (let i = 0; i < MIN_WORD_SPAN; ++i) probe = nextDictionaryIndex(text, probe);
      if (probe >= rangeEnd) return 0;
    } else if (rangeEnd - rangeStart < MIN_WORD_SPAN) return 0;

    const words = [new PossibleWord(), new PossibleWord(), new PossibleWord()];
    let wordsFound = 0;
    position[0] = rangeStart;
    while (position[0] < rangeEnd) {
      const current = position[0];
      let wordLength = 0,
        scalarLength = 0;
      const first = words[wordsFound % LOOKAHEAD] as PossibleWord;
      const count = first.candidates(text, position, this.dictionary, rangeEnd);
      if (count > 0) {
        if (count > 1 && position[0] < rangeEnd) {
          const second = words[(wordsFound + 1) % LOOKAHEAD] as PossibleWord,
            third = words[(wordsFound + 2) % LOOKAHEAD] as PossibleWord;
          lookAhead: do {
            if (second.candidates(text, position, this.dictionary, rangeEnd) > 0) {
              first.markCurrent();
              if (position[0] >= rangeEnd) break;
              do {
                if (third.candidates(text, position, this.dictionary, rangeEnd)) {
                  first.markCurrent();
                  break lookAhead;
                }
              } while (second.backUp(position));
            }
          } while (first.backUp(position));
        }
        wordLength = first.acceptMarked(position);
        scalarLength = first.markedCPLength();
        ++wordsFound;
      }

      if (position[0] < rangeEnd && scalarLength < ROOT_COMBINE_THRESHOLD) {
        const next = words[wordsFound % LOOKAHEAD] as PossibleWord;
        if (
          next.candidates(text, position, this.dictionary, rangeEnd) <= 0 &&
          (wordLength === 0 || next.longestPrefix() < PREFIX_COMBINE_THRESHOLD)
        ) {
          while (position[0] < rangeEnd) {
            const previous = text.codePointAt(position[0]) as number;
            const after = nextDictionaryIndex(text, position[0]);
            position[0] = after;
            if (after >= rangeEnd) break;
            const code = text.codePointAt(after) as number;
            if (
              dictionarySetContains(this.end, previous) &&
              dictionarySetContains(this.begin, code)
            ) {
              const match = (words[(wordsFound + 1) % LOOKAHEAD] as PossibleWord).candidates(
                text,
                position,
                this.dictionary,
                rangeEnd,
              );
              position[0] = after;
              if (match > 0) break;
            }
          }
          if (wordLength <= 0) ++wordsFound;
          wordLength = position[0] - current;
        } else position[0] = current + wordLength;
      }

      while (
        position[0] < rangeEnd &&
        dictionarySetContains(this.marks, text.codePointAt(position[0]) as number)
      ) {
        const after = nextDictionaryIndex(text, position[0]);
        wordLength += after - position[0];
        position[0] = after;
      }

      if (this.thai && position[0] < rangeEnd && wordLength > 0) {
        const next = words[wordsFound % LOOKAHEAD] as PossibleWord;
        if (next.candidates(text, position, this.dictionary, rangeEnd) <= 0) {
          let code = text.codePointAt(position[0]);
          if (code === THAI_PAIYANNOI) {
            const previous = text.charCodeAt(position[0] - 1);
            if (previous !== THAI_PAIYANNOI && previous !== THAI_MAIYAMOK) {
              ++position[0];
              ++wordLength;
              code = text.codePointAt(position[0]);
            }
          }
          if (code === THAI_MAIYAMOK && text.charCodeAt(position[0] - 1) !== THAI_MAIYAMOK) {
            ++position[0];
            ++wordLength;
          }
        } else position[0] = current + wordLength;
      }
      if (wordLength > 0) foundBreaks.push(current + wordLength);
    }
    if ((foundBreaks.at(-1) ?? 0) >= rangeEnd) {
      foundBreaks.pop();
      --wordsFound;
    }
    return wordsFound | 0;
  }
}

/** Original Thai dictionary and suffix policy. */
export class ThaiBreakEngine extends SoutheastAsianBreakEngine {
  /** Selects the original ICU Thai sets. @param dictionary - Actual Thai dictionary. @returns Engine. */
  constructor(dictionary: DictionaryMatcher) {
    super(dictionary, thaiWord, thaiMarks, thaiBegin, thaiEnd, true);
  }
}

/** Original Lao dictionary policy. */
export class LaoBreakEngine extends SoutheastAsianBreakEngine {
  /** Selects the original ICU Lao sets. @param dictionary - Actual Lao dictionary. @returns Engine. */
  constructor(dictionary: DictionaryMatcher) {
    super(dictionary, laoWord, laoMarks, laoBegin, laoEnd, false);
  }
}

/** Original Burmese dictionary policy. */
export class BurmeseBreakEngine extends SoutheastAsianBreakEngine {
  /** Selects the original ICU Burmese sets. @param dictionary - Actual Burmese dictionary. @returns Engine. */
  constructor(dictionary: DictionaryMatcher) {
    super(dictionary, burmeseWord, burmeseMarks, burmeseBegin, burmeseWord, false);
  }
}

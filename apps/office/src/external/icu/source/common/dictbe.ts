/** @fileoverview Native ICU78.3 dictionary span and candidate owners with the LibreOffice Khmer patch. */
import type { DictionaryIgnoreSet, DictionaryMatcher } from "./dictionarydata";
import { U_FAILURE } from "./unicode/utypes";

const POSSIBLE_WORD_LIST_MAX = 20;

/** The original cached candidate slot for Southeast Asian dictionary lookahead. */
export class PossibleWord {
  private count = 0;
  private prefix: [number] = [0];
  private offset = -1;
  private mark = 0;
  private current = 0;
  private readonly cuLengths: number[] = [];
  private readonly cpLengths: number[] = [];

  /** Obtains candidates at the current source offset and selects the longest. @param text - Immutable UTF16 text. @param position - Native cursor. @param dictionary - Actual matcher. @param rangeEnd - Source extent. @param ignoreSet - Optional LibreOffice matcher filter. @param minLength - Optional LibreOffice scalar lower bound. @returns Number of candidates. */
  candidates(
    text: string,
    position: [number],
    dictionary: DictionaryMatcher,
    rangeEnd: number,
    ignoreSet: DictionaryIgnoreSet | null = null,
    minLength = 0,
  ): number {
    const start = position[0];
    if (start !== this.offset) {
      this.offset = start;
      this.count = dictionary.matches(
        text,
        position,
        rangeEnd - start,
        POSSIBLE_WORD_LIST_MAX,
        this.cuLengths,
        this.cpLengths,
        null,
        this.prefix,
        ignoreSet,
        minLength,
      );
      if (this.count <= 0) position[0] = start;
    }
    if (this.count > 0) position[0] = start + (this.cuLengths[this.count - 1] as number);
    this.current = this.mark = this.count - 1;
    return this.count;
  }

  /** Positions after the marked candidate. @param position - Native cursor. @returns Candidate UTF16 length. */
  acceptMarked(position: [number]): number {
    const length = this.cuLengths[this.mark] as number;
    position[0] = this.offset + length;
    return length;
  }

  /** Moves to the next shorter candidate, if any. @param position - Native cursor. @returns Whether backed up. */
  backUp(position: [number]): boolean {
    if (this.current <= 0) return false;
    position[0] = this.offset + (this.cuLengths[--this.current] as number);
    return true;
  }

  /** Returns the original prefix count in Unicode scalars. @returns Native prefix. */
  longestPrefix(): number {
    return this.prefix[0];
  }

  /** Saves the current preferred candidate. @returns Nothing. */
  markCurrent(): void {
    this.mark = this.current;
  }

  /** Reads the preferred candidate's scalar length. @returns Original scalar count. */
  markedCPLength(): number {
    return this.cpLengths[this.mark] as number;
  }
}

/** Reads native UTF16 at a clipped position, backing up from the trail of a surrogate pair. @param text - Source. @param index - Requested native position. @returns Aligned index. */
export function dictionaryNativeIndex(text: string, index: number): number {
  const position = Math.max(0, Math.min(index, text.length));
  const unit = text.charCodeAt(position),
    previous = text.charCodeAt(position - 1);
  return unit >= 0xdc00 && unit <= 0xdfff && previous >= 0xd800 && previous <= 0xdbff
    ? position - 1
    : position;
}

/** Advances after the next original UTF16 scalar, retaining isolated surrogate units. @param text - Source. @param index - Native position. @returns Next position or unchanged end. */
export function nextDictionaryIndex(text: string, index: number): number {
  const code = text.codePointAt(index);
  return code === undefined ? index : index + (code > 0xffff ? 2 : 1);
}

/** Tests a native UnicodeSet projected as sorted inclusive range pairs. @param ranges - Original property ranges. @param code - Candidate scalar. @returns Membership. */
export function dictionarySetContains(ranges: readonly number[], code: number): boolean {
  let low = 0,
    high = ranges.length / 2;
  while (low < high) {
    const middle = (low + high) >> 1;
    if ((ranges[2 * middle + 1] as number) < code) low = middle + 1;
    else high = middle;
  }
  return low < ranges.length / 2 && (ranges[2 * low] as number) <= code;
}

/** Original ICU base scans the registered character span before dispatching to the language engine. */
export abstract class DictionaryBreakEngine {
  /** Stores the actual immutable source character set. @param characters - Native inclusive range pairs. @returns Engine. */
  constructor(private readonly characters: readonly number[]) {}

  /** Original ICU ignores locale when testing its internal script set. @param code - Unicode scalar. @param locale - Requested ICU locale. @returns Membership. */
  handles(code: number, locale: string): boolean {
    void locale;
    return dictionarySetContains(this.characters, code);
  }

  /** Finds original dictionary boundaries inside the native handled span. @param text - UTF16 input. @param position - Mutable UText index. @param start - Requested start. @param end - Exclusive extent. @param foundBreaks - Appended native break stack. @param phrase - Original phrase-break selector. @param status - Sticky ICU status. @returns Number of new boundaries. */
  findBreaks(
    text: string,
    position: [number],
    start: number,
    end: number,
    foundBreaks: number[],
    phrase: boolean,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    const rangeStart = dictionaryNativeIndex(text, start);
    let rangeEnd = rangeStart;
    for (
      let code = text.codePointAt(rangeEnd);
      rangeEnd < end && code !== undefined && dictionarySetContains(this.characters, code);
      code = text.codePointAt(rangeEnd)
    )
      rangeEnd = nextDictionaryIndex(text, rangeEnd);
    position[0] = rangeEnd;
    const count = this.divideUpDictionaryRange(
      text,
      position,
      rangeStart,
      rangeEnd,
      foundBreaks,
      phrase,
      status,
    );
    position[0] = rangeEnd;
    return count;
  }

  /** Original language-specific split. @param text - Source. @param position - Native cursor. @param start - Handled span start. @param end - Handled span end. @param foundBreaks - Native break stack. @param phrase - Phrase selector. @param status - ICU status. @returns Added break count. */
  protected abstract divideUpDictionaryRange(
    text: string,
    position: [number],
    start: number,
    end: number,
    foundBreaks: number[],
    phrase: boolean,
    status: [number],
  ): number;
}

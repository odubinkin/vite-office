/** @fileoverview Native ICU78.3 PossibleWord candidate selection with the LibreOffice Khmer patch. */
import type { DictionaryIgnoreSet, DictionaryMatcher } from "./dictionarydata";

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

/** @fileoverview ICU Normalizer2Impl counted UTF-16 canonical composition over the original Nrm2 data. */
import { ucptrie_get, type UCPTrie } from "./unicode/ucptrie";

const INERT = 1;
const JAMO_L = 2;
const MIN_NORMAL_MAYBE_YES = 0xfc00;
const JAMO_VT = 0xfe00;
const MIN_YES_YES_WITH_CC = 0xfe02;
const HAS_COMP_BOUNDARY_AFTER = 1;
const OFFSET_SHIFT = 1;
const DELTA_SHIFT = 3;
const MAX_DELTA = 0x40;
const MAPPING_LENGTH_MASK = 0x1f;
const COMP_1_LAST_TUPLE = 0x8000;
const COMP_1_TRIPLE = 1;
const COMP_1_TRAIL_LIMIT = 0x3400;
const COMP_1_TRAIL_MASK = 0x7ffe;
const COMP_1_TRAIL_SHIFT = 9;
const COMP_2_TRAIL_SHIFT = 6;
const COMP_2_TRAIL_MASK = 0xffc0;
const JAMO_L_BASE = 0x1100;
const JAMO_V_BASE = 0x1161;
const JAMO_T_BASE = 0x11a7;
const HANGUL_BASE = 0xac00;
const JAMO_L_COUNT = 19;
const JAMO_V_COUNT = 21;
const JAMO_T_COUNT = 28;
const HANGUL_COUNT = JAMO_L_COUNT * JAMO_V_COUNT * JAMO_T_COUNT;

/** Index positions of original Normalizer2Impl data format version 5. */
export enum Normalizer2Index {
  IX_NORM_TRIE_OFFSET,
  IX_EXTRA_DATA_OFFSET,
  IX_SMALL_FCD_OFFSET,
  IX_RESERVED3_OFFSET,
  IX_RESERVED4_OFFSET,
  IX_RESERVED5_OFFSET,
  IX_RESERVED6_OFFSET,
  IX_TOTAL_SIZE,
  IX_MIN_DECOMP_NO_CP,
  IX_MIN_COMP_NO_MAYBE_CP,
  IX_MIN_YES_NO,
  IX_MIN_NO_NO,
  IX_LIMIT_NO_NO,
  IX_MIN_MAYBE_YES,
  IX_MIN_YES_NO_MAPPINGS_ONLY,
  IX_MIN_NO_NO_COMP_BOUNDARY_BEFORE,
  IX_MIN_NO_NO_COMP_NO_MAYBE_CC,
  IX_MIN_NO_NO_EMPTY,
  IX_MIN_LCCC_CP,
  IX_RESERVED19,
  IX_MIN_MAYBE_NO,
  IX_MIN_MAYBE_NO_COMBINES_FWD,
}

/** Original counted Nrm2 list and scalar trie. */
export class Normalizer2Impl {
  private readonly minCompNoMaybeCP: number;
  private readonly minYesNo: number;
  private readonly minYesNoMappingsOnly: number;
  private readonly minNoNo: number;
  private readonly minNoNoCompBoundaryBefore: number;
  private readonly minNoNoCompNoMaybeCC: number;
  private readonly minNoNoEmpty: number;
  private readonly limitNoNo: number;
  private readonly minMaybeNo: number;
  private readonly minMaybeYes: number;
  private readonly centerNoNoDelta: number;

  /** Initializes the consumed original normalization fields. @param indexes - Original offsets and thresholds. @param normTrie - Borrowed FAST16 trie. @param extraData - Original mapping and composition units. @returns Normalization owner. */
  constructor(
    indexes: Int32Array,
    private readonly normTrie: UCPTrie,
    private readonly extraData: Uint16Array,
  ) {
    const ix = Normalizer2Index;
    this.minCompNoMaybeCP = indexes[ix.IX_MIN_COMP_NO_MAYBE_CP] as number;
    this.minYesNo = indexes[ix.IX_MIN_YES_NO] as number;
    this.minYesNoMappingsOnly = indexes[ix.IX_MIN_YES_NO_MAPPINGS_ONLY] as number;
    this.minNoNo = indexes[ix.IX_MIN_NO_NO] as number;
    this.minNoNoCompBoundaryBefore = indexes[ix.IX_MIN_NO_NO_COMP_BOUNDARY_BEFORE] as number;
    this.minNoNoCompNoMaybeCC = indexes[ix.IX_MIN_NO_NO_COMP_NO_MAYBE_CC] as number;
    this.minNoNoEmpty = indexes[ix.IX_MIN_NO_NO_EMPTY] as number;
    this.limitNoNo = indexes[ix.IX_LIMIT_NO_NO] as number;
    this.minMaybeNo = indexes[ix.IX_MIN_MAYBE_NO] as number;
    this.minMaybeYes = indexes[ix.IX_MIN_MAYBE_YES] as number;
    this.centerNoNoDelta = (this.minMaybeNo >> DELTA_SHIFT) - MAX_DELTA - 1;
  }

  /** Original scalar lookup, treating a lone lead surrogate as inert. @param c - Code point. @returns Normalization value. */
  getNorm16(c: number): number {
    return c >= 0xd800 && c <= 0xdbff ? INERT : ucptrie_get(this.normTrie, c);
  }

  /** Original composition boundary before a scalar. @param c - Code point. @returns Boundary flag. */
  hasCompBoundaryBefore(c: number): boolean {
    return c < this.minCompNoMaybeCP || this.norm16HasCompBoundaryBefore(this.getNorm16(c));
  }

  /** Original composition boundary bit for non-contiguous composition. @param norm16 - Trie value. @returns Boundary flag. */
  private hasCompBoundaryAfter(norm16: number): boolean {
    return (norm16 & HAS_COMP_BOUNDARY_AFTER) !== 0;
  }

  /** Original boundary-before classification. @param norm16 - Trie value. @returns Boundary flag. */
  private norm16HasCompBoundaryBefore(norm16: number): boolean {
    return norm16 < this.minNoNoCompNoMaybeCC || this.isAlgorithmicNoNo(norm16);
  }

  /** Original algorithmic delta range. @param norm16 - Trie value. @returns Whether a delta mapping is encoded. */
  private isAlgorithmicNoNo(norm16: number): boolean {
    return this.limitNoNo <= norm16 && norm16 < this.minMaybeNo;
  }

  /** Applies the native signed delta. @param c - Original scalar. @param norm16 - Trie value. @returns Mapped scalar. */
  private mapAlgorithmic(c: number, norm16: number): number {
    return c + (norm16 >> DELTA_SHIFT) - this.centerNoNoDelta;
  }

  /** Resolves the variable-length native mapping or composition table offset. @param norm16 - Trie value. @returns Unit offset. */
  private getData(norm16: number): number {
    if (norm16 >= this.minMaybeNo) norm16 = norm16 - this.minMaybeNo + this.limitNoNo;
    return norm16 >> OFFSET_SHIFT;
  }

  /** Reads the mapping header and counts its UTF-16 units. @param index - Mapping offset. @returns Count. */
  private mappingLength(index: number): number {
    return (this.extraData[index] as number) & MAPPING_LENGTH_MASK;
  }

  /** Appends a decomposed scalar in canonical order, retaining equal-class input order. @param buffer - Scalar reordering buffer. @param c - Decomposed scalar. @param cc - Canonical combining class. @returns Nothing. */
  private appendOrdered(buffer: number[], c: number, cc: number): void {
    let i = buffer.length;
    if (cc !== 0) {
      while (i > 0 && combiningClass(this.getNorm16(buffer[i - 1] as number)) > cc) --i;
    }
    if (i === buffer.length) buffer.push(c);
    else buffer.splice(i, 0, c);
  }

  /** Appends the source's fully decomposed mapping, or Hangul Jamo. @param c - Original scalar. @param norm16 - Trie value. @param buffer - Canonical-order output. @returns Nothing. */
  private decompose(c: number, norm16: number, buffer: number[]): void {
    if (norm16 >= this.minMaybeYes) {
      this.appendOrdered(buffer, c, combiningClass(norm16));
      return;
    }
    if (this.isAlgorithmicNoNo(norm16)) {
      c = this.mapAlgorithmic(c, norm16);
      norm16 = ucptrie_get(this.normTrie, c);
    }
    if (norm16 < this.minYesNo) {
      buffer.push(c);
    } else if (
      norm16 === this.minYesNo ||
      norm16 === (this.minYesNoMappingsOnly | HAS_COMP_BOUNDARY_AFTER)
    ) {
      const syllable = c - HANGUL_BASE;
      const trail = syllable % JAMO_T_COUNT;
      const lv = Math.trunc(syllable / JAMO_T_COUNT);
      buffer.push(JAMO_L_BASE + Math.trunc(lv / JAMO_V_COUNT), JAMO_V_BASE + (lv % JAMO_V_COUNT));
      if (trail !== 0) buffer.push(JAMO_T_BASE + trail);
    } else {
      const index = this.getData(norm16);
      const units = this.extraData.subarray(index + 1, index + 1 + this.mappingLength(index));
      const mapping = String.fromCharCode(...units);
      for (let i = 0; i < mapping.length;) {
        const mapped = mapping.codePointAt(i) as number;
        this.appendOrdered(buffer, mapped, combiningClass(this.getNorm16(mapped)));
        i += codePointLength(mapped);
      }
    }
  }

  /** Original slow-path traversal, optionally stopping at the next composition boundary. @param s - Counted input. @param start - Start offset. @param limit - End offset. @param stop - Stop at boundary. @param buffer - Reordering output. @returns Native end index. */
  private decomposeShort(
    s: string,
    start: number,
    limit: number,
    stop: boolean,
    buffer: number[],
  ): number {
    while (start < limit) {
      const c = s.codePointAt(start) as number;
      const norm16 = this.getNorm16(c);
      if (stop && this.norm16HasCompBoundaryBefore(norm16)) break;
      start += codePointLength(c);
      this.decompose(c, norm16, buffer);
      if (stop && this.hasCompBoundaryAfter(norm16)) break;
    }
    return start;
  }

  /** Searches an original two- or three-unit composition tuple list. @param list - Native unit offset. @param trail - Combining scalar. @returns Composite and forward flag, or -1. */
  private combine(list: number, trail: number): number {
    const units = this.extraData;
    if (trail < COMP_1_TRAIL_LIMIT) {
      const key1 = trail << 1;
      let first = units[list] as number;
      while (key1 > first) {
        list += 2 + (first & COMP_1_TRIPLE);
        first = units[list] as number;
      }
      if (key1 === (first & COMP_1_TRAIL_MASK))
        return (first & COMP_1_TRIPLE) !== 0
          ? ((units[list + 1] as number) << 16) | (units[list + 2] as number)
          : (units[list + 1] as number);
    } else {
      const key1 = COMP_1_TRAIL_LIMIT + ((trail >> COMP_1_TRAIL_SHIFT) & ~COMP_1_TRIPLE);
      const key2 = (trail << COMP_2_TRAIL_SHIFT) & 0xffff;
      for (;;) {
        const first = units[list] as number;
        if (key1 > first) list += 2 + (first & COMP_1_TRIPLE);
        else if (key1 === (first & COMP_1_TRAIL_MASK)) {
          const second = units[list + 1] as number;
          if (key2 > second) {
            if ((first & COMP_1_LAST_TUPLE) !== 0) break;
            list += 3;
          } else if (key2 === (second & COMP_2_TRAIL_MASK)) {
            return ((second & ~COMP_2_TRAIL_MASK) << 16) | (units[list + 2] as number);
          } else break;
        } else break;
      }
    }
    return -1;
  }

  /** Recomposes the source-ordered buffer, preserving native blocking and forward flags. @param input - Decomposed canonically ordered scalars. @returns Composed UTF-16 span. */
  private recompose(input: readonly number[]): string {
    const output: number[] = [];
    let starter = -1;
    let compositionsList = -1;
    let prevCC = 0;
    for (let i = 0; i < input.length; ++i) {
      const c = input[i] as number;
      const norm16 = this.getNorm16(c);
      const cc = combiningClass(norm16);
      if (
        this.minMaybeNo <= norm16 &&
        norm16 <= JAMO_VT &&
        compositionsList >= 0 &&
        (prevCC < cc || prevCC === 0)
      ) {
        if (norm16 === JAMO_VT) {
          const prev = (output[starter] as number) - JAMO_L_BASE;
          if (c < JAMO_T_BASE && prev >= 0 && prev < JAMO_L_COUNT) {
            let syllable = HANGUL_BASE + (prev * JAMO_V_COUNT + c - JAMO_V_BASE) * JAMO_T_COUNT;
            const t = (input[i + 1] as number) - JAMO_T_BASE;
            if (t >= 0 && t < JAMO_T_COUNT) {
              ++i;
              syllable += t;
            }
            output[starter] = syllable;
          } else output.push(c);
          compositionsList = -1;
          continue;
        }
        const compositeAndFwd = this.combine(compositionsList, c);
        if (compositeAndFwd >= 0) {
          const composite = compositeAndFwd >> 1;
          output[starter] = composite;
          if ((compositeAndFwd & 1) !== 0) {
            const index = this.getData(ucptrie_get(this.normTrie, composite));
            compositionsList = index + 1 + this.mappingLength(index);
          } else compositionsList = -1;
          continue;
        }
      }
      prevCC = cc;
      if (cc === 0) {
        compositionsList =
          norm16 < JAMO_L || norm16 >= MIN_NORMAL_MAYBE_YES ? -1 : this.getData(norm16);
        starter = output.length;
      }
      output.push(c);
    }
    let result = "";
    for (const c of output) result += String.fromCodePoint(c);
    return result;
  }

  /** Original counted composition and isNormalized paths, without contiguous-only FCC mode. @param s - Input UTF-16 span. @param doCompose - Whether to write normalized output. @returns Composed text, empty success for checking, or null on a failed check. */
  compose(s: string, doCompose: boolean): string | null {
    const limit = s.length;
    let result = "";
    let src = 0;
    let prevBoundary = 0;

    while (src < limit) {
      const c = s.codePointAt(src) as number;
      const norm16 = this.getNorm16(c);
      let prevSrc = src;
      src += codePointLength(c);
      if (c < this.minCompNoMaybeCP || norm16 < this.minNoNo) continue;

      if (norm16 < this.minMaybeNo) {
        if (!doCompose) return null;
        const nextBoundary =
          src === limit || this.hasCompBoundaryBefore(s.codePointAt(src) as number);
        if (
          (this.isAlgorithmicNoNo(norm16) || norm16 < this.minNoNoCompBoundaryBefore) &&
          (this.hasCompBoundaryAfter(norm16) || nextBoundary)
        ) {
          result += s.slice(prevBoundary, prevSrc);
          if (this.isAlgorithmicNoNo(norm16)) {
            result += String.fromCodePoint(this.mapAlgorithmic(c, norm16));
          } else {
            const index = this.getData(norm16);
            result += String.fromCharCode(
              ...this.extraData.subarray(index + 1, index + 1 + this.mappingLength(index)),
            );
          }
          prevBoundary = src;
          continue;
        }
        if (
          norm16 >= this.minNoNoEmpty &&
          (nextBoundary ||
            (prevBoundary !== prevSrc &&
              this.hasCompBoundaryAfter(
                this.getNorm16(s.codePointAt(previousCodePointStart(s, prevSrc)) as number),
              )))
        ) {
          result += s.slice(prevBoundary, prevSrc);
          prevBoundary = src;
          continue;
        }
      } else if (norm16 === JAMO_VT && prevBoundary !== prevSrc) {
        const prev = s.charCodeAt(prevSrc - 1);
        let syllable = -1;
        if (c < JAMO_T_BASE) {
          const l = prev - JAMO_L_BASE;
          if (l >= 0 && l < JAMO_L_COUNT) {
            if (!doCompose) return null;
            let t = s.charCodeAt(src) - JAMO_T_BASE;
            if (t > 0 && t < JAMO_T_COUNT) ++src;
            else if (src === limit || this.hasCompBoundaryBefore(s.codePointAt(src) as number))
              t = 0;
            else t = -1;
            if (t >= 0)
              syllable = HANGUL_BASE + (l * JAMO_V_COUNT + c - JAMO_V_BASE) * JAMO_T_COUNT + t;
          }
        } else {
          const syllableOffset = prev - HANGUL_BASE;
          if (
            syllableOffset >= 0 &&
            syllableOffset < HANGUL_COUNT &&
            syllableOffset % JAMO_T_COUNT === 0
          )
            syllable = prev + c - JAMO_T_BASE;
        }
        if (syllable >= 0) {
          if (!doCompose) return null;
          result += s.slice(prevBoundary, prevSrc - 1) + String.fromCharCode(syllable);
          prevBoundary = src;
          continue;
        }
      } else if (norm16 > JAMO_VT) {
        let cc = combiningClass(norm16);
        let n16: number;
        let nextSrc: number;
        for (;;) {
          if (src === limit) return doCompose ? result + s.slice(prevBoundary) : "";
          const next = s.codePointAt(src) as number;
          nextSrc = src + codePointLength(next);
          n16 = this.getNorm16(next);
          if (n16 < MIN_YES_YES_WITH_CC) break;
          const prevCC = cc;
          cc = combiningClass(n16);
          if (prevCC > cc) {
            if (!doCompose) return null;
            break;
          }
          src = nextSrc;
        }
        if (this.norm16HasCompBoundaryBefore(n16)) {
          if (n16 < this.minNoNo) src = nextSrc;
          continue;
        }
      }

      if (prevBoundary !== prevSrc && !this.norm16HasCompBoundaryBefore(norm16)) {
        const previous = previousCodePointStart(s, prevSrc);
        if (!this.hasCompBoundaryAfter(this.getNorm16(s.codePointAt(previous) as number)))
          prevSrc = previous;
      }
      if (doCompose) result += s.slice(prevBoundary, prevSrc);
      const buffer: number[] = [];
      this.decomposeShort(s, prevSrc, src, false, buffer);
      src = this.decomposeShort(s, src, limit, true, buffer);
      const normalized = this.recompose(buffer);
      if (doCompose) result += normalized;
      else if (normalized !== s.slice(prevSrc, src)) return null;
      prevBoundary = src;
    }
    return doCompose ? result + s.slice(prevBoundary) : "";
  }
}

/** Original normal Yes/Maybe combining class field. @param norm16 - Native trie value. @returns Canonical combining class. */
function combiningClass(norm16: number): number {
  return norm16 < MIN_NORMAL_MAYBE_YES ? 0 : (norm16 >> OFFSET_SHIFT) & 0xff;
}

/** Native U16_LENGTH for a scalar or isolated code unit. @param c - Code point. @returns Number of UTF-16 units. */
function codePointLength(c: number): number {
  return c <= 0xffff ? 1 : 2;
}

/** Counted U16 backward step, preserving an isolated surrogate. @param s - Counted input. @param end - Position after the code point. @returns Start index. */
function previousCodePointStart(s: string, end: number): number {
  const trail = s.charCodeAt(end - 1);
  const lead = s.charCodeAt(end - 2);
  return end - ((trail & 0xfc00) === 0xdc00 && (lead & 0xfc00) === 0xd800 ? 2 : 1);
}

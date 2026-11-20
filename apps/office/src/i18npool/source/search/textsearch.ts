/** @fileoverview Native absolute/wildcard TextSearch backend: directional native loops, full folding, punctuation and source offsets. ICU regular expressions remain unported. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
import { SearchAlgorithms } from "../../../offapi/com/sun/star/util/SearchAlgorithms";
import type { SearchOptionsConstReference } from "../../../offapi/com/sun/star/util/SearchOptions";
import {
  SearchOptions2 as UnoSearchOptions2,
  type SearchOptions2ConstReference,
} from "../../../offapi/com/sun/star/util/SearchOptions2";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import * as Algorithms from "../../../offapi/com/sun/star/util/SearchAlgorithms2";
import {
  LEV_RELAXED,
  NORM_WORD_ONLY,
  WILD_MATCH_SELECTION,
} from "../../../offapi/com/sun/star/util/SearchFlags";
import {
  asNonConstRange,
  type SequenceElements,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { SearchResult } from "../../../offapi/com/sun/star/util/SearchResult";
import { ALPHA, DIGIT, LETTER } from "../../../offapi/com/sun/star/i18n/KCharacterType";
import { iterateCodePoints } from "../../../o3tl/inc/string_view";
import { getCharacterType } from "../characterclassification/cclass_unicode";
import { supportedTransliteration, transliterate } from "../transliteration/transliterationImpl";

import { WLevDistance } from "./levdis";
import { BreakIterator } from "../../../offapi/com/sun/star/i18n/BreakIterator";
import type { XBreakIteratorService } from "../../../offapi/com/sun/star/i18n/XBreakIterator";
import { ANYWORD_IGNOREWHITESPACES } from "../../../offapi/com/sun/star/i18n/WordType";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";

/** Native result default: no expressions and empty offset sequences. @returns Unsuccessful search result. */
function notFound(): SearchResult {
  return new SearchResult();
}
/** Original wildcard and approximate paths update the caller result with actual one-element sequences. @param result - Caller-owned result. @param start - Directional start. @param end - Directional end. @returns Nothing. */
function setWildcardMatch(result: SearchResult, start: number, end: number): void {
  result.subRegExpressions = 1;
  result.startOffset.realloc(1);
  result.endOffset.realloc(1);
  ((result.startOffset.getArray() as SequenceElements).get(0) as [number])[0] = start;
  ((result.endOffset.getArray() as SequenceElements).get(0) as [number])[0] = end;
}
/** Original searchForward/searchBackward group-offset remapping blocks, with their duplicated directional syntax erased. This initialized kernel export is not a new UNO search interface or a regex backend. @param original - Untransliterated source. @param offsets - Existing transliteration output-to-source binding. @param result - Actual caller-owned native result. @param forward - Source direction. @returns Nothing; all native groups are updated in place. */
export function replaceTransliterationOffsets(
  original: OUStringConstReference,
  offsets: readonly number[],
  result: SearchResult,
  forward: boolean,
): void {
  if (offsets.length === 0) return;
  const source = original.getStr().subarray(0, original.getLength()),
    starts = asNonConstRange(result.startOffset),
    ends = asNonConstRange(result.endOffset),
    lows = forward ? starts : ends,
    highs = forward ? ends : starts;
  for (let k = 0; k < result.startOffset.getLength(); k++) {
    const low = lows.operatorIndex(k, 4),
      high = highs.operatorIndex(k, 4);
    if (low[0] >= 0) {
      if (low[0] < offsets.length) low[0] = offsets[low[0]] as number;
      else {
        const position: [number] = [offsets[offsets.length - 1] as number];
        iterateCodePoints(source, position, 1);
        low[0] = position[0];
      }
    }
    if (high[0] >= 0) {
      if (high[0] > 0) {
        const position: [number] = [offsets[Math.min(high[0], offsets.length) - 1] as number];
        iterateCodePoints(source, position, 1);
        high[0] = position[0];
      } else high[0] = offsets[0] as number;
    }
  }
}
/** Native punctuation detection, independent of whether the key contains an ASCII quote. @param text - UTF-16 text. @returns Whether a typographic quote occurs. */
function isReplacePunctuation(text: Uint16Array): boolean {
  return text.some(
    /** Checks the exact native contiguous quote range. @param c - UTF-16 unit. @returns Whether a quote. */ (
      c,
    ) => c >= 0x2018 && c <= 0x201f,
  );
}
/** Native replacePunctuation maps all eight typographic quote forms. @param text - UTF-16 text. @returns Independent transformed text. */
function replacePunctuation(text: Uint16Array): Uint16Array {
  return text.map(
    /** Maps a single quote unit. @param c - Original unit. @returns Native punctuation unit. */ (
      c,
    ) => (c >= 0x2018 && c <= 0x201b ? 39 : c >= 0x201c && c <= 0x201f ? 34 : c),
  );
}
const complexTransMask =
  TransliterationFlags.ignoreBaFa_ja_JP |
  TransliterationFlags.ignoreIterationMark_ja_JP |
  TransliterationFlags.ignoreTiJi_ja_JP |
  TransliterationFlags.ignoreHyuByu_ja_JP |
  TransliterationFlags.ignoreSeZe_ja_JP |
  TransliterationFlags.ignoreIandEfollowedByYa_ja_JP |
  TransliterationFlags.ignoreKiKuFollowedBySa_ja_JP |
  TransliterationFlags.ignoreProlongedSoundMark_ja_JP;

/** Stores an independent native key and its directional caches for one search pass. */
interface PreparedPattern {
  units: Uint16Array;
  jumpTable?: Map<number, number>;
  forwardTable?: boolean;
  reverse?: Uint16Array;
}

/** Native primary absolute/wildcard-search owner; realm-local Map storage replaces the native jump-table allocation. */
export class TextSearch {
  private aSrchPara = new SearchOptions2();
  private primaryPattern: PreparedPattern = { units: new Uint16Array() };
  private complexPattern: { flags: number; pattern: PreparedPattern } | undefined;
  private pattern = this.primaryPattern;
  private distance: WLevDistance | undefined;
  private static wordBreak: Reference<XBreakIteratorService> | undefined;
  private bSearchApostrophe = false;
  private mcWildcardEscapeChar = 0;
  private mbWildcardAllowSubstring = true;

  /** Initializes source options before the first search. @param options - Native option value. @returns Search owner. */
  public constructor(options = new SearchOptions2()) {
    this.setOptions2(options);
  }
  /** Original legacy XTextSearch entry point: upgrade its algorithm, copy all fields and set wildcard escape to zero before calling setOptions2. @param options - Legacy UNO value. @returns Nothing. */
  public setOptions(options: SearchOptionsConstReference): void {
    let algorithm: number;
    switch (options.algorithmType) {
      case SearchAlgorithms.REGEXP:
        algorithm = Algorithms.REGEXP;
        break;
      case SearchAlgorithms.APPROXIMATE:
        algorithm = Algorithms.APPROXIMATE;
        break;
      default:
        algorithm = Algorithms.ABSOLUTE;
    }
    const upgraded = new UnoSearchOptions2(
      options.algorithmType,
      options.searchFlag,
      options.searchString,
      options.replaceString,
      options.Locale,
      options.changedChars,
      options.deletedChars,
      options.insertedChars,
      options.transliterateFlags,
      algorithm,
      0,
    );
    this.setOptions2(upgraded);
  }
  /** Copies options and resets native prepared key/jump state. @param options - New native options. @returns Nothing. */
  public setOptions2(options: SearchOptions2 | SearchOptions2ConstReference): void {
    if (options.AlgorithmType2 === Algorithms.REGEXP)
      throw new Error("This TextSearch algorithm is not implemented.");
    if ((options.transliterateFlags & ~supportedTransliteration) !== 0)
      throw new Error("This TextSearch transliteration is not implemented.");
    const para = new SearchOptions2().assign(options);
    const original = para.searchString.getStr().subarray(0, para.searchString.getLength());
    this.bSearchApostrophe = original.includes(39) || original.includes(34);
    const simpleFlags = para.transliterateFlags & ~complexTransMask;
    let key =
      simpleFlags !== 0
        ? transliterate(para.searchString, 0, original.length, simpleFlags, para.Locale, false).text
        : para.searchString;
    if (this.bSearchApostrophe && isReplacePunctuation(original))
      key = new OUString(
        replacePunctuation(key.getStr().subarray(0, key.getLength())),
        key.getLength(),
      );
    this.primaryPattern = { units: key.getStr().slice(0, key.getLength()) };
    this.pattern = this.primaryPattern;
    if ((para.transliterateFlags & complexTransMask) !== 0) {
      const flags =
        para.transliterateFlags &
        (complexTransMask |
          TransliterationFlags.IGNORE_KANA |
          TransliterationFlags.FULLWIDTH_HALFWIDTH);
      const complexKey = transliterate(
        para.searchString,
        0,
        original.length,
        flags,
        para.Locale,
        false,
      ).text;
      this.complexPattern = {
        flags,
        pattern: { units: complexKey.getStr().slice(0, complexKey.getLength()) },
      };
      complexKey.dispose();
    } else if (this.complexPattern !== undefined) {
      // setOptions2 in the pinned source resets the caches, retaining the loaded complex module and key.
      this.complexPattern.pattern = { units: this.complexPattern.pattern.units };
    }
    this.distance = undefined;
    if (para.AlgorithmType2 === Algorithms.APPROXIMATE) {
      const terminated = new Uint16Array(this.primaryPattern.units.length + 1);
      terminated.set(this.primaryPattern.units);
      this.distance = new WLevDistance(
        terminated,
        para.changedChars,
        para.insertedChars,
        para.deletedChars,
        (para.searchFlag & LEV_RELAXED) !== 0,
      );
    }
    this.aSrchPara = para;
    this.mcWildcardEscapeChar = para.WildcardEscapeCharacter >>> 0;
    this.mbWildcardAllowSubstring = (para.searchFlag & WILD_MATCH_SELECTION) === 0;
  }
  /** Calls the forward engine and remaps transliterated UTF-16 endpoints. @param text - Original text. @param startPos - Inclusive lower bound. @param endPos - Exclusive upper bound. @returns Directional result. */
  public searchForward(
    text: OUStringConstReference,
    startPos: number,
    endPos: number,
  ): SearchResult {
    return this.search(text, startPos, endPos, true);
  }
  /** Calls the backward engine; returned start is high/exclusive. @param text - Original text. @param startPos - High bound. @param endPos - Low bound. @returns Directional result. */
  public searchBackward(
    text: OUStringConstReference,
    startPos: number,
    endPos: number,
  ): SearchResult {
    return this.search(text, startPos, endPos, false);
  }
  /** Native IsDelimiter uses character type, not ICU word segmentation or a regex word boundary. @param text - Searched text. @param position - Original code-unit offset. @returns Whether not a letter/number. */
  private IsDelimiter(text: OUStringConstReference, position: number): boolean {
    return (
      text.getStr()[position] === 0x7f ||
      (getCharacterType(text, position) & (DIGIT | ALPHA | LETTER)) === 0
    );
  }
  /** Builds the directional native bad-character table once per direction. @param forward - Requested table direction. @returns Nothing. */
  private MakeTable(forward: boolean): void {
    if (this.pattern.jumpTable !== undefined && this.pattern.forwardTable === forward) return;
    this.pattern.forwardTable = forward;
    this.pattern.jumpTable = new Map();
    const key = this.pattern.units;
    if (forward) {
      for (let i = 0; i < key.length - 1; i++)
        this.pattern.jumpTable.set(key[i] as number, key.length - i - 1);
    } else {
      for (let i = key.length - 1; i > 0; i--) this.pattern.jumpTable.set(key[i] as number, i);
    }
  }
  /** Native jump lookup defaults to the whole key length. @param unit - Inspected input unit. @returns Positive distance. */
  private GetDiff(unit: number): number {
    return this.pattern.jumpTable?.get(unit) ?? this.pattern.units.length;
  }
  /** Runs native punctuation/transliteration preparation and original offset recovery. @param text - Source text. @param start - Directional start. @param end - Directional end. @param forward - Direction. @returns Native result. */
  private search(
    text: OUStringConstReference,
    start: number,
    end: number,
    forward: boolean,
  ): SearchResult {
    const lower = forward ? start : end,
      upper = forward ? end : start;
    if (
      !Number.isInteger(lower) ||
      !Number.isInteger(upper) ||
      lower < 0 ||
      upper < lower ||
      upper > text.getLength()
    )
      throw new RangeError("TextSearch bounds are outside the original string.");
    const original = text.getStr().subarray(0, text.getLength());
    const replace = this.bSearchApostrophe && isReplacePunctuation(original);
    const simpleFlags = this.aSrchPara.transliterateFlags & ~complexTransMask;
    const mapped =
      simpleFlags === 0
        ? undefined
        : transliterate(text, lower, upper - lower, simpleFlags, this.aSrchPara.Locale, true);
    let input: Uint16Array =
      mapped === undefined
        ? original.slice()
        : mapped.text.getStr().slice(0, mapped.text.getLength());
    if (replace) {
      // Upstream's no-transliteration forward path replaces ONLY U+2019.
      input =
        mapped !== undefined || !forward
          ? replacePunctuation(input)
          : input.map(
              /** Preserves the native forward-only punctuation asymmetry. @param c - Unit. @returns Mapped unit. */ (
                c,
              ) => (c === 0x2019 ? 39 : c),
            );
    }
    const offsets = mapped?.offsets;
    const lo = offsets === undefined ? lower : lower === 0 ? 0 : this.FindPos(offsets, lower);
    const hi =
      offsets === undefined
        ? upper
        : upper < text.getLength()
          ? this.FindPos(offsets, upper)
          : input.length;
    const prepared = new OUString(input, input.length);
    const result = this.SearchPrepared(prepared, lo, hi, forward);
    prepared.dispose();
    mapped?.text.dispose();
    if (offsets !== undefined) replaceTransliterationOffsets(text, offsets, result, forward);

    const complex = this.complexPattern;
    if (complex === undefined) return result;
    // Native complex transliteration starts with the complete source string.
    const second = transliterate(
      text,
      0,
      text.getLength(),
      complex.flags,
      this.aSrchPara.Locale,
      true,
    );
    const secondOffsets = second.offsets ?? [];
    const secondLo = lower === 0 ? 0 : this.FindPos(secondOffsets, lower);
    const secondHi =
      upper === text.getLength() ? second.text.getLength() : this.FindPos(secondOffsets, upper);
    this.pattern = complex.pattern;
    let candidate: SearchResult;
    try {
      candidate = this.SearchPrepared(second.text, secondLo, secondHi, forward);
    } finally {
      this.pattern = this.primaryPattern;
      second.text.dispose();
    }
    if (candidate.subRegExpressions === 0) return result;
    const starts = asNonConstRange(candidate.startOffset);
    const ends = asNonConstRange(candidate.endOffset);
    for (let index = 0; index < candidate.startOffset.getLength(); index++) {
      for (const offset of [starts.operatorIndex(index, 4), ends.operatorIndex(index, 4)]) {
        if (offset[0] !== 0) {
          const position: [number] = [secondOffsets[offset[0] - 1] as number];
          iterateCodePoints(original, position, 1);
          offset[0] = position[0];
        }
      }
    }
    if (result.subRegExpressions === 0) return candidate;
    const primaryStart = asNonConstRange(result.startOffset).operatorIndex(0, 4)[0];
    const primaryEnd = asNonConstRange(result.endOffset).operatorIndex(0, 4)[0];
    const nextStart = starts.operatorIndex(0, 4)[0];
    const nextEnd = ends.operatorIndex(0, 4)[0];
    const closer = forward ? nextStart < primaryStart : nextStart > primaryStart;
    const longer = forward ? nextEnd > primaryEnd : nextEnd < primaryEnd;
    return closer || (nextStart === primaryStart && longer) ? candidate : result;
  }
  /** Runs the prepared native algorithm for the current pattern. @param text - Prepared input. @param lo - Lower bound. @param hi - Upper bound. @param forward - Direction. @returns Native directional result. */
  private SearchPrepared(
    text: OUStringConstReference,
    lo: number,
    hi: number,
    forward: boolean,
  ): SearchResult {
    if (this.distance !== undefined) return this.ApproxSearch(text, lo, hi, forward, this.distance);
    return this.aSrchPara.AlgorithmType2 === Algorithms.WILDCARD
      ? forward
        ? this.WildcardSrchFrwrd(text, lo, hi)
        : this.WildcardSrchBkwrd(text, hi, lo)
      : forward
        ? this.NSrchFrwrd(text, lo, hi)
        : this.NSrchBkwrd(text, hi, lo);
  }
  /** Searches native word candidates with the original weighted distance and directional bounds. @param text - Prepared input. @param lo - Lower bound. @param hi - Upper bound. @param forward - Search direction. @param distance - Calculator prepared from the primary key. @returns Directional result. */
  private ApproxSearch(
    text: OUStringConstReference,
    lo: number,
    hi: number,
    forward: boolean,
    distance: WLevDistance,
  ): SearchResult {
    TextSearch.wordBreak ??= BreakIterator.create(
      getProcessComponentContext() as Reference<XComponentContext>,
    );
    const iterator = TextSearch.wordBreak.operatorStar();
    const locale = this.aSrchPara.Locale;
    const type = ANYWORD_IGNOREWHITESPACES;
    const length = text.getLength();
    const result = notFound();
    let boundary = iterator.getWordBoundary(text, forward ? lo : hi, locale, type, true);
    let end: number;
    do {
      if (forward ? boundary.startPos >= hi : boundary.endPos <= lo) break;
      const start = Math.max(boundary.startPos, lo);
      end = Math.min(boundary.endPos, hi);
      if (
        start < end &&
        distance.WLD(text.getStr().subarray(start), end - start) <= distance.GetLimit()
      ) {
        setWildcardMatch(result, forward ? start : end, forward ? end : start);
        break;
      }
      if (!forward && start === 0) break;
      boundary = forward
        ? iterator.nextWord(text, end - 1, locale, type)
        : iterator.previousWord(text, start, locale, type);
    } while (
      boundary.startPos !== boundary.endPos ||
      (boundary.endPos !== length && (!forward || boundary.endPos !== end))
    );
    return result;
  }
  /** Native FindPosInSeq_Impl first offset not less than the source position. @param offsets - Output-to-source map. @param position - Source offset. @returns Output offset. */
  private FindPos(offsets: readonly number[], position: number): number {
    const index = offsets.findIndex(
      /** Compares one native source offset. @param offset - Source unit. @returns Whether it reaches the boundary. */ (
        offset,
      ) => offset >= position,
    );
    return index < 0 ? offsets.length : index;
  }
  /** Native NSrchFrwrd retains bounded word checks and the exact Boyer-Moore skip order. @param text - Prepared text. @param start - Lower bound. @param end - Upper bound. @returns Forward result. */
  private NSrchFrwrd(text: OUStringConstReference, start: number, end: number): SearchResult {
    const key = this.pattern.units,
      input = text.getStr(),
      size = key.length;
    if (text.getLength() === 0 || size === 0 || size > text.getLength() || end < size)
      return notFound();
    this.MakeTable(true);
    for (
      let index = start;
      index <= end - size;
      index += this.GetDiff(input[index + size - 1] as number)
    ) {
      let compared = size - 1;
      while (compared >= 0 && key[compared] === input[index + compared]) compared--;
      if (compared >= 0) continue;
      if (
        (this.aSrchPara.searchFlag & NORM_WORD_ONLY) !== 0 &&
        !(
          (index === 0 || this.IsDelimiter(text, index - 1)) &&
          (index + size === end || this.IsDelimiter(text, index + size))
        )
      )
        continue;
      const result = new SearchResult();
      result.subRegExpressions = 1;
      result.startOffset.realloc(1);
      result.endOffset.realloc(1);
      ((result.startOffset.getArray() as SequenceElements).get(0) as [number])[0] = index;
      ((result.endOffset.getArray() as SequenceElements).get(0) as [number])[0] = index + size;
      return result;
    }
    return notFound();
  }
  /** Native NSrchBkwrd retains its reversed endpoint and bounded word checks. @param text - Prepared text. @param start - Upper bound. @param end - Lower bound. @returns Backward result. */
  private NSrchBkwrd(text: OUStringConstReference, start: number, end: number): SearchResult {
    const key = this.pattern.units,
      input = text.getStr(),
      size = key.length;
    if (text.getLength() === 0 || size === 0 || size > text.getLength()) return notFound();
    this.MakeTable(false);
    const limit = end === text.getLength() ? size : end + size;
    for (let index = start; index >= limit; index -= this.GetDiff(input[index - size] as number)) {
      let compared = 0;
      while (compared < size && key[compared] === input[index + compared - size]) compared++;
      if (compared < size) continue;
      if (
        (this.aSrchPara.searchFlag & NORM_WORD_ONLY) !== 0 &&
        !(
          (index - size === 0 || this.IsDelimiter(text, index - size - 1)) &&
          (index === start || this.IsDelimiter(text, index))
        )
      )
        continue;
      const result = new SearchResult();
      result.subRegExpressions = 1;
      result.startOffset.realloc(1);
      result.endOffset.realloc(1);
      ((result.startOffset.getArray() as SequenceElements).get(0) as [number])[0] = index;
      ((result.endOffset.getArray() as SequenceElements).get(0) as [number])[0] = index - size;
      return result;
    }
    return notFound();
  }

  /** Native WildcardSrchFrwrd code-point/backtracking loop with original directional offsets and escape state. @param searchStr - Prepared native text. @param nStartPos - Directional start. @param nEndPos - Directional end. @returns Original wildcard match. */
  private WildcardSrchFrwrd(
    searchStr: OUStringConstReference,
    nStartPos: number,
    nEndPos: number,
  ): SearchResult {
    const input = searchStr.getStr().subarray(0, searchStr.getLength());
    const aRes = notFound();
    let nStartOffset = nStartPos;
    const nEndOffset = nEndPos;

    const nStringLen = searchStr.getLength();

    // Forward nStartPos inclusive, nEndPos exclusive, but allow for empty
    // string match with [0,0).
    if (
      nStartPos < 0 ||
      nEndPos > nStringLen ||
      nEndPos < nStartPos ||
      (nStartPos == nStringLen && (nStringLen != 0 || nStartPos != nEndPos))
    )
      return aRes;

    const rPattern = this.pattern.units;
    const nPatternLen = rPattern.length;

    // Handle special cases empty pattern and/or string outside of the loop to
    // not add performance penalties there and simplify.
    if (nStartPos == nEndPos) {
      let i = 0;
      while (i < nPatternLen && rPattern[i] == 42) ++i;
      if (i == nPatternLen) setWildcardMatch(aRes, nStartOffset, nEndOffset);
      return aRes;
    }

    // Empty pattern does not match any non-empty string.
    if (!nPatternLen) return aRes;

    let bRewind = false;
    let cPattern = 0;
    const nPattern: [number] = [0];
    const nAfterFakePattern: [number] = [nPattern[0]];
    if (this.mbWildcardAllowSubstring) {
      // Fake a leading '*' wildcard.
      cPattern = 42;
      bRewind = true;
      // Assume a non-'*' pattern character follows. If it is a '*' instead
      // that will be handled in the loop by setting nPat.
      const cu = iterateCodePoints(rPattern, nAfterFakePattern, 1);
      if (
        cu == this.mcWildcardEscapeChar &&
        this.mcWildcardEscapeChar &&
        nAfterFakePattern[0] < nPatternLen
      )
        iterateCodePoints(rPattern, nAfterFakePattern, 1);
    }

    const nString: [number] = [nStartPos],
      nStr: [number] = [-1];
    let nPat = -1,
      nLastAsterisk = -1;
    let cPatternAfterAsterisk = 0;
    let bEscaped = false,
      bEscapedAfterAsterisk = false;

    // The loop code tries to avoid costly calls to iterateCodePoints() when
    // possible.

    do {
      if (bRewind) {
        // Reuse cPattern after '*', nPattern was correspondingly
        // incremented to point behind cPattern.
        bRewind = false;
      } else if (nPattern[0] < nPatternLen) {
        // nPattern will be incremented by iterateCodePoints().
        cPattern = iterateCodePoints(rPattern, nPattern, 1);
        if (
          cPattern == this.mcWildcardEscapeChar &&
          this.mcWildcardEscapeChar &&
          nPattern[0] < nPatternLen
        ) {
          bEscaped = true;
          cPattern = iterateCodePoints(rPattern, nPattern, 1);
        }
      } else {
        // A trailing '*' is handled below.
        if (this.mbWildcardAllowSubstring) {
          // If the pattern is consumed and substring match allowed we're good.
          setWildcardMatch(aRes, nStartOffset, nString[0]);
          return aRes;
        } else if (nString[0] < nEndPos && nLastAsterisk >= 0) {
          // If substring match is not allowed try a greedy '*' match.
          nPattern[0] = nLastAsterisk;
          continue; // do
        } else return aRes;
      }

      if (cPattern == 42 && !bEscaped) {
        // '*' is one code unit, so not using iterateCodePoints() is ok.
        while (nPattern[0] < nPatternLen && rPattern[nPattern[0]] == 42) ++nPattern[0];

        if (nPattern[0] >= nPatternLen) {
          // Last pattern is '*', remaining string matches.
          setWildcardMatch(aRes, nStartOffset, nEndOffset);
          return aRes;
        }

        nLastAsterisk = nPattern[0]; // Remember last encountered '*'.

        // cPattern will be the next non-'*' character, nPattern
        // incremented.
        cPattern = iterateCodePoints(rPattern, nPattern, 1);
        if (
          cPattern == this.mcWildcardEscapeChar &&
          this.mcWildcardEscapeChar &&
          nPattern[0] < nPatternLen
        ) {
          bEscaped = true;
          cPattern = iterateCodePoints(rPattern, nPattern, 1);
        }

        cPatternAfterAsterisk = cPattern;
        bEscapedAfterAsterisk = bEscaped;
        nPat = nPattern[0]; // Remember position of pattern behind '*', already incremented.
        nStr[0] = nString[0]; // Remember the current string to be matched.
      }

      /* istanbul ignore if -- native loop-entry invariant; task9BAAAC proof. */
      if (nString[0] >= nEndPos)
        // Whatever follows in pattern, string will not match.
        return aRes;

      // nString[0] will be incremented by iterateCodePoints().
      const cString = iterateCodePoints(input, nString, 1);

      if ((cPattern != 63 || bEscaped) && cPattern != cString) {
        if (nPat == -1)
          // Non-match already without any '*' pattern.
          return aRes;

        bRewind = true;
        nPattern[0] = nPat; // Rewind pattern to character behind '*', already incremented.
        cPattern = cPatternAfterAsterisk;
        bEscaped = bEscapedAfterAsterisk;
        iterateCodePoints(input, nStr, 1);
        nString[0] = nStr[0]; // Restore incremented remembered string position.
        if (nPat == nAfterFakePattern[0]) {
          // Next start offset will be the next character.
          nStartOffset = nString[0];
        }
      } else {
        // An unescaped '?' pattern matched any character, or characters
        // matched. Reset only escaped state.
        bEscaped = false;
      }
    } while (nString[0] < nEndPos);

    if (bRewind) return aRes;

    // Eat trailing '*' pattern that matches anything, including nothing.
    // '*' is one code unit, so not using iterateCodePoints() is ok.
    while (nPattern[0] < nPatternLen && rPattern[nPattern[0]] == 42) ++nPattern[0];

    if (nPattern[0] == nPatternLen) setWildcardMatch(aRes, nStartOffset, nEndOffset);
    return aRes;
  }
  /** Native WildcardSrchBkwrd code-point/backtracking loop with original directional offsets and escape state. @param searchStr - Prepared native text. @param nStartPos - Directional start. @param nEndPos - Directional end. @returns Original wildcard match. */
  private WildcardSrchBkwrd(
    searchStr: OUStringConstReference,
    nStartPos: number,
    nEndPos: number,
  ): SearchResult {
    const input = searchStr.getStr().subarray(0, searchStr.getLength());
    const aRes = notFound();

    let nStartOffset = nStartPos;
    const nEndOffset = nEndPos;

    const nStringLen = searchStr.getLength();

    // Backward nStartPos exclusive, nEndPos inclusive, but allow for empty
    // string match with (0,0].
    if (
      nStartPos > nStringLen ||
      nEndPos < 0 ||
      nStartPos < nEndPos ||
      (nEndPos == nStringLen && (nStringLen != 0 || nStartPos != nEndPos))
    )
      return aRes;

    const rPattern = this.pattern.units;
    let nPatternLen = rPattern.length;

    // Handle special cases empty pattern and/or string outside of the loop to
    // not add performance penalties there and simplify.
    if (nStartPos == nEndPos) {
      let i = 0;
      while (i < nPatternLen && rPattern[i] == 42) ++i;
      if (i == nPatternLen) setWildcardMatch(aRes, nStartOffset, nEndOffset);
      return aRes;
    }

    // Empty pattern does not match any non-empty string.
    if (!nPatternLen) return aRes;

    const rReversePattern = this.GetWildcardReversePattern();
    nPatternLen = rReversePattern.length;

    let bRewind = false;
    let cPattern = 0;
    const nPattern: [number] = [nPatternLen];
    const nAfterFakePattern: [number] = [nPattern[0]];
    if (this.mbWildcardAllowSubstring) {
      // Fake a trailing '*' wildcard.
      cPattern = 42;
      bRewind = true;
      // Assume a non-'*' pattern character follows. If it is a '*' instead
      // that will be handled in the loop by setting nPat.
      const cu = iterateCodePoints(rReversePattern, nAfterFakePattern, -1);
      if (cu == this.mcWildcardEscapeChar && this.mcWildcardEscapeChar && nAfterFakePattern[0] > 0)
        iterateCodePoints(rReversePattern, nAfterFakePattern, -1);
    }

    const nString: [number] = [nStartPos],
      nStr: [number] = [-1];
    let nPat = -1,
      nLastAsterisk = -1;
    let cPatternAfterAsterisk = 0;
    let bEscaped = false,
      bEscapedAfterAsterisk = false;

    // The loop code tries to avoid costly calls to iterateCodePoints() when
    // possible.

    do {
      if (bRewind) {
        // Reuse cPattern after '*', nPattern was correspondingly
        // decremented to point before cPattern.
        bRewind = false;
      } else if (nPattern[0] > 0) {
        // nPattern will be decremented by iterateCodePoints().
        cPattern = iterateCodePoints(rReversePattern, nPattern, -1);
        if (cPattern == this.mcWildcardEscapeChar && this.mcWildcardEscapeChar && nPattern[0] > 0) {
          bEscaped = true;
          cPattern = iterateCodePoints(rReversePattern, nPattern, -1);
        }
      } else {
        // A trailing '*' is handled below.
        if (this.mbWildcardAllowSubstring) {
          // If the pattern is consumed and substring match allowed we're good.
          setWildcardMatch(aRes, nStartOffset, nString[0]);
          return aRes;
        } else if (nString[0] > nEndPos && nLastAsterisk >= 0) {
          // If substring match is not allowed try a greedy '*' match.
          nPattern[0] = nLastAsterisk;
          continue; // do
        } else return aRes;
      }

      if (cPattern == 42 && !bEscaped) {
        // '*' is one code unit, so not using iterateCodePoints() is ok.
        while (nPattern[0] > 0 && rReversePattern[nPattern[0] - 1] == 42) --nPattern[0];

        if (nPattern[0] <= 0) {
          // First pattern is '*', remaining string matches.
          setWildcardMatch(aRes, nStartOffset, nEndOffset);
          return aRes;
        }

        nLastAsterisk = nPattern[0]; // Remember last encountered '*'.

        // cPattern will be the previous non-'*' character, nPattern
        // decremented.
        cPattern = iterateCodePoints(rReversePattern, nPattern, -1);
        if (cPattern == this.mcWildcardEscapeChar && this.mcWildcardEscapeChar && nPattern[0] > 0) {
          bEscaped = true;
          cPattern = iterateCodePoints(rReversePattern, nPattern, -1);
        }

        cPatternAfterAsterisk = cPattern;
        bEscapedAfterAsterisk = bEscaped;
        nPat = nPattern[0]; // Remember position of pattern before '*', already decremented.
        nStr[0] = nString[0]; // Remember the current string to be matched.
      }

      /* istanbul ignore if -- native loop-entry invariant; task9BAAAC proof. */
      if (nString[0] <= nEndPos)
        // Whatever leads in pattern, string will not match.
        return aRes;

      // nString[0] will be decremented by iterateCodePoints().
      const cString = iterateCodePoints(input, nString, -1);

      if ((cPattern != 63 || bEscaped) && cPattern != cString) {
        if (nPat == -1)
          // Non-match already without any '*' pattern.
          return aRes;

        bRewind = true;
        nPattern[0] = nPat; // Rewind pattern to character before '*', already decremented.
        cPattern = cPatternAfterAsterisk;
        bEscaped = bEscapedAfterAsterisk;
        iterateCodePoints(input, nStr, -1);
        nString[0] = nStr[0]; // Restore decremented remembered string position.
        if (nPat == nAfterFakePattern[0]) {
          // Next start offset will be this character (exclusive).
          nStartOffset = nString[0];
        }
      } else {
        // An unescaped '?' pattern matched any character, or characters
        // matched. Reset only escaped state.
        bEscaped = false;
      }
    } while (nString[0] > nEndPos);

    if (bRewind) return aRes;

    // Eat leading '*' pattern that matches anything, including nothing.
    // '*' is one code unit, so not using iterateCodePoints() is ok.
    while (nPattern[0] > 0 && rReversePattern[nPattern[0] - 1] == 42) --nPattern[0];

    if (nPattern[0] == 0) setWildcardMatch(aRes, nStartOffset, nEndOffset);
    return aRes;
  }
  /** Native backward pattern preparation moves each escape after its code point; a trailing escape is eliminated. The cache is reset only by setOptions2. @returns Reordered original UTF-16 units. */
  private GetWildcardReversePattern(): Uint16Array {
    if (!this.pattern.reverse?.length) {
      const rPattern = this.pattern.units,
        buffer = Array.from(rPattern),
        nIndex: [number] = [0];
      while (nIndex[0] < rPattern.length) {
        const nOld = nIndex[0],
          cu = iterateCodePoints(rPattern, nIndex);
        if (cu === this.mcWildcardEscapeChar) {
          if (nIndex[0] < rPattern.length) {
            const escape = rPattern.slice(nOld, nIndex[0]),
              nOld2 = nIndex[0];
            iterateCodePoints(rPattern, nIndex);
            for (let i = 0; i < nIndex[0] - nOld2; ++i)
              buffer[nOld + i] = rPattern[nOld2 + i] as number;
            for (let i = 0; i < escape.length; ++i)
              buffer[nIndex[0] - escape.length + i] = escape[i] as number;
          } else buffer.splice(nOld, nIndex[0] - nOld);
        }
      }
      this.pattern.reverse = Uint16Array.from(buffer);
    }
    return this.pattern.reverse;
  }
}

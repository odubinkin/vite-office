/** @fileoverview Native absolute TextSearch backend: directional Boyer-Moore, full folding, punctuation and source offsets. ICU regex, approximate and wildcard algorithms remain separate unported responsibilities. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import * as Algorithms from "../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { NORM_WORD_ONLY } from "../../../offapi/com/sun/star/util/SearchFlags";
import type { SearchResult } from "../../../offapi/com/sun/star/util/SearchResult";
import { ALPHA, DIGIT, LETTER } from "../../../offapi/com/sun/star/i18n/KCharacterType";
import { iterateCodePoints } from "../../../o3tl/inc/string_view";
import { getCharacterType } from "../characterclassification/cclass_unicode";
import { transliterateCaseFolding } from "../transliteration/transliteration_body";

/** Native result default: no expressions and empty offset sequences. @returns Unsuccessful search result. */
function notFound(): SearchResult {
  return { subRegExpressions: 0, startOffset: [], endOffset: [] };
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
/** Native primary absolute-search owner; realm-local Map storage replaces the native jump-table allocation. */
export class TextSearch {
  private aSrchPara = new SearchOptions2();
  private sSrchStr = new Uint16Array();
  private bSearchApostrophe = false;
  private pJumpTable: Map<number, number> | undefined;
  private bIsForwardTab = true;

  /** Initializes source options before the first search. @param options - Native option value. @returns Search owner. */
  public constructor(options = new SearchOptions2()) {
    this.setOptions2(options);
  }
  /** Copies options and resets native prepared key/jump state. @param options - New native options. @returns Nothing. */
  public setOptions2(options: SearchOptions2): void {
    if (
      [Algorithms.REGEXP, Algorithms.APPROXIMATE, Algorithms.WILDCARD].includes(
        options.AlgorithmType2,
      )
    )
      throw new Error("This TextSearch algorithm is not implemented.");
    if ((options.transliterateFlags & ~TransliterationFlags.IGNORE_CASE) !== 0)
      throw new Error("This TextSearch transliteration is not implemented.");
    const para = new SearchOptions2(options);
    const original = para.searchString.getStr().subarray(0, para.searchString.getLength());
    this.bSearchApostrophe = original.includes(39) || original.includes(34);
    let key =
      para.transliterateFlags & TransliterationFlags.IGNORE_CASE
        ? transliterateCaseFolding(para.searchString, 0, original.length, para.Locale).text
        : para.searchString;
    if (this.bSearchApostrophe && isReplacePunctuation(original))
      key = new OUString(
        replacePunctuation(key.getStr().subarray(0, key.getLength())),
        key.getLength(),
      );
    this.sSrchStr = key.getStr().slice(0, key.getLength());
    this.aSrchPara = para;
    this.pJumpTable = undefined;
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
    if (this.pJumpTable !== undefined && this.bIsForwardTab === forward) return;
    this.bIsForwardTab = forward;
    this.pJumpTable = new Map();
    const key = this.sSrchStr;
    if (forward) {
      for (let i = 0; i < key.length - 1; i++)
        this.pJumpTable.set(key[i] as number, key.length - i - 1);
    } else {
      for (let i = key.length - 1; i > 0; i--) this.pJumpTable.set(key[i] as number, i);
    }
  }
  /** Native jump lookup defaults to the whole key length. @param unit - Inspected input unit. @returns Positive distance. */
  private GetDiff(unit: number): number {
    return this.pJumpTable?.get(unit) ?? this.sSrchStr.length;
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
    const folded = (this.aSrchPara.transliterateFlags & TransliterationFlags.IGNORE_CASE) !== 0;
    const mapped = folded
      ? transliterateCaseFolding(text, lower, upper - lower, this.aSrchPara.Locale)
      : undefined;
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
    const result = forward ? this.NSrchFrwrd(prepared, lo, hi) : this.NSrchBkwrd(prepared, hi, lo);
    if (result.subRegExpressions === 0 || offsets === undefined || offsets.length === 0)
      return result;
    const low = (forward ? result.startOffset[0] : result.endOffset[0]) as number;
    const high = (forward ? result.endOffset[0] : result.startOffset[0]) as number;
    const mappedLow = offsets[low] as number;
    const position: [number] = [offsets[Math.min(high, offsets.length) - 1] as number];
    iterateCodePoints(original, position, 1);
    return {
      subRegExpressions: 1,
      startOffset: [forward ? mappedLow : position[0]],
      endOffset: [forward ? position[0] : mappedLow],
    };
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
    const key = this.sSrchStr,
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
      return { subRegExpressions: 1, startOffset: [index], endOffset: [index + size] };
    }
    return notFound();
  }
  /** Native NSrchBkwrd retains its reversed endpoint and bounded word checks. @param text - Prepared text. @param start - Upper bound. @param end - Lower bound. @returns Backward result. */
  private NSrchBkwrd(text: OUStringConstReference, start: number, end: number): SearchResult {
    const key = this.sSrchStr,
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
      return { subRegExpressions: 1, startOffset: [index], endOffset: [index - size] };
    }
    return notFound();
  }
}

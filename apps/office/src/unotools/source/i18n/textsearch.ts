/** @fileoverview Original shared SearchParam values and search-mode conversions from textsearch.hxx/textsearch.cxx; search engine responsibilities remain with TextSearch. */
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
import { TextSearch as TextSearchService } from "../../../i18npool/source/search/textsearch";
import type { SearchResult } from "../../../offapi/com/sun/star/util/SearchResult";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
/** Original public shared similarity threshold, independent of i18npool approximate search. */
export const WLD_THRESHOLD = 3;
/** Original UTF16 single-string fallback threshold. */
export const SMALL_STRING_THRESHOLD = 4;
/** Erases std::u16string_view::find with exact code-unit comparison. @param text - Borrowed haystack. @param key - Borrowed key. @returns First offset, or minus one for npos. */
function findView(text: Uint16Array, key: Uint16Array): number {
  for (let i = 0; i <= text.length - key.length; ++i) {
    let j = 0;
    while (j < key.length && text[i + j] === key[j]) ++j;
    if (j === key.length) return i;
  }
  return -1;
}
/** Erases starts_with/ends_with at a known offset. @param text - Borrowed haystack. @param key - Borrowed key. @param offset - Prefix/suffix position. @returns Exact unit equality. */
function matchesView(text: Uint16Array, key: Uint16Array, offset: number): boolean {
  if (offset < 0 || offset + key.length > text.length) return false;
  for (let i = 0; i < key.length; ++i) if (text[offset + i] !== key[i]) return false;
  return true;
}
/** std::u16string_view::substr truncates counts and converts a negative native signed count to size_t, thus selecting the remainder. @param text - Borrowed source. @param start - Original signed start. @param count - Original signed count. @returns Borrowed native substring. */
function substrView(text: Uint16Array, start: number, count: number): Uint16Array {
  if (start < 0 || start > text.length) throw new RangeError("std::u16string_view::substr");
  return text.subarray(start, count < 0 ? text.length : start + count);
}
/** Original caller boolean reference grouped at the JS boundary. */
export interface SearchParamBooleanReference {
  value: boolean;
}
/** Original wildcard/regexp output references grouped at the JS boundary. */
export interface SearchParamFlags {
  wildcard: boolean;
  regexp: boolean;
}
/** Original fixed signed32 scoped search mode, including initialized unnamed values. */
export type SearchType = number;
/** Original parameter value owner, copying string values while getters borrow the stable member. */
export class SearchParam {
  static readonly SearchType = { Normal: 0, Regexp: 1, Wildcard: 2, Unknown: -1 } as const;
  private readonly sSrchStr = new OUString();
  private m_eSrchType: SearchType = SearchParam.SearchType.Normal;
  private m_cWildEscChar = 92;
  private m_bCaseSense = true;
  private m_bWildMatchSel = false;
  /** Original parameter construction defaults. @param text - Copied text. @param type - Search mode. @param caseSensitive - Case flag. @param escape - UInt32 escape character. @param matchSelection - Match-whole-selection flag. @returns Value owner. */
  constructor(
    text: OUStringConstReference,
    type: SearchType,
    caseSensitive?: boolean,
    escape?: number,
    matchSelection?: boolean,
  );
  /** Original copy construction. @param source - Copied parameters. @returns Value owner. */
  constructor(source: SearchParam);
  /** Original initialized member assignment; ordinary references and existing string value operations replace native member lifetime. @param source - Text or copied parameters. @param type - Mode for text constructor. @param caseSensitive - Case flag. @param escape - UInt32 escape. @param matchSelection - Match flag. @returns Owner. */
  constructor(
    source: OUStringConstReference | SearchParam,
    type?: SearchType,
    caseSensitive = true,
    escape = 92,
    matchSelection = false,
  ) {
    if (source instanceof SearchParam) this.copy_assign(source);
    else {
      this.sSrchStr.assign(source);
      this.m_eSrchType = (type as SearchType) | 0;
      this.m_cWildEscChar = escape >>> 0;
      this.m_bCaseSense = caseSensitive;
      this.m_bWildMatchSel = matchSelection;
    }
  }
  /** Original implicit memberwise assignment preserves the member string object's identity. @param source - Copied parameters. @returns This owner. */
  copy_assign(source: SearchParam): this {
    this.sSrchStr.assign(source.sSrchStr);
    this.m_eSrchType = source.m_eSrchType;
    this.m_cWildEscChar = source.m_cWildEscChar;
    this.m_bCaseSense = source.m_bCaseSense;
    this.m_bWildMatchSel = source.m_bWildMatchSel;
    return this;
  }
  /** Original const member reference, retaining borrowed identity across assignment. @returns Borrowed string. */
  GetSrchStr(): OUStringConstReference {
    return this.sSrchStr;
  }
  /** Original search mode query. @returns Signed mode. */
  GetSrchType(): SearchType {
    return this.m_eSrchType;
  }
  /** Original case flag query. @returns Flag. */
  IsCaseSensitive(): boolean {
    return this.m_bCaseSense;
  }
  /** Original wildcard selection flag query. @returns Flag. */
  IsWildMatchSel(): boolean {
    return this.m_bWildMatchSel;
  }
  /** Original signed API result for the stored UInt32 escape character. @returns Signed escape. */
  GetWildEscChar(): number {
    return this.m_cWildEscChar | 0;
  }
  /** Original wildcard precedence and conditional regex output adaptation. @param wildcard - Wildcard flag. @param regexp - Caller regex reference. @returns Search mode. */
  static ConvertToSearchType(wildcard: boolean, regexp: SearchParamBooleanReference): SearchType {
    if (wildcard) {
      if (regexp.value) regexp.value = false;
      return SearchParam.SearchType.Wildcard;
    }
    return regexp.value ? SearchParam.SearchType.Regexp : SearchParam.SearchType.Normal;
  }
  /** Original mode conversion writes both caller flags, defaulting unknown modes to normal. @param type - Signed search mode. @param flags - Caller output references. @returns Nothing. */
  static ConvertToBool(type: SearchType, flags: SearchParamFlags): void {
    switch (type | 0) {
      case SearchParam.SearchType.Wildcard:
        flags.wildcard = true;
        flags.regexp = false;
        break;
      case SearchParam.SearchType.Regexp:
        flags.wildcard = false;
        flags.regexp = true;
        break;
      default:
        flags.wildcard = false;
        flags.regexp = false;
        break;
    }
  }
}

/** The native shared one-entry cache; wrappers retain their chosen backend after cache replacement. */
let cached: { options: SearchOptions2; backend: TextSearchService } | undefined;
/** Native cache equality includes replacement, approximate and wildcard fields even in absolute mode. @param left - Cached value. @param right - Requested value. @returns Complete option equality. */
function equalSearchOptions(left: SearchOptions2, right: SearchOptions2): boolean {
  return (
    left.AlgorithmType2 === right.AlgorithmType2 &&
    left.WildcardEscapeCharacter === right.WildcardEscapeCharacter &&
    left.searchFlag === right.searchFlag &&
    left.searchString.equals(right.searchString) &&
    left.replaceString.equals(right.replaceString) &&
    left.changedChars === right.changedChars &&
    left.deletedChars === right.deletedChars &&
    left.insertedChars === right.insertedChars &&
    left.transliterateFlags === right.transliterateFlags &&
    left.Locale.Language.equals(right.Locale.Language) &&
    left.Locale.Country.equals(right.Locale.Country) &&
    left.Locale.Variant.equals(right.Locale.Variant)
  );
}
/** Original utl::TextSearch option constructor and direction-normalizing wrapper over XTextSearch2. */
export class TextSearch {
  private xTextSearch: TextSearchService;
  /** Original replacement mini-language, without executing a regular expression. Ampersand intentionally retains raw forward offsets; dollar captures normalize direction. @param replacement - In/out owned value. @param text - Original borrowed UTF16 view. @param result - Native result with valid capture sequences. @returns Nothing. */
  public static ReplaceBackReferences(
    replacement: OUString,
    text: Uint16Array,
    result: SearchResult,
  ): void {
    if (result.subRegExpressions <= 0) return;
    const buffer = new OUStringBuffer(replacement.getLength() * 4);
    const units = replacement.getStr();
    try {
      for (let i = 0; i < replacement.getLength(); ++i) {
        const current = units[i] as number;
        if (current === 38) {
          const start = result.startOffset.operatorIndex(0)[0] as number;
          buffer.append(
            substrView(text, start, (result.endOffset.operatorIndex(0)[0] as number) - start),
          );
        } else if (i < replacement.getLength() - 1 && current === 36) {
          const next = units[i + 1] as number;
          if (next >= 48 && next <= 57) {
            const j = next - 48;
            if (j < result.subRegExpressions) {
              let start = result.startOffset.operatorIndex(j)[0] as number;
              let count = result.endOffset.operatorIndex(j)[0] as number;
              if (start < 0 || count < 0) start = count = 0;
              else if (count >= start) count -= start;
              else {
                count = start - count;
                start = result.endOffset.operatorIndex(j)[0] as number;
              }
              buffer.append(substrView(text, start, count));
            }
          } else buffer.append(units.subarray(i, i + 2));
          ++i;
        } else if (i < replacement.getLength() - 1 && current === 92) {
          const next = units[i + 1] as number;
          if (next === 92 || next === 38 || next === 36)
            buffer.insertChar(buffer.getLength(), next);
          else if (next === 116) buffer.insertChar(buffer.getLength(), 9);
          else buffer.append(units.subarray(i, i + 2));
          ++i;
        } else buffer.insertChar(buffer.getLength(), current);
      }
      const value = buffer.makeStringAndClear();
      replacement.assign(value);
      value.dispose();
    } finally {
      buffer.dispose();
    }
  }
  /** Original prefix/suffix substring ranking with a caller-owned accumulating score. @param text - Compared UTF16. @param key - Search UTF16. @param initialScore - In/out native signed32 score. @param fromStart - Select prefixes or suffixes of the key. @returns Rank, or minus one. */
  public static GetSubstringSimilarity(
    text: Uint16Array,
    key: Uint16Array,
    initialScore: [number],
    fromStart: boolean,
  ): number {
    let score = -1;
    for (let length = key.length; length > 1; --length) {
      const start = fromStart ? 0 : key.length - length;
      const part = key.subarray(start, start + length);
      if (matchesView(text, part, 0)) {
        score = initialScore[0];
        break;
      } else if (matchesView(text, part, text.length - part.length)) {
        score = initialScore[0] + 1;
        break;
      } else if (findView(text, part) !== -1) {
        score = initialScore[0] + 2;
        break;
      }
      initialScore[0] = (initialScore[0] + 3) | 0;
    }
    return score;
  }
  /** Original weighted UTF16 distance matrix: insertion/deletion cost one and unequal substitution cost two. @param text - Compared native string. @param key - Native search string. @returns Weighted distance. */
  public static GetWeightedLevenshteinDistance(
    text: OUStringConstReference,
    key: OUStringConstReference,
  ): number {
    const n = text.getLength(),
      m = key.getLength();
    const matrix: number[][] = Array.from(
      { length: n + 1 },
      /** Allocates one original matrix row. @returns Zero row. */ () =>
        Array<number>(m + 1).fill(0),
    );
    for (let i = 0; i <= n; ++i) (matrix[i] as number[])[0] = i;
    for (let j = 0; j <= m; ++j) (matrix[0] as number[])[j] = j;
    for (let i = 1; i <= n; ++i) {
      const row = matrix[i] as number[],
        previous = matrix[i - 1] as number[];
      for (let j = 1; j <= m; ++j) {
        row[j] = Math.min(
          (previous[j] as number) + 1,
          (row[j - 1] as number) + 1,
          (previous[j - 1] as number) + (text.getStr()[i - 1] !== key.getStr()[j - 1] ? 2 : 0),
        );
      }
    }
    return (matrix[n] as number[])[m] as number;
  }
  /** Original composite ranking, distinct from the approximate search backend. Failed acceptance preserves the caller pair. @param text - Compared value. @param key - Search value. @param similarityScore - In/out pair of substring rank and weighted distance. @returns Whether accepted. */
  public static SimilaritySearch(
    text: OUStringConstReference,
    key: OUStringConstReference,
    similarityScore: [number, number],
  ): boolean {
    const score: [number] = [0];
    const textView = text.getStr().subarray(0, text.getLength()),
      keyView = key.getStr().subarray(0, key.getLength());
    let first = TextSearch.GetSubstringSimilarity(textView, keyView, score, true);
    if (first === -1) first = TextSearch.GetSubstringSimilarity(textView, keyView, score, false);
    if (first === -1) {
      if (key.getLength() === 1) {
        if (matchesView(textView, keyView, 0)) first = score[0];
        else if (matchesView(textView, keyView, textView.length - keyView.length))
          first = score[0] + 1;
        score[0] += 2;
      } else if (text.getLength() === 1 && key.getLength() < SMALL_STRING_THRESHOLD) {
        if (matchesView(keyView, textView, 0)) first = score[0];
        else if (matchesView(keyView, textView, keyView.length - textView.length))
          first = score[0] + 1;
        score[0] += 2;
      }
    }
    const second = TextSearch.GetWeightedLevenshteinDistance(text, key);
    if (first === -1 && second >= WLD_THRESHOLD) return false;
    similarityScore[0] = first === -1 ? score[0] : first;
    similarityScore[1] = second;
    return true;
  }
  /** Borrows the native options-based cache entry; SearchParam/LanguageTag constructors are not yet implemented. @param options - Complete native search options. @returns Wrapper value. */
  public constructor(options: SearchOptions2) {
    this.xTextSearch = TextSearch.getXTextSearch(options);
  }
  /** Native cache replaces its backend rather than mutating the previously borrowed instance. @param options - New option value. @returns Prepared backend. */
  private static getXTextSearch(options: SearchOptions2): TextSearchService {
    if (cached !== undefined && equalSearchOptions(cached.options, options)) return cached.backend;
    const backend = new TextSearchService(options);
    cached = { options: new SearchOptions2(options), backend };
    return backend;
  }
  /** Native locale override copies all options before choosing another cache entry. @param options - Original option value. @param locale - Replacement locale. @returns Nothing. */
  public SetLocale(options: SearchOptions2, locale: LocaleConstReference): void {
    const copy = new SearchOptions2(options);
    copy.Locale.assign(locale);
    this.xTextSearch = TextSearch.getXTextSearch(copy);
  }
  /** Normalizes a successful forward result and leaves caller outputs untouched on failure. @param text - Original UTF-16 input. @param start - Inclusive lower bound, then match start. @param end - Exclusive upper bound, then match end. @param result - Optional raw XTextSearch result. @returns Whether found. */
  public SearchForward(
    text: OUStringConstReference,
    start: [number],
    end: [number],
    result?: { value: SearchResult },
  ): boolean {
    let found: SearchResult | undefined;
    try {
      found = this.xTextSearch.searchForward(text, start[0], end[0]);
      if (found.subRegExpressions <= 0) return false;
      start[0] = found.startOffset.operatorIndex(0)[0] as number;
      end[0] = found.endOffset.operatorIndex(0)[0] as number;
      if (result !== undefined) result.value.assign(found);
      return true;
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return false;
    } finally {
      found?.dispose();
    }
  }
  /** Reverses raw backward outputs into the wrapper's increasing start/end convention. @param text - Original input. @param start - High bound on entry, low match bound on success. @param end - Low bound on entry, high match bound on success. @param result - Optional unnormalized raw result. @returns Whether found. */
  public SearchBackward(
    text: OUStringConstReference,
    start: [number],
    end: [number],
    result?: { value: SearchResult },
  ): boolean {
    let found: SearchResult | undefined;
    try {
      found = this.xTextSearch.searchBackward(text, start[0], end[0]);
      if (found.subRegExpressions === 0) return false;
      end[0] = found.startOffset.operatorIndex(0)[0] as number;
      start[0] = found.endOffset.operatorIndex(0)[0] as number;
      if (result !== undefined) result.value.assign(found);
      return true;
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return false;
    } finally {
      found?.dispose();
    }
  }
  /** Searches the full original value in the forward direction. @param text - Input string. @returns Whether found. */
  public searchForward(text: OUStringConstReference): boolean {
    return this.SearchForward(text, [0], [text.getLength()]);
  }
}

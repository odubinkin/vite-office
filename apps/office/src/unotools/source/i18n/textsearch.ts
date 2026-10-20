/** @fileoverview Original shared SearchParam values and search-mode conversions from textsearch.hxx/textsearch.cxx; search engine responsibilities remain with TextSearch. */
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
import { TextSearch as TextSearchService } from "../../../i18npool/source/search/textsearch";
import type { SearchResult } from "../../../offapi/com/sun/star/util/SearchResult";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
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
    const found = this.xTextSearch.searchForward(text, start[0], end[0]);
    if (found.subRegExpressions <= 0) return false;
    start[0] = found.startOffset[0] as number;
    end[0] = found.endOffset[0] as number;
    if (result !== undefined) result.value = found;
    return true;
  }
  /** Reverses raw backward outputs into the wrapper's increasing start/end convention. @param text - Original input. @param start - High bound on entry, low match bound on success. @param end - Low bound on entry, high match bound on success. @param result - Optional unnormalized raw result. @returns Whether found. */
  public SearchBackward(
    text: OUStringConstReference,
    start: [number],
    end: [number],
    result?: { value: SearchResult },
  ): boolean {
    const found = this.xTextSearch.searchBackward(text, start[0], end[0]);
    if (found.subRegExpressions <= 0) return false;
    end[0] = found.startOffset[0] as number;
    start[0] = found.endOffset[0] as number;
    if (result !== undefined) result.value = found;
    return true;
  }
  /** Searches the full original value in the forward direction. @param text - Input string. @returns Whether found. */
  public searchForward(text: OUStringConstReference): boolean {
    return this.SearchForward(text, [0], [text.getLength()]);
  }
}

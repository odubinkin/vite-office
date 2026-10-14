/** @fileoverview Original shared SearchParam values and search-mode conversions from textsearch.hxx/textsearch.cxx; search engine responsibilities remain with TextSearch. */
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

/** @fileoverview Native lookup query item, search type, and shared case-insensitive collation. */
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { TransliterationModules } from "../../../../offapi/com/sun/star/i18n/TransliterationModules";
import { WILDCARD } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { WILD_MATCH_SELECTION } from "../../../../offapi/com/sun/star/util/SearchFlags";
import { SearchParam, TextSearch } from "../../../../unotools/source/i18n/textsearch";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { ScDocOptionsConstReference } from "./docoptio";

/** Original value/string query alternatives, retaining shared-string case mapping. */
export type ScQueryItem = number | { text: string; ignoreCase: string };

let collator: Intl.Collator | undefined;
/** Binds native system locale and IGNORE_CASE to the browser collator. @returns Collator. */
export function GetCollator(): Intl.Collator {
  if (!collator) {
    const locale = new LanguageTag(LANGUAGE_SYSTEM);
    try {
      collator = new Intl.Collator(text(locale.getBcp47()), { sensitivity: "accent" });
    } finally {
      locale.dispose();
    }
  }
  return collator;
}

/** Original lookup search mode permits patterns only when enabled and present. @param item - Query criterion. @param options - Current document defaults. @returns Search type. */
export function DetectSearchType(item: ScQueryItem, options: ScDocOptionsConstReference): number {
  if (typeof item === "number") return SearchParam.SearchType.Normal;
  const mode = options.GetFormulaSearchType();
  if (mode === SearchParam.SearchType.Wildcard && /[*?~]/u.test(item.text)) return mode;
  if (
    mode === SearchParam.SearchType.Regexp &&
    (item.text === "." ||
      (item.text.length > 1 &&
        [...item.text].some(
          /** Matches LibreOffice's set of regex metacharacters. @param value - Character. @returns Whether special. */
          (value) => "?*+.[]^$\\<>()|".includes(value),
        )))
  )
    return mode;
  return SearchParam.SearchType.Normal;
}

/** Original lookup query spelling and lazily prepared wildcard search. @param item - Lookup key. @param options - Document settings. */
export class ScQueryEntry {
  readonly searchType: number;
  private readonly wholeCell: boolean;
  private search: TextSearch | undefined;

  /** Initializes the query over the document's current comparison defaults. @param item - Lookup key. @param options - Document settings. @returns Entry. */
  constructor(
    readonly item: ScQueryItem,
    options: ScDocOptionsConstReference,
  ) {
    this.searchType = DetectSearchType(item, options);
    this.wholeCell = options.IsMatchWholeCell();
  }

  /** Performs the native exact text comparison, including wildcard and partial cell options. @param value - Candidate string. @param folded - Shared-string case mapping. @returns Whether matched. */
  matchesText(value: OUStringConstReference, folded: string): boolean {
    const item = this.item as Exclude<ScQueryItem, number>;
    if (this.searchType !== SearchParam.SearchType.Wildcard)
      return this.wholeCell ? folded === item.ignoreCase : folded.includes(item.ignoreCase);
    if (!this.search) {
      const options = new SearchOptions2();
      const searchValue = unicode(item.text);
      const locale = new LanguageTag(LANGUAGE_SYSTEM);
      try {
        options.searchString = searchValue;
        options.Locale = locale.getLocale();
        options.AlgorithmType2 = WILDCARD;
        options.WildcardEscapeCharacter = 126;
        options.transliterateFlags = TransliterationModules.IGNORE_CASE;
        options.searchFlag = this.wholeCell ? WILD_MATCH_SELECTION : 0;
        this.search = new TextSearch(options);
      } finally {
        options.searchString.clear();
        options.Locale.dispose();
        searchValue.dispose();
        locale.dispose();
      }
    }
    return this.search.SearchForward(value, [0], [value.getLength()]);
  }
}

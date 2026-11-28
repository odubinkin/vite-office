/** @fileoverview Native lookup query item, search type, and shared case-insensitive collation. */
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { TransliterationModules } from "../../../../offapi/com/sun/star/i18n/TransliterationModules";
import { REGEXP, WILDCARD } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import {
  ALL_IGNORE_CASE,
  WILD_MATCH_SELECTION,
} from "../../../../offapi/com/sun/star/util/SearchFlags";
import {
  SearchParam,
  TextSearch,
  type RegexMatcherFactory,
} from "../../../../unotools/source/i18n/textsearch";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { ScDocOptionsConstReference } from "./docoptio";

/** Original value/string query alternatives, retaining shared-string case mapping. */
export type ScQueryItem = number | { text: string; ignoreCase: string };

const collators = new Map<boolean, Intl.Collator>();
/** Binds native system locale and case sensitivity to the browser collator. @param ignoreCase - Native comparison option. @returns Collator. */
export function GetCollator(ignoreCase = true): Intl.Collator {
  let collator = collators.get(ignoreCase);
  if (!collator) {
    const locale = new LanguageTag(LANGUAGE_SYSTEM);
    try {
      collator = new Intl.Collator(text(locale.getBcp47()), {
        sensitivity: ignoreCase ? "accent" : "variant",
      });
      collators.set(ignoreCase, collator);
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

/** Original lookup query spelling and lazily prepared text search. */
export class ScQueryEntry {
  readonly searchType: number;
  private readonly wholeCell: boolean;
  private search: TextSearch | undefined;

  /** Initializes the query over the document's current comparison defaults. @param item - Lookup key. @param options - Document settings. @param regexMatcherFactory - Runtime regex service. @returns Entry. */
  constructor(
    readonly item: ScQueryItem,
    options: ScDocOptionsConstReference,
    private readonly regexMatcherFactory?: RegexMatcherFactory,
  ) {
    this.searchType = DetectSearchType(item, options);
    this.wholeCell = options.IsMatchWholeCell();
  }

  /** Reports whether the pattern service needed by this criterion is available. @returns Whether comparison can run. */
  CanSearch(): boolean {
    return (
      this.searchType !== SearchParam.SearchType.Regexp || this.regexMatcherFactory !== undefined
    );
  }

  /** Performs the native exact text comparison, including pattern and whole-cell options. @param value - Candidate string. @param folded - Shared-string case mapping. @returns Whether matched. */
  matchesText(value: OUStringConstReference, folded: string): boolean {
    const item = this.item as Exclude<ScQueryItem, number>;
    if (this.searchType === SearchParam.SearchType.Normal)
      return this.wholeCell ? folded === item.ignoreCase : folded.includes(item.ignoreCase);
    if (!this.CanSearch()) return false;
    if (!this.search) {
      const options = new SearchOptions2();
      const searchValue = unicode(item.text);
      const locale = new LanguageTag(LANGUAGE_SYSTEM);
      try {
        options.searchString = searchValue;
        options.Locale = locale.getLocale();
        const wildcard = this.searchType === SearchParam.SearchType.Wildcard;
        options.AlgorithmType2 = wildcard ? WILDCARD : REGEXP;
        if (wildcard) options.WildcardEscapeCharacter = 126;
        options.transliterateFlags = TransliterationModules.IGNORE_CASE;
        options.searchFlag =
          ALL_IGNORE_CASE | (wildcard && this.wholeCell ? WILD_MATCH_SELECTION : 0);
        this.search = new TextSearch(options, this.regexMatcherFactory);
      } finally {
        options.searchString.clear();
        options.Locale.dispose();
        searchValue.dispose();
        locale.dispose();
      }
    }
    const start: [number] = [0];
    const end: [number] = [value.getLength()];
    return (
      this.search.SearchForward(value, start, end) &&
      (!this.wholeCell || (start[0] === 0 && end[0] === value.getLength()))
    );
  }
}

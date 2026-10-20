/** @fileoverview Original i18nutil searchopt.hxx typed value, algorithm bridges, explicit constructors, new-UNO assignment and toUnoSearchOptions2. */
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../udkapi/com/sun/star/lang/Locale";
import { SearchAlgorithms } from "../../offapi/com/sun/star/util/SearchAlgorithms";
import * as Algorithms2 from "../../offapi/com/sun/star/util/SearchAlgorithms2";
import {
  SearchOptions2 as UnoSearchOptions2,
  type SearchOptions2ConstReference,
} from "../../offapi/com/sun/star/util/SearchOptions2";
/** Native downgrade returns legacy ABSOLUTE for wildcard and unknown newer values. @param algorithm - Newer identity. @returns Legacy identity. */
export function downgradeSearchAlgorithms2(algorithm: number): SearchAlgorithms {
  switch (algorithm) {
    case Algorithms2.REGEXP:
      return SearchAlgorithms.REGEXP;
    case Algorithms2.APPROXIMATE:
      return SearchAlgorithms.APPROXIMATE;
    default:
      return SearchAlgorithms.ABSOLUTE;
  }
}
/** Native upgrade defaults unknown legacy values to newer ABSOLUTE, independently of the typed struct's zero default. @param algorithm - Legacy identity. @returns Newer identity. */
export function upgradeSearchAlgorithms(algorithm: SearchAlgorithms): number {
  switch (algorithm) {
    case SearchAlgorithms.REGEXP:
      return Algorithms2.REGEXP;
    case SearchAlgorithms.APPROXIMATE:
      return Algorithms2.APPROXIMATE;
    default:
      return Algorithms2.ABSOLUTE;
  }
}
/** Original typed constructor field order, deliberately excluding obsolete algorithmType. */
type TypedSearchOptionsArguments = [
  searchFlag: number,
  searchString: OUStringConstReference,
  replaceString: OUStringConstReference,
  Locale: LocaleConstReference,
  changedChars: number,
  deletedChars: number,
  insertedChars: number,
  transliterateFlags: number,
  AlgorithmType2: number,
  WildcardEscapeCharacter: number,
];
/** Native typed options. The default algorithm identity is zero, not ABSOLUTE. */
export class SearchOptions2 {
  public searchFlag = 0;
  public changedChars = 0;
  public deletedChars = 0;
  public insertedChars = 0;
  public transliterateFlags = 0;
  public AlgorithmType2 = 0;
  public WildcardEscapeCharacter = 0;
  private readonly searchValue = new OUString();
  private readonly replaceValue = new OUString();
  private readonly localeValue = new Locale();
  /** Original default, implicit copy and complete typed-field constructors. @param args - Source typed value or original field tuple. @returns Initialized value. */
  public constructor(...args: [] | [source: SearchOptions2] | TypedSearchOptionsArguments) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 10) {
      this.searchFlag = args[0];
      this.searchString = args[1];
      this.replaceString = args[2];
      this.Locale = args[3];
      this.changedChars = args[4];
      this.deletedChars = args[5];
      this.insertedChars = args[6];
      this.transliterateFlags = args[7];
      this.AlgorithmType2 = args[8];
      this.WildcardEscapeCharacter = args[9];
    }
  }
  /** Stable native search field owner. @returns Search value. */
  public get searchString(): OUString {
    return this.searchValue;
  }
  /** Native OUString assignment. @param source - Source string. @returns Nothing. */
  public set searchString(source: OUStringConstReference) {
    this.searchValue.assign(source);
  }
  /** Stable native replacement field owner. @returns Replacement value. */
  public get replaceString(): OUString {
    return this.replaceValue;
  }
  /** Native replacement assignment. @param source - Source string. @returns Nothing. */
  public set replaceString(source: OUStringConstReference) {
    this.replaceValue.assign(source);
  }
  /** Stable native Locale field owner, without implicit locale resolution. @returns Locale value. */
  public get Locale(): Locale {
    return this.localeValue;
  }
  /** Native Locale value assignment. @param source - Source fields. @returns Nothing. */
  public set Locale(source: LocaleConstReference) {
    this.localeValue.assign(source);
  }
  /** Native implicit typed assignment and explicit assignment from the newer UNO struct. Obsolete algorithmType is not read. @param source - Complete source value. @returns This owner. */
  public assign(source: SearchOptions2 | SearchOptions2ConstReference): this {
    this.searchFlag = source.searchFlag;
    this.searchString = source.searchString;
    this.replaceString = source.replaceString;
    this.Locale = source.Locale;
    this.changedChars = source.changedChars;
    this.deletedChars = source.deletedChars;
    this.insertedChars = source.insertedChars;
    this.transliterateFlags = source.transliterateFlags;
    this.AlgorithmType2 = source.AlgorithmType2;
    this.WildcardEscapeCharacter = source.WildcardEscapeCharacter;
    return this;
  }
  /** Original new-UNO conversion, retaining the newer identity and downgrading only its obsolete field. @returns Independent native value struct. */
  public toUnoSearchOptions2(): UnoSearchOptions2 {
    return new UnoSearchOptions2(
      downgradeSearchAlgorithms2(this.AlgorithmType2),
      this.searchFlag,
      this.searchString,
      this.replaceString,
      this.Locale,
      this.changedChars,
      this.deletedChars,
      this.insertedChars,
      this.transliterateFlags | 0,
      this.AlgorithmType2,
      this.WildcardEscapeCharacter,
    );
  }
}

/** @fileoverview SearchOptions.idl fields and generated UNO plain-struct default/copy/full construction, using actual OUString and Locale value owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../../../../udkapi/com/sun/star/lang/Locale";
import { SearchAlgorithms } from "./SearchAlgorithms";
/** Borrowed native field view. String/Locale values are copied when constructing or assigning owned fields. */
export interface SearchOptionsConstReference {
  readonly algorithmType: SearchAlgorithms;
  readonly searchFlag: number;
  readonly searchString: OUStringConstReference;
  readonly replaceString: OUStringConstReference;
  readonly Locale: LocaleConstReference;
  readonly changedChars: number;
  readonly deletedChars: number;
  readonly insertedChars: number;
  readonly transliterateFlags: number;
}
/** Native IDL field-order constructor tuple. */
export type SearchOptionsArguments = [
  algorithmType: SearchAlgorithms,
  searchFlag: number,
  searchString: OUStringConstReference,
  replaceString: OUStringConstReference,
  Locale: LocaleConstReference,
  changedChars: number,
  deletedChars: number,
  insertedChars: number,
  transliterateFlags: number,
];
/** Original nine-field UNO value struct, without search execution or locale policy. */
export class SearchOptions implements SearchOptionsConstReference {
  public algorithmType = SearchAlgorithms.ABSOLUTE;
  public searchFlag = 0;
  public changedChars = 0;
  public deletedChars = 0;
  public insertedChars = 0;
  public transliterateFlags = 0;
  private readonly searchValue = new OUString();
  private readonly replaceValue = new OUString();
  private readonly localeValue = new Locale();
  /** Original default, implicit copy or all-field constructor. @param args - Source struct or exact IDL field tuple. @returns Independent value owner. */
  public constructor(...args: [] | [source: SearchOptionsConstReference] | SearchOptionsArguments) {
    if (args.length === 1) this.CopyFields(args[0]);
    else if (args.length === 9) this.SetFields(...args);
  }
  /** Native string field's stable owned value. @returns Search value. */
  public get searchString(): OUString {
    return this.searchValue;
  }
  /** Native string value assignment. @param value - Borrowed source. @returns Nothing. */
  public set searchString(value: OUStringConstReference) {
    this.searchValue.assign(value);
  }
  /** Native replacement field. @returns Replacement value. */
  public get replaceString(): OUString {
    return this.replaceValue;
  }
  /** Native replacement value assignment. @param value - Borrowed source. @returns Nothing. */
  public set replaceString(value: OUStringConstReference) {
    this.replaceValue.assign(value);
  }
  /** Native Locale field, without canonicalization or SYSTEM resolution. @returns Locale owner. */
  public get Locale(): Locale {
    return this.localeValue;
  }
  /** Native Locale value assignment. @param value - Borrowed fields. @returns Nothing. */
  public set Locale(value: LocaleConstReference) {
    this.localeValue.assign(value);
  }
  /** Erases generated implicit field-copy syntax for base/derived struct construction. @param source - Borrowed native fields. @returns Nothing. */
  protected CopyFields(source: SearchOptionsConstReference): void {
    this.SetFields(
      source.algorithmType,
      source.searchFlag,
      source.searchString,
      source.replaceString,
      source.Locale,
      source.changedChars,
      source.deletedChars,
      source.insertedChars,
      source.transliterateFlags,
    );
  }
  /** Erases generated inherited-field initializer syntax without another temporary value owner. @param args - Native IDL fields. @returns Nothing. */
  protected SetFields(...args: SearchOptionsArguments): void {
    this.algorithmType = args[0];
    this.searchFlag = args[1];
    this.searchString = args[2];
    this.replaceString = args[3];
    this.Locale = args[4];
    this.changedChars = args[5];
    this.deletedChars = args[6];
    this.insertedChars = args[7];
    this.transliterateFlags = args[8];
  }
}

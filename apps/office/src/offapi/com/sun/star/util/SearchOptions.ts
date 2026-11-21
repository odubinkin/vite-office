/** @fileoverview SearchOptions.idl fields and generated UNO plain-struct default/copy/full construction, using actual OUString and Locale value owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../../../../udkapi/com/sun/star/lang/Locale";
import {
  SearchAlgorithms,
  cppu_detail_getUnoType_SearchAlgorithms as algorithmType,
} from "./SearchAlgorithms";
import { cppu_detail_getUnoType_Locale as localeType } from "../../../../../udkapi/com/sun/star/lang/Locale";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";

const the_type: [R | null] = [null];

/** Publishes the nine original struct members in IDL order. @returns Borrowed type. */
export function cppu_detail_getUnoType_SearchOptions(): Type {
  if (the_type[0] === null) {
    const long = UnoType.get("sal_Int32").getTypeLibType() as R;
    const string = UnoType.get("OUString").getTypeLibType() as R;
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.SearchOptions\0"),
      null,
      9,
      [
        algorithmType().getTypeLibType() as R,
        long,
        string,
        string,
        localeType().getTypeLibType() as R,
        long,
        long,
        long,
        long,
      ],
      null,
    );
  }
  return getTypeFromTypeDescriptionReference(the_type);
}

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
  private readonly algorithmTypeValue: [SearchAlgorithms] = [SearchAlgorithms.ABSOLUTE];
  /** Legacy algorithm. @returns Native value. */
  public get algorithmType(): SearchAlgorithms {
    return this.algorithmTypeValue[0];
  }
  /** Assigns the IDL field. @param value - Native value. @returns Nothing. */
  public set algorithmType(value: SearchAlgorithms) {
    this.algorithmTypeValue[0] = (value | 0) as SearchAlgorithms;
  }
  private readonly searchFlagValue: [number] = [0];
  /** Search flags. @returns Native value. */
  public get searchFlag(): number {
    return this.searchFlagValue[0];
  }
  /** Assigns the IDL field. @param value - Native value. @returns Nothing. */
  public set searchFlag(value: number) {
    this.searchFlagValue[0] = (value | 0) as number;
  }
  private readonly changedCharsValue: [number] = [0];
  /** Allowed changed characters. @returns Native value. */
  public get changedChars(): number {
    return this.changedCharsValue[0];
  }
  /** Assigns the IDL field. @param value - Native value. @returns Nothing. */
  public set changedChars(value: number) {
    this.changedCharsValue[0] = (value | 0) as number;
  }
  private readonly deletedCharsValue: [number] = [0];
  /** Allowed deleted characters. @returns Native value. */
  public get deletedChars(): number {
    return this.deletedCharsValue[0];
  }
  /** Assigns the IDL field. @param value - Native value. @returns Nothing. */
  public set deletedChars(value: number) {
    this.deletedCharsValue[0] = (value | 0) as number;
  }
  private readonly insertedCharsValue: [number] = [0];
  /** Allowed inserted characters. @returns Native value. */
  public get insertedChars(): number {
    return this.insertedCharsValue[0];
  }
  /** Assigns the IDL field. @param value - Native value. @returns Nothing. */
  public set insertedChars(value: number) {
    this.insertedCharsValue[0] = (value | 0) as number;
  }
  private readonly transliterateFlagsValue: [number] = [0];
  /** Transliteration flags. @returns Native value. */
  public get transliterateFlags(): number {
    return this.transliterateFlagsValue[0];
  }
  /** Assigns the IDL field. @param value - Native value. @returns Nothing. */
  public set transliterateFlags(value: number) {
    this.transliterateFlagsValue[0] = (value | 0) as number;
  }
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
  /** Logical CPPU member addresses in base struct order. @param offset - Member offset. @returns Original owned field address. */
  public get(offset: number): unknown {
    switch (offset) {
      case 0:
        return this.algorithmTypeValue;
      case 4:
        return this.searchFlagValue;
      case 8:
        return this.searchValue.getDataAddress();
      case 16:
        return this.replaceValue.getDataAddress();
      case 24:
        return this.localeValue;
      case 48:
        return this.changedCharsValue;
      case 52:
        return this.deletedCharsValue;
      case 56:
        return this.insertedCharsValue;
      case 60:
        return this.transliterateFlagsValue;
      default:
        return undefined;
    }
  }
}

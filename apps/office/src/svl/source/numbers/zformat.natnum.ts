/** @fileoverview Original SvNumberNatNum owned metadata and bidirectional DBNum mappings from zformat.hxx/zformat.cxx. */
import {
  LANGUAGE_DONTKNOW,
  LANGUAGE_CHINESE,
  LANGUAGE_JAPANESE,
  LANGUAGE_KOREAN,
  primary,
} from "../../../i18nlangtag/inc/lang";
import { MsLangId } from "../../../i18nlangtag/inc/mslangid";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
const tblDBNumToNatNum = new Map<number, readonly number[]>([
  [primary(LANGUAGE_CHINESE), [4, 5, 3, 0]],
  [primary(LANGUAGE_JAPANESE), [4, 5, 3, 0]],
  [primary(LANGUAGE_KOREAN), [4, 5, 6, 10]],
]);
const tblNatNumToDBNum = new Map<number, readonly number[]>([
  [primary(LANGUAGE_CHINESE), [1, 0, 0, 1, 2, 3, 0, 0, 0]],
  [primary(LANGUAGE_JAPANESE), [1, 2, 3, 1, 2, 3, 1, 2, 0]],
  [primary(LANGUAGE_KOREAN), [1, 2, 3, 1, 2, 3, 1, 2, 4]],
]);
/** Original native-number modifier metadata, including unset versus explicit NatNum0. */
export class SvNumberNatNum {
  private readonly sParams = new OUString();
  private eLang = LANGUAGE_DONTKNOW;
  private nNum = 0;
  private bDBNum = false;
  private bDate = false;
  private bSet = false;
  /** Original DBNum to NatNum mapping, including the date-specific source branch. @param number - Native uint8 DBNum. @param language - Native language ID. @param date - Date context. @returns Native modifier. */
  static MapDBNumToNatNum(number: number, language: number, date: boolean): number {
    number &= 255;
    language = primary(MsLangId.getRealLanguage(language));
    let result = 0;
    if (date) {
      if (number === 4 && language === primary(LANGUAGE_KOREAN)) result = 10;
      else if (number <= 3) result = number;
    } else if (1 <= number && number <= 4) {
      const found = tblDBNumToNatNum.get(language);
      if (found) result = found[number - 1] as number;
    }
    return result;
  }
  /** Original NatNum to DBNum mapping; the nondate source table intentionally has nine entries. @param number - Native uint8 NatNum. @param language - Native language ID. @param date - Date context. @returns Native DBNum. */
  static MapNatNumToDBNum(number: number, language: number, date: boolean): number {
    number &= 255;
    language = primary(MsLangId.getRealLanguage(language));
    let result = 0;
    if (date) {
      if (number === 10 && language === primary(LANGUAGE_KOREAN)) result = 4;
      else if (number <= 3) result = number;
    } else if (1 <= number && number <= 9) {
      const found = tblNatNumToDBNum.get(language);
      if (found) result = found[number - 1] as number;
    }
    return result;
  }
  /** Original completeness test, without resolving a stored language. @returns Complete modifier. */
  IsComplete(): boolean {
    return this.bSet && this.eLang !== LANGUAGE_DONTKNOW;
  }
  /** Original native modifier lookup. @returns NatNum value. */
  GetNatNum(): number {
    return this.bDBNum
      ? SvNumberNatNum.MapDBNumToNatNum(this.nNum, this.eLang, this.bDate)
      : this.nNum;
  }
  /** Original compatible modifier lookup. @returns DBNum value. */
  GetDBNum(): number {
    return this.bDBNum
      ? this.nNum
      : SvNumberNatNum.MapNatNumToDBNum(this.nNum, this.eLang, this.bDate);
  }
  /** Original language read. @returns Stored language. */
  GetLang(): number {
    return this.eLang;
  }
  /** Original language assignment, retaining unknown/system values. @param language - Native uint16 ID. @returns Nothing. */
  SetLang(language: number): void {
    this.eLang = language & 65535;
  }
  /** Original modifier assignment marks explicit zero as set. @param number - Native uint8 number. @param dbNum - DBNum interpretation. @returns Nothing. */
  SetNum(number: number, dbNum: boolean): void {
    this.nNum = number & 255;
    this.bDBNum = dbNum;
    this.bSet = true;
  }
  /** Original explicit-modifier state. @returns Whether assigned. */
  IsSet(): boolean {
    return this.bSet;
  }
  /** Original date context assignment. @param date - Context. @returns Nothing. */
  SetDate(date: boolean): void {
    this.bDate = date;
  }
  /** Original owned parameter string assignment. @param params - Actual string. @returns Nothing. */
  SetParams(params: OUStringConstReference): void {
    this.sParams.assign(params);
  }
  /** Original const borrow of owned parameters. @returns Actual parameter owner. */
  GetParams(): OUStringConstReference {
    return this.sParams;
  }
  /** Binding of compiler-generated memberwise C++ copy assignment, including owned OUString assignment. @param source - Actual source metadata. @returns This owner. */
  assign(source: SvNumberNatNumConstReference): this {
    const actual = source as SvNumberNatNum;
    this.sParams.assign(actual.sParams);
    this.eLang = actual.eLang;
    this.nNum = actual.nNum;
    this.bDBNum = actual.bDBNum;
    this.bDate = actual.bDate;
    this.bSet = actual.bSet;
    return this;
  }
  /** Original owned string-member destruction. @returns Nothing. */
  dispose(): void {
    this.sParams.dispose();
  }
}
/** Original const metadata reference exposes only native query members. */
export type SvNumberNatNumConstReference = Pick<
  SvNumberNatNum,
  "IsComplete" | "GetNatNum" | "GetDBNum" | "GetLang" | "IsSet" | "GetParams"
>;

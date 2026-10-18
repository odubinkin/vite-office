/** @fileoverview Original Calc document calculation options and their pool item over shared search,locale and scalar defaults. */
import { SearchParam } from "../../../../unotools/inc/textsearch";
import { SfxPoolItem } from "../../../../svl/inc/poolitem";
import type { SfxItemPool } from "../../../../svl/inc/itempool";
import {
  UNLIMITED_PRECISION,
  getYear2000Default,
} from "../../../../svl/source/numbers/zforlist.defaults";
import { ScOptionsUtil } from "./optutil";

/** Original document options value;copying never rereads system defaults. */
export class ScDocOptions {
  private fIterEps: number = 0;
  private nIterCount: number = 0;
  private nPrecStandardFormat: number = 0;
  private nDay: number = 0;
  private nMonth: number = 0;
  private nYear: number = 0;
  private nYear2000: number = 0;
  private nTabDistance: number = 0;
  private eFormulaSearchType: number = 0;
  private bIsIgnoreCase: boolean = false;
  private bIsIter: boolean = false;
  private bCalcAsShown: boolean = false;
  private bIgnoreLineBreaks: boolean = false;
  private bMatchWholeCell: boolean = false;
  private bLookUpColRowNames: boolean = false;
  private bFormulaRegexEnabled: boolean = false;
  private bFormulaWildcardsEnabled: boolean = false;
  private bWriteCalcConfig: boolean = false;
  /** Original default and compiler-generated copy constructors. @param source - Optional copied value. @returns Value. */
  constructor(source?: ScDocOptionsConstReference) {
    if (source === undefined) ScDocOptions.prototype.ResetDocOptions.call(this);
    else ScDocOptions.prototype.assign.call(this, source);
  }
  /** Original implicit memberwise assignment,including lazy search cache and ignored comparison field. @param source - Actual borrowed options. @returns This value. */
  assign(source: ScDocOptionsConstReference): this {
    const original = source as ScDocOptions;
    this.fIterEps = original.fIterEps;
    this.nIterCount = original.nIterCount;
    this.nPrecStandardFormat = original.nPrecStandardFormat;
    this.nDay = original.nDay;
    this.nMonth = original.nMonth;
    this.nYear = original.nYear;
    this.nYear2000 = original.nYear2000;
    this.nTabDistance = original.nTabDistance;
    this.eFormulaSearchType = original.eFormulaSearchType;
    this.bIsIgnoreCase = original.bIsIgnoreCase;
    this.bIsIter = original.bIsIter;
    this.bCalcAsShown = original.bCalcAsShown;
    this.bIgnoreLineBreaks = original.bIgnoreLineBreaks;
    this.bMatchWholeCell = original.bMatchWholeCell;
    this.bLookUpColRowNames = original.bLookUpColRowNames;
    this.bFormulaRegexEnabled = original.bFormulaRegexEnabled;
    this.bFormulaWildcardsEnabled = original.bFormulaWildcardsEnabled;
    this.bWriteCalcConfig = original.bWriteCalcConfig;
    return this;
  }
  /** Original reset to current shipped configuration and source locale defaults. @returns Nothing. */
  ResetDocOptions(): void {
    this.bIsIgnoreCase = false;
    this.bIsIter = false;
    this.nIterCount = 100;
    this.fIterEps = 1e-3;
    this.nPrecStandardFormat = UNLIMITED_PRECISION;
    this.nDay = 30;
    this.nMonth = 12;
    this.nYear = 1899;
    this.nYear2000 = getYear2000Default();
    this.nTabDistance = ScOptionsUtil.IsMetricSystem() ? 709 : 720;
    this.bCalcAsShown = false;
    this.bMatchWholeCell = true;
    this.bLookUpColRowNames = true;
    this.bFormulaRegexEnabled = false;
    this.bFormulaWildcardsEnabled = true;
    this.eFormulaSearchType = SearchParam.SearchType.Wildcard;
    this.bWriteCalcConfig = true;
    this.bIgnoreLineBreaks = false;
  }
  /** Original stored bLookUpColRowNames query. @returns Stored value. */
  IsLookUpColRowNames(): boolean {
    return this.bLookUpColRowNames;
  }
  /** Original bLookUpColRowNames assignment. @param value - Native field value. @returns Nothing. */
  SetLookUpColRowNames(value: boolean): void {
    this.bLookUpColRowNames = value;
  }
  /** Original stored bMatchWholeCell query. @returns Stored value. */
  IsMatchWholeCell(): boolean {
    return this.bMatchWholeCell;
  }
  /** Original bMatchWholeCell assignment. @param value - Native field value. @returns Nothing. */
  SetMatchWholeCell(value: boolean): void {
    this.bMatchWholeCell = value;
  }
  /** Original stored bIsIgnoreCase query. @returns Stored value. */
  IsIgnoreCase(): boolean {
    return this.bIsIgnoreCase;
  }
  /** Original bIsIgnoreCase assignment. @param value - Native field value. @returns Nothing. */
  SetIgnoreCase(value: boolean): void {
    this.bIsIgnoreCase = value;
  }
  /** Original stored bIgnoreLineBreaks query. @returns Stored value. */
  IsIgnoreLineBreaks(): boolean {
    return this.bIgnoreLineBreaks;
  }
  /** Original bIgnoreLineBreaks assignment. @param value - Native field value. @returns Nothing. */
  SetIgnoreLineBreaks(value: boolean): void {
    this.bIgnoreLineBreaks = value;
  }
  /** Original stored bIsIter query. @returns Stored value. */
  IsIter(): boolean {
    return this.bIsIter;
  }
  /** Original bIsIter assignment. @param value - Native field value. @returns Nothing. */
  SetIter(value: boolean): void {
    this.bIsIter = value;
  }
  /** Original stored nIterCount query. @returns Stored value. */
  GetIterCount(): number {
    return this.nIterCount;
  }
  /** Original nIterCount assignment. @param value - Native field value. @returns Nothing. */
  SetIterCount(value: number): void {
    this.nIterCount = value & 65535;
  }
  /** Original stored fIterEps query. @returns Stored value. */
  GetIterEps(): number {
    return this.fIterEps;
  }
  /** Original fIterEps assignment. @param value - Native field value. @returns Nothing. */
  SetIterEps(value: number): void {
    this.fIterEps = value;
  }
  /** Original stored nTabDistance query. @returns Stored value. */
  GetTabDistance(): number {
    return this.nTabDistance;
  }
  /** Original nTabDistance assignment. @param value - Native field value. @returns Nothing. */
  SetTabDistance(value: number): void {
    this.nTabDistance = value & 65535;
  }
  /** Original stored nPrecStandardFormat query. @returns Stored value. */
  GetStdPrecision(): number {
    return this.nPrecStandardFormat;
  }
  /** Original nPrecStandardFormat assignment. @param value - Native field value. @returns Nothing. */
  SetStdPrecision(value: number): void {
    this.nPrecStandardFormat = value & 65535;
  }
  /** Original stored bCalcAsShown query. @returns Stored value. */
  IsCalcAsShown(): boolean {
    return this.bCalcAsShown;
  }
  /** Original bCalcAsShown assignment. @param value - Native field value. @returns Nothing. */
  SetCalcAsShown(value: boolean): void {
    this.bCalcAsShown = value;
  }
  /** Original stored nYear2000 query. @returns Stored value. */
  GetYear2000(): number {
    return this.nYear2000;
  }
  /** Original nYear2000 assignment. @param value - Native field value. @returns Nothing. */
  SetYear2000(value: number): void {
    this.nYear2000 = value & 65535;
  }
  /** Original stored bWriteCalcConfig query. @returns Stored value. */
  IsWriteCalcConfig(): boolean {
    return this.bWriteCalcConfig;
  }
  /** Original bWriteCalcConfig assignment. @param value - Native field value. @returns Nothing. */
  SetWriteCalcConfig(value: boolean): void {
    this.bWriteCalcConfig = value;
  }
  /** Original null-date output references with signed year projection. @param day - UInt16 output. @param month - UInt16 output. @param year - Int16 output. @returns Nothing. */
  GetDate(day: [number], month: [number], year: [number]): void {
    day[0] = this.nDay;
    month[0] = this.nMonth;
    year[0] = (this.nYear << 16) >> 16;
  }
  /** Original null-date assignment;year is stored in its unsigned16 member. @param day - UInt16 day. @param month - UInt16 month. @param year - Int16 year. @returns Nothing. */
  SetDate(day: number, month: number, year: number): void {
    this.nDay = day & 65535;
    this.nMonth = month & 65535;
    this.nYear = year & 65535;
  }
  /** Original lazy mode normalization. Constructors/reset/setters/copy preserve exclusive wildcard/regex flags,so the redundant both-true conjunct is unreachable. @returns Search mode. */
  GetFormulaSearchType(): number {
    if (this.eFormulaSearchType === SearchParam.SearchType.Unknown) {
      const regex = { value: this.bFormulaRegexEnabled };
      this.eFormulaSearchType = SearchParam.ConvertToSearchType(
        this.bFormulaWildcardsEnabled,
        regex,
      );
      this.bFormulaRegexEnabled = regex.value;
    }
    return this.eFormulaSearchType;
  }
  /** Original regex enable/disable/no-op transitions. @param value - Flag. @returns Nothing. */
  SetFormulaRegexEnabled(value: boolean): void {
    if (value) {
      this.bFormulaRegexEnabled = true;
      this.bFormulaWildcardsEnabled = false;
      this.eFormulaSearchType = SearchParam.SearchType.Regexp;
    } else if (this.bFormulaRegexEnabled) {
      this.bFormulaRegexEnabled = false;
      this.eFormulaSearchType = SearchParam.SearchType.Unknown;
    }
  }
  /** Original derived regex predicate with base nonvirtual getter binding. @returns Flag. */
  IsFormulaRegexEnabled(): boolean {
    return ScDocOptions.prototype.GetFormulaSearchType.call(this) === SearchParam.SearchType.Regexp;
  }
  /** Original wildcard enable/disable/no-op transitions. @param value - Flag. @returns Nothing. */
  SetFormulaWildcardsEnabled(value: boolean): void {
    if (value) {
      this.bFormulaRegexEnabled = false;
      this.bFormulaWildcardsEnabled = true;
      this.eFormulaSearchType = SearchParam.SearchType.Wildcard;
    } else if (this.bFormulaWildcardsEnabled) {
      this.bFormulaWildcardsEnabled = false;
      this.eFormulaSearchType = SearchParam.SearchType.Unknown;
    }
  }
  /** Original derived wildcard predicate with base nonvirtual getter binding. @returns Flag. */
  IsFormulaWildcardsEnabled(): boolean {
    return (
      ScDocOptions.prototype.GetFormulaSearchType.call(this) === SearchParam.SearchType.Wildcard
    );
  }
  /** Original value comparison includes the cached mode and omits bIgnoreLineBreaks. @param other - Actual borrowed options. @returns Native comparison. */
  equals(other: ScDocOptionsConstReference): boolean {
    const right = other as ScDocOptions;
    return (
      right.bIsIgnoreCase === this.bIsIgnoreCase &&
      right.bIsIter === this.bIsIter &&
      right.nIterCount === this.nIterCount &&
      right.fIterEps === this.fIterEps &&
      right.nPrecStandardFormat === this.nPrecStandardFormat &&
      right.nDay === this.nDay &&
      right.nMonth === this.nMonth &&
      right.nYear === this.nYear &&
      right.nYear2000 === this.nYear2000 &&
      right.nTabDistance === this.nTabDistance &&
      right.bCalcAsShown === this.bCalcAsShown &&
      right.bMatchWholeCell === this.bMatchWholeCell &&
      right.bLookUpColRowNames === this.bLookUpColRowNames &&
      right.bFormulaRegexEnabled === this.bFormulaRegexEnabled &&
      right.bFormulaWildcardsEnabled === this.bFormulaWildcardsEnabled &&
      right.eFormulaSearchType === this.eFormulaSearchType &&
      right.bWriteCalcConfig === this.bWriteCalcConfig
    );
  }
  /** Original negated value comparison. @param other - Actual borrowed options. @returns Inequality. */
  notEquals(other: ScDocOptionsConstReference): boolean {
    return !ScDocOptions.prototype.equals.call(this, other);
  }
}
/** Native const reference excludes mutable operations while retaining lazy const queries. */
export type ScDocOptionsConstReference = Omit<
  ScDocOptions,
  `Set${string}` | "ResetDocOptions" | "assign"
>;

/** Original calculation-options preferences item,copying actual options by value. */
export class ScTpCalcItem extends SfxPoolItem {
  private readonly theOptions: ScDocOptions;
  /** Original Which/options constructor. @param which - Native Which. @param options - Copied options. @returns Item. */
  constructor(which: number, options: ScDocOptionsConstReference);
  /** Original compiler-generated copy constructor. @param source - Actual source item. @returns Item. */
  constructor(source: ScTpCalcItem);
  /** Source overload binding. @param source - Which or copied item. @param options - Options for normal construction. @returns Item. */
  constructor(source: number | ScTpCalcItem, options?: ScDocOptionsConstReference) {
    super(source instanceof ScTpCalcItem ? SfxPoolItem.prototype.Which.call(source) : source);
    this.theOptions = new ScDocOptions(
      source instanceof ScTpCalcItem ? source.theOptions : (options as ScDocOptionsConstReference),
    );
  }
  /** Original stable borrowed const option member. @returns Actual member. */
  GetDocOptions(): ScDocOptionsConstReference {
    return this.theOptions;
  }
  /** Original payload equality ignores Which after native same-type precondition. @param other - Candidate item. @returns Comparison. */
  override equals(other: SfxPoolItem): boolean {
    return other instanceof ScTpCalcItem && this.theOptions.equals(other.theOptions);
  }
  /** Original pool-independent value clone. @param pool - Unused target pool. @returns Independent copied item. */
  override Clone(pool?: SfxItemPool): ScTpCalcItem {
    void pool;
    return new ScTpCalcItem(this);
  }
}

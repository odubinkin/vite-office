/** @fileoverview ICU78.3 TimeZoneRule, InitialTimeZoneRule, AnnualTimeZoneRule and TimeArrayTimeZoneRule owners/algorithms. */
import { UnicodeString } from "../common/unistr";
import { uprv_sortArray } from "../common/uarrsort";
import {
  DateTimeRule,
  type DateTimeRuleConstReference,
  DateRuleType,
  TimeRuleType,
} from "./dtrule";
import { Grego } from "./gregoimp";

/** Borrowed native const rule. */
export type TimeZoneRuleConstReference = Readonly<Omit<TimeZoneRule, "assignBase">>;
/** Borrowed native initial rule. */
export type InitialTimeZoneRuleConstReference = Readonly<
  Omit<InitialTimeZoneRule, "assignBase" | "assign">
>;
/** Original abstract rule owner, with value name and scalar offsets. */
export abstract class TimeZoneRule {
  private readonly fName: UnicodeString;
  private fRawOffset: number;
  private fDSTSavings: number;
  /** Original scalar/base-copy construction. @param source - Name or copied rule. @param raw - Raw offset. @param savings - DST offset. @returns Initialized owner. */
  protected constructor(
    source: UnicodeString | TimeZoneRuleConstReference,
    raw?: number,
    savings?: number,
  ) {
    if (source instanceof UnicodeString) {
      this.fName = new UnicodeString(source);
      this.fRawOffset = (raw as number) | 0;
      this.fDSTSavings = (savings as number) | 0;
    } else {
      const rule = source as TimeZoneRule;
      this.fName = new UnicodeString(rule.fName);
      this.fRawOffset = rule.fRawOffset;
      this.fDSTSavings = rule.fDSTSavings;
    }
  }
  /** Original explicitly qualified base assignment. @param other - Copied base. @returns This owner. */
  protected assignBase(other: TimeZoneRuleConstReference): this {
    if (this !== other) {
      const rule = other as TimeZoneRule;
      this.fName.assign(rule.fName);
      this.fRawOffset = rule.fRawOffset;
      this.fDSTSavings = rule.fDSTSavings;
    }
    return this;
  }
  /** Original base virtual equality. @param other - Compared rule. @returns Equality. */
  equals(other: TimeZoneRuleConstReference): boolean {
    const rule = other as TimeZoneRule;
    return (
      this === rule ||
      (this.constructor === rule.constructor &&
        this.fName.equals(rule.fName) &&
        this.fRawOffset === rule.fRawOffset &&
        this.fDSTSavings === rule.fDSTSavings)
    );
  }
  /** Original numeric equivalence ignores names. @param other - Compared rule. @returns Equivalent numeric state. */
  isEquivalentTo(other: TimeZoneRuleConstReference): boolean {
    const rule = other as TimeZoneRule;
    return (
      this === rule ||
      (this.constructor === rule.constructor &&
        this.fRawOffset === rule.fRawOffset &&
        this.fDSTSavings === rule.fDSTSavings)
    );
  }
  /** Original copied name output. @param output - Caller owner. @returns Output. */
  getName(output: UnicodeString): UnicodeString {
    return output.assign(this.fName);
  }
  /** Original raw offset. @returns Milliseconds. */
  getRawOffset(): number {
    return this.fRawOffset;
  }
  /** Original DST savings. @returns Milliseconds. */
  getDSTSavings(): number {
    return this.fDSTSavings;
  }
  /** Original clone boundary. @returns Independent owner. */
  abstract clone(): TimeZoneRule;
  /** Original first start. @param raw - Previous raw offset. @param dst - Previous savings. @param result - UTC milliseconds output. @returns Found. */
  abstract getFirstStart(raw: number, dst: number, result: [number]): boolean;
  /** Original final start. @param raw - Previous raw offset. @param dst - Previous savings. @param result - UTC milliseconds output. @returns Found. */
  abstract getFinalStart(raw: number, dst: number, result: [number]): boolean;
  /** Original next start. @param base - UTC base. @param raw - Previous offset. @param dst - Previous savings. @param inclusive - Include base. @param result - UTC output. @returns Found. */
  abstract getNextStart(
    base: number,
    raw: number,
    dst: number,
    inclusive: boolean,
    result: [number],
  ): boolean;
  /** Original previous start. @param base - UTC base. @param raw - Previous offset. @param dst - Previous savings. @param inclusive - Include base. @param result - UTC output. @returns Found. */
  abstract getPreviousStart(
    base: number,
    raw: number,
    dst: number,
    inclusive: boolean,
    result: [number],
  ): boolean;
}

/** Original initial state never supplies a transition start. */
export class InitialTimeZoneRule extends TimeZoneRule {
  /** Original copy constructor. @param source - Copied rule. @returns Owner. */
  constructor(source: InitialTimeZoneRuleConstReference);
  /** Original scalar constructor. @param name - Name. @param raw - Offset. @param dst - Savings. @returns Owner. */
  constructor(name: UnicodeString, raw: number, dst: number);
  /** Original constructor families. @param source - Name or rule. @param raw - Offset. @param dst - Savings. @returns Owner. */
  public constructor(
    source: UnicodeString | InitialTimeZoneRuleConstReference,
    raw?: number,
    dst?: number,
  ) {
    super(source, raw, dst);
  }
  /** Original assignment delegates to the base. @param source - Copied rule. @returns This owner. */
  assign(source: InitialTimeZoneRuleConstReference): this {
    return this.assignBase(source);
  }
  /** Original clone. @returns Owner. */
  override clone(): InitialTimeZoneRule {
    return new InitialTimeZoneRule(this);
  }
  /** Original initial rule never starts, leaving output untouched. @param raw - Unused offset. @param dst - Unused savings. @param result - Untouched output. @returns False. */
  getFirstStart(raw: number, dst: number, result: [number]): boolean {
    void raw;
    void dst;
    void result;
    return false;
  }
  /** Original initial rule never starts. @param raw - Unused offset. @param dst - Unused savings. @param result - Untouched output. @returns False. */
  getFinalStart(raw: number, dst: number, result: [number]): boolean {
    void raw;
    void dst;
    void result;
    return false;
  }
  /** Original initial rule never starts. @param base - Unused base. @param raw - Unused offset. @param dst - Unused savings. @param inclusive - Unused flag. @param result - Untouched output. @returns False. */
  getNextStart(
    base: number,
    raw: number,
    dst: number,
    inclusive: boolean,
    result: [number],
  ): boolean {
    void base;
    void raw;
    void dst;
    void inclusive;
    void result;
    return false;
  }
  /** Original initial rule never starts. @param base - Unused base. @param raw - Unused offset. @param dst - Unused savings. @param inclusive - Unused flag. @param result - Untouched output. @returns False. */
  getPreviousStart(
    base: number,
    raw: number,
    dst: number,
    inclusive: boolean,
    result: [number],
  ): boolean {
    void base;
    void raw;
    void dst;
    void inclusive;
    void result;
    return false;
  }
}
/** Original annual recurring rule. */
export class AnnualTimeZoneRule extends TimeZoneRule {
  static readonly MAX_YEAR = 0x7fffffff;
  private fDateTimeRule: DateTimeRule;
  private fStartYear: number;
  private fEndYear: number;
  /** Original deep-copy constructor. @param source - Copied owner. @returns Owner. */
  constructor(source: AnnualTimeZoneRule);
  /** Original const-rule copy constructor; ownership selects the erased adopting-pointer overload explicitly. @param name - Name. @param raw - Offset. @param dst - Savings. @param rule - Date rule. @param start - First year. @param end - Last year. @param ownership - Native pointer-adoption projection. @returns Owner. */
  constructor(
    name: UnicodeString,
    raw: number,
    dst: number,
    rule: DateTimeRuleConstReference,
    start: number,
    end: number,
    ownership?: "copy",
  );
  /** Original adopting-pointer constructor, explicitly selected for a mutable transferred owner. @param name - Name. @param raw - Offset. @param dst - Savings. @param rule - Transferred date-rule owner. @param start - First year. @param end - Last year. @param ownership - Native pointer-adoption projection. @returns Owner. */
  constructor(
    name: UnicodeString,
    raw: number,
    dst: number,
    rule: DateTimeRule,
    start: number,
    end: number,
    ownership: "adopt",
  );
  /** Original constructor families with explicit reference-versus-pointer ownership. @param source - Name or owner. @param raw - Offset. @param dst - Savings. @param rule - Rule. @param start - First year. @param end - Last year. @param ownership - Copy versus adoption. @returns Owner. */
  constructor(
    source: UnicodeString | AnnualTimeZoneRule,
    raw?: number,
    dst?: number,
    rule?: DateTimeRuleConstReference,
    start?: number,
    end?: number,
    ownership: "copy" | "adopt" = "copy",
  ) {
    super(source, raw, dst);
    if (source instanceof AnnualTimeZoneRule) {
      this.fDateTimeRule = new DateTimeRule(source.fDateTimeRule);
      this.fStartYear = source.fStartYear;
      this.fEndYear = source.fEndYear;
    } else {
      this.fDateTimeRule =
        ownership === "adopt"
          ? (rule as DateTimeRule)
          : new DateTimeRule(rule as DateTimeRuleConstReference);
      this.fStartYear = (start as number) | 0;
      this.fEndYear = (end as number) | 0;
    }
  }
  /** Original deep assignment clones the date rule polymorphically. @param source - Copied owner. @returns This owner. */
  assign(source: AnnualTimeZoneRule): this {
    if (this !== source) {
      this.assignBase(source);
      this.fDateTimeRule = source.fDateTimeRule.clone();
      this.fStartYear = source.fStartYear;
      this.fEndYear = source.fEndYear;
    }
    return this;
  }
  /** Original value clone. @returns Owner. */
  override clone(): AnnualTimeZoneRule {
    return new AnnualTimeZoneRule(this);
  }
  /** Source annual equality deliberately omits base name and offsets. @param other - Compared rule. @returns Equality. */
  override equals(other: TimeZoneRuleConstReference): boolean {
    if (this === other) return true;
    if (this.constructor !== other.constructor) return false;
    const rule = other as AnnualTimeZoneRule;
    return (
      this.fDateTimeRule.equals(rule.fDateTimeRule) &&
      this.fStartYear === rule.fStartYear &&
      this.fEndYear === rule.fEndYear
    );
  }
  /** Source equivalence includes numeric base state and annual fields. @param other - Compared rule. @returns Equivalence. */
  override isEquivalentTo(other: TimeZoneRuleConstReference): boolean {
    if (this === other) return true;
    if (this.constructor !== other.constructor || !super.isEquivalentTo(other)) return false;
    const rule = other as AnnualTimeZoneRule;
    return (
      this.fDateTimeRule.equals(rule.fDateTimeRule) &&
      this.fStartYear === rule.fStartYear &&
      this.fEndYear === rule.fEndYear
    );
  }
  /** Original borrowed const date rule. @returns Rule reference. */
  getRule(): DateTimeRuleConstReference {
    return this.fDateTimeRule;
  }
  /** Original first year. @returns Year. */
  getStartYear(): number {
    return this.fStartYear;
  }
  /** Original last year. @returns Year. */
  getEndYear(): number {
    return this.fEndYear;
  }
  /** Original Gregorian rule-day and previous-offset conversion, with untouched output outside the year range. @param year - Extended year. @param raw - Previous raw milliseconds. @param dst - Previous DST milliseconds. @param result - UTC output. @returns Found. */
  getStartInYear(year: number, raw: number, dst: number, result: [number]): boolean {
    year |= 0;
    raw |= 0;
    dst |= 0;
    if (year < this.fStartYear || year > this.fEndYear) return false;
    const rule = this.fDateTimeRule,
      type = rule.getDateRuleType();
    let day: number;
    if (type === DateRuleType.DOM)
      day = Number(Grego.fieldsToDay(year, rule.getRuleMonth(), rule.getRuleDayOfMonth()));
    else {
      let after = true;
      if (type === DateRuleType.DOW) {
        const weeks = rule.getRuleWeekInMonth();
        if (weeks > 0)
          day = Number(Grego.fieldsToDay(year, rule.getRuleMonth(), 1)) + 7 * (weeks - 1);
        else {
          after = false;
          day =
            Number(
              Grego.fieldsToDay(
                year,
                rule.getRuleMonth(),
                Grego.monthLength(year, rule.getRuleMonth()),
              ),
            ) +
            7 * (weeks + 1);
        }
      } else {
        const month = rule.getRuleMonth();
        let dom = rule.getRuleDayOfMonth();
        if (type === DateRuleType.DOW_LEQ_DOM) {
          after = false;
          if (month === 1 && dom === 29 && !Grego.isLeapYear(year)) dom--;
        }
        day = Number(Grego.fieldsToDay(year, month, dom));
      }
      const dow = Grego.dayOfWeek(day);
      let delta = rule.getRuleDayOfWeek() - dow;
      delta = after ? (delta < 0 ? delta + 7 : delta) : delta > 0 ? delta - 7 : delta;
      day += delta;
    }
    result[0] = day * 86400000 + rule.getRuleMillisInDay();
    if (rule.getTimeRuleType() !== TimeRuleType.UTC_TIME) result[0] -= raw;
    if (rule.getTimeRuleType() === TimeRuleType.WALL_TIME) result[0] -= dst;
    return true;
  }
  /** Original first start. @param raw - Previous offset. @param dst - Previous savings. @param result - UTC output. @returns Found. */
  getFirstStart(raw: number, dst: number, result: [number]): boolean {
    return this.getStartInYear(this.fStartYear, raw, dst, result);
  }
  /** Original forever rule has no final start. @param raw - Previous offset. @param dst - Previous savings. @param result - UTC output. @returns Found. */
  getFinalStart(raw: number, dst: number, result: [number]): boolean {
    return this.fEndYear === AnnualTimeZoneRule.MAX_YEAR
      ? false
      : this.getStartInYear(this.fEndYear, raw, dst, result);
  }
  /** Original next-start algorithm; the local Gregorian error remains assertion-only as upstream. @param base - UTC base. @param raw - Previous offset. @param dst - Previous savings. @param inclusive - Include base. @param result - UTC output. @returns Found. */
  getNextStart(
    base: number,
    raw: number,
    dst: number,
    inclusive: boolean,
    result: [number],
  ): boolean {
    const year = Grego.timeToYear(base, [0]);
    if (year < this.fStartYear) return this.getFirstStart(raw, dst, result);
    const time: [number] = [0];
    if (this.getStartInYear(year, raw, dst, time)) {
      if (time[0] < base || (!inclusive && time[0] === base))
        return this.getStartInYear((year + 1) | 0, raw, dst, result);
      result[0] = time[0];
      return true;
    }
    return false;
  }
  /** Original previous-start algorithm. @param base - UTC base. @param raw - Previous offset. @param dst - Previous savings. @param inclusive - Include base. @param result - UTC output. @returns Found. */
  getPreviousStart(
    base: number,
    raw: number,
    dst: number,
    inclusive: boolean,
    result: [number],
  ): boolean {
    const year = Grego.timeToYear(base, [0]);
    if (year > this.fEndYear) return this.getFinalStart(raw, dst, result);
    const time: [number] = [0];
    if (this.getStartInYear(year, raw, dst, time)) {
      if (time[0] > base || (!inclusive && time[0] === base))
        return this.getStartInYear((year - 1) | 0, raw, dst, result);
      result[0] = time[0];
      return true;
    }
    return false;
  }
}

/** Original explicit historical start-time rule. Native stack/heap buffers are represented by one owned scalar array. */
export class TimeArrayTimeZoneRule extends TimeZoneRule {
  private fTimeRuleType: TimeRuleType;
  private fStartTimes: number[];
  /** Original deep-copy constructor. @param source - Copied owner. @returns Owner. */
  constructor(source: TimeArrayTimeZoneRule);
  /** Original explicit-size scalar constructor. @param name - Rule name. @param raw - Offset. @param dst - Savings. @param times - Source buffer. @param count - Copied count. @param type - Wall/standard/UTC rule type. @returns Owner. */
  constructor(
    name: UnicodeString,
    raw: number,
    dst: number,
    times: readonly number[],
    count: number,
    type: TimeRuleType,
  );
  /** Original constructor families. Buffer size/pointer preconditions remain the caller's responsibility. @param source - Name or owner. @param raw - Offset. @param dst - Savings. @param times - Source buffer. @param count - Copied count. @param type - Time rule type. @returns Owner. */
  constructor(
    source: UnicodeString | TimeArrayTimeZoneRule,
    raw?: number,
    dst?: number,
    times?: readonly number[],
    count?: number,
    type?: TimeRuleType,
  ) {
    super(source, raw, dst);
    if (source instanceof TimeArrayTimeZoneRule) {
      this.fTimeRuleType = source.fTimeRuleType;
      this.fStartTimes = source.fStartTimes.slice();
    } else {
      this.fTimeRuleType = type as TimeRuleType;
      this.fStartTimes = (times as readonly number[]).slice(0, count as number);
    }
    // Source initStartTimes sorts even on copy; construction discards its local status.
    uprv_sortArray(this.fStartTimes, this.fStartTimes.length, 8, compareDates, true, [0]);
  }
  /** Original deep assignment and sort. @param source - Copied owner. @returns This owner. */
  assign(source: TimeArrayTimeZoneRule): this {
    if (this !== source) {
      this.assignBase(source);
      this.fStartTimes = source.fStartTimes.slice();
      uprv_sortArray(this.fStartTimes, this.fStartTimes.length, 8, compareDates, true, [0]);
      this.fTimeRuleType = source.fTimeRuleType;
    }
    return this;
  }
  /** Original value clone. @returns Owner. */
  override clone(): TimeArrayTimeZoneRule {
    return new TimeArrayTimeZoneRule(this);
  }
  /** Original equality includes the base, time type and every start. @param other - Compared rule. @returns Equality. */
  override equals(other: TimeZoneRuleConstReference): boolean {
    if (this === other) return true;
    return (
      this.constructor === other.constructor &&
      super.equals(other) &&
      this.sameStarts(other as TimeArrayTimeZoneRule)
    );
  }
  /** Original numeric equivalence ignores names through the base. @param other - Compared rule. @returns Equivalence. */
  override isEquivalentTo(other: TimeZoneRuleConstReference): boolean {
    if (this === other) return true;
    return (
      this.constructor === other.constructor &&
      super.isEquivalentTo(other) &&
      this.sameStarts(other as TimeArrayTimeZoneRule)
    );
  }
  /** Shared scalar loop of the two original comparisons. @param other - Same dynamic type. @returns Same type and starts. */
  private sameStarts(other: TimeArrayTimeZoneRule): boolean {
    if (
      this.fTimeRuleType !== other.fTimeRuleType ||
      this.fStartTimes.length !== other.fStartTimes.length
    )
      return false;
    for (let i = 0; i < this.fStartTimes.length; ++i)
      if (this.fStartTimes[i] !== other.fStartTimes[i]) return false;
    return true;
  }
  /** Original stored time type. @returns Rule type. */
  getTimeType(): TimeRuleType {
    return this.fTimeRuleType;
  }
  /** Original bounds check leaves failed output untouched. @param index - Native index. @param result - Unconverted start output. @returns Found. */
  getStartTimeAt(index: number, result: [number]): boolean {
    index |= 0;
    if (index >= this.fStartTimes.length || index < 0) return false;
    result[0] = this.fStartTimes[index] as number;
    return true;
  }
  /** Original start count includes duplicate times. @returns Count. */
  countStartTimes(): number {
    return this.fStartTimes.length;
  }
  /** Original empty check and first conversion. @param raw - Previous offset. @param dst - Previous savings. @param result - UTC output. @returns Found. */
  getFirstStart(raw: number, dst: number, result: [number]): boolean {
    if (this.fStartTimes.length <= 0) return false;
    result[0] = this.getUTC(this.fStartTimes[0] as number, raw, dst);
    return true;
  }
  /** Original empty check and final conversion. @param raw - Previous offset. @param dst - Previous savings. @param result - UTC output. @returns Found. */
  getFinalStart(raw: number, dst: number, result: [number]): boolean {
    if (this.fStartTimes.length <= 0) return false;
    result[0] = this.getUTC(this.fStartTimes[this.fStartTimes.length - 1] as number, raw, dst);
    return true;
  }
  /** Original backward traversal writes every qualifying candidate. @param base - UTC base. @param raw - Previous offset. @param dst - Previous savings. @param inclusive - Include base. @param result - UTC output. @returns Found. */
  getNextStart(
    base: number,
    raw: number,
    dst: number,
    inclusive: boolean,
    result: [number],
  ): boolean {
    let i = this.fStartTimes.length - 1;
    for (; i >= 0; --i) {
      const time = this.getUTC(this.fStartTimes[i] as number, raw, dst);
      if (time < base || (!inclusive && time === base)) break;
      result[0] = time;
    }
    return i !== this.fStartTimes.length - 1;
  }
  /** Original backward traversal returns the first preceding candidate. @param base - UTC base. @param raw - Previous offset. @param dst - Previous savings. @param inclusive - Include base. @param result - UTC output. @returns Found. */
  getPreviousStart(
    base: number,
    raw: number,
    dst: number,
    inclusive: boolean,
    result: [number],
  ): boolean {
    for (let i = this.fStartTimes.length - 1; i >= 0; --i) {
      const time = this.getUTC(this.fStartTimes[i] as number, raw, dst);
      if (time < base || (inclusive && time === base)) {
        result[0] = time;
        return true;
      }
    }
    return false;
  }
  /** Original ordered subtraction, including unknown enum values. @param time - Stored start. @param raw - Previous offset. @param dst - Previous savings. @returns UTC time. */
  private getUTC(time: number, raw: number, dst: number): number {
    if (this.fTimeRuleType !== TimeRuleType.UTC_TIME) time -= raw | 0;
    if (this.fTimeRuleType === TimeRuleType.WALL_TIME) time -= dst | 0;
    return time;
  }
}
/** Original comparator deliberately uses relational/equality comparisons rather than subtraction. @param left - Start time. @param right - Start time. @returns Native ordering result. */
function compareDates(left: number, right: number): number {
  return left < right ? -1 : left === right ? 0 : 1;
}

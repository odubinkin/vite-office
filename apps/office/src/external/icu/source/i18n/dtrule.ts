/** @fileoverview ICU78.3 DateTimeRule value constructors, copying and queries from dtrule.cpp. */
/** Original date rule kinds. */
export enum DateRuleType {
  DOM = 0,
  DOW,
  DOW_GEQ_DOM,
  DOW_LEQ_DOM,
}
/** Original time rule kinds. */
export enum TimeRuleType {
  WALL_TIME = 0,
  STANDARD_TIME,
  UTC_TIME,
}
/** Borrowed const native value, excluding assignment. */
export type DateTimeRuleConstReference = Readonly<Omit<DateTimeRule, "assign">>;

/** Original scalar rule owner; construction does not validate rule fields. */
export class DateTimeRule {
  static readonly DOM = DateRuleType.DOM;
  static readonly DOW = DateRuleType.DOW;
  static readonly DOW_GEQ_DOM = DateRuleType.DOW_GEQ_DOM;
  static readonly DOW_LEQ_DOM = DateRuleType.DOW_LEQ_DOM;
  static readonly WALL_TIME = TimeRuleType.WALL_TIME;
  static readonly STANDARD_TIME = TimeRuleType.STANDARD_TIME;
  static readonly UTC_TIME = TimeRuleType.UTC_TIME;
  private fMonth!: number;
  private fDayOfMonth!: number;
  private fDayOfWeek!: number;
  private fWeekInMonth!: number;
  private fMillisInDay!: number;
  private fDateRuleType!: DateRuleType;
  private fTimeRuleType!: TimeRuleType;
  /** Original copy constructor. @param source - Copied rule. @returns Constructed value. */
  constructor(source: DateTimeRuleConstReference);
  /** Original DOM constructor. @param month - Month. @param day - Day. @param millis - Milliseconds. @param time - Time mode. @returns Constructed value. */
  constructor(month: number, day: number, millis: number, time: TimeRuleType);
  /** Original weekday-in-month constructor. @param month - Month. @param week - Week ordinal. @param weekday - Weekday. @param millis - Milliseconds. @param time - Time mode. @returns Constructed value. */
  constructor(month: number, week: number, weekday: number, millis: number, time: TimeRuleType);
  /** Original on/after/on/before constructor. @param month - Month. @param day - Day threshold. @param weekday - Weekday. @param after - On/after flag. @param millis - Milliseconds. @param time - Time mode. @returns Constructed value. */
  constructor(
    month: number,
    day: number,
    weekday: number,
    after: boolean,
    millis: number,
    time: TimeRuleType,
  );
  /** Original overloads selected by argument count. @param source - Rule or month. @param args - Remaining native scalar parameters. @returns Constructed value. */
  constructor(source: DateTimeRuleConstReference | number, ...args: (number | boolean)[]) {
    if (typeof source !== "number") {
      this.assign(source);
      return;
    }
    this.fMonth = source | 0;
    if (args.length === 3) {
      this.fDayOfMonth = (args[0] as number) | 0;
      this.fDayOfWeek = 0;
      this.fWeekInMonth = 0;
      this.fMillisInDay = (args[1] as number) | 0;
      this.fDateRuleType = DateRuleType.DOM;
      this.fTimeRuleType = (args[2] as number) | 0;
    } else if (args.length === 4) {
      this.fDayOfMonth = 0;
      this.fWeekInMonth = (args[0] as number) | 0;
      this.fDayOfWeek = (args[1] as number) | 0;
      this.fMillisInDay = (args[2] as number) | 0;
      this.fDateRuleType = DateRuleType.DOW;
      this.fTimeRuleType = (args[3] as number) | 0;
    } else {
      this.fDayOfMonth = (args[0] as number) | 0;
      this.fDayOfWeek = (args[1] as number) | 0;
      this.fWeekInMonth = 0;
      this.fMillisInDay = (args[3] as number) | 0;
      this.fDateRuleType = args[2] ? DateRuleType.DOW_GEQ_DOM : DateRuleType.DOW_LEQ_DOM;
      this.fTimeRuleType = (args[4] as number) | 0;
    }
  }
  /** Original value assignment. @param source - Copied const value. @returns This owner. */
  assign(source: DateTimeRuleConstReference): this {
    if (this !== source) {
      const rule = source as DateTimeRule;
      this.fMonth = rule.fMonth;
      this.fDayOfMonth = rule.fDayOfMonth;
      this.fDayOfWeek = rule.fDayOfWeek;
      this.fWeekInMonth = rule.fWeekInMonth;
      this.fMillisInDay = rule.fMillisInDay;
      this.fDateRuleType = rule.fDateRuleType;
      this.fTimeRuleType = rule.fTimeRuleType;
    }
    return this;
  }
  /** Original independent clone. @returns Value owner. */
  clone(): DateTimeRule {
    return new DateTimeRule(this);
  }
  /** Original dynamic-type and all-field equality. @param other - Compared rule. @returns Equality. */
  equals(other: DateTimeRuleConstReference): boolean {
    const that = other as DateTimeRule;
    return (
      this === that ||
      (this.constructor === that.constructor &&
        this.fMonth === that.fMonth &&
        this.fDayOfMonth === that.fDayOfMonth &&
        this.fDayOfWeek === that.fDayOfWeek &&
        this.fWeekInMonth === that.fWeekInMonth &&
        this.fMillisInDay === that.fMillisInDay &&
        this.fDateRuleType === that.fDateRuleType &&
        this.fTimeRuleType === that.fTimeRuleType)
    );
  }
  /** Source scalar query. @returns Date rule kind. */
  getDateRuleType(): DateRuleType {
    return this.fDateRuleType;
  }
  /** Source scalar query. @returns Time rule kind. */
  getTimeRuleType(): TimeRuleType {
    return this.fTimeRuleType;
  }
  /** Source scalar query. @returns Month. */
  getRuleMonth(): number {
    return this.fMonth;
  }
  /** Source scalar query. @returns Day of month. */
  getRuleDayOfMonth(): number {
    return this.fDayOfMonth;
  }
  /** Source scalar query. @returns Weekday. */
  getRuleDayOfWeek(): number {
    return this.fDayOfWeek;
  }
  /** Source scalar query. @returns Week ordinal. */
  getRuleWeekInMonth(): number {
    return this.fWeekInMonth;
  }
  /** Source scalar query. @returns Milliseconds. */
  getRuleMillisInDay(): number {
    return this.fMillisInDay;
  }
}

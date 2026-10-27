/** @fileoverview ICU78.3 SimpleTimeZone scalar constructors/copy, rule encoding and offset/local-time algorithms. Lazy transition rules/queries use their original owners. Deprecated calendar-construction helpers remain unported. */
import { UnicodeString } from "../common/unistr";
import { UErrorCode, U_FAILURE, U_MILLIS_PER_DAY, type UDate } from "../common/unicode/utypes";
import { BasicTimeZone } from "./basictz";
import { Grego } from "./gregoimp";
import { TimeZone } from "./timezone";
import type { UTimeZoneLocalOption } from "./unicode/ucal";
import {
  AnnualTimeZoneRule,
  InitialTimeZoneRule,
  type InitialTimeZoneRuleConstReference,
  type TimeZoneRuleConstReference,
} from "./tzrule";
import { TimeZoneTransition } from "./tztrans";
import {
  initTransitionRules,
  getNextTransition,
  getPreviousTransition,
  getTimeZoneRules,
} from "./simpletz.transitions";

/** Original nested TimeMode values, exposed separately for the TypeScript numeric overload boundary. */
export enum TimeMode {
  WALL_TIME = 0,
  STANDARD_TIME = 1,
  UTC_TIME = 2,
}
/** Original internal decoded recurring-rule modes. */
enum EMode {
  DOM_MODE = 1,
  DOW_IN_MONTH_MODE,
  DOW_GE_DOM_MODE,
  DOW_LE_DOM_MODE,
}
const STATICMONTHLENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Original recurring-rule timezone owner. The original lazy transition objects are owned on this same instance. */
export class SimpleTimeZone extends BasicTimeZone {
  static readonly WALL_TIME = TimeMode.WALL_TIME;
  static readonly STANDARD_TIME = TimeMode.STANDARD_TIME;
  static readonly UTC_TIME = TimeMode.UTC_TIME;
  private startMonth!: number;
  private startDay!: number;
  private startDayOfWeek!: number;
  private startTime!: number;
  private startTimeMode!: number;
  private endTimeMode!: number;
  private endMonth!: number;
  private endDay!: number;
  private endDayOfWeek!: number;
  private endTime!: number;
  private startYear!: number;
  private rawOffset!: number;
  private useDaylight!: boolean;
  private startMode!: number;
  private endMode!: number;
  private dstSavings!: number;
  protected initialRule: InitialTimeZoneRule | null = null;
  protected firstTransition: TimeZoneTransition | null = null;
  protected stdRule: AnnualTimeZoneRule | null = null;
  protected dstRule: AnnualTimeZoneRule | null = null;
  private transitionRulesInitialized = false;

  /** Original copy constructor. @param source - Copied owner. @returns Constructed owner. */
  constructor(source: SimpleTimeZone);
  /** Original constant-offset constructor. @param raw - Raw milliseconds. @param id - Copied identity. @returns Constructed owner. */
  constructor(raw: number, id: UnicodeString);
  /** Original wall-rule constructor with one-hour savings. @param raw - Raw offset. @param id - Identity. @param sm - Start month. @param sd - Encoded start day. @param sw - Encoded start weekday. @param st - Start milliseconds. @param em - End month. @param ed - Encoded end day. @param ew - Encoded end weekday. @param et - End milliseconds. @param status - ICU status. @returns Constructed owner. */
  constructor(
    raw: number,
    id: UnicodeString,
    sm: number,
    sd: number,
    sw: number,
    st: number,
    em: number,
    ed: number,
    ew: number,
    et: number,
    status: [number],
  );
  /** Original wall-rule constructor with explicit savings. @param raw - Raw offset. @param id - Identity. @param sm - Start month. @param sd - Start day. @param sw - Start weekday. @param st - Start milliseconds. @param em - End month. @param ed - End day. @param ew - End weekday. @param et - End milliseconds. @param savings - DST milliseconds. @param status - ICU status. @returns Constructed owner. */
  constructor(
    raw: number,
    id: UnicodeString,
    sm: number,
    sd: number,
    sw: number,
    st: number,
    em: number,
    ed: number,
    ew: number,
    et: number,
    savings: number,
    status: [number],
  );
  /** Original explicit time-mode rule constructor. @param raw - Raw offset. @param id - Identity. @param sm - Start month. @param sd - Start day. @param sw - Start weekday. @param st - Start milliseconds. @param stm - Start time mode. @param em - End month. @param ed - End day. @param ew - End weekday. @param et - End milliseconds. @param etm - End time mode. @param savings - DST milliseconds. @param status - ICU status. @returns Constructed owner. */
  constructor(
    raw: number,
    id: UnicodeString,
    sm: number,
    sd: number,
    sw: number,
    st: number,
    stm: TimeMode,
    em: number,
    ed: number,
    ew: number,
    et: number,
    etm: TimeMode,
    savings: number,
    status: [number],
  );
  /** Original constructor families dispatched by their distinct native argument counts. @param first - Raw offset or copied owner. @param id - Identity. @param args - Native numeric rule arguments and status. @returns Constructed owner. */
  constructor(first: number | SimpleTimeZone, id?: UnicodeString, ...args: (number | [number])[]) {
    super(first instanceof SimpleTimeZone ? first : id);
    if (first instanceof SimpleTimeZone) {
      this.assign(first);
      return;
    }
    if (args.length === 0) {
      this.startMonth =
        this.startDay =
        this.startDayOfWeek =
        this.startTime =
        this.endMonth =
        this.endDay =
        this.endDayOfWeek =
        this.endTime =
        this.startYear =
          0;
      this.startTimeMode = this.endTimeMode = TimeMode.WALL_TIME;
      this.rawOffset = first | 0;
      this.useDaylight = false;
      this.startMode = this.endMode = EMode.DOM_MODE;
      this.dstSavings = 3600000;
      this.clearTransitionRules();
      return;
    }
    this.clearTransitionRules();
    if (args.length === 9 || args.length === 10) {
      this.construct(
        first,
        args[0] as number,
        args[1] as number,
        args[2] as number,
        args[3] as number,
        TimeMode.WALL_TIME,
        args[4] as number,
        args[5] as number,
        args[6] as number,
        args[7] as number,
        TimeMode.WALL_TIME,
        args.length === 9 ? 3600000 : (args[8] as number),
        args[args.length - 1] as [number],
      );
    } else
      this.construct(
        first,
        args[0] as number,
        args[1] as number,
        args[2] as number,
        args[3] as number,
        args[4] as number,
        args[5] as number,
        args[6] as number,
        args[7] as number,
        args[8] as number,
        args[9] as number,
        args[10] as number,
        args[11] as [number],
      );
  }
  /** Original common rule initialization and zero-savings check after decoding. @param raw - Offset. @param sm - Start month. @param sd - Start day. @param sw - Start weekday. @param st - Start milliseconds. @param stm - Start mode. @param em - End month. @param ed - End day. @param ew - End weekday. @param et - End milliseconds. @param etm - End mode. @param savings - DST milliseconds. @param status - ICU status. @returns Nothing. */
  private construct(
    raw: number,
    sm: number,
    sd: number,
    sw: number,
    st: number,
    stm: number,
    em: number,
    ed: number,
    ew: number,
    et: number,
    etm: number,
    savings: number,
    status: [number],
  ): void {
    this.rawOffset = raw | 0;
    this.startMonth = (sm << 24) >> 24;
    this.startDay = (sd << 24) >> 24;
    this.startDayOfWeek = (sw << 24) >> 24;
    this.startTime = st | 0;
    this.startTimeMode = stm | 0;
    this.endMonth = (em << 24) >> 24;
    this.endDay = (ed << 24) >> 24;
    this.endDayOfWeek = (ew << 24) >> 24;
    this.endTime = et | 0;
    this.endTimeMode = etm | 0;
    this.dstSavings = savings | 0;
    this.startYear = 0;
    this.startMode = this.endMode = EMode.DOM_MODE;
    this.decodeStartRule(status);
    this.decodeEndRule(status);
    if ((savings | 0) === 0) status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
  }
  /** Original scalar/base copying. Native lazy transition objects are not exposed by this slice. @param source - Copied owner. @returns This owner. */
  assign(source: SimpleTimeZone): this {
    if (this !== source) {
      this.assignBase(source);
      for (const key of [
        "rawOffset",
        "startMonth",
        "startDay",
        "startDayOfWeek",
        "startTime",
        "startTimeMode",
        "startMode",
        "endMonth",
        "endDay",
        "endDayOfWeek",
        "endTime",
        "endTimeMode",
        "endMode",
        "startYear",
        "dstSavings",
      ] as const)
        this[key] = source[key];
      this.useDaylight = source.useDaylight;
      this.clearTransitionRules();
    }
    return this;
  }
  /** Original independent polymorphic clone. @returns Zone owner. */
  override clone(): SimpleTimeZone {
    return new SimpleTimeZone(this);
  }
  /** Original virtual equality includes dynamic type, ID and numeric rules. @param other - Compared owner. @returns Equality. */
  override equals(other: TimeZone): boolean {
    return (
      this === other ||
      (this.constructor === other.constructor && super.equals(other) && this.hasSameRules(other))
    );
  }
  /** Original same-rules comparison ignores dormant rule fields when DST is disabled. @param other - Compared owner. @returns Same numeric rules. */
  hasSameRules(other: TimeZone): boolean {
    if (this === other) return true;
    if (this.constructor !== other.constructor) return false;
    const that = other as SimpleTimeZone;
    if (this.rawOffset !== that.rawOffset || this.useDaylight !== that.useDaylight) return false;
    if (!this.useDaylight) return true;
    for (const key of [
      "dstSavings",
      "startMode",
      "startMonth",
      "startDay",
      "startDayOfWeek",
      "startTime",
      "startTimeMode",
      "endMode",
      "endMonth",
      "endDay",
      "endDayOfWeek",
      "endTime",
      "endTimeMode",
      "startYear",
    ] as const)
      if (this[key] !== that[key]) return false;
    return true;
  }
  /** Original raw-offset query. @returns Milliseconds. */
  getRawOffset(): number {
    return this.rawOffset;
  }
  /** Original raw-offset update. @param raw - Signed32 milliseconds. @returns Nothing. */
  setRawOffset(raw: number): void {
    this.rawOffset = raw | 0;
    this.transitionRulesInitialized = false;
  }
  /** Original savings query returns configured savings even with DST disabled. @returns Milliseconds. */
  override getDSTSavings(): number {
    return this.dstSavings;
  }
  /** Original setter rejects zero but otherwise writes even with a failed incoming status. @param savings - Signed32 milliseconds. @param status - ICU status. @returns Nothing. */
  setDSTSavings(savings: number, status: [number]): void {
    savings |= 0;
    if (savings === 0) status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    else this.dstSavings = savings;
    this.transitionRulesInitialized = false;
  }
  /** Original active-rule flag. @returns DST configured. */
  useDaylightTime(): boolean {
    return this.useDaylight;
  }
  /** Original starting-year setter. @param year - Signed32 year. @returns Nothing. */
  setStartYear(year: number): void {
    this.startYear = year | 0;
    this.transitionRulesInitialized = false;
  }

  /** Original encoded start rule, with the inline WALL_TIME overload. @param month - Month. @param day - Encoded day. @param weekday - Encoded weekday. @param time - Milliseconds. @param modeOrStatus - Time mode or status for WALL_TIME. @param suppliedStatus - Status with explicit mode. @returns Nothing. */
  setStartRule(
    month: number,
    day: number,
    weekday: number,
    time: number,
    modeOrStatus: TimeMode | [number],
    suppliedStatus?: [number],
  ): void {
    this.startMonth = (month << 24) >> 24;
    this.startDay = (day << 24) >> 24;
    this.startDayOfWeek = (weekday << 24) >> 24;
    this.startTime = time | 0;
    this.startTimeMode = Array.isArray(modeOrStatus) ? TimeMode.WALL_TIME : modeOrStatus | 0;
    this.decodeStartRule(Array.isArray(modeOrStatus) ? modeOrStatus : (suppliedStatus as [number]));
    this.transitionRulesInitialized = false;
  }
  /** Original day-of-month start overload, explicitly named because enum/int overloads erase in TS. @param month - Month. @param day - Day. @param time - Milliseconds. @param modeOrStatus - Mode or status. @param suppliedStatus - Explicit-mode status. @returns Nothing. */
  setStartRuleDOM(
    month: number,
    day: number,
    time: number,
    modeOrStatus: TimeMode | [number],
    suppliedStatus?: [number],
  ): void {
    this.setStartRule(month, day, 0, time, modeOrStatus, suppliedStatus);
  }
  /** Original relative-weekday start overload with explicit mode. @param month - Month. @param day - Day threshold. @param weekday - Weekday. @param time - Milliseconds. @param mode - Time mode. @param after - On/after versus on/before. @param status - ICU status. @returns Nothing. */
  setStartRuleRelative(
    month: number,
    day: number,
    weekday: number,
    time: number,
    mode: TimeMode,
    after: boolean,
    status: [number],
  ): void {
    this.setStartRule(month, after ? day : -day, -weekday, time, mode, status);
  }
  /** Original encoded end rule, with the inline WALL_TIME overload. @param month - Month. @param day - Encoded day. @param weekday - Encoded weekday. @param time - Milliseconds. @param modeOrStatus - Time mode or status. @param suppliedStatus - Explicit-mode status. @returns Nothing. */
  setEndRule(
    month: number,
    day: number,
    weekday: number,
    time: number,
    modeOrStatus: TimeMode | [number],
    suppliedStatus?: [number],
  ): void {
    this.endMonth = (month << 24) >> 24;
    this.endDay = (day << 24) >> 24;
    this.endDayOfWeek = (weekday << 24) >> 24;
    this.endTime = time | 0;
    this.endTimeMode = Array.isArray(modeOrStatus) ? TimeMode.WALL_TIME : modeOrStatus | 0;
    this.decodeEndRule(Array.isArray(modeOrStatus) ? modeOrStatus : (suppliedStatus as [number]));
    this.transitionRulesInitialized = false;
  }
  /** Original day-of-month end overload. @param month - Month. @param day - Day. @param time - Milliseconds. @param modeOrStatus - Mode or status. @param suppliedStatus - Explicit-mode status. @returns Nothing. */
  setEndRuleDOM(
    month: number,
    day: number,
    time: number,
    modeOrStatus: TimeMode | [number],
    suppliedStatus?: [number],
  ): void {
    this.setEndRule(month, day, 0, time, modeOrStatus, suppliedStatus);
  }
  /** Original relative-weekday end overload. @param month - Month. @param day - Day threshold. @param weekday - Weekday. @param time - Milliseconds. @param mode - Time mode. @param after - On/after versus on/before. @param status - ICU status. @returns Nothing. */
  setEndRuleRelative(
    month: number,
    day: number,
    weekday: number,
    time: number,
    mode: TimeMode,
    after: boolean,
    status: [number],
  ): void {
    this.setEndRule(month, after ? day : -day, -weekday, time, mode, status);
  }

  /** Native seven-argument overload with its distinct invalid-month zero return. @param era - Era. @param year - Year. @param month - Month. @param day - Day. @param weekday - Weekday. @param millis - Standard milliseconds. @param status - ICU status. @returns Total offset. */
  getOffsetForFieldsWithoutMonthLength(
    era: number,
    year: number,
    month: number,
    day: number,
    weekday: number,
    millis: number,
    status: [number],
  ): number {
    month |= 0;
    if (month < 0 || month > 11) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    return this.getOffsetForFields(
      era,
      year,
      month,
      day,
      weekday,
      millis,
      Grego.monthLength(year, month),
      status,
    );
  }
  /** Native eight-argument overload deliberately ignores supplied month length and recomputes it. @param era - Era. @param year - Year. @param month - Month. @param day - Day. @param weekday - Weekday. @param millis - Standard milliseconds. @param monthLength - Ignored compatibility value. @param status - ICU status. @returns Total offset. */
  getOffsetForFields(
    era: number,
    year: number,
    month: number,
    day: number,
    weekday: number,
    millis: number,
    monthLength: number,
    status: [number],
  ): number {
    month |= 0;
    void monthLength;
    if (month < 0 || month > 11) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return -1;
    }
    return this.getOffsetForFieldsWithPreviousMonthLength(
      era,
      year,
      month,
      day,
      weekday,
      millis,
      Grego.monthLength(year, month),
      Grego.previousMonthLength(year, month),
      status,
    );
  }
  /** Original nine-argument validation and hemisphere/rule comparison. @param era - Era. @param year - Year. @param month - Month. @param day - Day. @param weekday - Weekday. @param millis - Standard milliseconds. @param monthLength - Current length. @param previousLength - Previous length. @param status - ICU status. @returns Total offset. */
  getOffsetForFieldsWithPreviousMonthLength(
    era: number,
    year: number,
    month: number,
    day: number,
    weekday: number,
    millis: number,
    monthLength: number,
    previousLength: number,
    status: [number],
  ): number {
    era &= 255;
    year |= 0;
    month |= 0;
    day |= 0;
    weekday &= 255;
    millis |= 0;
    monthLength |= 0;
    previousLength |= 0;
    if (U_FAILURE(status[0])) return 0;
    if (
      (era !== 0 && era !== 1) ||
      month < 0 ||
      month > 11 ||
      day < 1 ||
      day > monthLength ||
      weekday < 1 ||
      weekday > 7 ||
      millis < 0 ||
      millis >= U_MILLIS_PER_DAY ||
      monthLength < 28 ||
      monthLength > 31 ||
      previousLength < 28 ||
      previousLength > 31
    ) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return -1;
    }
    let result = this.rawOffset;
    if (!this.useDaylight || year < this.startYear || era !== 1) return result;
    const southern = this.startMonth > this.endMonth,
      start = this.compareToRule(
        month,
        monthLength,
        previousLength,
        day,
        weekday,
        millis,
        this.startTimeMode === TimeMode.UTC_TIME ? -this.rawOffset : 0,
        this.startMode,
        this.startMonth,
        this.startDayOfWeek,
        this.startDay,
        this.startTime,
      );
    let end = 0;
    if (southern !== start >= 0)
      end = this.compareToRule(
        month,
        monthLength,
        previousLength,
        day,
        weekday,
        millis,
        this.endTimeMode === TimeMode.WALL_TIME
          ? this.dstSavings
          : this.endTimeMode === TimeMode.UTC_TIME
            ? -this.rawOffset
            : 0,
        this.endMode,
        this.endMonth,
        this.endDayOfWeek,
        this.endDay,
        this.endTime,
      );
    if ((!southern && start >= 0 && end < 0) || (southern && (start >= 0 || end < 0)))
      result += this.dstSavings;
    return result | 0;
  }
  /** Original gap/overlap option handling, including nonpositive savings branch and status checks. @param date - Local milliseconds. @param nonExisting - Gap option. @param duplicated - Overlap option. @param raw - Raw output. @param savings - DST output. @param status - ICU status. @returns Nothing. */
  override getOffsetFromLocal(
    date: UDate,
    nonExisting: UTimeZoneLocalOption,
    duplicated: UTimeZoneLocalOption,
    raw: [number],
    savings: [number],
    status: [number],
  ): void {
    if (U_FAILURE(status[0])) return;
    raw[0] = this.getRawOffset();
    const year: [number] = [0],
      month: [number] = [0],
      dom: [number] = [0],
      dow: [number] = [0],
      millis: [number] = [0];
    Grego.timeToFields(date, year, month, dom, dow, millis, status);
    if (U_FAILURE(status[0])) return;
    savings[0] =
      (this.getOffsetForFields(
        1,
        year[0],
        month[0],
        dom[0],
        dow[0],
        millis[0],
        Grego.monthLength(year[0], month[0]),
        status,
      ) -
        raw[0]) |
      0;
    if (U_FAILURE(status[0])) return;
    let recalc = false;
    if (savings[0] > 0) {
      if (
        (nonExisting & BasicTimeZone.kStdDstMask) === BasicTimeZone.kStandard ||
        ((nonExisting & BasicTimeZone.kStdDstMask) !== BasicTimeZone.kDaylight &&
          (nonExisting & BasicTimeZone.kFormerLatterMask) !== BasicTimeZone.kLatter)
      ) {
        date -= this.getDSTSavings();
        recalc = true;
      }
    } else if (
      (duplicated & BasicTimeZone.kStdDstMask) === BasicTimeZone.kDaylight ||
      ((duplicated & BasicTimeZone.kStdDstMask) !== BasicTimeZone.kStandard &&
        (duplicated & BasicTimeZone.kFormerLatterMask) === BasicTimeZone.kFormer)
    ) {
      date -= this.getDSTSavings();
      recalc = true;
    }
    if (recalc) {
      Grego.timeToFields(date, year, month, dom, dow, millis, status);
      if (U_FAILURE(status[0])) return;
      savings[0] =
        (this.getOffsetForFields(
          1,
          year[0],
          month[0],
          dom[0],
          dow[0],
          millis[0],
          Grego.monthLength(year[0], month[0]),
          status,
        ) -
          raw[0]) |
        0;
    }
  }
  /** Original standard/wall/UTC day carry and encoded-rule comparison. @param month - Month. @param length - Month length. @param prev - Previous length. @param dom - Day. @param dow - Weekday. @param millis - Milliseconds. @param delta - Time-mode adjustment. @param mode - Rule mode. @param ruleMonth - Rule month. @param ruleWeekday - Rule weekday. @param ruleDay - Rule day. @param ruleMillis - Rule milliseconds. @returns Comparison sign. */
  private compareToRule(
    month: number,
    length: number,
    prev: number,
    dom: number,
    dow: number,
    millis: number,
    delta: number,
    mode: number,
    ruleMonth: number,
    ruleWeekday: number,
    ruleDay: number,
    ruleMillis: number,
  ): number {
    millis = (millis + delta) | 0;
    while (millis >= U_MILLIS_PER_DAY) {
      millis -= U_MILLIS_PER_DAY;
      dom++;
      dow = 1 + (dow % 7);
      if (dom > length) {
        dom = 1;
        month++;
      }
    }
    while (millis < 0) {
      millis += U_MILLIS_PER_DAY;
      dom--;
      dow = 1 + ((dow + 5) % 7);
      if (dom < 1) {
        dom = prev;
        month--;
      }
    }
    if (month < ruleMonth) return -1;
    if (month > ruleMonth) return 1;
    let ruleDOM = 0;
    if (ruleDay > length) ruleDay = length;
    switch (mode) {
      case EMode.DOM_MODE:
        ruleDOM = ruleDay;
        break;
      case EMode.DOW_IN_MONTH_MODE:
        ruleDOM =
          ruleDay > 0
            ? 1 + (ruleDay - 1) * 7 + ((7 + ruleWeekday - (dow - dom + 1)) % 7)
            : length + (ruleDay + 1) * 7 - ((7 + (dow + length - dom) - ruleWeekday) % 7);
        break;
      case EMode.DOW_GE_DOM_MODE:
        ruleDOM = ruleDay + ((49 + ruleWeekday - ruleDay - dow + dom) % 7);
        break;
      case EMode.DOW_LE_DOM_MODE:
        ruleDOM = ruleDay - ((49 - ruleWeekday + ruleDay + dow - dom) % 7);
        break;
    }
    if (dom < ruleDOM) return -1;
    if (dom > ruleDOM) return 1;
    return millis < ruleMillis ? -1 : millis > ruleMillis ? 1 : 0;
  }
  /** Original in-place start decoding, including flag/default writes before validation failures. @param status - ICU status. @returns Nothing. */
  private decodeStartRule(status: [number]): void {
    if (U_FAILURE(status[0])) return;
    this.useDaylight = this.startDay !== 0 && this.endDay !== 0;
    if (this.useDaylight && this.dstSavings === 0) this.dstSavings = 3600000;
    if (this.startDay === 0) return;
    if (this.startMonth < 0 || this.startMonth > 11) {
      status[0] = 1;
      return;
    }
    if (
      this.startTime < 0 ||
      this.startTime > U_MILLIS_PER_DAY ||
      this.startTimeMode < 0 ||
      this.startTimeMode > 2
    ) {
      status[0] = 1;
      return;
    }
    if (this.startDayOfWeek === 0) this.startMode = EMode.DOM_MODE;
    else {
      if (this.startDayOfWeek > 0) this.startMode = EMode.DOW_IN_MONTH_MODE;
      else {
        this.startDayOfWeek = (-this.startDayOfWeek << 24) >> 24;
        if (this.startDay > 0) this.startMode = EMode.DOW_GE_DOM_MODE;
        else {
          this.startDay = (-this.startDay << 24) >> 24;
          this.startMode = EMode.DOW_LE_DOM_MODE;
        }
      }
      if (this.startDayOfWeek > 7) {
        status[0] = 1;
        return;
      }
    }
    if (this.startMode === EMode.DOW_IN_MONTH_MODE) {
      if (this.startDay < -5 || this.startDay > 5) status[0] = 1;
    } else if (this.startDay < 1 || this.startDay > (STATICMONTHLENGTH[this.startMonth] as number))
      status[0] = 1;
  }
  /** Original end decoding retains its separate source mutation/validation order. @param status - ICU status. @returns Nothing. */
  private decodeEndRule(status: [number]): void {
    if (U_FAILURE(status[0])) return;
    this.useDaylight = this.startDay !== 0 && this.endDay !== 0;
    if (this.useDaylight && this.dstSavings === 0) this.dstSavings = 3600000;
    if (this.endDay === 0) return;
    if (this.endMonth < 0 || this.endMonth > 11) {
      status[0] = 1;
      return;
    }
    if (
      this.endTime < 0 ||
      this.endTime > U_MILLIS_PER_DAY ||
      this.endTimeMode < 0 ||
      this.endTimeMode > 2
    ) {
      status[0] = 1;
      return;
    }
    if (this.endDayOfWeek === 0) this.endMode = EMode.DOM_MODE;
    else {
      if (this.endDayOfWeek > 0) this.endMode = EMode.DOW_IN_MONTH_MODE;
      else {
        this.endDayOfWeek = (-this.endDayOfWeek << 24) >> 24;
        if (this.endDay > 0) this.endMode = EMode.DOW_GE_DOM_MODE;
        else {
          this.endDay = (-this.endDay << 24) >> 24;
          this.endMode = EMode.DOW_LE_DOM_MODE;
        }
      }
      if (this.endDayOfWeek > 7) {
        status[0] = 1;
        return;
      }
    }
    if (this.endMode === EMode.DOW_IN_MONTH_MODE) {
      if (this.endDay < -5 || this.endDay > 5) status[0] = 1;
    } else if (this.endDay < 1 || this.endDay > (STATICMONTHLENGTH[this.endMonth] as number))
      status[0] = 1;
  }
  /** Original cache pointer reset, without native delete operations. @returns Nothing. */
  private clearTransitionRules(): void {
    this.initialRule = null;
    this.firstTransition = null;
    this.stdRule = null;
    this.dstRule = null;
    this.transitionRulesInitialized = false;
  }
  /** Original owned cache disposal/reset; GC replaces native deletion, without pointer/ABI guarantees. @returns Nothing. */
  protected deleteTransitionRules(): void {
    this.clearTransitionRules();
  }
  /** Original serial lazy initialization; source mutex/parallel native calls are not exposed by this synchronous browser owner. @param status - ICU status. @returns Nothing. */
  protected checkTransitionRules(status: [number]): void {
    if (!U_FAILURE(status[0]) && !this.transitionRulesInitialized)
      initTransitionRules.call(this, status);
  }
  /** Original next transition. @param base - UTC base. @param inclusive - Include base. @param result - Output owner. @returns Found. */
  getNextTransition(base: number, inclusive: boolean, result: TimeZoneTransition): boolean {
    return getNextTransition.call(this, base, inclusive, result);
  }
  /** Original previous transition. @param base - UTC base. @param inclusive - Include base. @param result - Output owner. @returns Found. */
  getPreviousTransition(base: number, inclusive: boolean, result: TimeZoneTransition): boolean {
    return getPreviousTransition.call(this, base, inclusive, result);
  }
  /** Original count ignores incoming status. @param status - Ignored status. @returns Rule count. */
  countTransitionRules(status: [number]): number {
    void status;
    return this.useDaylight ? 2 : 0;
  }
  /** Original borrowed-rule query. @param initial - Initial output. @param rules - Rule slots. @param count - Capacity/input and count/output. @param status - ICU status. @returns Nothing. */
  getTimeZoneRules(
    initial: [InitialTimeZoneRuleConstReference | null],
    rules: (TimeZoneRuleConstReference | null)[],
    count: [number],
    status: [number],
  ): void {
    getTimeZoneRules.call(this, initial, rules, count, status);
  }
}

/** @fileoverview ICU78.3 Calendar construction, field/stamp state, locale/zone ownership, week/weekend contracts and original UTC completion. Service/cache factories are separate pending responsibilities. */
import { Locale, type LocaleConstReference } from "../common/locid";
import { LocaleBased } from "../common/locbased";
import { CalendarZoneReference, assignCalendar } from "./calendar.ctor";
import { getDayOfWeekType, getWeekendTransition, isWeekend } from "./calendar.weekend";
import { setWeekData } from "./calendar.locale";
import { UErrorCode, U_FAILURE, type UDate } from "../common/unicode/utypes";
import {
  computeFields,
  computeMillisInDay,
  validateFields,
  validateField,
  computeTime,
  computeZoneOffset,
  getImmediatePreviousZoneTransition,
} from "./calendar.time";
import type { TimeZone, TimeZoneConstReference } from "./timezone";
import { createDefault } from "./timezone.default";
import type { BasicTimeZone } from "./basictz";
import { SimpleTimeZone } from "./simpletz";
import { OlsonTimeZone } from "./olsontz";
import { uprv_add32_overflow, uprv_mul32_overflow, uprv_getUTCtime } from "../common/putil";
import { Grego, kEpochStartAsJulianDay, MIN_MILLIS, MAX_MILLIS } from "./gregoimp";
import {
  UCalendarDateFields as F,
  UCalendarDaysOfWeek,
  UCalendarWeekdayType as DayType,
  UCalendarWallTimeOption as W,
} from "./unicode/ucal";

/** Native sentinel-terminated groups, lines and field selectors. */
export type UFieldResolutionTable = readonly (readonly (readonly number[])[])[];
/** Source stamp remapping bit and line/group terminator. */
const kResolveRemap = 32,
  kResolveSTOP = -1,
  STAMP_MAX = 127;

/** Source Calendar internal limit numbering; distinct from UCalendarLimitType. */
export enum ELimitType {
  UCAL_LIMIT_MINIMUM,
  UCAL_LIMIT_GREATEST_MINIMUM,
  UCAL_LIMIT_LEAST_MAXIMUM,
  UCAL_LIMIT_MAXIMUM,
  UCAL_LIMIT_COUNT,
}
const kCalendarLimits: readonly (readonly number[])[] = [
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [1, 1, 7, 7],
  [-1, -1, -1, -1],
  [0, 0, 1, 1],
  [0, 0, 11, 11],
  [0, 0, 23, 23],
  [0, 0, 59, 59],
  [0, 0, 59, 59],
  [0, 0, 999, 999],
  [-86400000, -57600000, 43200000, 108000000],
  [-3600000, -3600000, 7200000, 7200000],
  [-1, -1, -1, -1],
  [1, 1, 7, 7],
  [-1, -1, -1, -1],
  [-0x7f000000, -0x7f000000, 0x7f000000, 0x7f000000],
  [0, 0, 86399999, 86399999],
  [0, 0, 1, 1],
  [0, 0, 11, 11],
];

/** Source constructor arguments; native adopting pointer and copying object overloads remain distinct. */
export type CalendarConstructionArgs =
  | [status: [number]]
  | [source: Calendar]
  | [zone: TimeZone | CalendarZoneReference | null, locale: LocaleConstReference, status: [number]];
/** Original abstract Calendar owner, including default/adopted-zone/copy initialization and locale metadata. */
export abstract class Calendar {
  protected static readonly kUnset = 0;
  protected static readonly kInternallySet = 1;
  protected static readonly kMinimumUserStamp = 2;
  protected readonly fFields = new Int32Array(F.UCAL_FIELD_COUNT);
  private readonly fStamp = new Int8Array(F.UCAL_FIELD_COUNT);
  private fNextStamp = Calendar.kMinimumUserStamp;
  private fIsTimeSet = false;
  private fAreFieldsSet = false;
  private fAreAllFieldsSet = false;
  private fAreFieldsVirtuallySet = false;
  private fLenient = true;
  private fTime = 0;
  private fRepeatedWallTime = W.UCAL_WALLTIME_LAST;
  private fSkippedWallTime = W.UCAL_WALLTIME_LAST;
  private fGregorianYear!: number;
  private fGregorianMonth!: number;
  private fGregorianDayOfMonth!: number;
  private fGregorianDayOfYear!: number;
  private fFirstDayOfWeek!: UCalendarDaysOfWeek;
  private fMinimalDaysInFirstWeek!: number;
  private fZone: TimeZone | null = null;
  private fWeekendOnset!: UCalendarDaysOfWeek;
  private fWeekendOnsetMillis!: number;
  private fWeekendCease!: UCalendarDaysOfWeek;
  private fWeekendCeaseMillis!: number;
  private readonly validLocale: Locale;
  private readonly actualLocale: Locale;
  /** Original default, adopted-zone and copy constructor paths. TimeZone const-reference construction is adapted explicitly by the concrete reference factory. @param args - Source overload arguments. @returns Calendar. */
  protected constructor(...args: CalendarConstructionArgs) {
    if (args.length === 1 && !Array.isArray(args[0])) {
      this.validLocale = new Locale();
      this.actualLocale = new Locale();
      Calendar.prototype.assign.call(this, args[0] as Calendar);
      return;
    }
    this.validLocale = new Locale(Locale.getRoot());
    this.actualLocale = new Locale(Locale.getRoot());
    if (args.length === 1) {
      const status = args[0] as [number];
      Calendar.prototype.clear.call(this);
      if (U_FAILURE(status[0])) return;
      this.fZone = createDefault();
      if (this.fZone === null) status[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
      setWeekData.call(this, Locale.getDefault(), null, status);
    } else {
      const [zone, locale, status] = args;
      if (zone instanceof CalendarZoneReference) {
        if (U_FAILURE(status[0])) return;
        Calendar.prototype.clear.call(this);
        this.fZone = zone.zone.clone();
        if (this.fZone === null) {
          status[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
          return;
        }
        setWeekData.call(this, locale, null, status);
        return;
      }
      // Original LocalPointer(adoptZone,status) reports null before the explicit argument check below.
      if (zone === null && !U_FAILURE(status[0])) status[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
      if (U_FAILURE(status[0])) return;
      if (zone === null) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
      Calendar.prototype.clear.call(this);
      this.fZone = zone;
      setWeekData.call(this, locale, null, status);
    }
  }
  /** Original base assignment copies field/cache state and clones the owned zone. @param source - Source owner. @returns This owner. */
  assign(source: Calendar): this {
    assignCalendar.call(this, source);
    return this;
  }
  /** Original polymorphic owner clone. @returns Independent owned calendar. */
  abstract clone(): Calendar;
  /** Original platform UTC clock, without host date-field arithmetic. @returns UTC milliseconds. */
  static getNow(): UDate {
    return uprv_getUTCtime();
  }

  /** Original locale week/weekend data load on the actual owner. @param locale - Desired locale. @param type - Calendar type/null. @param status - Status. @returns Nothing. */
  protected setWeekData(locale: LocaleConstReference, type: string | null, status: [number]): void {
    setWeekData.call(this, locale, type, status);
  }
  /** Original Calendar metadata returns a copied Locale value. @param type - ACTUAL0/VALID1. @param status - Status. @returns Locale value. */
  getLocale(type: number, status: [number]): Locale {
    return new Locale(LocaleBased.getLocale(this.validLocale, this.actualLocale, type, status));
  }
  /** Original Calendar borrowed metadata ID, including literal root. @param type - Enum. @param status - Status. @returns ID/root/null. */
  getLocaleID(type: number, status: [number]): string | null {
    return LocaleBased.getLocaleID(this.validLocale, this.actualLocale, type, status);
  }

  /** Source date precedence groups; the first satisfied group wins, then its newest complete line. */
  protected static readonly kDatePrecedence: UFieldResolutionTable = [
    [
      [F.UCAL_DAY_OF_MONTH, -1],
      [F.UCAL_WEEK_OF_YEAR, F.UCAL_DAY_OF_WEEK, -1],
      [F.UCAL_WEEK_OF_MONTH, F.UCAL_DAY_OF_WEEK, -1],
      [F.UCAL_DAY_OF_WEEK_IN_MONTH, F.UCAL_DAY_OF_WEEK, -1],
      [F.UCAL_WEEK_OF_YEAR, F.UCAL_DOW_LOCAL, -1],
      [F.UCAL_WEEK_OF_MONTH, F.UCAL_DOW_LOCAL, -1],
      [F.UCAL_DAY_OF_WEEK_IN_MONTH, F.UCAL_DOW_LOCAL, -1],
      [F.UCAL_DAY_OF_YEAR, -1],
      [kResolveRemap | F.UCAL_DAY_OF_MONTH, F.UCAL_YEAR, -1],
      [kResolveRemap | F.UCAL_WEEK_OF_YEAR, F.UCAL_YEAR_WOY, -1],
      [-1],
    ],
    [
      [F.UCAL_WEEK_OF_YEAR, -1],
      [F.UCAL_WEEK_OF_MONTH, -1],
      [F.UCAL_DAY_OF_WEEK_IN_MONTH, -1],
      [kResolveRemap | F.UCAL_DAY_OF_WEEK_IN_MONTH, F.UCAL_DAY_OF_WEEK, -1],
      [kResolveRemap | F.UCAL_DAY_OF_WEEK_IN_MONTH, F.UCAL_DOW_LOCAL, -1],
      [-1],
    ],
    [[-1]],
  ];
  protected static readonly kMonthPrecedence: UFieldResolutionTable = [
    [[F.UCAL_MONTH, -1, -1], [F.UCAL_ORDINAL_MONTH, -1, -1], [-1]],
    [[-1]],
  ];
  protected static readonly kDOWPrecedence: UFieldResolutionTable = [
    [[F.UCAL_DAY_OF_WEEK, -1, -1], [F.UCAL_DOW_LOCAL, -1, -1], [-1]],
    [[-1]],
  ];
  protected static readonly kYearPrecedence: UFieldResolutionTable = [
    [
      [F.UCAL_YEAR, -1],
      [F.UCAL_EXTENDED_YEAR, -1],
      [F.UCAL_YEAR_WOY, F.UCAL_WEEK_OF_YEAR, -1],
      [-1],
    ],
    [[-1]],
  ];

  /** Original weekend classification; incoming failure precedes day validation. @param day - Native weekday enum. @param status - Status. @returns Classification. */
  getDayOfWeekType(day: UCalendarDaysOfWeek, status: [number]): DayType {
    return getDayOfWeekType.call(this, day, status);
  }
  /** Original transition lookup tests onset before cease without a separate weekday-range guard. @param day - Weekday. @param status - Status. @returns Milliseconds/zero. */
  getWeekendTransition(day: UCalendarDaysOfWeek, status: [number]): number {
    return getWeekendTransition.call(this, day, status);
  }
  /** Original current-date weekend query. @returns Weekend. */
  isWeekend(): boolean;
  /** Original explicit-date query uses an independent calendar clone. @param date - UTC milliseconds. @param status - Status. @returns Weekend. */
  isWeekend(date: UDate, status: [number]): boolean;
  /** Original overloads preserve clone ownership and current-owner field completion. @param date - Optional UTC date. @param status - Explicit-date status. @returns Weekend. */
  isWeekend(date?: UDate, status?: [number]): boolean {
    return isWeekend.call(this, date, status);
  }
  /** Original borrowed const zone query. Non-null ownership is a native constructed-calendar precondition; no replacement zone is synthesized here. @returns Borrowed zone. */
  getTimeZone(): TimeZoneConstReference {
    return this.fZone as TimeZone;
  }
  /** Original transferred zone adoption ignores null and invalidates only fAreFieldsSet. @param zone - Transferred owner/null. @returns Nothing. */
  adoptTimeZone(zone: TimeZone | null): void {
    if (zone === null) return;
    this.fZone = zone;
    this.fAreFieldsSet = false;
  }
  /** Original const-reference setter deep-copies before adoption. @param zone - Copied zone. @returns Nothing. */
  setTimeZone(zone: TimeZoneConstReference): void {
    this.adoptTimeZone(zone.clone());
  }
  /** Original release replaces the zone with an owned system-default clone without invalidating cached fields. @returns Released owner or null on allocation failure. */
  orphanTimeZone(): TimeZone | null {
    const replacement = createDefault();
    if (replacement === null) return null;
    const zone = this.fZone;
    this.fZone = replacement;
    return zone;
  }
  /** Original UTC-to-fields conversion through the actual TimeZone boundary. @param status - ICU status. @returns Nothing. */
  protected computeFields(status: [number]): void {
    computeFields.call(this, status);
  }
  /** Source subclass date-fields hook. @param julianDay - Julian day. @param status - ICU status. @returns Nothing. */
  protected abstract handleComputeFields(julianDay: number, status: [number]): void;
  /** Source fields-to-time computation hook. @param status - ICU status. @returns Nothing. */
  protected computeTime(status: [number]): void {
    computeTime.call(this, status);
  }
  /** Original known-concrete-type detection for the ported SimpleTimeZone/OlsonTimeZone classes; RuleBased/VTimeZone recognition awaits their actual classes. @returns Recognized basic zone/null. */
  protected getBasicTimeZone(): BasicTimeZone | null {
    const zone = this.getTimeZone();
    return zone instanceof SimpleTimeZone || zone instanceof OlsonTimeZone ? zone : null;
  }
  /** Original wall-zone conversion. @param millis - Date milliseconds. @param inDay - Clock milliseconds. @param status - ICU status. @returns Total zone offset. */
  protected computeZoneOffset(millis: number, inDay: number, status: [number]): number {
    return computeZoneOffset.call(this, millis, inDay, status);
  }
  /** Original previous-transition lookup. @param base - UTC base. @param output - UTC transition output. @param status - ICU status. @returns Found. */
  protected getImmediatePreviousZoneTransition(
    base: number,
    output: [number],
    status: [number],
  ): boolean {
    return getImmediatePreviousZoneTransition.call(this, base, output, status);
  }
  /** Original repeated-wall option setter ignores values other than FIRST/LAST. @param value - Option. @returns Nothing. */
  setRepeatedWallTimeOption(value: W): void {
    value |= 0;
    if (value === W.UCAL_WALLTIME_LAST || value === W.UCAL_WALLTIME_FIRST)
      this.fRepeatedWallTime = value;
  }
  /** Original repeated-wall option query. @returns Option. */
  getRepeatedWallTimeOption(): W {
    return this.fRepeatedWallTime;
  }
  /** Original skipped-wall setter stores the source three-bit enum field without validation. @param value - Option. @returns Nothing. */
  setSkippedWallTimeOption(value: W): void {
    this.fSkippedWallTime = (value & 7) as W;
  }
  /** Original skipped-wall option query. @returns Option. */
  getSkippedWallTimeOption(): W {
    return this.fSkippedWallTime;
  }
  /** Original stored UTC time read. @returns Milliseconds. */
  protected internalGetTime(): UDate {
    return this.fTime;
  }
  /** Original stored UTC time write without flag changes. @param value - Milliseconds. @returns Nothing. */
  protected internalSetTime(value: UDate): void {
    this.fTime = value;
  }
  /** Original lazy time read. @param status - ICU status. @returns Milliseconds or zero on failure. */
  getTime(status: [number]): UDate {
    return this.getTimeInMillis(status);
  }
  /** Original public time write. @param value - Milliseconds. @param status - ICU status. @returns Nothing. */
  setTime(value: UDate, status: [number]): void {
    this.setTimeInMillis(value, status);
  }
  /** Original protected time query. @param status - ICU status. @returns Milliseconds or zero. */
  protected getTimeInMillis(status: [number]): UDate {
    if (U_FAILURE(status[0])) return 0;
    if (!this.fIsTimeSet) this.updateTime(status);
    return U_FAILURE(status[0]) ? 0 : this.fTime;
  }
  /** Original range clamp/rejection and virtual-field reset, retaining fractions and sticky errors. @param millis - UTC milliseconds. @param status - ICU status. @returns Nothing. */
  protected setTimeInMillis(millis: UDate, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    if (millis > MAX_MILLIS) {
      if (this.isLenient()) millis = MAX_MILLIS;
      else {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
    } else if (millis < MIN_MILLIS) {
      if (this.isLenient()) millis = MIN_MILLIS;
      else {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
    } else if (Number.isNaN(millis)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    this.fTime = millis;
    this.fAreFieldsSet = this.fAreAllFieldsSet = false;
    this.fIsTimeSet = this.fAreFieldsVirtuallySet = true;
    this.fFields.fill(0);
    this.fStamp.fill(Calendar.kUnset);
    this.fNextStamp = Calendar.kMinimumUserStamp;
  }
  /** Original clock-field precedence computation. @returns Local wall milliseconds-in-day. */
  protected computeMillisInDay(): number {
    return computeMillisInDay.call(this);
  }
  /** Original user-stamped field validation. @param status - ICU status. @returns Nothing. */
  protected validateFields(status: [number]): void {
    validateFields.call(this, status);
  }
  /** Original generic field validation. @param field - Calendar field. @param status - ICU status. @returns Nothing. */
  protected validateField(field: F, status: [number]): void {
    validateField.call(this, field, status);
  }
  /** Original min/max validation overload, explicitly named for TypeScript. @param field - Calendar field. @param min - Lower bound. @param max - Upper bound. @param status - ICU status. @returns Nothing. */
  protected validateFieldRange(field: F, min: number, max: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    if (field < 0 || field >= F.UCAL_FIELD_COUNT) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    const value = this.fFields[field] as number;
    if (value < min || value > max) status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
  }
  /** Original time completion flags, updated only after successful computation. @param status - ICU status. @returns Nothing. */
  protected updateTime(status: [number]): void {
    this.computeTime(status);
    if (U_FAILURE(status[0])) return;
    if (this.isLenient() || !this.fAreAllFieldsSet) this.fAreFieldsSet = false;
    this.fIsTimeSet = true;
    this.fAreFieldsVirtuallySet = false;
  }
  /** Original lenience setter. @param value - Native bool. @returns Nothing. */
  setLenient(value: boolean): void {
    this.fLenient = value;
  }
  /** Original lenience query. @returns Flag. */
  isLenient(): boolean {
    return this.fLenient;
  }
  /** Source subclass month-start hook. @param year - Extended year. @param month - Month. @param useMonth - Whether month applies. @param status - ICU status. @returns Day before month start. */
  protected abstract handleComputeMonthStart(
    year: number,
    month: number,
    useMonth: boolean,
    status: [number],
  ): bigint;
  /** Source subclass month-length hook. @param year - Extended year. @param month - Month. @param status - ICU status. @returns Length. */
  protected abstract handleGetMonthLength(year: number, month: number, status: [number]): number;
  /** Source subclass year-length hook. @param year - Extended year. @param status - ICU status. @returns Length. */
  protected abstract handleGetYearLength(year: number, status: [number]): number;
  /** Source subclass extended-year hook. @param status - ICU status. @returns Extended year. */
  protected abstract handleGetExtendedYear(status: [number]): number;
  /** Source subclass limit hook. @param field - Calendar field. @param type - Limit type. @returns Limit. */
  protected abstract handleGetLimit(field: F, type: ELimitType): number;

  /** Original field query completes lazily and preserves incoming errors. @param field - Calendar field. @param status - ICU status. @returns Value, or zero on failure. */
  get(field: F, status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    if (field < 0 || field >= F.UCAL_FIELD_COUNT) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    this.complete(status);
    return U_FAILURE(status[0]) ? 0 : (this.fFields[field] as number);
  }
  /** Original single-field setter and user-stamp allocation. @param field - Calendar field. @param value - Signed32 value. @returns Nothing. */
  set(field: F, value: number): void {
    if (field < 0 || field >= F.UCAL_FIELD_COUNT) return;
    if (this.fAreFieldsVirtuallySet) this.computeFields([0]);
    this.fFields[field] = value;
    if (this.fNextStamp === STAMP_MAX) this.recalculateStamp();
    this.fStamp[field] = this.fNextStamp++;
    this.fIsTimeSet = this.fAreFieldsSet = this.fAreFieldsVirtuallySet = false;
  }
  /** Original full clear and single-field clear, including the paired month fields. Native fTime remains untouched. @param field - Optional one field. @returns Nothing. */
  clear(field?: F): void {
    if (field === undefined) {
      this.fFields.fill(0);
      this.fStamp.fill(Calendar.kUnset);
      this.fNextStamp = Calendar.kMinimumUserStamp;
    } else {
      if (field < 0 || field >= F.UCAL_FIELD_COUNT) return;
      if (this.fAreFieldsVirtuallySet) this.computeFields([0]);
      this.fFields[field] = 0;
      this.fStamp[field] = Calendar.kUnset;
      if (field === F.UCAL_MONTH || field === F.UCAL_ORDINAL_MONTH) {
        const paired = field === F.UCAL_MONTH ? F.UCAL_ORDINAL_MONTH : F.UCAL_MONTH;
        this.fFields[paired] = 0;
        this.fStamp[paired] = Calendar.kUnset;
      }
    }
    this.fIsTimeSet =
      this.fAreFieldsSet =
      this.fAreAllFieldsSet =
      this.fAreFieldsVirtuallySet =
        false;
  }
  /** Original virtual-field or stamp presence query. @param field - Calendar field. @returns Presence. */
  isSet(field: F): boolean {
    return (
      field >= 0 &&
      field < F.UCAL_FIELD_COUNT &&
      (this.fAreFieldsVirtuallySet || this.fStamp[field] !== Calendar.kUnset)
    );
  }
  /** Original scalar field access with optional default for an unset field. @param field - Calendar field. @param defaultValue - Unset-field fallback. @returns Stored/default value. */
  protected internalGet(field: F, defaultValue?: number): number {
    return defaultValue !== undefined && this.fStamp[field] === Calendar.kUnset
      ? defaultValue
      : (this.fFields[field] as number);
  }
  /** Original internally-computed field write resets its precedence to stamp1. @param field - Calendar field. @param value - Signed32 value. @returns Nothing. */
  protected internalSet(field: F, value: number): void {
    this.fFields[field] = value;
    this.fStamp[field] = Calendar.kInternallySet;
  }
  /** Original lazy completion order and flag updates. @param status - ICU status. @returns Nothing. */
  protected complete(status: [number]): void {
    if (U_FAILURE(status[0])) return;
    if (!this.fIsTimeSet) {
      this.updateTime(status);
      if (U_FAILURE(status[0])) return;
    }
    if (!this.fAreFieldsSet) {
      this.computeFields(status);
      if (U_FAILURE(status[0])) return;
      this.fAreFieldsSet = this.fAreAllFieldsSet = true;
    }
  }
  /** Original stable ordering compression before the signed8 stamp counter reaches127. @returns Nothing. */
  private recalculateStamp(): void {
    this.fNextStamp = Calendar.kInternallySet;
    for (let j = 0; j < F.UCAL_FIELD_COUNT; j++) {
      let current = STAMP_MAX,
        index = -1;
      for (let i = 0; i < F.UCAL_FIELD_COUNT; i++) {
        const stamp = this.fStamp[i] as number;
        if (stamp > this.fNextStamp && stamp < current) {
          current = stamp;
          index = i;
        }
      }
      if (index < 0) break;
      this.fStamp[index] = ++this.fNextStamp;
    }
    this.fNextStamp++;
  }
  /** Original tie favors the default field. @param defaultField - Tie winner. @param alternateField - Strictly newer candidate. @returns Selected field. */
  protected newerField(defaultField: F, alternateField: F): F {
    return (this.fStamp[alternateField] as number) > (this.fStamp[defaultField] as number)
      ? alternateField
      : defaultField;
  }
  /** Original inclusive stamp scan. @param first - First field. @param last - Last field. @param best - Existing best stamp. @returns Newest stamp. */
  protected newestStamp(first: F, last: F, best: number): number {
    for (let i = first; i <= last; i++)
      if ((this.fStamp[i] as number) > best) best = this.fStamp[i] as number;
    return best;
  }
  /** Original precedence selector including YEAR/DATE remapping's WEEK_OF_MONTH guard. @param table - Sentinel-terminated table. @returns Field or FIELD_COUNT. */
  protected resolveFields(table: UFieldResolutionTable): F {
    let bestField: F = F.UCAL_FIELD_COUNT;
    for (let g = 0; table[g]?.[0]?.[0] !== kResolveSTOP && bestField === F.UCAL_FIELD_COUNT; g++) {
      const group = table[g] as readonly (readonly number[])[];
      let bestStamp = Calendar.kUnset;
      lines: for (const line of group) {
        const head = line[0] as number;
        if (head === kResolveSTOP) break;
        let lineStamp = Calendar.kUnset;
        for (let i = head >= kResolveRemap ? 1 : 0; line[i] !== kResolveSTOP; i++) {
          const stamp = this.fStamp[line[i] as number] as number;
          if (stamp === Calendar.kUnset) continue lines;
          if (stamp > lineStamp) lineStamp = stamp;
        }
        if (lineStamp > bestStamp) {
          let candidate = head;
          if (candidate >= kResolveRemap) {
            candidate &= kResolveRemap - 1;
            if (
              candidate !== F.UCAL_DATE ||
              (this.fStamp[F.UCAL_WEEK_OF_MONTH] as number) < (this.fStamp[candidate] as number)
            )
              bestField = candidate;
          } else bestField = candidate;
          if (bestField === candidate) bestStamp = lineStamp;
        }
      }
    }
    return bestField;
  }
  /** Original default date precedence hook. @returns Source table. */
  protected getFieldResolutionTable(): UFieldResolutionTable {
    return Calendar.kDatePrecedence;
  }
  /** Original ordinal-month resolution and optional unset default. @param status - ICU status. @param defaultValue - Optional default. @returns Month or zero on failure. */
  protected internalGetMonth(status: [number], defaultValue?: number): number {
    if (U_FAILURE(status[0])) return 0;
    const field =
      this.resolveFields(Calendar.kMonthPrecedence) === F.UCAL_ORDINAL_MONTH
        ? F.UCAL_ORDINAL_MONTH
        : F.UCAL_MONTH;
    return this.internalGet(field, defaultValue);
  }
  /** Original Gregorian-cache computation and weekday write, retaining checked conversion and partial writes. @param julianDay - Signed32 Julian day. @param status - ICU status. @returns Nothing. */
  protected computeGregorianFields(julianDay: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    const day = (julianDay | 0) - kEpochStartAsJulianDay;
    if (day < -2147483648 || day > 2147483647) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    const year: [number] = [this.fGregorianYear],
      month: [number] = [this.fGregorianMonth],
      dom: [number] = [this.fGregorianDayOfMonth],
      doy: [number] = [this.fGregorianDayOfYear],
      dow: [number] = [0];
    Grego.dayToFields(day, year, month, dom, dow, doy, status);
    this.fGregorianYear = year[0];
    this.fGregorianMonth = month[0];
    this.fGregorianDayOfMonth = dom[0];
    this.fGregorianDayOfYear = doy[0];
    if (!U_FAILURE(status[0])) this.internalSet(F.UCAL_DAY_OF_WEEK, dow[0]);
  }
  /** Original signed64 weekday expression avoids signed32 overflow at Julian limits. @param julian - Signed32 Julian day. @returns Sunday1..Saturday7. */
  protected static julianDayToDayOfWeek(julian: number): number {
    const dow = ((julian | 0) + 1) % 7;
    return dow + (dow < 0 ? 7 + UCalendarDaysOfWeek.UCAL_SUNDAY : UCalendarDaysOfWeek.UCAL_SUNDAY);
  }
  /** Source Gregorian cache getter. @returns Extended year. */
  protected getGregorianYear(): number {
    return this.fGregorianYear;
  }
  /** Source Gregorian cache getter. @returns Zero-based month. */
  protected getGregorianMonth(): number {
    return this.fGregorianMonth;
  }
  /** Source Gregorian cache getter. @returns Day of month. */
  protected getGregorianDayOfMonth(): number {
    return this.fGregorianDayOfMonth;
  }
  /** Source Gregorian cache getter. @returns One-based ordinal. */
  protected getGregorianDayOfYear(): number {
    return this.fGregorianDayOfYear;
  }
  /** Original two/three-argument week-number formulas. @param desiredDay - Target ordinal. @param dayOrWeekday - Period day, or weekday for the two-argument form. @param suppliedWeekday - Optional weekday. @returns Week ordinal. */
  protected weekNumber(desiredDay: number, dayOrWeekday: number, suppliedWeekday?: number): number {
    const dayOfPeriod = suppliedWeekday === undefined ? desiredDay : dayOrWeekday,
      dayOfWeek = suppliedWeekday ?? dayOrWeekday;
    let start = (dayOfWeek - this.getFirstDayOfWeek() - dayOfPeriod + 1) % 7;
    if (start < 0) start += 7;
    let week = Math.trunc((desiredDay + start - 1) / 7);
    if (7 - start >= this.getMinimalDaysInFirstWeek()) week++;
    return week;
  }
  /** Original derived week fields; direct fFields writes deliberately retain their existing stamps. @param status - ICU status. @returns Nothing. */
  protected computeWeekFields(status: [number]): void {
    if (U_FAILURE(status[0])) return;
    const dow = this.internalGet(F.UCAL_DAY_OF_WEEK),
      first = this.getFirstDayOfWeek();
    let local = dow - first + 1;
    if (local < 1) local += 7;
    this.internalSet(F.UCAL_DOW_LOCAL, local);
    const year = this.internalGet(F.UCAL_EXTENDED_YEAR),
      doy = this.internalGet(F.UCAL_DAY_OF_YEAR);
    let weekYear = year;
    const rel = (dow + 7 - first) % 7,
      janRel = (dow - doy + 7001 - first) % 7,
      min = this.getMinimalDaysInFirstWeek();
    let woy = Math.trunc((doy - 1 + janRel) / 7);
    if (7 - janRel >= min) woy++;
    if (woy === 0) {
      const prevDoy = doy + this.handleGetYearLength(year - 1, status);
      if (U_FAILURE(status[0])) return;
      woy = this.weekNumber(prevDoy, dow);
      weekYear--;
    } else {
      const lastDoy = this.handleGetYearLength(year, status);
      if (U_FAILURE(status[0])) return;
      if (doy >= lastDoy - 5) {
        let lastRel = (rel + lastDoy - doy) % 7;
        if (lastRel < 0) lastRel += 7;
        if (6 - lastRel >= min && doy + 7 - rel > lastDoy) {
          woy = 1;
          weekYear++;
        }
      }
    }
    this.fFields[F.UCAL_WEEK_OF_YEAR] = woy;
    this.fFields[F.UCAL_YEAR_WOY] = weekYear;
    const dom = this.internalGet(F.UCAL_DAY_OF_MONTH);
    this.fFields[F.UCAL_WEEK_OF_MONTH] = this.weekNumber(dom, dow);
    this.fFields[F.UCAL_DAY_OF_WEEK_IN_MONTH] = Math.trunc((dom - 1) / 7) + 1;
  }

  /** Original localized week start setter ignores invalid values. @param value - Sunday1..Saturday7. @returns Nothing. */
  setFirstDayOfWeek(value: UCalendarDaysOfWeek): void {
    if (this.fFirstDayOfWeek !== value && value >= 1 && value <= 7) {
      this.fFirstDayOfWeek = value;
      this.fAreFieldsSet = false;
    }
  }
  /** Original localized week start. @returns Weekday. */
  getFirstDayOfWeek(): UCalendarDaysOfWeek {
    return this.fFirstDayOfWeek;
  }
  /** Original uint8 input narrowing and1..7 clamp. @param value - Unsigned8 minimum. @returns Nothing. */
  setMinimalDaysInFirstWeek(value: number): void {
    value &= 255;
    value = Math.max(1, Math.min(7, value));
    if (this.fMinimalDaysInFirstWeek !== value) {
      this.fMinimalDaysInFirstWeek = value;
      this.fAreFieldsSet = false;
    }
  }
  /** Original localized minimum week length. @returns Minimum. */
  getMinimalDaysInFirstWeek(): number {
    return this.fMinimalDaysInFirstWeek;
  }
  /** Source minimum limit. @param field - Calendar field. @returns Limit. */
  getMinimum(field: F): number {
    return this.getLimit(field, ELimitType.UCAL_LIMIT_MINIMUM);
  }
  /** Source maximum limit. @param field - Calendar field. @returns Limit. */
  getMaximum(field: F): number {
    return this.getLimit(field, ELimitType.UCAL_LIMIT_MAXIMUM);
  }
  /** Source greatest minimum. @param field - Calendar field. @returns Limit. */
  getGreatestMinimum(field: F): number {
    return this.getLimit(field, ELimitType.UCAL_LIMIT_GREATEST_MINIMUM);
  }
  /** Source least maximum. @param field - Calendar field. @returns Limit. */
  getLeastMaximum(field: F): number {
    return this.getLimit(field, ELimitType.UCAL_LIMIT_LEAST_MAXIMUM);
  }
  /** Original generic limits and locale-dependent WEEK_OF_MONTH formulas. @param field - Calendar field. @param type - Limit kind. @returns Limit. */
  protected getLimit(field: F, type: ELimitType): number {
    switch (field) {
      case F.UCAL_DAY_OF_WEEK:
      case F.UCAL_AM_PM:
      case F.UCAL_HOUR:
      case F.UCAL_HOUR_OF_DAY:
      case F.UCAL_MINUTE:
      case F.UCAL_SECOND:
      case F.UCAL_MILLISECOND:
      case F.UCAL_ZONE_OFFSET:
      case F.UCAL_DST_OFFSET:
      case F.UCAL_DOW_LOCAL:
      case F.UCAL_JULIAN_DAY:
      case F.UCAL_MILLISECONDS_IN_DAY:
      case F.UCAL_IS_LEAP_MONTH:
        return (kCalendarLimits[field] as readonly number[])[type] as number;
      case F.UCAL_WEEK_OF_MONTH:
        if (type === ELimitType.UCAL_LIMIT_MINIMUM)
          return this.getMinimalDaysInFirstWeek() === 1 ? 1 : 0;
        if (type === ELimitType.UCAL_LIMIT_GREATEST_MINIMUM) return 1;
        return Math.trunc(
          (this.handleGetLimit(F.UCAL_DAY_OF_MONTH, type) +
            (type === ELimitType.UCAL_LIMIT_LEAST_MAXIMUM ? 0 : 6) +
            7 -
            this.getMinimalDaysInFirstWeek()) /
            7,
        );
      default:
        return this.handleGetLimit(field, type);
    }
  }
  /** Original Gregorian/default-calendar first month hook. @param year - Extended year. @param status - Ignored source status. @returns January0. */
  protected getDefaultMonthInYear(year: number, status: [number]): number {
    void year;
    void status;
    return 0;
  }
  /** Original default first day hook. @param year - Extended year. @param month - Month. @param status - Ignored source status. @returns One. */
  protected getDefaultDayInMonth(year: number, month: number, status: [number]): number {
    void year;
    void month;
    void status;
    return 1;
  }
  /** Original localized weekday normalization and checked subtraction. @param status - ICU status. @returns Local weekday0..6, or zero. */
  protected getLocalDOW(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    const dow: [number] = [0];
    switch (this.resolveFields(Calendar.kDOWPrecedence)) {
      case F.UCAL_DAY_OF_WEEK:
        if (uprv_add32_overflow(this.internalGet(F.UCAL_DAY_OF_WEEK), -this.fFirstDayOfWeek, dow)) {
          status[0] = 1;
          return 0;
        }
        break;
      case F.UCAL_DOW_LOCAL:
        if (uprv_add32_overflow(this.internalGet(F.UCAL_DOW_LOCAL), -1, dow)) {
          status[0] = 1;
          return 0;
        }
        break;
      default:
        break;
    }
    dow[0] %= 7;
    return dow[0] < 0 ? dow[0] + 7 : dow[0];
  }
  /** Original week-year to actual year resolution, including its month/day precedence branches. @param yearWoy - Week year. @param woy - Week ordinal. @param status - ICU status. @returns Actual year. */
  protected handleGetExtendedYearFromWeekFields(
    yearWoy: number,
    woy: number,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    const best = this.resolveFields(Calendar.kDatePrecedence),
      dow = this.getLocalDOW(status);
    if (U_FAILURE(status[0])) return 0;
    const firstDay = this.getFirstDayOfWeek(),
      jan = Number(BigInt.asIntN(32, this.handleComputeMonthStart(yearWoy, 0, false, status))),
      nextYear: [number] = [0];
    if (uprv_add32_overflow(yearWoy, 1, nextYear)) {
      status[0] = 1;
      return 0;
    }
    const nextJan = Number(
      BigInt.asIntN(32, this.handleComputeMonthStart(nextYear[0], 0, false, status)),
    );
    if (U_FAILURE(status[0])) return 0;
    let first = Calendar.julianDayToDayOfWeek(jan + 1) - firstDay;
    if (first < 0) first += 7;
    const janInPrev = 7 - first < this.getMinimalDaysInFirstWeek();
    switch (best) {
      case F.UCAL_WEEK_OF_YEAR:
        if (woy === 1) return janInPrev || dow >= first ? yearWoy : yearWoy - 1;
        if (woy >= this.getLeastMaximum(best)) {
          let jd = jan + 7 - first + (woy - 1) * 7 + dow;
          if (!janInPrev) jd -= 7;
          return jd + 1 >= nextJan ? yearWoy + 1 : yearWoy;
        }
        return yearWoy;
      case F.UCAL_DATE: {
        const month = this.internalGetMonth(status);
        if (U_FAILURE(status[0])) return 0;
        if (month === 0 && woy >= this.getLeastMaximum(F.UCAL_WEEK_OF_YEAR)) return yearWoy + 1;
        if (woy === 1) return month === 0 ? yearWoy : yearWoy - 1;
        return yearWoy;
      }
      default:
        return yearWoy;
    }
  }
  /** Original Julian-day selector; user JULIAN_DAY precedence is considered before the hook's status check. @param status - ICU status. @returns Julian day. */
  protected computeJulianDay(status: [number]): number {
    if ((this.fStamp[F.UCAL_JULIAN_DAY] as number) >= Calendar.kMinimumUserStamp) {
      let best = this.newestStamp(F.UCAL_ERA, F.UCAL_DAY_OF_WEEK_IN_MONTH, Calendar.kUnset);
      best = this.newestStamp(F.UCAL_YEAR_WOY, F.UCAL_EXTENDED_YEAR, best);
      best = this.newestStamp(F.UCAL_ORDINAL_MONTH, F.UCAL_ORDINAL_MONTH, best);
      if (best <= (this.fStamp[F.UCAL_JULIAN_DAY] as number))
        return this.internalGet(F.UCAL_JULIAN_DAY);
    }
    let best = this.resolveFields(this.getFieldResolutionTable());
    if (best === F.UCAL_FIELD_COUNT) best = F.UCAL_DAY_OF_MONTH;
    return this.handleComputeJulianDay(best, status);
  }
  /** Original complete date-field to Julian-day hook, including week-year precedence and checked native arithmetic. @param best - Resolved date field. @param status - ICU status. @returns Julian day or zero. */
  protected handleComputeJulianDay(best: F, status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    const useMonth =
      best === F.UCAL_DAY_OF_MONTH ||
      best === F.UCAL_WEEK_OF_MONTH ||
      best === F.UCAL_DAY_OF_WEEK_IN_MONTH;
    const year =
      best === F.UCAL_WEEK_OF_YEAR &&
      this.newerField(F.UCAL_YEAR_WOY, F.UCAL_YEAR) === F.UCAL_YEAR_WOY
        ? this.internalGet(F.UCAL_YEAR_WOY)
        : this.handleGetExtendedYear(status);
    if (U_FAILURE(status[0])) return 0;
    this.internalSet(F.UCAL_EXTENDED_YEAR, year);
    if (year > Math.trunc(2147483647 / 400)) {
      status[0] = 1;
      return 0;
    }
    const month =
      this.isSet(F.UCAL_MONTH) || this.isSet(F.UCAL_ORDINAL_MONTH)
        ? this.internalGetMonth(status)
        : this.getDefaultMonthInYear(year, status);
    if (U_FAILURE(status[0])) return 0;
    let jd = Number(
      BigInt.asIntN(32, this.handleComputeMonthStart(year, useMonth ? month : 0, useMonth, status)),
    );
    if (U_FAILURE(status[0])) return 0;
    const out: [number] = [0];
    if (best === F.UCAL_DAY_OF_MONTH) {
      const dom = this.isSet(F.UCAL_DAY_OF_MONTH)
        ? this.internalGet(F.UCAL_DAY_OF_MONTH, 1)
        : this.getDefaultDayInMonth(year, month, status);
      if (U_FAILURE(status[0])) return 0;
      if (uprv_add32_overflow(dom, jd, out)) {
        status[0] = 1;
        return 0;
      }
      return out[0];
    }
    if (best === F.UCAL_DAY_OF_YEAR) {
      if (uprv_add32_overflow(this.internalGet(F.UCAL_DAY_OF_YEAR), jd, out)) {
        status[0] = 1;
        return 0;
      }
      return out[0];
    }
    const firstDay = this.getFirstDayOfWeek();
    let first = Calendar.julianDayToDayOfWeek(jd + 1) - firstDay;
    if (first < 0) first += 7;
    const dow = this.getLocalDOW(status);
    if (U_FAILURE(status[0])) return 0;
    let date = 1 - first + dow;
    if (best === F.UCAL_DAY_OF_WEEK_IN_MONTH) {
      if (date < 1) date += 7;
      const dim = this.internalGet(F.UCAL_DAY_OF_WEEK_IN_MONTH, 1);
      if (dim >= 0) {
        if (uprv_mul32_overflow(7, dim - 1, out) || uprv_add32_overflow(date, out[0], out)) {
          status[0] = 1;
          return 0;
        }
        date = out[0];
      } else {
        const m = this.internalGetMonth(status, 0),
          length = this.handleGetMonthLength(year, m, status);
        if (U_FAILURE(status[0])) return 0;
        if (
          uprv_add32_overflow(Math.trunc((length - date) / 7), dim + 1, out) ||
          uprv_mul32_overflow(out[0], 7, out) ||
          uprv_add32_overflow(date, out[0], out)
        ) {
          status[0] = 1;
          return 0;
        }
        date = out[0];
      }
    } else {
      if (
        best === F.UCAL_WEEK_OF_YEAR &&
        (!this.isSet(F.UCAL_YEAR_WOY) ||
          (this.resolveFields(Calendar.kYearPrecedence) !== F.UCAL_YEAR_WOY &&
            this.fStamp[F.UCAL_YEAR_WOY] !== Calendar.kInternallySet))
      ) {
        const woy = this.internalGet(best),
          next = Number(
            BigInt.asIntN(32, this.handleComputeMonthStart(year + 1, 0, false, status)),
          );
        if (U_FAILURE(status[0])) return 0;
        let nextFirst = Calendar.julianDayToDayOfWeek(next + 1) - firstDay;
        if (nextFirst < 0) nextFirst += 7;
        if (woy === 1) {
          if (nextFirst > 0 && 7 - nextFirst >= this.getMinimalDaysInFirstWeek()) {
            jd = next;
            first = Calendar.julianDayToDayOfWeek(jd + 1) - firstDay;
            if (first < 0) first += 7;
            date = 1 - first + dow;
          }
        } else if (woy >= this.getLeastMaximum(best)) {
          let testDate = date;
          if (7 - first < this.getMinimalDaysInFirstWeek()) testDate += 7;
          if (
            uprv_mul32_overflow(woy - 1, 7, out) ||
            uprv_add32_overflow(out[0], testDate, out) ||
            uprv_add32_overflow(jd, out[0], out)
          ) {
            status[0] = 1;
            return 0;
          }
          if (out[0] > next) {
            if (uprv_add32_overflow(year, -1, out)) {
              status[0] = 1;
              return 0;
            }
            jd = Number(BigInt.asIntN(32, this.handleComputeMonthStart(out[0], 0, false, status)));
            if (U_FAILURE(status[0])) return 0;
            first = Calendar.julianDayToDayOfWeek(jd + 1) - firstDay;
            if (first < 0) first += 7;
            date = 1 - first + dow;
          }
        }
      }
      if (7 - first < this.getMinimalDaysInFirstWeek()) date += 7;
      if (
        uprv_add32_overflow(this.internalGet(best), -1, out) ||
        uprv_mul32_overflow(7, out[0], out) ||
        uprv_add32_overflow(date, out[0], out)
      ) {
        status[0] = 1;
        return 0;
      }
      date = out[0];
    }
    if (uprv_add32_overflow(jd, date, out)) {
      status[0] = 1;
      return 0;
    }
    return out[0];
  }
}

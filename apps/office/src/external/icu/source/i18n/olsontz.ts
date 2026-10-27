/** @fileoverview ICU78.3 OlsonTimeZone owner and historical/final-zone dispatch over pinned resources. Fragments share this single source owner; native allocation/mutex/lifetime/ABI remain uncertified. */
import { UnicodeString } from "../common/unistr";
import { uprv_getUTCtime } from "../common/putil";
import { U_FAILURE } from "../common/unicode/utypes";
import type { UResourceBundle } from "../common/uresbund";
import { BasicTimeZone } from "./basictz";
import { SimpleTimeZone } from "./simpletz";
import type { TimeZone } from "./timezone";
import type {
  InitialTimeZoneRule,
  TimeArrayTimeZoneRule,
  InitialTimeZoneRuleConstReference,
  TimeZoneRuleConstReference,
} from "./tzrule";
import type { TimeZoneTransition } from "./tztrans";
import type { UTimeZoneLocalOption } from "./unicode/ucal";
import { Grego } from "./gregoimp";
import { construct, getHistoricalOffset, getOffsetForFields } from "./olsontz.offset";
import {
  initTransitionRules,
  getNextTransition,
  getPreviousTransition,
  countTransitionRules,
  getTimeZoneRules,
} from "./olsontz.transitions";
const ZEROS: readonly number[] = [0, 0];
/** Original immutable historical-zone owner; the inherited ID remains mutable. */
export class OlsonTimeZone extends BasicTimeZone {
  protected transitionCountPre32 = 0;
  protected transitionCount32 = 0;
  protected transitionCountPost32 = 0;
  protected transitionTimesPre32: readonly number[] | null = null;
  protected transitionTimes32: readonly number[] | null = null;
  protected transitionTimesPost32: readonly number[] | null = null;
  protected typeCount = 1;
  protected typeOffsets: readonly number[] = ZEROS;
  protected typeMapData: readonly number[] | null = null;
  protected finalZone: SimpleTimeZone | null = null;
  protected finalStartYear!: number;
  protected finalStartMillis!: number;
  protected canonicalID: string | null = null;
  protected initialRule: InitialTimeZoneRule | null = null;
  protected firstTZTransition: TimeZoneTransition | null = null;
  protected firstTZTransitionIdx = 0;
  protected firstFinalTZTransition: TimeZoneTransition | null = null;
  protected historicRules: (TimeArrayTimeZoneRule | null)[] | null = null;
  protected historicRuleCount = 0;
  protected finalZoneWithStartYear: SimpleTimeZone | null = null;
  protected transitionRulesInitialized = false;
  /** Original copy constructor first copies the base ID, then applies the derived assignment. @param source - Source zone. @returns Owner. */
  constructor(source: OlsonTimeZone);
  /** Original resource constructor. @param top - zoneinfo64 root. @param res - Resolved zone resource. @param id - Requested ID. @param status - ICU status. @returns Owner, empty on failure. */
  constructor(
    top: UResourceBundle | null,
    res: UResourceBundle | null,
    id: UnicodeString,
    status: [number],
  );
  /** Original constructor families. @param source - Source owner or root. @param res - Zone. @param id - Requested ID. @param status - Status. @returns Owner. */
  constructor(
    source: OlsonTimeZone | UResourceBundle | null,
    res?: UResourceBundle | null,
    id?: UnicodeString,
    status?: [number],
  ) {
    super(source instanceof OlsonTimeZone ? source : id);
    if (source instanceof OlsonTimeZone) this.assign(source);
    else
      construct.call(
        this,
        source,
        res as UResourceBundle | null,
        id as UnicodeString,
        status as [number],
      );
  }
  /** Original failure-state initialization does not replace the inherited ID. @returns Nothing. */
  protected constructEmpty(): void {
    this.canonicalID = null;
    this.transitionCountPre32 = this.transitionCount32 = this.transitionCountPost32 = 0;
    this.transitionTimesPre32 = this.transitionTimes32 = this.transitionTimesPost32 = null;
    this.typeMapData = null;
    this.typeCount = 1;
    this.typeOffsets = ZEROS;
    this.finalZone = null;
  }
  /** Original assignment intentionally omits TimeZone base assignment, retaining the recipient ID. @param other - Source owner. @returns This owner. */
  assign(other: OlsonTimeZone): this {
    if (this === other) return this;
    this.canonicalID = other.canonicalID;
    this.transitionTimesPre32 = other.transitionTimesPre32;
    this.transitionTimes32 = other.transitionTimes32;
    this.transitionTimesPost32 = other.transitionTimesPost32;
    this.transitionCountPre32 = other.transitionCountPre32;
    this.transitionCount32 = other.transitionCount32;
    this.transitionCountPost32 = other.transitionCountPost32;
    this.typeCount = other.typeCount;
    this.typeOffsets = other.typeOffsets;
    this.typeMapData = other.typeMapData;
    this.finalZone = other.finalZone === null ? null : other.finalZone.clone();
    this.finalStartYear = other.finalStartYear;
    this.finalStartMillis = other.finalStartMillis;
    this.clearTransitionRules();
    return this;
  }
  /** Original polymorphic copy. @returns Independent zone owner with borrowed immutable resource data. */
  clone(): OlsonTimeZone {
    return new OlsonTimeZone(this);
  }
  /** Original ID/type/rule equality. @param other - Compared zone. @returns Equality. */
  override equals(other: TimeZone): boolean {
    return (
      this === other ||
      (this.constructor === other.constructor && super.equals(other) && this.hasSameRules(other))
    );
  }
  /** Original pointer shortcut precedes all numeric/final-zone comparisons, including two null maps. @param other - Compared zone. @returns Same source rules. */
  hasSameRules(other: TimeZone): boolean {
    if (this === other) return true;
    if (!(other instanceof OlsonTimeZone)) return false;
    if (this.typeMapData === other.typeMapData) return true;
    if ((this.finalZone === null) !== (other.finalZone === null)) return false;
    if (
      this.finalZone !== null &&
      other.finalZone !== null &&
      !this.finalZone.equals(other.finalZone)
    )
      return false;
    if (
      this.finalZone !== null &&
      (this.finalStartYear !== other.finalStartYear ||
        this.finalStartMillis !== other.finalStartMillis)
    )
      return false;
    if (
      this.typeCount !== other.typeCount ||
      this.transitionCountPre32 !== other.transitionCountPre32 ||
      this.transitionCount32 !== other.transitionCount32 ||
      this.transitionCountPost32 !== other.transitionCountPost32
    )
      return false;
    return (
      arrayEqual(
        this.transitionTimesPre32,
        other.transitionTimesPre32,
        this.transitionCountPre32 << 1,
      ) &&
      arrayEqual(this.transitionTimes32, other.transitionTimes32, this.transitionCount32) &&
      arrayEqual(
        this.transitionTimesPost32,
        other.transitionTimesPost32,
        this.transitionCountPost32 << 1,
      ) &&
      arrayEqual(this.typeOffsets, other.typeOffsets, this.typeCount << 1) &&
      arrayEqual(this.typeMapData, other.typeMapData, this.transitionCount())
    );
  }
  /** Original stable canonical ID is unaffected by setID. @returns Borrowed string/null. */
  getCanonicalID(): string | null {
    return this.canonicalID;
  }
  /** Original seven-argument field overload. @param era - Era. @param year - Year. @param month - Month. @param day - Day. @param weekday - Weekday. @param millis - Milliseconds in day. @param status - Status. @returns Total offset. */
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
      if (!U_FAILURE(status[0])) status[0] = 1;
      return 0;
    }
    return this.getOffsetForFields(
      era,
      year,
      month,
      day,
      weekday,
      millis,
      Grego.monthLength(year | 0, month),
      status,
    );
  }
  /** Original eight-argument field path. @param era - Era. @param year - Year. @param month - Month. @param day - Day. @param weekday - Weekday. @param millis - Milliseconds in day. @param monthLength - Caller length. @param status - Status. @returns Total offset. */
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
    return getOffsetForFields.call(
      this,
      era,
      year,
      month,
      day,
      weekday,
      millis,
      monthLength,
      status,
    );
  }
  /** Original UTC/default-local dispatch at finalStartMillis. @param date - UTC/local milliseconds. @param local - Local flag. @param raw - Raw output. @param dst - Savings output. @param status - Status. @returns Nothing. */
  override getOffset(
    date: number,
    local: boolean,
    raw: [number],
    dst: [number],
    status: [number],
  ): void {
    if (U_FAILURE(status[0])) return;
    if (this.finalZone !== null && date >= this.finalStartMillis)
      this.finalZone.getOffset(date, local, raw, dst, status);
    else
      getHistoricalOffset.call(
        this,
        date,
        local,
        OlsonTimeZone.kFormer,
        OlsonTimeZone.kLatter,
        raw,
        dst,
      );
  }
  /** Original explicit wall-time option dispatch. @param date - Local milliseconds. @param nonExisting - Gap option. @param duplicated - Overlap option. @param raw - Raw output. @param dst - Savings output. @param status - Status. @returns Nothing. */
  override getOffsetFromLocal(
    date: number,
    nonExisting: UTimeZoneLocalOption,
    duplicated: UTimeZoneLocalOption,
    raw: [number],
    dst: [number],
    status: [number],
  ): void {
    if (U_FAILURE(status[0])) return;
    if (this.finalZone !== null && date >= this.finalStartMillis)
      this.finalZone.getOffsetFromLocal(date, nonExisting, duplicated, raw, dst, status);
    else getHistoricalOffset.call(this, date, true, nonExisting, duplicated, raw, dst);
  }
  /** Original immutable-rule no-op. @param offset - Ignored offset. @returns Nothing. */
  setRawOffset(offset: number): void {
    void offset;
  }
  /** Original current-clock raw offset query. @returns Raw milliseconds. */
  getRawOffset(): number {
    const raw: [number] = [0];
    this.getOffset(uprv_getUTCtime(), false, raw, [0], [0]);
    return raw[0];
  }
  /** Original current-year DST observation, including its strict start-boundary comparisons. @returns Any current-year DST. */
  useDaylightTime(): boolean {
    const current = uprv_getUTCtime();
    if (this.finalZone !== null && current >= this.finalStartMillis)
      return this.finalZone.useDaylightTime();
    const status: [number] = [0],
      year = Grego.timeToYear(current, status);
    if (U_FAILURE(status[0])) return false;
    const start = Number(Grego.fieldsToDay(year, 0, 1)) * 86400,
      limit = Number(Grego.fieldsToDay((year + 1) | 0, 0, 1)) * 86400;
    for (let i = 0; i < this.transitionCount(); ++i) {
      const transition = Number(this.transitionTimeInSeconds(i));
      if (transition >= limit) break;
      if (
        (transition >= start && this.dstOffsetAt(i) !== 0) ||
        (transition > start && this.dstOffsetAt(i - 1) !== 0)
      )
        return true;
    }
    return false;
  }
  /** Original final-zone or base TimeZone DST-savings result. @returns Savings milliseconds. */
  override getDSTSavings(): number {
    return this.finalZone !== null ? this.finalZone.getDSTSavings() : super.getDSTSavings();
  }
  /** Original explicit-date DST query; failed output is not certified because native local offsets can be uninitialized. @param date - UTC milliseconds. @param status - Status. @returns Nonzero savings. */
  inDaylightTime(date: number, status: [number]): boolean {
    const dst: [number] = [0];
    this.getOffset(date, false, [0], dst, status);
    return dst[0] !== 0;
  }
  /** Original signed16 total count. @returns Count. */
  protected transitionCount(): number {
    return (
      ((this.transitionCountPre32 + this.transitionCount32 + this.transitionCountPost32) << 16) >>
      16
    );
  }
  /** Original pre/post32 pair reconstruction. @param index - Valid transition index. @returns Signed64 seconds. */
  protected transitionTimeInSeconds(index: number): bigint {
    if (index < this.transitionCountPre32)
      return pair(this.transitionTimesPre32 as readonly number[], index);
    index -= this.transitionCountPre32;
    if (index < this.transitionCount32)
      return BigInt((this.transitionTimes32 as readonly number[])[index] as number);
    return pair(this.transitionTimesPost32 as readonly number[], index - this.transitionCount32);
  }
  /** Original binary64 conversion occurs before multiplication. @param index - Valid index. @returns UTC milliseconds. */
  protected transitionTime(index: number): number {
    return Number(this.transitionTimeInSeconds(index)) * 1000;
  }
  /** Original total seconds at the transition or initial type for negative indices. @param index - Index. @returns Seconds. */
  protected zoneOffsetAt(index: number): number {
    return (this.rawOffsetAt(index) + this.dstOffsetAt(index)) | 0;
  }
  /** Original raw seconds lookup. @param index - Index. @returns Seconds. */
  protected rawOffsetAt(index: number): number {
    return this.typeOffsets[
      (index >= 0 ? ((this.typeMapData as readonly number[])[index] as number) : 0) << 1
    ] as number;
  }
  /** Original DST seconds lookup. @param index - Index. @returns Seconds. */
  protected dstOffsetAt(index: number): number {
    return this.typeOffsets[
      ((index >= 0 ? ((this.typeMapData as readonly number[])[index] as number) : 0) << 1) + 1
    ] as number;
  }
  /** Original initial raw seconds. @returns Seconds. */
  protected initialRawOffset(): number {
    return this.typeOffsets[0] as number;
  }
  /** Original initial DST seconds. @returns Seconds. */
  protected initialDstOffset(): number {
    return this.typeOffsets[1] as number;
  }
  /** Original cache-pointer reset, without base-ID changes. GC projects native clear/delete boundaries. @returns Nothing. */
  protected clearTransitionRules(): void {
    this.initialRule = this.firstTZTransition = this.firstFinalTZTransition = null;
    this.historicRules = null;
    this.historicRuleCount = 0;
    this.finalZoneWithStartYear = null;
    this.firstTZTransitionIdx = 0;
    this.transitionRulesInitialized = false;
  }
  /** Original deletion followed by clear in the browser ownership projection. @returns Nothing. */
  protected deleteTransitionRules(): void {
    this.clearTransitionRules();
  }
  /** Original once-only success guard; native mutex/failed-allocation initialization channels are outside this binding. @param status - Status. @returns Nothing. */
  protected checkTransitionRules(status: [number]): void {
    if (U_FAILURE(status[0]) || this.transitionRulesInitialized) return;
    this.initTransitionRules(status);
    if (!U_FAILURE(status[0])) this.transitionRulesInitialized = true;
  }
  /** Original exposed native initializer. @param status - Status. @returns Nothing. */
  initTransitionRules(status: [number]): void {
    initTransitionRules.call(this, status);
  }
  /** Original next transition. @param base - UTC base. @param inclusive - Include base. @param result - Output. @returns Found. */
  getNextTransition(base: number, inclusive: boolean, result: TimeZoneTransition): boolean {
    return getNextTransition.call(this, base, inclusive, result);
  }
  /** Original previous transition. @param base - UTC base. @param inclusive - Include base. @param result - Output. @returns Found. */
  getPreviousTransition(base: number, inclusive: boolean, result: TimeZoneTransition): boolean {
    return getPreviousTransition.call(this, base, inclusive, result);
  }
  /** Original rule count. @param status - Status. @returns Count. */
  countTransitionRules(status: [number]): number {
    return countTransitionRules.call(this, status);
  }
  /** Original borrowed rules. @param initial - Initial rule output. @param rules - Rule slots. @param count - Capacity/output count. @param status - Status. @returns Nothing. */
  getTimeZoneRules(
    initial: [InitialTimeZoneRuleConstReference | null],
    rules: (TimeZoneRuleConstReference | null)[],
    count: [number],
    status: [number],
  ): void {
    getTimeZoneRules.call(this, initial, rules, count, status);
  }
}
/** Original int64 bit-pattern reconstruction from two unsigned32 words. @param values - Native pair buffer. @param index - Pair index. @returns Signed64 value. */
function pair(values: readonly number[], index: number): bigint {
  return BigInt.asIntN(
    64,
    (BigInt((values[index << 1] as number) >>> 0) << 32n) |
      BigInt((values[(index << 1) + 1] as number) >>> 0),
  );
}
/** Original byte equality for consumed integer buffers, preserving null/pointer shortcuts. @param left - Buffer. @param right - Buffer. @param count - Element count. @returns Equality. */
function arrayEqual(
  left: readonly number[] | null,
  right: readonly number[] | null,
  count: number,
): boolean {
  if (left === right) return true;
  if (left === null || right === null) return false;
  for (let i = 0; i < count; ++i) if (left[i] !== right[i]) return false;
  return true;
}

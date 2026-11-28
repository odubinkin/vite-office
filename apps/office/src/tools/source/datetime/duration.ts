/** @fileoverview Original tools::Duration Time/DateTime difference constructors and day/fraction result. Other duration arithmetic and floating input construction remain separate responsibilities. */
import { Time, type TimeConstReference } from "./ttime";
import type { DateTimeConstReference } from "./datetime";
import { approxCeil, approxFloor } from "../../../sal/inc/rtl/math";

/** Original day count and normalized Time owner used by DateTime::Sub. */
export class Duration {
  static readonly kAccuracyEpsilonNanoseconds = 300n;
  private mnDays = 0;
  private readonly maTime = new Time(Time.EMPTY);
  /** Original floating day constructor. @param days - Serial duration in days. @param epsilon - Nanosecond rounding tolerance. */
  constructor(days: number, epsilon?: bigint);
  /** Original normalized DateTime difference constructor. @param start - Starting date-time. @param end - Ending date-time. @returns Initialized value. */
  constructor(start: DateTimeConstReference, end: DateTimeConstReference);
  /** Original Time difference constructor also admits duration hours beyond24. @param start - Starting clock. @param end - Ending clock. @returns Initialized value. */
  constructor(start: TimeConstReference, end: TimeConstReference);
  /** Original date-time or time-only difference overloads. @param start - Starting value. @param end - Ending value. @returns Initialized value. */
  constructor(
    start: number | TimeConstReference | DateTimeConstReference,
    end?: bigint | TimeConstReference | DateTimeConstReference,
  ) {
    if (typeof start === "number") {
      this.SetDays(start, typeof end === "bigint" ? end : Duration.kAccuracyEpsilonNanoseconds);
      return;
    }
    if (end === undefined || typeof end === "bigint") throw new Error("Duration end is missing.");
    if ("GetAsNormalizedDays" in start && "GetAsNormalizedDays" in end) {
      this.mnDays = end.GetAsNormalizedDays() - start.GetAsNormalizedDays();
      this.SetTimeDiff(start, end);
    } else {
      const startHour = start.GetHour(),
        endHour = end.GetHour();
      if (startHour >= 24 || endHour >= 24) {
        const aEnd = new Time(end),
          aStart = new Time(start);
        if (endHour >= 24) {
          this.mnDays = Math.trunc(endHour / 24) * (aEnd.GetTime() < 0n ? -1 : 1);
          aEnd.SetHour(endHour % 24);
        }
        if (startHour >= 24) {
          this.mnDays -= Math.trunc(startHour / 24) * (aStart.GetTime() < 0n ? -1 : 1);
          aStart.SetHour(startHour % 24);
        }
        this.SetTimeDiff(aStart, aEnd);
      } else this.SetTimeDiff(start, end);
    }
  }

  /** Separates whole days and reconciles near-second floating-point error. @param days - Serial days. @param epsilon - Nanosecond tolerance. */
  private SetDays(days: number, epsilon: bigint): void {
    const whole = days < 0 ? approxCeil(days) : approxFloor(days);
    this.mnDays = whole | 0;
    if (days < 0 ? whole <= days : whole >= days) return;
    let ns = BigInt(approxFloor((days - whole) * Number(Time.nanoSecPerDay)));
    const remainder = ns % Time.nanoSecPerSec;
    const magnitude = remainder < 0n ? -remainder : remainder;
    if (magnitude <= epsilon) ns -= remainder;
    else if (magnitude >= Time.nanoSecPerSec - epsilon) {
      const adjustment = Time.nanoSecPerSec - magnitude;
      ns += ns < 0n ? -adjustment : adjustment;
      this.mnDays += Number(ns / Time.nanoSecPerDay);
      ns %= Time.nanoSecPerDay;
    }
    this.maTime.MakeTimeFromNS(ns);
  }
  /** Original sign reconciliation between whole days and the time difference. @param nanoseconds - Signed time delta. @returns Nothing. */
  private ApplyTime(nanoseconds: bigint): void {
    let ns = nanoseconds;
    if (this.mnDays > 0 && ns < 0n) {
      this.mnDays--;
      ns = Time.nanoSecPerDay + ns;
    } else if (this.mnDays < 0 && ns > 0n) {
      this.mnDays++;
      ns = -Time.nanoSecPerDay + ns;
    }
    this.maTime.MakeTimeFromNS(ns);
  }
  /** Original signed nanosecond subtraction before normalization. @param start - Starting clock. @param end - Ending clock. @returns Nothing. */
  private SetTimeDiff(start: TimeConstReference, end: TimeConstReference): void {
    this.ApplyTime(end.GetNSFromTime() - start.GetNSFromTime());
  }
  /** Source sign test across both stored components. @returns Negative. */
  IsNegative(): boolean {
    return this.mnDays < 0 || this.maTime.GetTime() < 0n;
  }
  /** Source whole-day component. @returns Days. */
  GetDays(): number {
    return this.mnDays;
  }
  /** Borrows the source normalized Time subobject. @returns Time. */
  GetTime(): TimeConstReference {
    return this.maTime;
  }
  /** Source double result, adding the fractional part only after integer day subtraction. @returns Days. */
  GetInDays(): number {
    return this.GetDays() + this.GetTime().GetTimeInDays();
  }
}

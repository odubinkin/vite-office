/** @fileoverview Original tools::Duration Time/DateTime difference constructors and day/fraction result. Other duration arithmetic and floating input construction remain separate responsibilities. */
import { Time, type TimeConstReference } from "./ttime";
import type { DateTimeConstReference } from "./datetime";

/** Original day count and normalized Time owner used by DateTime::Sub. */
export class Duration {
  private mnDays = 0;
  private readonly maTime = new Time(Time.EMPTY);
  /** Original normalized DateTime difference constructor. @param start - Starting date-time. @param end - Ending date-time. @returns Initialized value. */
  constructor(start: DateTimeConstReference, end: DateTimeConstReference);
  /** Original Time difference constructor also admits duration hours beyond24. @param start - Starting clock. @param end - Ending clock. @returns Initialized value. */
  constructor(start: TimeConstReference, end: TimeConstReference);
  /** Original date-time or time-only difference overloads. @param start - Starting value. @param end - Ending value. @returns Initialized value. */
  constructor(
    start: TimeConstReference | DateTimeConstReference,
    end: TimeConstReference | DateTimeConstReference,
  ) {
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

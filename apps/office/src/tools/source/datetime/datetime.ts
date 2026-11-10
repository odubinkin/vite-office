/** @fileoverview Original DateTime scalar constructors and Duration-backed Sub; Time multiple inheritance is projected through one owned Time subobject. SYSTEM construction uses the shared local platform clock; platform precision/ABI remains unverified. */
import { GetSystemDateTime } from "./systemdatetime";
import { Date, type DateConstReference } from "./tdate";
import { Time, type TimeConstReference } from "./ttime";
import { Duration } from "./duration";
import { DateTime as UNODateTime } from "../../../offapi/com/sun/star/util/DateTime";

/** Original distinct SYSTEM constructor tag. */
const SYSTEM = Symbol("DateTimeInitSystem");

/** Borrowed source DateTime base-subobject methods used by Duration and calendar conversion. */
export interface DateTimeConstReference extends DateConstReference, TimeConstReference {}

/** Original Date and Time value state with independent native copying. */
// Type-only constructor projection permits the original C++ static SYSTEM tag
// hiding. The actual runtime base remains exactly Date, with no new value owner.
export class DateTime
  extends (Date as new (...args: ConstructorParameters<typeof Date>) => Date)
  implements DateTimeConstReference
{
  static readonly EMPTY = 0;
  static readonly SYSTEM: typeof SYSTEM = SYSTEM;
  private readonly maTime: Time;
  /** Original EMPTY, Time-only and UNO constructors. @param value - Tag, clock or published date-time. @returns Initialized value. */
  constructor(value: typeof DateTime.EMPTY | typeof SYSTEM | TimeConstReference | UNODateTime);
  /** Original Date, DateTime-copy or combined Date/Time construction. @param date - Copied Date subobject. @param time - Optional separate Time. @returns Initialized value. */
  constructor(date: DateConstReference, time?: TimeConstReference);
  /** Original EMPTY, Date, Time, DateTime copy and UNO scalar constructor families. @param input - Tag or source value. @param time - Time when a separate Date is supplied. @returns Initialized value. */
  constructor(
    input: number | typeof SYSTEM | DateConstReference | TimeConstReference | UNODateTime,
    time?: TimeConstReference,
  ) {
    let date: DateConstReference, clock: TimeConstReference;
    if (input === SYSTEM) {
      const packedDate: [number] = [0],
        packedTime: [bigint] = [0n];
      if (GetSystemDateTime(packedDate, packedTime)) {
        date = new Date(packedDate[0]);
        clock = Time.fromEncodedTime(packedTime[0]);
      } else {
        date = new Date(1, 1, 1900);
        clock = new Time(Time.EMPTY);
      }
    } else if (typeof input === "number") {
      date = new Date(0);
      clock = new Time(Time.EMPTY);
    } else if ("GetDate" in input) {
      date = input;
      clock =
        time ?? ("GetTime" in input ? (input as DateTimeConstReference) : new Time(Time.EMPTY));
    } else if ("GetTime" in input) {
      date = new Date(0);
      clock = input;
    } else {
      date = new Date(input.Day, input.Month, input.Year);
      clock = new Time(input);
    }
    super(date);
    this.maTime = new Time(clock);
  }
  /** Original static DateTime::Sub uses Duration if packed time differs, otherwise Date subtraction. @param first - Minuend. @param second - Subtrahend. @returns Difference in days. */
  static Sub(first: DateTimeConstReference, second: DateTimeConstReference): number {
    if (first.GetTime() !== second.GetTime()) return new Duration(second, first).GetInDays();
    return first.GetAsNormalizedDays() - second.GetAsNormalizedDays();
  }
  /** Reads the actual Time base value. @returns Packed signed64 time. */
  GetTime(): bigint {
    return this.maTime.GetTime();
  }
  /** Writes the actual Time base value. @param value - Packed signed64 time. @returns Nothing. */
  SetTime(value: bigint): void {
    this.maTime.SetTime(value);
  }
  /** Source hour forwarding. @returns Hour. */
  GetHour(): number {
    return this.maTime.GetHour();
  }
  /** Source minute forwarding. @returns Minute. */
  GetMin(): number {
    return this.maTime.GetMin();
  }
  /** Source second forwarding. @returns Second. */
  GetSec(): number {
    return this.maTime.GetSec();
  }
  /** Source nanosecond forwarding. @returns Nanoseconds. */
  GetNanoSec(): number {
    return this.maTime.GetNanoSec();
  }
  /** Source hour assignment. @param value - Hour. @returns Nothing. */
  SetHour(value: number): void {
    this.maTime.SetHour(value);
  }
  /** Source minute assignment. @param value - Minute. @returns Nothing. */
  SetMin(value: number): void {
    this.maTime.SetMin(value);
  }
  /** Source second assignment. @param value - Second. @returns Nothing. */
  SetSec(value: number): void {
    this.maTime.SetSec(value);
  }
  /** Source nanosecond assignment. @param value - Nanoseconds. @returns Nothing. */
  SetNanoSec(value: number): void {
    this.maTime.SetNanoSec(value);
  }
  /** Source nanosecond value. @returns Signed nanoseconds. */
  GetNSFromTime(): bigint {
    return this.maTime.GetNSFromTime();
  }
  /** Source Time day fraction. @returns Fractional days. */
  GetTimeInDays(): number {
    return this.maTime.GetTimeInDays();
  }
  /** Original UNO scalar export sets IsUTC false. @returns UNO date-time value. */
  GetUNODateTime(): UNODateTime {
    const output = new UNODateTime();
    output.NanoSeconds = this.GetNanoSec();
    output.Seconds = this.GetSec();
    output.Minutes = this.GetMin();
    output.Hours = this.GetHour();
    output.Day = this.GetDay();
    output.Month = this.GetMonth();
    output.Year = this.GetYear();
    return output;
  }
}

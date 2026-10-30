/** @fileoverview Original tools::Time packed scalar, component normalization and nanosecond/day conversion. GetClock follows the original decimal rounding/truncation path; platform clocks remain separate. */
import { approxFloor, round, pow10Exp } from "../../../sal/inc/rtl/math";
import type { DateTime as UNODateTime } from "../../../offapi/com/sun/star/util/DateTime";

/** Borrowed Time subobject contract used by DateTime and Duration. */
export interface TimeConstReference {
  /** Reads the packed signed64 value. @returns Packed time. */
  GetTime(): bigint;
  /** Reads the absolute UInt16 hour. @returns Hours. */
  GetHour(): number;
  /** Reads the absolute minute field. @returns Minutes. */
  GetMin(): number;
  /** Reads the absolute second field. @returns Seconds. */
  GetSec(): number;
  /** Reads the absolute fractional field. @returns Nanoseconds. */
  GetNanoSec(): number;
  /** Converts packed fields to signed elapsed nanoseconds. @returns Nanoseconds. */
  GetNSFromTime(): bigint;
  /** Converts elapsed nanoseconds to a day fraction. @returns Days. */
  GetTimeInDays(): number;
}
/** The common published UNO Time/DateTime clock fields consumed by Time constructors. */
type UNOTimeFields = Pick<UNODateTime, "Hours" | "Minutes" | "Seconds" | "NanoSeconds">;
const HOUR_MASK = 10000000000000n,
  MIN_MASK = 100000000000n,
  SEC_MASK = 1000000000n;
/** Native signed64 packed time value; bigint retains the source encoded decimal fields. */
export class Time implements TimeConstReference {
  static readonly EMPTY = 0;
  static readonly hourPerDay = 24n;
  static readonly minutePerHour = 60n;
  static readonly secondPerMinute = 60n;
  static readonly nanoSecPerSec = 1000000000n;
  static readonly nanoSecPerMinute = Time.nanoSecPerSec * Time.secondPerMinute;
  static readonly nanoSecPerHour = Time.nanoSecPerMinute * Time.minutePerHour;
  static readonly nanoSecPerDay = Time.nanoSecPerHour * Time.hourPerDay;
  static readonly secondPerHour = Time.secondPerMinute * Time.minutePerHour;
  static readonly secondPerDay = Time.secondPerHour * Time.hourPerDay;
  static readonly minutePerDay = Time.minutePerHour * Time.hourPerDay;
  static readonly nanoPerMicro = 1000n;
  static readonly nanoPerMilli = 1000000n;
  static readonly nanoPerCenti = 10000000n;
  static readonly milliSecPerSec = 1000n;
  static readonly milliSecPerMinute = 60000n;
  static readonly milliSecPerHour = 3600000n;
  static readonly milliSecPerDay = 86400000n;
  private nTime = 0n;
  /** Original EMPTY, copy and UNO clock-value constructors. @param source - Tag or clock value. @returns Initialized value. */
  constructor(source: typeof Time.EMPTY | TimeConstReference | UNOTimeFields);
  /** Original normalized component constructor. @param hour - UInt32 hours. @param minute - UInt32 minutes. @param second - UInt32 seconds. @param nanosecond - UInt64 nanoseconds. @returns Initialized value. */
  constructor(hour: number, minute: number, second?: number, nanosecond?: bigint);
  /** Original EMPTY, copy, UNO fields and normalized component constructors. @param first - Tag, source or hour. @param minute - Minutes. @param second - Seconds. @param nanosecond - Nanoseconds. @returns Initialized value. */
  constructor(
    first: number | TimeConstReference | UNOTimeFields,
    minute?: number,
    second = 0,
    nanosecond = 0n,
  ) {
    if (typeof first !== "number") {
      if ("GetTime" in first) this.nTime = first.GetTime();
      else
        this.nTime = new Time(
          first.Hours,
          first.Minutes,
          first.Seconds,
          BigInt(first.NanoSeconds >>> 0),
        ).GetTime();
      return;
    }
    if (minute === undefined) return;
    let h = BigInt(first >>> 0),
      m = BigInt(minute >>> 0),
      s = BigInt(second >>> 0),
      ns = BigInt.asUintN(64, nanosecond);
    if (ns >= Time.nanoSecPerSec) {
      s = BigInt.asUintN(32, s + ns / Time.nanoSecPerSec);
      ns %= Time.nanoSecPerSec;
    }
    if (s >= Time.secondPerMinute) {
      m = BigInt.asUintN(32, m + s / Time.secondPerMinute);
      s %= Time.secondPerMinute;
    }
    if (m >= Time.minutePerHour) {
      h = BigInt.asUintN(32, h + m / Time.minutePerHour);
      m %= Time.minutePerHour;
    }
    if (BigInt.asIntN(64, HOUR_MASK * h) < 0n) h = 922337n;
    if (h > 65535n) h = 65535n;
    this.nTime = Time.assemble(h, m, s, ns);
  }
  /** Original decimal field assembly. @param h - Hours. @param m - Minutes. @param s - Seconds. @param ns - Nanoseconds. @returns Packed time. */
  private static assemble(h: bigint, m: bigint, s: bigint, ns: bigint): bigint {
    return BigInt.asIntN(64, ns + s * SEC_MASK + m * MIN_MASK + h * HOUR_MASK);
  }
  /** Original date-fraction extraction, date-magnitude precision and clock-field truncation. @param days - Serial date/time. @param hour - UInt16 hour output. @param minute - UInt16 minute output. @param second - UInt16 second output. @param fraction - Fractional-second output. @param fractionDecimals - Signed32 requested precision. @returns Nothing. */
  static GetClock(
    days: number,
    hour: [number],
    minute: [number],
    second: [number],
    fraction: [number],
    fractionDecimals: number,
  ): void {
    fractionDecimals |= 0;
    const time = days - approxFloor(days);
    if (time <= 0 || time >= 1) {
      hour[0] = minute[0] = second[0] = 0;
      fraction[0] = 0;
      return;
    }
    const rawSeconds = time * Number(Time.secondPerDay);
    let decimals = 9;
    if (Math.abs(days) >= 1) {
      const digits = Math.ceil(Math.log10(Math.abs(days)));
      decimals = Math.min(9, Math.max(2, 10 - digits));
    }
    let seconds = round(rawSeconds, decimals);
    if (seconds >= Number(Time.secondPerDay)) seconds = rawSeconds;
    hour[0] = Math.trunc(seconds / Number(Time.secondPerHour)) & 65535;
    seconds -= hour[0] * Number(Time.secondPerHour);
    minute[0] = Math.trunc(seconds / Number(Time.secondPerMinute)) & 65535;
    seconds -= minute[0] * Number(Time.secondPerMinute);
    second[0] = Math.trunc(seconds) & 65535;
    seconds -= second[0];
    if (!(seconds < 1)) throw new Error("assert(fSeconds < 1.0)");
    if (fractionDecimals > 0) {
      fraction[0] = round(seconds, fractionDecimals);
      if (fraction[0] >= 1)
        fraction[0] = pow10Exp(Math.trunc(pow10Exp(seconds, fractionDecimals)), -fractionDecimals);
    } else fraction[0] = seconds;
  }
  /** Original encoded-value factory, without component normalization. @param value - Packed signed64 value. @returns Time. */
  static fromEncodedTime(value: bigint): Time {
    const time = new Time(Time.EMPTY);
    time.SetTime(value);
    return time;
  }
  /** Original packed setter. @param value - Packed signed64 value. @returns Nothing. */
  SetTime(value: bigint): void {
    this.nTime = BigInt.asIntN(64, value);
  }
  /** Original packed getter. @returns Packed signed64 value. */
  GetTime(): bigint {
    return this.nTime;
  }
  /** Original sign, including positive zero. @returns Sign. */
  private GetSign(): bigint {
    return this.nTime >= 0n ? 1n : -1n;
  }
  /** Absolute packed value for component reads. @returns Magnitude. */
  private magnitude(): bigint {
    return this.nTime < 0n ? -this.nTime : this.nTime;
  }
  /** Original UInt16 hour extraction. @returns Hours. */
  GetHour(): number {
    return Number(BigInt.asUintN(16, this.magnitude() / HOUR_MASK));
  }
  /** Original decimal minute extraction. @returns Minutes. */
  GetMin(): number {
    return Number((this.magnitude() / MIN_MASK) % 100n);
  }
  /** Original decimal second extraction. @returns Seconds. */
  GetSec(): number {
    return Number((this.magnitude() / SEC_MASK) % 100n);
  }
  /** Original fractional field extraction. @returns Nanoseconds. */
  GetNanoSec(): number {
    return Number(this.magnitude() % SEC_MASK);
  }
  /** Original sign-preserving hour replacement. @param value - UInt16 hour. @returns Nothing. */
  SetHour(value: number): void {
    this.nTime =
      this.GetSign() *
      Time.assemble(
        BigInt(value & 65535),
        BigInt(this.GetMin()),
        BigInt(this.GetSec()),
        BigInt(this.GetNanoSec()),
      );
  }
  /** Original minute replacement wraps modulo60 without carry. @param value - UInt16 minute. @returns Nothing. */
  SetMin(value: number): void {
    this.nTime =
      this.GetSign() *
      Time.assemble(
        BigInt(this.GetHour()),
        BigInt((value & 65535) % 60),
        BigInt(this.GetSec()),
        BigInt(this.GetNanoSec()),
      );
  }
  /** Original second replacement wraps modulo60 without carry. @param value - UInt16 second. @returns Nothing. */
  SetSec(value: number): void {
    this.nTime =
      this.GetSign() *
      Time.assemble(
        BigInt(this.GetHour()),
        BigInt(this.GetMin()),
        BigInt((value & 65535) % 60),
        BigInt(this.GetNanoSec()),
      );
  }
  /** Original nanosecond replacement wraps without carry. @param value - UInt32 nanoseconds. @returns Nothing. */
  SetNanoSec(value: number): void {
    this.nTime =
      this.GetSign() *
      Time.assemble(
        BigInt(this.GetHour()),
        BigInt(this.GetMin()),
        BigInt(this.GetSec()),
        BigInt((value >>> 0) % 1000000000),
      );
  }
  /** Original signed elapsed nanoseconds from the packed fields. @returns Nanoseconds. */
  GetNSFromTime(): bigint {
    return (
      this.GetSign() *
      (BigInt(this.GetNanoSec()) +
        BigInt(this.GetSec()) * Time.nanoSecPerSec +
        BigInt(this.GetMin()) * Time.nanoSecPerMinute +
        BigInt(this.GetHour()) * Time.nanoSecPerHour)
    );
  }
  /** Original sign extraction and component-constructor normalization. @param value - Signed64 nanoseconds. @returns Nothing. */
  MakeTimeFromNS(value: bigint): void {
    const ns = BigInt.asIntN(64, value),
      sign = ns < 0n ? -1n : 1n;
    this.nTime = new Time(0, 0, 0, ns < 0n ? -ns : ns).GetTime() * sign;
  }
  /** Original signed32 millisecond result narrowing. @returns Milliseconds. */
  GetMSFromTime(): number {
    return Number(BigInt.asIntN(32, this.GetNSFromTime() / Time.nanoPerMilli));
  }
  /** Original millisecond-to-nanosecond delegation. @param value - Signed32 milliseconds. @returns Nothing. */
  MakeTimeFromMS(value: number): void {
    this.MakeTimeFromNS(BigInt(value | 0) * Time.nanoPerMilli);
  }
  /** Original conversion through a double day denominator. @returns Fractional days. */
  GetTimeInDays(): number {
    return Number(this.GetNSFromTime()) / Number(Time.nanoSecPerDay);
  }
}

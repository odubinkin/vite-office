/** @fileoverview Packed Time normalization, native field widths and conversion boundaries. */
import { expect, it } from "vitest";
import { Time } from "./ttime";

it("normalizes constructor carries while retaining hours beyond one day", /** Checks constructor carry semantics and exact packed storage. @returns Nothing. */ () => {
  const value = new Time(23, 59, 59, 1000000001n);
  expect([value.GetHour(), value.GetMin(), value.GetSec(), value.GetNanoSec()]).toEqual([
    24, 0, 0, 1,
  ]);
  expect(value.GetTime()).toBe(240000000000001n);
  expect(value.GetNSFromTime()).toBe(86400000000001n);
  expect(new Time(65536, 0).GetHour()).toBe(65535);
  expect(new Time(0xffffffff, 60).GetTime()).toBe(0n);
  const wideNanoseconds = new Time(0, 0, 0, 18446744073709551615n);
  expect([
    wideNanoseconds.GetHour(),
    wideNanoseconds.GetMin(),
    wideNanoseconds.GetSec(),
    wideNanoseconds.GetNanoSec(),
  ]).toEqual([65535, 41, 29, 709551615]);
  expect(new Time(12, 0).GetTimeInDays()).toBe(0.5);
});

it("wraps component setters without carrying and preserves the packed sign", /** Checks the source setter/constructor distinction. @returns Nothing. */ () => {
  const value = Time.fromEncodedTime(-10203000000004n);
  value.SetMin(65);
  value.SetSec(61);
  value.SetNanoSec(1000000005);
  value.SetHour(2);
  expect([value.GetHour(), value.GetMin(), value.GetSec(), value.GetNanoSec()]).toEqual([
    2, 5, 1, 5,
  ]);
  expect(value.GetNSFromTime()).toBe(-7501000000005n);
  const copy = new Time(value);
  value.SetHour(3);
  expect(copy.GetHour()).toBe(2);
  expect(copy.GetTime() < 0n).toBe(true);
});

it("converts signed elapsed time and retains the signed32 millisecond result width", /** Checks exact negative milliseconds and native narrowing. @returns Nothing. */ () => {
  const value = new Time(Time.EMPTY);
  value.MakeTimeFromMS(-1001);
  expect(value.GetNSFromTime()).toBe(-1001000000n);
  expect(value.GetMSFromTime()).toBe(-1001);
  value.MakeTimeFromNS(-90061000000001n);
  expect([value.GetHour(), value.GetMin(), value.GetSec(), value.GetNanoSec()]).toEqual([
    25, 1, 1, 1,
  ]);
  expect(value.GetTimeInDays()).toBe(-90061000000001 / 86400000000000);
  expect(new Time(1000, 0).GetMSFromTime()).toBe(-694967296);
});

it.each([
  [0, 2, [0, 0, 0, 0]],
  [-0.25, 2, [18, 0, 0, 0]],
  [1.5, 2, [12, 0, 0, 0]],
  [59.99999 / 86400, 2, [0, 0, 59, 0.99]],
  [0.9999 / 86400, 2, [0, 0, 0, 0.99]],
  [1 + 1e-15, 2, [0, 0, 0, 0]],
])(
  "extracts the original clock from %s at precision %s",
  /** Source approximate-floor and truncated fractional carry operate through the actual RTL arithmetic owner. @param days - Serial value. @param precision - Fraction precision. @param expected - Original clock fields. @returns Nothing. */ (
    days,
    precision,
    expected,
  ) => {
    const hour: [number] = [0],
      minute: [number] = [0],
      second: [number] = [0],
      fraction: [number] = [0];
    Time.GetClock(days, hour, minute, second, fraction, precision);
    expect([hour[0], minute[0], second[0], fraction[0]]).toEqual(expected);
  },
);

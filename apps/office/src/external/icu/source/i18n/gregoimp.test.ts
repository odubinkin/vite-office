/** @fileoverview ICU proleptic Gregorian cycles, source error/output contracts and ClockMath edge cases. */
import { expect, it } from "vitest";
import { Date as ToolsDate } from "../../../../tools/source/datetime/tdate";
import { UErrorCode, U_FAILURE, U_SUCCESS } from "../common/unicode/utypes";
import { ClockMath, Grego, kOneDay } from "./gregoimp";

it("matches the independent tools calendar across eras and 400-year cycles", /** Checks actual field/day conversion against the tools owner rather than a copied formula. @returns Nothing. */ () => {
  const epoch = new ToolsDate(1, 1, 1970).GetAsNormalizedDays();
  for (const year of [
    -32766, -400, -100, -4, -1, 0, 1, 4, 100, 400, 1582, 1899, 1900, 1970, 2000, 2100, 32767,
  ]) {
    for (let month = 0; month < 12; month++) {
      for (const dom of [1, Grego.monthLength(year, month)]) {
        const day = Grego.fieldsToDay(year, month, dom),
          toolsYear = year <= 0 ? year - 1 : year;
        expect(Number(day)).toBe(
          new ToolsDate(dom, month + 1, toolsYear).GetAsNormalizedDays() - epoch,
        );
        const y: [number] = [0],
          m: [number] = [0],
          d: [number] = [0],
          w: [number] = [0],
          doy: [number] = [0],
          status: [number] = [0];
        Grego.dayToFields(Number(day), y, m, d, w, doy, status);
        expect([y[0], m[0], d[0], status[0]]).toEqual([year, month, dom, 0]);
        expect(w[0]).toBe(Grego.dayOfWeek(Number(day)));
        expect(doy[0]).toBe(Number(day - Grego.fieldsToDay(year, 0, 1)) + 1);
      }
    }
  }
  expect(Grego.fieldsToDay(-2147483648, 0, 1)).toBe(-784353015833n);
  expect(Grego.fieldsToDay(2147483647, 11, 31)).toBe(784351576776n);
});

it("preserves ICU warnings, incoming errors and the original partial output writes", /** Checks sticky status and native write order at checked overflow. @returns Nothing. */ () => {
  expect(U_SUCCESS(UErrorCode.U_USING_FALLBACK_WARNING)).toBe(true);
  expect(U_FAILURE(1)).toBe(true);
  for (const initial of [-128, 0, 1]) {
    const y: [number] = [111],
      m: [number] = [22],
      d: [number] = [33],
      w: [number] = [44],
      doy: [number] = [55],
      status: [number] = [initial];
    Grego.dayToFields(2147483647, y, m, d, w, doy, status);
    expect([y[0], m[0], d[0], w[0], doy[0], status[0]]).toEqual([0, 22, 33, 44, 55, 1]);
    status[0] = initial;
    Grego.dayToFields(0, y, m, d, w, doy, status);
    expect([y[0], m[0], d[0], w[0], doy[0], status[0]]).toEqual(
      initial > 0 ? [0, 22, 33, 44, 55, 1] : [1970, 0, 1, 5, 1, initial],
    );
  }
});

it("floors fractional negative milliseconds and retains the source subnormal behavior", /** Checks full/reduced overloads and pre-error millis output. @returns Nothing. */ () => {
  for (const [time, fields] of [
    [-0.25, [1969, 11, 31, 4, 365, 86399999]],
    [-86400000.25, [1969, 11, 30, 3, 364, 86399999]],
    [-Number.MIN_VALUE, [1970, 0, 1, 5, 1, -1]],
    [0.999, [1970, 0, 1, 5, 1, 0]],
  ] as const) {
    const y: [number] = [0],
      m: [number] = [0],
      d: [number] = [0],
      w: [number] = [0],
      doy: [number] = [0],
      mid: [number] = [0],
      status: [number] = [0];
    Grego.timeToFields(time, y, m, d, w, doy, mid, status);
    expect([y[0], m[0], d[0], w[0], doy[0], mid[0]]).toEqual(fields);
    expect(Grego.timeToYear(time, status)).toBe(y[0]);
    for (const withWeekday of [false, true]) {
      y[0] = 99;
      mid[0] = 99;
      if (withWeekday) Grego.timeToFields(time, y, m, d, w, mid, status);
      else Grego.timeToFields(time, y, m, d, mid, status);
      expect([y[0], m[0], d[0], mid[0]]).toEqual([fields[0], fields[1], fields[2], fields[5]]);
    }
  }
  const y: [number] = [111],
    m: [number] = [22],
    d: [number] = [33],
    mid: [number] = [66],
    status: [number] = [1];
  Grego.timeToFields(0, y, m, d, mid, status);
  expect([y[0], m[0], d[0], mid[0], status[0]]).toEqual([111, 22, 33, 66, 1]);
  status[0] = 0;
  Grego.timeToFields(2147483648 * kOneDay, y, m, d, mid, status);
  expect([y[0], m[0], d[0], mid[0], status[0]]).toEqual([111, 22, 33, 0, 1]);
});

it("keeps signed64 fields and source floor division/remainder rules", /** Checks boundaries beyond JS safe integer input and the double overload correction. @returns Nothing. */ () => {
  const rem: [number] = [99];
  expect(ClockMath.floorDivideInt32(-2147483648, 7, rem)).toBe(-306783379);
  expect(rem[0]).toBe(5);
  expect(ClockMath.floorDivideInt64(-9223372036854775808n, 7n)).toBe(-1317624576693539402n);
  expect(ClockMath.floorDivideDoubleInt32(-0.25, 86400000, rem)).toBe(-1);
  expect(rem[0]).toBe(86399999);
  expect(ClockMath.floorDivideDouble(6.7317038241449352e22, 86400000, rem)).toBe(779132387053811);
  expect(rem[0]).toBe(83886080);
  expect(ClockMath.floorDivideDouble(1e25, 86400000, rem)).toBe(115740740740740750);
  expect(rem[0]).toBe(0);
});

it("preserves native month occurrences and Julian conversions", /** Checks source last-weekday convention and epoch boundary floor. @returns Nothing. */ () => {
  expect(Grego.previousMonthLength(2000, 2)).toBe(29);
  expect(Grego.previousMonthLength(1900, 2)).toBe(28);
  expect(Grego.previousMonthLength(2000, 0)).toBe(31);
  expect(
    [1, 8, 15, 22, 29].map(
      /** Evaluates a weekday sequence in February. @param dom - Day of month. @returns Occurrence. */ (
        dom,
      ) => Grego.dayOfWeekInMonth(2024, 1, dom),
    ),
  ).toEqual([1, 2, 3, 4, -1]);
  expect(Grego.dayOfWeekInMonth(2023, 1, 22)).toBe(-1);
  expect(Grego.julianDayToMillis(2440588)).toBe(0);
  expect(Grego.millisToJulianDay(-0.25)).toBe(2440587);
  expect(Grego.gregorianShift(1582)).toBe(-10);
  expect(Grego.gregorianShift(0)).toBe(2);
});

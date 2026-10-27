/** @fileoverview Source DateTime copying and Duration-backed serial-day subtraction. */
import { expect, it } from "vitest";
import { DateTime as UNODateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { DateTime } from "./datetime";
import { Date } from "./tdate";
import { Time } from "./ttime";
import { Duration } from "./duration";

it("copies the two native base values independently and exports an unmarked UNO value", /** Checks copied Date/Time ownership and IsUTC output. @returns Nothing. */ () => {
  const date = new Date(2, 1, 2024),
    time = new Time(12, 34, 56, 789n),
    value = new DateTime(date, time);
  date.assign(new Date(3, 1, 2024));
  time.SetHour(20);
  const copy = new DateTime(value);
  value.SetHour(15);
  expect(copy.GetDay()).toBe(2);
  expect(copy.GetHour()).toBe(12);
  expect(copy.GetUNODateTime()).toEqual(
    Object.assign(new UNODateTime(), {
      Day: 2,
      Month: 1,
      Year: 2024,
      Hours: 12,
      Minutes: 34,
      Seconds: 56,
      NanoSeconds: 789,
      IsUTC: false,
    }),
  );
});

it("subtracts near-midnight values before converting the nanosecond delta to double", /** Checks the accuracy reason for the source Duration branch. @returns Nothing. */ () => {
  const first = new DateTime(new Date(2, 1, 2024), new Time(0, 0, 0, 1n)),
    second = new DateTime(new Date(1, 1, 2024), new Time(23, 59, 59, 999999999n));
  expect(DateTime.Sub(first, second)).toBe(2 / 86400000000000);
  expect(DateTime.Sub(second, first)).toBe(-2 / 86400000000000);
  const delta = new Duration(second, first);
  expect(delta.GetDays()).toBe(0);
  expect(delta.GetTime().GetNSFromTime()).toBe(2n);
  expect(delta.IsNegative()).toBe(false);
  expect(DateTime.Sub(new DateTime(new Date(2, 1, 2024)), new DateTime(new Date(1, 1, 2024)))).toBe(
    1,
  );
});

it("normalizes large signed Time differences into the source day and Time components", /** Checks the distinct Time overload, including negative operands. @returns Nothing. */ () => {
  const forward = new Duration(new Time(1, 0), new Time(50, 30)),
    backward = new Duration(new Time(50, 30), new Time(1, 0));
  expect(forward.GetDays()).toBe(2);
  expect(forward.GetTime().GetHour()).toBe(1);
  expect(forward.GetTime().GetMin()).toBe(30);
  expect(forward.GetInDays()).toBe(2.0625);
  expect(backward.GetInDays()).toBe(-2.0625);
  expect(backward.IsNegative()).toBe(true);
  const negativeStart = new Duration(Time.fromEncodedTime(-500000000000000n), new Time(Time.EMPTY));
  expect(negativeStart.GetDays()).toBe(2);
  expect(negativeStart.GetTime().GetHour()).toBe(2);
});

it("constructs empty, time-only and UNO values and forwards each clock mutation", /** Exercises public constructor families and borrowed Time forwarding. @returns Nothing. */ () => {
  expect(new DateTime(DateTime.EMPTY).GetDate()).toBe(0);
  const clock = new Time(4, 5, 6, 7n),
    value = new DateTime(clock);
  expect(value.GetDate()).toBe(0);
  expect(value.GetTime()).toBe(clock.GetTime());
  clock.SetMin(40);
  expect(value.GetMin()).toBe(5);
  const uno = Object.assign(new UNODateTime(), {
    Year: 2024,
    Month: 2,
    Day: 29,
    Hours: 12,
    Minutes: 3,
    Seconds: 4,
    NanoSeconds: 5,
  });
  const imported = new DateTime(uno);
  expect(imported.GetUNODateTime()).toEqual(uno);
  imported.SetMin(64);
  imported.SetSec(65);
  imported.SetNanoSec(1000000008);
  expect([imported.GetMin(), imported.GetSec(), imported.GetNanoSec()]).toEqual([4, 5, 8]);
  imported.SetTime(new Time(6, 0).GetTime());
  expect(imported.GetTimeInDays()).toBe(0.25);
});

it("reconciles signed short and multi-day Time duration operands", /** Checks direct Time subtraction and negative normalized day components. @returns Nothing. */ () => {
  expect(new Duration(new Time(1, 0), new Time(2, 30)).GetInDays()).toBe(1.5 / 24);
  const minusFifty = Time.fromEncodedTime(-new Time(50, 0).GetTime());
  const duration = new Duration(new Time(1, 0), minusFifty);
  expect(duration.GetInDays()).toBe(-51 / 24);
  expect(duration.GetDays()).toBe(-2);
  expect(duration.GetTime().GetNSFromTime()).toBe(-3n * Time.nanoSecPerHour);
  expect(new Time(1000000, 0).GetHour()).toBe(65535);
});

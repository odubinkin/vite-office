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

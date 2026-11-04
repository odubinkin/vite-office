/** @fileoverview Original SYSTEM DateTime and unconverted field serializer through the actual host clock boundary. */
import { afterEach, expect, it, vi } from "vitest";
import { DateTime } from "./datetime";
import { Date } from "./tdate";
import { Time } from "./ttime";
import { GetSystemDateTime } from "./systemdatetime";
import { DateTimeToOUString } from "./datetimeutils";
afterEach(
  /** Restores the platform clock after each case. @returns Nothing. */ () => vi.restoreAllMocks(),
);
it("packs both optional outputs from one actual platform sample", /** Local date/time agree across the single clock read. @returns Nothing. */ () => {
  const stamp = new globalThis.Date(2024, 5, 15, 7, 8, 9, 987).getTime(),
    now = vi.spyOn(globalThis.Date, "now").mockReturnValue(stamp),
    date: [number] = [0],
    time: [bigint] = [0n];
  expect(GetSystemDateTime(date, time)).toBe(true);
  expect(date).toEqual([20240615]);
  expect(time).toEqual([70809987000000n]);
  expect(now).toHaveBeenCalledTimes(1);
  expect(GetSystemDateTime(null, time)).toBe(true);
  expect(GetSystemDateTime(date, null)).toBe(true);
  expect(GetSystemDateTime(null, null)).toBe(true);
});
it("constructs actual independent Date/Time base values with SYSTEM", /** The new native constructor uses both outputs without an intervening clock sample. @returns Nothing. */ () => {
  vi.spyOn(globalThis.Date, "now").mockReturnValue(
    new globalThis.Date(2024, 5, 15, 7, 8, 9, 987).getTime(),
  );
  const value = new DateTime(DateTime.SYSTEM),
    copy = new DateTime(value);
  expect(value).toBeInstanceOf(Date);
  expect(DateTime.SYSTEM).not.toBe(Date.SYSTEM);
  expect(value.GetDate()).toBe(20240615);
  expect(value.GetTime()).toBe(70809987000000n);
  value.SetHour(20);
  expect(copy.GetHour()).toBe(7);
  expect(copy.GetNanoSec()).toBe(987000000);
});
it("preserves requested outputs on platform failure and uses original 1900 fallback", /** Actual failure path changes no caller output; native constructor supplies its own fallback. @returns Nothing. */ () => {
  vi.spyOn(globalThis.Date, "now").mockReturnValue(NaN);
  const date: [number] = [123],
    time: [bigint] = [456n];
  expect(GetSystemDateTime(date, time)).toBe(false);
  expect(date).toEqual([123]);
  expect(time).toEqual([456n]);
  const value = new DateTime(DateTime.SYSTEM);
  expect(value.GetDate()).toBe(19000101);
  expect(value.GetTime()).toBe(0n);
});
it.each([
  [new DateTime(new Date(2, 1, 2024), new Time(3, 4, 5, 999999999n)), "2024-01-02T03:04:05Z"],
  [new DateTime(DateTime.EMPTY), "0-00-00T00:00:00Z"],
  [new DateTime(new Date(2, 1, -1), new Time(123, 4, 5)), "-1-01-02T00:04:05Z"],
] as const)(
  "serializes native fields without conversion or fractions to %s",
  /** Checks original output and out-of-range two-digit behavior. @param value - Actual native scalar. @param expected - Literal source output. @returns Nothing. */ (
    value,
    expected,
  ) => {
    expect(DateTimeToOUString(value)).toBe(expected);
  },
);

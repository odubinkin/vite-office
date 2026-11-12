/** @fileoverview Actual generated metadata structs through shared Any/native Sequence layouts, copy semantics and original declared scalar widths. */
import { afterEach, assert, expect, it } from "vitest";
import { Date as UnoDate } from "./Date";
import { DateTime } from "./DateTime";
import { Duration, cppu_detail_getUnoType_Duration as durationType } from "./Duration";
import {
  DateWithTimezone,
  cppu_detail_getUnoType_DateWithTimezone as dateType,
} from "./DateWithTimezone";
import {
  DateTimeWithTimezone,
  cppu_detail_getUnoType_DateTimeWithTimezone as datetimeType,
} from "./DateTimeWithTimezone";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import { TypeDescription } from "../../../../../cppu/inc/typelib/typedescription.hxx";
import type { typelib_CompoundTypeDescription } from "../../../../../cppu/inc/typelib/typedescription";
import { own, read, releaseDomScope } from "../../../../../test/native-dom";
afterEach(releaseDomScope);
it("retains normal SDK names, native nested offsets and generated member widths", /** The actual shared typelib computes each layout. @returns Nothing. */ () => {
  for (const [getter, name, size, offsets] of [
    [durationType, "Duration", 20, [0, 2, 4, 6, 8, 10, 12, 16]],
    [dateType, "DateWithTimezone", 8, [0, 6]],
    [datetimeType, "DateTimeWithTimezone", 24, [0, 20]],
  ] as const) {
    const type = getter(),
      description = new TypeDescription(type.getTypeLibType());
    try {
      expect(getter()).toBe(type);
      expect(read(type.getTypeName())).toBe("com.sun.star.util." + name);
      const actual = description.get() as unknown as typelib_CompoundTypeDescription;
      expect(actual.aBase.nSize).toBe(size);
      assert(actual.pMemberOffsets);
      expect(Array.from(actual.pMemberOffsets)).toEqual(offsets);
    } finally {
      description.dispose();
    }
  }
  const duration = new Duration(true, 65536, 65537, -1, 2, 3, 4, 4294967297);
  expect([
    duration.Negative,
    duration.Years,
    duration.Months,
    duration.Days,
    duration.NanoSeconds,
  ]).toEqual([true, 0, 1, 65535, 1]);
  const copy = new Duration(duration);
  expect(copy.equals(duration)).toBe(true);
  copy.Seconds = 7;
  expect(copy.notEquals(duration)).toBe(true);
  copy.assign(duration);
  expect(copy.equals(duration)).toBe(true);
  expect(new Duration().Negative).toBe(false);
});
it("copies actual nested Date/DateTime values through Any and native sequence storage", /** No alternate field/default provider is supplied. @returns Nothing. */ () => {
  const date = new DateWithTimezone(new UnoDate(29, 2, 2024), 330),
    dateCopy = new DateWithTimezone(date),
    dt = new DateTimeWithTimezone(new DateTime(9, 8, 7, 6, 5, 4, 2023, false), -90),
    dtCopy = new DateTimeWithTimezone(dt);
  expect(dateCopy.equals(date)).toBe(true);
  expect(dtCopy.equals(dt)).toBe(true);
  date.DateInTZ.Day = 1;
  date.Timezone = 65535;
  dt.DateTimeInTZ.Hours = 1;
  dt.Timezone = 65536;
  expect(date.Timezone).toBe(-1);
  expect(dt.Timezone).toBe(0);
  expect(dateCopy.notEquals(date)).toBe(true);
  expect(dtCopy.notEquals(dt)).toBe(true);
  date.assign(dateCopy);
  dt.assign(dtCopy);
  expect(date.equals(dateCopy)).toBe(true);
  expect(dt.equals(dtCopy)).toBe(true);
  const a = own(new Any(date, dateType)),
    b = own(new Any(dt, datetimeType)),
    outDate = new DateWithTimezone(),
    outDT = new DateTimeWithTimezone();
  expect(a.extract(outDate, dateType)).toBe(true);
  expect(b.extract(outDT, datetimeType)).toBe(true);
  expect(outDate.equals(date)).toBe(true);
  expect(outDT.equals(dt)).toBe(true);
  const Dates = Sequence.specialize<DateWithTimezone>(dateType, 8),
    DatesTime = Sequence.specialize<DateTimeWithTimezone>(datetimeType, 24),
    dates = own(
      new Dates(
        {
          get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
            date,
        },
        1,
      ),
    ),
    datetimes = own(
      new DatesTime(
        {
          get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
            dt,
        },
        1,
      ),
    ),
    fromDate = own(new Any(dates.operatorIndex(0), dateType)),
    fromDT = own(new Any(datetimes.operatorIndex(0), datetimeType));
  expect(fromDate.operatorEquals(a)).toBe(true);
  expect(fromDT.operatorEquals(b)).toBe(true);
  expect(new DateWithTimezone().DateInTZ.Month).toBe(0);
  expect(new DateTimeWithTimezone().DateTimeInTZ.IsUTC).toBe(false);
});
it("retains duration compound values across actual sequence and Any copy/extract", /** The native struct occupies20 bytes with aligned nanoseconds. @returns Nothing. */ () => {
  const value = new Duration(true, 1, 2, 3, 4, 5, 6, 7),
    values = Sequence.specialize<Duration>(durationType, 20),
    sequence = own(
      new values(
        {
          get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
            value,
        },
        1,
      ),
    ),
    any = own(new Any(sequence.operatorIndex(0), durationType)),
    copy = new Duration();
  expect(any.extract(copy, durationType)).toBe(true);
  expect(copy.equals(value)).toBe(true);
  value.NanoSeconds = 9;
  expect(copy.NanoSeconds).toBe(7);
});

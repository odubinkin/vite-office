/** @fileoverview Original sax ConverterTest duration/dateTime/time entry-point assertions replay their exact UTF16 fixtures against actual generated values and OUStringBuffer owners. */
import { expect, it } from "vitest";
import fixture from "./converter-temporal-cases.json";
import { Converter } from "./converter";
import { Duration } from "../../../offapi/com/sun/star/util/Duration";
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { Date as UnoDate } from "../../../offapi/com/sun/star/util/Date";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
/** Original Duration fixture constructor. @param fields - Source eight arguments. @returns Actual expected generated value. */
function duration(fields: readonly (number | boolean)[]): Duration {
  return new Duration(
    fields[0] as boolean,
    fields[1] as number,
    fields[2] as number,
    fields[3] as number,
    fields[4] as number,
    fields[5] as number,
    fields[6] as number,
    fields[7] as number,
  );
}
/** Original DateTime fixture constructor. @param fields - Source eight arguments. @returns Actual expected generated value. */
function datetime(fields: readonly (number | boolean)[]): DateTime {
  return new DateTime(
    fields[0] as number,
    fields[1] as number,
    fields[2] as number,
    fields[3] as number,
    fields[4] as number,
    fields[5] as number,
    fields[6] as number,
    fields[7] as boolean,
  );
}
/** Original returned string scope. @param buffer - Actual buffer. @returns Observed text. */
function take(buffer: OUStringBuffer): string {
  const result = buffer.makeStringAndClear();
  try {
    return text(result);
  } finally {
    result.dispose();
  }
}
it("ports all original ConverterTest::testDuration successful and failing cases", /** Retains original helper fields/equality/format criteria. @returns Nothing. */ () => {
  for (const item of fixture.groups.duration.valid) {
    const output = new Duration(),
      input = unicode(item.input),
      buffer = new OUStringBuffer(64);
    try {
      expect(Converter.convertDuration(output, input), item.input).toBe(true);
      expect(output.equals(duration(item.fields)), item.input).toBe(true);
      Converter.convertDuration(buffer, output);
      expect(take(buffer), item.input).toBe(item.output);
    } finally {
      buffer.dispose();
      input.dispose();
    }
  }
  for (const input of fixture.groups.duration.invalid)
    expect(Converter.convertDuration(new Duration(), input), input).toBe(false);
});
it.each(["datetime", "time"] as const)(
  "ports every original ConverterTest %s parse/field/format/reject case",
  /** Uses the same selected source overload and output comparison. @param group - Source test group. @returns Nothing. */ (
    group,
  ) => {
    for (const item of fixture.groups[group].valid) {
      const output = new DateTime(),
        input = unicode(item.input),
        buffer = new OUStringBuffer(32);
      try {
        expect(
          group === "datetime"
            ? Converter.parseDateTime(output, input)
            : Converter.parseTimeOrDateTime(output, input),
          item.input,
        ).toBe(true);
        expect(output.equals(datetime(item.fields)), item.input).toBe(true);
        if (group === "datetime") Converter.convertDateTime(buffer, output, null, true);
        else Converter.convertTimeOrDateTime(buffer, output);
        expect(take(buffer), item.input).toBe(item.output);
      } finally {
        buffer.dispose();
        input.dispose();
      }
    }
    for (const input of fixture.groups[group].invalid)
      expect(
        group === "datetime"
          ? Converter.parseDateTime(new DateTime(), input)
          : Converter.parseTimeOrDateTime(new DateTime(), input),
        input,
      ).toBe(false);
  },
);
it("preserves Date versus DateTime destinations and optional raw timezone without UTC adjustment", /** Actual field objects remain independent. @returns Nothing. */ () => {
  const date = new UnoDate(9, 8, 2007),
    time = new DateTime(8, 7, 6, 5, 4, 3, 2002, true),
    kind: [boolean] = [true],
    zone: [number | undefined] = [777],
    before = new DateTime(time);
  expect(Converter.parseDateOrDateTime(date, time, kind, zone, "2024-02-29+05:30")).toBe(true);
  expect(date.equals(new UnoDate(29, 2, 2024))).toBe(true);
  expect(time.equals(before)).toBe(true);
  expect(kind[0]).toBe(false);
  expect(zone[0]).toBe(330);
  expect(Converter.parseDateOrDateTime(date, time, kind, zone, "2024-02-29T03:04:05-01:30")).toBe(
    true,
  );
  expect([time.Hours, time.Minutes, time.IsUTC, zone[0], kind[0]]).toEqual([
    3,
    4,
    false,
    -90,
    true,
  ]);
  expect(Converter.parseDateOrDateTime(date, time, kind, zone, "2024-02-29T03:04:05Z")).toBe(true);
  expect([time.IsUTC, zone[0]]).toEqual([true, 0]);
  expect(Converter.parseDateOrDateTime(date, time, kind, zone, "2024-02-29")).toBe(true);
  expect(zone[0]).toBeUndefined();
  expect(Converter.parseDateOrDateTime(date, time, kind, zone, "2024-02-29T03:04:05")).toBe(true);
  expect(time.IsUTC).toBe(false);
  expect(zone[0]).toBeUndefined();
});
it("retains all caller outputs on invalid date/duration input and preserves declared short duration overflow", /** No replacement defaults or private state changes. @returns Nothing. */ () => {
  const d = new Duration(true, 1, 2, 3, 4, 5, 6, 7),
    before = new Duration(d),
    date = new UnoDate(1, 2, 2003),
    time = new DateTime(1, 2, 3, 4, 5, 6, 2007, true),
    oldTime = new DateTime(time),
    kind: [boolean] = [true],
    zone: [number | undefined] = [777];
  for (const input of ["", "-", "P", "PT", "P1DT", "PT1.1", "PT1.1Q", "PT1M1H", "P2147483647Y"]) {
    expect(Converter.convertDuration(d, input), input).toBe(false);
    expect(d.equals(before)).toBe(true);
  }
  expect(Converter.convertDuration(d, "p65536y")).toBe(true);
  expect(d.Years).toBe(0);
  expect(d.Negative).toBe(false);
  expect(Converter.parseDateOrDateTime(date, time, kind, zone, "2024-02-30Z")).toBe(false);
  expect(date.equals(new UnoDate(1, 2, 2003))).toBe(true);
  expect(time.equals(oldTime)).toBe(true);
  expect(kind[0]).toBe(true);
  expect(zone[0]).toBe(777);
});
it("keeps original formatter decisions, explicit timezone precedence and signed zero-duration form", /** The nanosecond-only default omission is source behavior. @returns Nothing. */ () => {
  const buffer = new OUStringBuffer(),
    value = new DateTime(9, 0, 0, 0, 2, 1, 2024, true);
  try {
    Converter.convertDateTime(buffer, value, null);
    expect(take(buffer)).toBe("2024-01-02Z");
    Converter.convertDateTime(buffer, value, [330], true);
    expect(take(buffer)).toBe("2024-01-02T00:00:00.000000009+05:30");
    Converter.convertDate(buffer, new UnoDate(2, 1, -1), [-840]);
    expect(take(buffer)).toBe("-0001-01-02-14:00");
    Converter.convertDuration(buffer, new Duration(true, 0, 0, 0, 0, 0, 0, 0));
    expect(take(buffer)).toBe("-P0D");
    buffer.append(OUString.number(7));
    Converter.convertDateTime(buffer, new DateTime(), [0]);
    expect(take(buffer)).toBe("70000-00-00Z");
  } finally {
    buffer.dispose();
  }
});

it("preserves source signed64-reader overflow-to-zero in a duration component", /** Shared RTL conversion is observed directly through the real converter. @returns Nothing. */ () => {
  const output = new Duration();
  expect(Converter.convertDuration(output, "P9223372036854775808Y")).toBe(true);
  expect(output.Years).toBe(0);
});

it("uses native scalar buffer overloads and borrowed UTF16 parser suffixes", /** Scalar formats reuse actual RTL/string owners. @returns Nothing. */ () => {
  const buffer = new OUStringBuffer(),
    input = unicode("12字"),
    truth = unicode("true"),
    spaced = unicode(" true");
  try {
    Converter.convertBool(buffer, true);
    Converter.convertBool(buffer, false);
    Converter.convertDouble(buffer, 42.5);
    expect(take(buffer)).toBe("truefalse42.5");
    const number: [number] = [0],
      rest: [Uint16Array] = [new Uint16Array()];
    expect(Converter.convertDouble(number, input, rest)).toBe(true);
    expect(number[0]).toBe(12);
    expect(Array.from(rest[0])).toEqual([23383]);
    const bool: [boolean] = [false];
    expect(Converter.convertBool(bool, truth.getStr().subarray(0, truth.getLength()))).toBe(true);
    expect(bool[0]).toBe(true);
    expect(Converter.convertBool(bool, spaced)).toBe(false);
    expect(bool[0]).toBe(false);
    const date = new UnoDate(),
      datetime = new DateTime(),
      kind: [boolean] = [true];
    expect(Converter.parseDateOrDateTime(date, datetime, kind, null, "2024-01-02+05:30")).toBe(
      true,
    );
    expect(date.Day).toBe(2);
    expect(kind[0]).toBe(false);
    expect(Converter.parseDateOrDateTime(date, datetime, kind, null, "2024-01-03")).toBe(true);
    expect(date.Day).toBe(3);
  } finally {
    spaced.dispose();
    truth.dispose();
    input.dispose();
    buffer.dispose();
  }
});

it("preserves original UTC rollover through year zero without repairing the strict parser contract", /** Native scalar arithmetic is observed through public converter calls. @returns Nothing. */ () => {
  const value = new DateTime();
  expect(Converter.parseDateTime(value, "-0001-12-31T23:00:00-02:00")).toBe(true);
  expect([value.Year, value.Month, value.Day, value.Hours]).toEqual([0, 1, 1, 1]);
  const buffer = new OUStringBuffer();
  try {
    Converter.convertDateTime(buffer, value, null, true);
    const serialized = take(buffer);
    expect(serialized).toBe("0000-01-01T01:00:00Z");
    expect(Converter.parseDateTime(new DateTime(), serialized)).toBe(false);
  } finally {
    buffer.dispose();
  }
});

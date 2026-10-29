/** @fileoverview Original Date normalization QA examples and native width/BCE/boundary contracts over genuine Date values and shared comphelper algorithms. */
import { expect, it, vi } from "vitest";
import {
  convertDateToDays,
  convertDateToDaysNormalizing,
  convertDaysToDate,
  getDaysInMonth,
  isLeapYear,
  isValidDate,
  normalize,
  yearToDays,
  type DateFields,
} from "../../../comphelper/source/misc/date";
import { Date } from "./tdate";
import { GetSystemDateTime } from "./systemdatetime";

it("counts source Gregorian days through the BCE boundary and Calc null date", /** Checks counts source Gregorian days through the BCE boundary and Calc null date. @returns Test completion or assertion result. */ () => {
  expect(yearToDays(-2)).toBe(-731);
  expect(yearToDays(-1)).toBe(-366);
  expect(yearToDays(1)).toBe(0);
  expect(yearToDays(2)).toBe(365);
  expect(
    /** Enforces the native civil-year precondition. @returns No day count. */ () => yearToDays(0),
  ).toThrow("year != 0 assertion");
  expect(convertDateToDays(1, 1, -32768)).toBe(-11968265);
  expect(convertDateToDays(31, 12, 32767)).toBe(11967900);
  expect(convertDateToDays(30, 12, 1899)).toBe(693594);
  expect(convertDateToDaysNormalizing(30, 12, 1899)).toBe(693594);
  expect(convertDateToDaysNormalizing(31, 2, 2024)).toBe(convertDateToDays(2, 3, 2024));
  const source = new Date(31, 2, 2024);
  expect(source.GetAsNormalizedDays()).toBe(convertDateToDays(2, 3, 2024));
  expect(source.GetDate()).toBe(20240231);
  expect(new Date(30, 12, 1899).GetAsNormalizedDays()).toBe(693594);
  expect(convertDaysToDate(0)).toEqual([31, 12, -1]);
  expect(convertDaysToDate(1)).toEqual([1, 1, 1]);
  expect(convertDaysToDate(-11968266)).toEqual([1, 1, -32768]);
  expect(convertDaysToDate(11967901)).toEqual([31, 12, 32767]);
  for (const fields of [
    [1, 1, -32768],
    [29, 2, -1],
    [31, 12, -1],
    [1, 1, 1],
    [29, 2, 2000],
    [31, 12, 32767],
  ] as DateFields[])
    expect(convertDaysToDate(convertDateToDays(...fields))).toEqual(fields);
  const incremented = new Date(30, 12, 1899);
  incremented.AddDays(1);
  expect(incremented.GetDate()).toBe(18991231);
  incremented.AddDays(1);
  expect(incremented.GetDate()).toBe(19000101);
  incremented.AddDays(-2);
  expect(incremented.GetDate()).toBe(18991230);
  incremented.AddDays(0);
  expect(incremented.GetDate()).toBe(18991230);
});

it("round-trips month ends across Gregorian century and BCE boundaries", /** Checks civil dates independently of the search estimate used to recover their year. @returns Nothing. */ () => {
  for (const year of [
    -401, -400, -101, -100, -5, -4, -2, -1, 1, 4, 99, 100, 399, 400, 1899, 1900, 1999, 2000, 2024,
  ]) {
    for (let month = 1; month <= 12; month++) {
      const last = getDaysInMonth(month, year);
      for (const day of [1, last]) {
        expect(convertDaysToDate(convertDateToDays(day, month, year))).toEqual([day, month, year]);
      }
    }
  }
});

it("retains packed value/copy/member assignment and constructor width/precondition contracts", /** Raw construction is not eager normalization or a host Date conversion. @returns Nothing. */ () => {
  const invalid = new Date(31, 2, 2023),
    copy = new Date(invalid),
    assigned = new Date(0).assign(copy);
  expect(invalid.GetDate()).toBe(20230231);
  expect(invalid.IsValidDate()).toBe(false);
  invalid.Normalize();
  expect(invalid.GetDate()).toBe(20230303);
  expect(copy.GetDate()).toBe(20230231);
  expect(assigned.GetDate()).toBe(20230231);
  expect(new Date(0x100000000).IsEmpty()).toBe(true);
  expect(new Date(65537, 65537, 65535).GetDate()).toBe(-10101);
  expect(new Date(-327680101).GetYear()).toBe(-32768);
  for (const fields of [
    [1, 100, 1],
    [100, 1, 1],
  ])
    expect(
      /** Original DMY packing assertions. @returns Constructed value. */ () =>
        new Date(...(fields as DateFields)),
    ).toThrow(/representability/);
});

it("preserves source leap/month/validity policy including BCE leap years", /** Invalid year/month assert only at the original helper preconditions. @returns Nothing. */ () => {
  for (const [year, leap] of [
    [2000, true],
    [2004, true],
    [1900, false],
    [2001, false],
    [-1, true],
    [-2, false],
    [-101, false],
    [-401, true],
  ] as const)
    expect(isLeapYear(year)).toBe(leap);
  expect(getDaysInMonth(1, 2000)).toBe(31);
  expect(getDaysInMonth(2, 2000)).toBe(29);
  expect(getDaysInMonth(2, 1900)).toBe(28);
  expect(/** Original year-zero assertion. @returns Leap status. */ () => isLeapYear(0)).toThrow(
    /year/,
  );
  for (const month of [0, 13])
    expect(
      /** Original month-range assertion. @returns Month length. */ () =>
        getDaysInMonth(month, 2000),
    ).toThrow(/month/);
  for (const fields of [
    [1, 1, 0],
    [1, 0, 2000],
    [1, 13, 2000],
    [0, 1, 2000],
    [32, 1, 2000],
    [29, 2, 1900],
  ] as DateFields[])
    expect(isValidDate(...fields)).toBe(false);
  expect(isValidDate(29, 2, 2000)).toBe(true);
});

it("retains original tools QA normalization examples and native BCE/short-overflow behavior", /** Includes DateTest::testNormalize and further boundaries of the original normalize branches. @returns Nothing. */ () => {
  for (const [input, expected] of [
    [
      [32, 12, 1999],
      [1, 1, 2000],
    ],
    [
      [32, 2, 1999],
      [4, 3, 1999],
    ],
    [
      [1, 13, 1999],
      [1, 1, 2000],
    ],
    [
      [42, 13, 1999],
      [11, 2, 2000],
    ],
    [
      [1, 0, 1],
      [1, 12, -1],
    ],
    [
      [0, 1, 2000],
      [31, 12, 1999],
    ],
    [
      [0, 0, 2000],
      [31, 12, 1999],
    ],
    [
      [1, 24, -2],
      [1, 12, -1],
    ],
    [
      [1, 13, -1],
      [1, 1, 1],
    ],
    [
      [32, 3, -2],
      [1, 2, -2],
    ],
    [
      [32, 1, -2],
      [1, 12, -3],
    ],
    [
      [32, 1, -32768],
      [1, 1, -32768],
    ],
    [
      [32, 12, 32767],
      [31, 12, 32767],
    ],
    [
      [1, 13, 32767],
      [1, 1, -32768],
    ],
    [
      [1, 0, -32768],
      [1, 12, 32767],
    ],
    [
      [1, 1, 0],
      [1, 1, 0],
    ],
  ] as [DateFields, DateFields][]) {
    const fields: DateFields = [...input];
    expect(normalize(fields)).toBe(true);
    expect(fields).toEqual(expected);
    const date = new Date(...input);
    date.Normalize();
    expect([date.GetDay(), date.GetMonth(), date.GetYear()]).toEqual(expected);
  }
  for (const fields of [
    [0, 0, 0],
    [1, 1, 2000],
  ] as DateFields[]) {
    expect(normalize(fields)).toBe(false);
    const date = new Date(...fields);
    const packed = date.GetDate();
    date.Normalize();
    expect(date.GetDate()).toBe(packed);
  }
});

it("preserves caller output and the source 1900 fallback when the host clock cannot form a date", /** Only the platform clock boundary is controlled; Date packing and fallback owners execute normally. @returns Nothing. */ () => {
  const clock = vi.spyOn(globalThis.Date, "now").mockReturnValue(8_640_000_000_000_001);
  try {
    const output: [number] = [123456];
    expect(GetSystemDateTime(output, null)).toBe(false);
    expect(output[0]).toBe(123456);
    expect(new Date(Date.SYSTEM).GetDate()).toBe(19000101);
    clock.mockReturnValue(new globalThis.Date(2024, 5, 15, 12).getTime());
    expect(GetSystemDateTime(output, null)).toBe(true);
    expect(output[0]).toBe(20240615);
    expect(new Date(Date.SYSTEM).GetDate()).toBe(20240615);
  } finally {
    clock.mockRestore();
  }
});

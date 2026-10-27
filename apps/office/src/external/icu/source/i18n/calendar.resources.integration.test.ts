/** @fileoverview Exercises actual Calendar week-data loading over valid alternative regional vectors and explicit resource-read failures. */
import { afterEach, expect, it, vi } from "vitest";
import { GregorianCalendar } from "./gregocal";
import { SimpleTimeZone } from "./simpletz";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";
import * as resources from "../common/uresbund";
import { UErrorCode as E } from "../common/unicode/utypes";
import { UCalendarWeekdayType as T } from "./unicode/ucal";

/** Exposes only the original protected data-load entrypoint. */
class WeekCalendar extends GregorianCalendar {
  /** Constructs a real UTC owner before any resource fault is installed. @returns Calendar. */
  constructor() {
    super(new SimpleTimeZone(0, new UnicodeString("UTC")), Locale.getUS(), [0]);
    this.setTime(0, [0]);
  }
  /** Uses original resource semantics with a real desired locale. @param locale - Desired ID. @param status - Source status. @returns Nothing. */
  load(locale: string, status: [number]): void {
    this.setWeekData(new Locale(locale), "gregorian", status);
  }
}

afterEach(
  /** Restores the resource boundary after every independently owned scenario. @returns Nothing. */ () => {
    vi.restoreAllMocks();
  },
);

/** Supplies alternative valid CLDR data at the resource-reader boundary, after running the actual lookup. @param values - Six native week/weekend fields. @returns Nothing. */
function weekData(values: readonly number[]): void {
  const original = resources.ures_getIntVector;
  vi.spyOn(resources, "ures_getIntVector").mockImplementation(
    /** Substitutes only the actual six-field weekData vector. @param bundle - Actual resource handle. @param length - Length output. @param status - Source status. @returns Real data or selected regional vector. */ (
      bundle,
      length,
      status,
    ) => {
      const actual = original(bundle, length, status);
      if (actual?.length === 6 && status !== null && status[0] <= 0) {
        if (length) length[0] = values.length;
        return values;
      }
      return actual;
    },
  );
}

it.each([
  [
    [2, 4, 6, 64800000, 1, 21600000],
    [T.UCAL_WEEKEND_ONSET, T.UCAL_WEEKEND, T.UCAL_WEEKEND_CEASE],
  ],
  [
    [2, 4, 6, 0, 6, 86400000],
    [T.UCAL_WEEKEND, T.UCAL_WEEKDAY, T.UCAL_WEEKDAY],
  ],
  [
    [2, 4, 6, 64800000, 6, 86400000],
    [T.UCAL_WEEKEND_ONSET, T.UCAL_WEEKDAY, T.UCAL_WEEKDAY],
  ],
  [
    [2, 4, 2, 64800000, 4, 21600000],
    [T.UCAL_WEEKDAY, T.UCAL_WEEKDAY, T.UCAL_WEEKDAY],
  ],
] as const)(
  "classifies a valid regional week vector %j",
  /** Actual owner state must follow resource data rather than assuming full Saturday/Sunday weekends. @param vector - Valid regional fields. @param expected - Friday/Saturday/Sunday classifications. @returns Nothing. */ (
    vector,
    expected,
  ) => {
    const value = new WeekCalendar(),
      status: [number] = [0];
    weekData(vector);
    value.load("en_US", status);
    expect(status[0]).toBe(0);
    expect(
      [6, 7, 1].map(
        /** Reads original day classification. @param day - Native weekday. @returns Classification. */ (
          day,
        ) => value.getDayOfWeekType(day, [0]),
      ),
    ).toEqual(expected);
    for (const [hour, wanted] of [
      [17, false],
      [18, true],
      [23, true],
    ] as const) {
      value.setTime(Date.UTC(2024, 0, 5, hour), [0]);
      expect(value.isWeekend()).toBe(vector[2] === 6 ? vector[3] === 0 || wanted : false);
    }
    if (vector[4] === 1) {
      expect(value.isWeekend(Date.UTC(2024, 0, 7, 5), [0])).toBe(true);
      expect(value.isWeekend(Date.UTC(2024, 0, 7, 6), [0])).toBe(false);
    }
  },
);

it("converts unavailable supplemental resources into the original fallback warning", /** A failed resource dependency keeps usable original defaults and does not pretend the load succeeded. @returns Nothing. */ () => {
  const value = new WeekCalendar(),
    original = resources.ures_getByKey,
    status: [number] = [0];
  vi.spyOn(resources, "ures_getByKey").mockImplementation(
    /** Injects an unavailable supplemental table through the actual reader's failure channel. @param bundle - Actual owner. @param key - Lookup key. @param output - Reused result. @param result - Status. @returns Actual result or missing table. */ (
      bundle,
      key,
      output,
      result,
    ) => {
      const actual = original(bundle, key, output, result);
      if (key === "weekData") {
        if (result) result[0] = E.U_FILE_ACCESS_ERROR;
        return null;
      }
      return actual;
    },
  );
  value.load("en_US", status);
  expect(status[0]).toBe(E.U_USING_FALLBACK_WARNING);
  expect([value.getFirstDayOfWeek(), value.getMinimalDaysInFirstWeek()]).toEqual([1, 1]);
});

it.each([
  { vector: [2, 4] },
  { vector: [0, 4, 7, 0, 1, 86400000] },
  { vector: [2, 4, 7, 0, 8, 86400000] },
])(
  "rejects malformed regional week vector $vector",
  /** Invalid payloads report source format failure before applying the independent fw override. @param vector - Invalid resource data. @returns Nothing. */ ({
    vector,
  }) => {
    const value = new WeekCalendar(),
      status: [number] = [0];
    weekData(vector);
    value.load("en_US@fw=wed", status);
    expect(status[0]).toBe(E.U_INVALID_FORMAT_ERROR);
    expect(value.getFirstDayOfWeek()).toBe(4);
  },
);

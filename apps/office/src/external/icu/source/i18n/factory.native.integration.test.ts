/** @fileoverview Replays independently compiled ICU78.3 Calendar factory/cache/locale and bounded native type-buffer observations. */
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import observations from "./factory.native-observations.json";
import { observeCalendarFactory } from "../../../../test/icu-calendar-factory";
import { Locale } from "../common/locid";
import { UnicodeString } from "../common/unistr";
import { SimpleTimeZone } from "./simpletz";
import { createDefault, adoptDefault } from "./timezone.default";
import { SharedCalendar } from "./sharedcalendar";
import { GregorianCalendar } from "./gregocal";
import { JapaneseCalendar } from "./japancal";
import { UCalendarDateFields as F } from "./unicode/ucal";
const previousLocale = new Locale(Locale.getDefault()),
  previousZone = createDefault();
beforeAll(
  /** Reproduces the original native process's explicit defaults and current-era clock date. @returns Nothing. */ () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(observations.capturedAt));
    Locale.setDefault(new Locale("en_US"), [0]);
    adoptDefault(new SimpleTimeZone(0, new UnicodeString("UTC")));
  },
);
afterAll(
  /** Restores caller-visible host defaults. @returns Nothing. */ () => {
    adoptDefault(previousZone);
    Locale.setDefault(previousLocale, [0]);
    vi.useRealTimers();
  },
);
it("matches original default, locale, adopted/reference timezone and type-buffer overloads", /** Native expected rows include complete timezone IDs, all24 calendar fields, fallback warnings, sticky failures and untouched buffer suffixes. @returns Nothing. */ () => {
  expect(observations.cases.length).toBeGreaterThan(1000);
  for (const [query, output] of observations.cases)
    expect(observeCalendarFactory(query as string), query).toBe(output);
});

it("keeps an independent calendar clone alive after the real shared wrapper releases its last hard reference", /** Uses actual SharedObject ownership and the original adopted Calendar; no post-destruction pointer is dereferenced. @returns Nothing. */ () => {
  const status: [number] = [0],
    calendar = new GregorianCalendar(new Locale("en_US"), status);
  calendar.setTime(1709164800000, status);
  const shared = new SharedCalendar(calendar);
  shared.addRef();
  expect(shared.get()).toBe(calendar);
  const clone = shared.get().clone();
  shared.removeRef();
  expect(clone.getTime(status)).toBe(1709164800000);
  expect(clone.get(F.UCAL_DATE, status)).toBe(29);
  expect(status[0]).toBeLessThanOrEqual(0);
});

it("exposes the initialized current Japanese era from the pinned era table", /** The native fixture clock is after the2019 Reiwa boundary; public field completion independently checks that era's actual date projection. @returns Nothing. */ () => {
  const status: [number] = [0],
    calendar = new JapaneseCalendar(new Locale("ja_JP"), status);
  calendar.adoptTimeZone(new SimpleTimeZone(0, new UnicodeString("UTC")));
  calendar.setTime(1709164800000, status);
  expect(JapaneseCalendar.getCurrentEra()).toBe(236);
  expect(calendar.get(F.UCAL_ERA, status)).toBe(236);
  expect(calendar.get(F.UCAL_YEAR, status)).toBe(6);
  expect(status[0]).toBeLessThanOrEqual(0);
});

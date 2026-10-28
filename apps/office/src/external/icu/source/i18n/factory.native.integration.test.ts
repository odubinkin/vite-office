/** @fileoverview Replays independently compiled ICU78.3 Calendar factory/cache/locale and bounded native type-buffer observations. */
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import observations from "./factory.native-observations.json";
import { observeCalendarFactory } from "../../../../test/icu-calendar-factory";
import { Locale } from "../common/locid";
import { UnicodeString } from "../common/unistr";
import { SimpleTimeZone } from "./simpletz";
import { createDefault, adoptDefault } from "./timezone.default";
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

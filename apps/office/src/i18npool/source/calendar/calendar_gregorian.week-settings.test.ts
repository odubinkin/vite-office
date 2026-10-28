/** @fileoverview Source-contract checks for the loaded minimum-week scalar independently of ICU byte narrowing. */
import { expect, it } from "vitest";
import { Calendar_gregorian } from "./calendar_gregorian";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";

it.each([
  [0, 0],
  [1, 1],
  [7, 7],
  [8, 8],
  [255, 255],
  [256, 256],
  [32767, 32767],
  [32768, -32768],
  [65535, -1],
  [65536, 0],
  [-1, -1],
] as const)(
  "retains signed16 requested minimum week days %i as %i",
  /** The source getter returns its stored request rather than ICU's clamped/narrowed byte. @param requested - UNO signed16 input before host narrowing. @param stored - Source scalar expectation. @returns Nothing. */ (
    requested,
    stored,
  ) => {
    const service = new Calendar_gregorian();
    try {
      service.setMinimumNumberOfDaysForFirstWeek(requested);
      expect(service.getMinimumNumberOfDaysForFirstWeek()).toBe(stored);
      expect(service.getLoadedCalendar2().minimumDays).toBe(stored);
    } finally {
      service.dispose();
    }
  },
);

it("restores pinned locale week settings when the real service reloads its calendar", /** Locale loading overwrites the requested scalar and week start through the original setters. @returns Nothing. */ () => {
  const service = new Calendar_gregorian(),
    language = unicode("de"),
    country = unicode("DE"),
    variant = unicode(""),
    locale = new Locale(language, country, variant),
    id = unicode("gregorian");
  try {
    service.setMinimumNumberOfDaysForFirstWeek(-1);
    service.loadCalendar(id, locale);
    expect(service.getMinimumNumberOfDaysForFirstWeek()).toBe(4);
    expect(service.getFirstDayOfWeek()).toBe(1);
    service.setMinimumNumberOfDaysForFirstWeek(256);
    service.loadCalendar(id, locale);
    expect(service.getMinimumNumberOfDaysForFirstWeek()).toBe(4);
  } finally {
    id.dispose();
    locale.dispose();
    variant.dispose();
    country.dispose();
    language.dispose();
    service.dispose();
  }
});

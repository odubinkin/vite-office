/** @fileoverview Original calendar-native mapping, pointer-identity Gengou first-year behavior and selected-mode bypasses through actual ICU/calendar/supplier owners. */
import { expect, it } from "vitest";
import { CalendarImpl } from "./calendarImpl";
import { Calendar_gregorian } from "./calendar_gregorian";
import * as D from "../../../offapi/com/sun/star/i18n/CalendarDisplayCode";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Date } from "../../../tools/source/datetime/tdate";
/** Creates the real Locale owner. @param language - Source language. @param country - Source country. @returns Owned value. */
function locale(language: string, country: string): Locale {
  const l = unicode(language),
    c = unicode(country),
    v = unicode("");
  try {
    return new Locale(l, c, v);
  } finally {
    v.dispose();
    c.dispose();
    l.dispose();
  }
}
it.each([
  ["ja", "JP", D.SHORT_YEAR, 1, "〇〇"],
  ["ja", "JP", D.SHORT_YEAR, 2, "零零"],
  ["ja", "JP", D.LONG_YEAR, 1, "二〇〇〇"],
  ["ja", "JP", D.LONG_DAY, 1, "二"],
  ["ja", "JP", D.LONG_MONTH, 1, "一"],
  ["ja", "JP", D.LONG_DAY, 3, "０２"],
  ["ja", "JP", D.LONG_DAY, 4, "02"],
  ["ja", "JP", D.LONG_DAY, 12, "02"],
  ["ja", "JP", D.LONG_MONTH_NAME, 3, "一月"],
  ["ja", "JP", D.SHORT_MONTH_NAME, 3, "1月"],
  ["ja", "JP", D.LONG_DAY, 65537, "二"],
  ["ja", "JP", D.LONG_DAY, -1, "02"],
  ["zh", "CN", D.LONG_DAY, 1, "二"],
  ["zh", "TW", D.LONG_YEAR, 1, "二〇〇〇"],
  ["ko", "KR", D.LONG_YEAR, 4, "이영영영"],
  ["ko", "KR", D.LONG_DAY, 4, "이"],
  ["en", "US", D.LONG_DAY, 3, "02"],
  ["th", "TH", D.LONG_YEAR, 1, "๒๐๐๐"],
  ["th", "TH", D.SHORT_YEAR, 1, "๐๐"],
] as const)(
  "preserves %s_%s display%d native%d",
  /** Actual calendar source field for January2,2000, including source default Gregorian year and raw names. @param language - Language. @param country - Country. @param code - Source code. @param mode - Native mode. @param expected - Source-derived text. @returns Nothing. */ (
    language,
    country,
    code,
    mode,
    expected,
  ) => {
    const owner = new CalendarImpl(),
      place = locale(language, country),
      zone = unicode("UTC");
    try {
      owner.loadDefaultCalendarTZ(place, zone);
      owner.setLocalDateTime(
        new Date(2, 1, 2000).GetAsNormalizedDays() - new Date(1, 1, 1970).GetAsNormalizedDays(),
      );
      const result = owner.getDisplayString(code, mode);
      try {
        expect(text(result)).toBe(expected);
      } finally {
        result.dispose();
      }
    } finally {
      zone.dispose();
      owner.dispose();
      place.dispose();
    }
  },
);
it.each([
  [D.SHORT_YEAR, 1, "元"],
  [D.LONG_YEAR, 2, "元"],
  [D.LONG_YEAR, 3, "０１"],
  [D.LONG_YEAR, 12, "01"],
  [D.LONG_YEAR_AND_ERA, 1, "令和元"],
] as const)(
  "keeps actual Gengou array identity for display%d mode%d",
  /** Real era mapping and recursive combined result. @param code - Display code. @param mode - Native mode. @param expected - Original value. @returns Nothing. */ (
    code,
    mode,
    expected,
  ) => {
    const owner = new CalendarImpl(),
      place = locale("ja", "JP"),
      id = unicode("gengou"),
      zone = unicode("UTC");
    try {
      owner.loadCalendarTZ(id, place, zone);
      owner.setLocalDateTime(
        new Date(1, 5, 2019).GetAsNormalizedDays() - new Date(1, 1, 1970).GetAsNormalizedDays(),
      );
      const result = owner.getDisplayString(code, mode);
      try {
        expect(text(result)).toBe(expected);
      } finally {
        result.dispose();
      }
    } finally {
      zone.dispose();
      id.dispose();
      owner.dispose();
      place.dispose();
    }
  },
);
it("does not infer the Gengou era-array pointer from loaded calendar name", /** A genuine Gregorian provider may load Gengou data but still has the source null eraArray; source GAN substitution must not run. @returns Nothing. */ () => {
  const owner = new Calendar_gregorian(),
    place = locale("ja", "JP"),
    id = unicode("gengou");
  try {
    owner.loadCalendar(id, place);
    owner.setValue(C.YEAR, 1);
    const result = owner.getDisplayString(D.LONG_YEAR, 1);
    try {
      expect(text(result)).toBe("一");
    } finally {
      result.dispose();
    }
  } finally {
    id.dispose();
    owner.dispose();
    place.dispose();
  }
});

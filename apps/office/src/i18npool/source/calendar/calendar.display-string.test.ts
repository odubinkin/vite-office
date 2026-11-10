/** @fileoverview Original calendar display strings for represented native mode0, including era-specific year widths and generated quarter words. */
import { expect, it } from "vitest";
import { CalendarImpl } from "./calendarImpl";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { Date } from "../../../tools/source/datetime/tdate";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
import * as D from "../../../offapi/com/sun/star/i18n/CalendarDisplayCode";
/** Creates an actual locale value. @param language - Language. @param country - Country. @returns Owned locale. */
function locale(language: string, country: string): Locale {
  const l = unicode(language),
    c = unicode(country),
    empty = unicode("");
  try {
    return new Locale(l, c, empty);
  } finally {
    empty.dispose();
    c.dispose();
    l.dispose();
  }
}
it.each([
  [D.SHORT_DAY, "2"],
  [D.LONG_DAY, "02"],
  [D.SHORT_DAY_NAME, "Sun"],
  [D.LONG_DAY_NAME, "Sunday"],
  [D.SHORT_MONTH, "1"],
  [D.LONG_MONTH, "01"],
  [D.SHORT_MONTH_NAME, "Jan"],
  [D.LONG_MONTH_NAME, "January"],
  [D.SHORT_YEAR, "00"],
  [D.LONG_YEAR, "2000"],
  [D.SHORT_ERA, "AD"],
  [D.LONG_ERA, "AD"],
  [D.SHORT_YEAR_AND_ERA, "AD2000"],
  [D.LONG_YEAR_AND_ERA, "AD2000"],
  [D.SHORT_QUARTER, "Q1"],
  [D.LONG_QUARTER, "1st quarter"],
  [D.LONG_GENITIVE_MONTH_NAME, "January"],
  [D.LONG_PARTITIVE_MONTH_NAME, "January"],
  [D.NARROW_MONTH_NAME, "J"],
  [D.NARROW_DAY_NAME, "S"],
])(
  "renders original display code %s",
  /** Actual provider fields and original locale resources supply all display inputs. @param code - Source display code. @param expected - Source result. @returns Nothing. */ (
    code,
    expected,
  ) => {
    const service = new CalendarImpl(),
      en = locale("en", "US"),
      utc = unicode("UTC");
    try {
      service.loadDefaultCalendarTZ(en, utc);
      service.setLocalDateTime(
        new Date(2, 1, 2000).GetAsNormalizedDays() - new Date(1, 1, 1970).GetAsNormalizedDays(),
      );
      const result = service.getDisplayString(code, 0);
      try {
        expect(text(result)).toBe(expected);
      } finally {
        result.dispose();
      }
    } finally {
      utc.dispose();
      service.dispose();
      en.dispose();
    }
  },
);
it.each([
  ["gengou", "ja", "JP", D.SHORT_YEAR, 1, 5, 2019, "1"],
  ["gengou", "ja", "JP", D.LONG_YEAR, 1, 5, 2019, "01"],
  ["ROC", "zh", "TW", D.SHORT_YEAR, 1, 1, 2024, "113"],
])(
  "retains source era year display for %s",
  /** Source Gengou padding and ROC forced-long-year flags differ from ordinary last-two-digit formatting. @param id - Calendar ID. @param language - Language. @param country - Country. @param code - Display code. @param day - Day. @param month - Month. @param year - Gregorian year. @param expected - Display value. @returns Nothing. */ (
    id,
    language,
    country,
    code,
    day,
    month,
    year,
    expected,
  ) => {
    const service = new CalendarImpl(),
      requested = locale(language, country),
      name = unicode(id),
      utc = unicode("UTC");
    try {
      service.loadCalendarTZ(name, requested, utc);
      service.setLocalDateTime(
        new Date(day, month, year).GetAsNormalizedDays() -
          new Date(1, 1, 1970).GetAsNormalizedDays(),
      );
      const result = service.getDisplayString(code, 0);
      try {
        expect(text(result)).toBe(expected);
      } finally {
        result.dispose();
      }
    } finally {
      utc.dispose();
      name.dispose();
      service.dispose();
      requested.dispose();
    }
  },
);

it("preserves Buddhist before-era short/long name selection", /** Upstream LONG_YEAR_AND_ERA uses SHORT_ERA and the short form uses LONG_ERA in the before-era branch. @returns Nothing. */ () => {
  const service = new CalendarImpl(),
    th = locale("th", "TH"),
    id = unicode("buddhist"),
    utc = unicode("UTC");
  try {
    service.loadCalendarTZ(id, th, utc);
    service.setValue(C.ERA, 0);
    service.setValue(C.YEAR, 1234);
    const long = service.getDisplayString(D.LONG_YEAR_AND_ERA, 0),
      short = service.getDisplayString(D.SHORT_YEAR_AND_ERA, 0);
    try {
      expect(text(long)).toBe("1234ปีก่อน พ.ศ. ที่");
      expect(text(short)).toBe("1234ปีก่อนพุทธศักราชที่");
    } finally {
      short.dispose();
      long.dispose();
    }
  } finally {
    utc.dispose();
    id.dispose();
    service.dispose();
    th.dispose();
  }
});

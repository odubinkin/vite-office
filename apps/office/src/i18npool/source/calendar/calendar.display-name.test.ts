/** @fileoverview Original calendar display-name categories, Hanja locale override and UNO wrapper exception boundaries. */
import { expect, it } from "vitest";
import { CalendarImpl } from "./calendarImpl";
import { Calendar_hanja, Calendar_hanja_yoil } from "./calendar_gregorian";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { CalendarWrapper } from "../../../unotools/source/i18n/calendarwrapper";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import * as D from "../../../offapi/com/sun/star/i18n/CalendarDisplayIndex";
/** Creates a real owned UNO locale. @param language - Language. @param country - Country. @returns Owned locale. */
function locale(language: string, country: string): Locale {
  const l = unicode(language),
    c = unicode(country),
    e = unicode("");
  try {
    return new Locale(l, c, e);
  } finally {
    e.dispose();
    c.dispose();
    l.dispose();
  }
}
it.each([
  [D.AM_PM, 0, 99, "AM"],
  [D.AM_PM, 1, -1, "PM"],
  [D.DAY, 0, 0, "Sun"],
  [D.DAY, 0, 1, "Sunday"],
  [D.DAY, 0, 2, "S"],
  [D.MONTH, 0, 0, "Jan"],
  [D.MONTH, 0, 1, "January"],
  [D.MONTH, 0, 2, "J"],
  [D.GENITIVE_MONTH, 0, 1, "January"],
  [D.PARTITIVE_MONTH, 0, 1, "January"],
  [D.ERA, 0, 0, "BC"],
  [D.YEAR, -1, -1, ""],
])(
  "selects original calendar name %s/%s/%s",
  /** Real calendar resources and provider select source name fields. @param category - Display index. @param index - Item. @param type - Name kind. @param expected - Source resource name. @returns Nothing. */ (
    category,
    index,
    type,
    expected,
  ) => {
    const service = new CalendarImpl(),
      en = locale("en", "US");
    try {
      service.loadDefaultCalendar(en);
      const name = service.getDisplayName(category, index, type);
      try {
        expect(text(name)).toBe(expected);
      } finally {
        name.dispose();
      }
    } finally {
      service.dispose();
      en.dispose();
    }
  },
);
it.each([Calendar_hanja, Calendar_hanja_yoil])(
  "uses Japanese AM/PM in the original Hanja provider %s",
  /** The actual source service override uses Japanese locale data even without loading a calendar. @param Provider - Registered provider constructor. @returns Nothing. */ (
    Provider,
  ) => {
    const service = new Provider();
    try {
      const name = service.getDisplayName(D.AM_PM, 0, 0);
      try {
        expect(text(name)).toBe("午前");
      } finally {
        name.dispose();
      }
    } finally {
      service.dispose();
    }
  },
);
it("retains source service errors and wrapper UNO-only swallowing", /** RuntimeException defaults differ from the original checked Sequence lower-bound assertion. @returns Nothing. */ () => {
  const service = new CalendarImpl(),
    wrapper = new CalendarWrapper(),
    en = locale("en", "US");
  try {
    expect(
      /** No calendar is loaded. @returns No name. */ () => service.getDisplayName(D.MONTH, 0, 0),
    ).toThrow(RuntimeException);
    const empty = wrapper.getDisplayName(D.MONTH, 0, 0);
    try {
      expect(empty.isEmpty()).toBe(true);
    } finally {
      empty.dispose();
    }
    service.loadDefaultCalendar(en);
    wrapper.loadDefaultCalendar(en);
    for (const [category, index, type] of [
      [D.MONTH, 12, 0],
      [D.MONTH, 0, 3],
      [D.ERA, 0, 2],
      [D.AM_PM, 2, 0],
      [99, 0, 0],
    ]) {
      expect(
        /** Invalid source display argument. @returns No name. */ () =>
          service.getDisplayName(category as number, index as number, type as number),
      ).toThrow(RuntimeException);
      const result = wrapper.getDisplayName(category as number, index as number, type as number);
      try {
        expect(result.isEmpty()).toBe(true);
      } finally {
        result.dispose();
      }
    }
    expect(
      /** Original lower-bound assertion propagates through the wrapper. @returns No name. */ () =>
        wrapper.getDisplayName(D.MONTH, -1, 0),
    ).toThrow(/assert/);
  } finally {
    wrapper.dispose();
    service.dispose();
    en.dispose();
  }
});

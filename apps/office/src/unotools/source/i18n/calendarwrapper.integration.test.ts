/** @fileoverview CalendarWrapper forwarding/default contracts use actual CalendarImpl providers and pinned locale resources; no service reference or method is replaced. */
import { assert, expect, it } from "vitest";
import { CalendarWrapper, type CalendarItem2Names } from "./calendarwrapper";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";

/** Initializes a real UNO Locale value with independent native string lifetimes. @param language - Source language. @param country - Source country. @returns Owned Locale. */
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
/** Releases actual caller-owned name values after observations. @param rows - Original wrapper result. @returns Nothing. */
function release(rows: readonly CalendarItem2Names[]): void {
  for (const row of rows) {
    row.FullName.dispose();
    row.AbbrevName.dispose();
  }
}
it("retains original UNO defaults for every represented operation before any calendar is loaded", /** CalendarImpl's actual missing-provider RuntimeException reaches the wrapper's original catch/default paths. @returns Nothing. */ () => {
  const wrapper = new CalendarWrapper();
  try {
    wrapper.setDateTime(5);
    wrapper.setLocalDateTime(-1);
    wrapper.setGregorianDateTime(wrapper.getEpochStart());
    wrapper.setValue(C.YEAR, 2024);
    expect(wrapper.getDateTime()).toBe(0);
    expect(wrapper.getLocalDateTime()).toBe(0);
    expect(wrapper.getValue(C.YEAR)).toBe(0);
    expect(wrapper.isValid()).toBe(false);
    expect(wrapper.getFirstDayOfWeek()).toBe(0);
    expect(wrapper.getNumberOfMonthsInYear()).toBe(0);
    expect(wrapper.getNumberOfDaysInWeek()).toBe(0);
    expect(wrapper.getMonths()).toEqual([]);
    expect(wrapper.getGenitiveMonths()).toEqual([]);
    expect(wrapper.getPartitiveMonths()).toEqual([]);
    expect(wrapper.getDays()).toEqual([]);
    const id = wrapper.getUniqueID();
    try {
      expect(text(id)).toBe("");
    } finally {
      id.dispose();
    }
  } finally {
    wrapper.dispose();
  }
});
it("forwards UTC time and field validation through the actual loaded Gregorian service", /** Independent UTC epoch days and a known leap date check the forwarding overloads and real provider errors without a substitute calendar. @returns Nothing. */ () => {
  const wrapper = new CalendarWrapper(),
    en = locale("en", "US");
  try {
    wrapper.loadDefaultCalendar(en, true);
    wrapper.setGregorianDateTime(wrapper.getEpochStart());
    expect([wrapper.getDateTime(), wrapper.getLocalDateTime()]).toEqual([0, 0]);
    wrapper.setDateTime(2.5);
    expect([wrapper.getDateTime(), wrapper.getLocalDateTime()]).toEqual([2.5, 2.5]);
    wrapper.setLocalDateTime(-1);
    expect([wrapper.getDateTime(), wrapper.getLocalDateTime()]).toEqual([-1, -1]);
    wrapper.setDateTime(0);
    wrapper.setValue(C.YEAR, 2024);
    wrapper.setValue(C.MONTH, 1);
    wrapper.setValue(C.DAY_OF_MONTH, 29);
    expect(wrapper.isValid()).toBe(true);
    expect([
      wrapper.getValue(C.YEAR),
      wrapper.getValue(C.MONTH),
      wrapper.getValue(C.DAY_OF_MONTH),
    ]).toEqual([2024, 1, 29]);
    expect(wrapper.getDateTime()).toBe(19782);
    wrapper.setValue(-1, 7);
    expect(wrapper.getValue(-1)).toBe(0);
    expect(wrapper.getDateTime()).toBe(19782);
  } finally {
    wrapper.dispose();
    en.dispose();
  }
});
it("keeps loaded provider time after a failed explicit load and reloads locale names on the same UTC cache key", /** The original service cache excludes locale from the calendar/timezone key; wrapper failures preserve the prior actual provider. @returns Nothing. */ () => {
  const wrapper = new CalendarWrapper(),
    en = locale("en", "US"),
    de = locale("de", "DE"),
    id = unicode("gregorian"),
    missing = unicode("missing-calendar");
  try {
    wrapper.loadCalendar(missing, en, true);
    expect(wrapper.isValid()).toBe(false);
    wrapper.loadCalendar(id, en, true);
    wrapper.setDateTime(321);
    wrapper.loadCalendar(missing, en);
    expect(wrapper.getDateTime()).toBe(321);
    wrapper.loadCalendar(id, de, true);
    expect(wrapper.getDateTime()).toBe(321);
    expect(wrapper.getFirstDayOfWeek()).toBe(1);
    const current = wrapper.getUniqueID(),
      names = wrapper.getPartitiveMonths();
    try {
      expect(text(current)).toBe("gregorian");
      expect(names).toHaveLength(12);
      const first = names[0];
      assert(first);
      expect(text(first.FullName)).toBe("Januar");
    } finally {
      current.dispose();
      release(names);
    }
  } finally {
    wrapper.dispose();
    missing.dispose();
    id.dispose();
    de.dispose();
    en.dispose();
  }
});
it("enumerates real calendar IDs without selecting a provider and returns independent grammatical name owners", /** Calendar enumeration is locale-data based; name values remain independently owned across wrapper calls. @returns Nothing. */ () => {
  const wrapper = new CalendarWrapper(),
    en = locale("en", "US");
  try {
    const ids = wrapper.getAllCalendars(en);
    try {
      // Original en_US.xml LC_CALENDAR lists both, with Gregorian as its default.
      expect(ids.map(text)).toEqual(["gregorian", "jewish"]);
    } finally {
      for (const id of ids) id.dispose();
    }
    expect(wrapper.isValid()).toBe(false);
    wrapper.loadDefaultCalendar(en, true);
    const first = wrapper.getPartitiveMonths(),
      second = wrapper.getPartitiveMonths();
    try {
      expect(first).toHaveLength(12);
      expect(second).toHaveLength(12);
      const firstRow = first[0],
        secondRow = second[0];
      assert(firstRow && secondRow);
      expect(firstRow.FullName).not.toBe(secondRow.FullName);
      const changed = unicode("caller edit");
      try {
        firstRow.FullName.assign(changed);
      } finally {
        changed.dispose();
      }
      expect(text(secondRow.FullName)).toBe("January");
      expect(wrapper.getNumberOfDaysInWeek()).toBe(7);
    } finally {
      release(first);
      release(second);
    }
  } finally {
    wrapper.dispose();
    en.dispose();
  }
});
it("loads the registered Hanja temporal service and preserves it when the display-only service ID lacks a locale calendar", /** Original ko_KR.xml lists Gregorian/Hanja/Dangi. Both Hanja service constructors are registered, but hanja_yoil has no ko_KR Calendar resource, so its failed load retains the prior actual provider. Display-name overrides remain outside this temporal check. @returns Nothing. */ () => {
  const wrapper = new CalendarWrapper(),
    ko = locale("ko", "KR"),
    hanja = unicode("hanja"),
    displayOnly = unicode("hanja_yoil");
  try {
    wrapper.loadCalendar(hanja, ko, true);
    wrapper.setDateTime(0);
    expect([
      wrapper.getValue(C.YEAR),
      wrapper.getValue(C.MONTH),
      wrapper.getValue(C.DAY_OF_MONTH),
    ]).toEqual([1970, 0, 1]);
    wrapper.setDateTime(321);
    wrapper.loadCalendar(displayOnly, ko, true);
    expect(wrapper.getDateTime()).toBe(321);
    const id = wrapper.getUniqueID();
    try {
      expect(text(id)).toBe("hanja");
    } finally {
      id.dispose();
    }
  } finally {
    wrapper.dispose();
    displayOnly.dispose();
    hanja.dispose();
    ko.dispose();
  }
});
it.each(["language", "country", "variant"] as const)(
  "retains original locale fallback with a long counted UTF16 %s field",
  /** UNO Locale fields are counted OUString values. Non-qlt variants are ignored by original lookup; unknown language/country fields fall back to en_US without a JavaScript argument-count limit. @param field - Long caller-owned field. @returns Nothing. */ (
    field,
  ) => {
    const long = "x".repeat(200000),
      l = unicode(field === "language" ? long : "en"),
      c = unicode(field === "country" ? long : "US"),
      v = unicode(field === "variant" ? long : ""),
      requested = new Locale(l, c, v),
      wrapper = new CalendarWrapper();
    try {
      const ids = wrapper.getAllCalendars(requested);
      try {
        expect(ids.map(text)).toEqual(["gregorian", "jewish"]);
      } finally {
        for (const id of ids) id.dispose();
      }
      wrapper.loadDefaultCalendar(requested, true);
      expect(wrapper.getNumberOfMonthsInYear()).toBe(12);
      expect([
        requested.Language.getLength(),
        requested.Country.getLength(),
        requested.Variant.getLength(),
      ]).toEqual([
        field === "language" ? 200000 : 2,
        field === "country" ? 200000 : 2,
        field === "variant" ? 200000 : 0,
      ]);
    } finally {
      wrapper.dispose();
      requested.dispose();
      v.dispose();
      c.dispose();
      l.dispose();
    }
  },
);

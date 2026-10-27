/** @fileoverview Source CalendarWrapper name/count boundary over pinned LC_CALENDAR. */
import { expect, it } from "vitest";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { CalendarWrapper, type CalendarItem2Names } from "./calendarwrapper";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { Date } from "../../../tools/source/datetime/tdate";

it("owns the source Gregorian epoch independently of a loaded calendar", /** Checks the DateTime value used by input-date serial conversion. @returns Nothing. */ () => {
  const wrapper = new CalendarWrapper(),
    epoch = wrapper.getEpochStart();
  expect([epoch.GetDay(), epoch.GetMonth(), epoch.GetYear(), epoch.GetTime()]).toEqual([
    1,
    1,
    1970,
    0n,
  ]);
  expect(wrapper.getEpochStart()).toBe(epoch);
  expect(DateTime.Sub(new DateTime(new Date(30, 12, 1899)), epoch)).toBe(-25569);
});

/** Releases a caller-owned calendar name sequence. @param items - Names. @returns Nothing. */
function release(items: CalendarItem2Names[]): void {
  for (const item of items) {
    item.FullName.dispose();
    item.AbbrevName.dispose();
  }
}

it("loads source default calendar, keeps empty grammatical sections, and returns owned names", /** Checks loads source default calendar, keeps empty grammatical sections, and returns owned names. @returns Test completion or assertion result. */ () => {
  const language = unicode("en"),
    country = unicode("US"),
    variant = unicode("");
  const locale = new Locale(language, country, variant),
    wrapper = new CalendarWrapper();
  try {
    const beforeLoad = wrapper.getUniqueID();
    try {
      expect(text(beforeLoad)).toBe("");
    } finally {
      beforeLoad.dispose();
    }
    expect(wrapper.getNumberOfMonthsInYear()).toBe(0);
    wrapper.loadDefaultCalendar(locale);
    const id = wrapper.getUniqueID();
    try {
      expect(text(id)).toBe("gregorian");
    } finally {
      id.dispose();
    }
    expect(wrapper.getNumberOfMonthsInYear()).toBe(12);
    expect(wrapper.getNumberOfDaysInWeek()).toBe(7);
    const months = wrapper.getMonths(),
      days = wrapper.getDays(),
      genitive = wrapper.getGenitiveMonths();
    try {
      const firstMonth = months[0],
        firstDay = days[0];
      if (!firstMonth || !firstDay) throw new Error("Pinned default calendar names are absent");
      expect(text(firstMonth.FullName)).toBe("January");
      expect(text(firstDay.AbbrevName)).toBe("Sun");
      expect(genitive).toHaveLength(0);
      const changed = unicode("changed");
      try {
        firstMonth.FullName.assign(changed);
      } finally {
        changed.dispose();
      }
      const again = wrapper.getMonths();
      try {
        const repeatedMonth = again[0];
        if (!repeatedMonth) throw new Error("Repeated default calendar names are absent");
        expect(text(repeatedMonth.FullName)).toBe("January");
      } finally {
        release(again);
      }
    } finally {
      release(months);
      release(days);
      release(genitive);
    }
  } finally {
    locale.dispose();
    variant.dispose();
    country.dispose();
    language.dispose();
  }
});

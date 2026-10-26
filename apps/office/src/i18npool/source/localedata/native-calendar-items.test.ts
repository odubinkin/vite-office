/** @fileoverview Pinned LC_CALENDAR name ordering and reference resolution. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import catalogs from "./data/calendar-items.json";
import { getLocaleCalendarItems } from "./localedata";

/** Queries a real Locale value and releases its native strings. @param language - Language. @param country - Country. @returns Source name arrays. */
function names(language: string, country: string) {
  const l = unicode(language),
    c = unicode(country),
    v = unicode("");
  const locale = new Locale(l, c, v);
  try {
    return getLocaleCalendarItems(locale);
  } finally {
    locale.dispose();
    v.dispose();
    c.dispose();
    l.dispose();
  }
}

it("resolves default-calendar section refs in original weekday/month order", /** Checks resolves default-calendar section refs in original weekday/month order. @returns Test completion or assertion result. */ () => {
  expect(Object.keys(catalogs)).toHaveLength(284);
  expect("ti_ET" in catalogs).toBe(false);
  const us = names("en", "US"),
    gb = names("en", "GB");
  expect(us.id).toBe("gregorian");
  expect(gb.id).toBe("gregorian");
  expect(us.months).toHaveLength(12);
  expect(us.months[8]).toEqual({ full: "September", abbreviated: "Sep" });
  expect(us.days[0]).toEqual({ full: "Sunday", abbreviated: "Sun" });
  expect(gb.months).toEqual(us.months);
  expect(gb.days).toEqual(us.days);
});

it("keeps locale-specific names and grammatical month sections from source XML", /** Checks keeps locale-specific names and grammatical month sections from source XML. @returns Test completion or assertion result. */ () => {
  expect(names("de", "AT").months[0]?.full).toBe("Jänner");
  expect(names("ru", "RU").genitiveMonths).toHaveLength(12);
  expect(names("en", "US").genitiveMonths).toHaveLength(0);
  expect(names("fa", "IR").id).toBe("persian");
});

it("returns independent service value rows for repeated locale queries", /** Checks returns independent service value rows for repeated locale queries. @returns Test completion or assertion result. */ () => {
  const first = names("en", "US");
  (first.months[0] as { full: string }).full = "changed";
  expect(names("en", "US").months[0]?.full).toBe("January");
});

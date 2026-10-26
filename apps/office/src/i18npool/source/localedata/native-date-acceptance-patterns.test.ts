/** @fileoverview Native LocaleNode date acceptance order, edit-format generation and ref delegation. */
import { expect, it } from "vitest";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DateOrder,
  LongDateOrder,
  LocaleDataWrapper,
} from "../../../unotools/source/i18n/localedatawrapper";
import { getLocaleDateAcceptancePatterns } from "./localedata";
import catalog from "./data/date-acceptance-patterns.json";

/** Constructs an owned original Locale. @param language - Language. @param country - Country. @returns Native value. */
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

it("keeps the original registered locale set and explicit-before-generated pattern order", () => {
  expect(Object.keys(catalog)).toHaveLength(284);
  const us = locale("en", "US"),
    gb = locale("en", "GB"),
    france = locale("fr", "FR");
  try {
    expect(getLocaleDateAcceptancePatterns(us)).toEqual(["M/D", "M/D/Y"]);
    expect(getLocaleDateAcceptancePatterns(gb)).toEqual(["D/M", "D-M", "D/M/Y"]);
    expect(getLocaleDateAcceptancePatterns(france)).toEqual(["D/M", "D.M.Y", "D-M-Y", "D/M/Y"]);
  } finally {
    france.dispose();
    gb.dispose();
    us.dispose();
  }
});

it("returns the wrapper-owned pattern sequence and refreshes it after a locale change", () => {
  const us = locale("en", "US"),
    german = locale("de", "DE"),
    wrapper = new LocaleDataWrapper(us);
  try {
    const before = wrapper.getDateAcceptancePatterns();
    expect(before.map(text)).toEqual(["M/D", "M/D/Y"]);
    expect(wrapper.getDateAcceptancePatterns()).toBe(before);
    wrapper.changeLocale(german);
    const after = wrapper.getDateAcceptancePatterns();
    expect(after).toBe(before);
    expect(after.map(text)).toEqual(["D.M.", "D.M.Y"]);
  } finally {
    wrapper.dispose();
    german.dispose();
    us.dispose();
  }
});

it("derives source edit and long date orders from the ordered DATE format sequence", () => {
  for (const [language, country, short, long] of [
    ["en", "US", DateOrder.MDY, LongDateOrder.MDY],
    ["en", "GB", DateOrder.DMY, LongDateOrder.DMY],
    ["de", "DE", DateOrder.DMY, LongDateOrder.DMY],
    ["hu", "HU", DateOrder.YMD, LongDateOrder.YMD],
    ["ja", "JP", DateOrder.YMD, LongDateOrder.YMD],
  ] as const) {
    const value = locale(language, country),
      wrapper = new LocaleDataWrapper(value);
    try {
      expect(wrapper.getDateOrder()).toBe(short);
      expect(wrapper.getLongDateOrder()).toBe(long);
    } finally {
      wrapper.dispose();
      value.dispose();
    }
  }
});

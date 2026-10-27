/** @fileoverview Default calendar absence and real ASCII/native case wrapper boundaries. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { LANGUAGE_NONE } from "../../../i18nlangtag/inc/lang";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { CalendarWrapper } from "./calendarwrapper";
import { CharClass } from "./charclass";
import { TransliterationWrapper } from "./transliterationwrapper";

it("reports empty calendar sections before loading the locale service", /** Verifies the native uninitialized calendar wrapper contract. @returns Nothing. */ () => {
  const calendar = new CalendarWrapper();
  expect(calendar.getMonths()).toEqual([]);
  expect(calendar.getGenitiveMonths()).toEqual([]);
  expect(calendar.getPartitiveMonths()).toEqual([]);
  expect(calendar.getDays()).toEqual([]);
  expect(calendar.getNumberOfDaysInWeek()).toBe(0);
});

it("checks empty numeric strings and ASCII alphanumeric boundary units", /** Uses actual locale and strings rather than substituting classification data. @returns Nothing. */ () => {
  const language = unicode("en"),
    country = unicode("US"),
    variant = unicode(""),
    locale = new Locale(language, country, variant),
    classifier = new CharClass(locale),
    empty = unicode("");
  try {
    expect(classifier.isNumeric(empty)).toBe(false);
    for (const [input, expected] of [
      ["0", true],
      ["9", true],
      ["A", true],
      ["Z", true],
      ["a", true],
      ["z", true],
      ["@", false],
      ["[", false],
      ["`", false],
      ["{", false],
    ] as const) {
      const value = unicode(input);
      try {
        expect(classifier.isLetterNumeric(value, 0), input).toBe(expected);
      } finally {
        value.dispose();
      }
    }
  } finally {
    empty.dispose();
    classifier.dispose();
    locale.dispose();
    variant.dispose();
    country.dispose();
    language.dispose();
  }
});

it("loads the case-ignore module on direct first comparison and normalizes LANGUAGE_NONE", /** Verifies genuine service initialization before any explicit load request. @returns Nothing. */ () => {
  const wrapper = new TransliterationWrapper(TransliterationFlags.IGNORE_CASE),
    first = unicode("AbC"),
    second = unicode("aBc");
  try {
    expect(wrapper.isEqual(first, second)).toBe(true);
    wrapper.loadModuleIfNeeded(LANGUAGE_NONE);
    expect(wrapper.isEqual(first, second)).toBe(true);
  } finally {
    second.dispose();
    first.dispose();
    wrapper.dispose();
  }
});

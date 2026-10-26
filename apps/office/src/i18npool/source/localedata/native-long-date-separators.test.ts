/** @fileoverview Native LC_CTYPE long-date separators and LocaleDataWrapper locale reload. */
import { expect, it } from "vitest";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";
import catalog from "./data/long-date-separators.json";
import { getLocaleLongDateSeparators } from "./localedata";

/** Constructs and releases a source Locale around one field query. @param language - Language. @param country - Country. @param query - Borrowed locale callback. @returns Result. */
function withLocale<T>(language: string, country: string, query: (locale: Locale) => T): T {
  const lang = unicode(language),
    region = unicode(country),
    variant = unicode(""),
    locale = new Locale(lang, region, variant);
  try {
    return query(locale);
  } finally {
    locale.dispose();
    variant.dispose();
    region.dispose();
    lang.dispose();
  }
}

it("loads all pinned long-date separator records through LC_CTYPE refs", /** Checks loads all pinned long-date separator records through LC_CTYPE refs. @returns Test completion or assertion result. */ () => {
  expect(Object.keys(catalog)).toHaveLength(284);
  expect(withLocale("en", "US", getLocaleLongDateSeparators)).toEqual({
    dayOfWeek: ", ",
    day: ", ",
    month: " ",
  });
  expect(withLocale("xh", "ZA", getLocaleLongDateSeparators)).toEqual(
    withLocale("en", "ZA", getLocaleLongDateSeparators),
  );
});

it("refreshes the three borrowed separator fields on locale change", /** Checks refreshes the three borrowed separator fields on locale change. @returns Test completion or assertion result. */ () => {
  withLocale(
    "de",
    "DE",
    /** Checks de. @param locale - Locale. @returns Test completion or assertion result. */ (
      locale,
    ) => {
      const wrapper = new LocaleDataWrapper(locale);
      try {
        expect([
          text(wrapper.getLongDateDayOfWeekSep()),
          text(wrapper.getLongDateDaySep()),
          text(wrapper.getLongDateMonthSep()),
        ]).toEqual([", ", ". ", " "]);
        withLocale(
          "ja",
          "JP",
          /** Checks ja. @param next - Next. @returns Test completion or assertion result. */ (
            next,
          ) => wrapper.changeLocale(next),
        );
        expect([
          text(wrapper.getLongDateDayOfWeekSep()),
          text(wrapper.getLongDateDaySep()),
          text(wrapper.getLongDateMonthSep()),
        ]).toEqual([", ", "日", "月"]);
      } finally {
        wrapper.dispose();
      }
    },
  );
});

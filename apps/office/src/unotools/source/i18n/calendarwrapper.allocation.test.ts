/** @fileoverview Actual CalendarWrapper non-UNO checked allocation-error propagation; high-level native Calendar OOM and C++ exception behavior are not claimed. */
import { expect, it } from "vitest";
import { CalendarWrapper } from "./calendarwrapper";
import * as F from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { rtl_stringAllocation } from "../../../sal/rtl/strimp.hxx";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";

/** Real original wrapper call with initialized source arguments. */
interface Case {
  name: string;
  invoke: (wrapper: CalendarWrapper, locale: Locale, id: OUString) => unknown;
}
const cases: Case[] = [
  {
    name: "loadDefaultCalendar",
    invoke:
      /** Calls actual default selection with an empty zone. @param wrapper - Actual wrapper. @param locale - Owned Locale. @returns Nothing. */ (
        wrapper,
        locale,
      ) => wrapper.loadDefaultCalendar(locale, false),
  },
  {
    name: "loadCalendar",
    invoke:
      /** Calls actual unknown-ID admission. @param wrapper - Actual wrapper. @param locale - Owned Locale. @param id - Real unsupported identifier. @returns Nothing. */ (
        wrapper,
        locale,
        id,
      ) => wrapper.loadCalendar(id, locale, false),
  },
  {
    name: "getUniqueID",
    invoke:
      /** Calls actual ID forwarding. @param wrapper - Actual wrapper. @returns Caller-owned ID on success. */ (
        wrapper,
      ) => wrapper.getUniqueID(),
  },
  {
    name: "getAllCalendars",
    invoke:
      /** Calls actual locale-name materialization. @param wrapper - Actual wrapper. @param locale - Owned Locale. @returns Caller-owned IDs on success. */ (
        wrapper,
        locale,
      ) => wrapper.getAllCalendars(locale),
  },
  {
    name: "setDateTime",
    invoke: /** Calls actual UTC mutation. @param wrapper - Actual wrapper. @returns Nothing. */ (
      wrapper,
    ) => wrapper.setDateTime(0),
  },
  {
    name: "getDateTime",
    invoke:
      /** Calls actual UTC query. @param wrapper - Actual wrapper. @returns Source days on success. */ (
        wrapper,
      ) => wrapper.getDateTime(),
  },
  {
    name: "setLocalDateTime",
    invoke:
      /** Calls actual local-time mutation. @param wrapper - Actual wrapper. @returns Nothing. */ (
        wrapper,
      ) => wrapper.setLocalDateTime(0),
  },
  {
    name: "getLocalDateTime",
    invoke:
      /** Calls actual local-time query. @param wrapper - Actual wrapper. @returns Source days on success. */ (
        wrapper,
      ) => wrapper.getLocalDateTime(),
  },
  {
    name: "setValue",
    invoke:
      /** Calls actual valid year assignment. @param wrapper - Actual wrapper. @returns Nothing. */ (
        wrapper,
      ) => wrapper.setValue(F.YEAR, 2024),
  },
  {
    name: "getValue",
    invoke:
      /** Calls actual year query. @param wrapper - Actual wrapper. @returns Source field on success. */ (
        wrapper,
      ) => wrapper.getValue(F.YEAR),
  },
  {
    name: "isValid",
    invoke:
      /** Calls actual validity query. @param wrapper - Actual wrapper. @returns Source validity on success. */ (
        wrapper,
      ) => wrapper.isValid(),
  },
  {
    name: "getFirstDayOfWeek",
    invoke:
      /** Calls actual first-weekday query. @param wrapper - Actual wrapper. @returns Source weekday on success. */ (
        wrapper,
      ) => wrapper.getFirstDayOfWeek(),
  },
  {
    name: "getNumberOfMonthsInYear",
    invoke:
      /** Calls actual month-count query. @param wrapper - Actual wrapper. @returns Source count on success. */ (
        wrapper,
      ) => wrapper.getNumberOfMonthsInYear(),
  },
  {
    name: "getNumberOfDaysInWeek",
    invoke:
      /** Calls actual weekday-count query. @param wrapper - Actual wrapper. @returns Source count on success. */ (
        wrapper,
      ) => wrapper.getNumberOfDaysInWeek(),
  },
  {
    name: "getMonths",
    invoke:
      /** Calls actual month forwarding. @param wrapper - Actual wrapper. @returns Caller-owned names on success. */ (
        wrapper,
      ) => wrapper.getMonths(),
  },
  {
    name: "getGenitiveMonths",
    invoke:
      /** Calls actual genitive forwarding. @param wrapper - Actual wrapper. @returns Caller-owned names on success. */ (
        wrapper,
      ) => wrapper.getGenitiveMonths(),
  },
  {
    name: "getPartitiveMonths",
    invoke:
      /** Calls actual partitive forwarding. @param wrapper - Actual wrapper. @returns Caller-owned names on success. */ (
        wrapper,
      ) => wrapper.getPartitiveMonths(),
  },
  {
    name: "getDays",
    invoke:
      /** Calls actual weekday forwarding. @param wrapper - Actual wrapper. @returns Caller-owned names on success. */ (
        wrapper,
      ) => wrapper.getDays(),
  },
];

/** Initializes actual UNO Locale ownership before installing the original failure environment. @returns Owned Locale. */
function locale(): Locale {
  const language = unicode("en"),
    country = unicode("US"),
    variant = unicode("");
  try {
    return new Locale(language, country, variant);
  } finally {
    variant.dispose();
    country.dispose();
    language.dispose();
  }
}

it.each(cases)(
  "propagates the real checked allocation error through $name",
  /** Actual uninitialized-provider diagnostics or calendar-name materialization reach the existing SAL allocation slot. Native six-case RTL evidence establishes that lower failure binding; no calendar service, core method, return factory or private field is replaced. @param row - Actual wrapper operation. @returns Nothing. */ (
    row,
  ) => {
    const wrapper = new CalendarWrapper(),
      inputLocale = locale(),
      id = unicode("missing"),
      original = rtl_stringAllocation.rtl_allocateString;
    let attempts = 0,
      failure: unknown;
    try {
      rtl_stringAllocation.rtl_allocateString =
        /** Supplies the actual original allocation slot's null failure result. @returns Original failure pointer. */ () => {
          ++attempts;
          return null;
        };
      try {
        row.invoke(wrapper, inputLocale, id);
      } catch (error) {
        failure = error;
      } finally {
        rtl_stringAllocation.rtl_allocateString = original;
      }
      expect(attempts).toBe(1);
      expect(failure).toBeInstanceOf(Error);
      expect(failure).not.toBeInstanceOf(Exception);
      expect(failure).toHaveProperty("message", "assert(*ppThis != nullptr)");
      // The restored real allocator lets the ordinary missing-provider UNO exception follow its documented zero default.
      expect(wrapper.getDateTime()).toBe(0);
    } finally {
      rtl_stringAllocation.rtl_allocateString = original;
      wrapper.dispose();
      id.dispose();
      inputLocale.dispose();
    }
  },
);

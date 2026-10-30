/** @fileoverview Checks actual RTL allocation-slot failure unwinding of calendar/date/time output temporaries; Native aborting C-buffer growth failures and full OOM/allocator ABI are outside this constructor-scope check. */
import { expect, it } from "vitest";
import { rtl_stringAllocation } from "../../../sal/rtl/strimp.hxx";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { CalendarImpl } from "../../../i18npool/source/calendar/calendarImpl";
import * as D from "../../../offapi/com/sun/star/i18n/CalendarDisplayCode";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
import { SvNumberFormatter } from "./zforlist";
import { ImpGetNatNumString } from "./zformat.time";
/** A real owner fixture stays outside the controlled allocator lifetime. */
interface Fixture {
  reset(): void;
  invoke(): void;
  clear(): void;
  dispose(): void;
}
/** Creates an actual Gregorian/Gengou/Buddhist service fixture with loaded native data. @param id - Calendar. @param language - Language. @param country - Country. @param code - Display code, or calendar-name array. @returns Actual owner operations. */
function calendarFixture(
  id: string,
  language: string,
  country: string,
  code: number | "names",
): Fixture {
  const service = new CalendarImpl(),
    l = unicode(language),
    c = unicode(country),
    empty = new OUString(),
    locale = new Locale(l, c, empty),
    name = unicode(id),
    utc = unicode("UTC");
  l.dispose();
  c.dispose();
  empty.dispose();
  service.loadCalendarTZ(name, locale, utc);
  service.setDateTime(18017);
  if (id === "buddhist") {
    service.setValue(C.ERA, 0);
    service.setValue(C.YEAR, 1234);
    service.getDateTime();
  }
  let result: OUString | OUString[] | undefined;
  return {
    /** All provider fields are resolved before allocation control. @returns Nothing. */ reset() {
      service.getDateTime();
    },
    /** Calls the actual output owner. @returns Nothing. */ invoke() {
      result =
        code === "names" ? service.getAllCalendars(locale) : service.getDisplayString(code, 0);
    },
    /** Releases the actual returned owner. @returns Nothing. */ clear() {
      if (Array.isArray(result)) for (const item of result) item.dispose();
      else result?.dispose();
      result = undefined;
    },
    /** Releases persistent owners after the allocator slots are restored. @returns Nothing. */ dispose() {
      this.clear();
      service.dispose();
      utc.dispose();
      name.dispose();
      locale.dispose();
    },
  };
}
/** Creates the real compiled entry/table/language owners consumed by date/time display. @param pattern - Original pattern. @returns Actual formatter operations. */
function formatFixture(pattern: string): Fixture {
  const formatter = new SvNumberFormatter(0x409),
    current = formatter["m_aCurrentLanguage"],
    output = new OUString(),
    code = unicode(pattern),
    key: [number] = [0],
    check: [number] = [0],
    type: [number] = [0];
  formatter["m_aFormatData"].PutEntry(
    current,
    formatter.GetNatNum(),
    code,
    check,
    type,
    key,
    0x409,
  );
  expect(check[0]).toBe(0);
  code.dispose();
  return {
    /** Resets only source calendar state outside allocation control. @returns Nothing. */ reset() {
      output.clear();
      current.GetCalendar().loadDefaultCalendar(current.GetLocaleData().getMyLocale());
    },
    /** Calls original public dispatch with the real table entry. @returns Nothing. */ invoke() {
      formatter.GetOutputString(2.125, key[0], output, [null]);
    },
    /** Releases the actual output. @returns Nothing. */ clear() {
      output.clear();
    },
    /** Disposes genuine persistent owners. @returns Nothing. */ dispose() {
      output.dispose();
      formatter.dispose();
    },
  };
}
const cases: [string, () => Fixture][] = [
  [
    "calendar concatenation",
    /** Actual Gregorian service. @returns Owner fixture. */ () =>
      calendarFixture("gregorian", "en", "US", D.LONG_YEAR_AND_ERA),
  ],
  [
    "Gengou padding",
    /** Actual Gengou year1 padding. @returns Owner fixture. */ () =>
      calendarFixture("gengou", "ja", "JP", D.LONG_YEAR),
  ],
  [
    "Buddhist concatenation",
    /** Actual before-era branch. @returns Owner fixture. */ () =>
      calendarFixture("buddhist", "th", "TH", D.LONG_YEAR_AND_ERA),
  ],
  [
    "calendar names",
    /** Actual owned-name array. @returns Owner fixture. */ () =>
      calendarFixture("gregorian", "en", "US", "names"),
  ],
  [
    "integer padding",
    /** Actual shared source helper. @returns Owner fixture. */ () => {
      let output: OUString | undefined;
      return {
        /** No persistent scalar state. @returns Nothing. */ reset() {},
        /** Source helper. @returns Nothing. */ invoke() {
          output = ImpGetNatNumString(1, 4);
        },
        /** Owned return cleanup. @returns Nothing. */ clear() {
          output?.dispose();
          output = undefined;
        },
        /** Owner cleanup. @returns Nothing. */ dispose() {
          this.clear();
        },
      };
    },
  ],
  ...["HH:MM:SS.00", "YYYY-MM-DD", "YYYY-MM-DD HH:MM:SS.00", "YYYY G"].map(
    /** Creates actual formatter rows. @param pattern - Source pattern. @returns Named factory. */ (
      pattern,
    ): [string, () => Fixture] => [
      pattern,
      /** Real formatter fixture. @returns Owner operations. */ () => formatFixture(pattern),
    ],
  ),
];
it.each(cases)(
  "unwinds actual temporary allocations in %s",
  /** The real native allocation/free function-pointer slots measure normal returns and the first three constructor/allocation slots before raw C growth failures; services/scanners are not replaced. @param _name - Case label. @param create - Actual fixture factory. @returns Nothing. */ (
    _name,
    create,
  ) => {
    const fixture = create(),
      allocate = rtl_stringAllocation.rtl_allocateString,
      free = rtl_stringAllocation.rtl_freeString;
    try {
      fixture.reset();
      fixture.invoke();
      fixture.clear();
      for (const failAt of [0, 1, 2, 3]) {
        fixture.reset();
        const live = new Set<rtl_uString>();
        let attempts = 0,
          failure: unknown;
        try {
          rtl_stringAllocation.rtl_allocateString =
            /** Calls original allocator except at one controlled native failure slot. @param size - Native bytes. @returns Actual allocation or null. */ (
              size,
            ) => {
              if (++attempts === failAt && failAt > 0) return null;
              const value = allocate(size);
              if (value) live.add(value);
              return value;
            };
          rtl_stringAllocation.rtl_freeString =
            /** Tracks actual deallocation and delegates the original free slot. @param value - Actual pointer. @returns Nothing. */ (
              value,
            ) => {
              live.delete(value);
              free(value);
            };
          try {
            fixture.invoke();
          } catch (error) {
            failure = error;
          } finally {
            fixture.clear();
          }
        } finally {
          rtl_stringAllocation.rtl_allocateString = allocate;
          rtl_stringAllocation.rtl_freeString = free;
        }
        if (failAt > 0 && attempts >= failAt)
          expect(failure, `failure slot ${failAt}`).toBeInstanceOf(Error);
        else expect(failure).toBeUndefined();
        expect(live.size, `live temporary allocations at failure slot ${failAt}`).toBe(0);
      }
    } finally {
      rtl_stringAllocation.rtl_allocateString = allocate;
      rtl_stringAllocation.rtl_freeString = free;
      fixture.dispose();
    }
  },
);

import { Calendar_buddhist } from "../../../i18npool/source/calendar/calendar_gregorian";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
it("releases the left numeric temporary when the original right era-name lookup throws", /** Actual Buddhist before-era combination reaches the source missing-era-data RuntimeException after creating its numeric first operand. @returns Nothing. */ () => {
  const provider = new Calendar_buddhist(),
    allocate = rtl_stringAllocation.rtl_allocateString,
    free = rtl_stringAllocation.rtl_freeString,
    live = new Set<rtl_uString>();
  provider.setValue(C.ERA, 0);
  provider.setValue(C.YEAR, 1234);
  provider.getDateTime();
  const warmException = new RuntimeException();
  warmException.dispose();
  let failure: unknown;
  try {
    rtl_stringAllocation.rtl_allocateString =
      /** Delegates every real allocation while recording ownership. @param size - Bytes. @returns Actual allocation. */ (
        size,
      ) => {
        const value = allocate(size);
        if (value) live.add(value);
        return value;
      };
    rtl_stringAllocation.rtl_freeString =
      /** Delegates every actual free. @param value - Pointer. @returns Nothing. */ (value) => {
        live.delete(value);
        free(value);
      };
    try {
      const result = provider.getDisplayString(D.LONG_YEAR_AND_ERA, 0);
      result.dispose();
    } catch (error) {
      failure = error;
      if (error instanceof RuntimeException) error.dispose();
    }
    expect(failure).toBeInstanceOf(RuntimeException);
    expect(live.size).toBe(0);
  } finally {
    rtl_stringAllocation.rtl_allocateString = allocate;
    rtl_stringAllocation.rtl_freeString = free;
    provider.dispose();
  }
});

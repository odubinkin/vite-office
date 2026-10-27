/** @fileoverview Original host/default lifecycle and actual Calendar owned-zone semantics, plus the explicit browser host binding. */
import { afterEach, expect, it, vi } from "vitest";
import { Locale } from "../common/locid";
import { forLocaleOrDefault } from "./timezone.default";
import { UnicodeString } from "../common/unistr";
import * as Host from "../../browser/putil-tz";
import {
  createDefault,
  setDefault,
  adoptDefault,
  detectHostTimeZoneFromHost,
} from "./timezone.default";
import { createTimeZone } from "./timezone.create";
import { SimpleTimeZone } from "./simpletz";
import { GregorianCalendar } from "./gregocal";
import type { TimeZone } from "./timezone";
import { UCalendarDateFields as F } from "./unicode/ucal";
afterEach(
  /** Restores only platform mocks and captured host fields; source default lifetime stays process-global. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    Host.uprv_tzname_clear_cache();
  },
);
/** Explicit zone/week bootstrap around the actual source owner; locale constructors remain outside this test. */
class OwnedCalendar extends GregorianCalendar {
  /** Transfers a real production zone. @param zone - Owner. @returns Calendar. */
  constructor(zone: TimeZone) {
    super(zone, Locale.getRoot(), [0]);
    this.setTime(0, [0]);
    this.clear();
    this.setFirstDayOfWeek(2);
    this.setMinimalDaysInFirstWeek(4);
  }
}
it("keeps an adopted default before first initialization without querying the host", /** Checks source initDefault early return and owned clone output. @returns Nothing. */ () => {
  const lookup = vi.spyOn(Intl, "DateTimeFormat"),
    source = new SimpleTimeZone(123000, new UnicodeString("preset"));
  adoptDefault(source);
  const value = createDefault() as TimeZone,
    id = new UnicodeString();
  expect(value).not.toBe(source);
  expect(value.getID(id).getBuffer()).toBe("preset");
  expect(value.getRawOffset()).toBe(123000);
  expect(lookup).not.toHaveBeenCalled();
});
it("distinguishes copied defaults, transferred defaults and ignored null", /** Preserves source clone/adopt ownership. @returns Nothing. */ () => {
  const source = new SimpleTimeZone(1000, new UnicodeString("value")),
    id = new UnicodeString();
  setDefault(source);
  source.setRawOffset(2000);
  source.setID(new UnicodeString("changed"));
  expect((createDefault() as TimeZone).getRawOffset()).toBe(1000);
  expect((createDefault() as TimeZone).getID(id).getBuffer()).toBe("value");
  adoptDefault(source);
  adoptDefault(null);
  const a = createDefault() as TimeZone,
    b = createDefault() as TimeZone;
  expect(a).not.toBe(b);
  expect(a.getID(id).getBuffer()).toBe("changed");
  expect(a.getRawOffset()).toBe(2000);
  a.setID(new UnicodeString("local"));
  expect((createDefault() as TimeZone).getID(id).getBuffer()).toBe("changed");
});
it("preserves host hook order, ambiguous short-name rejection and fixed fallback", /** Uses actual source detection over an explicit OS dependency payload. @returns Nothing. */ () => {
  const calls: number[] = [],
    host: Host.TimeZoneHost = {
      /** Records platform initialization. @returns Nothing. */
      uprv_tzset() {
        calls.push(1);
      },
      /** Records host cache clearing. @returns Nothing. */
      uprv_tzname_clear_cache() {
        calls.push(2);
      },
      /** Supplies the fixture host identity. @param index - Standard-name index. @returns Host identity. */
      uprv_tzname(index) {
        expect(index).toBe(0);
        calls.push(3);
        return "GMT";
      },
      /** Supplies fixture seconds west of UTC. @returns Standard offset. */
      uprv_timezone() {
        calls.push(4);
        return -7200;
      },
    },
    id = new UnicodeString(),
    zone = detectHostTimeZoneFromHost(host);
  expect(calls).toEqual([1, 2, 3, 4]);
  expect(zone).toBeInstanceOf(SimpleTimeZone);
  expect(zone.getID(id).getBuffer()).toBe("GMT");
  expect(zone.getRawOffset()).toBe(7200000);
  const failed = {
    ...host,
    /** Supplies the fixture host identity. @returns Host identity. */
    uprv_tzname() {
      return "";
    },
  };
  expect(detectHostTimeZoneFromHost(failed).getID(id).getBuffer()).toBe("Etc/Unknown");
  expect(detectHostTimeZoneFromHost(failed).getRawOffset()).toBe(0);
});
it("maps browser semantic IDs through pinned source zones and reports unavailable mappings", /** Checks the browser-only boundary without sampling seasonal dates or inventing an offset. @returns Nothing. */ () => {
  vi.spyOn(Date, "now").mockReturnValue(0);
  const format = vi.spyOn(Intl, "DateTimeFormat");
  for (const [id, expected, west] of [
    ["America/New_York", "America/New_York", 18000],
    ["UTC", "UTC", 0],
    ["+05:30", "+05:30", -19800],
    ["Not/AZone", "", 0],
  ] as const) {
    format.mockImplementation(
      /** Supplies a semantic browser host identity. @returns Format witness. */ () =>
        ({
          resolvedOptions:
            /** Returns the injected host identity. @returns Resolved options. */ () => ({
              timeZone: id,
            }),
        }) as Intl.DateTimeFormat,
    );
    Host.uprv_tzset();
    Host.uprv_tzname_clear_cache();
    expect(Host.uprv_tzname(0)).toBe(expected);
    expect(Host.uprv_timezone()).toBe(west);
  }
  format.mockImplementation(
    /** Supplies a failed host identity query. @returns Never. */ () => {
      throw new RangeError("host unavailable");
    },
  );
  Host.uprv_tzname_clear_cache();
  expect(Host.uprv_tzname(0)).toBe("");
  expect(Host.uprv_timezone()).toBe(0);
});
it("copies or adopts Calendar zones and preserves null adoption", /** Checks actual inherited ownership rather than a getter override. @returns Nothing. */ () => {
  const initial = createTimeZone(new UnicodeString("UTC")),
    other = createTimeZone(new UnicodeString("GMT+05:30")),
    cal = new OwnedCalendar(initial),
    id = new UnicodeString(),
    status: [number] = [0];
  expect(cal.getTimeZone()).toBe(initial);
  cal.setTime(0, status);
  expect(cal.get(F.UCAL_ZONE_OFFSET, status)).toBe(0);
  cal.adoptTimeZone(null);
  expect(cal.getTimeZone()).toBe(initial);
  cal.setTimeZone(other);
  expect(cal.getTimeZone()).not.toBe(other);
  other.setID(new UnicodeString("changed"));
  expect(cal.getTimeZone().getID(id).getBuffer()).toBe("GMT+05:30");
  expect(cal.get(F.UCAL_ZONE_OFFSET, status)).toBe(19800000);
  const adopted = createTimeZone(new UnicodeString("UTC"));
  cal.adoptTimeZone(adopted);
  expect(cal.getTimeZone()).toBe(adopted);
  expect(cal.get(F.UCAL_ZONE_OFFSET, status)).toBe(0);
});
it("retains cached fields after orphanTimeZone until a source invalidating operation", /** Preserves CALC-319 on real owned zones. @returns Nothing. */ () => {
  const initial = createTimeZone(new UnicodeString("Europe/Paris")),
    cal = new OwnedCalendar(initial),
    status: [number] = [0],
    id = new UnicodeString();
  setDefault(createTimeZone(new UnicodeString("Etc/GMT+5")));
  cal.setTime(0, status);
  expect(cal.get(F.UCAL_ZONE_OFFSET, status)).toBe(3600000);
  expect(cal.orphanTimeZone()).toBe(initial);
  expect(cal.getTimeZone().getID(id).getBuffer()).toBe("Etc/GMT+5");
  expect(cal.get(F.UCAL_ZONE_OFFSET, status)).toBe(3600000);
  cal.setTimeZone(cal.getTimeZone());
  expect(cal.get(F.UCAL_ZONE_OFFSET, status)).toBe(-18000000);
  expect(cal.getTime(status)).toBe(0);
});
it("uses locale timezone keyword only when its checked C buffer is terminated", /** Source capacity96 warning/error falls back to default; unknown well-formed IDs still create Unknown. @returns Nothing. */ () => {
  const id = new UnicodeString();
  setDefault(createTimeZone(new UnicodeString("GMT+05:30")));
  expect(forLocaleOrDefault(new Locale("@timezone=America/New_York"))?.getID(id).getBuffer()).toBe(
    "America/New_York",
  );
  expect(forLocaleOrDefault(new Locale("@timezone=Not/AZone"))?.getID(id).getBuffer()).toBe(
    "Etc/Unknown",
  );
  expect(
    forLocaleOrDefault(new Locale("@timezone=" + "x".repeat(95)))
      ?.getID(id)
      .getBuffer(),
  ).toBe("Etc/Unknown");
  expect(
    forLocaleOrDefault(new Locale("@timezone=" + "x".repeat(96)))
      ?.getID(id)
      .getBuffer(),
  ).toBe("GMT+05:30");
  expect(forLocaleOrDefault(new Locale("@timezone=America/New_York!"))?.getID(id).getBuffer()).toBe(
    "GMT+05:30",
  );
});

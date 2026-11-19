/** @fileoverview Complete pinned sal/qa/rtl/locale/rtl_locale.cxx assertions plus registration/lifecycle edge cases. */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as locale from "../inc/rtl/locale";
import { rtl_locale_init, rtl_locale_fini } from "./locale";
import { rtl_uString_release } from "./ustring";
import type { rtl_Locale } from "../inc/rtl/locale";
import type { rtl_uString } from "../inc/rtl/ustring.h";

/** Creates a terminated original UTF16 input. @param value - Input text. @returns Units with terminator. */
function units(value: string): Uint16Array {
  return Uint16Array.from([
    ...value
      .split("")
      .map(
        /** Converts one UTF16 unit. @param unit - One-unit string. @returns Numeric code unit. */ (
          unit,
        ) => unit.charCodeAt(0),
      ),
    0,
  ]);
}
/** Reads a live RTL string without acquiring another reference. @param value - Original data. @returns Logical text. */
function text(value: rtl_uString): string {
  return String.fromCharCode(...value.buffer.subarray(0, value.length));
}
/** Selects the upstream fixture default. @returns Nothing. */
function setDefaultLocale(): void {
  locale.rtl_locale_setDefault(units("de"), units("DE"), units("hochdeutsch"));
}
/** Returns the fixture's registered default. @returns Live locale. */
function current(): rtl_Locale {
  return locale.rtl_locale_getDefault() as rtl_Locale;
}

beforeEach(
  /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    rtl_locale_fini();
    rtl_locale_init();
    setDefaultLocale();
  },
);
afterEach(rtl_locale_fini);

describe("original rtl_locale CppUnit suites", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
  it("getDefault_001", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    expect(locale.rtl_locale_getDefault()).not.toBeNull();
  });
  it("setDefault_001", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    locale.rtl_locale_setDefault(units("en"), units("US"), units(""));
    expect(locale.rtl_locale_getDefault()).not.toBeNull();
    setDefaultLocale();
  });
  it("getLanguage_001", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    expect(text(current().Language)).toBe("de");
  });
  it("getLanguage_002", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    const value = locale.rtl_locale_getLanguage(current());
    expect(text(value)).toBe("de");
    rtl_uString_release(value);
  });
  it("getCountry_001", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    expect(text(current().Country)).toBe("DE");
  });
  it("getCountry_002", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    const value = locale.rtl_locale_getCountry(current());
    expect(text(value)).toBe("DE");
    rtl_uString_release(value);
  });
  it("getVariant_001", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    expect(text(current().Variant)).toBe("hochdeutsch");
  });
  it("getVariant_002", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    const value = locale.rtl_locale_getVariant(current());
    expect(text(value)).toBe("hochdeutsch");
    rtl_uString_release(value);
  });
  it("hashCode_001", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    expect(current().HashCode).not.toBe(0);
  });
  it("hashCode_002", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    expect(locale.rtl_locale_hashCode(current())).not.toBe(0);
  });
  it("equals_001", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    const first = locale.rtl_locale_register(units("en"), units("US"), units(""));
    const second = locale.rtl_locale_register(units("en"), units("US"), units(""));
    expect(first).toBe(second);
  });
  it("equals_002", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
    const first = locale.rtl_locale_register(units("en"), units("US"), units(""));
    const second = locale.rtl_locale_register(units("en"), units("US"), units(""));
    expect(locale.rtl_locale_equals(first, second)).not.toBe(0);
  });
});

it("retains null option defaults, terminated input copies, identity and hash collisions", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
  const language = units("en\0ignored");
  const empty = locale.rtl_locale_register(language, null, null);
  language[0] = 120;
  expect(text(empty.Language)).toBe("en");
  expect(text(empty.Country)).toBe("");
  expect(text(empty.Variant)).toBe("");
  expect(locale.rtl_locale_register(units("en"), units(""), units(""))).toBe(empty);
  const first = locale.rtl_locale_register(units("en"), units("US"), units("GB"));
  const collision = locale.rtl_locale_register(units("en"), units("GB"), units("US"));
  expect(collision).toBe(first);
  expect(text(collision.Country)).toBe("US");
  expect(text(collision.Variant)).toBe("GB");
  expect(locale.rtl_locale_equals(first, empty)).toBe(0);
});

it("keeps acquired strings live across table finalization and resets the default", /** Executes the named upstream fixture or registration regression. @returns Nothing. */ () => {
  const original = current();
  const language = locale.rtl_locale_getLanguage(original);
  const country = locale.rtl_locale_getCountry(original);
  const variant = locale.rtl_locale_getVariant(original);
  rtl_locale_fini();
  expect(locale.rtl_locale_getDefault()).toBeNull();
  expect([text(language), text(country), text(variant)]).toEqual(["de", "DE", "hochdeutsch"]);
  rtl_uString_release(language);
  rtl_uString_release(country);
  rtl_uString_release(variant);
  setDefaultLocale();
  expect(current()).not.toBe(original);
});

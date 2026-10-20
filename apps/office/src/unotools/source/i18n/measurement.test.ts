/** @fileoverview Native measurement mapping and shared locale field/fallback assertions. */
import { expect, it } from "vitest";
import {
  setConfiguredSystemLanguage,
  getConfiguredSystemLanguage,
} from "../../../i18nlangtag/source/isolang/mslangid";
import { getSystemDecimalSeparatorAlternate } from "../misc/syslocale";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  getLocaleMeasurementSystem,
  getLocaleDecimalSeparatorAlternate,
  getLocaleThousandSeparator,
  getLocaleDecimalSeparator,
} from "../../../i18npool/source/localedata/localedata";
import {
  getMeasurementSystemEnum,
  mapMeasurementStringToEnum,
  MeasurementSystem,
} from "./localedatawrapper";
/** Actual ASCII resource Locale field. @param value - ASCII text. @returns Value. */
function u(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value,
      /** Maps one ASCII unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}
it("uses the original measurement strings and the same prepared-locale fallback as decimals", /** Checks source resource examples and mapping. @returns Nothing. */ () => {
  for (const text of ["metric", "METRIC", "Metric", "mEtRiC"])
    expect(mapMeasurementStringToEnum(text)).toBe(MeasurementSystem.Metric);
  for (const text of ["US", "UK", "metric ", "metric\n", "metric\r", "métric", ""])
    expect(mapMeasurementStringToEnum(text)).toBe(MeasurementSystem.US);
  const us = new Locale(u("en"), u("US"), u(""));
  expect(getLocaleDecimalSeparatorAlternate(us)).toBe("");
  expect(getLocaleThousandSeparator(us)).toBe(",");
  expect(getLocaleDecimalSeparatorAlternate(new Locale(u("ar"), u("DZ"), u("")))).toBe(".");
  expect(getLocaleMeasurementSystem(us)).toBe("US");
  expect(getMeasurementSystemEnum(us)).toBe(1);
  expect(getLocaleDecimalSeparator(us)).toBe(".");
  const gb = new Locale(u("en"), u("GB"), u(""));
  expect(getMeasurementSystemEnum(gb)).toBe(0);
  const de = new Locale(u("de"), u("DE"), u(""));
  expect(getMeasurementSystemEnum(de)).toBe(0);
  expect(getLocaleDecimalSeparator(de)).toBe(",");
  for (const [language, country, variant, want] of [
    ["zz", "ZZ", "", "US"],
    ["sh", "", "", "metric"],
    ["tlh", "ZZ", "", "US"],
    ["en", "ZZ", "", "US"],
    ["de", "ZZ", "", "metric"],
    ["qlt", "", "de-DE-x-private", "metric"],
    ["qlt", "", "x-private", "US"],
    ["qlt", "", "en-US", "US"],
  ]) {
    expect(
      getLocaleMeasurementSystem(
        new Locale(u(language as string), u(country as string), u(variant as string)),
      ),
    ).toBe(want);
  }
});

it("exposes the source alternate decimal field through the actual configured system locale", /** Genuine locale configuration and resource field. @returns Nothing. */ () => {
  const previous = getConfiguredSystemLanguage();
  try {
    setConfiguredSystemLanguage(0x1401);
    expect(getSystemDecimalSeparatorAlternate()).toBe(".");
  } finally {
    setConfiguredSystemLanguage(previous);
  }
});

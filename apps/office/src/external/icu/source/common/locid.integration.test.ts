/** @fileoverview Validates ICU fixed-locale ownership, ordinary payload boundaries and native oversized-component admission. */
import { expect, it } from "vitest";
import { Locale } from "./locid";

it.each([
  [Locale.getEnglish, "en"],
  [Locale.getFrench, "fr"],
  [Locale.getGerman, "de"],
  [Locale.getItalian, "it"],
  [Locale.getJapanese, "ja"],
  [Locale.getKorean, "ko"],
  [Locale.getChinese, "zh"],
  [Locale.getFrance, "fr_FR"],
  [Locale.getGermany, "de_DE"],
  [Locale.getItaly, "it_IT"],
  [Locale.getJapan, "ja_JP"],
  [Locale.getKorea, "ko_KR"],
  [Locale.getChina, "zh_CN"],
  [Locale.getTaiwan, "zh_TW"],
  [Locale.getUK, "en_GB"],
  [Locale.getUS, "en_US"],
  [Locale.getCanada, "en_CA"],
  [Locale.getCanadaFrench, "fr_CA"],
  [Locale.getRoot, ""],
] as const)(
  "retains the borrowed fixed locale %s as %s",
  /** Each source public factory returns its stable shared owner; copied values remain independently mutable. @param factory - Native fixed factory. @param expected - Independent standard locale ID. @returns Nothing. */ (
    factory,
    expected,
  ) => {
    const borrowed = factory(),
      copied = new Locale(borrowed);
    expect(borrowed.getName()).toBe(expected);
    expect(factory()).toBe(borrowed);
    expect(copied).not.toBe(borrowed);
    copied.setToBogus();
    expect(borrowed.getName()).toBe(expected);
    expect(borrowed.isBogus()).toBe(false);
  },
);

it("preserves heap base names without keywords and all bogus component getters", /** Checks public value results for both payload representations and failed initialization. @returns Nothing. */ () => {
  const longLanguage = new Locale("abcdefghij");
  expect(longLanguage.isBogus()).toBe(false);
  expect(longLanguage.getBaseName()).toBe("abcdefghij");
  expect(longLanguage.assign(longLanguage)).toBe(longLanguage);
  expect(longLanguage.getName()).toBe("abcdefghij");
  const invalid = new Locale("abcdefghijkl");
  expect(invalid.isBogus()).toBe(true);
  expect([
    invalid.getLanguage(),
    invalid.getScript(),
    invalid.getCountry(),
    invalid.getBaseName(),
    invalid.getVariant(),
  ]).toEqual(["", "", "", "", ""]);
  const script = new Locale("sr_Latn_RS");
  expect(script.getScript()).toBe("Latn");
});

it("rejects each original component beyond the native construction size limit", /** Uses one actual readable string, without fabricating C pointers or string lengths. @returns Nothing. */ () => {
  const oversized = "x".repeat(357913942);
  for (const value of [
    new Locale(oversized),
    new Locale("en", oversized),
    new Locale("en", "US", oversized),
    new Locale("en", "US", "", oversized),
  ])
    expect(value.isBogus()).toBe(true);
});

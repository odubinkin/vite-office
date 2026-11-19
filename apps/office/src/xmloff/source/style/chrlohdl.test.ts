/** @fileoverview Native ODF character locale mapping with Western, Asian and complex tags. */
import { expect, it } from "vitest";
import {
  LANGUAGE_ARABIC_SAUDI_ARABIA,
  LANGUAGE_CHINESE_SIMPLIFIED,
  LANGUAGE_ENGLISH_US,
  LANGUAGE_NONE,
  LANGUAGE_SYSTEM,
} from "../../../i18nlangtag/inc/lang";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { XMLCharLocale, exportCharLocale } from "./chrlohdl";

it("round trips ISO script families and the native absent-country spellings", /** Exercises native scalar conversion and ODF none, including no-linguistic-content. @returns Nothing. */ () => {
  for (const [id, language, country] of [
    [LANGUAGE_ENGLISH_US, "en", "US"],
    [LANGUAGE_CHINESE_SIMPLIFIED, "zh", "CN"],
    [LANGUAGE_ARABIC_SAUDI_ARABIA, "ar", "SA"],
    [LANGUAGE_NONE, "zxx", "none"],
    [LANGUAGE_SYSTEM, "none", "none"],
  ] as const) {
    expect(exportCharLocale(id)).toEqual({ language, country });
    const locale = new XMLCharLocale();
    locale.importXML("language", language);
    locale.importXML("country", country);
    expect(locale.getLanguageType()).toBe(id);
  }
});

it("assembles script subtags before or after the other attributes", /** Preserves native deferred-script merging and first country selection. @returns Nothing. */ () => {
  const expected = new LanguageTag("sr-Latn-RS").getLanguageType();
  const scriptFirst = new XMLCharLocale();
  scriptFirst.importXML("script", "Latn");
  scriptFirst.importXML("script", "Cyrl");
  scriptFirst.importXML("country", "RS");
  scriptFirst.importXML("language", "sr");
  scriptFirst.importXML("country", "CA");
  expect(scriptFirst.getLanguageType()).toBe(expected);
  const languageFirst = new XMLCharLocale();
  languageFirst.importXML("language", "sr");
  languageFirst.importXML("script", "Latn");
  languageFirst.importXML("country", "RS");
  expect(languageFirst.getLanguageType()).toBe(expected);
  const fields = exportCharLocale(expected);
  expect(fields).toEqual({ language: "sr", script: "Latn", country: "RS", tag: "sr-Latn-RS" });
});

it("keeps exact RFC tags ahead of decomposed attributes and accepts short ISO spellings", /** Covers the native short-tag and extended-tag paths. @returns Nothing. */ () => {
  const long = new XMLCharLocale();
  long.importXML("tag", "de-DE-1901");
  long.importXML("language", "en");
  long.importXML("script", "Latn");
  long.importXML("country", "DE");
  long.importXML("tag", "en-US");
  const german = new LanguageTag("de-DE-1901").getLanguageType();
  expect(long.getLanguageType()).toBe(german);
  expect(exportCharLocale(german).tag).toBe("de-DE-1901");

  const short = new XMLCharLocale();
  short.importXML("tag", "");
  short.importXML("tag", "en-US");
  short.importXML("tag", "en-US");
  expect(short.getLanguageType()).toBe(LANGUAGE_ENGLISH_US);
  const conflict = new XMLCharLocale();
  conflict.importXML("language", "de");
  conflict.importXML("country", "DE");
  conflict.importXML("tag", "en");
  expect(conflict.getLanguageType()).toBe(new LanguageTag("en").getLanguageType());

  const privateUse = new XMLCharLocale();
  privateUse.importXML("tag", "x-foo");
  expect(privateUse.getLanguageType()).toBe(new LanguageTag("x-foo").getLanguageType());
  expect(exportCharLocale(privateUse.getLanguageType()).tag).toBe("x-foo");
});

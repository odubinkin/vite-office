/** @fileoverview Source wrapper and on-demand case-ignore contracts over the native module. */
import { expect, it } from "vitest";
import { LANGUAGE_ENGLISH_US } from "../../../i18nlangtag/inc/lang";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { OnDemandTransliterationWrapper } from "../../../svl/inc/ondemand";
import { TransliterationWrapper } from "./transliterationwrapper";

it("uses native IGNORE_CASE comparison and preserves source full-string match behavior", /** Checks uses native IGNORE_CASE comparison and preserves source full-string match behavior. @returns Test completion or assertion result. */ () => {
  const wrapper = new TransliterationWrapper(TransliterationFlags.IGNORE_CASE),
    first = unicode("AbC"),
    second = unicode("aBc"),
    longer = unicode("abcd"),
    match1: [number] = [9],
    match2: [number] = [9];
  try {
    expect(wrapper.getType()).toBe(TransliterationFlags.IGNORE_CASE);
    expect(wrapper.needLanguageForTheMode()).toBe(true);
    wrapper.loadModuleIfNeeded(LANGUAGE_ENGLISH_US);
    expect(wrapper.isEqual(first, second)).toBe(true);
    expect(wrapper.isEqual(first, longer)).toBe(false);
    expect(wrapper.equals(first, 0, 2, match1, second, 0, 3, match2)).toBe(false);
    expect([match1[0], match2[0]]).toEqual([2, 2]);
  } finally {
    longer.dispose();
    second.dispose();
    first.dispose();
    wrapper.dispose();
  }
});

it("rejects modes outside the represented native case-ignore module", /** Checks the wrapper admission boundary before a caller can rely on another transliteration mode. @returns Nothing. */ () => {
  expect(
    /** Attempts an unrepresented mode. @returns No usable wrapper. */ () =>
      new TransliterationWrapper(TransliterationFlags.NONE),
  ).toThrow("TransliterationWrapper mode is outside the represented module set");
});

it("lazily creates and reuses the transliteration wrapper across locale invalidation", /** Checks lazily creates and reuses the transliteration wrapper across locale invalidation. @returns Test completion or assertion result. */ () => {
  const owner = new OnDemandTransliterationWrapper(),
    first = unicode("A"),
    second = unicode("a");
  try {
    expect(owner.isInitialized()).toBe(false);
    owner.init(LANGUAGE_ENGLISH_US);
    expect(owner.isInitialized()).toBe(true);
    const wrapper = owner.get();
    expect(wrapper.isEqual(first, second)).toBe(true);
    owner.changeLocale(LANGUAGE_ENGLISH_US);
    expect(owner.get()).toBe(wrapper);
  } finally {
    second.dispose();
    first.dispose();
    owner.dispose();
  }
});

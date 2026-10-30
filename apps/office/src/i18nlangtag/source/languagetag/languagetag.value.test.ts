/** @fileoverview Actual public LanguageTag constructors, shared registry and source getter/conversion transitions. */
import { expect, it, vi } from "vitest";
import { LanguageTag } from "./languagetag.value";
import { unicode, text } from "../isolang/isolang.tables";
import { LANGUAGE_ENGLISH_US, LANGUAGE_GERMAN, LANGUAGE_SYSTEM } from "../../inc/lang";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { ImplPtr } from "../../runtime/implementation-pointer";
import { getKnowns } from "./languagetag.knowns";
import { MsLangId } from "../../inc/mslangid";

it.each([
  ["en-US", "en-US", "en", "", "US"],
  ["de-Latn-DE", "de-DE", "de", "", "DE"],
  ["i-klingon", "tlh", "tlh", "", ""],
  ["C", "en-US", "en", "", "US"],
  ["sr-Latn-RS", "sr-Latn-RS", "sr", "Latn", "RS"],
])(
  "registers and queries actual %s" /** Checks actual source component transitions. @param input - Constructor string. @param canonical - Expected tag. @param language - Expected language. @param script - Expected script. @param country - Expected country. @returns Nothing. */,
  (input, canonical, language, script, country) => {
    const value = unicode(input);
    const tag = new LanguageTag(value, true);
    value.dispose();
    try {
      expect(text(tag.getBcp47())).toBe(canonical);
      for (const [field, expected] of [
        [tag.getLanguage(), language],
        [tag.getScript(), script],
        [tag.getCountry(), country],
      ] as const) {
        try {
          expect(text(field)).toBe(expected);
        } finally {
          field.dispose();
        }
      }
      expect(tag.isValidBcp47()).toBe(true);
    } finally {
      tag.dispose();
    }
  },
);

it("keeps dynamic tags registered across value destruction and numeric construction", /** Exercises actual source value ownership and registration. @returns Nothing. */ () => {
  const value = unicode("x-aqf9ag-owner");
  const first = new LanguageTag(value);
  value.dispose();
  const id = first.getLanguageType();
  const implementation = first.mpImpl.get();
  expect(LanguageTag.isOnTheFlyID(id)).toBe(true);
  first.setScriptType(LanguageTag.ScriptType.CTL);
  first.setScriptType(LanguageTag.ScriptType.WESTERN);
  first.dispose();
  const second = new LanguageTag(id);
  try {
    expect(text(second.getBcp47())).toBe("x-aqf9ag-owner");
    expect(second.mpImpl.get()).toBe(implementation);
    expect(second.getScriptType()).toBe(LanguageTag.ScriptType.CTL);
    expect(LanguageTag.getOnTheFlyScriptType(id)).toBe(LanguageTag.ScriptType.CTL);
    const locale = LanguageTag.convertToLocale(id);
    try {
      expect(text(locale.Variant)).toBe("x-aqf9ag-owner");
    } finally {
      locale.dispose();
    }
  } finally {
    second.dispose();
  }
});

it("copies shared values while reset detaches only the resetting value", /** Exercises actual source value ownership and registration. @returns Nothing. */ () => {
  const first = new LanguageTag(LANGUAGE_ENGLISH_US);
  expect(text(first.getBcp47())).toBe("en-US");
  const second = new LanguageTag(first);
  try {
    expect(second.mpImpl.get()).toBe(first.mpImpl.get());
    first.reset(LANGUAGE_GERMAN);
    expect(text(first.getBcp47())).toBe("de-DE");
    expect(text(second.getBcp47())).toBe("en-US");
  } finally {
    first.dispose();
    second.dispose();
  }
});

it("preserves the different Locale constructor and reset initialization flags", /** Exercises actual source value ownership and registration. @returns Nothing. */ () => {
  const locale = new Locale();
  const language = unicode("en");
  locale.Language.assign(language);
  language.dispose();
  const tag = new LanguageTag(locale);
  try {
    expect(tag.mbInitializedLocale).toBe(false);
    tag.reset(locale);
    expect(tag.mbInitializedLocale).toBe(true);
    expect(text(tag.getBcp47())).toBe("en");
  } finally {
    tag.dispose();
    locale.dispose();
  }
});

it("preserves source SYSTEM origin and already-bound implementation after reconfiguration", /** Exercises actual source value ownership and registration. @returns Nothing. */ () => {
  LanguageTag.setConfiguredSystemLanguage(LANGUAGE_ENGLISH_US);
  const old = new LanguageTag();
  try {
    expect(text(old.getBcp47(false))).toBe("");
    expect(text(old.getBcp47())).toBe("en-US");
    LanguageTag.setConfiguredSystemLanguage(LANGUAGE_GERMAN);
    const current = new LanguageTag();
    try {
      expect(text(current.getBcp47())).toBe("de-DE");
      expect(text(old.getBcp47())).toBe("en-US");
      expect(old.isSystemLocale()).toBe(true);
      expect(old.getLanguageType(false)).toBe(LANGUAGE_SYSTEM);
    } finally {
      current.dispose();
    }
  } finally {
    old.dispose();
    LanguageTag.setConfiguredSystemLanguage(LANGUAGE_ENGLISH_US);
  }
});

it("releases an implementation exactly when its last owned pointer is destroyed", /** Exercises actual source value ownership and registration. @returns Nothing. */ () => {
  let destroyed = 0;
  const value = {
    /** Counts actual last-reference destruction. @returns Nothing. */
    dispose() {
      destroyed++;
    },
  };
  const first = new ImplPtr(value);
  const second = first.copy();
  first.assign(first);
  first.dispose();
  expect(destroyed).toBe(0);
  expect(second.get()).toBe(value);
  second.dispose();
  second.dispose();
  expect(destroyed).toBe(1);
});

it("initializes the real known set with actual numeric owners and complete fallbacks", /** Exercises actual source value ownership and registration. @returns Nothing. */ () => {
  const known = getKnowns(
    /** Constructs from the actual raw source ID. @param id - Original ID. @returns Owned value. */ (
      id,
    ) => new LanguageTag(id),
  );
  expect(known.has("en-US")).toBe(true);
  expect(known.has("en")).toBe(true);
  expect(known.has("de-DE")).toBe(true);
  expect(known.has("sr-Latn")).toBe(true);
  expect(known.has("EN-us")).toBe(false);
  expect(known.size).toBeGreaterThan(500);
});

it("returns an unresolved SYSTEM Locale before consulting system-language resolution", /** Checks the source lcl_isSystem early return without replacing its resolver. @returns Nothing. */ () => {
  const resolver = vi.spyOn(MsLangId, "getRealLanguage");
  try {
    const locale = LanguageTag.convertToLocale(LANGUAGE_SYSTEM, false);
    try {
      expect(locale.Language.getLength()).toBe(0);
      expect(resolver).not.toHaveBeenCalled();
    } finally {
      locale.dispose();
    }
  } finally {
    resolver.mockRestore();
  }
});

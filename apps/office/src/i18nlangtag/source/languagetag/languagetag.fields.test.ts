/** @fileoverview Source private component-cache transitions over actual shared strings and parsed liblangtag values. */
import { expect, it } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../isolang/isolang.tables";
import { lt_tag_new, type Tag } from "../../../external/liblangtag/liblangtag/lt-tag";
import { lt_tag_parse } from "../../../external/liblangtag/liblangtag/lt-tag.parse";
import * as fields from "./languagetag.fields";

/** Explicit prepared private-field fixture, not a replacement LanguageTag implementation. */
class PreparedFields implements fields.LanguageTagFieldState {
  readonly maBcp47: OUString;
  readonly maCachedLanguage = new OUString();
  readonly maCachedScript = new OUString();
  readonly maCachedCountry = new OUString();
  readonly maCachedVariants = new OUString();
  mbCachedLanguage = false;
  mbCachedScript = false;
  mbCachedCountry = false;
  mbCachedVariants = false;
  calls = 0;
  /** Supplies original already-canonicalized private inputs for isolated member tests. @param tag - Source BCP47 field. @param mpImplLangtag - Actual parsed liblangtag owner or source null. @returns Fixture. */
  constructor(
    tag: string,
    readonly mpImplLangtag: Tag | null = null,
  ) {
    this.maBcp47 = unicode(tag);
  }
  /** Records original enclosing-method calls; it deliberately does not claim to implement canonicalization. @returns Unchanged prepared state. */
  synCanonicalize(): boolean {
    this.calls++;
    return false;
  }
  /** Releases actual shared string members. @returns Nothing. */
  dispose(): void {
    for (const value of [
      this.maBcp47,
      this.maCachedLanguage,
      this.maCachedScript,
      this.maCachedCountry,
      this.maCachedVariants,
    ])
      value.dispose();
  }
}

it.each([
  ["DE-lATN-de-1901", ["de", "Latn", "DE", "1901"]],
  ["es-419", ["es", "", "", ""]],
  ["ES-lATN-419-1901", ["es", "Latn", "", "1901"]],
  ["es-ES-u-co-trad", ["es", "", "ES", "u-co-trad"]],
  ["ca-valencia", ["ca", "", "", "valencia"]],
])(
  "retains original simple-cache fields for %s",
  /** Checks all four cache writes and no synthetic numeric country. @param tag - Prepared native field. @param expected - Source field outputs. @returns Nothing. */ (
    tag,
    expected,
  ) => {
    const state = new PreparedFields(tag);
    try {
      expect(
        [
          fields.getLanguage.call(state),
          fields.getScript.call(state),
          fields.getCountry.call(state),
          fields.getVariants.call(state),
        ].map(text),
      ).toEqual(expected);
      expect(state.calls).toBe(1);
      expect(
        state.mbCachedLanguage &&
          state.mbCachedScript &&
          state.mbCachedCountry &&
          state.mbCachedVariants,
      ).toBe(true);
      const region = fields.getRegion.call(state);
      try {
        expect(text(region)).toBe(expected[2]);
      } finally {
        region.dispose();
      }
      expect(state.calls).toBe(2);
    } finally {
      state.dispose();
    }
  },
);

it.each(["x-private", "*", "C", "a-malformed-tag"])(
  "caches empty components without inventing a language for %s",
  /** Checks original extraction failure/private decisions and empty-result caching. @param tag - Prepared source value. @returns Nothing. */ (
    tag,
  ) => {
    const state = new PreparedFields(tag);
    try {
      expect(text(fields.getLanguage.call(state))).toBe("");
      expect(text(fields.getLanguage.call(state))).toBe("");
      expect(state.calls).toBe(1);
      expect(state.mbCachedScript).toBe(false);
      expect(text(fields.getScript.call(state))).toBe("");
      expect(state.calls).toBe(2);
    } finally {
      state.dispose();
    }
  },
);

it("keeps raw liblangtag numeric regions separate from the country cache", /** Uses the real parser owner and independent returned region string. @returns Nothing. */ () => {
  const tag = lt_tag_new();
  expect(lt_tag_parse(tag, "es-Latn-419")).toBe(true);
  const state = new PreparedFields("es-Latn-419", tag);
  try {
    expect(text(fields.getCountry.call(state))).toBe("");
    const raw = fields.getRegion.call(state);
    try {
      expect(text(raw)).toBe("419");
    } finally {
      raw.dispose();
    }
    expect(text(fields.getLanguage.call(state))).toBe("es");
    expect(text(fields.getScript.call(state))).toBe("Latn");
    expect(text(fields.getVariants.call(state))).toBe("");
    const before = state.calls;
    expect(fields.getCountry.call(state)).toBe(state.maCachedCountry);
    expect(state.calls).toBe(before);
  } finally {
    state.dispose();
  }
});

it("preserves parsed variant order and canonicalizer-before-empty ordering", /** Exercises real registered variant lists and source empty BCP47 gate. @returns Nothing. */ () => {
  const tag = lt_tag_new();
  expect(lt_tag_parse(tag, "sl-rozaj-biske")).toBe(true);
  const state = new PreparedFields("sl-rozaj-biske", tag);
  try {
    expect(text(fields.getVariants.call(state))).toBe("rozaj-biske");
    state.maBcp47.clear();
    const language = fields.getLanguageFromLangtag.call(state);
    try {
      expect(text(language)).toBe("");
    } finally {
      language.dispose();
    }
    expect(state.calls).toBe(2);
  } finally {
    state.dispose();
  }
});

it.each([
  ["isIsoLanguage", "en", true],
  ["isIsoLanguage", "qzz", true],
  ["isIsoLanguage", "EN", false],
  ["isIsoLanguage", "", false],
  ["isIsoCountry", "", true],
  ["isIsoCountry", "US", true],
  ["isIsoCountry", "us", false],
  ["isIsoCountry", "419", false],
  ["isIsoScript", "", true],
  ["isIsoScript", "Latn", true],
  ["isIsoScript", "latn", false],
  ["isIsoScript", "LATN", false],
] as const)(
  "preserves %s(%s)",
  /** Checks ASCII shape rather than registry membership or Unicode normalization. @param method - Predicate. @param input - Actual value. @param expected - Source result. @returns Nothing. */ (
    method,
    input,
    expected,
  ) => {
    const value = unicode(input);
    try {
      expect(fields[method](value)).toBe(expected);
    } finally {
      value.dispose();
    }
  },
);

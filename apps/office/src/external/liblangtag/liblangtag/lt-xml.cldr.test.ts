/** @fileoverview Complete functional CLDR value exposure, native document ordering and immutability. */
import { expect, it } from "vitest";
import data from "../data/cldr-parsing.json";
import { cldrLanguageAliases, getCldrKeywords, type CldrBcp47Group } from "./lt-xml.cldr";

it("preserves every ordered keyword/type record in all seven source documents", /** Independent original XML equivalence is checked separately in the source audit. @returns Nothing. */ () => {
  expect(
    data.groups.map(
      /** Counts native merged document keys. @param g - Group. @returns Count. */ (g) => g.length,
    ),
  ).toEqual([3, 12, 2, 1, 1, 5, 4]);
  for (let i = 1; i <= 7; i++) {
    const keys = getCldrKeywords(i as CldrBcp47Group);
    expect(keys).toEqual(data.groups[i - 1]);
    expect(Object.isFrozen(keys)).toBe(true);
    for (const key of keys) {
      expect(Object.isFrozen(key)).toBe(true);
      expect(Object.isFrozen(key.attributes)).toBe(true);
      expect(Object.isFrozen(key.types)).toBe(true);
      for (const type of key.types) expect(Object.isFrozen(type)).toBe(true);
    }
  }
  expect(
    getCldrKeywords(6).map(
      /** Exposes original five-file append order. @param k - Key. @returns Name. */ (k) =>
        k.attributes.name,
    ),
  ).toEqual(["m0", "i0", "k0", "t0", "x0"]);
});

it("retains ordered language aliases and explicitly keeps macrolanguage reasons unfiltered", /** Canonicalizer filtering is a separate pending source responsibility. @returns Nothing. */ () => {
  expect(cldrLanguageAliases).toHaveLength(484);
  expect(cldrLanguageAliases).toEqual(data.languageAliases);
  expect(Object.isFrozen(cldrLanguageAliases)).toBe(true);
  for (const alias of cldrLanguageAliases) expect(Object.isFrozen(alias)).toBe(true);
  expect(
    cldrLanguageAliases.find(
      /** Selects the source alias from pinned data. @param a - Alias. @returns Match. */ (a) =>
        a.type === "cmn",
    ),
  ).toEqual({ type: "cmn", replacement: "zh", reason: "macrolanguage" });
  expect(
    cldrLanguageAliases.find(
      /** Selects original legacy alias. @param a - Alias. @returns Match. */ (a) =>
        a.type === "i_default",
    )?.replacement,
  ).toBe("en_x_i_default");
});

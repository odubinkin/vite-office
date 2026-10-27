/** @fileoverview Actual ICU language-tag owner retains partial results, linked-list ordering, legacy replacement lengths and original lvariant semantics. */
import { expect, it } from "vitest";
import * as T from "./uloc_tag";
/** Calls the actual source parser and observes the consumed getters. @param text - Narrow input. @param len - Explicit/negative source count. @param incoming - Sticky status. @returns Public internal observations. */
function parse(text: string, len = -1, incoming = 0) {
  const status: [number] = [incoming],
    parsed: [number] = [77],
    tag = T.ultag_parse(text, len, parsed, status);
  return {
    tag,
    status: status[0],
    parsed: parsed[0],
    language: tag ? T.ultag_getLanguage(tag) : null,
    script: tag ? T.ultag_getScript(tag) : null,
    region: tag ? T.ultag_getRegion(tag) : null,
    privateuse: tag ? T.ultag_getPrivateUse(tag) : null,
  };
}
it("retains source field casing, three extlang slots and complete partial length", /** No extra acceptance/rejection is applied. @returns Nothing. */ () => {
  const text = "EN-abc-def-ghi-LatN-us-posix-1901",
    result = parse(text),
    tag = result.tag as T.ULanguageTag;
  expect([result.status, result.parsed, result.language, result.script, result.region]).toEqual([
    0,
    text.length,
    "en",
    "Latn",
    "US",
  ]);
  expect(T.ultag_getExtlangSize(tag)).toBe(3);
  expect(
    [-1, 0, 1, 2, 3].map(
      /** Reads original nullable extlang output. @param i - Index. @returns View/null. */ (i) =>
        T.ultag_getExtlang(tag, i),
    ),
  ).toEqual([null, "abc", "def", "ghi", null]);
  expect(T.ultag_getVariant(tag, 0)).toBe("POSIX");
  expect(T.ultag_getVariant(tag, 1)).toBe("1901");
  expect(T.ultag_getVariant(tag, -1)).toBeNull();
  expect(T.ultag_getVariant(tag, 2)).toBeNull();
  expect(parse("abcd-abc").parsed).toBe(4);
});
it("returns partial success on invalid or repeated subtags", /** Preserves source lenient parsing rather than introducing a format error. @returns Nothing. */ () => {
  expect(parse("en--US").parsed).toBe(2);
  expect(parse("en-posix-POSIX").parsed).toBe(8);
  const incomplete = parse("en-u");
  expect(incomplete.status).toBe(0);
  expect(incomplete.parsed).toBe(2);
  expect(T.ultag_getExtensionsSize(incomplete.tag as T.ULanguageTag)).toBe(0);
  const privateGap = parse("en-u-ca-x");
  expect(privateGap.parsed).toBe(7);
  expect(T.ultag_getExtensionValue(privateGap.tag as T.ULanguageTag, 0)).toBe("ca");
});
it("preserves variant order while ordering extensions by key", /** The later locale converter owns variant sorting. @returns Nothing. */ () => {
  const result = parse("en-posix-1901-z-value-a-test"),
    tag = result.tag as T.ULanguageTag;
  expect(T.ultag_getVariant(tag, 0)).toBe("POSIX");
  expect(T.ultag_getVariant(tag, 1)).toBe("1901");
  expect(T.ultag_getExtensionKey(tag, 0)).toBe("a");
  expect(T.ultag_getExtensionValue(tag, 0)).toBe("test");
  expect(T.ultag_getExtensionKey(tag, 1)).toBe("z");
  expect(T.ultag_getExtensionValue(tag, 1)).toBe("value");
  expect(T.ultag_getExtensionKey(tag, 2)).toBeNull();
  expect(T.ultag_getExtensionValue(tag, -1)).toBeNull();
});
it("retains legacy/redundant replacement parsed-length deltas", /** Covers both longer and shorter preferred forms. @returns Nothing. */ () => {
  const legacy = parse("i-default");
  expect(legacy.language).toBe("en");
  expect(legacy.privateuse).toBe("i-default");
  expect(legacy.parsed).toBe(9);
  const redundant = parse("zh-cmn-Hans");
  expect(redundant.language).toBe("cmn");
  expect(redundant.script).toBe("Hans");
  expect(redundant.parsed).toBe(11);
  expect(parse("i-klingon").language).toBe("tlh");
  expect(parse("i-klingon").parsed).toBe(9);
  expect(parse("i-klingon!").parsed).toBe(0);
});
it("preserves case-sensitive prefix recognition of the ICU lvariant marker", /** Documents the original special private-use bridge. @returns Nothing. */ () => {
  const marked = parse("en-x-foo-lvariant-posix"),
    plain = parse("en-x-foo-LVARIANT-posix"),
    long = parse("en-x-lvariantLONG-short");
  expect(marked.privateuse).toBe("");
  expect(T.ultag_getVariant(marked.tag as T.ULanguageTag, 0)).toBe("POSIX");
  expect(plain.privateuse).toBe("foo-lvariant-posix");
  expect(T.ultag_getVariantsSize(plain.tag as T.ULanguageTag)).toBe(0);
  expect(T.ultag_getVariant(long.tag as T.ULanguageTag, 0)).toBe("SHORT");
});
it("preserves explicit length, NUL, warnings and incoming failure outputs", /** Native readable-span preconditions remain in force. @returns Nothing. */ () => {
  expect(parse("en\0-US", 6).parsed).toBe(2);
  expect(parse("en-US", 2).parsed).toBe(2);
  expect(parse("e").tag).not.toBeNull();
  expect(parse("e").language).toBe("");
  expect(parse("en-US", -1, -128).status).toBe(-128);
  const failed = parse("en-US", -1, 1);
  expect(failed.tag).toBeNull();
  expect(failed.parsed).toBe(77);
  expect(T.ultag_isLanguageSubtag("abcd", -1)).toBe(true);
  expect(T.ultag_isRegionSubtag("419", -1)).toBe(true);
  expect(T.ultag_isRegionSubtag("USA", -1)).toBe(false);
});

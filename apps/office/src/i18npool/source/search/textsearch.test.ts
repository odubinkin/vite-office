/** @fileoverview Source-contract tests for absolute search, folding, offset recovery and native directional punctuation. */
import { offsets } from "../../../test/search-result-values";
import { describe, expect, it } from "vitest";
import { TextSearch } from "./textsearch";
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { NORM_WORD_ONLY } from "../../../offapi/com/sun/star/util/SearchFlags";
import { getCharacterType } from "../characterclassification/cclass_unicode";

/** Builds a real shared UTF-16 value including embedded NUL and unpaired units. @param text - Unit sequence. @returns Native value. */
function string(text: string): OUString {
  const units = Uint16Array.from(
    text.split(""),
    /** Encodes one UTF-16 unit. @param c - Unit. @returns Unsigned value. */ (c) =>
      c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Prepares actual native options. @param key - Search pattern. @param fold - Full-folding flag. @param words - Native delimiter checks. @returns Options. */
function options(key: string, fold = false, words = false): SearchOptions2 {
  const value = new SearchOptions2();
  value.AlgorithmType2 = 1;
  value.searchString.assign(string(key));
  value.transliterateFlags = fold ? TransliterationFlags.IGNORE_CASE : 0;
  value.searchFlag = words ? NORM_WORD_ONLY : 0;
  return value;
}
/** Projects results to directional endpoint pairs. @param source - Source. @param key - Pattern. @param fold - Folding. @param words - Whole words. @returns Both raw results. */
function both(source: string, key: string, fold = false, words = false): readonly unknown[] {
  const search = new TextSearch(options(key, fold, words)),
    text = string(source);
  return [
    search.searchForward(text, 0, source.length),
    search.searchBackward(text, source.length, 0),
  ].map(
    /** Extracts initialized result fields. @param found - Native result. @returns Comparable fields. */ (
      found,
    ) => [found.subRegExpressions, offsets(found.startOffset), offsets(found.endOffset)],
  );
}

describe("native absolute TextSearch", /** Registers initialized native source examples. @returns Nothing. */ () => {
  it.each([
    [
      "abc abc",
      "abc",
      [
        [1, [0], [3]],
        [1, [7], [4]],
      ],
    ],
    [
      "a\0b",
      "\0",
      [
        [1, [1], [2]],
        [1, [2], [1]],
      ],
    ],
    [
      "😀x😀",
      "😀",
      [
        [1, [0], [2]],
        [1, [5], [3]],
      ],
    ],
    [
      "abc",
      "",
      [
        [0, [], []],
        [0, [], []],
      ],
    ],
    [
      "",
      "a",
      [
        [0, [], []],
        [0, [], []],
      ],
    ],
    [
      "ab",
      "abc",
      [
        [0, [], []],
        [0, [], []],
      ],
    ],
  ])(
    "uses directional UTF-16 offsets for %j / %j",
    /** Verifies native directional offsets. @param source - Source. @param key - Pattern. @param expected - Source-derived endpoints. @returns Nothing. */ (
      source,
      key,
      expected,
    ) => {
      expect(both(source, key)).toEqual(expected);
    },
  );
  it("matches an independent exhaustive literal-search oracle across every legal interval", /** Compares all bounded cases against built-in literal search, not the jump-table implementation. @returns Nothing. */ () => {
    for (let mask = 0; mask < 64; mask++) {
      const text = Array.from(
        { length: 6 },
        /** Builds one binary alphabet source. @param _ - Unused. @param i - Unit index. @returns Source unit. */ (
          _,
          i,
        ) => (mask & (1 << i) ? "a" : "b"),
      ).join("");
      for (const key of ["a", "b", "aa", "ab", "ba", "bb", "aba", "bab", "aaa", "bbbbbbb"]) {
        const engine = new TextSearch(options(key));
        for (let low = 0; low <= text.length; low++)
          for (let high = low; high <= text.length; high++) {
            const slice = text.slice(low, high),
              first = slice.indexOf(key),
              last = slice.lastIndexOf(key);
            const f = engine.searchForward(string(text), low, high),
              b = engine.searchBackward(string(text), high, low);
            expect(offsets(f.startOffset)).toEqual(first < 0 ? [] : [low + first]);
            expect(offsets(f.endOffset)).toEqual(first < 0 ? [] : [low + first + key.length]);
            if (low === text.length) {
              // Source NSrchBkwrd treats endPos == full length as a whole-string search.
              const nativeLast = text.lastIndexOf(key);
              expect(offsets(b.startOffset)).toEqual(
                nativeLast < 0 ? [] : [nativeLast + key.length],
              );
              expect(offsets(b.endOffset)).toEqual(nativeLast < 0 ? [] : [nativeLast]);
              continue;
            }
            expect(offsets(b.startOffset)).toEqual(last < 0 ? [] : [low + last + key.length]);
            expect(offsets(b.endOffset)).toEqual(last < 0 ? [] : [low + last]);
          }
      }
    }
  });
  it.each([
    [
      "Straße",
      "STRASSE",
      [
        [1, [0], [6]],
        [1, [6], [0]],
      ],
    ],
    [
      "xßy",
      "ss",
      [
        [1, [1], [2]],
        [1, [2], [1]],
      ],
    ],
    [
      "xßy",
      "s",
      [
        [1, [1], [2]],
        [1, [2], [1]],
      ],
    ],
    [
      "Σςσ",
      "σ",
      [
        [1, [0], [1]],
        [1, [3], [2]],
      ],
    ],
    [
      "x𐐀y",
      "𐐨",
      [
        [1, [1], [3]],
        [1, [3], [1]],
      ],
    ],
  ])(
    "folds %j / %j and recovers original offsets",
    /** Verifies expansion/scalar mapping. @param source - Source. @param key - Pattern. @param expected - Native mapped endpoints. @returns Nothing. */ (
      source,
      key,
      expected,
    ) => {
      expect(both(source, key, true)).toEqual(expected);
    },
  );
  it("uses native category delimiters, including underscore, marks and numeric letters", /** Preserves non-regex whole-word behavior. @returns Nothing. */ () => {
    expect(both("xcat cat_cat caté", "cat", false, true)).toEqual([
      [1, [5], [8]],
      [1, [12], [9]],
    ]);
    expect(both("a\u0301", "a", false, true)).toEqual([
      [1, [0], [1]],
      [1, [1], [0]],
    ]);
    expect(both("aⅣ", "a", false, true)).toEqual([
      [0, [], []],
      [0, [], []],
    ]);
    const engine = new TextSearch(options("cat", false, true));
    expect(offsets(engine.searchForward(string("cats"), 0, 3).startOffset)).toEqual([0]);
    expect(offsets(engine.searchBackward(string("cats"), 3, 0).startOffset)).toEqual([3]);
  });
  it("preserves the original punctuation asymmetry without transliteration", /** Source searchForward's no-transliteration branch only changes U+2019. @returns Nothing. */ () => {
    for (const quote of ["‘", "’", "‚", "‛", "“", "”", "„", "‟"]) {
      const key = quote.charCodeAt(0) < 0x201c ? "'" : '"';
      expect(both(quote, key)).toEqual([
        [quote === "’" ? 1 : 0, quote === "’" ? [0] : [], quote === "’" ? [1] : []],
        [1, [1], [0]],
      ]);
      expect(both(quote, key, true)).toEqual([
        [1, [0], [1]],
        [1, [1], [0]],
      ]);
    }
    expect(both("‘", "‘")).toEqual([
      [1, [0], [1]],
      [1, [1], [0]],
    ]);
  });
  it("copies options, rebuilds directional tables and rejects unported engines explicitly", /** Protects cache state and prevents regex or transliteration substitution. @returns Nothing. */ () => {
    const config = options("a"),
      engine = new TextSearch(config);
    config.searchString.assign(string("b"));
    expect(offsets(engine.searchForward(string("ab"), 0, 2).startOffset)).toEqual([0]);
    engine.setOptions2(config);
    expect(offsets(engine.searchBackward(string("ab"), 2, 0).startOffset)).toEqual([2]);
    expect(offsets(engine.searchForward(string("ab"), 0, 2).startOffset)).toEqual([1]);
    config.AlgorithmType2 = 999;
    engine.setOptions2(config);
    expect(offsets(engine.searchForward(string("ab"), 0, 2).startOffset)).toEqual([1]);
    for (const algorithm of [2, 3]) {
      config.AlgorithmType2 = algorithm;
      expect(
        /** Attempts an unported native engine. @returns Search owner. */ () =>
          new TextSearch(config),
      ).toThrow("algorithm is not implemented");
    }
    config.AlgorithmType2 = 1;
    config.transliterateFlags = TransliterationFlags.IGNORE_WIDTH;
    expect(
      /** Attempts unported transliteration. @returns Search owner. */ () => new TextSearch(config),
    ).toThrow("transliteration is not implemented");
    expect(
      /** Checks public range admission. @returns Result. */ () =>
        engine.searchForward(string("a"), -1, 1),
    ).toThrow(RangeError);
  });
  it("retains all initialized SearchOptions2 fields and defaults", /** Verifies value isolation and the original default algorithm zero. @returns Nothing. */ () => {
    const original = new SearchOptions2();
    expect([
      original.AlgorithmType2,
      original.searchFlag,
      original.transliterateFlags,
      original.WildcardEscapeCharacter,
      original.changedChars,
      original.deletedChars,
      original.insertedChars,
    ]).toEqual([0, 0, 0, 0, 0, 0, 0]);
    original.searchString.assign(string("a"));
    original.replaceString.assign(string("b"));
    original.Locale.Language.assign(string("tr"));
    original.changedChars = 1;
    original.deletedChars = 2;
    original.insertedChars = 3;
    original.WildcardEscapeCharacter = 92;
    const copy = new SearchOptions2(original);
    original.searchString.assign(string("c"));
    original.Locale.Language.assign(string("en"));
    expect(copy.searchString.equals(string("a"))).toBe(true);
    expect(copy.Locale.Language.equals(string("tr"))).toBe(true);
    expect([
      copy.changedChars,
      copy.deletedChars,
      copy.insertedChars,
      copy.WildcardEscapeCharacter,
    ]).toEqual([1, 2, 3, 92]);
    expect(new TextSearch().searchForward(string("a"), 0, 1).subRegExpressions).toBe(0);
  });
  it.each([
    ["A", 226],
    ["a", 228],
    ["ǅ", 232],
    ["中", 224],
    ["Ⅳ", 97],
    ["1", 97],
    ["²", 97],
    ["\u0301", 96],
    ["_", 32],
    [" ", 32],
    ["\u0000", 16],
    ["\u200e", 16],
    ["\u2028", 48],
    ["\u2029", 48],
    ["\ud800", 0],
    ["\ue000", 0],
    ["😀", 32],
    ["𐐀", 226],
    ["", 0],
  ])(
    "classifies %j using native KCharacterType bits",
    /** Verifies original category switch against fixed source examples. @param value - Source character. @param expected - Native mask. @returns Nothing. */ (
      value,
      expected,
    ) => {
      expect(getCharacterType(string(value), 0)).toBe(expected);
      expect(getCharacterType(string(value), -1)).toBe(0);
      expect(getCharacterType(string(value), value.length)).toBe(0);
    },
  );
});

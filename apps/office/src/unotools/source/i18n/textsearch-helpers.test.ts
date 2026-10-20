/** @fileoverview Source-derived public replacement-reference and similarity contracts; these tests do not claim compiled UNO or regex backend fidelity. */
import { searchResult } from "../../../test/search-result-values";
import { describe, expect, it } from "vitest";
import { TextSearch, WLD_THRESHOLD, SMALL_STRING_THRESHOLD } from "../../inc/textsearch";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { SearchResult } from "../../../offapi/com/sun/star/util/SearchResult";
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
/** Encodes exact UTF16 including isolated surrogates and NUL. @param text - Unit string. @returns Native owner. */
function string(text: string): OUString {
  const units = Uint16Array.from(
    text.split(""),
    /** Encodes one UTF16 unit. @param c - Unit. @returns Numeric unit. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
it("ranks a single-character suffix of a short key after both substring passes", /** Original fallback accumulates two failed length-two ranks before the suffix hit. @returns Nothing. */ () => {
  const score: [number, number] = [-1, -1];
  expect(TextSearch.SimilaritySearch(string("a"), string("ba"), score)).toBe(true);
  expect(score).toEqual([7, 1]);
});
/** Borrows the logical UTF16 view. @param owner - Live string. @returns Logical units. */
function view(owner: OUString): Uint16Array {
  return owner.getStr().subarray(0, owner.getLength());
}
/** Extracts exact units for diagnostic assertions. @param owner - Live string. @returns Unit sequence. */
function units(owner: OUString): number[] {
  return Array.from(view(owner));
}
/** Constructs a native result from original directional pairs. @param pairs - Capture pairs. @returns Result. */
function result(...pairs: [number, number][]): SearchResult {
  return searchResult(
    pairs.length,
    pairs.map(/** Selects start. @param pair - Native pair. @returns Start. */ (pair) => pair[0]),
    pairs.map(/** Selects end. @param pair - Native pair. @returns End. */ (pair) => pair[1]),
  );
}
describe("native replacement reference parser", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
  it.each([
    ["&/$0/$1/$2/$9", "bcd/bcd/c//"],
    ["$10:$01:$99", "c0:bcd1:9"],
    [String.raw`\& \$0 \\ \t \n \1`, "& $0 \\ \t \\n \\1"],
    ["$x&", "$xbcd"],
    ["$&", "$&"],
    ["$$0", "$$0"],
    ["$", "$"],
    ["\\", "\\"],
    ["&$1&$1", "bcdcbcdc"],
    ["", ""],
  ])(
    "expands %j with single-digit captures and original escapes",
    /** Checks an independently specified source case. @param pattern - Expected case input or observation. @param expected - Expected case input or observation. @returns Nothing. */ (
      pattern,
      expected,
    ) => {
      const source = string("abcdef"),
        replacement = string(pattern);
      TextSearch.ReplaceBackReferences(replacement, view(source), result([1, 4], [2, 3], [-1, -1]));
      expect(units(replacement)).toEqual(units(string(expected)));
      expect(units(source)).toEqual(units(string("abcdef")));
    },
  );
  it("leaves replacement storage untouched without expressions", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
    const replacement = string("&$0\\t"),
      before = replacement.getStr();
    TextSearch.ReplaceBackReferences(replacement, new Uint16Array(), searchResult(0, [], []));
    expect(replacement.getStr()).toBe(before);
    TextSearch.ReplaceBackReferences(replacement, new Uint16Array(), searchResult(-1, [], []));
    expect(replacement.getStr()).toBe(before);
  });
  it("normalizes reversed dollar captures while ampersand retains native unsigned-count remainder", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
    const source = string("abcdef"),
      replacement = string("&|$0|$1|$2|$3");
    TextSearch.ReplaceBackReferences(
      replacement,
      view(source),
      result([4, 1], [3, 2], [-1, 2], [3, -1]),
    );
    expect(units(replacement)).toEqual(units(string("ef|bcd|c||")));
  });
  it("preserves UTF16 slices, isolated surrogates, embedded NUL and nonrecursive output", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
    const source = string("a😀\0$1&\\t\ud800z"),
      replacement = string("<$0>$1$2");
    TextSearch.ReplaceBackReferences(replacement, view(source), result([1, 11], [1, 2], [3, 4]));
    expect(units(replacement)).toEqual(units(string("<😀\0$1&\\t\ud800z>\ud83d\0")));
  });
  it("reads all old replacement units before replacing an aliased source", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
    const replacement = string("$1:&");
    TextSearch.ReplaceBackReferences(replacement, view(replacement), result([0, 2], [3, 4]));
    expect(units(replacement)).toEqual(units(string("&:$1")));
  });
  it("truncates oversized std-view counts and preserves the old value on an out-of-range start", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
    const replacement = string("$0"),
      source = string("abc");
    TextSearch.ReplaceBackReferences(replacement, view(source), result([1, 99]));
    expect(units(replacement)).toEqual(units(string("bc")));
    replacement.assign(string("$0"));
    const before = replacement.getStr();
    expect(
      /** Invokes the original throwing view boundary. @returns Nothing. */ () =>
        TextSearch.ReplaceBackReferences(replacement, view(source), result([4, 4])),
    ).toThrow(RangeError);
    expect(replacement.getStr()).toBe(before);
    replacement.assign(string("&"));
    const invalidBefore = replacement.getStr();
    expect(
      /** Invokes the original throwing view boundary. @returns Nothing. */ () =>
        TextSearch.ReplaceBackReferences(replacement, view(source), result([4, 4])),
    ).toThrow(RangeError);
    expect(replacement.getStr()).toBe(invalidBefore);
  });
  it("expands all ten numeric references independently and keeps zero-length matches empty", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
    const source = string("0123456789"),
      replacement = string("$9$8$7$6$5$4$3$2$1$0");
    const pairs: [number, number][] = Array.from(
      { length: 10 },
      /** Creates one-unit captures. @param _ - Unused. @param i - Index. @returns Capture pair. */ (
        _,
        i,
      ) => [i, i + 1],
    );
    TextSearch.ReplaceBackReferences(replacement, view(source), result(...pairs));
    expect(units(replacement)).toEqual(units(string("9876543210")));
    replacement.assign(string("&$0"));
    TextSearch.ReplaceBackReferences(replacement, view(source), result([10, 10]));
    expect(replacement.getLength()).toBe(0);
  });
  it("consumes actual wrapper results while retaining directional ampersand asymmetry", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
    const options = new SearchOptions2();
    options.searchString.assign(string("ab"));
    const search = new TextSearch(options),
      source = string("x ab y");
    const raw: { value: SearchResult } = { value: result() };
    const start: [number] = [0],
      end: [number] = [source.getLength()];
    expect(search.SearchForward(source, start, end, raw)).toBe(true);
    const replacement = string("&:$0");
    TextSearch.ReplaceBackReferences(replacement, view(source), raw.value);
    expect(units(replacement)).toEqual(units(string("ab:ab")));
    start[0] = source.getLength();
    end[0] = 0;
    expect(search.SearchBackward(source, start, end, raw)).toBe(true);
    expect([start[0], end[0]]).toEqual([2, 4]);
    replacement.assign(string("&:$0"));
    TextSearch.ReplaceBackReferences(replacement, view(source), raw.value);
    expect(units(replacement)).toEqual(units(string(" y:ab")));
  });
});
describe("native shared similarity scoring", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
  it("retains the original public thresholds", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
    expect([WLD_THRESHOLD, SMALL_STRING_THRESHOLD]).toEqual([3, 4]);
  });
  it.each([
    ["abcd", "abcd", true, 7, 7],
    ["xxabcd", "abcd", true, 8, 7],
    ["xxabcdyy", "abcd", true, 9, 7],
    ["abyy", "abcd", true, 13, 13],
    ["yycd", "abcd", false, 14, 13],
    ["nothing", "abcd", true, -1, 16],
    ["a", "a", true, -1, 7],
    ["", "", false, -1, 7],
  ] as const)(
    "ranks substring %j versus %j (prefix=%s)",
    /** Checks an independently specified source case. @param text - Expected case input or observation. @param key - Expected case input or observation. @param fromStart - Expected case input or observation. @param expected - Expected case input or observation. @param accumulated - Expected case input or observation. @returns Nothing. */ (
      text,
      key,
      fromStart,
      expected,
      accumulated,
    ) => {
      const score: [number] = [7];
      expect(
        TextSearch.GetSubstringSimilarity(view(string(text)), view(string(key)), score, fromStart),
      ).toBe(expected);
      expect(score[0]).toBe(accumulated);
    },
  );
  it.each([
    ["", "", 0],
    ["", "abc", 3],
    ["abc", "", 3],
    ["a", "b", 2],
    ["kitten", "sitting", 5],
    ["ab", "ba", 2],
    ["😀", "", 2],
    ["😀", "😁", 2],
    ["\ud800", "\ud801", 2],
    ["a\0b", "ab", 1],
  ])(
    "computes weighted UTF16 distance %j versus %j",
    /** Checks an independently specified source case. @param text - Expected case input or observation. @param key - Expected case input or observation. @param expected - Expected case input or observation. @returns Nothing. */ (
      text,
      key,
      expected,
    ) => {
      expect(
        TextSearch.GetWeightedLevenshteinDistance(string(text as string), string(key as string)),
      ).toBe(expected);
    },
  );
  it.each([
    ["", "", true, [0, 0]],
    ["a", "", true, [2, 1]],
    ["", "a", true, [2, 1]],
    ["foo", "foo", true, [0, 0]],
    ["foobar", "foo", true, [0, 3]],
    ["xfoo", "foo", true, [1, 1]],
    ["xfooy", "foo", true, [2, 2]],
    ["xxcd", "abcd", true, [16, 4]],
    ["a", "abc", true, [12, 2]],
    ["ab", "a", true, [0, 1]],
    ["ba", "a", true, [1, 1]],
    ["aba", "b", true, [2, 2]],
    ["a", "b", true, [2, 2]],
    ["ABCDEF", "abc", false, [91, 92]],
    ["abcd", "wxyz", false, [91, 92]],
    ["zzzzzz", "x", false, [91, 92]],
    ["\ud800", "\ud801", true, [2, 2]],
  ] as const)(
    "preserves composite acceptance and pair for %j versus %j",
    /** Checks an independently specified source case. @param text - Expected case input or observation. @param key - Expected case input or observation. @param accepted - Expected case input or observation. @param expected - Expected case input or observation. @returns Nothing. */ (
      text,
      key,
      accepted,
      expected,
    ) => {
      const score: [number, number] = [91, 92];
      expect(TextSearch.SimilaritySearch(string(text), string(key), score)).toBe(accepted);
      expect(score).toEqual(expected);
    },
  );
  it("retains weighted symmetry, zero identity and unit-distance bounds for small Unicode values", /** Verifies the source-defined UTF16 contract. @returns Nothing. */ () => {
    const values = ["", "a", "ab", "ba", "A", "\0", "😀", "\ud800", "a\0b"];
    for (const left of values)
      for (const right of values) {
        const a = string(left),
          b = string(right),
          distance = TextSearch.GetWeightedLevenshteinDistance(a, b);
        expect(distance).toBe(TextSearch.GetWeightedLevenshteinDistance(b, a));
        expect(distance).toBeGreaterThanOrEqual(Math.abs(left.length - right.length));
        expect(distance).toBeLessThanOrEqual(left.length + right.length);
        if (left === right) expect(distance).toBe(0);
      }
  });
});

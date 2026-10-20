/** @fileoverview Wildcard contracts from pinned test_textsearch.cxx and original forward/backward engine branches; no regex oracle. */
import { expect, it } from "vitest";
import { TextSearch } from "./textsearch";
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { WILDCARD } from "../../../offapi/com/sun/star/util/SearchAlgorithms2";
import {
  WILD_MATCH_SELECTION,
  NORM_WORD_ONLY,
} from "../../../offapi/com/sun/star/util/SearchFlags";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
/** Creates an original UTF-16 string. @param text - Input. @returns Owned string. */
function string(text: string): OUString {
  const units = Uint16Array.from(
    text.split(""),
    /** Encodes one UTF-16 unit. @param c - Unit. @returns Value. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Native wildcard option value, including the original QA escape. @param pattern - Pattern. @param whole - Match the whole selected interval. @param fold - Ignore case. @param escape - Escape code point. @returns Owned options. */
function options(pattern: string, whole = false, fold = true, escape = 126): SearchOptions2 {
  const value = new SearchOptions2();
  value.AlgorithmType2 = WILDCARD;
  value.searchString.assign(string(pattern));
  value.WildcardEscapeCharacter = escape;
  value.searchFlag = whole ? WILD_MATCH_SELECTION : 0;
  value.transliterateFlags = fold ? TransliterationFlags.IGNORE_CASE : 0;
  return value;
}
/** Projects native one-expression offsets into a compact fixture value. @param engine - Actual engine. @param text - Input. @param backward - Direction. @param low - Low bound. @param high - High bound. @returns Native offsets or absence. */
function match(
  engine: TextSearch,
  text: string,
  backward = false,
  low = 0,
  high = text.length,
): readonly number[] | undefined {
  const value = backward
    ? engine.searchBackward(string(text), high, low)
    : engine.searchForward(string(text), low, high);
  return value.subRegExpressions === 0
    ? undefined
    : [value.startOffset[0] as number, value.endOffset[0] as number];
}
it.each([
  ["abAca", "a", [0, 1], [5, 4]],
  ["abAca", "a?", [0, 2], [4, 2]],
  ["abAca", "a*c", [0, 4], [4, 2]],
  ["abAca", "b*a", [1, 3], [5, 1]],
  ["ab?ca", "?~??", [1, 4], [4, 1]],
  ["ab*ca", "?~*?", [1, 4], [4, 1]],
  ["ab*ca", "ca?", undefined, undefined],
  ["ab*ca", "ca*", [3, 5], [5, 3]],
  ["ab*ca", "*ca*", [0, 5], [5, 0]],
  ["123123", "*2?", [0, 3], [6, 0]],
] as const)(
  "retains upstream testWildcardSearch %j/%j",
  /** Original QA expectations are literal, including asymmetric non-greedy matches. @param text - QA text. @param pattern - QA key. @param forward - Expected forward result. @param backward - Expected reversed result. @returns Nothing. */ (
    text,
    pattern,
    forward,
    backward,
  ) => {
    const engine = new TextSearch(options(pattern));
    expect(match(engine, text)).toEqual(forward);
    expect(match(engine, text, true)).toEqual(backward);
  },
);
it.each([false, true])(
  "retains tdf172646 supplementary end offsets whole=%s",
  /** Source QA checks the offset behind the complete pair with folding. @param whole - Native whole-cell mode. @returns Nothing. */ (
    whole,
  ) => {
    const engine = new TextSearch(options("*🌴", whole));
    const text = whole ? "abc🌴" : "a🌴";
    expect(match(engine, text)).toEqual([0, text.length]);
    expect(match(engine, text, true)).toEqual([text.length, 0]);
  },
);
it.each([false, true])(
  "uses whole-selection greedy backtracking backward=%s",
  /** Whole-selection mode changes '*' expansion without imposing normal word boundaries. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const engine = new TextSearch(options("*2?", true));
    expect(match(engine, "123123", backward)).toEqual(backward ? [6, 0] : [0, 6]);
    const exact = new TextSearch(options("a", true));
    expect(match(exact, "ba", backward)).toBeUndefined();
    expect(match(exact, "ba", backward, 1, 2)).toEqual(backward ? [2, 1] : [1, 2]);
  },
);
it.each([false, true])(
  "counts code points for question marks backward=%s",
  /** Covers supplementary literals, wildcard positions, malformed isolated surrogates and bounded source coordinates. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    for (const [text, pattern, low, high] of [
      ["x🌴y", "?", 1, 3],
      ["🌴a", "?a", 0, 3],
      ["a🌴", "a?", 0, 3],
      ["x\ud800y", "?", 1, 2],
      ["🌴🌴", "??", 0, 4],
    ] as const) {
      const engine = new TextSearch(options(pattern, true, false));
      expect(match(engine, text, backward, low, high)).toEqual(
        backward ? [high, low] : [low, high],
      );
    }
  },
);
it.each([false, true])(
  "supports supplementary escape code points backward=%s",
  /** Reordering must retain the escape's pair and the escaped character's pair as separate units. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    for (const [pattern, text, escape] of [
      ["🌴?", "x?y", 0x1f334],
      ["🌴🌴", "x🌴y", 0x1f334],
      ["~🌴", "x🌴y", 126],
      ["~~", "x~y", 126],
    ] as const) {
      const engine = new TextSearch(options(pattern, false, false, escape));
      const high = text.length - 1;
      expect(match(engine, text, backward)).toEqual(backward ? [high, 1] : [1, high]);
    }
  },
);
it.each([false, true])(
  "preserves wildcard empty-interval source guards folded=%s",
  /** Start/end at the outer string boundary differs by direction; these are native tests, not normalized regex rules. @param fold - Case folding. @returns Nothing. */ (
    fold,
  ) => {
    for (const pattern of ["", "*", "***"]) {
      const engine = new TextSearch(options(pattern, false, fold));
      expect(match(engine, "", false)).toEqual([0, 0]);
      expect(match(engine, "", true)).toEqual([0, 0]);
      expect(match(engine, "ab", false, 1, 1)).toEqual([fold ? 0 : 1, fold ? 0 : 1]);
      expect(match(engine, "ab", true, 1, 1)).toEqual([fold ? 0 : 1, fold ? 0 : 1]);
      expect(match(engine, "ab", false, 2, 2)).toEqual(fold ? [0, 0] : undefined);
      expect(match(engine, "ab", true, 2, 2)).toEqual(fold ? [0, 0] : undefined);
    }
    expect(match(new TextSearch(options("", false, fold)), "ab")).toBeUndefined();
    expect(match(new TextSearch(options("?", false, fold)), "", true)).toBeUndefined();
  },
);
it("rebuilds backward escaped-pattern state when options change", /** Same engine alternates direction and invalidates both key and cached reverse pattern. @returns Nothing. */ () => {
  const engine = new TextSearch(options("?~*?"));
  expect(match(engine, "ab*ca", true)).toEqual([4, 1]);
  const config = options("?~??");
  engine.setOptions2(config);
  config.searchString.assign(string("missing"));
  expect(match(engine, "ab?ca", true)).toEqual([4, 1]);
  expect(match(engine, "ab?ca")).toEqual([1, 4]);
  engine.setOptions2(options("*2?", true));
  expect(match(engine, "123123", true)).toEqual([6, 0]);
});
it("retains native trailing-escape elimination only in backward preparation", /** This suspicious asymmetry is documented, not repaired by adding a literal escape. @returns Nothing. */ () => {
  const engine = new TextSearch(options("a~", false, false));
  expect(match(engine, "a~")).toEqual([0, 2]);
  expect(match(engine, "a~", true)).toEqual([1, 0]);
  const whole = new TextSearch(options("a~", true, false));
  expect(match(whole, "a")).toBeUndefined();
  expect(match(whole, "a", true)).toEqual([1, 0]);
});
it("retains disabled-escape NUL reordering in the native backward cache", /** Reverse preparation checks equality with zero even when the matching loop disables escaping. @returns Nothing. */ () => {
  const engine = new TextSearch(options("a\0b", false, false, 0));
  expect(match(engine, "a\0b")).toEqual([0, 3]);
  expect(match(engine, "a\0b", true)).toBeUndefined();
  expect(match(engine, "ab\0", true)).toEqual([3, 0]);
});
it("keeps word-only flag outside the native wildcard matcher", /** Whole-word testing belongs to the absolute algorithm; wildcard does not call IsDelimiter. @returns Nothing. */ () => {
  const config = options("a", false, false);
  config.searchFlag |= NORM_WORD_ONLY;
  const engine = new TextSearch(config);
  expect(match(engine, "cat")).toEqual([1, 2]);
  expect(match(engine, "cat", true)).toEqual([2, 1]);
});
/** Independent whole-interval wildcard language recognizer; dynamic programming has no native rewind/jump state and uses no regex. @param pattern - ASCII wildcard key. @param text - Selected ASCII text. @returns Whether the entire interval belongs to the pattern language. */
function recognizes(pattern: string, text: string): boolean {
  let reachable = Array<boolean>(text.length + 1).fill(false);
  reachable[0] = true;
  for (const c of pattern) {
    const next = Array<boolean>(text.length + 1).fill(false);
    for (let i = 0; i <= text.length; ++i) {
      if (c === "*") next[i] = reachable[i] === true || (i > 0 && next[i - 1] === true);
      else if (i > 0) next[i] = reachable[i - 1] === true && (c === "?" || c === text[i - 1]);
    }
    reachable = next;
  }
  return reachable[text.length] === true;
}
/** Enumerates bounded ASCII strings for an independent model check. @param alphabet - Source symbols. @param length - Maximum length. @returns Complete set. */
function words(alphabet: string, length: number): string[] {
  const all = [""];
  let last = [""];
  for (let size = 0; size < length; ++size) {
    const next: string[] = [];
    for (const prefix of last) for (const c of alphabet) next.push(prefix + c);
    all.push(...next);
    last = next;
  }
  return all;
}
it("checks all small whole-selection intervals against an independent language recognizer", /** Records source-defined false negatives separately; the recognizer never adopts the native rewind algorithm. @returns Nothing. */ () => {
  let intervals = 0;
  const differences: string[] = [];
  for (const pattern of words("ab?*", 3)) {
    const engine = new TextSearch(options(pattern, true, false));
    for (const text of words("ab", 3))
      for (let low = 0; low < text.length; ++low)
        for (let high = low + 1; high <= text.length; ++high) {
          const expected = recognizes(pattern, text.slice(low, high));
          for (const backward of [false, true]) {
            const result = match(engine, text, backward, low, high);
            if (expected && result === undefined)
              differences.push(JSON.stringify([backward, pattern, text, low, high]));
            else
              expect(result, JSON.stringify({ pattern, text, low, high, backward })).toEqual(
                expected ? (backward ? [high, low] : [low, high]) : undefined,
              );
          }
          ++intervals;
        }
  }
  // WRITER-015: native whole-selection retry resumes the pattern at the current
  // string position instead of rewinding a partially consumed suffix/prefix.
  const sourceCases: readonly [boolean, string, readonly string[]][] = [
    [false, "*aa", ["aaa"]],
    [false, "*bb", ["bbb"]],
    [false, "*a?", ["aaa"]],
    [false, "*b?", ["bbb"]],
    [false, "*?a", ["aaa", "baa"]],
    [false, "*?b", ["abb", "bbb"]],
    [false, "*??", ["aaa", "aab", "aba", "abb", "baa", "bab", "bba", "bbb"]],
    [true, "aa*", ["aaa"]],
    [true, "bb*", ["bbb"]],
    [true, "?a*", ["aaa"]],
    [true, "?b*", ["bbb"]],
    [true, "a?*", ["aaa", "aab"]],
    [true, "b?*", ["bba", "bbb"]],
    [true, "??*", ["aaa", "aab", "aba", "abb", "baa", "bab", "bba", "bbb"]],
  ];
  const expectedDifferences: string[] = [];
  for (const [backward, pattern, texts] of sourceCases)
    for (const text of texts)
      expectedDifferences.push(JSON.stringify([backward, pattern, text, 0, 3]));
  expect(differences.sort()).toEqual(expectedDifferences.sort());
  expect(intervals).toBe(5270);
});
it("retains the native debug iterator precondition after eliminating an escape-only reverse pattern", /** An unpaired trailing escape removes the complete backward pattern; native substring setup still attempts a negative iteration from zero. @returns Nothing. */ () => {
  const engine = new TextSearch(options("~", false, false));
  expect(match(engine, "~")).toEqual([0, 1]);
  expect(
    /** Exercises the same invalid native iterator request, not an invented match. @returns Native offsets. */ () =>
      match(engine, "~", true),
  ).toThrow("assert(n > 0)");
});

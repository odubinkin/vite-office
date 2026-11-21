/** @fileoverview Tests the platform regex on original UTF-16 ranges in each search direction. */
import { expect, it } from "vitest";
import { createBrowserRegexMatcher } from "./regex-matcher";

/** Encodes UTF-16 including surrogate pairs. @param value - Input string. @returns Code units. */
function units(value: string): Uint16Array {
  const result = new Uint16Array(value.length);
  for (let index = 0; index < value.length; index++) result[index] = value.charCodeAt(index);
  return result;
}

it("keeps lookaround context outside a bounded greedy match", /** Verifies full text context, range clipping and UTF-16 offsets. @returns Nothing. */ () => {
  const matcher = createBrowserRegexMatcher(units("(?<=x)(😀+)(y)?"), false);
  const text = units("x😀😀😀!");
  expect(matcher?.search(text, 1, 5, false)).toEqual(Int32Array.of(1, 5, 1, 5, -1, -1));
  expect(matcher?.search(text, 5, 1, true)).toEqual(Int32Array.of(5, 1, 5, 1, -1, -1));
});

it("uses the last nonempty backward match and skips empty interior matches", /** Checks advancement and capture direction with the real platform engine. @returns Nothing. */ () => {
  const matcher = createBrowserRegexMatcher(units("(a*)"), true);
  const text = units("xAxa!");
  expect(matcher?.search(text, 0, text.length, false)).toEqual(Int32Array.of(1, 2, 1, 2));
  expect(matcher?.search(text, text.length, 0, true)).toEqual(Int32Array.of(4, 3, 4, 3));
  expect(createBrowserRegexMatcher(units("["), false)).toBeUndefined();
});

/** @fileoverview Native font-token boundaries and borrowed UTF16 views, independent of locale/font discovery. */
import { expect, it } from "vitest";
import { GetNextFontToken } from "../../inc/fontdefs";

it.each([
  ["", 0, "", -1],
  ["abc", -1, "", -1],
  ["abc", -2, "", -1],
  ["abc", 3, "", -1],
  ["abc", 2147483647, "", -1],
  ["abc", 0, "abc", -1],
  ["abc", 1, "bc", -1],
  ["a;b", 0, "a", 2],
  ["a,b", 2, "b", -1],
  ["a;", 0, "a", 2],
  ["a;", 2, "", -1],
  [";;b", 0, "", 1],
  [";;b", 1, "", 2],
  [" a , b ", 0, " a ", 4],
  ["a\0🙂,b", 0, "a\0🙂", 5],
] as const)(
  "parses %j from %i without trimming",
  /** Verifies content, cursor and same backing store. @param input - List. @param start - Cursor. @param want - Token. @param next - Updated cursor. @returns Nothing. */ (
    input,
    start,
    want,
    next,
  ) => {
    const units = new Uint16Array(input.length);
    for (let i = 0; i < input.length; i++) units[i] = input.charCodeAt(i);
    const cursor = { value: start as number },
      token = GetNextFontToken(units, cursor);
    expect(String.fromCharCode(...token)).toBe(want);
    expect(cursor.value).toBe(next);
    expect(token.buffer).toBe(units.buffer);
    if (input === "abc" && start === 0) expect(token).toBe(units);
  },
);

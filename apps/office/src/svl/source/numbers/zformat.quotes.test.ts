/** @fileoverview Original quote helper boundary observations, including upstream opening-quote asymmetry. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumberformat } from "./zformat";

it("keeps inclusive quote state, escaped quotes, length sentinels and native nonzero opening results", /** Native unchanged IsInQuote/GetQuoteEnd bodies provide these boundary observations. @returns Nothing. */ () => {
  for (const [value, position, inside, end] of [
    ['"abc"', 0, true, 4],
    ['a"abc"', 1, true, 1],
    ['a"abc"', 2, true, 5],
    ['a"abc"', 5, false, 5],
    ['a"abc', 2, true, 5],
    ['a\\"abc"', 2, false, 2],
    ["abc", 1, false, -1],
    ['"abc"', 5, false, -1],
    ["", 0, false, -1],
  ] as const) {
    const source = unicode(value);
    try {
      expect(SvNumberformat.IsInQuote(source, position), value + position).toBe(inside);
      expect(SvNumberformat.GetQuoteEnd(source, position), value + position).toBe(end);
      expect(SvNumberformat.GetQuoteEnd(source, -1)).toBe(-1);
    } finally {
      source.dispose();
    }
  }
  const source = unicode('"a\\"b"');
  try {
    expect(SvNumberformat.IsInQuote(source, 3)).toBe(false);
    expect(SvNumberformat.IsInQuote(source, 3, 34, 92, 92)).toBe(true);
    expect(SvNumberformat.GetQuoteEnd(source, 1, 34, 92)).toBe(5);
  } finally {
    source.dispose();
  }
});

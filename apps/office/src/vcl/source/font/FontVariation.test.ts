/** @fileoverview Source-backed native axis parsing,IEEE float values and OpenType tag contracts needed by EditEngine defaults. */
import { expect, it } from "vitest";
import { Variation, VariationsFromString } from "../../inc/font/Variation";
import { featureCode } from "../../inc/font/Feature";
/** Creates a borrowed native UTF16 input without codepoint normalization. @param text - Original text. @returns Units. */
function units(text: string): Uint16Array {
  const data = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) data[i] = text.charCodeAt(i);
  return data;
}
it("retains native aggregate defaults,copy and public field narrowing without font-side normalization", /** Checks actual uint32/binary32 and IEEE equality semantics. @returns Nothing. */ () => {
  const empty = new Variation();
  expect([empty.nTag, empty.fValue]).toEqual([0, 0]);
  const tagOnly = new Variation(5);
  expect(tagOnly.fValue).toBe(0);
  const value = new Variation(0x177676874, 0.1);
  expect(value.nTag).toBe(0x77676874);
  expect(value.fValue).toBe(0.10000000149011612);
  const copy = new Variation(value);
  expect(copy).not.toBe(value);
  expect(copy.equals(value)).toBe(true);
  copy.nTag = -1;
  expect(copy.nTag).toBe(0xffffffff);
  expect(copy.equals(value)).toBe(false);
  copy.nTag = value.nTag;
  copy.fValue = 3;
  expect(copy.equals(value)).toBe(false);
  expect(value.fValue).toBe(0.10000000149011612);
  expect(new Variation(0, -0).equals(empty)).toBe(true);
  expect(Object.is(new Variation(0, -0).fValue, -0)).toBe(true);
  const nan = new Variation(0, NaN);
  expect(nan.equals(nan)).toBe(false);
  expect(new Variation(1, Infinity).equals(new Variation(1, Infinity))).toBe(true);
});
it("packs native signed-char tags in the original four-byte order", /** Exercises inline Feature.hxx packing independent of parser labels. @returns Nothing. */ () => {
  expect(featureCode(Int8Array.of(119, 103, 104, 116))).toBe(0x77676874);
  expect(featureCode(Int8Array.of(65, 49, 32, 90))).toBe(0x4131205a);
  expect(featureCode(Int8Array.of(0, 0, 0, 0))).toBe(0);
  expect(featureCode(Int8Array.of(0, -128, 0, 1))).toBe(0xff800001);
});
it("uses exact native quotation,minimum-length,ASCII tag and whitespace acceptance", /** Retains original malformed token recovery and native whitespace differences from JavaScript trim. @returns Nothing. */ () => {
  for (const text of [
    "",
    ",, \t,\u200b",
    '"wght"',
    '"wght" \t',
    "wght 7",
    "`wght` 7",
    "'wght\" 7",
    '"w-gh" 7',
    '"éght" 7',
    '"😀ab" 7',
    '\u00a0"wght" 7',
    '\ufeff"wght" 7',
  ])
    expect(VariationsFromString(units(text))).toEqual([]);
  const parsed = VariationsFromString(units('bad, "wght"7, \'A1 Z\' 5, "    " 9, "wght" 8,'));
  expect(
    parsed.map(
      /** Reads source scalar fields. @param item - Native value. @returns Pair. */ (item) => [
        item.nTag,
        item.fValue,
      ],
    ),
  ).toEqual([
    [0x77676874, 7],
    [0x4131205a, 5],
    [0x20202020, 9],
    [0x77676874, 8],
  ]);
  expect(VariationsFromString(units('\u200b"wght"\u200b0.1\u2029'))[0]?.fValue).toBe(
    0.10000000149011612,
  );
});
it("delegates numeric prefixes and special values to the native RTL lexer then narrows to binary32", /** Guards against parseFloat,axis clamping and guessed numeric validation. @returns Nothing. */ () => {
  for (const [text, value] of [
    ["nonsense", 0],
    ["123tail", 123],
    ["+3", 3],
    ["-0", -0],
    ["1e39", Infinity],
    ["-1e-100", -0],
    ["1e-45", 1.401298464324817e-45],
    ["16777217", 16777216],
    ["INF", Infinity],
    ["-INF", -Infinity],
    ["NaN", NaN],
    ["4\0tail", 4],
  ] as const) {
    const result = VariationsFromString(units(`"wght" ${text}`));
    expect(result).toHaveLength(1);
    expect(Object.is(result[0]?.fValue, value)).toBe(true);
  }
  expect(VariationsFromString(units('"wght" 1,234'))[0]?.fValue).toBe(1);
});
it("parses a borrowed subview without mutating input or inventing axis bounds", /** Retains original view boundaries,duplicates,case and order. @returns Nothing. */ () => {
  const source = units('xx"wdth" -500, "wght" 900, "wdth" 2000yy'),
    before = source.slice();
  const result = VariationsFromString(source.subarray(2, source.length - 2));
  expect(
    result.map(
      /** Reads independently expected source values. @param value - Axis. @returns Pair. */ (
        value,
      ) => [value.nTag, value.fValue],
    ),
  ).toEqual([
    [0x77647468, -500],
    [0x77676874, 900],
    [0x77647468, 2000],
  ]);
  expect(source).toEqual(before);
});

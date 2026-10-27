/** @fileoverview Exercises native locale helper admission, POSIX variants, region bitmaps and bounded Unicode numeric parsing. */
import { expect, it } from "vitest";
import { _getVariant, ulocimp_getSubtags } from "./uloc.subtags";
import { RegionValidateMap } from "./loclikely";
import { Locale } from "./locid";
import { u_digit, u_charDigitValue } from "./uchar";
import { ICU_Utility } from "./util_props";
import { UnicodeString } from "./unistr";

it.each([
  ["foo-bar,baz", "@", true, 11, "seed_FOO_BAR_BAZ", 0],
  ["encoding@foo-bar,baz", ".", true, 20, "seed_FOO_BAR_BAZ", 0],
  ["encoding", ".", false, 0, "seed", 0],
  ["foo-bar", "_", true, 7, "seed_FOO_BAR", 0],
  ["", "_", false, 0, "seed", 0],
  ["a".repeat(180), "@", false, 0, "seed" + "A".repeat(179), 1],
] as const)(
  "preserves original variant helper %s / %s",
  /** POSIX and separator overloads retain independent consumption/error checkpoints. @param text - Source view. @param previous - Preceding delimiter. @param separator - Existing variant state. @param consumed - Original units consumed. @param expected - Native append result. @param error - Source status. @returns Nothing. */ (
    text,
    previous,
    separator,
    consumed,
    expected,
    error,
  ) => {
    let output = "seed";
    const status: [number] = [0];
    expect(
      _getVariant(
        text,
        previous,
        {
          /** Receives native narrow append output. @param bytes - Original span. @returns Nothing. */ Append(
            bytes: string,
          ) {
            output += bytes;
          },
        },
        separator,
        status,
      ),
    ).toBe(consumed);
    expect(output).toBe(expected);
    expect(status[0]).toBe(error);
  },
);
it("keeps null variant outputs and sticky errors separate from consumed spans", /** Optional sinks do not prevent source scanning. @returns Nothing. */ () => {
  const status: [number] = [0];
  expect(_getVariant("foo", "@", null, true, status)).toBe(3);
  status[0] = 1;
  expect(_getVariant("foo", "_", null, false, status)).toBe(0);
  expect(status[0]).toBe(1);
  const end: [number] = [77];
  status[0] = 0;
  ulocimp_getSubtags("en-u-va-posix", null, null, null, null, end, status);
  expect(end[0]).toBe(13);
  expect(status[0]).toBe(0);
});
it("retains immutable region bitmap equality and rejects malformed region syntax", /** Uses native source region validation rather than a host locale provider. @returns Nothing. */ () => {
  const regions = new RegionValidateMap();
  expect(regions.equals(new RegionValidateMap())).toBe(true);
  expect(regions.isSet("US\0ignored")).toBe(true);
  expect(regions.isSet("gb")).toBe(true);
  for (const code of ["", "U", "USA", "4A", "419", "ZZ"]) expect(regions.isSet(code)).toBe(false);
  const prior = Locale.getDefault(),
    status: [number] = [1];
  Locale.setDefault(new Locale("en_US"), status);
  expect(status[0]).toBe(1);
  expect(Locale.getDefault()).toBe(prior);
});
it.each([
  ["A", 16, 10],
  ["a", 36, 10],
  ["Ａ", 16, 10],
  ["ａ", 16, 10],
  ["z", 35, -1],
  ["z", 36, 35],
  ["1", 1, -1],
  ["1", -1, -1],
] as const)(
  "preserves radix digit %s in base %i",
  /** Checks native ASCII/fullwidth/radix admission. @param text - Scalar input. @param radix - Signed8 radix. @param expected - Native digit result. @returns Nothing. */ (
    text,
    radix,
    expected,
  ) => {
    expect(u_digit(text.codePointAt(0) as number, radix)).toBe(expected);
  },
);
it("keeps integer parse position unchanged on overflow and rejects nondecimal numeric types", /** Actual UTF16 values exercise signed32 numeric limits. @returns Nothing. */ () => {
  const pos: [number] = [0];
  expect(ICU_Utility.parseNumber(new UnicodeString("2147483648"), pos, 10)).toBe(-1);
  expect(pos[0]).toBe(0);
  expect(ICU_Utility.parseNumber(new UnicodeString("7FFFFFFF"), pos, 16)).toBe(2147483647);
  expect(pos[0]).toBe(8);
  expect(u_charDigitValue(0xbd)).toBe(-1);
});

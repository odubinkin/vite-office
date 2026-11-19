/** @fileoverview Public comphelper strip contracts retain actual SAL ownership and UTF16 unit boundaries. */
import { expect, it } from "vitest";
import { strip, split } from "./string";
import { OUString } from "../../../sal/inc/rtl/ustring";

it.each([
  [[], 32, []],
  [[32, 32], 32, []],
  [[32, 65, 32], 32, [65]],
  [[0, 65, 0], 0, [65]],
  [[65, 0, 66], 32, [65, 0, 66]],
  [[0xd800, 65, 0xdc00], 0xd800, [65, 0xdc00]],
] as const)(
  "strips only the requested UTF16 unit from %j",
  /** Empty values preserve their underlying SAL owner; counted units do not truncate at NUL. @param input - Counted input units. @param character - Removed unit. @param expected - Independent expected remaining units. @returns Nothing. */ (
    input,
    character,
    expected,
  ) => {
    const original = new OUString(Uint16Array.from(input), input.length),
      result = strip(original, character);
    try {
      expect([...result.getStr().subarray(0, result.getLength())]).toEqual([...expected]);
      expect([...original.getStr().subarray(0, original.getLength())]).toEqual([...input]);
      if (!input.length) expect(result.pData).toBe(original.pData);
    } finally {
      original.dispose();
    }
    try {
      expect([...result.getStr().subarray(0, result.getLength())]).toEqual([...expected]);
    } finally {
      result.dispose();
    }
  },
);

it.each([
  [[], []],
  [[44, 32, 44], []],
  [
    [32, 65, 32, 44, 9, 66, 10, 44],
    [[65], [66]],
  ],
  [
    [65, 0, 66, 44, 0xd800],
    [[65, 0, 66], [0xd800]],
  ],
] as const)(
  "splits counted UTF16 tokens %j using the original trim and empty-token rule",
  /** Checks actual native split owners. @param input - Counted fixture units. @param expected - Expected owned token units. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const value = new OUString(Uint16Array.from(input), input.length),
      tokens = split(value.getStr().subarray(0, value.getLength()), 44);
    value.dispose();
    try {
      expect(
        tokens.map(
          /** Reads owned token units. @param token - Actual native token. @returns Counted units. */ (
            token,
          ) => [...token.getStr().subarray(0, token.getLength())],
        ),
      ).toEqual(
        expected.map(
          /** Copies expected token units. @param token - Fixture units. @returns Units. */ (
            token,
          ) => [...token],
        ),
      );
    } finally {
      for (const token of tokens) token.dispose();
    }
  },
);

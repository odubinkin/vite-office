/** @fileoverview Public comphelper strip contracts retain actual SAL ownership and UTF16 unit boundaries. */
import { expect, it } from "vitest";
import { strip } from "./string";
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

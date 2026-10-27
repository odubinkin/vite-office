/** @fileoverview Validates ICU null hashing and C termination warning transitions without fabricating writable native pointers. */
import { expect, it } from "vitest";
import { ustr_hashCharsN, u_terminateChars } from "./ustring";
import { UErrorCode as E } from "./unicode/utypes";

it("keeps null and empty hashes independent of the supplied span count", /** Both readable-empty domains retain the native initial hash value. @returns Nothing. */ () => {
  expect(ustr_hashCharsN(null, 99)).toBe(0);
  expect(ustr_hashCharsN("", 0)).toBe(0);
  expect(ustr_hashCharsN("ABC", 3)).toBe((65 * 37 + 66) * 37 + 67);
});
it("clears an old nontermination warning only after writing a terminator", /** Exercises source warning recovery and untouched caller storage on negative lengths and missing status. @returns Nothing. */ () => {
  const buffer = Uint8Array.of(65, 66, 77, 77),
    status: [number] = [E.U_STRING_NOT_TERMINATED_WARNING];
  expect(u_terminateChars(buffer, 4, 2, status)).toBe(2);
  expect([...buffer]).toEqual([65, 66, 0, 77]);
  expect(status[0]).toBe(0);
  expect(u_terminateChars(buffer, 4, -1, status)).toBe(-1);
  expect([...buffer]).toEqual([65, 66, 0, 77]);
  expect(u_terminateChars(buffer, 4, 1, null)).toBe(1);
  expect([...buffer]).toEqual([65, 66, 0, 77]);
});

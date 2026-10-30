/** @fileoverview Consumed C snprintf integral %.f formatting preserves exact digits, buffer tail and source checked truncation. */
import { expect, it } from "vitest";
import { sprintfIntegral } from "./sprintf";
it.each([
  [0, "0"],
  [-0, "-0"],
  [123, "123"],
  [1e23, "99999999999999991611392"],
])(
  "formats exact integral binary64 %s as %s",
  /** The input is an actual integral double, not its shortest decimal representation. @param value - Double. @param expected - Exact C-style digits. @returns Nothing. */ (
    value,
    expected,
  ) => {
    const buffer = new Uint8Array(100).fill(0xa5),
      count = sprintfIntegral(buffer, value);
    expect(count).toBe(expected.length);
    expect(String.fromCharCode(...buffer.subarray(0, count))).toBe(expected);
    expect(buffer[count]).toBe(0);
    expect(buffer[count + 1]).toBe(0xa5);
  },
);
it("writes the original truncated buffer before its checked-build assertion", /** Source o3tl wrapper asserts only after snprintf has written its prefix and terminator. @returns Nothing. */ () => {
  const buffer = new Uint8Array(3).fill(0xa5);
  expect(
    /** Executes the consumed native buffer contract. @returns Required length if assertions allow it. */ () =>
      sprintfIntegral(buffer, 123),
  ).toThrow(/assert/);
  expect([...buffer]).toEqual([49, 50, 0]);
});

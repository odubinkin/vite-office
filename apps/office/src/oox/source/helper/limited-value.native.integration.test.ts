/** @fileoverview Original OOX limited-value helper boundaries are independent compiled C++ observations, including the binary-copy last-block range. */
import { expect, it } from "vitest";
import observations from "./limited-value.native-observations.json";
import { getLimitedValue } from "../../inc/helper/helper";
it("matches original clamp/narrowing for every signed64 boundary and ordered bound pair", /** This tests the real upstream utility directly; the SAL_MAX_INT64 stream loop remains unchanged and is not falsely claimed to have run to exhaustion. @returns Nothing. */ () => {
  expect(observations.cases).toHaveLength(102);
  for (const [value, min, max, expected] of observations.cases)
    expect(
      getLimitedValue(BigInt(value as string), BigInt(min as string), BigInt(max as string)),
      `${value},${min},${max}`,
    ).toBe(expected);
});

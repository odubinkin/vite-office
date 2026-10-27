/** @fileoverview Replays original ICU78.3 full-fold results for scalar, string, conditional-I, Cherokee and supplementary cases. */
import { expect, it } from "vitest";
import observations from "./fullfold.native-observations.json";
import { ucase_toFullFolding, type FullFoldingPointer } from "./ucase";
it.each(observations.cases)(
  "matches native full-fold tuple %j",
  /** Checks exact native tagged result and borrowed UTF16 contents. @param code - Input scalar. @param options - Source mask. @param result - Original tagged output. @param hasPointer - Native pointer presence. @param expected - Original mapping units. @returns Nothing. */ (
    code,
    options,
    result,
    hasPointer,
    ...expected
  ) => {
    const pointer: [FullFoldingPointer | null] = [null];
    expect(ucase_toFullFolding(code, pointer, options)).toBe(result);
    expect(Number(pointer[0] !== null)).toBe(hasPointer);
    if (pointer[0] !== null) {
      const value = pointer[0],
        units: number[] = [];
      for (let i = 0; i < result; i++) units.push(value.data[value.index + i] as number);
      expect(units).toEqual(expected);
    }
  },
);

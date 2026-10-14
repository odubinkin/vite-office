/** @fileoverview Checks original scalar hash families through unsigned mathematical references. */
import { expect, it } from "vitest";
import { hash_combine } from "./hash_combine";
it("matches unsigned modular arithmetic for both seed widths", /** Checks empty, maximum and mixed integer folds. @returns Nothing. */ () => {
  for (const width of [32, 64]) {
    let reference = 0n;
    const s32: [number] = [0];
    const s64: [bigint] = [0n];
    for (const value of [0, 1, 0xffffffff, 0x80000000, -1, -2147483648, 2147483647, 17, 999, 0]) {
      const mask = (1n << BigInt(width)) - 1n;
      const sum =
        BigInt.asUintN(width, BigInt(value)) +
        (width === 32 ? 0x9e3779b9n : 0x9e3779b97f4a7c15n) +
        ((reference << BigInt(width === 32 ? 6 : 12)) & mask) +
        (reference >> BigInt(width === 32 ? 2 : 4));
      reference = (reference ^ sum) & mask;
      if (width === 32) {
        hash_combine(s32, value);
        expect(BigInt(s32[0])).toBe(reference);
      } else {
        hash_combine(s64, value);
        expect(s64[0]).toBe(reference);
      }
    }
  }
});

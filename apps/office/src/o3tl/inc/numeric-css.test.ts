/** @fileoverview Verifies the exact consumed native character/result-width families required by Writer CSS. */
import { expect, it } from "vitest";
import { convertToHex } from "./numeric";
it("retains the native ASCII alphabet over every UTF16 code unit for default and CSS error values", /** Verifies retains the native ASCII alphabet over every UTF16 code unit for default and CSS error values. @returns Nothing. */ () => {
  const values = new Map<number, number>();
  for (let index = 0; index < 16; index++) {
    values.set("0123456789abcdef".charCodeAt(index), index);
    values.set("0123456789ABCDEF".charCodeAt(index), index);
  }
  for (let unit = 0; unit < 65536; unit++) {
    expect(convertToHex(unit)).toBe(values.get(unit) ?? -1);
    expect(convertToHex(unit, undefined, 16, 16)).toBe(values.get(unit) ?? 16);
  }
});
it("preserves bitwise native pair error propagation followed by unsigned16 narrowing", /** Verifies preserves bitwise native pair error propagation followed by unsigned16 narrowing. @returns Nothing. */ () => {
  expect(convertToHex(65, 102)).toBe(175);
  expect(convertToHex(63, 48)).toBe(-16);
  expect(convertToHex(48, 63)).toBe(-1);
  expect(convertToHex(63, 48, 16, 16)).toBe(256);
  expect(convertToHex(63, 63, 16, 16)).toBe(272);
  expect(convertToHex(63, 63, 65535, 16)).toBe(65535);
});

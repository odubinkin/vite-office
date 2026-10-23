/** @fileoverview Source OutputDevice::HasGlyphs UTF16 range and missing-map semantics used by font previews. */
import { expect, it } from "vitest";
import { FontCharMap } from "../font/fontcharmap";
import { hasGlyphsInFontCharMap } from "./font";

it("reports original UTF16 failure offsets and range bounds", /** Verifies real range membership, without simulated HasGlyphs answers. @returns Nothing. */ () => {
  const map = new FontCharMap([65, 68]);
  expect(hasGlyphsInFontCharMap(map, "ABC")).toBe(-1);
  expect(hasGlyphsInFontCharMap(map, "ABXD")).toBe(2);
  expect(hasGlyphsInFontCharMap(map, "XABCX", 1, 3)).toBe(-1);
  expect(hasGlyphsInFontCharMap(map, "XABCX", 1)).toBe(4);
  expect(hasGlyphsInFontCharMap(map, "ABC", 1, 100)).toBe(-1);
  expect(hasGlyphsInFontCharMap(map, "AX", 1, 0)).toBe(-1);
  expect(hasGlyphsInFontCharMap(undefined, "ABC", 1)).toBe(1);
  expect(hasGlyphsInFontCharMap(new FontCharMap(), "ABC")).toBe(0);
  expect(hasGlyphsInFontCharMap(FontCharMap.GetDefaultMap(true), "ABC")).toBe(0);
  expect(hasGlyphsInFontCharMap(map, "", 0)).toBe(0);
  expect(hasGlyphsInFontCharMap(map, "ABC", 3)).toBe(3);
  expect(hasGlyphsInFontCharMap(map, "ABC", 100)).toBe(100);
});

it("preserves the native supplementary-codepoint discrepancy", /** Pins source UTF16-unit traversal separately from scalar charmap membership. @returns Nothing. */ () => {
  const map = new FontCharMap([65, 66, 0x1f600, 0x1f601]);
  expect(map.HasChar(0x1f600)).toBe(true);
  expect(hasGlyphsInFontCharMap(map, "😀")).toBe(0);
  expect(hasGlyphsInFontCharMap(map, "A😀")).toBe(1);
});

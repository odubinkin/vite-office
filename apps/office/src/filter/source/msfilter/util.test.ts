/** @fileoverview Source MS filter palette conversion cases. */
import { expect, it } from "vitest";
import { COL_AUTO, Color } from "../../../tools/inc/color";
import { TransColToIco } from "./util";

it("maps the fixed Word colors and automatic color to their source indices", /** Checks maps the fixed Word colors and automatic color to their source indices. @returns Test completion or assertion result. */ () => {
  expect(TransColToIco(COL_AUTO)).toBe(0);
  expect(TransColToIco(new Color(0x000000))).toBe(1);
  expect(TransColToIco(new Color(0x0000ff))).toBe(2);
  expect(TransColToIco(new Color(0xffff00))).toBe(7);
  expect(TransColToIco(new Color(0xc0c0c0))).toBe(16);
});

it("uses upstream chromatic-scheme search for nonpalette colors", /** Checks uses upstream chromatic-scheme search for nonpalette colors. @returns Test completion or assertion result. */ () => {
  expect(TransColToIco(new Color(0x6666ff))).toBe(2);
  expect(TransColToIco(new Color(0x6566ff))).toBe(2);
  expect(TransColToIco(new Color(0x6665ff))).toBe(2);
  expect(TransColToIco(new Color(0x6666fe))).toBe(2);
  expect(TransColToIco(new Color(0xffcc00))).toBe(7);
});

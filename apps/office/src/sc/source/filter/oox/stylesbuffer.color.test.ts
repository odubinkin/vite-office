/** @fileoverview Calc's shared color precedence, original palette and DrawingML luminance boundaries. */
import { expect, it } from "vitest";
import { SaxesParser } from "saxes";
import { Color, COL_TRANSPARENT } from "../../../../tools/inc/color";
import { applyExcelTint } from "../../../../oox/source/drawingml/color";
import { ExcelGraphicHelper, XlsColor } from "./stylesbuffer.color";

/** Parses independent lexical color attributes using the common SAX attribute shape. @param attrs - Element attributes. @returns Native color. */
function read(attrs: string): XlsColor {
  let result = new XlsColor();
  const parser = new SaxesParser({ xmlns: true });
  parser.on(
    "opentag",
    /** Reads the admitted element attributes. @param tag - Native SAX tag. @returns Nothing. */ (
      tag,
    ) => {
      result = XlsColor.importColor(Object.values(tag.attributes));
    },
  );
  parser.write(`<color ${attrs}/>`).close();
  return result;
}

it("keeps source precedence, missing colors, system indices and indexed overrides", /** Checks full source choices without substituting default palettes. @returns Nothing. */ () => {
  const helper = new ExcelGraphicHelper();
  expect(read('indexed="2"').getColor(helper).toUInt32()).toBe(0xff0000);
  expect(read('indexed="64"').getColor(helper).toUInt32()).toBe(0);
  expect(read('indexed="65"').getColor(helper).toUInt32()).toBe(0xffffff);
  expect(read('indexed="32767"').getColor(helper).equals(COL_TRANSPARENT)).toBe(true);
  expect(read('theme="999" rgb="FF123456"').getColor(helper).equals(COL_TRANSPARENT)).toBe(true);
  expect(read('theme="bad" indexed="2"').getColor(helper).equals(COL_TRANSPARENT)).toBe(true);
  expect(read('indexed="2" rgb="FF123456" auto="1" tint="bad"').getColor(helper).toUInt32()).toBe(
    0x123456,
  );
  expect(
    read('xmlns:ext="urn:extension" ext:theme="4" rgb="FF123456"').getColor(helper).toUInt32(),
  ).toBe(0x123456);
  expect(read('rgb="bad-color"').getColor(helper).toUInt32()).toBe(0xffffff);
  expect(read('auto="1" tint="0.5"').getColor(helper).equals(COL_TRANSPARENT)).toBe(true);
  helper.appendColor("bad-color");
  expect(read('indexed="0"').getColor(helper).toUInt32()).toBe(0xffffff);
});

it("rounds original HSL on both sides of midpoint and clamps Excel tint endpoints", /** Tests concrete RGB bytes in representative saturation and luminance ranges. @returns Nothing. */ () => {
  expect(applyExcelTint(new Color(0x808080), 50_000, true).toUInt32()).toBe(0xbfbfbf);
  expect(applyExcelTint(new Color(0x8080ff), 50_000, false).toUInt32()).toBe(0x0000bf);
  expect(applyExcelTint(new Color(0x445566), 100_000, false).toUInt32()).toBe(0);
  expect(applyExcelTint(new Color(0x445566), 100_000, true).toUInt32()).toBe(0xffffff);
  expect(applyExcelTint(new Color(0x000000), 40_000, true).toUInt32()).toBe(0x666666);
  const helper = new ExcelGraphicHelper();
  expect(read('rgb="FFFF0000" tint="3"').getColor(helper).toUInt32()).toBe(0xffffff);
  expect(read('rgb="FFFF0000" tint="-4"').getColor(helper).toUInt32()).toBe(0);
});

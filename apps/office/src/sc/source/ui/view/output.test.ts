/** @fileoverview Calc native data-bar rectangle and zero-axis placement. */
import { assert, expect, it } from "vitest";
import { Color } from "../../../../tools/inc/color";
import { Rectangle } from "../../../../tools/inc/gen";
import { drawDataBars } from "./output";

it("insets signed data bars, truncates their extents and places the internal zero axis", /** Checks native closed-edge rounding on both sides of zero. @returns Nothing. */ () => {
  const rect = new Rectangle(0, 0, 99, 19);
  const info = {
    mnZero: 50,
    mnLength: -50,
    maColor: new Color(0x0000ff),
    maAxisColor: new Color(0x000000),
    mbGradient: true,
    mbShowValue: true,
  };
  const negative = drawDataBars(info, rect, 1, 1);
  assert(negative);
  expect([
    negative.bar.Left(),
    negative.bar.Right(),
    negative.bar.Top(),
    negative.bar.Bottom(),
  ]).toEqual([26, 49, 2, 17]);
  expect(negative.axis).toBe(49);
  const positive = drawDataBars({ ...info, mnLength: 50 }, rect, 1, 1);
  assert(positive);
  expect([positive.bar.Left(), positive.bar.Right(), positive.axis]).toEqual([49, 73, 49]);
  expect(drawDataBars({ ...info, mnZero: 0, mnLength: 50 }, rect, 1, 1)?.axis).toBeUndefined();
  expect(drawDataBars({ ...info, mnZero: 100 }, rect, 1, 1)?.axis).toBeUndefined();
  expect(drawDataBars({ ...info, mnLength: 0 }, rect, 1, 1)).toBeUndefined();
  expect(drawDataBars({ ...info, mnLength: Number.NaN }, rect, 1, 1)).toBeUndefined();
});

/** @fileoverview Actual palette-reduction values and unchanged compiled native integer witnesses; complete palette/root/font records are not supplied by fake providers. */
import { expect, it } from "vitest";
import native from "./xestyle.merge-native.json" with { type: "json" };
import {
  lclGetWeighting,
  lclGetColorDistance,
  lclGetMergedColorComp,
  lclSetMixedColor,
  XclListColor,
  XclColorIdData,
  XclPaletteColor,
  XclRemap,
  XclNearest,
} from "./xestyle";
import { XclExpColorType as Use } from "../inc/xestyle";
import { Color } from "../../../../tools/inc/color";

it.each(native.cases as [number, number, number, number, number][])(
  "matches unchanged native component merge %s/%s/%s/%s",
  /** Native source output is independent of the TypeScript arithmetic. @param first - Native component. @param firstWeight - Native weight. @param second - Native component. @param secondWeight - Native weight. @param expected - Compiled original result. @returns Nothing. */ (
    first,
    firstWeight,
    second,
    secondWeight,
    expected,
  ) => expect(lclGetMergedColorComp(first, firstWeight, second, secondWeight)).toBe(expected),
);
it.each([
  [Use.EXC_COLOR_CELLTEXT, 10],
  [Use.EXC_COLOR_CELLBORDER, 2],
  [Use.EXC_COLOR_CELLAREA, 20],
  [Use.EXC_COLOR_CHARTTEXT, 10],
  [Use.EXC_COLOR_CHARTLINE, 1],
  [Use.EXC_COLOR_CHARTAREA, 2],
  [Use.EXC_COLOR_CTRLTEXT, 10],
  [Use.EXC_COLOR_GRID, 50],
  [Use.EXC_COLOR_TABBG, 20],
  [99 as Use, 1],
] as const)(
  "retains source usage weighting %s",
  /** Includes original release fallback without inventing a new category. @param use - Actual source enum. @param expected - Original weight. @returns Nothing. */ (
    use,
    expected,
  ) => expect(lclGetWeighting(use)).toBe(expected),
);
it("retains integer distance weights, symmetry and alpha omission", /** Actual Color objects supply all channel values. @returns Nothing. */ () => {
  const black = new Color(0),
    white = new Color(0xffffff),
    transparent = new Color(0);
  expect(lclGetColorDistance(black, new Color(1, 0, 0))).toBe(77);
  expect(lclGetColorDistance(black, new Color(0, 1, 0))).toBe(151);
  expect(lclGetColorDistance(black, new Color(0, 0, 1))).toBe(28);
  expect(lclGetColorDistance(black, white)).toBe(16646400);
  expect(lclGetColorDistance(white, black)).toBe(16646400);
  transparent.SetAlpha(0);
  expect(lclGetColorDistance(black, transparent)).toBe(0);
});
it("mixes RGB midpoints with integer truncation while retaining destination alpha and source values", /** Also exercises the original valid destination/source alias case. @returns Nothing. */ () => {
  const destination = new Color(0),
    first = new Color(1, 3, 5),
    second = new Color(2, 6, 10);
  destination.SetAlpha(64);
  lclSetMixedColor(destination, first, second);
  expect([
    destination.GetRed(),
    destination.GetGreen(),
    destination.GetBlue(),
    destination.GetAlpha(),
  ]).toEqual([1, 4, 7, 64]);
  expect(first.toUInt32()).toBe(0x010305);
  expect(second.toUInt32()).toBe(0x02060a);
  lclSetMixedColor(first, first, second);
  expect(first.toUInt32()).toBe(0x010407);
});
it("copies actual working entries and preserves source weight/identity across endpoint-sensitive merge", /** Component weights are passed by value; boosted weights do not change the accumulated occurrence weight. @returns Nothing. */ () => {
  const color = new Color(32, 64, 96),
    first = new XclListColor(color, 0x100000001),
    second = new XclListColor(new Color(224, 192, 160), 2);
  expect(first.GetWeighting()).toBe(0);
  expect(first.IsBaseColor()).toBe(false);
  expect(first.GetColorId()).toBe(1);
  first.AddWeighting(10);
  second.AddWeighting(20);
  const copy = new XclListColor(first);
  color.SetRed(99);
  first.Merge(second);
  expect(first.GetColor().toUInt32()).toBe(0xc5a68b);
  expect(first.GetWeighting()).toBe(30);
  expect(first.GetColorId()).toBe(1);
  expect(second.GetColor().toUInt32()).toBe(0xe0c0a0);
  expect(second.GetWeighting()).toBe(20);
  expect(copy.GetColor().toUInt32()).toBe(0x204060);
  expect(copy.GetWeighting()).toBe(10);
  copy.Merge(copy);
  expect(copy.GetColor().toUInt32()).toBe(0x204060);
  expect(copy.GetWeighting()).toBe(20);
  copy.AddWeighting(0xffffffff);
  expect(copy.GetWeighting()).toBe(19);
});
it.each([0, 1, 2, 3, 4, 5, 6, 7])(
  "protects actual RGB base color %s without testing alpha as a channel",
  /** All eight base colors retain their RGB values during source merge. @param index - RGB corner. @returns Nothing. */ (
    index,
  ) => {
    const color = new Color(index & 1 ? 255 : 0, index & 2 ? 255 : 0, index & 4 ? 255 : 0);
    color.SetAlpha(64);
    const entry = new XclListColor(color, index),
      other = new XclListColor(new Color(77, 123, 200), 9);
    entry.AddWeighting(50);
    other.AddWeighting(20);
    expect(entry.IsBaseColor()).toBe(true);
    entry.Merge(other);
    expect(entry.GetColor().equals(color)).toBe(true);
    expect(entry.GetWeighting()).toBe(70);
  },
);
it("does not classify partially interior RGB entries as protected", /** Retains all original per-channel conditions. @returns Nothing. */ () => {
  expect(new XclListColor(new Color(0, 127, 255), 1).IsBaseColor()).toBe(false);
  expect(new XclListColor(new Color(255, 255, 127), 2).IsBaseColor()).toBe(false);
});
it("retains independent actual color/map values and explicit native defaults", /** The unspecified standalone color-ID index is not read before source Set. @returns Nothing. */ () => {
  const color = new Color(0x123456),
    data = new XclColorIdData();
  data.Set(color, 0x100000001);
  const copy = new XclColorIdData(data);
  data.Set(new Color(0), 2);
  color.SetBlue(0);
  expect(copy.maColor.toUInt32()).toBe(0x123456);
  expect(copy.mnIndex).toBe(1);
  const output = new XclPaletteColor(copy.maColor);
  expect(output.mbUsed).toBe(false);
  output.SetColor(copy.maColor);
  expect(output.mbUsed).toBe(true);
  const outputCopy = new XclPaletteColor(output);
  output.SetColor(new Color(0));
  expect(outputCopy.maColor.toUInt32()).toBe(0x123456);
  expect(outputCopy.mbUsed).toBe(true);
  const remap = new XclRemap();
  expect([remap.mnPalIndex, remap.mbProcessed]).toEqual([0, false]);
  remap.SetIndex(-1);
  const remapCopy = new XclRemap(remap);
  remap.SetIndex(2);
  expect([remapCopy.mnPalIndex, remapCopy.mbProcessed]).toEqual([0xffffffff, true]);
  const nearest = new XclNearest();
  expect([nearest.mnPalIndex, nearest.mnDist]).toEqual([0, 0]);
  nearest.mnPalIndex = 7;
  nearest.mnDist = -17;
  expect(new XclNearest(nearest)).toEqual(nearest);
});

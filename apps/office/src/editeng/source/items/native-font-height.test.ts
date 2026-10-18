/** @fileoverview Native height/property/unit value and metric boundary cases with literal initialized arithmetic. */
import { expect, it } from "vitest";
import {
  SvxFontHeightItem as Item,
  FONTHEIGHT_16_VERSION,
  FONTHEIGHT_UNIT_VERSION,
} from "../../inc/fhgtitem";
import { MapUnit as M } from "../../../tools/inc/mapunit";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SfxItemPool } from "../../../svl/source/items/itempool";
it("preserves original constructor percentage factory copy and all stored fields without reapplying the property", /** Clone borrows no pools or synthetic providers. @returns Nothing. */ () => {
  expect([FONTHEIGHT_16_VERSION, FONTHEIGHT_UNIT_VERSION]).toEqual([1, 2]);
  const item = new Item(240, 125, 101),
    copy = new Item(item),
    clone = item.Clone(new SfxItemPool()),
    factory = Item.CreateDefault();
  expect(item.QueryValue()).toEqual({ height: 300, prop: 125, propUnit: 13 });
  expect([factory.Which(), factory.GetHeight(), factory.GetProp(), factory.GetPropUnit()]).toEqual([
    0, 240, 100, 13,
  ]);
  expect(copy.QueryValue()).toEqual(item.QueryValue());
  expect(clone.QueryValue()).toEqual(item.QueryValue());
  expect(clone).not.toBe(item);
  copy.SetWhich(112);
  expect(copy.equals(item)).toBe(true);
  expect(copy.hashCode()).not.toBe(item.hashCode());
  expect(item.equals(new SfxInt16Item(101, 300))).toBe(false);
  clone.SetHeight(301);
  expect(item.equals(clone)).toBe(false);
  clone.SetHeight(300);
  clone.SetProp(125, M.MapRelative);
  expect(item.equals(clone)).toBe(true);
  clone.SetProp(124, M.MapRelative);
  expect(item.equals(clone)).toBe(false);
  clone.SetProp(125, M.MapPoint);
  expect(item.equals(clone)).toBe(false);
  expect(clone.GetHeight()).toBe(300);
  expect(clone.GetProp()).toBe(125);
  expect(clone.GetPropUnit()).toBe(M.MapPoint);
  expect(clone.HasMetrics()).toBe(true);
});
it("keeps unsigned32 multiplication before division and native zero height", /** Maximum initialized inputs remain defined unsigned arithmetic, no native memory or sanitizer probes. @returns Nothing. */ () => {
  expect(new Item(0, 100, 101).GetHeight()).toBe(0);
  expect(new Item(0xffffffff, 65535, 101).GetHeight()).toBe(42949017);
  expect(new Item(0xffffffff, 100, 101).GetHeight()).toBe(0xffffffff);
  expect(new Item(101, 50, 101).GetHeight()).toBe(50);
  expect(new Item(101, 0, 101).QueryValue()).toEqual({ height: 0, prop: 0, propUnit: 13 });
  for (const value of [-1, 0.5, 0x100000000])
    expect(
      /** Checked browser height boundary. @returns Invalid item. */ () =>
        new Item(value, 100, 101),
    ).toThrow("value is invalid");
});
it("retains signed16 absolute deltas and both original SetHeight overloads including same-direction core conversion", /** Expected23twips comes from40mm100 and preserves CALC109. @returns Nothing. */ () => {
  const item = new Item(100, 100, 101);
  item.SetHeight(100, 2, M.MapPoint);
  expect(item.QueryValue()).toEqual({ height: 140, prop: 2, propUnit: 8 });
  item.SetHeight(100, 2, M.MapPoint, M.Map100thMM);
  expect(item.QueryValue()).toEqual({ height: 123, prop: 2, propUnit: 8 });
  item.SetHeight(100, 65535, M.MapPoint);
  expect(item.GetHeight()).toBe(80);
  expect(item.GetProp()).toBe(65535);
  item.SetHeight(0, 65535, M.MapPoint);
  expect(item.GetHeight()).toBe(4294967276);
  item.SetHeight(100, 20, M.MapSysFont);
  expect(item.GetHeight()).toBe(100);
  item.SetHeight(100, 50, M.MapRelative, M.MapMM);
  expect(item.QueryValue()).toEqual({ height: 50, prop: 50, propUnit: 13 });
  item.SetHeight(321);
  expect(item.QueryValue()).toEqual({ height: 321, prop: 100, propUnit: 13 });
});
it("uses native llround halfway away from zero then unsigned32 assignment without changing property state", /** Original BigInt::Scale is a numeric helper, no memory owner is introduced. @returns Nothing. */ () => {
  const item = new Item(5, 100, 101);
  item.SetProp(65535, M.MapPoint);
  item.ScaleMetrics(0.5);
  expect(item.QueryValue()).toEqual({ height: 3, prop: 65535, propUnit: 8 });
  item.SetHeight(5);
  item.ScaleMetrics(-0.5);
  expect(item.GetHeight()).toBe(4294967293);
  item.SetHeight(0);
  item.ScaleMetrics(0);
  expect(item.GetHeight()).toBe(0);
  item.SetHeight(10);
  item.ScaleMetrics(2);
  expect(item.GetHeight()).toBe(20);
});

/** @fileoverview Original height Any member transport, partial failures and initialized numeric boundaries. */
import { expect, it } from "vitest";
import { SvxFontHeightItem as Item } from "../../inc/fhgtitem";
import {
  MID_FONTHEIGHT as HEIGHT,
  MID_FONTHEIGHT_PROP as PROP,
  MID_FONTHEIGHT_DIFF as DIFF,
} from "../../inc/memberids";
import { MapUnit as M } from "../../../tools/inc/mapunit";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  FontHeight as H,
  cppu_detail_getUnoType_FontHeight as type,
} from "../../../offapi/com/sun/star/frame/status/FontHeight";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
/** Extracts a native numeric member and asserts declared type. @param item - Actual item. @param member - Original member. @param kind - Expected actual primitive. @returns Queried value. */
function query(item: Item, member: number, kind: "float" | "sal_Int16"): number {
  const out = new Any(),
    value: [number] = [-1];
  try {
    expect(item.QueryValue(out, member)).toBe(true);
    expect(out.extract(value, kind)).toBe(true);
    return value[0];
  } finally {
    out.dispose();
  }
}
it("queries native struct and scalar members with all difference-unit families and unknown untouched success", /** Includes native unsigned difference versus signed property behavior. @returns Nothing. */ () => {
  expect([HEIGHT, PROP, DIFF]).toEqual([1, 2, 3]);
  const item = new Item(2540, 100, 101),
    out = new Any(true),
    h = new H();
  try {
    for (const [unit, prop, diff] of [
      [M.MapRelative, 125, 0],
      [M.Map100thMM, 127, 3.6],
      [M.MapPoint, 2, 2],
      [M.MapTwip, 50, 2.5],
      [M.MapCM, 7, 7],
    ] as const) {
      item.SetProp(prop, unit);
      expect(item.QueryValue(out, 0)).toBe(true);
      expect(out.getValueTypeClass()).toBe(TypeClass.STRUCT);
      expect(out.extract(h, type)).toBe(true);
      expect([h.Height, h.Prop, h.Diff]).toEqual([
        72,
        unit === M.MapRelative ? prop : 100,
        Math.fround(diff),
      ]);
      expect(query(item, DIFF, "float")).toBe(Math.fround(diff));
      expect(query(item, PROP, "sal_Int16")).toBe(unit === M.MapRelative ? prop : 100);
      expect(item.QueryValue(out, 128)).toBe(true);
      expect(out.extract(h, type)).toBe(true);
      expect(h.Height).toBe(127);
    }
    expect(query(item, HEIGHT, "float")).toBe(72);
    expect(query(item, HEIGHT | 128, "float")).toBe(127);
    item.SetProp(65535, M.MapRelative);
    expect(query(item, PROP, "sal_Int16")).toBe(-1);
    item.SetProp(65535, M.MapPoint);
    expect(query(item, DIFF, "float")).toBe(65535);
    out.insert([77], "sal_Int32");
    expect(item.QueryValue(out, 132)).toBe(true);
    const same: [number] = [0];
    expect(out.extract(same, "sal_Int32")).toBe(true);
    expect(same[0]).toBe(77);
    expect(item.PutValue(out, 260)).toBe(true);
  } finally {
    out.dispose();
  }
});
it("uses JS rounding at representative nonnegative UInt32 height boundaries without a rounding-library port", /** Independent integer rational rounding for mm100-to-point tenths. @returns Nothing. */ () => {
  for (const height of [0, 1, 2, 63, 64, 126, 127, 128, 2540, 4294967294, 4294967295]) {
    const item = new Item(height, 100, 101),
      expected = Number((BigInt(height) * 72n + 127n) / 254n) / 10;
    expect(query(item, HEIGHT, "float")).toBe(Math.fround(expected));
  }
});
it("puts actual struct fields, ignores Diff and resets property before a valid-typed range failure", /** Wrong struct type leaves state unchanged, valid-typed bad range does not. @returns Nothing. */ () => {
  const item = new Item(300, 125, 101),
    input = new Any(new H(12.5, -1, 999), type),
    bad = new Any(true);
  try {
    expect(item.PutValue(bad, 0)).toBe(false);
    expect(item.GetProp()).toBe(125);
    expect(item.PutValue(input, 128)).toBe(true);
    expect(item.QueryValue()).toEqual({ height: 250, prop: 65535, propUnit: 13 });
    expect(item.PutValue(input, 0)).toBe(true);
    expect(item.GetHeight()).toBe(441);
    for (const height of [-1, 10001]) {
      input.insert(new H(height, 50, 5), type);
      item.SetProp(25, M.MapPoint);
      expect(item.PutValue(input, 128)).toBe(false);
      expect(item.GetProp()).toBe(100);
      expect(item.GetPropUnit()).toBe(M.MapRelative);
      expect(item.GetHeight()).toBe(441);
    }
  } finally {
    input.dispose();
    bad.dispose();
  }
});
it("puts double-height and actual integer sources with reset-before-failure and normal non-fuzz10000limit", /** DOUBLE extraction admits all LONG sources; no fake fallback-success peer. @returns Nothing. */ () => {
  const item = new Item(200, 50, 101),
    input = new Any([12.5], "double");
  try {
    expect(item.PutValue(input, HEIGHT | 128)).toBe(true);
    expect(item.GetHeight()).toBe(250);
    expect(item.PutValue(input, HEIGHT)).toBe(true);
    expect(item.GetHeight()).toBe(441);
    input.insert([13], "sal_Int32");
    expect(item.PutValue(input, HEIGHT | 128)).toBe(true);
    expect(item.GetHeight()).toBe(260);
    for (const v of [0, 10000]) {
      input.insert([v], "double");
      expect(item.PutValue(input, HEIGHT | 128)).toBe(true);
      expect(item.GetHeight()).toBe(v * 20);
    }
    for (const v of [-1, 10001]) {
      input.insert([v], "double");
      item.SetProp(20, M.MapPoint);
      expect(item.PutValue(input, HEIGHT)).toBe(false);
      expect(item.GetProp()).toBe(100);
      expect(item.GetPropUnit()).toBe(M.MapRelative);
    }
    input.insert([true], "bool");
    item.SetProp(50, M.MapPoint);
    expect(item.PutValue(input, HEIGHT)).toBe(false);
    expect(item.GetProp()).toBe(100);
  } finally {
    input.dispose();
  }
});
it("puts signed properties with native reconstruction and leaves bad property input untouched success", /** Includes unsigned32 products, clamp and both absolute core units. @returns Nothing. */ () => {
  const input = new Any([100], "sal_Int16"),
    item = new Item(200, 125, 101);
  try {
    expect(item.PutValue(input, PROP | 128)).toBe(true);
    expect(item.GetHeight()).toBe(200);
    input.insert([125], "sal_Int16");
    expect(item.PutValue(input, PROP | 128)).toBe(true);
    expect(item.QueryValue()).toEqual({ height: 250, prop: 125, propUnit: 13 });
    input.insert([true], "bool");
    const before = item.QueryValue();
    expect(item.PutValue(input, PROP)).toBe(true);
    expect(item.QueryValue()).toEqual(before);
    input.insert([100], "sal_Int16");
    for (const [height, prop, unit, member, expected] of [
      [10, 1, M.MapPoint, PROP | 128, 0],
      [100, 2, M.MapPoint, PROP, 29],
      [100, 20, M.Map100thMM, PROP, 80],
      [100, 20, M.MapTwip, PROP | 128, 80],
      [100, 20, M.MapCM, PROP, 100],
      [100, 0, M.MapRelative, PROP, 100],
      [0xffffffff, 65535, M.MapPoint, PROP | 128, 19],
    ] as const) {
      item.SetHeight(height);
      item.SetProp(prop, unit);
      expect(item.PutValue(input, member)).toBe(true);
      expect(item.GetHeight()).toBe(expected);
    }
    item.SetHeight(200);
    input.insert([-1], "sal_Int16");
    expect(item.PutValue(input, PROP | 128)).toBe(true);
    expect(item.GetHeight()).toBe(42949670);
    expect(item.GetProp()).toBe(65535);
  } finally {
    input.dispose();
  }
});
it("preserves difference float/LONG fallback and reconstruction before failed extraction", /** Invalid difference may mutate height and repeated failures reconstruct again. @returns Nothing. */ () => {
  const item = new Item(200, 125, 101),
    input = new Any([true], "bool");
  try {
    expect(item.PutValue(input, DIFF | 128)).toBe(false);
    expect(item.QueryValue()).toEqual({ height: 200, prop: 125, propUnit: 13 });
    item.SetHeight(200);
    item.SetProp(125, M.MapRelative);
    expect(item.PutValue(input, DIFF | 128)).toBe(false);
    expect(item.GetHeight()).toBe(160);
    expect(item.PutValue(input, DIFF | 128)).toBe(false);
    expect(item.GetHeight()).toBe(128);
    item.SetHeight(200);
    input.insert([2.5], "float");
    expect(item.PutValue(input, DIFF | 128)).toBe(true);
    expect(item.QueryValue()).toEqual({ height: 250, prop: 2, propUnit: 8 });
    item.SetHeight(200);
    input.insert([2], "sal_Int32");
    expect(item.PutValue(input, DIFF)).toBe(true);
    expect(item.QueryValue()).toEqual({ height: 271, prop: 2, propUnit: 8 });
    item.SetHeight(200);
    input.insert([-1], "float");
    expect(item.PutValue(input, DIFF | 128)).toBe(true);
    expect(item.QueryValue()).toEqual({ height: 180, prop: 65535, propUnit: 8 });
  } finally {
    input.dispose();
  }
});

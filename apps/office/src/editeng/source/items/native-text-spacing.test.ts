/** @fileoverview Native text kerning/width defaults, typed short transport, integral units and finite llround semantics. */
import { expect, it } from "vitest";
import { SvxAutoKernItem as Auto } from "../../inc/autokernitem";
import { SvxKerningItem as Kern } from "../../inc/kernitem";
import { SvxCharScaleWidthItem as Width } from "../../inc/charscaleitem";
import { SfxInt16Item, SfxUInt16Item } from "../../../svl/inc/intitem";
import { SfxPoolItem } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SfxItemPool } from "../../../svl/source/items/itempool";

/** Reads actual short Any output for either numeric text attribute. @param item - Real item. @param member - Selector. @returns Short payload. */
function query(item: Kern | Width, member = 0): number {
  const output = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(output, member)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  return value[0];
}
it("retains original factories and actual EditEngine pair/manual/width defaults", /** Native identities come from solar/eeitem offsets and actual eerdll declarations; no pool facade. @returns Nothing. */ () => {
  const auto = Auto.CreateDefault(),
    kern = Kern.CreateDefault(),
    width = Width.CreateDefault();
  expect([
    auto.Which(),
    auto.GetValue(),
    kern.Which(),
    kern.GetValue(),
    width.Which(),
    width.GetValue(),
  ]).toEqual([0, false, 0, 0, 0, 100]);
  expect([
    new Auto(false, 4053).Which(),
    new Kern(0, 4054).Which(),
    new Width(100, 4045).Which(),
  ]).toEqual([4053, 4054, 4045]);
  expect(auto.QueryValue()).toBe(false);
  expect(kern.QueryValue()).toBe(0);
  expect(width.QueryValue()).toBe(100);
});
it("copies all values and concrete clones independently, retaining native payload/Which separation", /** Each type uses the real shared numeric/bool base. @returns Nothing. */ () => {
  const auto = new Auto(true, 1),
    aCopy = new Auto(auto),
    aClone = auto.Clone(new SfxItemPool());
  expect(aCopy.equals(auto)).toBe(true);
  expect(aClone).toBeInstanceOf(Auto);
  auto.SetValue(false);
  expect(aClone.GetValue()).toBe(true);
  expect(aCopy.GetValue()).toBe(true);
  const kern = new Kern(-72, 2),
    kCopy = new Kern(kern),
    kClone = kern.Clone();
  expect(kCopy.equals(kern)).toBe(true);
  expect(kClone).toBeInstanceOf(Kern);
  kern.SetValue(1);
  expect(kCopy.GetValue()).toBe(-72);
  expect(kClone.GetValue()).toBe(-72);
  const width = new Width(65535, 3),
    wCopy = new Width(width),
    wClone = width.Clone();
  expect(wCopy.equals(width)).toBe(true);
  expect(wClone).toBeInstanceOf(Width);
  width.SetValue(100);
  expect(wCopy.GetValue()).toBe(65535);
  expect(wClone.GetValue()).toBe(65535);
  for (const item of [aClone, kClone, wClone]) {
    const copy = item.Clone();
    expect(copy).not.toBe(item);
    expect(copy.Which()).toBe(item.Which());
    copy.SetWhich(9);
    expect(copy.equals(item)).toBe(true);
    expect(SfxPoolItem.areSame(copy, item)).toBe(false);
  }
  expect(kern.equals(new SfxInt16Item(2, 1))).toBe(false);
  expect(width.equals(new SfxUInt16Item(3, 100))).toBe(false);
});
it("uses actual inherited automatic bool Any and native no-metric defaults", /** Calls through the base contract while preserving real derived behavior. @returns Nothing. */ () => {
  const auto = new Auto(false, 1),
    output = new Any(),
    value: [boolean] = [false];
  expect(auto.PutValue(new Any([true], "bool"), 128)).toBe(true);
  expect(auto.QueryValue(output, 255)).toBe(true);
  expect(output.extract(value, "bool")).toBe(true);
  expect(value[0]).toBe(true);
  expect(auto.PutValue(new Any([7], "sal_Int16"), 0)).toBe(false);
  const plain = new SfxInt16Item(1, 7),
    width = new Width(72, 1);
  for (const item of [auto, plain, width] as SfxPoolItem[]) {
    expect(item.HasMetrics()).toBe(false);
    item.ScaleMetrics(2);
  }
  expect(plain.GetValue()).toBe(7);
  expect(width.GetValue()).toBe(72);
  expect(auto.GetValue()).toBe(true);
  const kern: SfxPoolItem = new Kern(12, 1);
  expect(kern.HasMetrics()).toBe(true);
  kern.ScaleMetrics(2);
  expect((kern as Kern).GetValue()).toBe(24);
});
it("uses native llround tie-away-from-zero and signed16 assignment without a BigInt object library", /** Literal near-half double cases reject naive addition-before-truncation and uncorrected negative Math.round. @returns Nothing. */ () => {
  const cases: [number, number, number][] = [
    [1, 0.5, 1],
    [-1, 0.5, -1],
    [3, 0.5, 2],
    [-3, 0.5, -2],
    [1, 1.4999999999999998, 1],
    [-1, 1.4999999999999998, -1],
    [1, 0.49999999999999994, 0],
    [-1, 0.49999999999999994, 0],
    [3, -0.5, -2],
    [-3, -0.5, 2],
    [32767, 2, -2],
    [-32768, 2, 0],
    [12, 0, 0],
  ];
  for (const [value, scale, expected] of cases) {
    const item = new Kern(value, 1);
    item.ScaleMetrics(scale);
    expect(item.GetValue()).toBe(expected);
  }
});
it("converts integral twips to mm100 before source short narrowing, including original overflow", /** CALC129 retains surprising wrapped converted output rather than saturating it. @returns Nothing. */ () => {
  const cases: [number, number][] = [
    [-32768, 7737],
    [-72, -127],
    [-36, -64],
    [-1, -2],
    [0, 0],
    [1, 2],
    [36, 64],
    [72, 127],
    [32767, -7739],
  ];
  for (const [value, converted] of cases) {
    const item = new Kern(value, 1);
    expect(query(item)).toBe(value);
    expect(query(item, 7)).toBe(value);
    expect(query(item, 128)).toBe(converted);
    expect(query(item, 255)).toBe(converted);
    expect(query(item, 256)).toBe(value);
    expect(item.GetValue()).toBe(value);
  }
  const item = new Kern(12, 1),
    output = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(output)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(12);
});
it("puts native manual spacing through short extraction and optional rounded mm100 conversion", /** Wrong types preserve the value; other selector bits are ignored. @returns Nothing. */ () => {
  const item = new Kern(0, 1);
  const cases: [number, number][] = [
    [-32768, -18577],
    [-127, -72],
    [-36, -20],
    [-1, -1],
    [0, 0],
    [1, 1],
    [36, 20],
    [127, 72],
    [32767, 18577],
  ];
  for (const [value, twips] of cases) {
    expect(item.PutValue(new Any([value], "sal_Int16"), 255)).toBe(true);
    expect(item.GetValue()).toBe(twips);
    expect(item.PutValue(new Any([value], "sal_Int16"), 256)).toBe(true);
    expect(item.GetValue()).toBe(value);
  }
  for (const invalid of [new Any(), new Any([true], "bool"), 7]) {
    expect(item.PutValue(invalid, 128)).toBe(false);
    expect(item.GetValue()).toBe(32767);
  }
});
it("transports unsigned16 width as signed short without invented percentage bounds", /** Native0/65535values and negative short writes are retained, member ignored. @returns Nothing. */ () => {
  const width = new Width(100, 1);
  for (const [value, stored] of [
    [-32768, 32768],
    [-1, 65535],
    [0, 0],
    [1, 1],
    [100, 100],
    [32767, 32767],
  ]) {
    expect(width.PutValue(new Any([value], "sal_Int16"), 255)).toBe(true);
    expect(width.GetValue()).toBe(stored);
    expect(query(width, 128)).toBe(value);
    expect(query(width, 7)).toBe(value);
  }
  const output = new Any(),
    value: [number] = [0];
  expect(width.QueryValue(output)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(32767);
  for (const invalid of [new Any(), new Any([true], "bool"), 7]) {
    expect(width.PutValue(invalid, 0)).toBe(false);
    expect(width.GetValue()).toBe(32767);
  }
});

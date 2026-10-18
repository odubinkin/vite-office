/** @fileoverview Original signed32 item values through actual shared owners and typed Any. */
import { expect, it } from "vitest";
import { CntInt32Item } from "../../inc/cintitem";
import { SfxInt32Item, SfxUInt32Item } from "../../inc/intitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
/** Independent unsigned64 modular fold with signed identity-key conversion. @param which - Identity. @param value - Signed payload. @returns Source arithmetic reference. */
function hash(which: number, value: number): bigint {
  let seed = 0n;
  const mask = (1n << 64n) - 1n;
  for (const key of [which, value]) {
    const h = BigInt.asUintN(64, BigInt(key));
    seed = (seed ^ (h + 0x9e3779b97f4a7c15n + ((seed << 12n) & mask) + (seed >> 4n))) & mask;
  }
  return seed;
}
it("preserves signed32 values, copy/Clone/default factory, equality and original hash fold", /** Checks full signed width with actual base/subclass constructors. @returns Nothing. */ () => {
  expect(new CntInt32Item(80, -0).GetValue()).toBe(0);
  const d = SfxInt32Item.CreateDefault();
  expect(d).toBeInstanceOf(SfxInt32Item);
  expect([d.Which(), d.GetValue()]).toEqual([0, 0]);
  for (const C of [CntInt32Item, SfxInt32Item]) {
    for (const value of [-2147483648, -1, 0, 1, 2147483647]) {
      const item = new C(80, value);
      const copy = item instanceof SfxInt32Item ? new SfxInt32Item(item) : new CntInt32Item(item);
      const clone = item.Clone();
      expect(copy).not.toBe(item);
      expect(clone).toBeInstanceOf(C);
      expect([copy.Which(), clone.Which()]).toEqual([80, 80]);
      expect(item.GetValue()).toBe(value);
      expect(item.equals(clone)).toBe(true);
      expect(item.equals(new C(81, value))).toBe(true);
      expect(item.equals(new C(80, value === 0 ? 1 : 0))).toBe(false);
      expect(item.equals(new SfxUInt32Item())).toBe(false);
      expect(item.supportsHashCode()).toBe(true);
      expect(item.hashCode()).toBe(hash(80, value));
      const output = new Any(true);
      expect(copy.QueryValue()).toBe(value);
      expect(copy.QueryValue(output)).toBe(true);
      expect(copy.QueryValue(output, 255)).toBe(true);
      const result: [number] = [0];
      expect(output.extract(result, "sal_Int32")).toBe(true);
      expect(result[0]).toBe(value);
      output.dispose();
      item.SetValue(value === 0 ? 1 : 0);
      expect(copy.GetValue()).toBe(value);
      expect(clone.GetValue()).toBe(value);
    }
    for (const value of [-2147483649, 2147483648, 0.5, NaN])
      expect(
        /** Explicit existing browser-style checked signed32 boundary. @returns Nothing. */ () =>
          new C(80, value),
      ).toThrow("signed 32-bit");
  }
  expect(new CntInt32Item(80, 1).equals(new SfxInt32Item(80, 1))).toBe(false);
});
it("uses actual integer Any conversions and leaves wrong-type updates unchanged", /** Checks native signed extraction separately from plain browser signed32 inputs. @returns Nothing. */ () => {
  const item = new SfxInt32Item(80, 9);
  for (const [input, expected] of [
    [new Any([-128], "sal_Int8"), -128],
    [new Any([-32768], "sal_Int16"), -32768],
    [new Any([65535], "sal_uInt16"), 65535],
    [new Any([-2147483648], "sal_Int32"), -2147483648],
    [new Any([4294967295], "sal_uInt32"), -1],
  ] as const) {
    expect(item.PutValue(input, 255)).toBe(true);
    expect(item.GetValue()).toBe(expected);
    input.dispose();
  }
  for (const bad of [
    new Any(),
    new Any(true),
    new Any([1n], "sal_Int64"),
    new Any([1], "double"),
  ]) {
    expect(item.PutValue(bad)).toBe(false);
    expect(item.GetValue()).toBe(-1);
    bad.dispose();
  }
  for (const bad of [null, true, "1", NaN, 1.5, -2147483649, 2147483648])
    expect(item.PutValue(bad)).toBe(false);
  expect(item.GetValue()).toBe(-1);
  expect(item.PutValue(2147483647)).toBe(true);
  expect(item.GetValue()).toBe(2147483647);
  expect(item.PutValue(-2147483648)).toBe(true);
  expect(item.GetValue()).toBe(-2147483648);
  expect(item.PutValue(-0)).toBe(true);
  expect(item.GetValue()).toBe(0);
});

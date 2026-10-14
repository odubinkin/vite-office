/** @fileoverview Checks real shared unsigned item values, original typed Any fallbacks and retained browser scalar bounds. */
import { expect, it } from "vitest";
import { CntUInt16Item, CntUInt32Item } from "../../inc/cintitem";
import { SfxUInt16Item, SfxUInt32Item, SfxInt16Item } from "../../inc/intitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
/** Independent mathematical source fold with unsigned64 modular reduction. @param which - Item identity. @param value - Unsigned key. @returns Reference hash. */
function hash(which: number, value: number): bigint {
  let n = 0n;
  for (const x of [which, value])
    n = BigInt.asUintN(64, n ^ (BigInt(x) + 0x9e3779b97f4a7c15n + (n << 12n) + (n >> 4n)));
  return n;
}
it("preserves native default, copy, Clone, mutable value, equality and hash contracts", /** Uses actual shared owners for both widths and concrete subclasses. @returns Nothing. */ () => {
  for (const C of [SfxUInt16Item, SfxUInt32Item]) {
    const d = C.CreateDefault();
    expect([d.Which(), d.GetValue()]).toEqual([0, 0]);
    expect(d).toBeInstanceOf(C);
  }
  for (const [C, width] of [
    [CntUInt16Item, 16],
    [CntUInt32Item, 32],
    [SfxUInt16Item, 16],
    [SfxUInt32Item, 32],
  ] as const) {
    const max = width === 16 ? 65535 : 4294967295;
    for (const value of [0, 1, max]) {
      const item = new C(80, value);
      const copy =
        item instanceof SfxUInt16Item
          ? new SfxUInt16Item(item)
          : item instanceof SfxUInt32Item
            ? new SfxUInt32Item(item)
            : item instanceof CntUInt16Item
              ? new CntUInt16Item(item)
              : new CntUInt32Item(item);
      const clone = item.Clone();
      expect(clone).toBeInstanceOf(C);
      expect(copy).not.toBe(item);
      expect(clone).not.toBe(item);
      expect([copy.Which(), clone.Which()]).toEqual([80, 80]);
      expect(item.equals(copy)).toBe(true);
      expect(item.equals(new C(81, value))).toBe(true);
      expect(item.equals(new C(80, value === 0 ? 1 : 0))).toBe(false);
      expect(item.equals(new SfxInt16Item())).toBe(false);
      expect(item.supportsHashCode()).toBe(true);
      expect(item.hashCode()).toBe(hash(80, value));
      item.SetValue(value === 0 ? 1 : 0);
      expect(copy.GetValue()).toBe(value);
      expect(clone.GetValue()).toBe(value);
      const out = new Any(true);
      expect(copy.QueryValue()).toBe(width === 16 ? value : value | 0);
      expect(copy.QueryValue(out)).toBe(true);
      expect(copy.QueryValue(out, 255)).toBe(true);
      const result: [number] = [0];
      expect(out.extract(result, width === 16 ? "sal_uInt16" : "sal_Int32")).toBe(true);
      expect(result[0]).toBe(width === 16 ? value : value | 0);
      out.dispose();
    }
    for (const value of [-1, max + 1, 0.5, NaN])
      expect(
        /** Checks existing browser-only scalar guard. @returns Nothing. */ () => new C(80, value),
      ).toThrow("unsigned");
  }
  expect(new CntUInt16Item(80, 1).equals(new SfxUInt16Item(80, 1))).toBe(false);
  expect(new CntUInt32Item(80, 1).equals(new SfxUInt32Item(80, 1))).toBe(false);
});
it("retains unsigned16 direct and legacy signed32 fallback with wrapping and unchanged failures", /** Does not add a range policy to native typed extraction. @returns Nothing. */ () => {
  const item = new SfxUInt16Item(80, 9);
  for (const [input, expected] of [
    [new Any([7], "sal_uInt16"), 7],
    [new Any([-1], "sal_Int16"), 65535],
    [new Any([-1], "sal_Int8"), 65535],
    [new Any([65536], "sal_Int32"), 0],
    [new Any([-2147483648], "sal_Int32"), 0],
    [new Any([4294967295], "sal_uInt32"), 65535],
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
    expect(item.GetValue()).toBe(65535);
    bad.dispose();
  }
  for (const bad of [null, "1", true, NaN, 1.5, -2147483649, 2147483648])
    expect(item.PutValue(bad)).toBe(false);
  expect(item.GetValue()).toBe(65535);
  expect(item.PutValue(65537)).toBe(true);
  expect(item.GetValue()).toBe(1);
  expect(item.PutValue(-1)).toBe(true);
  expect(item.GetValue()).toBe(65535);
});
it("preserves unsigned32 Any signed projection and original signed32 input classes", /** Checks actual typed conversions separately from the browser scalar domain. @returns Nothing. */ () => {
  const item = new SfxUInt32Item(80, 9);
  for (const [input, expected] of [
    [new Any([-1], "sal_Int32"), 4294967295],
    [new Any([4294967295], "sal_uInt32"), 4294967295],
    [new Any([-2], "sal_Int16"), 4294967294],
    [new Any([65535], "sal_uInt16"), 65535],
  ] as const) {
    expect(item.PutValue(input)).toBe(true);
    expect(item.GetValue()).toBe(expected);
    input.dispose();
  }
  for (const bad of [new Any(true), new Any([1n], "sal_Int64"), new Any([1], "double")]) {
    expect(item.PutValue(bad, 255)).toBe(false);
    expect(item.GetValue()).toBe(65535);
    bad.dispose();
  }
  for (const bad of [null, "1", true, NaN, 1.5, -2147483649, 2147483648])
    expect(item.PutValue(bad)).toBe(false);
  expect(item.PutValue(-1)).toBe(true);
  expect(item.GetValue()).toBe(4294967295);
});
it("retains unchanged existing signed16 browser contracts while measuring the complete shared source owner", /** Covers existing sibling methods without a native parity claim. @returns Nothing. */ () => {
  const item = new SfxInt16Item(80, 7);
  expect(item.GetValue()).toBe(7);
  expect(item.QueryValue()).toBe(7);
  expect(item.equals(item.Clone())).toBe(true);
  expect(item.equals(new SfxInt16Item(81, 7))).toBe(false);
  expect(item.equals(new SfxInt16Item(80, 8))).toBe(false);
  expect(item.equals(new SfxUInt16Item())).toBe(false);
  for (const value of [-32769, 32768, 0.5])
    expect(
      /** Checks unchanged signed scalar validation. @returns Nothing. */ () =>
        new SfxInt16Item(80, value),
    ).toThrow("signed 16-bit");
});

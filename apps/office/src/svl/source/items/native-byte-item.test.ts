/** @fileoverview Native unsigned byte storage, concrete copy/hash and signed byte Any boundary shared by Calc and Writer. */
import { expect, it } from "vitest";
import { CntByteItem } from "../../inc/cintitem";
import { SfxByteItem, SfxUInt16Item } from "../../inc/intitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
/** Independent original unsigned64 Which/value fold. @param which - Item identity. @param value - Unsigned byte. @returns Logical source hash. */
function hash(which: number, value: number): bigint {
  let seed = 0n;
  for (const key of [which, value])
    seed = BigInt.asUintN(
      64,
      seed ^ (BigInt(key) + 0x9e3779b97f4a7c15n + (seed << 12n) + (seed >> 4n)),
    );
  return seed;
}
it("keeps unsigned byte values, native parameter narrowing and independent concrete copies", /** Uses real shared owners rather than a separate byte engine. @returns Nothing. */ () => {
  const defaults = SfxByteItem.CreateDefault();
  expect([defaults.Which(), defaults.GetValue()]).toEqual([0, 0]);
  for (const C of [CntByteItem, SfxByteItem])
    for (const value of [0, 127, 128, 255]) {
      const item = new C(159, value),
        copy = C === CntByteItem ? new CntByteItem(item) : new SfxByteItem(item),
        clone = item.Clone();
      expect(copy).not.toBe(item);
      expect(clone).not.toBe(item);
      expect(clone.constructor).toBe(C);
      expect([copy.Which(), copy.GetValue(), clone.Which(), clone.GetValue()]).toEqual([
        159,
        value,
        159,
        value,
      ]);
      expect(item.equals(copy)).toBe(true);
      expect(item.equals(new C(160, value))).toBe(true);
      expect(item.equals(new C(159, value ^ 1))).toBe(false);
      expect(item.equals(new SfxUInt16Item(159, value))).toBe(false);
      expect(item.supportsHashCode()).toBe(true);
      expect(item.hashCode()).toBe(hash(159, value));
      expect(item.hashCode()).not.toBe(new C(160, value).hashCode());
      item.SetValue(value ^ 1);
      expect(copy.GetValue()).toBe(value);
      expect(clone.GetValue()).toBe(value);
      const output = new Any(true),
        signed = value > 127 ? value - 256 : value;
      expect(copy.QueryValue()).toBe(signed);
      expect(copy.QueryValue(output)).toBe(true);
      expect(copy.QueryValue(output, 255)).toBe(true);
      const out: [number] = [77];
      expect(output.extract(out, "sal_Int8")).toBe(true);
      expect(out[0]).toBe(signed);
      output.dispose();
    }
  expect(new CntByteItem(159, 0).equals(new SfxByteItem(159, 0))).toBe(false);
  for (const [value, expected] of [
    [-1, 255],
    [256, 0],
    [511, 255],
    [-128, 128],
  ] as const) {
    const item = new CntByteItem(159, value);
    expect(item.GetValue()).toBe(expected);
    item.SetValue(value);
    expect(item.GetValue()).toBe(expected);
  }
});
it("accepts only the original byte Any class and leaves failed updates untouched", /** Numeric narrowing into byte is deliberately not admitted by UNO assignNumeric. @returns Nothing. */ () => {
  const item = new SfxByteItem(159, 7);
  for (const [value, expected] of [
    [-128, 128],
    [-1, 255],
    [0, 0],
    [127, 127],
  ] as const) {
    const input = new Any([value], "sal_Int8");
    expect(item.PutValue(input)).toBe(true);
    expect(item.GetValue()).toBe(expected);
    input.dispose();
  }
  for (const bad of [
    new Any(),
    new Any(true),
    new Any([1], "sal_Int16"),
    new Any([1], "sal_uInt16"),
    new Any([1], "sal_Int32"),
    new Any([1], "sal_uInt32"),
    new Any([1n], "sal_Int64"),
    new Any([1], "float"),
    new Any([1], "double"),
  ]) {
    expect(item.PutValue(bad, 255)).toBe(false);
    expect(item.GetValue()).toBe(127);
    bad.dispose();
  }
  for (const bad of [null, 1, "1", true]) expect(item.PutValue(bad)).toBe(false);
  expect(item.GetValue()).toBe(127);
});

/** @fileoverview Source-backed original signed16 copy/mutation/payload/Any/hash/presentation contracts with explicit checked host scalars. */
import { expect, it } from "vitest";
import { SfxInt16Item as Item, SfxUInt16Item } from "../../inc/intitem";
import { SfxPoolItem, SfxItemPresentation } from "../../inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { MapUnit } from "../../../tools/inc/mapunit";
import { SfxItemPool } from "./itempool";
import { SfxItemSet } from "./itemset";

it("retains native default, copy, mutation and independent clone values", /** Uses literal signed16 limits and real copied values. @returns Nothing. */ () => {
  const factory = Item.CreateDefault();
  expect([factory.Which(), factory.GetValue()]).toEqual([0, 0]);
  for (const value of [-32768, -1, 0, 1, 32767]) {
    const item = new Item(6, value),
      copy = new Item(item),
      clone = item.Clone(new SfxItemPool());
    expect(copy).not.toBe(item);
    expect(clone).not.toBe(item);
    expect([copy.Which(), copy.GetValue(), clone.Which(), clone.GetValue()]).toEqual([
      6,
      value,
      6,
      value,
    ]);
    expect(item.equals(copy)).toBe(true);
    item.SetValue(value === 0 ? 1 : 0);
    expect(copy.GetValue()).toBe(value);
    expect(clone.GetValue()).toBe(value);
    expect(item.equals(copy)).toBe(false);
  }
  for (const value of [-32769, 32768, 1.5]) {
    const item = new Item(7, 12);
    expect(
      /** Checks the existing JS scalar-domain boundary. @returns Nothing. */ () =>
        item.SetValue(value),
    ).toThrow("signed 16-bit");
    expect(item.GetValue()).toBe(12);
  }
});
it("separates native payload equality from the caller Which guard and value-only unsigned64 logical hash", /** No value hash is persisted as document bytes. @returns Nothing. */ () => {
  for (const [value, hash] of [
    [-32768, 18446744073709518848n],
    [-1, 18446744073709551615n],
    [0, 0n],
    [32767, 32767n],
  ] as const) {
    const item = new Item(6, value),
      otherWhich = new Item(7, value);
    expect(item.supportsHashCode()).toBe(true);
    expect(item.hashCode()).toBe(hash);
    expect(otherWhich.hashCode()).toBe(hash);
    expect(item.equals(otherWhich)).toBe(true);
    expect(SfxPoolItem.areSame(item, otherWhich)).toBe(false);
    expect(SfxPoolItem.areSame(item, item.Clone())).toBe(true);
    expect(item.equals(new SfxUInt16Item())).toBe(false);
  }
  const pool = new SfxItemPool(),
    left = new SfxItemSet(pool, [[1, 9]]),
    right = new SfxItemSet(pool, [[1, 9]]);
  left.Put(new Item(6, 12));
  right.Put(new Item(7, 12));
  expect(left.Equals(right, true)).toBe(false);
  expect(left.Put(new Item(6, 12))).toBeUndefined();
  expect((left.Put(new Item(6, 13)) as Item).GetValue()).toBe(13);
});
it("queries actual short Any and retains existing scalar projection while ignoring native selectors", /** Tests outputs and writes through the real shared Any owner. @returns Nothing. */ () => {
  const item = new Item(6, -32768);
  expect(item.QueryValue()).toBe(-32768);
  for (const member of [0, 128, 255, 9999]) {
    const output = new Any(),
      value: [number] = [0];
    expect(item.QueryValue(output, member)).toBe(true);
    expect(output.extract(value, "sal_Int16")).toBe(true);
    expect(value[0]).toBe(-32768);
    expect(item.PutValue(new Any([32767], "sal_Int16"), member)).toBe(true);
    expect(item.GetValue()).toBe(32767);
    item.SetValue(-32768);
  }
  const output = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(output)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(-32768);
  expect(item.PutValue(new Any([7], "sal_Int8"), 128)).toBe(true);
  expect(item.GetValue()).toBe(7);
  for (const invalid of [new Any(), new Any([true], "bool"), 8]) {
    expect(item.PutValue(invalid, 0)).toBe(false);
    expect(item.GetValue()).toBe(7);
  }
});
it("writes native plain numeric presentation without localized resources or a provider", /** OUString::number is the actual shared number formatter. @returns Nothing. */ () => {
  for (const value of [-32768, -1, 0, 32767]) {
    const item = new Item(6, value),
      text = new OUString(120);
    for (const degree of [SfxItemPresentation.Nameless, SfxItemPresentation.Complete]) {
      expect(
        item.GetPresentation(degree, MapUnit.MapTwip, MapUnit.Map100thMM, text, undefined),
      ).toBe(true);
      expect(text.equals(new OUString(OUString.number(value)))).toBe(true);
      expect([...text.getStr()]).toEqual(
        [...String(value), "\0"].map(
          /** Converts literal ASCII digits for an independent content witness. @param char - Character. @returns Code unit. */ (
            char,
          ) => char.charCodeAt(0),
        ),
      );
    }
  }
});

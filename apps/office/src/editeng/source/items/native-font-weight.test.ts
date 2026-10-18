/** @fileoverview Original weight float conversion and actual shared item/Any contracts. */
import { expect, it } from "vitest";
import { SvxWeightItem as Item } from "../../inc/wghtitem";
import { FontWeight as I } from "../../../tools/inc/fontenum";
import { FontWeight as W } from "../../../offapi/com/sun/star/awt/FontWeight";
import { ConvertFontWeight as convert } from "../../../vcl/inc/unohelp";
import { MID_BOLD as BOOL, MID_WEIGHT as WEIGHT } from "../../inc/memberids";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { SfxItemPool } from "../../../svl/source/items/itempool";
/** Independent original internal enum order and UNO physical weight values. */
const values = [0, 50, 60, 75, 90, 100, 105, 110, 150, 175, 200] as const;
it("preserves11enum and float overload mappings including ordered thresholds and unknown fallback", /** Explicit erased overload families, not scalar value inference. @returns Nothing. */ () => {
  expect([
    I.WEIGHT_DONTKNOW,
    I.WEIGHT_NORMAL,
    I.WEIGHT_BOLD,
    I.WEIGHT_BLACK,
    I.FontWeight_FORCE_EQUAL_SIZE,
    BOOL,
    WEIGHT,
  ]).toEqual([0, 5, 8, 10, 2147483647, 0, 1]);
  expect(Object.values(W)).toEqual(values);
  for (const [index, wire] of values.entries()) {
    expect(convert(index as I, "FontWeight")).toBe(wire);
    expect(convert(wire, "float")).toBe(index);
    if (index > 0) expect(convert(wire - 0.25, "float")).toBe(index);
  }
  expect(convert(11 as I, "FontWeight")).toBe(0);
  expect(convert(I.FontWeight_FORCE_EQUAL_SIZE, "FontWeight")).toBe(0);
  for (const value of [-1, -Infinity, Infinity, NaN, 201])
    expect(convert(value, "float")).toBe(I.WEIGHT_DONTKNOW);
  expect(convert(50.25, "float")).toBe(I.WEIGHT_ULTRALIGHT);
});
it("keeps original float32 parameter casts at logical font-weight thresholds", /** Boundary expectations derive from binary32 precision at100and200, without native binaries or memory probes. @returns Nothing. */ () => {
  expect(convert(100.000002, "float")).toBe(I.WEIGHT_NORMAL);
  expect(convert(100.000005, "float")).toBe(I.WEIGHT_MEDIUM);
  expect(convert(200.000005, "float")).toBe(I.WEIGHT_BLACK);
  expect(convert(200.00001, "float")).toBe(I.WEIGHT_DONTKNOW);
  const item = new Item(I.WEIGHT_BOLD, 102);
  for (const [value, expected] of [
    [100.000002, 5],
    [100.000005, 6],
    [200.000005, 10],
    [200.00001, 0],
  ] as const) {
    const input = new Any([value], "double");
    expect(item.PutValue(input, WEIGHT)).toBe(true);
    expect(item.GetWeight()).toBe(expected);
    input.dispose();
  }
});
it("uses native enum factory copies Clone bool setters and payload equality", /** Same-type equality ignoresWhich and default is NORMAL. @returns Nothing. */ () => {
  const factory = Item.CreateDefault(),
    item = new Item(I.WEIGHT_BOLD, 102),
    copy = new Item(item),
    clone = item.Clone(new SfxItemPool());
  expect([factory.Which(), factory.GetWeight(), copy.Which(), clone.Which()]).toEqual([
    0, 5, 102, 102,
  ]);
  expect(clone).not.toBe(item);
  expect(item.equals(copy)).toBe(true);
  copy.SetWhich(199);
  expect(item.equals(copy)).toBe(true);
  expect(item.HasBoolValue()).toBe(true);
  expect(item.GetBoolValue()).toBe(true);
  expect(item.hashCode()).toBe(102 ^ 8);
  expect(item.supportsHashCode()).toBe(true);
  item.SetBoolValue(false);
  expect(item.GetWeight()).toBe(I.WEIGHT_NORMAL);
  expect(item.GetBoolValue()).toBe(false);
  item.SetBoolValue(true);
  expect(item.GetValue()).toBe(I.WEIGHT_BOLD);
  item.SetEnumValue(0);
  expect(item.QueryValue()).toBe(0);
  expect(copy.GetWeight()).toBe(8);
  expect(item.equals(copy)).toBe(false);
  expect(new Item(11 as I, 102).GetValue()).toBe(11);
  expect(new Item(I.FontWeight_FORCE_EQUAL_SIZE, 102).GetValue()).toBe(2147483647);
  expect(
    /** Invalid browser enum range. @returns No item. */ () => new Item(2147483648 as I, 102),
  ).toThrow("value is invalid");
});
it("queries actual float Any values and bool member with native unchanged unknown output", /** Distinguishes stored enum5 from wire float100. @returns Nothing. */ () => {
  const item = new Item(I.WEIGHT_NORMAL, 102),
    out = new Any(true);
  for (const [index, wire] of values.entries()) {
    item.SetValue(index as I);
    expect(item.QueryValue(out, 129)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.FLOAT);
    const result: [number] = [-1];
    expect(out.extract(result, "float")).toBe(true);
    expect(result[0]).toBe(wire);
  }
  item.SetValue(I.WEIGHT_BOLD);
  expect(item.QueryValue(out)).toBe(true);
  expect(out.getValueTypeClass()).toBe(TypeClass.BOOLEAN);
  const flag: [boolean] = [false];
  expect(out.extract(flag, "bool")).toBe(true);
  expect(flag[0]).toBe(true);
  expect(item.QueryValue(out, 2)).toBe(true);
  expect(out.extract(flag, "bool")).toBe(true);
  expect(flag[0]).toBe(true);
  out.dispose();
});
it("accepts original numeric Any sources and preserves double admission superset of signed32", /** Real assign.hxx behavior, no fake fallback-success peer or private forcing. @returns Nothing. */ () => {
  const item = new Item(I.WEIGHT_NORMAL, 102);
  for (const [type, value, expected, longAdmitted] of [
    ["sal_Int8", 50, 1, true],
    ["sal_Int16", 60, 2, true],
    ["sal_uInt16", 75, 3, true],
    ["sal_Int32", 90, 4, true],
    ["sal_uInt32", 100, 5, true],
    ["float", 105, 6, false],
    ["double", 110, 7, false],
  ] as const) {
    const input = new Any([value], type),
      double: [number] = [0],
      long: [number] = [0];
    expect(input.extract(double, "double")).toBe(true);
    expect(double[0]).toBe(value);
    expect(input.extract(long, "sal_Int32")).toBe(longAdmitted);
    expect(item.PutValue(input, 257)).toBe(true);
    expect(item.GetWeight()).toBe(expected);
    input.dispose();
  }
  for (const [index, wire] of values.entries()) {
    expect(item.PutValue(wire, WEIGHT)).toBe(true);
    expect(item.GetValue()).toBe(index);
  }
});
it("retains native bool fallback NORMAL reset, numeric failures and unknown-member success", /** Unsupported numeric types preserve state, floating exceptional values use original DONTKNOW fallback. @returns Nothing. */ () => {
  const item = new Item(I.WEIGHT_BOLD, 102);
  for (const wrong of [null, undefined, "1", true, {}, [], 1n]) {
    expect(item.PutValue(wrong, WEIGHT)).toBe(false);
    expect(item.GetWeight()).toBe(8);
  }
  for (const wrong of [new Any(true), new Any([1n], "sal_Int64")]) {
    expect(item.PutValue(wrong, WEIGHT)).toBe(false);
    expect(item.GetWeight()).toBe(8);
    wrong.dispose();
  }
  expect(item.PutValue(undefined, 2)).toBe(true);
  expect(item.GetWeight()).toBe(8);
  expect(item.PutValue({}, BOOL)).toBe(true);
  expect(item.GetWeight()).toBe(5);
  expect(item.PutValue(true)).toBe(true);
  expect(item.GetWeight()).toBe(8);
  expect(item.PutValue(false, 128)).toBe(true);
  expect(item.GetWeight()).toBe(5);
  for (const floating of [NaN, Infinity, -Infinity, 201]) {
    expect(item.PutValue(floating, WEIGHT)).toBe(true);
    expect(item.GetWeight()).toBe(0);
  }
  const input = new Any([150], "double");
  expect(item.PutValue(input, WEIGHT)).toBe(true);
  expect(item.GetBoolValue()).toBe(true);
  input.dispose();
});

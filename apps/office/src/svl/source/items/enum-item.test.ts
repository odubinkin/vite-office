/** @fileoverview Tests original shared enum template through a caller-owned TypeClass specialization and actual Any transport. */
import { expect, it } from "vitest";
import { SfxEnumItem, SfxBoolItem } from "../../inc/eitem";
import { SfxEnumItemInterface } from "../../inc/cenumitm";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
/** Test caller instantiates the actual generic template with the existing full32bit TypeClass enum; it provides no substitute runtime service or item implementation. */
class TypeClassItem extends SfxEnumItem<TypeClass> {
  /** Selects actual protected native value/copy constructor. @param source - Which or const source. @param value - Actual declared enum value. @returns Caller item. */
  constructor(source: number | TypeClassItem, value: TypeClass = TypeClass.VOID) {
    if (typeof source === "number") super(source, value);
    else super(source);
  }
  /** Provides the concrete caller copy contract required by the native abstract template. @returns Copied item. */
  public Clone(): TypeClassItem {
    return new TypeClassItem(this);
  }
}
it("preserves full enum payload, unsigned16 conversion, equality and hash identity", /** Exercises original generic value and copy operations across actual enum storage width. @returns Nothing. */ () => {
  const item = new TypeClassItem(170, TypeClass.CHAR);
  const same = new TypeClassItem(171, TypeClass.CHAR);
  expect(item instanceof SfxEnumItemInterface).toBe(true);
  expect(item.GetValue()).toBe(TypeClass.CHAR);
  expect(item.GetEnumValue()).toBe(1);
  expect(item.equals(same)).toBe(true);
  expect(item.supportsHashCode()).toBe(true);
  expect(item.hashCode()).toBe(171);
  expect(same.hashCode()).toBe(170);
  expect(item.equals(new SfxBoolItem(170, true))).toBe(false);
  expect(item.equals(new TypeClassItem(170, TypeClass.BOOLEAN))).toBe(false);
  item.SetValue(65537 as TypeClass);
  expect(item.GetEnumValue()).toBe(1);
  expect(item.equals(same)).toBe(false);
  const clone = item.Clone();
  item.SetValue(TypeClass.VOID);
  expect(clone.GetValue()).toBe(65537);
  expect(clone.Which()).toBe(170);
  clone.SetEnumValue(65536);
  expect(clone.GetValue()).toBe(0);
  clone.SetEnumValue(65535);
  expect(clone.GetValue()).toBe(65535);
  clone.SetValue(TypeClass.MAKE_FIXED_SIZE);
  expect(clone.GetEnumValue()).toBe(65535);
  expect(clone.HasBoolValue()).toBe(false);
  expect(clone.GetBoolValue()).toBe(false);
  clone.SetBoolValue(true);
  clone.SetBoolValue(false);
  expect(clone.GetValue()).toBe(TypeClass.MAKE_FIXED_SIZE);
});
it("uses original enum interface Any and explicit signed32 browser scalar transport", /** Checks default and ignored members plus unchanged failures. @returns Nothing. */ () => {
  const item = new TypeClassItem(170, TypeClass.LONG);
  expect(item.QueryValue()).toBe(6);
  const out = new Any(true);
  expect(item.QueryValue(out)).toBe(true);
  const result: [number] = [0];
  expect(out.extract(result, "sal_uInt16")).toBe(true);
  expect(result[0]).toBe(6);
  expect(item.QueryValue(out, 255)).toBe(true);
  const input = new Any([-1], "sal_Int32");
  expect(item.PutValue(input, 255)).toBe(true);
  expect(item.GetValue()).toBe(65535);
  input.dispose();
  const bad = new Any(true);
  expect(item.PutValue(bad, 0)).toBe(false);
  expect(item.GetValue()).toBe(65535);
  bad.dispose();
  for (const value of [true, null, "1", NaN, 1.5, -2147483649, 2147483648])
    expect(item.PutValue(value, 0)).toBe(false);
  expect(item.GetValue()).toBe(65535);
  expect(item.PutValue(-65535, 0)).toBe(true);
  expect(item.GetValue()).toBe(1);
  expect(item.PutValue(65536, 0)).toBe(true);
  expect(item.GetValue()).toBe(0);
  out.dispose();
});

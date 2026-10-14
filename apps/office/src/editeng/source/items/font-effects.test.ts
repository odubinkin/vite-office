/** @fileoverview Source-backed shared font effects over actual bool/enum/Any owners. */
import { expect, it } from "vitest";
import { SvxContourItem as Contour } from "../../inc/contouritem";
import { SvxShadowedItem as Shadow } from "../../inc/shdditem";
import { SvxWordLineModeItem as Word } from "../../inc/wrlmitem";
import { SvxCharReliefItem as Relief } from "../../inc/charreliefitem";
import { FontRelief as R } from "../../../vcl/inc/fntstyle";
import { MID_RELIEF } from "../../inc/memberids";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { SfxItemPool } from "../../../svl/source/items/itempool";
it("retains native bool factories constructor order copy Clone and shared typed transport", /** Real public item histories. @returns Nothing. */ () => {
  for (const Class of [Contour, Shadow, Word]) {
    const factory = Class.CreateDefault(),
      item = new Class(true, 107),
      copy = new Class(item),
      clone = item.Clone(new SfxItemPool()),
      out = new Any();
    expect([factory.Which(), factory.GetValue()]).toEqual([0, false]);
    expect(factory).toBeInstanceOf(Class);
    expect(item.QueryValue()).toBe(true);
    expect(item.QueryValue(out)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.BOOLEAN);
    const value: [boolean] = [false];
    expect(out.extract(value, "bool")).toBe(true);
    expect(value[0]).toBe(true);
    expect([copy.Which(), clone.Which(), copy.GetValue(), clone.GetValue()]).toEqual([
      107,
      107,
      true,
      true,
    ]);
    expect(copy).not.toBe(item);
    expect(clone).toBeInstanceOf(Class);
    expect(item.equals(new Class(true, 199))).toBe(true);
    expect(item.equals(new Class(false, 107))).toBe(false);
    item.SetValue(false);
    expect(copy.GetValue()).toBe(true);
    expect(item.PutValue(out, 255)).toBe(true);
    expect(item.PutValue(out, 0)).toBe(true);
    expect(item.PutValue(false, 0)).toBe(true);
    expect(item.PutValue(1, 0)).toBe(false);
    const wrong = new Any([1], "sal_Int16");
    expect(item.PutValue(wrong, 0)).toBe(false);
    expect(item.GetValue()).toBe(false);
    wrong.dispose();
    out.dispose();
  }
  expect(new Contour(true, 1).equals(new Shadow(true, 1))).toBe(false);
});
it("preserves relief factories copies enum mutation and signed16 native output", /** Full native initialized value and copy forms. @returns Nothing. */ () => {
  expect([R.NONE, R.Embossed, R.Engraved, R.FontRelief_FORCE_EQUAL_SIZE, MID_RELIEF]).toEqual([
    0, 1, 2, 2147483647, 0,
  ]);
  const factory = Relief.CreateDefault(),
    item = new Relief(R.Engraved, 124),
    copy = new Relief(item),
    clone = item.Clone(new SfxItemPool());
  expect([factory.Which(), factory.GetValue(), copy.Which(), clone.Which()]).toEqual([
    0, 0, 124, 124,
  ]);
  expect(clone).not.toBe(item);
  expect(item.equals(copy)).toBe(true);
  copy.SetWhich(9);
  expect(item.equals(copy)).toBe(true);
  expect(item.supportsHashCode()).toBe(true);
  expect(item.hashCode()).toBe(124 ^ 2);
  item.SetEnumValue(1);
  expect(item.GetValue()).toBe(R.Embossed);
  expect(copy.GetValue()).toBe(R.Engraved);
  expect(item.equals(copy)).toBe(false);
  expect(item.equals(new Word(true, 124))).toBe(false);
  const out = new Any(true);
  for (const n of [R.NONE, R.Embossed, R.Engraved]) {
    expect(item.PutValue(n)).toBe(true);
    expect(item.GetValue()).toBe(n);
    expect(item.QueryValue()).toBe(n);
    expect(item.QueryValue(out, 128)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.SHORT);
    const value: [number] = [-1];
    expect(out.extract(value, "sal_Int16")).toBe(true);
    expect(value[0]).toBe(n);
    item.SetValue(R.NONE);
    expect(item.PutValue(out, 256)).toBe(true);
    expect(item.GetValue()).toBe(n);
  }
  out.dispose();
});
it("rejects unknown members wrong Any and out of range relief values without mutation", /** Original failed short extraction leaves sentinel invalid. @returns Nothing. */ () => {
  const item = new Relief(R.Embossed, 124),
    out = new Any(true);
  expect(item.QueryValue(out, 1)).toBe(false);
  const kept: [boolean] = [false];
  expect(out.extract(kept, "bool")).toBe(true);
  expect(kept[0]).toBe(true);
  out.dispose();
  expect(item.PutValue(2, 129)).toBe(false);
  for (const wrong of [
    undefined,
    null,
    true,
    "1",
    {},
    [],
    1.5,
    NaN,
    Infinity,
    -32769,
    32768,
    -1,
    3,
  ]) {
    expect(item.PutValue(wrong)).toBe(false);
    expect(item.GetValue()).toBe(R.Embossed);
  }
  for (const wrong of [
    new Any(true),
    new Any([65535], "sal_uInt16"),
    new Any([65536], "sal_Int32"),
    new Any([3], "sal_Int16"),
  ]) {
    expect(item.PutValue(wrong, 128)).toBe(false);
    expect(item.GetValue()).toBe(R.Embossed);
    wrong.dispose();
  }
  expect(item.PutValue(2, 384)).toBe(true);
  expect(item.GetValue()).toBe(R.Engraved);
});

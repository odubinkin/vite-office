/** @fileoverview Original escapement defaults, copy/range/cast contracts and source-backed automatic/manual transitions. */
import { expect, it } from "vitest";
import {
  SvxEscapementItem as Item,
  DFLT_ESC_SUPER,
  DFLT_ESC_SUB,
  DFLT_ESC_PROP,
  MAX_ESC_POS,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_AUTO_SUB,
} from "../../inc/escapementitem";
import { SvxEscapement as Mode } from "../../inc/svxenum";
import {
  MID_ESC as ESC,
  MID_ESC_HEIGHT as HEIGHT,
  MID_AUTO_ESC as AUTO,
} from "../../inc/memberids";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SfxInt16Item } from "../../../svl/inc/intitem";
import { SfxItemPool } from "../../../svl/source/items/itempool";

/** Reads an actual typed Any result. @param item - Real pooled value. @param member - Original selector. @param type - Expected numeric type. @returns Extracted number. */
function numeric(item: Item, member: number, type: "sal_Int16" | "sal_Int8"): number {
  const output = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(output, member)).toBe(true);
  expect(output.extract(value, type)).toBe(true);
  return value[0];
}
/** Reads the actual auto-member boolean. @param item - Real item. @returns Automatic state. */
function automatic(item: Item): boolean {
  const output = new Any(),
    value: [boolean] = [false];
  expect(item.QueryValue(output, AUTO)).toBe(true);
  expect(output.extract(value, "bool")).toBe(true);
  return value[0];
}

it("retains exact declarations, factory defaults and original EditEngine0/100default", /** The real eerdll default identity is4052 from original solar/eeitem offsets, not a fabricated document pool. @returns Nothing. */ () => {
  expect([
    DFLT_ESC_SUPER,
    DFLT_ESC_SUB,
    DFLT_ESC_PROP,
    MAX_ESC_POS,
    DFLT_ESC_AUTO_SUPER,
    DFLT_ESC_AUTO_SUB,
  ]).toEqual([33, -8, 58, 13999, 14000, -14000]);
  expect([Mode.Off, Mode.Superscript, Mode.Subscript, Mode.End]).toEqual([0, 1, 2, 3]);
  expect([ESC, HEIGHT, AUTO]).toEqual([0, 1, 2]);
  const factory = Item.CreateDefault();
  expect([factory.Which(), factory.GetEsc(), factory.GetProportionalHeight()]).toEqual([0, 0, 100]);
  const actualDefault = new Item(0, 100, 4052);
  expect([
    actualDefault.Which(),
    actualDefault.GetEsc(),
    actualDefault.GetProportionalHeight(),
  ]).toEqual([4052, 0, 100]);
  expect(actualDefault.equals(factory)).toBe(true);
  expect(actualDefault.GetEscapement()).toBe(Mode.Off);
  expect(actualDefault.QueryValue()).toBeUndefined();
});
it("constructs and changes all native modes, preserving source non-super fallthrough", /** Uses literal mode/offset/height expectations. @returns Nothing. */ () => {
  const modes: [Mode, number, number][] = [
    [Mode.Off, 0, 100],
    [Mode.Superscript, 14000, 58],
    [Mode.Subscript, -14000, 58],
    [Mode.End, -14000, 58],
  ];
  const item = new Item(1);
  for (const [mode, esc, height] of modes) {
    const constructed = new Item(mode, 9);
    expect([
      constructed.Which(),
      constructed.GetEsc(),
      constructed.GetProportionalHeight(),
    ]).toEqual([9, esc, height]);
    item.SetEscapement(mode);
    expect([item.GetEsc(), item.GetProportionalHeight()]).toEqual([esc, height]);
    expect(item.GetEscapement()).toBe(
      esc === 0 ? Mode.Off : esc > 0 ? Mode.Superscript : Mode.Subscript,
    );
  }
  item.SetEscapement(Mode.Off);
  expect([item.GetEsc(), item.GetProportionalHeight()]).toEqual([0, 100]);
});
it("copies complete values, clones independently and compares payload without Which", /** Direct setters retain original short/byte argument conversions rather than UNO property restrictions. @returns Nothing. */ () => {
  const item = new Item(-8, 58, 4),
    copy = new Item(item),
    clone = item.Clone(new SfxItemPool());
  expect(copy).not.toBe(item);
  expect(clone.equals(item)).toBe(true);
  expect([clone.Which(), clone.GetEsc(), clone.GetProportionalHeight()]).toEqual([4, -8, 58]);
  clone.SetWhich(8);
  expect(clone.equals(item)).toBe(true);
  clone.SetEsc(0);
  expect(clone.equals(item)).toBe(false);
  clone.SetEsc(-8);
  clone.SetProportionalHeight(60);
  expect(clone.equals(item)).toBe(false);
  expect(item.equals(new SfxInt16Item(4, -8))).toBe(false);
  item.SetEsc(65535);
  item.SetProportionalHeight(511);
  expect([item.GetEsc(), item.GetProportionalHeight()]).toEqual([-1, 255]);
  expect(copy.GetEsc()).toBe(-8);
  expect(numeric(item, HEIGHT, "sal_Int8")).toBe(-1);
  item.SetEsc(32768);
  item.SetProportionalHeight(256);
  expect([item.GetEsc(), item.GetProportionalHeight()]).toEqual([-32768, 0]);
});
it("queries original short/byte/bool members and byte-masked aliases with unknown untouched success", /** Auto markers are source values, not substituted font metrics. @returns Nothing. */ () => {
  for (const esc of [0, 14000, -14000, 33, -8]) {
    const item = new Item(esc, 58, 1);
    for (const member of [ESC, ESC | 128, ESC + 256])
      expect(numeric(item, member, "sal_Int16")).toBe(esc);
    for (const member of [HEIGHT, HEIGHT | 128, HEIGHT + 256])
      expect(numeric(item, member, "sal_Int8")).toBe(58);
    expect(automatic(item)).toBe(esc === 14000 || esc === -14000);
  }
  const item = new Item(1),
    output = new Any([77], "sal_Int32"),
    value: [number] = [0];
  expect(item.QueryValue(output)).toBe(true);
  expect(item.QueryValue(output, 7)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(0);
  const untouched = new Any([77], "sal_Int32");
  expect(item.QueryValue(untouched, 7)).toBe(true);
  expect(untouched.extract(value, "sal_Int32")).toBe(true);
  expect(value[0]).toBe(77);
});
it("enforces native numeric property ranges and leaves values unchanged on rejected extraction", /** Tests literal inclusive boundaries and typed failures. @returns Nothing. */ () => {
  const item = new Item(12, 58, 1);
  for (const value of [-14000, -13999, 0, 13999, 14000]) {
    expect(item.PutValue(new Any([value], "sal_Int16"), ESC | 128)).toBe(true);
    expect(item.GetEsc()).toBe(value);
  }
  for (const value of [-32768, -14001, 14001, 32767]) {
    expect(item.PutValue(new Any([value], "sal_Int16"), ESC)).toBe(false);
    expect(item.GetEsc()).toBe(14000);
  }
  expect(item.PutValue(new Any([true], "bool"), ESC)).toBe(false);
  expect(item.PutValue(4, ESC)).toBe(false);
  for (const value of [1, 58, 100]) {
    expect(item.PutValue(new Any([value], "sal_Int8"), HEIGHT + 256)).toBe(true);
    expect(item.GetProportionalHeight()).toBe(value);
  }
  for (const value of [-128, -1, 0, 101, 127]) {
    expect(item.PutValue(new Any([value], "sal_Int8"), HEIGHT)).toBe(false);
    expect(item.GetProportionalHeight()).toBe(100);
  }
  expect(item.PutValue(new Any([true], "bool"), HEIGHT)).toBe(false);
  expect(item.PutValue(58, HEIGHT)).toBe(false);
  const before = item.Clone();
  expect(item.PutValue(new Any(), 7)).toBe(true);
  expect(item.equals(before)).toBe(true);
});
it("retains original automatic bool/int32 conversion, sign, height and marker-to-boundary transitions", /** CALC128 preserves surprising auto-off13999 rather than ordinary33/-8 offsets. @returns Nothing. */ () => {
  const item = new Item(0, 73, 1);
  expect(item.PutValue(new Any([true], "bool"), AUTO | 128)).toBe(true);
  expect([item.GetEsc(), item.GetProportionalHeight()]).toEqual([14000, 73]);
  expect(item.PutValue(new Any([false], "bool"), AUTO)).toBe(true);
  expect([item.GetEsc(), item.GetProportionalHeight()]).toEqual([13999, 73]);
  item.SetEsc(-8);
  expect(item.PutValue(new Any([-1], "sal_Int32"), AUTO)).toBe(true);
  expect([item.GetEsc(), item.GetProportionalHeight()]).toEqual([-14000, 73]);
  expect(item.PutValue(new Any([0], "sal_Int32"), AUTO)).toBe(true);
  expect(item.GetEsc()).toBe(-13999);
  item.SetEsc(33);
  expect(item.PutValue(new Any(), AUTO)).toBe(true);
  expect(item.GetEsc()).toBe(33);
  expect(item.PutValue(new Any([2], "sal_Int32"), AUTO + 256)).toBe(true);
  expect(item.GetEsc()).toBe(14000);
});

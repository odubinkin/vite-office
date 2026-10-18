/** @fileoverview Native posture and VCL slant mappings using actual common enum/Any owners. */
import { expect, it } from "vitest";
import { SvxPostureItem as Item } from "../../inc/postitem";
import { FontItalic as I } from "../../../tools/inc/fontenum";
import {
  FontSlant as S,
  cppu_detail_getUnoType_FontSlant as st,
} from "../../../offapi/com/sun/star/awt/FontSlant";
import { cppu_detail_getUnoType_CellOrientation as ot } from "../../../offapi/com/sun/star/table/CellOrientation";
import { ConvertFontSlant as convert } from "../../../vcl/inc/unohelp";
import { MID_ITALIC as BOOL, MID_POSTURE as POSTURE } from "../../inc/memberids";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { SfxItemPool } from "../../../svl/source/items/itempool";
/** Original forward enum mapping plus initialized unknown fallback. */
const forward = [
  [I.ITALIC_NONE, S.NONE],
  [I.ITALIC_OBLIQUE, S.OBLIQUE],
  [I.ITALIC_NORMAL, S.ITALIC],
  [I.ITALIC_DONTKNOW, S.DONTKNOW],
  [I.FontItalic_FORCE_EQUAL_SIZE, S.MAKE_FIXED_SIZE],
  [4 as I, S.DONTKNOW],
] as const;
/** Original reverse mapping includes reverse-style loss and sentinel. */
const reverse = [
  [S.NONE, I.ITALIC_NONE],
  [S.OBLIQUE, I.ITALIC_OBLIQUE],
  [S.ITALIC, I.ITALIC_NORMAL],
  [S.DONTKNOW, I.ITALIC_DONTKNOW],
  [S.REVERSE_OBLIQUE, I.ITALIC_OBLIQUE],
  [S.REVERSE_ITALIC, I.ITALIC_NORMAL],
  [S.MAKE_FIXED_SIZE, I.FontItalic_FORCE_EQUAL_SIZE],
  [6 as S, I.ITALIC_DONTKNOW],
] as const;
it("selects both original enum overload families without inferring type from the number", /** Covers every case and default initialized return. @returns Nothing. */ () => {
  expect([
    I.ITALIC_NONE,
    I.ITALIC_OBLIQUE,
    I.ITALIC_NORMAL,
    I.ITALIC_DONTKNOW,
    I.FontItalic_FORCE_EQUAL_SIZE,
    BOOL,
    POSTURE,
  ]).toEqual([0, 1, 2, 3, 2147483647, 0, 1]);
  for (const [from, to] of forward) expect(convert(from, "FontItalic")).toBe(to);
  for (const [from, to] of reverse) expect(convert(from, "FontSlant")).toBe(to);
});
it("uses real enum base copy Clone factory and original inclusive bool threshold", /** Uses the single original Tools enum. @returns Nothing. */ () => {
  const factory = Item.CreateDefault(),
    item = new Item(I.ITALIC_DONTKNOW, 103),
    copy = new Item(item),
    clone = item.Clone(new SfxItemPool());
  expect([factory.Which(), factory.GetValue(), copy.Which(), clone.Which()]).toEqual([
    0, 0, 103, 103,
  ]);
  expect(clone).not.toBe(item);
  expect(item.equals(copy)).toBe(true);
  copy.SetWhich(199);
  expect(item.equals(copy)).toBe(true);
  expect(item.HasBoolValue()).toBe(true);
  expect(item.GetBoolValue()).toBe(true);
  expect(item.supportsHashCode()).toBe(true);
  expect(item.hashCode()).toBe(103 ^ 3);
  item.SetBoolValue(false);
  expect(item.GetPosture()).toBe(I.ITALIC_NONE);
  expect(item.GetBoolValue()).toBe(false);
  item.SetBoolValue(true);
  expect(item.GetPosture()).toBe(I.ITALIC_NORMAL);
  expect(copy.GetPosture()).toBe(I.ITALIC_DONTKNOW);
  expect(item.equals(copy)).toBe(false);
  expect(item.QueryValue()).toBe(I.ITALIC_NORMAL);
  item.SetEnumValue(1);
  expect(item.GetValue()).toBe(I.ITALIC_OBLIQUE);
  expect(item.GetBoolValue()).toBe(true);
  expect(new Item(4 as I, 103).GetBoolValue()).toBe(true);
  expect(new Item(I.FontItalic_FORCE_EQUAL_SIZE, 103).GetValue()).toBe(2147483647);
  expect(
    /** Out-of-native-enum-range browser scalar. @returns No item. */ () =>
      new Item(2147483648 as I, 103),
  ).toThrow("value is invalid");
});
it("queries actual FontSlant ENUM type cold and warm plus bool member and unchanged unknown output", /** Uses existing CPPU type machinery, no fake metadata/generator. @returns Nothing. */ () => {
  const item = new Item(I.ITALIC_NONE, 103),
    out = new Any(true);
  for (const [value, expected] of forward) {
    item.SetValue(value);
    expect(item.QueryValue(out, POSTURE | 128)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.ENUM);
    expect(out.getValueType().equals(st())).toBe(true);
    const result: [number] = [-1];
    expect(out.extract(result, st)).toBe(true);
    expect(result[0]).toBe(expected);
  }
  expect(st()).toBe(st());
  item.SetValue(I.ITALIC_DONTKNOW);
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
it("updates from exact FontSlant enum or signed32 fallback with native reverse and unknown mappings", /** Every original conversion branch is exercised through actual item histories. @returns Nothing. */ () => {
  const item = new Item(I.ITALIC_NONE, 103);
  for (const [wire, value] of reverse) {
    const input = new Any([wire], st);
    expect(item.PutValue(input, POSTURE)).toBe(true);
    expect(item.GetPosture()).toBe(value);
    input.dispose();
    const long = new Any([wire], "sal_Int32");
    expect(item.PutValue(long, 129)).toBe(true);
    expect(item.GetValue()).toBe(value);
    long.dispose();
    expect(item.PutValue(wire, 257)).toBe(true);
    expect(item.GetValue()).toBe(value);
  }
});
it("retains failed numeric writes and common bool reset/native unknown-member success", /** Exact enum extraction rejects unrelated enum types. @returns Nothing. */ () => {
  const item = new Item(I.ITALIC_DONTKNOW, 103);
  for (const wrong of [new Any(true), new Any([0], ot)]) {
    expect(item.PutValue(wrong, POSTURE)).toBe(false);
    expect(item.GetValue()).toBe(3);
    wrong.dispose();
  }
  for (const wrong of [
    null,
    undefined,
    "1",
    true,
    {},
    [],
    NaN,
    Infinity,
    1.5,
    -2147483649,
    2147483648,
  ]) {
    expect(item.PutValue(wrong, POSTURE)).toBe(false);
    expect(item.GetValue()).toBe(3);
  }
  expect(item.PutValue(undefined, 2)).toBe(true);
  expect(item.GetValue()).toBe(3);
  expect(item.PutValue(true)).toBe(true);
  expect(item.GetValue()).toBe(2);
  expect(item.PutValue({}, BOOL)).toBe(true);
  expect(item.GetValue()).toBe(0);
  const long = new Any([-1], "sal_Int32");
  expect(item.PutValue(long, 128)).toBe(true);
  expect(item.GetValue()).toBe(2);
  long.dispose();
});

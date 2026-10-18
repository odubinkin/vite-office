/** @fileoverview Real ShadowFormat values, static metadata and existing Any compound transport. */
import { expect, it } from "vitest";
import {
  ShadowFormat as F,
  cppu_detail_getUnoType_ShadowFormat as formatType,
} from "./ShadowFormat";
import {
  ShadowLocation as L,
  cppu_detail_getUnoType_ShadowLocation as locationType,
} from "./ShadowLocation";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../../../udkapi/com/sun/star/uno/TypeClass";
it("preserves original defaults, signed fields, copies and memberwise equality", /** Ordinary JS cells only, no allocator or replacement type provider. @returns Nothing. */ () => {
  const blank = new F(),
    a = new F(L.BOTTOM_RIGHT, 65535, true, 0xffffffff),
    copy = new F(a);
  expect([blank.Location, blank.ShadowWidth, blank.IsTransparent, blank.Color]).toEqual([
    0,
    0,
    false,
    0,
  ]);
  expect([a.ShadowWidth, a.Color]).toEqual([-1, -1]);
  expect(copy.equals(a)).toBe(true);
  expect(copy.notEquals(a)).toBe(false);
  copy.Location = L.TOP_LEFT;
  expect(copy.equals(a)).toBe(false);
  copy.assign(a);
  copy.ShadowWidth = 12;
  expect(copy.equals(a)).toBe(false);
  copy.assign(a);
  copy.IsTransparent = false;
  expect(copy.equals(a)).toBe(false);
  copy.assign(a);
  copy.Color = 10;
  expect(copy.notEquals(a)).toBe(true);
  expect(copy.assign(a)).toBe(copy);
  expect(copy.get(0)).toBe(copy.get(0));
  copy.get(0)[0] = L.TOP_RIGHT;
  copy.get(4)[0] = 7;
  copy.get(6)[0] = false;
  copy.get(8)[0] = 3;
  expect([copy.Location, copy.ShadowWidth, copy.IsTransparent, copy.Color]).toEqual([
    2,
    7,
    false,
    3,
  ]);
  expect([a.Location, a.ShadowWidth, a.IsTransparent, a.Color]).toEqual([4, -1, true, -1]);
});
it("binds actual cold/warm enum and struct metadata and independently copies all Any fields", /** Uses the real CPPU metadata and Any implementation. @returns Nothing. */ () => {
  expect(locationType()).toBe(locationType());
  expect(formatType()).toBe(formatType());
  expect([
    L.NONE,
    L.TOP_LEFT,
    L.TOP_RIGHT,
    L.BOTTOM_LEFT,
    L.BOTTOM_RIGHT,
    L.MAKE_FIXED_SIZE,
  ]).toEqual([0, 1, 2, 3, 4, 2147483647]);
  const source = new F(L.BOTTOM_LEFT, 100, true, 0x80112233),
    any = new Any(source, formatType),
    out = new F();
  try {
    expect(any.getValueTypeClass()).toBe(TypeClass.STRUCT);
    expect(any.getValueType().equals(formatType())).toBe(true);
    source.Color = 0;
    expect(any.extract(out, formatType)).toBe(true);
    expect([out.Location, out.ShadowWidth, out.IsTransparent, out.Color]).toEqual([
      3,
      100,
      true,
      -2146360781,
    ]);
    out.Color = 7;
    const second = new F();
    expect(any.extract(second, formatType)).toBe(true);
    expect(second.Color).toBe(-2146360781);
  } finally {
    any.dispose();
  }
});

/** @fileoverview Native line struct values, inheritance and actual CPPU Any metadata/copy paths. */
import { expect, it } from "vitest";
import { BorderLine as Base, cppu_detail_getUnoType_BorderLine as baseType } from "./BorderLine";
import {
  BorderLine2 as Derived,
  cppu_detail_getUnoType_BorderLine2 as derivedType,
} from "./BorderLine2";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import {
  typelib_typedescription_release,
  type typelib_TypeDescription as D,
} from "../../../../../cppu/inc/typelib/typedescription";
it("preserves original field defaults, casts, copying, assignment and nonvirtual equality", /** Valid scalar values only; no binary buffer or provider. @returns Nothing. */ () => {
  const zero = new Base(),
    a = new Base(0xffffffff, 65535, 32768, 65537),
    b = new Base(a);
  expect([zero.Color, zero.InnerLineWidth, zero.OuterLineWidth, zero.LineDistance]).toEqual([
    0, 0, 0, 0,
  ]);
  expect([a.Color, a.InnerLineWidth, a.OuterLineWidth, a.LineDistance]).toEqual([
    -1, -1, -32768, 1,
  ]);
  expect(b.equals(a)).toBe(true);
  expect(b.notEquals(a)).toBe(false);
  for (const offset of [0, 4, 6, 8]) {
    expect(b.get(offset)).toBe(b.get(offset));
    b.get(offset)[0] = 7;
    expect(b.equals(a)).toBe(false);
    expect(b.assign(a)).toBe(b);
  }
  const d = new Derived(),
    value = new Derived(0x123456, 1, 2, 3, 65535, -1),
    copy = new Derived(value);
  expect([
    d.Color,
    d.InnerLineWidth,
    d.OuterLineWidth,
    d.LineDistance,
    d.LineStyle,
    d.LineWidth,
  ]).toEqual([0, 0, 0, 0, 0, 0]);
  expect([value.LineStyle, value.LineWidth]).toEqual([-1, 4294967295]);
  expect(copy instanceof Base).toBe(true);
  expect(copy.equals(value)).toBe(true);
  expect(copy.notEquals(value)).toBe(false);
  copy.Color = 9;
  expect(copy.equals(value)).toBe(false);
  copy.assign(value);
  copy.LineStyle = 3;
  expect(copy.equals(value)).toBe(false);
  expect(Base.prototype.notEquals.call(copy, value)).toBe(false);
  copy.assign(value);
  copy.LineWidth = 4;
  expect(copy.notEquals(value)).toBe(true);
  expect(copy.assign(value)).toBe(copy);
  for (const offset of [0, 4, 6, 8, 12, 16]) {
    expect(copy.get(offset)).toBe(copy.get(offset));
    copy.get(offset)[0] = 8;
    expect(copy.equals(value)).toBe(false);
    copy.assign(value);
  }
});
it("uses actual static base metadata and copies inherited/derived fields through Any", /** Original typelib base size and cppumaker alignment determine the logical member lvalues. @returns Nothing. */ () => {
  expect(baseType()).toBe(baseType());
  expect(derivedType()).toBe(derivedType());
  const base: [D | null] = [null],
    derived: [D | null] = [null];
  baseType().getDescription(base);
  derivedType().getDescription(derived);
  try {
    expect(base[0]?.nSize).toBe(12);
    expect(derived[0]?.nSize).toBe(20);
  } finally {
    if (base[0] !== null) typelib_typedescription_release(base[0]);
    if (derived[0] !== null) typelib_typedescription_release(derived[0]);
  }
  const source = new Derived(0x80112233, 1, 2, 3, 15, 90),
    any = new Any(source, derivedType),
    out = new Derived(),
    sliced = new Base();
  try {
    source.Color = 0;
    expect(any.extract(out, derivedType)).toBe(true);
    expect([
      out.Color,
      out.InnerLineWidth,
      out.OuterLineWidth,
      out.LineDistance,
      out.LineStyle,
      out.LineWidth,
    ]).toEqual([-2146360781, 1, 2, 3, 15, 90]);
    expect(any.extract(sliced, baseType)).toBe(true);
    expect([
      sliced.Color,
      sliced.InnerLineWidth,
      sliced.OuterLineWidth,
      sliced.LineDistance,
    ]).toEqual([-2146360781, 1, 2, 3]);
    out.LineStyle = 1;
    const second = new Derived();
    expect(any.extract(second, derivedType)).toBe(true);
    expect(second.LineStyle).toBe(15);
  } finally {
    any.dispose();
  }
  const legacy = new Any(new Base(7, 8, 9, 10), baseType),
    target = new Base();
  try {
    expect(legacy.extract(target, baseType)).toBe(true);
    expect([
      target.Color,
      target.InnerLineWidth,
      target.OuterLineWidth,
      target.LineDistance,
    ]).toEqual([7, 8, 9, 10]);
    expect(legacy.extract(new Derived(), derivedType)).toBe(false);
  } finally {
    legacy.dispose();
  }
});

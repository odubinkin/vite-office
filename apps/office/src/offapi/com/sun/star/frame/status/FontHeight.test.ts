/** @fileoverview Actual FontHeight IDL values, stable primitive lvalues and real Any struct binding. */
import { expect, it } from "vitest";
import { FontHeight as H, cppu_detail_getUnoType_FontHeight as type } from "./FontHeight";
import { Any } from "../../../../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../../../../udkapi/com/sun/star/uno/TypeClass";
it("uses original zero defaults copy field assignments and ordered equality", /** Ordinary JS values/cells only, no allocator. @returns Nothing. */ () => {
  const a = new H(),
    b = new H(12.3, 65535, 0.1),
    c = new H(b);
  expect([a.Height, a.Prop, a.Diff]).toEqual([0, 0, 0]);
  expect(b.Prop).toBe(-1);
  expect(b.Height).toBe(Math.fround(12.3));
  expect(b.Diff).toBe(Math.fround(0.1));
  expect(c.equals(b)).toBe(true);
  expect(c.notEquals(b)).toBe(false);
  c.Height = 13;
  expect(c.equals(b)).toBe(false);
  expect(c.assign(b)).toBe(c);
  c.Prop = 100;
  expect(c.equals(b)).toBe(false);
  c.assign(b);
  c.Diff = 2;
  expect(c.notEquals(b)).toBe(true);
  c.get(0)[0] = 14;
  c.get(4)[0] = 99;
  c.get(8)[0] = 3;
  expect([c.Height, c.Prop, c.Diff]).toEqual([14, 99, 3]);
  expect(c.get(0)).toBe(c.get(0));
});
it("binds the actual cold and warm static type and copies native struct fields through real Any", /** Existing shared normal struct initializer supplies type metadata. @returns Nothing. */ () => {
  const t = type();
  expect(type()).toBe(t);
  const source = new H(12.5, 125, 2),
    any = new Any(source, type),
    out = new H();
  try {
    expect(any.getValueTypeClass()).toBe(TypeClass.STRUCT);
    expect(any.getValueType().equals(t)).toBe(true);
    source.Height = 50;
    expect(any.extract(out, type)).toBe(true);
    expect([out.Height, out.Prop, out.Diff]).toEqual([12.5, 125, 2]);
    out.Height = 24;
    const second = new H();
    expect(any.extract(second, type)).toBe(true);
    expect(second.Height).toBe(12.5);
  } finally {
    any.dispose();
  }
});

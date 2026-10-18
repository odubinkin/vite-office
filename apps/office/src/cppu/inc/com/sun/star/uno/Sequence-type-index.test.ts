/** @fileoverview Verifies native Sequence<Type> const element methods and live borrowed aliasing through the existing Type view, storage and C assignment owners. */
import { expect, expectTypeOf, it } from "vitest";
import { Sequence, type SequenceElements } from "./Sequence";
import { Type } from "./Type";
import { UnoType } from "../../../../unotype";
import {
  typelib_typedescriptionreference_assign,
  type typelib_TypeDescriptionReference as R,
} from "../../../../typelib/typedescription";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";

it("returns the actual borrowed Type methods without copying or acquiring the element", /** Repeated indexing aliases the native element; sharing and COW preserve native cell identity. @returns Nothing. */ () => {
  const Types = Sequence.specialize<Type>("Type", 8),
    values = new Types(1),
    shared = new Types(values),
    cell = (values.getConstArray() as SequenceElements).get(0) as [R | null],
    original = cell[0] as R,
    before = original.nRefCount,
    view = values.operatorIndex(0);
  expectTypeOf(view).toEqualTypeOf<Type>();
  expect(view).toBeInstanceOf(Type);
  expect(view.getTypeClass()).toBe(C.VOID);
  expect(view.getTypeLibType()).toBe(original);
  expect(values.operatorIndex(0)).toBe(view);
  expect(shared.operatorIndex(0)).toBe(view);
  expect(original.nRefCount).toBe(before);
  const name = view.getTypeName();
  expect(String.fromCharCode(...name.getStr().subarray(0, name.getLength()))).toBe("void");
  name.dispose();

  shared.getArray();
  expect(shared.operatorIndex(0)).not.toBe(view);
  expect(shared.operatorIndex(0).operatorEqual(view)).toBe(true);
  const integer = UnoType.get("sal_Int32");
  typelib_typedescriptionreference_assign(cell, integer.getTypeLibType());
  expect(values.operatorIndex(0)).toBe(view);
  expect(view.getTypeClass()).toBe(C.LONG);
  expect(view.getTypeLibType()).toBe(integer.getTypeLibType());
  expect(shared.operatorIndex(0).getTypeClass()).toBe(C.VOID);

  const held = new Type(view);
  values.realloc(0);
  // Borrowed element lifetime ends with its storage; the explicit Type copy still owns its value.
  expect(held.operatorEqual(integer)).toBe(true);
  shared.dispose();
  values.dispose();
  expect(held.getTypeClass()).toBe(C.LONG);
  held.dispose();
});

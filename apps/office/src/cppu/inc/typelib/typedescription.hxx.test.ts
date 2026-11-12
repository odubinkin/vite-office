/** @fileoverview Actual original public TypeDescription ownership and registry resolution, without a mock type provider or environment. */
import { afterEach, expect, it } from "vitest";
import { TypeDescription } from "./typedescription.hxx";
import { UnoType } from "../unotype";
import { own, u, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
it("resolves Type, reference, name and description pointers with exact original copy ownership", /** All constructors consume genuine shared typelib records. @returns Nothing. */ () => {
  const type = UnoType.get("sal_Int32"),
    a = own(new TypeDescription(type)),
    pointer = a.get();
  expect(pointer).not.toBe(null);
  if (!pointer) return;
  const count = pointer.nRefCount;
  const b = own(new TypeDescription(pointer)),
    c = own(new TypeDescription(type.getTypeLibType())),
    d = own(new TypeDescription(a)),
    e = own(new TypeDescription(u("long"))),
    f = own(new TypeDescription(u("long").pData));
  expect(pointer.nRefCount).toBe(count + 5);
  for (const item of [b, c, d, e, f]) expect(item.equals(a)).toBe(true);
  a.assign(a);
  expect(pointer.nRefCount).toBe(count + 5);
  a.makeComplete();
  expect(a.get()).toBe(pointer);
});
it("preserves null inequality, move transfer, move assignment and cleared-source ownership", /** Source empty wrapper is valid; no undefined reference pointer is fabricated. @returns Nothing. */ () => {
  const empty = own(new TypeDescription()),
    a = own(new TypeDescription(UnoType.get("double"))),
    pointer = a.get(),
    b = own(TypeDescription.move(a));
  expect(empty.equals(empty)).toBe(false);
  expect(empty.is()).toBe(false);
  empty.makeComplete();
  expect(a.is()).toBe(false);
  expect(b.get()).toBe(pointer);
  empty.moveAssign(b);
  expect(empty.get()).toBe(pointer);
  expect(b.is()).toBe(false);
  empty.assign(null);
  expect(empty.is()).toBe(false);
  const missing = own(new TypeDescription(u("missing.TypeDescription")));
  expect(missing.is()).toBe(false);
});

/** @fileoverview Original OTypeCollection constructor order, default tail, implicit copies and actual UNO Type Sequence value ownership. */
import { expect, it } from "vitest";
import { OTypeCollection } from "../inc/typeprovider";
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType } from "../../cppu/inc/unotype";
import {
  typelib_typedescriptionreference_assign,
  type typelib_TypeDescriptionReference as R,
} from "../../cppu/inc/typelib/typedescription";
import { XInputStream } from "../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../udkapi/com/sun/star/io/XOutputStream";
const Types = Sequence.specialize<Type>("Type", 8);
const cases = Array.from(
  { length: 12 },
  /** Original overload arity. @param unused - Unused initializer. @param index - Arity index. @returns Both tail variants. */ (
    _unused,
    index,
  ) =>
    [
      [index + 1, false],
      [index + 1, true],
    ] as const,
).flat();
it.each(cases)(
  "retains original %i-type overload with supplied-tail=%s",
  /** Preserves order, scalar types and duplicates without adding a type provider or root. @param count - Original leading arity. @param supplied - Original tail overload. @returns Nothing. */ (
    count,
    supplied,
  ) => {
    const available = [
        XInputStream.static_type(),
        UnoType.get("sal_Int32"),
        XOutputStream.static_type(),
      ],
      leading = Array.from(
        { length: count },
        /** Repeats declared actual types. @param unused - Unused initializer. @param index - Position. @returns Borrowed native Type. */ (
          _unused,
          index,
        ) => available[index % 3] as Type,
      ),
      tail = new Types(2),
      fields = tail.getArray() as ReadonlyMap<number, [R | null]>;
    typelib_typedescriptionreference_assign(
      fields.get(0) as [R | null],
      XInputStream.static_type().getTypeLibType(),
    );
    typelib_typedescriptionreference_assign(
      fields.get(8) as [R | null],
      UnoType.get("void").getTypeLibType(),
    );
    const args = supplied ? [...leading, tail] : leading,
      collection = new OTypeCollection(...(args as ConstructorParameters<typeof OTypeCollection>)),
      result = collection.getTypes();
    collection.dispose();
    tail.dispose();
    try {
      const expected = supplied
        ? [...leading, XInputStream.static_type(), UnoType.get("void")]
        : leading;
      expect(result.getLength()).toBe(expected.length);
      for (let i = 0; i < expected.length; ++i)
        expect(result.operatorIndex(i).equals(expected[i] as Type)).toBe(true);
    } finally {
      result.dispose();
    }
  },
);
it("retains genuine copy-on-write sequences through collection copy, assignment and destruction", /** Source getTypes is a value return with actual native shared Sequence ownership. @returns Nothing. */ () => {
  const first = new OTypeCollection(XInputStream.static_type()),
    copy = new OTypeCollection(first),
    assigned = new OTypeCollection(XOutputStream.static_type());
  assigned.assign(copy);
  assigned.assign(assigned);
  const left = first.getTypes(),
    right = copy.getTypes(),
    again = assigned.getTypes();
  first.dispose();
  copy.dispose();
  assigned.dispose();
  try {
    expect(left.getAddress()[0]).toBe(right.getAddress()[0]);
    const fields = left.getArray() as ReadonlyMap<number, [R | null]>;
    typelib_typedescriptionreference_assign(
      fields.get(0) as [R | null],
      XOutputStream.static_type().getTypeLibType(),
    );
    expect(left.getAddress()[0]).not.toBe(right.getAddress()[0]);
    expect(left.operatorIndex(0).equals(XOutputStream.static_type())).toBe(true);
    expect(right.operatorIndex(0).equals(XInputStream.static_type())).toBe(true);
    expect(again.operatorIndex(0).equals(XInputStream.static_type())).toBe(true);
  } finally {
    again.dispose();
    right.dispose();
    left.dispose();
  }
});

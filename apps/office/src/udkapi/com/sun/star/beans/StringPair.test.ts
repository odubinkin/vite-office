/** @fileoverview Verifies actual StringPair value/type/aggregate ownership and complete relationship SDK metadata without a replacement storage or relationship service. */
import type { typelib_TypeDescriptionReference as R } from "../../../../../cppu/inc/typelib/typedescription";
import { expect, it } from "vitest";
import { StringPair, cppu_detail_getUnoType_StringPair as pairType } from "./StringPair";
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { uno_type_assignData } from "../../../../../cppu/inc/uno/data";
import {
  cpp_acquire,
  cpp_release,
  cpp_queryInterface,
} from "../../../../../cppu/inc/com/sun/star/uno/genfunc";
import {
  XRelationshipAccess,
  cppu_detail_getUnoType as relationType,
  getCppuType,
} from "../../../../../offapi/com/sun/star/embed/XRelationshipAccess";
/** Creates a genuine string including exact UTF16 units. @param value - Text. @returns Owner. */
function string(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Literal unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}
/** Observes a borrowed actual string. @param value - Const string. @returns Same UTF16 text. */
function text(value: OUStringConstReference): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}
it("preserves default, full-field, copy, assignment and field equality semantics", /** Original member owners remain stable across assignment. @returns Nothing. */ () => {
  const first = string("Id"),
    second = string("rId1"),
    other = string("Target"),
    value = new StringPair(first, second),
    copy = new StringPair(value),
    empty = new StringPair(),
    changed = new StringPair(first, other);
  try {
    expect(empty.First.isEmpty()).toBe(true);
    expect(empty.Second.isEmpty()).toBe(true);
    expect(copy.equals(value)).toBe(true);
    expect(empty.notEquals(value)).toBe(true);
    expect(changed.notEquals(value)).toBe(true);
    const field = empty.First;
    empty.assign(value);
    expect(empty.First).toBe(field);
    expect(empty.equals(value)).toBe(true);
    empty.assign(empty);
    expect(text(empty.Second)).toBe("rId1");
    changed.First = other;
    changed.Second = first;
    expect(text(changed.First)).toBe("Target");
    expect(text(changed.Second)).toBe("Id");
    expect(value.get(0)).toBe(value.First.getDataAddress());
    expect(value.get(8)).toBe(value.Second.getDataAddress());
  } finally {
    changed.dispose();
    empty.dispose();
    copy.dispose();
    value.dispose();
    other.dispose();
    second.dispose();
    first.dispose();
  }
});
it("uses the actual memberwise move operations and leaves destructible empty source fields", /** No replacement strings or default-value provider is involved. @returns Nothing. */ () => {
  const first = string("Type"),
    second = string("urn:test"),
    source = new StringPair(first, second),
    moved = StringPair.move(source),
    target = new StringPair();
  try {
    expect(source.First.isEmpty()).toBe(true);
    expect(source.Second.isEmpty()).toBe(true);
    target.moveAssign(moved);
    expect(text(target.First)).toBe("Type");
    expect(text(target.Second)).toBe("urn:test");
    expect(moved.First.isEmpty()).toBe(true);
    expect(moved.Second.isEmpty()).toBe(true);
  } finally {
    target.dispose();
    moved.dispose();
    source.dispose();
    second.dispose();
    first.dispose();
  }
});
it("copies genuine aggregate fields through UNO Any and borrows the existing field addresses", /** The normal shared struct factory and real compound copy engine own the strings. @returns Nothing. */ () => {
  const first = string("Target"),
    second = string("folder/😀.xml"),
    source = new StringPair(first, second),
    any = new Any(source, pairType),
    dest = new StringPair();
  try {
    expect(pairType()).toBe(pairType());
    expect(any.extract(dest, pairType)).toBe(true);
    expect(dest.equals(source)).toBe(true);
    const view = StringPair.unacquired(any.pData as SequenceElements);
    expect(StringPair.unacquired(any.pData as SequenceElements)).toBe(view);
    expect(text(view.First)).toBe("Target");
    expect(text(view.Second)).toBe("folder/😀.xml");
    source.First = second;
    expect(text(view.First)).toBe("Target");
  } finally {
    dest.dispose();
    any.dispose();
    source.dispose();
    second.dispose();
    first.dispose();
  }
});
it("preserves real initialized struct Sequence COW and const reference views", /** Actual CPPU assignment and storage are used instead of typed-record fixtures. @returns Nothing. */ () => {
  const Pairs = Sequence.specialize<StringPair>(pairType, 16),
    first = string("Id"),
    second = string("one"),
    replacement = string("two"),
    value = new StringPair(first, second),
    changed = new StringPair(first, replacement),
    sequence = new Pairs(1),
    type = pairType().getTypeLibType() as R;
  /** Assigns actual generated source fields with the shared compound owner. @param target - Actual initialized aggregate. @param pair - Original value. @returns Nothing. */
  function assign(target: unknown, pair: StringPair): void {
    expect(
      uno_type_assignData(target, type, pair, type, cpp_queryInterface, cpp_acquire, cpp_release),
    ).toBe(true);
  }
  assign((sequence.getArray() as SequenceElements).get(0), value);
  const copy = new Pairs(sequence),
    view = StringPair.unacquired(
      (sequence.getConstArray() as SequenceElements).get(0) as SequenceElements,
    );
  try {
    assign((copy.getArray() as SequenceElements).get(0), changed);
    expect(text(view.Second)).toBe("one");
    expect(
      text(
        StringPair.unacquired((copy.getConstArray() as SequenceElements).get(0) as SequenceElements)
          .Second,
      ),
    ).toBe("two");
  } finally {
    copy.dispose();
    sequence.dispose();
    changed.dispose();
    value.dispose();
    replacement.dispose();
    second.dispose();
    first.dispose();
  }
});
it("uses the original cached relationship interface root without instantiating a service", /** SDK declaration/type identity alone does not certify a storage implementation. @returns Nothing. */ () => {
  expect(relationType()).toBe(relationType());
  expect(getCppuType().equals(XRelationshipAccess.static_type())).toBe(true);
  expect(getCppuType(null).equals(XRelationshipAccess.static_type(null))).toBe(true);
  const empty = new Reference<XRelationshipAccess>(),
    query = empty.query(XRelationshipAccess.static_type);
  try {
    expect(query.is()).toBe(false);
  } finally {
    query.dispose();
    empty.dispose();
  }
});

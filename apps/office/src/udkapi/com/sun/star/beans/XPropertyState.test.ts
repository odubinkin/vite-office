/** @fileoverview Original XPropertyState generated type contract and real PropertyState sequence/Any ownership; no service provider is fabricated. */
import { expect, it } from "vitest";
import { XPropertyState, cppu_detail_getUnoType, getCppuType } from "./XPropertyState";
import { PropertyState, cppu_detail_getUnoType_PropertyState as stateType } from "./PropertyState";
import { TypeClass } from "../uno/TypeClass";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OWeakObject } from "../../../../../cppuhelper/source/weak";
import { Sequence, type SequenceElements } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { text } from "../../../../../sw/source/core/unocore/unocrsrhelper";
it("retains original cached normal and deprecated interface type getters", /** No fake component supplies the declared type. @returns Nothing. */ () => {
  const reference = new Reference<XPropertyState>(),
    type = cppu_detail_getUnoType(),
    name = type.getTypeName();
  try {
    expect(type.getTypeClass()).toBe(TypeClass.INTERFACE);
    expect(text(name)).toBe("com.sun.star.beans.XPropertyState");
    for (const value of [
      cppu_detail_getUnoType(),
      getCppuType(),
      getCppuType(reference),
      XPropertyState.static_type(),
      XPropertyState.static_type(null),
    ])
      expect(value.getTypeLibType()).toBe(type.getTypeLibType());
  } finally {
    name.dispose();
    reference.dispose();
  }
});
it("uses actual native query failure for a real weak owner which does not implement property state", /** Declaring the SDK interface does not register a substitute service or invent successful queries. @returns Nothing. */ () => {
  const object = new OWeakObject(),
    strong = new Reference(object),
    queried = new Reference<XPropertyState>(strong, UNO_QUERY, XPropertyState.static_type);
  try {
    expect(queried.is()).toBe(false);
    try {
      new Reference<XPropertyState>(strong, UNO_QUERY_THROW, XPropertyState.static_type);
      throw new Error("Expected original query failure");
    } catch (error) {
      if (!(error instanceof RuntimeException)) throw error;
      try {
        expect(text(error.Message)).toContain("XPropertyState");
      } finally {
        error.dispose();
      }
    }
  } finally {
    queried.dispose();
    strong.dispose();
  }
});
it("transports correlated PropertyState sequence values through real Any and native COW", /** Explicit scalar lvalues bind the erased C++ caller addresses, never a JS array posing as a UNO sequence. @returns Nothing. */ () => {
  const States = Sequence.specialize<PropertyState>(stateType, 4),
    states = new States(
      new Map([
        [0, [PropertyState.DIRECT_VALUE]],
        [4, [PropertyState.DEFAULT_VALUE]],
        [8, [PropertyState.AMBIGUOUS_VALUE]],
      ]),
      3,
    ),
    value = new Any(states.getAddress(), ["Sequence", stateType]),
    copied = new States();
  try {
    expect(value.extract(copied.getAddress(), ["Sequence", stateType])).toBe(true);
    expect(copied.get()).toBe(states.get());
    const writable = copied.getArray() as SequenceElements;
    (writable.get(4) as [PropertyState])[0] = PropertyState.DIRECT_VALUE;
    expect(copied.get()).not.toBe(states.get());
    expect(((states.getConstArray() as SequenceElements).get(4) as [PropertyState])[0]).toBe(
      PropertyState.DEFAULT_VALUE,
    );
    expect((writable.get(8) as [PropertyState])[0]).toBe(PropertyState.AMBIGUOUS_VALUE);
  } finally {
    copied.dispose();
    value.dispose();
    states.dispose();
  }
});

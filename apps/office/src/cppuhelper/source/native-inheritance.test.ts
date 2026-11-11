/** @fileoverview Actual ImplInheritanceHelper specialization identity, nested qualified base calls and source type concatenation over genuine SequenceInputStream. */
import { expect, it } from "vitest";
import { ImplInheritanceHelper } from "../inc/implbase";
import { SequenceInputStream } from "../../comphelper/source/streaming/seqstream";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { UnoType } from "../../cppu/inc/unotype";
import { XInputStream } from "../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../udkapi/com/sun/star/io/XSeekable";
import { XTypeProvider } from "../../udkapi/com/sun/star/lang/XTypeProvider";
import { XComponent } from "../../udkapi/com/sun/star/lang/XComponent";
import { nativeText } from "../../test/ofopxml-values";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
it("keeps each specialization's class data distinct across qualified base and nested inheritance calls", /** No interface/method provider is manufactured: SequenceInputStream already implements all additionally declared methods. @returns Nothing. */ () => {
  const Base = ImplInheritanceHelper.specialize(SequenceInputStream, XInputStream),
    Nested = ImplInheritanceHelper.specialize(Base, XSeekable),
    Empty = ImplInheritanceHelper.specialize(Base);
  expect(ImplInheritanceHelper.specialize(SequenceInputStream, XInputStream)).toBe(Base);
  expect(ImplInheritanceHelper.specialize(Base, XSeekable)).toBe(Nested);
  expect(ImplInheritanceHelper.specialize(SequenceInputStream, XSeekable)).not.toBe(Base);
  expect(ImplInheritanceHelper.specialize(SequenceInputStream, XInputStream, XSeekable)).not.toBe(
    Base,
  );
  const data = new Bytes(3),
    owner = new Reference(new Nested(data)),
    empty = new Reference(new Empty(data)),
    value = owner.get() as SequenceInputStream;
  data.dispose();
  try {
    for (const type of [
      XInputStream.static_type(),
      XSeekable.static_type(),
      XTypeProvider.static_type(),
      UnoType.get("XInterface"),
    ]) {
      const query = value.queryInterface(type);
      expect(query.pReserved).toBe(value);
      query.dispose();
    }
    const missing = value.queryInterface(XComponent.static_type());
    expect(missing.hasValue()).toBe(false);
    missing.dispose();
    const types = value.getTypes(),
      names: string[] = [];
    try {
      for (let i = 0; i < types.getLength(); ++i) {
        const name = types.operatorIndex(i).getTypeName();
        try {
          names.push(nativeText(name));
        } finally {
          name.dispose();
        }
      }
      expect(names).toEqual([
        "com.sun.star.io.XSeekable",
        "com.sun.star.lang.XTypeProvider",
        "com.sun.star.io.XInputStream",
        "com.sun.star.lang.XTypeProvider",
        "com.sun.star.io.XInputStream",
        "com.sun.star.io.XSeekable",
        "com.sun.star.lang.XTypeProvider",
        "com.sun.star.uno.XWeak",
      ]);
    } finally {
      types.dispose();
    }
    const id = value.getImplementationId(),
      emptyTypes = (empty.get() as SequenceInputStream).getTypes();
    expect(id.getLength()).toBe(0);
    expect(emptyTypes.getLength()).toBe(7);
    id.dispose();
    emptyTypes.dispose();
  } finally {
    empty.dispose();
    owner.dispose();
  }
});

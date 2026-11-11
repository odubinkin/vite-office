/** @fileoverview Source storage SDK bases, normal generated type owners and actual wrapped exception values; no storage service or partial query provider is fabricated. */
import { expect, expectTypeOf, it } from "vitest";
import {
  XStorage,
  cppu_detail_getUnoType as storageType,
  getCppuType as storagePointerType,
} from "../../../offapi/com/sun/star/embed/XStorage";
import {
  XStorage2,
  cppu_detail_getUnoType as storage2Type,
  getCppuType as storage2PointerType,
} from "../../../offapi/com/sun/star/embed/XStorage2";
import {
  XHierarchicalStorageAccess,
  cppu_detail_getUnoType as hierarchyType,
  getCppuType as hierarchyPointerType,
} from "../../../offapi/com/sun/star/embed/XHierarchicalStorageAccess";
import {
  XHierarchicalStorageAccess2,
  cppu_detail_getUnoType as hierarchy2Type,
  getCppuType as hierarchy2PointerType,
} from "../../../offapi/com/sun/star/embed/XHierarchicalStorageAccess2";
import { XNameAccess } from "../../../cppu/inc/com/sun/star/container/XNameAccess";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { UnoType } from "../../../cppu/inc/unotype";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XTransactedObject } from "../../../offapi/com/sun/star/embed/XTransactedObject";
import {
  InvalidStorageException,
  getCppuType as invalidType,
} from "../../../offapi/com/sun/star/embed/InvalidStorageException";
import {
  StorageWrappedTargetException,
  getCppuType as wrappedType,
} from "../../../offapi/com/sun/star/embed/StorageWrappedTargetException";
import { IOException, getCppuType as ioType } from "../../../cppu/inc/com/sun/star/io/IOException";
import {
  WrappedTargetException,
  getCppuType as wrappedBaseType,
} from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { NamedValue } from "../../../udkapi/com/sun/star/beans/NamedValue";
import type { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import type { XExtendedStorageStream } from "../../../offapi/com/sun/star/embed/XExtendedStorageStream";
/** Actual borrowed UTF16 observation. @param value - Native value. @returns Text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Counted native message. @returns Owner. */
function message(): OUString {
  return new OUString(Uint16Array.of(115, 116, 111, 114, 101), 5);
}
it.each([
  ["XStorage", XStorage, storageType, storagePointerType],
  ["XStorage2", XStorage2, storage2Type, storage2PointerType],
  ["XHierarchicalStorageAccess", XHierarchicalStorageAccess, hierarchyType, hierarchyPointerType],
  [
    "XHierarchicalStorageAccess2",
    XHierarchicalStorageAccess2,
    hierarchy2Type,
    hierarchy2PointerType,
  ],
] as const)(
  "keeps %s source name and all generated getter paths",
  /** Type getters receive a genuine empty reference; no fake component implements a declared storage interface. @param name - Source identity. @param api - Source static API. @param getter - Generated getter. @param pointer - Deprecated getter. @returns Nothing. */ (
    name,
    api,
    getter,
    pointer,
  ) => {
    const value = api.static_type(),
      typeName = value.getTypeName();
    try {
      expect(text(typeName)).toBe("com.sun.star.embed." + name);
      expect(getter().equals(value)).toBe(true);
      expect(pointer(null).equals(value)).toBe(true);
      expect(pointer().equals(value)).toBe(true);
      expect(api.static_type(null).equals(value)).toBe(true);
      expect(value.getTypeLibType()).toBe(getter().getTypeLibType());
    } finally {
      typeName.dispose();
    }
  },
);
it("keeps XStorage two required bases and both extension chains without adding optional bases", /** Real native type assignability traverses the actual registered multiple-base graph. @returns Nothing. */ () => {
  const base = XStorage.static_type(),
    extended = XStorage2.static_type(),
    hierarchical = XHierarchicalStorageAccess.static_type(),
    hierarchical2 = XHierarchicalStorageAccess2.static_type();
  for (const type of [base, extended]) {
    expect(XNameAccess.static_type().isAssignableFrom(type)).toBe(true);
    expect(XComponent.static_type().isAssignableFrom(type)).toBe(true);
    expect(XPropertySet.static_type().isAssignableFrom(type)).toBe(false);
    expect(XTransactedObject.static_type().isAssignableFrom(type)).toBe(false);
  }
  expect(base.isAssignableFrom(extended)).toBe(true);
  expect(extended.isAssignableFrom(base)).toBe(false);
  expect(hierarchical.isAssignableFrom(hierarchical2)).toBe(true);
  expect(hierarchical2.isAssignableFrom(hierarchical)).toBe(false);
  expect(XComponent.static_type().isAssignableFrom(hierarchical)).toBe(false);
  expect(base.isAssignableFrom(hierarchical2)).toBe(false);
  expect(UnoType.get("XInterface").isAssignableFrom(hierarchical2)).toBe(true);
});
it("retains declared native return/argument contracts without a storage stand-in", /** Compile-time checks follow the original IDL ownership and sequence types, not a fabricated service implementation. @returns Nothing. */ () => {
  expectTypeOf<XStorage["openStreamElement"]>().toEqualTypeOf<
    (name: OUStringConstReference, mode: number) => Reference<XStream>
  >();
  expectTypeOf<XStorage["openStorageElement"]>().toEqualTypeOf<
    (name: OUStringConstReference, mode: number) => Reference<XStorage>
  >();
  expectTypeOf<XStorage["copyElementTo"]>().toEqualTypeOf<
    (
      name: OUStringConstReference,
      destination: Reference<XStorage>,
      newName: OUStringConstReference,
    ) => void
  >();
  expectTypeOf<XStorage2["openEncryptedStream"]>().toEqualTypeOf<
    (
      name: OUStringConstReference,
      mode: number,
      encryption: Sequence<NamedValue>,
    ) => Reference<XStream>
  >();
  expectTypeOf<XHierarchicalStorageAccess["openStreamElementByHierarchicalName"]>().toEqualTypeOf<
    (path: OUStringConstReference, mode: number) => Reference<XExtendedStorageStream>
  >();
  expectTypeOf<
    XHierarchicalStorageAccess2["openEncryptedStreamByHierarchicalName"]
  >().toEqualTypeOf<
    (
      path: OUStringConstReference,
      mode: number,
      encryption: Sequence<NamedValue>,
    ) => Reference<XExtendedStorageStream>
  >();
});
it("keeps InvalidStorageException actual IOException inheritance, constructors, move and assignment", /** All values are actual generated native exception/string/reference owners. @returns Nothing. */ () => {
  const empty = new InvalidStorageException(),
    copy = new InvalidStorageException(empty),
    msg = message(),
    context = new Reference(),
    populated = new InvalidStorageException(msg, context),
    moved = InvalidStorageException.move(populated),
    type = invalidType(),
    name = type.getTypeName();
  try {
    expect(empty).toBeInstanceOf(IOException);
    expect(empty.Message.isEmpty()).toBe(true);
    expect(copy.Context.is()).toBe(false);
    expect(text(name)).toBe("com.sun.star.embed.InvalidStorageException");
    expect(ioType().isAssignableFrom(type)).toBe(true);
    expect(invalidType()).toBe(type);
    expect(text(moved.Message)).toBe("store");
    expect(populated.Message.isEmpty()).toBe(true);
    empty.assign(moved);
    expect(text(empty.Message)).toBe("store");
  } finally {
    name.dispose();
    moved.dispose();
    populated.dispose();
    copy.dispose();
    empty.dispose();
    context.dispose();
    msg.dispose();
  }
});
it("preserves StorageWrappedTargetException's inherited Any and the real WrappedTargetException parent", /** The child adds no fields; its inherited target has normal independent copy/move/destruction. @returns Nothing. */ () => {
  const empty = new StorageWrappedTargetException(),
    copy = new StorageWrappedTargetException(empty),
    msg = message(),
    context = new Reference(),
    target = new Any([42], "sal_Int32"),
    populated = new StorageWrappedTargetException(msg, context, target),
    moved = StorageWrappedTargetException.move(populated),
    type = wrappedType(),
    name = type.getTypeName();
  try {
    expect(empty).toBeInstanceOf(WrappedTargetException);
    expect(empty.TargetException.hasValue()).toBe(false);
    expect(copy.TargetException.hasValue()).toBe(false);
    expect(text(name)).toBe("com.sun.star.embed.StorageWrappedTargetException");
    expect(wrappedBaseType().isAssignableFrom(type)).toBe(true);
    expect(ioType().isAssignableFrom(type)).toBe(false);
    expect(wrappedType()).toBe(type);
    expect(populated.TargetException.hasValue()).toBe(false);
    const value: [number] = [0];
    expect(moved.TargetException.extract(value, "sal_Int32")).toBe(true);
    expect(value[0]).toBe(42);
    empty.assign(moved);
    expect(empty.TargetException.extract(value, "sal_Int32")).toBe(true);
    expect(value[0]).toBe(42);
    expect(text(moved.Message)).toBe("store");
  } finally {
    name.dispose();
    moved.dispose();
    populated.dispose();
    copy.dispose();
    empty.dispose();
    target.dispose();
    context.dispose();
    msg.dispose();
  }
});

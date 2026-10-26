/** @fileoverview Real class-data/type-provider/weak implementation owners with concrete caller declarations and actual typelib inheritance; no replacement query, type-description or component provider. */
import { expect, it } from "vitest";
import { WeakImplHelper } from "../inc/implbase";
import { WeakImplHelper_getTypes, WeakImplHelper_query, type class_data } from "../inc/implbase_ex";
import { getTypeEntries } from "./implbase_ex";
import { OWeakObject, WeakReferenceHelper } from "./weak";
import {
  XTypeProvider,
  getCppuType as providerType,
} from "../../udkapi/com/sun/star/lang/XTypeProvider";
import { XReference } from "../../cppu/inc/com/sun/star/uno/XReference";
import { XWeak } from "../../cppu/inc/com/sun/star/uno/XWeak";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../cppu/inc/unotype";
import { typelib_TypeClass as C } from "../../cppu/inc/typelib/typeclass";
import type { TypeClass } from "../../udkapi/com/sun/star/uno/TypeClass";
import {
  typelib_static_mi_interface_type_init,
  typelib_typedescription_release,
  type typelib_TypeDescription as D,
  type typelib_TypeDescriptionReference as R,
} from "../../cppu/inc/typelib/typedescription";
import {
  referenceViewOf,
  typelib_typedescription_newEmpty,
} from "../../cppu/source/typelib/typelib";
import { OUString } from "../../sal/inc/rtl/ustring";

/** Concrete source-declared caller interface with the normal generated static factory and actual base references. @param name - Unique declared name. @param bases - Original declared direct bases. @returns Caller declaration. */
function declared(name: string, bases: readonly { static_type: () => Type }[] = []) {
  const cell: [R | null] = [null];
  return {
    /** Original normal generated getter evaluates declared bases once. @returns Borrowed type. */
    static_type(): Type {
      if (cell[0] === null)
        typelib_static_mi_interface_type_init(
          cell,
          new TextEncoder().encode(name + "\0"),
          bases.length,
          bases.map(
            /** Reads source-declared supertype. @param base - Declared base. @returns Borrowed reference. */ (
              base,
            ) => base.static_type().getTypeLibType() as R,
          ),
        );
      return getTypeFromTypeDescriptionReference(cell);
    },
  };
}
/** Original class_data caller initializer. @param getters - Declared static getter expressions. @returns Real class data. */
function data(...getters: (() => Type)[]): class_data {
  return {
    m_nTypes: getters.length,
    m_storedTypeRefs: false,
    m_createdId: false,
    m_id: new Int8Array(16),
    m_typeEntries: getters.map(
      /** Native caller compiler assigns independent8-byte facet offsets. @param getCppuType - Declared getter. @param index - Facet ordinal. @returns Original entry. */ (
        getCppuType,
        index,
      ) => ({ m_type: { getCppuType }, m_offset: 32 + index * 8 }),
    ),
  };
}
/** Actual acquired Type name for assertions. @param type - Borrowed type. @returns Unicode text. */
function name(type: Type): string {
  const value = type.getTypeName();
  try {
    return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
  } finally {
    value.dispose();
  }
}
/** Asserts one actual caught UNO exception and destroys its members. @param callback - Caller action. @param message - Expected original message. @returns Nothing. */
function exception(callback: () => unknown, message: string): void {
  try {
    callback();
    throw new Error("expected UNO exception");
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    const actual = error as RuntimeException;
    try {
      expect(
        String.fromCharCode(...actual.Message.getStr().subarray(0, actual.Message.getLength())),
      ).toBe(message);
    } finally {
      actual.dispose();
    }
  }
}

it("preserves static template identities, real type sequences, qualified root fallback and weak lifetime", /** Checks the complete non-aggregating helper API through actual owners. @returns Nothing. */ () => {
  const A = declared("implbase.A"),
    B = declared("implbase.B", [A]),
    Base = WeakImplHelper.specialize(B, XReference),
    Empty = WeakImplHelper.specialize();
  expect(WeakImplHelper.specialize(B, XReference)).toBe(Base);
  expect(WeakImplHelper.specialize(XReference, B)).not.toBe(Base);
  expect(WeakImplHelper.specialize(B)).not.toBe(Base);
  expect(Base.ClassData.m_storedTypeRefs).toBe(false);
  expect(Base.ClassData.m_id).toEqual(new Int8Array(16));
  /** Concrete caller supplies its declared XReference virtual method. */
  class Concrete extends Base implements XReference {
    /** Caller-selected disposal callback. @returns Nothing. */
    dispose(): void {}
  }
  const object = new Concrete(),
    strong = new Reference(object),
    weak = new WeakReferenceHelper(strong),
    types = object.getTypes(),
    again = object.getTypes();
  expect(
    Array.from(
      { length: types.getLength() },
      /** Reads actual type sequence values. @param unused - Unused initializer. @param index - Element index. @returns Original name. */ (
        _unused,
        index,
      ) => name(types.operatorIndex(index)),
    ),
  ).toEqual([
    "implbase.B",
    "com.sun.star.uno.XReference",
    "com.sun.star.lang.XTypeProvider",
    "com.sun.star.uno.XWeak",
  ]);
  expect(types.operatorEquals(again)).toBe(true);
  types.dispose();
  again.dispose();
  for (const type of [
    B.static_type(),
    A.static_type(),
    XReference.static_type(),
    XTypeProvider.static_type(),
    XWeak.static_type(),
    UnoType.get("XInterface"),
  ]) {
    const result = object.queryInterface(type);
    expect(result.hasValue()).toBe(true);
    expect(result.pReserved).toBe(object);
    result.dispose();
  }
  const missing = object.queryInterface(declared("implbase.Missing").static_type());
  expect(missing.hasValue()).toBe(false);
  missing.dispose();
  const id = object.getImplementationId();
  expect(id.getLength()).toBe(0);
  id.dispose();
  expect(providerType()).toBe(XTypeProvider.static_type());
  expect(providerType(null)).toBe(providerType(strong));
  strong.dispose();
  const dead = weak.get();
  expect(dead.is()).toBe(false);
  dead.dispose();
  weak.dispose();
  const empty = new Empty(),
    emptyRef = new Reference(empty),
    emptyTypes = empty.getTypes();
  expect(emptyTypes.getLength()).toBe(2);
  emptyTypes.dispose();
  emptyRef.dispose();
});

it("initializes class entries in reverse order and leaves root queries independent of that initialization", /** Checks the original union overwrite and initialization gate. @returns Nothing. */ () => {
  const calls: number[] = [],
    A = declared("implbase.OrderA"),
    B = declared("implbase.OrderB"),
    cd = data(
      /** Source getter observation. @returns Declared type. */ () => {
        calls.push(1);
        return A.static_type();
      },
      /** Source getter observation. @returns Declared type. */ () => {
        calls.push(2);
        return B.static_type();
      },
    ),
    object = new OWeakObject(),
    strong = new Reference(object);
  const root = WeakImplHelper_query(
    UnoType.get("XInterface"),
    cd,
    /** Source cast is not needed by a root query. @returns Actual object. */ () => object,
    object,
  );
  expect(cd.m_storedTypeRefs).toBe(false);
  root.dispose();
  expect(getTypeEntries(cd)).toBe(cd.m_typeEntries);
  expect(calls).toEqual([2, 1]);
  getTypeEntries(cd);
  expect(calls).toEqual([2, 1]);
  const types = WeakImplHelper_getTypes(cd);
  expect(types.getLength()).toBe(3);
  expect(name(types.operatorIndex(2))).toBe("com.sun.star.uno.XWeak");
  types.dispose();
  strong.dispose();
});

it("traverses real multiple-inheritance descriptions with persistent offsets and one-base tails", /** Checks native depth-first base order and pointer adjustment through the explicit compiler cast. @returns Nothing. */ () => {
  const A = declared("implbase.TreeA"),
    B = declared("implbase.TreeB", [A]),
    Cc = declared("implbase.TreeC", [A]),
    Dd = declared("implbase.TreeD", [B, Cc]),
    E = declared("implbase.TreeE", [Dd]),
    F = declared("implbase.TreeF"),
    cd = data(E.static_type, F.static_type),
    object = new OWeakObject(),
    strong = new Reference(object),
    offsets: number[] = [];
  for (const [type, offset] of [
    [E.static_type(), 32],
    [B.static_type(), 32],
    [A.static_type(), 32],
    [Cc.static_type(), 40],
    [F.static_type(), 40],
  ] as const) {
    const result = WeakImplHelper_query(
      type,
      cd,
      /** Original caller's pointer-add cast observes exact offset. @param value - Computed byte offset. @returns Actual facet. */ (
        value,
      ) => {
        offsets.push(value);
        return object;
      },
      object,
    );
    expect(result.hasValue()).toBe(true);
    expect(offsets.at(-1)).toBe(offset);
    result.dispose();
  }
  const missing = WeakImplHelper_query(
    declared("implbase.TreeMissing").static_type(),
    cd,
    /** No match does not cast the pointer. @param value - Offset. @returns Facet. */ (value) => {
      offsets.push(value);
      return object;
    },
    object,
  );
  expect(missing.hasValue()).toBe(false);
  missing.dispose();
  strong.dispose();
});

it("accepts equal named distinct real reference allocations without demanding their descriptions", /** Checks the original common-prefix name comparison on genuine allocator records. @returns Nothing. */ () => {
  const A = declared("implbase.EqualNames"),
    n = A.static_type().getTypeName(),
    slot: [D | null] = [null];
  typelib_typedescription_newEmpty(slot, C.INTERFACE, n.pData);
  n.dispose();
  const description = slot[0] as D,
    demanded = new Type(referenceViewOf(description)),
    cd = data(A.static_type),
    object = new OWeakObject(),
    strong = new Reference(object);
  expect(demanded.getTypeLibType()).not.toBe(A.static_type().getTypeLibType());
  const result = WeakImplHelper_query(
    demanded,
    cd,
    /** Actual direct facet cast. @returns Borrowed facet. */ () => object,
    object,
  );
  expect(result.hasValue()).toBe(true);
  result.dispose();
  strong.dispose();
  demanded.dispose();
  typelib_typedescription_release(description);
});

it("preserves original non-interface and unavailable-description errors and sequence unwinding", /** Checks actual native error messages without replacing the typelib provider. @returns Nothing. */ () => {
  const object = new OWeakObject(),
    strong = new Reference(object),
    empty = data();
  exception(
    /** Demands a non-interface before class initialization. @returns Any. */ () =>
      WeakImplHelper_query(
        UnoType.get("sal_Int32"),
        empty,
        /** Explicit caller cast. @returns Facet. */ () => object,
        object,
      ),
    'querying for interface "long": no interface type!',
  );
  expect(empty.m_storedTypeRefs).toBe(false);
  const bad = data(
    /** Actual invalid declared source type. @returns Original long type. */ () =>
      UnoType.get("sal_Int32"),
  );
  exception(
    /** Allocated sequence unwinds when its class initializer rejects a type. @returns Sequence. */ () =>
      WeakImplHelper_getTypes(bad),
    'type "long" is no interface type!',
  );
  expect(bad.m_storedTypeRefs).toBe(false);
  const missingName = OUString.createFromAscii(
      new TextEncoder().encode("implbase.NoDescription\0"),
    ),
    missing = new Type(C.INTERFACE as unknown as TypeClass, missingName);
  missingName.dispose();
  const cd = data(
    /** Concrete caller refers to an unavailable declaration. @returns Declared type. */ () =>
      missing,
  );
  exception(
    /** Actual typelib lookup fails for the unavailable declaration. @returns Any. */ () =>
      WeakImplHelper_query(
        XReference.static_type(),
        cd,
        /** Actual cast remains unused on lookup failure. @returns Facet. */ () => object,
        object,
      ),
    'cannot get type description for type "implbase.NoDescription"!',
  );
  missing.dispose();
  strong.dispose();
});

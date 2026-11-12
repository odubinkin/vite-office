/** @fileoverview Actual NamedValueCollection native arguments, duplicate precedence, typed conversion, ownership and generated sequence output. */
import { afterEach, expect, it } from "vitest";
import { NamedValueCollection } from "../../inc/namedvaluecollection";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType } from "../../../cppu/inc/unotype";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
const Named = Sequence.specialize<NamedValue>(namedType, 32),
  Properties = Sequence.specialize<PropertyValue>(propertyType, 48),
  Args = Sequence.specialize<Any>("Any", 24);
afterEach(releaseDomScope);
/** Native fixture. @param value - Number. @returns Owned Any. */
function n(value: number) {
  return own(new Any([value], "sal_Int32"));
}
/** Native struct fixture. @param name - Name. @param value - Number. @returns Owned struct. */
function p(name: string, value: number) {
  return own(new PropertyValue(u(name), 77, n(value), 2));
}
it("owns copies, replaces existing values, merges, enumerates names and erases", /** Verifies owns copies, replaces existing values, merges, enumerates names and erases. @returns Original operation result. */ () => {
  const a = own(new NamedValueCollection()),
    b = own(new NamedValueCollection());
  expect(a.empty()).toBe(true);
  expect(a.put(u("A"), n(1))).toBe(false);
  expect(a.put(u("A"), n(2))).toBe(true);
  const copy = own(new NamedValueCollection(a));
  a.put(u("A"), n(3));
  expect(Any.prototype.operatorEquals.call(copy.get(u("A")), n(2))).toBe(true);
  b.put(u("A"), n(4));
  b.put(u("B"), n(5));
  copy.merge(b, false);
  expect(Any.prototype.operatorEquals.call(copy.get(u("A")), n(2))).toBe(true);
  copy.merge(b, true);
  expect(Any.prototype.operatorEquals.call(copy.get(u("A")), n(4))).toBe(true);
  expect(copy.getNames().map(read).sort()).toEqual(["A", "B"]);
  expect(copy.remove(u("B"))).toBe(true);
  expect(copy.remove(u("B"))).toBe(false);
  expect(Any.prototype.hasValue.call(copy.get(u("missing")))).toBe(false);
  copy.copyAssign(a);
  copy.copyAssign(copy);
  expect(copy.size()).toBe(1);
  copy.clear();
  expect(copy.empty()).toBe(true);
});
it("preserves map last-duplicate and static sequence first-duplicate precedence", /** Verifies preserves map last-duplicate and static sequence first-duplicate precedence. @returns Original operation result. */ () => {
  const entries = [p("A", 1), p("A", 2)],
    source = own(
      new Properties(
        {
          get: /** Projects the actual native fixture address. @param offset - Native byte offset. @returns Original operation result. */ (
            offset: number,
          ) => entries[offset / 48],
        },
        2,
      ),
    ),
    values = own(new NamedValueCollection(source, "PropertyValue"));
  expect(Any.prototype.operatorEquals.call(values.get(u("A")), n(2))).toBe(true);
  expect(Any.prototype.operatorEquals.call(NamedValueCollection.get(source, u("A")), n(1))).toBe(
    true,
  );
  expect(Any.prototype.hasValue.call(NamedValueCollection.get(source, u("missing")))).toBe(false);
  const out: [number] = [99];
  expect(NamedValueCollection.get_ensureType(source, u("A"), out, UnoType.get("sal_Int32"))).toBe(
    true,
  );
  expect(out[0]).toBe(1);
  expect(
    NamedValueCollection.get_ensureType(source, u("missing"), out, UnoType.get("sal_Int32")),
  ).toBe(false);
  expect(out[0]).toBe(1);
});
it("extracts four supported wrapped types and mixed arguments; ignores unsupported values", /** Verifies extracts four supported wrapped types and mixed arguments; ignores unsupported values. @returns Original operation result. */ () => {
  const named = own(new NamedValue(u("N"), n(7))),
    property = p("P", 8),
    names = own(
      new Named(
        {
          get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
            named,
        },
        1,
      ),
    ),
    props = own(
      new Properties(
        {
          get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
            property,
        },
        1,
      ),
    );
  for (const [address, type] of [
    [named, namedType],
    [property, propertyType],
    [names.getAddress(), ["Sequence", namedType]],
    [props.getAddress(), ["Sequence", propertyType]],
  ] as const) {
    const wrapped = own(new Any(address, type));
    expect(NamedValueCollection.canExtractFrom(wrapped)).toBe(true);
    expect(own(new NamedValueCollection(wrapped)).size()).toBe(1);
  }
  expect(NamedValueCollection.canExtractFrom(n(1))).toBe(false);
  const items = [
      own(new Any(named, namedType)),
      n(19),
      own(new Any(property, propertyType)),
      own(new Any()),
    ],
    args = own(
      new Args(
        {
          get: /** Projects the actual native fixture address. @param offset - Native byte offset. @returns Original operation result. */ (
            offset: number,
          ) => items[offset / 24],
        },
        4,
      ),
    ),
    values = own(new NamedValueCollection(args, "Any"));
  expect(values.size()).toBe(2);
  expect(
    NamedValueCollection.canExtractFrom(own(new Any(args.getAddress(), ["Sequence", "Any"]))),
  ).toBe(false);
  values.assign(own(new Args()));
  expect(values.empty()).toBe(true);
  expect(own(new NamedValueCollection(n(1))).empty()).toBe(true);
  expect(own(new NamedValueCollection(names, "NamedValue")).has(u("N"))).toBe(true);
});
it("converts native values, preserves absent outputs and reports exact incompatible type", /** Verifies converts native values, preserves absent outputs and reports exact incompatible type. @returns Original operation result. */ () => {
  const values = own(new NamedValueCollection());
  values.put(u("number"), own(new Any([42], "sal_Int16")));
  const out: [number] = [99];
  expect(values.get_ensureType(u("number"), out, UnoType.get("sal_Int32"))).toBe(true);
  expect(out[0]).toBe(42);
  expect(values.get_ensureType(u("missing"), out, UnoType.get("sal_Int32"))).toBe(false);
  expect(out[0]).toBe(42);
  const wrong = own(new Any(u("hello").getDataAddress(), "OUString"));
  values.put(u("bad"), wrong);
  for (const action of [
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      values.get_ensureType(u("bad"), out, UnoType.get("bool")),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () => {
      const item = own(new PropertyValue(u("bad"), 0, wrong, 0));
      return NamedValueCollection.get_ensureType(
        own(
          new Properties(
            {
              get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
                item,
            },
            1,
          ),
        ),
        u("bad"),
        out,
        UnoType.get("bool"),
      );
    },
  ]) {
    let caught = false;
    try {
      action();
    } catch (error) {
      if (!(error instanceof IllegalArgumentException)) throw error;
      try {
        expect(read(new OUString(error.Message))).toBe(
          "Invalid value type for 'bad'.\nExpected: boolean\nFound: string",
        );
        expect(error.ArgumentPosition).toBe(0);
        expect(error.Context.is()).toBe(false);
        caught = true;
      } finally {
        error.dispose();
      }
    }
    expect(caught).toBe(true);
  }
});
it("outputs complete native structs and wrapped Any sequences, resetting reused Handle/State", /** Verifies outputs complete native structs and wrapped Any sequences, resetting reused Handle/State. @returns Original operation result. */ () => {
  const values = own(new NamedValueCollection());
  values.put(u("A"), n(9));
  const props = own(values.getPropertyValues()),
    names = own(values.getNamedValues()),
    property = PropertyValue.unacquired(props.operatorIndex(0) as { get(offset: number): unknown }),
    name = NamedValue.unacquired(names.operatorIndex(0) as { get(offset: number): unknown });
  expect(property.Handle).toBe(0);
  expect(property.State).toBe(0);
  expect(read(new OUString(name.Name))).toBe("A");
  expect(Any.prototype.operatorEquals.call(name.Value, n(9))).toBe(true);
  for (const wrapped of [
    own(values.getWrappedPropertyValues()),
    own(values.getWrappedNamedValues()),
  ])
    expect(own(new NamedValueCollection(wrapped, "Any")).size()).toBe(1);
  const previous = p("old", 1),
    reused = own(
      new Properties(
        {
          get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
            previous,
        },
        1,
      ),
    );
  expect(values.extract(reused, "PropertyValue")).toBe(1);
  expect(
    PropertyValue.unacquired(reused.operatorIndex(0) as { get(offset: number): unknown }).Handle,
  ).toBe(0);
});
it("uses const native field projections with generated copy/assignment/equality semantics", /** Verifies uses const native field projections with generated copy/assignment/equality semantics. @returns Original operation result. */ () => {
  const named = own(new NamedValue(u("A"), n(1))),
    names = own(
      new Named(
        {
          get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
            named,
        },
        1,
      ),
    ),
    view = NamedValue.unacquired(names.operatorIndex(0) as { get(offset: number): unknown }),
    copy = own(new NamedValue(view)),
    empty = own(new NamedValue());
  expect(copy.equals(view)).toBe(true);
  expect(copy.notEquals(empty)).toBe(true);
  empty.assign(view);
  expect(empty.equals(copy)).toBe(true);
  const property = p("P", 2),
    properties = own(
      new Properties(
        {
          get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
            property,
        },
        1,
      ),
    ),
    fields = PropertyValue.unacquired(
      properties.operatorIndex(0) as { get(offset: number): unknown },
    ),
    propertyCopy = own(new PropertyValue(fields)),
    defaultProperty = own(new PropertyValue());
  expect(propertyCopy.equals(fields)).toBe(true);
  expect(propertyCopy.notEquals(defaultProperty)).toBe(true);
  defaultProperty.assign(fields);
  expect(defaultProperty.equals(propertyCopy)).toBe(true);
});

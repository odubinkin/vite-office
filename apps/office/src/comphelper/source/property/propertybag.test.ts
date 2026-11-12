/** @fileoverview Actual low-level PropertyBag/default/descriptor contracts and native Type lvalue transport; no UNO PropertyBag service or model/provider is substituted. */
import { afterEach, expect, it } from "vitest";
import { PropertyBag } from "../../inc/propertybag";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType } from "../../../cppu/inc/unotype";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import { REMOVABLE, MAYBEVOID } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import {
  IllegalTypeException,
  cppu_detail_getUnoType as illegalType,
  getCppuType as deprecatedIllegal,
} from "../../../udkapi/com/sun/star/beans/IllegalTypeException";
import {
  PropertyExistException,
  cppu_detail_getUnoType as existType,
  getCppuType as deprecatedExist,
} from "../../../udkapi/com/sun/star/beans/PropertyExistException";
import {
  NotRemoveableException,
  cppu_detail_getUnoType as removeType,
  getCppuType as deprecatedRemove,
} from "../../../udkapi/com/sun/star/beans/NotRemoveableException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { ElementExistException } from "../../../cppu/inc/com/sun/star/container/ElementExistException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { ActiveDataSink } from "../../../ucbhelper/source/client/activedatasink";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
const Properties = Sequence.specialize<Property>(propertyType, 32);
afterEach(releaseDomScope);
/** Original actual exception cleanup, preserving thrown dynamic class. @param action - Source call. @param constructor - Expected actual class. @returns Caught owned value. */
function failure<T extends Exception>(action: () => unknown, constructor: new () => T): T {
  try {
    action();
    expect.fail("Expected source exception");
  } catch (error) {
    expect(error).toBeInstanceOf(constructor);
    return own(error as T);
  }
}
/** Reads the actual signed32 Any. @param value - Borrowed value. @returns Native scalar. */
function integer(value: Any): number {
  const out: [number] = [0];
  expect(value.extract(out, "sal_Int32")).toBe(true);
  return out[0];
}
it("copies Type fields through stable owner addresses instead of reflective private-field writes", /** Actual SDK/Any storage remains connected to the same native Type pointer. @returns Nothing. */ () => {
  const type = own(new Type(UnoType.get("sal_Int16"))),
    address = type.getAddress(),
    property = own(new Property(u("field"), 7, type, REMOVABLE)),
    field = property.get(16);
  expect(type.getAddress()).toBe(address);
  type.assign(UnoType.get("sal_Int32"));
  expect(address[0]).toBe(UnoType.get("sal_Int32").getTypeLibType());
  expect(field).toBe(property.Type.getAddress());
  const payload = own(new Any(own(new Property(u("changed"), 8, type, MAYBEVOID)), propertyType));
  expect(payload.extract(property, propertyType)).toBe(true);
  expect(property.get(16)).toBe(field);
  expect(property.Type.equals(type)).toBe(true);
  expect(property.Handle).toBe(8);
});
it("preserves normalization, unchanged outputs and initial defaults", /** Real native lossless short-to-long assignment is used. @returns Nothing. */ () => {
  const bag = own(new PropertyBag()),
    initial = own(new Any([3], "sal_Int32")),
    requested = own(new Any([4], "sal_Int16")),
    converted = own(new Any()),
    old = own(new Any()),
    result = own(new Any()),
    defaults = own(new Any());
  bag.addProperty(u("number"), 4, REMOVABLE, initial);
  expect(bag.convertFastPropertyValue(4, requested, converted, old)).toBe(true);
  expect(integer(old)).toBe(3);
  expect(integer(converted)).toBe(4);
  bag.setFastPropertyValue(4, converted);
  bag.getFastPropertyValue(4, result);
  expect(integer(result)).toBe(4);
  bag.getPropertyDefaultByHandle(4, defaults);
  expect(integer(defaults)).toBe(3);
  converted.assign(own(new Any(true)));
  old.assign(own(new Any(true)));
  expect(bag.convertFastPropertyValue(4, result, converted, old)).toBe(false);
  const bool: [boolean] = [false];
  expect(converted.extract(bool, "bool")).toBe(true);
  expect(bool[0]).toBe(true);
  expect(old.extract(bool, "bool")).toBe(true);
});
it("retains original validation precedence, typed failures and empty-name policy", /** No fabricated error or replacement type provider is supplied. @returns Nothing. */ () => {
  const bag = own(new PropertyBag()),
    empty = own(new Any()),
    number = own(new Any([1], "sal_Int32")),
    out = own(new Any());
  expect(
    read(
      failure(
        /** Type check precedes empty-name check. @returns Nothing. */ () =>
          bag.addProperty(u(""), 1, 0, empty),
        IllegalTypeException,
      ).Message.copy(0),
    ),
  ).toBe("The initial value must be non-NULL to determine the property type.");
  expect(
    failure(
      /** Default name rejection. @returns Nothing. */ () => bag.addProperty(u(""), 1, 0, number),
      IllegalArgumentException,
    ).ArgumentPosition,
  ).toBe(1);
  failure(
    /** Void declared type rejected. @returns Nothing. */ () =>
      bag.addVoidProperty(u("name"), UnoType.get("void"), 1, 0),
    IllegalArgumentException,
  );
  bag.setAllowEmptyPropertyName(true);
  bag.addProperty(u(""), 1, 0, number);
  expect(bag.hasPropertyByName(u(""))).toBe(true);
  expect(bag.hasPropertyByHandle(1)).toBe(true);
  failure(
    /** Existing name rejected by nonvoid overload. @returns Nothing. */ () =>
      bag.addProperty(u(""), 2, 0, number),
    PropertyExistException,
  );
  failure(
    /** Existing handle rejected by void overload with its distinct exception. @returns Nothing. */ () =>
      bag.addVoidProperty(u("other"), UnoType.get("bool"), 1, 0),
    ElementExistException,
  );
  failure(
    /** Registered property is not removable. @returns Nothing. */ () => bag.removeProperty(u("")),
    NotRemoveableException,
  );
  failure(
    /** Unknown property by name. @returns Nothing. */ () => bag.removeProperty(u("missing")),
    UnknownPropertyException,
  );
  for (const action of [
    /** Original checked getter. @returns Nothing. */ () => bag.getFastPropertyValue(-9, out),
    /** Original checked setter. @returns Nothing. */ () => bag.setFastPropertyValue(-9, number),
    /** Original checked conversion. @returns Boolean. */ () =>
      bag.convertFastPropertyValue(-9, number, out, empty),
    /** Original checked default getter. @returns Nothing. */ () =>
      bag.getPropertyDefaultByHandle(-9, out),
  ])
    expect(read(failure(action, UnknownPropertyException).Message.copy(0))).toBe("-9");
});
it("forces MAYBEVOID for default-void properties and preserves the original conversion diagnostic", /** Native Any normalization and declared types determine acceptance. @returns Nothing. */ () => {
  const bag = own(new PropertyBag()),
    out = own(new Any()),
    converted = own(new Any()),
    old = own(new Any());
  bag.addVoidProperty(u("flag"), UnoType.get("bool"), 2, 0);
  bag.getFastPropertyValue(2, out);
  expect(out.hasValue()).toBe(false);
  expect(bag.convertFastPropertyValue(2, own(new Any(true)), converted, old)).toBe(true);
  expect(old.hasValue()).toBe(false);
  bag.setFastPropertyValue(2, converted);
  bag.getPropertyDefaultByHandle(2, out);
  expect(out.hasValue()).toBe(false);
  const invalid = own(new Any(u("bad").getDataAddress(), "OUString")),
    error = failure(
      /** Source conversion rejects a string for bool. @returns Boolean. */ () =>
        bag.convertFastPropertyValue(2, invalid, converted, old),
      IllegalArgumentException,
    );
  expect(error.ArgumentPosition).toBe(4);
  expect(read(error.Message.copy(0))).toBe(
    'The given value cannot be converted to the required property type. (property name "flag", found value type "string", required property type "boolean")',
  );
  const properties = own(new Properties());
  bag.describeProperties(properties);
  const raw = (properties.getConstArray() as SequenceElements).get(0) as {
    get(offset: number): unknown;
  };
  expect(Property.unacquired(raw).Attributes & MAYBEVOID).toBe(MAYBEVOID);
});
it("sorts native property descriptors by name and merges an already-sorted input with original left-first ties", /** Actual generated Property copies and shared sequence storage are retained. @returns Nothing. */ () => {
  const bag = own(new PropertyBag()),
    value = own(new Any([1], "sal_Int32")),
    type = UnoType.get("sal_Int32"),
    input = own(new Property(u("Alpha"), 99, type, 0));
  bag.addProperty(u("尾"), 1, REMOVABLE, value);
  bag.addProperty(u("Beta"), -4, 0, value);
  bag.addProperty(u("Alpha"), 8, 0, value);
  const properties = own(
    new Properties(
      {
        /** Original initialized native element address. @param offset - Zero offset. @returns Actual Property value. */ get(
          offset: number,
        ): unknown {
          void offset;
          return input;
        },
      },
      1,
    ),
  );
  bag.describeProperties(properties);
  const array = properties.getConstArray() as SequenceElements,
    names: string[] = [],
    handles: number[] = [];
  for (let i = 0; i < properties.getLength(); ++i) {
    const p = own(
      new Property(Property.unacquired(array.get(i * 32) as { get(offset: number): unknown })),
    );
    names.push(read(p.Name.copy(0)));
    handles.push(p.Handle);
    expect(p.Type.equals(type)).toBe(true);
  }
  expect(names).toEqual(["Alpha", "Alpha", "Beta", "尾"]);
  expect(handles).toEqual([99, 8, -4, 1]);
});
it("retains the original removed property's backing Any until bag destruction", /** Real weak lifetime exposes the source holder-vector retention, without private state access. @returns Nothing. */ () => {
  const bag = new PropertyBag(),
    sink = own(new Reference(new ActiveDataSink())),
    weak = own(new WeakReferenceHelper(sink)),
    value = own(new Any(sink.getAddress(), XActiveDataSink.static_type));
  try {
    bag.addProperty(u("sink"), 3, REMOVABLE, value);
    value.clear();
    sink.clear();
    bag.removeProperty(u("sink"));
    expect(bag.hasPropertyByHandle(3)).toBe(false);
    const live = weak.get();
    try {
      expect(live.is()).toBe(true);
    } finally {
      live.dispose();
    }
  } finally {
    bag.dispose();
  }
  const dead = weak.get();
  try {
    expect(dead.is()).toBe(false);
  } finally {
    dead.dispose();
  }
});
it("uses real-member and Any-member locations with the original lossless conversion rules", /** Actual source caller supplies only its declared fields and native addresses. @returns Async completion. */ async () => {
  const { OPropertyContainerHelper } = await import("../../inc/propertycontainerhelper");
  /** Actual derived value owner follows the native helper's registration contract. */
  class Owner extends OPropertyContainerHelper {
    readonly scalar: [number] = [3];
    readonly optional = new Any();
    /** Declares actual fields, without a service/provider substitute. @returns Owner. */ constructor() {
      super();
      this.registerProperty(u("scalar"), 1, 0, this.scalar, UnoType.get("sal_Int32"));
      this.registerMayBeVoidProperty(u("optional"), 2, 0, this.optional, UnoType.get("bool"));
    }
    /** Original protected source conversion call. @param value - Requested value. @param converted - Output. @param old - Output. @param handle - Registered handle. @returns Modified predicate. */ convert(
      value: Any,
      converted: Any,
      old: Any,
      handle: number,
    ): boolean {
      return this.convertFastPropertyValue(converted, old, handle, value);
    }
    /** Original protected assignment. @param handle - Native handle. @param value - Value. @returns Nothing. */ set(
      handle: number,
      value: Any,
    ): void {
      this.setFastPropertyValue(handle, value);
    }
    /** Original protected getter. @param handle - Native handle. @param output - Output. @returns Nothing. */ read(
      handle: number,
      output: Any,
    ): void {
      this.getFastPropertyValue(output, handle);
    }
    /** Original reverse derived/base destruction. @returns Nothing. */ override dispose(): void {
      this.optional.dispose();
      super.dispose();
    }
  }
  const owner = own(new Owner()),
    converted = own(new Any()),
    old = own(new Any()),
    value = own(new Any([7], "sal_Int16")),
    output = own(new Any());
  expect(owner.convert(value, converted, old, 1)).toBe(true);
  expect(integer(old)).toBe(3);
  expect(integer(converted)).toBe(7);
  owner.set(1, converted);
  expect(owner.scalar[0]).toBe(7);
  owner.read(1, output);
  expect(integer(output)).toBe(7);
  expect(owner.convert(output, converted, old, 1)).toBe(false);
  expect(owner.convert(own(new Any(true)), converted, old, 2)).toBe(true);
  owner.set(2, converted);
  expect(owner.optional.hasValue()).toBe(true);
  expect(owner.convert(own(new Any()), converted, old, 2)).toBe(true);
  owner.set(2, converted);
  expect(owner.optional.hasValue()).toBe(false);
  const text = own(new Any(u("bad").getDataAddress(), "OUString"));
  expect(
    failure(
      /** Source real field rejects a string. @returns Boolean. */ () =>
        owner.convert(text, converted, old, 1),
      IllegalArgumentException,
    ).ArgumentPosition,
  ).toBe(4);
});
it.each([
  ["IllegalTypeException", IllegalTypeException, illegalType, deprecatedIllegal],
  ["PropertyExistException", PropertyExistException, existType, deprecatedExist],
  ["NotRemoveableException", NotRemoveableException, removeType, deprecatedRemove],
] as const)(
  "transports actual generated %s values across the UNO exception ABI",
  /** Newly consumed SDK classes retain default/copy/move fields and exact runtime type. @param name - Original IDL name. @param Constructor - Actual generated declaration. @param type - Original type getter. @param deprecated - Original deprecated getter. @returns Async completion. */ async (
    name,
    Constructor,
    type,
    deprecated,
  ) => {
    const { initializeExceptionAbi } = await import("../../../cppuhelper/browser/exception-abi"),
      { throwException } = await import("../../../cppuhelper/inc/exc_hlp");
    initializeExceptionAbi();
    const empty = own(new Constructor()),
      context = own(new Reference(new ActiveDataSink())),
      source = own(new Constructor(u("A\0尾"), context));
    expect(empty.Message.isEmpty()).toBe(true);
    expect(empty.Context.is()).toBe(false);
    expect(deprecated()).toBe(type());
    expect(read(type().getTypeName())).toBe("com.sun.star.beans." + name);
    const payload = own(new Any(source, type));
    let thrown: Exception | undefined;
    try {
      throwException(payload);
    } catch (error) {
      expect(error).toBeInstanceOf(Constructor);
      thrown = own(error as Exception);
    }
    expect(thrown).toBeDefined();
    const copied = own(new Constructor(thrown as InstanceType<typeof Constructor>)),
      moved = own(Constructor.move(copied));
    source.Message = u("changed");
    payload.clear();
    expect(read(moved.Message.copy(0))).toBe("A\0尾");
    expect(moved.Context.get()).toBe(context.get());
  },
);

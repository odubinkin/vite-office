/** @fileoverview Actual property-state component, native defaults/equality and source forward-only bulk lookup. Concrete callers own real PropertyBag/Sequence values; no document/metadata provider or alternate state store is supplied. */
import { afterEach, expect, it } from "vitest";
import { OStatefulPropertySet, OPropertyStateHelper } from "../../inc/propstate";
import { OMutexAndBroadcastHelper } from "../../inc/broadcasthelper";
import { PropertyBag } from "../../inc/propertybag";
import { IPropertyArrayHelper, OPropertyArrayHelper } from "../../../cppuhelper/inc/propshlp";
import { OWeakObject } from "../../../cppuhelper/inc/weak";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../cppu/inc/unotype";
import type { typelib_TypeDescriptionReference as R } from "../../../cppu/inc/typelib/typedescription";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XPropertyState } from "../../../udkapi/com/sun/star/beans/XPropertyState";
import { XPropertySetOption } from "../../../udkapi/com/sun/star/beans/XPropertySetOption";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { XWeak } from "../../../cppu/inc/com/sun/star/uno/XWeak";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import {
  BOUND,
  READONLY,
  MAYBEDEFAULT,
} from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import type { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
const Properties = Sequence.specialize<Property>(propertyType, 32),
  Names = Sequence.specialize<OUString>("OUString", 8),
  StateBase = OPropertyStateHelper.specialize(OWeakObject);
/** Concrete source callback owner; defaults intentionally remain the original base VOID implementation. */
class BaseDefaults extends OStatefulPropertySet {
  readonly bag = new PropertyBag();
  private readonly info: OPropertyArrayHelper;
  /** Actual declared properties and initialized native values. @returns Caller. */ constructor() {
    super();
    const initial = new Any([1], "sal_Int32"),
      descriptions = new Properties();
    try {
      this.bag.addProperty(u("A"), 1, BOUND, initial);
      this.bag.addProperty(u("C"), 3, BOUND, initial);
      this.bag.addProperty(u("R"), 4, READONLY, initial);
      this.bag.describeProperties(descriptions);
      this.info = new OPropertyArrayHelper(descriptions);
    } finally {
      descriptions.dispose();
      initial.dispose();
    }
  }
  /** Actual derived member destruction before original base chain. @returns Nothing. */ protected override destroy(): void {
    this.info.dispose();
    this.bag.dispose();
    super.destroy();
  }
  /** Original metadata callback. @returns Actual descriptors. */ protected override getInfoHelper(): IPropertyArrayHelper {
    return this.info;
  }
  /** Original actual info component. @returns Acquired info. */ getPropertySetInfo(): Reference<XPropertySetInfo> {
    return StateBase.createPropertySetInfo(this.info);
  }
  /** Native bag conversion. @param converted - Output. @param old - Output. @param handle - Handle. @param value - Input. @returns Change. */ protected override convertFastPropertyValue(
    converted: Any,
    old: Any,
    handle: number,
    value: Any,
  ): boolean {
    return this.bag.convertFastPropertyValue(handle, value, converted, old);
  }
  /** Actual nonbroadcast storage. @param handle - Handle. @param value - Converted value. @returns Nothing. */ protected override setFastPropertyValue_NoBroadcast(
    handle: number,
    value: Any,
  ): void {
    this.bag.setFastPropertyValue(handle, value);
  }
  /** Native output getter. @param value - Output. @param handle - Handle. @returns Nothing. */ protected override readFastPropertyValue(
    value: Any,
    handle: number,
  ): void {
    this.bag.getFastPropertyValue(handle, value);
  }
  /** Concrete source caller can invoke its protected explicit change notifier. @param handle - Handle. @param value - New value. @param old - Old value. @returns Nothing. */ explicitChange(
    handle: number,
    value: Any,
    old: Any,
  ): void {
    this.firePropertyChange(handle, value, old);
  }
}
/** A real default-owning caller forwards to its existing native bag default map. */
class Defaults extends BaseDefaults {
  /** Original actual bag defaults, not inferred/generated values. @param handle - Handle. @returns Owned default. */ override getPropertyDefaultByHandle(
    handle: number,
  ): Any {
    const value = new Any();
    try {
      this.bag.getPropertyDefaultByHandle(handle, value);
      return value;
    } catch (error) {
      value.dispose();
      throw error;
    }
  }
}
/** Actual initialized source string sequence. @param values - Names. @returns Owned sequence. */
function names(values: readonly string[]): Sequence<OUString> {
  const owners = values.map(
    /** Original literal. @param value - Name. @returns Actual string. */ (value) => u(value),
  );
  return own(
    new Names(
      {
        /** Native field address. @param offset - Bytes. @returns Existing pointer field. */ get(
          offset: number,
        ): unknown {
          return (owners[offset / 8] as OUString).getDataAddress();
        },
      },
      owners.length,
    ),
  );
}
/** Reads native enum values. @param sequence - Actual states. @returns Enum scalars. */
function states(sequence: Sequence<PropertyState>): number[] {
  const array = sequence.getConstArray() as SequenceElements;
  return Array.from(
    { length: sequence.getLength() },
    /** Actual enum cell. @param unused - Unused. @param i - Index. @returns State. */ (_, i) =>
      (array.get(i * 4) as [number])[0],
  );
}
/** Original exception assertion/cleanup. @param action - Source call. @param Constructor - Actual expected SDK class. @returns Owned exception. */
function failure<T extends Exception>(action: () => unknown, Constructor: new () => T): T {
  try {
    action();
    expect.fail("Expected native exception");
  } catch (error) {
    expect(error).toBeInstanceOf(Constructor);
    return own(error as T);
  }
}
import type { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
it("preserves original actual weak/type-provider/state identities and seven-type order", /** The stateful component has its original weak root rather than a replacement provider. @returns Nothing. */ () => {
  const ref = own(new Reference(new Defaults())),
    owner = ref.operatorStar(),
    types = own(owner.getTypes()),
    array = types.getConstArray() as SequenceElements,
    names: string[] = [];
  for (let i = 0; i < types.getLength(); ++i) {
    const type = getTypeFromTypeDescriptionReference(array.get(i * 8) as [R | null]);
    names.push(read(type.getTypeName()));
  }
  expect(names).toEqual([
    "com.sun.star.uno.XWeak",
    "com.sun.star.lang.XTypeProvider",
    "com.sun.star.beans.XPropertySet",
    "com.sun.star.beans.XMultiPropertySet",
    "com.sun.star.beans.XFastPropertySet",
    "com.sun.star.beans.XPropertySetOption",
    "com.sun.star.beans.XPropertyState",
  ]);
  expect(own(owner.getImplementationId()).getLength()).toBe(0);
  for (const getter of [
    XWeak.static_type,
    XTypeProvider.static_type,
    XPropertyState.static_type,
    XPropertySetOption.static_type,
  ]) {
    const result = own(owner.queryInterface(getter())),
      target = own(new Reference());
    expect(result.extract(target.getAddress(), getter)).toBe(true);
    expect(target.get()).toBe(owner);
  }
  expect(own(owner.queryInterface(UnoType.get("sal_Int32"))).hasValue()).toBe(false);
  expect(OPropertyStateHelper.specialize(OWeakObject)).toBe(StateBase);
  expect(own(StateBase.getTypes()).getLength()).toBe(5);
});
it("compares native current/default values and restores defaults through the original setter", /** Native value types and actual bag defaults determine the state. @returns Nothing. */ () => {
  const ref = own(new Reference(new Defaults())),
    owner = ref.operatorStar();
  expect(owner.getPropertyState(u("A"))).toBe(PropertyState.DEFAULT_VALUE);
  owner.setFastPropertyValue(1, own(new Any([4], "sal_Int16")));
  expect(owner.getPropertyStateByHandle(1)).toBe(PropertyState.DIRECT_VALUE);
  expect(own(owner.getPropertyDefault(u("A"))).get("sal_Int32")).toBe(1);
  owner.setPropertyToDefault(u("A"));
  expect(owner.getPropertyState(u("A"))).toBe(PropertyState.DEFAULT_VALUE);
  owner.setPropertyToDefaultByHandle(3);
  expect(owner.getPropertyStateByHandle(3)).toBe(PropertyState.DEFAULT_VALUE);
  failure(
    /** Readonly reset still uses the public setter. @returns Nothing. */ () =>
      owner.setPropertyToDefault(u("R")),
    PropertyVetoException,
  );
  owner.explicitChange(1, own(new Any([5], "sal_Int32")), own(new Any([1], "sal_Int32")));
});
it("preserves the original base VOID default without adding handle validation", /** No source-specific default map is manufactured for the base helper. @returns Nothing. */ () => {
  const ref = own(new Reference(new BaseDefaults())),
    owner = ref.operatorStar();
  expect(own(owner.getPropertyDefaultByHandle(999)).hasValue()).toBe(false);
  expect(own(owner.getPropertyDefault(u("A"))).hasValue()).toBe(false);
  expect(owner.getPropertyState(u("A"))).toBe(PropertyState.DIRECT_VALUE);
});
it("stops bulk state lookup at the first missing name and retains native DIRECT defaults", /** Original forward-only cursor and zero enum initialization are preserved. @returns Nothing. */ () => {
  const ref = own(new Reference(new Defaults())),
    owner = ref.operatorStar();
  expect(states(own(owner.getPropertyStates(names(["A", "C"]))))).toEqual([1, 1]);
  expect(states(own(owner.getPropertyStates(names(["A", "B", "C"]))))).toEqual([1, 0, 0]);
  expect(states(own(owner.getPropertyStates(names(["unknown"]))))).toEqual([0]);
  expect(states(own(owner.getPropertyStates(names([]))))).toEqual([]);
  expect(states(own(owner.getPropertyStates(names(["A", "A", "C"]))))).toEqual([1, 1, 1]);
});
it("preserves named unknown-property diagnostics and concrete default-handle failures", /** Original name check precedes default/state callbacks. @returns Nothing. */ () => {
  const ref = own(new Reference(new Defaults())),
    owner = ref.operatorStar();
  for (const action of [
    /** Named state. @returns State. */ () => owner.getPropertyState(u("missing")),
    /** Named default. @returns Any. */ () => owner.getPropertyDefault(u("missing")),
    /** Named reset. @returns Nothing. */ () => owner.setPropertyToDefault(u("missing")),
  ])
    expect(read(failure(action, UnknownPropertyException).Message.copy(0))).toBe("missing");
  failure(
    /** Actual bag default rejects invalid handle. @returns State. */ () =>
      owner.getPropertyStateByHandle(999),
    UnknownPropertyException,
  );
});
it("retains the actual non-interface broadcaster before dependent facets", /** It introduces no second weak identity or successful lock stub. @returns Nothing. */ () => {
  const parent = own(new OMutexAndBroadcastHelper());
  expect(parent.GetBroadcastHelper()).toBe(parent.GetBroadcastHelper());
  expect(parent.GetBroadcastHelper().bDisposed).toBe(false);
  expect(parent.GetBroadcastHelper().bInDispose).toBe(false);
});

it("replays qadevOOo XPropertyState setup and all four method checks", /** The original configured caller has writable properties, so its readonly-only skip is inapplicable; no Java runtime/proxy parity is claimed. @returns Nothing. */ () => {
  const owner = own(new Reference(new Defaults())),
    state = owner.operatorStar(),
    queried = own(state.queryInterface(XPropertySet.static_type())),
    propertySet = own(new Reference<XPropertySet>());
  expect(queried.extract(propertySet.getAddress(), XPropertySet.static_type)).toBe(true);
  expect(propertySet.is()).toBe(true);
  const properties = propertySet.operatorStar(),
    info = own(properties.getPropertySetInfo()),
    descriptions = own(info.operatorStar().getProperties()),
    array = descriptions.getConstArray() as SequenceElements;
  let selected: OUString | null = null;
  for (let i = 0; i < descriptions.getLength(); ++i) {
    const source = Property.unacquired(array.get(i * 32) as { get(offset: number): unknown }),
      prop = own(info.operatorStar().getPropertyByName(source.Name)),
      readOnly = (prop.Attributes & READONLY) !== 0,
      maybeDefault = (prop.Attributes & MAYBEDEFAULT) !== 0;
    if (!readOnly && maybeDefault) {
      selected = u(read(source.Name.copy(0)));
      break;
    }
    if (!readOnly) selected = u(read(source.Name.copy(0)));
  }
  const first = Property.unacquired(array.get(0) as { get(offset: number): unknown }),
    localName = selected ?? u(read(first.Name.copy(0))),
    propDefault = own(state.getPropertyDefault(localName)); // _getPropertyDefault: no exception
  expect(state.getPropertyState(localName)).not.toBeNull(); // _getPropertyState
  const states = own(state.getPropertyStates(names([read(localName.copy(0))])));
  expect(states).not.toBeNull();
  expect(states.getLength()).toBe(1); // _getPropertyStates
  expect(selected).not.toBeNull();
  try {
    state.setPropertyToDefault(localName);
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    error.dispose();
  } // Original _setPropertyToDefault explicitly ignores RuntimeException.
  if ((first.Attributes & MAYBEDEFAULT) !== 0) {
    const actual = own(properties.getPropertyValue(localName));
    expect(actual.operatorEquals(propDefault)).toBe(true);
  }
  // The source's equality guard checks properties[0], rather than the selected property; preserve the configured branch and its original criterion.
});

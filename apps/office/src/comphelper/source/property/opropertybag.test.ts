/** @fileoverview Actual registered PropertyBag construction, defaults, typed configuration, native sequences, identity, modification and source edge behavior. No document service/provider is substituted. */
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { afterEach, beforeAll, expect, it } from "vitest";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { getProcessComponentContext } from "../../inc/processfactory";
import { PropertyBag } from "../../../udkapi/com/sun/star/beans/PropertyBag";

import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType } from "../../../cppu/inc/unotype";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XPropertyState } from "../../../udkapi/com/sun/star/beans/XPropertyState";
import { XPropertySetOption } from "../../../udkapi/com/sun/star/beans/XPropertySetOption";
import { XMultiPropertySet } from "../../../udkapi/com/sun/star/beans/XMultiPropertySet";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import { XSet } from "../../../udkapi/com/sun/star/container/XSet";
import { XModifiable } from "../../../offapi/com/sun/star/util/XModifiable";
import { XModifyListener } from "../../../offapi/com/sun/star/util/XModifyListener";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as valueType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import {
  BOUND,
  REMOVABLE,
  MAYBEDEFAULT,
  READONLY,
} from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { IllegalTypeException } from "../../../udkapi/com/sun/star/beans/IllegalTypeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../../sal/inc/rtl/ustring";
const Types = Sequence.specialize<Type>("Type", 8),
  Values = Sequence.specialize<PropertyValue>(valueType, 48),
  Args = Sequence.specialize<Any>("Any", 24),
  Names = Sequence.specialize<OUString>("OUString", 8);
beforeAll(
  /** Installs the production UNO registry for these service tests. @returns Original operation result. */ () =>
    InitApplicationServiceManager(implementations),
);
afterEach(releaseDomScope);
/** Actual constructor route. @param typed - Use typed constructor. @returns Acquired service. */
function bag(typed = false) {
  const context = own(new Reference<XComponentContext>(getProcessComponentContext().get()));
  return own(
    typed
      ? PropertyBag.createWithTypes(context, own(new Types()), false, false)
      : PropertyBag.createDefault(context),
  );
}
/** Actual native numeric fixture. @param value - Value. @param type - Static fixture type. @returns Owned Any. */
function number(value: number, type: "sal_Int32" | "sal_Int16" = "sal_Int32") {
  return own(new Any([value], type));
}
/** Disposes original typed failure after asserting it. @param action - Real operation. @param type - Actual exception constructor. @param message - Optional exact message. @returns Nothing. */
function failure(action: () => unknown, type: { readonly prototype: Exception }, message?: string) {
  let found = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error).toBeInstanceOf(type);
      if (message !== undefined) expect(read(new OUString(error.Message))).toBe(message);
      found = true;
    } finally {
      error.dispose();
    }
  }
  expect(found).toBe(true);
}
/** Property-access fixture constructed by the normal generated struct. @param entries - Actual name/value pairs. @returns Native sequence. */
function properties(entries: readonly (readonly [string, Any])[]) {
  const items = entries.map(
    /** Executes the actual native-value test operation. @param value0 - Declared source operand. @returns Original operation result. */ ([
      name,
      value,
    ]) => own(new PropertyValue(u(name), 999, value, PropertyState.AMBIGUOUS_VALUE)),
  );
  return own(
    new Values(
      {
        /** Actual declared struct-array address. @param offset - Byte offset. @returns Original owner. */
        get(offset: number) {
          return items[offset / 48];
        },
      },
      items.length,
    ),
  );
}
/** Real application modification observer. */
class Observer extends WeakImplHelper.specialize(XModifyListener) implements XModifyListener {
  calls = 0;
  source: unknown;
  /** Optional listener action. @param action - Callback. @returns Observer. */
  constructor(private readonly action?: (event: Readonly<EventObject>) => void) {
    super();
  }
  /** Actual modified callback. @param event - Source event. @returns Nothing. */
  modified(event: Readonly<EventObject>): void {
    ++this.calls;
    this.source = event.Source.get();
    this.action?.(event);
  }
  /** Required event listener. @param event - Source event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    void event;
  }
}
it("constructs through production service manager with shared facets, type provider and source service info", /** Verifies constructs through production service manager with shared facets, type provider and source service info. @returns Original operation result. */ () => {
  const reference = bag(),
    value = reference.operatorStar(),
    info = own(new Reference<XServiceInfo>(reference, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(read(info.operatorStar().getImplementationName())).toBe(
    "com.sun.star.comp.comphelper.OPropertyBag",
  );
  expect(info.operatorStar().supportsService(u("com.sun.star.beans.PropertyBag"))).toBe(true);
  expect(info.operatorStar().supportsService(u("other"))).toBe(false);
  for (const declaration of [
    XPropertyState,
    XMultiPropertySet,
    XPropertySetOption,
    XSet,
    XModifiable,
    XInitialization,
    XTypeProvider,
  ])
    expect(own(new Reference(reference, UNO_QUERY_THROW, declaration.static_type)).get()).toBe(
      value,
    );
  const provider = own(
    new Reference<XTypeProvider>(reference, UNO_QUERY_THROW, XTypeProvider.static_type),
  );
  expect(own(provider.operatorStar().getTypes()).getLength()).toBe(12);
  expect(own(provider.operatorStar().getImplementationId()).getLength()).toBe(0);
  expect(own(own(value.getPropertySetInfo()).operatorStar().getProperties()).getLength()).toBe(0);
});
it("preserves snapshot info, handle cycle, default states, ordinary conversion and removal", /** Verifies preserves snapshot info, handle cycle, default states, ordinary conversion and removal. @returns Original operation result. */ () => {
  const ref = bag(true),
    value = ref.operatorStar(),
    state = own(
      new Reference<XPropertyState>(ref, UNO_QUERY_THROW, XPropertyState.static_type),
    ).operatorStar(),
    before = own(value.getPropertySetInfo());
  value.addProperty(u("B"), BOUND | REMOVABLE | MAYBEDEFAULT, number(41));
  value.addProperty(u("A"), REMOVABLE, number(1));
  const info = own(value.getPropertySetInfo());
  expect(own(info.operatorStar().getPropertyByName(u("B"))).Handle).toBe(11);
  expect(own(info.operatorStar().getPropertyByName(u("A"))).Handle).toBe(121);
  expect(before.operatorStar().hasPropertyByName(u("B"))).toBe(false);
  expect(state.getPropertyState(u("B"))).toBe(PropertyState.DEFAULT_VALUE);
  expect(state.getPropertyState(u("A"))).toBe(PropertyState.DIRECT_VALUE);
  value.setPropertyValue(u("B"), number(42, "sal_Int16"));
  expect(state.getPropertyState(u("B"))).toBe(PropertyState.DIRECT_VALUE);
  state.setPropertyToDefault(u("B"));
  expect(own(value.getPropertyValue(u("B"))).operatorEquals(number(41))).toBe(true);
  value.removeProperty(u("B"));
  expect(info.operatorStar().hasPropertyByName(u("B"))).toBe(true);
  expect(own(value.getPropertySetInfo()).operatorStar().hasPropertyByName(u("B"))).toBe(false);
});
it("uses sorted XPropertyAccess values and complete handles/state while leaving caller sequence unchanged", /** Verifies uses sorted XPropertyAccess values and complete handles/state while leaving caller sequence unchanged. @returns Original operation result. */ () => {
  const ref = bag(),
    value = ref.operatorStar();
  value.addProperty(u("Z"), MAYBEDEFAULT, number(1));
  value.addProperty(u("A"), 0, number(2));
  const input = properties([
    ["Z", number(4)],
    ["A", number(3)],
  ]);
  value.setPropertyValues(input);
  expect(
    read(
      new OUString(
        PropertyValue.unacquired(input.operatorIndex(0) as { get(offset: number): unknown }).Name,
      ),
    ),
  ).toBe("Z");
  const result = own(value.getPropertyValues()),
    a = PropertyValue.unacquired(result.operatorIndex(0) as { get(offset: number): unknown }),
    z = PropertyValue.unacquired(result.operatorIndex(1) as { get(offset: number): unknown });
  expect(read(new OUString(a.Name))).toBe("A");
  expect(a.Handle).toBe(121);
  expect(Any.prototype.operatorEquals.call(z.Value, number(4))).toBe(true);
  expect(z.State).toBe(PropertyState.DIRECT_VALUE);
  const multi = own(
      new Reference<XMultiPropertySet>(ref, UNO_QUERY_THROW, XMultiPropertySet.static_type),
    ).operatorStar(),
    names = own(
      new Names(
        {
          get: /** Projects the actual native fixture address. @returns Original operation result. */ () =>
            u("A").getDataAddress(),
        },
        1,
      ),
    ),
    values = own(
      new Args(
        {
          get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
            number(7),
        },
        1,
      ),
    );
  multi.setPropertyValues(names, values);
  expect(
    Any.prototype.operatorEquals.call(
      own(multi.getPropertyValues(names)).operatorIndex(0),
      number(7),
    ),
  ).toBe(true);
});
it("rejects unknown access properties, allows inherited multi setter unknowns and preserves readonly failure", /** Verifies rejects unknown access properties, allows inherited multi setter unknowns and preserves readonly failure. @returns Original operation result. */ () => {
  const ref = bag(),
    value = ref.operatorStar();
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      value.setPropertyValues(properties([["missing", number(4)]])),
    UnknownPropertyException,
  );
  value.addProperty(u("R"), READONLY, number(1));
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      value.setPropertyValues(properties([["R", number(4)]])),
    PropertyVetoException,
  );
});
it("honors allowed-type constructors, VOID rejection and original default-void XSet workaround", /** Verifies honors allowed-type constructors, VOID rejection and original default-void XSet workaround. @returns Original operation result. */ () => {
  const context = own(new Reference<XComponentContext>(getProcessComponentContext().get())),
    types = own(
      new Types(
        {
          get: /** Projects the actual native fixture address. @returns Original operation result. */ () =>
            UnoType.get("sal_Int32").getAddress(),
        },
        1,
      ),
    ),
    ref = own(PropertyBag.createWithTypes(context, types, true, false)),
    value = ref.operatorStar(),
    set = own(new Reference<XSet>(ref, UNO_QUERY_THROW, XSet.static_type)).operatorStar();
  value.addProperty(u(""), REMOVABLE, number(1));
  failure(
    /** Projects the actual native fixture address. @returns Original operation result. */ () =>
      value.addProperty(u("S"), 0, own(new Any(u("text").getDataAddress(), "OUString"))),
    IllegalTypeException,
    "",
  );
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      value.addProperty(u("void"), 0, own(new Any())),
    IllegalTypeException,
    "The initial value must be non-NULL to determine the property type.",
  );
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      set.insert(number(1)),
    IllegalArgumentException,
    "element is not Property",
  );
  const descriptor = own(
    new Property(u("D"), 999, UnoType.get("sal_Int32"), REMOVABLE | MAYBEDEFAULT),
  );
  set.insert(own(new Any(descriptor, propertyType)));
  expect(own(value.getPropertyValue(u("D"))).hasValue()).toBe(false);
  expect(set.has(number(1))).toBe(false);
  expect(set.hasElements()).toBe(false);
  expect(own(set.createEnumeration()).is()).toBe(false);
  expect(own(set.getElementType()).equals(UnoType.get("void"))).toBe(true);
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      set.remove(number(1)),
    NoSuchElementException,
  );
  const bad = own(new Property(u("bad"), 0, UnoType.get("OUString"), 0));
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      set.insert(own(new Any(bad, propertyType))),
    IllegalArgumentException,
    "not in list of allowed types",
  );
});
it("initializes named arguments, preserves sticky empty names/type union and auto-add initial defaults", /** Verifies initializes named arguments, preserves sticky empty names/type union and auto-add initial defaults. @returns Original operation result. */ () => {
  const ref = bag(),
    value = ref.operatorStar(),
    initialization = own(
      new Reference<XInitialization>(ref, UNO_QUERY_THROW, XInitialization.static_type),
    ).operatorStar(),
    types = own(
      new Types(
        {
          get: /** Projects the actual native fixture address. @returns Original operation result. */ () =>
            UnoType.get("sal_Int32").getAddress(),
        },
        1,
      ),
    );
  const named = own(new NamedValue(u("AutomaticAddition"), own(new Any([true], "bool")))),
    empty = own(new NamedValue(u("AllowEmptyPropertyName"), own(new Any([true], "bool")))),
    allowed = own(
      new NamedValue(u("AllowedTypes"), own(new Any(types.getAddress(), ["Sequence", "Type"]))),
    ),
    items = [
      own(new Any(named, namedType)),
      own(new Any(empty, namedType)),
      own(new Any(allowed, namedType)),
    ],
    args = own(
      new Args(
        {
          get: /** Projects the actual native fixture address. @param offset - Native byte offset. @returns Original operation result. */ (
            offset: number,
          ) => items[offset / 24],
        },
        3,
      ),
    );
  initialization.initialize(args);
  value.setPropertyValues(properties([["New", number(44)]]));
  value.addProperty(u(""), REMOVABLE, number(3));
  const state = own(
    new Reference<XPropertyState>(ref, UNO_QUERY_THROW, XPropertyState.static_type),
  ).operatorStar();
  expect(state.getPropertyState(u("New"))).toBe(PropertyState.DEFAULT_VALUE);
  expect(own(state.getPropertyDefault(u("New"))).operatorEquals(number(44))).toBe(true);
  initialization.initialize(own(new Args()));
  value.removeProperty(u("New"));
  value.setPropertyValues(properties([["Again", number(45)]]));
  value.removeProperty(u(""));
  const stringTypes = own(
      new Types(
        {
          get: /** Projects the actual native fixture address. @returns Original operation result. */ () =>
            UnoType.get("OUString").getAddress(),
        },
        1,
      ),
    ),
    positional = [
      own(new Any(stringTypes.getAddress(), ["Sequence", "Type"])),
      own(new Any([false], "bool")),
      own(new Any([false], "bool")),
    ];
  const repeated = own(
    new Args(
      {
        get: /** Projects the actual native fixture address. @param offset - Native byte offset. @returns Original operation result. */ (
          offset: number,
        ) => positional[offset / 24],
      },
      3,
    ),
  );
  initialization.initialize(repeated);
  initialization.initialize(repeated);
  value.addProperty(
    u(""),
    REMOVABLE,
    own(new Any(u("still allowed").getDataAddress(), "OUString")),
  );
  value.addProperty(u("LongStillAllowed"), 0, number(46));
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      value.setPropertyValues(properties([["AutoDisabled", number(47)]])),
    UnknownPropertyException,
  );
});
it("notifies repeated true assignments, ignores false assignments and responds to actual changes before bound filtering", /** Verifies notifies repeated true assignments, ignores false assignments and responds to actual changes before bound filtering. @returns Original operation result. */ () => {
  const ref = bag(),
    value = ref.operatorStar(),
    modifiable = own(
      new Reference<XModifiable>(ref, UNO_QUERY_THROW, XModifiable.static_type),
    ).operatorStar(),
    observer = new Observer(),
    listener = own(new Reference(observer));
  modifiable.addModifyListener(listener);
  expect(modifiable.isModified()).toBe(false);
  modifiable.setModified(true);
  modifiable.setModified(true);
  modifiable.setModified(false);
  expect(observer.calls).toBe(2);
  value.addProperty(u("P"), 0, number(1));
  expect(observer.source).toBe(value);
  modifiable.setModified(false);
  value.setPropertyValue(u("P"), number(2));
  expect(modifiable.isModified()).toBe(true);
  expect(observer.calls).toBe(4);
  own(new Reference<XPropertySetOption>(ref, UNO_QUERY_THROW, XPropertySetOption.static_type))
    .operatorStar()
    .enableChangeListenerNotification(false);
  modifiable.setModified(false);
  value.setPropertyValue(u("P"), number(3));
  expect(modifiable.isModified()).toBe(false);
  modifiable.removeModifyListener(listener);
  modifiable.setModified(true);
  expect(observer.calls).toBe(4);
});
it("preserves original listener exception policy and disposed-listener removal", /** Verifies preserves original listener exception policy and disposed-listener removal. @returns Original operation result. */ () => {
  const ref = bag(),
    modifiable = own(
      new Reference<XModifiable>(ref, UNO_QUERY_THROW, XModifiable.static_type),
    ).operatorStar(),
    listener = own(
      new Reference(
        new Observer(
          /** Raises the original callback failure value. @returns Original operation result. */ () => {
            throw new RuntimeException();
          },
        ),
      ),
    );
  modifiable.addModifyListener(listener);
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      modifiable.setModified(true),
    RuntimeException,
  );
  modifiable.removeModifyListener(listener);
  const general = own(
    new Reference(
      new Observer(
        /** Raises the original callback failure value. @returns Original operation result. */ () => {
          throw new Exception();
        },
      ),
    ),
  );
  modifiable.addModifyListener(general);
  modifiable.setModified(true);
  modifiable.removeModifyListener(general);
  const disposed = new Observer(
      /** Raises the original callback failure value. @returns Original operation result. */ () => {
        throw new DisposedException(u("gone"), new Reference(disposed));
      },
    ),
    disposedRef = own(new Reference(disposed));
  modifiable.addModifyListener(disposedRef);
  modifiable.setModified(true);
  modifiable.setModified(true);
  expect(disposed.calls).toBe(1);
});
it("allocates actual 1008-element prime cycle then linear handles without collisions", /** Verifies allocates actual 1008-element prime cycle then linear handles without collisions. @returns Original operation result. */ () => {
  const ref = bag(),
    value = ref.operatorStar();
  for (let i = 0; i < 1010; ++i) value.addProperty(u("P" + i), 0, number(i));
  const all = own(value.getPropertyValues());
  expect(all.getLength()).toBe(1010);
  const handles = new Set<number>();
  for (let i = 0; i < all.getLength(); ++i)
    handles.add(
      PropertyValue.unacquired(all.operatorIndex(i) as { get(offset: number): unknown }).Handle,
    );
  expect(handles.size).toBe(1010);
  expect(handles.has(1009)).toBe(true);
});

it("ports qadevOOo XPropertyAccess before/get/set entry points for an actual configured String property", /** Verifies ports qadevOOo XPropertyAccess before/get/set entry points for an actual configured String property. @returns Original operation result. */ () => {
  // Original before(): the required propertyToChange relation is supplied by this real service configuration.
  const value = bag().operatorStar(),
    changed = own(new Any(u("changed").getDataAddress(), "OUString"));
  value.addProperty(
    u("ConfiguredString"),
    0,
    own(new Any(u("initial").getDataAddress(), "OUString")),
  );
  const propertyToChange = properties([["ConfiguredString", changed]]);
  // Original getter checks the required name is present; it does not assert value equality.
  const returned = own(value.getPropertyValues());
  let found = false;
  for (let i = 0; i < returned.getLength(); ++i)
    if (
      PropertyValue.unacquired(
        returned.operatorIndex(i) as { get(offset: number): unknown },
      ).Name.equals(u("ConfiguredString"))
    )
      found = true;
  expect(found).toBe(true);
  // Original setter: configured write succeeds, Integer10 -> String fails, invalid name fails.
  value.setPropertyValues(propertyToChange);
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      value.setPropertyValues(properties([["ConfiguredString", number(10)]])),
    IllegalArgumentException,
  );
  failure(
    /** Projects the actual native fixture address. @returns Original operation result. */ () =>
      value.setPropertyValues(
        properties([
          [
            "XPropertyAccess.InvalidPropertyName",
            own(new Any(u("invalid property").getDataAddress(), "OUString")),
          ],
        ]),
      ),
    UnknownPropertyException,
  );
  // Independent stronger assertion, separate from the source QA's successful-call criterion.
  expect(own(value.getPropertyValue(u("ConfiguredString"))).operatorEquals(changed)).toBe(true);
});

import { defaultBootstrap_InitialComponentContext } from "../../../cppuhelper/source/defaultbootstrap";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
it("preserves generated helper assertions and missing-service deployment errors through an actual empty registry", /** Verifies preserves generated helper assertions and missing-service deployment errors through an actual empty registry. @returns Original operation result. */ () => {
  const context = own(defaultBootstrap_InitialComponentContext([])),
    types = own(new Types());
  expect(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      PropertyBag.createDefault(own(new Reference<XComponentContext>())),
  ).toThrow("assert(the_context.is())");
  expect(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      PropertyBag.createWithTypes(own(new Reference<XComponentContext>()), types, false, false),
  ).toThrow("assert(the_context.is())");
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      PropertyBag.createDefault(context),
    DeploymentException,
    "component context fails to supply service com.sun.star.beans.PropertyBag of type com.sun.star.beans.XPropertyBag",
  );
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      PropertyBag.createWithTypes(context, types, false, false),
    DeploymentException,
    "component context fails to supply service com.sun.star.beans.PropertyBag of type com.sun.star.beans.XPropertyBag",
  );
});
it("rejects incompatible named initialization values through the original typed collection diagnostic", /** Verifies rejects incompatible named initialization values through the original typed collection diagnostic. @returns Original operation result. */ () => {
  const ref = bag(),
    init = own(
      new Reference<XInitialization>(ref, UNO_QUERY_THROW, XInitialization.static_type),
    ).operatorStar(),
    named = own(
      new NamedValue(u("AutomaticAddition"), own(new Any(u("wrong").getDataAddress(), "OUString"))),
    ),
    wrapped = own(new Any(named, namedType));
  failure(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      init.initialize(
        own(
          new Args(
            {
              get: /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
                wrapped,
            },
            1,
          ),
        ),
      ),
    IllegalArgumentException,
    "Invalid value type for 'AutomaticAddition'.\nExpected: boolean\nFound: string",
  );
});

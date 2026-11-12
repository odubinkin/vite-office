/** @fileoverview Complete original property-state helper and abstract stateful weak component. Source multiple-inheritance lowering keeps actual non-interface broadcast base ownership and one real OWeakObject; native OSL locking and physical ABI remain unqualified. */
import { OPropertySetHelper2, PROPERTYSET_SELF_EVENT_HOOK } from "../../../cppuhelper/inc/propshlp";
import { OWeakObject } from "../../../cppuhelper/inc/weak";
import { queryInterface } from "../../../cppuhelper/inc/queryinterface";
import { OMutexAndBroadcastHelper } from "../../inc/broadcasthelper";
import type { IEventNotificationHook } from "../../../cppuhelper/inc/propshlp";
import type { OBroadcastHelper } from "../../../cppuhelper/inc/interfacecontainer";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XWeak } from "../../../cppu/inc/com/sun/star/uno/XWeak";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { XPropertyState } from "../../../udkapi/com/sun/star/beans/XPropertyState";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XMultiPropertySet } from "../../../udkapi/com/sun/star/beans/XMultiPropertySet";
import { XFastPropertySet } from "../../../udkapi/com/sun/star/beans/XFastPropertySet";
import { XPropertySetOption } from "../../../udkapi/com/sun/star/beans/XPropertySetOption";
import { Property } from "../../../udkapi/com/sun/star/beans/Property";
import {
  PropertyState,
  cppu_detail_getUnoType_PropertyState as stateType,
} from "../../../udkapi/com/sun/star/beans/PropertyState";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { uno_type_equalData } from "../../../cppu/inc/uno/data";
import { cpp_queryInterface, cpp_release } from "../../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as R } from "../../../cppu/inc/typelib/typedescription";
import { concatSequences } from "../../inc/sequence";
const specializations = new WeakMap<new () => OWeakObject, unknown>(),
  Types = Sequence.specialize<Type>("Type", 8),
  States = Sequence.specialize<PropertyState>(stateType, 4);
/** Original UnknownPropertyException(name). @param name - Source name. @returns Never. */
function unknown(name: OUStringConstReference): never {
  const context = new Reference();
  try {
    throw new UnknownPropertyException(name, context);
  } finally {
    context.dispose();
  }
}
/** Original source initializer-list constructor over actual Type fields. @param types - Declared source Types. @returns Owned native sequence. */
function typeSequence(types: readonly Type[]): Sequence<Type> {
  return new Types(
    {
      /** Original element field address. @param offset - Bytes. @returns Actual Type pointer cell. */ get(
        offset: number,
      ): unknown {
        return (types[offset / 8] as Type).getAddress();
      },
    },
    types.length,
  );
}
/** Original property-state facet over the actual supplied weak root. */
export const OPropertyStateHelper = {
  /** Compiler binding of the same concrete multiple-inheritance declaration. @param Base - Actual root constructor. @returns Stable abstract state helper. */ specialize(
    Base: new () => OWeakObject,
  ) {
    const Parent = OPropertySetHelper2.specialize(Base);
    /** Original source helper methods; no property/default store is supplied here. */ abstract class Body
      extends Parent
      implements XPropertyState
    {
      /** Original hook and default constructors. @param broadcaster - Actual longer-lived broadcaster. @param hook - Borrowed hook or source this cast. @returns State facet. */ constructor(
        broadcaster: OBroadcastHelper,
        hook: IEventNotificationHook | null | typeof PROPERTYSET_SELF_EVENT_HOOK = null,
      ) {
        super(broadcaster, hook);
      }
      /** Original inherited facets precede XPropertyState query. @param type - Type. @returns Owned Any. */ override queryInterface(
        type: Type,
      ): Any {
        const result = Parent.prototype.queryInterface.call(this, type);
        if (result.hasValue()) return result;
        result.dispose();
        return queryInterface(type, [[XPropertyState.static_type, this]]);
      }
      /** Original protected static type list contains the option that helper2's inherited three-type list omits. @returns Owned five types. */ static getTypes(): Sequence<Type> {
        return typeSequence([
          XPropertySet.static_type(),
          XMultiPropertySet.static_type(),
          XFastPropertySet.static_type(),
          XPropertySetOption.static_type(),
          XPropertyState.static_type(),
        ]);
      }
      /** Original non-vetoable explicit notification. @param handle - Handle. @param value - New value. @param old - Old value. @returns Nothing. */ protected firePropertyChange(
        handle: number,
        value: Any,
        old: Any,
      ): void {
        this.fire([handle], [value], [old], 1, false);
      }
      /** Original name lookup before state callback. @param name - Name. @returns Original state. */ getPropertyState(
        name: OUStringConstReference,
      ): PropertyState {
        const handle = this.getInfoHelper().getHandleByName(name);
        if (handle === -1) unknown(name);
        return this.getPropertyStateByHandle(handle);
      }
      /** Original name lookup before reset. @param name - Name. @returns Nothing. */ setPropertyToDefault(
        name: OUStringConstReference,
      ): void {
        const handle = this.getInfoHelper().getHandleByName(name);
        if (handle === -1) unknown(name);
        this.setPropertyToDefaultByHandle(handle);
      }
      /** Original name lookup before default callback. @param name - Name. @returns Owned Any. */ getPropertyDefault(
        name: OUStringConstReference,
      ): Any {
        const handle = this.getInfoHelper().getHandleByName(name);
        if (handle === -1) unknown(name);
        return this.getPropertyDefaultByHandle(handle);
      }
      /** Original forward-only search stops at the first missing name, leaving remaining native default enum values untouched. @param names - Source sorted names. @returns Owned states. */ getPropertyStates(
        names: Sequence<OUString>,
      ): Sequence<PropertyState> {
        const length = names.getLength(),
          output = new States(length);
        let properties: Sequence<Property> | null = null;
        try {
          properties = this.getInfoHelper().getProperties();
          const values = output.getArray() as SequenceElements,
            descriptions = properties.getArray() as SequenceElements,
            input = names.getConstArray() as SequenceElements;
          let current = 0,
            destination = 0;
          for (let i = 0; i < length; ++i) {
            const name = OUString.unacquired(
              input.get(i * 8) as Parameters<typeof OUString.unacquired>[0],
            );
            while (
              current < properties.getLength() &&
              !Property.unacquired(
                descriptions.get(current * 32) as { get(offset: number): unknown },
              ).Name.equals(name)
            )
              ++current;
            if (current === properties.getLength()) break;
            const descriptor = Property.unacquired(
              descriptions.get(current * 32) as { get(offset: number): unknown },
            );
            (values.get(destination++ * 4) as [number])[0] = this.getPropertyStateByHandle(
              descriptor.Handle,
            );
          }
          return output;
        } catch (error) {
          output.dispose();
          throw error;
        } finally {
          properties?.dispose();
        }
      }
      /** Original default/current variable names are reversed but shared UNO equality compares the actual values and types. @param handle - Handle. @returns DEFAULT or DIRECT. */ getPropertyStateByHandle(
        handle: number,
      ): PropertyState {
        const current = this.getPropertyDefaultByHandle(handle),
          defaults = new Any();
        try {
          this.readFastPropertyValue(defaults, handle);
          return uno_type_equalData(
            current.getValue(),
            current.getValueType().getTypeLibType() as R,
            defaults.getValue(),
            defaults.getValueType().getTypeLibType() as R,
            cpp_queryInterface,
            cpp_release,
          )
            ? PropertyState.DEFAULT_VALUE
            : PropertyState.DIRECT_VALUE;
        } finally {
          defaults.dispose();
          current.dispose();
        }
      }
      /** Original default retrieval then ordinary setter, preserving readonly/veto/notification behavior. @param handle - Handle. @returns Nothing. */ setPropertyToDefaultByHandle(
        handle: number,
      ): void {
        const value = this.getPropertyDefaultByHandle(handle);
        try {
          this.setFastPropertyValue(handle, value);
        } finally {
          value.dispose();
        }
      }
      /** Original base default is VOID and does not validate the handle; concrete owners override with real defaults. @param handle - Ignored original parameter. @returns Actual empty Any. */ getPropertyDefaultByHandle(
        handle: number,
      ): Any {
        void handle;
        return new Any();
      }
    }
    const previous = specializations.get(Base);
    if (previous) return previous as typeof Body;
    specializations.set(Base, Body);
    return Body;
  },
};
const StatefulBase = OPropertyStateHelper.specialize(OWeakObject);
/** Complete original abstract stateful component; concrete derived classes must supply the original property callbacks. */
export abstract class OStatefulPropertySet extends StatefulBase implements XTypeProvider {
  private readonly broadcastBase: OMutexAndBroadcastHelper;
  /** Original non-interface broadcast base is initialized before its dependent property facet; its object is the actual base subobject, not another UNO owner. @returns Stateful object. */ protected constructor() {
    const base = new OMutexAndBroadcastHelper();
    super(base.GetBroadcastHelper());
    this.broadcastBase = base;
  }
  /** Original implicit base destructor order: property facet, broadcast data, type provider, weak object. @returns Nothing. */ protected override destroy(): void {
    this.destroyPropertySetHelper();
    this.broadcastBase.dispose();
    this.destroyPropertySetRoot();
  }
  /** Original inherited base accessor. @returns Actual broadcaster. */ GetBroadcastHelper(): OBroadcastHelper {
    return this.broadcastBase.GetBroadcastHelper();
  }
  /** Original weak/type-provider/state query order. @param type - Type. @returns Owned Any. */ override queryInterface(
    type: Type,
  ): Any {
    let result = OWeakObject.prototype.queryInterface.call(this, type);
    if (!result.hasValue()) {
      result.dispose();
      result = queryInterface(type, [[XTypeProvider.static_type, this]]);
    }
    if (!result.hasValue()) {
      result.dispose();
      result = StatefulBase.prototype.queryInterface.call(this, type);
    }
    return result;
  }
  /** Original two explicit root/provider types plus the five source state helper types. @returns Owned seven types without deduplication. */ override getTypes(): Sequence<Type> {
    const roots = typeSequence([XWeak.static_type(), XTypeProvider.static_type()]),
      state = StatefulBase.getTypes();
    try {
      return concatSequences(Types, roots, state);
    } finally {
      state.dispose();
      roots.dispose();
    }
  }
  /** Original obsolete identifier is empty. @returns Actual owned empty byte sequence. */ getImplementationId(): Sequence<number> {
    return new (Sequence.specialize<number>("sal_Int8", 1))();
  }
  /** Original qualified weak acquire. @returns Nothing. */ override acquire(): void {
    OWeakObject.prototype.acquire.call(this);
  }
  /** Original qualified weak release. @returns Nothing. */ override release(): void {
    OWeakObject.prototype.release.call(this);
  }
}

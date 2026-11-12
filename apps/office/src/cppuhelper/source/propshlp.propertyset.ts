/** @fileoverview Original published OPropertySetHelper/2 value and notification algorithms. Compiler-specialized multiple-inheritance flattening keeps one actual supplied weak root, actual broadcast/Any/Sequence owners and source callback order. Native mutex scopes/physical ABI remain unqualified. */
import { OWeakObject } from "../inc/weak";
import { queryInterface } from "../inc/queryinterface";
import {
  IPropertyArrayHelper,
  OPropertySetHelperInfo_Impl,
  type IEventNotificationHook,
} from "./propshlp";
import {
  OBroadcastHelper,
  OMultiTypeInterfaceContainerHelperInt32,
  OInterfaceIteratorHelper,
  OInterfaceContainerHelper,
} from "./interfacecontainer";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { Sequence, type SequenceElements } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference, UNO_QUERY } from "../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { Exception } from "../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { UnknownPropertyException } from "../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { PropertyVetoException } from "../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { IllegalArgumentException } from "../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { WrappedTargetException } from "../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { XPropertySet } from "../../udkapi/com/sun/star/beans/XPropertySet";
import { XFastPropertySet } from "../../udkapi/com/sun/star/beans/XFastPropertySet";
import { XMultiPropertySet } from "../../udkapi/com/sun/star/beans/XMultiPropertySet";
import { XPropertySetOption } from "../../udkapi/com/sun/star/beans/XPropertySetOption";
import type { XPropertySetInfo } from "../../udkapi/com/sun/star/beans/XPropertySetInfo";
import { XPropertyChangeListener } from "../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import { XVetoableChangeListener } from "../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import { XPropertiesChangeListener } from "../../udkapi/com/sun/star/beans/XPropertiesChangeListener";
import {
  PropertyChangeEvent,
  cppu_detail_getUnoType_PropertyChangeEvent as eventType,
} from "../../udkapi/com/sun/star/beans/PropertyChangeEvent";
import { EventObject } from "../../udkapi/com/sun/star/lang/EventObject";
import { BOUND, CONSTRAINED, READONLY } from "../../udkapi/com/sun/star/beans/PropertyAttribute";
import { UnoType } from "../../cppu/inc/unotype";
import { uno_type_assignData } from "../../cppu/inc/uno/data";
import {
  cpp_acquire,
  cpp_release,
  cpp_queryInterface,
} from "../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as R } from "../../cppu/inc/typelib/typedescription";
import { withCaughtException } from "../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../inc/exc_hlp";
/** Compiler token for the original base initializer's static_cast<IEventNotificationHook*>(this). It resolves to the same actual instance after JS super, never a hook substitute. */
export const PROPERTYSET_SELF_EVENT_HOOK = Symbol("native property-set self hook cast");
/** Actual concrete weak root in a source multiple-inheritance declaration; no root is synthesized by this helper. */
type RootConstructor = new () => OWeakObject;
const specializations = new WeakMap<RootConstructor, unknown>(),
  specializations2 = new WeakMap<RootConstructor, unknown>();
const Values = Sequence.specialize<Any>("Any", 24),
  Events = Sequence.specialize<PropertyChangeEvent>(eventType, 72),
  Types = Sequence.specialize<Type>("Type", 8);
/** Original internal implementation fields, in declared order. */
class Impl {
  m_bFireEvents = true;
  readonly m_handles: number[] = [];
  readonly m_newValues: Any[] = [];
  readonly m_oldValues: Any[] = [];
  /** Original constructor choices. @param m_bIgnoreRuntimeExceptionsWhileFiring - Policy. @param m_pFireEvents - Borrowed hook. @returns Implementation. */
  constructor(
    readonly m_bIgnoreRuntimeExceptionsWhileFiring: boolean,
    readonly m_pFireEvents: IEventNotificationHook | null,
  ) {}
  /** Original reverse vector destruction. @returns Nothing. */ dispose(): void {
    for (const v of this.m_oldValues) v.dispose();
    for (const v of this.m_newValues) v.dispose();
  }
}
/** Actual initialized native compound address. */ interface Address {
  get(offset: number): unknown;
}
/** Original &sequence[index] field address. @param events - Native events. @param index - Index. @returns Existing storage. */
function eventAt(events: Sequence<PropertyChangeEvent>, index: number): Address {
  return (events.getArray() as SequenceElements).get(index * 72) as Address;
}
/** Actual original name literal binding. @param text - Source ASCII. @returns Owned string. */
function literal(text: string): OUString {
  return new OUString(
    Uint8Array.from(
      text + "\0",
      /** Known literal byte. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Original UnknownPropertyException(name), including its generated empty Context default. @param name - Name. @returns Never. */
function unknown(name: OUStringConstReference): never {
  const context = new Reference();
  try {
    throw new UnknownPropertyException(name, context);
  } finally {
    context.dispose();
  }
}
/** Original decimal-handle diagnostic. @param handle - Handle. @returns Never. */
function unknownHandle(handle: number): never {
  const name = new OUString(OUString.number(handle));
  try {
    unknown(name);
  } finally {
    name.dispose();
  }
}
/** Compiler-erased source std::vector<Any>(count), not a new value/default factory. @param count - Native element count. @returns Actual default-constructed Any owners. */
function values(count: number): Any[] {
  return Array.from(
    { length: count },
    /** Original Any default construction. @returns Actual owner. */ () => new Any(),
  );
}
/** Original vector/array member destruction. @param array - Actual Any owners. @returns Nothing. */
function destroyValues(array: readonly Any[]): void {
  for (const value of array) value.dispose();
}
/** Original inherited Source/name/handle assignments, before any virtual getter call. @param event - Native element. @param source - Acquired root. @param name - Name. @param handle - Handle. @returns Nothing. */
function fillEventHeader(
  event: Address,
  source: Reference<XInterface>,
  name: OUStringConstReference,
  handle: number,
): void {
  const root = UnoType.get("XInterface").getTypeLibType() as R,
    string = UnoType.get("OUString").getTypeLibType() as R;
  void uno_type_assignData(
    event.get(0),
    root,
    source.getAddress(),
    root,
    cpp_queryInterface,
    cpp_acquire,
    cpp_release,
  );
  void uno_type_assignData(
    event.get(8),
    string,
    [name.pData],
    string,
    cpp_queryInterface,
    cpp_acquire,
    cpp_release,
  );
  (event.get(20) as [number])[0] = handle;
}
/** Original complete event field assignments. @param event - Actual native element. @param source - Original acquired root. @param name - Name. @param handle - Handle. @param oldValue - Original old Any. @param newValue - Original requested/converted Any. @returns Nothing. */
function fillEvent(
  event: Address,
  source: Reference<XInterface>,
  name: OUStringConstReference,
  handle: number,
  oldValue: Any,
  newValue: Any,
): void {
  fillEventHeader(event, source, name, handle);
  Any.prototype.assign.call(event.get(24) as Any, oldValue);
  Any.prototype.assign.call(event.get(48) as Any, newValue);
}
/** Original C++ base helper flattened over the supplied actual root; source acquire/release and identity stay with that root. */
export const OPropertySetHelper = {
  /** Compiler binding for one actual concrete multiple-inheritance base. Abstract native callbacks remain abstract and no owner is instantiated here. @param Base - Actual root constructor. @returns Stable abstract helper constructor. */
  specialize(Base: RootConstructor) {
    const Parent = Base;
    /** Actual source helper body; protected overload readFastPropertyValue erases only C++ return-vs-output overload syntax. */
    abstract class Body
      extends Parent
      implements XPropertySet, XFastPropertySet, XMultiPropertySet
    {
      protected readonly aBoundLC = new OMultiTypeInterfaceContainerHelperInt32();
      protected readonly aVetoableLC = new OMultiTypeInterfaceContainerHelperInt32();
      protected readonly propertySet_m_pReserved: Impl;
      /** Original three constructor overloads; native borrowed Mutex scopes are erased. @param rBHelper - Actual longer-lived broadcaster. @param hookOrIgnore - Original selected overload. @param ignore - Original policy default false. @returns Helper facet on the same instance. */
      constructor(
        protected readonly rBHelper: OBroadcastHelper,
        hookOrIgnore:
          IEventNotificationHook | null | boolean | typeof PROPERTYSET_SELF_EVENT_HOOK = null,
        ignore = false,
      ) {
        super();
        const hook =
          hookOrIgnore === PROPERTYSET_SELF_EVENT_HOOK
            ? (this as unknown as IEventNotificationHook)
            : typeof hookOrIgnore === "boolean"
              ? null
              : hookOrIgnore;
        this.propertySet_m_pReserved = new Impl(
          typeof hookOrIgnore === "boolean" ? hookOrIgnore : ignore,
          hook,
        );
      }
      /** Concrete source owner must explicitly lower its own/base destructor order. @returns Nothing. */ protected abstract override destroy(): void;
      /** Compiler-qualified destructor of the supplied real weak base, called in the concrete owner's native base order. @returns Nothing. */
      protected destroyPropertySetRoot(): void {
        super.destroy();
      }
      /** Original protected helper destructor, explicitly qualified by the concrete owner's compiler destructor. @returns Nothing. */ protected destroyPropertySetHelper(): void {
        this.propertySet_m_pReserved.dispose();
        this.aVetoableLC.dispose();
        this.aBoundLC.dispose();
      }
      /** Original exact own-facet query; concrete multiple-inheritance owner handles root/base fallback. @param type - Demanded type. @returns Owned Any. */ override queryInterface(
        type: Type,
      ): Any {
        return queryInterface(type, [
          [XPropertySet.static_type, this],
          [XMultiPropertySet.static_type, this],
          [XFastPropertySet.static_type, this],
        ]);
      }
      /** Original three types, including the intentional inherited omission in helper2. @returns Owned sequence. */ getTypes(): Sequence<Type> {
        const types = [
          XPropertySet.static_type(),
          XMultiPropertySet.static_type(),
          XFastPropertySet.static_type(),
        ];
        return new Types(
          {
            /** Original initializer-list element addresses. @param offset - Byte offset. @returns Existing Type cell. */ get(
              offset: number,
            ): unknown {
              return (types[offset / 8] as Type).getAddress();
            },
          },
          3,
        );
      }
      /** Original static info factory over the actual snapshot component. @param helper - Actual descriptions. @returns Acquired info. */ static createPropertySetInfo(
        helper: IPropertyArrayHelper,
      ): Reference<XPropertySetInfo> {
        return new Reference(new OPropertySetHelperInfo_Impl(helper));
      }
      /** Original disposal notifies named listener containers only; shared unnamed listeners belong to rBHelper's actual owner. @returns Nothing. */ disposing(): void {
        const source = new Reference(this),
          event = new EventObject();
        try {
          event.Source = source;
          this.aBoundLC.disposeAndClear(event);
          this.aVetoableLC.disposeAndClear(event);
        } finally {
          event.dispose();
          source.dispose();
        }
      }
      /** Original source-supplied property metadata. @returns Borrowed helper. */ protected abstract getInfoHelper(): IPropertyArrayHelper;
      /** Original virtual conversion callback. @param converted - Output. @param old - Output. @param handle - Handle. @param value - Requested value. @returns Changed predicate. */ protected abstract convertFastPropertyValue(
        converted: Any,
        old: Any,
        handle: number,
        value: Any,
      ): boolean;
      /** Original virtual no-broadcast setter. @param handle - Handle. @param value - Converted value. @returns Nothing. */ protected abstract setFastPropertyValue_NoBroadcast(
        handle: number,
        value: Any,
      ): void;
      /** Compiler name for the original protected output-parameter getFastPropertyValue overload, distinct from public value-return overload. @param value - Actual native Any output. @param handle - Handle. @returns Nothing. */ protected abstract readFastPropertyValue(
        value: Any,
        handle: number,
      ): void;
      /** Original concrete metadata interface remains supplied by the actual owner. @returns Acquired info. */ abstract getPropertySetInfo(): Reference<XPropertySetInfo>;
      /** Original name mapping, intentionally forwarding unknown minus-one handles. @param name - Name. @param value - Value. @returns Nothing. */ setPropertyValue(
        name: OUStringConstReference,
        value: Any,
      ): void {
        this.setFastPropertyValue(this.getInfoHelper().getHandleByName(name), value);
      }
      /** Original name check before public fast getter. @param name - Name. @returns Owned value. */ getPropertyValue(
        name: OUStringConstReference,
      ): Any {
        const handle = this.getInfoHelper().getHandleByName(name);
        if (handle === -1) unknown(name);
        return this.getFastPropertyValue(handle);
      }
      /** Original bound registration, with diagnostic-only unbound rejection and disposed early return. @param name - Empty means all. @param listener - Listener. @returns Nothing. */ addPropertyChangeListener(
        name: OUStringConstReference,
        listener: Reference<XPropertyChangeListener>,
      ): void {
        if (this.rBHelper.bInDispose || this.rBHelper.bDisposed) return;
        if (!name.isEmpty()) {
          const info = this.getInfoHelper(),
            handle = info.getHandleByName(name);
          if (handle === -1) unknown(name);
          const attrs = [] as unknown as [number];
          info.fillPropertyMembersByHandle(null, attrs, handle);
          if (!(attrs[0] & BOUND)) return;
          this.aBoundLC.addInterface(handle, listener);
        } else this.rBHelper.aLC.addInterface(XPropertyChangeListener.static_type(), listener);
      }
      /** Original removal with disposed suppression. @param name - Empty means all. @param listener - Listener. @returns Nothing. */ removePropertyChangeListener(
        name: OUStringConstReference,
        listener: Reference<XPropertyChangeListener>,
      ): void {
        if (this.rBHelper.bInDispose || this.rBHelper.bDisposed) return;
        if (!name.isEmpty()) {
          const handle = this.getInfoHelper().getHandleByName(name);
          if (handle === -1) unknown(name);
          this.aBoundLC.removeInterface(handle, listener);
        } else this.rBHelper.aLC.removeInterface(XPropertyChangeListener.static_type(), listener);
      }
      /** Original constrained registration. @param name - Empty means all. @param listener - Listener. @returns Nothing. */ addVetoableChangeListener(
        name: OUStringConstReference,
        listener: Reference<XVetoableChangeListener>,
      ): void {
        if (this.rBHelper.bInDispose || this.rBHelper.bDisposed) return;
        if (!name.isEmpty()) {
          const info = this.getInfoHelper(),
            handle = info.getHandleByName(name);
          if (handle === -1) unknown(name);
          const attrs = [] as unknown as [number];
          info.fillPropertyMembersByHandle(null, attrs, handle);
          if (!(attrs[0] & CONSTRAINED)) return;
          this.aVetoableLC.addInterface(handle, listener);
        } else this.rBHelper.aLC.addInterface(XVetoableChangeListener.static_type(), listener);
      }
      /** Original constrained removal. @param name - Empty means all. @param listener - Listener. @returns Nothing. */ removeVetoableChangeListener(
        name: OUStringConstReference,
        listener: Reference<XVetoableChangeListener>,
      ): void {
        if (this.rBHelper.bInDispose || this.rBHelper.bDisposed) return;
        if (!name.isEmpty()) {
          const handle = this.getInfoHelper().getHandleByName(name);
          if (handle === -1) unknown(name);
          this.aVetoableLC.removeInterface(handle, listener);
        } else this.rBHelper.aLC.removeInterface(XVetoableChangeListener.static_type(), listener);
      }
      /** Original dependent setter bypasses readonly/veto checks and queues converted values for later notification. @param handle - Handle. @param value - Requested value. @returns Nothing. */ protected setDependentFastPropertyValue(
        handle: number,
        value: Any,
      ): void {
        const attrs = [] as unknown as [number];
        if (!this.getInfoHelper().fillPropertyMembersByHandle(null, attrs, handle))
          unknownHandle(handle);
        const converted = new Any(),
          old = new Any();
        try {
          if (!this.convertFastPropertyValue(converted, old, handle, value)) return;
          try {
            this.setFastPropertyValue_NoBroadcast(handle, converted);
          } catch (error) {
            if (
              error instanceof UnknownPropertyException ||
              error instanceof PropertyVetoException ||
              error instanceof IllegalArgumentException ||
              error instanceof WrappedTargetException ||
              error instanceof RuntimeException
            )
              throw error;
            if (!(error instanceof Exception)) throw error;
            const wrapped = new WrappedTargetException();
            try {
              const target = withCaughtException(
                error,
                /** Original current catch capture preserves dynamic type and members. @returns Owned captured Any. */ () =>
                  getCaughtException(),
              );
              try {
                Any.prototype.moveAssign.call(wrapped.TargetException, target);
              } finally {
                target.dispose();
              }
              wrapped.Context.assign(this);
            } catch (failure) {
              wrapped.dispose();
              throw failure;
            } finally {
              error.dispose();
            }
            throw wrapped;
          }
          this.propertySet_m_pReserved.m_handles.push(handle);
          this.propertySet_m_pReserved.m_newValues.push(new Any(converted));
          this.propertySet_m_pReserved.m_oldValues.push(new Any(old));
        } finally {
          old.dispose();
          converted.dispose();
        }
      }
      /** Original readonly validation, conversion, unconverted single-value veto/bound notifications and converted storage. Disposed flags are diagnostics only here. @param handle - Handle. @param value - Requested value. @returns Nothing. */ setFastPropertyValue(
        handle: number,
        value: Any,
      ): void {
        const attrs = [] as unknown as [number];
        if (!this.getInfoHelper().fillPropertyMembersByHandle(null, attrs, handle))
          unknownHandle(handle);
        if (attrs[0] & READONLY) throw new PropertyVetoException();
        const converted = new Any(),
          old = new Any();
        try {
          if (!this.convertFastPropertyValue(converted, old, handle, value)) return;
          if (attrs[0] & CONSTRAINED) this.fire([handle], [value], [old], 1, true);
          try {
            this.setFastPropertyValue_NoBroadcast(handle, converted);
          } catch (error) {
            if (
              error instanceof UnknownPropertyException ||
              error instanceof PropertyVetoException ||
              error instanceof IllegalArgumentException ||
              error instanceof WrappedTargetException ||
              error instanceof RuntimeException
            )
              throw error;
            if (!(error instanceof Exception)) throw error;
            const wrapped = new WrappedTargetException();
            try {
              wrapped.Context.assign(this);
              Any.prototype.insert.call(wrapped.TargetException, error, "Exception");
            } catch (failure) {
              wrapped.dispose();
              throw failure;
            } finally {
              error.dispose();
            }
            throw wrapped;
          }
          this.impl_fireAll([handle], [value], [old], 1);
        } finally {
          old.dispose();
          converted.dispose();
        }
      }
      /** Original public handle check then protected callback. Native minus-one assertion is diagnostic, not a fabricated UNO exception. @param handle - Handle. @returns Owned Any. */ getFastPropertyValue(
        handle: number,
      ): Any {
        if (!this.getInfoHelper().fillPropertyMembersByHandle(null, null, handle))
          unknownHandle(handle);
        const value = new Any();
        try {
          this.readFastPropertyValue(value, handle);
          return value;
        } catch (error) {
          value.dispose();
          throw error;
        }
      }
      /** Original dependent events precede the initiating events and pending vectors clear before callbacks. @param handles - Handles. @param newValues - New values. @param oldValues - Old values. @param count - Count. @returns Nothing. */ private impl_fireAll(
        handles: number[],
        newValues: readonly Any[],
        oldValues: readonly Any[],
        count: number,
      ): void {
        const impl = this.propertySet_m_pReserved;
        if (!impl.m_handles.length) {
          this.fire(handles, newValues, oldValues, count, false);
          return;
        }
        const additional = impl.m_handles.length,
          allHandles = [...impl.m_handles, ...handles.slice(0, count)],
          allNew = values(additional + count),
          allOld = values(additional + count);
        try {
          for (let i = 0; i < additional + count; ++i) {
            Any.prototype.assign.call(
              allNew[i] as Any,
              (i < additional ? impl.m_newValues[i] : newValues[i - additional]) as Any,
            );
            Any.prototype.assign.call(
              allOld[i] as Any,
              (i < additional ? impl.m_oldValues[i] : oldValues[i - additional]) as Any,
            );
          }
          impl.m_handles.length = 0;
          destroyValues(impl.m_newValues);
          impl.m_newValues.length = 0;
          destroyValues(impl.m_oldValues);
          impl.m_oldValues.length = 0;
          this.fire(allHandles, allNew, allOld, additional + count, false);
        } finally {
          destroyValues(allOld);
          destroyValues(allNew);
        }
      }
      /** Original iterator notification catch ordering, shared by identical source dispatch loops. @param container - Existing source container. @param action - Source member-call expression. @returns Nothing. */ private notify(
        container: OInterfaceContainerHelper,
        action: (listener: XInterface | null) => void,
      ): void {
        const iterator = new OInterfaceIteratorHelper(container);
        try {
          while (iterator.hasMoreElements()) {
            const listener = iterator.next();
            try {
              try {
                action(listener);
              } catch (error) {
                if (!(error instanceof DisposedException)) throw error;
                if (error.Context.operatorEquals(listener)) {
                  iterator.remove();
                  error.dispose();
                } else throw error;
              }
            } catch (error) {
              if (
                !(error instanceof RuntimeException) ||
                !this.propertySet_m_pReserved.m_bIgnoreRuntimeExceptionsWhileFiring
              )
                throw error;
              error.dispose();
            }
          }
        } finally {
          iterator.dispose();
        }
      }
      /** Original hook-before-zero-count, bound/constrained filtering, named/all/multi callback order and native event sequence ownership. @param handles - Handles. @param newValues - New values. @param oldValues - Old values. @param count - Count. @param vetoable - Original pass. @returns Nothing. */ protected fire(
        handles: number[],
        newValues: readonly Any[],
        oldValues: readonly Any[],
        count: number,
        vetoable: boolean,
      ): void {
        const impl = this.propertySet_m_pReserved;
        if (!impl.m_bFireEvents) return;
        impl.m_pFireEvents?.fireEvents(
          handles,
          count,
          vetoable,
          impl.m_bIgnoreRuntimeExceptionsWhileFiring,
        );
        if (!count) return;
        const events = new Events(count);
        let source: Reference<XInterface> | null = null,
          changed = 0;
        try {
          source = new Reference<XInterface>(this, UNO_QUERY);
          for (let i = 0; i < count; ++i) {
            const attrs = [] as unknown as [number],
              name = new OUString();
            try {
              this.getInfoHelper().fillPropertyMembersByHandle(name, attrs, handles[i] as number);
              if ((vetoable && attrs[0] & CONSTRAINED) || (!vetoable && attrs[0] & BOUND))
                fillEvent(
                  eventAt(events, changed++),
                  source,
                  name,
                  handles[i] as number,
                  oldValues[i] as Any,
                  newValues[i] as Any,
                );
            } finally {
              name.dispose();
            }
          }
          for (let i = 0; i < changed; ++i) {
            const event = PropertyChangeEvent.unacquired(eventAt(events, i)),
              named = (vetoable ? this.aVetoableLC : this.aBoundLC).getContainer(
                event.PropertyHandle,
              );
            if (named)
              this.notify(
                named,
                /** Original direct named-listener cast. @param listener - Native pointer. @returns Nothing. */ (
                  listener,
                ) => {
                  if (vetoable) (listener as XVetoableChangeListener).vetoableChange(event);
                  else (listener as XPropertyChangeListener).propertyChange(event);
                },
              );
            const all = this.rBHelper.aLC.getContainer(
              vetoable
                ? XVetoableChangeListener.static_type()
                : XPropertyChangeListener.static_type(),
            );
            if (all)
              this.notify(
                all,
                /** Original direct unnamed-listener cast. @param listener - Native pointer. @returns Nothing. */ (
                  listener,
                ) => {
                  if (vetoable) (listener as XVetoableChangeListener).vetoableChange(event);
                  else (listener as XPropertyChangeListener).propertyChange(event);
                },
              );
          }
          events.realloc(changed);
          if (vetoable) return;
          const multi = this.rBHelper.aLC.getContainer(XPropertiesChangeListener.static_type());
          if (multi)
            this.notify(
              multi,
              /** Original sequence callback. @param listener - Native pointer. @returns Nothing. */ (
                listener,
              ) => (listener as XPropertiesChangeListener).propertiesChange(events),
            );
        } finally {
          source?.dispose();
          events.dispose();
        }
      }
      /** Original batch compaction of changed handles, converted veto values and all assignments before bound notification. @param length - Source request length. @param handles - Inout mapped handles. @param requested - Actual input Any addresses. @param hits - Valid count. @returns Nothing. */ protected setFastPropertyValues(
        length: number,
        handles: number[],
        requested: readonly Any[],
        hits: number,
      ): void {
        const converted = values(hits),
          old = values(hits);
        let changed = 0;
        try {
          for (let i = 0; i < length; ++i)
            if (handles[i] !== -1) {
              const attrs = [] as unknown as [number];
              this.getInfoHelper().fillPropertyMembersByHandle(null, attrs, handles[i] as number);
              if (attrs[0] & READONLY) throw new PropertyVetoException();
              if (
                this.convertFastPropertyValue(
                  converted[changed] as Any,
                  old[changed] as Any,
                  handles[i] as number,
                  requested[i] as Any,
                )
              )
                handles[changed++] = handles[i] as number;
            }
          this.fire(handles, converted, old, changed, true);
          for (let i = 0; i < changed; ++i)
            this.setFastPropertyValue_NoBroadcast(handles[i] as number, converted[i] as Any);
          this.impl_fireAll(handles, converted, old, changed);
        } finally {
          destroyValues(old);
          destroyValues(converted);
        }
      }
      /** Original sorted unique batch setter, mismatch error and ignored unknowns. @param names - Sorted names. @param requested - Values. @returns Nothing. */ setPropertyValues(
        names: Sequence<OUString>,
        requested: Sequence<Any>,
      ): void {
        const length = names.getLength();
        if (length !== requested.getLength()) {
          const message = literal("lengths do not match"),
            context = new Reference(this);
          try {
            throw new IllegalArgumentException(message, context, -1);
          } finally {
            context.dispose();
            message.dispose();
          }
        }
        const handles: number[] = [],
          hits = this.getInfoHelper().fillHandles(handles, names);
        if (hits) {
          const array = requested.getConstArray() as SequenceElements,
            addresses = Array.from(
              { length },
              /** Compiler pointer arithmetic, no value copy. @param unused - Unused. @param i - Index. @returns Actual input Any address. */ (
                _,
                i,
              ) => array.get(i * 24) as Any,
            );
          this.setFastPropertyValues(length, handles, addresses, hits);
        }
      }
      /** Original batch getter passes unknown minus-one handles to the actual protected callback. @param names - Sorted names. @returns Owned native sequence. */ getPropertyValues(
        names: Sequence<OUString>,
      ): Sequence<Any> {
        const length = names.getLength(),
          handles: number[] = [],
          output = new Values(length);
        try {
          this.getInfoHelper().fillHandles(handles, names);
          const array = output.getArray() as SequenceElements;
          for (let i = 0; i < length; ++i)
            this.readFastPropertyValue(array.get(i * 24) as Any, handles[i] as number);
          return output;
        } catch (error) {
          output.dispose();
          throw error;
        }
      }
      /** Original names argument is ignored, and broadcaster state gating applies. @param names - Ignored names. @param listener - Listener. @returns Nothing. */ addPropertiesChangeListener(
        names: Sequence<OUString>,
        listener: Reference<XPropertiesChangeListener>,
      ): void {
        void names;
        this.rBHelper.addListener(XPropertiesChangeListener.static_type(), listener);
      }
      /** Original one-registration removal. @param listener - Listener. @returns Nothing. */ removePropertiesChangeListener(
        listener: Reference<XPropertiesChangeListener>,
      ): void {
        this.rBHelper.removeListener(XPropertiesChangeListener.static_type(), listener);
      }
      /** Original explicit current-value event includes matching names without bound filtering, setting old=new. @param names - Sorted names. @param listener - Target. @returns Nothing. */ firePropertiesChangeEvent(
        names: Sequence<OUString>,
        listener: Reference<XPropertiesChangeListener>,
      ): void {
        const length = names.getLength(),
          handles: number[] = [],
          info = this.getInfoHelper();
        info.fillHandles(handles, names);
        let count = 0;
        for (let i = 0; i < length; ++i) if (handles[i] !== -1) ++count;
        const events = new Events(count);
        let source: Reference<XInterface> | null = null,
          position = 0;
        try {
          source = new Reference<XInterface>(this, UNO_QUERY);
          const input = names.getConstArray() as SequenceElements;
          for (let i = 0; i < length; ++i)
            if (handles[i] !== -1) {
              const event = eventAt(events, position++),
                name = OUString.unacquired(
                  input.get(i * 8) as Parameters<typeof OUString.unacquired>[0],
                ),
                old = event.get(24) as Any;
              fillEventHeader(event, source, name, handles[i] as number);
              this.readFastPropertyValue(old, handles[i] as number);
              Any.prototype.assign.call(event.get(48) as Any, old);
            }
          if (count) listener.operatorStar().propertiesChange(events);
        } finally {
          source?.dispose();
          events.dispose();
        }
      }
    }
    const previous = specializations.get(Base);
    if (previous) return previous as typeof Body;
    specializations.set(Base, Body);
    return Body;
  },
};
/** Original helper2 adds only the option facet; inherited getTypes intentionally remains the original three-type list. */
export const OPropertySetHelper2 = {
  /** Compiler binding to the same actual weak root and helper base. @param Base - Actual source root. @returns Stable abstract constructor. */ specialize(
    Base: RootConstructor,
  ) {
    const Parent = OPropertySetHelper.specialize(Base);
    /** Original additional interface only. */ abstract class Body
      extends Parent
      implements XPropertySetOption
    {
      /** Original helper2 constructor forwards through the hook overload. @param broadcaster - Actual broadcaster. @param hook - Source hook/cast. @param ignore - Policy. @returns Facet. */ constructor(
        broadcaster: OBroadcastHelper,
        hook: IEventNotificationHook | null | typeof PROPERTYSET_SELF_EVENT_HOOK = null,
        ignore = false,
      ) {
        super(broadcaster, hook, ignore);
      }
      /** Original additional interface then qualified helper fallback. @param type - Type. @returns Owned Any. */ override queryInterface(
        type: Type,
      ): Any {
        const value = queryInterface(type, [[XPropertySetOption.static_type, this]]);
        if (value.hasValue()) return value;
        value.dispose();
        return Parent.prototype.queryInterface.call(this, type);
      }
      /** Original exact source flag assignment. @param enabled - Choice. @returns Nothing. */ enableChangeListenerNotification(
        enabled: boolean,
      ): void {
        this.propertySet_m_pReserved.m_bFireEvents = enabled;
      }
    }
    const previous = specializations2.get(Base);
    if (previous) return previous as typeof Body;
    specializations2.set(Base, Body);
    return Body;
  },
};

/** @fileoverview Original ComponentContext and DisposingForwarder from component_context.cxx, with actual value/reference owners and weak environment registry. Public createComponentContext environment/mapping invocation remains separate; no replacement factory is exported. Native unordered bucket order, locks, physical ABI and noexcept termination remain unverified. */
import { WeakComponentImplHelper2 } from "../inc/compbase2";
import { WeakImplHelper } from "../inc/implbase";
import type { ContextEntry_Init } from "../inc/component_context";
import { XComponentContext } from "../../udkapi/com/sun/star/uno/XComponentContext";
import { XNameContainer } from "../../cppu/inc/com/sun/star/container/XNameContainer";
import { XMultiComponentFactory } from "../../udkapi/com/sun/star/lang/XMultiComponentFactory";
import { XSingleComponentFactory } from "../../udkapi/com/sun/star/lang/XSingleComponentFactory";
import { XSingleServiceFactory } from "../../udkapi/com/sun/star/lang/XSingleServiceFactory";
import { XComponent } from "../../udkapi/com/sun/star/lang/XComponent";
import { XEventListener } from "../../udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../udkapi/com/sun/star/lang/EventObject";
import { XPropertySet } from "../../udkapi/com/sun/star/beans/XPropertySet";
import { ElementExistException } from "../../cppu/inc/com/sun/star/container/ElementExistException";
import { NoSuchElementException } from "../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { DeploymentException } from "../../cppu/inc/com/sun/star/uno/DeploymentException";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../cppu/inc/com/sun/star/uno/Exception";
import { Reference, UNO_QUERY } from "../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType } from "../../cppu/inc/unotype";
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import {
  rtl_uString_release,
  type rtl_uStringSlot,
  type rtl_uString,
} from "../../sal/inc/rtl/ustring.h";
import { osl_atomic_increment, osl_atomic_decrement } from "../../sal/inc/osl/interlck";
import { mapKeysToSequence } from "../../comphelper/inc/sequence";
import {
  uno_getRegisteredEnvironments,
  type uno_Environment,
} from "../../cppu/inc/uno/environment";
/** Known source ASCII constants retain their literal bytes. @param text - Source ASCII literal. @returns Owned original string. */
function literal(text: string): OUString {
  return new OUString(
    Uint8Array.from(
      text + "\0",
      /** Binds source ASCII byte. @param c - Source character. @returns Original byte. */ (c) =>
        c.charCodeAt(0),
    ),
  );
}
const SMGR_SINGLETON = literal("/singletons/com.sun.star.lang.theServiceManager"),
  TDMGR_SINGLETON = literal("/singletons/com.sun.star.reflection.theTypeDescriptionManager"),
  AC_SINGLETON = literal("/singletons/com.sun.star.security.theAccessController"),
  SINGLETON_PREFIX = literal("/singletons/"),
  ROOT = literal("_root");
/** Original borrowed-name concatenation with a known source ASCII suffix. @param name - Actual source name. @param suffix - Exact source suffix. @returns Owned concatenation. */
function suffixed(name: OUStringConstReference, suffix: string): OUString {
  const result = new OUString(name),
    tail = literal(suffix);
  try {
    result.append(tail);
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  } finally {
    tail.dispose();
  }
}
/** Original XInterface overload queries XComponent before disposing; no missing-method inference is used. @param instance - Actual instance reference. @returns Nothing. */
function try_dispose(instance: Reference<XInterface>): void {
  const component = new Reference<XComponent>(instance, UNO_QUERY, XComponent.static_type);
  try {
    if (component.is()) (component.get() as XComponent).dispose();
  } finally {
    component.dispose();
  }
}
/** Original internal entry owns its Any and late-init flag. */
class ContextEntry {
  readonly value: Any;
  lateInit: boolean;
  /** Original by-value Any parameter then member move. @param value - Actual input value. @param lateInit - Original flag. @returns Entry. */
  constructor(value: Any, lateInit: boolean) {
    const parameter = new Any(value);
    try {
      this.value = Any.move(parameter);
    } finally {
      parameter.dispose();
    }
    this.lateInit = lateInit;
  }
  /** Original member destructor. @returns Nothing. */
  dispose(): void {
    this.value.dispose();
  }
}
/** Original delegate event forwarder; source-listener ownership retains target until the actual disposing callback. */
export class DisposingForwarder
  extends WeakImplHelper.specialize(XEventListener)
  implements XEventListener
{
  private readonly m_xTarget: Reference<XComponent>;
  /** Original private target-copy constructor. @param target - Non-null actual target. @returns Forwarder. */
  private constructor(target: Reference<XComponent>) {
    super();
    this.m_xTarget = new Reference(target);
  }
  /** Original adds a forwarder only for a non-null source component. @param source - Actual source component. @param target - Actual target component. @returns Nothing. */
  static listen(source: Reference<XComponent>, target: Reference<XComponent>): void {
    if (source.is()) {
      const forwarder = new Reference<XEventListener>(new DisposingForwarder(target));
      try {
        (source.get() as XComponent).addEventListener(forwarder);
      } finally {
        forwarder.dispose();
      }
    }
  }
  /** Original calls target disposal before clearing its reference; a failure skips clear. @param source - Borrowed event;unused upstream. @returns Nothing. */
  disposing(source: Readonly<EventObject>): void {
    void source;
    (this.m_xTarget.get() as XComponent).dispose();
    this.m_xTarget.clear();
  }
  /** Original implicit target-member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_xTarget.dispose();
    super.destroy();
  }
}
/** Original concrete internal context; all declared interface methods and original construction/disposal bodies are present. Public environment/mapping-based factory/bootstrap remains unported. */
export class ComponentContext
  extends WeakComponentImplHelper2.specialize(XComponentContext, XNameContainer)
  implements XComponentContext, XNameContainer
{
  protected readonly m_xDelegate: Reference<XComponentContext>;
  /** Actual const OUString key fields are addressed slots; map destruction invokes their original string destructor. Lookup uses value equality, without guessing a host hash or claiming native bucket order. */
  protected readonly m_map: Map<rtl_uStringSlot, ContextEntry>;
  protected readonly m_xSMgr: Reference<XMultiComponentFactory>;
  /** Original context constructor consumes exactly nEntries and optionally wraps the delegate manager. @param entries - Original entry array. @param nEntries - Original signed count. @param delegate - Actual delegate. @returns Context. */
  constructor(
    entries: readonly ContextEntry_Init[],
    nEntries: number,
    delegate: Reference<XComponentContext>,
  ) {
    super();
    this.m_xDelegate = new Reference(delegate);
    this.m_map = new Map();
    this.m_xSMgr = new Reference();
    try {
      for (let pos = 0; pos < nEntries; ++pos) {
        const entry = entries[pos] as ContextEntry_Init;
        if (entry.m_sName.equals(SMGR_SINGLETON))
          entry.m_aValue.extract(this.m_xSMgr.getAddress(), XMultiComponentFactory.static_type);
        if (entry.m_bLateInitService) {
          const empty = new Any();
          try {
            this.emplace(entry.m_sName, empty, true);
          } finally {
            empty.dispose();
          }
          const service = suffixed(entry.m_sName, "/service");
          try {
            this.emplace(service, entry.m_aValue, false);
          } finally {
            service.dispose();
          }
        } else this.emplace(entry.m_sName, entry.m_aValue, false);
      }
      if (this.m_xSMgr.is() || !this.m_xDelegate.is()) return;
      const manager = (this.m_xDelegate.get() as XComponentContext).getServiceManager();
      try {
        if (!manager.is()) return;
        osl_atomic_increment(this.m_refCount);
        try {
          const service = literal("com.sun.star.comp.stoc.OServiceManagerWrapper");
          try {
            const wrapper = (manager.get() as XMultiComponentFactory).createInstanceWithContext(
              service,
              delegate,
            );
            try {
              this.m_xSMgr.set(wrapper, UNO_QUERY, XMultiComponentFactory.static_type);
            } finally {
              wrapper.dispose();
            }
          } finally {
            service.dispose();
          }
          const properties = new Reference<XPropertySet>(
            this.m_xSMgr,
            UNO_QUERY,
            XPropertySet.static_type,
          );
          try {
            if (properties.is()) {
              const self = new Reference<XComponentContext>(this),
                name = literal("DefaultContext");
              try {
                const value = new Any(self.getAddress(), XComponentContext.static_type);
                try {
                  (properties.get() as XPropertySet).setPropertyValue(name, value);
                } finally {
                  value.dispose();
                }
              } finally {
                name.dispose();
                self.dispose();
              }
            }
          } finally {
            properties.dispose();
          }
        } finally {
          osl_atomic_decrement(this.m_refCount);
        }
      } finally {
        manager.dispose();
      }
    } catch (error) {
      this.destroyMembers();
      super.destroy();
      throw error;
    }
  }
  /** Native unordered-map value-key lookup binding. @param name - Borrowed exact key. @returns Actual matching field address. */
  private find(name: OUStringConstReference): rtl_uStringSlot | undefined {
    for (const key of this.m_map.keys()) if (OUString.unacquired(key).equals(name)) return key;
    return undefined;
  }
  /** Original emplace constructs its input even for duplicate keys and does not replace the first value. @param name - Original key. @param value - Original value. @param late - Original flag. @returns Insertion result. */
  private emplace(name: OUStringConstReference, value: Any, late: boolean): boolean {
    const entry = new ContextEntry(value, late);
    if (this.find(name) !== undefined) {
      entry.dispose();
      return false;
    }
    const key = new OUString(name);
    this.m_map.set(key.getDataAddress(), entry);
    return true;
  }
  /** Original key/value destruction for map erase/clear. @param key - Actual owned key field. @returns Nothing. */
  private erase(key: rtl_uStringSlot): void {
    (this.m_map.get(key) as ContextEntry).dispose();
    rtl_uString_release(key[0] as rtl_uString);
    this.m_map.delete(key);
  }
  /** Original map clear destroys every stored key/value. @returns Nothing. */
  private clearMap(): void {
    for (const key of this.m_map.keys()) this.erase(key);
  }
  /** Original exception text and real this Context. @param exists - Selects source duplicate or absent branch. @param name - Original key. @returns Never. */
  private fail(exists: boolean, name: OUStringConstReference): never {
    const message = literal(exists ? "element already exists: " : "no such element: "),
      self = new Reference<XInterface>(this);
    try {
      message.append(name);
      throw exists
        ? new ElementExistException(message, self)
        : new NoSuchElementException(message, self);
    } finally {
      self.dispose();
      message.dispose();
    }
  }
  /** Original insertion treats empty singleton values as late-init requests. @param name - Exact key. @param element - Original value. @returns Nothing. */
  insertByName(name: OUStringConstReference, element: Any): void {
    if (!this.emplace(name, element, name.startsWith(SINGLETON_PREFIX) && !element.hasValue()))
      this.fail(true, name);
  }
  /** Original removal throws only for an absent local key. @param name - Exact local key. @returns Nothing. */
  removeByName(name: OUStringConstReference): void {
    const key = this.find(name);
    if (key === undefined) this.fail(false, name);
    this.erase(key);
  }
  /** Original replacement can re-arm an empty singleton. @param name - Exact local key. @param element - Original replacement. @returns Nothing. */
  replaceByName(name: OUStringConstReference, element: Any): void {
    const key = this.find(name);
    if (key === undefined) this.fail(false, name);
    const entry = this.m_map.get(key) as ContextEntry;
    if (name.startsWith(SINGLETON_PREFIX) && !element.hasValue()) {
      entry.value.clear();
      entry.lateInit = true;
    } else {
      entry.value.assign(element);
      entry.lateInit = false;
    }
  }
  /** Original getByName delegates and may return a void Any for missing names. @param name - Exact key. @returns Owned value. */
  getByName(name: OUStringConstReference): Any {
    return this.getValueByName(name);
  }
  /** Original copies local keys through comphelper's actual sequence helper. @returns Owned sequence;native hash order is unspecified. */
  getElementNames(): Sequence<rtl_uStringSlot> {
    return mapKeysToSequence(Sequence.specialize<rtl_uStringSlot>("OUString", 8), this.m_map);
  }
  /** Original membership examines only the local map. @param name - Exact key. @returns Local membership. */
  hasByName(name: OUStringConstReference): boolean {
    return this.find(name) !== undefined;
  }
  /** Original untyped element metadata is VOID. @returns Owned source type. */
  getElementType(): Type {
    return new Type(UnoType.get("void"));
  }
  /** Original local-only element predicate. @returns Whether local entries exist. */
  hasElements(): boolean {
    return this.m_map.size !== 0;
  }
  /** Lowers one original temporary concatenation/call/full-expression destruction before evaluating the next source expression. @param name - Borrowed source name. @param suffix - Source literal suffix. @returns Owned lookup result. */
  private valueWithSuffix(name: OUStringConstReference, suffix: string): Any {
    const temporary = suffixed(name, suffix);
    try {
      return this.getValueByName(temporary);
    } finally {
      temporary.dispose();
    }
  }
  /** Original lazy lookup includes factory preference, exact arguments, exception rules and post-callback map relookup/disposal. @param name - Original exact key. @returns Owned Any. */
  protected lookupMap(name: OUStringConstReference): Any {
    let key = this.find(name);
    if (key === undefined) return new Any();
    const found = this.m_map.get(key) as ContextEntry;
    if (!found.lateInit) return new Any(found.value);
    const instance = new Reference<XInterface>();
    try {
      try {
        const service = this.valueWithSuffix(name, "/service");
        try {
          const argsValue = this.valueWithSuffix(name, "/arguments"),
            Args = Sequence.specialize<Any>("Any", 24),
            args = new Args();
          try {
            if (
              argsValue.hasValue() &&
              !argsValue.extract(args.getAddress(), ["Sequence", "Any"])
            ) {
              const single = new Args(new Map([[0, argsValue]]), 1);
              try {
                args.assign(single);
              } finally {
                single.dispose();
              }
            }
            const factory = new Reference<XSingleComponentFactory>();
            try {
              if (service.extract(factory.getAddress(), XSingleComponentFactory.static_type)) {
                const self = new Reference<XComponentContext>(this);
                try {
                  const created = args.hasElements()
                    ? (
                        factory.get() as XSingleComponentFactory
                      ).createInstanceWithArgumentsAndContext(args, self)
                    : (factory.get() as XSingleComponentFactory).createInstanceWithContext(self);
                  instance.moveAssign(created);
                  created.dispose();
                } finally {
                  self.dispose();
                }
              } else {
                const legacy = new Reference<XSingleServiceFactory>();
                try {
                  if (service.extract(legacy.getAddress(), XSingleServiceFactory.static_type)) {
                    const created = args.hasElements()
                      ? (legacy.get() as XSingleServiceFactory).createInstanceWithArguments(args)
                      : (legacy.get() as XSingleServiceFactory).createInstance();
                    instance.moveAssign(created);
                    created.dispose();
                  } else if (this.m_xSMgr.is()) {
                    const serviceText = new OUString();
                    try {
                      if (service.extract(serviceText, "OUString") && !serviceText.isEmpty()) {
                        const self = new Reference<XComponentContext>(this);
                        try {
                          const created = args.hasElements()
                            ? (
                                this.m_xSMgr.get() as XMultiComponentFactory
                              ).createInstanceWithArgumentsAndContext(serviceText, args, self)
                            : (
                                this.m_xSMgr.get() as XMultiComponentFactory
                              ).createInstanceWithContext(serviceText, self);
                          instance.moveAssign(created);
                          created.dispose();
                        } finally {
                          self.dispose();
                        }
                      }
                    } finally {
                      serviceText.dispose();
                    }
                  }
                } finally {
                  legacy.dispose();
                }
              }
            } finally {
              factory.dispose();
            }
          } finally {
            args.dispose();
            argsValue.dispose();
          }
        } finally {
          service.dispose();
        }
      } catch (error) {
        if (error instanceof RuntimeException || !(error instanceof Exception)) throw error;
        error.dispose();
      }
      const result = new Any();
      key = this.find(name);
      if (key !== undefined) {
        const entry = this.m_map.get(key) as ContextEntry;
        if (entry.lateInit) {
          entry.value.insert(instance.getAddress(), "XInterface");
          entry.lateInit = false;
          result.dispose();
          return new Any(entry.value);
        }
        result.assign(entry.value);
      }
      const comparison = new Any(instance.getAddress(), "XInterface");
      try {
        if (result.operatorNotEquals(comparison)) try_dispose(instance);
      } catch (error) {
        result.dispose();
        throw error;
      } finally {
        comparison.dispose();
      }
      return result;
    } finally {
      instance.dispose();
    }
  }
  /** Original reserved root lookup and fallback only for void local values. @param name - Exact key. @returns Owned Any. */
  getValueByName(name: OUStringConstReference): Any {
    if (name.equals(ROOT)) {
      if (this.m_xDelegate.is())
        return (this.m_xDelegate.get() as XComponentContext).getValueByName(name);
      const self = new Reference<XComponentContext>(this);
      try {
        return new Any(self.getAddress(), XComponentContext.static_type);
      } finally {
        self.dispose();
      }
    }
    const result = this.lookupMap(name);
    if (!result.hasValue() && this.m_xDelegate.is()) {
      try {
        return (this.m_xDelegate.get() as XComponentContext).getValueByName(name);
      } finally {
        result.dispose();
      }
    }
    return result;
  }
  /** Original throws DeploymentException for a null manager, retaining actual this Context. @returns Owned manager reference. */
  getServiceManager(): Reference<XMultiComponentFactory> {
    if (!this.m_xSMgr.is()) {
      const message = literal("null component context service manager"),
        self = new Reference<XInterface>(this);
      try {
        throw new DeploymentException(message, self);
      } finally {
        self.dispose();
        message.dispose();
      }
    }
    return new Reference(this.m_xSMgr);
  }
  /** Original disposal separates manager, access controller and type-description manager, then terminates every registered Java environment without adding a release absent upstream. @returns Nothing. */
  protected override disposingComponent(): void {
    const typeManager = new Reference<XComponent>(),
      access = new Reference<XComponent>();
    try {
      for (const [key, entry] of this.m_map) {
        const name = OUString.unacquired(key);
        if (!this.m_xSMgr.is() || !name.startsWith(SMGR_SINGLETON)) {
          if (entry.lateInit) {
            entry.value.clear();
            entry.lateInit = false;
            continue;
          }
          const component = new Reference<XComponent>();
          try {
            entry.value.extract(component.getAddress(), XComponent.static_type);
            if (component.is()) {
              if (name.equals(TDMGR_SINGLETON)) typeManager.moveAssign(component);
              else if (name.equals(AC_SINGLETON)) access.moveAssign(component);
              else (component.get() as XComponent).dispose();
            }
          } finally {
            component.dispose();
          }
        }
      }
      try_dispose(this.m_xSMgr);
      this.m_xSMgr.clear();
      if (access.is()) (access.get() as XComponent).dispose();
      if (typeManager.is()) (typeManager.get() as XComponent).dispose();
      this.clearMap();
      const envs: [uno_Environment[] | null] = [null],
        count: [number] = [0],
        java = literal("java");
      try {
        uno_getRegisteredEnvironments(
          envs,
          count,
          /** Compiler binding of the original malloc block as an uninitialized logical pointer array; no environment/default/provider is created. @param bytes - Original sizeof(pointer)*count request. @returns Actual array storage. */ (
            bytes,
          ) => new Array<uno_Environment>(bytes / 8),
          java.pData,
        );
        if (envs[0])
          for (let index = 0; index !== count[0]; ++index) {
            const env = envs[0][index] as uno_Environment;
            (env.dispose as NonNullable<uno_Environment["dispose"]>)(env);
          }
        // Native std::free releases only array storage; the hardened environment refs are not released by this source body.
      } finally {
        java.dispose();
      }
    } finally {
      access.dispose();
      typeManager.dispose();
    }
  }
  /** Original implicit member destruction order; it does not call component dispose. @returns Nothing. */
  private destroyMembers(): void {
    this.m_xSMgr.dispose();
    this.clearMap();
    this.m_xDelegate.dispose();
  }
  /** Original destructor releases members before its weak/component base. @returns Nothing. */
  protected override destroy(): void {
    this.destroyMembers();
    super.destroy();
  }
}

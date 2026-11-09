/** @fileoverview Original ServiceManager for bundled constructor-backed implementations and DefaultContext. */
import { PropertyVetoException } from "../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { UnknownPropertyException } from "../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { XServiceInfo } from "../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY } from "../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../sal/inc/rtl/ustring.h";
import { SAL_NO_ACQUIRE } from "../../sal/inc/types";
import {
  Property,
  cppu_detail_getUnoType_Property,
} from "../../udkapi/com/sun/star/beans/Property";
import { READONLY } from "../../udkapi/com/sun/star/beans/PropertyAttribute";
import type { XPropertyChangeListener } from "../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import { XPropertySet } from "../../udkapi/com/sun/star/beans/XPropertySet";
import { XPropertySetInfo } from "../../udkapi/com/sun/star/beans/XPropertySetInfo";
import type { XVetoableChangeListener } from "../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import { XInitialization } from "../../udkapi/com/sun/star/lang/XInitialization";
import { XMultiComponentFactory } from "../../udkapi/com/sun/star/lang/XMultiComponentFactory";
import { XMultiServiceFactory } from "../../udkapi/com/sun/star/lang/XMultiServiceFactory";
import { XComponentContext } from "../../udkapi/com/sun/star/uno/XComponentContext";
import { WeakComponentImplHelper2 } from "../inc/compbase2";
import { supportsService } from "../inc/supportsservice";

/** Original resolved constructor call. @param context - Original raw component context. @param args - Original Any arguments. @returns Acquired original interface. */
export type WrapperConstructorFn = (
  context: XComponentContext | null,
  args: Sequence<Any>,
) => XInterface | null;

/** The constructor-backed part of the original loaded Data::Implementation. */
export interface Implementation {
  readonly name: string;
  readonly services: readonly string[];
  readonly constructorFn: WrapperConstructorFn;
}

/** Original named implementations and ordered service lists. */
class Data {
  readonly namedImplementations = new Map<string, Implementation>();
  readonly services = new Map<string, Implementation[]>();

  /** Adds the trusted bundled implementations in registry order. @param implementations - Statically linked registry records. @returns Data. */
  constructor(implementations: readonly Implementation[]) {
    for (const implementation of implementations) {
      this.namedImplementations.set(implementation.name, implementation);
      for (const name of implementation.services) {
        const providers = this.services.get(name);
        if (providers === undefined) this.services.set(name, [implementation]);
        else providers.push(implementation);
      }
    }
  }
}

const Arguments = Sequence.specialize<Any>("Any", 24);
const Strings = Sequence.specialize<rtl_uStringSlot>("OUString", 8);
const DefaultContext = literal("DefaultContext");

/** Constructs an original counted string from a registry or source name. @param value - Source name. @returns Owned string. */
function literal(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}

/** Reads the original counted string as an exact registry key. @param value - Source name. @returns Exact key. */
function key(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i) result += String.fromCharCode(value.charAt(i));
  return result;
}

/** Builds a native owned string sequence. @param values - Registry or advertised names. @returns Acquired sequence. */
function sequence(values: Iterable<string>): Sequence<rtl_uStringSlot> {
  const owned: OUString[] = [];
  const addresses = new Map<number, rtl_uStringSlot>();
  try {
    for (const value of values) {
      const name = literal(value);
      addresses.set(owned.length * 8, name.getDataAddress());
      owned.push(name);
    }
    return new Strings(addresses, owned.length);
  } finally {
    for (const name of owned) name.dispose();
  }
}

/** Original ServiceManager's linked constructor dispatch and DefaultContext property service. */
export class ServiceManager
  extends WeakComponentImplHelper2.specialize(
    XServiceInfo,
    XMultiServiceFactory,
    XMultiComponentFactory,
    XPropertySet,
    XPropertySetInfo,
  )
  implements
    XServiceInfo,
    XMultiServiceFactory,
    XMultiComponentFactory,
    XPropertySet,
    XPropertySetInfo
{
  private readonly data_: Data;
  private readonly context_ = new Reference<XComponentContext>();

  /** Loads statically linked implementations before the default context is set. @param implementations - Bundled component records. @returns Service manager. */
  constructor(implementations: readonly Implementation[]) {
    super();
    this.data_ = new Data(implementations);
  }

  /** Original one-time default context assignment. @param context - Created context. @returns Nothing. */
  setContext(context: Reference<XComponentContext>): void {
    if (!context.is() || this.context_.is()) throw new Error("invalid ServiceManager context");
    this.context_.assign(context);
  }

  /** Original borrowed default-context accessor. @returns Current default context. */
  private getContext(): Reference<XComponentContext> {
    if (!this.context_.is()) throw new Error("assert(context_.is())");
    return this.context_;
  }

  /** Original manager implementation identity. @returns Owned name. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.cppuhelper.bootstrap.ServiceManager");
  }

  /** Original service membership predicate. @param service - Requested service. @returns Membership. */
  supportsService(service: OUString): boolean {
    return supportsService(this, service);
  }

  /** Original advertised services. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    return sequence(["com.sun.star.lang.MultiServiceFactory", "com.sun.star.lang.ServiceManager"]);
  }

  /** Original available-service query uses the actual registry keys. @returns Owned sequence. */
  getAvailableServiceNames(): Sequence<rtl_uStringSlot> {
    return this.m_bDisposed ? new Strings() : sequence(this.data_.services.keys());
  }

  /** Original legacy default-context construction. @param service - Requested service. @returns Owned reference. */
  createInstance(service: OUStringConstReference): Reference<XInterface> {
    return this.createInstanceWithContext(service, this.getContext());
  }

  /** Original legacy default-context construction with arguments. @param service - Requested service. @param args - Actual arguments. @returns Owned reference. */
  createInstanceWithArguments(
    service: OUStringConstReference,
    args: Sequence<Any>,
  ): Reference<XInterface> {
    return this.createInstanceWithArgumentsAndContext(service, args, this.getContext());
  }

  /** Original lookup precedes the constructor call with an empty Any sequence. @param service - Requested service. @param context - Caller context. @returns Owned reference. */
  createInstanceWithContext(
    service: OUStringConstReference,
    context: Reference<XComponentContext>,
  ): Reference<XInterface> {
    const impl = this.findServiceImplementation(service);
    if (impl === undefined) return new Reference();
    const args = new Arguments();
    try {
      return new Reference(impl.constructorFn(context.get(), args), SAL_NO_ACQUIRE);
    } finally {
      args.dispose();
    }
  }

  /** Original constructor receives the arguments and invokes XInitialization when advertised. @param service - Requested service. @param args - Original arguments. @param context - Caller context. @returns Owned reference. */
  createInstanceWithArgumentsAndContext(
    service: OUStringConstReference,
    args: Sequence<Any>,
    context: Reference<XComponentContext>,
  ): Reference<XInterface> {
    const impl = this.findServiceImplementation(service);
    if (impl === undefined) return new Reference();
    const result = new Reference(impl.constructorFn(context.get(), args), SAL_NO_ACQUIRE);
    try {
      const init = new Reference<XInitialization>(result, UNO_QUERY, XInitialization.static_type);
      try {
        if (init.is()) init.operatorStar().initialize(args);
        return result;
      } finally {
        init.dispose();
      }
    } catch (error) {
      result.dispose();
      throw error;
    }
  }

  /** Original service name takes precedence over implementation name. @param service - Requested name. @returns First resolved implementation. */
  private findServiceImplementation(service: OUStringConstReference): Implementation | undefined {
    const name = key(service);
    return this.data_.services.get(name)?.[0] ?? this.data_.namedImplementations.get(name);
  }

  /** Original metadata getter queries this manager. @returns Owned metadata interface. */
  getPropertySetInfo(): Reference<XPropertySetInfo> {
    return new Reference(this);
  }

  /** Original single property is read-only. @param name - Requested name. @param value - Original ignored value. @returns Never. */
  setPropertyValue(name: OUStringConstReference, value: Any): never {
    void value;
    const self = new Reference<XInterface>(this);
    try {
      if (name.equals(DefaultContext)) throw new PropertyVetoException(name, self);
      throw new UnknownPropertyException(name, self);
    } finally {
      self.dispose();
    }
  }

  /** Original DefaultContext value in an interface Any. @param name - Requested name. @returns Owned Any. */
  getPropertyValue(name: OUStringConstReference): Any {
    this.checkPropertyName(name);
    return new Any(this.getContext().getAddress(), XComponentContext.static_type);
  }

  /** Original DefaultContext descriptor. @param name - Requested name. @returns Owned property. */
  getPropertyByName(name: OUStringConstReference): Property {
    this.checkPropertyName(name);
    return new Property(DefaultContext, -1, XComponentContext.static_type(), READONLY);
  }

  /** Original descriptor sequence. @returns Owned sequence. */
  getProperties(): Sequence<Property> {
    const property = this.getPropertyByName(DefaultContext);
    try {
      return new (Sequence.specialize<Property>(cppu_detail_getUnoType_Property, 32))(
        new Map([[0, property]]),
        1,
      );
    } finally {
      property.dispose();
    }
  }

  /** Original property membership query. @param name - Requested name. @returns Membership. */
  hasPropertyByName(name: OUStringConstReference): boolean {
    return name.equals(DefaultContext);
  }

  /** Original DefaultContext listener attaches only for component disposal. @param name - Property name or empty. @param listener - Actual listener. @returns Nothing. */
  addPropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    if (!name.isEmpty()) this.checkPropertyName(name);
    this.addEventListener(listener);
  }

  /** Original DefaultContext listener removal. @param name - Property name or empty. @param listener - Actual listener. @returns Nothing. */
  removePropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    if (!name.isEmpty()) this.checkPropertyName(name);
    this.removeEventListener(listener);
  }

  /** Original DefaultContext listener attaches only for component disposal. @param name - Property name or empty. @param listener - Actual listener. @returns Nothing. */
  addVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    if (!name.isEmpty()) this.checkPropertyName(name);
    this.addEventListener(listener);
  }

  /** Original DefaultContext listener removal. @param name - Property name or empty. @param listener - Actual listener. @returns Nothing. */
  removeVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    if (!name.isEmpty()) this.checkPropertyName(name);
    this.removeEventListener(listener);
  }

  /** Original checked property-name validation retains this manager as Context. @param name - Requested name. @returns Nothing. */
  private checkPropertyName(name: OUStringConstReference): void {
    if (name.equals(DefaultContext)) return;
    const self = new Reference<XInterface>(this);
    try {
      throw new UnknownPropertyException(name, self);
    } finally {
      self.dispose();
    }
  }

  /** Original disposal removes registered services and implementations. @returns Nothing. */
  protected override disposingComponent(): void {
    this.data_.services.clear();
    this.data_.namedImplementations.clear();
  }

  /** Original default-context member is destroyed with the manager. @returns Nothing. */
  protected override destroy(): void {
    this.context_.dispose();
    super.destroy();
  }
}

/** @fileoverview Explicit enclosing NumberText service/context/process-factory test fixtures using actual WeakImplHelper, Reference and the real component constructor. This does not implement or certify a production service registry or ComponentContext. */
import { WeakImplHelper } from "../cppuhelper/inc/implbase";
import { Reference } from "../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../cppu/inc/com/sun/star/uno/XInterface";
import { Any } from "../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../cppu/inc/com/sun/star/uno/Sequence";
import { XComponentContext } from "../udkapi/com/sun/star/uno/XComponentContext";
import { XMultiComponentFactory } from "../udkapi/com/sun/star/lang/XMultiComponentFactory";
import { XMultiServiceFactory } from "../udkapi/com/sun/star/lang/XMultiServiceFactory";
import { XPropertySet } from "../udkapi/com/sun/star/beans/XPropertySet";
import { SAL_NO_ACQUIRE } from "../sal/inc/types";
import type { OUStringConstReference } from "../sal/inc/rtl/ustring";
import { text } from "../i18nlangtag/source/isolang/isolang.tables";
import { lingucomponent_NumberText_get_implementation } from "../lingucomponent/source/numbertext/numbertext";
/** Prepared original context-aware constructor dependency; no production registry is implemented by this fixture. */
export type Constructor = (context: Reference<XComponentContext>) => Reference<XInterface>;
/** Prepared enclosing manager boundary; only the source default constructor call is expected, and it invokes the actual component factory. */
export class Manager
  extends WeakImplHelper.specialize(XMultiComponentFactory)
  implements XMultiComponentFactory
{
  readonly calls: Array<[string, XComponentContext | null]> = [];
  /** Keeps an explicit test constructor outcome. @param create - Prepared source dependency. @returns Fixture owner. */
  constructor(readonly create: Constructor) {
    super();
  }
  /** Observes the original exact call and invokes its prepared boundary. @param name - Service name. @param context - Actual supplied context. @returns Original acquired result. */
  createInstanceWithContext(
    name: OUStringConstReference,
    context: Reference<XComponentContext>,
  ): Reference<XInterface> {
    this.calls.push([text(name), context.get()]);
    return this.create(context);
  }
  /** Detects a departure from the source default-constructor method. @param name - Unused name. @param args - Unused arguments. @param context - Unused context. @returns Never. */
  createInstanceWithArgumentsAndContext(
    name: OUStringConstReference,
    args: Sequence<Any>,
    context: Reference<XComponentContext>,
  ): Reference<XInterface> {
    void name;
    void args;
    void context;
    throw new Error("unexpected argument-constructor call");
  }
  /** Detects unrelated registry enumeration. @returns Never. */
  getAvailableServiceNames(): never {
    throw new Error("unexpected registry enumeration");
  }
}
/** Prepared enclosing context boundary with real weak/reference lifetime; this is not a replacement production ComponentContext. */
export class Context
  extends WeakImplHelper.specialize(XComponentContext)
  implements XComponentContext
{
  private readonly manager: Reference<XMultiComponentFactory>;
  /** Retains the explicit manager. @param manager - Actual prepared manager reference. @returns Fixture owner. */
  constructor(manager: Reference<XMultiComponentFactory>) {
    super();
    this.manager = new Reference(manager);
  }
  /** Returns an owned copy at the original method boundary. @returns Acquired manager. */
  getServiceManager(): Reference<XMultiComponentFactory> {
    return new Reference(this.manager);
  }
  /** Detects a singleton/value lookup absent from the source default constructor. @param name - Unused name. @returns Never. */
  getValueByName(name: OUStringConstReference): Any {
    void name;
    throw new Error("unexpected context value lookup");
  }
  /** Releases only fixture-owned members through the real weak base. @returns Nothing. */
  protected override destroy(): void {
    this.manager.dispose();
    super.destroy();
  }
}
/** Original acquired component constructor call, including its actual raw context and empty Any argument sequence. @param context - Actual source context. @returns Acquired root reference. */
export function construct(context: Reference<XComponentContext>): Reference<XInterface> {
  const args = new (Sequence.specialize<Any>("Any", 24))();
  try {
    return new Reference(
      lingucomponent_NumberText_get_implementation(context.get(), args),
      SAL_NO_ACQUIRE,
    );
  } finally {
    args.dispose();
  }
}
/** Prepared original process-factory property boundary; source service creation stays with the independently supplied real manager. */
export class ProcessFactory
  extends WeakImplHelper.specialize(XMultiServiceFactory, XPropertySet)
  implements XMultiServiceFactory, XPropertySet
{
  readonly names: string[] = [];
  private readonly context: Reference<XComponentContext>;
  /** Retains the explicit actual context. @param context - Prepared original context. @returns Fixture. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.context = new Reference(context);
  }
  /** Supplies the exact DefaultContext Any used by the source process getter. @param name - Original property name. @returns Owned actual interface Any. */
  getPropertyValue(name: OUStringConstReference): Any {
    this.names.push(text(name));
    if (text(name) !== "DefaultContext") throw new Error("unexpected fixture property");
    return new Any(this.context.getAddress(), XComponentContext.static_type);
  }
  /** Detects unrelated descriptor lookup. @returns Never. */
  getPropertySetInfo(): never {
    throw new Error("unexpected property metadata");
  }
  /** Detects unrelated mutation. @param args - Original arguments. @returns Never. */
  setPropertyValue(...args: Parameters<XPropertySet["setPropertyValue"]>): never {
    void args;
    throw new Error("unexpected property write");
  }
  /** Detects unrelated subscription. @param args - Original arguments. @returns Never. */
  addPropertyChangeListener(...args: Parameters<XPropertySet["addPropertyChangeListener"]>): never {
    void args;
    throw new Error("unexpected listener registration");
  }
  /** Detects unrelated removal. @param args - Original arguments. @returns Never. */
  removePropertyChangeListener(
    ...args: Parameters<XPropertySet["removePropertyChangeListener"]>
  ): never {
    void args;
    throw new Error("unexpected listener removal");
  }
  /** Detects unrelated subscription. @param args - Original arguments. @returns Never. */
  addVetoableChangeListener(...args: Parameters<XPropertySet["addVetoableChangeListener"]>): never {
    void args;
    throw new Error("unexpected veto registration");
  }
  /** Detects unrelated removal. @param args - Original arguments. @returns Never. */
  removeVetoableChangeListener(
    ...args: Parameters<XPropertySet["removeVetoableChangeListener"]>
  ): never {
    void args;
    throw new Error("unexpected veto removal");
  }
  /** Detects an invented legacy service call. @param args - Original arguments. @returns Never. */
  createInstance(...args: Parameters<XMultiServiceFactory["createInstance"]>): never {
    void args;
    throw new Error("unexpected legacy creation");
  }
  /** Detects an invented legacy service call. @param args - Original arguments. @returns Never. */
  createInstanceWithArguments(
    ...args: Parameters<XMultiServiceFactory["createInstanceWithArguments"]>
  ): never {
    void args;
    throw new Error("unexpected legacy argument creation");
  }
  /** Detects unrelated registry enumeration. @returns Never. */
  getAvailableServiceNames(): never {
    throw new Error("unexpected service enumeration");
  }
  /** Releases the enclosing fixture context through its actual weak owner. @returns Nothing. */
  protected override destroy(): void {
    this.context.dispose();
    super.destroy();
  }
}

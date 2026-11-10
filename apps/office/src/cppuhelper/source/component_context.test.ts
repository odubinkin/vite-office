/** @fileoverview Actual ComponentContext contracts through original values, queries, callbacks and weak environment registration. Prepared factory/manager boundaries never replace production context behavior. */
import { expect, it } from "vitest";
import { ComponentContext, DisposingForwarder } from "./component_context";
import { ContextEntry_Init } from "../inc/component_context";
import { WeakImplHelper } from "../inc/implbase";
import { WeakComponentImplHelper2 } from "../inc/compbase2";
import { Reference, UNO_QUERY } from "../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { XComponentContext } from "../../udkapi/com/sun/star/uno/XComponentContext";
import { XMultiComponentFactory } from "../../udkapi/com/sun/star/lang/XMultiComponentFactory";
import { XSingleComponentFactory } from "../../udkapi/com/sun/star/lang/XSingleComponentFactory";
import { XSingleServiceFactory } from "../../udkapi/com/sun/star/lang/XSingleServiceFactory";
import { XPropertySet } from "../../udkapi/com/sun/star/beans/XPropertySet";
import type { XPropertySetInfo } from "../../udkapi/com/sun/star/beans/XPropertySetInfo";
import type { XPropertyChangeListener } from "../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { XVetoableChangeListener } from "../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import { Exception } from "../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DeploymentException } from "../../cppu/inc/com/sun/star/uno/DeploymentException";
import { ElementExistException } from "../../cppu/inc/com/sun/star/container/ElementExistException";
import { NoSuchElementException } from "../../cppu/inc/com/sun/star/container/NoSuchElementException";
import type { rtl_uStringSlot } from "../../sal/inc/rtl/ustring.h";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { OUString } from "../../sal/inc/rtl/ustring";
import { unicode, text } from "../../i18nlangtag/source/isolang/isolang.tables";
import { typelib_TypeClass } from "../../cppu/inc/typelib/typeclass";
import { XNameContainer } from "../../cppu/inc/com/sun/star/container/XNameContainer";
import { theEnvironmentsData } from "../../cppu/source/uno/lbenv";
import type { uno_Environment } from "../../cppu/inc/uno/environment";
const SMGR = "/singletons/com.sun.star.lang.theServiceManager",
  TD = "/singletons/com.sun.star.reflection.theTypeDescriptionManager",
  AC = "/singletons/com.sun.star.security.theAccessController";
/** Caller component uses the real original component helper for all lifecycle and interface behavior. */
class Component extends WeakComponentImplHelper2.specialize() {
  disposed = 0;
  /** Keeps an optional source callback observation. @param label - Prepared name. @param order - Shared observations. @returns Actual component. */
  constructor(
    readonly label = "value",
    readonly order: string[] = [],
  ) {
    super();
  }
  /** Original derived hook observes actual disposal. @returns Nothing. */
  protected override disposingComponent(): void {
    this.disposed++;
    this.order.push(this.label);
  }
}
/** Prepared complete factory boundary exposing both original IDLs. */
class Factory
  extends WeakImplHelper.specialize(XSingleComponentFactory, XSingleServiceFactory)
  implements XSingleComponentFactory, XSingleServiceFactory
{
  readonly calls: Array<[string, number, XComponentContext | null]> = [];
  /** Binds source creation result/callback. @param create - Original invocation boundary. @returns Factory. */
  constructor(
    readonly create: (
      args: Sequence<Any> | null,
      context: Reference<XComponentContext> | null,
    ) => Reference<XInterface>,
  ) {
    super();
  }
  /** Original new-factory no-argument boundary. @param context - Actual context. @returns Owned result. */
  createInstanceWithContext(context: Reference<XComponentContext>): Reference<XInterface> {
    this.calls.push(["component", 0, context.get()]);
    return this.create(null, context);
  }
  /** Original new-factory argument boundary. @param args - Actual arguments. @param context - Actual context. @returns Owned result. */
  createInstanceWithArgumentsAndContext(
    args: Sequence<Any>,
    context: Reference<XComponentContext>,
  ): Reference<XInterface> {
    this.calls.push(["component-args", args.getLength(), context.get()]);
    return this.create(args, context);
  }
  /** Original legacy no-argument boundary. @returns Owned result. */
  createInstance(): Reference<XInterface> {
    this.calls.push(["legacy", 0, null]);
    return this.create(null, null);
  }
  /** Original legacy argument boundary. @param args - Actual arguments. @returns Owned result. */
  createInstanceWithArguments(args: Sequence<Any>): Reference<XInterface> {
    this.calls.push(["legacy-args", args.getLength(), null]);
    return this.create(args, null);
  }
}
/** Prepared factory with only the original legacy interface. */
class Legacy
  extends WeakImplHelper.specialize(XSingleServiceFactory)
  implements XSingleServiceFactory
{
  /** Retains an explicit boundary implementation. @param factory - Prepared actual factory. @returns Legacy caller. */
  constructor(readonly factory: Factory) {
    super();
  }
  /** Delegates original no-argument call. @returns Owned result. */
  createInstance(): Reference<XInterface> {
    return this.factory.createInstance();
  }
  /** Delegates original argument call. @param args - Actual arguments. @returns Owned result. */
  createInstanceWithArguments(args: Sequence<Any>): Reference<XInterface> {
    return this.factory.createInstanceWithArguments(args);
  }
}
/** Prepared complete manager/property-set boundary; actual context is always the production class. */
class Manager
  extends WeakComponentImplHelper2.specialize(XMultiComponentFactory, XPropertySet)
  implements XMultiComponentFactory, XPropertySet
{
  readonly calls: Array<[string, string, XComponentContext | null, number]> = [];
  readonly patched = new Reference<XComponentContext>();
  /** Binds prepared creation and disposal observations. @param create - Original factory boundary. @param order - Shared disposal log. @returns Manager. */
  constructor(
    readonly create: (
      name: OUStringConstReference,
      context: Reference<XComponentContext>,
    ) => Reference<XInterface>,
    readonly order: string[] = [],
  ) {
    super();
  }
  /** Original contextual manager boundary. @param name - Exact source name. @param context - Actual context. @returns Owned result. */
  createInstanceWithContext(
    name: OUStringConstReference,
    context: Reference<XComponentContext>,
  ): Reference<XInterface> {
    this.calls.push(["context", text(name), context.get(), 0]);
    return this.create(name, context);
  }
  /** Original manager argument boundary. @param name - Exact service. @param args - Actual args. @param context - Actual context. @returns Owned result. */
  createInstanceWithArgumentsAndContext(
    name: OUStringConstReference,
    args: Sequence<Any>,
    context: Reference<XComponentContext>,
  ): Reference<XInterface> {
    this.calls.push(["args", text(name), context.get(), args.getLength()]);
    return this.create(name, context);
  }
  /** Detects unrelated enumeration. @returns Never. */
  getAvailableServiceNames(): Sequence<rtl_uStringSlot> {
    throw new Error("unexpected enumeration");
  }
  /** Original patch boundary captures actual typed DefaultContext. @param name - Exact property. @param value - Actual value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    expect(text(name)).toBe("DefaultContext");
    expect(value.extract(this.patched.getAddress(), XComponentContext.static_type)).toBe(true);
  }
  /** Unused declared metadata boundary. @returns Never. */
  getPropertySetInfo(): Reference<XPropertySetInfo> {
    throw new Error("unexpected metadata");
  }
  /** Unused declared value boundary. @param name - Original name. @returns Never. */
  getPropertyValue(name: OUStringConstReference): Any {
    void name;
    throw new Error("unexpected property read");
  }
  /** Unused declared listener boundary. @param name - Exact name. @param listener - Actual listener. @returns Never. */
  addPropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
    throw new Error("unexpected listener");
  }
  /** Unused declared listener boundary. @param name - Exact name. @param listener - Actual listener. @returns Never. */
  removePropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
    throw new Error("unexpected listener");
  }
  /** Unused declared veto boundary. @param name - Exact name. @param listener - Actual listener. @returns Never. */
  addVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
    throw new Error("unexpected veto");
  }
  /** Unused declared veto boundary. @param name - Exact name. @param listener - Actual listener. @returns Never. */
  removeVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
    throw new Error("unexpected veto");
  }
  /** Actual manager disposal releases its prepared DefaultContext reference. @returns Nothing. */
  protected override disposingComponent(): void {
    this.order.push("manager");
    this.patched.clear();
  }
  /** Original field destruction. @returns Nothing. */
  protected override destroy(): void {
    this.patched.dispose();
    super.destroy();
  }
}
/** Consumes caller-owned temporary Any/name into an original entry copy. @param name - Exact key. @param value - Owned temporary value. @param late - Original flag. @returns Owned entry. */
function entry(name: string, value: Any, late = false): ContextEntry_Init {
  const key = unicode(name);
  try {
    return new ContextEntry_Init(key, value, late);
  } finally {
    key.dispose();
    value.dispose();
  }
}
/** Consumes prepared entry values into the actual original context. @param entries - Owned entries. @param delegate - Optional actual delegate. @returns Owned concrete context. */
function context(
  entries: ContextEntry_Init[] = [],
  delegate?: Reference<XComponentContext>,
): Reference<ComponentContext> {
  const parent = delegate ?? new Reference<XComponentContext>();
  try {
    return new Reference(new ComponentContext(entries, entries.length, parent));
  } finally {
    for (const value of entries) value.dispose();
    if (!delegate) parent.dispose();
  }
}
/** Exact named source lookup with automatic borrowed-name lifetime. @param ctx - Actual context. @param name - Original name. @returns Owned Any. */
function value(ctx: ComponentContext, name: string): Any {
  const key = unicode(name);
  try {
    return ctx.getValueByName(key);
  } finally {
    key.dispose();
  }
}
/** Creates the real declared interface Any address. @param ref - Actual reference. @returns Owned typed root Any. */
function any(ref: Reference): Any {
  return new Any(ref.getAddress(), "XInterface");
}

it("retains actual context/name interfaces, void metadata, missing-value semantics and real root/exception Context", /** No default service manager is fabricated. @returns Nothing. */ () => {
  const owner = context(),
    ctx = owner.get() as ComponentContext,
    names = new Reference(owner, UNO_QUERY, XNameContainer.static_type),
    root = value(ctx, "_root"),
    missing = value(ctx, "missing");
  try {
    expect(names.get()).toBe(ctx);
    expect(ctx.hasElements()).toBe(false);
    const elementType = ctx.getElementType();
    try {
      expect(Number(elementType.getTypeClass())).toBe(typelib_TypeClass.VOID);
    } finally {
      elementType.dispose();
    }
    expect(missing.hasValue()).toBe(false);
    const extracted = new Reference<XComponentContext>();
    try {
      expect(root.extract(extracted.getAddress(), XComponentContext.static_type)).toBe(true);
      expect(extracted.get()).toBe(ctx);
    } finally {
      extracted.dispose();
    }
    try {
      ctx.getServiceManager();
      throw new Error("expected deployment");
    } catch (error) {
      expect(error).toBeInstanceOf(DeploymentException);
      const e = error as DeploymentException;
      expect(text(e.Message)).toBe("null component context service manager");
      expect(e.Context.get()).toBe(ctx);
      e.dispose();
    }
  } finally {
    missing.dispose();
    root.dispose();
    names.dispose();
    owner.dispose();
  }
});
it("preserves duplicate first values, Unicode/NUL keys, local-only membership, owned key sequence and post-dispose mutation", /** Original APIs do not introduce a disposed guard or a missing getByName exception. @returns Nothing. */ () => {
  const owner = context([entry("x\0Ω", new Any(true)), entry("x\0Ω", new Any(false))]),
    ctx = owner.get() as ComponentContext,
    key = unicode("x\0Ω"),
    absent = unicode("absent"),
    empty = new Any(),
    replacement = new Any(false),
    names = ctx.getElementNames();
  try {
    const first = ctx.getByName(key);
    const truth = new Any(true);
    try {
      expect(first.operatorEquals(truth)).toBe(true);
    } finally {
      truth.dispose();
    }
    first.dispose();
    expect(ctx.hasByName(key)).toBe(true);
    expect(ctx.hasByName(absent)).toBe(false);
    for (const run of [
      /** Attempts the original duplicate insertion. @returns Nothing or source exception. */ () =>
        ctx.insertByName(key, empty),
      /** Attempts original missing-key removal. @returns Nothing or source exception. */ () =>
        ctx.removeByName(absent),
      /** Attempts original missing-key replacement. @returns Nothing or source exception. */ () =>
        ctx.replaceByName(absent, empty),
    ]) {
      try {
        run();
        throw new Error("expected source exception");
      } catch (error) {
        expect(
          error instanceof ElementExistException || error instanceof NoSuchElementException,
        ).toBe(true);
        const e = error as Exception;
        expect(e.Context.get()).toBe(ctx);
        e.dispose();
      }
    }
    ctx.replaceByName(key, replacement);
    const changed = ctx.getByName(key);
    expect(changed.operatorEquals(replacement)).toBe(true);
    changed.dispose();
    ctx.removeByName(key);
    expect(text(OUString.unacquired(names.operatorIndex(0)))).toBe("x\0Ω");
    const missing = ctx.getByName(key);
    expect(missing.hasValue()).toBe(false);
    missing.dispose();
    ctx.dispose();
    ctx.insertByName(key, replacement);
    expect(ctx.hasByName(key)).toBe(true);
  } finally {
    names.dispose();
    replacement.dispose();
    empty.dispose();
    absent.dispose();
    key.dispose();
    owner.dispose();
  }
});
it("delegates void lookups and root while keeping membership and enumeration local", /** Parent manager wrapping uses the actual source constructor; manager is provided explicitly. @returns Nothing. */ () => {
  const mgr = new Reference(
      new Manager(
        /** Returns the prepared empty manager creation result. @returns Owned null reference. */ () =>
          new Reference(),
      ),
    ),
    parent = context([entry(SMGR, any(mgr)), entry("parent", new Any(true))]);
  // A child with its own manager skips wrapper creation, exactly as the source constructor.
  const child = context([entry(SMGR, any(mgr)), entry("parent", new Any())], parent),
    key = unicode("parent");
  try {
    const inherited = value(child.get() as ComponentContext, "parent"),
      root = value(child.get() as ComponentContext, "_root"),
      ref = new Reference<XComponentContext>();
    try {
      expect(inherited.hasValue()).toBe(true);
      root.extract(ref.getAddress(), XComponentContext.static_type);
      expect(ref.get()).toBe(parent.get());
    } finally {
      ref.dispose();
      root.dispose();
      inherited.dispose();
    }
    expect((child.get() as ComponentContext).hasByName(key)).toBe(true);
    const notLocal = unicode("other");
    expect((child.get() as ComponentContext).hasByName(notLocal)).toBe(false);
    notLocal.dispose();
  } finally {
    key.dispose();
    child.dispose();
    parent.dispose();
    mgr.dispose();
  }
});
it("prefers the new factory, passes actual context and caches singleton creation once", /** Factory also exposes legacy methods so query preference is observable. @returns Nothing. */ () => {
  const product = new Reference(new Component()),
    factory = new Reference(
      new Factory(
        /** Returns the prepared singleton component. @returns Owned component reference. */ () =>
          new Reference(product),
      ),
    ),
    owner = context([entry("/singletons/test", any(factory), true)]);
  try {
    const first = value(owner.get() as ComponentContext, "/singletons/test"),
      second = value(owner.get() as ComponentContext, "/singletons/test");
    try {
      expect(first.operatorEquals(second)).toBe(true);
      expect((factory.get() as Factory).calls).toEqual([["component", 0, owner.get()]]);
    } finally {
      second.dispose();
      first.dispose();
    }
  } finally {
    owner.dispose();
    factory.dispose();
    product.dispose();
  }
});
it("wraps a scalar argument once, forwards actual Any sequences and uses no-argument calls for empty sequences", /** All three source argument forms retain their declared types and exact method choice. @returns Nothing. */ () => {
  const observed: number[] = [],
    product = new Reference(new Component()),
    factory = new Reference(
      new Factory(
        /** Observes exact forwarded argument count. @param args - Actual source arguments. @returns Owned prepared component. */ (
          args,
        ) => {
          observed.push(args?.getLength() ?? 0);
          return new Reference(product);
        },
      ),
    ),
    Args = Sequence.specialize<Any>("Any", 24),
    scalar = new Any(true),
    two = new Args(
      new Map([
        [0, scalar],
        [24, scalar],
      ]),
      2,
    ),
    empty = new Args();
  const owner = context([
    entry("/singletons/scalar", any(factory), true),
    entry("/singletons/scalar/arguments", new Any(true)),
    entry("/singletons/sequence", any(factory), true),
    entry("/singletons/sequence/arguments", new Any(two.getAddress(), ["Sequence", "Any"])),
    entry("/singletons/empty", any(factory), true),
    entry("/singletons/empty/arguments", new Any(empty.getAddress(), ["Sequence", "Any"])),
  ]);
  try {
    for (const name of ["scalar", "sequence", "empty"])
      value(owner.get() as ComponentContext, "/singletons/" + name).dispose();
    expect(observed).toEqual([1, 2, 0]);
    expect(
      (factory.get() as Factory).calls.map(
        /** Selects the observed source factory method. @param call - Recorded invocation. @returns Exact method name. */ (
          call,
        ) => call[0],
      ),
    ).toEqual(["component-args", "component-args", "component"]);
  } finally {
    owner.dispose();
    empty.dispose();
    two.dispose();
    scalar.dispose();
    factory.dispose();
    product.dispose();
  }
});
it("falls back to only the legacy factory with the original argument/no-argument distinction", /** Context-aware methods must never be guessed on the legacy object. @returns Nothing. */ () => {
  const product = new Reference(new Component()),
    factory = new Reference(
      new Factory(
        /** Returns the prepared legacy result. @returns Owned component reference. */ () =>
          new Reference(product),
      ),
    ),
    legacy = new Reference(new Legacy(factory.get() as Factory)),
    owner = context([
      entry("/singletons/plain", any(legacy), true),
      entry("/singletons/args", any(legacy), true),
      entry("/singletons/args/arguments", new Any(false)),
    ]);
  try {
    value(owner.get() as ComponentContext, "/singletons/plain").dispose();
    value(owner.get() as ComponentContext, "/singletons/args").dispose();
    expect((factory.get() as Factory).calls).toEqual([
      ["legacy", 0, null],
      ["legacy-args", 1, null],
    ]);
  } finally {
    owner.dispose();
    legacy.dispose();
    factory.dispose();
    product.dispose();
  }
});
it("uses exact service names through the actual manager and caches failed configuration as a typed null interface", /** A failed singleton hasValue and is not a delegate/factory retry heuristic. @returns Nothing. */ () => {
  const product = new Reference(new Component()),
    manager = new Reference(
      new Manager(
        /** Returns the prepared named-service component. @returns Owned component reference. */ () =>
          new Reference(product),
      ),
    ),
    name = unicode("exact.Service"),
    emptyName = unicode(""),
    owner = context([
      entry(SMGR, any(manager)),
      entry("/singletons/service", new Any(name.getDataAddress(), "OUString"), true),
      entry("/singletons/service/arguments", new Any(true)),
      entry("/singletons/empty", new Any(emptyName.getDataAddress(), "OUString"), true),
      entry("/singletons/invalid", new Any(false), true),
    ]);
  try {
    value(owner.get() as ComponentContext, "/singletons/service").dispose();
    expect((manager.get() as Manager).calls).toEqual([["args", "exact.Service", owner.get(), 1]]);
    for (const key of ["empty", "invalid"]) {
      const result = value(owner.get() as ComponentContext, "/singletons/" + key),
        ref = new Reference();
      try {
        expect(result.hasValue()).toBe(true);
        expect(result.extract(ref.getAddress(), "XInterface")).toBe(true);
        expect(ref.is()).toBe(false);
      } finally {
        ref.dispose();
        result.dispose();
      }
    }
    expect((manager.get() as Manager).calls).toHaveLength(1);
  } finally {
    owner.dispose();
    emptyName.dispose();
    name.dispose();
    manager.dispose();
    product.dispose();
  }
});
it("propagates RuntimeException with retry and suppresses checked UNO exceptions before caching null", /** Exception identity, retry count and cache state follow the original catch clauses. @returns Nothing. */ () => {
  const runtime = new RuntimeException(),
    checked = new Exception();
  let calls = 0;
  const factory = new Reference(
      new Factory(
        /** Raises the prepared runtime then checked exception. @returns Never. */ () => {
          calls++;
          throw calls === 1 ? runtime : checked;
        },
      ),
    ),
    owner = context([entry("/singletons/fail", any(factory), true)]);
  try {
    expect(
      /** Invokes the first original lazy-creation failure. @returns Owned value or source exception. */ () =>
        value(owner.get() as ComponentContext, "/singletons/fail"),
    ).toThrow(runtime);
    const nullValue = value(owner.get() as ComponentContext, "/singletons/fail");
    expect(nullValue.hasValue()).toBe(true);
    nullValue.dispose();
    value(owner.get() as ComponentContext, "/singletons/fail").dispose();
    expect(calls).toBe(2);
  } finally {
    owner.dispose();
    factory.dispose();
    runtime.dispose(); /* checked was destroyed by the original catch binding. */
  }
});
for (const mode of ["replace", "remove", "same"] as const)
  it(`relooks up the map after reentrant ${mode} and disposes only the losing created instance`, /** A callback changes actual entries; no snapshot result is committed over it. @returns Nothing. */ () => {
    const product = new Reference(new Component("created")),
      winner = new Reference(new Component("winner"));

    const factory = new Reference(
        new Factory(
          /** Mutates the real context during component creation. @returns Owned losing or retained instance. */ () => {
            const key = unicode("/singletons/reentrant");
            try {
              if (mode === "remove") ctx.removeByName(key);
              else {
                const replacement = any(mode === "same" ? product : winner);
                try {
                  ctx.replaceByName(key, replacement);
                } finally {
                  replacement.dispose();
                }
              }
            } finally {
              key.dispose();
            }
            return new Reference(product);
          },
        ),
      ),
      owner = context([entry("/singletons/reentrant", any(factory), true)]);
    const ctx = owner.get() as ComponentContext;
    try {
      const result = value(ctx, "/singletons/reentrant");
      try {
        expect(result.hasValue()).toBe(mode !== "remove");
        expect((product.get() as Component).disposed).toBe(mode === "same" ? 0 : 1);
        expect((winner.get() as Component).disposed).toBe(0);
      } finally {
        result.dispose();
      }
    } finally {
      owner.dispose();
      factory.dispose();
      winner.dispose();
      product.dispose();
    }
  });
it("wraps a delegate manager with the exact service and patches the actual new DefaultContext", /** No context/factory provider is injected into the production implementation. @returns Nothing. */ () => {
  const wrapper = new Reference(
      new Manager(
        /** Returns the prepared wrapper null creation result. @returns Owned null reference. */ () =>
          new Reference(),
      ),
    ),
    manager = new Reference(
      new Manager(
        /** Returns the actual prepared manager wrapper. @returns Owned wrapper reference. */ () =>
          new Reference(wrapper),
      ),
    ),
    parent = context([entry(SMGR, any(manager))]),
    child = context([], parent);
  try {
    expect((manager.get() as Manager).calls).toEqual([
      ["context", "com.sun.star.comp.stoc.OServiceManagerWrapper", parent.get(), 0],
    ]);
    expect((wrapper.get() as Manager).patched.get()).toBe(child.get());
    const actual = (child.get() as ComponentContext).getServiceManager();
    try {
      expect(actual.get()).toBe(wrapper.get());
    } finally {
      actual.dispose();
    }
    (child.get() as ComponentContext).dispose();
  } finally {
    child.dispose();
    parent.dispose();
    manager.dispose();
    wrapper.dispose();
  }
});
it("keeps first map value but extracts each duplicate manager entry for the convenience getter", /** Duplicate manager source behavior is intentionally not normalized. @returns Nothing. */ () => {
  const first = new Reference(
      new Manager(
        /** Returns first manager null creation result. @returns Owned null reference. */ () =>
          new Reference(),
      ),
    ),
    second = new Reference(
      new Manager(
        /** Returns second manager null creation result. @returns Owned null reference. */ () =>
          new Reference(),
      ),
    ),
    owner = context([entry(SMGR, any(first)), entry(SMGR, any(second))]),
    lookup = value(owner.get() as ComponentContext, SMGR),
    queried = new Reference<XMultiComponentFactory>(),
    actual = (owner.get() as ComponentContext).getServiceManager();
  try {
    lookup.extract(queried.getAddress(), XMultiComponentFactory.static_type);
    expect(queried.get()).toBe(first.get());
    expect(actual.get()).toBe(second.get());
  } finally {
    actual.dispose();
    queried.dispose();
    lookup.dispose();
    owner.dispose();
    second.dispose();
    first.dispose();
  }
});
it("disposes ordinary entries before manager/access/type manager and preserves manager-prefix skipping", /** Special ordering is independent from unspecified unordered-map bucket iteration. @returns Nothing. */ () => {
  const order: string[] = [],
    ordinary = new Reference(new Component("ordinary", order)),
    access = new Reference(new Component("access", order)),
    types = new Reference(new Component("types", order)),
    prefix = new Reference(new Component("prefix", order)),
    manager = new Reference(
      new Manager(
        /** Returns the prepared manager null creation result. @returns Owned null reference. */ () =>
          new Reference(),
        order,
      ),
    ),
    owner = context([
      entry(SMGR, any(manager)),
      entry(AC, any(access)),
      entry(TD, any(types)),
      entry("ordinary", any(ordinary)),
      entry(SMGR + "Suffix", any(prefix)),
    ]);
  try {
    (owner.get() as ComponentContext).dispose();
    expect(order).toEqual(["ordinary", "manager", "access", "types"]);
    expect((prefix.get() as Component).disposed).toBe(0);
    expect((owner.get() as ComponentContext).hasElements()).toBe(false);
  } finally {
    owner.dispose();
    manager.dispose();
    prefix.dispose();
    types.dispose();
    access.dispose();
    ordinary.dispose();
  }
});
it("forwards actual delegate disposal to its retained target", /** Real listener registration and Source ownership run through the original component base. @returns Nothing. */ () => {
  const order: string[] = [],
    source = new Reference(new Component("source", order)),
    target = new Reference(new Component("target", order));
  DisposingForwarder.listen(source, target);
  try {
    (source.get() as Component).dispose();
    expect(order).toEqual(["source", "target"]);
    expect((target.get() as Component).disposed).toBe(1);
  } finally {
    target.dispose();
    source.dispose();
  }
});
it("disposes actual registered Java environments without adding a hardened-reference release absent upstream", /** The registry is populated before real context disposal; no empty-list adapter is used. @returns Nothing. */ () => {
  const name = unicode("java");
  let hardens = 0,
    releases = 0,
    disposals = 0,
    weak = 0;
  const env: uno_Environment = {
    pReserved: null,
    pTypeName: name.pData,
    pContext: 0xabcden,
    pExtEnv: null,
    acquire: null,
    release: /** Observes any environment strong-reference release. @returns Nothing. */ () => {
      releases++;
    },
    acquireWeak: /** Observes registry weak-reference acquisition. @returns Nothing. */ () => {
      weak++;
    },
    releaseWeak: /** Observes registry weak-reference release. @returns Nothing. */ () => {
      weak--;
    },
    harden:
      /** Returns the actual registered Java environment. @param out - Actual hardening output. @returns Nothing. */ (
        out,
      ) => {
        hardens++;
        out[0] = env;
      },
    dispose:
      /** Observes original context-triggered environment disposal. @returns Nothing. */ () => {
        disposals++;
      },
    environmentDisposing: null,
  };
  const registry = theEnvironmentsData();
  registry.registerEnvironment([env]);
  const owner = context();
  try {
    (owner.get() as ComponentContext).dispose();
    expect([hardens, releases, disposals, weak]).toEqual([1, 0, 1, 1]);
  } finally {
    owner.dispose();
    for (const [key, registered] of registry.aName2EnvMap)
      if (registered === env) {
        registry.aName2EnvMap.delete(key);
        key.dispose();
        (env.releaseWeak as NonNullable<uno_Environment["releaseWeak"]>)(env);
      }
    name.dispose();
  }
});
it("re-arms an empty singleton without creating it during registration or replacement", /** Exact empty-singleton semantics reuse the original stored service entry. @returns Nothing. */ () => {
  const product = new Reference(new Component()),
    factory = new Reference(
      new Factory(
        /** Returns the prepared re-armed singleton instance. @returns Owned component reference. */ () =>
          new Reference(product),
      ),
    ),
    owner = context([entry("/singletons/rearm", any(factory), true)]),
    key = unicode("/singletons/rearm"),
    empty = new Any();
  try {
    expect((factory.get() as Factory).calls).toHaveLength(0);
    value(owner.get() as ComponentContext, "/singletons/rearm").dispose();
    (owner.get() as ComponentContext).replaceByName(key, empty);
    expect((factory.get() as Factory).calls).toHaveLength(1);
    value(owner.get() as ComponentContext, "/singletons/rearm").dispose();
    expect((factory.get() as Factory).calls).toHaveLength(2);
  } finally {
    empty.dispose();
    key.dispose();
    owner.dispose();
    factory.dispose();
    product.dispose();
  }
});
it("honors the explicit entry count and keeps original value/key ownership after input destruction", /** Extra array elements are outside the original pointer/count input range. @returns Nothing. */ () => {
  const a = entry("included", new Any(true)),
    b = entry("excluded", new Any(false)),
    delegate = new Reference<XComponentContext>(),
    owner = new Reference(new ComponentContext([a, b], 1, delegate));
  a.dispose();
  b.dispose();
  delegate.dispose();
  try {
    const included = value(owner.get() as ComponentContext, "included"),
      excluded = value(owner.get() as ComponentContext, "excluded");
    expect(included.hasValue()).toBe(true);
    expect(excluded.hasValue()).toBe(false);
    included.dispose();
    excluded.dispose();
  } finally {
    owner.dispose();
  }
});
it("propagates original delegate-wrapper creation failure and leaves the existing delegate alive", /** Constructor cleanup must release only its own members after the native refcount protection is unwound. @returns Nothing. */ () => {
  const failure = new RuntimeException(),
    manager = new Reference(
      new Manager(
        /** Prepared exact wrapper factory failure. @returns Never. */ () => {
          throw failure;
        },
      ),
    ),
    parent = context([entry(SMGR, any(manager))]);
  try {
    expect(
      /** Invokes the actual original context constructor. @returns Owned context or original exception. */ () =>
        context([], parent),
    ).toThrow(failure);
    const retained = (parent.get() as ComponentContext).getServiceManager();
    try {
      expect(retained.get()).toBe(manager.get());
    } finally {
      retained.dispose();
    }
    expect((manager.get() as Manager).calls).toHaveLength(1);
  } finally {
    parent.dispose();
    manager.dispose();
    failure.dispose();
  }
});

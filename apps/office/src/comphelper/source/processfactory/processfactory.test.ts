/** @fileoverview Original process factory and DefaultContext contracts over actual UNO references, Any, generated interfaces and weak components; enclosing factories/contexts are explicit test fixtures. */
import { expect, it } from "vitest";
import {
  setProcessServiceFactory,
  getProcessServiceFactory,
  getComponentContext,
  getProcessComponentContext,
} from "../../inc/processfactory";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XMultiServiceFactory } from "../../../udkapi/com/sun/star/lang/XMultiServiceFactory";
import { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";

/** Explicit enclosing context: none of its service/name methods is part of processfactory's source call path. */
class Context extends WeakImplHelper.specialize(XComponentContext) implements XComponentContext {
  /** Detects an invented service-manager lookup. @returns Never. */
  getServiceManager(): never {
    throw new Error("unexpected service-manager lookup");
  }
  /** Detects an invented singleton lookup. @param name - Original argument. @returns Never. */
  getValueByName(name: OUStringConstReference): never {
    void name;
    throw new Error("unexpected context-value lookup");
  }
}
/** Explicit source factory without XPropertySet support. */
class PlainFactory
  extends WeakImplHelper.specialize(XMultiServiceFactory)
  implements XMultiServiceFactory
{
  /** Process context lookup must not create a service. @param args - Original service arguments. @returns Never. */
  createInstance(...args: Parameters<XMultiServiceFactory["createInstance"]>): never {
    void args;
    throw new Error("unexpected service creation");
  }
  /** Process context lookup must not create a service. @param args - Original service arguments. @returns Never. */
  createInstanceWithArguments(
    ...args: Parameters<XMultiServiceFactory["createInstanceWithArguments"]>
  ): never {
    void args;
    throw new Error("unexpected argument creation");
  }
  /** Process context lookup must not enumerate a registry. @returns Never. */
  getAvailableServiceNames(): never {
    throw new Error("unexpected service enumeration");
  }
}
/** Explicit actual query-capable factory fixture; it supplies only the original DefaultContext property operation. */
class Factory
  extends WeakImplHelper.specialize(XMultiServiceFactory, XPropertySet)
  implements XMultiServiceFactory, XPropertySet
{
  readonly calls: string[] = [];
  readonly context: Reference<XComponentContext>;
  mode: "context" | "void" | "wrong-interface" | "string" | "unknown" | "exception" = "context";
  failure: Error | Exception | null = null;
  /** Retains an actual enclosing context. @param context - Actual prepared reference. @returns Fixture. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.context = new Reference(context);
  }
  /** Executes only the source property call, including independently prepared native failure cases. @param name - Exact original property name. @returns Original Any. */
  getPropertyValue(name: OUStringConstReference): Any {
    this.calls.push(text(name));
    expect(text(name)).toBe("DefaultContext");
    if (this.mode === "exception") throw this.failure;
    if (this.mode === "unknown") {
      const message = unicode("missing Ω\0property"),
        context = new Reference<XInterface>(this.context, UNO_QUERY);
      try {
        throw new UnknownPropertyException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    if (this.mode === "void") return new Any();
    if (this.mode === "wrong-interface") {
      const root = new Reference<XInterface>(this, UNO_QUERY);
      try {
        return new Any(root.getAddress(), "XInterface");
      } finally {
        root.dispose();
      }
    }
    if (this.mode === "string") {
      const value = unicode("DefaultContext");
      try {
        return new Any(value.getDataAddress(), "OUString");
      } finally {
        value.dispose();
      }
    }
    return new Any(this.context.getAddress(), XComponentContext.static_type);
  }
  /** Detects an invented metadata query. @returns Never. */
  getPropertySetInfo(): never {
    throw new Error("unexpected property metadata");
  }
  /** Detects an invented property write. @param args - Original arguments. @returns Never. */
  setPropertyValue(...args: Parameters<XPropertySet["setPropertyValue"]>): never {
    void args;
    throw new Error("unexpected property write");
  }
  /** Detects an invented listener registration. @param args - Original arguments. @returns Never. */
  addPropertyChangeListener(...args: Parameters<XPropertySet["addPropertyChangeListener"]>): never {
    void args;
    throw new Error("unexpected listener registration");
  }
  /** Detects an invented listener removal. @param args - Original arguments. @returns Never. */
  removePropertyChangeListener(
    ...args: Parameters<XPropertySet["removePropertyChangeListener"]>
  ): never {
    void args;
    throw new Error("unexpected listener removal");
  }
  /** Detects an invented veto registration. @param args - Original arguments. @returns Never. */
  addVetoableChangeListener(...args: Parameters<XPropertySet["addVetoableChangeListener"]>): never {
    void args;
    throw new Error("unexpected veto registration");
  }
  /** Detects an invented veto removal. @param args - Original arguments. @returns Never. */
  removeVetoableChangeListener(
    ...args: Parameters<XPropertySet["removeVetoableChangeListener"]>
  ): never {
    void args;
    throw new Error("unexpected veto removal");
  }
  /** Detects an invented service creation. @param args - Original arguments. @returns Never. */
  createInstance(...args: Parameters<XMultiServiceFactory["createInstance"]>): never {
    void args;
    throw new Error("unexpected service creation");
  }
  /** Detects an invented argument constructor. @param args - Original arguments. @returns Never. */
  createInstanceWithArguments(
    ...args: Parameters<XMultiServiceFactory["createInstanceWithArguments"]>
  ): never {
    void args;
    throw new Error("unexpected argument creation");
  }
  /** Detects an invented registry enumeration. @returns Never. */
  getAvailableServiceNames(): never {
    throw new Error("unexpected registry enumeration");
  }
  /** Releases fixture members through the real weak owner. @returns Nothing. */
  protected override destroy(): void {
    this.context.dispose();
    super.destroy();
  }
}
/** Checks source DeploymentException message and actual root Context, then destroys the exception owner. @param action - Original failing call. @param message - Exact source message. @param context - Exact source root pointer or null. @returns Nothing. */
function deployment(action: () => unknown, message: string, context: XInterface | null): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    caught = true;
    expect(error).toBeInstanceOf(DeploymentException);
    const failure = error as DeploymentException;
    try {
      expect(text(failure.Message)).toBe(message);
      expect(failure.Context.get()).toBe(context);
    } finally {
      failure.dispose();
    }
  }
  expect(caught).toBe(true);
}

it("queries only DefaultContext and returns a separately owned context after factory/reference temporaries end", /** Actual Any/query/weak lifetimes cover the full source path without a production context substitute. @returns Nothing. */ () => {
  const context = new Reference<XComponentContext>(new Context()),
    body = new Factory(context),
    factory = new Reference<XMultiServiceFactory>(body),
    weak = new WeakReferenceHelper(context),
    result = getComponentContext(factory);
  expect(body.calls).toEqual(["DefaultContext"]);
  expect(result.get()).toBe(context.get());
  factory.dispose();
  context.dispose();
  const alive = weak.get();
  try {
    expect(alive.is()).toBe(true);
  } finally {
    alive.dispose();
  }
  result.dispose();
  const gone = weak.get();
  try {
    expect(gone.is()).toBe(false);
  } finally {
    gone.dispose();
    weak.dispose();
  }
});

it("retains source missing-property/interface/context errors and translates only UnknownPropertyException", /** Exact exception identity and Context ownership remain observable. @returns Nothing. */ () => {
  const empty = new Reference<XMultiServiceFactory>(),
    plain = new Reference<XMultiServiceFactory>(new PlainFactory()),
    context = new Reference<XComponentContext>(new Context()),
    body = new Factory(context),
    factory = new Reference<XMultiServiceFactory>(body);
  try {
    deployment(
      /** Original null-factory query. @returns Original failure. */ () =>
        getComponentContext(empty),
      "no service factory DefaultContext",
      null,
    );
    deployment(
      /** Original unsupported-property-interface query. @returns Original failure. */ () =>
        getComponentContext(plain),
      "no service factory DefaultContext",
      plain.get(),
    );
    for (const mode of ["void", "wrong-interface", "string"] as const) {
      body.mode = mode;
      deployment(
        /** Original invalid context value query. @returns Original failure. */ () =>
          getComponentContext(factory),
        "no service factory DefaultContext",
        body,
      );
    }
    body.mode = "unknown";
    deployment(
      /** Original missing-property translation. @returns Original failure. */ () =>
        getComponentContext(factory),
      "unknown service factory DefaultContext property: missing Ω\0property",
      body,
    );
    const message = unicode("original failure"),
      root = new Reference<XInterface>(body, UNO_QUERY),
      checked = new Exception(message, root),
      runtime = new RuntimeException(message, root),
      alien = new Error("host failure");
    try {
      body.mode = "exception";
      for (const failure of [checked, runtime, alien]) {
        body.failure = failure;
        let caught: unknown;
        try {
          getComponentContext(factory);
        } catch (error) {
          caught = error;
        }
        expect(caught).toBe(failure);
      }
    } finally {
      checked.dispose();
      runtime.dispose();
      root.dispose();
      message.dispose();
    }
  } finally {
    factory.dispose();
    context.dispose();
    plain.dispose();
    empty.dispose();
  }
});

it("retries failed static initialization, then retains the first successful context across factory replacement and clearing", /** Source successful-once static semantics are preserved instead of adding an invalidation heuristic. @returns Nothing. */ () => {
  const empty = new Reference<XMultiServiceFactory>(),
    firstContext = new Reference<XComponentContext>(new Context()),
    secondContext = new Reference<XComponentContext>(new Context()),
    firstBody = new Factory(firstContext),
    secondBody = new Factory(secondContext),
    first = new Reference<XMultiServiceFactory>(firstBody),
    second = new Reference<XMultiServiceFactory>(secondBody);
  try {
    setProcessServiceFactory(empty);
    deployment(
      /** Original unconfigured getter. @returns Original failure. */ () =>
        getProcessServiceFactory(),
      "null process service factory",
      null,
    );
    deployment(
      /** Original failed static initialization. @returns Original failure. */ () =>
        getProcessComponentContext(),
      "null process service factory",
      null,
    );
    firstBody.mode = "void";
    setProcessServiceFactory(first);
    const copied = getProcessServiceFactory();
    expect(copied).not.toBe(first);
    expect(copied.get()).toBe(first.get());
    copied.dispose();
    deployment(
      /** Original initialization retry with a real but missing context. @returns Original failure. */ () =>
        getProcessComponentContext(),
      "no service factory DefaultContext",
      firstBody,
    );
    firstBody.mode = "context";
    const borrowed = getProcessComponentContext();
    expect(borrowed.get()).toBe(firstContext.get());
    expect(getProcessComponentContext()).toBe(borrowed);
    setProcessServiceFactory(second);
    const current = getProcessServiceFactory(),
      direct = getComponentContext(current);
    try {
      expect(current.get()).toBe(secondBody);
      expect(direct.get()).toBe(secondContext.get());
    } finally {
      direct.dispose();
      current.dispose();
    }
    expect(getProcessComponentContext()).toBe(borrowed);
    expect(firstBody.calls).toEqual(["DefaultContext", "DefaultContext"]);
    expect(secondBody.calls).toEqual(["DefaultContext"]);
    setProcessServiceFactory(empty);
    deployment(
      /** Original cleared factory getter. @returns Original failure. */ () =>
        getProcessServiceFactory(),
      "null process service factory",
      null,
    );
    expect(getProcessComponentContext()).toBe(borrowed);
  } finally {
    setProcessServiceFactory(empty);
    second.dispose();
    first.dispose();
    secondContext.dispose();
    firstContext.dispose();
    empty.dispose();
  }
});

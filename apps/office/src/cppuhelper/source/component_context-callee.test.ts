/** @fileoverview Original invoked context construction and result-mapping contracts through actual context, weak component, Reference, Any, Type and public Mapping owners. */
import { expect, it } from "vitest";
import { ComponentContext, s_createComponentContext_v } from "./component_context";
import { ContextEntry_Init } from "../inc/component_context";
import { WeakComponentImplHelper2 } from "../inc/compbase2";
import { Mapping } from "../../cppu/inc/uno/mapping.hxx";
import type { uno_Mapping } from "../../cppu/inc/uno/mapping";
import type { typelib_InterfaceTypeDescription } from "../../cppu/inc/typelib/typedescription";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { XComponentContext } from "../../udkapi/com/sun/star/uno/XComponentContext";
import type { XMultiComponentFactory } from "../../udkapi/com/sun/star/lang/XMultiComponentFactory";
import type { XEventListener } from "../../udkapi/com/sun/star/lang/XEventListener";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { unicode, text } from "../../i18nlangtag/source/isolang/isolang.tables";

/** Complete caller-supplied delegate boundary uses the real weak/component/query/listener machinery. It is not a production service/context provider. */
class Delegate
  extends WeakComponentImplHelper2.specialize(XComponentContext)
  implements XComponentContext
{
  failure: unknown = null;
  listenerFailure: unknown = null;
  destroyed = 0;
  /** Original caller may return an empty manager, or throw an explicitly prepared exception. @returns Acquired manager. */
  getServiceManager(): Reference<XMultiComponentFactory> {
    if (this.failure !== null) throw this.failure;
    return new Reference();
  }
  /** Original delegated value lookup returns an actual owned Any. @param name - Caller name. @returns Original caller value. */
  getValueByName(name: OUStringConstReference): Any {
    void name;
    return new Any([93], "sal_Int32");
  }
  /** Uses the real source listener container except for the explicitly prepared failing caller case. @param listener - Actual source forwarder. @returns Nothing. */
  override addEventListener(listener: Reference<XEventListener>): void {
    if (this.listenerFailure !== null) throw this.listenerFailure;
    super.addEventListener(listener);
  }
  /** Reports the actual base count without replacing acquisition/release. @returns Strong count. */
  get strong(): number {
    return this.m_refCount[0] as number;
  }
  /** Observes actual source-driven destruction. @returns Nothing. */
  protected override destroy(): void {
    this.destroyed++;
    super.destroy();
  }
}
/** Prepared actual C mapping input executes ownership transfer; it does not provide an environment or registry engine. */
class CallerMapping implements uno_Mapping {
  refs = 0;
  failure: unknown = null;
  readonly inputs: Array<XComponentContext | null> = [];
  /** Original caller mapping acquisition callback. @param mapping - Passed C record. @returns Nothing. */
  acquire(mapping: uno_Mapping): void {
    expect(mapping).toBe(this);
    this.refs++;
  }
  /** Original caller mapping release callback. @param mapping - Passed C record. @returns Nothing. */
  release(mapping: uno_Mapping): void {
    expect(mapping).toBe(this);
    this.refs--;
  }
  /** Checks the source null temporary and actual demanded interface before the prepared transfer. @param mapping - Same C record. @param output - Original wrapper temporary field. @param input - Source context pointer. @param type - Real typelib description. @returns Nothing. */
  mapInterface(
    mapping: uno_Mapping,
    output: [unknown],
    input: unknown,
    type: typelib_InterfaceTypeDescription,
  ): void {
    expect(mapping).toBe(this);
    expect(output[0]).toBeNull();
    expect(text(OUString.unacquired([type.aBase.pTypeName]))).toBe(
      "com.sun.star.uno.XComponentContext",
    );
    const context = input as XComponentContext | null;
    this.inputs.push(context);
    if (this.failure !== null) throw this.failure;
    if (context) context.acquire();
    output[0] = context;
  }
}

/** Actual entries own their values and are released independently of mapped results. @returns Prepared source entries and deterministic caller cleanup. */
function entries() {
  const name = unicode("key"),
    value = new Any([17], "sal_Int32"),
    extraName = unicode("ignored"),
    first = new ContextEntry_Init(name, value, false),
    extra = new ContextEntry_Init(extraName, value, false);
  return {
    name,
    values: [first, extra],
    /** Releases caller entries and source-value temporaries. @returns Nothing. */
    dispose(): void {
      extra.dispose();
      first.dispose();
      extraName.dispose();
      value.dispose();
      name.dispose();
    },
  };
}

for (const count of [0, -1]) {
  it(`transfers the mapped delegate for count ${count} without consuming entries`, /** Checks adoption, original output overwrite and exact five va_list arguments. @returns Nothing. */ () => {
    const delegate = new Delegate(),
      owner = new Reference<XComponentContext>(delegate),
      previous = new Delegate(),
      previousOwner = new Reference<XComponentContext>(previous),
      input = new CallerMapping(),
      mapping = new Mapping(input),
      output: [unknown] = [previous],
      marker = {},
      cursor = [null, count, delegate, output, mapping, marker].values();
    delegate.acquire();
    s_createComponentContext_v(cursor);
    expect(cursor.next().value).toBe(marker);
    expect(output[0]).toBe(delegate);
    expect(input.inputs).toEqual([delegate]);
    expect(delegate.strong).toBe(2);
    expect(previous.strong).toBe(1);
    (output[0] as XComponentContext).release();
    mapping.dispose();
    owner.dispose();
    previousOwner.dispose();
    expect(input.refs).toBe(0);
    expect(delegate.destroyed).toBe(1);
    expect(previous.destroyed).toBe(1);
  });
}
it("creates the actual context for precisely the source count and transfers an owned mapped result", /** The second entry remains unconsumed; mapped context survives all local construction references. @returns Nothing. */ () => {
  const data = entries(),
    input = new CallerMapping(),
    mapping = new Mapping(input),
    output: [unknown] = [null];
  try {
    s_createComponentContext_v([data.values, 1, null, output, mapping].values());
    const context = output[0] as ComponentContext;
    expect(context).toBeInstanceOf(ComponentContext);
    expect(input.inputs).toEqual([context]);
    expect(context.hasByName(data.name)).toBe(true);
    expect(context.hasByName(data.values[1]?.m_sName as OUStringConstReference)).toBe(false);
    const value = context.getValueByName(data.name),
      number: [number] = [0];
    expect(value.extract(number, "sal_Int32")).toBe(true);
    expect(number[0]).toBe(17);
    value.dispose();
    context.release();
  } finally {
    mapping.dispose();
    data.dispose();
  }
  expect(input.refs).toBe(0);
});
it("listens to the real delegate component and disposes the created child first", /** Actual source forwarder/container ownership retains the child and clears it on delegate disposal. @returns Nothing. */ () => {
  const data = entries(),
    delegate = new Delegate(),
    owner = new Reference<XComponentContext>(delegate),
    input = new CallerMapping(),
    mapping = new Mapping(input),
    output: [unknown] = [null];
  try {
    delegate.acquire();
    s_createComponentContext_v([data.values, 1, delegate, output, mapping].values());
    const context = output[0] as ComponentContext;
    expect(context.hasByName(data.name)).toBe(true);
    delegate.dispose();
    expect(context.hasByName(data.name)).toBe(false);
    context.release();
    expect(delegate.strong).toBe(1);
  } finally {
    mapping.dispose();
    owner.dispose();
    data.dispose();
  }
  expect(delegate.destroyed).toBe(1);
});
for (const where of ["constructor", "listener"] as const) {
  it(`suppresses an original UNO ${where} exception and maps a null result`, /** No artificial failure propagates after the source catch; adopted delegate ownership is released. @returns Nothing. */ () => {
    const data = entries(),
      delegate = new Delegate(),
      owner = new Reference<XComponentContext>(delegate),
      input = new CallerMapping(),
      mapping = new Mapping(input),
      output: [unknown] = [{}],
      message = unicode("prepared UNO failure"),
      context = new Reference<XInterface>(),
      error = new RuntimeException(message, context);
    if (where === "constructor") delegate.failure = error;
    else delegate.listenerFailure = error;
    try {
      delegate.acquire();
      s_createComponentContext_v([data.values, 1, delegate, output, mapping].values());
      expect(output[0]).toBeNull();
      expect(input.inputs).toEqual([null]);
      expect(delegate.strong).toBe(1);
    } finally {
      mapping.dispose();
      owner.dispose();
      data.dispose();
      context.dispose();
      message.dispose();
    }
    expect(delegate.destroyed).toBe(1);
  });
}
it("propagates a foreign construction failure without publishing an output or invoking mapping", /** Only the source Exception family is caught. @returns Nothing. */ () => {
  const data = entries(),
    delegate = new Delegate(),
    owner = new Reference<XComponentContext>(delegate),
    input = new CallerMapping(),
    mapping = new Mapping(input),
    previous = {},
    output: [unknown] = [previous],
    error = new Error("caller failure");
  delegate.failure = error;
  try {
    delegate.acquire();
    expect(
      /** Invokes the original construction callee with the prepared foreign failure. @returns Nothing or the same caller exception. */ () =>
        s_createComponentContext_v([data.values, 1, delegate, output, mapping].values()),
    ).toThrow(error);
    expect(output[0]).toBe(previous);
    expect(input.inputs).toEqual([]);
    expect(delegate.strong).toBe(1);
  } finally {
    mapping.dispose();
    owner.dispose();
    data.dispose();
  }
});
it("propagates a mapping failure outside the construction catch and releases the adopted delegate", /** No source-absent mapping exception suppression or early output publication is introduced. @returns Nothing. */ () => {
  const delegate = new Delegate(),
    owner = new Reference<XComponentContext>(delegate),
    input = new CallerMapping(),
    mapping = new Mapping(input),
    previous = {},
    output: [unknown] = [previous],
    message = unicode("map failure"),
    context = new Reference<XInterface>(),
    error = new RuntimeException(message, context);
  input.failure = error;
  try {
    delegate.acquire();
    expect(
      /** Invokes original result mapping outside the construction catch. @returns Nothing or the same mapping exception. */ () =>
        s_createComponentContext_v([null, 0, delegate, output, mapping].values()),
    ).toThrow(error);
    expect(output[0]).toBe(previous);
    expect(delegate.strong).toBe(1);
    error.dispose();
  } finally {
    mapping.dispose();
    owner.dispose();
    context.dispose();
    message.dispose();
  }
});

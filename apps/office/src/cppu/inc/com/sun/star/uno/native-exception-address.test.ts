/** @fileoverview Genuine generated exception values are the actual source/destination addresses for shared UNO Any operations; no shadow record, exception factory or type provider. */
import { afterEach, expect, it } from "vitest";
import { Any } from "./Any";
import { Exception } from "./Exception";
import { RuntimeException, cppu_detail_getUnoType as runtimeType } from "./RuntimeException";
import {
  DeploymentException,
  cppu_detail_getUnoType as deploymentType,
} from "./DeploymentException";
import {
  DisposedException,
  cppu_detail_getUnoType as disposedType,
} from "../lang/DisposedException";
import {
  UnknownPropertyException,
  cppu_detail_getUnoType as unknownType,
} from "../beans/UnknownPropertyException";
import {
  PropertyVetoException,
  cppu_detail_getUnoType as vetoType,
} from "../beans/PropertyVetoException";
import { IOException, cppu_detail_getUnoType as ioType } from "../io/IOException";
import {
  IllegalArgumentException,
  cppu_detail_getUnoType as argumentType,
} from "../lang/IllegalArgumentException";
import {
  WrappedTargetException,
  cppu_detail_getUnoType as wrappedType,
} from "../lang/WrappedTargetException";
import {
  WrappedTargetRuntimeException,
  cppu_detail_getUnoType as wrappedRuntimeType,
} from "../lang/WrappedTargetRuntimeException";
import { DOMException, cppu_detail_getUnoType as domType } from "../xml/dom/DOMException";
import { DOMExceptionType } from "../xml/dom/DOMExceptionType";
import { Reference } from "./Reference";
import { WeakReferenceHelper } from "../../../../../../cppuhelper/inc/weakref";
import { ActiveDataSink } from "../../../../../../ucbhelper/source/client/activedatasink";
import { own, u, read, releaseDomScope } from "../../../../../../test/native-dom";
afterEach(releaseDomScope);

it.each([
  ["RuntimeException", RuntimeException, runtimeType],
  ["DeploymentException", DeploymentException, deploymentType],
  ["DisposedException", DisposedException, disposedType],
  ["UnknownPropertyException", UnknownPropertyException, unknownType],
  ["PropertyVetoException", PropertyVetoException, vetoType],
  ["IOException", IOException, ioType],
] as const)(
  "transports actual %s and its real Context through Any",
  /** Source copy and destination extraction operate on actual field owners. @param name - Original type. @param Constructor - Actual generated class. @param type - Actual generated getter. @returns Nothing. */ (
    name,
    Constructor,
    type,
  ) => {
    void name;
    const context = own(new Reference(new ActiveDataSink())),
      source = own(new Constructor(u("A\0尾"), context)),
      destination = own(new Constructor()),
      payload = own(new Any(source, type));
    expect(source.get(0)).toBe(source.Message.getDataAddress());
    expect(source.get(8)).toBe(source.Context.getAddress());
    expect(payload.extract(destination, type)).toBe(true);
    expect(read(destination.Message.copy(0))).toBe("A\0尾");
    expect(destination.Context.get()).toBe(context.get());
    source.Message = u("changed");
    source.Context.clear();
    payload.clear();
    expect(read(destination.Message.copy(0))).toBe("A\0尾");
    expect(destination.Context.get()).toBe(context.get());
  },
);
it("replaces the actual Context field on extraction and releases the prior object exactly once", /** Real weak objects witness ownership; all stores are native public operations. @returns Nothing. */ () => {
  const old = own(new Reference(new ActiveDataSink())),
    oldWeak = own(new WeakReferenceHelper(old)),
    destination = own(new UnknownPropertyException(u("old"), old));
  old.clear();
  const next = own(new Reference(new ActiveDataSink())),
    nextWeak = own(new WeakReferenceHelper(next)),
    source = own(new UnknownPropertyException(u("next"), next)),
    payload = own(new Any(source, unknownType));
  source.Context.clear();
  next.clear();
  expect(payload.extract(destination, unknownType)).toBe(true);
  expect(own(oldWeak.get()).is()).toBe(false);
  payload.clear();
  const hardened = own(nextWeak.get());
  expect(hardened.get()).toBe(destination.Context.get());
  hardened.clear();
  destination.Context.clear();
  expect(own(nextWeak.get()).is()).toBe(false);
});
it("preserves base extraction and failed downcast destinations through actual Exception storage", /** Native assignment compatibility is retained, with no prototype reconstruction. @returns Nothing. */ () => {
  const empty = own(new Reference()),
    source = own(new RuntimeException(u("source"), empty)),
    payload = own(new Any(source, runtimeType)),
    base = own(new Exception(u("old"), empty)),
    derived = own(new DisposedException(u("untouched"), empty));
  expect(payload.extract(base, "Exception")).toBe(true);
  expect(read(base.Message.copy(0))).toBe("source");
  expect(payload.extract(derived, disposedType)).toBe(false);
  expect(read(derived.Message.copy(0))).toBe("untouched");
});
it("keeps the short ArgumentPosition lvalue stable through extraction, assignment and scalar move construction", /** The member remains a native signed16 scalar with an actual address. @returns Nothing. */ () => {
  const context = own(new Reference()),
    source = own(new IllegalArgumentException(u("argument"), context, -3)),
    destination = own(new IllegalArgumentException()),
    cell = destination.get(16),
    payload = own(new Any(source, argumentType));
  expect(payload.extract(destination, argumentType)).toBe(true);
  expect(destination.ArgumentPosition).toBe(-3);
  expect(destination.get(16)).toBe(cell);
  destination.assign(source);
  expect(destination.get(16)).toBe(cell);
  const moved = own(IllegalArgumentException.move(destination));
  expect(moved.ArgumentPosition).toBe(-3);
  expect(destination.ArgumentPosition).toBe(-3);
  expect(moved.get(16)).not.toBe(cell);
  const movedPayload = own(new Any(moved, argumentType)),
    output = own(new IllegalArgumentException());
  expect(movedPayload.extract(output, argumentType)).toBe(true);
  expect(output.ArgumentPosition).toBe(-3);
});
it("keeps the DOM enum lvalue stable through extraction and implicit value moves", /** Enum transport uses the real generated metadata and base fields. @returns Nothing. */ () => {
  const context = own(new Reference()),
    source = own(new DOMException(u("dom"), context, DOMExceptionType.NAMESPACE_ERR)),
    destination = own(new DOMException()),
    cell = destination.get(16),
    payload = own(new Any(source, domType));
  expect(payload.extract(destination, domType)).toBe(true);
  expect(destination.Code).toBe(DOMExceptionType.NAMESPACE_ERR);
  expect(destination.get(16)).toBe(cell);
  const moved = own(DOMException.move(destination));
  expect(moved.Code).toBe(DOMExceptionType.NAMESPACE_ERR);
  expect(destination.Code).toBe(DOMExceptionType.NAMESPACE_ERR);
  destination.moveAssign(moved);
  expect(destination.get(16)).toBe(cell);
  expect(destination.Code).toBe(DOMExceptionType.NAMESPACE_ERR);
});
it.each([
  ["checked", wrappedType],
  ["runtime", wrappedRuntimeType],
] as const)(
  "copies nested real exception Any through %s",
  /** Shared Any operations retain nested dynamic type and reference ownership. @param kind - Actual generated wrapper family. @param type - Actual wrapper getter. @returns Nothing. */ (
    kind,
    type,
  ) => {
    const context = own(new Reference(new ActiveDataSink())),
      cause = own(new IllegalArgumentException(u("cause"), context, 7)),
      nested = own(new Any(cause, argumentType)),
      source = own(
        kind === "checked"
          ? new WrappedTargetException(u("outer"), context, nested)
          : new WrappedTargetRuntimeException(u("outer"), context, nested),
      ),
      destination = own(
        kind === "checked" ? new WrappedTargetException() : new WrappedTargetRuntimeException(),
      ),
      payload = own(new Any(source, type));
    expect(source.get(16)).toBe(source.TargetException);
    expect(payload.extract(destination, type)).toBe(true);
    const copied = own(new IllegalArgumentException());
    expect(destination.TargetException.extract(copied, argumentType)).toBe(true);
    expect(read(copied.Message.copy(0))).toBe("cause");
    expect(copied.ArgumentPosition).toBe(7);
    expect(copied.Context.get()).toBe(context.get());
    nested.clear();
    source.TargetException.clear();
    payload.clear();
    expect(destination.TargetException.hasValue()).toBe(true);
    const moved = own(
      destination instanceof WrappedTargetRuntimeException
        ? WrappedTargetRuntimeException.move(destination)
        : WrappedTargetException.move(destination),
    );
    expect(moved.TargetException.hasValue()).toBe(true);
    expect(destination.TargetException.hasValue()).toBe(false);
  },
);

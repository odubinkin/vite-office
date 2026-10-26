/** @fileoverview Original weak object/connection point lifetimes through actual Reference, query, exception and weak helper owners. */
import { expect, it } from "vitest";
import { OWeakObject, WeakReferenceHelper } from "./weak";
import { acquire, getXWeak } from "../inc/weak";
import { queryInterface } from "../inc/queryinterface";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { XReference } from "../../cppu/inc/com/sun/star/uno/XReference";
import { XAdapter } from "../../cppu/inc/com/sun/star/uno/XAdapter";
import { XWeak } from "../../cppu/inc/com/sun/star/uno/XWeak";
import { UnoType } from "../../cppu/inc/unotype";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import { IllegalArgumentException } from "../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import type { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import type { Any } from "../../cppu/inc/com/sun/star/uno/Any";

/** Concrete derived caller exposes only live protected state and an external destructor observer. */
class ObjectProbe extends OWeakObject {
  /** Actual native protected counter while alive. @returns Count. */
  count(): number {
    return this.m_refCount[0] as number;
  }
  /** Concrete caller destructor hook. */
  onDestroy: () => void = /** Default external destructor observer. @returns Nothing. */ () => {};
  /** Original virtual destructor dispatch. @returns Nothing. */
  protected override destroy(): void {
    this.onDestroy();
  }
}
/** Concrete listener selected by the caller, with genuine inherited strong lifetime. */
class Listener extends OWeakObject implements XReference {
  /** Caller-selected native callback. @param callback - Action. @returns Listener. */
  constructor(private readonly callback: () => void) {
    super();
  }
  /** Real caller interface query delegates inherited weak/root handling. @param type - Demanded type. @returns Acquired Any. */
  override queryInterface(type: Type): Any {
    if (type.operatorEqual(XReference.static_type()))
      return queryInterface(type, [[XReference.static_type, this]]);
    return super.queryInterface(type);
  }
  /** Original virtual callback. @returns Nothing. */
  dispose(): void {
    this.callback();
  }
}
/** Borrows the actual returned adapter; caller retains its Reference. @param reference - Strong adapter owner. @returns Adapter. */
function adapter(reference: Reference): XAdapter {
  return reference.get() as XAdapter;
}

it("preserves upstream testReferenceDispose delivery to runtime, normal and disposed listeners", /** Replays the original QA callback order with actual weak object/adapter owners; WeakImplHelper itself is not substituted or claimed. @returns Nothing. */ () => {
  const object = new OWeakObject(),
    strong = new Reference(object),
    connection = object.queryAdapter(),
    disposed: number[] = [],
    callbacks = [
      /** Original RuntimeExceptionReference callback. @returns Nothing. */ () => {
        disposed.push(1);
        throw new RuntimeException();
      },
      /** Original ordinary Reference callback. @returns Nothing. */ () => {
        disposed.push(2);
      },
      /** Original DisposedExceptionReference callback. @returns Nothing. */ () => {
        disposed.push(3);
        throw new DisposedException();
      },
    ],
    listeners = callbacks.map(
      /** Constructs actual caller-owned callback References. @param callback - Virtual dispose action. @returns Strong listener reference. */ (
        callback,
      ) => new Reference(new Listener(callback)),
    );
  for (const listener of listeners) adapter(connection).addReference(listener);
  strong.clear();
  expect(disposed).toEqual([1, 2, 3]);
  for (const listener of listeners) listener.dispose();
  connection.dispose();
});

it("rejects resurrection before first acquisition and clears weak references before destruction", /** Checks the zero-count guard and invalidation before destruction. @returns Nothing. */ () => {
  const object = new ObjectProbe(),
    connection = object.queryAdapter();
  expect(object.count()).toBe(0);
  const empty = adapter(connection).queryAdapted();
  expect(empty.is()).toBe(false);
  empty.dispose();
  expect(object.count()).toBe(0);
  const strong = new Reference(object),
    weak = new WeakReferenceHelper(strong),
    hard = weak.get();
  expect(hard.get()).toBe(object);
  expect(object.count()).toBe(2);
  hard.dispose();
  const events: boolean[] = [];
  object.onDestroy =
    /** Observes weak invalidation from the real derived destructor. @returns Nothing. */ () => {
      const result = weak.get();
      events.push(result.is());
      result.dispose();
    };
  strong.dispose();
  expect(events).toEqual([false]);
  const result = adapter(connection).queryAdapted();
  expect(result.is()).toBe(false);
  result.dispose();
  weak.dispose();
  connection.dispose();
});

it("retains lazy adapter identity and the original dummy copy and assignment semantics", /** Checks original copy, assignment, inline acquisition and lazy adapter identity. @returns Nothing. */ () => {
  const source = new ObjectProbe(),
    strong = new Reference(source),
    first = source.queryAdapter(),
    second = source.queryAdapter(),
    copy = new OWeakObject(source),
    copyStrong = new Reference(copy);
  expect(first.get()).toBe(second.get());
  expect(source.assign(copy)).toBe(source);
  expect(source.count()).toBe(1);
  const third = source.queryAdapter(),
    separate = copy.queryAdapter();
  expect(third.get()).toBe(first.get());
  expect(separate.get()).not.toBe(first.get());
  expect(source.getXWeak()).toBe(source);
  expect(getXWeak(source)).toBe(source);
  expect(getXWeak(null)).toBeNull();
  expect(/** Calls the header assertion boundary. @returns Nothing. */ () => acquire(null)).toThrow(
    "assert(instance != NULL)",
  );
  const acquired = acquire(source);
  expect(acquired).toBe(source);
  expect(source.count()).toBe(2);
  acquired.release();
  const root = source.operatorReference();
  expect(source.count()).toBe(2);
  root.dispose();
  copyStrong.dispose();
  separate.dispose();
  strong.dispose();
  first.dispose();
  second.dispose();
  third.dispose();
  const plain = new OWeakObject();
  plain.acquire();
  plain.release();
});

it("queries actual weak, adapter and root interfaces and returns empty on mismatch", /** Checks both declared interface query orders and mismatch. @returns Nothing. */ () => {
  const object = new ObjectProbe(),
    strong = new Reference(object),
    connection = object.queryAdapter();
  for (const [pointer, supported] of [
    [object, XWeak.static_type()],
    [adapter(connection), XAdapter.static_type()],
  ] as const) {
    for (const type of [supported, UnoType.get("XInterface")]) {
      const result = pointer.queryInterface(type);
      expect(result.hasValue()).toBe(true);
      result.dispose();
    }
    const missing = pointer.queryInterface(UnoType.get("sal_Int32"));
    expect(missing.hasValue()).toBe(false);
    missing.dispose();
  }
  strong.dispose();
  connection.dispose();
});

it("removes the newest duplicate and invokes the detached snapshot in insertion order", /** Checks reverse duplicate removal and detached snapshot ordering. @returns Nothing. */ () => {
  const events: number[] = [],
    object = new OWeakObject(),
    strong = new Reference(object),
    connection = object.queryAdapter(),
    point = adapter(connection),
    first = new Listener(
      /** Removes from the empty live list during snapshot delivery. @returns Nothing. */ () => {
        events.push(1);
        point.removeReference(secondRef);
        const result = point.queryAdapted();
        expect(result.is()).toBe(false);
        result.dispose();
      },
    ),
    second = new Listener(
      /** Observes the second snapshot callback. @returns Nothing. */ () => events.push(2),
    ),
    absent = new Listener(
      /** Detects an incorrectly retained absent listener. @returns Nothing. */ () =>
        events.push(3),
    ),
    firstRef = new Reference(first),
    secondRef = new Reference(second),
    absentRef = new Reference(absent);
  point.addReference(firstRef);
  point.addReference(secondRef);
  point.addReference(firstRef);
  point.removeReference(firstRef);
  point.removeReference(absentRef);
  strong.dispose();
  expect(events).toEqual([1, 2]);
  connection.dispose();
  firstRef.dispose();
  secondRef.dispose();
  absentRef.dispose();
});

it("falls back from unequal interface pointers to the actual common root identity", /** Checks the real root-query equality fallback. @returns Nothing. */ () => {
  const events: number[] = [],
    object = new OWeakObject(),
    strong = new Reference(object),
    connection = object.queryAdapter(),
    listener = new Listener(
      /** Detects a listener that should have been removed. @returns Nothing. */ () =>
        events.push(1),
    ),
    listenerRef = new Reference(listener);
  // Concrete caller's second interface facet, as with native multiple inheritance.
  const facet: XReference = {
      /** Delegates the same native object ownership. @returns Nothing. */
      acquire(): void {
        listener.acquire();
      },
      /** Delegates the same native object ownership. @returns Nothing. */
      release(): void {
        listener.release();
      },
      /** Root identity is the first actual interface pointer. @param type - Demanded type. @returns Actual Any. */
      queryInterface(type: Type): Any {
        return listener.queryInterface(type);
      },
      /** Caller facet dispatch. @returns Nothing. */
      dispose(): void {
        listener.dispose();
      },
    },
    facetRef = new Reference(facet);
  adapter(connection).addReference(facetRef);
  adapter(connection).removeReference(listenerRef);
  strong.dispose();
  expect(events).toEqual([]);
  connection.dispose();
  facetRef.dispose();
  listenerRef.dispose();
});

it("ignores disposed listeners, continues after runtime exceptions and preserves the last dynamic exception", /** Checks continuation, ignored disposal and last derived runtime exception. @returns Nothing. */ () => {
  const object = new OWeakObject(),
    strong = new Reference(object),
    connection = object.queryAdapter(),
    point = adapter(connection) as XAdapter & { dispose(): void },
    events: number[] = [],
    last = new IllegalArgumentException();
  last.ArgumentPosition = 17;
  const callbacks = [
    /** Throws the first actual runtime exception. @returns Nothing. */ () => {
      events.push(1);
      throw new RuntimeException();
    },
    /** Throws the ignored actual disposed exception. @returns Nothing. */ () => {
      events.push(2);
      throw new DisposedException();
    },
    /** Throws the last actual derived runtime exception. @returns Nothing. */ () => {
      events.push(3);
      throw last;
    },
    /** Proves delivery continues after the final runtime exception. @returns Nothing. */ () => {
      events.push(4);
    },
  ];
  for (const callback of callbacks) {
    const ref = new Reference(new Listener(callback));
    point.addReference(ref);
    ref.dispose();
  }
  try {
    point.dispose();
    throw new Error("expected exception");
  } catch (error) {
    expect(error).toBe(last);
    expect(last.ArgumentPosition).toBe(17);
    last.dispose();
  }
  expect(events).toEqual([1, 2, 3, 4]);
  strong.dispose();
  connection.dispose();
});

it("swallows the final runtime exception on last strong release before the destructor", /** Checks exception swallowing before virtual destruction. @returns Nothing. */ () => {
  const events: number[] = [],
    object = new ObjectProbe(),
    strong = new Reference(object),
    connection = object.queryAdapter(),
    listener = new Reference(
      new Listener(
        /** Throws the callback exception during last strong release. @returns Nothing. */ () => {
          events.push(1);
          throw new RuntimeException();
        },
      ),
    );
  object.onDestroy = /** Observes destruction after weak disposal. @returns Nothing. */ () =>
    events.push(2);
  adapter(connection).addReference(listener);
  listener.dispose();
  strong.dispose();
  expect(events).toEqual([1, 2]);
  connection.dispose();
});

it("propagates non-runtime callback failures while releasing the detached snapshot", /** Checks unexpected callback failure and snapshot destruction. @returns Nothing. */ () => {
  const object = new OWeakObject(),
    strong = new Reference(object),
    connection = object.queryAdapter(),
    point = adapter(connection) as XAdapter & { dispose(): void },
    failure = new Error("caller"),
    calls: number[] = [];
  for (const callback of [
    /** Leaves a pending runtime exception for cleanup. @returns Nothing. */ () => {
      calls.push(1);
      throw new RuntimeException();
    },
    /** Propagates the caller failure before remaining callbacks. @returns Nothing. */ () => {
      calls.push(2);
      throw failure;
    },
    /** Detects an incorrect callback after propagation. @returns Nothing. */ () => {
      calls.push(3);
    },
  ]) {
    const ref = new Reference(new Listener(callback));
    point.addReference(ref);
    ref.dispose();
  }
  expect(
    /** Invokes the original internal disposal boundary. @returns Nothing. */ () => point.dispose(),
  ).toThrow(failure);
  expect(calls).toEqual([1, 2]);
  strong.dispose();
  connection.dispose();
});

it("destroys listeners registered after a public connection point disposal without another callback", /** Checks vector member destruction after owner invalidation. @returns Nothing. */ () => {
  const object = new OWeakObject(),
    strong = new Reference(object),
    connection = object.queryAdapter(),
    point = adapter(connection) as XAdapter & { dispose(): void },
    calls: number[] = [];
  strong.dispose();
  const ref = new Reference(
    new Listener(
      /** Detects an incorrect callback from vector destruction. @returns Nothing. */ () =>
        calls.push(1),
    ),
  );
  point.addReference(ref);
  ref.dispose();
  connection.dispose();
  expect(calls).toEqual([]);
});

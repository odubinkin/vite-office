/** @fileoverview Translated pinned comphelper_ifcontainer::IfTest and TestInterfaceContainer2::test1 plus critical native union/snapshot/reentrancy/error contracts. */
import { expect, it } from "vitest";
import {
  OInterfaceContainerHelper2 as Container,
  OInterfaceIteratorHelper2 as Iterator,
} from "../../inc/interfacecontainer2";
import { OMultiTypeInterfaceContainerHelper2 as Multi } from "../../inc/multicontainer2";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XVetoableChangeListener } from "../../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import { PropertyChangeEvent } from "../../../udkapi/com/sun/star/beans/PropertyChangeEvent";
import { UNOMemoryStream } from "../streaming/memorystream";
/** Original upstream stats with additional callback order observations. */
interface Stats {
  alive: number;
  disposed: number;
  changed: number;
  order: number[];
}
/** Upstream TestListener/ContainerListener over genuine WeakImplHelper and real interface declarations. */
class Listener
  extends WeakImplHelper.specialize(XVetoableChangeListener)
  implements XVetoableChangeListener
{
  onDispose: (() => void) | null = null;
  /** Acquires upstream construction count. @param stats - Shared observations. @param id - Listener ID. @returns Listener. */
  constructor(
    private readonly stats: Stats,
    private readonly id: number,
  ) {
    super();
    ++stats.alive;
  }
  /** Upstream disposal callback and optional reentrant operation. @param event - Actual event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    void event;
    ++this.stats.disposed;
    this.stats.order.push(this.id);
    this.onDispose?.();
  }
  /** Upstream test1 notification. @param event - Actual event. @returns Nothing. */
  vetoableChange(event: Readonly<PropertyChangeEvent>): void {
    void event;
    ++this.stats.changed;
  }
  /** Upstream destructor count. @returns Nothing. */
  protected override destroy(): void {
    --this.stats.alive;
    super.destroy();
  }
}
/** New independent upstream stats. @returns Counters. */
function stats(): Stats {
  return { alive: 0, disposed: 0, changed: 0, order: [] };
}
/** Verifies and releases an owned source exception. @param action - Operation. @param type - Native constructor. @returns Nothing. */
function failure(action: () => unknown, type: unknown): void {
  try {
    action();
    throw new Error("Expected native exception");
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error.constructor).toBe(type);
    } finally {
      error.dispose();
    }
  }
}
it("ports IfTest::testCreateDispose with all ten real listeners destroyed after notification", /** Original upstream scenario. @returns Nothing. */ () => {
  const state = stats(),
    container = new Container(),
    event = new EventObject();
  try {
    expect(container.getLength()).toBe(0);
    for (let i = 0; i < 10; ++i) {
      const listener = new Reference(new Listener(state, i));
      try {
        expect(container.addInterface(listener)).toBe(i + 1);
        expect(container.getLength()).toBe(i + 1);
      } finally {
        listener.dispose();
      }
    }
    expect(state.alive).toBe(10);
    container.disposeAndClear(event);
    expect(state.disposed).toBe(10);
    expect(state.alive).toBe(0);
    expect(container.getLength()).toBe(0);
  } finally {
    event.dispose();
    container.dispose();
  }
});
it("ports IfTest::testEnumerate with insertion-order Reference copies surviving clear", /** Original upstream scenario. @returns Nothing. */ () => {
  const state = stats(),
    container = new Container(),
    listeners: Reference<Listener>[] = [],
    elements: Reference<import("../../../cppu/inc/com/sun/star/uno/XInterface").XInterface>[] = [];
  try {
    for (let i = 0; i < 10; ++i) {
      const listener = new Reference(new Listener(state, i));
      listeners.push(listener);
      container.addInterface(listener);
    }
    elements.push(...container.getElements());
    expect(elements).toHaveLength(10);
    for (let i = 0; i < 10; ++i)
      expect(
        (elements[i] as Reference<Listener>).operatorEquals(listeners[i] as Reference<Listener>),
      ).toBe(true);
    container.clear();
    expect(container.getLength()).toBe(0);
    expect(state.alive).toBe(10);
  } finally {
    for (const element of elements) element.dispose();
    for (const listener of listeners) listener.dispose();
    container.dispose();
  }
  expect(state.alive).toBe(0);
});
it.each([0, 1, 2, 3])(
  "ports TestInterfaceContainer2::test1 block %i",
  /** Original four scopes: dispose, enumeration, remove all and remove selected. @param variant - Upstream scope index. @returns Nothing. */ (
    variant,
  ) => {
    const state = stats(),
      container = new Container(),
      listeners = [0, 1, 2].map(
        /** Original TestListener construction. @param id - ID. @returns Owner. */ (id) =>
          new Reference(new Listener(state, id)),
      ),
      event = new EventObject(),
      change = new PropertyChangeEvent();
    let active: Iterator | null = null;
    try {
      for (const listener of listeners) container.addInterface(listener);
      if (variant) {
        active = new Iterator(container);
        while (active.hasMoreElements()) {
          const pointer = active.next() as Listener;
          pointer.vetoableChange(change);
          if (variant === 2 || (variant === 3 && pointer === listeners[0]?.get())) active.remove();
        }
        // Original scopes1/2 retain the iterator through disposeAndClear; scope3 ends it here.
        if (variant === 3) {
          active.dispose();
          active = null;
        }
      }
      if (variant === 2) expect(container.getLength()).toBe(0);
      if (variant === 3) {
        expect(container.getLength()).toBe(2);
        const iterator = new Iterator(container);
        try {
          while (iterator.hasMoreElements()) {
            const pointer = iterator.next();
            expect(pointer).not.toBe(listeners[0]?.get());
            expect([listeners[1]?.get(), listeners[2]?.get()]).toContain(pointer);
          }
        } finally {
          iterator.dispose();
        }
      }
      container.disposeAndClear(event);
    } finally {
      active?.dispose();
      change.dispose();
      event.dispose();
      container.dispose();
      for (const listener of listeners) listener.dispose();
    }
    expect(state.alive).toBe(0);
  },
);
it("preserves empty/single/duplicate unions and snapshot ownership across nested iterators and changes", /** Exercises original transition edges and exhausted next returning null. @returns Nothing. */ () => {
  const state = stats(),
    a = new Reference(new Listener(state, 1)),
    b = new Reference(new Listener(state, 2)),
    missing = new Reference(new Listener(state, 3)),
    nil = new Reference<XInterface>(),
    container = new Container();
  try {
    const empty = new Iterator(container);
    expect(empty.next()).toBeNull();
    empty.dispose();
    expect(container.getElements()).toEqual([]);
    expect(container.addInterface(nil)).toBe(0);
    container.addInterface(a);
    expect(container.addInterface(nil)).toBe(0);
    expect(container.getLength()).toBe(1);
    const single = new Iterator(container);
    container.addInterface(a);
    container.addInterface(b);
    expect(single.next()).toBe(a.get());
    expect(single.next()).toBeNull();
    single.remove();
    single.dispose();
    expect(container.getLength()).toBe(2);
    const first = new Iterator(container),
      second = new Iterator(container);
    container.removeInterface(missing);
    container.addInterface(a);
    container.clear();
    try {
      for (const iterator of [first, second]) {
        const pointers = [];
        while (iterator.hasMoreElements()) pointers.push(iterator.next());
        expect(pointers).toEqual([b.get(), a.get()]);
      }
    } finally {
      second.dispose();
      first.dispose();
    }
    container.addInterface(a);
    const indexed = container.getInterface(0),
      elements = container.getElements();
    expect(indexed.get()).toBe(a.get());
    indexed.dispose();
    for (const value of elements) value.dispose();
    expect(container.removeInterface(b)).toBe(1);
    expect(container.removeInterface(a)).toBe(0);
    expect(container.removeInterface(a)).toBe(0);
    container.addInterface(a);
    container.addInterface(b);
    const index = container.getInterface(1);
    expect(index.get()).toBe(b.get());
    index.dispose();
    expect(container.removeInterface(b)).toBe(1);
    expect(container.removeInterface(a)).toBe(0);
  } finally {
    container.dispose();
    nil.dispose();
    missing.dispose();
    b.dispose();
    a.dispose();
  }
  expect(state.alive).toBe(0);
});
it("detaches before disposal, retains reentrant additions and suppresses only RuntimeException", /** Source snapshot semantics protect real listeners and exception ownership. @returns Nothing. */ () => {
  const state = stats(),
    container = new Container(),
    event = new EventObject(),
    a = new Reference(new Listener(state, 1)),
    b = new Reference(new Listener(state, 2)),
    added = new Reference(new Listener(state, 3));
  try {
    (a.get() as Listener).onDispose =
      /** Source reentrant registration. @returns Nothing. */ () => {
        container.addInterface(added);
        throw new RuntimeException();
      };
    container.addInterface(b);
    container.addInterface(a);
    container.disposeAndClear(event);
    expect(state.order).toEqual([1, 2]);
    expect(container.getLength()).toBe(1);
    (added.get() as Listener).onDispose =
      /** Non-Runtime native exception propagates. @returns Never. */ () => {
        throw new IOException();
      };
    failure(
      /** Native I/O failure. @returns Nothing. */ () => container.disposeAndClear(event),
      IOException,
    );
    expect(container.getLength()).toBe(0);
    const plain = new Reference(new UNOMemoryStream());
    try {
      container.addInterface(plain);
      container.disposeAndClear(event);
    } finally {
      plain.dispose();
    }
  } finally {
    event.dispose();
    container.dispose();
    added.dispose();
    b.dispose();
    a.dispose();
  }
  expect(state.alive).toBe(0);
});
it("retains typed forEach/notifyEach query behavior and matching-context disposal removal", /** Original header templates operate on actual declared interfaces. @returns Nothing. */ () => {
  const state = stats(),
    container = new Container(),
    a = new Reference(new Listener(state, 1)),
    b = new Reference(new Listener(state, 2)),
    plain = new Reference(new UNOMemoryStream()),
    event = new EventObject(),
    change = new PropertyChangeEvent();
  try {
    container.addInterface(a);
    container.addInterface(b);
    container.addInterface(plain);
    container.notifyEach(XVetoableChangeListener, Listener.prototype.vetoableChange, change);
    expect(state.changed).toBe(2);
    container.forEach<XEventListener>(
      XEventListener,
      /** Current listener is disposed. @param reference - Actual queried owner. @returns Never. */ (
        reference,
      ) => {
        const message = new OUString();
        try {
          throw new DisposedException(message, reference);
        } finally {
          message.dispose();
        }
      },
    );
    expect(container.getLength()).toBe(1);
    container.addInterface(a);
    container.forEach<XEventListener>(
      XEventListener,
      /** Unrelated exception context is swallowed without removal. @param reference - Actual queried owner. @returns Never. */ (
        reference,
      ) => {
        void reference;
        const message = new OUString();
        try {
          throw new DisposedException(message, plain);
        } finally {
          message.dispose();
        }
      },
    );
    expect(container.getLength()).toBe(2);
    failure(
      /** Non-disposed RuntimeException propagates. @returns Nothing. */ () =>
        container.forEach(
          XEventListener,
          /** Fails before any removal. @returns Never. */ () => {
            throw new RuntimeException();
          },
        ),
      RuntimeException,
    );
    container.notifyEach(XEventListener, Listener.prototype.disposing, event);
  } finally {
    change.dispose();
    event.dispose();
    container.dispose();
    plain.dispose();
    b.dispose();
    a.dispose();
  }
  expect(state.alive).toBe(0);
});
it("retains multi-type keys and snapshots existing container pointers across reentrant registration", /** Uses actual Type equality, including copied keys, without a string-key registry. @returns Nothing. */ () => {
  const state = stats(),
    multi = new Multi(),
    a = new Reference(new Listener(state, 1)),
    b = new Reference(new Listener(state, 2)),
    nil = new Reference<XInterface>(),
    first = XEventListener.static_type(),
    second = XVetoableChangeListener.static_type();
  const event = new EventObject(),
    copy = new Type(first);
  try {
    expect(multi.getContainer(first)).toBeNull();
    expect(multi.removeInterface(first, a)).toBe(0);
    multi.disposeAndClear(event);
    expect(multi.addInterface(first, nil)).toBe(0);
    const original = multi.getContainer(copy);
    expect(original).not.toBeNull();
    expect(multi.getContainedTypes()).toEqual([]);
    multi.addInterface(copy, a);
    (a.get() as Listener).onDispose =
      /** New key is outside the current pointer snapshot. @returns Nothing. */ () => {
        multi.addInterface(second, b);
      };
    multi.disposeAndClear(event);
    expect(state.order).toEqual([1]);
    expect(multi.getContainer(first)).toBe(original);
    const types = multi.getContainedTypes();
    try {
      expect(types).toHaveLength(1);
      expect((types[0] as Type).equals(second)).toBe(true);
    } finally {
      for (const type of types) type.dispose();
    }
    expect(multi.removeInterface(second, b)).toBe(0);
    multi.addInterface(first, a);
    multi.addInterface(second, b);
    multi.clear();
    expect(multi.getContainedTypes()).toEqual([]);
    expect(multi.getContainer(first)).toBe(original);
  } finally {
    copy.dispose();
    event.dispose();
    multi.dispose();
    nil.dispose();
    b.dispose();
    a.dispose();
  }
  expect(state.alive).toBe(0);
});

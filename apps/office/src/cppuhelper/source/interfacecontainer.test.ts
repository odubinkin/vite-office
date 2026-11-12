/** @fileoverview Original IfTest create/dispose, enumerate and Type/signed32 multi-container QA plus critical native ownership contracts. Generic Var QA remains pending with its unconsumed template. */
import { afterEach, expect, it } from "vitest";
import {
  OInterfaceContainerHelper as Container,
  OInterfaceIteratorHelper as Iterator,
  OMultiTypeInterfaceContainerHelper as Multi,
  OBroadcastHelper,
} from "../inc/interfacecontainer";
import { OMultiTypeInterfaceContainerHelperInt32 as MultiInt } from "../inc/propshlp";
import { WeakImplHelper } from "../inc/implbase";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { XEventListener } from "../../udkapi/com/sun/star/lang/XEventListener";
import { EventObject } from "../../udkapi/com/sun/star/lang/EventObject";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../cppu/inc/unotype";
import type { typelib_TypeDescriptionReference as R } from "../../cppu/inc/typelib/typedescription";
import { own, u, releaseDomScope } from "../../test/native-dom";
afterEach(releaseDomScope);
/** Original QA statistics. */ class Stats {
  alive = 0;
  disposed = 0;
}
/** Original ContainerListener QA component with optional critical-case reentry. */
class Listener extends WeakImplHelper.specialize(XEventListener) implements XEventListener {
  action: ((event: Readonly<EventObject>) => void) | null = null;
  /** Original QA construction. @param stats - Counter. @returns Listener. */ constructor(
    private readonly stats: Stats,
  ) {
    super();
    ++stats.alive;
  }
  /** Original QA destruction. @returns Nothing. */ protected override destroy(): void {
    --this.stats.alive;
    super.destroy();
  }
  /** Original QA callback. @param event - Event. @returns Nothing. */ disposing(
    event: Readonly<EventObject>,
  ): void {
    ++this.stats.disposed;
    this.action?.(event);
  }
  /** Concrete protected source counter observer. @returns Count. */ count(): number {
    return this.m_refCount[0] as number;
  }
}
/** Reads native returned interface element. @param seq - Sequence. @param i - Index. @returns Borrowed pointer. */
function element(seq: Sequence<Reference<XInterface>>, i: number): XInterface | null {
  return ((seq.getConstArray() as SequenceElements).get(i * 8) as [XInterface | null])[0];
}
it("replays original IfTest::testCreateDispose", /** All original10 addition/alive/disposal assertions. @returns Nothing. */ () => {
  const stats = new Stats(),
    container = new Container();
  try {
    expect(container.getLength()).toBe(0);
    for (let i = 0; i < 10; ++i) {
      const ref = new Reference(new Listener(stats));
      try {
        expect(container.addInterface(ref)).toBe(i + 1);
        expect(container.getLength()).toBe(i + 1);
      } finally {
        ref.dispose();
      }
    }
    expect(stats.alive).toBe(10);
    container.disposeAndClear(own(new EventObject()));
    expect(stats.disposed).toBe(10);
    expect(stats.alive).toBe(0);
  } finally {
    container.dispose();
  }
});
it("replays original IfTest::testEnumerate", /** Actual native Reference sequence retains insertion order. @returns Nothing. */ () => {
  const stats = new Stats(),
    container = new Container(),
    refs: Reference<Listener>[] = [];
  try {
    for (let i = 0; i < 10; ++i) {
      const ref = new Reference(new Listener(stats));
      refs.push(ref);
      container.addInterface(ref);
    }
    const seq = container.getElements();
    try {
      expect(seq.getLength()).toBe(10);
      for (let i = 0; i < 10; ++i)
        expect(element(seq, i)).toBe((refs[i] as Reference<Listener>).get());
    } finally {
      seq.dispose();
    }
    container.clear();
    expect(container.getLength()).toBe(0);
  } finally {
    container.dispose();
    for (const ref of refs) ref.dispose();
  }
  expect(stats.alive).toBe(0);
});
/** Complete original doContainerTest body and both removal phases. @param container - Actual concrete helper. @param keys - Original keys. @returns Nothing. */
function doContainerTest<K>(
  container: {
    addInterface(key: K, ref: Reference<Listener>): number;
    removeInterface(key: K, ref: Reference<Listener>): number;
    getContainer(key: K): Container | null;
    dispose(): void;
  },
  keys: readonly K[],
): void {
  const stats = new Stats(),
    refs: Reference<Listener>[] = [];
  try {
    for (let i = 0; i < 20; ++i) {
      const ref = new Reference(new Listener(stats));
      refs.push(ref);
      container.addInterface(keys[Math.floor(i / 2)] as K, ref);
    }
    for (let i = 0; i < 10; ++i) {
      const helper = container.getContainer(keys[i] as K);
      expect(helper).not.toBeNull();
      const seq = (helper as Container).getElements();
      try {
        expect(seq.getLength()).toBe(2);
        expect(element(seq, 0)).toBe((refs[i * 2] as Reference<Listener>).get());
        expect(element(seq, 1)).toBe((refs[i * 2 + 1] as Reference<Listener>).get());
      } finally {
        seq.dispose();
      }
    }
    for (let i = 0; i < 10; ++i)
      container.removeInterface(keys[i] as K, refs[i * 2 + 1] as Reference<Listener>);
    for (let i = 0; i < 10; ++i) {
      const helper = container.getContainer(keys[i] as K);
      expect(helper).not.toBeNull();
      const seq = (helper as Container).getElements();
      try {
        expect(seq.getLength()).toBe(1);
        expect(element(seq, 0)).toBe((refs[i * 2] as Reference<Listener>).get());
      } finally {
        seq.dispose();
      }
    }
    for (let i = 0; i < 5; ++i)
      container.removeInterface(keys[i] as K, refs[i * 2] as Reference<Listener>);
    for (let i = 0; i < 5; ++i) {
      const helper = container.getContainer(keys[i] as K);
      expect(helper).not.toBeNull();
      const seq = (helper as Container).getElements();
      try {
        expect(seq.getLength()).toBe(0);
      } finally {
        seq.dispose();
      }
    }
  } finally {
    container.dispose();
    for (const ref of refs) ref.dispose();
  }
  expect(stats.alive).toBe(0);
}
it("replays original IfTest::testOMultiTypeInterfaceContainerHelper", /** Original ten Type keys. @returns Nothing. */ () => {
  doContainerTest(new Multi(), [
    UnoType.get("bool"),
    UnoType.get("float"),
    UnoType.get("double"),
    UnoType.get("sal_uInt64"),
    UnoType.get("sal_Int64"),
    UnoType.get("sal_uInt32"),
    UnoType.get("sal_Int32"),
    UnoType.get("sal_Int16"),
    UnoType.get("OUString"),
    UnoType.get("sal_Int8"),
  ]);
});
it("replays original IfTest::testOMultiTypeInterfaceContainerHelperInt32", /** Original ten signed32 keys. @returns Nothing. */ () => {
  doContainerTest(new MultiInt(), [0, -1, 1, 256, 1024, 3, 7, 8, 9, 10]);
});
it("retains singleton acquisitions and distinct concurrent reverse snapshots", /** Counts witness actual native COW ownership. @returns Nothing. */ () => {
  const stats = new Stats(),
    a = new Listener(stats),
    b = new Listener(stats),
    c = new Listener(stats),
    ar = own(new Reference(a)),
    br = own(new Reference(b)),
    cr = own(new Reference(c)),
    container = own(new Container());
  const empty = new Iterator(container);
  expect(empty.hasMoreElements()).toBe(false);
  expect(empty.next()).toBeNull();
  empty.dispose();
  container.addInterface(ar);
  expect(a.count()).toBe(2);
  const single = new Iterator(container);
  expect(a.count()).toBe(3);
  container.clear();
  expect(a.count()).toBe(2);
  expect(single.next()).toBe(a);
  expect(single.next()).toBeNull();
  single.dispose();
  expect(a.count()).toBe(1);
  container.addInterface(ar);
  container.addInterface(br);
  const first = new Iterator(container);
  expect(a.count()).toBe(2);
  expect(first.next()).toBe(b);
  const second = new Iterator(container);
  expect(a.count()).toBe(3);
  container.addInterface(cr);
  expect(a.count()).toBe(4);
  expect(second.next()).toBe(b);
  second.remove();
  expect(container.getLength()).toBe(2);
  expect(first.next()).toBe(a);
  second.dispose();
  first.dispose();
  expect(a.count()).toBe(2);
  expect(b.count()).toBe(1);
  expect(c.count()).toBe(2);
  const shared = new Iterator(container);
  expect(shared.next()).toBe(c);
  shared.dispose();
  container.clear();
  expect(a.count()).toBe(1);
  expect(c.count()).toBe(1);
});
it("erases one duplicate, queries identity on misses and retains diagnostic-only null insertion", /** Native null singleton collapse is undefined and remains unqualified. @returns Nothing. */ () => {
  const stats = new Stats(),
    ar = own(new Reference(new Listener(stats))),
    br = own(new Reference(new Listener(stats))),
    other = own(new Reference(new Listener(stats))),
    empty = own(new Reference<XInterface>()),
    container = own(new Container());
  expect(container.addInterface(empty)).toBe(1);
  expect(container.getLength()).toBe(0);
  expect(own(container.getElements()).getLength()).toBe(0);
  expect(container.removeInterface(ar)).toBe(0);
  container.addInterface(ar);
  expect(container.removeInterface(other)).toBe(1);
  const one = new Iterator(container);
  expect(one.next()).toBe(ar.get());
  one.remove();
  expect(container.getLength()).toBe(0);
  one.dispose();
  container.addInterface(ar);
  const seq = own(container.getElements());
  expect(seq.getLength()).toBe(1);
  expect(element(seq, 0)).toBe(ar.get());
  container.addInterface(ar);
  container.addInterface(br);
  expect(container.removeInterface(other)).toBe(3);
  expect(container.removeInterface(ar)).toBe(2);
  expect(container.removeInterface(ar)).toBe(1);
  expect(container.removeInterface(br)).toBe(0);
});
it("clears before callbacks, swallows only RuntimeException and preserves reentrant additions", /** Real listener query and callback cleanup. @returns Nothing. */ () => {
  const stats = new Stats(),
    a = new Listener(stats),
    b = new Listener(stats),
    ar = own(new Reference(a)),
    br = own(new Reference(b)),
    container = own(new Container()),
    event = own(new EventObject());
  b.action = /** Callback sees cleared live container. @returns Never. */ () => {
    expect(container.getLength()).toBe(0);
    container.addInterface(ar);
    throw new RuntimeException();
  };
  container.addInterface(br);
  container.disposeAndClear(event);
  expect(stats.disposed).toBe(1);
  expect(container.getLength()).toBe(1);
  a.action = /** Host errors propagate. @returns Never. */ () => {
    throw new Error("host failure");
  };
  expect(/** Actual dispatch. @returns Nothing. */ () => container.disposeAndClear(event)).toThrow(
    "host failure",
  );
  expect(container.getLength()).toBe(0);
  const plain = own(new Reference(new (WeakImplHelper.specialize())()));
  container.addInterface(plain);
  container.disposeAndClear(event);
  expect(stats.disposed).toBe(2);
});
it("forEach uses actual facet queries and matching DisposedException removal", /** Foreign Context is swallowed and RuntimeException propagates. @returns Nothing. */ () => {
  const stats = new Stats(),
    a = new Listener(stats),
    b = new Listener(stats),
    ar = own(new Reference(a)),
    br = own(new Reference(b)),
    foreign = own(new Reference(new Listener(stats))),
    container = own(new Container()),
    message = u("");
  container.addInterface(ar);
  container.addInterface(br);
  container.forEach<XEventListener>(
    XEventListener.static_type,
    /** Original callback exception. @param listener - Queried member. @returns Never. */ (
      listener,
    ) => {
      throw new DisposedException(message, listener.get() === a ? ar : foreign);
    },
  );
  expect(container.getLength()).toBe(1);
  expect(element(own(container.getElements()), 0)).toBe(b);
  container.notifyEach<XEventListener, Readonly<EventObject>>(
    XEventListener.static_type,
    Listener.prototype.disposing,
    own(new EventObject()),
  );
  expect(stats.disposed).toBe(1);
  b.action = /** Matching Context removal. @returns Never. */ () => {
    throw new DisposedException(message, br);
  };
  container.notifyEach<XEventListener, Readonly<EventObject>>(
    XEventListener.static_type,
    Listener.prototype.disposing,
    own(new EventObject()),
  );
  expect(container.getLength()).toBe(0);
  container.addInterface(ar);
  let caught = false;
  try {
    container.forEach(
      XEventListener.static_type,
      /** Non-disposed UNO error propagates. @returns Never. */ () => {
        throw new RuntimeException();
      },
    );
  } catch (error) {
    expect(error).toBeInstanceOf(RuntimeException);
    own(error as RuntimeException);
    caught = true;
  }
  expect(caught).toBe(true);
  const plain = own(new Reference(new (WeakImplHelper.specialize())()));
  container.clear();
  container.addInterface(plain);
  container.forEach(
    XEventListener.static_type,
    /** Unsupported facet is skipped. @returns Never. */ () => {
      throw new Error("unexpected");
    },
  );
});
it("retains Type and signed32 child identities, active-key sequences and dispatch snapshots", /** Actual source maps retain empty children and exclude newly appended keys from current dispatch. @returns Nothing. */ () => {
  const stats = new Stats(),
    listener = new Listener(stats),
    ref = own(new Reference(listener)),
    event = own(new EventObject()),
    multi = own(new Multi()),
    key = own(new Type(UnoType.get("bool"))),
    key2 = UnoType.get("sal_Int32"),
    key3 = UnoType.get("OUString");
  expect(own(multi.getContainedTypes()).getLength()).toBe(0);
  expect(multi.getContainer(key)).toBeNull();
  expect(multi.removeInterface(key, ref)).toBe(0);
  multi.disposeAndClear(event);
  multi.addInterface(key, ref);
  multi.addInterface(key, ref);
  multi.addInterface(key2, ref);
  const typeKeys = own(multi.getContainedTypes()),
    typeArray = typeKeys.getConstArray() as SequenceElements;
  expect(typeKeys.getLength()).toBe(2);
  expect(
    getTypeFromTypeDescriptionReference(typeArray.get(0) as [R | null]).equals(UnoType.get("bool")),
  ).toBe(true);
  expect(getTypeFromTypeDescriptionReference(typeArray.get(8) as [R | null]).equals(key2)).toBe(
    true,
  );
  const first = multi.getContainer(key);
  key.assign(UnoType.get("double"));
  expect(multi.getContainer(UnoType.get("bool"))).toBe(first);
  multi.removeInterface(key2, ref);
  expect(own(multi.getContainedTypes()).getLength()).toBe(1);
  const second = multi.getContainer(key2);
  listener.action = /** New child lies outside this source snapshot. @returns Nothing. */ () => {
    multi.addInterface(key3, ref);
  };
  multi.disposeAndClear(event);
  expect(stats.disposed).toBe(2);
  expect((multi.getContainer(key3) as Container).getLength()).toBe(2);
  multi.clear();
  expect(own(multi.getContainedTypes()).getLength()).toBe(0);
  expect(multi.getContainer(key2)).toBe(second);
  const lazy = new MultiInt();
  expect(own(lazy.getContainedTypes()).getLength()).toBe(0);
  expect(lazy.getContainer(8)).toBeNull();
  expect(lazy.removeInterface(8, ref)).toBe(0);
  lazy.clear();
  lazy.disposeAndClear(event);
  lazy.dispose();
  const ints = own(new MultiInt());
  ints.addInterface(-1, ref);
  ints.addInterface(-1, ref);
  ints.addInterface(9, ref);
  const keys = own(ints.getContainedTypes()),
    array = keys.getConstArray() as SequenceElements;
  expect(keys.getLength()).toBe(2);
  expect((array.get(0) as [number])[0]).toBe(-1);
  expect((array.get(4) as [number])[0]).toBe(9);
  expect(ints.getContainer(99)).toBeNull();
  expect(ints.removeInterface(99, ref)).toBe(0);
  ints.removeInterface(9, ref);
  const child = ints.getContainer(9);
  expect(own(ints.getContainedTypes()).getLength()).toBe(1);
  listener.action = /** New signed32 child excluded from snapshot. @returns Nothing. */ () => {
    ints.addInterface(77, ref);
  };
  ints.disposeAndClear(event);
  expect(stats.disposed).toBe(4);
  expect((ints.getContainer(77) as Container).getLength()).toBe(2);
  ints.clear();
  expect(own(ints.getContainedTypes()).getLength()).toBe(0);
  expect(ints.getContainer(9)).toBe(child);
});
it("uses original broadcaster disposed flags to suppress add and remove", /** No lock or source state is simulated. @returns Nothing. */ () => {
  const stats = new Stats(),
    ref = own(new Reference(new Listener(stats))),
    broadcast = own(new OBroadcastHelper()),
    key = XEventListener.static_type();
  broadcast.addListener(key, ref);
  const child = broadcast.getContainer(key);
  expect((child as Container).getLength()).toBe(1);
  broadcast.bInDispose = true;
  broadcast.addListener(key, ref);
  broadcast.removeListener(key, ref);
  expect((child as Container).getLength()).toBe(1);
  broadcast.bInDispose = false;
  broadcast.bDisposed = true;
  broadcast.addListener(key, ref);
  broadcast.removeListener(key, ref);
  expect((child as Container).getLength()).toBe(1);
  broadcast.bDisposed = false;
  broadcast.removeListener(key, ref);
  expect((child as Container).getLength()).toBe(0);
  expect(broadcast.getContainer(key)).toBe(child);
});

/** @fileoverview Original shared listener container/iterator semantics through actual component, Reference, COW and generated exception owners. */
import { expect, it } from "vitest";
import { OInterfaceContainerHelper3, OInterfaceIteratorHelper3 } from "./interfacecontainer3";
import { WeakImplHelper } from "../../cppuhelper/inc/implbase";
import { XEventListener } from "../../udkapi/com/sun/star/lang/XEventListener";
import { EventObject } from "../../udkapi/com/sun/star/lang/EventObject";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OUString } from "../../sal/inc/rtl/ustring";
/** Genuine caller component supplies its event callback over actual shared weak/query/type machinery. */
class Listener extends WeakImplHelper.specialize(XEventListener) implements XEventListener {
  /** Original callback owner. */ action: ((event: Readonly<EventObject>) => void) | null = null;
  /** Genuine declared listener callback. @param event - Borrowed event. @returns Nothing. */ disposing(
    event: Readonly<EventObject>,
  ): void {
    this.action?.(event);
  }
  /** Original protected native counter observer in the concrete caller. @returns Current count. */ count(): number {
    return this.m_refCount[0] as number;
  }
}
const C = OInterfaceContainerHelper3.specialize<XEventListener>(XEventListener);
it("preserves duplicate references, borrowed index access and shallow reverse iterator snapshots", /** Actual Reference counts distinguish sharing from eager copies and preserve live erase semantics. @returns Nothing. */ () => {
  const a = new Listener(),
    b = new Listener(),
    c = new Listener(),
    ar = new Reference(a),
    br = new Reference(b),
    cr = new Reference(c),
    container = new C();
  expect(OInterfaceContainerHelper3.specialize(XEventListener)).toBe(C);
  const iterEmpty = new OInterfaceIteratorHelper3(container);
  expect(iterEmpty.hasMoreElements()).toBe(false);
  iterEmpty.dispose();
  try {
    expect(container.addInterface(ar)).toBe(1);
    expect(container.addInterface(br)).toBe(2);
    expect(container.getInterface(0).get()).toBe(a);
    const elements = container.getElements();
    expect(a.count()).toBe(3);
    for (const member of elements) member.dispose();
    expect(a.count()).toBe(2);
    const iter = new OInterfaceIteratorHelper3(container);
    try {
      expect(a.count()).toBe(2);
      expect(iter.next().get()).toBe(b);
      iter.remove();
      expect(container.getLength()).toBe(1);
      expect(a.count()).toBe(3);
      expect(b.count()).toBe(2);
      container.addInterface(ar);
      expect(a.count()).toBe(4);
      expect(container.removeInterface(cr)).toBe(2);
      expect(iter.hasMoreElements()).toBe(true);
      expect(iter.next().get()).toBe(a);
      expect(iter.hasMoreElements()).toBe(false);
      container.clear();
      expect(a.count()).toBe(2);
    } finally {
      iter.dispose();
    }
    expect(a.count()).toBe(1);
    expect(b.count()).toBe(1);
    container.addInterface(ar);
    container.addInterface(ar);
    container.addInterface(br);
    expect(container.removeInterface(ar)).toBe(2);
    expect(container.getInterface(0).get()).toBe(a);
    expect(container.getInterface(1).get()).toBe(b);
  } finally {
    container.dispose();
    ar.dispose();
    br.dispose();
    cr.dispose();
  }
});
it("retains snapshot order during reentrant mutation and exact DisposedException Context handling", /** Foreign disposed Context is swallowed without removal, as the original source specifies. @returns Nothing. */ () => {
  const a = new Listener(),
    b = new Listener(),
    foreign = new Listener(),
    ar = new Reference(a),
    br = new Reference(b),
    fr = new Reference(foreign),
    container = new C(),
    seen: Listener[] = [],
    message = new OUString();
  try {
    container.forEach(
      /** Empty callbacks are never called. @returns Never. */ () => {
        throw new Error("empty");
      },
    );
    container.addInterface(ar);
    container.addInterface(br);
    container.forEach(
      /** Actual callback edits the live vector while its old snapshot remains valid. @param ref - Current acquired member. @returns Nothing. */ (
        ref,
      ) => {
        const listener = ref.get() as Listener;
        seen.push(listener);
        if (listener === b) {
          expect(listener.count()).toBe(3);
          container.removeInterface(ar);
          throw new DisposedException(message, fr);
        }
        throw new DisposedException(message, ar);
      },
    );
    expect(seen).toEqual([b, a]);
    expect(container.getLength()).toBe(1);
    expect(container.getInterface(0).get()).toBe(b);
    expect(a.count()).toBe(1);
    expect(b.count()).toBe(2);
    container.forEach(
      /** Matching disposed Context removes the remaining member. @returns Never. */ () => {
        throw new DisposedException(message, br);
      },
    );
    expect(container.getLength()).toBe(0);
    expect(b.count()).toBe(1);
  } finally {
    container.dispose();
    message.dispose();
    fr.dispose();
    br.dispose();
    ar.dispose();
  }
});
it("preserves method receivers, clears before disposing and retains newly added callbacks", /** RuntimeException is swallowed and reentrant additions survive the original live clear. @returns Nothing. */ () => {
  const a = new Listener(),
    b = new Listener(),
    late = new Listener(),
    ar = new Reference(a),
    br = new Reference(b),
    lr = new Reference(late),
    container = new C(),
    event = new EventObject(),
    seen: Listener[] = [];
  try {
    a.action = /** Actual listener body. @param value - Borrowed event. @returns Nothing. */ (
      value,
    ) => {
      expect(value).toBe(event);
      seen.push(a);
    };
    b.action = /** Actual listener body. @param value - Borrowed event. @returns Nothing. */ (
      value,
    ) => {
      expect(value).toBe(event);
      seen.push(b);
    };
    container.addInterface(ar);
    container.addInterface(br);
    container.notifyEach(Listener.prototype.disposing, event);
    expect(seen).toEqual([b, a]);
    seen.length = 0;
    b.action =
      /** Source disposing runs after the live clear and without a copied current Reference. @param value - Borrowed event. @returns Nothing. */ (
        value,
      ) => {
        expect(value).toBe(event);
        expect(container.getLength()).toBe(0);
        expect(b.count()).toBe(2);
        seen.push(b);
        container.addInterface(lr);
        throw new RuntimeException();
      };
    container.disposeAndClear(event);
    expect(seen).toEqual([b, a]);
    expect(container.getLength()).toBe(1);
    expect(container.getInterface(0).get()).toBe(late);
    expect(a.count()).toBe(1);
    expect(b.count()).toBe(1);
    container.clear();
    container.disposeAndClear(event);
  } finally {
    container.dispose();
    event.dispose();
    lr.dispose();
    br.dispose();
    ar.dispose();
  }
});
it("propagates other callback exceptions and destroys snapshots and current Reference temporaries", /** Actual caught UNO values remain caller owned after propagation. @returns Nothing. */ () => {
  const a = new Listener(),
    ar = new Reference(a),
    container = new C(),
    failure = new RuntimeException(),
    event = new EventObject();
  try {
    container.addInterface(ar);
    let caught: unknown;
    try {
      container.forEach(
        /** Original non-Disposed failure. @returns Never. */ () => {
          throw failure;
        },
      );
    } catch (error) {
      caught = error;
    }
    expect(caught).toBe(failure);
    expect(a.count()).toBe(2);
    expect(container.getLength()).toBe(1);
    const other = new Error("caller");
    a.action = /** Original disposing failure outside RuntimeException. @returns Never. */ () => {
      throw other;
    };
    expect(
      /** Source clear occurs before the exception. @returns Nothing. */ () =>
        container.disposeAndClear(event),
    ).toThrow(other);
    expect(container.getLength()).toBe(0);
    expect(a.count()).toBe(1);
  } finally {
    failure.dispose();
    event.dispose();
    container.dispose();
    ar.dispose();
  }
});
it("retains explicit local assertion admission for invalid null members", /** Native debug0 null misuse is not a parity witness; these checks cover the explicit host assertion binding only. @returns Nothing. */ () => {
  const container = new C(),
    empty = new Reference<XEventListener>();
  try {
    expect(
      /** Invalid local admission. @returns Count. */ () => container.addInterface(empty),
    ).toThrow("assert");
    expect(
      /** Invalid local admission. @returns Count. */ () => container.removeInterface(empty),
    ).toThrow("assert");
  } finally {
    empty.dispose();
    container.dispose();
  }
});

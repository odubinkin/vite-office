/** @fileoverview Original public comphelper listener container4/iterator semantics through actual Reference, COW and exception owners. Retained common source contracts plus the source4 unique/reset behavior are exercised. */
import type { XVetoableChangeListener as VetoListener } from "../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import { expect, it } from "vitest";
import { OInterfaceContainerHelper4, OInterfaceIteratorHelper4 } from "./interfacecontainer4";
import { WeakImplHelper } from "./compbase";
import { XEventListener } from "../../udkapi/com/sun/star/lang/XEventListener";
import { EventObject } from "../../udkapi/com/sun/star/lang/EventObject";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import {
  RuntimeException,
  cppu_detail_getUnoType as runtimeType,
} from "../../cppu/inc/com/sun/star/uno/RuntimeException";
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
const C = OInterfaceContainerHelper4.specialize<XEventListener>(XEventListener);
/** Borrows an existing element through the original complete-vector API, then destroys its owned copy. @param container - Actual source container. @param index - Valid source vector index. @returns Borrowed listener pointer. */
function member(container: InstanceType<typeof C>, index: number) {
  const values = container.getElements();
  try {
    return values[index]?.get();
  } finally {
    for (const value of values) value.dispose();
  }
}

it("preserves duplicate references, complete-vector access and shallow reverse iterator snapshots", /** Actual Reference counts distinguish sharing from eager copies and preserve live erase semantics. @returns Nothing. */ () => {
  const a = new Listener(),
    b = new Listener(),
    c = new Listener(),
    ar = new Reference(a),
    br = new Reference(b),
    cr = new Reference(c),
    container = new C();
  expect(OInterfaceContainerHelper4.specialize(XEventListener)).toBe(C);
  const iterEmpty = new OInterfaceIteratorHelper4(container);
  expect(iterEmpty.hasMoreElements()).toBe(false);
  iterEmpty.dispose();
  try {
    expect(container.addInterface(ar)).toBe(1);
    expect(container.addInterface(br)).toBe(2);
    expect(member(container, 0)).toBe(a);
    const elements = container.getElements();
    expect(a.count()).toBe(3);
    for (const member of elements) member.dispose();
    expect(a.count()).toBe(2);
    const iter = new OInterfaceIteratorHelper4(container);
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
    expect(member(container, 0)).toBe(a);
    expect(member(container, 1)).toBe(b);
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
    expect(member(container, 0)).toBe(b);
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
    expect(member(container, 0)).toBe(late);
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

it("makes unique before callback snapshots and resets disposal storage to its per-template DEFAULT", /** Actual vector identities distinguish the source4 path from clear or iterator-only behavior. @returns Nothing. */ () => {
  const container = new C(),
    listener = new Reference(new Listener());
  container.addInterface(listener);
  const fields = container as unknown as { maData: { const_get(): unknown } };
  const old = fields.maData.const_get(),
    iter = new OInterfaceIteratorHelper4(container);
  try {
    container.forEach(
      /** Original callback observes completed source detachment. @returns Nothing. */ () => {
        expect(fields.maData.const_get()).not.toBe(old);
      },
    );
    const event = new EventObject();
    try {
      container.disposeAndClear(event);
    } finally {
      event.dispose();
    }
    expect(fields.maData.const_get()).toBe(C.DEFAULT_DATA.const_get());
    expect(iter.hasMoreElements()).toBe(true);
  } finally {
    iter.dispose();
    container.dispose();
    listener.dispose();
  }
});

it("captures the actual dynamic UNO exception in the public exception callback overload", /** The source catch-by-value parameter is distinct from the active thrown value. @returns Async completion. */ async () => {
  const { initializeExceptionAbi, withCaughtException } =
      await import("../../cppuhelper/browser/exception-abi"),
    { getCaughtException } = await import("../../cppuhelper/inc/exc_hlp"),
    { IllegalArgumentException, cppu_detail_getUnoType: argumentType } =
      await import("../../cppu/inc/com/sun/star/lang/IllegalArgumentException");
  initializeExceptionAbi();
  const listener = new Listener(),
    reference = new Reference(listener),
    container = new C(),
    message = new OUString(new Uint8Array([98, 97, 100, 0])),
    outer = new RuntimeException(),
    event = new EventObject();
  container.addInterface(reference);
  let captures = 0;
  listener.action = /** Actual application listener failure. @returns Never. */ () => {
    throw new IllegalArgumentException(message, reference, -2);
  };
  try {
    withCaughtException(
      outer,
      /** Keeps an enclosing actual catch while the nested listener throws. @returns Nothing. */ () => {
        container.notifyEach(
          Listener.prototype.disposing,
          event,
          /** Original exception callback sees the actual thrown dynamic class. @returns Nothing. */ () => {
            ++captures;
            const payload = getCaughtException(),
              value = new IllegalArgumentException();
            try {
              expect(payload.extract(value, argumentType)).toBe(true);
              expect(value.ArgumentPosition).toBe(-2);
              expect(value.Context.get()).toBe(listener);
              expect(value.Message.equals(message)).toBe(true);
            } finally {
              value.dispose();
              payload.dispose();
            }
          },
        );
        const captured = getCaughtException(),
          base = new RuntimeException();
        try {
          expect(captured.extract(base, runtimeType)).toBe(true);
        } finally {
          base.dispose();
          captured.dispose();
        }
      },
    );
    expect(captures).toBe(1);
    expect(container.getLength()).toBe(1);
  } finally {
    event.dispose();
    outer.dispose();
    message.dispose();
    container.dispose();
    reference.dispose();
  }
});
it("preserves disposed-listener catch precedence and propagates host exceptions", /** The public catch-all callback handles only other UNO exceptions. @returns Nothing. */ () => {
  const listener = new Listener(),
    reference = new Reference(listener),
    container = new C(),
    event = new EventObject(),
    message = new OUString();
  let callbacks = 0;
  container.addInterface(reference);
  listener.action = /** Original source disposed listener identity. @returns Never. */ () => {
    throw new DisposedException(message, reference);
  };
  try {
    container.notifyEach(
      Listener.prototype.disposing,
      event,
      /** Must not handle the earlier disposed catch. @returns Nothing. */ () => {
        ++callbacks;
      },
    );
    expect(container.getLength()).toBe(0);
    expect(callbacks).toBe(0);
    container.addInterface(reference);
    const failure = new Error("host listener failure");
    listener.action = /** Host errors are not UNO exceptions. @returns Never. */ () => {
      throw failure;
    };
    expect(
      /** Original public notify call. @returns Nothing. */ () =>
        container.notifyEach(
          Listener.prototype.disposing,
          event,
          /** Source callback is not a host catch-all. @returns Nothing. */ () => {
            ++callbacks;
          },
        ),
    ).toThrow(failure);
    expect(callbacks).toBe(0);
    expect(container.getLength()).toBe(1);
  } finally {
    message.dispose();
    event.dispose();
    container.dispose();
    reference.dispose();
  }
});
it("moves the actual COW listener member without acquiring or duplicating listeners", /** Only the source defaulted moves and member assignment run. @returns Nothing. */ () => {
  const listener = new Listener(),
    reference = new Reference(listener),
    source = new C(),
    target = new C();
  source.addInterface(reference);
  const count = listener.count(),
    moved = OInterfaceContainerHelper4.move(source);
  try {
    expect(moved.getLength()).toBe(1);
    expect(listener.count()).toBe(count);
    target.moveAssign(moved);
    expect(target.getLength()).toBe(1);
    expect(listener.count()).toBe(count);
    target.moveAssign(target);
    expect(listener.count()).toBe(count - 1);
  } finally {
    moved.dispose();
    source.dispose();
    target.dispose();
    reference.dispose();
  }
});
it("replays the common complete TestInterfaceContainer2::test1 caller against the public version4 template", /** Original four source scenarios and assertions are retained; only template and erased lock-token syntax differ. @returns Async completion. */ async () => {
  const { XVetoableChangeListener } =
      await import("../../udkapi/com/sun/star/beans/XVetoableChangeListener"),
    { PropertyChangeEvent } = await import("../../udkapi/com/sun/star/beans/PropertyChangeEvent");
  /** Original complete source test listener. */
  class TestListener
    extends WeakImplHelper.specialize(XVetoableChangeListener)
    implements VetoListener
  {
    /** Original empty callback. @param event - Ignored event. @returns Nothing. */ disposing(
      event: Readonly<EventObject>,
    ): void {
      void event;
    }
    /** Original empty callback. @param event - Ignored property event. @returns Nothing. */ vetoableChange(
      event: Readonly<InstanceType<typeof PropertyChangeEvent>>,
    ): void {
      void event;
    }
  }
  const Values = OInterfaceContainerHelper4.specialize<VetoListener>(XVetoableChangeListener);
  for (let scenario = 0; scenario < 4; ++scenario) {
    const helper = new Values(),
      r1 = new Reference(new TestListener()),
      r2 = new Reference(new TestListener()),
      r3 = new Reference(new TestListener()),
      event = new EventObject(),
      property = new PropertyChangeEvent();
    try {
      helper.addInterface(r1);
      helper.addInterface(r2);
      helper.addInterface(r3);
      if (scenario > 0) {
        const iterator = new OInterfaceIteratorHelper4(helper);
        try {
          while (iterator.hasMoreElements()) {
            const value = iterator.next();
            if (scenario < 3) {
              value.operatorStar().vetoableChange(property);
              if (scenario === 2) iterator.remove();
            } else if (value.operatorEquals(r1)) iterator.remove();
          }
        } finally {
          iterator.dispose();
        }
      }
      if (scenario === 2) expect(helper.getLength()).toBe(0);
      if (scenario === 3) {
        expect(helper.getLength()).toBe(2);
        const iterator = new OInterfaceIteratorHelper4(helper);
        try {
          while (iterator.hasMoreElements()) {
            const value = iterator.next();
            expect(value.operatorEquals(r1)).toBe(false);
            expect(value.operatorEquals(r2) || value.operatorEquals(r3)).toBe(true);
          }
        } finally {
          iterator.dispose();
        }
      }
      helper.disposeAndClear(event);
    } finally {
      property.dispose();
      event.dispose();
      r3.dispose();
      r2.dispose();
      r1.dispose();
      helper.dispose();
    }
  }
});

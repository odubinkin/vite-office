/** @fileoverview Actual component-helper query/type/lifecycle contracts over real class_data, interfaces, COW listeners, Type/Any/Reference and weak lifetimes. */
import { expect, it } from "vitest";
import { WeakComponentImplHelperBase2, WeakComponentImplHelper2 } from "./compbase2";
import { WeakImplHelper } from "./implbase";
import { Reference, UNO_QUERY } from "../../cppu/inc/com/sun/star/uno/Reference";
import { XComponent } from "../../udkapi/com/sun/star/lang/XComponent";
import { XTypeProvider } from "../../udkapi/com/sun/star/lang/XTypeProvider";
import { XEventListener } from "../../udkapi/com/sun/star/lang/XEventListener";
import { XPropertyChangeListener } from "../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { PropertyChangeEvent } from "../../udkapi/com/sun/star/beans/PropertyChangeEvent";
import { EventObject } from "../../udkapi/com/sun/star/lang/EventObject";
import { XWeak } from "../../cppu/inc/com/sun/star/uno/XWeak";
import { UnoType } from "../../cppu/inc/unotype";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import {
  typelib_typedescriptionreference_assign,
  type typelib_TypeDescriptionReference as R,
} from "../../cppu/inc/typelib/typedescription";
import { OUString } from "../../sal/inc/rtl/ustring";
import { text } from "../../i18nlangtag/source/isolang/isolang.tables";
/** Actual listener callback; source code never substitutes this for a production context. */
class Listener extends WeakImplHelper.specialize(XEventListener) implements XEventListener {
  /** Binds the actual source callback. @param callback - Original notification body. @returns Listener. */
  constructor(readonly callback: (event: Readonly<EventObject>) => void) {
    super();
  }
  /** Original UNO callback. @param event - Actual source event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    this.callback(event);
  }
}
/** Actual source component base caller exposes only the protected original check/hook for tests. */
class Base extends WeakComponentImplHelperBase2 {
  hooks = 0;
  failure: Error | null = null;
  /** Original virtual hook. @returns Nothing or source caller failure. */
  protected override disposingComponent(): void {
    this.hooks++;
    if (this.failure) throw this.failure;
  }
  /** Original protected guard entry. @returns Nothing or original disposed exception. */
  check(): void {
    this.throwIfDisposed();
  }
}
/** Real native overload collision: UNO event disposing and protected component disposing(unique_lock&) are distinct bodies. */
class Receiver
  extends WeakComponentImplHelper2.specialize(XPropertyChangeListener)
  implements XPropertyChangeListener
{
  readonly calls: string[] = [];
  /** Original protected component hook. @returns Nothing. */
  protected override disposingComponent(): void {
    this.calls.push("component");
  }
  /** Original public UNO event callback, distinct from the native protected overload. @param event - Actual event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    this.calls.push(event.Source.is() ? "source-event" : "empty-event");
  }
  /** Original declared bound-property callback. @param event - Actual event. @returns Nothing. */
  propertyChange(event: Readonly<PropertyChangeEvent>): void {
    this.calls.push(text(event.PropertyName));
  }
}

it("retains real weak/component/type-provider/root and inherited interface queries without confusing disposing overloads", /** The actual helper query graph and qualified base fallback must supply every original interface. @returns Nothing. */ () => {
  const body = new Receiver(),
    root = new Reference<XInterface>(body),
    component = new Reference<XComponent>(root, UNO_QUERY, XComponent.static_type),
    weak = new Reference<XWeak>(root, UNO_QUERY, XWeak.static_type),
    provider = new Reference<XTypeProvider>(root, UNO_QUERY, XTypeProvider.static_type),
    eventListener = new Reference<XEventListener>(root, UNO_QUERY, XEventListener.static_type),
    property = new Reference<XPropertyChangeListener>(
      root,
      UNO_QUERY,
      XPropertyChangeListener.static_type,
    );
  try {
    for (const value of [component, weak, provider, eventListener, property])
      expect(value.get()).toBe(body);
    const event = new EventObject();
    try {
      (eventListener.get() as XEventListener).disposing(event);
    } finally {
      event.dispose();
    }
    (component.get() as XComponent).dispose();
    expect(body.calls).toEqual(["empty-event", "component"]);
    const plain = WeakComponentImplHelper2.specialize();
    expect(plain).toBe(WeakComponentImplHelper2.specialize());
  } finally {
    property.dispose();
    eventListener.dispose();
    provider.dispose();
    weak.dispose();
    component.dispose();
    root.dispose();
  }
});

it("keeps source type order, a successful-once specialization cache and caller COW separation", /** Two distinct derived classes share the original template static, not a cache keyed by instance or derived constructor. @returns Nothing. */ () => {
  /** First actual derived caller of the same original template specialization. */
  class First extends Receiver {}
  /** Second actual derived caller shares the original template statics. */
  class Second extends Receiver {}
  const a = new Reference(new First()),
    b = new Reference(new Second()),
    one = (a.get() as First).getTypes(),
    two = (b.get() as Second).getTypes();
  try {
    expect(one.get()).toBe(two.get());
    expect(one.getLength()).toBe(4);
    const names =
      /** Reads the actual source type fields. @param values - Actual sequence. @returns Declared type names. */ (
        values: typeof one,
      ) => {
        const array = values.getConstArray() as ReadonlyMap<number, [R | null]>;
        return Array.from(
          { length: values.getLength() },
          /** Reads a declared type name from its actual field. @param _ - Unused array element. @param index - Original Type stride position. @returns Name. */ (
            _,
            index,
          ) => {
            const r = array.get(index * 8)?.[0] as R;
            return text(OUString.unacquired([r.pTypeName]));
          },
        );
      };
    expect(names(one)).toEqual([
      "com.sun.star.uno.XWeak",
      "com.sun.star.lang.XComponent",
      "com.sun.star.lang.XTypeProvider",
      "com.sun.star.beans.XPropertyChangeListener",
    ]);
    const writable = one.getArray() as ReadonlyMap<number, [R | null]>;
    typelib_typedescriptionreference_assign(
      writable.get(0) as [R | null],
      UnoType.get("sal_Int32").getTypeLibType(),
    );
    expect(one.get()).not.toBe(two.get());
    expect(names(two)[0]).toBe("com.sun.star.uno.XWeak");
    const empty = (a.get() as First).getImplementationId();
    try {
      expect(empty.getLength()).toBe(0);
    } finally {
      empty.dispose();
    }
  } finally {
    two.dispose();
    one.dispose();
    b.dispose();
    a.dispose();
  }
});

it("marks disposed before callbacks, keeps snapshot order and ignores late registrations", /** These source choices intentionally retain the disagreement with XComponent documentation. @returns Nothing. */ () => {
  const body = new Base(),
    owner = new Reference(body),
    calls: string[] = [],
    a = new Reference<XEventListener>(
      new Listener(
        /** Records actual source and reentrant dispose state. @param event - Actual event. @returns Nothing. */ (
          event,
        ) => {
          expect(event.Source.get()).toBe(body);
          body.dispose();
          calls.push("a");
        },
      ),
    ),
    b = new Reference<XEventListener>(
      new Listener(
        /** Records reverse snapshot order and tries late registration. @param event - Actual event. @returns Nothing. */ (
          event,
        ) => {
          expect(event.Source.get()).toBe(body);
          body.addEventListener(a);
          calls.push("b");
          throw new RuntimeException();
        },
      ),
    );
  try {
    body.addEventListener(a);
    body.addEventListener(a);
    body.addEventListener(b);
    body.check();
    body.dispose();
    body.dispose();
    expect(body.hooks).toBe(1);
    expect(calls).toEqual(["b", "a", "a"]);
    body.addEventListener(b);
    expect(calls).toEqual(["b", "a", "a"]);
    let caught: unknown;
    try {
      body.check();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(DisposedException);
    const failure = caught as DisposedException;
    try {
      expect(failure.Message.isEmpty()).toBe(true);
      expect(failure.Context.get()).toBe(body);
    } finally {
      failure.dispose();
    }
    body.removeEventListener(a);
  } finally {
    b.dispose();
    a.dispose();
    owner.dispose();
  }
});

it("retains the base's disposed flag when its caller hook fails and does not retry notifications", /** The non-noexcept base member propagates the original failure; native template noexcept termination is not executed by this test. @returns Nothing. */ () => {
  const body = new Base(),
    owner = new Reference(body),
    failure = new Error("hook failure"),
    calls: string[] = [],
    listener = new Reference<XEventListener>(
      new Listener(
        /** Records an actual callback. @returns Nothing. */ () => {
          calls.push("notified");
        },
      ),
    );
  try {
    body.addEventListener(listener);
    body.failure = failure;
    expect(
      /** Invokes the original base failure path. @returns Nothing or caller failure. */ () =>
        body.dispose(),
    ).toThrow(failure);
    body.failure = null;
    body.dispose();
    expect(body.hooks).toBe(1);
    expect(calls).toEqual([]);
  } finally {
    listener.dispose();
    owner.dispose();
  }
});

it("rejects non-interface template queries with the original message before class-data lookup", /** The concrete base alone retains its original weak-root nonmatching behavior. @returns Nothing. */ () => {
  const helper = new Reference(new (WeakComponentImplHelper2.specialize())()),
    type = UnoType.get("sal_Int32");
  try {
    let caught: unknown;
    try {
      helper.get()?.queryInterface(type);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(RuntimeException);
    const failure = caught as RuntimeException;
    try {
      expect(text(failure.Message)).toBe('querying for interface "long": no interface type!');
    } finally {
      failure.dispose();
    }
  } finally {
    helper.dispose();
  }
});

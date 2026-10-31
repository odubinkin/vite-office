/** @fileoverview Actual generated property-event inheritance, fields, Any compound transport and listener base queries. */
import { expect, it } from "vitest";
import {
  PropertyChangeEvent,
  cppu_detail_getUnoType_PropertyChangeEvent as eventType,
} from "./PropertyChangeEvent";
import { EventObject } from "../lang/EventObject";
import { XEventListener } from "../lang/XEventListener";
import { XPropertyChangeListener } from "./XPropertyChangeListener";
import { XVetoableChangeListener } from "./XVetoableChangeListener";
import { XPropertySetInfo } from "./XPropertySetInfo";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { OWeakObject } from "../../../../../cppuhelper/inc/weak";
import { WeakReferenceHelper } from "../../../../../cppuhelper/inc/weakref";
import { WeakImplHelper } from "../../../../../cppuhelper/inc/implbase";
import { unicode, text } from "../../../../../i18nlangtag/source/isolang/isolang.tables";
/** Actual declared listener implementation records copied source values; no production property notifier is supplied by this fixture. */
class Listener
  extends WeakImplHelper.specialize(XPropertyChangeListener, XVetoableChangeListener)
  implements XPropertyChangeListener, XVetoableChangeListener
{
  readonly calls: string[] = [];
  /** Original event callback. @param event - Source event. @returns Nothing. */
  propertyChange(event: Readonly<PropertyChangeEvent>): void {
    this.calls.push(text(event.PropertyName));
  }
  /** Original constrained callback. @param event - Source event. @returns Nothing. */
  vetoableChange(event: Readonly<PropertyChangeEvent>): void {
    this.calls.push(text(event.PropertyName));
  }
  /** Original inherited callback. @param event - Source event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    this.calls.push(event.Source.is() ? "source" : "empty");
  }
}
it("retains original defaults, inherited Source, independent members and actual Any transport lifetimes", /** The existing compound copier uses generated base/member metadata and real field addresses. @returns Nothing. */ () => {
  const root = new Reference<XInterface>(new OWeakObject()),
    weak = new WeakReferenceHelper(root),
    name = unicode("DefaultContext\0Ω"),
    oldValue = new Any(false),
    newValue = new Any(true),
    event = new PropertyChangeEvent(root, name, true, -1, oldValue, newValue),
    copy = new PropertyChangeEvent(event),
    transport = new Any(event, eventType),
    output = new PropertyChangeEvent();
  try {
    expect(output.Source.is()).toBe(false);
    expect([
      text(output.PropertyName),
      output.Further,
      output.PropertyHandle,
      output.OldValue.hasValue(),
      output.NewValue.hasValue(),
    ]).toEqual(["", false, 0, false, false]);
    expect(event).toBeInstanceOf(EventObject);
    expect(copy.equals(event)).toBe(true);
    expect(transport.extract(output, eventType)).toBe(true);
    expect(output.equals(event)).toBe(true);
    const storedName = output.PropertyName,
      storedOld = output.OldValue,
      storedNew = output.NewValue;
    output.assign(copy);
    expect(output.PropertyName).toBe(storedName);
    expect(output.OldValue).toBe(storedOld);
    expect(output.NewValue).toBe(storedNew);
    event.PropertyName.clear();
    event.Source.clear();
    event.OldValue.clear();
    expect(text(copy.PropertyName)).toBe("DefaultContext\0Ω");
    expect(output.notEquals(event)).toBe(true);
    root.dispose();
    const alive = weak.get();
    try {
      expect(alive.is()).toBe(true);
    } finally {
      alive.dispose();
    }
  } finally {
    output.dispose();
    transport.dispose();
    copy.dispose();
    event.dispose();
    newValue.dispose();
    oldValue.dispose();
    name.dispose();
    root.dispose();
  }
  const gone = weak.get();
  try {
    expect(gone.is()).toBe(false);
  } finally {
    gone.dispose();
    weak.dispose();
  }
});
it("retains listener XEventListener inheritance and normal generated type identity", /** Queries run through the real WeakImplHelper/Reference/type graph. @returns Nothing. */ () => {
  const body = new Listener(),
    root = new Reference<XInterface>(body),
    property = new Reference<XPropertyChangeListener>(
      root,
      UNO_QUERY,
      XPropertyChangeListener.static_type,
    ),
    veto = new Reference<XVetoableChangeListener>(
      root,
      UNO_QUERY,
      XVetoableChangeListener.static_type,
    ),
    listener = new Reference<XEventListener>(root, UNO_QUERY, XEventListener.static_type),
    event = new PropertyChangeEvent(),
    name = unicode("DefaultContext");
  try {
    event.PropertyName = name;
    (property.get() as XPropertyChangeListener).propertyChange(event);
    (veto.get() as XVetoableChangeListener).vetoableChange(event);
    (listener.get() as XEventListener).disposing(event);
    expect(body.calls).toEqual(["DefaultContext", "DefaultContext", "empty"]);
    expect(XPropertySetInfo.static_type()).toBe(XPropertySetInfo.static_type());
    expect(eventType()).toBe(eventType());
  } finally {
    name.dispose();
    event.dispose();
    listener.dispose();
    veto.dispose();
    property.dispose();
    root.dispose();
  }
});

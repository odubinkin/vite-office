/** @fileoverview Complete published transaction SDK contracts over actual native Type/Reference/WeakImplHelper and multi-type listener owners, without an invented OWriteStream or storage transaction implementation. */
import { expect, it } from "vitest";
import {
  XTransactedObject,
  getCppuType as transactedType,
} from "../../../offapi/com/sun/star/embed/XTransactedObject";
import {
  XTransactionBroadcaster,
  getCppuType as broadcasterType,
} from "../../../offapi/com/sun/star/embed/XTransactionBroadcaster";
import {
  XTransactionListener,
  getCppuType as listenerType,
} from "../../../offapi/com/sun/star/embed/XTransactionListener";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { OMultiTypeInterfaceContainerHelper2 } from "../../../comphelper/inc/multicontainer2";
/** Complete caller fixture implements only the declared transaction interfaces; it is not a package/storage service. */
class TransactionCalls
  extends WeakImplHelper.specialize(XTransactedObject, XTransactionBroadcaster)
  implements XTransactedObject, XTransactionBroadcaster
{
  readonly calls: string[] = [];
  readonly listeners = new OMultiTypeInterfaceContainerHelper2();
  /** Caller operation witness. @returns Nothing. */
  commit(): void {
    this.calls.push("commit");
  }
  /** Caller operation witness. @returns Nothing. */
  revert(): void {
    this.calls.push("revert");
  }
  /** Retains the actual typed listener through the native keyed container. @param listener - Native reference. @returns Nothing. */
  addTransactionListener(listener: Reference<XTransactionListener>): void {
    this.listeners.addInterface(XTransactionListener.static_type(), listener);
  }
  /** Removes a single real listener reference. @param listener - Native reference. @returns Nothing. */
  removeTransactionListener(listener: Reference<XTransactionListener>): void {
    this.listeners.removeInterface(XTransactionListener.static_type(), listener);
  }
  /** Native member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.listeners.dispose();
    super.destroy();
  }
}
/** Actual complete transaction listener with inherited disposing and the original published commited spelling. */
class Listener
  extends WeakImplHelper.specialize(XTransactionListener)
  implements XTransactionListener
{
  readonly calls: string[] = [];
  /** Original callback. @param event - Native event. @returns Nothing. */
  preCommit(event: Readonly<EventObject>): void {
    void event;
    this.calls.push("preCommit");
  }
  /** Original published one-t spelling. @param event - Native event. @returns Nothing. */
  commited(event: Readonly<EventObject>): void {
    void event;
    this.calls.push("commited");
  }
  /** Original callback. @param event - Native event. @returns Nothing. */
  preRevert(event: Readonly<EventObject>): void {
    void event;
    this.calls.push("preRevert");
  }
  /** Original callback. @param event - Native event. @returns Nothing. */
  reverted(event: Readonly<EventObject>): void {
    void event;
    this.calls.push("reverted");
  }
  /** Original inherited callback. @param event - Native event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    void event;
    this.calls.push("disposing");
  }
}
it("retains exact SDK names, required listener base and genuine query/method identities", /** Validates declarations and actual owners, without claiming package commit/revert acceptance. @returns Nothing. */ () => {
  const source = new TransactionCalls(),
    owner = new Reference(source),
    listener = new Listener(),
    listenerOwner = new Reference(listener),
    event = new EventObject(owner),
    transaction = new Reference<XTransactedObject>(owner, UNO_QUERY, XTransactedObject.static_type),
    broadcaster = new Reference<XTransactionBroadcaster>(
      owner,
      UNO_QUERY,
      XTransactionBroadcaster.static_type,
    ),
    language = new Reference<XEventListener>(listenerOwner, UNO_QUERY, XEventListener.static_type),
    extended = new Reference<XTransactionListener>(
      listenerOwner,
      UNO_QUERY,
      XTransactionListener.static_type,
    );
  try {
    expect(transaction.get()).toBe(source);
    expect(broadcaster.get()).toBe(source);
    expect(language.get()).toBe(listener);
    expect(extended.get()).toBe(listener);
    expect(transactedType().equals(XTransactedObject.static_type())).toBe(true);
    expect(transactedType(null).equals(transactedType(owner))).toBe(true);
    expect(broadcasterType().equals(XTransactionBroadcaster.static_type())).toBe(true);
    expect(broadcasterType(null).equals(broadcasterType(owner))).toBe(true);
    expect(listenerType().equals(XTransactionListener.static_type())).toBe(true);
    expect(listenerType(null).equals(listenerType(listenerOwner))).toBe(true);
    (transaction.get() as XTransactedObject).commit();
    (transaction.get() as XTransactedObject).revert();
    expect(source.calls).toEqual(["commit", "revert"]);
    (broadcaster.get() as XTransactionBroadcaster).addTransactionListener(extended);
    const container = source.listeners.getContainer(XTransactionListener.static_type());
    expect(container?.getLength()).toBe(1);
    (extended.get() as XTransactionListener).preCommit(event);
    (extended.get() as XTransactionListener).commited(event);
    (extended.get() as XTransactionListener).preRevert(event);
    (extended.get() as XTransactionListener).reverted(event);
    source.listeners.disposeAndClear(event);
    expect(listener.calls).toEqual(["preCommit", "commited", "preRevert", "reverted", "disposing"]);
    (broadcaster.get() as XTransactionBroadcaster).addTransactionListener(extended);
    (broadcaster.get() as XTransactionBroadcaster).removeTransactionListener(extended);
    expect(container?.getLength()).toBe(0);
  } finally {
    extended.dispose();
    language.dispose();
    broadcaster.dispose();
    transaction.dispose();
    event.dispose();
    listenerOwner.dispose();
    owner.dispose();
  }
});

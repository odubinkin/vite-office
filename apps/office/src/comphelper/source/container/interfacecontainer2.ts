/** @fileoverview Original comphelper interfacecontainer2.cxx single-interface/vector union, snapshot iterator and multi-type containers over actual UNO owners. Native mutex syntax is erased in synchronous calls; no fake mutex or provider is introduced. */
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
/** Original union selected by bIsList; no parallel listener mirror. */
type element_alias2 = XInterface | Reference<XInterface>[] | null;
/** Compiler binding for native friend access to the actual container fields. */
type ContainerFriend = {
  aData: element_alias2;
  bIsList: boolean;
  bInUse: boolean;
  copyAndResetInUse(): void;
};
/** Native vector destruction releases each actual member. @param data - Owned vector. @returns Nothing. */
function deleteVector(data: Reference<XInterface>[]): void {
  for (const reference of data) reference.dispose();
}
/** Original reverse iterator borrows a vector until container mutation transfers ownership to it. */
export class OInterfaceIteratorHelper2 {
  private readonly aData: element_alias2;
  private readonly bIsList: boolean;
  private nRemain: number;
  /** Original snapshot and second-iterator detachment. @param rCont - Actual container, which must outlive the iterator. @returns Iterator. */
  constructor(private readonly rCont: OInterfaceContainerHelper2) {
    const cont = rCont as unknown as ContainerFriend;
    if (cont.bInUse) cont.copyAndResetInUse();
    this.bIsList = cont.bIsList;
    this.aData = cont.aData;
    if (this.bIsList) {
      cont.bInUse = true;
      this.nRemain = (this.aData as Reference<XInterface>[]).length;
    } else if (this.aData) {
      (this.aData as XInterface).acquire();
      this.nRemain = 1;
    } else this.nRemain = 0;
  }
  /** Original remaining predicate. @returns Whether next may return a value. */
  hasMoreElements(): boolean {
    return this.nRemain !== 0;
  }
  /** Original borrowed reverse pointer; exhausted calls return null. @returns Borrowed interface or null. */
  next(): XInterface | null {
    if (this.nRemain) {
      --this.nRemain;
      if (this.bIsList)
        return (
          (this.aData as Reference<XInterface>[])[this.nRemain] as Reference<XInterface>
        ).get();
      else if (this.aData) return this.aData as XInterface;
    }
    return null;
  }
  /** Original current value removal on the live container. @returns Nothing. */
  remove(): void {
    if (this.bIsList)
      this.rCont.removeInterface(
        (this.aData as Reference<XInterface>[])[this.nRemain] as Reference<XInterface>,
      );
    else {
      const reference = new Reference(this.aData as XInterface | null);
      try {
        this.rCont.removeInterface(reference);
      } finally {
        reference.dispose();
      }
    }
  }
  /** Original shared-vector flag reset versus detached vector/single-pointer destruction. @returns Nothing. */
  dispose(): void {
    const cont = this.rCont as unknown as ContainerFriend;
    const shared = this.aData === cont.aData && cont.bIsList;
    if (shared) cont.bInUse = false;
    if (!shared) {
      if (this.bIsList) deleteVector(this.aData as Reference<XInterface>[]);
      else if (this.aData) (this.aData as XInterface).release();
    }
  }
}
/** Original zero/one/list optimization and copy-on-change iterator ownership. */
export class OInterfaceContainerHelper2 {
  private aData: element_alias2 = null;
  private bInUse = false;
  private bIsList = false;
  /** Original native getLength. @returns Count. */
  getLength(): number {
    return this.bIsList ? (this.aData as Reference<XInterface>[]).length : this.aData ? 1 : 0;
  }
  /** Original independent vector of actual Reference copies. @returns Owned reference members. */
  getElements(): Reference<XInterface>[] {
    if (this.bIsList)
      return (this.aData as Reference<XInterface>[]).map(
        /** Native reference copy. @param value - Borrowed member. @returns Owned copy. */ (
          value,
        ) => new Reference(value),
      );
    return this.aData ? [new Reference(this.aData as XInterface)] : [];
  }
  /** Original copies only when in use, leaving the old vector to its iterator. @returns Nothing. */
  private copyAndResetInUse(): void {
    if (this.bInUse) {
      if (this.bIsList)
        this.aData = (this.aData as Reference<XInterface>[]).map(
          /** Native reference copy. @param value - Borrowed member. @returns Owned copy. */ (
            value,
          ) => new Reference(value),
        );
      else if (this.aData) (this.aData as XInterface).acquire();
      this.bInUse = false;
    }
  }
  /** Original null early return, duplicates and single-to-vector promotion. @param listener - Borrowed actual Reference. @returns Source return count. */
  addInterface(listener: Reference<XInterface>): number {
    if (!listener.is()) return 0;
    if (this.bInUse) this.copyAndResetInUse();
    if (this.bIsList) {
      const data = this.aData as Reference<XInterface>[];
      data.push(new Reference(listener));
      return data.length;
    } else if (this.aData) {
      const single = this.aData as XInterface;
      const data = [new Reference(single), new Reference(listener)];
      single.release();
      this.aData = data;
      this.bIsList = true;
      return 2;
    } else {
      this.aData = listener.get();
      if (listener.is()) (listener.get() as XInterface).acquire();
      return 1;
    }
  }
  /** Original pointer-first then identity equality and vector-to-single collapse. @param listener - Borrowed Reference. @returns Remaining count. */
  removeInterface(listener: Reference<XInterface>): number {
    if (this.bInUse) this.copyAndResetInUse();
    if (this.bIsList) {
      const data = this.aData as Reference<XInterface>[];
      let index = data.findIndex(
        /** Original fast pointer comparison. @param value - Member. @returns Match. */ (value) =>
          value.get() === listener.get(),
      );
      if (index === -1)
        index = data.findIndex(
          /** Original root identity comparison. @param value - Member. @returns Match. */ (
            value,
          ) => value.operatorEquals(listener),
        );
      if (index !== -1) {
        for (let i = index; i + 1 < data.length; ++i)
          (data[i] as Reference<XInterface>).moveAssign(data[i + 1] as Reference<XInterface>);
        (data.pop() as Reference<XInterface>).dispose();
      }
      if (data.length === 1) {
        const pointer = (data[0] as Reference<XInterface>).get() as XInterface;
        pointer.acquire();
        deleteVector(data);
        this.aData = pointer;
        this.bIsList = false;
        return 1;
      }
      return data.length;
    } else if (this.aData) {
      const reference = new Reference(this.aData as XInterface);
      try {
        if (reference.operatorEquals(listener)) {
          (this.aData as XInterface).release();
          this.aData = null;
        }
      } finally {
        reference.dispose();
      }
    }
    return this.aData ? 1 : 0;
  }
  /** Original indexed reference return; native index validity is the caller precondition. @param index - Member index. @returns Owned Reference. */
  getInterface(index: number): Reference<XInterface> {
    return this.bIsList
      ? new Reference((this.aData as Reference<XInterface>[])[index] as Reference<XInterface>)
      : new Reference(this.aData as XInterface);
  }
  /** Original detach-before-notify and RuntimeException-only suppression, preserving reentrant additions. @param event - Native event value. @returns Nothing. */
  disposeAndClear(event: Readonly<EventObject>): void {
    const iterator = new OInterfaceIteratorHelper2(this);
    if (!this.bIsList && this.aData) (this.aData as XInterface).release();
    this.aData = null;
    this.bIsList = false;
    this.bInUse = false;
    try {
      while (iterator.hasMoreElements()) {
        try {
          const listener = new Reference<XEventListener>(
            iterator.next(),
            UNO_QUERY,
            XEventListener.static_type,
          );
          try {
            if (listener.is()) (listener.get() as XEventListener).disposing(event);
          } finally {
            listener.dispose();
          }
        } catch (error) {
          if (!(error instanceof RuntimeException)) throw error;
          error.dispose();
        }
      }
    } finally {
      iterator.dispose();
    }
  }
  /** Original clear detaches from iterators and releases only live-container members. @returns Nothing. */
  clear(): void {
    if (this.bInUse) this.copyAndResetInUse();
    if (this.bIsList) deleteVector(this.aData as Reference<XInterface>[]);
    else if (this.aData) (this.aData as XInterface).release();
    this.aData = null;
    this.bIsList = false;
  }
  /** Original typed query forEach; only matching-context DisposedException removes the current listener. @param declaration - Actual compiler-declared ListenerT. @param callback - Native functor. @returns Nothing. */
  forEach<L extends XInterface>(
    declaration: { static_type: () => Type },
    callback: (listener: Reference<L>) => void,
  ): void {
    const iterator = new OInterfaceIteratorHelper2(this);
    try {
      while (iterator.hasMoreElements()) {
        const listener = new Reference<L>(iterator.next(), UNO_QUERY, declaration.static_type);
        try {
          if (listener.is()) {
            try {
              callback(listener);
            } catch (error) {
              if (!(error instanceof DisposedException)) throw error;
              try {
                if (error.Context.operatorEquals(listener)) iterator.remove();
              } finally {
                error.dispose();
              }
            }
          }
        } finally {
          listener.dispose();
        }
      }
    } finally {
      iterator.dispose();
    }
  }
  /** Original member-pointer invocation preserving this identity. @param declaration - Actual ListenerT. @param method - Native member function binding. @param event - Borrowed event. @returns Nothing. */
  notifyEach<L extends XInterface, E>(
    declaration: { static_type: () => Type },
    method: (this: L, event: E) => void,
    event: E,
  ): void {
    this.forEach<L>(
      declaration,
      /** Native member call. @param listener - Queried Reference. @returns Nothing. */ (
        listener,
      ) => method.call(listener.get() as L, event),
    );
  }
  /** Original destructor requires no live iterator and releases the union owner. @returns Nothing. */
  dispose(): void {
    if (this.bIsList) deleteVector(this.aData as Reference<XInterface>[]);
    else if (this.aData) (this.aData as XInterface).release();
  }
}
/** Original ordered vector of Type/unique-container pairs; empty containers retain their keys. */
export class OMultiTypeInterfaceContainerHelper2 {
  private readonly m_aMap: { type: Type; container: OInterfaceContainerHelper2 }[] = [];
  /** Original first Type equality lookup, without string keys. @param key - Actual key. @returns Borrowed pair or absence. */
  private findType(key: Type) {
    return this.m_aMap.find(
      /** Source Type equality. @param entry - Pair. @returns Match. */ (entry) =>
        entry.type.equals(key),
    );
  }
  /** Original nonempty keys returned as actual owned Type copies. @returns Owned Type values. */
  getContainedTypes(): Type[] {
    return this.m_aMap
      .filter(
        /** Original nonempty predicate. @param entry - Pair. @returns Include. */ (entry) =>
          entry.container.getLength() !== 0,
      )
      .map(
        /** Original Type copy. @param entry - Pair. @returns Owned Type. */ (entry) =>
          new Type(entry.type),
      );
  }
  /** Original borrowed container pointer. @param key - Native type. @returns Existing container or null. */
  getContainer(key: Type): OInterfaceContainerHelper2 | null {
    return this.findType(key)?.container ?? null;
  }
  /** Original missing-key creation precedes insertion, including a rejected null listener. @param key - Native key. @param listener - Borrowed Reference. @returns Source count. */
  addInterface(key: Type, listener: Reference<XInterface>): number {
    let entry = this.findType(key);
    if (!entry) {
      entry = { type: new Type(key), container: new OInterfaceContainerHelper2() };
      this.m_aMap.push(entry);
    }
    return entry.container.addInterface(listener);
  }
  /** Original missing-key zero return. @param key - Native key. @param listener - Borrowed Reference. @returns Remaining count. */
  removeInterface(key: Type, listener: Reference<XInterface>): number {
    return this.findType(key)?.container.removeInterface(listener) ?? 0;
  }
  /** Original snapshots container pointers before callbacks; newly introduced keys are not visited in the same pass. @param event - Native event. @returns Nothing. */
  disposeAndClear(event: Readonly<EventObject>): void {
    const containers = this.m_aMap.map(
      /** Copies the borrowed pointer. @param entry - Pair. @returns Borrowed container. */ (
        entry,
      ) => entry.container,
    );
    for (const container of containers) container.disposeAndClear(event);
  }
  /** Original clears members but retains all allocated containers and Type keys. @returns Nothing. */
  clear(): void {
    for (const entry of this.m_aMap) entry.container.clear();
  }
  /** Original vector/unique_ptr destruction. @returns Nothing. */
  dispose(): void {
    for (const entry of this.m_aMap) {
      entry.container.dispose();
      entry.type.dispose();
    }
  }
}

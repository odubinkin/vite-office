/** @fileoverview Original OInterfaceContainerHelper3/iterator algorithms over actual UNO References and cow_wrapper. Template specialization erases ListenerT and its per-type DEFAULT. Synchronous JS omits native mutex scopes; native thread synchronization, ABI and static shutdown are unverified. */
import {
  cow_wrapper,
  ThreadSafeRefCountingPolicy,
  type CowConstructor,
} from "../../o3tl/inc/cow_wrapper";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { XEventListener } from "../../udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../udkapi/com/sun/star/lang/EventObject";
/** Actual compiler declaration identity; no interface or query implementation is synthesized. */
interface ListenerDeclaration {
  readonly static_type: () => unknown;
}
/** Original compiler-specialized container constructor and vector/default static owners. */
export interface InterfaceContainerConstructor<T extends XEventListener> {
  new (): OInterfaceContainerHelper3<T>;
  readonly DataType: CowConstructor<Reference<T>[]>;
  readonly DEFAULT_DATA: cow_wrapper<Reference<T>[]>;
}
/** Actual friend access to the original single data member. */
type ContainerFriend<T extends XEventListener> = { readonly maData: cow_wrapper<Reference<T>[]> };
const specializations: { declaration: ListenerDeclaration; constructor: unknown }[] = [];
/** Original reverse snapshot iterator shares the vector until an actual mutable access detaches it. */
export class OInterfaceIteratorHelper3<T extends XEventListener> {
  private readonly maData: cow_wrapper<Reference<T>[]>;
  private nRemain: number;
  /** Original borrowed container and shallow data copy. @param rCont - Actual container. @returns Iterator. */
  constructor(private readonly rCont: OInterfaceContainerHelper3<T>) {
    const type = rCont.constructor as InterfaceContainerConstructor<T>;
    this.maData = new type.DataType((rCont as unknown as ContainerFriend<T>).maData);
    this.nRemain = this.maData.const_get().length;
  }
  /** Original remaining-count predicate. @returns Whether next is permitted. */
  hasMoreElements(): boolean {
    return this.nRemain !== 0;
  }
  /** Original reverse borrowed access; nonempty is the native precondition. @returns Borrowed Reference. */
  next(): Reference<T> {
    return this.maData.const_get()[--this.nRemain] as Reference<T>;
  }
  /** Original current-reference removal on the live container. @returns Nothing. */
  remove(): void {
    this.rCont.removeInterface(this.maData.const_get()[this.nRemain] as Reference<T>);
  }
  /** Explicit implicit C++ member destructor binding. @returns Nothing. */
  dispose(): void {
    this.maData.dispose();
  }
}
/** Original container owns a COW vector of actual Reference values. */
export abstract class OInterfaceContainerHelper3<T extends XEventListener> {
  private readonly maData: cow_wrapper<Reference<T>[]>;
  /** Original ListenerT template binding and per-specialization DEFAULT static. @param declaration - Actual declared listener interface. @returns Stable original specialization. */
  static specialize<T extends XEventListener>(
    declaration: ListenerDeclaration,
  ): InterfaceContainerConstructor<T> {
    const existing = specializations.find(
      /** Compares actual template declarations. @param entry - Binding. @returns Match. */ (
        entry,
      ) => entry.declaration === declaration,
    );
    if (existing) return existing.constructor as InterfaceContainerConstructor<T>;
    const DataType = cow_wrapper.specialize<Reference<T>[]>(
      {
        /** Original default vector construction. @returns Empty vector. */
        create() {
          return [];
        },
        /** Original vector copy constructs each actual Reference. @param source - Borrowed vector. @returns Owned copy. */
        copy(source) {
          return source.map(
            /** Original Reference copy construction. @param value - Borrowed member. @returns Owned member. */ (
              value,
            ) => new Reference(value),
          );
        },
        /** Original vector destruction/clear releases each member before resetting length. @param value - Owned vector. @returns Nothing. */
        destroy(value) {
          for (const reference of value) reference.dispose();
          value.length = 0;
        },
      },
      ThreadSafeRefCountingPolicy,
    );
    const body = /** Original compiler-emitted template specialization. */ class extends OInterfaceContainerHelper3<T> {};
    Object.defineProperties(body, {
      DataType: { value: DataType },
      DEFAULT_DATA: { value: new DataType() },
    });
    specializations.push({ declaration, constructor: body });
    return body as unknown as InterfaceContainerConstructor<T>;
  }
  /** Original default singleton sharing. Native external mutex scopes have no substituted lock object in this synchronous binding. @returns Container. */
  constructor() {
    const type = this.constructor as InterfaceContainerConstructor<T>;
    this.maData = new type.DataType(type.DEFAULT_DATA);
  }
  /** Original const length query performs no detach. @returns Element count. */
  getLength(): number {
    return this.maData.const_get().length;
  }
  /** Original vector return copies actual Reference values. @returns Independently owned members. */
  getElements(): Reference<T>[] {
    return this.maData
      .const_get()
      .map(
        /** Original element copy. @param value - Borrowed member. @returns Owned copy. */ (
          value,
        ) => new Reference(value),
      );
  }
  /** Original non-null precondition and duplicate-preserving push_back. @param listener - Borrowed listener. @returns New length. */
  addInterface(listener: Reference<T>): number {
    if (!listener.is()) throw new Error("assert(rListener.is())");
    this.maData.get().push(new Reference(listener));
    return this.maData.const_get().length;
  }
  /** Original pointer-first then root-identity search and single erase; even an unsuccessful mutable search detaches. @param listener - Borrowed non-null listener. @returns Remaining count. */
  removeInterface(listener: Reference<T>): number {
    if (!listener.is()) throw new Error("assert(rListener.is())");
    const data = this.maData.get();
    let index = data.findIndex(
      /** Original fast borrowed pointer comparison. @param value - Member. @returns Pointer match. */ (
        value,
      ) => value.get() === listener.get(),
    );
    if (index === -1)
      index = data.findIndex(
        /** Original correct root identity comparison. @param value - Member. @returns Identity match. */ (
          value,
        ) => value.operatorEquals(listener),
      );
    if (index !== -1) {
      for (let i = index; i + 1 < data.length; ++i)
        (data[i] as Reference<T>).moveAssign(data[i + 1] as Reference<T>);
      (data.pop() as Reference<T>).dispose();
    }
    return this.maData.const_get().length;
  }
  /** Original const borrowed indexed access; valid index is the native precondition. @param index - Native index. @returns Borrowed Reference. */
  getInterface(index: number): Reference<T> {
    return this.maData.const_get()[index] as Reference<T>;
  }
  /** Original snapshot iteration copies each current Reference, catches only DisposedException and removes it only for matching Context; other disposed Contexts are swallowed as upstream. @param func - Actual callback. @returns Nothing. */
  forEach(func: (listener: Reference<T>) => void): void {
    if (this.maData.const_get().length === 0) return;
    const iter = new OInterfaceIteratorHelper3(this);
    try {
      while (iter.hasMoreElements()) {
        const listener = new Reference(iter.next());
        try {
          try {
            func(listener);
          } catch (error) {
            if (!(error instanceof DisposedException)) throw error;
            try {
              if (error.Context.operatorEquals(listener)) iter.remove();
            } finally {
              error.dispose();
            }
          }
        } finally {
          listener.dispose();
        }
      }
    } finally {
      iter.dispose();
    }
  }
  /** Original member-function pointer binding retains receiver and borrowed event identity. @param method - Actual declared member body. @param event - Borrowed event. @returns Nothing. */
  notifyEach<E>(method: (this: T, event: E) => void, event: E): void {
    this.forEach(
      /** Original NotifySingleListener call expression. @param listener - Acquired current Reference. @returns Nothing. */ (
        listener,
      ) => method.call(listener.get() as T, event),
    );
  }
  /** Original snapshot before live clear and reverse disposing callbacks; only RuntimeException is swallowed. @param event - Actual original event. @returns Nothing. */
  disposeAndClear(event: Readonly<EventObject>): void {
    const iter = new OInterfaceIteratorHelper3(this);
    try {
      const data = this.maData.get();
      for (const listener of data) listener.dispose();
      data.length = 0;
      while (iter.hasMoreElements()) {
        try {
          (iter.next().get() as T).disposing(event);
        } catch (error) {
          if (!(error instanceof RuntimeException)) throw error;
          error.dispose();
        }
      }
    } finally {
      iter.dispose();
    }
  }
  /** Original mutable clear detaches before destroying members. @returns Nothing. */
  clear(): void {
    const data = this.maData.get();
    for (const listener of data) listener.dispose();
    data.length = 0;
  }
  /** Explicit implicit C++ data-member destructor binding does not notify listeners. @returns Nothing. */
  dispose(): void {
    this.maData.dispose();
  }
}

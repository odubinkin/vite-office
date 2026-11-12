/** @fileoverview Original published interface-container union, reverse iterator and reentrant copy-on-write ownership. Synchronous realm-local lowering erases native OSL mutex scopes without a replacement lock; physical threads/ABI remain unqualified. */
import {
  Reference,
  UNO_QUERY,
  type ReferenceConstReference,
} from "../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { Sequence, type SequenceElements } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { XEventListener } from "../../udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../udkapi/com/sun/star/lang/EventObject";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import { UnoType, type UnoTypeArgument } from "../../cppu/inc/unotype";
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { uno_type_assignData } from "../../cppu/inc/uno/data";
import {
  cpp_queryInterface,
  cpp_acquire,
  cpp_release,
} from "../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as R } from "../../cppu/inc/typelib/typedescription";
/** Original active union arm; the aggregate is copied while the vector/raw pointer retains native identity. */
type ElementAlias = { pAsVector: Reference<XInterface>[] } | { pAsInterface: XInterface | null };
/** Actual source friend declaration, not additional instance state. */
interface ContainerFriend {
  aData: ElementAlias;
  bInUse: boolean;
  bIsList: boolean;
  copyAndResetInUse(): void;
}
/** Borrows the original active vector union arm. @param data - Actual aggregate. @returns Existing vector. */
function vector(data: ElementAlias): Reference<XInterface>[] {
  return (data as { pAsVector: Reference<XInterface>[] }).pAsVector;
}
/** Borrows the original active raw-pointer union arm. @param data - Actual aggregate. @returns Existing pointer. */
function pointer(data: ElementAlias): XInterface | null {
  return (data as { pAsInterface: XInterface | null }).pAsInterface;
}
/** Original vector destructor. @param values - Owned native Reference members. @returns Nothing. */
function destroyVector(values: Reference<XInterface>[]): void {
  for (const value of values) value.dispose();
}
/** Original iterator shares a vector until container mutation, or explicitly acquires a singleton. */
export class OInterfaceIteratorHelper {
  private readonly bIsList: boolean;
  private readonly aData: ElementAlias;
  private nRemain: number;
  /** Original friend snapshot and transfer when another iterator is active. @param rCont - Real container, which must outlive iterator. @returns Iterator. */
  constructor(private readonly rCont: OInterfaceContainerHelper) {
    const owner = rCont as unknown as ContainerFriend;
    if (owner.bInUse) owner.copyAndResetInUse();
    this.bIsList = owner.bIsList;
    this.aData = owner.aData;
    if (this.bIsList) {
      owner.bInUse = true;
      this.nRemain = vector(this.aData).length;
    } else {
      const p = pointer(this.aData);
      if (p) {
        p.acquire();
        this.nRemain = 1;
      } else this.nRemain = 0;
    }
  }
  /** Original shared-vector release or privately owned vector/raw-pointer destruction. @returns Nothing. */
  dispose(): void {
    const owner = this.rCont as unknown as ContainerFriend;
    const shared = owner.bIsList && this.bIsList && vector(this.aData) === vector(owner.aData);
    if (shared) owner.bInUse = false;
    else if (this.bIsList) destroyVector(vector(this.aData));
    else pointer(this.aData)?.release();
  }
  /** Original remaining-count predicate. @returns Whether next can return a value. */
  hasMoreElements(): boolean {
    return this.nRemain !== 0;
  }
  /** Original reverse borrowed pointer, including the explicit exhausted/null return. @returns Borrowed pointer. */
  next(): XInterface | null {
    if (this.nRemain) {
      --this.nRemain;
      if (this.bIsList) return (vector(this.aData)[this.nRemain] as Reference<XInterface>).get();
      const p = pointer(this.aData);
      if (p) return p;
    }
    return null;
  }
  /** Original current-pointer reinterpretation as an unacquired Reference. Must follow a valid next, once per element. @returns Nothing. */
  remove(): void {
    const p = this.bIsList
      ? (vector(this.aData)[this.nRemain] as Reference<XInterface>).get()
      : pointer(this.aData);
    this.rCont.removeInterface(Reference.unacquired([p]));
  }
}
/** Complete original published container, with distinct singleton and vector ownership. */
export class OInterfaceContainerHelper {
  private aData: ElementAlias = { pAsInterface: null };
  private bInUse = false;
  private bIsList = false;
  /** Original destructor requires all iterators to have ended. @returns Nothing. */
  dispose(): void {
    if (this.bIsList) destroyVector(vector(this.aData));
    else pointer(this.aData)?.release();
  }
  /** Original singleton/list count. @returns Count. */
  getLength(): number {
    return this.bIsList ? vector(this.aData).length : pointer(this.aData) ? 1 : 0;
  }
  /** Original acquired reference sequence, preserving insertion order. @returns Owned actual UNO sequence. */
  getElements(): Sequence<Reference<XInterface>> {
    const Values = Sequence.specialize<Reference<XInterface>>(["Reference", "XInterface"], 8);
    if (this.bIsList) {
      const values = vector(this.aData);
      return new Values(
        {
          /** Original contiguous Reference element addresses. @param offset - Byte displacement. @returns Actual pointer field. */ get(
            offset: number,
          ): unknown {
            return (values[offset / 8] as Reference<XInterface>).getAddress();
          },
        },
        values.length,
      );
    }
    const p = pointer(this.aData);
    if (p) {
      const value = new Reference(p);
      try {
        return new Values(
          {
            /** Original singleton array address. @param offset - Zero displacement. @returns Actual Reference field. */ get(
              offset: number,
            ): unknown {
              void offset;
              return value.getAddress();
            },
          },
          1,
        );
      } finally {
        value.dispose();
      }
    }
    return new Values();
  }
  /** Original COW transfers the old vector to its iterator, rather than destroying it. @returns Nothing. */
  private copyAndResetInUse(): void {
    if (this.bInUse) {
      if (this.bIsList)
        this.aData = {
          pAsVector: vector(this.aData).map(
            /** Native Reference copy construction. @param value - Actual member. @returns Acquired member. */ (
              value,
            ) => new Reference(value),
          ),
        };
      else pointer(this.aData)?.acquire();
      this.bInUse = false;
    }
  }
  /** Original raw-pointer/singleton-to-vector transitions, including diagnostic-only null acceptance. @param listener - Borrowed listener. @returns Original return count. */
  addInterface(listener: ReferenceConstReference<XInterface>): number {
    if (this.bInUse) this.copyAndResetInUse();
    if (this.bIsList) {
      const values = vector(this.aData);
      values.push(new Reference(listener.get()));
      return values.length;
    }
    const p = pointer(this.aData);
    if (p) {
      const temporary = new Reference(p);
      p.release();
      const values = [new Reference<XInterface>(), new Reference<XInterface>()];
      (values[0] as Reference<XInterface>).moveAssign(temporary);
      (values[1] as Reference<XInterface>).assign(listener.get());
      this.aData = { pAsVector: values };
      this.bIsList = true;
      temporary.dispose();
      return 2;
    }
    this.aData = { pAsInterface: listener.get() };
    if (listener.is()) (listener.operatorArrow() as XInterface).acquire();
    return 1;
  }
  /** Original raw identity fast path then actual UNO root equality, erasing one duplicate. @param listener - Borrowed interface. @returns Remaining count. */
  removeInterface(listener: ReferenceConstReference<XInterface>): number {
    if (this.bInUse) this.copyAndResetInUse();
    if (this.bIsList) {
      const values = vector(this.aData);
      let index = values.findIndex(
        /** Original raw pointer match. @param value - Member. @returns Match. */ (value) =>
          value.get() === listener.get(),
      );
      if (index < 0)
        index = values.findIndex(
          /** Original correct interface identity fallback. @param value - Member. @returns Match. */ (
            value,
          ) => value.operatorEquals(listener),
        );
      if (index >= 0) (values.splice(index, 1)[0] as Reference<XInterface>).dispose();
      if (values.length === 1) {
        const p = (values[0] as Reference<XInterface>).get();
        // Source unconditionally dereferences p here. Null is an undefined native input at this point.
        if (p === null)
          throw new TypeError(
            "Native OInterfaceContainerHelper singleton collapse requires a nonnull pointer",
          );
        p.acquire();
        destroyVector(values);
        this.aData = { pAsInterface: p };
        this.bIsList = false;
        return 1;
      }
      return values.length;
    }
    const p = pointer(this.aData);
    if (p) {
      const temporary = new Reference(p);
      try {
        if (temporary.operatorEquals(listener)) {
          p.release();
          this.aData = { pAsInterface: null };
        }
      } finally {
        temporary.dispose();
      }
    }
    return pointer(this.aData) ? 1 : 0;
  }
  /** Original clear-before-callback order allows reentrant additions to survive; only RuntimeException is swallowed. @param event - Original borrowed event. @returns Nothing. */
  disposeAndClear(event: Readonly<EventObject>): void {
    const iterator = new OInterfaceIteratorHelper(this);
    if (!this.bIsList) pointer(this.aData)?.release();
    this.aData = { pAsInterface: null };
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
            if (listener.is()) listener.operatorStar().disposing(event);
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
  /** Original silent clear detaches when an iterator owns the prior vector. @returns Nothing. */
  clear(): void {
    if (this.bInUse) this.copyAndResetInUse();
    if (this.bIsList) destroyVector(vector(this.aData));
    else pointer(this.aData)?.release();
    this.aData = { pAsInterface: null };
    this.bIsList = false;
  }
  /** Original listener template query and matching DisposedException removal. Query failures occur outside the catch. @param type - Actual source ListenerT ADL argument. @param func - Callback. @returns Nothing. */
  forEach<T extends XInterface>(
    type: UnoTypeArgument,
    func: (listener: Reference<T>) => void,
  ): void {
    const iterator = new OInterfaceIteratorHelper(this);
    try {
      while (iterator.hasMoreElements()) {
        const listener = new Reference<T>(iterator.next(), UNO_QUERY, type);
        try {
          if (listener.is()) {
            try {
              func(listener);
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
  /** Original NotifySingleListener method-pointer adapter. @param type - Actual ListenerT argument. @param method - Original bound member pointer. @param event - Borrowed event. @returns Nothing. */
  notifyEach<T extends XInterface, E>(
    type: UnoTypeArgument,
    method: (this: T, event: E) => void,
    event: E,
  ): void {
    this.forEach<T>(
      type,
      /** Original member-pointer invocation. @param listener - Actual queried listener. @returns Nothing. */ (
        listener,
      ) => method.call(listener.operatorStar(), event),
    );
  }
}

/** Original type/pointer pair. */
interface TypeEntry {
  first: Type;
  second: OInterfaceContainerHelper | null;
}
/** Original signed32/pointer pair. */
interface LongEntry {
  first: number;
  second: OInterfaceContainerHelper | null;
}
/** Complete original Type-key specialization, preserving insertion order and empty child identity. */
export class OMultiTypeInterfaceContainerHelper {
  private readonly m_pMap: TypeEntry[];
  /** Original implicit initialization with eager vector allocation. @returns Container. */ constructor() {
    this.m_pMap = [];
  }
  /** Original deletes children before vector key/member destruction. @returns Nothing. */ dispose(): void {
    for (const item of this.m_pMap) {
      (item.second as OInterfaceContainerHelper).dispose();
      item.second = null;
    }
    for (const item of this.m_pMap) item.first.dispose();
  }
  /** Original native sequence allocation and shrink-to-active-count copy. @returns Owned insertion-ordered keys. */ getContainedTypes(): Sequence<Type> {
    const Types = Sequence.specialize<Type>("Type", 8),
      size = this.m_pMap.length;
    if (size) {
      const output = new Types(size),
        array = output.getArray() as SequenceElements;
      let i = 0;
      for (const item of this.m_pMap)
        if ((item.second as OInterfaceContainerHelper).getLength()) {
          const type = UnoType.get("Type").getTypeLibType() as R;
          void uno_type_assignData(
            array.get(i++ * 8),
            type,
            item.first.getAddress(),
            type,
            cpp_queryInterface,
            cpp_acquire,
            cpp_release,
          );
        }
      if (i !== size) {
        const reduced = new Types(array, i);
        try {
          output.assign(reduced);
        } finally {
          reduced.dispose();
        }
      }
      return output;
    }
    return new Types();
  }
  /** Original linear actual Type equality lookup. @param key - Borrowed key. @returns Child or null. */ getContainer(
    key: Type,
  ): OInterfaceContainerHelper | null {
    return (
      this.m_pMap.find(
        /** Original key equality. @param item - Pair. @returns Match. */ (item) =>
          item.first.equals(key),
      )?.second ?? null
    );
  }
  /** Original copied key and stable new child insertion. @param key - Borrowed key. @param listener - Borrowed listener. @returns Child count. */ addInterface(
    key: Type,
    listener: ReferenceConstReference<XInterface>,
  ): number {
    const item = this.m_pMap.find(
      /** Original key equality. @param entry - Pair. @returns Match. */ (entry) =>
        entry.first.equals(key),
    );
    if (!item) {
      const child = new OInterfaceContainerHelper();
      this.m_pMap.push({ first: new Type(key), second: child });
      return child.addInterface(listener);
    }
    return (item.second as OInterfaceContainerHelper).addInterface(listener);
  }
  /** Original missing-key zero result; empty children remain allocated. @param key - Key. @param listener - Listener. @returns Count. */ removeInterface(
    key: Type,
    listener: ReferenceConstReference<XInterface>,
  ): number {
    const item = this.m_pMap.find(
      /** Original key equality. @param entry - Pair. @returns Match. */ (entry) =>
        entry.first.equals(key),
    );
    return item ? (item.second as OInterfaceContainerHelper).removeInterface(listener) : 0;
  }
  /** Original child-pointer snapshot before callbacks; newly inserted keys are outside this pass. @param event - Borrowed event. @returns Nothing. */ disposeAndClear(
    event: Readonly<EventObject>,
  ): void {
    const children = this.m_pMap.map(
      /** Original raw pointer snapshot. @param item - Pair. @returns Borrowed child. */ (item) =>
        item.second,
    );
    for (const child of children) if (child) child.disposeAndClear(event);
  }
  /** Original child clears, retaining key/child identities. @returns Nothing. */ clear(): void {
    for (const item of this.m_pMap) (item.second as OInterfaceContainerHelper).clear();
  }
}
/** Complete original lazy signed32 specialization from propshlp.hxx. */
export class OMultiTypeInterfaceContainerHelperInt32 {
  private m_pMap: LongEntry[] | null;
  /** Original null map initialization; native borrowed mutex is erased. @returns Container. */ constructor() {
    this.m_pMap = null;
  }
  /** Original unallocated early return and child deletion. @returns Nothing. */ dispose(): void {
    if (!this.m_pMap) return;
    for (const item of this.m_pMap) {
      (item.second as OInterfaceContainerHelper).dispose();
      item.second = null;
    }
  }
  /** Original sequence and active-count shrink. @returns Owned signed32 keys. */ getContainedTypes(): Sequence<number> {
    const Longs = Sequence.specialize<number>("sal_Int32", 4),
      size = this.m_pMap?.length ?? 0;
    if (size) {
      const output = new Longs(size),
        array = output.getArray() as SequenceElements;
      let i = 0;
      for (const item of this.m_pMap as LongEntry[])
        if ((item.second as OInterfaceContainerHelper).getLength())
          (array.get(i++ * 4) as [number])[0] = item.first;
      if (i !== size) {
        const reduced = new Longs(array, i);
        try {
          output.assign(reduced);
        } finally {
          reduced.dispose();
        }
      }
      return output;
    }
    return new Longs();
  }
  /** Original unallocated and missing-key returns. @param key - Signed32 key. @returns Stable child or null. */ getContainer(
    key: number,
  ): OInterfaceContainerHelper | null {
    if (!this.m_pMap) return null;
    return (
      this.m_pMap.find(
        /** Original signed32 equality. @param item - Pair. @returns Match. */ (item) =>
          item.first === key,
      )?.second ?? null
    );
  }
  /** Original first-use map allocation and insertion. @param key - Signed32 key. @param listener - Borrowed listener. @returns Count. */ addInterface(
    key: number,
    listener: ReferenceConstReference<XInterface>,
  ): number {
    if (!this.m_pMap) this.m_pMap = [];
    const item = this.m_pMap.find(
      /** Original signed32 equality. @param entry - Pair. @returns Match. */ (entry) =>
        entry.first === key,
    );
    if (!item) {
      const child = new OInterfaceContainerHelper();
      this.m_pMap.push({ first: key, second: child });
      return child.addInterface(listener);
    }
    return (item.second as OInterfaceContainerHelper).addInterface(listener);
  }
  /** Original missing-key zero path. @param key - Signed32 key. @param listener - Borrowed listener. @returns Count. */ removeInterface(
    key: number,
    listener: ReferenceConstReference<XInterface>,
  ): number {
    if (!this.m_pMap) return 0;
    const item = this.m_pMap.find(
      /** Original key equality. @param entry - Pair. @returns Match. */ (entry) =>
        entry.first === key,
    );
    return item ? (item.second as OInterfaceContainerHelper).removeInterface(listener) : 0;
  }
  /** Original borrowed child snapshot and callback dispatch. @param event - Event. @returns Nothing. */ disposeAndClear(
    event: Readonly<EventObject>,
  ): void {
    if (!this.m_pMap) return;
    const children = this.m_pMap.map(
      /** Original pointer snapshot. @param item - Pair. @returns Child. */ (item) => item.second,
    );
    for (const child of children) if (child) child.disposeAndClear(event);
  }
  /** Original unallocated early return; clear retains allocated map/children. @returns Nothing. */ clear(): void {
    if (!this.m_pMap) return;
    for (const item of this.m_pMap) (item.second as OInterfaceContainerHelper).clear();
  }
}
/** Original OBroadcastHelperVar Type specialization; contains actual flags and multi-container, with no lock/provider substitute. */
export class OBroadcastHelper {
  readonly aLC = new OMultiTypeInterfaceContainerHelper();
  bDisposed = false;
  bInDispose = false;
  /** Original member destruction. @returns Nothing. */ dispose(): void {
    this.aLC.dispose();
  }
  /** Original diagnostic-only disposed checks precede actual guarded registration. @param key - Type. @param listener - Borrowed listener. @returns Nothing. */ addListener(
    key: Type,
    listener: ReferenceConstReference<XInterface>,
  ): void {
    if (!this.bInDispose && !this.bDisposed) this.aLC.addInterface(key, listener);
  }
  /** Original state flags suppress removal while disposing or disposed. @param key - Type. @param listener - Borrowed listener. @returns Nothing. */ removeListener(
    key: Type,
    listener: ReferenceConstReference<XInterface>,
  ): void {
    if (!this.bInDispose && !this.bDisposed) this.aLC.removeInterface(key, listener);
  }
  /** Original child lookup remains available regardless of flags. @param key - Key. @returns Child or null. */ getContainer(
    key: Type,
  ): OInterfaceContainerHelper | null {
    return this.aLC.getContainer(key);
  }
}

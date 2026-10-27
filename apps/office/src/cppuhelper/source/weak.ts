/** @fileoverview Original non-aggregating weak.cxx object, connection point, listener and helper owners; actual OSL counts and References retain native ownership. Synchronous JS replaces mutex scope and transports caught UNO values; aggregation, native threads and binary exception ABI remain separate responsibilities. */
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { XWeak, cppu_detail_getUnoType as weakType } from "../../cppu/inc/com/sun/star/uno/XWeak";
import { XReference } from "../../cppu/inc/com/sun/star/uno/XReference";
import { XAdapter } from "../../cppu/inc/com/sun/star/uno/XAdapter";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import type { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import type { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { UnoType } from "../../cppu/inc/unotype";
import { queryInterface } from "../inc/queryinterface";
import { osl_atomic_increment, osl_atomic_decrement } from "../../sal/inc/osl/interlck";

/** Original source friend access to the actual protected counter; no second counter or mutation API is introduced. */
type WeakObjectFriend = { readonly m_refCount: Int32Array };

/** Original internal connection point retains a borrowed weak object and owned listener References. */
class OWeakConnectionPoint implements XAdapter {
  private readonly m_aRefCount = new Int32Array([0]);
  private m_aReferences: Reference[] = [];
  /** Original constructor borrows the weak object without acquiring it. @param m_pObject - Actual object or null. @returns Connection point. */
  constructor(private m_pObject: OWeakObject | null) {}
  /** Original declared adapter/root interface order. @param type - Demanded type. @returns Acquired actual Any. */
  queryInterface(type: Type): Any {
    return queryInterface(type, [
      [XAdapter.static_type, this],
      [
        /** Original root type expression. @returns Borrowed type. */ () =>
          UnoType.get("XInterface"),
        this,
      ],
    ]);
  }
  /** Original atomic acquisition. @returns Nothing. */
  acquire(): void {
    osl_atomic_increment(this.m_aRefCount);
  }
  /** Original zero-count destruction releases remaining vector members. @returns Nothing. */
  release(): void {
    if (!osl_atomic_decrement(this.m_aRefCount)) {
      for (const reference of this.m_aReferences) reference.dispose();
      this.m_aReferences.length = 0;
    }
  }
  /** Original atomic guard refuses resurrection at count0; direct counter rollback deliberately does not invoke virtual release. @returns Hardened root reference or empty. */
  queryAdapted(): Reference {
    const result = new Reference(),
      object = this.m_pObject;
    if (!object) return result;
    const counter = (object as unknown as WeakObjectFriend).m_refCount;
    const count = osl_atomic_increment(counter);
    if (count <= 1) {
      osl_atomic_decrement(counter);
      return result;
    }
    result.assign(object);
    osl_atomic_decrement(counter);
    return result;
  }
  /** Original vector push_back copies the supplied declared interface reference. @param reference - Borrowed listener reference. @returns Nothing. */
  addReference(reference: Reference): void {
    this.m_aReferences.push(new Reference(reference));
  }
  /** Original reverse raw-pointer search precedes reverse root-identity comparison. @param reference - Borrowed listener. @returns Nothing. */
  removeReference(reference: Reference): void {
    for (let index = this.m_aReferences.length - 1; index >= 0; --index) {
      if ((this.m_aReferences[index] as Reference).get() === reference.get()) {
        (this.m_aReferences.splice(index, 1)[0] as Reference).dispose();
        return;
      }
    }
    for (let index = this.m_aReferences.length - 1; index >= 0; --index) {
      if ((this.m_aReferences[index] as Reference).operatorEquals(reference)) {
        (this.m_aReferences.splice(index, 1)[0] as Reference).dispose();
        return;
      }
    }
  }
  /** Original snapshot and last-RuntimeException selection; JS retains the actual caught UNO value across callbacks instead of the native C++/binary exception bridge. @returns Nothing; the last actual RuntimeException propagates. */
  dispose(): void {
    this.m_pObject = null;
    const references = this.m_aReferences;
    this.m_aReferences = [];
    let pending: RuntimeException | null = null;
    try {
      for (const reference of references) {
        try {
          (reference.get() as XReference).dispose();
        } catch (error) {
          if (error instanceof DisposedException) error.dispose();
          else if (error instanceof RuntimeException) {
            pending?.dispose();
            pending = error;
          } else throw error;
        }
      }
      if (pending) {
        const error = pending;
        pending = null;
        throw error;
      }
    } finally {
      for (const reference of references) reference.dispose();
      pending?.dispose();
    }
  }
}

/** Original non-aggregating weak object; actual Reference callers own its zero-starting count. */
export class OWeakObject implements XWeak {
  protected readonly m_refCount = new Int32Array([0]);
  protected m_pWeakConnectionPoint: OWeakConnectionPoint | null = null;
  protected m_pReserved: unknown = null;
  /** Original default and dummy-copy constructors initialize fresh zero/null fields and ignore the source object. @param source - Optional native copy source. @returns Object. */
  constructor(source?: Readonly<OWeakObject>) {
    void source;
  }
  /** Original dummy assignment does not affect fields, counters or listeners. @param source - Ignored right side. @returns This object. */
  assign(source: Readonly<OWeakObject>): this {
    void source;
    return this;
  }
  /** Original declared weak/root query order. @param type - Demanded type. @returns Acquired actual Any. */
  queryInterface(type: Type): Any {
    return queryInterface(type, [
      [XWeak.static_type, this],
      [
        /** Original root type expression. @returns Borrowed type. */ () =>
          UnoType.get("XInterface"),
        this,
      ],
    ]);
  }
  /** Original atomic acquisition. @returns Nothing. */
  acquire(): void {
    osl_atomic_increment(this.m_refCount);
  }
  /** Original weak disposal precedes virtual object destruction. @returns Nothing. */
  release(): void {
    if (!osl_atomic_decrement(this.m_refCount)) {
      this.disposeWeakConnectionPoint();
      this.destroy();
    }
  }
  /** Original diagnostic-only count0 precondition and early member reset; only RuntimeException is swallowed. @returns Nothing. */
  protected disposeWeakConnectionPoint(): void {
    if (this.m_pWeakConnectionPoint !== null) {
      const point = this.m_pWeakConnectionPoint;
      this.m_pWeakConnectionPoint = null;
      try {
        point.dispose();
      } catch (error) {
        caughtRuntimeException(error);
      }
      point.release();
    }
  }
  /** Original empty virtual destructor; derived components release their own members here. @returns Nothing. */
  protected destroy(): void {}
  /** Original lazy connection point retains one owner reference, then returns a separately acquired caller reference. @returns Actual adapter reference. */
  queryAdapter(): Reference {
    if (!this.m_pWeakConnectionPoint) {
      const point = new OWeakConnectionPoint(this);
      point.acquire();
      this.m_pWeakConnectionPoint = point;
    }
    return new Reference(this.m_pWeakConnectionPoint);
  }
  /** Original cast to an acquired root reference. @returns Strong reference. */
  operatorReference(): Reference {
    return new Reference(this);
  }
  /** Original internal borrowed XWeak pointer. @returns This same weak interface. */
  getXWeak(): XWeak {
    return this;
  }
}

/** Native catch(RuntimeException&) filter and caught-object destruction; JS catch has no typed filter. OSL_ASSERT is diagnostic in the selected original debug0 build. @param error - Actual caught value. @returns Nothing. */
function caughtRuntimeException(error: unknown): void {
  if (!(error instanceof RuntimeException)) throw error;
  error.dispose();
}

/** Original internal single-interface listener; m_XWeakConnectionPoint is the actual Reference owner, without weak GC or replacement adapter. */
class OWeakRefListener implements XReference {
  readonly m_aRefCount = new Int32Array([1]);
  readonly m_XWeakConnectionPoint = new Reference();
  /** Original overloads: XInterface queries and catches RuntimeException; exact XWeak skips query and propagates. @param input - Original borrowed hard reference. @param declared - Erased native XWeak overload, no inferred value type. @returns Original listener. */
  constructor(input: Reference, declared?: typeof XWeak) {
    try {
      if (declared === XWeak) this.initialize(input);
      else {
        try {
          const weak = Reference.query(input, weakType);
          try {
            if (weak.is()) this.initialize(weak);
          } finally {
            weak.dispose();
          }
        } catch (error) {
          caughtRuntimeException(error);
        }
      }
    } catch (error) {
      // Original failed construction destroys the already constructed Reference member.
      this.m_XWeakConnectionPoint.dispose();
      throw error;
    }
    osl_atomic_decrement(this.m_aRefCount);
  }
  /** Identical original member assignment and registration expressions from both constructors, with actual returned temporary move and borrowed listener argument. @param weak - Borrowed source-selected XWeak reference. @returns Nothing. */
  private initialize(weak: Reference): void {
    const adapter = (weak.get() as XWeak).queryAdapter();
    try {
      this.m_XWeakConnectionPoint.moveAssign(adapter);
    } finally {
      adapter.dispose();
    }
    if (this.m_XWeakConnectionPoint.is()) {
      const self = new Reference(this);
      try {
        (this.m_XWeakConnectionPoint.get() as XAdapter).addReference(self);
      } finally {
        self.dispose();
      }
    }
  }
  /** Original queryInterface supports XReference first, then root XInterface. @param type - Demanded type. @returns Acquired original Any. */
  queryInterface(type: Type): Any {
    return queryInterface(type, [
      [XReference.static_type, this],
      [
        /** Original root static_type expression. @returns Actual borrowed root Type. */ () =>
          UnoType.get("XInterface"),
        this,
      ],
    ]);
  }
  /** Original native adjusted atomic acquisition. @returns Nothing. */
  acquire(): void {
    osl_atomic_increment(this.m_aRefCount);
  }
  /** Original zero-count virtual destruction. @returns Nothing. */
  release(): void {
    if (!osl_atomic_decrement(this.m_aRefCount)) this.destroy();
  }
  /** Original destructor catches RuntimeException, reacquires before removal to avoid repeated deletion, then destroys its actual Reference member. @returns Nothing. */
  private destroy(): void {
    try {
      try {
        if (this.m_XWeakConnectionPoint.is()) {
          this.acquire();
          const self = new Reference(this);
          try {
            (this.m_XWeakConnectionPoint.get() as XAdapter).removeReference(self);
          } finally {
            self.dispose();
          }
        }
      } catch (error) {
        caughtRuntimeException(error);
      }
    } finally {
      this.m_XWeakConnectionPoint.dispose();
    }
  }
  /** Original disposal publishes the empty member before calling back through a hardened local adapter; native JS synchronous operations replace only mutex syntax. @returns Nothing. */
  dispose(): void {
    const adapter = new Reference();
    try {
      if (this.m_XWeakConnectionPoint.is()) {
        adapter.assign(this.m_XWeakConnectionPoint);
        this.m_XWeakConnectionPoint.clear();
      }
      if (adapter.is()) {
        const self = new Reference(this);
        try {
          (adapter.get() as XAdapter).removeReference(self);
        } finally {
          self.dispose();
        }
      }
    } finally {
      adapter.dispose();
    }
  }
}

/** Original public one-pointer helper, with no per-instance template/type/value metadata. */
export class WeakReferenceHelper {
  protected m_pImpl: OWeakRefListener | null;
  /** Original default, hard XInterface, hard XWeak and copy constructors. @param args - Original selected overload inputs; declared XWeak witness is compile-time overload erasure only. @returns Original helper. */
  constructor(
    ...args:
      [] | [source: Reference | WeakReferenceHelper] | [source: Reference, declared: typeof XWeak]
  ) {
    this.m_pImpl = null;
    if (args.length) {
      if (args[0] instanceof WeakReferenceHelper) {
        const hard = args[0].get();
        try {
          if (hard.is()) {
            this.m_pImpl = new OWeakRefListener(hard);
            this.m_pImpl.acquire();
          }
        } finally {
          hard.dispose();
        }
      } else if (args[0].is()) {
        this.m_pImpl = new OWeakRefListener(args[0], args[1]);
        this.m_pImpl.acquire();
      }
    }
  }
  /** Original internal move constructor transfers its sole pointer and publishes null in the source; original template derived specialization remains the class selected by the caller. @param source - Rvalue helper. @returns Transferred owner. */
  static move(source: WeakReferenceHelper): WeakReferenceHelper {
    const result = Object.create(this.prototype) as WeakReferenceHelper;
    result.m_pImpl = source.m_pImpl;
    source.m_pImpl = null;
    return result;
  }
  /** Original clear catches RuntimeException without forcing m_pImpl to null when dispose failed. @returns Nothing. */
  clear(): void {
    try {
      if (this.m_pImpl !== null) {
        this.m_pImpl.dispose();
        this.m_pImpl.release();
        this.m_pImpl = null;
      }
    } catch (error) {
      caughtRuntimeException(error);
    }
  }
  /** Original lvalue/copy and hard-reference assignments; XWeak direct overload propagates after clearing, while root overload catches RuntimeException. @param source - Original right side. @param declared - Erased exact XWeak overload. @returns This helper. */
  assign(source: WeakReferenceHelper | Reference, declared?: typeof XWeak): this {
    if (source instanceof WeakReferenceHelper) {
      if (this === source) return this;
      const hard = source.get();
      try {
        return this.assign(hard);
      } finally {
        hard.dispose();
      }
    }
    if (declared === XWeak) {
      this.clear();
      if (source.is()) {
        this.m_pImpl = new OWeakRefListener(source, XWeak);
        this.m_pImpl.acquire();
      }
    } else {
      try {
        this.clear();
        if (source.is()) {
          this.m_pImpl = new OWeakRefListener(source);
          this.m_pImpl.acquire();
        }
      } catch (error) {
        caughtRuntimeException(error);
      }
    }
    return this;
  }
  /** Original internal move assignment clears first then swaps even for self assignment. @param source - Rvalue helper. @returns This helper. */
  moveAssign(source: WeakReferenceHelper): this {
    this.clear();
    const old = this.m_pImpl;
    this.m_pImpl = source.m_pImpl;
    source.m_pImpl = old;
    return this;
  }
  /** Original equality calls get on both operands, compares actual root identity and destroys both acquired temporary References. @param source - Right side. @returns Original equality. */
  operatorEqual(source: WeakReferenceHelper): boolean {
    const first = this.get();
    try {
      const second = source.get();
      try {
        return first.operatorEquals(second);
      } finally {
        second.dispose();
      }
    } finally {
      first.dispose();
    }
  }
  /** Original hardened get returns a real acquired root Reference or empty after RuntimeException; no weak GC resurrection. @returns Hard reference. */
  get(): Reference {
    try {
      const adapter = new Reference();
      try {
        if (this.m_pImpl !== null && this.m_pImpl.m_XWeakConnectionPoint.is())
          adapter.assign(this.m_pImpl.m_XWeakConnectionPoint);
        if (adapter.is()) return (adapter.get() as XAdapter).queryAdapted();
      } finally {
        adapter.dispose();
      }
    } catch (error) {
      caughtRuntimeException(error);
    }
    return new Reference();
  }
  /** Original root Reference conversion delegates to get. @returns Hard reference. */
  operatorReference(): Reference {
    return this.get();
  }
  /** Original destructor delegates to clear; the pointer is the sole owned member. @returns Nothing. */
  dispose(): void {
    this.clear();
  }
}

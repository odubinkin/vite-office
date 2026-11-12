/** @fileoverview Original rtl/ref.hxx intrusive handle operations consumed by native clients. Pointer ordering/hash and C++ conversion syntax remain outside this owner; no UNO identity or replacement lifetime registry is introduced. */
import { SAL_NO_ACQUIRE } from "../types";
/** Original template requirement; acquire/release remain methods of the actual intrusive body. */
export interface ReferenceBody {
  /** Original acquisition. @returns Nothing. */ acquire(): void;
  /** Original release. @returns Nothing. */ release(): void;
}
/** Actual source intrusive Reference template, distinct from UNO query-capable Reference. */
export class Reference<T extends ReferenceBody> {
  private m_pBody: T | null;
  /** Original default, direct, copy and no-acquire constructors. @param args - Original selected arguments. @returns Owned handle. */
  constructor(
    ...args: [] | [body: T | null | Reference<T>] | [body: T | null, tag: typeof SAL_NO_ACQUIRE]
  ) {
    this.m_pBody =
      args.length === 0 ? null : args[0] instanceof Reference ? args[0].m_pBody : args[0];
    if (args.length === 1 && this.m_pBody !== null) this.m_pBody.acquire();
  }
  /** Original move constructor transfers without acquisition. @param source - Actual rvalue. @returns Transferred handle. */
  static move<T extends ReferenceBody>(source: Reference<T>): Reference<T> {
    const result = new Reference(source.m_pBody, SAL_NO_ACQUIRE);
    source.m_pBody = null;
    return result;
  }
  /** Original destruction releases without clearing the destroyed object's pointer. @returns Nothing. */
  dispose(): void {
    if (this.m_pBody !== null) this.m_pBody.release();
  }
  /** Original set acquires new body before replacing and releasing old body. @param body - Borrowed body or null. @returns This handle. */
  set(body: T | null): this {
    if (body !== null) body.acquire();
    const old = this.m_pBody;
    this.m_pBody = body;
    if (old !== null) old.release();
    return this;
  }
  /** Original copy or pointer assignment delegates to set. @param source - Borrowed handle or body. @returns This handle. */
  assign(source: Reference<T> | T | null): this {
    return this.set(source instanceof Reference ? source.m_pBody : source);
  }
  /** Original move assignment deliberately guts self-movement; do not add a self guard or acquire. @param source - Actual rvalue. @returns This handle. */
  moveAssign(source: Reference<T>): this {
    if (this.m_pBody !== null) this.m_pBody.release();
    this.m_pBody = source.m_pBody;
    source.m_pBody = null;
    return this;
  }
  /** Original clear nulls before releasing, preserving reentrant observation order. @returns This handle. */
  clear(): this {
    if (this.m_pBody !== null) {
      const old = this.m_pBody;
      this.m_pBody = null;
      old.release();
    }
    return this;
  }
  /** Original borrowed pointer return. @returns Actual body or null. */
  get(): T | null {
    return this.m_pBody;
  }
  /** Original nonempty dereference precondition. @returns Actual borrowed body. */
  operatorArrow(): T {
    if (this.m_pBody === null) throw new Error("assert(m_pBody != NULL)");
    return this.m_pBody;
  }
  /** Original dereference. @returns Actual borrowed body. */
  operatorStar(): T {
    if (this.m_pBody === null) throw new Error("assert(m_pBody != NULL)");
    return this.m_pBody;
  }
  /** Original null test. @returns Nonempty. */
  is(): boolean {
    return this.m_pBody !== null;
  }
  /** Original pointer or handle equality, without UNO queries. @param other - Borrowed body or handle. @returns Equal. */
  operatorEquals(other: Reference<T> | T | null): boolean {
    return this.m_pBody === (other instanceof Reference ? other.m_pBody : other);
  }
  /** Original handle inequality. @param other - Borrowed handle. @returns Different. */
  operatorNotEquals(other: Reference<T>): boolean {
    return this.m_pBody !== other.m_pBody;
  }
}

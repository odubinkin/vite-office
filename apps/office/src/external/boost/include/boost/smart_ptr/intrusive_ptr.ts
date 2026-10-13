/** @fileoverview Original Boost 1.91 intrusive_ptr class ownership core; erased C++ ADL and rvalue categories are explicit binding witnesses. */

/** Original unqualified ADL functions supplied by the pointee namespace, not by this generic owner. */
export interface IntrusivePtrADL<T> {
  intrusive_ptr_add_ref(pointer: T): void;
  intrusive_ptr_release(pointer: T): void;
}

/** Original intrusive pointer: the pointee implements its own reference counting and destruction. */
export class intrusive_ptr<T> {
  private px: T | null;
  private readonly adl: IntrusivePtrADL<T>;

  /** Original default/raw constructors. The ADL witness restores the erased template namespace lookup; a pointee may itself be a smart pointer, so raw values are never classified by instanceof. @param adl - Original pointee hooks. @param source - Null or raw pointer. @param add_ref - Whether the raw-pointer constructor acquires. @returns Constructed smart pointer. */
  constructor(adl: IntrusivePtrADL<T>, source: T | null = null, add_ref = true) {
    this.adl = adl;
    this.px = source;
    if (this.px !== null && add_ref) this.adl.intrusive_ptr_add_ref(this.px);
  }

  /** Original copy constructor, with an explicit erased smart-pointer argument category. @param source - Const owner. @returns Acquired independent owner. */
  static copy<T>(source: intrusive_ptr<T>): intrusive_ptr<T> {
    return new intrusive_ptr(source.adl, source.px);
  }

  /** Original move constructor transfers the raw pointer without acquiring. @param source - Rvalue pointer owner. @returns Transferred smart pointer. */
  static move<T>(source: intrusive_ptr<T>): intrusive_ptr<T> {
    const result = new intrusive_ptr(source.adl);
    result.px = source.px;
    source.px = null;
    return result;
  }

  /** Original destructor invokes the pointee hook without resetting the dead object's member. @returns Nothing. */
  dispose(): void {
    if (this.px !== null) this.adl.intrusive_ptr_release(this.px);
  }

  /** Original copy assignment acquires into a temporary before swapping and destroying the old owner. @param source - Const smart pointer. @returns This owner. */
  assign(source: intrusive_ptr<T>): this {
    const temporary = new intrusive_ptr(this.adl, source.get());
    temporary.swap(this);
    temporary.dispose();
    return this;
  }

  /** Original raw-pointer assignment with its erased raw argument type made explicit. @param source - Raw pointer. @returns This owner. */
  assignPointer(source: T | null): this {
    const temporary = new intrusive_ptr(this.adl, source);
    temporary.swap(this);
    temporary.dispose();
    return this;
  }

  /** Original move assignment retains native self-move semantics through the same temporary/swap/destructor sequence. @param source - Rvalue owner. @returns This owner. */
  moveAssign(source: intrusive_ptr<T>): this {
    const temporary = intrusive_ptr.move(source);
    temporary.swap(this);
    temporary.dispose();
    return this;
  }

  /** Original reset overloads use a temporary, acquiring before releasing even for the same pointee. @param source - New raw pointer or null for reset(). @param add_ref - Raw-pointer acquisition flag. @returns Nothing. */
  reset(source: T | null = null, add_ref = true): void {
    const temporary = new intrusive_ptr(this.adl, source, add_ref);
    temporary.swap(this);
    temporary.dispose();
  }

  /** Original raw pointer getter. @returns Stored pointer. */
  get(): T | null {
    return this.px;
  }

  /** Original detach transfers responsibility without releasing. @returns Detached raw pointer. */
  detach(): T | null {
    const result = this.px;
    this.px = null;
    return result;
  }

  /** Original operator* for valid non-null pointers; null dereference remains outside the contract. @returns Referenced object. */
  dereference(): T {
    return this.px as T;
  }

  /** Original operator-> for valid non-null pointers. @returns Pointee. */
  arrow(): T {
    return this.px as T;
  }

  /** Original explicit operator bool. @returns Pointer is non-null. */
  bool(): boolean {
    return this.px !== null;
  }

  /** Original swap exchanges only pointer fields, retaining each erased template/ADL witness. @param rhs - Other owner of the same pointee type. @returns Nothing. */
  swap(rhs: intrusive_ptr<T>): void {
    const temporary = this.px;
    this.px = rhs.px;
    rhs.px = temporary;
  }
}

/*
 * Original intrusive_ptr.hpp: Copyright (c) 2001, 2002 Peter Dimov.
 * Distributed under the Boost Software License, Version 1.0.
 * See the accompanying external/boost/LICENSE or https://www.boost.org/LICENSE_1_0.txt.
 */

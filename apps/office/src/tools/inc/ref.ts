/** @fileoverview Original SvRefBase, SvRef and make_ref from tools/ref.hxx with explicit intrusive ownership; native virtual delete binds to destroy, and the empty ref.cxx base destructor is co-located. Compatibility weak-frame wrappers remain separate. */

/** Original31-bit count and one-bit no-delete gate; this is the actual native owner, without GC finalizers or a second reference registry. */
export class SvRefBase {
  private nRefCount = 0;
  private bNoDelete = 1;
  /** Original default and dummy copy constructors begin with count0/no-delete1. @param source - Ignored original copy source. @returns Base. */
  constructor(source?: Readonly<SvRefBase>) {
    void source;
  }
  /** Original qualified base assignment is a no-op. @param source - Ignored right side. @returns This base. */
  assign(source: Readonly<SvRefBase>): this {
    void source;
    return this;
  }
  /** Original copy acquisition does not change the no-delete gate. @returns Nothing. */
  AddNextRef(): void {
    if (!(this.nRefCount < 1 << 30)) throw new Error("Do not add refs to dead objects");
    this.nRefCount = (this.nRefCount + 1) & 0x7fffffff;
  }
  /** Original first acquisition enables deletion before increasing the31-bit count. @returns Nothing. */
  AddFirstRef(): void {
    if (!(this.nRefCount < 1 << 30)) throw new Error("Do not add refs to dead objects");
    if (this.bNoDelete) this.bNoDelete = 0;
    this.nRefCount = (this.nRefCount + 1) & 0x7fffffff;
  }
  /** Original last release publishes the dead-object diagnostic count before virtual deletion. @returns Nothing. */
  ReleaseRef(): void {
    if (!(this.nRefCount >= 1)) throw new Error("assert(nRefCount >= 1)");
    this.nRefCount = (this.nRefCount - 1) & 0x7fffffff;
    if (this.nRefCount === 0 && !this.bNoDelete) {
      this.nRefCount = 1 << 30;
      this.destroy();
    }
  }
  /** Original live count observation. @returns Current unsigned count. */
  GetRefCount(): number {
    return this.nRefCount;
  }
  /** Original empty virtual SvRefBase destructor from tools/source/ref/ref.cxx. @returns Nothing. */
  protected destroy(): void {}
}

/** Original one-pointer tools::SvRef value; erased template T is compile-time-only and never inferred or registered. */
export class SvRef<T extends SvRefBase> {
  private pObj: T | null;
  /** Original default/raw-pointer/copy constructor overloads. @param source - Original selected pointer or reference. @returns Reference. */
  constructor(source?: T | null | SvRef<T>) {
    if (source instanceof SvRef) {
      this.pObj = source.pObj;
      if (this.pObj) this.pObj.AddNextRef();
    } else {
      this.pObj = source ?? null;
      if (this.pObj) this.pObj.AddFirstRef();
    }
  }
  /** Original move constructor steals the pointer and clears its source without acquisition. @param source - Rvalue source. @returns Moved owner. */
  static move<T extends SvRefBase>(source: SvRef<T>): SvRef<T> {
    const result = new SvRef<T>();
    result.pObj = source.pObj;
    source.pObj = null;
    return result;
  }
  /** Original destructor releases the retained pointer; it does not implement clear's early null publication. @returns Nothing. */
  dispose(): void {
    if (this.pObj) this.pObj.ReleaseRef();
  }
  /** Original clear publishes null before calling virtual deletion. @returns Nothing. */
  clear(): void {
    if (this.pObj) {
      const object = this.pObj;
      this.pObj = null;
      object.ReleaseRef();
    }
  }
  /** Original copy assignment acquires before publication/release, including self assignment; raw values create the actual implicit prvalue temporary and select move assignment. @param source - Source selected by the caller's declared type. @returns This reference. */
  assign(source: SvRef<T> | T | null): this {
    if (!(source instanceof SvRef)) {
      const temporary = new SvRef(source);
      try {
        return this.moveAssign(temporary);
      } finally {
        temporary.dispose();
      }
    }
    if (source.pObj) source.pObj.AddNextRef();
    const old = this.pObj;
    this.pObj = source.pObj;
    if (old) old.ReleaseRef();
    return this;
  }
  /** Original move assignment releases the old pointer before reading the source, and deliberately has no self-move repair. @param source - Rvalue source. @returns This reference. */
  moveAssign(source: SvRef<T>): this {
    if (this.pObj) this.pObj.ReleaseRef();
    this.pObj = source.pObj;
    source.pObj = null;
    return this;
  }
  /** Original null predicate. @returns Non-null state. */
  is(): boolean {
    return this.pObj !== null;
  }
  /** Original explicit bool delegates is. @returns Non-null state. */
  operatorBool(): boolean {
    return this.is();
  }
  /** Original borrowed pointer access. @returns Pointer or null. */
  get(): T | null {
    return this.pObj;
  }
  /** Original asserted arrow access. @returns Borrowed nonnull object. */
  operatorArrow(): T {
    if (this.pObj === null) throw new Error("assert(pObj != nullptr)");
    return this.pObj;
  }
  /** Original asserted dereference. @returns Borrowed nonnull object. */
  operatorDereference(): T {
    if (this.pObj === null) throw new Error("assert(pObj != nullptr)");
    return this.pObj;
  }
  /** Original raw pointer equality. @param other - Same declared template. @returns Equality. */
  operatorEquals(other: SvRef<T>): boolean {
    return this.pObj === other.pObj;
  }
  /** Original inequality negates pointer equality. @param other - Same declared template. @returns Inequality. */
  operatorNotEquals(other: SvRef<T>): boolean {
    return !this.operatorEquals(other);
  }
}
/** Original make_ref forwards source constructor arguments and wraps the actual new object once. @param constructor - Erased declared T constructor. @param args - Original forwarded argument pack. @returns Acquired actual owner. */
export function make_ref<T extends SvRefBase, A extends unknown[]>(
  constructor: new (...args: A) => T,
  ...args: A
): SvRef<T> {
  return new SvRef(new constructor(...args));
}

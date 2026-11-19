/** @fileoverview Neutral JavaScript compiler binding of the pinned SDK std::exception_ptr empty/copy/assignment/equality/rethrow/destructor operations. The real host exception runtime is installed at composition, like the native __cxa ABI; no browser/UNO implementation is imported here. */
/** Actual compiler exception-runtime operations consumed by the original standard-library value. */
export interface ExceptionPointerAbi {
  /** Original primary exception capture, lowered from an actual JS catch parameter. @param error - Actual caught object. @returns Acquired opaque exception. */
  current(error: unknown): object;
  /** Original __cxa_increment_exception_refcount. @param pointer - Actual opaque pointer. @returns Nothing. */
  acquire(pointer: object): void;
  /** Original __cxa_decrement_exception_refcount. @param pointer - Actual opaque pointer. @returns Nothing. */
  release(pointer: object): void;
  /** Original nonempty primary exception rethrow. @param pointer - Actual opaque pointer. @returns Never. */
  rethrow(pointer: object): never;
}
let abi: ExceptionPointerAbi | undefined;
const pointer = Symbol("std::exception_ptr::__ptr_");
/** Realm composition links the actual compiler exception runtime. @param implementation - Real execution ABI. @returns Nothing. */
export function bindExceptionPointerAbi(implementation: ExceptionPointerAbi): void {
  abi = implementation;
}
/** Native ABI linkage is required for nonempty exception operations. @returns Installed runtime. */
function runtime(): ExceptionPointerAbi {
  if (!abi)
    throw new Error("exception_ptr ABI must be initialized before nonempty pointer operations");
  return abi;
}
/** Original borrowed const exception_ptr value. The module-private symbol exposes no substitute pointer/error DTO. */
export type ExceptionPtrConstReference = Pick<
  ExceptionPtr,
  "is" | "equals" | "rethrow" | typeof pointer
>;
/** Original standard-library value with an opaque compiler-runtime pointer. Native physical C++ ABI and atomic/TLS profiles remain separate platform responsibilities. */
export class ExceptionPtr {
  private __ptr: object | null = null;
  /** Original default/copy construction, without a fabricated exception for empty pointers. @param source - Actual pointer value. @returns Pointer. */
  constructor(source?: ExceptionPtrConstReference) {
    if (source) {
      this.__ptr = source[pointer]();
      if (this.__ptr) runtime().acquire(this.__ptr);
    }
  }
  /** Compiler lowering of const private-pointer access for native value operations. @returns Same opaque pointer. */
  [pointer](): object | null {
    return this.__ptr;
  }
  /** Original equal-pointer guard and acquire/release/publish assignment order. @param source - Borrowed pointer. @returns This value. */
  assign(source: ExceptionPtrConstReference): this {
    const next = source[pointer]();
    if (next !== this.__ptr) {
      if (next) runtime().acquire(next);
      if (this.__ptr) runtime().release(this.__ptr);
      this.__ptr = next;
    }
    return this;
  }
  /** Original explicit bool conversion. @returns Nonempty state. */
  is(): boolean {
    return this.__ptr !== null;
  }
  /** Original opaque pointer equality. @param other - Actual pointer. @returns Shared exception identity. */
  equals(other: ExceptionPtrConstReference): boolean {
    return this.__ptr === other[pointer]();
  }
  /** Compiler lowering of std::current_exception in an actual catch. @param error - Actual caught value. @returns Acquired pointer. */
  static capture(error: unknown): ExceptionPtr {
    const result = new ExceptionPtr();
    result.__ptr = runtime().current(error);
    return result;
  }
  /** Original nonempty rethrow delegates to the actual compiler ABI. Native empty rethrow terminates; its unsupported host domain is an explicit development boundary. @returns Never. */
  rethrow(): never {
    if (!this.__ptr) throw new Error("rethrow_exception requires a nonempty exception_ptr");
    return runtime().rethrow(this.__ptr);
  }
  /** Original destructor release. Clearing afterwards is only the explicit host-destructor binding; post-C++-destruction use remains outside source lifetime. @returns Nothing. */
  dispose(): void {
    if (this.__ptr) runtime().release(this.__ptr);
    this.__ptr = null;
  }
}

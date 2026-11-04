/** @fileoverview Original consumed inline counted/default/null StringPiece constructors and borrowed byte-span queries. String-view/substr overloads remain unported and are not supplied as substitutes. */
import { cStringLength } from "../stringpiece";
/** Original non-owning counted byte span; no decoding, inferred termination or copy. */
export class StringPiece {
  private readonly ptr_: Uint8Array | null;
  private readonly length_: number;
  /** Original default/null, NUL-pointer and counted constructors share this ESM signature. @param pointer - Actual borrowed bytes/null. @param length - Explicit count, omitted for native strlen. @returns Span. */
  constructor(pointer: Uint8Array | null = null, length?: number) {
    this.ptr_ = pointer;
    if (length === undefined) length = pointer === null ? 0 : cStringLength(pointer);
    this.length_ = length | 0;
  }
  /** Original borrowed data pointer. @returns Actual bytes/null. */
  data(): Uint8Array | null {
    return this.ptr_;
  }
  /** Original counted length. @returns Length. */
  length(): number {
    return this.length_;
  }
  /** Original size alias. @returns Length. */
  size(): number {
    return this.length_;
  }
  /** Original zero-length predicate. @returns Empty. */
  empty(): boolean {
    return this.length_ === 0;
  }
}

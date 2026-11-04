/** @fileoverview Original consumed inline counted/default/null StringPiece constructors and borrowed byte-span queries. NUL-pointer/string-view/substr overloads remain unported and are not supplied as substitutes. */
/** Original non-owning counted byte span; no decoding, inferred termination or copy. */
export class StringPiece {
  private readonly ptr_: Uint8Array | null;
  private readonly length_: number;
  /** Original default/null constructor. @param pointer - Null pointer. @returns Empty span. */
  constructor(pointer?: null);
  /** Original counted constructor. @param pointer - Actual borrowed bytes/null. @param length - Native signed32 length. @returns Span. */
  constructor(pointer: Uint8Array | null, length: number);
  /** Original inline field initialization. @param pointer - Borrowed bytes. @param length - Explicit count for the counted overload. @returns Span. */
  constructor(pointer: Uint8Array | null = null, length = 0) {
    this.ptr_ = pointer;
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

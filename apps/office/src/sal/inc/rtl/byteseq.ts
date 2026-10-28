/** @fileoverview Original rtl::ByteSequence value owner and internal moves over actual SAL byte-sequence C operations. No substitute UNO sequence or allocator provider is introduced. */
import type { sal_Sequence } from "../types";
import * as C from "./byteseq.h";
import { BYTESEQ_NODEFAULT, BYTESEQ_NOACQUIRE } from "./byteseq.h";
export { BYTESEQ_NODEFAULT, BYTESEQ_NOACQUIRE } from "./byteseq.h";
/** Original one-pointer value; C++ enum/constructor overloads are explicit after erasure. */
export class ByteSequence {
  private slot: C.ByteSequenceSlot = [null];
  /** Original default/copy/handle/adopt/array/length constructors. @param args - Native overload inputs. @returns Value. */
  constructor(
    ...args:
      | []
      | [ByteSequence | sal_Sequence | number]
      | [number, typeof BYTESEQ_NODEFAULT]
      | [sal_Sequence | null, typeof BYTESEQ_NOACQUIRE]
      | [C.ByteElements | null, number]
  ) {
    if (args.length === 0) C.rtl_byte_sequence_construct(this.slot, 0);
    else if (args.length === 1 && args[0] instanceof ByteSequence)
      C.rtl_byte_sequence_assign(this.slot, args[0].get() as sal_Sequence);
    else if (args.length === 1 && typeof args[0] !== "number") {
      this.slot[0] = args[0] as sal_Sequence;
      C.rtl_byte_sequence_acquire(args[0] as sal_Sequence);
    } else if (args.length === 1) {
      C.rtl_byte_sequence_construct(this.slot, args[0] as number);
      if (this.slot[0] === null) throw new RangeError("std::bad_alloc");
    } else if (typeof args[0] === "number") {
      C.rtl_byte_sequence_constructNoDefault(this.slot, args[0]);
      if (this.slot[0] === null) throw new RangeError("std::bad_alloc");
    } else if (args[1] === BYTESEQ_NOACQUIRE) this.slot[0] = args[0] as sal_Sequence | null;
    else {
      C.rtl_byte_sequence_constructFromArray(this.slot, args[0] as C.ByteElements | null, args[1]);
      if (this.slot[0] === null) throw new RangeError("std::bad_alloc");
    }
  }
  /** Original transfer/null move constructor. @param source - Native rvalue. @returns Moved owner. */
  static move(source: ByteSequence): ByteSequence {
    const result = new ByteSequence(source.get(), BYTESEQ_NOACQUIRE);
    source.slot[0] = null;
    return result;
  }
  /** Original handle borrow. @returns Original pointer or moved-from null. */ get(): sal_Sequence | null {
    return this.slot[0];
  }
  /** Original length query. @returns Logical length. */ getLength(): number {
    return C.rtl_byte_sequence_getLength(this.slot[0] as sal_Sequence);
  }
  /** Original const pointer query. @returns Existing byte storage. */ getConstArray(): C.ByteElements {
    return C.rtl_byte_sequence_getConstArray(this.slot[0] as sal_Sequence);
  }
  /** Original mutable pointer makes the actual handle unique first. @returns Writable storage. */ getArray(): C.ByteElements {
    C.rtl_byte_sequence_reference2One(this.slot);
    if (this.slot[0] === null) throw new RangeError("std::bad_alloc");
    return this.getConstArray();
  }
  /** Original copy assignment. @param source - Borrowed owner. @returns This value. */ assign(
    source: ByteSequence,
  ): this {
    C.rtl_byte_sequence_assign(this.slot, source.get() as sal_Sequence);
    return this;
  }
  /** Original move assignment releases then transfers/nulls, unlike UNO Sequence swap assignment. @param source - Native rvalue. @returns This value. */ moveAssign(
    source: ByteSequence,
  ): this {
    C.rtl_byte_sequence_release(this.slot[0]);
    this.slot[0] = source.slot[0];
    source.slot[0] = null;
    return this;
  }
  /** Original realloc forwarding. @param size - Count. @returns Nothing. */ realloc(
    size: number,
  ): void {
    C.rtl_byte_sequence_realloc(this.slot, size);
    if (this.slot[0] === null) throw new RangeError("std::bad_alloc");
  }
  /** Original equality. @param other - Other initialized owner. @returns Equal. */ equals(
    other: ByteSequence,
  ): boolean {
    return C.rtl_byte_sequence_equals(this.slot[0] as sal_Sequence, other.slot[0] as sal_Sequence);
  }
  /** Original inequality. @param other - Other initialized owner. @returns Different. */ notEquals(
    other: ByteSequence,
  ): boolean {
    return !this.equals(other);
  }
  /** Original destructor permits a moved-from null and does not clear a destroyed value. @returns Nothing. */ dispose(): void {
    C.rtl_byte_sequence_release(this.slot[0]);
  }
}

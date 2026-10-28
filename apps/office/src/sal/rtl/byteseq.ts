/** @fileoverview Original rtl byte-sequence C algorithms over the existing SAL record and OSL count owner. Native malloc/realloc/free lower to logical addressed allocation/GC; native resource failures and physical/uninitialized bytes are not certified. */
import { type sal_Sequence, salSequenceCountAddress } from "../inc/types";
import { osl_atomic_increment, osl_atomic_decrement } from "../inc/osl/interlck";
/** Original sequence pointer reference. */
export type ByteSequenceSlot = [sal_Sequence | null];
/** Original byte pointer binding, either a typed native byte view or existing logical lvalue addresses. */
export type ByteElements = Int8Array | Uint8Array | Pick<ReadonlyMap<number, unknown>, "get">;
/** Logical byte lvalues belong to this original SAL allocation. No UNO factory/type/default provider is supplied. */
class ByteStorage {
  private readonly cells = new Map<number, [number | undefined]>();
  /** Adapts byte pointer arithmetic; indeterminate native bytes are outside verified reads. @param offset - Byte offset. @returns Actual lvalue cell. */
  get(offset: number): [number | undefined] {
    let cell = this.cells.get(offset);
    if (cell === undefined) {
      cell = [undefined];
      this.cells.set(offset, cell);
    }
    return cell;
  }
}
/** Native pointer read from initialized byte storage. @param source - Existing byte pointer. @param index - Byte offset. @returns Signed byte. */
function read(source: ByteElements, index: number): number {
  return ArrayBuffer.isView(source)
    ? ((source[index] as number) << 24) >> 24
    : (source.get(index) as [number])[0];
}
/** Native malloc/header binding; its uninitialized storage does not invent byte values. @param length - Original count. @returns Allocation. */
function allocate(length: number): sal_Sequence | null {
  return { nRefCount: 1, nElements: length, elements: new ByteStorage() };
}
/** Native byte memcpy between original allocations. @param target - Destination. @param source - Initialized prefix. @param length - Count. @returns Nothing. */
function copy(target: sal_Sequence, source: ByteElements, length: number): void {
  const cells = target.elements as ByteStorage;
  for (let i = 0; i < length; ++i) cells.get(i)[0] = read(source, i);
}
/** Original static empty {1,0,{0}}, independent from UNO's g_emptySeq. */
const aEmpty_rtl_ByteSeq: sal_Sequence = {
  nRefCount: 1,
  nElements: 0,
  elements: new Int8Array([0]),
};
/** Original atomic acquisition. @param sequence - Nonnull handle. @returns Nothing. */
export function rtl_byte_sequence_acquire(sequence: sal_Sequence): void {
  osl_atomic_increment(salSequenceCountAddress(sequence));
}
/** Original nullable release; GC lowers native free without clearing or certifying post-destruction accesses. @param sequence - Handle or null. @returns Nothing. */
export function rtl_byte_sequence_release(sequence: sal_Sequence | null): void {
  if (sequence !== null) osl_atomic_decrement(salSequenceCountAddress(sequence));
}
/** Original default allocation, including static empty acquisition. @param slot - Pointer lvalue. @param length - Native count. @returns Nothing. */
export function rtl_byte_sequence_construct(slot: ByteSequenceSlot, length: number): void {
  if (slot[0]) {
    rtl_byte_sequence_release(slot[0]);
    slot[0] = null;
  }
  if (length) {
    const sequence = allocate(length);
    if (sequence !== null) {
      const cells = sequence.elements as ByteStorage;
      for (let i = 0; i < length; ++i) cells.get(i)[0] = 0;
    }
    slot[0] = sequence;
  } else {
    slot[0] = aEmpty_rtl_ByteSeq;
    rtl_byte_sequence_acquire(slot[0]);
  }
}
/** Original no-default allocation, even for zero length. @param slot - Pointer lvalue. @param length - Native count. @returns Nothing. */
export function rtl_byte_sequence_constructNoDefault(slot: ByteSequenceSlot, length: number): void {
  if (slot[0]) {
    rtl_byte_sequence_release(slot[0]);
    slot[0] = null;
  }
  slot[0] = allocate(length);
}
/** Original initialized byte-array construction. @param slot - Pointer lvalue. @param source - Native byte pointer. @param length - Original count. @returns Nothing. */
export function rtl_byte_sequence_constructFromArray(
  slot: ByteSequenceSlot,
  source: ByteElements | null,
  length: number,
): void {
  rtl_byte_sequence_constructNoDefault(slot, length);
  if (slot[0] !== null && length !== 0) copy(slot[0], source as ByteElements, length);
}
/** Original copy assignment acquires only when handles differ. @param slot - Destination. @param sequence - Nonnull source. @returns Nothing. */
export function rtl_byte_sequence_assign(slot: ByteSequenceSlot, sequence: sal_Sequence): void {
  if (slot[0] !== sequence) {
    if (slot[0]) rtl_byte_sequence_release(slot[0]);
    slot[0] = sequence;
    rtl_byte_sequence_acquire(sequence);
  }
}
/** Original COW split deliberately omits decrement for the zero-element branch. @param slot - Pointer lvalue. @returns Nothing. */
export function rtl_byte_sequence_reference2One(slot: ByteSequenceSlot): void {
  const sequence = slot[0] as sal_Sequence;
  if (sequence.nRefCount > 1) {
    const length = sequence.nElements,
      fresh = allocate(length);
    if (length) {
      if (fresh !== null) copy(fresh, sequence.elements, length);
      rtl_byte_sequence_release(sequence);
    }
    slot[0] = fresh;
  }
}
/** Original reallocation split/default rules. Unique realloc physical address choice and uninitialized tails remain unverified. @param slot - Pointer lvalue. @param size - New count. @returns Nothing. */
export function rtl_byte_sequence_realloc(slot: ByteSequenceSlot, size: number): void {
  const sequence = slot[0] as sal_Sequence,
    length = sequence.nElements;
  if (length === size) return;
  const fresh = allocate(size);
  if (fresh !== null) copy(fresh, sequence.elements, Math.min(length, size));
  if (sequence.nRefCount > 1) {
    if (fresh !== null && size > length) {
      const cells = fresh.elements as ByteStorage;
      for (let i = length; i < size; ++i) cells.get(i)[0] = 0;
    }
    rtl_byte_sequence_release(sequence);
  }
  slot[0] = fresh;
}
/** Original identity/length/memcmp equality over initialized byte values only. @param first - First handle. @param second - Second handle. @returns Equal. */
export function rtl_byte_sequence_equals(first: sal_Sequence, second: sal_Sequence): boolean {
  if (first === second) return true;
  if (first.nElements !== second.nElements) return false;
  for (let i = 0; i < first.nElements; ++i)
    if ((read(first.elements, i) & 255) !== (read(second.elements, i) & 255)) return false;
  return true;
}
/** Original borrowed const byte pointer. @param sequence - Nonnull handle. @returns Existing storage. */
export function rtl_byte_sequence_getConstArray(sequence: sal_Sequence): ByteElements {
  return sequence.elements;
}
/** Original count query. @param sequence - Nonnull handle. @returns Logical count. */
export function rtl_byte_sequence_getLength(sequence: sal_Sequence): number {
  return sequence.nElements;
}

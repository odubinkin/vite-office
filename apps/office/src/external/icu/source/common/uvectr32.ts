/** @fileoverview Original ICU78.3 UVector32 scalar, capacity and stack operations. Typed arrays own native signed32 storage; physical allocator/RTTI ABI is not represented. */
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
/** Original integer vector owner, retaining logical size separately from allocated capacity. */
export class UVector32 {
  private count = 0;
  private capacity = 0;
  private maxCapacity = 0;
  private elements: Int32Array | null = null;
  /** Erases only native readable-pointer qualification; no replacement storage is supplied. @returns Actual live storage. */
  private get data(): Int32Array {
    return this.elements as Int32Array;
  }
  /** Original default-capacity constructor. @param status - Shared source status. @returns Owner. */
  constructor(status: [number]);
  /** Original explicit-capacity constructor. @param initialCapacity - Requested signed32 capacity. @param status - Shared status. @returns Owner. */
  constructor(initialCapacity: number, status: [number]);
  /** Original constructors allocate even with a pre-existing failure. @param first - Capacity or status. @param second - Explicit-capacity status. @returns Owner. */
  constructor(first: number | [number], second?: [number]) {
    const status = typeof first === "number" ? (second as [number]) : first;
    let initial = typeof first === "number" ? first : 8;
    if (initial < 1) initial = 8;
    if (this.maxCapacity > 0 && this.maxCapacity < initial) initial = this.maxCapacity;
    if (initial > 0x1fffffff) initial = Math.min(8, this.maxCapacity);
    try {
      this.elements = new Int32Array(initial);
      this.capacity = initial;
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      status[0] = E.U_MEMORY_ALLOCATION_ERROR;
    }
  }
  /** Original size. @returns Logical count. */
  size(): number {
    return this.count;
  }
  /** Original emptiness compares count with zero. @returns Empty. */
  isEmpty(): boolean {
    return this.count === 0;
  }
  /** Original stack alias. @returns Empty. */
  empty(): boolean {
    return this.isEmpty();
  }
  /** Original getBuffer borrows allocated storage, including capacity beyond count. @returns Actual storage. */
  getBuffer(): Int32Array | null {
    return this.elements;
  }
  /** Original bounded scalar read. @param index - Offset. @returns Element or zero. */
  elementAti(index: number): number {
    return index >= 0 && this.count > 0 && this.count - index > 0
      ? (this.data[index] as number)
      : 0;
  }
  /** Original last-element helper. @returns Last element or zero. */
  lastElementi(): number {
    return this.elementAti(this.count - 1);
  }
  /** Original stack peek alias. @returns Last value. */
  peeki(): number {
    return this.lastElementi();
  }
  /** Original bounded replacement. @param value - Signed32 value. @param index - Offset. @returns Nothing. */
  setElementAt(value: number, index: number): void {
    if (index >= 0 && index < this.count) this.data[index] = value;
  }
  /** Original fast path ignores incoming failure when existing capacity suffices. @param minimum - Required capacity. @param status - Shared status. @returns Capacity available. */
  ensureCapacity(minimum: number, status: [number]): boolean {
    return minimum >= 0 && this.capacity >= minimum ? true : this.expandCapacity(minimum, status);
  }
  /** Original grow checks and doubled capacity. @param minimum - Required capacity. @param status - Shared status. @returns Success. */
  expandCapacity(minimum: number, status: [number]): boolean {
    if (U_FAILURE(status[0])) return false;
    if (minimum < 0) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return false;
    }
    if (this.capacity >= minimum) return true;
    if (this.maxCapacity > 0 && minimum > this.maxCapacity) {
      status[0] = E.U_BUFFER_OVERFLOW_ERROR;
      return false;
    }
    if (this.capacity > 0x3fffffff) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return false;
    }
    let capacity = Math.max(this.capacity * 2, minimum);
    if (this.maxCapacity > 0 && capacity > this.maxCapacity) capacity = this.maxCapacity;
    if (capacity > 0x1fffffff) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return false;
    }
    let elements: Int32Array;
    try {
      elements = new Int32Array(capacity);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      status[0] = E.U_MEMORY_ALLOCATION_ERROR;
      return false;
    }
    if (this.elements !== null) elements.set(this.elements);
    this.elements = elements;
    this.capacity = capacity;
    return true;
  }
  /** Original maximum-capacity change can truncate size. @param limit - Signed32 limit; zero is unlimited. @returns Nothing. */
  setMaxCapacity(limit: number): void {
    if (limit < 0) limit = 0;
    if (limit > 0x1fffffff) return;
    this.maxCapacity = limit;
    if (this.capacity <= limit || limit === 0) return;
    let elements: Int32Array;
    try {
      elements = new Int32Array(limit);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      return;
    }
    elements.set(this.data.subarray(0, limit));
    this.elements = elements;
    this.capacity = limit;
    if (this.count > this.capacity) this.count = this.capacity;
  }
  /** Original append. @param value - Signed32 value. @param status - Shared status. @returns Nothing. */
  addElement(value: number, status: [number]): void {
    if (this.ensureCapacity(this.count + 1, status)) this.data[this.count++] = value;
  }
  /** Original stack push returns its input even when insertion fails. @param value - Signed32 input. @param status - Shared status. @returns Input value. */
  push(value: number, status: [number]): number {
    this.addElement(value, status);
    return value | 0;
  }
  /** Original stack pop preserves storage outside the new count. @returns Popped value or zero. */
  popi(): number {
    return this.count > 0 ? (this.data[--this.count] as number) : 0;
  }
  /** Original insertion validates the index before capacity/status access. @param value - Input. @param index - Offset. @param status - Shared status. @returns Nothing. */
  insertElementAt(value: number, index: number, status: [number]): void {
    if (index >= 0 && index <= this.count && this.ensureCapacity(this.count + 1, status)) {
      for (let i = this.count; i > index; --i) this.data[i] = this.data[i - 1] as number;
      this.data[index] = value;
      ++this.count;
    }
  }
  /** Original deletion only checks the lower bound and still decrements for an oversized index. @param index - Offset. @returns Nothing. */
  removeElementAt(index: number): void {
    if (index >= 0) {
      for (let i = index; i < this.count - 1; ++i) this.data[i] = this.data[i + 1] as number;
      --this.count;
    }
  }
  /** Original clear changes only count. @returns Nothing. */
  removeAllElements(): void {
    this.count = 0;
  }
  /** Original size change zero-fills newly exposed elements. @param size - New logical size. @returns Nothing. */
  setSize(size: number): void {
    if (size < 0) return;
    if (size > this.count) {
      const status: [number] = [0];
      if (!this.ensureCapacity(size, status)) return;
      this.data.fill(0, this.count, size);
    }
    this.count = size;
  }
  /** Original copy assignment and status forwarding. @param other - Source owner. @param status - Shared status. @returns Nothing. */
  assign(other: UVector32, status: [number]): void {
    if (this.ensureCapacity(other.count, status)) {
      this.setSize(other.count);
      for (let i = 0; i < other.count; ++i) this.data[i] = other.data[i] as number;
    }
  }
  /** Original scalar equality. @param other - Compared owner. @returns Equality. */
  equals(other: UVector32): boolean {
    if (this.count !== other.count) return false;
    for (let i = 0; i < this.count; ++i) if (this.data[i] !== other.data[i]) return false;
    return true;
  }
  /** Original linear lookup. Native readable-index preconditions apply. @param value - Searched value. @param start - Initial offset. @returns Index or minus one. */
  indexOf(value: number, start = 0): number {
    for (let i = start; i < this.count; ++i) if (this.data[i] === value) return i;
    return -1;
  }
  /** Original contains helper. @param value - Value. @returns Membership. */
  contains(value: number): boolean {
    return this.indexOf(value) >= 0;
  }
  /** Original all-members lookup. @param other - Requested members. @returns Membership result. */
  containsAll(other: UVector32): boolean {
    for (let i = 0; i < other.size(); ++i)
      if (this.indexOf(other.data[i] as number) < 0) return false;
    return true;
  }
  /** Original no-members lookup. @param other - Requested members. @returns Membership result. */
  containsNone(other: UVector32): boolean {
    for (let i = 0; i < other.size(); ++i)
      if (this.indexOf(other.data[i] as number) >= 0) return false;
    return true;
  }
  /** Original removal visits each requested entry once, including source alias effects. @param other - Removal entries. @returns Changed. */
  removeAll(other: UVector32): boolean {
    let changed = false;
    for (let i = 0; i < other.size(); ++i) {
      const j = this.indexOf(other.data[i] as number);
      if (j >= 0) {
        this.removeElementAt(j);
        changed = true;
      }
    }
    return changed;
  }
  /** Original backward retention. @param other - Retained entries. @returns Changed. */
  retainAll(other: UVector32): boolean {
    let changed = false;
    for (let j = this.size() - 1; j >= 0; --j)
      if (other.indexOf(this.data[j] as number) < 0) {
        this.removeElementAt(j);
        changed = true;
      }
    return changed;
  }
  /** Original sorted insertion uses the position after equal entries. @param value - Signed32 input. @param status - Shared status. @returns Nothing. */
  sortedInsert(value: number, status: [number]): void {
    let min = 0,
      max = this.count;
    while (min !== max) {
      const probe = Math.trunc((min + max) / 2);
      if ((this.data[probe] as number) > value) max = probe;
      else min = probe + 1;
    }
    if (this.ensureCapacity(this.count + 1, status)) {
      for (let i = this.count; i > min; --i) this.data[i] = this.data[i - 1] as number;
      this.data[min] = value;
      ++this.count;
    }
  }
  /** Original reserve returns a borrowed pointer view and increments count. @param size - Frame length. @param status - Shared status. @returns Borrowed pointer or null. */
  reserveBlock(size: number, status: [number]): Int32Array | null {
    if (!this.ensureCapacity(this.count + size, status)) return null;
    const offset = this.count;
    this.count += size;
    return new Int32Array(
      this.data.buffer,
      this.data.byteOffset + offset * 4,
      this.capacity - offset,
    );
  }
  /** Original popFrame retains the source's count-minus-size pointer expression; native valid pointer/readable-span preconditions apply. @param size - Removed frame length. @returns Borrowed source pointer view. */
  popFrame(size: number): Int32Array {
    this.count -= size;
    if (this.count < 0) this.count = 0;
    const offset = this.count - size;
    return new Int32Array(
      this.data.buffer,
      this.data.byteOffset + offset * 4,
      this.capacity - offset,
    );
  }
}

/** @fileoverview Original MaybeStackArray byte specialization, with explicit native template stack capacity. Actual Uint8Array storage binds char pointers; native allocation failure/free, stack address ABI, uninitialized cells and invalidated borrows are not certified. */
/** Original MaybeStackArray<T,stackCapacity>, instantiated here only for byte storage. No element/allocator factory is supplied. */
export class MaybeStackArray {
  private ptr: Uint8Array;
  private capacity: number;
  private needToRelease = false;
  private readonly stackArray: Uint8Array;
  /** Original default initialization; the parameter binds the C++ template's compile-time capacity. @param stackCapacity - Original template bound. @returns Owner. */
  constructor(private readonly stackCapacity: number) {
    this.stackArray = new Uint8Array(stackCapacity);
    this.ptr = this.stackArray;
    this.capacity = stackCapacity;
  }
  /** Original move constructor. @param source - Actual source. @returns New owner. */
  static moveConstruct(source: MaybeStackArray): MaybeStackArray {
    const dest = new MaybeStackArray(source.stackCapacity);
    dest.capacity = source.capacity;
    dest.needToRelease = source.needToRelease;
    if (source.ptr === source.stackArray) {
      dest.ptr = dest.stackArray;
      dest.stackArray.set(source.stackArray.subarray(0, source.capacity));
    } else {
      dest.ptr = source.ptr;
      source.resetToStackArray();
    }
    return dest;
  }
  /** Original move assignment; self-move is outside the source contract. @param source - Actual source. @returns This owner. */
  moveAssign(source: MaybeStackArray): this {
    this.capacity = source.capacity;
    this.needToRelease = source.needToRelease;
    if (source.ptr === source.stackArray) {
      this.ptr = this.stackArray;
      this.stackArray.set(source.stackArray.subarray(0, source.capacity));
    } else {
      this.ptr = source.ptr;
      source.resetToStackArray();
    }
    return this;
  }
  /** Original capacity query. @returns Items. */
  getCapacity(): number {
    return this.capacity;
  }
  /** Original borrowed pointer. @returns Actual storage. */
  getAlias(): Uint8Array {
    return this.ptr;
  }
  /** Original limit pointer. @returns End-address view. */
  getArrayLimit(): Uint8Array {
    return this.ptr.subarray(this.capacity);
  }
  /** Original alias guard and non-owning assignment. Managed replacement releases the previous owned reference. @param array - Actual readable/writable pointer/null. @param capacity - Advertised capacity. @returns Nothing. */
  aliasInstead(array: Uint8Array | null, capacity: number): void {
    if (array !== null && capacity > 0) {
      this.ptr = array;
      this.capacity = capacity;
      this.needToRelease = false;
    }
  }
  /** Original positive-capacity allocation, bounded copy and adoption. Native allocation failure is outside managed storage. @param capacity - Required capacity. @param length - Items to preserve. @returns New pointer/null. */
  resize(capacity: number, length = 0): Uint8Array | null {
    if (capacity <= 0) return null;
    const p = new Uint8Array(capacity);
    if (length > 0) {
      if (length > this.capacity) length = this.capacity;
      if (length > capacity) length = capacity;
      p.set(this.ptr.subarray(0, length));
    }
    this.ptr = p;
    this.capacity = capacity;
    this.needToRelease = true;
    return p;
  }
  /** Original ownership transfer or clone; resultCapacity is assigned from length even on the owning path, as source. @param length - Clone length/source output value. @param resultCapacity - Output-only capacity. @returns Actual transferred/cloned pointer/null. */
  orphanOrClone(length: number, resultCapacity: [number]): Uint8Array | null {
    let p: Uint8Array;
    if (this.needToRelease) p = this.ptr;
    else if (length <= 0) return null;
    else {
      if (length > this.capacity) length = this.capacity;
      p = new Uint8Array(length);
      p.set(this.ptr.subarray(0, length));
    }
    resultCapacity[0] = length;
    this.resetToStackArray();
    return p;
  }
  /** Original protected copy preserves the complete advertised source span. @param source - Actual source. @param status - Source status. @returns Nothing. */
  protected copyFrom(source: MaybeStackArray, status: [number]): void {
    if (status[0] > 0) return;
    const p = this.resize(source.capacity, 0);
    if (p === null) {
      status[0] = 7;
      return;
    }
    p.set(source.ptr.subarray(0, this.capacity));
  }
  /** Original reset retains the internal stack array's old bytes. @returns Nothing. */
  private resetToStackArray(): void {
    this.ptr = this.stackArray;
    this.capacity = this.stackCapacity;
    this.needToRelease = false;
  }
}

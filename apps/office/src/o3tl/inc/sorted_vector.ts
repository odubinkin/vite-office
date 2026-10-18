/** @fileoverview Ports the ordered unique vector operations used by Writer from include/o3tl/sorted_vector.hxx. */

/** Primitive native value-copy specializations supported by initializer/copy operations. */
export type PrimitiveSortedVectorValue = number | bigint | boolean | string;

/** Original ordered vector: insertion is unique, while initializer-list construction retains duplicates. */
export class SortedVector<T> implements Iterable<T> {
  private m_vector: T[] = [];

  /** Binds the native comparator policy. @param compare - Strict weak ordering. @param initial - Primitive initializer list retaining duplicates. @returns Container. */
  public constructor(
    private readonly compare: (left: T, right: T) => boolean,
    initial?: T extends PrimitiveSortedVectorValue ? readonly T[] : never,
  ) {
    if (initial !== undefined) {
      this.m_vector = [...initial];
      this.m_vector.sort(
        /** Original Compare ordering through native sort; equivalent elements are retained. @param left - First value. @param right - Second value. @returns Three-way ordering. */ (
          left,
          right,
        ) => (compare(left, right) ? -1 : compare(right, left) ? 1 : 0),
      );
    }
  }
  /** Original primitive ValueT vector-copy specialization; class-value copies require their own native binding. @param source - Actual scalar vector. @returns Independent value vector. */
  public static copy<T extends PrimitiveSortedVectorValue>(
    source: SortedVector<T>,
  ): SortedVector<T> {
    const result = new SortedVector<T>(source.compare);
    result.m_vector = source.m_vector.slice();
    return result;
  }
  /** Original defaulted vector move through ordinary JS array references, without an ownership engine. @param source - Actual moved vector. @returns Destination over transferred data. */
  public static move<T>(source: SortedVector<T>): SortedVector<T> {
    const result = new SortedVector<T>(source.compare);
    result.m_vector = source.m_vector;
    source.m_vector = [];
    return result;
  }

  /** Reads the element count. @returns Count. */
  public size(): number {
    return this.m_vector.length;
  }
  /** Reports an empty container. @returns Empty flag. */
  public empty(): boolean {
    return this.m_vector.length === 0;
  }
  /** Reads an indexed value; absent represents an out-of-range native iterator. @param index - Position. @returns Value. */
  public at(index: number): T | undefined {
    return this.m_vector[index];
  }
  /** Reads the first value. @returns Value, absent when empty. */
  public front(): T | undefined {
    return this.m_vector[0];
  }
  /** Reads the last value. @returns Value, absent when empty. */
  public back(): T | undefined {
    return this.m_vector[this.m_vector.length - 1];
  }
  /** Iterates values without exposing mutable vector storage. @returns Iterator. */
  public [Symbol.iterator](): IterableIterator<T> {
    return this.m_vector.values();
  }
  /** Finds the first value not less than the key. @param value - Key. @returns Position, size at end. */
  public lower_bound(value: T): number {
    let first = 0;
    let count = this.m_vector.length;
    while (count > 0) {
      const step = Math.floor(count / 2);
      const middle = first + step;
      if (this.compare(this.m_vector[middle] as T, value)) {
        first = middle + 1;
        count -= step + 1;
      } else count = step;
    }
    return first;
  }
  /** Finds the first value greater than the key. @param value - Key. @returns Position, size at end. */
  public upper_bound(value: T): number {
    let first = 0;
    let count = this.m_vector.length;
    while (count > 0) {
      const step = Math.floor(count / 2);
      const middle = first + step;
      if (!this.compare(value, this.m_vector[middle] as T)) {
        first = middle + 1;
        count -= step + 1;
      } else count = step;
    }
    return first;
  }
  /** Resolves comparator equivalence, with minus one representing the native end iterator. @param value - Key. @returns Position or end. */
  public find(value: T): number {
    const position = this.lower_bound(value);
    return position < this.m_vector.length && !this.compare(value, this.m_vector[position] as T)
      ? position
      : -1;
  }
  /** Inserts one value using comparator equality. @param value - Value. @returns Position and insertion flag. */
  public insert(value: T): readonly [number, boolean];
  /** Inserts another sorted vector as a destination-preserving set union. @param value - Source vector. @returns Nothing. */
  public insert(value: SortedVector<T>): void;
  /** Dispatches the used native insertion overloads. @param value - Value or source vector. @returns Single-insertion result or nothing for bulk union. */
  public insert(value: T | SortedVector<T>): readonly [number, boolean] | void {
    if (value instanceof SortedVector) {
      if (this.empty()) this.m_vector = [...value.m_vector];
      else this.insert_internal(value.m_vector);
      return;
    }
    const position = this.lower_bound(value);
    if (position < this.m_vector.length && !this.compare(value, this.m_vector[position] as T))
      return [position, false];
    this.m_vector.splice(position, 0, value);
    return [position, true];
  }
  /** Removes one position without altering sort order. @param index - Position. @returns Nothing. */
  public erase_at(index: number): void {
    this.m_vector.splice(index, 1);
  }
  /** Clears values while retaining container identity. @returns Nothing. */
  public clear(): void {
    this.m_vector.length = 0;
  }
  /** Merges sorted unique sequences using native set-union identity preference. @param other - Source values. @returns Nothing. */
  private insert_internal(other: readonly T[]): void {
    const merged: T[] = [];
    let left = 0;
    let right = 0;
    while (left < this.m_vector.length && right < other.length) {
      const destination = this.m_vector[left] as T;
      const source = other[right] as T;
      if (this.compare(source, destination)) {
        merged.push(source);
        right++;
      } else {
        merged.push(destination);
        left++;
        if (!this.compare(destination, source)) right++;
      }
    }
    merged.push(...this.m_vector.slice(left), ...other.slice(right));
    this.m_vector = merged;
  }
}

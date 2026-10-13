/** @fileoverview Original mdds3.2.1 delayed_delete_vector scalar and borrowed-pointer storage, with explicit erased T{} and borrowed vector iterator syntax. */
// SPDX-FileCopyrightText: 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT

import {
  type vector_storage,
  allocate_storage,
  insert_storage,
  erase_storage,
  assign_storage,
  append_storage,
  resize_storage,
  set_storage_value,
  get_storage_value,
  emplace_storage,
  swap_storage_values,
  type ValueOperations,
} from "./vector_storage.ts";
/** Initialized native scalar families retain their existing erased zero values. */
export type DelayedVectorValue = number | boolean | bigint | string;
/** Actual object ValueT initialization extends the shared special-member witness. */
export interface DelayedValueOperations<T> extends ValueOperations<T> {
  default_construct(): T;
}
/** Borrows a native vector position; valid iterator lifetime and owner/range preconditions apply. */
export class delayed_delete_vector_iterator<T> {
  /** Borrows backing storage independently of the delayed owner, including after swap. @param storage - Native vector. @param position - Absolute base position. @param reverse - Reverse iterator. @returns Iterator. */
  public constructor(
    private readonly storage: vector_storage<T>,
    public position: number,
    private readonly reverse = false,
  ) {}
  /** Copies the native iterator. @returns Independent position borrowing the same vector. */
  public copy(): delayed_delete_vector_iterator<T> {
    return new delayed_delete_vector_iterator(this.storage, this.position, this.reverse);
  }
  /** Applies native iterator arithmetic. @param count - Signed distance. @returns This iterator. */
  public advance(count: number): this {
    this.position += this.reverse ? -count : count;
    return this;
  }
  /** Retains original native random-access std::distance for one valid borrowed vector range. @param other - Terminal iterator. @returns Signed distance. */
  public distance_to(other: delayed_delete_vector_iterator<T>): number {
    return this.reverse ? this.position - other.position : other.position - this.position;
  }
  /** Reads the referenced scalar. @returns Native dereference. */
  public get(): T {
    return this.storage.values[this.position - (this.reverse ? 1 : 0)] as T;
  }
  /** Assigns through the native reference. @param value - Scalar. @returns Nothing. */
  public set(value: T): void {
    set_storage_value(this.storage, this.position - (this.reverse ? 1 : 0), value);
  }
  /** Performs original iter_swap on two live references. @param other - Second live reference. @returns Nothing. */
  public swap(other: delayed_delete_vector_iterator<T>): void {
    swap_storage_values(
      this.storage,
      this.position - (this.reverse ? 1 : 0),
      other.storage,
      other.position - (other.reverse ? 1 : 0),
    );
  }
  /** Original mdds pairwise swap uses two value copies, distinct from std::iter_swap. @param other - Second live reference. @returns Nothing. */
  public swap_copy(other: delayed_delete_vector_iterator<T>): void {
    const operations = this.storage.operations;
    const first = operations ? operations.copy_construct(this.get()) : this.get();
    const second = operations ? operations.copy_construct(other.get()) : other.get();
    this.set(second);
    other.set(first);
    if (operations) {
      operations.destroy(second);
      operations.destroy(first);
    }
  }
  /** Compares native positions in one backing vector. @param other - Iterator. @returns Equality. */
  public equals(other: delayed_delete_vector_iterator<T>): boolean {
    return this.storage === other.storage && this.position === other.position;
  }
}
/** Original front deletion offset over an allocated vector; reserved capacity follows the native libc++ comparison target. */
export class delayed_delete_vector<T> {
  private m_vec: vector_storage<T>;
  private m_front_offset = 0;
  /** Adapts default/count/fill/range/copy constructors with required erased native T{}. @param defaultValue - Native value_type{}. @param initial - Count, scalar range, first iterator or copy source. @param valueOrLast - Explicit fill value or terminal iterator. @param operations - Actual object ValueT members. @returns Original storage owner. */
  public constructor(
    private readonly defaultValue: T,
    initial:
      number | readonly T[] | delayed_delete_vector<T> | delayed_delete_vector_iterator<T> = 0,
    valueOrLast?: T | delayed_delete_vector_iterator<T>,
    operations?: DelayedValueOperations<T>,
  ) {
    this.m_vec = { values: [], size: 0, operations };
    if (initial instanceof delayed_delete_vector) {
      this.m_vec.operations = initial.m_vec.operations;
      assign_storage(
        this.m_vec,
        initial.m_vec.values.slice(0, initial.m_vec.size) as T[],
        this.aligned_capacity(initial.m_vec.size),
      );
      this.m_front_offset = initial.m_front_offset;
    } else if (typeof initial === "number") {
      if (valueOrLast === undefined) {
        resize_storage(
          this.m_vec,
          initial,
          /** Native default value construction. @returns Value. */ () =>
            operations ? operations.default_construct() : defaultValue,
          this.aligned_capacity(initial),
        );
      } else {
        // Array.fill may canonicalize NaN payloads; native
        // scalar copies must retain encoded formula error values.
        const values = Array<T | undefined>(initial).fill(undefined);
        for (let i = 0; i < initial; ++i) values[i] = valueOrLast as T;
        assign_storage(this.m_vec, values as T[], this.aligned_capacity(initial));
      }
    } else
      assign_storage(
        this.m_vec,
        this.range(initial, valueOrLast as delayed_delete_vector_iterator<T>),
        this.aligned_capacity(
          initial instanceof delayed_delete_vector_iterator
            ? initial.distance_to(valueOrLast as delayed_delete_vector_iterator<T>)
            : initial.length,
        ),
      );
  }
  /** Original underlying vector destructor includes hidden front objects. @returns Nothing. */
  public dispose(): void {
    erase_storage(this.m_vec, 0, this.m_vec.size);
  }

  /** Adapts implicit native copy assignment; existing destination capacity is retained when sufficient. @param other - Source. @returns This owner. */
  public copy_assign(other: delayed_delete_vector<T>): this {
    if (other === this) return this;
    const values = other.m_vec.values.slice(0, other.m_vec.size) as T[];
    this.assign_vector(values);
    this.m_front_offset = other.m_front_offset;
    return this;
  }
  /** Returns native begin plus the delayed offset. @returns Borrowed iterator. */
  public begin(): delayed_delete_vector_iterator<T> {
    return new delayed_delete_vector_iterator(this.m_vec, this.m_front_offset);
  }
  /** Returns underlying vector end. @returns Borrowed iterator. */
  public end(): delayed_delete_vector_iterator<T> {
    return new delayed_delete_vector_iterator(this.m_vec, this.m_vec.size);
  }
  /** Returns underlying reverse begin. @returns Borrowed reverse iterator. */
  public rbegin(): delayed_delete_vector_iterator<T> {
    return new delayed_delete_vector_iterator(this.m_vec, this.m_vec.size, true);
  }
  /** Returns reverse end minus the delayed offset. @returns Borrowed reverse iterator. */
  public rend(): delayed_delete_vector_iterator<T> {
    return new delayed_delete_vector_iterator(this.m_vec, this.m_front_offset, true);
  }
  /** Adapts operator[] without adding a logical range check. @param position - Logical position. @returns Native scalar. */
  public get(position: number): T {
    return this.m_vec.values[position + this.m_front_offset] as T;
  }
  /** Extracts a native value result rather than a borrowed operator[] reference. @param position - Logical position. @returns Independent value. */
  public get_value(position: number): T;
  /** Assigns through an actual output reference. @param position - Logical position. @param output - Target reference. @returns Nothing. */
  public get_value(position: number, output: [T]): void;
  /** Binds native value extraction overloads over existing storage. @param position - Logical position. @param output - Optional reference. @returns Value or nothing. */
  public get_value(position: number, output?: [T]): T | void {
    const index = position + this.m_front_offset;
    if (output === undefined) return get_storage_value(this.m_vec, index);
    get_storage_value(this.m_vec, index, output);
  }
  /** Adapts mutable operator[]. @param position - Logical position. @param value - Scalar. @returns Nothing. */
  public set(position: number, value: T): void {
    set_storage_value(this.m_vec, position + this.m_front_offset, value);
  }
  /** Performs original underlying vector.at check after adding the offset. @param position - Logical position. @returns Native scalar. */
  public at(position: number): T {
    const actual = position + this.m_front_offset;
    if (actual < 0 || actual >= this.m_vec.size) throw new RangeError("vector");
    return this.m_vec.values[actual] as T;
  }
  /** Appends without clearing removed front entries. @param value - Scalar. @returns Nothing. */
  public push_back(value: T): void {
    append_storage(this.m_vec, value, false, this.aligned_capacity(this.m_vec.size + 1));
  }
  /** Original rvalue push_back overload. @param value - Actual moved source. @returns Nothing. */
  public push_back_move(value: T): void {
    append_storage(this.m_vec, value, true, this.aligned_capacity(this.m_vec.size + 1));
  }
  /** Original forwarded constructor pack, represented by its actual ValueT constructor call. @param construct - Erased native constructor arguments. @returns Nothing. */
  public emplace_back_construct(construct: () => T): void {
    emplace_storage(this.m_vec, construct, this.aligned_capacity(this.m_vec.size + 1));
  }
  /** Adapts scalar perfect forwarding after T construction at the call boundary. @param value - Constructed scalar. @returns Nothing. */
  public emplace_back(value: T): void {
    this.push_back(value);
  }
  /** Swaps only m_vec, preserving original unexchanged front offsets. @param other - Owner. @returns Nothing. */
  public swap(other: delayed_delete_vector<T>): void {
    [this.m_vec, other.m_vec] = [other.m_vec, this.m_vec];
  }
  /** Inserts scalar or borrowed input range into the underlying vector, without clearing front entries. @param position - Absolute iterator. @param valueOrFirst - Scalar, range or first iterator. @param last - Input range end. @returns Scalar insertion iterator, or void for range overload. */
  public insert(
    position: delayed_delete_vector_iterator<T>,
    valueOrFirst: T | readonly T[] | delayed_delete_vector_iterator<T>,
    last?: delayed_delete_vector_iterator<T>,
  ): delayed_delete_vector_iterator<T> | undefined {
    const isRange =
      Array.isArray(valueOrFirst) || valueOrFirst instanceof delayed_delete_vector_iterator;
    const values = isRange
      ? this.range(
          valueOrFirst as readonly T[] | delayed_delete_vector_iterator<T>,
          last as delayed_delete_vector_iterator<T>,
        )
      : [valueOrFirst as T];
    const index = position.position;
    insert_storage(
      this.m_vec,
      index,
      values,
      this.aligned_capacity(this.m_vec.size + values.length),
    );
    if (!isRange) return new delayed_delete_vector_iterator(this.m_vec, index);
  }
  /** Clears delayed entries then resizes native constructed storage. @param count - New logical size. @returns Nothing. */
  public resize(count: number): void {
    this.clear_removed();
    if (typeof this.defaultValue === "boolean" && count > this.capacity())
      this.allocate(this.aligned_capacity(count));
    const operations = this.m_vec.operations as DelayedValueOperations<T> | undefined;
    resize_storage(
      this.m_vec,
      count,
      /** Native resize default constructor. @returns Value. */ () =>
        operations ? operations.default_construct() : this.defaultValue,
      this.aligned_capacity(count),
    );
  }
  /** Delays only single erase at begin; range erase always calls underlying vector.erase. @param first - Erase position. @param last - Optional half-open end. @returns Next absolute position. */
  public erase(
    first: delayed_delete_vector_iterator<T>,
    last?: delayed_delete_vector_iterator<T>,
  ): delayed_delete_vector_iterator<T> {
    if (last === undefined && first.position === this.m_front_offset) {
      ++this.m_front_offset;
      return this.begin();
    }
    const index = first.position;
    const count = last === undefined ? 1 : last.position - index;
    erase_storage(this.m_vec, index, count);
    return new delayed_delete_vector_iterator(this.m_vec, index);
  }
  /** Returns reserved backing slots, including delayed entries. @returns Capacity. */
  public capacity(): number {
    return this.m_vec.values.length;
  }
  /** Clears front entries and asks the native target to shrink capacity to constructed size. @returns Nothing. */
  public shrink_to_fit(): void {
    this.clear_removed();
    if (!this.m_vec.operations || this.capacity() !== this.m_vec.size)
      this.allocate(this.aligned_capacity(this.m_vec.size));
  }
  /** Clears removed entries even when requested capacity already fits. @param new_cap - Minimum capacity. @returns Nothing. */
  public reserve(new_cap: number): void {
    this.clear_removed();
    if (new_cap > this.capacity()) this.allocate(this.aligned_capacity(new_cap));
  }
  /** Retains original subtraction of delayed front entries. @returns Logical size. */
  public size(): number {
    return this.m_vec.size - this.m_front_offset;
  }
  /** Clears removed entries then assigns borrowed values. @param first - Scalar range or first iterator. @param last - Range end. @returns Nothing. */
  public assign(
    first: readonly T[] | delayed_delete_vector_iterator<T>,
    last?: delayed_delete_vector_iterator<T>,
  ): void {
    this.clear_removed();
    this.assign_vector(this.range(first, last as delayed_delete_vector_iterator<T>));
  }
  /** Adapts a pointer to underlying vector.data plus offset, without copying values. @returns Borrowed mutable pointer position; native vector<bool>::data is unavailable. */
  public data(): delayed_delete_vector_iterator<T> {
    return this.begin();
  }
  /** Compares exactly the original four-iterator std::equal logical ranges. @param other - Owner. @returns Equality. */
  public equals(other: delayed_delete_vector<T>): boolean {
    if (this.size() !== other.size()) return false;
    const operations = this.m_vec.operations;
    for (let i = 0; i < this.size(); ++i) {
      const equal = operations
        ? (operations.equal as NonNullable<ValueOperations<T>["equal"]>)(this.get(i), other.get(i))
        : this.get(i) === other.get(i);
      if (!equal) return false;
    }
    return true;
  }
  /** Physically erases hidden front entries and resets the delayed offset. @returns Nothing. */
  private clear_removed(): void {
    this.erase(new delayed_delete_vector_iterator(this.m_vec, 0), this.begin());
    this.m_front_offset = 0;
  }
  /** Materializes a defined external input range; native self-range invalidation preconditions remain. @param first - Range or begin. @param last - Range end. @returns Scalar values. */
  private range(
    first: readonly T[] | delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): T[] {
    if (!(first instanceof delayed_delete_vector_iterator)) return [...first];
    const result: T[] = [];
    for (const it = first.copy(); !it.equals(last); it.advance(1)) result.push(it.get());
    return result;
  }
  /** Implements selected libc++ vector<bool> word capacity; other native allocators are unverified. @param count - Slots. @returns Allocated slots. */
  private aligned_capacity(count: number): number {
    return typeof this.defaultValue === "boolean" ? Math.ceil(count / 64) * 64 : count;
  }
  /** Allocates actual backing slots retaining constructed scalars. @param capacity - Reserved slots. @returns Nothing. */
  private allocate(capacity: number): void {
    allocate_storage(this.m_vec, capacity);
  }
  /** Assigns the underlying vector independently of front-offset management. @param values - Input scalars. @returns Nothing. */
  private assign_vector(values: readonly T[]): void {
    assign_storage(this.m_vec, values, this.aligned_capacity(values.length));
  }
}

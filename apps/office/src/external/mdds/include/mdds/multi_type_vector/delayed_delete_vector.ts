/** @fileoverview Original mdds3.2.1 delayed_delete_vector primitive storage, with explicit erased T{} and borrowed vector iterator syntax. */
// SPDX-FileCopyrightText: 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT

/** Initialized unmanaged native scalar families; object copy/destruction policies are not implemented. */
export type DelayedVectorValue = number | boolean | bigint | string;
/** Actual reserved slots and constructed prefix of the adapted native vector. */
interface vector_storage<T extends DelayedVectorValue> {
  values: (T | undefined)[];
  size: number;
}
/** Borrows a native vector position; valid iterator lifetime and owner/range preconditions apply. */
export class delayed_delete_vector_iterator<T extends DelayedVectorValue> {
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
    this.storage.values[this.position - (this.reverse ? 1 : 0)] = value;
  }
  /** Compares native positions in one backing vector. @param other - Iterator. @returns Equality. */
  public equals(other: delayed_delete_vector_iterator<T>): boolean {
    return this.storage === other.storage && this.position === other.position;
  }
}
/** Original front deletion offset over an allocated vector; reserved capacity follows the native libc++ comparison target. */
export class delayed_delete_vector<T extends DelayedVectorValue> {
  private m_vec: vector_storage<T>;
  private m_front_offset = 0;
  /** Adapts default/count/fill/range/copy constructors with required erased native T{}. @param defaultValue - Native value_type{}. @param initial - Count, scalar range, first iterator or copy source. @param valueOrLast - Fill value or terminal iterator. @returns Original storage owner. */
  public constructor(
    private readonly defaultValue: T,
    initial:
      number | readonly T[] | delayed_delete_vector<T> | delayed_delete_vector_iterator<T> = 0,
    valueOrLast: T | delayed_delete_vector_iterator<T> = defaultValue,
  ) {
    let values: T[];
    if (initial instanceof delayed_delete_vector) {
      values = initial.m_vec.values.slice(0, initial.m_vec.size) as T[];
      this.m_front_offset = initial.m_front_offset;
    } else if (typeof initial === "number") values = Array<T>(initial).fill(valueOrLast as T);
    else values = this.range(initial, valueOrLast as delayed_delete_vector_iterator<T>);
    this.m_vec = { values: [], size: values.length };
    this.m_vec.values = Array<T | undefined>(this.aligned_capacity(values.length));
    for (let i = 0; i < values.length; ++i) this.m_vec.values[i] = values[i];
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
  /** Adapts mutable operator[]. @param position - Logical position. @param value - Scalar. @returns Nothing. */
  public set(position: number, value: T): void {
    this.m_vec.values[position + this.m_front_offset] = value;
  }
  /** Performs original underlying vector.at check after adding the offset. @param position - Logical position. @returns Native scalar. */
  public at(position: number): T {
    const actual = position + this.m_front_offset;
    if (actual < 0 || actual >= this.m_vec.size) throw new RangeError("vector");
    return this.m_vec.values[actual] as T;
  }
  /** Appends without clearing removed front entries. @param value - Scalar. @returns Nothing. */
  public push_back(value: T): void {
    this.grow(this.m_vec.size + 1);
    this.m_vec.values[this.m_vec.size++] = value;
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
    this.grow(this.m_vec.size + values.length);
    for (let i = this.m_vec.size - 1; i >= index; --i)
      this.m_vec.values[i + values.length] = this.m_vec.values[i];
    for (let i = 0; i < values.length; ++i) this.m_vec.values[index + i] = values[i];
    this.m_vec.size += values.length;
    if (!isRange) return new delayed_delete_vector_iterator(this.m_vec, index);
  }
  /** Clears delayed entries then resizes native constructed storage. @param count - New logical size. @returns Nothing. */
  public resize(count: number): void {
    this.clear_removed();
    if (typeof this.defaultValue === "boolean") {
      if (count > this.capacity()) this.allocate(this.aligned_capacity(count));
    } else this.grow(count);
    for (let i = this.m_vec.size; i < count; ++i) this.m_vec.values[i] = this.defaultValue;
    for (let i = count; i < this.m_vec.size; ++i) this.m_vec.values[i] = undefined;
    this.m_vec.size = count;
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
    for (let i = index; i < this.m_vec.size - count; ++i)
      this.m_vec.values[i] = this.m_vec.values[i + count];
    for (let i = this.m_vec.size - count; i < this.m_vec.size; ++i)
      this.m_vec.values[i] = undefined;
    this.m_vec.size -= count;
    return new delayed_delete_vector_iterator(this.m_vec, index);
  }
  /** Returns reserved backing slots, including delayed entries. @returns Capacity. */
  public capacity(): number {
    return this.m_vec.values.length;
  }
  /** Clears front entries and asks the native target to shrink capacity to constructed size. @returns Nothing. */
  public shrink_to_fit(): void {
    this.clear_removed();
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
    for (let i = 0; i < this.size(); ++i) if (this.get(i) !== other.get(i)) return false;
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
    const values = Array<T | undefined>(capacity);
    for (let i = 0; i < this.m_vec.size; ++i) values[i] = this.m_vec.values[i];
    this.m_vec.values = values;
  }
  /** Uses the selected native geometric growth rule for primitive vectors. @param count - Required constructed size. @returns Nothing. */
  private grow(count: number): void {
    if (count > this.capacity())
      this.allocate(this.aligned_capacity(Math.max(count, this.capacity() * 2)));
  }
  /** Assigns the underlying vector independently of front-offset management. @param values - Input scalars. @returns Nothing. */
  private assign_vector(values: readonly T[]): void {
    if (values.length > this.capacity()) this.allocate(this.aligned_capacity(values.length));
    for (let i = 0; i < values.length; ++i) this.m_vec.values[i] = values[i];
    for (let i = values.length; i < this.m_vec.size; ++i) this.m_vec.values[i] = undefined;
    this.m_vec.size = values.length;
  }
}

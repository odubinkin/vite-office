/** @fileoverview Shared erased STL reserved-slot mechanics, extracted from the actual delayed vector and reused by original SoA arrays. */
/** Actual allocated slots and constructed prefix; invalid native lifetimes/ranges remain caller preconditions. */
export interface vector_storage<T> {
  values: (T | undefined)[];
  size: number;
  operations?: ValueOperations<T> | undefined;
}
/** Erased native ValueT special members; borrowed scalar/pointer stores need no witness. */
export interface ValueOperations<T> {
  copy_construct(value: T): T;
  move_construct(value: T): T;
  copy_assign(target: T, source: T): void;
  move_assign(target: T, source: T): void;
  destroy(value: T): void;
  equal?(left: T, right: T): boolean;
  move_noexcept: boolean;
}
/** Original move-if-noexcept relocation. @param operations - ValueT members. @param value - Live source. @returns Constructed value. */
function relocate<T>(operations: ValueOperations<T>, value: T): T {
  return operations.move_noexcept
    ? operations.move_construct(value)
    : operations.copy_construct(value);
}
/** Releases the constructed suffix in native reverse destruction order. @param storage - State. @param first - First destroyed position. @returns Nothing. */
function destroy_suffix<T>(storage: vector_storage<T>, first: number): void {
  for (let i = storage.size - 1; i >= first; --i) {
    storage.operations?.destroy(storage.values[i] as T);
    storage.values[i] = undefined;
  }
}
/** Allocates reserved slots with native move-if-noexcept value relocation. @param storage - State. @param capacity - Slots. @returns Nothing. */
export function allocate_storage<T>(storage: vector_storage<T>, capacity: number): void {
  const values = Array<T | undefined>(capacity);
  const operations = storage.operations;
  for (let i = 0; i < storage.size; ++i)
    values[i] = operations ? relocate(operations, storage.values[i] as T) : storage.values[i];
  if (operations) for (let i = 0; i < storage.size; ++i) operations.destroy(storage.values[i] as T);
  storage.values = values;
}
/** Retains selected native geometric growth and bool-word capacity witness. @param storage - State. @param count - Required size. @param aligned_count - Native minimum allocation. @returns Nothing. */
export function grow_storage<T>(
  storage: vector_storage<T>,
  count: number,
  aligned_count = count,
): void {
  if (count > storage.values.length)
    allocate_storage(storage, Math.max(aligned_count, storage.values.length * 2));
}
/** Original underlying vector range insertion. @param storage - State. @param index - Absolute offset. @param values - Valid external range. @param aligned_count - Native allocation witness. @returns Nothing. */
export function insert_storage<T>(
  storage: vector_storage<T>,
  index: number,
  values: readonly T[],
  aligned_count = storage.size + values.length,
): void {
  const operations = storage.operations;
  const count = values.length;
  if (!operations) {
    grow_storage(storage, storage.size + count, aligned_count);
    for (let i = storage.size - 1; i >= index; --i) storage.values[i + count] = storage.values[i];
    for (let i = 0; i < count; ++i) storage.values[index + i] = values[i];
  } else if (count > 0) {
    const old_size = storage.size;
    if (old_size + count > storage.values.length) {
      const next = Array<T | undefined>(Math.max(aligned_count, storage.values.length * 2));
      for (let i = 0; i < count; ++i) next[index + i] = operations.copy_construct(values[i] as T);
      for (let i = index; i < old_size; ++i)
        next[i + count] = relocate(operations, storage.values[i] as T);
      for (let i = index; i < old_size; ++i) operations.destroy(storage.values[i] as T);
      for (let i = 0; i < index; ++i) next[i] = relocate(operations, storage.values[i] as T);
      for (let i = 0; i < index; ++i) operations.destroy(storage.values[i] as T);
      storage.values = next;
    } else {
      const tail = old_size - index;
      if (count <= tail) {
        for (let i = old_size - count; i < old_size; ++i)
          storage.values[i + count] = operations.move_construct(storage.values[i] as T);
        for (let i = old_size - count - 1; i >= index; --i)
          operations.move_assign(storage.values[i + count] as T, storage.values[i] as T);
        for (let i = 0; i < count; ++i)
          operations.copy_assign(storage.values[index + i] as T, values[i] as T);
      } else {
        for (let i = tail; i < count; ++i)
          storage.values[index + i] = operations.copy_construct(values[i] as T);
        for (let i = index; i < old_size; ++i)
          storage.values[i + count] = operations.move_construct(storage.values[i] as T);
        for (let i = 0; i < tail; ++i)
          operations.copy_assign(storage.values[index + i] as T, values[i] as T);
      }
    }
  }
  storage.size += count;
}
/** Original underlying vector range erase. @param storage - State. @param index - Absolute offset. @param count - Erase length. @returns Nothing. */
export function erase_storage<T>(storage: vector_storage<T>, index: number, count: number): void {
  if (count === 0) return;
  for (let i = index; i < storage.size - count; ++i) {
    if (storage.operations)
      storage.operations.move_assign(storage.values[i] as T, storage.values[i + count] as T);
    else storage.values[i] = storage.values[i + count];
  }
  destroy_suffix(storage, storage.size - count);
  storage.size -= count;
}
/** Original range assignment retains sufficient capacity. @param storage - State. @param values - External range. @param aligned_count - Native capacity witness. @returns Nothing. */
export function assign_storage<T>(
  storage: vector_storage<T>,
  values: readonly T[],
  aligned_count = values.length,
): void {
  const operations = storage.operations;
  if (values.length > storage.values.length) {
    destroy_suffix(storage, 0);
    storage.size = 0;
    storage.values = Array<T | undefined>(aligned_count);
  }
  const retained = Math.min(storage.size, values.length);
  for (let i = 0; i < retained; ++i) {
    if (operations) operations.copy_assign(storage.values[i] as T, values[i] as T);
    else storage.values[i] = values[i];
  }
  for (let i = retained; i < values.length; ++i)
    storage.values[i] = operations ? operations.copy_construct(values[i] as T) : values[i];
  destroy_suffix(storage, values.length);
  storage.size = values.length;
}
/** Native reference assignment for owned values or borrowed scalars/pointers. @param storage - State. @param index - Live position. @param value - Source reference. @returns Nothing. */
export function set_storage_value<T>(storage: vector_storage<T>, index: number, value: T): void {
  if (storage.operations) storage.operations.copy_assign(storage.values[index] as T, value);
  else storage.values[index] = value;
}
/** Constructs appended value before relocating aliased sources. @param storage - State. @param value - Live source. @param move - Rvalue overload. @param aligned_count - Native allocation witness. @returns Nothing. */
export function append_storage<T>(
  storage: vector_storage<T>,
  value: T,
  move: boolean,
  aligned_count = storage.size + 1,
): void {
  const operations = storage.operations;
  const next = operations
    ? move
      ? operations.move_construct(value)
      : operations.copy_construct(value)
    : value;
  grow_storage(storage, storage.size + 1, aligned_count);
  storage.values[storage.size++] = next;
}
/** Native default initialization on growth and reverse destruction on shrink. @param storage - State. @param count - New size. @param construct - Erased actual value_type default constructor. @param aligned_count - Native allocation witness. @returns Nothing. */
export function resize_storage<T>(
  storage: vector_storage<T>,
  count: number,
  construct: () => T,
  aligned_count: number,
): void {
  if (count < storage.size) destroy_suffix(storage, count);
  else {
    const pending: T[] = [];
    for (let i = storage.size; i < count; ++i) pending.push(construct());
    grow_storage(storage, count, aligned_count);
    for (let i = 0; i < pending.length; ++i) storage.values[storage.size + i] = pending[i];
  }
  storage.size = count;
}
/** Original iter_swap with actual ValueT move temporary; scalar/pointer path retains borrowed identity. @param left - First state. @param first - First position. @param right - Second state. @param second - Second position. @returns Nothing. */
export function swap_storage_values<T>(
  left: vector_storage<T>,
  first: number,
  right: vector_storage<T>,
  second: number,
): void {
  const operations = left.operations;
  if (operations) {
    const temporary = operations.move_construct(left.values[first] as T);
    operations.move_assign(left.values[first] as T, right.values[second] as T);
    operations.move_assign(right.values[second] as T, temporary);
    operations.destroy(temporary);
  } else [left.values[first], right.values[second]] = [right.values[second], left.values[first]];
}
/** Normal std::vector syntax witness for values and borrowed pointers; no delayed deletion or mdds block/container policy. */
export class std_vector<T> {
  private m_storage: vector_storage<T> = { values: [], size: 0 };
  /** Copies a native vector or constructed external range. @param values - Source. @param operations - Actual ValueT members. @returns Vector. */
  public constructor(values: readonly T[] | std_vector<T> = [], operations?: ValueOperations<T>) {
    if (values instanceof std_vector) {
      this.m_storage.operations = values.m_storage.operations;
      assign_storage(this.m_storage, values.snapshot());
    } else {
      this.m_storage.operations = operations;
      assign_storage(this.m_storage, values);
    }
  }
  /** Original move constructor steals storage. @param source - Live vector. @returns Vector. */
  public static move<T>(source: std_vector<T>): std_vector<T> {
    const result = new std_vector<T>([], source.m_storage.operations);
    result.swap(source);
    return result;
  }
  /** Native copy assignment with self guard. @param source - Live source. @returns This vector. */
  public copy_assign(source: std_vector<T>): this {
    if (source !== this) this.assign(source.snapshot());
    return this;
  }
  /** Native move assignment releases destination and steals source storage. @param source - Live source. @returns This vector. */
  public move_assign(source: std_vector<T>): this {
    this.dispose();
    this.m_storage = source.m_storage;
    source.m_storage = { values: [], size: 0, operations: this.m_storage.operations };
    return this;
  }
  /** Original destructor releases constructed objects. @returns Nothing. */
  public dispose(): void {
    this.clear();
    this.m_storage.values = [];
  }
  /** Original range assignment. @param values - Valid external values. @returns Nothing. */
  public assign(values: readonly T[]): void {
    assign_storage(this.m_storage, values);
  }
  /** Borrows real reserved storage for the shared iterator syntax. @returns Storage. */
  public store(): vector_storage<T> {
    return this.m_storage;
  }
  /** Reads native size. @returns Constructed slots. */
  public size(): number {
    return this.m_storage.size;
  }
  /** Reads actual allocated slots of the selected native target. @returns Capacity. */
  public capacity(): number {
    return this.m_storage.values.length;
  }
  /** Native operator[] on a valid constructed position. @param index - Position. @returns Value. */
  public get(index: number): T {
    return this.m_storage.values[index] as T;
  }
  /** Native reference assignment. @param index - Position. @param value - Value. @returns Nothing. */
  public set(index: number, value: T): void {
    set_storage_value(this.m_storage, index, value);
  }
  /** Copies original vector constructed range. @returns Values. */
  public snapshot(): T[] {
    return this.m_storage.values.slice(0, this.m_storage.size) as T[];
  }
  /** Real reserve without changing constructed length. @param count - Minimum slots. @returns Nothing. */
  public reserve(count: number): void {
    if (count > this.capacity()) allocate_storage(this.m_storage, count);
  }
  /** Original native insertion on a valid external range. @param index - Position. @param values - Values. @returns Nothing. */
  public insert(index: number, values: readonly T[]): void {
    insert_storage(this.m_storage, index, values);
  }
  /** Native append. @param value - Value. @returns Nothing. */
  public push_back(value: T): void {
    this.append(value, false);
  }
  /** Original rvalue push_back overload. @param value - Live rvalue source. @returns Nothing. */
  public push_back_move(value: T): void {
    this.append(value, true);
  }
  /** Constructs incoming value before relocating aliased sources. @param value - Live source. @param move - Rvalue overload. @returns Nothing. */
  private append(value: T, move: boolean): void {
    append_storage(this.m_storage, value, move);
  }
  /** Native pop on a nonempty vector. @returns Nothing. */
  public pop_back(): void {
    destroy_suffix(this.m_storage, this.m_storage.size - 1);
    --this.m_storage.size;
  }
  /** Original valid range erase. @param index - Position. @param count - Length. @returns Nothing. */
  public erase(index: number, count: number): void {
    erase_storage(this.m_storage, index, count);
  }
  /** Native clear retains allocation and releases constructed values. @returns Nothing. */
  public clear(): void {
    erase_storage(this.m_storage, 0, this.m_storage.size);
  }
  /** Native vector swap transfers real backing storage, retaining iterator storage identities. @param other - Vector. @returns Nothing. */
  public swap(other: std_vector<T>): void {
    [this.m_storage, other.m_storage] = [other.m_storage, this.m_storage];
  }
  /** Original vector equality for unmanaged values/pointer aliases. @param other - Vector. @returns Equality. */
  public equals(other: std_vector<T>): boolean {
    if (this.size() !== other.size()) return false;
    const operations = this.m_storage.operations;
    for (let i = 0; i < this.size(); ++i) {
      const equal = operations
        ? (operations.equal as NonNullable<ValueOperations<T>["equal"]>)(this.get(i), other.get(i))
        : this.get(i) === other.get(i);
      if (!equal) return false;
    }
    return true;
  }
}
/** Erased standard lower_bound iterator syntax over a valid sorted borrowed vector range. @param values - Real vector. @param first - Begin index. @param last - End index. @param value - Search value. @param less - Original comparison witness. @returns First element not less than value. */
export function lower_bound<T, V>(
  values: std_vector<T>,
  first: number,
  last: number,
  value: V,
  less: (element: T, value: V) => boolean,
): number {
  let count = last - first;
  while (count > 0) {
    const step = Math.floor(count / 2);
    const it = first + step;
    if (less(values.get(it), value)) {
      first = it + 1;
      count -= step + 1;
    } else count = step;
  }
  return first;
}

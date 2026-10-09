/** @fileoverview Shared erased STL reserved-slot mechanics, extracted from the actual delayed vector and reused by original SoA arrays. */
/** Actual allocated slots and constructed prefix; invalid native lifetimes/ranges remain caller preconditions. */
export interface vector_storage<T> {
  values: (T | undefined)[];
  size: number;
}
/** Allocates real reserved slots and copies constructed values. @param storage - Borrowed state. @param capacity - Slots. @returns Nothing. */
export function allocate_storage<T>(storage: vector_storage<T>, capacity: number): void {
  const values = Array<T | undefined>(capacity);
  for (let i = 0; i < storage.size; ++i) values[i] = storage.values[i];
  storage.values = values;
}
/** Retains selected native geometric growth and explicit bool-word capacity witness. @param storage - State. @param count - Required size. @param aligned_count - Native minimum allocation. @returns Nothing. */
export function grow_storage<T>(
  storage: vector_storage<T>,
  count: number,
  aligned_count = count,
): void {
  if (count > storage.values.length)
    allocate_storage(storage, Math.max(aligned_count, storage.values.length * 2));
}
/** Original underlying vector range insertion before any delayed-offset responsibility. @param storage - State. @param index - Absolute offset. @param values - Valid external range. @param aligned_count - Native allocation witness. @returns Nothing. */
export function insert_storage<T>(
  storage: vector_storage<T>,
  index: number,
  values: readonly T[],
  aligned_count = storage.size + values.length,
): void {
  grow_storage(storage, storage.size + values.length, aligned_count);
  for (let i = storage.size - 1; i >= index; --i)
    storage.values[i + values.length] = storage.values[i];
  for (let i = 0; i < values.length; ++i) storage.values[index + i] = values[i];
  storage.size += values.length;
}
/** Original underlying vector range erase without delayed-offset management. @param storage - State. @param index - Absolute offset. @param count - Erase length. @returns Nothing. */
export function erase_storage<T>(storage: vector_storage<T>, index: number, count: number): void {
  for (let i = index; i < storage.size - count; ++i) storage.values[i] = storage.values[i + count];
  for (let i = storage.size - count; i < storage.size; ++i) storage.values[i] = undefined;
  storage.size -= count;
}
/** Original underlying vector assignment retains sufficient allocated capacity. @param storage - State. @param values - External range. @param aligned_count - Native capacity witness. @returns Nothing. */
export function assign_storage<T>(
  storage: vector_storage<T>,
  values: readonly T[],
  aligned_count = values.length,
): void {
  if (values.length > storage.values.length) allocate_storage(storage, aligned_count);
  for (let i = 0; i < values.length; ++i) storage.values[i] = values[i];
  for (let i = values.length; i < storage.size; ++i) storage.values[i] = undefined;
  storage.size = values.length;
}
/** Normal std::vector syntax witness for unmanaged numbers and borrowed pointers; no delayed deletion or mdds block/container policy. */
export class std_vector<T> {
  private m_storage: vector_storage<T> = { values: [], size: 0 };
  /** Copies a native constructed external range. @param values - Values. @returns Vector. */
  public constructor(values: readonly T[] = []) {
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
    this.m_storage.values[index] = value;
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
    grow_storage(this.m_storage, this.m_storage.size + 1);
    this.m_storage.values[this.m_storage.size++] = value;
  }
  /** Native pop on a nonempty vector. @returns Nothing. */
  public pop_back(): void {
    this.m_storage.values[--this.m_storage.size] = undefined;
  }
  /** Original valid range erase. @param index - Position. @param count - Length. @returns Nothing. */
  public erase(index: number, count: number): void {
    erase_storage(this.m_storage, index, count);
  }
  /** Native clear retains allocation and releases only stored unmanaged references. @returns Nothing. */
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
    for (let i = 0; i < this.size(); ++i) if (this.get(i) !== other.get(i)) return false;
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

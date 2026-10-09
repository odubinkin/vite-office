/** @fileoverview Original mdds3.2.1 unmanaged scalar element-block owners, with explicit erased CRTP/type specializations. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import {
  delayed_delete_vector,
  delayed_delete_vector_iterator,
  type DelayedVectorValue,
} from "./delayed_delete_vector.ts";
import { general_error } from "../global.ts";

/** Original block discriminator type. */
export type element_t = number;
export const element_type_empty = -1;
export const element_type_reserved_start = 0;
export const element_type_reserved_end = 49;
export const element_type_user_start = 50;
/** Original scalar loop-unrolling and SIMD values. */
export enum lu_factor_t {
  none = 0,
  lu4 = 4,
  lu8 = 8,
  lu16 = 16,
  lu32 = 32,
  sse2_x64 = 256,
  sse2_x64_lu4 = 260,
  sse2_x64_lu8 = 264,
  sse2_x64_lu16 = 272,
  avx2_x64 = 512,
  avx2_x64_lu4 = 516,
  avx2_x64_lu8 = 520,
}
/** Original method trace discriminators. */
export enum trace_method_t {
  unspecified = 0,
  accessor = 1,
  accessor_with_pos_hint = 257,
  mutator = 2,
  mutator_with_pos_hint = 258,
  constructor = 3,
  destructor = 4,
}
/** Original trace-property defaults; native pointers use nullable borrowed objects. */
export class trace_method_properties_t {
  public type = trace_method_t.unspecified;
  public instance: object | null = null;
  public function_name: string | null = null;
  public function_args = "";
  public filepath: string | null = null;
  public line_number = -1;
}
/** Original element-block diagnostic, adapted to the JavaScript exception base. */
export class element_block_error extends general_error {}
/** Original non-template discriminator owner; the helper retains native friend access. */
export class base_element_block {
  protected readonly type: element_t;
  /** Initializes original block type. @param type - Discriminator. @returns Common owner. */
  protected constructor(type: element_t) {
    this.type = type;
  }
}
/** Reads the native friend-owned discriminator. @param block - Owner. @returns Original type. */
export function get_block_type(block: base_element_block): element_t {
  return (block as unknown as { type: element_t }).type;
}
/** Native unmanaged constructor argument families, including implicit copy. */
export type BlockInitial<T extends DelayedVectorValue> =
  number | readonly T[] | delayed_delete_vector_iterator<T> | element_block<T>;
/** Erased native CRTP/type/build witnesses used by inherited static operations. */
export interface BlockConstructor<T extends DelayedVectorValue> {
  new (
    initial?: BlockInitial<T>,
    valueOrLast?: T | delayed_delete_vector_iterator<T>,
  ): element_block<T>;
  readonly block_type: element_t;
  readonly debug: boolean;
  get(block: base_element_block): element_block<T>;
  convert(value: T): T;
}
/** Original borrowed mutable/const range shape; JavaScript references adapt const qualification. */
export class base_range_type<T extends DelayedVectorValue> {
  /** Borrows the original owner; every begin/end reads its current storage. @param type - Native specialization. @param block - Common owner. @returns Range. */
  public constructor(
    private readonly type: BlockConstructor<T>,
    private readonly block: base_element_block,
  ) {}
  /** Reads current native begin. @returns Borrowed iterator. */
  public begin(): delayed_delete_vector_iterator<T> {
    return this.type.get(this.block).store().begin();
  }
  /** Reads current native end. @returns Borrowed iterator. */
  public end(): delayed_delete_vector_iterator<T> {
    return this.type.get(this.block).store().end();
  }
}
/** Original shared unmanaged scalar operation owner over actual delayed_delete_vector. */
export class element_block<T extends DelayedVectorValue> extends base_element_block {
  protected m_array: delayed_delete_vector<T>;
  /** Initializes storage through genuine count/fill/range/copy contract families. @param type - Native discriminator. @param zero - Explicit native T{}. @param initial - Constructor family. @param valueOrLast - Fill or range end. @returns Block. */
  protected constructor(
    type: element_t,
    zero: T,
    initial: BlockInitial<T>,
    valueOrLast: T | delayed_delete_vector_iterator<T>,
  ) {
    // The sole default specialization supplies both erased-template arguments
    // explicitly for every native constructor family; defaults belong there.
    super(type);
    this.m_array = new delayed_delete_vector<T>(
      zero,
      initial instanceof element_block ? initial.store() : initial,
      valueOrLast,
    );
  }
  /** Borrows native constructed storage, including delayed front state. @returns Original store. */
  public store(): delayed_delete_vector<T> {
    return this.m_array;
  }
  /** Retains original scalar store equality. @param other - Same specialization. @returns Equality. */
  public equals(other: element_block<T>): boolean {
    return this.m_array.equals(other.m_array);
  }
  /** Retains original negation operator. @param other - Same specialization. @returns Inequality. */
  public not_equals(other: element_block<T>): boolean {
    return !this.equals(other);
  }
  /** Adapts original static_cast and optional compile-time debug check. @param this - Native static specialization. @param block - Common owner. @returns Typed owner. */
  public static get<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): element_block<T> {
    if (this.debug && get_block_type(block) !== this.block_type)
      throw new general_error(
        `incorrect block type: expected block type=${this.block_type}, passed block type=${get_block_type(block)}`,
      );
    return block as element_block<T>;
  }
  /** Reads original checked at reference as a scalar; mutation uses its borrowed store reference. @param this - Native static specialization. @param block - Owner. @param pos - Logical offset. @returns Scalar. */
  public static at<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    pos: number,
  ): T {
    return this.get(block).m_array.at(pos);
  }
  /** Borrows original data pointer; native bool data instantiation is unavailable. @param this - Native static specialization. @param block - Owner. @returns Mutable pointer position. */
  public static data<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): delayed_delete_vector_iterator<T> {
    return this.get(block).m_array.data();
  }
  /** Reads native logical size. @param this - Native static specialization. @param block - Owner. @returns Size. */
  public static size<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): number {
    return this.get(block).m_array.size();
  }
  /** Borrows native forward begin. @param this - Native static specialization. @param block - Owner. @returns Iterator. */
  public static begin<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): delayed_delete_vector_iterator<T> {
    return this.get(block).m_array.begin();
  }
  /** Borrows native forward end. @param this - Native static specialization. @param block - Owner. @returns Iterator. */
  public static end<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): delayed_delete_vector_iterator<T> {
    return this.get(block).m_array.end();
  }
  /** Borrows native const forward begin. @param this - Native static specialization. @param block - Owner. @returns Iterator. */
  public static cbegin<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): delayed_delete_vector_iterator<T> {
    return this.get(block).m_array.begin();
  }
  /** Borrows native const forward end. @param this - Native static specialization. @param block - Owner. @returns Iterator. */
  public static cend<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): delayed_delete_vector_iterator<T> {
    return this.get(block).m_array.end();
  }
  /** Borrows native reverse begin. @param this - Native static specialization. @param block - Owner. @returns Iterator. */
  public static rbegin<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): delayed_delete_vector_iterator<T> {
    return this.get(block).m_array.rbegin();
  }
  /** Borrows native reverse end. @param this - Native static specialization. @param block - Owner. @returns Iterator. */
  public static rend<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): delayed_delete_vector_iterator<T> {
    return this.get(block).m_array.rend();
  }
  /** Borrows native const reverse begin. @param this - Native static specialization. @param block - Owner. @returns Iterator. */
  public static crbegin<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): delayed_delete_vector_iterator<T> {
    return this.get(block).m_array.rbegin();
  }
  /** Borrows native const reverse end. @param this - Native static specialization. @param block - Owner. @returns Iterator. */
  public static crend<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): delayed_delete_vector_iterator<T> {
    return this.get(block).m_array.rend();
  }
  /** Returns native owner-borrowing range. @param this - Native static specialization. @param block - Owner. @returns Mutable/const range. */
  public static range<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): base_range_type<T> {
    return new base_range_type(this, block);
  }
  /** Assigns original indexed scalar. @param this - Native static specialization. @param block - Owner. @param pos - Offset. @param value - Native T value. @returns Nothing. */
  public static set_value<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    pos: number,
    value: T,
  ): void {
    this.get(block).m_array.set(pos, this.convert(value));
  }
  /** Adapts both value-return and output-reference overloads as the original assigned scalar. @param this - Native static specialization. @param block - Owner. @param pos - Offset. @returns Scalar. */
  public static get_value<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    pos: number,
  ): T {
    return this.get(block).m_array.get(pos);
  }
  /** Appends original scalar after native T conversion. @param this - Native static specialization. @param block - Owner. @param value - Scalar. @returns Nothing. */
  public static append_value<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    value: T,
  ): void {
    this.get(block).m_array.push_back(this.convert(value));
  }
  /** Forwards constructed native scalar. @param this - Native static specialization. @param block - Owner. @param value - Scalar. @returns Nothing. */
  public static emplace_back_value<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    value: T,
  ): void {
    this.get(block).m_array.emplace_back(this.convert(value));
  }
  /** Prepends without clearing front entries. @param this - Native static specialization. @param block - Owner. @param value - Scalar. @returns Nothing. */
  public static prepend_value<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    value: T,
  ): void {
    const store = this.get(block).m_array;
    store.insert(store.begin(), this.convert(value));
  }
  /** Creates original count-initialized owner. @param this - Native static specialization. @param init_size - Count. @returns New block. */
  public static create_block<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    init_size: number,
  ): element_block<T> {
    return new this(init_size);
  }
  /** Releases an unmanaged primitive block through GC; deleted/dangling native owners have no valid subsequent calls. @param pointer - Owner or null. @returns Nothing. */
  public static delete_block(pointer: base_element_block | null): void {
    void pointer;
  }
  /** Resizes then retains original integer-capacity auto-shrink comparison. @param this - Native static specialization. @param block - Owner. @param new_size - Count. @returns Nothing. */
  public static resize_block<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    new_size: number,
  ): void {
    const store = this.get(block).m_array;
    store.resize(new_size);
    if (new_size < Math.trunc(store.capacity() / 2)) store.shrink_to_fit();
  }
  /** Original no-op when MDDS_UNIT_TEST is not defined. @param block - Owner. @returns Nothing. */
  public static print_block(block: base_element_block): void {
    void block;
  }
  /** Erases one original element; front erase remains delayed. @param this - Native static specialization. @param block - Owner. @param pos - Position. @returns Nothing. */
  public static erase_value<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    pos: number,
  ): void {
    const store = this.get(block).m_array;
    store.erase(store.begin().advance(pos));
  }
  /** Physically erases original half-open range. @param this - Native static specialization. @param block - Owner. @param pos - Start. @param size - Count. @returns Nothing. */
  public static erase_values<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    pos: number,
    size: number,
  ): void {
    const store = this.get(block).m_array;
    store.erase(store.begin().advance(pos), store.begin().advance(pos + size));
  }
  /** Appends all original source values without an explicit reserve. @param this - Native static specialization. @param dest - Destination. @param src - Source. @returns Nothing. */
  public static append_block<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    dest: base_element_block,
    src: base_element_block,
  ): void {
    const d = this.get(dest).m_array,
      s = this.get(src).m_array;
    d.insert(d.end(), s.begin(), s.end());
  }
  /** Retains source iterator acquisition before destination reserve. @param this - Native static specialization. @param dest - Destination. @param src - Source. @param begin_pos - Source start. @param len - Count. @returns Nothing. */
  public static append_values_from_block<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    dest: base_element_block,
    src: base_element_block,
    begin_pos: number,
    len: number,
  ): void {
    const d = this.get(dest).m_array,
      s = this.get(src).m_array;
    const [first, last] = element_block.get_iterator_pair(s, begin_pos, len);
    d.reserve(d.size() + len);
    d.insert(d.end(), first, last);
  }
  /** Assigns original selected source range. @param this - Native static specialization. @param dest - Destination. @param src - Source. @param begin_pos - Start. @param len - Count. @returns Nothing. */
  public static assign_values_from_block<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    dest: base_element_block,
    src: base_element_block,
    begin_pos: number,
    len: number,
  ): void {
    const d = this.get(dest).m_array,
      s = this.get(src).m_array;
    const [first, last] = element_block.get_iterator_pair(s, begin_pos, len);
    d.assign(first, last);
  }
  /** Retains source iterators before destination reserve and front insertion. @param this - Native static specialization. @param dest - Destination. @param src - Source. @param begin_pos - Start. @param len - Count. @returns Nothing. */
  public static prepend_values_from_block<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    dest: base_element_block,
    src: base_element_block,
    begin_pos: number,
    len: number,
  ): void {
    const d = this.get(dest).m_array,
      s = this.get(src).m_array;
    const [first, last] = element_block.get_iterator_pair(s, begin_pos, len);
    d.reserve(d.size() + len);
    d.insert(d.begin(), first, last);
  }
  /** Swaps pairwise in original forward order, including overlapping valid ranges. @param this - Native static specialization. @param blk1 - First owner. @param blk2 - Second owner. @param pos1 - First start. @param pos2 - Second start. @param len - Count. @returns Nothing. */
  public static swap_values<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    blk1: base_element_block,
    blk2: base_element_block,
    pos1: number,
    pos2: number,
    len: number,
  ): void {
    const st1 = this.get(blk1).m_array,
      st2 = this.get(blk2).m_array;
    if (pos1 + len > st1.size()) throw new Error("pos1 + len <= st1.size()");
    if (pos2 + len > st2.size()) throw new Error("pos2 + len <= st2.size()");
    const it1 = st1.begin().advance(pos1),
      it2 = st2.begin().advance(pos2);
    for (let i = 0; i < len; ++i, it1.advance(1), it2.advance(1)) {
      const v1 = it1.get(),
        v2 = it2.get();
      it1.set(v2);
      it2.set(v1);
    }
  }
  /** Compares original typed storage. @param this - Native static specialization. @param left - Left owner. @param right - Right owner. @returns Equality. */
  public static equal_block<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    left: base_element_block,
    right: base_element_block,
  ): boolean {
    return this.get(left).equals(this.get(right));
  }
  /** Assigns through original forward borrowed input iterators. @param this - Native static specialization. @param block - Owner. @param pos - Destination start. @param first - Input begin. @param last - Input end. @returns Nothing. */
  public static set_values<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    pos: number,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void {
    const dest = this.get(block).m_array.begin().advance(pos);
    for (const it = first.copy(); !it.equals(last); it.advance(1), dest.advance(1))
      dest.set(this.convert(it.get()));
  }
  /** Appends original input range. @param this - Native static specialization. @param block - Owner. @param first - Begin. @param last - End. @returns Nothing. */
  public static append_values<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void {
    const d = this.get(block).m_array;
    d.insert(d.end(), convert_range(first, last, this.convert));
  }
  /** Prepends original input range. @param this - Native static specialization. @param block - Owner. @param first - Begin. @param last - End. @returns Nothing. */
  public static prepend_values<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void {
    const d = this.get(block).m_array;
    d.insert(d.begin(), convert_range(first, last, this.convert));
  }
  /** Assigns original input range. @param this - Native static specialization. @param block - Owner. @param first - Begin. @param last - End. @returns Nothing. */
  public static assign_values<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void {
    this.get(block).m_array.assign(convert_range(first, last, this.convert));
  }
  /** Inserts original input range. @param this - Native static specialization. @param block - Owner. @param pos - Destination start. @param first - Begin. @param last - End. @returns Nothing. */
  public static insert_values<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    pos: number,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void {
    const d = this.get(block).m_array;
    d.insert(d.begin().advance(pos), convert_range(first, last, this.convert));
  }
  /** Reads original store capacity. @param this - Native static specialization. @param block - Owner. @returns Slots. */
  public static capacity<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): number {
    return this.get(block).m_array.capacity();
  }
  /** Calls original store reserve, including front clearing. @param this - Native static specialization. @param block - Owner. @param size - Slots. @returns Nothing. */
  public static reserve<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
    size: number,
  ): void {
    this.get(block).m_array.reserve(size);
  }
  /** Calls original store shrink. @param this - Native static specialization. @param block - Owner. @returns Nothing. */
  public static shrink_to_fit<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): void {
    this.get(block).m_array.shrink_to_fit();
  }
  /** Retains original bounds assertion and absolute source iterator pair. @param array - Source store. @param begin_pos - Start. @param len - Count. @returns Borrowed pair. */
  private static get_iterator_pair<T extends DelayedVectorValue>(
    array: delayed_delete_vector<T>,
    begin_pos: number,
    len: number,
  ): [delayed_delete_vector_iterator<T>, delayed_delete_vector_iterator<T>] {
    if (begin_pos + len > array.size()) throw new Error("begin_pos + len <= array.size()");
    const first = array.begin().advance(begin_pos);
    return [first, first.copy().advance(len)];
  }
}
/** Original copyable element-block owner. */
export class copyable_element_block<T extends DelayedVectorValue> extends element_block<T> {
  /** Uses original copy constructor, including delayed store state. @param this - Native static specialization. @param block - Source. @returns Independent owner. */
  public static copy_block<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    block: base_element_block,
  ): element_block<T> {
    return new this(this.get(block));
  }
  /** Original copyable clone specialization is ordinary copy construction. @param this - Native static specialization. @param src - Source. @returns Independent owner. */
  public static clone_block<T extends DelayedVectorValue>(
    this: BlockConstructor<T>,
    src: base_element_block,
  ): element_block<T> {
    return new this(this.get(src));
  }
}
/** Adapts native InputIt-to-ValueT construction for defined external ranges. @param first - Input begin. @param last - End. @param cast - Native scalar conversion. @returns Constructed scalar values. */
function convert_range<T extends DelayedVectorValue>(
  first: delayed_delete_vector_iterator<T>,
  last: delayed_delete_vector_iterator<T>,
  cast: (value: T) => T,
): T[] {
  const values: T[] = [];
  for (const it = first.copy(); !it.equals(last); it.advance(1)) values.push(cast(it.get()));
  return values;
}
/** Specializes original unmanaged default block template without generated native substitutes. @param TypeId - Native discriminator. @param zero - Native value_type{}. @param cast - Erased native scalar conversion. @param debug - Original compile-time MDDS_MULTI_TYPE_VECTOR_DEBUG witness. @returns Original static specialization. */
export function default_element_block<T extends DelayedVectorValue>(
  TypeId: element_t,
  zero: T,
  cast: (value: T) => T,
  debug = false,
) {
  /** Original default_element_block specialization over actual shared storage. */
  class default_element_block extends copyable_element_block<T> {
    public static readonly block_type = TypeId;
    public static readonly debug = debug;
    /** Retains original scalar type conversion at call boundaries. @param value - Scalar. @returns Native T. */
    public static convert(value: T): T {
      return cast(value);
    }
    /** Initializes original constructor families with explicit erased T{}. @param initial - Count/range/copy. @param valueOrLast - Fill/range end. @returns Original specialized block. */
    public constructor(
      initial: BlockInitial<T> = 0,
      valueOrLast: T | delayed_delete_vector_iterator<T> = zero,
    ) {
      const prepared =
        initial instanceof delayed_delete_vector_iterator
          ? convert_range(initial, valueOrLast as delayed_delete_vector_iterator<T>, cast)
          : typeof initial === "number" || initial instanceof element_block
            ? initial
            : initial.map(cast);
      super(
        TypeId,
        zero,
        prepared,
        valueOrLast instanceof delayed_delete_vector_iterator ? valueOrLast : cast(valueOrLast),
      );
    }
    /** Creates original filled scalar owner. @param init_size - Count. @param value - Scalar. @returns Block. */
    public static create_block_with_value(init_size: number, value: T): default_element_block {
      return new this(init_size, value);
    }
    /** Creates original borrowed input-range owner. @param first - Input begin. @param last - End. @returns Block. */
    public static create_block_with_values(
      first: delayed_delete_vector_iterator<T>,
      last: delayed_delete_vector_iterator<T>,
    ): default_element_block {
      return new this(first, last);
    }
    /** Original unmanaged overwrite does nothing. @param block - Owner. @param pos - Start. @param len - Count. @returns Nothing. */
    public static overwrite_values(block: base_element_block, pos: number, len: number): void {
      void block;
      void pos;
      void len;
    }
  }
  return default_element_block;
}

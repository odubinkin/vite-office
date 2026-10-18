/** @fileoverview Original private SoA block_slot_type, blocks_type and blocks_to_transfer owners; no replacement multi_type_vector engine. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { set as set_range_body, insert_empty_impl } from "./main_def.range.ts";
import {
  set as set_body,
  push_back_impl,
  append_empty as append_empty_body,
} from "./main_def.set.ts";
import { integrity_error } from "../../global.ts";
import {
  type base_element_block,
  type element_t,
  get_block_element_at,
  get_block_type,
  type BlockElementAccess,
  type BlockValueType,
} from "../types.ts";
import {
  type DelayedVectorValue,
  type delayed_delete_vector_iterator,
} from "../delayed_delete_vector.ts";
import {
  type ValueResultCallbacks,
  type ReferenceCallbacks,
  type NativeValueType,
} from "../macro.ts";
import {
  throw_block_position_not_found,
  empty_event_func,
  clone_construction_type,
  type default_traits,
  advance_position as advance_position_impl,
  type BlockPositionIterator,
  type BlockPosition,
} from "../util.ts";
import { iterator_base, const_iterator_base } from "./iterator.ts";
import { std_vector } from "../vector_storage.ts";
import {
  resize as resize_body,
  create_new_block_with_new_cell,
  copy_blocks,
  store_insert,
  store_swap,
  store_equals,
  store_erase,
  store_calc_block_position,
  store_calc_next_block_position,
  store_reserve,
  initialize_element_blocks,
  delete_element_blocks,
  delete_element_block,
  mutate_blocks,
  get_block_position,
  set_empty as set_empty_body,
  release_range as release_range_body,
  release as release_body,
  scalar_release as scalar_release_body,
  insert_empty as insert_empty_body,
  merge_with_next_block as merge_with_next_block_body,
  clear as clear_body,
  dispose as dispose_body,
  make_iterator,
  next_position as next_position_impl,
  get_impl,
  get_value as get_value_body,
  get_type as get_type_impl,
  is_empty as is_empty_impl,
  position_impl,
} from "./main_def.ts";
import { adjust_block_positions, type scalar_lu_factor } from "./block_util.ts";
import { type element_block_funcs } from "../block_funcs.ts";
/** Original enclosing Traits aliases; implemented execution specialization is default_exec_policy. */
export interface BlocksTraits {
  block_funcs: ReturnType<typeof element_block_funcs>;
  exec_policy: typeof default_traits.exec_policy;
}
/** Original nested temporary slot; exported at file scope as TypeScript nested-type syntax adaptation. */
export class block_slot_type {
  public element_block: base_element_block | null = null;
  /** Original default and metadata constructors. @param position - Native logical position. @param size - Native logical length. @returns Slot. */
  public constructor(
    public position = 0,
    public size = 0,
  ) {}
}
/** Original three-vector metadata owner; block deletion/events remain the enclosing container responsibility. */
export class blocks_type {
  public positions: std_vector<number>;
  public sizes: std_vector<number>;
  public element_blocks: std_vector<base_element_block | null>;
  /** Original default/copy/clone constructors over actual shared BlockOp aliases. @param Traits - Native enclosing trait aliases. @param other - Copy source. @param tag - Original clone construction witness. @returns Store. */
  public constructor(
    public readonly Traits: BlocksTraits,
    other?: blocks_type,
    tag?: typeof clone_construction_type,
  ) {
    this.positions = new std_vector(other?.positions.snapshot());
    this.sizes = new std_vector(other?.sizes.snapshot());
    this.element_blocks = new std_vector(other?.element_blocks.snapshot());
    if (other)
      copy_blocks(
        this.element_blocks,
        tag === clone_construction_type
          ? Traits.block_funcs.clone_block
          : Traits.block_funcs.copy_block,
      );
  }
  /** Original move constructor transfers the three vector storages; selected host moved-from vectors are empty. @param other - Source. @returns Store. */
  public static move(other: blocks_type): blocks_type {
    const ret = new blocks_type(other.Traits);
    ret.positions.swap(other.positions);
    ret.sizes.swap(other.sizes);
    ret.element_blocks.swap(other.element_blocks);
    return ret;
  }
  /** Original pop affects metadata only. @returns Nothing. */
  public pop_back(): void {
    this.positions.pop_back();
    this.sizes.pop_back();
    this.element_blocks.pop_back();
  }
  /** Original slot overload. @param slot - Slot. @returns Nothing. */
  public push_back(slot: block_slot_type): void;
  /** Original explicit metadata overload. @param pos - Position. @param size - Length. @param data - Borrowed block. @returns Nothing. */
  public push_back(pos: number, size: number, data: base_element_block | null): void;
  /** Original synchronized append overloads. @param posOrSlot - Position or slot. @param size - Length. @param data - Pointer. @returns Nothing. */
  public push_back(
    posOrSlot: number | block_slot_type,
    size?: number,
    data?: base_element_block | null,
  ): void {
    const slot =
      posOrSlot instanceof block_slot_type
        ? posOrSlot
        : {
            position: posOrSlot,
            size: size as number,
            element_block: data as base_element_block | null,
          };
    this.positions.push_back(slot.position);
    this.sizes.push_back(slot.size);
    this.element_blocks.push_back(slot.element_block);
  }
  /** Original single/range erase overloads retain helper call order. @param index - Position. @param size - Optional count. @returns Nothing. */
  public erase(index: number, size?: number): void {
    store_erase(this, index, size);
  }
  /** Original empty-slot or external block-array insertion. @param index - Position. @param sizeOrSource - Count or source. @returns Nothing. */
  public insert(index: number, sizeOrSource: number | blocks_type): void;
  /** Original single-slot insertion. @param index - Position. @param pos - Logical position. @param size - Length. @param data - Pointer. @returns Nothing. */
  public insert(index: number, pos: number, size: number, data: base_element_block | null): void;
  /** Original metadata insert overloads; valid external source ranges exclude native self-insertion. @param index - Position. @param posOrSource - Count, position or store. @param size - Length. @param data - Pointer. @returns Nothing. */
  public insert(
    index: number,
    posOrSource: number | blocks_type,
    size?: number,
    data?: base_element_block | null,
  ): void {
    store_insert(this, index, posOrSource, size, data);
  }
  /** Original first/subsequent block position calculation; exact bounded native logical indices. @param index - Slot. @returns Nothing. */
  public calc_block_position(index: number): void {
    store_calc_block_position(this, index);
  }
  /** Original next position arithmetic. @param index - Slot. @returns Position. */
  public calc_next_block_position(index: number): number {
    return store_calc_next_block_position(this, index);
  }
  /** Original complete vector swap. @param other - Store. @returns Nothing. */
  public swap(other: blocks_type): void;
  /** Original two-slot swap. @param index1 - First. @param index2 - Second. @returns Nothing. */
  public swap(index1: number, index2: number): void;
  /** Original swap overloads. @param otherOrIndex - Store or index. @param index2 - Second index. @returns Nothing. */
  public swap(otherOrIndex: blocks_type | number, index2?: number): void {
    store_swap(this, otherOrIndex, index2);
  }
  /** Original synchronized reserve allocates real slots. @param n - Minimum capacity. @returns Nothing. */
  public reserve(n: number): void {
    store_reserve(this, n);
  }
  /** Original metadata/length checks before default equal_blocks. @param other - Store. @returns Equality. */
  public equals(other: blocks_type): boolean {
    return store_equals(this, other);
  }
  /** Original metadata clear does not delete blocks. @returns Nothing. */
  public clear(): void {
    this.positions.clear();
    this.sizes.clear();
    this.element_blocks.clear();
  }
  /** Original two exact length-integrity diagnostics. @returns Nothing or throws. */
  public check_integrity(): void {
    if (this.positions.size() !== this.sizes.size())
      throw new integrity_error("position and size arrays are of different sizes!");
    if (this.positions.size() !== this.element_blocks.size())
      throw new integrity_error("position and element-block arrays are of different sizes!");
  }
}
/** Original nested transfer group; metadata defaults belong to this owner. */
export class blocks_to_transfer {
  public blocks: blocks_type;
  public insert_index = 0;
  /** Creates original empty transfer metadata. @param Traits - Enclosing aliases. @returns Transfer group. */
  public constructor(Traits: BlocksTraits) {
    this.blocks = new blocks_type(Traits);
  }
}
/** Original event_func callback contract; event copy/move/swap value operations have explicit erased native witnesses. */
export interface ContainerEvent {
  element_block_acquired(block: base_element_block | null): void;
  element_block_released(block: base_element_block | null): void;
}
/** Native event_func constructor alias belongs to the original Traits owner. */
export interface ContainerTraits<E extends ContainerEvent> extends BlocksTraits {
  loop_unrolling: scalar_lu_factor;
  event_func: new () => E;
}
/** Erased native event_func value operators; swap mutates stable borrowed fields rather than exchanging JS object references. */
export interface EventValueOps<E extends ContainerEvent> {
  copy(value: E): E;
  move(value: E): E;
  swap(left: E, right: E): void;
}
/** Actual shared empty_event_func has no state; these witnesses adapt its original implicit value operators. */
export const empty_event_value_ops: EventValueOps<empty_event_func> = {
  /** Original implicit empty value copy. @param value - Source. @returns Independent value. */
  copy(value) {
    void value;
    return new empty_event_func();
  },
  /** Original implicit empty value move. @param value - Source. @returns Independent value. */
  move(value) {
    void value;
    return new empty_event_func();
  },
  /** Original empty value swap has no field effects. @param left - Left field. @param right - Right field. @returns Nothing. */
  swap(left, right) {
    void left;
    void right;
  },
};
/** Explicit erased original scalar overload family; numeric native types are never inferred from JS values. */
export type ContainerCallbacks<T = DelayedVectorValue> = Omit<
  ValueResultCallbacks<T>,
  "mdds_mtv_emplace_back_construct" | "mdds_mtv_emplace_back_value"
>;
const move_construction = Symbol("native move construction");
/** Original SoA multi_type_vector field/lifetime owner; subsequent original segment algorithms are not replaced by a different engine. */
export class multi_type_vector<E extends ContainerEvent = empty_event_func> {
  private m_hdl_event: E;
  private m_block_store: blocks_type;
  private m_cur_size: number;
  /** Original default/handler/size/scalar/range/copy/clone constructors with explicit erased type/value witnesses. @param Traits - Original aliases. @param Events - Native event operators. @param init - Native size, handler or copied owner. @param callbacksOrTag - Scalar overload or construction tag. @param valueOrFirst - Scalar value or input begin. @param last - Input end. @returns Owner. */
  public constructor(
    public readonly Traits: ContainerTraits<E>,
    public readonly Events: EventValueOps<E>,
    init?: number | E | multi_type_vector<E>,
    callbacksOrTag?:
      ContainerCallbacks<unknown> | typeof clone_construction_type | typeof move_construction,
    valueOrFirst?: unknown,
    last?: delayed_delete_vector_iterator<unknown>,
  ) {
    if (init instanceof multi_type_vector) {
      const moving = callbacksOrTag === move_construction;
      this.m_hdl_event = moving ? Events.move(init.m_hdl_event) : Events.copy(init.m_hdl_event);
      this.m_block_store = moving
        ? blocks_type.move(init.m_block_store)
        : new blocks_type(
            Traits,
            init.m_block_store,
            callbacksOrTag === clone_construction_type ? clone_construction_type : undefined,
          );
      this.m_cur_size = init.m_cur_size;
      if (!moving)
        for (const data of this.m_block_store.element_blocks.snapshot())
          if (data) this.m_hdl_event.element_block_acquired(data);
      return;
    }
    this.m_hdl_event =
      init !== undefined && typeof init !== "number"
        ? callbacksOrTag === move_construction
          ? Events.move(init)
          : Events.copy(init)
        : new Traits.event_func();
    this.m_block_store = new blocks_type(Traits);
    this.m_cur_size = typeof init === "number" ? init : 0;
    initialize_element_blocks(
      this.m_block_store,
      this.m_hdl_event,
      this.m_cur_size,
      typeof callbacksOrTag === "object" ? callbacksOrTag : undefined,
      valueOrFirst,
      last,
    );
  }
  /** Original move constructor; the moved primitive logical size remains in the source. @param other - Source. @returns Moved owner. */
  public static move<E extends ContainerEvent>(other: multi_type_vector<E>): multi_type_vector<E> {
    return new multi_type_vector(other.Traits, other.Events, other, move_construction);
  }
  /** Original rvalue handler constructor with explicit erased rvalue witness. @param Traits - Original aliases. @param Events - Native value operations. @param handler - Moved handler. @returns Owner. */
  public static from_moved_event<E extends ContainerEvent>(
    Traits: ContainerTraits<E>,
    Events: EventValueOps<E>,
    handler: E,
  ): multi_type_vector<E> {
    return new multi_type_vector(Traits, Events, handler, move_construction);
  }
  /** Original destructor, paired exactly once at the valid native lifetime boundary. @returns Nothing. */
  public dispose(): void {
    dispose_body(this.m_block_store, this.m_hdl_event, this.Traits.block_funcs);
  }
  /** Original clone construction path. @returns Clone. */
  public clone(): multi_type_vector<E> {
    return new multi_type_vector(this.Traits, this.Events, this, clone_construction_type);
  }
  /** Original copy assignment uses a temporary even on self assignment. @param other - Source. @returns This. */
  public assign(other: multi_type_vector<E>): this {
    const assigned = new multi_type_vector(this.Traits, this.Events, other);
    try {
      this.swap(assigned);
    } finally {
      assigned.dispose();
    }
    return this;
  }
  /** Original move assignment temporary retains native self-move behavior. @param other - Source. @returns This. */
  public assign_move(other: multi_type_vector<E>): this {
    const assigned = multi_type_vector.move(other);
    try {
      this.swap(assigned);
    } finally {
      assigned.dispose();
    }
    return this;
  }
  /** Original sequential release/deletion precedes metadata clear and size reset. @returns Nothing. */
  public clear(): void {
    clear_body(this.m_block_store, this.m_hdl_event, this.Traits.block_funcs);
    this.m_cur_size = 0;
  }
  /** Original whole-container release overload. @returns Nothing. */
  public release(): void;
  /** Original typed scalar release overload. @param pos - Row. @param callbacks - Erased native type witness. @returns Released scalar. */
  public release<T extends DelayedVectorValue>(
    pos: number | bigint,
    callbacks: ContainerCallbacks<T>,
  ): T;
  /** Original output-reference release overload. @param pos - Row. @param callbacks - Native type witness. @param value - Borrowed output reference. @returns Empty-cell iterator. */
  public release<T extends DelayedVectorValue>(
    pos: number | bigint,
    callbacks: ContainerCallbacks<T>,
    value: { value: T },
  ): iterator_base<this>;
  /** Original hinted output-reference overload. @param hint - Original hint. @param pos - Row. @param callbacks - Native type witness. @param value - Borrowed output reference. @returns Empty-cell iterator. */
  public release<T extends DelayedVectorValue>(
    hint: iterator_base<this>,
    pos: number | bigint,
    callbacks: ContainerCallbacks<T>,
    value: { value: T },
  ): iterator_base<this>;
  /** Original release bodies borrow actual fields; whole-container size reset remains in its owner. @param first - Row or hint. @param second - Row or native type. @param third - Native type or output. @param fourth - Hinted output. @returns Original overload result. */
  public release(
    first?: number | bigint | iterator_base<this>,
    second?: number | bigint | ContainerCallbacks,
    third?: ContainerCallbacks | { value: DelayedVectorValue },
    fourth?: { value: DelayedVectorValue },
  ): void | DelayedVectorValue | iterator_base<this> {
    if (first === undefined) {
      release_body(this.m_block_store, this.m_hdl_event, this.Traits.block_funcs);
      this.m_cur_size = 0;
      return;
    }
    return scalar_release_body(
      this.m_block_store,
      this.m_cur_size,
      this.m_hdl_event,
      this.Traits.block_funcs,
      this,
      first,
      second as number | bigint | ContainerCallbacks,
      third,
      fourth,
    );
  }
  /** Original event value, logical-size and array swap order. @param other - Owner. @returns Nothing. */
  public swap(other: multi_type_vector<E>): void {
    this.Events.swap(this.m_hdl_event, other.m_hdl_event);
    [this.m_cur_size, other.m_cur_size] = [other.m_cur_size, this.m_cur_size];
    this.m_block_store.swap(other.m_block_store);
  }
  /** Original default execution block shrink helper. @returns Nothing. */
  public shrink_to_fit(): void {
    mutate_blocks(this.m_block_store.element_blocks, this.Traits.block_funcs.shrink_to_fit);
  }
  /** Original self/size/store equality order. @param other - Owner. @returns Equality. */
  public equals(other: multi_type_vector<E>): boolean {
    if (this === other) return true;
    if (this.m_cur_size !== other.m_cur_size) return false;
    return this.m_block_store.equals(other.m_block_store);
  }
  /** Original operator inequality delegates equality. @param other - Owner. @returns Inequality. */
  public not_equals(other: multi_type_vector<E>): boolean {
    return !this.equals(other);
  }
  /** Borrows the original stable event field. @returns Handler. */
  public event_handler(): E {
    return this.m_hdl_event;
  }
  /** Reads original logical size. @returns Size. */
  public size(): number {
    return this.m_cur_size;
  }
  /** Reads original position-vector size. @returns Block count. */
  public block_size(): number {
    return this.m_block_store.positions.size();
  }
  /** Original emptiness tests metadata rather than the moved primitive size. @returns Empty. */
  public empty(): boolean {
    return this.m_block_store.positions.size() === 0;
  }
  /** Original inline mutable iterator body; reverse is the erased native alias witness. @param index - Native base index. @param reverse - Category. @returns Iterator. */
  private get_iterator(index: number, reverse = false): iterator_base<this> {
    return make_iterator(this.m_block_store, this, index, iterator_base<this>, reverse);
  }
  /** Original const inline iterator body. @param index - Base index. @param reverse - Category. @returns Const iterator. */
  private get_const_iterator(index: number, reverse = false): const_iterator_base<this> {
    return make_iterator(this.m_block_store, this, index, const_iterator_base<this>, reverse);
  }
  /** Original mutable begin factory. @returns Iterator. */
  public begin(): iterator_base<this> {
    return this.get_iterator(0);
  }
  /** Original mutable end factory. @returns Iterator. */
  public end(): iterator_base<this> {
    return this.get_iterator(this.block_size());
  }
  /** Original const begin factory. @returns Const iterator. */
  public cbegin(): const_iterator_base<this> {
    return this.get_const_iterator(0);
  }
  /** Original const end factory. @returns Const iterator. */
  public cend(): const_iterator_base<this> {
    return this.get_const_iterator(this.block_size());
  }
  /** Original reverse begin factory. @returns Reverse iterator. */
  public rbegin(): iterator_base<this> {
    return this.get_iterator(this.block_size(), true);
  }
  /** Original reverse end factory. @returns Reverse iterator. */
  public rend(): iterator_base<this> {
    return this.get_iterator(0, true);
  }
  /** Original const reverse begin factory. @returns Const reverse iterator. */
  public crbegin(): const_iterator_base<this> {
    return this.get_const_iterator(this.block_size(), true);
  }
  /** Original const reverse end factory. @returns Const reverse iterator. */
  public crend(): const_iterator_base<this> {
    return this.get_const_iterator(0, true);
  }
  /** Original mutable position overloads with pinned source lines536/560; size returns end before hint access. @param first - Row or hint. @param last - Hinted row. @returns Position pair. */
  public position(
    first: number | bigint | iterator_base<this>,
    last?: number | bigint,
  ): BlockPosition<iterator_base<this>> {
    return position_impl(
      this.m_block_store,
      this.m_cur_size,
      this,
      first,
      iterator_base<this>,
      last,
    );
  }
  /** Original const position overloads with pinned source lines582/606. @param first - Row or const hint. @param last - Hinted row. @returns Const position pair. */
  public cposition(
    first: number | bigint | const_iterator_base<this>,
    last?: number | bigint,
  ): BlockPosition<const_iterator_base<this>> {
    return position_impl(
      this.m_block_store,
      this.m_cur_size,
      this,
      first,
      const_iterator_base<this>,
      last,
    );
  }
  /** Original type query delegates its actual member body. @param pos - Row. @returns Type. */
  public get_type(pos: number | bigint): element_t {
    return get_type_impl(this.m_block_store, this.m_cur_size, pos);
  }
  /** Original empty-cell query delegates its member body. @param pos - Row. @returns Empty. */
  public is_empty(pos: number | bigint): boolean {
    return is_empty_impl(this.m_block_store, this.m_cur_size, pos);
  }
  /** Original scalar result syntax. @param pos - Row. @param callbacks - Typed overloads. @returns Scalar. */
  public get<T extends DelayedVectorValue>(
    pos: number | bigint,
    callbacks: ContainerCallbacks<T>,
  ): T;
  /** Original output-reference get. @param pos - Row. @param callbacks - Typed overloads. @param output - Existing target. @returns Nothing. */
  public get<T>(pos: number | bigint, callbacks: ReferenceCallbacks<T>, output: [T]): void;
  /** Original owned result get with erased native ValueT members. @param pos - Row. @param callbacks - Typed overloads. @param valueType - Actual default constructor/destructor. @returns Owned result. */
  public get<T>(
    pos: number | bigint,
    callbacks: ReferenceCallbacks<T>,
    valueType: NativeValueType<T>,
  ): T;
  /** Selects the original reference/value overload without runtime value-type guessing. @param pos - Row. @param callbacks - Native typed overloads. @param outputOrType - Output reference or erased native ValueT. @returns Result or nothing. */
  public get<T>(
    pos: number | bigint,
    callbacks: ContainerCallbacks<T> | ReferenceCallbacks<T>,
    outputOrType?: [T] | NativeValueType<T>,
  ): T | void {
    if (outputOrType === undefined)
      return get_impl(this.m_block_store, this.m_cur_size, pos, callbacks as ContainerCallbacks<T>);
    if (Array.isArray(outputOrType))
      return get_impl(
        this.m_block_store,
        this.m_cur_size,
        pos,
        callbacks as ReferenceCallbacks<T>,
        outputOrType,
      );
    return get_value_body(
      this.m_block_store,
      this.m_cur_size,
      pos,
      callbacks as ReferenceCallbacks<T>,
      outputOrType,
    );
  }
  /** Original mutable/const static next-position overloads. @param pos - Valid source. @returns Independent pair. */
  public static next_position<I extends BlockPositionIterator<I>>(
    pos: BlockPosition<I>,
  ): BlockPosition<I> {
    return next_position_impl(pos);
  }
  /** Original mutable/const static advancement forwards the shared native utility. @param pos - Valid source. @param steps - Original signed32 steps. @returns Independent pair. */
  public static advance_position<I extends BlockPositionIterator<I>>(
    pos: BlockPosition<I>,
    steps: number,
  ): BlockPosition<I> {
    return advance_position_impl(pos, steps);
  }
  /** Original const-position logical number reads the cached node without owner lookup. @param pos - Valid position. @returns Logical number. */
  public static logical_position<I extends { get(): { readonly position: number } }>(
    pos: BlockPosition<I>,
  ): number {
    return pos.first.get().position + pos.second;
  }
  /** Original static typed-position get delegates actual types.hpp helper. @param pos - Valid nonempty matching position. @param Blk - Erased original block template witness. @returns Scalar. */
  public static get<B extends BlockElementAccess<unknown>>(
    pos: BlockPosition<{ get(): { readonly data: base_element_block | null } }>,
    Blk: B,
  ): BlockValueType<B> {
    return get_block_element_at(
      Blk,
      pos.first.get().data as base_element_block,
      pos.second,
    ) as BlockValueType<B>;
  }
  /** Original single-value plain set. @param pos - Row. @param value - Const value. @param callbacks - Native overloads. @returns Iterator. */
  public set<T>(
    pos: number | bigint,
    value: T,
    callbacks: ContainerCallbacks<T>,
  ): iterator_base<this>;
  /** Original hinted const-value set. @param hint - Position hint. @param pos - Row. @param value - Const value. @param callbacks - Native overloads. @returns Iterator. */
  public set<T>(
    hint: iterator_base<this>,
    pos: number | bigint,
    value: T,
    callbacks: ContainerCallbacks<T>,
  ): iterator_base<this>;
  /** Original input-range set. @param pos - Row. @param first - Begin. @param last - End. @param callbacks - Overloads. @returns Iterator. */
  public set<T>(
    pos: number | bigint,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
    callbacks: ContainerCallbacks<T>,
  ): iterator_base<this>;
  /** Original hinted input-range set. @param hint - Hint. @param pos - Row. @param first - Begin. @param last - End. @param callbacks - Overloads. @returns Iterator. */
  public set<T>(
    hint: iterator_base<this>,
    pos: number | bigint,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
    callbacks: ContainerCallbacks<T>,
  ): iterator_base<this>;
  /** Original set overload adaptation by native argument arity. @param first - Row or hint. @param second - Value, input or row. @param third - Callbacks, input or value. @param fourth - Callbacks or input end. @param fifth - Hinted range callbacks. @returns Iterator. */
  public set<T>(
    first: number | bigint | iterator_base<this>,
    second: T | number | bigint | delayed_delete_vector_iterator<T>,
    third: T | ContainerCallbacks<T> | delayed_delete_vector_iterator<T>,
    fourth?: ContainerCallbacks<T> | delayed_delete_vector_iterator<T>,
    fifth?: ContainerCallbacks<T>,
  ): iterator_base<this> {
    const hinted = typeof first === "object";
    if (hinted ? arguments.length === 5 : arguments.length === 4)
      return set_range_body(
        this.m_block_store,
        this.m_cur_size,
        this.m_hdl_event,
        this.Traits.block_funcs,
        this,
        block_slot_type,
        hinted ? (second as number | bigint) : (first as number | bigint),
        (hinted ? third : second) as delayed_delete_vector_iterator<T>,
        (hinted ? fourth : third) as delayed_delete_vector_iterator<T>,
        (hinted ? fifth : fourth) as ContainerCallbacks<T>,
        hinted ? (first as iterator_base<this>) : undefined,
      );
    return set_body(
      this.m_block_store,
      this.m_cur_size,
      this.m_hdl_event,
      this.Traits.block_funcs,
      this,
      first,
      second as T | number | bigint,
      third as T | ContainerCallbacks<T>,
      fourth as ContainerCallbacks<T> | undefined,
    );
  }
  /** Original no_trace/nondebug value append entry with an explicit erased native overload witness. @param value - Native value. @param callbacks - Native family. @returns Last block iterator. */
  public push_back<T>(value: T, callbacks: ContainerCallbacks<T>): iterator_base<this> {
    return this.push_back_impl(value, callbacks);
  }
  /** Original rvalue push_back overload with explicit erased value category. @param value - Actual rvalue. @param callbacks - Native overload family. @returns Last block iterator. */
  public push_back_move<T>(value: T, callbacks: ContainerCallbacks<T>): iterator_base<this> {
    return this.push_back_impl(value, callbacks, true);
  }
  /** Original push_back_impl retains creation/append and metadata ordering over actual shared fields. @param value - Native value. @param callbacks - Native family. @param move - Erased forwarding category. @returns Last block iterator. */
  private push_back_impl<T>(
    value: T,
    callbacks: ContainerCallbacks<T>,
    move = false,
  ): iterator_base<this> {
    return push_back_impl(
      this.m_block_store,
      this,
      this.m_cur_size,
      value,
      callbacks,
      move,
      /** Writes the actual primitive member before returned iterator construction. @returns Nothing. */ () => {
        ++this.m_cur_size;
      },
      /** Binds the existing original helper. @param index - Slot. @param cell - Value. @param family - Overloads. @param moving - Category. @returns Nothing. */ (
        index,
        cell,
        family,
        moving,
      ) => this.create_new_block_with_new_cell(index, cell, family, moving),
    );
  }
  /** Original new-cell helper releases/deletes prior data, creates empty, installs/acquires then appends; exact null diagnostic retained. @param block_index - Metadata slot. @param cell - Native value. @param callbacks - Native family. @param move - Erased forwarding category. @returns Nothing. */
  private create_new_block_with_new_cell<T>(
    block_index: number,
    cell: T,
    callbacks: ContainerCallbacks<T>,
    move = false,
  ): void {
    create_new_block_with_new_cell(
      this.m_block_store,
      this.m_hdl_event,
      this.Traits.block_funcs,
      block_index,
      cell,
      callbacks,
      move,
    );
  }
  /** Original plain/hinted range emptying with actual borrowed original fields. @param first - Start or valid hint. @param second - End or hinted start. @param third - Hinted end. @returns Original empty block iterator. */
  public set_empty(
    first: number | bigint | iterator_base<this>,
    second: number | bigint,
    third?: number | bigint,
  ): iterator_base<this> {
    return set_empty_body(
      this.m_block_store,
      this.m_cur_size,
      this.m_hdl_event,
      this.Traits.block_funcs,
      this,
      first,
      second,
      third,
    );
  }
  /** Original plain/hinted range release with actual borrowed original fields. @param first - Start or valid hint. @param second - End or hinted start. @param third - Hinted end. @returns Original empty block iterator. */
  public release_range(
    first: number | bigint | iterator_base<this>,
    second: number | bigint,
    third?: number | bigint,
  ): iterator_base<this> {
    return release_range_body(
      this.m_block_store,
      this.m_cur_size,
      this.m_hdl_event,
      this.Traits.block_funcs,
      this,
      first,
      second,
      third,
    );
  }
  /** Original plain/hinted empty insertion retains zero-length end return before lookup and pinned diagnostics. @param first - Row or original hint. @param second - Length or hinted row. @param third - Hinted length. @returns Inserted empty block iterator. */
  public insert_empty(
    first: number | bigint | iterator_base<this>,
    second: number | bigint,
    third?: number,
  ): iterator_base<this> {
    return insert_empty_body(
      this.m_block_store,
      this.m_cur_size,
      this,
      first,
      second,
      third,
      /** Invokes the actual original private member. @param pos - Row. @param index - Located block. @param length - Count. @returns Original iterator. */
      (pos, index, length) => this.insert_empty_impl(pos, index, length),
    );
  }
  /** Original private empty insertion wrapper. @param pos - Row. @param block_index - Block. @param length - Count. @returns Iterator. */
  private insert_empty_impl(pos: number, block_index: number, length: number): iterator_base<this> {
    return insert_empty_impl(
      this.m_block_store,
      this.m_hdl_event,
      this.Traits.block_funcs,
      this,
      this.Traits.loop_unrolling,
      pos,
      block_index,
      length,
      /** Updates the original size field before iterator construction. @param count - Added count. @returns Nothing. */
      (count) => {
        this.m_cur_size += count;
      },
    );
  }
  /** Original nondebug/no_trace erase entry keeps its reversed-range error before lookup. @param start_pos - First inclusive row. @param end_pos - Last inclusive row. @returns Nothing. */
  public erase(start_pos: number | bigint, end_pos: number | bigint): void {
    if (start_pos > end_pos) throw new RangeError("Start row is larger than the end row.");
    this.erase_impl(start_pos, end_pos);
  }
  /** Original erase_impl retains both pinned diagnostic calls and exact boundary/metadata/ownership ordering. @param start_row - First row. @param end_row - Last row. @returns Nothing. */
  private erase_impl(start_row: number | bigint, end_row: number | bigint): void {
    let block_pos1 = get_block_position(this.m_block_store, this.m_cur_size, start_row);
    if (block_pos1 === this.m_block_store.positions.size())
      throw_block_position_not_found(
        "multi_type_vector::erase_impl",
        2191,
        start_row,
        this.block_size(),
        this.size(),
      );
    const block_pos2 = get_block_position(this.m_block_store, this.m_cur_size, end_row, block_pos1);
    if (block_pos2 === this.m_block_store.positions.size())
      throw_block_position_not_found(
        "multi_type_vector::erase_impl",
        2196,
        start_row,
        this.block_size(),
        this.size(),
      );
    const start = Number(start_row),
      end = Number(end_row);
    const start_row_in_block1 = this.m_block_store.positions.get(block_pos1);
    const start_row_in_block2 = this.m_block_store.positions.get(block_pos2);
    if (block_pos1 === block_pos2) {
      this.erase_in_single_block(start, end, block_pos1);
      return;
    }
    let index_erase_begin = block_pos1 + 1;
    let index_erase_end = block_pos2;
    if (start_row_in_block1 === start) --index_erase_begin;
    else {
      const blk_data = this.m_block_store.element_blocks.get(block_pos1);
      const new_size = start - start_row_in_block1;
      if (blk_data) {
        this.Traits.block_funcs.overwrite_values(
          blk_data,
          new_size,
          this.m_block_store.sizes.get(block_pos1) - new_size,
        );
        this.Traits.block_funcs.resize_block(blk_data, new_size);
      }
      this.m_block_store.sizes.set(block_pos1, new_size);
    }
    let adjust_block_offset = 0;
    const last_row_in_block = start_row_in_block2 + this.m_block_store.sizes.get(block_pos2) - 1;
    if (last_row_in_block === end) ++index_erase_end;
    else {
      const size_to_erase = end - start_row_in_block2 + 1;
      this.m_block_store.sizes.set(
        block_pos2,
        this.m_block_store.sizes.get(block_pos2) - size_to_erase,
      );
      this.m_block_store.positions.set(block_pos2, start);
      const blk_data = this.m_block_store.element_blocks.get(block_pos2);
      if (blk_data) {
        this.Traits.block_funcs.overwrite_values(blk_data, 0, size_to_erase);
        this.Traits.block_funcs.erase(blk_data, 0, size_to_erase);
      }
      adjust_block_offset = 1;
    }
    block_pos1 = index_erase_begin;
    if (block_pos1 > 0) --block_pos1;
    delete_element_blocks(
      this.m_block_store,
      this.m_hdl_event,
      this.Traits.block_funcs,
      index_erase_begin,
      index_erase_end,
    );
    this.m_block_store.erase(index_erase_begin, index_erase_end - index_erase_begin);
    const delta = end - start + 1;
    this.m_cur_size -= delta;
    if (this.m_block_store.positions.size() === 0) return;
    let adjust_pos = index_erase_begin;
    adjust_pos += adjust_block_offset;
    adjust_block_positions(this.Traits.loop_unrolling)(this.m_block_store, adjust_pos, -delta);
    this.merge_with_next_block(block_pos1);
  }
  /** Original same-block erase retains scalar overwrite/erase then metadata/delete and neighboring merge order. @param start_pos - First row. @param end_pos - Last row. @param block_index - Located block. @returns Nothing. */
  private erase_in_single_block(start_pos: number, end_pos: number, block_index: number): void {
    const blk_data = this.m_block_store.element_blocks.get(block_index);
    const size_to_erase = end_pos - start_pos + 1;
    if (blk_data) {
      const offset = start_pos - this.m_block_store.positions.get(block_index);
      this.Traits.block_funcs.overwrite_values(blk_data, offset, size_to_erase);
      this.Traits.block_funcs.erase(blk_data, offset, size_to_erase);
    }
    this.m_block_store.sizes.set(
      block_index,
      this.m_block_store.sizes.get(block_index) - size_to_erase,
    );
    this.m_cur_size -= size_to_erase;
    if (this.m_block_store.sizes.get(block_index)) {
      adjust_block_positions(this.Traits.loop_unrolling)(
        this.m_block_store,
        block_index + 1,
        -size_to_erase,
      );
      return;
    }
    delete_element_block(
      this.m_block_store,
      this.m_hdl_event,
      this.Traits.block_funcs,
      block_index,
    );
    this.m_block_store.erase(block_index);
    if (block_index === 0) {
      adjust_block_positions(this.Traits.loop_unrolling)(
        this.m_block_store,
        block_index,
        -size_to_erase,
      );
      return;
    }
    if (block_index >= this.m_block_store.positions.size()) return;
    const prev_data = this.m_block_store.element_blocks.get(block_index - 1);
    const next_data = this.m_block_store.element_blocks.get(block_index);
    if (prev_data) {
      if (!next_data) {
        adjust_block_positions(this.Traits.loop_unrolling)(
          this.m_block_store,
          block_index,
          -size_to_erase,
        );
        return;
      }
      const cat1 = get_block_type(prev_data),
        cat2 = get_block_type(next_data);
      if (cat1 === cat2) {
        this.Traits.block_funcs.append_block(prev_data, next_data);
        this.m_block_store.sizes.set(
          block_index - 1,
          this.m_block_store.sizes.get(block_index - 1) + this.m_block_store.sizes.get(block_index),
        );
        this.Traits.block_funcs.resize_block(next_data, 0);
        delete_element_block(
          this.m_block_store,
          this.m_hdl_event,
          this.Traits.block_funcs,
          block_index,
        );
        this.m_block_store.erase(block_index);
      }
      adjust_block_positions(this.Traits.loop_unrolling)(
        this.m_block_store,
        block_index,
        -size_to_erase,
      );
    } else {
      if (next_data) {
        adjust_block_positions(this.Traits.loop_unrolling)(
          this.m_block_store,
          block_index,
          -size_to_erase,
        );
        return;
      }
      this.m_block_store.sizes.set(
        block_index - 1,
        this.m_block_store.sizes.get(block_index - 1) + this.m_block_store.sizes.get(block_index),
      );
      delete_element_block(
        this.m_block_store,
        this.m_hdl_event,
        this.Traits.block_funcs,
        block_index,
      );
      this.m_block_store.erase(block_index);
      adjust_block_positions(this.Traits.loop_unrolling)(
        this.m_block_store,
        block_index,
        -size_to_erase,
      );
    }
  }
  /** Original one-direction merge returns its actual flag and keeps managed-cell-preserving append/zero-size/delete order. @param block_index - Admitted block. @returns Whether merged. */
  private merge_with_next_block(block_index: number): boolean {
    return merge_with_next_block_body(
      this.m_block_store,
      this.m_hdl_event,
      this.Traits.block_funcs,
      block_index,
    );
  }
  /** Original append_empty member updates only actual metadata and logical size. Valid empty metadata requires zero logical size. @param len - Native admitted count. @returns Whether a new block was added. */
  private append_empty(len: number): boolean {
    return append_empty_body(
      this.m_block_store,
      this.m_cur_size,
      len,
      /** Assigns the original primitive field. @param size - Size. @returns Nothing. */ (size) => {
        this.m_cur_size = size;
      },
    );
  }
  /** Original public empty append returns the new or extended last block iterator. @returns Last block iterator. */
  public push_back_empty(): iterator_base<this> {
    let block_index = this.m_block_store.positions.size();
    if (!this.append_empty(1)) --block_index;
    return this.get_iterator(block_index);
  }
  /** Original no_trace/nondebug resize entry forwards its actual member implementation. @param new_size - Native size. @returns Nothing. */
  public resize(new_size: number): void {
    this.resize_impl(new_size);
  }
  /** Original resize_impl retains exact truncation/overwrite and release order; diagnostic uses pinned source line4833. @param new_size - Native admitted size. @returns Nothing. */
  private resize_impl(new_size: number): void {
    resize_body(
      this.m_block_store,
      this.m_cur_size,
      this.m_hdl_event,
      this.Traits.block_funcs,
      new_size,
      /** Calls the actual existing empty append member. @param count - Count. @returns Appended. */ (
        count,
      ) => this.append_empty(count),
      /** Assigns the actual original primitive field. @param size - Size. @returns Nothing. */ (
        size,
      ) => {
        this.m_cur_size = size;
      },
    );
  }
}

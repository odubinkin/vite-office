/** @fileoverview Original private SoA block_slot_type, blocks_type and blocks_to_transfer owners; no replacement multi_type_vector engine. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { integrity_error } from "../../global.ts";
import {
  type base_element_block,
  type element_t,
  element_type_empty,
  get_block_element_at,
  get_block_type,
  type BlockElementAccess,
} from "../types.ts";
import {
  type DelayedVectorValue,
  type delayed_delete_vector_iterator,
} from "../delayed_delete_vector.ts";
import { type MDDS_MTV_DEFINE_ELEMENT_CALLBACKS } from "../macro.ts";
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
  copy_blocks,
  equal_blocks,
  erase,
  initialize_element_blocks,
  delete_element_blocks,
  delete_element_block,
  mutate_blocks,
  get_block_position,
  is_previous_block_of_type,
  set_empty as set_empty_body,
  release_range as release_range_body,
  release as release_body,
  scalar_release as scalar_release_body,
  insert_empty as insert_empty_body,
  merge_with_next_block as merge_with_next_block_body,
  clear as clear_body,
  dispose as dispose_body,
  create_new_block_with_new_cell,
  make_iterator,
  next_position as next_position_impl,
  get_impl,
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
    if (size === undefined) {
      this.positions.erase(index, 1);
      this.sizes.erase(index, 1);
      this.element_blocks.erase(index, 1);
    } else {
      erase(this.positions, index, size);
      erase(this.sizes, index, size);
      erase(this.element_blocks, index, size);
    }
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
    if (posOrSource instanceof blocks_type) {
      this.positions.insert(index, posOrSource.positions.snapshot());
      this.sizes.insert(index, posOrSource.sizes.snapshot());
      this.element_blocks.insert(index, posOrSource.element_blocks.snapshot());
    } else if (size === undefined) {
      this.positions.insert(index, Array<number>(posOrSource).fill(0));
      this.sizes.insert(index, Array<number>(posOrSource).fill(0));
      this.element_blocks.insert(index, Array<null>(posOrSource).fill(null));
    } else {
      this.positions.insert(index, [posOrSource]);
      this.sizes.insert(index, [size]);
      this.element_blocks.insert(index, [data as base_element_block | null]);
    }
  }
  /** Original first/subsequent block position calculation; exact bounded native logical indices. @param index - Slot. @returns Nothing. */
  public calc_block_position(index: number): void {
    if (index === 0) {
      this.positions.set(index, 0);
      return;
    }
    this.positions.set(index, this.positions.get(index - 1) + this.sizes.get(index - 1));
  }
  /** Original next position arithmetic. @param index - Slot. @returns Position. */
  public calc_next_block_position(index: number): number {
    return this.positions.get(index) + this.sizes.get(index);
  }
  /** Original complete vector swap. @param other - Store. @returns Nothing. */
  public swap(other: blocks_type): void;
  /** Original two-slot swap. @param index1 - First. @param index2 - Second. @returns Nothing. */
  public swap(index1: number, index2: number): void;
  /** Original swap overloads. @param otherOrIndex - Store or index. @param index2 - Second index. @returns Nothing. */
  public swap(otherOrIndex: blocks_type | number, index2?: number): void {
    if (otherOrIndex instanceof blocks_type) {
      this.positions.swap(otherOrIndex.positions);
      this.sizes.swap(otherOrIndex.sizes);
      this.element_blocks.swap(otherOrIndex.element_blocks);
    } else {
      const j = index2 as number;
      for (const arr of [this.positions, this.sizes]) {
        const value = arr.get(otherOrIndex);
        arr.set(otherOrIndex, arr.get(j));
        arr.set(j, value);
      }
      const value = this.element_blocks.get(otherOrIndex);
      this.element_blocks.set(otherOrIndex, this.element_blocks.get(j));
      this.element_blocks.set(j, value);
    }
  }
  /** Original synchronized reserve allocates real slots. @param n - Minimum capacity. @returns Nothing. */
  public reserve(n: number): void {
    this.positions.reserve(n);
    this.sizes.reserve(n);
    this.element_blocks.reserve(n);
  }
  /** Original metadata/length checks before default equal_blocks. @param other - Store. @returns Equality. */
  public equals(other: blocks_type): boolean {
    if (!this.positions.equals(other.positions)) return false;
    if (!this.sizes.equals(other.sizes)) return false;
    if (this.element_blocks.size() !== other.element_blocks.size()) return false;
    return equal_blocks(
      this.element_blocks,
      other.element_blocks,
      this.Traits.block_funcs.equal_block,
    );
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
export type ContainerCallbacks<T extends DelayedVectorValue = DelayedVectorValue> = ReturnType<
  typeof MDDS_MTV_DEFINE_ELEMENT_CALLBACKS<T>
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
    callbacksOrTag?: ContainerCallbacks | typeof clone_construction_type | typeof move_construction,
    valueOrFirst?: DelayedVectorValue | delayed_delete_vector_iterator<DelayedVectorValue>,
    last?: delayed_delete_vector_iterator<DelayedVectorValue>,
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
  /** Original typed result/output-reference scalar get overload body, sharing real scalar macro callbacks. @param pos - Row. @param callbacks - Explicit native type witness. @returns Scalar. */
  public get<T extends DelayedVectorValue>(
    pos: number | bigint,
    callbacks: ContainerCallbacks<T>,
  ): T {
    return get_impl(this.m_block_store, this.m_cur_size, pos, callbacks);
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
  public static get<T extends DelayedVectorValue>(
    pos: BlockPosition<{ get(): { readonly data: base_element_block | null } }>,
    Blk: BlockElementAccess<T>,
  ): T {
    return get_block_element_at(Blk, pos.first.get().data as base_element_block, pos.second);
  }
  /** Original no_trace/nondebug scalar append entry with an explicit erased native overload witness. @param value - Scalar. @param callbacks - Native family. @returns Last block iterator. */
  public push_back<T extends DelayedVectorValue>(
    value: T,
    callbacks: ContainerCallbacks<T>,
  ): iterator_base<this> {
    return this.push_back_impl(value, callbacks);
  }
  /** Original push_back_impl retains creation/append and metadata ordering over actual shared fields. @param value - Scalar. @param callbacks - Native family. @returns Last block iterator. */
  private push_back_impl<T extends DelayedVectorValue>(
    value: T,
    callbacks: ContainerCallbacks<T>,
  ): iterator_base<this> {
    const cat = callbacks.mdds_mtv_get_element_type(value);
    const last_data =
      this.m_block_store.element_blocks.size() === 0
        ? null
        : this.m_block_store.element_blocks.get(this.m_block_store.element_blocks.size() - 1);
    if (!last_data || cat !== get_block_type(last_data)) {
      const block_index = this.m_block_store.positions.size();
      const start_pos = this.m_cur_size;
      this.m_block_store.push_back(start_pos, 1, null);
      this.create_new_block_with_new_cell(block_index, value, callbacks);
      ++this.m_cur_size;
      return this.get_iterator(block_index);
    }
    const block_index = this.m_block_store.positions.size() - 1;
    callbacks.mdds_mtv_append_value(last_data, value);
    this.m_block_store.sizes.set(block_index, this.m_block_store.sizes.get(block_index) + 1);
    ++this.m_cur_size;
    return this.get_iterator(block_index);
  }
  /** Original new-cell helper releases/deletes prior data, creates empty, installs/acquires then appends; exact null diagnostic retained. @param block_index - Metadata slot. @param cell - Scalar. @param callbacks - Native family. @returns Nothing. */
  private create_new_block_with_new_cell<T extends DelayedVectorValue>(
    block_index: number,
    cell: T,
    callbacks: ContainerCallbacks<T>,
  ): void {
    create_new_block_with_new_cell(
      this.m_block_store,
      this.m_hdl_event,
      this.Traits.block_funcs,
      block_index,
      cell,
      callbacks,
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
  /** Original empty insertion member preserves smaller-side copy, equal-side choice, acquisition and metadata swap order. @param pos - Admitted row. @param block_index - Located block. @param length - Finite insertion length. @returns Inserted empty iterator. */
  private insert_empty_impl(pos: number, block_index: number, length: number): iterator_base<this> {
    const blk_data = this.m_block_store.element_blocks.get(block_index);
    if (!blk_data) {
      this.m_block_store.sizes.set(block_index, this.m_block_store.sizes.get(block_index) + length);
      this.m_cur_size += length;
      adjust_block_positions(this.Traits.loop_unrolling)(
        this.m_block_store,
        block_index + 1,
        length,
      );
      return this.get_iterator(block_index);
    }
    const start_pos = this.m_block_store.positions.get(block_index);
    if (start_pos === pos) {
      const blk_prev = is_previous_block_of_type(
        this.m_block_store,
        block_index,
        element_type_empty,
      );
      if (blk_prev) {
        this.m_block_store.sizes.set(
          block_index - 1,
          this.m_block_store.sizes.get(block_index - 1) + length,
        );
        this.m_cur_size += length;
        adjust_block_positions(this.Traits.loop_unrolling)(this.m_block_store, block_index, length);
        return this.get_iterator(block_index - 1);
      }
      this.m_block_store.insert(block_index, start_pos, length, null);
      this.m_cur_size += length;
      adjust_block_positions(this.Traits.loop_unrolling)(
        this.m_block_store,
        block_index + 1,
        length,
      );
      return this.get_iterator(block_index);
    }
    const size_blk_prev = pos - start_pos;
    const size_blk_next = this.m_block_store.sizes.get(block_index) - size_blk_prev;
    this.m_block_store.insert(block_index + 1, 2);
    this.m_block_store.sizes.set(block_index + 1, length);
    this.m_block_store.sizes.set(block_index + 2, size_blk_next);
    this.m_block_store.element_blocks.set(
      block_index + 2,
      this.Traits.block_funcs.create_new_block(get_block_type(blk_data), 0),
    );
    const next_data = this.m_block_store.element_blocks.get(block_index + 2) as base_element_block;
    this.m_hdl_event.element_block_acquired(next_data);
    if (size_blk_prev > size_blk_next) {
      this.Traits.block_funcs.assign_values_from_block(
        next_data,
        blk_data,
        size_blk_prev,
        size_blk_next,
      );
      this.Traits.block_funcs.resize_block(blk_data, size_blk_prev);
      this.m_block_store.sizes.set(block_index, size_blk_prev);
    } else {
      this.Traits.block_funcs.assign_values_from_block(next_data, blk_data, 0, size_blk_prev);
      this.m_block_store.sizes.set(block_index + 2, size_blk_prev);
      this.Traits.block_funcs.erase(blk_data, 0, size_blk_prev);
      this.m_block_store.sizes.set(block_index, size_blk_next);
      const position = this.m_block_store.positions.get(block_index);
      this.m_block_store.swap(block_index, block_index + 2);
      this.m_block_store.positions.set(block_index, position);
    }
    this.m_cur_size += length;
    this.m_block_store.calc_block_position(block_index + 1);
    this.m_block_store.calc_block_position(block_index + 2);
    adjust_block_positions(this.Traits.loop_unrolling)(this.m_block_store, block_index + 3, length);
    return this.get_iterator(block_index + 1);
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
    if (this.m_block_store.positions.size() === 0) {
      this.m_block_store.push_back(0, len, null);
      this.m_cur_size = len;
      return true;
    }
    let new_block_added = false;
    const last = this.m_block_store.element_blocks.size() - 1;
    const last_data = this.m_block_store.element_blocks.get(last);
    if (!last_data) this.m_block_store.sizes.set(last, this.m_block_store.sizes.get(last) + len);
    else {
      this.m_block_store.push_back(this.m_cur_size, len, null);
      new_block_added = true;
    }
    this.m_cur_size += len;
    return new_block_added;
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
    if (new_size === this.m_cur_size) return;
    if (!new_size) {
      this.clear();
      return;
    }
    if (new_size > this.m_cur_size) {
      this.append_empty(new_size - this.m_cur_size);
      return;
    }
    const new_end_row = new_size - 1;
    const block_index = get_block_position(this.m_block_store, this.m_cur_size, new_end_row);
    if (block_index === this.m_block_store.positions.size())
      throw_block_position_not_found(
        "multi_type_vector::resize",
        4833,
        new_end_row,
        this.block_size(),
        this.size(),
      );
    const data = this.m_block_store.element_blocks.get(block_index);
    const start_row_in_block = this.m_block_store.positions.get(block_index);
    const end_row_in_block = start_row_in_block + this.m_block_store.sizes.get(block_index) - 1;
    if (new_end_row < end_row_in_block) {
      const new_block_size = new_end_row - start_row_in_block + 1;
      if (data) {
        this.Traits.block_funcs.overwrite_values(
          data,
          new_end_row + 1,
          end_row_in_block - new_end_row,
        );
        this.Traits.block_funcs.resize_block(data, new_block_size);
      }
      this.m_block_store.sizes.set(block_index, new_block_size);
    }
    delete_element_blocks(
      this.m_block_store,
      this.m_hdl_event,
      this.Traits.block_funcs,
      block_index + 1,
      this.m_block_store.element_blocks.size(),
    );
    const len = this.m_block_store.element_blocks.size() - block_index - 1;
    this.m_block_store.erase(block_index + 1, len);
    this.m_cur_size = new_size;
  }
}

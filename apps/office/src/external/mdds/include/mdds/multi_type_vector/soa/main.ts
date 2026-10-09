/** @fileoverview Original private SoA block_slot_type, blocks_type and blocks_to_transfer owners; no replacement multi_type_vector engine. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { integrity_error } from "../../global.ts";
import { type base_element_block } from "../types.ts";
import {
  type DelayedVectorValue,
  type delayed_delete_vector_iterator,
} from "../delayed_delete_vector.ts";
import { type MDDS_MTV_DEFINE_ELEMENT_CALLBACKS } from "../macro.ts";
import { empty_event_func } from "../util.ts";
import {
  grouped_iterator_type,
  vector_iterator,
  iterator_base,
  const_iterator_base,
} from "./iterator.ts";
import { private_data_forward_update, private_data_no_update } from "../iterator_node.ts";
import { std_vector } from "../vector_storage.ts";
import { clone_construction_type, type default_traits } from "../util.ts";
import {
  copy_blocks,
  equal_blocks,
  erase,
  initialize_element_blocks,
  delete_element_blocks,
  mutate_blocks,
} from "./main_def.ts";
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
    delete_element_blocks(
      this.m_block_store,
      this.m_hdl_event,
      this.Traits.block_funcs,
      0,
      this.m_block_store.positions.size(),
    );
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
    delete_element_blocks(
      this.m_block_store,
      this.m_hdl_event,
      this.Traits.block_funcs,
      0,
      this.m_block_store.element_blocks.size(),
    );
    this.m_block_store.clear();
    this.m_cur_size = 0;
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
  /** Adapts original native begin/end/reverse grouped array cursor syntax. @param index - Native base index. @param reverse - Reverse category. @returns Borrowed group. */
  private grouped(index: number, reverse = false): grouped_iterator_type {
    index = reverse ? index - 1 : index;
    return new grouped_iterator_type(
      new vector_iterator(this.m_block_store.positions.store().values as number[], index, reverse),
      new vector_iterator(this.m_block_store.sizes.store().values as number[], index, reverse),
      new vector_iterator(
        this.m_block_store.element_blocks.store().values as (base_element_block | null)[],
        index,
        reverse,
      ),
    );
  }
  /** Original mutable begin factory. @returns Iterator. */
  public begin(): iterator_base<this> {
    return new iterator_base(
      { private_data_update: private_data_forward_update },
      this.grouped(0),
      this.grouped(this.block_size()),
      this,
      0,
    );
  }
  /** Original mutable end factory. @returns Iterator. */
  public end(): iterator_base<this> {
    return new iterator_base(
      { private_data_update: private_data_forward_update },
      this.grouped(this.block_size()),
      this.grouped(this.block_size()),
      this,
      this.block_size(),
    );
  }
  /** Original const begin factory. @returns Const iterator. */
  public cbegin(): const_iterator_base<this> {
    return new const_iterator_base(
      { private_data_update: private_data_forward_update },
      this.grouped(0),
      this.grouped(this.block_size()),
      this,
      0,
    );
  }
  /** Original const end factory. @returns Const iterator. */
  public cend(): const_iterator_base<this> {
    return new const_iterator_base(
      { private_data_update: private_data_forward_update },
      this.grouped(this.block_size()),
      this.grouped(this.block_size()),
      this,
      this.block_size(),
    );
  }
  /** Original reverse begin uses base-end cursors and no private-index update. @returns Reverse iterator. */
  public rbegin(): iterator_base<this> {
    return new iterator_base(
      { private_data_update: private_data_no_update },
      this.grouped(this.block_size(), true),
      this.grouped(0, true),
      this,
      0,
    );
  }
  /** Original reverse end uses base-begin cursors and original zero index witness. @returns Reverse iterator. */
  public rend(): iterator_base<this> {
    return new iterator_base(
      { private_data_update: private_data_no_update },
      this.grouped(0, true),
      this.grouped(0, true),
      this,
      0,
    );
  }
  /** Original const reverse begin factory. @returns Const reverse iterator. */
  public crbegin(): const_iterator_base<this> {
    return new const_iterator_base(
      { private_data_update: private_data_no_update },
      this.grouped(this.block_size(), true),
      this.grouped(0, true),
      this,
      0,
    );
  }
  /** Original const reverse end factory. @returns Const reverse iterator. */
  public crend(): const_iterator_base<this> {
    return new const_iterator_base(
      { private_data_update: private_data_no_update },
      this.grouped(0, true),
      this.grouped(0, true),
      this,
      0,
    );
  }
}

/** @fileoverview Original mdds SoA grouped iterator updater and mutable/const cached-node traversal. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { type base_element_block, element_type_empty, get_block_type } from "../types.ts";
import { iterator_value_node, type IteratorNodeView, type NodeUpdate } from "../iterator_node.ts";
/** Erased std::vector iterator syntax; borrows an array without owning storage or invalidation policy. */
export class vector_iterator<T> {
  /** Explicit native array, offset and forward/reverse category witnesses. @param values - Borrowed array or singular. @param index - Element offset. @param reverse - Native reverse category. @returns Cursor. */
  public constructor(
    private values: readonly T[] | null = null,
    public index = 0,
    private reverse = false,
  ) {}
  /** Native iterator value copy. @returns Cursor. */
  public copy(): vector_iterator<T> {
    return new vector_iterator(this.values, this.index, this.reverse);
  }
  /** Native assignment. @param other - Source. @returns This cursor. */
  public assign(other: vector_iterator<T>): this {
    this.values = other.values;
    this.index = other.index;
    this.reverse = other.reverse;
    return this;
  }
  /** Original source increment. @returns Nothing. */
  public inc(): void {
    this.index += this.reverse ? -1 : 1;
  }
  /** Original source decrement. @returns Nothing. */
  public dec(): void {
    this.index += this.reverse ? 1 : -1;
  }
  /** Borrows native element; valid non-singular/non-end lifetime is the caller precondition. @returns Element. */
  public get(): T {
    return (this.values as readonly T[])[this.index] as T;
  }
  /** Same native category comparison; array identity represents native storage identity. @param other - Cursor. @returns Equality. */
  public equals(other: vector_iterator<T>): boolean {
    return this.values === other.values && this.index === other.index;
  }
}
/** Original three separate source iterators grouped for synchronized traversal. */
export class grouped_iterator_type {
  /** Copies the three native iterator values. @param position_iterator - Position cursor. @param size_iterator - Size cursor. @param element_block_iterator - Block cursor. @returns Group. */
  public constructor(
    public position_iterator = new vector_iterator<number>(),
    public size_iterator = new vector_iterator<number>(),
    public element_block_iterator = new vector_iterator<base_element_block | null>(),
  ) {
    this.position_iterator = position_iterator.copy();
    this.size_iterator = size_iterator.copy();
    this.element_block_iterator = element_block_iterator.copy();
  }
  /** Native value copy. @returns Group. */
  public copy(): grouped_iterator_type {
    return new grouped_iterator_type(
      this.position_iterator,
      this.size_iterator,
      this.element_block_iterator,
    );
  }
  /** Original assignment preserves borrowed group reference. @param other - Source. @returns This group. */
  public assign(other: grouped_iterator_type): this {
    this.position_iterator.assign(other.position_iterator);
    this.size_iterator.assign(other.size_iterator);
    this.element_block_iterator.assign(other.element_block_iterator);
    return this;
  }
  /** Original std::swap of value members. @param other - Other group. @returns Nothing. */
  public swap(other: grouped_iterator_type): void {
    const before = this.copy();
    this.assign(other);
    other.assign(before);
  }
  /** Advances all three arrays. @returns Nothing. */
  public inc(): void {
    this.position_iterator.inc();
    this.size_iterator.inc();
    this.element_block_iterator.inc();
  }
  /** Retreats all three arrays. @returns Nothing. */
  public dec(): void {
    this.position_iterator.dec();
    this.size_iterator.dec();
    this.element_block_iterator.dec();
  }
  /** Original grouped equality and short-circuit order. @param other - Group. @returns Equality. */
  public equals(other: grouped_iterator_type): boolean {
    return (
      this.position_iterator.equals(other.position_iterator) &&
      this.size_iterator.equals(other.size_iterator) &&
      this.element_block_iterator.equals(other.element_block_iterator)
    );
  }
  /** Original negation. @param other - Group. @returns Inequality. */
  public not_equals(other: grouped_iterator_type): boolean {
    return !this.equals(other);
  }
}
/** Explicit original Traits::private_data_update static alias. */
export interface IteratorTraits {
  readonly private_data_update: NodeUpdate;
}
/** Original common updater; native debug instrumentation/stream address formatting remains separate. */
export class iterator_updater<P, K extends "updater" | "mutable" | "const" = "updater"> {
  declare protected iterator_kind: K;
  protected m_cur_node: iterator_value_node<P>;
  protected m_pos: grouped_iterator_type;
  protected m_end: grouped_iterator_type;
  /** Retains original default, copied grouped source and end constructors. @param pos - Native cursor. @param end - Native end. @param parent - Borrowed container identity. @param block_index - Bounded size_t index. @returns Updater. */
  public constructor(
    pos = new grouped_iterator_type(),
    end = new grouped_iterator_type(),
    parent: P | null = null,
    block_index = 0,
  ) {
    this.m_cur_node = new iterator_value_node(parent, block_index);
    this.m_pos = pos.copy();
    this.m_end = end.copy();
    if (this.m_pos.not_equals(this.m_end)) this.update_node();
  }
  /** Copies all original cached/cursor values in place. @param other - Source. @returns This updater. */
  public assign(other: iterator_updater<P, K>): this {
    this.m_cur_node.assign(other.m_cur_node);
    this.m_pos.assign(other.m_pos);
    this.m_end.assign(other.m_end);
    return this;
  }
  /** Original three-array node update. @returns Nothing. */
  protected update_node(): void {
    this.m_cur_node.position = this.m_pos.position_iterator.get();
    this.m_cur_node.size = this.m_pos.size_iterator.get();
    this.m_cur_node.data = this.m_pos.element_block_iterator.get();
    this.m_cur_node.type = this.m_cur_node.data
      ? get_block_type(this.m_cur_node.data)
      : element_type_empty;
  }
  /** Original increment retains the previous cached node on reaching end. @returns Cached node or null. */
  protected inc(): iterator_value_node<P> | null {
    this.m_pos.inc();
    if (this.m_pos.equals(this.m_end)) return null;
    this.update_node();
    return this.m_cur_node;
  }
  /** Original decrement always updates the cached node. @returns Node. */
  protected dec(): iterator_value_node<P> {
    this.m_pos.dec();
    this.update_node();
    return this.m_cur_node;
  }
  /** Original end-aware complete updater equality. @param other - Updater. @returns Equality. */
  public equals(other: iterator_updater<P, K>): boolean {
    if (this.m_pos.not_equals(this.m_end) && other.m_pos.not_equals(other.m_end))
      if (this.m_cur_node.not_equals(other.m_cur_node)) return false;
    return this.m_pos.equals(other.m_pos) && this.m_end.equals(other.m_end);
  }
  /** Original negation. @param other - Updater. @returns Inequality. */
  public not_equals(other: iterator_updater<P, K>): boolean {
    return !this.equals(other);
  }
  /** Swaps node and both grouped cursor values in place. @param other - Updater. @returns Nothing. */
  public swap(other: iterator_updater<P, K>): void {
    this.m_cur_node.swap(other.m_cur_node);
    this.m_pos.swap(other.m_pos);
    this.m_end.swap(other.m_end);
  }
  /** Borrows original cached node. @returns Node. */
  public get_node(): IteratorNodeView<P> {
    return this.m_cur_node;
  }
  /** Borrows original current grouped cursor. @returns Group. */
  public get_pos(): Readonly<grouped_iterator_type> {
    return this.m_pos;
  }
  /** Borrows original grouped end. @returns Group. */
  public get_end(): Readonly<grouped_iterator_type> {
    return this.m_end;
  }
}
/** Original mutable bidirectional iterator. */
export class iterator_base<P> extends iterator_updater<P, "mutable"> {
  /** Explicit native template trait and original constructor arguments. @param Traits - Update alias. @param pos - Current grouped cursor. @param end - Grouped end. @param parent - Parent identity. @param block_index - Bounded native index. @returns Iterator. */
  public constructor(
    public readonly Traits: IteratorTraits,
    pos = new grouped_iterator_type(),
    end = new grouped_iterator_type(),
    parent: P | null = null,
    block_index = 0,
  ) {
    super(pos, end, parent, block_index);
  }
  /** Original implicit copy constructor. @returns Independent cached iterator. */
  public copy(): iterator_base<P> {
    return new iterator_base<P>(this.Traits).assign(this);
  }
  /** Original dereference/arrow cached reference. @returns Mutable node. */
  public get(): iterator_value_node<P> {
    return this.m_cur_node;
  }
  /** Original prefix increment ordering. @returns This iterator. */
  public increment(): this {
    this.Traits.private_data_update.inc(this.m_cur_node);
    this.inc();
    return this;
  }
  /** Original prefix decrement ordering. @returns This iterator. */
  public decrement(): this {
    this.dec();
    this.Traits.private_data_update.dec(this.m_cur_node);
    return this;
  }
  /** std::advance bidirectional syntax adapter for actual shared utility. @param steps - Signed distance. @returns This iterator. */
  public advance(steps: number): this {
    while (steps > 0) {
      this.increment();
      --steps;
    }
    while (steps < 0) {
      this.decrement();
      ++steps;
    }
    return this;
  }
}
/** Original const bidirectional counterpart; TypeScript exposes readonly cached fields. */
export class const_iterator_base<P> extends iterator_updater<P, "const"> {
  /** Original default/position constructor with erased template witness. @param Traits - Update alias. @param pos - Cursor. @param end - End. @param parent - Identity. @param block_index - Bounded index. @returns Const iterator. */
  public constructor(
    public readonly Traits: IteratorTraits,
    pos = new grouped_iterator_type(),
    end = new grouped_iterator_type(),
    parent: P | null = null,
    block_index = 0,
  ) {
    super(pos, end, parent, block_index);
  }
  /** Original non-const conversion reconstructs the node from the arrays, rather than copying cached fields. @param other - Mutable counterpart. @returns Const iterator. */
  public static from_mutable<P>(other: iterator_base<P>): const_iterator_base<P> {
    const nd = other.get_node();
    return new const_iterator_base(
      other.Traits,
      other.get_pos().copy(),
      other.get_end().copy(),
      nd.__private_data.parent,
      nd.__private_data.block_index,
    );
  }
  /** Original implicit same-type copy constructor. @returns Const copy. */
  public copy(): const_iterator_base<P> {
    return new const_iterator_base<P>(this.Traits).assign(this);
  }
  /** Original const dereference/arrow reference. @returns Readonly cached node. */
  public get(): IteratorNodeView<P> {
    return this.m_cur_node;
  }
  /** Original prefix increment ordering. @returns This iterator. */
  public increment(): this {
    this.Traits.private_data_update.inc(this.m_cur_node);
    this.inc();
    return this;
  }
  /** Original prefix decrement ordering. @returns This iterator. */
  public decrement(): this {
    this.dec();
    this.Traits.private_data_update.dec(this.m_cur_node);
    return this;
  }
  /** Original std::advance adapter. @param steps - Signed distance. @returns This iterator. */
  public advance(steps: number): this {
    while (steps > 0) {
      this.increment();
      --steps;
    }
    while (steps < 0) {
      this.decrement();
      ++steps;
    }
    return this;
  }
}

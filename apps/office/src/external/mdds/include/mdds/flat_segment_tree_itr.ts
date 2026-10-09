/** @fileoverview Original flat_segment_tree_itr.hpp linked-leaf bidirectional and segment iterators with native end-position state. */
// SPDX-FileCopyrightText: 2010 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import type { node, SegmentValue } from "./node";
import { ref_pair } from "./ref_pair";

/** Original friend access to an owner and its current border leaves, separate from iterator position. */
export interface IteratorOwner<Value extends SegmentValue> {
  readonly owner: object;
  readonly zero: Value;
  left(): node<Value> | null;
  right(): node<Value> | null;
}
/** Original private iterator state shared only with native owner friends in this module. */
interface IteratorState<Value extends SegmentValue> {
  parent: IteratorOwner<Value> | null;
  pos: node<Value> | null;
  end: boolean;
}
/** Private iterator storage bridges original C++ friend access without a public position getter. */
const positions = new WeakMap<object, IteratorState<SegmentValue>>();
/** Reads original friend-visible state. @param iterator - Iterator. @returns Private native fields. */
export function iterator_state<Value extends SegmentValue>(
  iterator: const_iterator_base<Value>,
): IteratorState<Value> {
  return positions.get(iterator) as IteratorState<Value>;
}
/** Original linked leaf iterator and direction handler, with explicit operator adapters. */
export class const_iterator_base<Value extends SegmentValue, Reverse extends boolean = boolean> {
  private readonly reverse: Reverse;
  /** Creates a default null iterator, border/end iterator or explicit leaf position. @param parent - Original owner view. @param position - Native end flag or explicit leaf. @param reverse - Reverse handler. @returns Iterator. */
  public constructor(
    parent: IteratorOwner<Value> | null = null,
    position: boolean | node<Value> = false,
    reverse: Reverse = false as Reverse,
  ) {
    this.reverse = reverse;
    const state: IteratorState<Value> = {
      parent,
      pos: null,
      end: typeof position === "boolean" ? position : false,
    };
    if (typeof position !== "boolean") state.pos = position;
    else if (parent) state.pos = reverse === position ? parent.left() : parent.right();
    positions.set(this, state);
  }
  /** Copies all original iterator fields independently. @param source - Source iterator. @returns This iterator. */
  public assign(source: const_iterator_base<Value, Reverse>): this {
    positions.set(this, { ...iterator_state(source) });
    return this;
  }
  /** Copies the pointer/end state and direction. @returns Independent iterator value. */
  public copy(): const_iterator_base<Value, Reverse> {
    const result = new const_iterator_base<Value, Reverse>(null, false, this.reverse);
    return result.assign(this);
  }
  /** Adapts original pre-increment and direction handler. @returns This iterator. */
  public increment(): this {
    const state = iterator_state(this);
    const owner = state.parent as IteratorOwner<Value>;
    if (state.pos === (this.reverse ? owner.left() : owner.right())) state.end = true;
    else
      state.pos = this.reverse ? (state.pos as node<Value>).prev : (state.pos as node<Value>).next;
    return this;
  }
  /** Adapts original pre-decrement and end-position handler. @returns This iterator. */
  public decrement(): this {
    const state = iterator_state(this);
    if (state.end) state.end = false;
    else
      state.pos = this.reverse ? (state.pos as node<Value>).next : (state.pos as node<Value>).prev;
    return this;
  }
  /** Compares parent, node identity and the independent end flag. @param other - Other iterator. @returns Native equality. */
  public equals(other: const_iterator_base<Value, Reverse>): boolean {
    const own = iterator_state(this),
      otherState = iterator_state(other);
    return (
      own.parent?.owner === otherState.parent?.owner &&
      own.pos === otherState.pos &&
      own.end === otherState.end
    );
  }
  /** Dereferences a live node into the original borrowed pair. @returns Key and value references. */
  public value(): ref_pair<Value> {
    return new ref_pair(iterator_state(this).pos as node<Value>);
  }
}
/** Original forward specialization; only this iterator supports segment conversion. */
export class const_iterator<Value extends SegmentValue> extends const_iterator_base<Value, false> {
  /** Selects the original forward handler. @param parent - Native owner. @param position - End flag or explicit leaf. @returns Iterator. */
  public constructor(
    parent: IteratorOwner<Value> | null = null,
    position: boolean | node<Value> = false,
  ) {
    super(parent, position, false);
  }
  /** Copies original forward pointer and end state. @returns Independent iterator. */
  public override copy(): const_iterator<Value> {
    return new const_iterator<Value>().assign(this);
  }
  /** Converts a normal leaf iterator to its original segment, or owner segment end. @returns Segment iterator. */
  public to_segment(): const_segment_iterator<Value> {
    const state = iterator_state(this);
    // Original dereferences parent even on the null-parent diagnostic branch;
    // calling to_segment on a default iterator is outside its defined domain.
    const parent = state.parent as IteratorOwner<Value>;
    if (state.end || !state.pos || !state.pos.next)
      return new const_segment_iterator(parent.right(), null, parent.zero);
    return new const_segment_iterator(state.pos, state.pos.next, parent.zero);
  }
}
/** Original reverse specialization with its distinct direction handler. */
export class const_reverse_iterator<Value extends SegmentValue> extends const_iterator_base<
  Value,
  true
> {
  /** Selects original reverse border/end positioning. @param parent - Native owner. @param position - End flag. @returns Iterator. */
  public constructor(parent: IteratorOwner<Value> | null = null, position = false) {
    super(parent, position, true);
  }
  /** Copies reverse pointer and end state. @returns Independent iterator. */
  public override copy(): const_reverse_iterator<Value> {
    return new const_reverse_iterator<Value>().assign(this);
  }
}
/** Original cached start/end/value aggregate. */
export interface SegmentRecord<Value extends SegmentValue> {
  start: number;
  end: number;
  value: Value;
}
/** Original segment iterator caches values on pointer movement, preserving cache at end. */
export class const_segment_iterator<Value extends SegmentValue> {
  private m_start: node<Value> | null;
  private m_end: node<Value> | null;
  private readonly m_node: SegmentRecord<Value>;
  private readonly zero: Value;
  /** Initializes original node pointers and zero-valued cache. @param start - Start node or null. @param end - End node or null. @param zero - Native value_type{}. @returns Iterator. */
  public constructor(start: node<Value> | null, end: node<Value> | null, zero: Value) {
    this.zero = zero;
    this.m_start = start;
    this.m_end = end;
    this.m_node = { start: 0, end: 0, value: zero };
    this.update_node();
  }
  /** Copies pointers and refreshes the existing cache only when start is nonnull. @param source - Other iterator. @returns This iterator. */
  public assign(source: const_segment_iterator<Value>): this {
    this.m_start = source.m_start;
    this.m_end = source.m_end;
    if (this.m_start) this.update_node();
    return this;
  }
  /** Copies pointers and creates a fresh cache with original copy semantics. @returns Iterator copy. */
  public copy(): const_segment_iterator<Value> {
    return new const_segment_iterator<Value>(null, null, this.zero).assign(this);
  }
  /** Compares both original node identities, independently of cached values. @param other - Other iterator. @returns Equality. */
  public equals(other: const_segment_iterator<Value>): boolean {
    return this.m_start === other.m_start && this.m_end === other.m_end;
  }
  /** Borrows the existing immutable cache object, which refreshes on movement. @returns Original cache. */
  public value(): Readonly<SegmentRecord<Value>> {
    return this.m_node;
  }
  /** Adapts native pre-increment while retaining cache when reaching end. @returns This iterator. */
  public increment(): this {
    this.m_start = (this.m_start as node<Value>).next;
    this.m_end = (this.m_start as node<Value>).next;
    this.update_node();
    return this;
  }
  /** Adapts native pre-decrement. @returns This iterator. */
  public decrement(): this {
    this.m_start = (this.m_start as node<Value>).prev;
    this.m_end = (this.m_start as node<Value>).next;
    this.update_node();
    return this;
  }
  /** Retains original cache preservation at an end pointer. @returns Nothing. */
  private update_node(): void {
    if (!this.m_end) return;
    this.m_node.start = (this.m_start as node<Value>).key;
    this.m_node.end = this.m_end.key;
    this.m_node.value = (this.m_start as node<Value>).value_leaf.value;
  }
}
/** Original range retains strong border-node ownership separately from iterator positions. */
export class const_segment_range_type<Value extends SegmentValue> {
  private readonly m_left_leaf: node<Value>;
  private readonly m_right_leaf: node<Value>;
  private readonly zero: Value;
  /** Retains both border nodes, as the native intrusive_ptr range object. @param left - First leaf. @param right - Terminal leaf. @param zero - Native value_type{}. @returns Range. */
  public constructor(left: node<Value>, right: node<Value>, zero: Value) {
    this.m_left_leaf = left;
    this.m_right_leaf = right;
    this.zero = zero;
  }
  /** Reads the current next pointer of the retained first node. @returns Beginning iterator. */
  public begin(): const_segment_iterator<Value> {
    return new const_segment_iterator(this.m_left_leaf, this.m_left_leaf.next, this.zero);
  }
  /** Retains the original terminal border and null next pointer. @returns End iterator. */
  public end(): const_segment_iterator<Value> {
    return new const_segment_iterator(this.m_right_leaf, null, this.zero);
  }
}

/** @fileoverview Original mdds3.2.1 flat_segment_tree.hpp/def.inl leaf intervals and separately built pooled tree for Calc numeric keys and primitive values. */
// SPDX-FileCopyrightText: 2008 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import {
  node,
  nonleaf_node,
  tree_builder,
  link_nodes,
  disconnect_all_nodes,
  disconnect_leaf_nodes,
  count_leaf_nodes,
  count_needed_nonleaf_nodes,
} from "./node";
import type { SegmentValue, node_base } from "./node";
import {
  const_iterator,
  const_reverse_iterator,
  const_segment_iterator,
  const_segment_range_type,
  iterator_state,
} from "./flat_segment_tree_itr";
import type { IteratorOwner } from "./flat_segment_tree_itr";

/** Original search output references; null denotes an omitted output pointer. */
export type SearchResult<Value extends SegmentValue> = [
  const_iterator<Value>,
  boolean,
  Value,
  number | null,
  number | null,
];
/** Original move-constructor overload discriminator, private to this module. */
const moveConstruction = Symbol("mdds move construction");

/** Original half-open flat segment owner and lazily built search index. */
export class flat_segment_tree<Value extends SegmentValue> {
  private m_nonleaf_node_pool: nonleaf_node<Value>[] = [];
  private m_root_node: nonleaf_node<Value> | null = null;
  private m_left_leaf: node<Value> | null;
  private m_right_leaf: node<Value> | null;
  private m_init_val: Value;
  private m_valid_tree = false;
  private readonly zero: Value;
  private readonly iteratorAccess: IteratorOwner<Value>;
  /** Constructs native explicit bounds and initial value. @param min - Inclusive minimum. @param max - Exclusive maximum. @param value - Default value. @returns Tree. */
  public constructor(min: number, max: number, value: Value);
  /** Copies leaves only, or internally transfers the original move state. @param source - Source owner. @param move - Private move discriminator. @returns Tree. */
  public constructor(source: flat_segment_tree<Value>, move?: typeof moveConstruction);
  /** Dispatches original constructors without temporary fake bounds. @param source - Minimum or source. @param maxOrMove - Maximum or internal tag. @param initial - Default value. @returns Tree. */
  public constructor(
    source: number | flat_segment_tree<Value>,
    maxOrMove?: number | typeof moveConstruction,
    initial?: Value,
  ) {
    if (source instanceof flat_segment_tree) {
      this.zero = source.zero;
      this.m_init_val = source.m_init_val;
      if (maxOrMove === moveConstruction) {
        this.m_nonleaf_node_pool = source.m_nonleaf_node_pool;
        this.m_root_node = source.m_root_node;
        this.m_left_leaf = source.m_left_leaf;
        this.m_right_leaf = source.m_right_leaf;
        this.m_valid_tree = source.m_valid_tree;
        source.m_nonleaf_node_pool = [];
        source.m_root_node = null;
        source.m_left_leaf = null;
        source.m_right_leaf = null;
        source.m_valid_tree = false;
      } else {
        let input = source.m_left_leaf as node<Value>;
        this.m_left_leaf = new node(input);
        let output = this.m_left_leaf;
        while (true) {
          const next = new node(input.next as node<Value>);
          link_nodes(output, next);
          input = input.next as node<Value>;
          output = next;
          if (input === source.m_right_leaf) {
            this.m_right_leaf = output;
            break;
          }
        }
      }
    } else {
      this.m_init_val = initial as Value;
      this.zero = (typeof initial === "boolean" ? false : 0) as Value;
      this.m_left_leaf = new node(this.zero);
      this.m_right_leaf = new node(this.zero);
      this.m_left_leaf.key = source;
      this.m_right_leaf.key = maxOrMove as number;
      this.m_left_leaf.value_leaf.value = this.m_init_val;
      link_nodes(this.m_left_leaf, this.m_right_leaf);
    }
    this.iteratorAccess = {
      owner: this,
      zero: this.zero,
      /** Reads current first leaf through original friend ownership. @returns Leaf. */
      left: () => this.m_left_leaf,
      /** Reads current terminal leaf through original friend ownership. @returns Leaf. */
      right: () => this.m_right_leaf,
    };
  }
  /** Adapts native move construction and source clearing. @param source - Moved owner. @returns New owner. */
  public static move<Value extends SegmentValue>(
    source: flat_segment_tree<Value>,
  ): flat_segment_tree<Value> {
    return new flat_segment_tree(source, moveConstruction);
  }
  /** Retains native copy-and-swap assignment. @param source - Copy source. @returns This owner. */
  public assign(source: flat_segment_tree<Value>): this {
    const copy = new flat_segment_tree(source);
    this.swap(copy);
    copy.destroy();
    return this;
  }
  /** Retains native move-and-swap assignment. @param source - Moved source. @returns This owner. */
  public moveAssign(source: flat_segment_tree<Value>): this {
    const moved = flat_segment_tree.move(source);
    this.swap(moved);
    moved.destroy();
    return this;
  }
  /** Swaps every native content field while retaining iterator owner identity. @param other - Other tree. @returns Nothing. */
  public swap(other: flat_segment_tree<Value>): void {
    [this.m_nonleaf_node_pool, other.m_nonleaf_node_pool] = [
      other.m_nonleaf_node_pool,
      this.m_nonleaf_node_pool,
    ];
    [this.m_root_node, other.m_root_node] = [other.m_root_node, this.m_root_node];
    [this.m_left_leaf, other.m_left_leaf] = [other.m_left_leaf, this.m_left_leaf];
    [this.m_right_leaf, other.m_right_leaf] = [other.m_right_leaf, this.m_right_leaf];
    [this.m_init_val, other.m_init_val] = [other.m_init_val, this.m_init_val];
    [this.m_valid_tree, other.m_valid_tree] = [other.m_valid_tree, this.m_valid_tree];
  }
  /** Retains original borders/bounds/default while clearing inner leaves and index. @returns Nothing. */
  public clear(): void {
    this.destroy();
    link_nodes(this.m_left_leaf as node<Value>, this.m_right_leaf as node<Value>);
    (this.m_left_leaf as node<Value>).value_leaf.value = this.m_init_val;
    this.m_valid_tree = false;
  }
  /** Reads inclusive minimum. @returns Key. */
  public min_key(): number {
    return (this.m_left_leaf as node<Value>).key;
  }
  /** Reads exclusive maximum. @returns Key. */
  public max_key(): number {
    return (this.m_right_leaf as node<Value>).key;
  }
  /** Reads original default. @returns Value. */
  public default_value(): Value {
    return this.m_init_val;
  }
  /** Reads readiness without rebuilding. @returns Readiness. */
  public valid_tree(): boolean {
    return this.m_valid_tree;
  }
  /** Retains original deprecated readiness alias. @returns Readiness. */
  public is_tree_valid(): boolean {
    return this.m_valid_tree;
  }
  /** Counts both borders and inner leaves. @returns Count. */
  public leaf_size(): number {
    return count_leaf_nodes(this.m_left_leaf, this.m_right_leaf);
  }
  /** Creates forward first-leaf iterator. @returns Iterator. */
  public begin(): const_iterator<Value> {
    return new const_iterator(this.iteratorAccess, false);
  }
  /** Creates forward past-terminal iterator. @returns Iterator. */
  public end(): const_iterator<Value> {
    return new const_iterator(this.iteratorAccess, true);
  }
  /** Creates reverse terminal-leaf iterator. @returns Iterator. */
  public rbegin(): const_reverse_iterator<Value> {
    return new const_reverse_iterator(this.iteratorAccess, false);
  }
  /** Creates reverse past-first iterator. @returns Iterator. */
  public rend(): const_reverse_iterator<Value> {
    return new const_reverse_iterator(this.iteratorAccess, true);
  }
  /** Creates original segment beginning. @returns Iterator. */
  public begin_segment(): const_segment_iterator<Value> {
    return new const_segment_iterator(
      this.m_left_leaf,
      (this.m_left_leaf as node<Value>).next,
      this.zero,
    );
  }
  /** Creates original segment end with zero cache. @returns Iterator. */
  public end_segment(): const_segment_iterator<Value> {
    return new const_segment_iterator(this.m_right_leaf, null, this.zero);
  }
  /** Retains original strong border ownership for a segment range. @returns Range. */
  public segment_range(): const_segment_range_type<Value> {
    return new const_segment_range_type(
      this.m_left_leaf as node<Value>,
      this.m_right_leaf as node<Value>,
      this.zero,
    );
  }
  /** Compares leaf values/keys only. @param other - Other owner. @returns Equality. */
  public equals(other: flat_segment_tree<Value>): boolean {
    let first = this.m_left_leaf,
      second = other.m_left_leaf;
    if ((!first && second) || (first && !second)) return false;
    while (first) {
      if (!second || !first.equals(second)) return false;
      first = first.next;
      second = second.next;
    }
    return second === null;
  }
  /** Inserts after searching from the first leaf. @param start - Start. @param end - End. @param value - Value. @returns Iterator/change flag. */
  public insert_front(start: number, end: number, value: Value): [const_iterator<Value>, boolean] {
    return this.insert_segment_impl(start, end, value, true);
  }
  /** Inserts after searching backward from the terminal leaf. @param start - Start. @param end - End. @param value - Value. @returns Original result. */
  public insert_back(start: number, end: number, value: Value): [const_iterator<Value>, boolean] {
    return this.insert_segment_impl(start, end, value, false);
  }
  /** Retains native hint validation and fallback. @param hint - Leaf hint. @param start - Start. @param end - End. @param value - Value. @returns Original insertion result. */
  public insert(
    hint: const_iterator<Value>,
    start: number,
    end: number,
    value: Value,
  ): [const_iterator<Value>, boolean] {
    const state = iterator_state(hint);
    if (!state.pos || state.parent?.owner !== this) return this.insert_front(start, end, value);
    if (start < state.pos.key) return this.insert_front(start, end, value);
    const adjusted = this.adjust_segment_range(start, end);
    if (!adjusted) return [this.end(), false];
    return this.insert_to_pos(
      this.get_insertion_pos_leaf(adjusted[0], state.pos) as node<Value>,
      adjusted[0],
      adjusted[1],
      value,
    );
  }
  /** Retains native ordering/overlap clipping including strict end<minimum guard. @param start - Requested start. @param end - Requested end. @returns Adjusted pair or null. */
  private adjust_segment_range(start: number, end: number): [number, number] | null {
    if (end <= start) return null;
    if (end < this.min_key() || this.max_key() <= start) return null;
    if (start < this.min_key()) start = this.min_key();
    if (this.max_key() < end) end = this.max_key();
    return [start, end];
  }
  /** Retains original directional leaf search. @param start - Start. @param end - End. @param value - Value. @param forward - Direction. @returns Result. */
  private insert_segment_impl(
    start: number,
    end: number,
    value: Value,
    forward: boolean,
  ): [const_iterator<Value>, boolean] {
    const adjusted = this.adjust_segment_range(start, end);
    if (!adjusted) return [this.end(), false];
    [start, end] = adjusted;
    let position: node<Value>;
    if (forward) position = this.get_insertion_pos_leaf(start, this.m_left_leaf) as node<Value>;
    else {
      let current = this.m_right_leaf;
      while (current && !(current.key < start)) current = current.prev;
      position = current ? (current.next as node<Value>) : (this.m_left_leaf as node<Value>);
    }
    // Initialized clipped start guarantees a node at/before the terminal
    // border; the native missing-start diagnostic cannot occur here.
    return this.insert_to_pos(position, start, end, value);
  }
  /** Executes original linked insertion, merging and disconnection. @param position - First node at/above start. @param start - Start. @param end - End. @param value - Value. @returns Original result. */
  private insert_to_pos(
    position: node<Value>,
    start: number,
    end: number,
    value: Value,
  ): [const_iterator<Value>, boolean] {
    const finish = this.get_insertion_pos_leaf(end, position) as node<Value>;
    // Clipped end <= terminal key guarantees original end_pos is nonnull.
    let begin: node<Value>, old: Value;
    let changed = false;
    if (position.key === start) {
      old = position.value_leaf.value;
      if (position.prev && position.prev.value_leaf.value === value) begin = position.prev;
      else {
        position.value_leaf.value = value;
        begin = position;
        changed = old !== value;
      }
    } else if ((position.prev as node<Value>).value_leaf.value === value) {
      old = (position.prev as node<Value>).value_leaf.value;
      begin = position.prev as node<Value>;
    } else {
      begin = new node(this.zero);
      begin.key = start;
      begin.value_leaf.value = value;
      const left = position.prev as node<Value>;
      old = left.value_leaf.value;
      link_nodes(left, begin);
      link_nodes(begin, position);
      changed = true;
    }
    let current = begin.next as node<Value>;
    while (current !== finish) {
      (current.prev as node<Value>).next = null;
      current.prev = null;
      old = current.value_leaf.value;
      current = current.next as node<Value>;
      changed = true;
    }
    if (finish.key === end) {
      if (finish.next && finish.value_leaf.value === value) {
        begin.next = finish.next;
        finish.next.prev = begin;
        disconnect_all_nodes(finish);
        changed = true;
      } else if (begin.next !== finish) {
        link_nodes(begin, finish);
        changed = true;
      }
    } else if (old === value) {
      if (begin.next !== finish) {
        link_nodes(begin, finish);
        changed = true;
      }
    } else {
      const boundary = new node(this.zero);
      boundary.key = end;
      boundary.value_leaf.value = old;
      link_nodes(begin, boundary);
      link_nodes(boundary, finish);
      changed = true;
    }
    if (changed) this.m_valid_tree = false;
    return [new const_iterator(this.iteratorAccess, begin), changed];
  }
  /** Finds the first linked key >= query from a supplied native position. @param key - Query at least minimum. @param start - Start or null hint. @returns Node or null. */
  private get_insertion_pos_leaf(key: number, start: node<Value> | null): node<Value> | null {
    for (let current = start; current; current = current.next)
      if (key <= current.key) return current;
    return null;
  }
  /** Adapts native mutable-output search. @param key - Key. @param value - Existing output. @param start - Existing start or null. @param end - Existing end or null. @returns Native outputs. */
  public search(
    key: number,
    value: Value,
    start?: number | null,
    end?: number | null,
  ): SearchResult<Value>;
  /** Adapts native hinted mutable-output search. @param hint - Hint. @param key - Key. @param value - Output. @param start - Start or null. @param end - End or null. @returns Native outputs. */
  public search(
    hint: const_iterator<Value>,
    key: number,
    value: Value,
    start?: number | null,
    end?: number | null,
  ): SearchResult<Value>;
  /** Retains key-only iterator search. @param key - Key. @returns Iterator. */
  public search(key: number): const_iterator<Value>;
  /** Retains native direct-hint key-only search. @param hint - Hint. @param key - Key. @returns Iterator. */
  public search(hint: const_iterator<Value>, key: number): const_iterator<Value>;
  /** Dispatches original overloads preserving failure outputs. @param first - Hint or key. @param second - Key or output. @param third - Output or start. @param fourth - Start or end. @param fifth - End. @returns Native overload result. */
  public search(
    first: number | const_iterator<Value>,
    second?: number | Value,
    third?: Value | number | null,
    fourth?: number | null,
    fifth?: number | null,
  ): SearchResult<Value> | const_iterator<Value> {
    const hinted = first instanceof const_iterator;
    const key = hinted ? (second as number) : first;
    const iteratorOnly = hinted ? third === undefined : second === undefined;
    if (iteratorOnly) {
      if (key < this.min_key() || this.max_key() <= key) return this.end();
      const hint = hinted ? iterator_state(first).pos : this.m_left_leaf;
      const position = this.get_insertion_pos_leaf(key, hint);
      if (!position) return this.end();
      return this.search_impl(position, key, this.zero, null, null)[0];
    }
    const value = (hinted ? third : second) as Value;
    const start = (hinted ? fourth : third) as number | null | undefined;
    const end = hinted ? fifth : fourth;
    if (key < this.min_key() || this.max_key() <= key)
      return [this.end(), false, value, start ?? null, end ?? null];
    let origin = this.m_left_leaf;
    if (hinted) {
      const state = iterator_state(first);
      if (state.pos && state.parent?.owner === this && key >= state.pos.key) origin = state.pos;
    }
    return this.search_impl(
      this.get_insertion_pos_leaf(key, origin) as node<Value>,
      key,
      value,
      start ?? null,
      end ?? null,
    );
  }
  /** Shares original exact/previous-node comparisons between search overload families. @param position - Node at/above query. @param key - Key. @param value - Existing output. @param start - Existing start or null. @param end - Existing end or null. @returns Native outputs. */
  private search_impl(
    position: node<Value>,
    key: number,
    value: Value,
    start: number | null,
    end: number | null,
  ): SearchResult<Value> {
    let found: node<Value>;
    if (position.key === key) found = position;
    else if (position.prev && position.prev.key < key) found = position.prev;
    else return [this.end(), false, value, start, end];
    value = found.value_leaf.value;
    if (start !== null) start = found.key;
    if (end !== null && found.next) end = found.next.key;
    return [new const_iterator(this.iteratorAccess, found), true, value, start, end];
  }
  /** Searches an already valid index with native mutable outputs. @param key - Key. @param value - Existing output. @param start - Existing start or null. @param end - Existing end or null. @returns Outputs. */
  public search_tree(
    key: number,
    value: Value,
    start?: number | null,
    end?: number | null,
  ): SearchResult<Value>;
  /** Searches an already valid index for an iterator. @param key - Key. @returns Iterator. */
  public search_tree(key: number): const_iterator<Value>;
  /** Dispatches original index search without rebuilding. @param key - Query. @param value - Optional output. @param start - Start or null. @param end - End or null. @returns Native result. */
  public search_tree(
    key: number,
    value?: Value,
    start: number | null = null,
    end: number | null = null,
  ): SearchResult<Value> | const_iterator<Value> {
    const found = this.search_tree_for_leaf_node(key);
    const iterator = found ? new const_iterator(this.iteratorAccess, found) : this.end();
    if (value === undefined) return iterator;
    if (!found) return [iterator, false, value, start, end];
    return [
      iterator,
      true,
      found.value_leaf.value,
      start === null ? null : found.key,
      end === null ? null : (found.next as node<Value>).key,
    ];
  }
  /** Descends original paired-child bounds. @param key - Query. @returns Found leaf or null. */
  private search_tree_for_leaf_node(key: number): node<Value> | null {
    if (!this.m_root_node || !this.m_valid_tree) return null;
    if (key < this.min_key() || this.max_key() <= key) return null;
    let current = this.m_root_node;
    // Every built parent has a left child and covers query. If its left child
    // excludes query, the right child necessarily covers it. Native defensive
    // malformed-tree returns cannot occur while the original index is valid.
    while (!(current.left as node_base<Value>).is_leaf) {
      const left = current.left as nonleaf_node<Value>;
      if (left.low <= key && key < left.high) current = left;
      else current = current.right as nonleaf_node<Value>;
    }
    const left = current.left as node<Value>,
      right = current.right as node<Value>;
    // Selected bottom pair covers [left.key, high); an unmatched terminal leaf
    // has zero width and is never selected for a query < max_key().
    return left.key <= key && key < right.key ? left : right;
  }
  /** Rebuilds the exact original pool size and bottom-up paired index. @returns Nothing. */
  public build_tree(): void {
    if (!this.m_left_leaf) return;
    this.m_nonleaf_node_pool = Array.from(
      { length: count_needed_nonleaf_nodes(this.leaf_size()) },
      /** Initializes an original disconnected pool slot. @returns Node. */
      () => new nonleaf_node<Value>(),
    );
    this.m_root_node = new tree_builder(this.m_nonleaf_node_pool).build(this.m_left_leaf);
    this.m_valid_tree = true;
  }
  /** Removes original half-open span, shifts subsequent keys and appends default tail. @param start - Start. @param end - End. @returns Nothing. */
  public shift_left(start: number, end: number): void {
    if (start >= end) return;
    const left = this.min_key(),
      right = this.max_key();
    if (start < left || end < left) return;
    if (start > right || end > right) return;
    const position =
      left === start
        ? (this.m_left_leaf as node<Value>)
        : (this.get_insertion_pos_leaf(
            start,
            (this.m_left_leaf as node<Value>).next,
          ) as node<Value>);
    // In-bound start guarantees a node at or before terminal.
    const size = end - start;
    if (position === this.m_right_leaf) {
      this.append_new_segment(right <= end ? start : right - size);
      return;
    }
    if (end < position.key) {
      this.shift_leaf_key_left(position, size);
      this.append_new_segment(right - size);
      this.m_valid_tree = false;
      return;
    }
    position.key = start;
    let current = position.next as node<Value>;
    let last = position.value_leaf.value;
    while (current !== this.m_right_leaf && current.key <= end) {
      last = current.value_leaf.value;
      const next = current.next as node<Value>;
      disconnect_all_nodes(current);
      current = next;
    }
    position.value_leaf.value = last;
    link_nodes(position, current);
    if (position.prev && position.prev.value_leaf.value === last) {
      link_nodes(position.prev, position.next as node<Value>);
      disconnect_all_nodes(position);
    }
    this.shift_leaf_key_left(current, size);
    this.m_valid_tree = false;
    this.append_new_segment(right - size);
  }
  /** Retains original right shifting, coinciding start-node skipping and clipping. @param pos - Position. @param size - Positive amount. @param skip - Preserve a coinciding start node. @returns Nothing. */
  public shift_right(pos: number, size: number, skip: boolean): void {
    if (size <= 0) return;
    if (pos < this.min_key() || this.max_key() <= pos) return;
    const left = this.m_left_leaf as node<Value>;
    if (left.key === pos) {
      this.shift_leaf_key_right(left.next as node<Value>, size);
      if (left.value_leaf.value !== this.m_init_val && !skip) {
        if (size < this.max_key() - this.min_key()) {
          const boundary = new node(this.zero);
          boundary.key = pos + size;
          boundary.value_leaf.value = left.value_leaf.value;
          left.value_leaf.value = this.m_init_val;
          link_nodes(boundary, left.next as node<Value>);
          link_nodes(left, boundary);
        } else left.value_leaf.value = this.m_init_val;
      }
      this.m_valid_tree = false;
      return;
    }
    let current = this.get_insertion_pos_leaf(pos, left.next) as node<Value>;
    // In-bound pos guarantees a node. Matching skipped node is not terminal
    // because pos < max_key(), so its next always exists.
    if (skip && current.key === pos) current = current.next as node<Value>;
    this.shift_leaf_key_right(current, size);
    this.m_valid_tree = false;
  }
  /** Appends original default tail without altering readiness for value-only changes. @param start - Tail start. @returns Nothing. */
  private append_new_segment(start: number): void {
    const right = this.m_right_leaf as node<Value>,
      previous = right.prev as node<Value>;
    if (previous.key === start) {
      previous.value_leaf.value = this.m_init_val;
      return;
    }
    if (previous.value_leaf.value === this.m_init_val) return;
    const value = new node(this.zero);
    value.key = start;
    value.value_leaf.value = this.m_init_val;
    link_nodes(previous, value);
    link_nodes(value, right);
    this.m_valid_tree = false;
  }
  /** Shifts linked keys left, excluding terminal border. @param first - First node. @param size - Amount. @returns Nothing. */
  private shift_leaf_key_left(first: node<Value>, size: number): void {
    for (let current = first; current !== this.m_right_leaf; current = current.next as node<Value>)
      current.key -= size;
  }
  /** Shifts linked keys right and disconnects clipped nodes exactly as original. @param first - First node. @param size - Amount. @returns Nothing. */
  private shift_leaf_key_right(first: node<Value>, size: number): void {
    let current = first;
    const right = this.m_right_leaf as node<Value>;
    while (current !== right) {
      current.key += size;
      if (current.key < right.key) {
        current = current.next as node<Value>;
        continue;
      }
      const last = current.prev as node<Value>;
      while (current !== right) {
        const next = current.next as node<Value>;
        disconnect_all_nodes(current);
        current = next;
      }
      link_nodes(last, right);
      return;
    }
  }
  /** Disconnects original leaves and clears root/pool, retaining borders for clear. @returns Nothing. */
  private destroy(): void {
    disconnect_leaf_nodes(this.m_left_leaf, this.m_right_leaf);
    this.m_nonleaf_node_pool = [];
    this.m_root_node = null;
  }
}

/** @fileoverview Initialized mdds3.2.1 node.hpp leaf links, non-leaf pool and original tree builder for numeric Calc keys. */
// SPDX-FileCopyrightText: 2008 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT

/** Primitive value specializations required by original Calc flat segment owners. */
export type SegmentValue = number | boolean;
/** Original shared leaf/non-leaf parent and discriminator. */
export interface node_base<Value extends SegmentValue> {
  parent: nonleaf_node<Value> | null;
  readonly is_leaf: boolean;
}
/** Original value-bearing leaf; JavaScript owns references in place of intrusive_ptr lifetimes. */
export class node<Value extends SegmentValue> implements node_base<Value> {
  public parent: nonleaf_node<Value> | null = null;
  public readonly is_leaf = true;
  public key = 0;
  public value_leaf: { value: Value };
  public prev: node<Value> | null = null;
  public next: node<Value> | null = null;
  /** Initializes value_type{} explicitly or copies stored values without connections. @param source - Native zero value or copy source. @returns Leaf. */
  public constructor(source: Value | node<Value>) {
    if (source instanceof node) {
      this.key = source.key;
      this.value_leaf = { value: source.value_leaf.value };
    } else this.value_leaf = { value: source };
  }
  /** Copies only the leaf value, preserving key and links. @param source - Other node. @returns This node. */
  public assign(source: node<Value>): this {
    if (source === this) return this;
    this.value_leaf.value = source.value_leaf.value;
    return this;
  }
  /** Compares stored key and value. @param other - Other leaf. @returns Equality. */
  public equals(other: node<Value>): boolean {
    return this.key === other.key && this.value_leaf.value === other.value_leaf.value;
  }
  /** Retains original diagnostic formatting. @returns Bracketed key. */
  public to_string(): string {
    return `[${this.key}]`;
  }
}
/** Original pooled non-leaf node and half-open child bounds. */
export class nonleaf_node<Value extends SegmentValue> implements node_base<Value> {
  public parent: nonleaf_node<Value> | null = null;
  public readonly is_leaf = false;
  public low = 0;
  public high = 0;
  public left: node_base<Value> | null = null;
  public right: node_base<Value> | null = null;
  /** Copies stored bounds only, retaining disconnected default links. @param source - Optional original copy source. @returns Non-leaf. */
  public constructor(source?: nonleaf_node<Value>) {
    if (source) {
      this.low = source.low;
      this.high = source.high;
    }
  }
  /** Native assignment copies only the empty nonleaf_value_type, retaining bounds and links. @param source - Other node. @returns This node. */
  public assign(source: nonleaf_node<Value>): this {
    void source;
    return this;
  }
  /** Compares bounds; the original empty nonleaf value always compares equal. @param other - Other node. @returns Equality. */
  public equals(other: nonleaf_node<Value>): boolean {
    return this.low === other.low && this.high === other.high;
  }
  /** Formats the original half-open interval. @returns Diagnostic text. */
  public to_string(): string {
    return `[${this.low}-${this.high})`;
  }
}
/** Links original adjacent leaf nodes in both directions. @param left - Left node. @param right - Right node. @returns Nothing. */
export function link_nodes<Value extends SegmentValue>(
  left: node<Value>,
  right: node<Value>,
): void {
  left.next = right;
  right.prev = left;
}
/** Clears all original connections while retaining the value owner. @param value - Leaf or null. @returns Nothing. */
export function disconnect_all_nodes<Value extends SegmentValue>(value: node<Value> | null): void {
  if (!value) return;
  value.prev = null;
  value.next = null;
  value.parent = null;
}
/** Disconnects each leaf including both border owners. @param left - First leaf. @param right - Terminal leaf. @returns Nothing. */
export function disconnect_leaf_nodes<Value extends SegmentValue>(
  left: node<Value> | null,
  right: node<Value> | null,
): void {
  if (!left || !right) return;
  let current = left;
  do {
    const next = current.next as node<Value>;
    disconnect_all_nodes(current);
    current = next;
  } while (current !== right);
  disconnect_all_nodes(right);
}
/** Counts original leaf nodes including the terminal border. @param left - First node. @param right - Terminal node. @returns Native count. */
export function count_leaf_nodes<Value extends SegmentValue>(
  left: node<Value> | null,
  right: node<Value> | null,
): number {
  let count = 1;
  for (let current = left; current !== right; current = (current as node<Value>).next) ++count;
  return count;
}
/** Computes the original full pooled non-leaf count for a positive leaf count. @param leafCount - Native leaf count. @returns Pool size. */
export function count_needed_nonleaf_nodes(leafCount: number): number {
  let count = 0;
  while (leafCount !== 1) {
    if (leafCount % 2 === 1) ++leafCount;
    leafCount /= 2;
    count += leafCount;
  }
  return count;
}
/** Original bottom-up adjacent pairing over a preallocated non-leaf pool. */
export class tree_builder<Value extends SegmentValue> {
  private readonly m_pool: nonleaf_node<Value>[];
  private m_pool_pos = 0;
  /** Borrows the receiving tree's exact preallocated pool. @param pool - Native pool. @returns Builder. */
  public constructor(pool: nonleaf_node<Value>[]) {
    this.m_pool = pool;
  }
  /** Pairs leaves then successively pairs non-leaf layers. @param left - First leaf or null. @returns Original root or null. */
  public build(left: node<Value> | null): nonleaf_node<Value> | null {
    if (!left) return null;
    let first = left;
    const layer: nonleaf_node<Value>[] = [];
    while (true) {
      const second = first.next;
      layer.push(this.make_parent_node(first, second));
      if (!second || !second.next) break;
      first = second.next;
    }
    return this.build_tree_non_leaf(layer);
  }
  /** Takes one pool slot and assigns native child/parent connections and bounds. @param first - Required left child. @param second - Right child or null. @returns Parent. */
  private make_parent_node(
    first: node_base<Value>,
    second: node_base<Value> | null,
  ): nonleaf_node<Value> {
    const parent = this.m_pool[this.m_pool_pos++] as nonleaf_node<Value>;
    first.parent = parent;
    parent.left = first;
    if (second) {
      second.parent = parent;
      parent.right = second;
    }
    // Original fill_nonleaf_parent_node requires a left child. Every caller
    // supplies one; the native missing-left diagnostic is outside this invariant.
    parent.low = first.is_leaf ? (first as node<Value>).key : (first as nonleaf_node<Value>).low;
    if (second) {
      if (second.is_leaf) {
        const leaf = second as node<Value>;
        parent.high = leaf.next ? leaf.next.key : leaf.key;
      } else parent.high = (second as nonleaf_node<Value>).high;
    } else
      parent.high = first.is_leaf
        ? (first as node<Value>).key
        : (first as nonleaf_node<Value>).high;
    return parent;
  }
  /** Retains the original pairing and single leftover-parent rule. @param layer - Current non-leaf layer. @returns Root or null. */
  private build_tree_non_leaf(layer: nonleaf_node<Value>[]): nonleaf_node<Value> | null {
    if (layer.length === 1) return layer[0] as nonleaf_node<Value>;
    // build() starts with at least one parent; each pairing keeps a non-empty
    // layer. The native empty-layer return cannot occur under these callers.
    const next: nonleaf_node<Value>[] = [];
    let first: nonleaf_node<Value> | null = null;
    let even = false;
    for (const entry of layer) {
      if (even) {
        next.push(this.make_parent_node(first as nonleaf_node<Value>, entry));
        first = null;
      } else first = entry;
      even = !even;
    }
    if (first) next.push(this.make_parent_node(first, null));
    return this.build_tree_non_leaf(next);
  }
}

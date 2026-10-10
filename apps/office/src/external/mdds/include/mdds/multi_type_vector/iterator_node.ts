/** @fileoverview Original mdds iterator node and implementation-only private update policies. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { type base_element_block, element_type_empty, type element_t } from "./types.ts";
/** Original nested private_data; end private fields are intentionally undefined to callers. */
export class iterator_private_data<P> {
  /** Initializes borrowed native parent/index. @param parent - Parent identity. @param block_index - Bounded size_t index. @returns Private data. */
  public constructor(
    public parent: P | null = null,
    public block_index = 0,
  ) {}
  /** Swaps original fields. @param other - Other private state. @returns Nothing. */
  public swap(other: iterator_private_data<P>): void {
    [this.parent, other.parent] = [other.parent, this.parent];
    [this.block_index, other.block_index] = [other.block_index, this.block_index];
  }
}
/** Original const node reference witness; exposes fields without mutable node methods. */
export interface IteratorNodeView<P> {
  readonly type: element_t;
  readonly position: number;
  readonly size: number;
  readonly data: base_element_block | null;
  readonly __private_data: { readonly parent: P | null; readonly block_index: number };
}
/** Original value node; copies retain parent and data pointer identity. */
export class iterator_value_node<P> {
  public type: element_t = element_type_empty;
  public position = 0;
  public size = 0;
  public data: base_element_block | null = null;
  public __private_data: iterator_private_data<P>;
  /** Retains original empty defaults. @param parent - Borrowed parent. @param block_index - Native index. @returns Node. */
  public constructor(parent: P | null, block_index: number) {
    this.__private_data = new iterator_private_data(parent, block_index);
  }
  /** Adapts implicit native value copy. @returns Independent cached node. */
  public copy(): iterator_value_node<P> {
    return new iterator_value_node<P>(null, 0).assign(this);
  }
  /** Adapts implicit native assignment, preserving borrowed node-reference identity. @param other - Source. @returns This node. */
  public assign(other: iterator_value_node<P>): this {
    this.type = other.type;
    this.position = other.position;
    this.size = other.size;
    this.data = other.data;
    this.__private_data.parent = other.__private_data.parent;
    this.__private_data.block_index = other.__private_data.block_index;
    return this;
  }
  /** Swaps all original fields in place. @param other - Other node. @returns Nothing. */
  public swap(other: iterator_value_node<P>): void {
    [this.type, other.type] = [other.type, this.type];
    [this.position, other.position] = [other.position, this.position];
    [this.size, other.size] = [other.size, this.size];
    [this.data, other.data] = [other.data, this.data];
    this.__private_data.swap(other.__private_data);
  }
  /** Original complete node comparison. @param other - Other node. @returns Equality. */
  public equals(other: iterator_value_node<P>): boolean {
    return (
      this.type === other.type &&
      this.position === other.position &&
      this.size === other.size &&
      this.data === other.data &&
      this.__private_data.parent === other.__private_data.parent &&
      this.__private_data.block_index === other.__private_data.block_index
    );
  }
  /** Original negation. @param other - Other node. @returns Inequality. */
  public not_equals(other: iterator_value_node<P>): boolean {
    return !this.equals(other);
  }
}
/** Original policy static member contract. */
export interface NodeUpdate {
  inc<P>(nd: iterator_value_node<P>): void;
  dec<P>(nd: iterator_value_node<P>): void;
}
/** Original reverse iterator policy. */
export const private_data_no_update = {
  /** Original no-op. @param nd - Cached node. @returns Nothing. */
  inc<P>(nd: iterator_value_node<P>): void {
    void nd;
  },
  /** Original no-op. @param nd - Cached node. @returns Nothing. */
  dec<P>(nd: iterator_value_node<P>): void {
    void nd;
  },
} satisfies NodeUpdate;
/** Original forward iterator policy; valid bounded indices retain size_t behavior. */
export const private_data_forward_update = {
  /** Increments before advancing source cursors. @param nd - Cached node. @returns Nothing. */
  inc<P>(nd: iterator_value_node<P>): void {
    ++nd.__private_data.block_index;
  },
  /** Decrements after updating the source node. @param nd - Cached node. @returns Nothing. */
  dec<P>(nd: iterator_value_node<P>): void {
    --nd.__private_data.block_index;
  },
} satisfies NodeUpdate;

/** @fileoverview Original matrix element block node definitions; enclosing native template type mapping remains explicit. */
// SPDX-FileCopyrightText: 2012 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import {
  type base_element_block,
  type BlockElementAccess,
  element_type_empty,
} from "./multi_type_vector/types.ts";
import { type BlockPosition } from "./multi_type_vector/util.ts";
import { type delayed_delete_vector_iterator } from "./multi_type_vector/delayed_delete_vector.ts";
import { type ValueOperations } from "./multi_type_vector/vector_storage.ts";
/** Erased FuncT call operator and actual special members; return move binds a copy when the native type has no move constructor. */
export interface WalkCallableOperations<F> extends Pick<
  ValueOperations<F>,
  "copy_construct" | "move_construct" | "destroy"
> {
  readonly argument_is_rvalue: boolean;
  invoke(func: F, left: element_block_node_type, right?: element_block_node_type): void;
}
/** Original nested std::for_each wrapper borrows the walk parameter rather than copying its state. */
export class walk_func<F> {
  /** Original reference constructor with explicit enclosing type and erased call operator. @param m_func - Walk parameter reference. @param to_mtm_type - Enclosing mapping. @param operations - Native callable members. @returns Wrapper. */
  public constructor(
    private readonly m_func: F,
    private readonly to_mtm_type: (type: number) => number,
    private readonly operations: WalkCallableOperations<F>,
  ) {}
  /** Original operator() creates a new zero-offset node for every store block. @param mtv_node - Borrowed store node. @returns Nothing. */
  public invoke(mtv_node: {
    readonly type: number;
    readonly size: number;
    readonly data: base_element_block | null;
  }): void {
    const node = new element_block_node_type(this.to_mtm_type);
    node.type = this.to_mtm_type(mtv_node.type);
    node.size = mtv_node.size;
    node.data = mtv_node.data;
    this.operations.invoke(this.m_func, node);
  }
}
/** Original nested borrowed block section value, adapting the enclosing template/friend syntax. */
export class element_block_node_type {
  public type = element_type_empty;
  public offset = 0;
  public size = 0;
  public data: base_element_block | null = null;
  /** Original default/copy constructor. @param to_mtm_type - Enclosing native static type mapping. @param other - Copy source. @returns Node. */
  public constructor(
    private readonly to_mtm_type: (type: number) => number,
    other?: element_block_node_type,
  ) {
    if (other) {
      this.type = other.type;
      this.offset = other.offset;
      this.size = other.size;
      this.data = other.data;
    }
  }
  /** Original friend-only section assignment; initialized valid release ranges preserve the native debug assertion precondition. @param pos - Source position. @param section_size - Section length. @returns Nothing. */
  public assign(
    pos: BlockPosition<{
      get(): { readonly type: number; readonly data: base_element_block | null };
    }>,
    section_size: number,
  ): void {
    this.type = this.to_mtm_type(pos.first.get().type);
    this.offset = pos.second;
    this.size = section_size;
    this.data = pos.first.get().data;
  }
  /** Original const begin offset. @param Blk - Erased block alias. @returns Borrowed iterator. */
  public begin<T>(Blk: BlockElementAccess<T>): delayed_delete_vector_iterator<T> {
    return Blk.cbegin(this.data as base_element_block).advance(this.offset);
  }
  /** Original const end offset. @param Blk - Erased block alias. @returns Borrowed iterator. */
  public end<T>(Blk: BlockElementAccess<T>): delayed_delete_vector_iterator<T> {
    return Blk.cbegin(this.data as base_element_block).advance(this.offset + this.size);
  }
}

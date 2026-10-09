/** @fileoverview Original SoA main_def.inl default-execution block transforms, mutation and equality helpers. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { type base_element_block } from "../types.ts";
import { std_vector } from "../vector_storage.ts";
import { invalid_arg_error } from "../../global.ts";
import {
  delayed_delete_vector_iterator,
  type DelayedVectorValue,
} from "../delayed_delete_vector.ts";
import {
  type blocks_type,
  type ContainerEvent,
  type ContainerCallbacks,
  type BlocksTraits,
} from "./main.ts";
/** Original internal vector erase helper. @param arr - Vector. @param index - Start. @param size - Count. @returns Nothing. */
export function erase<T>(arr: std_vector<T>, index: number, size: number): void {
  arr.erase(index, size);
}
/** Original std::transform default execution policy specialization. @param element_blocks - Actual pointer vector. @param BlockOp - Original template operation alias. @returns Nothing. */
export function copy_blocks(
  element_blocks: std_vector<base_element_block | null>,
  BlockOp: (block: base_element_block) => base_element_block,
): void {
  for (let i = 0; i < element_blocks.size(); ++i) {
    const data = element_blocks.get(i);
    element_blocks.set(i, data ? BlockOp(data) : null);
  }
}
/** Original default std::for_each skips empty blocks in source order. @param element_blocks - Pointers. @param BlockOp - Template operation alias. @returns Nothing. */
export function mutate_blocks(
  element_blocks: std_vector<base_element_block | null>,
  BlockOp: (block: base_element_block) => void,
): void {
  for (let i = 0; i < element_blocks.size(); ++i) {
    const data = element_blocks.get(i);
    if (data) BlockOp(data);
  }
}
/** Original null-aware predicate, preserving exact early call ordering. @param data1 - Left. @param data2 - Right. @param BlockOp - Template alias. @returns Equality. */
export function equal_blocks_pred(
  data1: base_element_block | null,
  data2: base_element_block | null,
  BlockOp: (a: base_element_block, b: base_element_block) => boolean,
): boolean {
  if (data1) {
    if (!data2) return false;
  } else {
    if (data2) return false;
    return true;
  }
  return BlockOp(data1, data2 as base_element_block);
}
/** Original three-iterator std::equal specialization; rhs must contain the valid lhs range. @param lhs - Left. @param rhs - Right. @param BlockOp - Template alias. @returns Equality. */
export function equal_blocks(
  lhs: std_vector<base_element_block | null>,
  rhs: std_vector<base_element_block | null>,
  BlockOp: (a: base_element_block, b: base_element_block) => boolean,
): boolean {
  for (let i = 0; i < lhs.size(); ++i)
    if (!equal_blocks_pred(lhs.get(i), rhs.get(i), BlockOp)) return false;
  return true;
}
/** Original size/fill/range constructor element initialization after native member initialization. @param store - Actual metadata. @param event - Native field. @param init_size - Logical size. @param callbacks - Erased original scalar overload. @param valueOrFirst - Value or begin. @param last - Range end. @returns Nothing. */
export function initialize_element_blocks(
  store: blocks_type,
  event: ContainerEvent,
  init_size: number,
  callbacks?: ContainerCallbacks,
  valueOrFirst?: DelayedVectorValue | delayed_delete_vector_iterator<DelayedVectorValue>,
  last?: delayed_delete_vector_iterator<DelayedVectorValue>,
): void {
  if (!init_size) return;
  if (!callbacks) {
    store.push_back(0, init_size, null);
    return;
  }
  let data: base_element_block;
  if (last !== undefined) {
    const first = valueOrFirst as delayed_delete_vector_iterator<DelayedVectorValue>;
    const data_len = first.distance_to(last);
    if (init_size !== data_len)
      throw new invalid_arg_error(
        "Specified size does not match the size of the initial data array.",
      );
    data = callbacks.mdds_mtv_create_new_block(first.get(), first, last);
  } else data = callbacks.mdds_mtv_create_new_block(init_size, valueOrFirst as DelayedVectorValue);
  event.element_block_acquired(data);
  store.push_back(0, init_size, data);
}
/** Original one-block release/deletion/null ordering. @param store - Metadata. @param event - Native field. @param funcs - Actual registered block operations. @param index - Valid block. @returns Nothing. */
export function delete_element_block(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  index: number,
): void {
  const data = store.element_blocks.get(index);
  if (!data) return;
  event.element_block_released(data);
  funcs.delete_block(data);
  store.element_blocks.set(index, null);
}
/** Original sequential block deletion range. @param store - Metadata. @param event - Native field. @param funcs - Original aliases. @param start - Begin. @param end - End. @returns Nothing. */
export function delete_element_blocks(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  start: number,
  end: number,
): void {
  for (let i = start; i < end; ++i) delete_element_block(store, event, funcs, i);
}

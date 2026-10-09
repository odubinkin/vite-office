/** @fileoverview Original SoA main_def.inl default-execution block transforms, mutation and equality helpers. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { type base_element_block } from "../types.ts";
import { std_vector } from "../vector_storage.ts";
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

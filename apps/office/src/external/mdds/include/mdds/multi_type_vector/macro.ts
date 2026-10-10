/** @fileoverview Original scalar MDDS_MTV_DEFINE_ELEMENT_CALLBACKS contract with explicit erased native value-type specialization. */
// SPDX-FileCopyrightText: 2012 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import {
  type DelayedVectorValue,
  delayed_delete_vector_iterator,
} from "./delayed_delete_vector.ts";
import {
  type base_element_block,
  type element_t,
  type BlockConstructor,
  type element_block,
} from "./types.ts";
/** Complete original scalar callback block contract. */
export interface ScalarCallbackBlock<T extends DelayedVectorValue> extends BlockConstructor<T> {
  set_value(block: base_element_block, pos: number, value: T): void;
  get_value(block: base_element_block, pos: number): T;
  append_value(block: base_element_block, value: T): void;
  emplace_back_value(block: base_element_block, value: T): void;
  prepend_value(block: base_element_block, value: T): void;
  set_values(
    block: base_element_block,
    pos: number,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void;
  append_values(
    block: base_element_block,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void;
  prepend_values(
    block: base_element_block,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void;
  assign_values(
    block: base_element_block,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void;
  insert_values(
    block: base_element_block,
    pos: number,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): void;
  create_block_with_value(size: number, value: T): element_block<T>;
  create_block_with_values(
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
  ): element_block<T>;
}
/** Specializes original scalar macro overloads; type IDs are explicit, never guessed from JS numbers. @param type_id - Original type ID. @param empty_value - Original false value. @param block_type - Original scalar owner. @returns Original callback specialization. */
export function MDDS_MTV_DEFINE_ELEMENT_CALLBACKS<T extends DelayedVectorValue>(
  type_id: element_t,
  empty_value: T,
  block_type: ScalarCallbackBlock<T>,
) {
  /** Original ADL callback family with an explicit native type witness. */
  const element_callbacks = {
    /** Reads original compile-time discriminator. @param value - Native witness. @returns Type ID. */
    mdds_mtv_get_element_type(value: T): element_t {
      void value;
      return type_id;
    },
    /** Adapts the original output-reference assignment as its scalar result. @returns Original false value. */
    mdds_mtv_get_empty_value(): T {
      return empty_value;
    },
    /** Original scalar set_value callback. @param block - Original argument. @param pos - Original argument. @param val - Original argument. @returns Original result. */
    mdds_mtv_set_value(block: base_element_block, pos: number, val: T): void {
      return block_type.set_value(block, pos, val);
    },
    /** Original scalar get_value callback. @param block - Original argument. @param pos - Original argument. @returns Original result. */
    mdds_mtv_get_value(block: base_element_block, pos: number): T {
      return block_type.get_value(block, pos);
    },
    /** Original scalar set_values callback. @param block - Original argument. @param pos - Original argument. @param value - Original argument. @param first - Original argument. @param last - Original argument. @returns Original result. */
    mdds_mtv_set_values(
      block: base_element_block,
      pos: number,
      value: T,
      first: delayed_delete_vector_iterator<T>,
      last: delayed_delete_vector_iterator<T>,
    ): void {
      void value;
      return block_type.set_values(block, pos, first, last);
    },
    /** Original scalar append_value callback. @param block - Original argument. @param val - Original argument. @returns Original result. */
    mdds_mtv_append_value(block: base_element_block, val: T): void {
      return block_type.append_value(block, val);
    },
    /** Original scalar emplace_back_value callback. @param block - Original argument. @param value - Original argument. @param val - Original argument. @returns Original result. */
    mdds_mtv_emplace_back_value(block: base_element_block, value: T, val: T): void {
      void value;
      return block_type.emplace_back_value(block, val);
    },
    /** Original scalar prepend_value callback. @param block - Original argument. @param val - Original argument. @returns Original result. */
    mdds_mtv_prepend_value(block: base_element_block, val: T): void {
      return block_type.prepend_value(block, val);
    },
    /** Original scalar prepend_values callback. @param block - Original argument. @param value - Original argument. @param first - Original argument. @param last - Original argument. @returns Original result. */
    mdds_mtv_prepend_values(
      block: base_element_block,
      value: T,
      first: delayed_delete_vector_iterator<T>,
      last: delayed_delete_vector_iterator<T>,
    ): void {
      void value;
      return block_type.prepend_values(block, first, last);
    },
    /** Original scalar append_values callback. @param block - Original argument. @param value - Original argument. @param first - Original argument. @param last - Original argument. @returns Original result. */
    mdds_mtv_append_values(
      block: base_element_block,
      value: T,
      first: delayed_delete_vector_iterator<T>,
      last: delayed_delete_vector_iterator<T>,
    ): void {
      void value;
      return block_type.append_values(block, first, last);
    },
    /** Original scalar assign_values callback. @param block - Original argument. @param value - Original argument. @param first - Original argument. @param last - Original argument. @returns Original result. */
    mdds_mtv_assign_values(
      block: base_element_block,
      value: T,
      first: delayed_delete_vector_iterator<T>,
      last: delayed_delete_vector_iterator<T>,
    ): void {
      void value;
      return block_type.assign_values(block, first, last);
    },
    /** Original scalar insert_values callback. @param block - Original argument. @param pos - Original argument. @param value - Original argument. @param first - Original argument. @param last - Original argument. @returns Original result. */
    mdds_mtv_insert_values(
      block: base_element_block,
      pos: number,
      value: T,
      first: delayed_delete_vector_iterator<T>,
      last: delayed_delete_vector_iterator<T>,
    ): void {
      void value;
      return block_type.insert_values(block, pos, first, last);
    },
    /** Adapts both original count/value and witness/input-range overloads. @param initial - Count or native witness. @param valueOrFirst - Fill value or range begin. @param last - Optional range end. @returns New original owner. */
    mdds_mtv_create_new_block(
      initial: number | T,
      valueOrFirst: T | delayed_delete_vector_iterator<T>,
      last?: delayed_delete_vector_iterator<T>,
    ): element_block<T> {
      if (last === undefined)
        return block_type.create_block_with_value(initial as number, valueOrFirst as T);
      return block_type.create_block_with_values(
        valueOrFirst as delayed_delete_vector_iterator<T>,
        last,
      );
    },
  };
  return element_callbacks;
}

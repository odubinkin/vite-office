/** @fileoverview Original value/pointer MDDS_MTV_DEFINE_ELEMENT_CALLBACKS contracts with explicit erased native value-type specialization. */
// SPDX-FileCopyrightText: 2012 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { delayed_delete_vector_iterator } from "./delayed_delete_vector.ts";
import { type ValueOperations } from "./vector_storage.ts";
/** Erased actual owned ValueT and original macro empty expression, supplied by its existing native value owner. */
export interface CallbackValueOperations<T> {
  readonly operations: ValueOperations<T>;
  readonly empty: () => T;
}
import {
  type base_element_block,
  type element_t,
  type BlockConstructor,
  type element_block,
} from "./types.ts";
/** Original callback block operations, including explicit erased value-category/constructor witnesses. */
export interface ElementCallbackBlock<T> extends BlockConstructor<T> {
  set_value(block: base_element_block, pos: number, value: T): void;
  get_value(block: base_element_block, pos: number): T;
  get_value(block: base_element_block, pos: number, output: [T]): void;
  append_value(block: base_element_block, value: T): void;
  append_value_move(block: base_element_block, value: T): void;
  emplace_back_construct(block: base_element_block, construct: () => T): void;
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
/** Specializes original scalar macro overloads; type IDs are explicit, never guessed from JS numbers. @param type_id - Original type ID. @param empty_value - Original false value. @param block_type - Original value owner. @param values - Actual owned ValueT members and original empty expression. @returns Original callback specialization. */
export function MDDS_MTV_DEFINE_ELEMENT_CALLBACKS<T>(
  type_id: element_t,
  empty_value: T,
  block_type: ElementCallbackBlock<T>,
  values?: CallbackValueOperations<T>,
) {
  /** Original value-return adaptation for erased scalar output syntax. @returns Independent original empty expression. */
  function mdds_mtv_get_empty_value(): T;
  /** Original output-reference assignment. @param output - Actual target reference. @returns Nothing. */
  function mdds_mtv_get_empty_value(output: [T]): void;
  /** Binds the original empty expression temporary and its actual value members. @param output - Optional target reference. @returns Empty result or nothing. */
  function mdds_mtv_get_empty_value(output?: [T]): T | void {
    const empty = values ? values.empty() : empty_value;
    if (output === undefined) return empty;
    if (values) {
      values.operations.move_assign(output[0], empty);
      values.operations.destroy(empty);
    } else output[0] = empty;
  }
  /** Original existing scalar result syntax delegates to the by-value block overload. @param block - Owner. @param pos - Offset. @returns Independent value. */
  function mdds_mtv_get_value(block: base_element_block, pos: number): T;
  /** Original callback output-reference syntax. @param block - Owner. @param pos - Offset. @param output - Target reference. @returns Nothing. */
  function mdds_mtv_get_value(block: base_element_block, pos: number, output: [T]): void;
  /** Uses the actual block extraction overloads. @param block - Owner. @param pos - Offset. @param output - Optional reference. @returns Value or nothing. */
  function mdds_mtv_get_value(block: base_element_block, pos: number, output?: [T]): T | void {
    if (output === undefined) return block_type.get_value(block, pos);
    block_type.get_value(block, pos, output);
  }
  /** Original ADL callback family with an explicit native type witness. */
  const element_callbacks = {
    /** Reads original compile-time discriminator. @param value - Native witness. @returns Type ID. */
    mdds_mtv_get_element_type(value: T): element_t {
      void value;
      return type_id;
    },
    mdds_mtv_get_empty_value,
    /** Original scalar set_value callback. @param block - Original argument. @param pos - Original argument. @param val - Original argument. @returns Original result. */
    mdds_mtv_set_value(block: base_element_block, pos: number, val: T): void {
      return block_type.set_value(block, pos, val);
    },
    mdds_mtv_get_value,
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
    /** Original rvalue append overload; suffix witnesses the erased native value category. @param block - Owner. @param val - Actual rvalue. @returns Nothing. */
    mdds_mtv_append_value_move(block: base_element_block, val: T): void {
      block_type.append_value_move(block, val);
    },
    /** Original variadic emplace pack, bound to its actual forwarded constructor call. @param block - Owner. @param value - Native type witness. @param construct - Original ValueT constructor. @returns Nothing. */
    mdds_mtv_emplace_back_construct(block: base_element_block, value: T, construct: () => T): void {
      void value;
      block_type.emplace_back_construct(block, construct);
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

/** Original pointer macro borrows pointees and omits value rvalue/emplace overloads. @param type_id - Original discriminator. @param empty_value - Original pointer false value. @param block_type - Actual pointer block. @returns Original pointer callback family. */
export function MDDS_MTV_DEFINE_ELEMENT_CALLBACKS_PTR<T>(
  type_id: element_t,
  empty_value: T | null,
  block_type: ElementCallbackBlock<T | null>,
) {
  const callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(type_id, empty_value, block_type);
  return {
    mdds_mtv_get_element_type: callbacks.mdds_mtv_get_element_type,
    mdds_mtv_get_empty_value: callbacks.mdds_mtv_get_empty_value,
    mdds_mtv_set_value: callbacks.mdds_mtv_set_value,
    mdds_mtv_get_value: callbacks.mdds_mtv_get_value,
    mdds_mtv_set_values: callbacks.mdds_mtv_set_values,
    mdds_mtv_append_value: callbacks.mdds_mtv_append_value,
    // Native pointer append takes its pointer by value for both const and moved arguments.
    mdds_mtv_append_value_move: callbacks.mdds_mtv_append_value,
    mdds_mtv_prepend_value: callbacks.mdds_mtv_prepend_value,
    mdds_mtv_prepend_values: callbacks.mdds_mtv_prepend_values,
    mdds_mtv_append_values: callbacks.mdds_mtv_append_values,
    mdds_mtv_assign_values: callbacks.mdds_mtv_assign_values,
    mdds_mtv_insert_values: callbacks.mdds_mtv_insert_values,
    mdds_mtv_create_new_block: callbacks.mdds_mtv_create_new_block,
  };
}

/** Existing native value-result syntax binding does not require writable output references of unrelated erased types. */
export type ValueResultCallbacks<T> = Omit<
  ReturnType<typeof MDDS_MTV_DEFINE_ELEMENT_CALLBACKS<T>>,
  "mdds_mtv_get_empty_value" | "mdds_mtv_get_value"
> & {
  mdds_mtv_get_empty_value(): T;
  mdds_mtv_get_value(block: base_element_block, pos: number): T;
};

/** Original ADL get callbacks with an actual writable reference witness. */
export interface ReferenceCallbacks<T> {
  mdds_mtv_get_empty_value(output: [T]): void;
  mdds_mtv_get_value(block: base_element_block, pos: number, output: [T]): void;
}
/** Erased native T cell declaration and exceptional automatic destruction in value-return get. */
export interface NativeValueType<T> {
  default_construct(): T;
  destroy(value: T): void;
}

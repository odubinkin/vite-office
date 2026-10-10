/** @fileoverview Original SoA main_def.inl default-execution block transforms, mutation and equality helpers. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import {
  type base_element_block,
  type element_t,
  element_type_empty,
  get_block_type,
} from "../types.ts";
import { std_vector, lower_bound } from "../vector_storage.ts";
import { invalid_arg_error } from "../../global.ts";
import {
  throw_block_position_not_found,
  type BlockPositionIterator,
  type BlockPosition,
} from "../util.ts";
import {
  iterator_base,
  grouped_iterator_type,
  vector_iterator,
  type IteratorTraits,
} from "./iterator.ts";
import { private_data_forward_update, private_data_no_update } from "../iterator_node.ts";
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
/** Original inline iterator member body with explicit erased mutable/const alias; reverse factories retain original base-index adaptation. @param store - Actual fields. @param parent - Borrowed owner. @param index - Native base index. @param Iterator - Native iterator alias. @param reverse - Native category. @returns Original iterator. */
export function make_iterator<P, I>(
  store: blocks_type,
  parent: P,
  index: number,
  Iterator: new (
    traits: IteratorTraits,
    pos: grouped_iterator_type,
    end: grouped_iterator_type,
    parent: P,
    block_index: number,
  ) => I,
  reverse = false,
): I {
  /** Borrows actual vector storage without copying it. @param offset - Native base index. @returns Original grouped cursors. */
  function grouped(offset: number): grouped_iterator_type {
    offset = reverse ? offset - 1 : offset;
    return new grouped_iterator_type(
      new vector_iterator(store.positions.store().values as number[], offset, reverse),
      new vector_iterator(store.sizes.store().values as number[], offset, reverse),
      new vector_iterator(
        store.element_blocks.store().values as (base_element_block | null)[],
        offset,
        reverse,
      ),
    );
  }
  return new Iterator(
    { private_data_update: reverse ? private_data_no_update : private_data_forward_update },
    grouped(index),
    grouped(reverse ? 0 : store.positions.size()),
    parent,
    reverse ? 0 : index,
  );
}
/** Original bounded lower-bound lookup and one-block overshoot correction. @param store - Original arrays. @param size - Logical size. @param row - Original size_t witness. @param start_block_index - Admitted start. @returns Block or terminal sentinel. */
export function get_block_position(
  store: blocks_type,
  size: number,
  row: number | bigint,
  start_block_index = 0,
): number {
  if (row >= size || start_block_index >= store.positions.size()) return store.positions.size();
  let it = lower_bound(
    store.positions,
    start_block_index,
    store.positions.size(),
    row,
    /** Original size_t less-than comparison. @param element - Position. @param value - Row. @returns Less. */ (
      element,
      value,
    ) => element < value,
  );
  if (it === store.positions.size() || store.positions.get(it) !== Number(row)) --it;
  return it;
}
/** Original cached-parent/index hint admission, backward threshold walk and reset. Valid native hinted calls require nonempty metadata unless public end-position guard returns first. @param store - Fields. @param size - Logical size. @param parent - Owner identity. @param pos_data - Actual cached hint. @param row - Original row. @returns Block or sentinel. */
export function get_block_position_hint<P>(
  store: blocks_type,
  size: number,
  parent: P,
  pos_data: { readonly parent: P | null; readonly block_index: number },
  row: number | bigint,
): number {
  let block_index = 0;
  if (pos_data.parent === parent && pos_data.block_index < store.positions.size())
    block_index = pos_data.block_index;
  let start_row = store.positions.get(block_index);
  if (row < start_row) {
    if (row > Math.floor(start_row / 2)) {
      for (let i = block_index; i > 0;) {
        --i;
        start_row = store.positions.get(i);
        if (row >= start_row) return i;
      }
    }
    block_index = 0;
  }
  return get_block_position(store, size, row, block_index);
}
/** Original scalar read member body; __LINE__ uses its pinned native source-call witness504. @param store - Fields. @param size - Logical size. @param pos - Native row. @param callbacks - Original typed overloads. @returns Original output-reference result. */
export function get_impl<T extends DelayedVectorValue>(
  store: blocks_type,
  size: number,
  pos: number | bigint,
  callbacks: ContainerCallbacks<T>,
): T {
  const block_index = get_block_position(store, size, pos);
  if (block_index === store.positions.size())
    throw_block_position_not_found(
      "multi_type_vector::get",
      504,
      pos,
      store.positions.size(),
      size,
    );
  const data = store.element_blocks.get(block_index);
  if (!data) return callbacks.mdds_mtv_get_empty_value();
  const start_row = store.positions.get(block_index);
  return callbacks.mdds_mtv_get_value(data, Number(pos) - start_row);
}

/** Original mutable/const position member body over erased iterator aliases; end returns before reading cached hint data. @param store - Fields. @param size - Size. @param parent - Owner. @param row - Row. @param Iterator - Native alias. @param line - Pinned native diagnostic source line. @param hint - Original cached iterator. @returns Iterator/offset pair. */
export function position_impl<P, I>(
  store: blocks_type,
  size: number,
  parent: P,
  row: number | bigint,
  Iterator: new (
    traits: IteratorTraits,
    pos: grouped_iterator_type,
    end: grouped_iterator_type,
    parent: P,
    block_index: number,
  ) => I,
  line: number,
  hint?: {
    get_node(): {
      readonly __private_data: { readonly parent: P | null; readonly block_index: number };
    };
  },
): BlockPosition<I> {
  if (BigInt(row) === BigInt(size))
    return { first: make_iterator(store, parent, store.positions.size(), Iterator), second: 0 };
  const index = hint
    ? get_block_position_hint(store, size, parent, hint.get_node().__private_data, row)
    : get_block_position(store, size, row);
  if (index === store.positions.size())
    throw_block_position_not_found(
      "multi_type_vector::position",
      line,
      row,
      store.positions.size(),
      size,
    );
  return {
    first: make_iterator(store, parent, index, Iterator),
    second: Number(row) - store.positions.get(index),
  };
}

/** Original type query member body with pinned native source-call line1140. @param store - Fields. @param size - Size. @param pos - Row. @returns Type. */
export function get_type(store: blocks_type, size: number, pos: number | bigint): element_t {
  const index = get_block_position(store, size, pos);
  if (index === store.positions.size())
    throw_block_position_not_found(
      "multi_type_vector::get_type",
      1140,
      pos,
      store.positions.size(),
      size,
    );
  const data = store.element_blocks.get(index);
  return data ? get_block_type(data) : element_type_empty;
}
/** Original empty query member body with pinned source-call line1157. @param store - Fields. @param size - Size. @param pos - Row. @returns Empty. */
export function is_empty(store: blocks_type, size: number, pos: number | bigint): boolean {
  const index = get_block_position(store, size, pos);
  if (index === store.positions.size())
    throw_block_position_not_found(
      "multi_type_vector::is_empty",
      1157,
      pos,
      store.positions.size(),
      size,
    );
  return store.element_blocks.get(index) === null;
}

/** Original mutable/const next_position body copies the pair before within-block or next-block movement. @param pos - Valid non-end source position. @returns Independent position. */
export function next_position<I extends BlockPositionIterator<I>>(
  pos: BlockPosition<I>,
): BlockPosition<I> {
  const ret = { first: pos.first.copy(), second: pos.second };
  if (pos.second + 1 < pos.first.get().size) ++ret.second;
  else {
    ret.first.advance(1);
    ret.second = 0;
  }
  return ret;
}

/** Original previous-block category member body over its existing borrowed store witness. @param store - Actual metadata. @param block_index - Current block. @param cat - Original type. @returns Original category admission. */
export function is_previous_block_of_type(
  store: blocks_type,
  block_index: number,
  cat: element_t,
): boolean {
  if (block_index === 0) return false;
  const data = store.element_blocks.get(block_index - 1);
  if (data) return cat === get_block_type(data);
  return cat === element_type_empty;
}

/** Original next-block category member over the actual borrowed store. @param store - Metadata. @param block_index - Current valid block. @param cat - Original category. @returns Original category admission. */
export function is_next_block_of_type(
  store: blocks_type,
  block_index: number,
  cat: element_t,
): boolean {
  if (block_index === store.positions.size() - 1) return false;
  const data = store.element_blocks.get(block_index + 1);
  if (data) return cat === get_block_type(data);
  return cat === element_type_empty;
}
/** Original whole-block member body over borrowed fields; no replacement ownership or metadata. @param store - Actual store. @param event - Original handler. @param funcs - Registered block funcs. @param parent - Actual iterator owner. @param block_index - Nonempty block. @param overwrite - Delete values. @returns Original merged empty iterator. */
export function set_whole_block_empty<P>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  block_index: number,
  overwrite: boolean,
): iterator_base<P> {
  const blk_data = store.element_blocks.get(block_index) as base_element_block;
  if (!overwrite) funcs.resize_block(blk_data, 0);
  delete_element_block(store, event, funcs, block_index);
  const blk_prev = is_previous_block_of_type(store, block_index, element_type_empty);
  const blk_next = is_next_block_of_type(store, block_index, element_type_empty);
  if (blk_prev) {
    if (blk_next) {
      store.sizes.set(
        block_index - 1,
        store.sizes.get(block_index - 1) +
          store.sizes.get(block_index) +
          store.sizes.get(block_index + 1),
      );
      store.erase(block_index, 2);
      return make_iterator(store, parent, block_index - 1, iterator_base);
    }
    store.sizes.set(
      block_index - 1,
      store.sizes.get(block_index - 1) + store.sizes.get(block_index),
    );
    store.erase(block_index);
    return make_iterator(store, parent, block_index - 1, iterator_base);
  } else if (blk_next) {
    store.sizes.set(block_index, store.sizes.get(block_index) + store.sizes.get(block_index + 1));
    store.erase(block_index + 1);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  return make_iterator(store, parent, block_index, iterator_base);
}

/** Original plain/hinted set_empty body preserves first lookup before range validation. @param store - Metadata. @param size - Logical size. @param event - Handler. @param funcs - Registered operations. @param parent - Owner. @param first - Start or hint. @param second - End or hinted start. @param third - Hinted end. @returns Original empty iterator. */
export function set_empty<P>(
  store: blocks_type,
  size: number,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  first: number | bigint | iterator_base<P>,
  second: number | bigint,
  third?: number | bigint,
): iterator_base<P> {
  const hint = typeof first === "object" ? first : undefined;
  const start_pos = hint ? second : (first as number | bigint);
  const end_pos = hint ? (third as number | bigint) : second;
  const block_index1 = hint
    ? get_block_position_hint(store, size, parent, hint.get_node().__private_data, start_pos)
    : get_block_position(store, size, start_pos);
  if (block_index1 === store.positions.size())
    throw_block_position_not_found(
      "multi_type_vector::set_empty",
      hint ? 1186 : 1171,
      start_pos,
      store.positions.size(),
      size,
    );
  return set_empty_impl(store, size, event, funcs, parent, start_pos, end_pos, block_index1, true);
}
/** Original range-empty dispatch retains reversed/end guards and admitted block lookup. @param store - Metadata. @param size - Logical size. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param start_pos - First row. @param end_pos - Last row. @param block_index1 - First block. @param overwrite - Original overwrite choice. @returns Original empty iterator. */
export function set_empty_impl<P>(
  store: blocks_type,
  size: number,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  start_pos: number | bigint,
  end_pos: number | bigint,
  block_index1: number,
  overwrite: boolean,
): iterator_base<P> {
  if (start_pos > end_pos) throw new RangeError("Start row is larger than the end row.");
  const block_index2 = get_block_position(store, size, end_pos, block_index1);
  if (block_index2 === store.positions.size())
    throw_block_position_not_found(
      "multi_type_vector::set_empty_impl",
      1935,
      end_pos,
      store.positions.size(),
      size,
    );
  return block_index1 === block_index2
    ? set_empty_in_single_block(
        store,
        event,
        funcs,
        parent,
        Number(start_pos),
        Number(end_pos),
        block_index1,
        overwrite,
      )
    : set_empty_in_multi_blocks(
        store,
        event,
        funcs,
        parent,
        Number(start_pos),
        Number(end_pos),
        block_index1,
        block_index2,
        overwrite,
      );
}
/** Original single-block range emptying retains overwrite/erase/merge ordering. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param start_row - First row. @param end_row - Last row. @param block_index - Block. @param overwrite - Original choice. @returns Empty iterator. */
export function set_empty_in_single_block<P>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  start_row: number,
  end_row: number,
  block_index: number,
  overwrite: boolean,
): iterator_base<P> {
  const blk_data = store.element_blocks.get(block_index);
  if (!blk_data) return make_iterator(store, parent, block_index, iterator_base);
  const start_row_in_block = store.positions.get(block_index);
  const end_row_in_block = start_row_in_block + store.sizes.get(block_index) - 1;
  const empty_block_size = end_row - start_row + 1;
  if (start_row === start_row_in_block) {
    if (end_row === end_row_in_block)
      return set_whole_block_empty(store, event, funcs, parent, block_index, overwrite);
    if (overwrite) funcs.overwrite_values(blk_data, 0, empty_block_size);
    funcs.erase(blk_data, 0, empty_block_size);
    store.sizes.set(block_index, store.sizes.get(block_index) - empty_block_size);
    const blk_prev = is_previous_block_of_type(store, block_index, element_type_empty);
    if (blk_prev) {
      store.sizes.set(block_index - 1, store.sizes.get(block_index - 1) + empty_block_size);
      store.positions.set(block_index, store.positions.get(block_index) + empty_block_size);
      return make_iterator(store, parent, block_index - 1, iterator_base);
    }
    const block_position = store.positions.get(block_index);
    store.positions.set(block_index, store.positions.get(block_index) + empty_block_size);
    store.insert(block_index, block_position, empty_block_size, null);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  if (end_row === end_row_in_block) {
    const start_pos = start_row - start_row_in_block;
    if (overwrite) funcs.overwrite_values(blk_data, start_pos, empty_block_size);
    funcs.erase(blk_data, start_pos, empty_block_size);
    store.sizes.set(block_index, store.sizes.get(block_index) - empty_block_size);
    const blk_next = is_next_block_of_type(store, block_index, element_type_empty);
    if (blk_next) {
      store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + empty_block_size);
      store.positions.set(block_index + 1, start_row);
    } else store.insert(block_index + 1, start_row, empty_block_size, null);
    return make_iterator(store, parent, block_index + 1, iterator_base);
  }
  set_new_block_to_middle(
    store,
    event,
    funcs,
    block_index,
    start_row - start_row_in_block,
    empty_block_size,
    overwrite,
  );
  return make_iterator(store, parent, block_index + 1, iterator_base);
}
/** Original multi-block range emptying retains first/last/interior sequencing. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param start_row - First row. @param end_row - Last row. @param block_index1 - First block. @param block_index2 - Last block. @param overwrite - Original choice. @returns Empty iterator. */
export function set_empty_in_multi_blocks<P>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  start_row: number,
  end_row: number,
  block_index1: number,
  block_index2: number,
  overwrite: boolean,
): iterator_base<P> {
  const start_row_in_block1 = store.positions.get(block_index1);
  const start_row_in_block2 = store.positions.get(block_index2);
  {
    const blk_data = store.element_blocks.get(block_index1);
    if (blk_data) {
      if (start_row_in_block1 === start_row) {
        const prev_empty = is_previous_block_of_type(store, block_index1, element_type_empty);
        if (prev_empty) {
          start_row -= store.sizes.get(block_index1 - 1);
          --block_index1;
        } else {
          if (!overwrite) funcs.resize_block(blk_data, 0);
          delete_element_block(store, event, funcs, block_index1);
        }
      } else {
        const new_size = start_row - start_row_in_block1;
        if (overwrite)
          funcs.overwrite_values(blk_data, new_size, store.sizes.get(block_index1) - new_size);
        funcs.resize_block(blk_data, new_size);
        store.sizes.set(block_index1, new_size);
      }
    } else start_row = start_row_in_block1;
  }
  let end_block_to_erase = block_index2;
  {
    const blk_data = store.element_blocks.get(block_index2);
    const last_row_in_block = start_row_in_block2 + store.sizes.get(block_index2) - 1;
    if (blk_data) {
      if (last_row_in_block === end_row) {
        ++end_block_to_erase;
        const next_empty = is_next_block_of_type(store, block_index2, element_type_empty);
        if (next_empty) {
          end_row += store.sizes.get(block_index2 + 1);
          ++end_block_to_erase;
        }
      } else {
        const size_to_erase = end_row - start_row_in_block2 + 1;
        if (overwrite) funcs.overwrite_values(blk_data, 0, size_to_erase);
        funcs.erase(blk_data, 0, size_to_erase);
        store.sizes.set(block_index2, store.sizes.get(block_index2) - size_to_erase);
        store.positions.set(block_index2, start_row_in_block2 + size_to_erase);
      }
    } else {
      ++end_block_to_erase;
      end_row = last_row_in_block;
    }
  }
  if (end_block_to_erase - block_index1 > 1) {
    for (let i = block_index1 + 1; i < end_block_to_erase; ++i) {
      const data = store.element_blocks.get(i);
      if (!overwrite && data) funcs.resize_block(data, 0);
      delete_element_block(store, event, funcs, i);
    }
    const n_erase_blocks = end_block_to_erase - block_index1 - 1;
    store.erase(block_index1 + 1, n_erase_blocks);
  }
  const blk_data = store.element_blocks.get(block_index1);
  const empty_block_size = end_row - start_row + 1;
  if (blk_data) {
    store.insert(block_index1 + 1, start_row, empty_block_size, null);
    return make_iterator(store, parent, block_index1 + 1, iterator_base);
  }
  store.sizes.set(block_index1, empty_block_size);
  store.positions.set(block_index1, start_row);
  return make_iterator(store, parent, block_index1, iterator_base);
}
/** Original middle member retains smaller-side copy and overwrite ordering over data or empty metadata. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param block_index - Block. @param offset - Upper size. @param new_block_size - Empty middle size. @param overwrite - Original choice. @returns Middle index. */
export function set_new_block_to_middle(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  block_index: number,
  offset: number,
  new_block_size: number,
  overwrite: boolean,
): number {
  const lower_block_size = store.sizes.get(block_index) - offset - new_block_size;
  store.insert(block_index + 1, 2);
  store.sizes.set(block_index + 1, new_block_size);
  store.sizes.set(block_index + 2, lower_block_size);
  const blk_data = store.element_blocks.get(block_index);
  if (blk_data) {
    const lower_data_start = offset + new_block_size;
    const cat = get_block_type(blk_data);
    store.element_blocks.set(block_index + 2, funcs.create_new_block(cat, 0));
    event.element_block_acquired(store.element_blocks.get(block_index + 2) as base_element_block);
    if (offset > lower_block_size) {
      funcs.assign_values_from_block(
        store.element_blocks.get(block_index + 2) as base_element_block,
        blk_data,
        lower_data_start,
        lower_block_size,
      );
      if (overwrite) funcs.overwrite_values(blk_data, offset, new_block_size);
      funcs.resize_block(blk_data, offset);
      store.sizes.set(block_index, offset);
      store.sizes.set(block_index + 2, lower_block_size);
    } else {
      const blk_lower_data = store.element_blocks.get(block_index + 2) as base_element_block;
      funcs.assign_values_from_block(blk_lower_data, blk_data, 0, offset);
      store.sizes.set(block_index + 2, offset);
      if (overwrite) funcs.overwrite_values(blk_data, offset, new_block_size);
      funcs.erase(blk_data, 0, lower_data_start);
      store.sizes.set(block_index, lower_block_size);
      store.sizes.set(block_index + 2, offset);
      const position = store.positions.get(block_index);
      store.swap(block_index, block_index + 2);
      store.positions.set(block_index, position);
    }
  } else store.sizes.set(block_index, offset);
  store.calc_block_position(block_index + 1);
  store.calc_block_position(block_index + 2);
  return block_index + 1;
}

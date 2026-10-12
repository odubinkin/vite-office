/** @fileoverview Original main_def.inl input-range set members over the existing SoA owner fields. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import {
  type base_element_block,
  type element_t,
  element_type_empty,
  get_block_type,
} from "../types.ts";
import { type delayed_delete_vector_iterator } from "../delayed_delete_vector.ts";
import { calc_input_end_position, throw_block_position_not_found } from "../util.ts";
import { adjust_block_positions, type scalar_lu_factor } from "./block_util.ts";
import { iterator_base } from "./iterator.ts";
import {
  type blocks_type,
  type block_slot_type,
  type ContainerEvent,
  type ContainerCallbacks,
  type BlocksTraits,
} from "./main.ts";
import {
  get_block_position,
  get_block_position_hint,
  make_iterator,
  is_previous_block_of_type,
  is_next_block_of_type,
  delete_element_block,
  delete_element_blocks,
  merge_with_next_block,
  set_new_block_to_middle,
} from "./main_def.ts";

/** Original plain/hinted range lookup; empty input returns before hint access. @param store - Actual metadata. @param size - Actual size. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param Slot - Original nested type. @param pos - Row. @param first - Input begin. @param last - Input end. @param callbacks - Original overloads. @param hint - Optional position hint. @returns Original block iterator. */
export function set<P, T>(
  store: blocks_type,
  size: number,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  Slot: typeof block_slot_type,
  pos: number | bigint,
  first: delayed_delete_vector_iterator<T>,
  last: delayed_delete_vector_iterator<T>,
  callbacks: ContainerCallbacks<T>,
  hint?: iterator_base<P>,
): iterator_base<P> {
  const res = calc_input_end_position(first, last, pos, size);
  if (!res[1]) return make_iterator(store, parent, store.positions.size(), iterator_base);
  const index = hint
    ? get_block_position_hint(store, size, parent, hint.get_node().__private_data, pos)
    : get_block_position(store, size, pos);
  if (!hint && index === store.positions.size())
    throw_block_position_not_found(
      "multi_type_vector::set",
      823,
      pos,
      store.positions.size(),
      size,
    );
  return set_cells_impl(
    store,
    size,
    event,
    funcs,
    parent,
    Slot,
    Number(pos),
    Number(res[0]),
    index,
    first,
    last,
    callbacks,
  );
}

/** Original range block dispatch. @param store - Metadata. @param size - Logical size. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param Slot - Original nested type. @param row - Start. @param end_row - Inclusive end. @param index1 - First block. @param first - Input begin. @param last - Input end. @param callbacks - Overloads. @returns Iterator. */
export function set_cells_impl<P, T>(
  store: blocks_type,
  size: number,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  Slot: typeof block_slot_type,
  row: number,
  end_row: number,
  index1: number,
  first: delayed_delete_vector_iterator<T>,
  last: delayed_delete_vector_iterator<T>,
  callbacks: ContainerCallbacks<T>,
): iterator_base<P> {
  const index2 = get_block_position(store, size, end_row, index1);
  if (index2 === store.positions.size())
    throw_block_position_not_found(
      "multi_type_vector::set_cells_impl",
      2627,
      end_row,
      store.positions.size(),
      size,
    );
  if (index1 === index2)
    return set_cells_to_single_block(
      store,
      size,
      event,
      funcs,
      parent,
      row,
      end_row,
      index1,
      first,
      last,
      callbacks,
    );
  return set_cells_to_multi_blocks(
    store,
    event,
    funcs,
    parent,
    Slot,
    row,
    end_row,
    index1,
    index2,
    first,
    last,
    callbacks,
  );
}

/** Original range append to preceding matching block. @param store - Metadata. @param index - Current block. @param cat - Type. @param length - Input count. @param first - Input begin. @param last - Input end. @param callbacks - Overloads. @returns Whether appended. */
export function append_to_prev_block<T>(
  store: blocks_type,
  index: number,
  cat: element_t,
  length: number,
  first: delayed_delete_vector_iterator<T>,
  last: delayed_delete_vector_iterator<T>,
  callbacks: ContainerCallbacks<T>,
): boolean {
  if (!is_previous_block_of_type(store, index, cat)) return false;
  callbacks.mdds_mtv_append_values(
    store.element_blocks.get(index - 1) as base_element_block,
    first.get(),
    first,
    last,
  );
  store.sizes.set(index - 1, store.sizes.get(index - 1) + length);
  return true;
}

/** Original single-block whole/prefix/suffix/middle writes. @param store - Metadata. @param size - Size. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param start_row - Start. @param end_row - End. @param index - Block. @param first - Input begin. @param last - Input end. @param callbacks - Overloads. @returns Iterator. */
export function set_cells_to_single_block<P, T>(
  store: blocks_type,
  size: number,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  start_row: number,
  end_row: number,
  index: number,
  first: delayed_delete_vector_iterator<T>,
  last: delayed_delete_vector_iterator<T>,
  callbacks: ContainerCallbacks<T>,
): iterator_base<P> {
  const cat = callbacks.mdds_mtv_get_element_type(first.get());
  const block_start = store.positions.get(index),
    length = first.distance_to(last);
  let data = store.element_blocks.get(index);
  if (data && get_block_type(data) === cat) {
    const offset = start_row - block_start;
    funcs.overwrite_values(data, offset, length);
    if (!offset && length === store.sizes.get(index))
      callbacks.mdds_mtv_assign_values(data, first.get(), first, last);
    else callbacks.mdds_mtv_set_values(data, offset, first.get(), first, last);
    return make_iterator(store, parent, index, iterator_base);
  }
  const block_end = block_start + store.sizes.get(index) - 1;
  if (start_row === block_start) {
    if (end_row === block_end) {
      if (
        append_to_prev_block(store, index, cat, end_row - start_row + 1, first, last, callbacks)
      ) {
        delete_element_block(store, event, funcs, index);
        store.erase(index);
        --index;
        merge_with_next_block(store, event, funcs, index);
        return make_iterator(store, parent, index, iterator_base);
      }
      if (data) {
        event.element_block_released(data);
        funcs.delete_block(data);
      }
      store.element_blocks.set(index, funcs.create_new_block(cat, 0));
      data = store.element_blocks.get(index) as base_element_block;
      event.element_block_acquired(data);
      callbacks.mdds_mtv_assign_values(data, first.get(), first, last);
      merge_with_next_block(store, event, funcs, index);
      return make_iterator(store, parent, index, iterator_base);
    }
    let remaining = block_end - end_row;
    store.sizes.set(index, remaining);
    if (data) {
      const new_data = funcs.create_new_block(get_block_type(data), 0);
      if (!new_data) throw new Error("failed to create a new element block.");
      // Original unique_ptr owns the replacement until release; events are intentionally absent.
      try {
        const pos = end_row - block_start + 1;
        funcs.assign_values_from_block(new_data, data, pos, remaining);
        funcs.overwrite_values(data, 0, pos);
        funcs.resize_block(data, 0);
        funcs.delete_block(data);
        store.element_blocks.set(index, new_data);
      } catch (error) {
        funcs.delete_block(new_data);
        throw error;
      }
    }
    remaining = end_row - start_row + 1;
    if (append_to_prev_block(store, index, cat, remaining, first, last, callbacks)) {
      store.positions.set(index, store.positions.get(index) + remaining);
      return make_iterator(store, parent, index - 1, iterator_base);
    }
    const position = store.positions.get(index);
    store.positions.set(index, position + remaining);
    store.insert(index, position, remaining, null);
    store.element_blocks.set(index, funcs.create_new_block(cat, 0));
    data = store.element_blocks.get(index) as base_element_block;
    event.element_block_acquired(data);
    store.sizes.set(index, remaining);
    callbacks.mdds_mtv_assign_values(data, first.get(), first, last);
    return make_iterator(store, parent, index, iterator_base);
  }
  if (end_row === block_end) {
    let new_size = start_row - block_start;
    store.sizes.set(index, new_size);
    if (data) {
      funcs.overwrite_values(data, new_size, length);
      funcs.resize_block(data, new_size);
    }
    new_size = end_row - start_row + 1;
    if (index < store.positions.size() - 1) {
      if (is_next_block_of_type(store, index, cat)) {
        callbacks.mdds_mtv_prepend_values(
          store.element_blocks.get(index + 1) as base_element_block,
          first.get(),
          first,
          last,
        );
        store.sizes.set(index + 1, store.sizes.get(index + 1) + new_size);
        store.positions.set(index + 1, store.positions.get(index + 1) - new_size);
        return make_iterator(store, parent, index + 1, iterator_base);
      }
      store.insert(index + 1, 0, new_size, null);
      store.calc_block_position(index + 1);
      store.element_blocks.set(index + 1, funcs.create_new_block(cat, 0));
      data = store.element_blocks.get(index + 1) as base_element_block;
      event.element_block_acquired(data);
      callbacks.mdds_mtv_assign_values(data, first.get(), first, last);
      return make_iterator(store, parent, index + 1, iterator_base);
    }
    store.push_back(size - new_size, new_size, null);
    store.element_blocks.set(store.element_blocks.size() - 1, funcs.create_new_block(cat, 0));
    data = store.element_blocks.get(store.element_blocks.size() - 1) as base_element_block;
    event.element_block_acquired(data);
    callbacks.mdds_mtv_assign_values(data, first.get(), first, last);
    return make_iterator(store, parent, index + 1, iterator_base);
  }
  index = set_new_block_to_middle(
    store,
    event,
    funcs,
    index,
    start_row - block_start,
    end_row - start_row + 1,
    true,
  );
  store.element_blocks.set(index, funcs.create_new_block(cat, 0));
  data = store.element_blocks.get(index) as base_element_block;
  event.element_block_acquired(data);
  callbacks.mdds_mtv_assign_values(data, first.get(), first, last);
  return make_iterator(store, parent, index, iterator_base);
}

/** Original first-block emptiness dispatch. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param Slot - Original nested type. @param start - Start. @param end - End. @param index1 - First block. @param index2 - Last block. @param first - Input begin. @param last - Input end. @param callbacks - Overloads. @returns Iterator. */
export function set_cells_to_multi_blocks<P, T>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  Slot: typeof block_slot_type,
  start: number,
  end: number,
  index1: number,
  index2: number,
  first: delayed_delete_vector_iterator<T>,
  last: delayed_delete_vector_iterator<T>,
  callbacks: ContainerCallbacks<T>,
): iterator_base<P> {
  if (store.element_blocks.get(index1))
    return set_cells_to_multi_blocks_block1_non_empty(
      store,
      event,
      funcs,
      parent,
      Slot,
      start,
      end,
      index1,
      index2,
      first,
      last,
      callbacks,
    );
  return set_cells_to_multi_blocks_block1_non_equal(
    store,
    event,
    funcs,
    parent,
    Slot,
    start,
    end,
    index1,
    index2,
    first,
    last,
    callbacks,
  );
}

/** Original different-category range replacement and neighboring transfers. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param Slot - Original nested type. @param start - Start. @param end - End. @param index1 - First block. @param index2 - Last block. @param first - Input begin. @param last - Input end. @param callbacks - Overloads. @returns Iterator. */
export function set_cells_to_multi_blocks_block1_non_equal<P, T>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  Slot: typeof block_slot_type,
  start: number,
  end: number,
  index1: number,
  index2: number,
  first: delayed_delete_vector_iterator<T>,
  last: delayed_delete_vector_iterator<T>,
  callbacks: ContainerCallbacks<T>,
): iterator_base<P> {
  const cat = callbacks.mdds_mtv_get_element_type(first.get()),
    data1 = store.element_blocks.get(index1),
    data2 = store.element_blocks.get(index2);
  const start1 = store.positions.get(index1),
    start2 = store.positions.get(index2),
    length = first.distance_to(last),
    offset = start - start1,
    end2 = start2 + store.sizes.get(index2) - 1;
  let erase_begin = index1 + 1,
    erase_end = index2;
  const slot = new Slot(start, length);
  let copied = false;
  if (!offset) {
    --erase_begin;
    if (index1 > 0) {
      const data0 = store.element_blocks.get(index1 - 1);
      if (data0 && cat === get_block_type(data0)) {
        slot.element_block = data0;
        store.element_blocks.set(index1 - 1, null);
        slot.size += store.sizes.get(index1 - 1);
        slot.position = store.positions.get(index1 - 1);
        --erase_begin;
        copied = true;
      }
    }
  } else {
    if (data1) {
      funcs.overwrite_values(data1, offset, store.sizes.get(index1) - offset);
      funcs.resize_block(data1, offset);
    }
    store.sizes.set(index1, offset);
  }
  if (copied)
    callbacks.mdds_mtv_append_values(
      slot.element_block as base_element_block,
      first.get(),
      first,
      last,
    );
  else {
    slot.element_block = funcs.create_new_block(cat, 0);
    event.element_block_acquired(slot.element_block);
    callbacks.mdds_mtv_assign_values(slot.element_block, first.get(), first, last);
  }
  if (end === end2) {
    ++erase_end;
    if (index2 + 1 < store.positions.size()) {
      const data3 = store.element_blocks.get(index2 + 1);
      if (data3 && get_block_type(data3) === cat) {
        funcs.append_block(slot.element_block as base_element_block, data3);
        funcs.resize_block(data3, 0);
        slot.size += store.sizes.get(index2 + 1);
        ++erase_end;
      }
    }
  } else {
    let erase_upper = true;
    if (data2 && get_block_type(data2) === cat) {
      const pos = end - start2 + 1,
        count = end2 - end;
      funcs.append_values_from_block(slot.element_block as base_element_block, data2, pos, count);
      funcs.resize_block(data2, pos);
      slot.size += count;
      ++erase_end;
      erase_upper = false;
    }
    if (erase_upper) {
      const count = end - start2 + 1;
      if (data2) {
        funcs.overwrite_values(data2, 0, count);
        funcs.erase(data2, 0, count);
      }
      store.sizes.set(index2, store.sizes.get(index2) - count);
      store.positions.set(index2, store.positions.get(index2) + count);
    }
  }
  const insert_pos = erase_begin;
  delete_element_blocks(store, event, funcs, erase_begin, erase_end);
  store.erase(erase_begin, erase_end - erase_begin);
  store.insert(insert_pos, slot.position, slot.size, slot.element_block);
  return make_iterator(store, parent, insert_pos, iterator_base);
}

/** Original nonempty first-block extension, including native partial-last erase ordering. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param Slot - Original nested type. @param start - Start. @param end - End. @param index1 - First block. @param index2 - Last block. @param first - Input begin. @param last - Input end. @param callbacks - Overloads. @returns Iterator. */
export function set_cells_to_multi_blocks_block1_non_empty<P, T>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  Slot: typeof block_slot_type,
  start: number,
  end: number,
  index1: number,
  index2: number,
  first: delayed_delete_vector_iterator<T>,
  last: delayed_delete_vector_iterator<T>,
  callbacks: ContainerCallbacks<T>,
): iterator_base<P> {
  const start1 = store.positions.get(index1),
    start2 = store.positions.get(index2),
    cat = callbacks.mdds_mtv_get_element_type(first.get()),
    data1 = store.element_blocks.get(index1) as base_element_block;
  if (get_block_type(data1) === cat) {
    const length = first.distance_to(last),
      offset = start - start1,
      end2 = start2 + store.sizes.get(index2) - 1;
    const erase_begin = index1 + 1;
    let erase_end = index2;
    funcs.overwrite_values(data1, offset, store.sizes.get(index1) - offset);
    funcs.resize_block(data1, offset);
    callbacks.mdds_mtv_append_values(data1, first.get(), first, last);
    store.sizes.set(index1, offset + length);
    const data2 = store.element_blocks.get(index2);
    if (end === end2) ++erase_end;
    else if (data2) {
      if (get_block_type(data2) === cat) {
        const count = end2 - end,
          pos = end - start2 + 1;
        funcs.append_values_from_block(data1, data2, pos, count);
        funcs.overwrite_values(data2, 0, pos);
        funcs.resize_block(data2, 0);
        store.sizes.set(index1, store.sizes.get(index1) + count);
        ++erase_end;
      } else {
        const count = end - start2 + 1;
        funcs.erase(data2, 0, count);
        store.sizes.set(index2, store.sizes.get(index2) - count);
        store.positions.set(index2, store.positions.get(index2) + count);
      }
    } else {
      const count = end - start2 + 1;
      store.sizes.set(index2, store.sizes.get(index2) - count);
      store.positions.set(index2, store.positions.get(index2) + count);
    }
    delete_element_blocks(store, event, funcs, erase_begin, erase_end);
    store.erase(erase_begin, erase_end - erase_begin);
    return make_iterator(store, parent, index1, iterator_base);
  }
  return set_cells_to_multi_blocks_block1_non_equal(
    store,
    event,
    funcs,
    parent,
    Slot,
    start,
    end,
    index1,
    index2,
    first,
    last,
    callbacks,
  );
}

/** Original empty insertion body at main_def.inl boundary. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param loop_unrolling - Original trait. @param pos - Row. @param block_index - Block. @param length - Count. @param increment_size - Actual primitive field update. @returns Iterator. */
export function insert_empty_impl<P>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  loop_unrolling: scalar_lu_factor,
  pos: number,
  block_index: number,
  length: number,
  increment_size: (length: number) => void,
): iterator_base<P> {
  const blk_data = store.element_blocks.get(block_index);
  if (!blk_data) {
    store.sizes.set(block_index, store.sizes.get(block_index) + length);
    increment_size(length);
    adjust_block_positions(loop_unrolling)(store, block_index + 1, length);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  const start_pos = store.positions.get(block_index);
  if (start_pos === pos) {
    const blk_prev = is_previous_block_of_type(store, block_index, element_type_empty);
    if (blk_prev) {
      store.sizes.set(block_index - 1, store.sizes.get(block_index - 1) + length);
      increment_size(length);
      adjust_block_positions(loop_unrolling)(store, block_index, length);
      return make_iterator(store, parent, block_index - 1, iterator_base);
    }
    store.insert(block_index, start_pos, length, null);
    increment_size(length);
    adjust_block_positions(loop_unrolling)(store, block_index + 1, length);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  const size_blk_prev = pos - start_pos;
  const size_blk_next = store.sizes.get(block_index) - size_blk_prev;
  store.insert(block_index + 1, 2);
  store.sizes.set(block_index + 1, length);
  store.sizes.set(block_index + 2, size_blk_next);
  store.element_blocks.set(block_index + 2, funcs.create_new_block(get_block_type(blk_data), 0));
  const next_data = store.element_blocks.get(block_index + 2) as base_element_block;
  event.element_block_acquired(next_data);
  if (size_blk_prev > size_blk_next) {
    funcs.assign_values_from_block(next_data, blk_data, size_blk_prev, size_blk_next);
    funcs.resize_block(blk_data, size_blk_prev);
    store.sizes.set(block_index, size_blk_prev);
  } else {
    funcs.assign_values_from_block(next_data, blk_data, 0, size_blk_prev);
    store.sizes.set(block_index + 2, size_blk_prev);
    funcs.erase(blk_data, 0, size_blk_prev);
    store.sizes.set(block_index, size_blk_next);
    const position = store.positions.get(block_index);
    store.swap(block_index, block_index + 2);
    store.positions.set(block_index, position);
  }
  increment_size(length);
  store.calc_block_position(block_index + 1);
  store.calc_block_position(block_index + 2);
  adjust_block_positions(loop_unrolling)(store, block_index + 3, length);
  return make_iterator(store, parent, block_index + 1, iterator_base);
}

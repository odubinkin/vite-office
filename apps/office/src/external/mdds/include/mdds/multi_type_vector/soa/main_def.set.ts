/** @fileoverview Original main_def.inl single-value set member family; borrows the existing SoA fields without a second engine. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { type base_element_block, get_block_type } from "../types.ts";
import { throw_block_position_not_found } from "../util.ts";
import { iterator_base } from "./iterator.ts";
import {
  type blocks_type,
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
  create_new_block_with_new_cell,
  set_new_block_to_middle,
} from "./main_def.ts";

/** Original plain/hinted const-value set lookup before mutation. @param store - Actual fields. @param size - Logical size. @param event - Handler. @param funcs - Block operations. @param parent - Actual owner. @param first - Row or hint. @param second - Value or hinted row. @param third - Callbacks or hinted value. @param fourth - Hinted callbacks. @returns Original mutable iterator. */
export function set<P, T>(
  store: blocks_type,
  size: number,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  first: number | bigint | iterator_base<P>,
  second: T | number | bigint,
  third: T | ContainerCallbacks<T>,
  fourth?: ContainerCallbacks<T>,
): iterator_base<P> {
  const hint = typeof first === "object" ? first : undefined;
  const pos = hint ? (second as number | bigint) : (first as number | bigint);
  const value = hint ? (third as T) : (second as T);
  const callbacks = hint ? (fourth as ContainerCallbacks<T>) : (third as ContainerCallbacks<T>);
  const block_index = hint
    ? get_block_position_hint(store, size, parent, hint.get_node().__private_data, pos)
    : get_block_position(store, size, pos);
  if (block_index === store.positions.size())
    throw_block_position_not_found(
      "multi_type_vector::set",
      hint ? 776 : 735,
      pos,
      store.positions.size(),
      size,
    );
  const row = Number(pos);
  return set_impl(store, event, funcs, parent, row, block_index, value, callbacks, size);
}

/** Original set_impl category and top/middle/bottom dispatch. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param pos - Valid row. @param block_index - Located block. @param value - Const value. @param callbacks - Native overloads. @param size - Original logical size. @returns Original returned block iterator. */
export function set_impl<P, T>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  pos: number,
  block_index: number,
  value: T,
  callbacks: ContainerCallbacks<T>,
  size: number,
): iterator_base<P> {
  const start_row = store.positions.get(block_index),
    blk_size = store.sizes.get(block_index),
    blk_data = store.element_blocks.get(block_index);
  const pos_in_block = pos - start_row;
  if (!blk_data)
    return set_cell_to_empty_block(
      store,
      event,
      funcs,
      parent,
      block_index,
      pos_in_block,
      value,
      callbacks,
      size,
    );
  const cat = callbacks.mdds_mtv_get_element_type(value),
    blk_cat = get_block_type(blk_data);
  if (blk_cat === cat) {
    const i = pos - start_row;
    funcs.overwrite_values(blk_data, i, 1);
    callbacks.mdds_mtv_set_value(blk_data, i, value);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  if (pos === start_row) {
    if (blk_size === 1)
      return set_cell_to_non_empty_block_of_size_one(
        store,
        event,
        funcs,
        parent,
        block_index,
        value,
        callbacks,
      );
    const blk_prev = is_previous_block_of_type(store, block_index, cat);
    if (blk_prev) {
      store.sizes.set(block_index, store.sizes.get(block_index) - 1);
      store.positions.set(block_index, store.positions.get(block_index) + 1);
      funcs.overwrite_values(blk_data, 0, 1);
      funcs.erase(blk_data, 0);
      store.sizes.set(block_index - 1, store.sizes.get(block_index - 1) + 1);
      callbacks.mdds_mtv_append_value(
        store.element_blocks.get(block_index - 1) as base_element_block,
        value,
      );
      return make_iterator(store, parent, block_index - 1, iterator_base);
    }
    set_cell_to_top_of_data_block(store, event, funcs, block_index, value, callbacks);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  if (pos < start_row + blk_size - 1)
    return set_cell_to_middle_of_block(
      store,
      event,
      funcs,
      parent,
      block_index,
      pos_in_block,
      value,
      callbacks,
    );
  if (block_index === 0) {
    if (store.positions.size() === 1) {
      set_cell_to_bottom_of_data_block(store, event, funcs, 0, value, callbacks);
      return make_iterator(store, parent, store.positions.size(), iterator_base).decrement();
    }
    const blk_next = is_next_block_of_type(store, block_index, cat);
    if (!blk_next) {
      set_cell_to_bottom_of_data_block(store, event, funcs, 0, value, callbacks);
      return make_iterator(store, parent, 0, iterator_base).increment();
    }
    funcs.overwrite_values(blk_data, blk_size - 1, 1);
    funcs.erase(blk_data, blk_size - 1);
    store.sizes.set(block_index, store.sizes.get(block_index) - 1);
    callbacks.mdds_mtv_prepend_value(
      store.element_blocks.get(block_index + 1) as base_element_block,
      value,
    );
    store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + 1);
    store.positions.set(block_index + 1, store.positions.get(block_index + 1) - 1);
    return make_iterator(store, parent, block_index + 1, iterator_base);
  }
  if (block_index === store.positions.size() - 1) {
    set_cell_to_bottom_of_data_block(store, event, funcs, block_index, value, callbacks);
    return make_iterator(store, parent, store.positions.size(), iterator_base).decrement();
  }
  const blk_next = is_next_block_of_type(store, block_index, cat);
  if (!blk_next) {
    set_cell_to_bottom_of_data_block(store, event, funcs, block_index, value, callbacks);
    return make_iterator(store, parent, block_index + 1, iterator_base);
  }
  funcs.overwrite_values(blk_data, blk_size - 1, 1);
  funcs.erase(blk_data, blk_size - 1);
  store.sizes.set(block_index, store.sizes.get(block_index) - 1);
  callbacks.mdds_mtv_prepend_value(
    store.element_blocks.get(block_index + 1) as base_element_block,
    value,
  );
  store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + 1);
  store.positions.set(block_index + 1, store.positions.get(block_index + 1) - 1);
  return make_iterator(store, parent, block_index + 1, iterator_base);
}

/** Original empty-block single-cell insertion and size-based neighboring merge choices. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param block_index - Empty block. @param pos_in_block - Offset. @param cell - Const value. @param callbacks - Native overloads. @param size - Original logical size. @returns Original iterator. */
export function set_cell_to_empty_block<P, T>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  block_index: number,
  pos_in_block: number,
  cell: T,
  callbacks: ContainerCallbacks<T>,
  size: number,
): iterator_base<P> {
  if (block_index === 0) {
    if (store.positions.size() === 1) {
      if (size === 1) {
        create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
        return make_iterator(store, parent, 0, iterator_base);
      }
      if (pos_in_block === 0) {
        store.sizes.set(block_index, store.sizes.get(block_index) - 1);
        store.positions.insert(0, [0]);
        store.sizes.insert(0, [1]);
        store.element_blocks.insert(0, [null]);
        create_new_block_with_new_cell(store, event, funcs, 0, cell, callbacks, false);
        store.positions.set(1, 1);
        return make_iterator(store, parent, 0, iterator_base);
      }
      if (pos_in_block === store.sizes.get(block_index) - 1) {
        store.sizes.set(block_index, store.sizes.get(block_index) - 1);
        store.positions.push_back(store.sizes.get(block_index));
        store.sizes.push_back(1);
        store.element_blocks.push_back(null);
        create_new_block_with_new_cell(
          store,
          event,
          funcs,
          block_index + 1,
          cell,
          callbacks,
          false,
        );
        return make_iterator(store, parent, store.positions.size(), iterator_base).decrement();
      }
      return set_cell_to_middle_of_block(
        store,
        event,
        funcs,
        parent,
        block_index,
        pos_in_block,
        cell,
        callbacks,
      );
    }
    if (pos_in_block === 0) {
      if (store.sizes.get(block_index) === 1) {
        const cat = callbacks.mdds_mtv_get_element_type(cell),
          blk_next = is_next_block_of_type(store, block_index, cat);
        if (blk_next) {
          delete_element_block(store, event, funcs, block_index);
          store.erase(block_index);
          store.sizes.set(block_index, store.sizes.get(block_index) + 1);
          store.positions.set(block_index, store.positions.get(block_index) - 1);
          callbacks.mdds_mtv_prepend_value(
            store.element_blocks.get(block_index) as base_element_block,
            cell,
          );
        } else
          create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
      } else {
        store.sizes.set(0, store.sizes.get(0) - 1);
        store.positions.set(0, 1);
        store.positions.insert(0, [0]);
        store.sizes.insert(0, [1]);
        store.element_blocks.insert(0, [null]);
        create_new_block_with_new_cell(store, event, funcs, 0, cell, callbacks, false);
      }
      return make_iterator(store, parent, 0, iterator_base);
    }
    if (pos_in_block === store.sizes.get(block_index) - 1) {
      const cat = callbacks.mdds_mtv_get_element_type(cell),
        blk_next = is_next_block_of_type(store, block_index, cat);
      if (blk_next) {
        store.sizes.set(block_index, store.sizes.get(block_index) - 1);
        store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + 1);
        store.positions.set(block_index + 1, store.positions.get(block_index + 1) - 1);
        callbacks.mdds_mtv_prepend_value(
          store.element_blocks.get(block_index + 1) as base_element_block,
          cell,
        );
      } else {
        store.sizes.set(block_index, store.sizes.get(block_index) - 1);
        store.insert(block_index + 1, 1);
        store.calc_block_position(block_index + 1);
        store.sizes.set(block_index + 1, 1);
        create_new_block_with_new_cell(
          store,
          event,
          funcs,
          block_index + 1,
          cell,
          callbacks,
          false,
        );
      }
      return make_iterator(store, parent, block_index + 1, iterator_base);
    }
    return set_cell_to_middle_of_block(
      store,
      event,
      funcs,
      parent,
      block_index,
      pos_in_block,
      cell,
      callbacks,
    );
  }
  if (pos_in_block === 0) {
    const blk_cat_prev = get_block_type(
        store.element_blocks.get(block_index - 1) as base_element_block,
      ),
      cat = callbacks.mdds_mtv_get_element_type(cell);
    if (blk_cat_prev === cat) {
      if (store.sizes.get(block_index) === 1) {
        if (block_index === store.positions.size() - 1) {
          delete_element_block(store, event, funcs, block_index);
          store.pop_back();
          append_cell_to_block(store, block_index - 1, cell, callbacks);
        } else {
          const blk_next = is_next_block_of_type(store, block_index, blk_cat_prev);
          if (blk_next) {
            if (store.sizes.get(block_index - 1) < store.sizes.get(block_index + 1)) {
              const position = store.positions.get(block_index - 1);
              const data = store.element_blocks.get(block_index),
                prev_data = store.element_blocks.get(block_index - 1) as base_element_block,
                next_data = store.element_blocks.get(block_index + 1) as base_element_block;
              store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + 1);
              callbacks.mdds_mtv_prepend_value(next_data, cell);
              const prev_size = store.sizes.get(block_index - 1);
              funcs.prepend_values_from_block(next_data, prev_data, 0, prev_size);
              store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + prev_size);
              store.positions.set(block_index + 1, position);
              funcs.resize_block(prev_data, 0);
              event.element_block_released(prev_data);
              funcs.delete_block(data);
              funcs.delete_block(prev_data);
              store.erase(block_index - 1, 2);
            } else {
              store.sizes.set(
                block_index - 1,
                store.sizes.get(block_index - 1) + 1 + store.sizes.get(block_index + 1),
              );
              const data = store.element_blocks.get(block_index),
                data_prev = store.element_blocks.get(block_index - 1) as base_element_block,
                data_next = store.element_blocks.get(block_index + 1) as base_element_block;
              callbacks.mdds_mtv_append_value(data_prev, cell);
              funcs.append_block(data_prev, data_next);
              funcs.resize_block(data_next, 0);
              event.element_block_released(data_next);
              funcs.delete_block(data);
              funcs.delete_block(data_next);
              store.erase(block_index, 2);
            }
          } else {
            delete_element_block(store, event, funcs, block_index);
            store.erase(block_index);
            append_cell_to_block(store, block_index - 1, cell, callbacks);
          }
        }
      } else {
        store.sizes.set(block_index, store.sizes.get(block_index) - 1);
        store.positions.set(block_index, store.positions.get(block_index) + 1);
        append_cell_to_block(store, block_index - 1, cell, callbacks);
      }
      return make_iterator(store, parent, block_index - 1, iterator_base);
    } else {
      if (store.sizes.get(block_index) === 1) {
        if (block_index === store.positions.size() - 1)
          create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
        else {
          const blk_next = is_next_block_of_type(store, block_index, cat);
          if (blk_next) {
            store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + 1);
            store.positions.set(block_index + 1, store.positions.get(block_index + 1) - 1);
            callbacks.mdds_mtv_prepend_value(
              store.element_blocks.get(block_index + 1) as base_element_block,
              cell,
            );
            delete_element_block(store, event, funcs, block_index);
            store.erase(block_index);
          } else
            create_new_block_with_new_cell(
              store,
              event,
              funcs,
              block_index,
              cell,
              callbacks,
              false,
            );
        }
      } else {
        const new_block_size = store.sizes.get(block_index) - 1,
          new_block_position = store.positions.get(block_index) + 1;
        store.sizes.set(block_index, 1);
        create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
        store.insert(block_index + 1, new_block_position, new_block_size, null);
      }
      return make_iterator(store, parent, block_index, iterator_base);
    }
  } else if (pos_in_block === store.sizes.get(block_index) - 1) {
    if (block_index === store.positions.size() - 1) {
      store.sizes.set(block_index, store.sizes.get(block_index) - 1);
      store.push_back(0, 1, null);
      store.calc_block_position(block_index + 1);
      create_new_block_with_new_cell(store, event, funcs, block_index + 1, cell, callbacks, false);
      return make_iterator(store, parent, store.positions.size(), iterator_base).decrement();
    } else {
      const cat = callbacks.mdds_mtv_get_element_type(cell),
        blk_next = is_next_block_of_type(store, block_index, cat);
      if (blk_next) {
        store.sizes.set(block_index, store.sizes.get(block_index) - 1);
        store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + 1);
        store.positions.set(block_index + 1, store.positions.get(block_index + 1) - 1);
        callbacks.mdds_mtv_prepend_value(
          store.element_blocks.get(block_index + 1) as base_element_block,
          cell,
        );
      } else {
        store.sizes.set(block_index, store.sizes.get(block_index) - 1);
        store.insert(block_index + 1, 0, 1, null);
        store.calc_block_position(block_index + 1);
        create_new_block_with_new_cell(
          store,
          event,
          funcs,
          block_index + 1,
          cell,
          callbacks,
          false,
        );
      }
      return make_iterator(store, parent, block_index + 1, iterator_base);
    }
  }
  return set_cell_to_middle_of_block(
    store,
    event,
    funcs,
    parent,
    block_index,
    pos_in_block,
    cell,
    callbacks,
  );
}

/** Original nonempty singleton replacement and complete neighbor merge dispatch. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param block_index - Singleton. @param cell - Const value. @param callbacks - Native overloads. @returns Original iterator. */
export function set_cell_to_non_empty_block_of_size_one<P, T>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  block_index: number,
  cell: T,
  callbacks: ContainerCallbacks<T>,
): iterator_base<P> {
  const cat = callbacks.mdds_mtv_get_element_type(cell);
  if (block_index === 0) {
    if (block_index === store.positions.size() - 1) {
      create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
      return make_iterator(store, parent, 0, iterator_base);
    }
    const blk_next = is_next_block_of_type(store, block_index, cat);
    if (!blk_next) {
      create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
      return make_iterator(store, parent, 0, iterator_base);
    }
    store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + 1);
    store.positions.set(block_index + 1, store.positions.get(block_index + 1) - 1);
    callbacks.mdds_mtv_prepend_value(
      store.element_blocks.get(block_index + 1) as base_element_block,
      cell,
    );
    delete_element_block(store, event, funcs, block_index);
    store.erase(block_index);
    return make_iterator(store, parent, 0, iterator_base);
  }
  if (block_index === store.positions.size() - 1) {
    const prev_data = store.element_blocks.get(block_index - 1);
    if (!prev_data || get_block_type(prev_data) !== cat)
      create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
    else {
      callbacks.mdds_mtv_append_value(prev_data, cell);
      store.sizes.set(block_index - 1, store.sizes.get(block_index - 1) + 1);
      delete_element_block(store, event, funcs, block_index);
      store.erase(block_index);
    }
    return make_iterator(store, parent, store.positions.size(), iterator_base).decrement();
  }
  if (!store.element_blocks.get(block_index - 1)) {
    if (!store.element_blocks.get(block_index + 1)) {
      create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
      return make_iterator(store, parent, block_index, iterator_base);
    }
    const blk_cat_next = get_block_type(
      store.element_blocks.get(block_index + 1) as base_element_block,
    );
    if (blk_cat_next === cat) {
      delete_element_block(store, event, funcs, block_index);
      store.erase(block_index);
      store.sizes.set(block_index, store.sizes.get(block_index) + 1);
      store.positions.set(block_index, store.positions.get(block_index) - 1);
      callbacks.mdds_mtv_prepend_value(
        store.element_blocks.get(block_index) as base_element_block,
        cell,
      );
      return make_iterator(store, parent, block_index, iterator_base);
    }
    create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  if (!store.element_blocks.get(block_index + 1)) {
    const prev_data = store.element_blocks.get(block_index - 1) as base_element_block,
      prev_cat = get_block_type(prev_data);
    if (prev_cat === cat) {
      store.sizes.set(block_index - 1, store.sizes.get(block_index - 1) + 1);
      callbacks.mdds_mtv_append_value(prev_data, cell);
      delete_element_block(store, event, funcs, block_index);
      store.erase(block_index);
      return make_iterator(store, parent, block_index - 1, iterator_base);
    }
    create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  const prev_data = store.element_blocks.get(block_index - 1) as base_element_block,
    next_data = store.element_blocks.get(block_index + 1) as base_element_block;
  const prev_cat = get_block_type(prev_data),
    next_cat = get_block_type(next_data);
  if (prev_cat === next_cat) {
    if (prev_cat === cat) {
      store.sizes.set(
        block_index - 1,
        store.sizes.get(block_index - 1) + 1 + store.sizes.get(block_index + 1),
      );
      callbacks.mdds_mtv_append_value(prev_data, cell);
      funcs.append_block(prev_data, next_data);
      funcs.resize_block(next_data, 0);
      delete_element_block(store, event, funcs, block_index);
      delete_element_block(store, event, funcs, block_index + 1);
      store.erase(block_index, 2);
      return make_iterator(store, parent, block_index - 1, iterator_base);
    }
    create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  if (prev_cat === cat) {
    store.sizes.set(block_index - 1, store.sizes.get(block_index - 1) + 1);
    callbacks.mdds_mtv_append_value(prev_data, cell);
    delete_element_block(store, event, funcs, block_index);
    store.erase(block_index);
    return make_iterator(store, parent, block_index - 1, iterator_base);
  }
  if (next_cat === cat) {
    store.sizes.set(block_index + 1, store.sizes.get(block_index + 1) + 1);
    store.positions.set(block_index + 1, store.positions.get(block_index + 1) - 1);
    callbacks.mdds_mtv_prepend_value(next_data, cell);
    delete_element_block(store, event, funcs, block_index);
    store.erase(block_index);
    return make_iterator(store, parent, block_index, iterator_base);
  }
  create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
  return make_iterator(store, parent, block_index, iterator_base);
}

/** Original middle setter uses the existing smaller-side split member. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param parent - Owner. @param block_index - Current block. @param pos_in_block - Offset. @param cell - Const value. @param callbacks - Overloads. @returns Original inserted iterator. */
export function set_cell_to_middle_of_block<P, T>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  parent: P,
  block_index: number,
  pos_in_block: number,
  cell: T,
  callbacks: ContainerCallbacks<T>,
): iterator_base<P> {
  block_index = set_new_block_to_middle(store, event, funcs, block_index, pos_in_block, 1, true);
  create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
  return make_iterator(store, parent, block_index, iterator_base);
}
/** Original top setter overwrites/erases before inserting the new value block. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param block_index - Current block. @param cell - Const value. @param callbacks - Overloads. @returns Nothing. */
export function set_cell_to_top_of_data_block<T>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  block_index: number,
  cell: T,
  callbacks: ContainerCallbacks<T>,
): void {
  store.sizes.set(block_index, store.sizes.get(block_index) - 1);
  const position = store.positions.get(block_index);
  store.positions.set(block_index, store.positions.get(block_index) + 1);
  const data = store.element_blocks.get(block_index);
  if (data) {
    funcs.overwrite_values(data, 0, 1);
    funcs.erase(data, 0);
  }
  store.insert(block_index, position, 1, null);
  create_new_block_with_new_cell(store, event, funcs, block_index, cell, callbacks, false);
}
/** Original bottom setter erases the last value before inserting metadata. @param store - Metadata. @param event - Handler. @param funcs - Operations. @param block_index - Current block. @param cell - Const value. @param callbacks - Overloads. @returns Nothing. */
export function set_cell_to_bottom_of_data_block<T>(
  store: blocks_type,
  event: ContainerEvent,
  funcs: BlocksTraits["block_funcs"],
  block_index: number,
  cell: T,
  callbacks: ContainerCallbacks<T>,
): void {
  const blk_data = store.element_blocks.get(block_index),
    blk_size = store.sizes.get(block_index);
  if (blk_data) {
    funcs.overwrite_values(blk_data, blk_size - 1, 1);
    funcs.erase(blk_data, blk_size - 1);
  }
  store.sizes.set(block_index, blk_size - 1);
  store.insert(block_index + 1, 0, 1, null);
  store.calc_block_position(block_index + 1);
  create_new_block_with_new_cell(store, event, funcs, block_index + 1, cell, callbacks, false);
}
/** Original append-cell member increments metadata before the const-value append. @param store - Metadata. @param block_index - Target. @param cell - Const value. @param callbacks - Overloads. @returns Nothing. */
export function append_cell_to_block<T>(
  store: blocks_type,
  block_index: number,
  cell: T,
  callbacks: ContainerCallbacks<T>,
): void {
  store.sizes.set(block_index, store.sizes.get(block_index) + 1);
  callbacks.mdds_mtv_append_value(
    store.element_blocks.get(block_index) as base_element_block,
    cell,
  );
}
/** Original push_back_impl block mutation; original size field increments before iterator construction. @param store - Metadata. @param parent - Owner. @param size - Original logical size. @param value - Native value. @param callbacks - Original family. @param move - Forwarding category. @param increment_size - Actual primitive field increment. @param create_cell - Actual owner helper. @returns Original iterator. */
export function push_back_impl<P, T>(
  store: blocks_type,
  parent: P,
  size: number,
  value: T,
  callbacks: ContainerCallbacks<T>,
  move: boolean,
  increment_size: () => void,
  create_cell: (index: number, value: T, callbacks: ContainerCallbacks<T>, move: boolean) => void,
): iterator_base<P> {
  const cat = callbacks.mdds_mtv_get_element_type(value);
  const last_data =
    store.element_blocks.size() === 0
      ? null
      : store.element_blocks.get(store.element_blocks.size() - 1);
  if (!last_data || cat !== get_block_type(last_data)) {
    const block_index = store.positions.size();
    const start_pos = size;
    store.push_back(start_pos, 1, null);
    create_cell(block_index, value, callbacks, move);

    increment_size();
    return make_iterator(store, parent, block_index, iterator_base);
  }
  const block_index = store.positions.size() - 1;
  if (move) callbacks.mdds_mtv_append_value_move(last_data, value);
  else callbacks.mdds_mtv_append_value(last_data, value);
  store.sizes.set(block_index, store.sizes.get(block_index) + 1);

  increment_size();
  return make_iterator(store, parent, block_index, iterator_base);
}

/** Original empty append member body over actual fields. @param store - Metadata. @param size - Logical size. @param len - Count. @param set_size - Actual primitive assignment. @returns New-block admission. */
export function append_empty(
  store: blocks_type,
  size: number,
  len: number,
  set_size: (size: number) => void,
): boolean {
  if (store.positions.size() === 0) {
    store.push_back(0, len, null);
    set_size(len);
    return true;
  }
  let new_block_added = false;
  const last = store.element_blocks.size() - 1;
  const last_data = store.element_blocks.get(last);
  if (!last_data) store.sizes.set(last, store.sizes.get(last) + len);
  else {
    store.push_back(size, len, null);
    new_block_added = true;
  }
  set_size(size + len);
  return new_block_added;
}

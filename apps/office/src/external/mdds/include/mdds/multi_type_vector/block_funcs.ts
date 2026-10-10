/** @fileoverview Original mdds block_funcs.hpp static discriminator dispatch with explicit erased template specializations. */
// SPDX-FileCopyrightText: 2022 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { general_error } from "../global.ts";
import { type base_element_block, type element_t, get_block_type } from "./types.ts";
/** Original complete static block-operation type contract, independent of value and storage implementation. */
export interface ElementBlockType {
  readonly block_type: element_t;
  create_block(init_size: number): base_element_block;
  copy_block(block: base_element_block): base_element_block;
  clone_block(block: base_element_block): base_element_block;
  delete_block(p: base_element_block | null): void;
  resize_block(block: base_element_block, new_size: number): void;
  print_block(block: base_element_block): void;
  append_block(dest: base_element_block, src: base_element_block): void;
  append_values_from_block(
    dest: base_element_block,
    src: base_element_block,
    begin_pos: number,
    len: number,
  ): void;
  assign_values_from_block(
    dest: base_element_block,
    src: base_element_block,
    begin_pos: number,
    len: number,
  ): void;
  prepend_values_from_block(
    dest: base_element_block,
    src: base_element_block,
    begin_pos: number,
    len: number,
  ): void;
  swap_values(
    blk1: base_element_block,
    blk2: base_element_block,
    pos1: number,
    pos2: number,
    len: number,
  ): void;
  equal_block(left: base_element_block, right: base_element_block): boolean;
  overwrite_values(block: base_element_block, pos: number, len: number): void;
  shrink_to_fit(block: base_element_block): void;
  size(block: base_element_block): number;
  erase_value(block: base_element_block, pos: number): void;
  erase_values(block: base_element_block, pos: number, size: number): void;
}
/** Original unknown-type diagnostic. @param func - Original method name. @param type - Discriminator. @returns Never. */
export function throw_unknown_block(func: string, type: element_t): never {
  throw new general_error(`${func}: failed to map to a element block function (type=${type})`);
}
/** Original lookup with the original calling method diagnostic. @param func_map - Specialization functions. @param type - Discriminator. @param src_func_name - Original method. @returns Registered handler. */
export function find_func<F>(
  func_map: ReadonlyMap<element_t, F>,
  type: element_t,
  src_func_name: string,
): F {
  const f = func_map.get(type);
  if (f === undefined) throw_unknown_block(src_func_name, type);
  return f;
}
/** Original template parameter pack, specialized once without number type guessing. @param Ts - Original block classes. @returns Static dispatcher specialization. */
export function element_block_funcs(...Ts: readonly ElementBlockType[]) {
  // Each original method has its own function-local static map. Methods bind
  // the explicit erased CRTP receiver used by the existing scalar block owner.
  const maps = new Map<keyof ElementBlockType, ReadonlyMap<element_t, unknown>>();
  /** Initializes a method-local static map on first use. @param name - Handler method. @param type - Discriminator. @param source - Calling method. @returns Bound original handler. */
  function handler<K extends Exclude<keyof ElementBlockType, "block_type">>(
    name: K,
    type: element_t,
    source: string,
  ): ElementBlockType[K] {
    let map = maps.get(name);
    if (!map) {
      const initialized = new Map<element_t, ElementBlockType[K]>();
      for (const T of Ts)
        if (!initialized.has(T.block_type))
          initialized.set(T.block_type, T[name].bind(T) as ElementBlockType[K]);
      map = initialized;
      maps.set(name, map);
    }
    return find_func(map, type, source) as ElementBlockType[K];
  }
  /** Original static-only element_block_funcs specialization. */
  const element_block_funcs = {
    /** Original create_new_block dispatch. @param type - Original argument. @param init_size - Original argument. @returns Original result. */
    create_new_block(type: element_t, init_size: number): base_element_block {
      return handler("create_block", type, "create_new_block")(init_size);
    },
    /** Original copy_block dispatch. @param block - Original argument. @returns Original result. */
    copy_block(block: base_element_block): base_element_block {
      return handler("copy_block", get_block_type(block), "copy_block")(block);
    },
    /** Original clone_block dispatch. @param block - Original argument. @returns Original result. */
    clone_block(block: base_element_block): base_element_block {
      return handler("clone_block", get_block_type(block), "clone_block")(block);
    },
    /** Original delete_block dispatch. @param p - Original argument. @returns Original result. */
    delete_block(p: base_element_block | null): void {
      if (!p) return;
      return handler("delete_block", get_block_type(p), "delete_block")(p);
    },
    /** Original resize_block dispatch. @param block - Original argument. @param new_size - Original argument. @returns Original result. */
    resize_block(block: base_element_block, new_size: number): void {
      return handler("resize_block", get_block_type(block), "resize_block")(block, new_size);
    },
    /** Original print_block dispatch. @param block - Original argument. @returns Original result. */
    print_block(block: base_element_block): void {
      return handler("print_block", get_block_type(block), "print_block")(block);
    },
    /** Original append_block dispatch. @param dest - Original argument. @param src - Original argument. @returns Original result. */
    append_block(dest: base_element_block, src: base_element_block): void {
      return handler("append_block", get_block_type(dest), "append_block")(dest, src);
    },
    /** Original append_values_from_block dispatch. @param dest - Original argument. @param src - Original argument. @param begin_pos - Original argument. @param len - Original argument. @returns Original result. */
    append_values_from_block(
      dest: base_element_block,
      src: base_element_block,
      begin_pos: number,
      len: number,
    ): void {
      return handler("append_values_from_block", get_block_type(dest), "append_values_from_block")(
        dest,
        src,
        begin_pos,
        len,
      );
    },
    /** Original assign_values_from_block dispatch. @param dest - Original argument. @param src - Original argument. @param begin_pos - Original argument. @param len - Original argument. @returns Original result. */
    assign_values_from_block(
      dest: base_element_block,
      src: base_element_block,
      begin_pos: number,
      len: number,
    ): void {
      return handler("assign_values_from_block", get_block_type(dest), "assign_values_from_block")(
        dest,
        src,
        begin_pos,
        len,
      );
    },
    /** Original prepend_values_from_block dispatch. @param dest - Original argument. @param src - Original argument. @param begin_pos - Original argument. @param len - Original argument. @returns Original result. */
    prepend_values_from_block(
      dest: base_element_block,
      src: base_element_block,
      begin_pos: number,
      len: number,
    ): void {
      return handler(
        "prepend_values_from_block",
        get_block_type(dest),
        "prepend_values_from_block",
      )(dest, src, begin_pos, len);
    },
    /** Original swap_values dispatch. @param blk1 - Original argument. @param blk2 - Original argument. @param pos1 - Original argument. @param pos2 - Original argument. @param len - Original argument. @returns Original result. */
    swap_values(
      blk1: base_element_block,
      blk2: base_element_block,
      pos1: number,
      pos2: number,
      len: number,
    ): void {
      if (get_block_type(blk1) !== get_block_type(blk2))
        throw new Error("blk1_type == get_block_type(blk2)");
      return handler("swap_values", get_block_type(blk1), "swap_values")(
        blk1,
        blk2,
        pos1,
        pos2,
        len,
      );
    },
    /** Original equal_block dispatch. @param left - Original argument. @param right - Original argument. @returns Original result. */
    equal_block(left: base_element_block, right: base_element_block): boolean {
      if (get_block_type(left) !== get_block_type(right)) return false;
      return handler("equal_block", get_block_type(left), "equal_block")(left, right);
    },
    /** Original overwrite_values dispatch. @param block - Original argument. @param pos - Original argument. @param len - Original argument. @returns Original result. */
    overwrite_values(block: base_element_block, pos: number, len: number): void {
      return handler("overwrite_values", get_block_type(block), "overwrite_values")(
        block,
        pos,
        len,
      );
    },
    /** Original shrink_to_fit dispatch. @param block - Original argument. @returns Original result. */
    shrink_to_fit(block: base_element_block): void {
      return handler("shrink_to_fit", get_block_type(block), "shrink_to_fit")(block);
    },
    /** Original size dispatch. @param block - Original argument. @returns Original result. */
    size(block: base_element_block): number {
      return handler("size", get_block_type(block), "size")(block);
    },
    /** Retains both original erase overloads and their identical diagnostic name. @param block - Owner. @param pos - Position. @param size - Optional range count. @returns Nothing. */
    erase(block: base_element_block, pos: number, size?: number): void {
      if (size === undefined)
        return handler("erase_value", get_block_type(block), "erase")(block, pos);
      return handler("erase_values", get_block_type(block), "erase")(block, pos, size);
    },
  };
  return element_block_funcs;
}

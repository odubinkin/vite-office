/** @fileoverview Original private SoA block_slot_type, blocks_type and blocks_to_transfer owners; no replacement multi_type_vector engine. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { integrity_error } from "../../global.ts";
import { type base_element_block } from "../types.ts";
import { std_vector } from "../vector_storage.ts";
import { clone_construction_type, type default_traits } from "../util.ts";
import { copy_blocks, equal_blocks, erase } from "./main_def.ts";
import { type element_block_funcs } from "../block_funcs.ts";
/** Original enclosing Traits aliases; implemented execution specialization is default_exec_policy. */
export interface BlocksTraits {
  block_funcs: ReturnType<typeof element_block_funcs>;
  exec_policy: typeof default_traits.exec_policy;
}
/** Original nested temporary slot; exported at file scope as TypeScript nested-type syntax adaptation. */
export class block_slot_type {
  public element_block: base_element_block | null = null;
  /** Original default and metadata constructors. @param position - Native logical position. @param size - Native logical length. @returns Slot. */
  public constructor(
    public position = 0,
    public size = 0,
  ) {}
}
/** Original three-vector metadata owner; block deletion/events remain the enclosing container responsibility. */
export class blocks_type {
  public positions: std_vector<number>;
  public sizes: std_vector<number>;
  public element_blocks: std_vector<base_element_block | null>;
  /** Original default/copy/clone constructors over actual shared BlockOp aliases. @param Traits - Native enclosing trait aliases. @param other - Copy source. @param tag - Original clone construction witness. @returns Store. */
  public constructor(
    public readonly Traits: BlocksTraits,
    other?: blocks_type,
    tag?: typeof clone_construction_type,
  ) {
    this.positions = new std_vector(other?.positions.snapshot());
    this.sizes = new std_vector(other?.sizes.snapshot());
    this.element_blocks = new std_vector(other?.element_blocks.snapshot());
    if (other)
      copy_blocks(
        this.element_blocks,
        tag === clone_construction_type
          ? Traits.block_funcs.clone_block
          : Traits.block_funcs.copy_block,
      );
  }
  /** Original move constructor transfers the three vector storages; selected host moved-from vectors are empty. @param other - Source. @returns Store. */
  public static move(other: blocks_type): blocks_type {
    const ret = new blocks_type(other.Traits);
    ret.positions.swap(other.positions);
    ret.sizes.swap(other.sizes);
    ret.element_blocks.swap(other.element_blocks);
    return ret;
  }
  /** Original pop affects metadata only. @returns Nothing. */
  public pop_back(): void {
    this.positions.pop_back();
    this.sizes.pop_back();
    this.element_blocks.pop_back();
  }
  /** Original slot overload. @param slot - Slot. @returns Nothing. */
  public push_back(slot: block_slot_type): void;
  /** Original explicit metadata overload. @param pos - Position. @param size - Length. @param data - Borrowed block. @returns Nothing. */
  public push_back(pos: number, size: number, data: base_element_block | null): void;
  /** Original synchronized append overloads. @param posOrSlot - Position or slot. @param size - Length. @param data - Pointer. @returns Nothing. */
  public push_back(
    posOrSlot: number | block_slot_type,
    size?: number,
    data?: base_element_block | null,
  ): void {
    const slot =
      posOrSlot instanceof block_slot_type
        ? posOrSlot
        : {
            position: posOrSlot,
            size: size as number,
            element_block: data as base_element_block | null,
          };
    this.positions.push_back(slot.position);
    this.sizes.push_back(slot.size);
    this.element_blocks.push_back(slot.element_block);
  }
  /** Original single/range erase overloads retain helper call order. @param index - Position. @param size - Optional count. @returns Nothing. */
  public erase(index: number, size?: number): void {
    if (size === undefined) {
      this.positions.erase(index, 1);
      this.sizes.erase(index, 1);
      this.element_blocks.erase(index, 1);
    } else {
      erase(this.positions, index, size);
      erase(this.sizes, index, size);
      erase(this.element_blocks, index, size);
    }
  }
  /** Original empty-slot or external block-array insertion. @param index - Position. @param sizeOrSource - Count or source. @returns Nothing. */
  public insert(index: number, sizeOrSource: number | blocks_type): void;
  /** Original single-slot insertion. @param index - Position. @param pos - Logical position. @param size - Length. @param data - Pointer. @returns Nothing. */
  public insert(index: number, pos: number, size: number, data: base_element_block | null): void;
  /** Original metadata insert overloads; valid external source ranges exclude native self-insertion. @param index - Position. @param posOrSource - Count, position or store. @param size - Length. @param data - Pointer. @returns Nothing. */
  public insert(
    index: number,
    posOrSource: number | blocks_type,
    size?: number,
    data?: base_element_block | null,
  ): void {
    if (posOrSource instanceof blocks_type) {
      this.positions.insert(index, posOrSource.positions.snapshot());
      this.sizes.insert(index, posOrSource.sizes.snapshot());
      this.element_blocks.insert(index, posOrSource.element_blocks.snapshot());
    } else if (size === undefined) {
      this.positions.insert(index, Array<number>(posOrSource).fill(0));
      this.sizes.insert(index, Array<number>(posOrSource).fill(0));
      this.element_blocks.insert(index, Array<null>(posOrSource).fill(null));
    } else {
      this.positions.insert(index, [posOrSource]);
      this.sizes.insert(index, [size]);
      this.element_blocks.insert(index, [data as base_element_block | null]);
    }
  }
  /** Original first/subsequent block position calculation; exact bounded native logical indices. @param index - Slot. @returns Nothing. */
  public calc_block_position(index: number): void {
    if (index === 0) {
      this.positions.set(index, 0);
      return;
    }
    this.positions.set(index, this.positions.get(index - 1) + this.sizes.get(index - 1));
  }
  /** Original next position arithmetic. @param index - Slot. @returns Position. */
  public calc_next_block_position(index: number): number {
    return this.positions.get(index) + this.sizes.get(index);
  }
  /** Original complete vector swap. @param other - Store. @returns Nothing. */
  public swap(other: blocks_type): void;
  /** Original two-slot swap. @param index1 - First. @param index2 - Second. @returns Nothing. */
  public swap(index1: number, index2: number): void;
  /** Original swap overloads. @param otherOrIndex - Store or index. @param index2 - Second index. @returns Nothing. */
  public swap(otherOrIndex: blocks_type | number, index2?: number): void {
    if (otherOrIndex instanceof blocks_type) {
      this.positions.swap(otherOrIndex.positions);
      this.sizes.swap(otherOrIndex.sizes);
      this.element_blocks.swap(otherOrIndex.element_blocks);
    } else {
      const j = index2 as number;
      for (const arr of [this.positions, this.sizes]) {
        const value = arr.get(otherOrIndex);
        arr.set(otherOrIndex, arr.get(j));
        arr.set(j, value);
      }
      const value = this.element_blocks.get(otherOrIndex);
      this.element_blocks.set(otherOrIndex, this.element_blocks.get(j));
      this.element_blocks.set(j, value);
    }
  }
  /** Original synchronized reserve allocates real slots. @param n - Minimum capacity. @returns Nothing. */
  public reserve(n: number): void {
    this.positions.reserve(n);
    this.sizes.reserve(n);
    this.element_blocks.reserve(n);
  }
  /** Original metadata/length checks before default equal_blocks. @param other - Store. @returns Equality. */
  public equals(other: blocks_type): boolean {
    if (!this.positions.equals(other.positions)) return false;
    if (!this.sizes.equals(other.sizes)) return false;
    if (this.element_blocks.size() !== other.element_blocks.size()) return false;
    return equal_blocks(
      this.element_blocks,
      other.element_blocks,
      this.Traits.block_funcs.equal_block,
    );
  }
  /** Original metadata clear does not delete blocks. @returns Nothing. */
  public clear(): void {
    this.positions.clear();
    this.sizes.clear();
    this.element_blocks.clear();
  }
  /** Original two exact length-integrity diagnostics. @returns Nothing or throws. */
  public check_integrity(): void {
    if (this.positions.size() !== this.sizes.size())
      throw new integrity_error("position and size arrays are of different sizes!");
    if (this.positions.size() !== this.element_blocks.size())
      throw new integrity_error("position and element-block arrays are of different sizes!");
  }
}
/** Original nested transfer group; metadata defaults belong to this owner. */
export class blocks_to_transfer {
  public blocks: blocks_type;
  public insert_index = 0;
  /** Creates original empty transfer metadata. @param Traits - Enclosing aliases. @returns Transfer group. */
  public constructor(Traits: BlocksTraits) {
    this.blocks = new blocks_type(Traits);
  }
}

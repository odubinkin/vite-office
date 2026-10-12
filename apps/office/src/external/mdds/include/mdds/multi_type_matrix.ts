/** @fileoverview Original mdds3.2.1 matrix geometry and storage owner over the genuine shared SoA vector; native template arguments remain explicit. */
// SPDX-FileCopyrightText: 2012 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { invalid_arg_error, type_error, general_error } from "./global.ts";
import { element_block_funcs, type ElementBlockType } from "./multi_type_vector/block_funcs.ts";
import {
  type BlockElementAccess,
  type base_element_block,
  element_type_empty,
} from "./multi_type_vector/types.ts";
import {
  boolean_element_block,
  int8_element_block,
  double_element_block,
  int32_element_block,
  string_element_block,
  element_type_boolean,
  element_type_double,
  element_type_int32,
  element_type_string,
} from "./multi_type_vector/standard_element_blocks.ts";
import {
  default_traits,
  type BlockPosition,
  type BlockPositionIterator,
} from "./multi_type_vector/util.ts";
import {
  multi_type_vector,
  empty_event_value_ops,
  type ContainerCallbacks,
} from "./multi_type_vector/soa/main.ts";
import {
  type delayed_delete_vector_iterator,
  type DelayedVectorValue,
} from "./multi_type_vector/delayed_delete_vector.ts";
import { type NativeValueType, type ReferenceCallbacks } from "./multi_type_vector/macro.ts";
import { type iterator_base, type const_iterator_base } from "./multi_type_vector/soa/iterator.ts";

/** Original mtm element_t values, distinct from custom block discriminators. */
export const element_t = {
  element_empty: element_type_empty,
  element_boolean: element_type_boolean,
  element_string: element_type_string,
  element_numeric: element_type_double,
  element_integer: element_type_int32,
} as const;
/** Original native trait aliases plus the erased integer_type conversion. */
export interface MatrixTraits<S> {
  readonly string_element_block: ElementBlockType & BlockElementAccess<S>;
  readonly integer_element_block: ElementBlockType & BlockElementAccess<number>;
  readonly integer_type: (value: number) => number;
}
/** Original std_string_traits; the function represents its int32_t static_cast. */
export const std_string_traits: MatrixTraits<string> = {
  string_element_block,
  integer_element_block: int32_element_block,
  /** Native initialized, representable double-to-int32 conversion. @param value - Number. @returns Integer. */
  integer_type(value) {
    return value | 0;
  },
};
/** Original nested size_pair_type; exact representable size_t values use native JS numbers. */
export class size_pair_type {
  public row: number;
  public column: number;
  /** Original default/pair/initializer_list constructors. @param row - Row or initializer list. @param column - Column. @returns Size pair. */
  public constructor(row: number | readonly number[] = 0, column = 0) {
    if (typeof row === "number") {
      this.row = row;
      this.column = column;
    } else {
      if (row.length !== 2)
        throw new invalid_arg_error("size_pair_type requires exactly 2 elements.");
      this.row = row[0] as number;
      this.column = row[1] as number;
    }
  }
  /** Original operator==. @param other - Geometry. @returns Equality. */
  public equals(other: size_pair_type): boolean {
    return this.row === other.row && this.column === other.column;
  }
  /** Original operator!=. @param other - Geometry. @returns Inequality. */
  public not_equals(other: size_pair_type): boolean {
    return !this.equals(other);
  }
}
/** Original mutable position alias from the actual store. */
export type position_type = BlockPosition<iterator_base<multi_type_vector>>;
/** Original const position alias from the actual store. */
export type const_position_type = BlockPosition<const_iterator_base<multi_type_vector>>;
/** Structural borrowed const node pair shared by the original mutable/const overloads. */
type ReadPosition = BlockPosition<{
  get(): {
    readonly type: number;
    readonly data: base_element_block | null;
    readonly position: number;
  };
}>;
const move_construction = Symbol("original matrix defaulted move constructor");

/** Actual original matrix core; subsequent transpose/copy/resize/walk scopes remain unimplemented. */
export class multi_type_matrix<S> {
  private m_store: multi_type_vector;
  private readonly m_size: size_pair_type;
  /** Original constructors, with erased template/value categories supplied explicitly. @param Traits - Original matrix traits. @param rows - Rows or copied owner. @param colsOrMove - Columns or move tag. @param callbacks - Native value overload. @param valueOrFirst - Value or input begin. @param last - Input end. @returns Matrix owner. */
  public constructor(
    public readonly Traits: MatrixTraits<S>,
    rows: number | multi_type_matrix<S> = 0,
    colsOrMove: number | typeof move_construction = 0,
    callbacks?: ContainerCallbacks<unknown>,
    valueOrFirst?: unknown,
    last?: delayed_delete_vector_iterator<unknown>,
  ) {
    if (rows instanceof multi_type_matrix) {
      this.m_store =
        colsOrMove === move_construction
          ? multi_type_vector.move(rows.m_store)
          : new multi_type_vector(rows.m_store.Traits, empty_event_value_ops, rows.m_store);
      this.m_size = new size_pair_type(rows.m_size.row, rows.m_size.column);
      return;
    }
    const cols = colsOrMove as number;
    const mtv_traits = {
      ...default_traits,
      block_funcs: element_block_funcs(
        boolean_element_block,
        int8_element_block,
        double_element_block,
        Traits.string_element_block,
        Traits.integer_element_block,
      ),
    };
    this.m_store = new multi_type_vector(
      mtv_traits,
      empty_event_value_ops,
      rows * cols,
      callbacks,
      valueOrFirst,
      last,
    );
    this.m_size = new size_pair_type(rows, cols);
    if (last !== undefined && !this.m_store.empty()) {
      try {
        multi_type_matrix.to_mtm_type(Traits, this.m_store.begin().get().type);
      } catch (error) {
        this.m_store.dispose();
        throw error;
      }
    }
  }
  /** Original defaulted move leaves source scalar geometry unchanged. @param other - Rvalue owner. @returns Moved matrix. */
  public static move<S>(other: multi_type_matrix<S>): multi_type_matrix<S> {
    return new multi_type_matrix(other.Traits, other, move_construction);
  }
  /** Original defaulted destructor releases its actual store. @returns Nothing. */
  public dispose(): void {
    this.m_store.dispose();
  }
  /** Original defaulted copy assignment, store first then geometry. @param other - Source. @returns This. */
  public assign(other: multi_type_matrix<S>): this {
    this.m_store.assign(other.m_store);
    this.m_size.row = other.m_size.row;
    this.m_size.column = other.m_size.column;
    return this;
  }
  /** Original defaulted move assignment. @param other - Rvalue source. @returns This. */
  public assign_move(other: multi_type_matrix<S>): this {
    this.m_store.assign_move(other.m_store);
    this.m_size.row = other.m_size.row;
    this.m_size.column = other.m_size.column;
    return this;
  }
  /** Original discriminator translation; custom types map to canonical matrix tags. @param Traits - Original aliases. @param type - Store type. @returns Matrix type. */
  public static to_mtm_type<S>(Traits: MatrixTraits<S>, type: number): number {
    switch (type) {
      case Traits.string_element_block.block_type:
        return element_t.element_string;
      case Traits.integer_element_block.block_type:
        return element_t.element_integer;
      case element_type_double:
      case element_type_boolean:
      case element_type_empty:
        return type;
      default:
        throw new type_error("multi_type_matrix: unknown element type.");
    }
  }
  /** Original static next-position delegation. @param pos - Position. @returns Next position. */
  public static next_position<I extends BlockPositionIterator<I>>(
    pos: BlockPosition<I>,
  ): BlockPosition<I> {
    return multi_type_vector.next_position(pos);
  }
  /** Original unchecked column-major position with native size_t64 wrap. @param row - Row. @param col - Column. @returns Store position. */
  private get_pos(row: number, col: number): bigint {
    return BigInt.asUintN(64, BigInt(this.m_size.row) * BigInt(col) + BigInt(row));
  }
  /** Original geometry/store comparison order. @param other - Matrix. @returns Equality. */
  public equals(other: multi_type_matrix<S>): boolean {
    return this.m_size.equals(other.m_size) && this.m_store.equals(other.m_store);
  }
  /** Original inequality. @param other - Matrix. @returns Inequality. */
  public not_equals(other: multi_type_matrix<S>): boolean {
    return !this.equals(other);
  }
  /** Original mutable plain/hinted position. @param first - Row or hint. @param second - Column or hinted row. @param third - Hinted column. @returns Position. */
  public position(first: number | position_type, second: number, third?: number): position_type {
    return typeof first === "number"
      ? this.m_store.position(this.get_pos(first, second))
      : this.m_store.position(first.first, this.get_pos(second, third as number));
  }
  /** Original const plain/hinted position. @param first - Row or hint. @param second - Column or hinted row. @param third - Hinted column. @returns Const position. */
  public cposition(
    first: number | const_position_type,
    second: number,
    third?: number,
  ): const_position_type {
    return typeof first === "number"
      ? this.m_store.cposition(this.get_pos(first, second))
      : this.m_store.cposition(first.first, this.get_pos(second, third as number));
  }
  /** Original inverse column-major mapping. @param pos - Position. @returns Geometry by value. */
  public matrix_position(pos: ReadPosition): size_pair_type {
    const mtv_pos = multi_type_vector.logical_position(pos);
    const col = Math.trunc(mtv_pos / this.m_size.row);
    return new size_pair_type(mtv_pos - this.m_size.row * col, col);
  }
  /** Original mutable end pair. @returns End. */
  public end_position(): position_type {
    return { first: this.m_store.end(), second: 0 };
  }
  /** Original const end pair. @returns End. */
  public cend_position(): const_position_type {
    return { first: this.m_store.cend(), second: 0 };
  }
  /** Original type queries. @param first - Row or position. @param col - Column. @returns Matrix type. */
  public get_type(first: number | ReadPosition, col?: number): number {
    return multi_type_matrix.to_mtm_type(
      this.Traits,
      typeof first === "number"
        ? this.m_store.get_type(this.get_pos(first, col as number))
        : first.first.get().type,
    );
  }
  /** Original numeric conversion including bool proxy-safe iteration. @param first - Row or position. @param col - Column. @returns Number. */
  public get_numeric(first: number | ReadPosition, col?: number): number {
    const pos = typeof first === "number" ? this.cposition(first, col as number) : first;
    const node = pos.first.get();
    switch (node.type) {
      case element_type_double:
        return double_element_block.at(node.data as base_element_block, pos.second);
      case this.Traits.integer_element_block.block_type:
        return this.Traits.integer_element_block.at(node.data as base_element_block, pos.second);
      case element_type_boolean: {
        const it = boolean_element_block.cbegin(node.data as base_element_block);
        it.advance(pos.second);
        return Number(it.get());
      }
      case this.Traits.string_element_block.block_type:
      case element_type_empty:
        return 0;
      default:
        throw new general_error("multi_type_matrix: unknown element type.");
    }
  }
  /** Original numeric-to-integer_type conversion. @param first - Row or position. @param col - Column. @returns Integer. */
  public get_integer(first: number | ReadPosition, col?: number): number {
    return this.Traits.integer_type(this.get_numeric(first, col));
  }
  /** Original static_cast<bool>, including nonzero NaN. @param first - Row or position. @param col - Column. @returns Boolean. */
  public get_boolean(first: number | ReadPosition, col?: number): boolean {
    return this.get_numeric(first, col) !== 0;
  }
  /** Original const string reference, never a value copy. @param first - Row or position. @param col - Column. @returns Borrowed string. */
  public get_string(first: number | ReadPosition, col?: number): S {
    const pos = typeof first === "number" ? this.cposition(first, col as number) : first;
    const node = pos.first.get();
    if (node.type !== this.Traits.string_element_block.block_type)
      throw new general_error("multi_type_matrix: unknown element type.");
    return this.Traits.string_element_block.at(node.data as base_element_block, pos.second);
  }
  /** Original typed scalar get. @param row - Row. @param col - Column. @param callbacks - Native type. @returns Value. */
  public get<T extends DelayedVectorValue>(
    row: number,
    col: number,
    callbacks: ContainerCallbacks<T>,
  ): T;
  /** Original typed owned get. @param row - Row. @param col - Column. @param callbacks - Native type. @param valueType - Native value members. @returns Owned value. */
  public get<T>(
    row: number,
    col: number,
    callbacks: ReferenceCallbacks<T>,
    valueType: NativeValueType<T>,
  ): T;
  /** Original output-reference read followed by return-value construction. @param row - Row. @param col - Column. @param callbacks - Native type. @param valueType - Native value members. @returns Value. */
  public get<T>(
    row: number,
    col: number,
    callbacks: ContainerCallbacks<T> | ReferenceCallbacks<T>,
    valueType?: NativeValueType<T>,
  ): T {
    return valueType === undefined
      ? (this.m_store.get(
          this.get_pos(row, col),
          callbacks as ContainerCallbacks<DelayedVectorValue>,
        ) as T)
      : this.m_store.get(this.get_pos(row, col), callbacks as ReferenceCallbacks<T>, valueType);
  }
  /** Original plain scalar write returns void. @param row - Row. @param col - Column. @param value - Native value. @param callbacks - Selected native overload. @returns Nothing. */
  public set<T>(row: number, col: number, value: T, callbacks: ContainerCallbacks<T>): void;
  /** Original hinted scalar write returns its new position. @param pos - Position. @param value - Native value. @param callbacks - Selected native overload. @returns Position. */
  public set<T>(pos: position_type, value: T, callbacks: ContainerCallbacks<T>): position_type;
  /** Original plain/hinted scalar set with an explicit native type witness. @param first - Row or position. @param second - Column or value. @param third - Value or callbacks. @param fourth - Plain callbacks. @returns Hinted position or nothing. */
  public set<T>(
    first: number | position_type,
    second: number | T,
    third: T | ContainerCallbacks<T>,
    fourth?: ContainerCallbacks<T>,
  ): position_type | undefined {
    if (typeof first === "number") {
      this.m_store.set(
        this.get_pos(first, second as number),
        third as T,
        fourth as ContainerCallbacks<T>,
      );
      return;
    }
    const pos = multi_type_vector.logical_position(first);
    const it = this.m_store.set(first.first, pos, second as T, third as ContainerCallbacks<T>);
    return { first: it, second: pos - it.get().position };
  }
  /** Original input-range set with explicit erased iterator type. @param row - Row. @param col - Column. @param first - Begin. @param last - End. @param callbacks - Native type. @returns Nothing. */
  public set_range<T>(
    row: number,
    col: number,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
    callbacks: ContainerCallbacks<T>,
  ): void {
    this.m_store.set(this.get_pos(row, col), first, last, callbacks);
  }
  /** Original hinted input-range set. @param pos - Hint. @param first - Begin. @param last - End. @param callbacks - Native type. @returns New position. */
  public set_range_position<T>(
    pos: position_type,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
    callbacks: ContainerCallbacks<T>,
  ): position_type {
    const store_pos = multi_type_vector.logical_position(pos);
    const it = this.m_store.set(pos.first, store_pos, first, last, callbacks);
    return { first: it, second: store_pos - it.get().position };
  }
  /** Original column writes truncate only input sequences longer than the row count. @param col - Column. @param first - Begin. @param last - End. @param callbacks - Native type. @returns Nothing. */
  public set_column<T>(
    col: number,
    first: delayed_delete_vector_iterator<T>,
    last: delayed_delete_vector_iterator<T>,
    callbacks: ContainerCallbacks<T>,
  ): void {
    const pos = this.get_pos(0, col);
    if (first.distance_to(last) <= this.m_size.row) {
      this.m_store.set(pos, first, last, callbacks);
      return;
    }
    this.m_store.set(pos, first, first.copy().advance(this.m_size.row), callbacks);
  }
  /** Original single/contiguous coordinate emptying. @param row - Row. @param col - Column. @param length - Optional contiguous length. @returns Nothing. */
  public set_empty(row: number, col: number, length?: number): void;
  /** Original hinted emptying returns its new position. @param pos - Position. @returns Position. */
  public set_empty(pos: position_type): position_type;
  /** Original scalar/length/hinted empty overloads. @param first - Row or position. @param col - Column. @param length - Contiguous length. @returns Hinted position or nothing. */
  public set_empty(
    first: number | position_type,
    col?: number,
    length?: number,
  ): position_type | undefined {
    if (typeof first !== "number") {
      const pos = multi_type_vector.logical_position(first);
      const it = this.m_store.set_empty(first.first, pos, pos);
      return { first: it, second: pos - it.get().position };
    }
    if (length === 0)
      throw new general_error("multi_type_matrix::set_empty: length of zero is not permitted.");
    const pos = this.get_pos(first, col as number);
    this.m_store.set_empty(
      pos,
      length === undefined ? pos : BigInt.asUintN(64, pos + BigInt(length) - 1n),
    );
  }
  /** Original whole-column emptying. @param col - Column. @returns Nothing. */
  public set_column_empty(col: number): void {
    this.m_store.set_empty(this.get_pos(0, col), this.get_pos(this.m_size.row - 1, col));
  }
  /** Original row emptying in increasing column order. @param row - Row. @returns Nothing. */
  public set_row_empty(row: number): void {
    for (let col = 0; col < this.m_size.column; ++col) {
      const pos = this.get_pos(row, col);
      this.m_store.set_empty(pos, pos);
    }
  }
  /** Original size returns a value rather than its mutable member. @returns Geometry. */
  public size(): size_pair_type {
    return new size_pair_type(this.m_size.row, this.m_size.column);
  }
  /** Original store clear precedes geometry reset. @returns Nothing. */
  public clear(): void {
    this.m_store.clear();
    this.m_size.row = 0;
    this.m_size.column = 0;
  }
  /** Original numeric block walk with early empty/non-numeric return. @returns Numeric. */
  public numeric(): boolean {
    if (this.m_store.empty()) return false;
    for (
      const it = this.m_store.cbegin(), end = this.m_store.cend();
      !it.equals(end);
      it.advance(1)
    ) {
      switch (it.get().type) {
        case element_type_double:
        case element_type_boolean:
        case this.Traits.integer_element_block.block_type:
          continue;
        case this.Traits.string_element_block.block_type:
        case element_type_empty:
          return false;
        default:
          throw new general_error("multi_type_matrix: unknown element type.");
      }
    }
    return true;
  }
  /** Original emptiness uses store metadata. @returns Empty. */
  public empty(): boolean {
    return this.m_store.empty();
  }
  /** Original store then scalar geometry swaps. @param other - Matrix. @returns Nothing. */
  public swap(other: multi_type_matrix<S>): void {
    this.m_store.swap(other.m_store);
    [this.m_size.row, other.m_size.row] = [other.m_size.row, this.m_size.row];
    [this.m_size.column, other.m_size.column] = [other.m_size.column, this.m_size.column];
  }
}

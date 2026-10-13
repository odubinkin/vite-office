/** @fileoverview Original matrix value and internal typed storage/geometry owners; genuine shared values, error helpers and mdds are reused. */
import { ScMatValType } from "../../../inc/types";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { GetDoubleErrorValue, type FormulaError } from "../../../../formula/inc/errorcodes";

import {
  multi_type_matrix,
  type MatrixTraits,
} from "../../../../external/mdds/include/mdds/multi_type_matrix";
import {
  double_element_callbacks,
  uint8_element_block,
} from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks";
import { delayed_delete_vector_iterator } from "../../../../external/mdds/include/mdds/multi_type_vector/delayed_delete_vector";
import {
  string_block,
  uint16_block,
  string_element_callbacks,
  string_value_type,
} from "../../../inc/mtvelements";

/** Original erased matrix_traits; value members reuse the existing Calc SharedString block. */
const matrix_traits: MatrixTraits<SharedString> = {
  string_element_block: string_block,
  integer_element_block: uint16_block,
  string_callbacks: string_element_callbacks,
  string_value_type,
  /** Original uint16_t cast. @param value - Integer input. @returns UInt16. */
  integer_type(value: number): number {
    return value & 65535;
  },
};
/** Original matrix_flag_traits differ only in the integer block and native cast. */
const matrix_flag_traits: MatrixTraits<SharedString> = {
  ...matrix_traits,
  integer_element_block: uint8_element_block,
  /** Original uint8_t cast. @param value - Integer input. @returns UInt8. */
  integer_type(value: number): number {
    return value & 255;
  },
};
/** Native mutable coordinate references grouped for the browser call boundary. */
export interface MatrixCoordinates {
  column: number;
  row: number;
}

/** Original internal storage owner slice; ScMatrix facade/interpreter bindings remain unported. GC owns containers without a native global element pool. */
export class ScMatrixImpl {
  private readonly maMat: multi_type_matrix<SharedString>;
  private readonly maMatFlag: multi_type_matrix<SharedString>;
  /** Original three constructors, with vector iterators borrowed through the existing mdds iterator bridge. @param nC - Columns. @param nR - Rows. @param initial - Numeric scalar or original double vector. @returns Internal storage. */
  constructor(nC: number, nR: number, initial?: number | number[]) {
    if (initial === undefined) this.maMat = new multi_type_matrix(matrix_traits, nR, nC);
    else if (typeof initial === "number")
      this.maMat = new multi_type_matrix(matrix_traits, nR, nC, double_element_callbacks, initial);
    else {
      const storage = { values: initial, size: initial.length };
      this.maMat = new multi_type_matrix(
        matrix_traits,
        nR,
        nC,
        double_element_callbacks,
        new delayed_delete_vector_iterator(storage, 0),
        new delayed_delete_vector_iterator(storage, initial.length),
      );
    }
    this.maMatFlag = new multi_type_matrix(matrix_flag_traits, nR, nC);
  }
  /** Original explicit content reset, separate from JS object lifetime. @returns Nothing. */
  Clear(): void {
    this.maMat.clear();
    this.maMatFlag.clear();
  }
  /** Original out-parameter dimensions. @param dimensions - Native mutable references. @returns Nothing. */
  GetDimensions(dimensions: MatrixCoordinates): void {
    const size = this.maMat.size();
    dimensions.row = size.row;
    dimensions.column = size.column;
  }
  /** Original element count from both dimensions. @returns Count. */
  GetElementCount(): number {
    const size = this.maMat.size();
    return size.row * size.column;
  }
  /** Original strict coordinate bounds. @param nC - Column. @param nR - Row. @returns Whether within dimensions. */
  ValidColRow(nC: number, nR: number): boolean {
    const size = this.maMat.size();
    return nR < size.row && nC < size.column;
  }
  /** Original scalar/single-axis replication mutates only replicated coordinates. @param coordinates - Native mutable coordinate references. @returns Replication validity. */
  ValidColRowReplicated(coordinates: MatrixCoordinates): boolean {
    const size = this.maMat.size();
    if (size.column === 1 && size.row === 1) {
      coordinates.column = 0;
      coordinates.row = 0;
      return true;
    } else if (size.column === 1 && coordinates.row < size.row) {
      coordinates.column = 0;
      return true;
    } else if (size.row === 1 && coordinates.column < size.column) {
      coordinates.row = 0;
      return true;
    }
    return false;
  }
  /** Original valid coordinates bypass replication and remain unchanged. @param coordinates - Native mutable coordinate references. @returns Valid or replicated. */
  ValidColRowOrReplicated(coordinates: MatrixCoordinates): boolean {
    return (
      this.ValidColRow(coordinates.column, coordinates.row) ||
      this.ValidColRowReplicated(coordinates)
    );
  }
  /** Original numeric query delegates to the genuine mdds matrix. @returns Whether all stored values are numeric/boolean. */
  IsNumeric(): boolean {
    return this.maMat.numeric();
  }
}

/** Original matrix value struct; the full ScMatrix/container graph is not substituted. */
export class ScMatrixValue {
  fVal = 0.0;
  private readonly stringValue: SharedString;
  private valueType: ScMatValType = ScMatValType.Empty;

  /** Original default and explicitly defaulted copy constructor. @param source - Optional copied original value. @returns Value with original fields and shared ownership. */
  constructor(source?: ScMatrixValue) {
    if (source === undefined) this.stringValue = new SharedString();
    else {
      this.fVal = source.fVal;
      this.stringValue = new SharedString(source.aStr);
      this.nType = source.nType;
    }
  }
  /** Original public shared value member. @returns Actual member owner. */
  get aStr(): SharedString {
    return this.stringValue;
  }
  /** Original native shared member assignment retains its identity. @param source - Const assigned value. @returns Nothing. */
  set aStr(source: SharedStringConstReference) {
    this.stringValue.assign(source);
  }
  /** Original public tag field. @returns UInt8 discriminator. */
  get nType(): ScMatValType {
    return this.valueType;
  }
  /** Original fixed UInt8 assignment. @param type - Original discriminator. @returns Nothing. */
  set nType(type: ScMatValType) {
    this.valueType = (type & 0xff) as ScMatValType;
  }
  /** Original const shared member reference, valid when the matrix indicates a string. @returns Const member query view. */
  GetString(): SharedStringConstReference {
    return this.stringValue;
  }
  /** Original encoded error query, valid when the matrix indicates a non-string. @returns Decoded original formula error. */
  GetError(): FormulaError {
    return GetDoubleErrorValue(this.fVal);
  }
  /** Original boolean query when the matrix indicates a boolean. @returns Native nonzero comparison. */
  GetBoolean(): boolean {
    return this.fVal !== 0.0;
  }
  /** Original explicitly defaulted copy assignment in member declaration order; rvalue callers also copy because native move generation is suppressed. @param r - Const source value. @returns This original value. */
  assign(r: ScMatrixValue): this {
    this.fVal = r.fVal;
    this.stringValue.assign(r.aStr);
    this.nType = r.nType;
    return this;
  }
  /** Original comparison selects numeric equality only for Value/Boolean and shared string equality for all remaining tags. @param r - Original const comparison value. @returns Whether the original compared fields match. */
  equals(r: ScMatrixValue): boolean {
    if (this.nType !== r.nType) return false;
    switch (this.nType) {
      case ScMatValType.Value:
      case ScMatValType.Boolean:
        return this.fVal === r.fVal;
      default:
        return this.stringValue.equals(r.aStr);
    }
  }
  /** Original inequality delegates to negated equality. @param r - Original const comparison value. @returns Whether values differ. */
  notEquals(r: ScMatrixValue): boolean {
    return !this.equals(r);
  }
  /** Original implicit destructor destroys the owned shared value. @returns Nothing. */
  dispose(): void {
    this.stringValue.dispose();
  }
}

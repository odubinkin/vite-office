/** @fileoverview Original matrix value and internal typed storage/geometry owners; genuine shared values, error helpers and mdds are reused. */
import { ScMatValType } from "../../../inc/types";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import {
  GetDoubleErrorValue,
  CreateDoubleError,
  FormulaError,
} from "../../../../formula/inc/errorcodes";

import {
  multi_type_matrix,
  element_t,
  type MatrixTraits,
} from "../../../../external/mdds/include/mdds/multi_type_matrix";
import {
  double_element_callbacks,
  boolean_element_callbacks,
  uint8_element_callbacks,
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
/** Original UInt8 empty-result and empty-path flags. */
const SC_MATFLAG_EMPTYRESULT = 1;
const SC_MATFLAG_EMPTYPATH = 2;

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
  /** Original resize overloads preserve their distinct invalid-size error codes; GC replaces pool bookkeeping. @param nC - Columns. @param nR - Rows. @param fVal - Optional numeric initializer. @returns Nothing. */
  Resize(nC: number, nR: number, fVal?: number): void {
    if (ScMatrix.IsSizeAllocatable(nC, nR)) {
      if (fVal === undefined) this.maMat.resize(nR, nC);
      else this.maMat.resize(nR, nC, double_element_callbacks, fVal);
      this.maMatFlag.resize(nR, nC);
    } else {
      this.maMat.resize(
        1,
        1,
        double_element_callbacks,
        CreateDoubleError(
          fVal === undefined ? FormulaError.MatrixSize : FormulaError.StackOverflow,
        ),
      );
      this.maMatFlag.resize(1, 1);
    }
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
  /** Original coordinate numeric write retains the flag matrix. @param fVal - Numeric value. @param nC - Column. @param nR - Row. @returns Nothing. */
  PutDouble(fVal: number, nC: number, nR: number): void {
    if (this.ValidColRow(nC, nR)) this.maMat.set(nR, nC, fVal, double_element_callbacks);
  }
  /** Original coordinate string copy retains the flag matrix. @param rStr - Const shared value. @param nC - Column. @param nR - Row. @returns Nothing. */
  PutString(rStr: SharedStringConstReference, nC: number, nR: number): void {
    if (this.ValidColRow(nC, nR))
      this.maMat.set<SharedStringConstReference>(nR, nC, rStr, string_element_callbacks);
  }
  /** Original coordinate empty write clears both data and flag. @param nC - Column. @param nR - Row. @returns Nothing. */
  PutEmpty(nC: number, nR: number): void {
    if (this.ValidColRow(nC, nR)) {
      this.maMat.set_empty(nR, nC);
      this.maMatFlag.set_empty(nR, nC);
    }
  }
  /** Original empty-path write sets its UInt8 flag. @param nC - Column. @param nR - Row. @returns Nothing. */
  PutEmptyPath(nC: number, nR: number): void {
    if (this.ValidColRow(nC, nR)) {
      this.maMat.set_empty(nR, nC);
      this.maMatFlag.set(nR, nC, SC_MATFLAG_EMPTYPATH, uint8_element_callbacks);
    }
  }
  /** Original error write delegates without a coordinate guard. @param nErrorCode - Error. @param nC - Column. @param nR - Row. @returns Nothing. */
  PutError(nErrorCode: FormulaError, nC: number, nR: number): void {
    this.maMat.set(nR, nC, CreateDoubleError(nErrorCode), double_element_callbacks);
  }
  /** Original boolean write retains the flag matrix. @param bVal - Boolean. @param nC - Column. @param nR - Row. @returns Nothing. */
  PutBoolean(bVal: boolean, nC: number, nR: number): void {
    if (this.ValidColRow(nC, nR)) this.maMat.set(nR, nC, bVal, boolean_element_callbacks);
  }
  /** Original empty-result vector validates both endpoints and fills UInt8 flags. @param nCount - Element count. @param nC - Column. @param nR - Starting row. @returns Nothing. */
  PutEmptyResultVector(nCount: number, nC: number, nR: number): void {
    if (nCount && this.ValidColRow(nC, nR) && this.ValidColRow(nC, nR + nCount - 1)) {
      this.maMat.set_empty(nR, nC, nCount);
      const values = Array<number>(nCount).fill(SC_MATFLAG_EMPTYRESULT),
        storage = { values, size: nCount };
      this.maMatFlag.set_range(
        nR,
        nC,
        new delayed_delete_vector_iterator(storage, 0),
        new delayed_delete_vector_iterator(storage, nCount),
        uint8_element_callbacks,
      );
    }
  }
  /** Original value extraction replicates scalar/axis coordinates and returns an owned shared value copy. Empty-result distinction intentionally stays in predicates. @param nC - Column. @param nR - Row. @returns Original matrix value. */
  Get(nC: number, nR: number): ScMatrixValue {
    const value = new ScMatrixValue(),
      coord = { column: nC, row: nR };
    if (this.ValidColRowOrReplicated(coord)) {
      const pos = this.maMat.cposition(coord.row, coord.column);
      switch (this.maMat.get_type(pos)) {
        case element_t.element_boolean:
          value.nType = ScMatValType.Boolean;
          value.fVal = Number(this.maMat.get_boolean(pos));
          break;
        case element_t.element_numeric:
          value.nType = ScMatValType.Value;
          value.fVal = this.maMat.get_numeric(pos);
          break;
        case element_t.element_string:
          value.nType = ScMatValType.String;
          value.aStr = this.maMat.get_string(pos);
          break;
        case element_t.element_empty:
          switch (this.maMatFlag.get_type(coord.row, coord.column)) {
            case element_t.element_empty:
              value.nType = ScMatValType.Empty;
              break;
            case element_t.element_integer:
              value.nType =
                this.maMatFlag.get(coord.row, coord.column, uint8_element_callbacks) ===
                SC_MATFLAG_EMPTYPATH
                  ? ScMatValType.EmptyPath
                  : ScMatValType.Empty;
              break;
          }
          value.fVal = 0.0;
          break;
      }
    }
    return value;
  }
  /** Original coordinate IsStringOrEmpty query with replication. @param nC - Column. @param nR - Row. @returns Original predicate. */
  IsStringOrEmpty(nC: number, nR: number): boolean {
    const coord = { column: nC, row: nR };
    if (!this.ValidColRowOrReplicated(coord)) return false;
    switch (this.maMat.get_type(coord.row, coord.column)) {
      case element_t.element_empty:
      case element_t.element_string:
        return true;
    }
    return false;
  }
  /** Original coordinate IsEmpty query with replication. @param nC - Column. @param nR - Row. @returns Original predicate. */
  IsEmpty(nC: number, nR: number): boolean {
    const coord = { column: nC, row: nR };
    if (!this.ValidColRowOrReplicated(coord)) return false;
    return (
      this.maMat.get_type(coord.row, coord.column) === element_t.element_empty &&
      this.maMatFlag.get_integer(coord.row, coord.column) !== SC_MATFLAG_EMPTYPATH
    );
  }
  /** Original coordinate IsEmptyCell query with replication. @param nC - Column. @param nR - Row. @returns Original predicate. */
  IsEmptyCell(nC: number, nR: number): boolean {
    const coord = { column: nC, row: nR };
    if (!this.ValidColRowOrReplicated(coord)) return false;
    return (
      this.maMat.get_type(coord.row, coord.column) === element_t.element_empty &&
      this.maMatFlag.get_type(coord.row, coord.column) === element_t.element_empty
    );
  }
  /** Original coordinate IsEmptyResult query with replication. @param nC - Column. @param nR - Row. @returns Original predicate. */
  IsEmptyResult(nC: number, nR: number): boolean {
    const coord = { column: nC, row: nR };
    if (!this.ValidColRowOrReplicated(coord)) return false;
    return (
      this.maMat.get_type(coord.row, coord.column) === element_t.element_empty &&
      this.maMatFlag.get_integer(coord.row, coord.column) === SC_MATFLAG_EMPTYRESULT
    );
  }
  /** Original coordinate IsEmptyPath query with replication. @param nC - Column. @param nR - Row. @returns Original predicate. */
  IsEmptyPath(nC: number, nR: number): boolean {
    const coord = { column: nC, row: nR };
    if (!this.ValidColRowOrReplicated(coord)) return true;
    return (
      this.maMat.get_type(coord.row, coord.column) === element_t.element_empty &&
      this.maMatFlag.get_integer(coord.row, coord.column) === SC_MATFLAG_EMPTYPATH
    );
  }
  /** Original coordinate IsValue query with replication. @param nC - Column. @param nR - Row. @returns Original predicate. */
  IsValue(nC: number, nR: number): boolean {
    const coord = { column: nC, row: nR };
    if (!this.ValidColRowOrReplicated(coord)) return false;
    switch (this.maMat.get_type(coord.row, coord.column)) {
      case element_t.element_boolean:
      case element_t.element_numeric:
        return true;
    }
    return false;
  }
  /** Original coordinate IsValueOrEmpty query with replication. @param nC - Column. @param nR - Row. @returns Original predicate. */
  IsValueOrEmpty(nC: number, nR: number): boolean {
    const coord = { column: nC, row: nR };
    if (!this.ValidColRowOrReplicated(coord)) return false;
    switch (this.maMat.get_type(coord.row, coord.column)) {
      case element_t.element_boolean:
      case element_t.element_numeric:
      case element_t.element_empty:
        return true;
    }
    return false;
  }
  /** Original coordinate IsBoolean query with replication. @param nC - Column. @param nR - Row. @returns Original predicate. */
  IsBoolean(nC: number, nR: number): boolean {
    const coord = { column: nC, row: nR };
    if (!this.ValidColRowOrReplicated(coord)) return false;
    return this.maMat.get_type(coord.row, coord.column) === element_t.element_boolean;
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

/** Original public matrix owner over the real internal implementation; ordinary references replace C++ pointer/refcount ownership. */
export class ScMatrix {
  private readonly pImpl: ScMatrixImpl;
  /** Original three constructors and MatrixSize fallback. @param nC - Columns. @param nR - Rows. @param initial - Scalar or double vector initializer. @returns Matrix. */
  constructor(nC: number, nR: number, initial?: number | number[]) {
    this.pImpl = ScMatrix.IsSizeAllocatable(nC, nR)
      ? new ScMatrixImpl(nC, nR, initial)
      : new ScMatrixImpl(1, 1, CreateDoubleError(FormulaError.MatrixSize));
  }
  /** Original zero-shape and overflow validation; the initial64bit upstream limit applies per matrix without a live-allocation ledger. @param nC - Columns. @param nR - Rows. @returns Allocation shape validity. */
  static IsSizeAllocatable(nC: number, nR: number): boolean {
    if ((nC && !nR) || (!nC && nR)) return false;
    if (!nC || !nR) return true;
    return nC <= Math.floor(0x180000000 / 12 / nR);
  }
  /** Original value or boolean test. @param nType - UInt8 type. @returns Classification. */
  static IsValueType(nType: ScMatValType): boolean {
    return nType <= ScMatValType.Boolean;
  }
  /** Original boolean test. @param nType - UInt8 type. @returns Classification. */
  static IsBooleanType(nType: ScMatValType): boolean {
    return nType === ScMatValType.Boolean;
  }
  /** Original nonvalue mask test. @param nType - UInt8 type. @returns Classification. */
  static IsNonValueType(nType: ScMatValType): boolean {
    return Boolean(nType & ScMatValType.NonvalueMask);
  }
  /** Original real string test. @param nType - UInt8 type. @returns Classification. */
  static IsRealStringType(nType: ScMatValType): boolean {
    return (nType & ScMatValType.NonvalueMask) === ScMatValType.String;
  }
  /** Original empty type test. @param nType - UInt8 type. @returns Classification. */
  static IsEmptyType(nType: ScMatValType): boolean {
    return (nType & ScMatValType.NonvalueMask) === ScMatValType.Empty;
  }
  /** Original empty path type test. @param nType - UInt8 type. @returns Classification. */
  static IsEmptyPathType(nType: ScMatValType): boolean {
    return (nType & ScMatValType.NonvalueMask) === ScMatValType.EmptyPath;
  }
  /** Original resize delegates to its actual implementation. @param nC - Columns. @param nR - Rows. @param fVal - Optional fill. @returns Nothing. */
  Resize(nC: number, nR: number, fVal?: number): void {
    this.pImpl.Resize(nC, nR, fVal);
  }
  /** Original dimensions delegate. @param dimensions - Native out parameters. @returns Nothing. */
  GetDimensions(dimensions: MatrixCoordinates): void {
    this.pImpl.GetDimensions(dimensions);
  }
  /** Original count delegate. @returns Count. */
  GetElementCount(): number {
    return this.pImpl.GetElementCount();
  }
  /** Original strict coordinate delegate. @param nC - Column. @param nR - Row. @returns Validity. */
  ValidColRow(nC: number, nR: number): boolean {
    return this.pImpl.ValidColRow(nC, nR);
  }
  /** Original replicated coordinate delegate. @param coordinates - Native references. @returns Validity. */
  ValidColRowReplicated(coordinates: MatrixCoordinates): boolean {
    return this.pImpl.ValidColRowReplicated(coordinates);
  }
  /** Original short-circuit coordinate query. @param coordinates - Native references. @returns Validity. */
  ValidColRowOrReplicated(coordinates: MatrixCoordinates): boolean {
    return (
      this.ValidColRow(coordinates.column, coordinates.row) ||
      this.ValidColRowReplicated(coordinates)
    );
  }
  /** Original coordinate PutDouble delegate. @param fVal - Original argument. @param nC - Original argument. @param nR - Original argument. @returns Nothing. */
  PutDouble(fVal: number, nC: number, nR: number): void {
    this.pImpl.PutDouble(fVal, nC, nR);
  }
  /** Original coordinate PutString delegate. @param rStr - Original argument. @param nC - Original argument. @param nR - Original argument. @returns Nothing. */
  PutString(rStr: SharedStringConstReference, nC: number, nR: number): void {
    this.pImpl.PutString(rStr, nC, nR);
  }
  /** Original coordinate PutEmpty delegate. @param nC - Original argument. @param nR - Original argument. @returns Nothing. */
  PutEmpty(nC: number, nR: number): void {
    this.pImpl.PutEmpty(nC, nR);
  }
  /** Original coordinate PutEmptyPath delegate. @param nC - Original argument. @param nR - Original argument. @returns Nothing. */
  PutEmptyPath(nC: number, nR: number): void {
    this.pImpl.PutEmptyPath(nC, nR);
  }
  /** Original coordinate PutError delegate. @param nErrorCode - Original argument. @param nC - Original argument. @param nR - Original argument. @returns Nothing. */
  PutError(nErrorCode: FormulaError, nC: number, nR: number): void {
    this.pImpl.PutError(nErrorCode, nC, nR);
  }
  /** Original coordinate PutBoolean delegate. @param bVal - Original argument. @param nC - Original argument. @param nR - Original argument. @returns Nothing. */
  PutBoolean(bVal: boolean, nC: number, nR: number): void {
    this.pImpl.PutBoolean(bVal, nC, nR);
  }
  /** Original coordinate PutEmptyResultVector delegate. @param nCount - Original argument. @param nC - Original argument. @param nR - Original argument. @returns Nothing. */
  PutEmptyResultVector(nCount: number, nC: number, nR: number): void {
    this.pImpl.PutEmptyResultVector(nCount, nC, nR);
  }
  /** Original coordinate Get delegate. @param nC - Column. @param nR - Row. @returns Original query. */
  Get(nC: number, nR: number): ScMatrixValue {
    return this.pImpl.Get(nC, nR);
  }
  /** Original coordinate IsStringOrEmpty delegate. @param nC - Column. @param nR - Row. @returns Original query. */
  IsStringOrEmpty(nC: number, nR: number): boolean {
    return this.pImpl.IsStringOrEmpty(nC, nR);
  }
  /** Original coordinate IsEmpty delegate. @param nC - Column. @param nR - Row. @returns Original query. */
  IsEmpty(nC: number, nR: number): boolean {
    return this.pImpl.IsEmpty(nC, nR);
  }
  /** Original coordinate IsEmptyCell delegate. @param nC - Column. @param nR - Row. @returns Original query. */
  IsEmptyCell(nC: number, nR: number): boolean {
    return this.pImpl.IsEmptyCell(nC, nR);
  }
  /** Original coordinate IsEmptyResult delegate. @param nC - Column. @param nR - Row. @returns Original query. */
  IsEmptyResult(nC: number, nR: number): boolean {
    return this.pImpl.IsEmptyResult(nC, nR);
  }
  /** Original coordinate IsEmptyPath delegate. @param nC - Column. @param nR - Row. @returns Original query. */
  IsEmptyPath(nC: number, nR: number): boolean {
    return this.pImpl.IsEmptyPath(nC, nR);
  }
  /** Original coordinate IsValue delegate. @param nC - Column. @param nR - Row. @returns Original query. */
  IsValue(nC: number, nR: number): boolean {
    return this.pImpl.IsValue(nC, nR);
  }
  /** Original coordinate IsValueOrEmpty delegate. @param nC - Column. @param nR - Row. @returns Original query. */
  IsValueOrEmpty(nC: number, nR: number): boolean {
    return this.pImpl.IsValueOrEmpty(nC, nR);
  }
  /** Original coordinate IsBoolean delegate. @param nC - Column. @param nR - Row. @returns Original query. */
  IsBoolean(nC: number, nR: number): boolean {
    return this.pImpl.IsBoolean(nC, nR);
  }
  /** Original numeric matrix delegate. @returns Original predicate. */
  IsNumeric(): boolean {
    return this.pImpl.IsNumeric();
  }
}

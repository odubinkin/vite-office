/** @fileoverview Original inline ScMatrixValue declaration and value contract from scmatrix.hxx; genuine shared values and formula error helpers are reused. */
import { ScMatValType } from "../../../inc/types";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { GetDoubleErrorValue, type FormulaError } from "../../../../formula/inc/errorcodes";

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

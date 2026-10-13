/** @fileoverview Original sc::FormulaResultValue declaration, constructors and implicit special members over genuine shared string/error owners. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";

/** Original FormulaResultValue::Type nested UInt8 discriminator; the class retains the original nested runtime name. */
export enum FormulaResultValueType {
  Invalid,
  Value,
  String,
  Error,
}

/** Original named value struct used by genuine formula results; this is not the absent ScFormulaResult token owner. */
export class FormulaResultValue {
  static readonly Type = FormulaResultValueType;
  static readonly Invalid = FormulaResultValueType.Invalid;
  static readonly Value = FormulaResultValueType.Value;
  static readonly String = FormulaResultValueType.String;
  static readonly Error = FormulaResultValueType.Error;
  mfValue = 0.0;
  private stringValue: SharedString;
  mbMultiLine = false;
  private resultType = FormulaResultValueType.Invalid;
  private error = FormulaError.NONE;

  /** Reads the actual original shared value member by reference. @returns Owned member. */
  get maString(): SharedString {
    return this.stringValue;
  }
  /** Adapts native member copy assignment without changing the member reference identity. @param source - Assigned const value. @returns Nothing. */
  set maString(source: SharedStringConstReference) {
    this.stringValue.assign(source);
  }
  /** Reads the original nested Type field. @returns UInt8 discriminator. */
  get meType(): FormulaResultValueType {
    return this.resultType;
  }
  /** Preserves native fixed UInt8 enum assignment for initialized integer values. @param value - Assigned discriminator. @returns Nothing. */
  set meType(value: FormulaResultValueType) {
    this.resultType = (value & 0xff) as FormulaResultValueType;
  }
  /** Reads the original error field. @returns UInt16 error. */
  get mnError(): FormulaError {
    return this.error;
  }
  /** Preserves native fixed UInt16 enum assignment for initialized integer values. @param value - Assigned error. @returns Nothing. */
  set mnError(value: FormulaError) {
    this.error = (value & 0xffff) as FormulaError;
  }

  /** Original default/double/string/error and implicit copy constructors. An actual enum type witness restores the erased double-vs-enum overload; SharedString.move restores the caller rvalue category. @param args - Original constructor values and erased native type/category witness. @returns Initialized original struct. */
  constructor(
    ...args:
      | []
      | [value: number]
      | [source: FormulaResultValue]
      | [error: FormulaError, type: typeof FormulaError]
      | [string: SharedStringConstReference, multiLine: boolean]
      | [string: SharedString, multiLine: boolean, category: typeof SharedString.move]
  ) {
    const source = args[0];
    if (source instanceof FormulaResultValue) {
      this.mfValue = source.mfValue;
      this.stringValue = new SharedString(source.maString);
      this.mbMultiLine = source.mbMultiLine;
      this.meType = source.meType;
      this.mnError = source.mnError;
    } else if (args.length === 0) {
      this.stringValue = new SharedString();
      this.meType = FormulaResultValueType.Invalid;
    } else if (args.length === 1) {
      this.mfValue = source as number;
      this.stringValue = new SharedString();
      this.meType = FormulaResultValueType.Value;
    } else if (args[1] === FormulaError) {
      this.stringValue = new SharedString();
      this.meType = FormulaResultValueType.Error;
      this.mnError = source as FormulaError;
    } else {
      const aStr =
        args.length === 3
          ? SharedString.move(source as SharedString)
          : new SharedString(source as SharedStringConstReference);
      this.stringValue = SharedString.move(aStr);
      this.mbMultiLine = args[1] as boolean;
      this.meType = FormulaResultValueType.String;
      aStr.dispose();
    }
  }

  /** Original implicit move constructor moves the string and copies scalar members in declaration order. @param source - Rvalue source. @returns Moved struct. */
  static move(source: FormulaResultValue): FormulaResultValue {
    const result = new FormulaResultValue();
    result.mfValue = source.mfValue;
    result.stringValue = SharedString.move(source.maString);
    result.mbMultiLine = source.mbMultiLine;
    result.meType = source.meType;
    result.mnError = source.mnError;
    return result;
  }

  /** Original implicit copy assignment, including the shared member's native self guard. @param source - Const source. @returns This struct. */
  assign(source: FormulaResultValue): this {
    this.mfValue = source.mfValue;
    this.maString.assign(source.maString);
    this.mbMultiLine = source.mbMultiLine;
    this.meType = source.meType;
    this.mnError = source.mnError;
    return this;
  }

  /** Original implicit move assignment retains source scalar fields and moves only the owned string. @param source - Rvalue source. @returns This struct. */
  moveAssign(source: FormulaResultValue): this {
    this.mfValue = source.mfValue;
    this.maString.moveAssign(source.maString);
    this.mbMultiLine = source.mbMultiLine;
    this.meType = source.meType;
    this.mnError = source.mnError;
    return this;
  }

  /** Original implicit destructor destroys the shared string member; scalar fields have no destructor operation. @returns Nothing. */
  dispose(): void {
    this.maString.dispose();
  }
}

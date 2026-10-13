/** @fileoverview Original formula result value and state owners over genuine shared token/string/matrix dependencies and ordinary JS references. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import {
  FormulaToken,
  FormulaDoubleToken,
  FormulaErrorToken,
  FormulaStringToken,
  StackVar,
} from "../../../../formula/inc/token";
import type { FormulaConstTokenRef } from "../../../../formula/inc/types";
import {
  ScEmptyCellToken,
  ScHybridCellToken,
  ScMatrixCellResultToken,
  ScMatrixFormulaCellToken,
} from "../../../inc/token";
import type { ScConstMatrixRef } from "../../../inc/types";
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

/** Original GetErrorOrDouble scalar out references grouped at the browser boundary; untouched outputs retain caller values. */
export interface FormulaResultNumber {
  error: FormulaError;
  value: number;
}
/** Original scalar result classification, including the initial unknown numeric zero. @param type - Cell result type. @returns Numeric/error/empty/unknown predicate. */
function isValue(type: StackVar): boolean {
  return (
    type === StackVar.svDouble ||
    type === StackVar.svError ||
    type === StackVar.svEmptyCell ||
    type === StackVar.svUnknown
  );
}
/** Original string result classification. @param type - Cell result type. @returns String/hybrid predicate. */
function isString(type: StackVar): boolean {
  return type === StackVar.svString || type === StackVar.svHybridCell;
}

/** Original formula-cell result state machine; token identity is held by JS GC, without native refcount policy/union ownership emulation. */
export class ScFormulaResult {
  private static readonly MULTILINE_UNKNOWN = 0;
  private static readonly MULTILINE_FALSE = 1;
  private static readonly MULTILINE_TRUE = 2;
  private mfValue = 0;
  private mpToken: FormulaConstTokenRef = null;
  private mbToken = true;
  private mbEmpty = false;
  private mbEmptyDisplayedAsString = false;
  private mbValueCached = false;
  private meMultiline: number = ScFormulaResult.MULTILINE_UNKNOWN;
  private mnError = FormulaError.NONE;
  /** Original default/token/copy constructors; only matrix formula tokens are semantically cloned. @param source - Optional result or token. @returns Result owner. */
  constructor(source?: ScFormulaResult | FormulaConstTokenRef) {
    if (source instanceof ScFormulaResult) {
      this.mbToken = source.mbToken;
      this.mbEmpty = source.mbEmpty;
      this.mbEmptyDisplayedAsString = source.mbEmptyDisplayedAsString;
      this.mbValueCached = source.mbValueCached;
      this.meMultiline = source.meMultiline;
      this.mnError = source.mnError;
      if (this.mbToken) {
        this.mpToken = source.mpToken;
        if (this.mpToken) {
          const matrix = source.GetMatrixFormulaCellToken();
          if (matrix) this.mpToken = new ScMatrixFormulaCellToken(matrix);
        }
      } else this.mfValue = source.mfValue;
    } else if (source !== undefined) {
      this.mbToken = false;
      this.SetToken(source);
    }
  }
  /** Original flag reset does not replace the active token/value. @returns Nothing. */
  private ResetToDefaults(): void {
    this.mnError = FormulaError.NONE;
    this.mbEmpty = false;
    this.mbEmptyDisplayedAsString = false;
    this.meMultiline = ScFormulaResult.MULTILINE_UNKNOWN;
    this.mbValueCached = false;
  }
  /** Original scalar resolution consumes numeric/error/empty data and otherwise retains token identity. Inactive JS references are dropped for GC. @param token - Result token. @returns Nothing. */
  private ResolveToken(token: FormulaConstTokenRef): void {
    this.ResetToDefaults();
    if (!token) {
      this.mpToken = token;
      this.mbToken = true;
      return;
    }
    switch (token.GetType()) {
      case StackVar.svError:
        this.mnError = (token as FormulaErrorToken).GetError();
        this.mbToken = false;
        this.mpToken = null;
        this.mfValue = 0;
        this.meMultiline = ScFormulaResult.MULTILINE_FALSE;
        break;
      case StackVar.svEmptyCell:
        this.mbEmpty = true;
        this.mbEmptyDisplayedAsString = (token as ScEmptyCellToken).IsDisplayedAsString();
        this.mbToken = false;
        this.mpToken = null;
        this.meMultiline = ScFormulaResult.MULTILINE_FALSE;
        this.mfValue = 0;
        this.mbValueCached = true;
        break;
      case StackVar.svDouble:
        this.mfValue = (token as FormulaDoubleToken).GetDouble();
        this.mbToken = false;
        this.mpToken = null;
        this.meMultiline = ScFormulaResult.MULTILINE_FALSE;
        this.mbValueCached = true;
        break;
      default:
        this.mpToken = token;
        this.mbToken = true;
    }
  }
  /** Original assignment wrapper. @param source - Copied result. @returns This owner. */
  assign(source: ScFormulaResult): this {
    this.Assign(source);
    return this;
  }
  /** Original Assign preserves cache/error precedence and the destination matrix formula context. @param source - Copied result. @returns Nothing. */
  Assign(source: ScFormulaResult): void {
    if (this === source) return;
    this.mbValueCached = source.mbValueCached;
    if (source.mbEmpty) {
      this.mbToken = false;
      this.mpToken = null;
      this.mbEmpty = true;
      this.mbEmptyDisplayedAsString = source.mbEmptyDisplayedAsString;
      this.meMultiline = source.meMultiline;
      this.mfValue = 0;
    } else if (source.mbToken) {
      const matrix = source.GetMatrixFormulaCellToken();
      this.SetToken(matrix ? new ScMatrixFormulaCellToken(matrix) : source.mpToken);
    } else this.SetDouble(source.mfValue);
    this.SetResultError(source.mnError);
  }
  /** Original token assignment updates an existing matrix formula result in place. @param token - New result token. @returns Nothing. */
  SetToken(token: FormulaConstTokenRef): void {
    this.ResetToDefaults();
    const matrix = this.GetMatrixFormulaCellTokenNonConst();
    if (matrix) {
      const result =
        token &&
        token.GetType() === StackVar.svMatrixCell &&
        token instanceof ScMatrixCellResultToken
          ? token
          : null;
      if (result) {
        const newFormula = result instanceof ScMatrixFormulaCellToken ? result : null;
        if (newFormula && (matrix.GetMatCols() <= 0 || matrix.GetMatRows() <= 0))
          matrix.SetMatColsRows(newFormula.GetMatCols(), newFormula.GetMatRows());
        matrix.Assign(result);
      } else if (token) matrix.Assign(token, FormulaToken);
      else matrix.ResetResult();
    } else this.ResolveToken(token);
  }
  /** Original direct double setter retains existing matrix formula dimensions/result owner. @param value - Numeric result. @returns Nothing. */
  SetDouble(value: number): void {
    this.ResetToDefaults();
    const matrix = this.GetMatrixFormulaCellTokenNonConst();
    if (matrix) matrix.SetUpperLeftDouble(value);
    else {
      this.mfValue = value;
      this.mbToken = false;
      this.mpToken = null;
      this.meMultiline = ScFormulaResult.MULTILINE_FALSE;
      this.mbValueCached = true;
    }
  }
  /** Original ordered error/empty/direct/token/unknown classification. @returns Result type. */
  GetType(): StackVar {
    if (this.mnError !== FormulaError.NONE) return StackVar.svError;
    if (this.mbEmpty) return StackVar.svEmptyCell;
    if (!this.mbToken) return StackVar.svDouble;
    return this.mpToken ? this.mpToken.GetType() : StackVar.svUnknown;
  }
  /** Original upper-left classification for matrix results. @returns Cell result type. */
  GetCellResultType(): StackVar {
    const type = this.GetType();
    return type === StackVar.svMatrixCell
      ? (this.mpToken as ScMatrixCellResultToken).GetUpperLeftType()
      : type;
  }
  /** Original display flag query, including matrix upper-left and imported hybrid flags. @returns String-display flag. */
  IsEmptyDisplayedAsString(): boolean {
    if (this.mbEmpty) return this.mbEmptyDisplayedAsString;
    switch (this.GetType()) {
      case StackVar.svMatrixCell: {
        const token = (this.mpToken as ScMatrixCellResultToken).GetUpperLeftToken();
        if (token instanceof ScEmptyCellToken) return token.IsDisplayedAsString();
        break;
      }
      case StackVar.svHybridCell:
        return (this.mpToken as ScHybridCellToken).IsEmptyDisplayedAsString();
    }
    return false;
  }
  /** Original legacy numeric classification includes displayed empty and unknown. @returns Numeric predicate. */
  IsValue(): boolean {
    return this.IsEmptyDisplayedAsString() || isValue(this.GetCellResultType());
  }
  /** Original narrow numeric/no-error classification. @returns Double/empty predicate. */
  IsValueNoError(): boolean {
    const type = this.GetCellResultType();
    return type === StackVar.svDouble || type === StackVar.svEmptyCell;
  }
  /** Original cached multiline query scans the genuine OUString logical value for LF. @returns Multiline flag. */
  IsMultiline(): boolean {
    if (this.meMultiline === ScFormulaResult.MULTILINE_UNKNOWN) {
      const string = this.GetString();
      this.meMultiline =
        !string.isEmpty() && string.getString().indexOf(10) !== -1
          ? ScFormulaResult.MULTILINE_TRUE
          : ScFormulaResult.MULTILINE_FALSE;
    }
    return this.meMultiline === ScFormulaResult.MULTILINE_TRUE;
  }
  /** Original out-value precedence. After scalar resolution, svError with mnError NONE can only be a matrix upper-left error. @param output - Caller-owned error/value references. @returns Whether numeric/error output is available. */
  GetErrorOrDouble(output: FormulaResultNumber): boolean {
    if (this.mbValueCached) {
      output.value = this.mfValue;
      return true;
    }
    if (this.mnError !== FormulaError.NONE) {
      output.error = this.mnError;
      return true;
    }
    const type = this.GetCellResultType();
    if (type === StackVar.svError)
      output.error = (
        (this.mpToken as ScMatrixCellResultToken).GetUpperLeftToken() as FormulaErrorToken
      ).GetError();
    if (output.error !== FormulaError.NONE) return true;
    if (!isValue(type)) return false;
    output.value = this.GetDouble();
    return true;
  }
  /** Original value/error/string/invalid result projection; non-token string guard is impossible by GetType precedence. @returns Original value struct. */
  GetResult(): FormulaResultValue {
    if (this.mbValueCached) return new FormulaResultValue(this.mfValue);
    if (this.mnError !== FormulaError.NONE)
      return new FormulaResultValue(this.mnError, FormulaError);
    const type = this.GetCellResultType();
    const error =
      type === StackVar.svError
        ? (
            (this.mpToken as ScMatrixCellResultToken).GetUpperLeftToken() as FormulaErrorToken
          ).GetError()
        : FormulaError.NONE;
    if (error !== FormulaError.NONE) return new FormulaResultValue(error, FormulaError);
    if (isValue(type)) return new FormulaResultValue(this.GetDouble());
    if (isString(type)) return new FormulaResultValue(this.GetString(), this.IsMultiline());
    return new FormulaResultValue();
  }
  /** Original error query, with the resolved-scalar invariant removing an unreachable stored error-token branch. @returns Explicit or upper-left error. */
  GetResultError(): FormulaError {
    if (this.mnError !== FormulaError.NONE) return this.mnError;
    if (this.GetCellResultType() === StackVar.svError)
      return (
        (this.mpToken as ScMatrixCellResultToken).GetUpperLeftToken() as FormulaErrorToken
      ).GetError();
    return FormulaError.NONE;
  }
  /** Original error assignment invalidates value cache only for nonzero errors. @param error - UInt16 error. @returns Nothing. */
  SetResultError(error: FormulaError): void {
    this.mnError = (error & 0xffff) as FormulaError;
    if (this.mnError !== FormulaError.NONE) this.mbValueCached = false;
  }
  /** Original nullable active token query. @returns Actual token identity or null. */
  GetToken(): FormulaConstTokenRef {
    return this.mbToken ? this.mpToken : null;
  }
  /** Original matrix upper-left token query respects error masking. @returns Cell token or active result token. */
  GetCellResultToken(): FormulaConstTokenRef {
    return this.GetType() === StackVar.svMatrixCell
      ? (this.mpToken as ScMatrixCellResultToken).GetUpperLeftToken()
      : this.GetToken();
  }
  /** Original cached/direct/hybrid/matrix numeric query and zero fallback. @returns Numeric result. */
  GetDouble(): number {
    if (this.mbValueCached) return this.mfValue;
    if (this.mbToken) {
      if (this.mpToken)
        switch (this.mpToken.GetType()) {
          case StackVar.svHybridCell:
            return (this.mpToken as ScHybridCellToken).GetDouble();
          case StackVar.svMatrixCell: {
            const result = this.mpToken as ScMatrixCellResultToken;
            if (result.GetUpperLeftType() === StackVar.svDouble)
              return (result.GetUpperLeftToken() as FormulaDoubleToken).GetDouble();
            break;
          }
        }
      return 0;
    }
    if (this.mbEmpty) return 0;
    return this.mfValue;
  }
  /** Original borrowed scalar/hybrid/matrix string query with shared empty fallback. @returns Genuine shared value view. */
  GetString(): SharedStringConstReference {
    if (this.mbToken && this.mpToken)
      switch (this.mpToken.GetType()) {
        case StackVar.svString:
          return (this.mpToken as FormulaStringToken).GetString();
        case StackVar.svHybridCell:
          return (this.mpToken as ScHybridCellToken).GetString();
        case StackVar.svMatrixCell: {
          const result = this.mpToken as ScMatrixCellResultToken;
          if (result.GetUpperLeftType() === StackVar.svString)
            return (result.GetUpperLeftToken() as FormulaStringToken).GetString();
          break;
        }
      }
    return SharedString.getEmptyString();
  }
  /** Original matrix query hides a matrix while the result is error-masked. @returns Actual const matrix identity. */
  GetMatrix(): ScConstMatrixRef {
    return this.GetType() === StackVar.svMatrixCell
      ? (this.mpToken as ScMatrixCellResultToken).GetMatrix()
      : null;
  }
  /** Original hybrid formula return copies its OUString value. @returns Owned formula value. */
  GetHybridFormula(): OUString {
    return this.GetType() === StackVar.svHybridCell
      ? new OUString((this.mpToken as ScHybridCellToken).GetFormula())
      : new OUString();
  }
  /** Original hybrid numeric import preserves existing string/formula or updates a matrix result. @param value - Imported double. @returns Nothing. */
  SetHybridDouble(value: number): void {
    this.ResetToDefaults();
    if (this.mbToken && this.mpToken) {
      if (this.GetType() === StackVar.svMatrixCell) this.SetDouble(value);
      else {
        const string = this.GetString(),
          formula = this.GetHybridFormula();
        this.mpToken = new ScHybridCellToken(value, string, formula, false);
        formula.dispose();
      }
    } else {
      this.mfValue = value;
      this.mbToken = false;
      this.mpToken = null;
      this.meMultiline = ScFormulaResult.MULTILINE_FALSE;
      this.mbValueCached = true;
    }
  }
  /** Original hybrid string import captures old number/formula before resetting flags. @param string - Imported shared string. @returns Nothing. */
  SetHybridString(string: SharedStringConstReference): void {
    const value = this.GetDouble(),
      formula = this.GetHybridFormula();
    this.ResetToDefaults();
    this.mpToken = new ScHybridCellToken(value, string, formula, false);
    formula.dispose();
    this.mbToken = true;
  }
  /** Original import display flag is stored in the hybrid token, not the empty result tag. @returns Nothing. */
  SetHybridEmptyDisplayedAsString(): void {
    const value = this.GetDouble(),
      formula = this.GetHybridFormula(),
      string = this.GetString();
    this.ResetToDefaults();
    this.mpToken = new ScHybridCellToken(value, string, formula, true);
    formula.dispose();
    this.mbToken = true;
  }
  /** Original uncompiled formula import captures previous number/string before resetting flags. @param formula - Imported formula. @returns Nothing. */
  SetHybridFormula(formula: OUStringConstReference): void {
    const value = this.GetDouble(),
      string = this.GetString();
    this.ResetToDefaults();
    this.mpToken = new ScHybridCellToken(value, string, formula, false);
    this.mbToken = true;
  }
  /** Original matrix formula result replacement. @param columns - Signed16 columns. @param rows - Signed32 rows. @param matrix - Actual matrix. @param upperLeft - Upper-left result token. @returns Nothing. */
  SetMatrix(
    columns: number,
    rows: number,
    matrix: ScConstMatrixRef,
    upperLeft: FormulaConstTokenRef,
  ): void {
    this.ResetToDefaults();
    this.mpToken = new ScMatrixFormulaCellToken(columns, rows, matrix, upperLeft);
    this.mbToken = true;
  }
  /** Original direct token inspection retains declared matrix dimensions even under an error flag. @returns Actual stored matrix formula owner or null. */
  GetMatrixFormulaCellToken(): ScMatrixFormulaCellToken | null {
    return this.mbToken && this.mpToken && this.mpToken.GetType() === StackVar.svMatrixCell
      ? (this.mpToken as ScMatrixFormulaCellToken)
      : null;
  }
  /** Original mutable borrowed pointer delegates to the same matrix owner. @returns Same matrix owner or null. */
  GetMatrixFormulaCellTokenNonConst(): ScMatrixFormulaCellToken | null {
    return this.GetMatrixFormulaCellToken();
  }
  /** Original parallel fixup only services removed physical token reference policies; JS GC requires no fixup. @returns Nothing. */
  HandleStuffAfterParallelCalculation(): void {
    return;
  }
}

/** @fileoverview Complete original Excel/Calc formula-error conversion functions from xltools.cxx. The native static-only utility has no constructible instance in this binding. */
import { FormulaError, CreateDoubleError } from "../../../../formula/inc/errorcodes";
import {
  EXC_ERR_NULL,
  EXC_ERR_DIV0,
  EXC_ERR_VALUE,
  EXC_ERR_REF,
  EXC_ERR_NAME,
  EXC_ERR_NUM,
  EXC_ERR_NA,
  EXC_ERR_SPILL,
} from "../inc/xlconst";
/** Original XclTools static utility member group; no replacement workbook/error service. */

/** Original many-to-one Calc error mapping, preserving unsupported-code fallback to NA. @param error - Native UInt16 error. @returns Excel error byte. */
function GetXclErrorCode(error: FormulaError): number {
  switch (error & 0xffff) {
    case FormulaError.IllegalArgument:
    case FormulaError.IllegalParameter:
    case FormulaError.PairExpected:
    case FormulaError.OperatorExpected:
    case FormulaError.VariableExpected:
    case FormulaError.ParameterExpected:
    case FormulaError.NoValue:
    case FormulaError.CircularReference:
      return EXC_ERR_VALUE;
    case FormulaError.IllegalFPOperation:
      return EXC_ERR_NUM;
    case FormulaError.DivisionByZero:
      return EXC_ERR_DIV0;
    case FormulaError.NoCode:
      return EXC_ERR_NULL;
    case FormulaError.NoRef:
      return EXC_ERR_REF;
    case FormulaError.NoName:
    case FormulaError.NoAddin:
    case FormulaError.NoMacro:
      return EXC_ERR_NAME;
    case FormulaError.NotAvailable:
      return EXC_ERR_NA;
    case FormulaError.Spill:
      return EXC_ERR_SPILL;
    default:
      break;
  }
  return EXC_ERR_NA;
}
/** Original byte-to-Calc conversion; the unknown-byte diagnostic still falls back to NA. @param error - Excel byte. @returns Calc error. */
function GetScErrorCode(error: number): FormulaError {
  switch (error & 255) {
    case EXC_ERR_NULL:
      return FormulaError.NoCode;
    case EXC_ERR_DIV0:
      return FormulaError.DivisionByZero;
    case EXC_ERR_VALUE:
      return FormulaError.NoValue;
    case EXC_ERR_REF:
      return FormulaError.NoRef;
    case EXC_ERR_NAME:
      return FormulaError.NoName;
    case EXC_ERR_NUM:
      return FormulaError.IllegalFPOperation;
    case EXC_ERR_NA:
      return FormulaError.NotAvailable;
    case EXC_ERR_SPILL:
      return FormulaError.Spill;
    default:
      break;
  }
  return FormulaError.NotAvailable;
}
/** Original encoded-NaN conversion through the real shared formula error encoder. @param error - Excel byte. @returns Native encoded double. */
function ErrorToDouble(error: number): number {
  return CreateDoubleError(GetScErrorCode(error));
}

/** Original deleted-constructor utility exposed as its static member object. */
export const XclTools = { GetXclErrorCode, GetScErrorCode, ErrorToDouble };

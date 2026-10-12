/** @fileoverview Original shared formula/errorcodes.hxx constants and encoded double errors using native JS numbers and DataView. */
/* This file is part of the LibreOffice project, MPL-2.0. Original source incorporates Apache-2.0 work. */
/** Original shared UInt16 formula error discriminators, including unpublished interpreter conditions. */
export enum FormulaError {
  NONE = 0,

  IllegalChar = 501,
  IllegalArgument = 502,
  IllegalFPOperation = 503, // #NUM!
  IllegalParameter = 504,
  Pair = 507,
  PairExpected = 508,
  OperatorExpected = 509,
  VariableExpected = 510,
  ParameterExpected = 511,
  CodeOverflow = 512,
  StringOverflow = 513,
  StackOverflow = 514,
  UnknownState = 515,
  UnknownVariable = 516,
  UnknownOpCode = 517,
  UnknownStackVariable = 518,
  NoValue = 519, // #VALUE!
  UnknownToken = 520,
  NoCode = 521, // #NULL!
  CircularReference = 522,
  NoConvergence = 523,
  NoRef = 524, // #REF!
  NoName = 525, // #NAME?
  // ScInterpreter internal:  no numeric value but numeric queried. If this is
  // set as mnStringNoValueError no error is generated but 0 returned.
  CellNoValue = 529,
  // Interpreter: needed AddIn not found
  NoAddin = 530,
  // Interpreter: needed Macro not found
  NoMacro = 531,
  // Interpreter: Division by zero
  DivisionByZero = 532, // #DIV/0!
  // Compiler: a non-simple (str,err,val) value was put in an array
  NestedArray = 533,
  // ScInterpreter internal:  no numeric value but numeric queried. If this is
  // temporarily (!) set as mnStringNoValueError, the error is generated and can
  // be used to distinguish that condition from all other (inherited) errors. Do
  // not use for anything else! Never push or inherit the error otherwise!
  NotNumericString = 534,
  // ScInterpreter internal:  jump matrix already has a result at this position,
  // do not overwrite in case of empty code path.
  JumpMatHasResult = 535,
  // ScInterpreter internal:  (matrix) element is not a numeric value, i.e.
  // string or empty, to be distinguished from the general FormulaError::NoValue NAN and not
  // to be used as result.
  ElementNaN = 536,
  // ScInterpreter/ScFormulaCell internal:  keep dirty, retry interpreting next
  // round.
  RetryCircular = 537,
  // If matrix could not be allocated.
  MatrixSize = 538,
  // Bad inline array content, non-value/non-string.
  BadArrayContent = 539,
  // Interpreter: signal result not available because updating links is not
  // allowed (yet) and tell to try hybrid string as result.
  LinkFormulaNeedingCheck = 540,
  // Array/matrix formula result can't spill because target cells are not empty.
  Spill = 541,

  // Interpreter: NA() not available condition, not a real error
  NotAvailable = 0x7fff,
}

/** Constructs the original quiet NaN with the UInt16 interpreter error in its low fraction word. @param nErr - Original error discriminator. @returns Encoded double error. */
export function CreateDoubleError(nErr: FormulaError): number {
  const smVal = new DataView(new ArrayBuffer(8));
  smVal.setFloat64(0, NaN, true);
  smVal.setUint32(0, nErr & 0xffff, true);
  return smVal.getFloat64(0, true);
}

/** Recreates the original error discriminator, retaining finite, infinite and NaN precedence. @param fVal - Numeric result or encoded error. @returns Original error code. */
export function GetDoubleErrorValue(fVal: number): FormulaError {
  if (Number.isFinite(fVal)) return FormulaError.NONE;
  if (fVal === Infinity || fVal === -Infinity) return FormulaError.IllegalFPOperation;
  const smVal = new DataView(new ArrayBuffer(8));
  smVal.setFloat64(0, fVal, true);
  const nErr = smVal.getUint32(0, true);
  if (nErr & 0xffff0000) return FormulaError.NoValue;
  if (!nErr) return FormulaError.IllegalFPOperation;
  return nErr & 0x0000ffff;
}

/** Tests the original explicit published error constant policy; interpreter-only conditions remain unpublished. @param nErr - Original error discriminator. @returns Whether accepted as a detailed #ERRxxx! constant. */
export function isPublishedFormulaError(nErr: FormulaError): boolean {
  switch (nErr) {
    case FormulaError.NONE:
      return false;

    case FormulaError.IllegalChar:
    case FormulaError.IllegalArgument:
    case FormulaError.IllegalFPOperation:
    case FormulaError.IllegalParameter:
    case FormulaError.Pair:
    case FormulaError.PairExpected:
    case FormulaError.OperatorExpected:
    case FormulaError.VariableExpected:
    case FormulaError.ParameterExpected:
    case FormulaError.CodeOverflow:
    case FormulaError.StringOverflow:
    case FormulaError.StackOverflow:
    case FormulaError.UnknownState:
    case FormulaError.UnknownVariable:
    case FormulaError.UnknownOpCode:
    case FormulaError.UnknownStackVariable:
    case FormulaError.NoValue:
    case FormulaError.UnknownToken:
    case FormulaError.NoCode:
    case FormulaError.CircularReference:
    case FormulaError.NoConvergence:
    case FormulaError.NoRef:
    case FormulaError.NoName:
      return true;

    case FormulaError.CellNoValue:
      return false;

    case FormulaError.NoAddin:
    case FormulaError.NoMacro:
    case FormulaError.DivisionByZero:
    case FormulaError.NestedArray:
    case FormulaError.BadArrayContent:
      return true;

    case FormulaError.NotNumericString:
    case FormulaError.JumpMatHasResult:
    case FormulaError.ElementNaN:
    case FormulaError.RetryCircular:
      return false;

    case FormulaError.MatrixSize:
    case FormulaError.LinkFormulaNeedingCheck:
    case FormulaError.Spill:
      return true;

    case FormulaError.NotAvailable:
      return false;
  }
  return false;
}

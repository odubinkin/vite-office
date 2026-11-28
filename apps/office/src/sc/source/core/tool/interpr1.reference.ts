/** @fileoverview Calc scalar information functions and OFFSET over native local reference tokens. */
import { GetLookupMatrix } from "./interpr1";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { FormulaErrorToken, StackVar } from "../../../../formula/inc/token";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { ScAddress, ScRange } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { ScComplexRefData, ScSingleRefData } from "../../../inc/refdata";
import {
  ScDoubleRefToken,
  ScEmptyCellToken,
  ScExternalDoubleRefToken,
  ScExternalSingleRefToken,
  ScMatrixToken,
  ScSingleRefToken,
} from "../../../inc/token";
import type { ScInterpreter } from "./interpr4";

/** Checks the native scalar arity and retains the interpreter's first error. @param owner - Active interpreter. @param count - Actual count. @param min - Required count. @param max - Maximum count. @returns Valid arity. */
function hasCount(owner: ScInterpreter, count: number, min: number, max = min): boolean {
  if (count >= min && count <= max) return true;
  owner.SetError(count < min ? FormulaError.ParameterExpected : FormulaError.IllegalParameter);
  return false;
}

/** Applies NOT to the native scalar argument. @param this - Active interpreter. @param count - Argument count. @returns Nothing. */
export function ScNot(this: ScInterpreter, count: number): void {
  if (!hasCount(this, count, 1)) return;
  this["nRetFmtType"] = SvNumFormatType.LOGICAL;
  this["PushDouble"](Number(this["GetDouble"]() === 0));
}

/** Checks actual cell occupancy, preserving the distinction between blank and empty text. @param this - Active interpreter. @param count - Argument count. @returns Nothing. */
export function ScIsEmpty(this: ScInterpreter, count: number): void {
  if (!hasCount(this, count, 1)) return;
  this["nRetFmtType"] = SvNumFormatType.LOGICAL;
  const token = this["pStack"].at(-1);
  let result = false;
  if (token instanceof ScSingleRefToken) {
    const address = this["PopSingleRef"]();
    result =
      this.GetError() === FormulaError.NONE &&
      this.mrDoc.GetCellType(address) === CellType.CELLTYPE_NONE;
  } else if (token instanceof ScDoubleRefToken) {
    const address = new ScAddress();
    const range = this["PopDoubleRef"]();
    result =
      this.GetError() === FormulaError.NONE &&
      this["DoubleRefToPosSingleRef"](range, address) &&
      this.mrDoc.GetCellType(address) === CellType.CELLTYPE_NONE;
  } else if (
    token instanceof ScMatrixToken ||
    token instanceof ScExternalSingleRefToken ||
    token instanceof ScExternalDoubleRefToken
  ) {
    result = GetLookupMatrix.call(this)?.IsEmptyCell(0, 0) ?? false;
  } else {
    this["pStack"].pop();
    if (token instanceof ScEmptyCellToken) result = !token.IsInherited();
  }
  this["nGlobalError"] = FormulaError.NONE;
  this["PushDouble"](Number(result));
}

/** Pops an optional size while retaining the original reference dimension as the default. @param this - Active interpreter. @param present - Whether supplied. @returns Explicit size or absence. */
function popSize(this: ScInterpreter, present: boolean): number | undefined {
  if (!present) return undefined;
  if (this["pStack"].at(-1)?.GetType() !== StackVar.svMissing) return this.GetInt32();
  this["pStack"].pop();
  return undefined;
}

/** Moves or resizes an original local sheet reference. @param this - Active interpreter. @param count - Argument count. @returns Nothing. */
export function ScOffset(this: ScInterpreter, count: number): void {
  if (!hasCount(this, count, 3, 5)) return;
  const width = popSize.call(this, count === 5);
  const height = popSize.call(this, count >= 4);
  const dx = this.GetInt32();
  const dy = this.GetInt32();
  if (this.GetError() !== FormulaError.NONE) return;
  if ((width ?? 1) <= 0 || (height ?? 1) <= 0) {
    this.SetError(FormulaError.IllegalArgument);
    return;
  }
  const input = this["pStack"].at(-1);
  const single = input instanceof ScSingleRefToken || input instanceof ScExternalSingleRefToken;
  const external =
    input instanceof ScExternalSingleRefToken || input instanceof ScExternalDoubleRefToken;
  let source: ScRange;
  if (input instanceof ScSingleRefToken) {
    const address = this["PopSingleRef"]();
    source = new ScRange(address, address);
  } else if (input instanceof ScDoubleRefToken) source = this["PopDoubleRef"]();
  else if (external) {
    this["pStack"].pop();
    if (input instanceof ScExternalSingleRefToken) {
      const address = input.GetSingleRef().toAbs(this.mrDoc, this.aPos);
      source = new ScRange(address, address);
    } else source = input.GetDoubleRef().toAbs(this.mrDoc, this.aPos);
  } else {
    this["PopError"]();
    this.SetError(FormulaError.IllegalParameter);
    return;
  }
  if (this.GetError() !== FormulaError.NONE) return;

  const { aStart, aEnd } = source;
  const col = ((aStart.Col() + dx) << 16) >> 16;
  const row = (aStart.Row() + dy) | 0;
  const tab = aStart.Tab();
  const lastCol = ((col + (width ?? aEnd.Col() - aStart.Col() + 1) - 1) << 16) >> 16;
  const lastRow = (row + (height ?? aEnd.Row() - aStart.Row() + 1) - 1) | 0;
  if (
    tab !== aEnd.Tab() ||
    !this.mrDoc.ValidColRow(col, row) ||
    !this.mrDoc.ValidColRow(lastCol, lastRow)
  ) {
    this.SetError(FormulaError.IllegalArgument);
    return;
  }
  const limits = this.mrDoc.GetSheetLimits();
  if (single && width === undefined && height === undefined) {
    const ref = new ScSingleRefData();
    ref.InitAddress(col, row, tab);
    if (external)
      this["PushWithoutError"](
        new ScExternalSingleRefToken(input.GetFileId(), input.GetTableName(), ref),
      );
    else {
      ref.SetFlag3D(tab !== this.aPos.Tab());
      this["PushWithoutError"](new ScSingleRefToken(limits, ref));
    }
  } else {
    const ref = new ScComplexRefData();
    ref.InitRange(col, row, tab, lastCol, lastRow, tab);
    if (external)
      this["PushWithoutError"](
        new ScExternalDoubleRefToken(input.GetFileId(), input.GetTableName(), ref),
      );
    else {
      ref.Ref1.SetFlag3D(tab !== this.aPos.Tab());
      this["PushWithoutError"](new ScDoubleRefToken(limits, ref));
    }
  }
}

/** Tests the original text value in scalar, reference or matrix operands. @param this - Active interpreter. @returns Nothing. */
export function ScIsString(this: ScInterpreter): void {
  const type = this["pStack"].at(-1)?.GetType();
  let result = false;
  if (type === StackVar.svSingleRef || type === StackVar.svDoubleRef) {
    const address = type === StackVar.svSingleRef ? this["PopSingleRef"]() : new ScAddress();
    if (type === StackVar.svDoubleRef)
      this["DoubleRefToPosSingleRef"](this["PopDoubleRef"](), address);
    if (
      this.GetError() === FormulaError.NONE &&
      this.mrDoc.GetErrCode(address) === FormulaError.NONE
    ) {
      const value = this.mrDoc.GetRefCellValue(address);
      result = value.hasString() && !value.hasEmptyValue();
    }
  } else if (type === StackVar.svExternalSingleRef) {
    const token = this["PopExternalSingleRef"]();
    result = this.GetError() === FormulaError.NONE && token?.GetType() === StackVar.svString;
  } else if (type === StackVar.svMatrix || type === StackVar.svExternalDoubleRef) {
    const matrix = GetLookupMatrix.call(this);
    result =
      matrix !== null &&
      matrix !== undefined &&
      matrix.IsStringOrEmpty(0, 0) &&
      !matrix.IsEmpty(0, 0);
  } else {
    this["pStack"].pop();
    result = type === StackVar.svString;
  }
  this["nGlobalError"] = FormulaError.NONE;
  this["nRetFmtType"] = SvNumFormatType.LOGICAL;
  this["PushDouble"](Number(result));
}

/** Pops the tested scalar or original reference and reads its error without numeric coercion. @param this - Active interpreter. @returns Original error. */
export function PopErrorOperand(this: ScInterpreter): FormulaError {
  const type = this["pStack"].at(-1)?.GetType();
  let error = FormulaError.NONE;
  if (type === StackVar.svSingleRef || type === StackVar.svDoubleRef) {
    const address = type === StackVar.svSingleRef ? this["PopSingleRef"]() : new ScAddress();
    if (type === StackVar.svDoubleRef)
      this["DoubleRefToPosSingleRef"](this["PopDoubleRef"](), address);
    if (this["nGlobalError"] === FormulaError.NONE)
      error = this.mrDoc.GetFormulaCell(address)?.GetErrCode() ?? FormulaError.NONE;
  } else if (type === StackVar.svExternalSingleRef) {
    const token = this["PopExternalSingleRef"]();
    if (token instanceof FormulaErrorToken) error = token.GetError();
  } else if (type === StackVar.svMatrix || type === StackVar.svExternalDoubleRef) {
    const matrix = GetLookupMatrix.call(this);
    const item = matrix?.Get(0, 0);
    if (item) {
      error = item.GetError();
      item.dispose();
    } else error = FormulaError.NoValue;
  } else {
    const token = this["pStack"].pop();
    if (token instanceof FormulaErrorToken) error = token.GetError();
  }
  return this.GetError() !== FormulaError.NONE ? this.GetError() : error;
}

/** Applies the original ISERROR, ISERR or ISNA predicate. @param this - Active interpreter. @param opcode - Original predicate. @param count - Compiled argument count. @returns Nothing. */
export function ScIsError(this: ScInterpreter, opcode: OpCode, count: number): void {
  if (!hasCount(this, count, 1)) return;
  const error = PopErrorOperand.call(this);
  this["nGlobalError"] = FormulaError.NONE;
  this["nRetFmtType"] = SvNumFormatType.LOGICAL;
  const result =
    opcode === OpCode.ocIsNA
      ? error === FormulaError.NotAvailable
      : error !== FormulaError.NONE &&
        (opcode === OpCode.ocIsError || error !== FormulaError.NotAvailable);
  this["PushDouble"](Number(result));
}

/** Tests the first IFERROR or IFNA operand while preserving the original token on the successful path. @param this - Active interpreter. @param naOnly - Whether only #N/A selects the fallback. @param count - Native jump argument count. @returns Whether to evaluate the fallback. */
export function ScIfError(this: ScInterpreter, naOnly: boolean, count: number): boolean {
  const token = this["pStack"].at(-1);
  if (!token || count !== 2) {
    this["nGlobalError"] = token
      ? FormulaError.ParameterExpected
      : FormulaError.UnknownStackVariable;
    return false;
  }
  const previousError = this.GetError();
  this["nGlobalError"] = FormulaError.NONE;
  const operandError = PopErrorOperand.call(this);
  const error = operandError === FormulaError.NONE ? previousError : operandError;
  if (error !== FormulaError.NONE && (!naOnly || error === FormulaError.NotAvailable)) {
    this["nGlobalError"] = FormulaError.NONE;
    return true;
  }
  this["nGlobalError"] = previousError;
  this["PushWithoutError"](token);
  return false;
}

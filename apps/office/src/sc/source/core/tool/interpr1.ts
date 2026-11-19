/** @fileoverview Original Calc row, column, address, indirect, AND and matrix lookup operations. */
import { OpCode } from "../../../../formula/inc/opcode";
import { approxCeil, approxFloor } from "../../../../sal/inc/rtl/math";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError, GetDoubleErrorValue } from "../../../../formula/inc/errorcodes";
import {
  FormulaByteToken,
  FormulaDoubleToken,
  FormulaStringToken,
  StackVar,
  type FormulaToken,
} from "../../../../formula/inc/token";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import { ScComplexRefData, ScSingleRefData } from "../../../inc/refdata";
import {
  ScDoubleRefToken,
  ScExternalDoubleRefToken,
  ScExternalSingleRefToken,
  ScMatrixToken,
  ScSingleRefToken,
} from "../../../inc/token";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScValueIterator } from "../../../inc/dociter";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import type { ScInterpreter } from "./interpr4";
import { QuoteTabName } from "./address.ooo";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScMatValType } from "../../../inc/types";
import { ScMatrix, type ScMatrixValue } from "../../../inc/scmatrix";
import { GetCollator, type ScQueryItem } from "./queryentry";

/** Searches the first matrix column or row, with native sorted and exact rules. @param matrix - Lookup table. @param count - Length of the search axis. @param index - Result row or column offset. @param horizontal - Search across the first row. @param sorted - Selects the ordered search. @param key - Query entry value. @returns Owned matched result or absence. */
export function CalculateMatrixLookup(
  matrix: ScMatrix,
  count: number,
  index: number,
  horizontal: boolean,
  sorted: boolean,
  key: ScQueryItem,
): ScMatrixValue | undefined {
  let match = -1;
  let matchIsNumber = false;
  for (let offset = 0; offset < count; ++offset) {
    const candidate = matrix.Get(horizontal ? offset : 0, horizontal ? 0 : offset);
    try {
      const numeric = ScMatrix.IsValueType(candidate.nType);
      if (typeof key === "number") {
        if (!numeric) continue;
        if (!sorted) {
          if (candidate.fVal !== key) continue;
          match = offset;
          break;
        }
        if (!(candidate.fVal <= key)) break;
      } else if (sorted) {
        if (
          !numeric &&
          GetCollator().compare(text(candidate.GetString().getString()), key.text) > 0
        ) {
          if (offset === 0) continue;
          break;
        }
      } else {
        if (candidate.nType === ScMatValType.String) {
          if (text(candidate.GetString().getIgnoreCaseString()) !== key.ignoreCase) continue;
        } else if (!horizontal || numeric || key.text.length) continue;
        match = offset;
        break;
      }
      match = offset;
      matchIsNumber = numeric;
    } finally {
      candidate.dispose();
    }
  }
  if (match < 0 || (typeof key !== "number" && matchIsNumber)) return undefined;
  return matrix.Get(horizontal ? match : index, horizontal ? index : match);
}

/** Dispatches the scalar reference operators owned by the native interpreter. @param this - Active Calc interpreter. @param token - Opcode and parameter count. @returns Whether the opcode belongs to this group. */
export function InterpretReferenceOpcode(this: ScInterpreter, token: FormulaToken): boolean {
  const op = token.GetOpCode();
  if (op === OpCode.ocRow || op === OpCode.ocColumn) {
    ScRowColumn.call(this, (token as FormulaByteToken).GetByte(), op === OpCode.ocRow);
  } else if (op === OpCode.ocAddress)
    ScAddressFunc.call(this, (token as FormulaByteToken).GetByte());
  else if (op === OpCode.ocIndirect) ScIndirect.call(this, (token as FormulaByteToken).GetByte());
  else return false;
  return true;
}

/** Gets an axis of the current cell or of the supplied reference. @param this - Active Calc interpreter. @param count - Native parameter count. @param rows - Select the row axis. @returns Nothing. */
function ScRowColumn(this: ScInterpreter, count: number, rows: boolean): void {
  let address = this.aPos;
  if (count === 1) {
    const reference = this["pStack"].at(-1);
    if (reference instanceof ScSingleRefToken) address = this["PopSingleRef"]();
    else if (reference instanceof ScDoubleRefToken) address = this["PopDoubleRef"]().aStart;
    else {
      this["PopError"]();
      this.SetError(FormulaError.IllegalParameter);
    }
  } else if (count !== 0) this.SetError(FormulaError.IllegalParameter);
  this["PushDouble"]((rows ? address.Row() : address.Col()) + 1);
}

const convention = FormulaGrammar.AddressConvention;

/** Reads the configured string reference convention or the current document convention. @param interpreter - Active interpreter. @returns Reference syntax. */
function stringReferenceConvention(interpreter: ScInterpreter) {
  const configured = interpreter["maCalcConfig"].meStringRefAddressSyntax;
  return configured === convention.CONV_UNSPECIFIED
    ? interpreter.mrDoc.GetAddressConvention()
    : configured;
}

/** Formats an address using the same convention as the native INDIRECT implementation. @param this - Active interpreter. @param count - Native parameter count. @returns Nothing. */
function ScAddressFunc(this: ScInterpreter, count: number): void {
  if (!checkParameterCount(this, count, 2, 5)) return;
  const sheet = count >= 5 ? this["GetString"]() : "";
  const r1c1 = count >= 4 && readDoubleWithDefault(this, 1) === 0;
  const abs = count >= 3 ? doubleToInt(this, readDoubleWithDefault(this, 1), 32) : 1;
  const col = doubleToInt(this, this["GetDouble"](), 16);
  const row = doubleToInt(this, this["GetDouble"](), 32);
  if (abs < 1 || abs > 8) {
    this.SetError(FormulaError.NoValue);
    return;
  }
  const { mrDoc, aPos } = this;
  const absolute = (abs - 1) % 4;
  const relativeColumn = absolute === 1 || absolute === 3;
  const relativeRow = absolute === 2 || absolute === 3;
  const column = r1c1 && relativeColumn ? col + aPos.Col() : col - 1;
  const line = r1c1 && relativeRow ? row + aPos.Row() : row - 1;
  if (this.GetError() !== FormulaError.NONE || !mrDoc.ValidColRow(column, line)) {
    this.SetError(FormulaError.IllegalArgument);
    return;
  }
  const source = stringReferenceConvention(this);
  const syntax = r1c1
    ? convention.CONV_XL_R1C1
    : source === convention.CONV_XL_A1 ||
        source === convention.CONV_XL_R1C1 ||
        source === convention.CONV_XL_OOX
      ? convention.CONV_XL_A1
      : convention.CONV_OOO;
  const flags =
    ScRefFlags.VALID |
    (relativeColumn ? 0 : ScRefFlags.COL_ABS) |
    (relativeRow ? 0 : ScRefFlags.ROW_ABS);
  const formatted = new ScAddress(column, line).Format(
    flags,
    null,
    new ScAddress.Details(syntax, aPos),
  );
  try {
    const quoted = sheet.startsWith("'") && sheet.endsWith("'") ? sheet : QuoteTabName(sheet);
    const prefix = sheet ? quoted + (syntax === convention.CONV_OOO ? "." : "!") : "";
    this["PushString"](prefix + text(formatted));
  } finally {
    formatted.dispose();
  }
}

/** Resolves native named and positional cell/range references. @param this - Active interpreter. @param count - Native parameter count. @returns Nothing. */
function ScIndirect(this: ScInterpreter, count: number): void {
  if (!checkParameterCount(this, count, 1, 2)) return;
  const syntax =
    count === 2 && this["GetDouble"]() === 0
      ? convention.CONV_XL_R1C1
      : stringReferenceConvention(this);
  const spelling = this["GetString"]();
  if (this.GetError() !== FormulaError.NONE) return;
  if (!spelling || spelling.includes("\0")) {
    this.SetError(FormulaError.NoRef);
    return;
  }
  const { mrDoc, aPos } = this;
  const key = spelling.toUpperCase();
  const named =
    mrDoc.GetRangeName(aPos.Tab())?.findByUpperName(key) ??
    mrDoc.GetRangeName()?.findByUpperName(key);
  if (named?.GetCode().GetLen() === 1) {
    const ref = named.GetCode().FirstToken();
    if (ref instanceof ScSingleRefToken || ref instanceof ScDoubleRefToken) {
      this["PushWithoutError"](ref);
      return;
    }
  }
  const source = unicode(spelling);
  try {
    const range = new ScRange(0, 0, aPos.Tab());
    const syntaxes =
      syntax === convention.CONV_A1_XL_A1 ? [convention.CONV_OOO, convention.CONV_XL_A1] : [syntax];
    for (const candidate of syntaxes) {
      range.aEnd.SetTab(aPos.Tab());
      range.aStart.SetTab(aPos.Tab());
      if (
        !(range.ParseAny(source, mrDoc, new ScAddress.Details(candidate, aPos)) & ScRefFlags.VALID)
      )
        continue;
      if (range.aStart.equals(range.aEnd)) {
        const ref = new ScSingleRefData();
        ref.InitAddress(range.aStart);
        ref.SetFlag3D(range.aStart.Tab() !== aPos.Tab());
        this["PushWithoutError"](new ScSingleRefToken(mrDoc.GetSheetLimits(), ref));
      } else {
        const ref = new ScComplexRefData();
        ref.InitRange(range);
        ref.Ref1.SetFlag3D(range.aStart.Tab() !== aPos.Tab());
        ref.Ref2.SetFlag3D(range.aEnd.Tab() !== range.aStart.Tab());
        this["PushWithoutError"](new ScDoubleRefToken(mrDoc.GetSheetLimits(), ref));
      }
      return;
    }
    this.SetError(FormulaError.NoRef);
  } finally {
    source.dispose();
  }
}

/** Admits the original inclusive parameter range. @param interpreter - Active interpreter. @param count - Actual count. @param min - Minimum count. @param max - Maximum count. @returns Whether the call is valid. */
function checkParameterCount(
  interpreter: ScInterpreter,
  count: number,
  min: number,
  max: number,
): boolean {
  if (count >= min && count <= max) return true;
  interpreter.SetError(
    count < min ? FormulaError.ParameterExpected : FormulaError.IllegalParameter,
  );
  return false;
}

/** Reads an optional number with the source default for svMissing. @param interpreter - Active interpreter. @param fallback - Native default. @returns Argument. */
function readDoubleWithDefault(interpreter: ScInterpreter, fallback: number): number {
  const missing = interpreter["pStack"].at(-1)?.GetType() === StackVar.svMissing;
  const value = interpreter["GetDouble"]();
  return missing ? fallback : value;
}

/** Converts a spreadsheet double with native approximate truncation and signed limits. @param interpreter - Active interpreter. @param value - Numeric operand. @param bits - Signed result width. @returns Bounded integer. */
function doubleToInt(interpreter: ScInterpreter, value: number, bits: 16 | 32): number {
  const bound = 2 ** (bits - 1);
  if (!Number.isFinite(value)) {
    interpreter.SetError(GetDoubleErrorValue(value));
    return bound - 1;
  }
  const integer = value < 0 ? approxCeil(value) : approxFloor(value);
  if (integer < -bound || integer >= bound) {
    interpreter.SetError(FormulaError.IllegalArgument);
    return bound - 1;
  }
  return integer;
}

/** Reduces ordinary scalars, numeric references and value-only matrices in native stack order. @param this - Active interpreter. @param count - Native arity. @returns Nothing. */
export function ScAnd(this: ScInterpreter, count: number): void {
  if (!checkParameterCount(this, count, 1, 255)) return;
  let hasValue = false;
  let result = true;
  /** Folds a numeric operand while still visiting later errors. @param value - Numeric operand. @returns Nothing. */
  function fold(value: number): void {
    hasValue = true;
    if (value === 0) result = false;
  }
  while (count-- > 0) {
    const arg = this["pStack"].at(-1);
    if (this.GetError() !== FormulaError.NONE) this["pStack"].pop();
    else if (arg instanceof FormulaDoubleToken) fold(this["GetDouble"]());
    else if (arg instanceof ScSingleRefToken) {
      const address = this["PopSingleRef"]();
      if (this.GetError() !== FormulaError.NONE) continue;
      const cell = new ScRefCellValue(this.mrDoc, address);
      if (cell.hasNumeric()) fold(this["GetCellValue"](address, cell));
    } else if (arg instanceof ScDoubleRefToken) {
      const range = this["PopDoubleRef"]();
      if (this.GetError() !== FormulaError.NONE) continue;
      const iterator = new ScValueIterator(this.mrContext, range);
      const output = { error: FormulaError.NONE, value: 0 };
      if (iterator.GetFirst(output)) {
        do {
          if (output.error !== FormulaError.NONE) break;
          fold(output.value);
        } while (iterator.GetNext(output));
      }
      this.SetError(output.error);
    } else if (
      arg instanceof ScMatrixToken ||
      arg instanceof ScExternalSingleRefToken ||
      arg instanceof ScExternalDoubleRefToken
    ) {
      const matrix = this["GetLookupMatrix"]();
      if (!matrix) continue;
      const value = matrixAnd(matrix);
      if (typeof value === "boolean") fold(Number(value));
      else this.SetError(value);
    } else {
      this["PopError"]();
      this.SetError(
        arg instanceof FormulaStringToken ? FormulaError.NoValue : FormulaError.IllegalParameter,
      );
    }
  }
  if (!hasValue) this.SetError(FormulaError.NoValue);
  this["nRetFmtType"] = SvNumFormatType.LOGICAL;
  this["PushDouble"](Number(result));
}

/** Reduces a numeric/boolean matrix in the original column-major error order. @param matrix - Argument matrix. @returns Logical value or the first error. */
function matrixAnd(matrix: ScMatrix): boolean | FormulaError {
  const size = { row: 0, column: 0 };
  matrix.GetDimensions(size);
  let result = true;
  for (let column = 0; column < size.column; ++column) {
    for (let row = 0; row < size.row; ++row) {
      const value = matrix.Get(column, row);
      try {
        if (!ScMatrix.IsValueType(value.nType)) return FormulaError.IllegalArgument;
        const error = value.GetError();
        if (error !== FormulaError.NONE) return error;
        if (value.fVal === 0) result = false;
      } finally {
        value.dispose();
      }
    }
  }
  return result;
}

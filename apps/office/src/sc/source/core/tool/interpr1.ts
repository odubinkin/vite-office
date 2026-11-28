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
import { CellType } from "../../../inc/global";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScValueIterator } from "../../../inc/dociter";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import type { ScInterpreter } from "./interpr4";
import { QuoteTabName } from "./address.ooo";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScMatValType } from "../../../inc/types";
import { ScMatrix, type ScMatrixValue } from "../../../inc/scmatrix";
import { GetCollator, ScQueryEntry, type ScQueryItem } from "./queryentry";
import { ScQueryCellIteratorDirect } from "../data/queryiter";
import { SearchParam } from "../../../../unotools/source/i18n/textsearch";

/** Searches a matrix vector with the native forward or binary MATCH mode. @param matrix - Search vector. @param columns - Column count. @param rows - Row count. @param entry - Native search criterion. @param mode - Original MATCH option. @returns One-based position or absence. */
function SearchMatchMatrix(
  matrix: ScMatrix,
  columns: number,
  rows: number,
  entry: ScQueryEntry,
  mode: number,
): number | undefined {
  const horizontal = columns > 1;
  const end = horizontal ? columns : rows;
  const key = entry.item;
  /** Reads an owned scalar from the search vector. @param offset - Vector position. @returns Matrix scalar. */
  const get = (offset: number) => matrix.Get(horizontal ? offset : 0, horizontal ? 0 : offset);
  /** Orders one matrix value against the query result. @param offset - Candidate position. @returns Order relative to the search key. */
  const compare = (offset: number): number => {
    const item = get(offset);
    try {
      if (item.nType === ScMatValType.Empty) return -1;
      if (ScMatrix.IsValueType(item.nType)) {
        if (!Number.isFinite(item.fVal)) return 1;
        if (typeof key !== "number") return -1;
        return item.fVal === key ? 0 : item.fVal < key ? -1 : 1;
      }
      if (typeof key === "number") return 1;
      const value = item.GetString();
      if (
        mode === 0 &&
        entry.searchType !== SearchParam.SearchType.Normal &&
        entry.matchesText(value.getString(), text(value.getIgnoreCaseString()))
      )
        return 0;
      return GetCollator().compare(text(value.getString()), key.text);
    } finally {
      item.dispose();
    }
  };
  if (end === 0) return undefined;
  if (mode === 0) {
    for (let offset = 0; offset < end; ++offset) if (compare(offset) === 0) return offset + 1;
    return undefined;
  }
  let first = 0;
  let last = end - 1;
  let hit = 0;
  while (last > first) {
    const middle = first + Math.floor((last - first) / 2);
    const comparison = compare(middle);
    if (comparison === 0) {
      const matched = get(middle);
      try {
        let index = middle;
        while (index + 1 < end) {
          const next = get(index + 1);
          try {
            const numeric = ScMatrix.IsValueType(matched.nType);
            if (numeric !== ScMatrix.IsValueType(next.nType)) break;
            if (
              numeric
                ? next.fVal !== matched.fVal
                : next.nType !== matched.nType ||
                  text(next.GetString().getString()) !== text(matched.GetString().getString())
            )
              break;
            ++index;
          } finally {
            next.dispose();
          }
        }
        return index + 1;
      } finally {
        matched.dispose();
      }
    }
    if (last - first === 1) {
      hit = comparison * mode < 0 ? last : first;
      break;
    }
    if (comparison * mode < 0) first = middle;
    else last = middle;
  }
  if (hit === end - 1 && compare(hit) * mode <= 0) return hit + 1;
  if (hit === 0) return undefined;
  const result = get(hit - 1);
  try {
    return ScMatrix.IsValueType(result.nType) === (typeof key === "number") ? hit : undefined;
  } finally {
    result.dispose();
  }
}

/** Resolves the original zero/one-dimensional MATCH vector and comparison mode. @param this - Active interpreter. @param count - Native argument count. @returns Nothing. */
function ScMatch(this: ScInterpreter, count: number): void {
  if (!checkParameterCount(this, count, 2, 3)) return;
  const mode = count === 3 ? Math.trunc(this["GetDouble"]()) : 1;
  if (mode !== -1 && mode !== 0 && mode !== 1) {
    this.SetError(FormulaError.IllegalParameter);
    return;
  }
  const source = this["pStack"].at(-1);
  let range: ScRange | undefined;
  let matrix: ScMatrix | undefined;
  if (source instanceof ScDoubleRefToken) range = this["PopDoubleRef"]();
  else if (source instanceof ScSingleRefToken) {
    const address = this["PopSingleRef"]();
    range = new ScRange(address, address);
  } else matrix = this["GetLookupMatrix"]();
  if (this.GetError() !== FormulaError.NONE) return;
  if (
    range &&
    (range.aStart.Tab() !== range.aEnd.Tab() ||
      (range.aStart.Col() !== range.aEnd.Col() && range.aStart.Row() !== range.aEnd.Row()))
  ) {
    this.SetError(FormulaError.IllegalParameter);
    return;
  }
  const key = this["FillLookupEntry"]();
  if (key === undefined || this.GetError() !== FormulaError.NONE) return;
  const entry = new ScQueryEntry(key, this.mrDoc.GetDocOptions(), this.mrDoc.regexMatcherFactory);
  if (!entry.CanSearch()) {
    this.SetError(FormulaError.NoValue);
    return;
  }
  if (range) {
    const horizontal = range.aStart.Row() === range.aEnd.Row();
    const iterator = new ScQueryCellIteratorDirect(this.mrDoc, range, horizontal, entry);
    const found =
      mode === 0 ? iterator.GetFirst() : iterator.FindEqualOrSortedLastInRange(mode === -1);
    if (found)
      this["PushDouble"](
        horizontal ? found.Col() - range.aStart.Col() + 1 : found.Row() - range.aStart.Row() + 1,
      );
    else this.SetError(FormulaError.NotAvailable);
    return;
  }
  if (!matrix) {
    this.SetError(FormulaError.IllegalParameter);
    return;
  }
  const dimensions = { column: 0, row: 0 };
  matrix.GetDimensions(dimensions);
  if (dimensions.column > 1 && dimensions.row > 1) {
    this.SetError(FormulaError.IllegalParameter);
    return;
  }
  const found = SearchMatchMatrix(matrix, dimensions.column, dimensions.row, entry, mode);
  if (found === undefined) this.SetError(FormulaError.NotAvailable);
  else this["PushDouble"](found);
}

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
  else if (op === OpCode.ocMatch) ScMatch.call(this, (token as FormulaByteToken).GetByte());
  else if (op === OpCode.ocIsFormula) ScIsFormula.call(this);
  else return false;
  return true;
}

/** Tests the referenced cell's native stored type without evaluating its formula. @param this - Current interpreter. @returns Nothing. */
function ScIsFormula(this: ScInterpreter): void {
  this["nRetFmtType"] = SvNumFormatType.LOGICAL;
  const argument = this["pStack"].at(-1);
  let result = false;
  if (argument instanceof ScSingleRefToken) {
    const address = this["PopSingleRef"]();
    result =
      this.GetError() === FormulaError.NONE &&
      this.mrDoc.GetCellType(address) === CellType.CELLTYPE_FORMULA;
  } else if (argument instanceof ScDoubleRefToken) {
    const range = this["PopDoubleRef"]();
    if (this.pMyFormulaCell?.GetMatColsRows()) {
      if (this.GetError() !== FormulaError.NONE) return;
      const { aStart, aEnd } = range;
      if (aStart.Tab() !== aEnd.Tab()) {
        this.SetError(FormulaError.IllegalArgument);
        return;
      }
      const columns = aEnd.Col() - aStart.Col() + 1,
        rows = aEnd.Row() - aStart.Row() + 1;
      if (!ScMatrix.IsSizeAllocatable(columns, rows)) {
        this.SetError(FormulaError.MatrixSize);
        return;
      }
      const matrix = new ScMatrix(columns, rows);
      for (let col = aStart.Col(); col <= aEnd.Col(); ++col)
        for (let row = aStart.Row(); row <= aEnd.Row(); ++row) {
          const cell = new ScAddress(col, row, aStart.Tab());
          matrix.PutBoolean(
            this.mrDoc.GetCellType(cell) === CellType.CELLTYPE_FORMULA,
            col - aStart.Col(),
            row - aStart.Row(),
          );
        }
      this["PushWithoutError"](new ScMatrixToken(matrix));
      return;
    }
    const address = new ScAddress();
    result =
      this.GetError() === FormulaError.NONE &&
      this["DoubleRefToPosSingleRef"](range, address) &&
      this.mrDoc.GetCellType(address) === CellType.CELLTYPE_FORMULA;
  } else this["pStack"].pop();

  this["nGlobalError"] = FormulaError.NONE;
  this["PushDouble"](Number(result));
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

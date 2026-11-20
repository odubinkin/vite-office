/** @fileoverview Scalar worksheet-range AVERAGEIF and conditional extrema from interpr1.cxx. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { FormulaByteToken, StackVar, type FormulaToken } from "../../../../formula/inc/token";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScSingleRefToken, ScDoubleRefToken } from "../../../inc/token";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { KahanSum } from "../../../inc/kahan";
import { div } from "../../../inc/math";
import { ScQueryEvaluator } from "../data/queryevaluator";
import type { ScInterpreter } from "./interpr4";
import { FillInExcelSyntax, type ExcelQueryEntry } from "./queryparam";
import { SearchParam } from "../../../../unotools/source/i18n/textsearch";

/** Original worksheet query and prepared comparison. */
interface Condition {
  readonly range: ScRange;
  readonly query: ExcelQueryEntry;
  readonly evaluator: ScQueryEvaluator;
}

/** Dispatches conditional aggregates compiled with the native parameter count. @param this - Active Calc interpreter. @param token - Opcode and arity. @returns Whether dispatched. */
export function InterpretConditionalAggregate(this: ScInterpreter, token: FormulaToken): boolean {
  const op = token.GetOpCode();
  if (
    op !== OpCode.ocAverageIf &&
    op !== OpCode.ocMinIfs_MS &&
    op !== OpCode.ocMaxIfs_MS &&
    op !== OpCode.ocCountIf
  )
    return false;
  const count = (token as FormulaByteToken).GetByte();
  if (op === OpCode.ocCountIf) ScCountIf.call(this, count);
  else if (op === OpCode.ocAverageIf) IterateParametersIf.call(this, count);
  else IterateParametersIfs.call(this, count, op === OpCode.ocMinIfs_MS);
  return true;
}

/** Reads an ordinary worksheet range from the native interpreter stack. @param this - Active interpreter. @param dimensionError - Error for a three-dimensional range. @returns Range or error. */
function popRange(this: ScInterpreter, dimensionError: FormulaError): ScRange | undefined {
  const source = this["pStack"].at(-1);
  if (source instanceof ScSingleRefToken) {
    const address = this["PopSingleRef"]();
    return new ScRange(address, address);
  }
  if (source instanceof ScDoubleRefToken) {
    const range = this["PopDoubleRef"]();
    if (range.aStart.Tab() === range.aEnd.Tab()) return range;
    this.SetError(dimensionError);
  } else {
    this["PopError"]();
    this.SetError(FormulaError.IllegalParameter);
  }
  return undefined;
}

/** Reads the current criterion and its source range. @param this - Active interpreter. @param dimensionError - Error for a three-dimensional criterion range. @returns Condition or error. */
function popCondition(this: ScInterpreter, dimensionError: FormulaError): Condition | undefined {
  const token = this["pStack"].at(-1);
  const type = token?.GetType();
  const value =
    type === StackVar.svMissing || type === StackVar.svEmptyCell || type === StackVar.svError
      ? this["GetDouble"]()
      : this["FillLookupEntry"](true);
  if (value === undefined || this.GetError() !== FormulaError.NONE) return undefined;
  const range = popRange.call(this, dimensionError);
  if (!range || this.GetError() !== FormulaError.NONE) return undefined;
  const query = FillInExcelSyntax(this.mrContext, value);
  if (
    query.entry.searchType === SearchParam.SearchType.Regexp &&
    (query.operation === OpCode.ocEqual || query.operation === OpCode.ocNotEqual)
  ) {
    this.SetError(FormulaError.NoValue);
    return undefined;
  }
  return { range, query, evaluator: new ScQueryEvaluator(this.mrDoc, query.entry) };
}

/** Counts matched worksheet cells, accounting for the unallocated blank portion of the native range. @param this - Active interpreter. @param count - Argument count. @returns Nothing. */
function ScCountIf(this: ScInterpreter, count: number): void {
  if (count !== 2) {
    this.SetError(count < 2 ? FormulaError.ParameterExpected : FormulaError.IllegalParameter);
    return;
  }
  const condition = popCondition.call(this, FormulaError.IllegalParameter);
  if (!condition) return;
  const { range, query, evaluator } = condition;
  const { aStart, aEnd } = range;
  const empty = Number(evaluator.matchesCriterion(new ScRefCellValue(), aStart, query));
  let result = empty * (aEnd.Col() - aStart.Col() + 1) * (aEnd.Row() - aStart.Row() + 1);
  const cells = new ScHorizontalCellIterator(
    this.mrDoc,
    aStart.Tab(),
    aStart.Col(),
    aStart.Row(),
    aEnd.Col(),
    aEnd.Row(),
  );
  const col: [number] = [0];
  const row: [number] = [0];
  const address = new ScAddress(aStart);
  for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row)) {
    address.Set(col[0], row[0], aStart.Tab());
    result += Number(evaluator.matchesCriterion(cell, address, query)) - empty;
  }
  this["PushDouble"](result);
}

/** Runs the original scalar AVERAGEIF alignment and clipping rules. @param this - Active interpreter. @param count - Argument count. @returns Nothing. */
function IterateParametersIf(this: ScInterpreter, count: number): void {
  if (count < 2 || count > 3) {
    this.SetError(count < 2 ? FormulaError.ParameterExpected : FormulaError.IllegalParameter);
    return;
  }
  const destination = count === 3 ? popRange.call(this, FormulaError.IllegalParameter) : undefined;
  if (this.GetError() !== FormulaError.NONE) return;
  const condition = popCondition.call(this, FormulaError.IllegalParameter);
  if (!condition) return;
  const start = destination?.aStart ?? condition.range.aStart;
  const end = new ScAddress(
    Math.min(
      this.mrDoc.MaxCol(),
      start.Col() + condition.range.aEnd.Col() - condition.range.aStart.Col(),
    ),
    Math.min(
      this.mrDoc.MaxRow(),
      start.Row() + condition.range.aEnd.Row() - condition.range.aStart.Row(),
    ),
    start.Tab(),
  );
  const sum = new KahanSum(0);
  const countMatched = forEachMatchingValue.call(
    this,
    new ScRange(start, end),
    [condition],
    /** Adds the numeric value in original column order. @param value - Matching value. @returns Nothing. */ (
      value,
    ) => sum.add(value),
  );
  this["PushDouble"](div(sum.get(), countMatched));
}

/** Runs the original scalar aligned MINIFS/MAXIFS geometry and result reduction. @param this - Active interpreter. @param count - Argument count. @param minimum - Selects the minimum. @returns Nothing. */
function IterateParametersIfs(this: ScInterpreter, count: number, minimum: boolean): void {
  if (count < 3 || count % 2 !== 1) {
    this.SetError(FormulaError.ParameterExpected);
    return;
  }
  const conditions: Condition[] = [];
  for (let remaining = count - 1; remaining > 0; remaining -= 2) {
    const condition = popCondition.call(this, FormulaError.IllegalArgument);
    if (!condition) return;
    conditions.push(condition);
  }
  const main = popRange.call(this, FormulaError.IllegalArgument);
  if (!main || this.GetError() !== FormulaError.NONE) return;
  for (const { range } of conditions) {
    if (
      range.aEnd.Col() - range.aStart.Col() !== main.aEnd.Col() - main.aStart.Col() ||
      range.aEnd.Row() - range.aStart.Row() !== main.aEnd.Row() - main.aStart.Row()
    ) {
      this.SetError(FormulaError.IllegalArgument);
      return;
    }
  }
  const initial = minimum ? Number.MAX_VALUE : -Number.MAX_VALUE;
  let result = initial;
  forEachMatchingValue.call(
    this,
    main,
    conditions,
    /** Applies the original strict extrema comparison. @param value - Matching value. @returns Nothing. */ (
      value,
    ) => {
      if (minimum ? value < result : value > result) result = value;
    },
  );
  this["PushDouble"](result === initial ? 0 : result);
}

/** Visits numeric target cells in the source column order without expanding empty rows or columns. @param this - Active interpreter. @param result - Target range. @param conditions - Source criteria ranges. @param visit - Per-value reduction. @returns Number of matched numeric cells. */
function forEachMatchingValue(
  this: ScInterpreter,
  result: ScRange,
  conditions: readonly Condition[],
  visit: (value: number) => void,
): number {
  const { mrDoc } = this;
  const start = result.aStart;
  const { aEnd } = result;
  const col: [number] = [0];
  const row: [number] = [0];
  const resultAddress = new ScAddress(start);
  const queryAddress = new ScAddress();
  const lastColumn = mrDoc.FetchTable(start.Tab())?.ClampToAllocatedColumns(aEnd.Col()) ?? -1;
  let count = 0;
  for (let column = start.Col(); column <= lastColumn; ++column) {
    const cells = new ScHorizontalCellIterator(
      mrDoc,
      start.Tab(),
      column,
      start.Row(),
      column,
      aEnd.Row(),
    );
    resultAddress.SetCol(column);
    for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row)) {
      let match = true;
      for (const { range, query, evaluator } of conditions) {
        queryAddress.SetTab(range.aStart.Tab());
        queryAddress.SetCol(range.aStart.Col() + column - start.Col());
        queryAddress.SetRow(range.aStart.Row() + row[0] - start.Row());
        if (
          !evaluator.matchesCriterion(new ScRefCellValue(mrDoc, queryAddress), queryAddress, query)
        ) {
          match = false;
          break;
        }
      }
      if (!match || !cell.hasNumeric()) continue;
      resultAddress.SetRow(row[0]);
      const value = this["GetCellValue"](resultAddress, cell);
      if (this.GetError() !== FormulaError.NONE) return count;
      visit(value);
      count++;
    }
  }
  return count;
}

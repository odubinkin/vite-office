/** @fileoverview Native worksheet DCOUNT and DCOUNTA from interpr1.cxx. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { FormulaByteToken, StackVar, type FormulaToken } from "../../../../formula/inc/token";
import { approxFloor } from "../../../../sal/inc/rtl/math";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScDBInternalRange } from "./doubleref";
import type { ScInterpreter } from "./interpr4";

/** Pops a worksheet database double-reference. @param this - Interpreter. @returns Range view or none. */
function popDatabaseRange(this: ScInterpreter): ScDBInternalRange | null {
  if (this["pStack"].at(-1)?.GetType() === StackVar.svDoubleRef) {
    const range = this["PopDoubleRef"]();
    if (this.GetError() === FormulaError.NONE) return new ScDBInternalRange(this.mrDoc, range);
  } else {
    this["PopError"]();
    this.SetError(FormulaError.IllegalParameter);
  }
  return null;
}

/** Dispatches the original database count operators. @param this - Interpreter. @param token - Operation. @returns Whether dispatched. */
export function InterpretDatabaseCount(this: ScInterpreter, token: FormulaToken): boolean {
  const op = token.GetOpCode();
  if (op !== OpCode.ocDBCount && op !== OpCode.ocDBCount2) return false;
  ScDBCount.call(this, (token as FormulaByteToken).GetByte(), op === OpCode.ocDBCount2);
  return true;
}

/** Resolves criteria, field and result iterator as in GetDBParams and ScDBCount. @param this - Interpreter. @param count - Arity. @param countText - Whether to admit text result cells. @returns Nothing. */
function ScDBCount(this: ScInterpreter, count: number, countText: boolean): void {
  if (count !== 3) {
    this.SetError(FormulaError.IllegalParameter);
    return;
  }
  const criteria = popDatabaseRange.call(this);
  if (!criteria) return;
  let field: number | string = 0;
  let missing = false;
  let missingRange: ScDBInternalRange | null = null;
  switch (this["pStack"].at(-1)?.GetType()) {
    case StackVar.svDouble:
      field = approxFloor(this["GetDouble"]());
      missing = field === 0;
      break;
    case StackVar.svString:
      field = this["GetString"]();
      break;
    case StackVar.svSingleRef: {
      const position = this["PopSingleRef"]();
      const cell = new ScRefCellValue(this.mrDoc, position);
      field = cell.hasNumeric()
        ? this["GetCellValue"](position, cell)
        : this["GetCellString"](cell);
      break;
    }
    case StackVar.svDoubleRef:
      missingRange = popDatabaseRange.call(this);
      break;
    case StackVar.svMissing:
      this["PopError"]();
      missing = true;
      break;
    default:
      this["PopError"]();
      this.SetError(FormulaError.IllegalParameter);
      return;
  }
  if (this.GetError() !== FormulaError.NONE) return;
  const database = popDatabaseRange.call(this);
  if (!database) return;
  if (missingRange) {
    if (!missingRange.range.equals(database.range)) {
      this.SetError(FormulaError.IllegalParameter);
      return;
    }
    missing = true;
  }

  const { aStart, aEnd } = database.range;
  let column = missing
    ? aStart.Col()
    : typeof field === "number"
      ? database.findFieldIndex(field | 0)
      : database.findFieldColumn(field);
  const query = this.mrDoc.ValidCol(column) ? database.createQueryParam(criteria) : null;
  if (!query) {
    this.SetError(FormulaError.IllegalParameter);
    return;
  }
  if (
    query.some(
      /** Finds criteria that require the realm's regex service. @param condition - Prepared criterion. @returns Whether regexp is required. */
      (condition) => !condition.query.entry.CanSearch(),
    )
  ) {
    this.SetError(FormulaError.NoValue);
    return;
  }
  if (missing) column = query[0]?.field ?? 0;
  if ((!missing || countText) && (column < aStart.Col() || column > aEnd.Col())) {
    this.SetError(FormulaError.NoValue);
    return;
  }

  const cells = new ScHorizontalCellIterator(
    this.mrDoc,
    aStart.Tab(),
    column,
    aStart.Row() + 1,
    column,
    aEnd.Row(),
  );
  const col: [number] = [0],
    row: [number] = [0];
  let result = 0;
  for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row)) {
    if (!database.matches(query, row[0])) continue;
    if (missing && !countText) {
      ++result;
      continue;
    }
    const error = cell.getFormula()?.GetErrCode() ?? FormulaError.NONE;
    if (error !== FormulaError.NONE) {
      this.SetError(error);
      break;
    }
    if (countText || cell.hasNumeric()) ++result;
  }
  this["PushDouble"](result);
}

/** @fileoverview Native matrix references and order-statistic functions. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { ScEmptyCellToken, ScMatrixToken, type ScSingleRefToken } from "../../../inc/token";
import { GetSortArray } from "./interpr3";
import type { ScInterpreter } from "./interpr4";
import { ScMatrix } from "./scmatrix";

/** Reads the element of the original matrix master for an ocMatRef token. @param reference - Real relative reference token. @param this - Active interpreter. @returns Nothing. */
export function ScMatRef(this: ScInterpreter, reference: ScSingleRefToken): void {
  const origin = reference.GetSingleRef().toAbs(this.mrDoc, this.aPos);
  const master = origin.IsValid() ? this.mrDoc.GetFormulaCell(origin) : null;
  if (!master) {
    this.SetError(FormulaError.NoRef);
    return;
  }
  if (master.IsRunning()) {
    this.SetError(FormulaError.RetryCircular);
    return;
  }
  const matrix = master.GetMatrix();
  if (!matrix) {
    this["PushCellResultToken"](origin, true);
    return;
  }
  const size = { column: 0, row: 0 };
  matrix.GetDimensions(size);
  const column = this.aPos.Col() - origin.Col(),
    row = this.aPos.Row() - origin.Row();
  if ((column >= size.column && size.column !== 1) || (row >= size.row && size.row !== 1)) {
    this.SetError(FormulaError.NotAvailable);
    return;
  }
  const value = matrix.Get(column, row);
  try {
    if (!ScMatrix.IsNonValueType(value.nType)) this["PushDouble"](value.fVal);
    else if (ScMatrix.IsEmptyPathType(value.nType)) {
      this["nRetFmtType"] = SvNumFormatType.LOGICAL;
      this["PushDouble"](0);
    } else if (ScMatrix.IsEmptyType(value.nType))
      this["PushWithoutError"](new ScEmptyCellToken(false, true));
    else this["PushString"](text(value.GetString().getString()));
  } finally {
    value.dispose();
  }
}
/** Runs the native sorted-bin FREQUENCY scan, returning values in the original bin order. @param count - Operand count. @param this - Active interpreter. @returns Nothing. */
export function ScFrequency(this: ScInterpreter, count: number): void {
  if (count !== 2) {
    this.SetError(count < 2 ? FormulaError.ParameterExpected : FormulaError.IllegalParameter);
    return;
  }
  const bins = GetSortArray.call(this);
  if (this.GetError() !== FormulaError.NONE) return;
  const values = GetSortArray.call(this);
  if (this.GetError() !== FormulaError.NONE) return;
  const matrix = new ScMatrix(1, bins.length + 1);
  if (!matrix.ValidColRow(0, bins.length)) {
    this.SetError(FormulaError.IllegalArgument);
    return;
  }
  let index = 0;
  for (const bin of bins) {
    const first = index;
    let item = values[index];
    while (item && item.value <= bin.value) {
      index++;
      item = values[index];
    }
    matrix.PutDouble(index - first, 0, bin.index);
  }
  matrix.PutDouble(values.length - index, 0, bins.length);
  this["PushWithoutError"](new ScMatrixToken(matrix));
}

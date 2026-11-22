/** @fileoverview The original ScInterpreter automatic label data-area expansion. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScComplexRefData } from "../../../inc/refdata";
import { ScDoubleRefToken } from "../../../inc/token";
import type { ScInterpreter } from "./interpr4";

/** Expands an automatic label to its connected data area, inside the compiler's axis bounds. @param this - Interpreter. @param token - Bounds from the compiler. @returns Nothing. */
export function ScColRowNameAuto(this: ScInterpreter, token: ScDoubleRefToken): void {
  const doc = this.mrDoc,
    origin = this["aPos"];
  const ref = new ScComplexRefData(token.GetDoubleRef());
  const range = ref.toAbs(doc, origin);
  if (!doc.GetSheetLimits().ValidRange(range)) {
    this.SetError(FormulaError.NoRef);
    return;
  }

  const { aStart, aEnd } = range;
  const lastCol: [number] = [aStart.Col()],
    lastRow: [number] = [aStart.Row()];
  doc.GetDataArea(aStart.Tab(), [aStart.Col()], [aStart.Row()], lastCol, lastRow, true, false);
  if (ref.Ref1.IsColRel()) {
    aEnd.SetCol(aStart.Col());
    aEnd.SetRow(Math.min(lastRow[0], aEnd.Row()));
    if (
      origin.Col() === aStart.Col() &&
      origin.Row() >= aStart.Row() &&
      origin.Row() <= aEnd.Row()
    ) {
      if (origin.Row() === aStart.Row()) aStart.SetRow(Math.min(aStart.Row() + 1, doc.MaxRow()));
      else aEnd.SetRow(origin.Row() - 1);
    }
  } else {
    aEnd.SetRow(aStart.Row());
    aEnd.SetCol(Math.min(lastCol[0], aEnd.Col()));
    if (
      origin.Row() === aStart.Row() &&
      origin.Col() >= aStart.Col() &&
      origin.Col() <= aEnd.Col()
    ) {
      if (origin.Col() === aStart.Col()) aStart.SetCol(Math.min(aStart.Col() + 1, doc.MaxCol()));
      else aEnd.SetCol(origin.Col() - 1);
    }
  }
  ref.SetRange(doc.GetSheetLimits(), range, origin);
  this["PushWithoutError"](new ScDoubleRefToken(doc.GetSheetLimits(), ref));
}

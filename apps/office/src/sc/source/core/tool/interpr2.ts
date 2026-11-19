/** @fileoverview Original dynamic range operator from the Calc reference interpreter. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { extendRangeReference } from "../../../inc/token";
import type { ScInterpreter } from "./interpr4";

/** Consumes two stack tokens and pushes the original joined reference. @param this - Active interpreter. @returns Nothing. */
export function ScRangeFunc(this: ScInterpreter): void {
  const right = this["pStack"].pop();
  const left = this["pStack"].pop();
  const range =
    this.GetError() === FormulaError.NONE &&
    left &&
    right &&
    extendRangeReference(this.mrDoc.GetSheetLimits(), left, right, this.aPos, false);
  if (range) this["PushWithoutError"](range);
  else this.SetError(FormulaError.IllegalArgument);
}

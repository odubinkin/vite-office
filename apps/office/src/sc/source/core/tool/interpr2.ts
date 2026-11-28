/** @fileoverview Original dynamic range operator from the Calc reference interpreter. */
import { OpCode } from "../../../../formula/inc/opcode";
import { FormulaByteToken, type FormulaToken } from "../../../../formula/inc/token";
import { approxFloor } from "../../../../sal/inc/rtl/math";
import { SAL_MAX_INT32, SAL_MIN_INT32 } from "../../../../sal/inc/types";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { Date } from "../../../../tools/source/datetime/tdate";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScRange } from "../../../inc/address";
import { ScComplexRefData, ScSingleRefData } from "../../../inc/refdata";
import { ScDoubleRefToken, ScSingleRefToken, extendRangeReference } from "../../../inc/token";
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

/** Intersects two single or double references using their absolute native endpoints. @param this - Active interpreter. */
export function ScIntersect(this: ScInterpreter): void {
  const right = this["pStack"].pop();
  const left = this["pStack"].pop();
  if (
    this.GetError() !== FormulaError.NONE ||
    !(left instanceof ScSingleRefToken || left instanceof ScDoubleRefToken) ||
    !(right instanceof ScSingleRefToken || right instanceof ScDoubleRefToken)
  ) {
    this.SetError(FormulaError.IllegalArgument);
    return;
  }
  /** Resolves a represented reference operand. @param token - Single or double reference. @returns Native bounds. */
  const resolve = (token: ScSingleRefToken | ScDoubleRefToken): ScRange =>
    token instanceof ScDoubleRefToken
      ? token.GetDoubleRef().toAbs(this.mrDoc, this.aPos)
      : new ScRange(token.GetSingleRef().toAbs(this.mrDoc, this.aPos));
  const intersection = resolve(left).Intersection(resolve(right));
  const limits = this.mrDoc.GetSheetLimits();
  if (!intersection.IsValid()) this.SetError(FormulaError.NoCode);
  else if (intersection.aStart.equals(intersection.aEnd)) {
    const reference = new ScSingleRefData();
    reference.InitAddress(intersection.aStart);
    this["PushWithoutError"](new ScSingleRefToken(limits, reference));
  } else {
    const reference = new ScComplexRefData();
    reference.InitRange(intersection);
    this["PushWithoutError"](new ScDoubleRefToken(limits, reference));
  }
}

/** Dispatches the original day-serial calendar functions. @param this - Active interpreter. @param token - Compiled opcode. @returns Whether dispatched. */
export function InterpretDateOpcode(this: ScInterpreter, token: FormulaToken): boolean {
  switch (token.GetOpCode()) {
    case OpCode.ocGetActDate:
      this["nRetFmtType"] = SvNumFormatType.DATE;
      this["PushDouble"](
        new Date(Date.SYSTEM).GetAsNormalizedDays() -
          this.mrContext.NFGetNullDate().GetAsNormalizedDays(),
      );
      return true;
    case OpCode.ocGetMonth: {
      const count = (token as FormulaByteToken).GetByte();
      if (count !== 1) {
        this.SetError(count < 1 ? FormulaError.ParameterExpected : FormulaError.IllegalParameter);
        return true;
      }
      const days = approxFloor(this["GetDouble"]());
      if (days < SAL_MIN_INT32 || days > SAL_MAX_INT32) {
        this.SetError(FormulaError.IllegalArgument);
        return true;
      }
      const date = new Date(this.mrContext.NFGetNullDate());
      date.AddDays(days);
      this["PushDouble"](date.GetMonth());
      return true;
    }
    default:
      return false;
  }
}

/** @fileoverview Native Calc RPN reference iteration used by subtotal invalidation. */
import type { FormulaToken } from "../../../../formula/inc/token";
import { ScAddress, type ScRange, ValidAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import {
  ScDoubleRefToken,
  ScExternalDoubleRefToken,
  ScExternalSingleRefToken,
  ScSingleRefToken,
} from "../../../inc/token";
import type { ScFormulaCell } from "./formulacell";

/** Iterates the actual reference operands of a compiled formula. */
export class ScDetectiveRefIter {
  private readonly aPos: ScAddress;
  private readonly maIter: Iterator<FormulaToken>;

  /** Captures the source formula code and its current position. @param mrDoc - Native reference limits. @param cell - Source formula. */
  constructor(
    private readonly mrDoc: ScDocument,
    cell: ScFormulaCell,
  ) {
    this.aPos = new ScAddress(cell.aPos);
    this.maIter = cell.GetCode().RPNTokens()[Symbol.iterator]();
  }

  /** Reads the next valid single- or double-reference range. @param range - Actual output range. @returns Whether an operand remained. */
  GetNextRef(range: ScRange): boolean {
    for (let entry = this.maIter.next(); !entry.done; entry = this.maIter.next()) {
      const token = entry.value;
      if (token instanceof ScSingleRefToken || token instanceof ScExternalSingleRefToken) {
        const position = token.GetSingleRef().toAbs(this.mrDoc, this.aPos);
        if (!ValidAddress(position, this.mrDoc.MaxCol(), this.mrDoc.MaxRow())) continue;
        range.assign(position);
        return true;
      }
      if (token instanceof ScDoubleRefToken || token instanceof ScExternalDoubleRefToken) {
        const reference = token.GetDoubleRef();
        const start = reference.Ref1.toAbs(this.mrDoc, this.aPos);
        const end = reference.Ref2.toAbs(this.mrDoc, this.aPos);
        if (
          !ValidAddress(start, this.mrDoc.MaxCol(), this.mrDoc.MaxRow()) ||
          !ValidAddress(end, this.mrDoc.MaxCol(), this.mrDoc.MaxRow())
        )
          continue;
        range.aStart.assign(start);
        range.aEnd.assign(end);
        return true;
      }
    }
    return false;
  }
}

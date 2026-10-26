/** @fileoverview Original ScTable formula-cell adoption delegates to the existing column owner. */
import type { ScFormulaCell } from "../../../inc/formulacell";
import { ConvertToGroupListening } from "../../../inc/types";
import type { ScTable } from "./table";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import type { ScAddress } from "../../../inc/address";
import type { ScColumn } from "../../../inc/column";
import type { Grammar } from "../../../../formula/inc/grammar";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";

/** Adopts compiled formula content through the actual column. @param col - Column. @param row - Row. @param cell - Matching compiled owner. @returns Adopted cell or null.  @param this - Original native owner shared by its implementation fragments. */
export function SetFormulaCell(
  this: ScTable,
  col: number,
  row: number,
  cell: ScFormulaCell,
): ScFormulaCell | null {
  if (!this.GetDoc().ValidColRow(col, row)) {
    cell.Dispose();
    return null;
  }
  return this.CreateColumnIfNotExists(col).SetFormulaCell(row, cell, ConvertToGroupListening);
}

/** Reads the native formula error with empty default. @param position - Address. @returns Error.  @param this - Original native owner shared by its implementation fragments. */
export function GetErrCode(this: ScTable, position: ScAddress): FormulaError {
  return this.GetDoc().ValidColRow(position.Col(), position.Row()) &&
    position.Col() < this["aCol"].length
    ? (this["aCol"][position.Col()] as ScColumn).GetErrCode(position.Row())
    : FormulaError.NONE;
}

/** Borrows a formula cell without allocating storage. @param col - Column. @param row - Row. @returns Cell or null.  @param this - Original native sheet owner. */
export function GetFormulaCell(this: ScTable, col: number, row: number): ScFormulaCell | null {
  return this.GetDoc().ValidColRow(col, row) && col < this["aCol"].length
    ? (this["aCol"][col] as ScColumn).GetFormulaCell(row)
    : null;
}

/** Writes a formula at valid coordinates through the actual column. @param col - Column. @param row - Row. @param source - Formula. @param grammar - ODFF grammar. @returns Nothing.  @param this - Original native sheet owner. */
export function SetFormula(
  this: ScTable,
  col: number,
  row: number,
  source: OUStringConstReference,
  grammar: Grammar,
): void {
  if (this.GetDoc().ValidColRow(col, row))
    this.CreateColumnIfNotExists(col).SetFormula(row, source, grammar);
}

/** Marks native default-context formula state without per-cell calculation. @param context - Default dirty context. @returns Nothing.  @param this - Original sheet owner. */
export function SetAllFormulasDirty(this: ScTable, context: SetFormulaDirtyContext): void {
  if (context.mbClearTabDeletedFlag)
    throw new Error("Deleted-sheet flag clearing is not implemented");
  const old = this.GetDoc().GetAutoCalc();
  this.GetDoc().SetAutoCalc(false);
  try {
    for (const col of this["aCol"]) col.SetAllFormulasDirty(context);
  } finally {
    this.GetDoc().SetAutoCalc(old);
  }
}

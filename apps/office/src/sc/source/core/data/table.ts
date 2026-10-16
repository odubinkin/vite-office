/** @fileoverview ScTable scalar/numeric-formula cell operations with lazy contiguous columns. Full formatting,reference and dependency services remain unsupported. */
import type { Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { ScAddress } from "../../../inc/address";
import { ScColumn } from "../../../inc/column";
import { CellType } from "../../../inc/global";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { ScDocument } from "../../../inc/document";

/** Sheet owner for the supported scalar document operations. */
export class ScTable {
  private readonly aCol: ScColumn[] = [];
  private readonly aName: OUString;
  /** Stores the native sheet identity without constructing unrelated services. @param rDocument - Owner. @param nTab - Sheet position. @param name - Sheet name. @returns Sheet. */
  constructor(
    private readonly rDocument: ScDocument,
    private nTab: number,
    name: OUStringConstReference,
  ) {
    this.aName = new OUString(name);
  }
  /** Borrows the existing sheet name. @returns Native Unicode value. */
  GetName(): OUStringConstReference {
    return this.aName;
  }
  /** Updates sheet and existing column coordinates after sheet insertion. @param tab - New position. @returns Nothing. */
  SetTabNo(tab: number): void {
    this.nTab = tab;
    for (const col of this.aCol) col.SetTabNo(tab);
  }
  /** Reports how many columns have actually been allocated. @returns Count. */
  GetAllocatedColumnsCount(): number {
    return this.aCol.length;
  }
  /** Allocates each preceding column,retaining native contiguous ownership. @param col - Valid column. @returns Column owner. */
  CreateColumnIfNotExists(col: number): ScColumn {
    while (this.aCol.length <= col) {
      const index = this.aCol.length,
        column = new ScColumn(this.rDocument);
      column.Init(index, this.nTab);
      this.aCol.push(column);
    }
    return this.aCol[col] as ScColumn;
  }
  /** Writes a formula at valid coordinates through the actual column. @param col - Column. @param row - Row. @param source - Formula. @param grammar - ODFF grammar. @returns Nothing. */
  SetFormula(col: number, row: number, source: OUStringConstReference, grammar: Grammar): void {
    if (this.rDocument.ValidColRow(col, row))
      this.CreateColumnIfNotExists(col).SetFormula(row, source, grammar);
  }
  /** Borrows a formula cell without allocating storage. @param col - Column. @param row - Row. @returns Cell or null. */
  GetFormulaCell(col: number, row: number): ScFormulaCell | null {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetFormulaCell(row)
      : null;
  }
  /** Reads the native formula error with empty default. @param position - Address. @returns Error. */
  GetErrCode(position: ScAddress): FormulaError {
    return this.rDocument.ValidColRow(position.Col(), position.Row()) &&
      position.Col() < this.aCol.length
      ? (this.aCol[position.Col()] as ScColumn).GetErrCode(position.Row())
      : FormulaError.NONE;
  }
  /** Writes numeric content only at valid coordinates. @param col - Column. @param row - Row. @param value - Number. @returns Nothing. */
  SetValue(col: number, row: number, value: number): void {
    if (this.rDocument.ValidColRow(col, row))
      this.CreateColumnIfNotExists(col).SetValue(row, value);
  }
  /** Writes an already shared literal string. @param col - Column. @param row - Row. @param value - Actual shared value. @returns Nothing. */
  SetRawString(col: number, row: number, value: SharedStringConstReference): void {
    if (this.rDocument.ValidColRow(col, row))
      this.CreateColumnIfNotExists(col).SetRawString(row, value);
  }
  /** Clears only an existing column;clearing an empty region does not allocate it. @param col - Column. @param row - Row. @returns Nothing. */
  SetEmptyCell(col: number, row: number): void {
    if (this.rDocument.ValidColRow(col, row) && col < this.aCol.length)
      (this.aCol[col] as ScColumn).Delete(row);
  }
  /** Reads numeric content with native invalid/unallocated zero result. @param col - Column. @param row - Row. @returns Value. */
  GetValue(col: number, row: number): number {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetValue(row)
      : 0;
  }
  /** Reads native scalar type with empty default. @param col - Column. @param row - Row. @returns Type. */
  GetCellType(col: number, row: number): CellType {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetCellType(row)
      : CellType.CELLTYPE_NONE;
  }
  /** Returns a copied shared string with native invalid/unallocated default. @param col - Column. @param row - Row. @returns Shared text. */
  GetSharedString(col: number, row: number): SharedString {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetSharedString(row)
      : new SharedString();
  }
}

/** @fileoverview Native Markdown table callback cursor from sw/source/filter/md/mdtab.cxx. */
import type { SwTable } from "../../core/table/swtable";
/** One native table and callback row/column counters, initially -1. */
export class MDTable {
  private table: SwTable | undefined;
  private row = -1;
  private column = -1;
  /** Stores the actual document-owned table. @param table - Native table. @returns Nothing. */
  public SetTable(table: SwTable): void {
    this.table = table;
  }
  /** Reads the actual table. @returns Native owner. */
  public GetTable(): SwTable {
    if (this.table === undefined) throw new Error("Markdown table has not been installed.");
    return this.table;
  }
  /** Reads the current row. @returns Row. */
  public GetCurRow(): number {
    return this.row;
  }
  /** Reads the current column. @returns Column. */
  public GetCurCol(): number {
    return this.column;
  }
  /** Advances row and resets column. @returns Nothing. */
  public IncCurRow(): void {
    this.row++;
    this.column = -1;
  }
  /** Advances column. @returns Nothing. */
  public IncCurCol(): void {
    this.column++;
  }
}

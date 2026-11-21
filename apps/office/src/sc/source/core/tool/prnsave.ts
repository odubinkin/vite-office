/** @fileoverview Calc print range snapshots from the native prnsave owner. */
import type { ScRange } from "../../../inc/address";

/** The original print area and repeat-title state of one sheet. */
export class ScPrintSaverTab {
  ranges: readonly ScRange[] = [];
  entire = false;
  columns: ScRange | undefined;
  rows: ScRange | undefined;

  /** Takes ownership of the copied area array. @param ranges - Actual print areas. @param entire - Whole-sheet flag. @returns Nothing. */
  SetAreas(ranges: readonly ScRange[], entire: boolean): void {
    this.ranges = ranges;
    this.entire = entire;
  }

  /** Stores the copied repeat title ranges. @param columns - Repeated columns. @param rows - Repeated rows. @returns Nothing. */
  SetRepeat(columns: ScRange | undefined, rows: ScRange | undefined): void {
    this.columns = columns;
    this.rows = rows;
  }
}

/** Workbook-wide snapshot of native print areas. */
export class ScPrintRangeSaver {
  private readonly sheets: ScPrintSaverTab[];

  /** Allocates one entry for each original sheet index. @param count - Sheet count. @returns Snapshot. */
  constructor(count: number) {
    this.sheets = Array.from({ length: count }, () => new ScPrintSaverTab());
  }

  /** Returns the number of captured sheet indexes. @returns Original sheet count. */
  GetTabCount(): number {
    return this.sheets.length;
  }

  /** Borrows the entry for a known sheet index. @param tab - Sheet index. @returns Native sheet snapshot. */
  GetTabData(tab: number): ScPrintSaverTab {
    return this.sheets[tab] as ScPrintSaverTab;
  }
}

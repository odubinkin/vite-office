/** @fileoverview Immutable ScSheetLimits from pinned sc/inc/sheetlimits.hxx; JavaScript ownership retains its document-independent lifetime. */
import {
  MAXCOL,
  MAXCOL_STRING,
  MAXCOL_JUMBO_STRING,
  ValidCol,
  ValidRow,
  ValidColRow,
  ValidColRowTab,
  ValidRange,
  ValidAddress,
  SanitizeCol,
  SanitizeRow,
} from "./address";
import type { ScAddress, ScRange } from "./address";
import type { SCCOL, SCROW, SCTAB } from "./types";

/** Original immutable maximum coordinates, independent of document lifetime. */
export class ScSheetLimits {
  public readonly mnMaxCol: SCCOL;
  public readonly mnMaxRow: SCROW;

  /** Stores explicit native coordinate limits without sanitizing them. @param maxCol - Column maximum. @param maxRow - Row maximum. @returns New limits. */
  public constructor(maxCol: SCCOL, maxRow: SCROW) {
    this.mnMaxCol = (maxCol << 16) >> 16;
    this.mnMaxRow = maxRow | 0;
  }
  /** Checks the column against this owner. @param col - Coordinate. @returns Whether valid. */
  public ValidCol(col: SCCOL): boolean {
    return ValidCol(col, this.mnMaxCol);
  }
  /** Checks the row against this owner. @param row - Coordinate. @returns Whether valid. */
  public ValidRow(row: SCROW): boolean {
    return ValidRow(row, this.mnMaxRow);
  }
  /** Checks both coordinates. @param col - Column. @param row - Row. @returns Whether valid. */
  public ValidColRow(col: SCCOL, row: SCROW): boolean {
    return ValidColRow(col, row, this.mnMaxCol, this.mnMaxRow);
  }
  /** Checks coordinates and the global sheet bound. @param col - Column. @param row - Row. @param tab - Sheet. @returns Whether valid. */
  public ValidColRowTab(col: SCCOL, row: SCROW, tab: SCTAB): boolean {
    return ValidColRowTab(col, row, tab, this.mnMaxCol, this.mnMaxRow);
  }
  /** Checks both supplied endpoints without reordering them. @param range - Range. @returns Whether valid. */
  public ValidRange(range: ScRange): boolean {
    return ValidRange(range, this.mnMaxCol, this.mnMaxRow);
  }
  /** Checks all address axes. @param address - Address. @returns Whether valid. */
  public ValidAddress(address: ScAddress): boolean {
    return ValidAddress(address, this.mnMaxCol, this.mnMaxRow);
  }
  /** Clamps a column through the existing helper. @param col - Coordinate. @returns Sanitized coordinate. */
  public SanitizeCol(col: SCCOL): SCCOL {
    return SanitizeCol(col, this.mnMaxCol);
  }
  /** Clamps a row through the existing helper. @param row - Coordinate. @returns Sanitized coordinate. */
  public SanitizeRow(row: SCROW): SCROW {
    return SanitizeRow(row, this.mnMaxRow);
  }
  /** Reads maximum row. @returns Maximum row. */
  public MaxRow(): SCROW {
    return this.mnMaxRow;
  }
  /** Reads maximum column. @returns Maximum column. */
  public MaxCol(): SCCOL {
    return this.mnMaxCol;
  }
  /** Returns the inclusive row capacity. @returns Row count. */
  public GetMaxRowCount(): SCROW {
    return (this.mnMaxRow + 1) | 0;
  }
  /** Returns the inclusive capacity with native SCCOL narrowing. @returns Column count. */
  public GetMaxColCount(): SCCOL {
    return ((this.mnMaxCol + 1) << 16) >> 16;
  }
  /** Preserves the native standard/jumbo string choice even for custom limits. @returns Maximum-column label. */
  public MaxColAsString(): string {
    return this.mnMaxCol === MAXCOL ? MAXCOL_STRING : MAXCOL_JUMBO_STRING;
  }
}

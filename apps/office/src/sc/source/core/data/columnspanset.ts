/** @fileoverview Original RowSpan and ColRowSpan value constructors from columnspanset.cxx. */
import { ScRange } from "../../../inc/address";
import type { SCROW, SCCOLROW } from "../../../inc/types";

/** Original inclusive row endpoint value. */
export class RowSpan {
  /** Initializes both original signed32 fields. @param row1 - First row. @param row2 - Last row. @returns Value. */
  public constructor(
    public mnRow1: SCROW,
    public mnRow2: SCROW,
  ) {
    this.mnRow1 |= 0;
    this.mnRow2 |= 0;
  }
}
/** Original inclusive column-or-row endpoint value. */
export class ColRowSpan {
  /** Initializes both original signed32 fields. @param start - First position. @param end - Last position. @returns Value. */
  public constructor(
    public mnStart: SCCOLROW,
    public mnEnd: SCCOLROW,
  ) {
    this.mnStart |= 0;
    this.mnEnd |= 0;
  }
}

/** Consumed original ColumnSpanSet::ColumnAction contract. */
export interface ColumnAction {
  /** Starts one actual allocated native column. @param column - Column owner. @returns Nothing. */
  startColumn(column: import("../../../inc/column").ScColumn): void;
  /** Executes the original inclusive row span. @param first - First row. @param last - Last row. @param value - Native span flag. @returns Nothing. */
  execute(first: number, last: number, value: boolean): void;
}
/** Original optimized single-range column span owner. */
export class RangeColumnSpanSet {
  private readonly range: import("../../../inc/address").ScRange;
  /** Copies the actual range value. @param range - Source range. @returns Span owner. */
  constructor(range: import("../../../inc/address").ScRange) {
    this.range = new ScRange(range);
  }
  /** Executes original sheet/allocated-column order without expanding sparse rows. @param doc - Document. @param action - Native column action. @returns Nothing. */
  executeColumnAction(doc: import("../../../inc/document").ScDocument, action: ColumnAction): void {
    for (let tab = this.range.aStart.Tab(); tab <= this.range.aEnd.Tab(); tab++) {
      const table = doc.FetchTable(tab);
      if (!table) continue;
      const end = table.ClampToAllocatedColumns(this.range.aEnd.Col());
      for (let col = this.range.aStart.Col(); col <= end; col++) {
        if (!doc.ValidCol(col)) break;
        action.startColumn(table.CreateColumnIfNotExists(col));
        action.execute(this.range.aStart.Row(), this.range.aEnd.Row(), true);
      }
    }
  }
}

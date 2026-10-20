/** @fileoverview Consumed original FilterData column visibility ownership over actual ScFlatBoolColSegments;filtered rows,objects and alternate-view synchronization remain unported. */
import { ScFlatBoolColSegments, type ScFlatBoolColRangeData } from "../../../inc/segmenttree";
import type { ScTable } from "../../../inc/table";
/** Original column-hidden subset keeps its source owner and segmented storage. */
export class FilterData {
  readonly mpHiddenCols: ScFlatBoolColSegments;
  /** Borrows the actual table and creates the original all-visible column domain. @param mrTable - Actual sheet. @returns Filter data. */
  constructor(private readonly mrTable: ScTable) {
    this.mpHiddenCols = new ScFlatBoolColSegments(mrTable.GetDoc().MaxCol());
  }
  /** Original invalid-column true result retains output slots;valid segmented owners cover the entire validated domain. @param column - Column. @param first - Optional first-column output. @param last - Optional last-column output. @returns Hidden flag. */
  colHidden(column: number, first?: [number], last?: [number]): boolean {
    if (!this.mrTable.GetDoc().ValidCol(column)) return true;
    const data: ScFlatBoolColRangeData = { mnCol1: 0, mnCol2: 0, mbValue: false };
    this.mpHiddenCols.getRangeData(column, data);
    if (first) first[0] = data.mnCol1;
    if (last) last[0] = data.mnCol2;
    return data.mbValue;
  }
  /** Original setTrue/setFalse dispatch;drawing callbacks have no represented objects in this slice. @param first - First column. @param last - Last column. @param hidden - Requested visibility. @returns Whether changed. */
  setColHidden(first: number, last: number, hidden: boolean): boolean {
    return hidden
      ? this.mpHiddenCols.setTrue(first, last)
      : this.mpHiddenCols.setFalse(first, last);
  }
  /** Original hidden-run copy through the receiving real table. Valid ordered column domain is the source precondition. @param source - Actual source filter data. @param first - First column. @param last - Last column. @returns Nothing. */
  copyColHidden(source: FilterData, first: number, last: number): void {
    for (let column = first; column <= last;) {
      const end: [number] = [-1],
        hidden = source.colHidden(column, undefined, end);
      if (end[0] > last) end[0] = last;
      this.mrTable.SetColHidden(column, end[0], hidden);
      column = end[0] + 1;
    }
  }
}

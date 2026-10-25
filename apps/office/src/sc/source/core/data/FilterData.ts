/** @fileoverview Consumed original FilterData hidden/filtered row and hidden-column ownership over native compressed segments;objects and alternate-view synchronization remain unported. */
import {
  ScFlatBoolRowSegments,
  type ScFlatBoolRowRangeData,
  ScFlatBoolColSegments,
  type ScFlatBoolColRangeData,
} from "../../../inc/segmenttree";
import type { ScTable } from "../../../inc/table";
/** Original column-hidden subset keeps its source owner and segmented storage. */
export class FilterData {
  readonly mpHiddenRows: ScFlatBoolRowSegments;
  readonly mpFilteredRows: ScFlatBoolRowSegments;
  readonly mpHiddenCols: ScFlatBoolColSegments;
  /** Borrows the actual table and creates the original all-visible column domain. @param mrTable - Actual sheet. @returns Filter data. */
  constructor(private readonly mrTable: ScTable) {
    this.mpHiddenRows = new ScFlatBoolRowSegments(mrTable.GetDoc().MaxRow());
    this.mpFilteredRows = new ScFlatBoolRowSegments(mrTable.GetDoc().MaxRow());
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
  /** Original invalid hidden-row query returns true and publishes the requested row;initialized valid owners cover the entire domain. @param row - Row. @param first - Span start output. @param last - Span end output. @returns Hidden. */
  rowHidden(row: number, first?: [number], last?: [number]): boolean {
    if (!this.mrTable.GetDoc().ValidRow(row)) {
      if (first) first[0] = row;
      if (last) last[0] = row;
      return true;
    }
    const data: ScFlatBoolRowRangeData = { mnRow1: 0, mnRow2: 0, mbValue: false };
    this.mpHiddenRows.getRangeData(row, data);
    if (first) first[0] = data.mnRow1;
    if (last) last[0] = data.mnRow2;
    return data.mbValue;
  }
  /** Original invalid filtered-row query returns false without touching outputs. @param row - Row. @param first - Span start output. @param last - Span end output. @returns Filtered. */
  rowFiltered(row: number, first?: [number], last?: [number]): boolean {
    if (!this.mrTable.GetDoc().ValidRow(row)) return false;
    const data: ScFlatBoolRowRangeData = { mnRow1: 0, mnRow2: 0, mbValue: false };
    this.mpFilteredRows.getRangeData(row, data);
    if (first) first[0] = data.mnRow1;
    if (last) last[0] = data.mnRow2;
    return data.mbValue;
  }
  /** Original forward filtered-span query retains rowFiltered's invalid-domain behavior. @param first - First row. @param last - Last row. @returns Any filtered row. */
  hasFilteredRows(first: number, last: number): boolean {
    for (let row = first; row <= last;) {
      const end: [number] = [row];
      if (this.rowFiltered(row, undefined, end)) return true;
      row = end[0] + 1;
    }
    return false;
  }
  /** Original backward unfiltered search uses real segments and signed SCROW maximum. @param first - First row. @param last - Last row. @returns Last unfiltered row or2147483647. */
  lastNonFilteredRow(first: number, last: number): number {
    const data: ScFlatBoolRowRangeData = { mnRow1: 0, mnRow2: 0, mbValue: false };
    for (let row = last; row >= first;) {
      if (!this.mrTable.GetDoc().ValidRow(row)) break;
      this.mpFilteredRows.getRangeData(row, data);
      if (!data.mbValue) return row;
      row = data.mnRow1 - 1;
    }
    return 2147483647;
  }
  /** Original first unfiltered row or signed SCROW maximum;initialized segments cover every valid row. @param first - First row. @param last - Last row. @returns Row or 2147483647. */
  firstNonFilteredRow(first: number, last: number): number {
    const data: ScFlatBoolRowRangeData = { mnRow1: 0, mnRow2: 0, mbValue: false };
    for (let row = first; row <= last;) {
      if (!this.mrTable.GetDoc().ValidRow(row)) break;
      this.mpFilteredRows.getRangeData(row, data);
      if (!data.mbValue) return row;
      row = data.mnRow2 + 1;
    }
    return 2147483647;
  }
  /** Original segmented nonfiltered count includes hidden rows and stops at the represented domain boundary. @param first - First row. @param last - Last row. @returns Nonfiltered row count. */
  countNonFilteredRows(first: number, last: number): number {
    let count = 0,
      row = first;
    const data: ScFlatBoolRowRangeData = { mnRow1: 0, mnRow2: 0, mbValue: false };
    while (row <= last) {
      if (!this.mpFilteredRows.getRangeData(row, data)) break;
      if (data.mnRow2 > last) data.mnRow2 = last;
      if (!data.mbValue) count += data.mnRow2 - row + 1;
      row = data.mnRow2 + 1;
    }
    return count;
  }
  /** Original hidden-segment mutation without unrepresented object callbacks. @param first - First row. @param last - Last row. @param hidden - State. @returns Changed. */
  setRowHidden(first: number, last: number, hidden: boolean): boolean {
    return hidden
      ? this.mpHiddenRows.setTrue(first, last)
      : this.mpHiddenRows.setFalse(first, last);
  }
  /** Original filtered segments remain independent from hidden flags. @param first - First row. @param last - Last row. @param filtered - State. @returns Changed. */
  setRowFiltered(first: number, last: number, filtered: boolean): boolean {
    return filtered
      ? this.mpFilteredRows.setTrue(first, last)
      : this.mpFilteredRows.setFalse(first, last);
  }
  /** Original segmented hidden copy. @param source - Source owner. @param first - First row. @param last - Last row. @returns Nothing. */
  copyRowHidden(source: FilterData, first: number, last: number): void {
    for (let row = first; row <= last;) {
      const end: [number] = [-1],
        hidden = source.rowHidden(row, undefined, end);
      if (end[0] > last) end[0] = last;
      this.mrTable.SetRowHidden(row, end[0], hidden);
      row = end[0] + 1;
    }
  }
  /** Original segmented filtered copy. @param source - Source owner. @param first - First row. @param last - Last row. @returns Nothing. */
  copyRowFiltered(source: FilterData, first: number, last: number): void {
    for (let row = first; row <= last;) {
      const end: [number] = [-1],
        filtered = source.rowFiltered(row, undefined, end);
      if (end[0] > last) end[0] = last;
      this.setRowFiltered(row, end[0], filtered);
      row = end[0] + 1;
    }
  }
}

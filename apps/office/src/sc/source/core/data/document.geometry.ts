/** @fileoverview Original document geometry and column defaults delegated to the native sheet owner. */
import type { ScDocument } from "../../../inc/document";
import type { ScPatternAttr } from "../../../inc/patattr";
import { ScGlobal } from "../../../inc/global";

/** Original row-height dispatch. @param this - Actual owner. @param first - First row. @param last - Last row. @param tab - Sheet. @param height - UInt16 twips. @returns Nothing. */
export function SetRowHeightRange(
  this: ScDocument,
  first: number,
  last: number,
  tab: number,
  height: number,
): void {
  this.FetchTable(tab)?.SetRowHeightRange(first, last, height, 1.0, true);
}

/** Original import/raw height setter. @param this - Actual owner. @param first - First row. @param last - Last row. @param tab - Sheet. @param height - Twips. @returns Nothing. */
export function SetRowHeightOnly(
  this: ScDocument,
  first: number,
  last: number,
  tab: number,
  height: number,
): void {
  this.FetchTable(tab)?.SetRowHeightOnly(first, last, height);
}

/** Original manual flag dispatch. @param this - Actual owner. @param first - First row. @param last - Last row. @param tab - Sheet. @param manual - Flag. @returns Nothing. */
export function SetManualHeight(
  this: ScDocument,
  first: number,
  last: number,
  tab: number,
  manual: boolean,
): void {
  this.FetchTable(tab)?.SetManualHeight(first, last, manual);
}

/** Original missing-table row-height zero. @param this - Actual owner. @param row - Row. @param tab - Sheet. @param hiddenAsZero - Source default,true. @returns Twips. */
export function GetRowHeight(
  this: ScDocument,
  row: number,
  tab: number,
  hiddenAsZero = true,
): number {
  return this.FetchTable(tab)?.GetRowHeight(row, hiddenAsZero) ?? 0;
}

/** Original per-sheet minimum query. @param this - Actual owner. @param tab - Sheet. @returns Minimum twips or native standard height. */
export function GetSheetOptimalMinRowHeight(this: ScDocument, tab: number): number {
  return this.FetchTable(tab)?.GetOptimalMinRowHeight() ?? ScGlobal.nStdRowHeight;
}

/** Original missing-table hidden query retains outputs. @param this - Actual owner. @param row - Row. @param tab - Sheet. @param first - Span output. @param last - Span output. @returns Hidden. */
export function RowHidden(
  this: ScDocument,
  row: number,
  tab: number,
  first?: [number],
  last?: [number],
): boolean {
  return this.FetchTable(tab)?.RowHidden(row, first, last) ?? false;
}

/** Original missing-table filtered query retains outputs. @param this - Actual owner. @param row - Row. @param tab - Sheet. @param first - Span output. @param last - Span output. @returns Filtered. */
export function RowFiltered(
  this: ScDocument,
  row: number,
  tab: number,
  first?: [number],
  last?: [number],
): boolean {
  return this.FetchTable(tab)?.getFilterData().rowFiltered(row, first, last) ?? false;
}

/** Original hidden row dispatch. @param this - Actual owner. @param first - First row. @param last - Last row. @param tab - Sheet. @param hidden - Flag. @returns Nothing. */
export function SetRowHidden(
  this: ScDocument,
  first: number,
  last: number,
  tab: number,
  hidden: boolean,
): void {
  this.FetchTable(tab)?.SetRowHidden(first, last, hidden);
}

/** Original filtered row dispatch. @param this - Actual owner. @param first - First row. @param last - Last row. @param tab - Sheet. @param filtered - Flag. @returns Nothing. */
export function SetRowFiltered(
  this: ScDocument,
  first: number,
  last: number,
  tab: number,
  filtered: boolean,
): void {
  this.FetchTable(tab)?.getFilterData().setRowFiltered(first, last, filtered);
}

/** Original show rows dispatch. @param this - Actual owner. @param first - First row. @param last - Last row. @param tab - Sheet. @param show - Flag. @returns Nothing. */
export function ShowRows(
  this: ScDocument,
  first: number,
  last: number,
  tab: number,
  show: boolean,
): void {
  this.FetchTable(tab)?.ShowRows(first, last, show);
}

/** Original selected-table width assignment. @param this - Actual owner. @param column - Column. @param tab - Sheet. @param width - UInt16 twips. @returns Nothing. */
export function SetColWidth(this: ScDocument, column: number, tab: number, width: number): void {
  this.FetchTable(tab)?.SetColWidth(column, width);
}

/** Original width-only table dispatch. @param this - Actual owner. @param column - Column. @param tab - Sheet. @param width - UInt16 twips. @returns Nothing. */
export function SetColWidthOnly(
  this: ScDocument,
  column: number,
  tab: number,
  width: number,
): void {
  this.FetchTable(tab)?.SetColWidthOnly(column, width);
}

/** Original absent-sheet zero fallback. @param this - Actual owner. @param column - Column. @param tab - Sheet. @param hiddenAsZero - Include hidden flag,true by default. @returns Twips. */
export function GetColWidth(
  this: ScDocument,
  column: number,
  tab: number,
  hiddenAsZero = true,
): number {
  return this.FetchTable(tab)?.GetColWidth(column, hiddenAsZero) ?? 0;
}

/** Original absent-sheet false result writes the requested column into both optional span outputs. @param this - Actual owner. @param column - Column. @param tab - Sheet. @param first - Optional span start. @param last - Optional span end. @returns Hidden flag. */
export function ColHidden(
  this: ScDocument,
  column: number,
  tab: number,
  first?: [number],
  last?: [number],
): boolean {
  const table = this.FetchTable(tab);
  if (table) return table.ColHidden(column, first, last);
  if (first) first[0] = column;
  if (last) last[0] = column;
  return false;
}

/** Original column visibility assignment dispatch. @param this - Actual owner. @param first - First column. @param last - Last column. @param tab - Sheet. @param hidden - Hidden flag. @returns Nothing. */
export function SetColHidden(
  this: ScDocument,
  first: number,
  last: number,
  tab: number,
  hidden: boolean,
): void {
  this.FetchTable(tab)?.SetColHidden(first, last, hidden);
}

/** Original ShowCol dispatch preserves stored widths. @param this - Actual owner. @param column - Column. @param tab - Sheet. @param show - Show flag. @returns Nothing. */
export function ShowCol(this: ScDocument, column: number, tab: number, show: boolean): void {
  this.FetchTable(tab)?.ShowCol(column, show);
}

/** Selects the first row of the most frequent native pattern in a column. @param this - Actual owner. @param tab - Sheet. @param col - Column. @param lastRow - Inclusive export bound. @returns Row of the default pattern. */
export function GetColDefault(this: ScDocument, tab: number, col: number, lastRow: number): number {
  const column = this.FetchTable(tab)?.GetColumnData(col);
  if (!column) return 0;
  const first: [number] = [0],
    last: [number] = [0];
  const counts = new Map<ScPatternAttr, { count: number; first: number }>();
  for (let row = 0; row <= lastRow; row = last[0] + 1) {
    const pattern = column.GetPatternRange(first, last, row);
    if (!pattern || (row === 0 && last[0] >= lastRow)) return 0;
    const count = Math.min(last[0], lastRow) - row + 1;
    const previous = counts.get(pattern);
    if (previous) previous.count += count;
    else counts.set(pattern, { count, first: row });
  }
  let count = 0,
    selected = 0;
  for (const entry of counts.values())
    if (entry.count > count) {
      count = entry.count;
      selected = entry.first;
    }
  return selected;
}

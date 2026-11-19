/** @fileoverview The original document.cxx sheet visibility forwarding and document.hxx visible-tab accessors. */
import type { ScDocument } from "../../../inc/document";
import { ValidTab } from "../../../inc/address";
import type { ScTable } from "../../../inc/table";

/** View settings held by the detached document until the view is constructed. */
export interface SheetViewState {
  readonly showGrid: boolean;
  readonly cursor: readonly [column: number, row: number];
}

const defaultSheetView: SheetViewState = { showGrid: true, cursor: [0, 0] };

/** Reports the actual sheet ownership count. @param this - Native document. @returns Count. */
export function GetTableCount(this: ScDocument): number {
  return this["maTabs"].length;
}

/** Borrows an existing sheet or returns the native null result. @param this - Native document. @param tab - Native tab. @returns Sheet or null. */
export function FetchTable(this: ScDocument, tab: number): ScTable | null {
  return ValidTab(tab) ? (this["maTabs"][tab] ?? null) : null;
}

/** Reports native sheet visibility, returning false for a missing tab. @param this - Native document. @param tab - Native tab. @returns Whether the sheet is visible. */
export function IsVisible(this: ScDocument, tab: number): boolean {
  return this.FetchTable(tab)?.IsVisible() ?? false;
}

/** Updates visibility through the actual native sheet. @param this - Native document. @param tab - Native tab. @param visible - New visibility. @returns Nothing. */
export function SetVisible(this: ScDocument, tab: number, visible: boolean): void {
  this.FetchTable(tab)?.SetVisible(visible);
}

/** Reads the hint for the visible sheet used by the original view paths. @param this - Native document. @returns Native tab. */
export function GetVisibleTab(this: ScDocument): number {
  return this["nVisibleTab"];
}

/** Stores the hint for the visible sheet. @param this - Native document. @param tab - Native tab. @returns Nothing. */
export function SetVisibleTab(this: ScDocument, tab: number): void {
  this["nVisibleTab"] = tab;
}

/** Reads the sheet view setting carried with a detached document. @param this - Workbook. @param tab - Native tab. @returns Grid visibility, true by default. */
export function GetSheetShowGrid(this: ScDocument, tab: number): boolean {
  return sheetView(this, tab).showGrid;
}

/** Stores the detached sheet view without changing global Calc options. @param this - Workbook. @param tab - Native tab. @param show - Sheet grid visibility. @returns Nothing. */
export function SetSheetShowGrid(this: ScDocument, tab: number, show: boolean): void {
  const sheet = this.FetchTable(tab);
  if (!sheet) return;
  this["maSheetViews"].set(sheet, { ...sheetView(this, tab), showGrid: show });
}

/** Reads one detached sheet view or its native defaults. @param document - Workbook. @param tab - Native tab. @returns View settings. */
function sheetView(document: ScDocument, tab: number): SheetViewState {
  const sheet = document.FetchTable(tab);
  return (sheet && document["maSheetViews"].get(sheet)) || defaultSheetView;
}

/** Reads the named sheet's detached view cursor. @param document - Workbook. @param tab - Native tab. @returns Column and row. */
export function getSheetCursor(document: ScDocument, tab: number): SheetViewState["cursor"] {
  return sheetView(document, tab).cursor;
}

/** Publishes a valid cursor for the detached view and file filters. @param document - Workbook. @param tab - Native tab. @param column - Cursor column. @param row - Cursor row. @returns Nothing. */
export function setSheetCursor(
  document: ScDocument,
  tab: number,
  column: number,
  row: number,
): void {
  const sheet = document.FetchTable(tab);
  if (
    sheet &&
    Number.isInteger(column) &&
    Number.isInteger(row) &&
    document.ValidColRow(column, row)
  )
    document["maSheetViews"].set(sheet, { ...sheetView(document, tab), cursor: [column, row] });
}

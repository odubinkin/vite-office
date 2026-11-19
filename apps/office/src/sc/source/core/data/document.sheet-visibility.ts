/** @fileoverview The original document.cxx sheet visibility forwarding and document.hxx visible-tab accessors. */
import type { ScDocument } from "../../../inc/document";
import { ValidTab } from "../../../inc/address";
import type { ScTable } from "../../../inc/table";

/** View settings held by the detached document until the view is constructed. */
export interface SheetViewState {
  readonly showGrid: boolean;
  readonly selected?: boolean;
  readonly panes?: SheetPaneLayout;
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

/** Reads the optional per-sheet selected flag from a detached file view. @param document - Workbook. @param tab - Native tab. @returns Imported membership, if present. */
export function getSheetTabSelected(document: ScDocument, tab: number): boolean | undefined {
  return sheetView(document, tab).selected;
}

/** Carries the native selected flag until the view owns its sheet marks. @param document - Workbook. @param tab - Native tab. @param selected - Imported membership. @returns Nothing. */
export function setSheetTabSelected(document: ScDocument, tab: number, selected: boolean): void {
  const sheet = document.FetchTable(tab);
  if (sheet) document["maSheetViews"].set(sheet, { ...sheetView(document, tab), selected });
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

/** Native ScViewDataTable split modes. */
export enum SheetSplitMode {
  NONE,
  NORMAL,
  FIX,
}

/** Native split range order used by view settings. */
export enum SheetPane {
  TOPLEFT,
  TOPRIGHT,
  BOTTOMLEFT,
  BOTTOMRIGHT,
}

/** Detached worksheet geometry. Fixed coordinates are absolute, normal split lengths are in twips. */
export interface SheetPaneLayout {
  readonly horizontalMode: SheetSplitMode;
  readonly verticalMode: SheetSplitMode;
  readonly horizontalPosition: number;
  readonly verticalPosition: number;
  readonly activePane: SheetPane;
  readonly first: readonly [column: number, row: number];
  readonly second: readonly [column: number, row: number];
}

/** Borrows preserved sheet geometry, if the original view had a split or viewport origin. @param document - Workbook. @param tab - Native tab. @returns Per-sheet view. */
export function getSheetPaneLayout(document: ScDocument, tab: number): SheetPaneLayout | undefined {
  return sheetView(document, tab).panes;
}

/** Applies the native active-pane fallback when one axis is absent. @param pane - Requested pane. @param horizontal - Horizontal split present. @param vertical - Vertical split present. @returns View's active pane. */
export function sanitizeSheetPane(
  pane: SheetPane,
  horizontal: boolean,
  vertical: boolean,
): SheetPane {
  return ((pane & 1) !== 0 && !horizontal) || ((pane & 2) === 0 && !vertical)
    ? SheetPane.BOTTOMLEFT
    : pane;
}

/** Stores canonical sheet positions in its existing detached view record. @param document - Workbook. @param tab - Native tab. @param layout - Borrowed layout. @returns Nothing. */
export function setSheetPaneLayout(
  document: ScDocument,
  tab: number,
  layout: SheetPaneLayout,
): void {
  const sheet = document.FetchTable(tab);
  if (!sheet) return;
  document["maSheetViews"].set(sheet, {
    ...sheetView(document, tab),
    panes: {
      ...layout,
      activePane: sanitizeSheetPane(
        layout.activePane,
        layout.horizontalMode !== SheetSplitMode.NONE,
        layout.verticalMode !== SheetSplitMode.NONE,
      ),
      first: [...layout.first],
      second: [...layout.second],
    },
  });
}

/** Validates detached pane coordinates before a Worker graph is adopted. @param document - Target workbook limits. @param layout - Untrusted transfer value. @returns Valid geometry. */
export function isSheetPaneLayout(document: ScDocument, layout: SheetPaneLayout): boolean {
  const {
    horizontalMode,
    verticalMode,
    horizontalPosition,
    verticalPosition,
    activePane,
    first,
    second,
  } = layout;
  return (
    validSplit(horizontalMode, horizontalPosition, document.MaxCol()) &&
    validSplit(verticalMode, verticalPosition, document.MaxRow()) &&
    Number.isInteger(activePane) &&
    activePane >= SheetPane.TOPLEFT &&
    activePane <= SheetPane.BOTTOMRIGHT &&
    validOrigin(document, first) &&
    validOrigin(document, second)
  );
}

/** Checks the native fixed-cell and normal-twip domains. @param mode - Axis mode. @param position - Detached coordinate. @param maximum - Axis cell maximum. @returns Whether usable. */
function validSplit(mode: SheetSplitMode, position: number, maximum: number): boolean {
  if (mode === SheetSplitMode.NONE) return position === 0;
  if (!Number.isInteger(position) || position <= 0) return false;
  if (mode === SheetSplitMode.NORMAL) return position <= 0x7fffffff;
  return mode === SheetSplitMode.FIX && position <= maximum;
}

/** Checks a detached two-coordinate view origin. @param document - Workbook limits. @param origin - Origin coordinates. @returns Whether supported. */
function validOrigin(document: ScDocument, origin: SheetPaneLayout["first"]): boolean {
  return (
    Array.isArray(origin) &&
    origin.length === 2 &&
    Number.isInteger(origin[0]) &&
    Number.isInteger(origin[1]) &&
    document.ValidColRow(origin[0], origin[1])
  );
}

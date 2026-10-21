/** @fileoverview Document-bound ScViewData cursor subset. Geometry, zoom, hidden sheets, alternate sheet views, window services and persistence remain separate; no cell data is copied into this owner. */
import { ScViewOptions, ViewOption } from "../../../inc/viewopti";
import type { ScTabViewShell } from "../inc/tabvwsh";
import type { ScDocument } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ValidTab } from "../../../inc/address";
/** Native viewdata.hxx pane identities; the supported unsplit view starts bottom-left. */
export const ScSplitPos = {
  SC_SPLIT_TOPLEFT: 0,
  SC_SPLIT_TOPRIGHT: 1,
  SC_SPLIT_BOTTOMLEFT: 2,
  SC_SPLIT_BOTTOMRIGHT: 3,
  SC_SPLIT_POS_MAX_ENUM: 3,
} as const;
/** Native pane value domain; the maximum enumerator aliases bottom-right. */
export type ScSplitPos = (typeof ScSplitPos)[keyof typeof ScSplitPos];
/** Represented native per-sheet cursor fields. Physical ownership is managed by JS; no split/geometry services are claimed. */
class ScViewDataTable {
  bShowGrid = true;
  nCurX = 0;
  nCurY = 0;
  nOldCurX = 0;
  nOldCurY = 0;
  mbOldCursorValid = false;
  eWhichActive = ScSplitPos.SC_SPLIT_BOTTOMLEFT;
}
/** Native document-bound cursor/selection ownership, shared by browser view consumers. Only the declared cursor operations are ported. */
export class ScViewData {
  /** Original viewdata.hxx pixel conversion, preserving a nonzero twip extent. @param twips - Native extent. @param factor - Pixels per twip. @returns Pixels. */
  static ToPixel(twips: number, factor: number): number {
    const result = Math.trunc(twips * factor);
    return !result && twips ? 1 : result;
  }
  /** Original borrowed pView,absent in the standalone headless view-data constructor. */
  private pView: ScTabViewShell | undefined;
  /** Original native view-shell borrow. @returns Actual owner or absence for headless fixtures. */
  GetViewShell(): ScTabViewShell | undefined {
    return this.pView;
  }
  private readonly maOptions: ScViewOptions;
  private readonly maMarkData: ScMarkData;
  private readonly maTabData: (ScViewDataTable | undefined)[] = [new ScViewDataTable()];
  private mnTabNumber = 0;
  private pThisTab = this.maTabData[0] as ScViewDataTable;
  /** Uses the real document limits and native initial selected tab0. @param mrDoc - Borrowed canonical document. @returns View data. */
  constructor(private readonly mrDoc: ScDocument) {
    this.maOptions = new ScViewOptions(mrDoc.GetViewOptions());
    this.maMarkData = new ScMarkData(mrDoc.GetSheetLimits());
    this.maMarkData.SelectOneTable(0);
  }
  /** Original view-owned borrowed option copy. @returns Actual options. */
  GetOptions(): ScViewOptions {
    return this.maOptions;
  }
  /** Original SetOptions assignment;native scrollbar/graphics window notifications remain unported. @param options - New value. @returns Nothing. */
  SetOptions(options: ScViewOptions): void {
    this.maOptions.copy_assign(options);
  }
  /** Original local header option query. @returns Visible. */
  IsHeaderMode(): boolean {
    return this.maOptions.GetOption(ViewOption.HEADER);
  }
  /** Original local header assignment;does not update document options. @param visible - New state. @returns Nothing. */
  SetHeaderMode(visible: boolean): void {
    this.maOptions.SetOption(ViewOption.HEADER, visible);
  }
  /** Original current-sheet grid query. @returns Visible. */
  GetShowGrid(): boolean {
    return this.pThisTab.bShowGrid;
  }
  /** Original current-sheet grid assignment. Other selected sheets retain independent state. @param visible - New state. @returns Nothing. */
  SetShowGrid(visible: boolean): void {
    for (const tab of this.maMarkData) this.CreateTabData(tab);
    this.pThisTab.bShowGrid = visible;
  }
  /** Borrows the document rather than projecting another cell model. @returns Actual document. */
  GetDocument(): ScDocument {
    return this.mrDoc;
  }
  /** Borrows the original shared selection owner. @returns Mutable mark data. */
  GetMarkData(): ScMarkData {
    return this.maMarkData;
  }
  /** Reads the active table identity. @returns Zero-based sheet number. */
  GetTabNumber(): number {
    return this.mnTabNumber;
  }
  /** Selects a valid native tab-data slot, creating its cursor data lazily. Selection marks are changed by the calling view, not by this method. Unsupported sheet-view/geometry services are not emulated. @param nNewTab - Native tab index; invalid domain is ignored as in source. @returns Nothing. */
  SetTabNo(nNewTab: number): void {
    if (!ValidTab(nNewTab)) return;
    this.mnTabNumber = nNewTab;
    this.CreateTabData(nNewTab);
    this.pThisTab = this.maTabData[nNewTab] as ScViewDataTable;
  }
  /** Allocates only the requested cursor slot, preserving unvisited holes and prior cursor values. @param nNewTab - Valid tab index, caller precondition. @returns Nothing. */
  private CreateTabData(nNewTab: number): void {
    if (this.maTabData.length <= nNewTab) this.maTabData.length = nNewTab + 1;
    this.maTabData[nNewTab] ??= new ScViewDataTable();
  }
  /** Fetches native cursor data without allocating a slot. @param nTabIndex - Requested tab. @returns Data or null for invalid/uncreated slots. */
  private FetchTableData(nTabIndex: number): ScViewDataTable | null {
    if (!ValidTab(nTabIndex) || nTabIndex >= this.maTabData.length) return null;
    return this.maTabData[nTabIndex] ?? null;
  }
  /** Reads the native active-pane default for this unsplit view. @returns Pane identity. */
  GetActivePart(): ScSplitPos {
    return this.pThisTab.eWhichActive;
  }
  /** Reads the active sheet cursor column. @returns Zero-based column. */
  GetCurX(): number {
    return this.pThisTab.nCurX;
  }
  /** Reads the active sheet cursor row. @returns Zero-based row. */
  GetCurY(): number {
    return this.pThisTab.nCurY;
  }
  /** Assigns the native cursor field directly; caller enforces the document coordinate precondition. @param nNewCurX - Column. @returns Nothing. */
  SetCurX(nNewCurX: number): void {
    this.pThisTab.nCurX = nNewCurX;
  }
  /** Assigns the native cursor field directly; caller enforces the document coordinate precondition. @param nNewCurY - Row. @returns Nothing. */
  SetCurY(nNewCurY: number): void {
    this.pThisTab.nCurY = nNewCurY;
  }
  /** Reads a created sheet cursor or the source absent-slot sentinel. @param nTabIndex - Tab. @returns Column or -1. */
  GetCurXForTab(nTabIndex: number): number {
    return this.FetchTableData(nTabIndex)?.nCurX ?? -1;
  }
  /** Reads a created sheet cursor or the source absent-slot sentinel. @param nTabIndex - Tab. @returns Row or -1. */
  GetCurYForTab(nTabIndex: number): number {
    return this.FetchTableData(nTabIndex)?.nCurY ?? -1;
  }
  /** Updates a created sheet only, without allocating missing data. @param nNewCurX - Column. @param nTabIndex - Tab. @returns Nothing. */
  SetCurXForTab(nNewCurX: number, nTabIndex: number): void {
    const data = this.FetchTableData(nTabIndex);
    if (data) data.nCurX = nNewCurX;
  }
  /** Updates a created sheet only, without allocating missing data. @param nNewCurY - Row. @param nTabIndex - Tab. @returns Nothing. */
  SetCurYForTab(nNewCurY: number, nTabIndex: number): void {
    const data = this.FetchTableData(nTabIndex);
    if (data) data.nCurY = nNewCurY;
  }
  /** Uses the saved old column only while valid. @returns Saved or current column. */
  GetOldCurX(): number {
    return this.pThisTab.mbOldCursorValid ? this.pThisTab.nOldCurX : this.pThisTab.nCurX;
  }
  /** Uses the saved old row only while valid. @returns Saved or current row. */
  GetOldCurY(): number {
    return this.pThisTab.mbOldCursorValid ? this.pThisTab.nOldCurY : this.pThisTab.nCurY;
  }
  /** Saves both source fields and enables old-cursor fallback. @param nNewX - Column. @param nNewY - Row. @returns Nothing. */
  SetOldCursor(nNewX: number, nNewY: number): void {
    this.pThisTab.nOldCurX = nNewX;
    this.pThisTab.nOldCurY = nNewY;
    this.pThisTab.mbOldCursorValid = true;
  }
  /** Invalidates the saved old cursor without changing current coordinates. @returns Nothing. */
  ResetOldCursor(): void {
    this.pThisTab.mbOldCursorValid = false;
  }
}

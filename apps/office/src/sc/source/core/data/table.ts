/** @fileoverview ScTable scalar/local-reference,cell-attribute and standard row-height operations over lazy contiguous columns. Device layout and full sheet services remain unported. */
import type { ScItemPoolCache } from "../../../inc/poolcach";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import type { ScLineFlags } from "../../../inc/attarray";
import type { SvxBoxItem, SvxBoxInfoItem } from "../../../../editeng/source/items/frmitems";
import { ScMultiSelIter } from "../../../inc/markmulti";
import { ScRefCellValue } from "../../../inc/cellvalue";
import type { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import type { SvtListener } from "../../../../svl/source/notify/listener";
import type { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import type { SfxHint } from "../../../../svl/inc/hint";
import type { Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { ScAddress } from "../../../inc/address";
import { ScColumn, ScColumnData } from "../../../inc/column";
import { CellType, InsertDeleteFlags } from "../../../inc/global";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import type { ScDocument } from "../../../inc/document";
import type { ScMergePatternState } from "../../../inc/attarray";
import type { ScMarkData } from "../../../inc/markdata";

import { ScFlatUInt16RowSegments, type ScFlatUInt16RowRangeData } from "../../../inc/segmenttree";
import {
  ScCompressedArray,
  ScBitMaskCompressedArray,
  type ScCompressedArrayRangeData,
} from "../../../inc/compressedarray";
import { CRFlags, ScGlobal, STD_COL_WIDTH } from "../../../inc/global";
import { ATTR_FONT_HEIGHT } from "../../../inc/scitems";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import type { RowHeightContext } from "../../../inc/rowheightcontext";
import { lcl_GetAttribHeight, supportsStandardRowHeight } from "./column2";
import { FilterData } from "../../../inc/FilterData";
import { SetOptimalHeightsToRows } from "./table1";
/** Original ColumnDataApply callable contract. */
type ColumnDataApply = (column: ScColumnData, first: number, last: number) => void;
/** Sheet owner for the supported scalar document operations. */
export class ScTable {
  /** Original const cached-script query only visits actually allocated columns. @param col - Column. @param row - Row. @returns Cached flags or NONE. */
  GetScriptType(col: number, row: number): SvtScriptType {
    return this.rDocument.ValidCol(col) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetScriptType(row)
      : SvtScriptType.NONE;
  }
  /** Original setter validates the logical column then directly accesses its existing storage. Unallocated target storage is an original caller precondition;no column is synthesized. @param col - Column. @param row - Row. @param type - Native flags. @returns Nothing. */
  SetScriptType(col: number, row: number, type: SvtScriptType): void {
    if (this.rDocument.ValidCol(col)) (this.aCol[col] as ScColumn).SetScriptType(row, type);
  }

  /** Original table2.cxx cursor delta validates coordinates before allocating its actual column. @param col - Column. @param row - Row. @param pattern - Borrowed delta. @returns Nothing. */
  ApplyPattern(col: number, row: number, pattern: ScPatternAttr): void {
    if (this.rDocument.ValidColRow(col, row))
      this.CreateColumnIfNotExists(col).ApplyPattern(row, pattern);
  }
  /** Original table2.cxx complete-pattern assignment validates native coordinates before column allocation. @param col - Column. @param row - Row. @param holder - Complete canonical pattern. @returns Nothing. */
  SetPattern(col: number, row: number, holder: CellAttributeHolder): void {
    if (this.rDocument.ValidColRow(col, row))
      this.CreateColumnIfNotExists(col).SetPattern(row, holder);
  }
  /** Native table layout direction;the constructor default matches the non-visible core-document path. */
  private bLayoutRTL = false;
  /** Original actual layout-direction query. @returns RTL flag. */
  IsLayoutRTL(): boolean {
    return this.bLayoutRTL;
  }
  /** Original table1.cxx actual flag update. @param set - RTL state. @returns Nothing. */
  SetLayoutRTL(set: boolean): void {
    this.bLayoutRTL = set;
  }
  /** Original line-style mutation visits allocated columns only. @param marks - Marks. @param line - Style or absence. @param colorOnly - Color mode. @returns Nothing. */
  ApplySelectionLineStyle(
    marks: ScMarkData,
    line: SvxBorderLine | undefined,
    colorOnly: boolean,
  ): void {
    if (colorOnly && !line) return;
    for (const column of this.aCol) column.ApplySelectionLineStyle(marks, line, colorOnly);
  }
  /** Original query clamps its final column to allocated storage before calculating right distances. @param outer - Outer accumulator. @param inner - Inner accumulator. @param flags - Shared flags. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @returns Nothing. */
  MergeBlockFrame(
    outer: SvxBoxItem,
    inner: SvxBoxInfoItem,
    flags: ScLineFlags,
    firstCol: number,
    firstRow: number,
    lastCol: number,
    lastRow: number,
  ): void {
    if (
      this.rDocument.ValidColRow(firstCol, firstRow) &&
      this.rDocument.ValidColRow(lastCol, lastRow)
    ) {
      if (firstCol > lastCol) [firstCol, lastCol] = [lastCol, firstCol];
      if (firstRow > lastRow) [firstRow, lastRow] = [lastRow, firstRow];
      lastCol = this.ClampToAllocatedColumns(lastCol);
      for (let col = firstCol; col <= lastCol; col++)
        (this.aCol[col] as ScColumn).MergeBlockFrame(
          outer,
          inner,
          flags,
          firstRow,
          lastRow,
          col === firstCol,
          lastCol - col,
        );
    }
  }
  /** Original validated block frame allocates through the real last column. @param outer - Outer lines. @param inner - Inner lines. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @returns Nothing. */
  ApplyBlockFrame(
    outer: SvxBoxItem,
    inner: SvxBoxInfoItem,
    firstCol: number,
    firstRow: number,
    lastCol: number,
    lastRow: number,
  ): void {
    if (
      this.rDocument.ValidColRow(firstCol, firstRow) &&
      this.rDocument.ValidColRow(lastCol, lastRow)
    ) {
      if (firstCol > lastCol) [firstCol, lastCol] = [lastCol, firstCol];
      if (firstRow > lastRow) [firstRow, lastRow] = [lastRow, firstRow];
      this.CreateColumnIfNotExists(lastCol);
      for (let col = firstCol; col <= lastCol; col++)
        (this.aCol[col] as ScColumn).ApplyBlockFrame(
          outer,
          inner,
          firstRow,
          lastRow,
          col === firstCol,
          lastCol - col,
        );
    }
  }
  /** Original table.hxx Apply traverses selected runs in one real column. @param marks - Marks. @param col - Column. @param apply - Mutation. @returns Nothing. */
  private Apply(marks: ScMarkData, col: number, apply: ColumnDataApply): void {
    if (marks.IsMultiMarked()) {
      const column = this.GetColumnData(col),
        iter = new ScMultiSelIter(marks.GetMultiSelData(), col);
      for (let span = iter.Next(0, 0); span[0]; span = iter.Next(0, 0))
        apply(column, span[1], span[2]);
    } else if (marks.IsMarked()) {
      const area = marks.GetMarkArea();
      if (area.aStart.Col() <= col && col <= area.aEnd.Col())
        apply(this.GetColumnData(col), area.aStart.Row(), area.aEnd.Row());
    }
  }
  /** Original minimal allocation also mutates actual equal default-column tail. @param marks - Native marks. @param apply - Mutation. @returns Nothing. */
  private ApplyWithAllocation(marks: ScMarkData, apply: ColumnDataApply): void {
    if (!marks.GetTableSelect(this.nTab) || !(marks.IsMultiMarked() || marks.IsMarked())) return;
    if (marks.GetArea().aEnd.Col() === this.rDocument.MaxCol()) {
      const last = marks.GetStartOfEqualColumns(this.rDocument.MaxCol(), this.aCol.length) - 1;
      if (last >= 0) this.CreateColumnIfNotExists(last);
      this.Apply(marks, this.rDocument.MaxCol(), apply);
    } else this.CreateColumnIfNotExists(marks.GetArea().aEnd.Col());
    for (let col = 0; col < this.aCol.length; col++) this.Apply(marks, col, apply);
  }
  /** Original table2.cxx selected cache uses native minimal column allocation and actual default-column tail. @param cache - Borrowed canonical transform. @param marks - Actual multi marks. @returns Stored change. */
  ApplySelectionCache(cache: ScItemPoolCache, marks: ScMarkData): boolean {
    const changed: [boolean] = [false];
    this.ApplyWithAllocation(
      marks,
      /** Applies the original cache to real marked attribute runs. @param column - Column owner. @param first - First row. @param last - Last row. @returns Nothing. */ (
        column,
        first,
        last,
      ) => column.ApplyCacheArea(first, last, cache, changed),
    );
    return changed[0];
  }
  /** Original selected indentation. @param marks - Marks. @param increment - Direction. @returns Nothing. */
  ChangeSelectionIndent(marks: ScMarkData, increment: boolean): void {
    this.ApplyWithAllocation(
      marks,
      /** Mutates real column attributes. @param column - Actual owner. @param first - First row. @param last - Last row. @returns Nothing. */ (
        column,
        first,
        last,
      ) => column.ChangeSelectionIndent(first, last, increment),
    );
  }
  /** Original table2.cxx DeleteArea clamps to allocated columns and never mutates the default-column tail. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @param flags - Consumed attribute-only flags. @returns Nothing. */
  DeleteArea(
    firstCol: number,
    firstRow: number,
    lastCol: number,
    lastRow: number,
    flags: InsertDeleteFlags,
  ): void {
    if (lastCol >= this.aCol.length) lastCol = this.aCol.length - 1;
    if (lastRow > this.rDocument.MaxRow()) lastRow = this.rDocument.MaxRow();
    if (
      this.rDocument.ValidColRow(firstCol, firstRow) &&
      this.rDocument.ValidColRow(lastCol, lastRow)
    )
      for (let col = firstCol; col <= lastCol; col++)
        (this.aCol[col] as ScColumn).DeleteArea(firstRow, lastRow, flags);
  }
  /** Original DeleteSelection traverses allocated columns only;no synthetic column allocation or default-tail correction. @param flags - Attribute-only flags. @param marks - Actual native marks. @returns Nothing. */
  DeleteSelection(flags: InsertDeleteFlags, marks: ScMarkData): void {
    for (const column of this.aCol) column.DeleteSelection(flags, marks);
  }
  /** Original multi-column spans clamp to allocated columns and retain sparse storage. @param state - Selection accumulator. @param marks - Actual marks. @param deep - Include inherited items. @returns Nothing. */
  MergeSelectionPattern(state: ScMergePatternState, marks: ScMarkData, deep: boolean): void {
    for (const span of marks.GetMarkedColSpans()) {
      const last = this.ClampToAllocatedColumns(span.mnEnd);
      for (let col = span.mnStart; col <= last; col++)
        (this.aCol[col] as ScColumn).MergeSelectionPattern(state, marks, deep);
    }
  }
  /** Original table2.cxx range traversal also merges the real default-column data once. @param state - Selection accumulator. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @param deep - Include inherited values. @returns Nothing. */
  MergePatternArea(
    state: ScMergePatternState,
    firstCol: number,
    firstRow: number,
    lastCol: number,
    lastRow: number,
    deep: boolean,
  ): void {
    const last = this.ClampToAllocatedColumns(lastCol);
    for (let col = firstCol; col <= last; col++)
      (this.aCol[col] as ScColumn).MergePatternArea(state, firstRow, lastRow, deep);
    if (last !== lastCol) this.aDefaultColData.MergePatternArea(state, firstRow, lastRow, deep);
  }
  /** Finds native first occupied coordinates using actual column stores. @param col - Column output. @param row - Row output. @returns Nothing. */
  GetFirstDataPos(col: [number], row: [number]): void {
    col[0] = 0;
    row[0] = this.rDocument.MaxRow() + 1;
    while (col[0] < this.aCol.length - 1 && (this.aCol[col[0]] as ScColumn).IsEmptyData()) ++col[0];
    let current = col[0];
    while (current < this.aCol.length && row[0] > 0) {
      const column = this.aCol[current] as ScColumn;
      if (!column.IsEmptyData()) row[0] = Math.min(row[0], column.GetFirstDataPos());
      ++current;
    }
  }
  /** Finds native last occupied coordinates; an unallocated empty table retains the initial empty-column coordinates without allocation. @param col - Column output. @param row - Row output. @returns Nothing. */
  GetLastDataPos(col: [number], row: [number]): void {
    col[0] = Math.max(0, this.aCol.length - 1);
    row[0] = 0;
    if (!this.aCol.length) return;
    while ((this.aCol[col[0]] as ScColumn).IsEmptyData() && col[0] > 0) --col[0];
    let current = col[0];
    while (current >= 0 && row[0] < this.rDocument.MaxRow())
      row[0] = Math.max(row[0], (this.aCol[current--] as ScColumn).GetLastDataPos());
  }
  private readonly aCol: ScColumn[] = [];
  private readonly aDefaultColData: ScColumnData;
  private readonly aName: OUString;
  private readonly mpColWidth: ScCompressedArray;
  private readonly mpColFlags: ScBitMaskCompressedArray;
  private readonly maFilterData: FilterData;
  private readonly mpRowHeights: ScFlatUInt16RowSegments;
  private readonly pRowFlags: ScBitMaskCompressedArray;
  private mnOptimalMinRowHeight = 0;
  /** Stores the native sheet identity without constructing unrelated services. @param rDocument - Owner. @param nTab - Sheet position. @param name - Sheet name. @returns Sheet. */
  constructor(
    private readonly rDocument: ScDocument,
    private nTab: number,
    name: OUStringConstReference,
  ) {
    this.aName = new OUString(name);
    this.mpColWidth = new ScCompressedArray(rDocument.MaxCol() + 1, STD_COL_WIDTH, {
      access: 16,
      value: 16,
    });
    this.mpColFlags = new ScBitMaskCompressedArray(rDocument.MaxCol() + 1, CRFlags.NONE, 16);
    this.maFilterData = new FilterData(this);
    this.mpRowHeights = new ScFlatUInt16RowSegments(
      rDocument.MaxRow(),
      this.GetOptimalMinRowHeight(),
    );
    this.pRowFlags = new ScBitMaskCompressedArray(rDocument.MaxRow(), CRFlags.NONE, 32);
    this.aDefaultColData = new ScColumnData(rDocument);
    this.aDefaultColData.Init(-1, nTab);
  }
  /** Borrows the original document owner. @returns Actual document. */
  GetDoc(): ScDocument {
    return this.rDocument;
  }
  /** Original UInt16 column-width setter retains zero-to-standard fallback;page-break services remain outside this slice. @param column - Column. @param width - Native unsigned16 twips. @returns Nothing. */
  SetColWidth(column: number, width: number): void {
    if (this.rDocument.ValidCol(column)) {
      width = width & 0xffff || STD_COL_WIDTH;
      if (width !== this.mpColWidth.GetValue(column)) this.mpColWidth.SetValue(column, width);
    }
  }
  /** Original width-only setter shares the represented width mutation without page-break services. @param column - Column. @param width - UInt16 twips. @returns Nothing. */
  SetColWidthOnly(column: number, width: number): void {
    this.SetColWidth(column, width);
  }
  /** Original invalid-column standard fallback and optional hidden-as-zero query. @param column - Column. @param hiddenAsZero - Native default,true. @returns Twips. */
  GetColWidth(column: number, hiddenAsZero = true): number {
    if (!this.rDocument.ValidCol(column)) return STD_COL_WIDTH;
    return hiddenAsZero && this.ColHidden(column) ? 0 : this.mpColWidth.GetValue(column);
  }
  /** Borrows actual source compressed width runs for the browser projection without another geometry model. @param column - Valid source column. @returns Original range data;its unused terminal sentinel may exceed MaxCol. */
  GetColWidthRange(column: number): ScCompressedArrayRangeData {
    return this.mpColWidth.GetRangeData(column);
  }
  /** Delegates original table5.cxx hidden query to its real FilterData owner. @param column - Column. @param first - Optional span start. @param last - Optional span end. @returns Hidden. */
  ColHidden(column: number, first?: [number], last?: [number]): boolean {
    return this.maFilterData.colHidden(column, first, last);
  }
  /** Assigns original segmented column visibility. @param first - First column. @param last - Last column. @param hidden - Hidden flag. @returns Nothing. */
  SetColHidden(first: number, last: number, hidden: boolean): void {
    this.maFilterData.setColHidden(first, last, hidden);
  }
  /** Original ShowCol changes only visibility,retaining the stored width. @param column - Valid column. @param show - Show flag. @returns Nothing. */
  ShowCol(column: number, show: boolean): void {
    if (this.rDocument.ValidCol(column) && !this.ColHidden(column) !== show)
      this.SetColHidden(column, column, !show);
  }
  /** Consumed native geometry-only CopyToTable width/flag/hidden path;no cells or patterns are copied. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @param target - Real destination sheet. @returns Nothing. */
  CopyToTable(
    firstCol: number,
    firstRow: number,
    lastCol: number,
    lastRow: number,
    target: ScTable,
  ): void {
    if (firstRow === 0 && lastRow === this.rDocument.MaxRow()) {
      target.mpColWidth.CopyFrom(this.mpColWidth, firstCol, lastCol);
      target.mpColFlags.CopyFrom(this.mpColFlags, firstCol, lastCol);
      target.maFilterData.copyColHidden(this.maFilterData, firstCol, lastCol);
    }
    if (firstCol === 0 && lastCol === this.rDocument.MaxCol()) {
      target.CopyRowHeight(this, firstRow, lastRow, 0);
      target.pRowFlags.CopyFrom(this.pRowFlags, firstRow, lastRow);
      target.maFilterData.copyRowHidden(this.maFilterData, firstRow, lastRow);
      target.maFilterData.copyRowFiltered(this.maFilterData, firstRow, lastRow);
    }
  }
  /** Reads native per-sheet override or startup minimum; device-dependent global initialization remains separate. @returns Twips. */
  GetOptimalMinRowHeight(): number {
    return this.mnOptimalMinRowHeight || ScGlobal.nStdRowHeight;
  }
  /** Stores native UInt16 minimum override. @param height - Twips. @returns Nothing. */
  SetOptimalMinRowHeight(height: number): void {
    this.mnOptimalMinRowHeight = height & 0xffff;
  }
  /** Reads actual visible/raw row geometry from native segments. @param row - Row. @param hiddenAsZero - Original visibility default,true. @returns Twips or source invalid-row minimum. */
  GetRowHeight(row: number, hiddenAsZero = true): number {
    if (this.rDocument.ValidRow(row) && hiddenAsZero && this.RowHidden(row)) return 0;
    return this.rDocument.ValidRow(row)
      ? this.mpRowHeights.getValue(row)
      : this.GetOptimalMinRowHeight();
  }
  /** Original independent row-hidden query. @param row - Row. @param first - Span output. @param last - Span output. @returns Hidden. */
  RowHidden(row: number, first?: [number], last?: [number]): boolean {
    return this.maFilterData.rowHidden(row, first, last);
  }
  /** Original FilterData borrow;filtered-row state belongs to this actual owner. @returns Native filter data. */
  getFilterData(): FilterData {
    return this.maFilterData;
  }
  /** Original hidden mutation. @param first - First row. @param last - Last row. @param hidden - State. @returns Changed. */
  SetRowHidden(first: number, last: number, hidden: boolean): boolean {
    return this.maFilterData.setRowHidden(first, last, hidden);
  }
  /** Original ShowRows visibility mutation retains heights. @param first - First row. @param last - Last row. @param show - Visible state. @returns Nothing. */
  ShowRows(first: number, last: number, show: boolean): void {
    this.SetRowHidden(first, last, !show);
    if (show) this.maFilterData.setRowFiltered(first, last, false);
  }
  /** Original CopyRowHeight reads compressed raw heights,not hidden-as-zero queries. @param source - Source table. @param first - Destination start. @param last - Destination end. @param offset - Source row offset. @returns Nothing. */
  CopyRowHeight(source: ScTable, first: number, last: number, offset: number): void {
    for (let row = first; row <= last;) {
      const run: ScFlatUInt16RowRangeData = { mnRow1: 0, mnRow2: 0, mnValue: 0 };
      if (!source.mpRowHeights.getRangeData(row + offset, run)) return;
      const end = Math.min(last, run.mnRow2 - offset);
      this.mpRowHeights.setValue(row, end, run.mnValue);
      row = end + 1;
    }
  }
  /** Borrows real compressed geometry boundaries for valid rows. @param row - Valid row. @returns Native range. */
  GetRowHeightRange(row: number): ScFlatUInt16RowRangeData {
    const data = { mnRow1: 0, mnRow2: 0, mnValue: 0 };
    this.mpRowHeights.getRangeData(row, data);
    return data;
  }
  /** Reads genuine compressed row flag bounds. @param row - Row. @returns Flags and range. */
  GetRowFlagsRange(row: number): ReturnType<ScBitMaskCompressedArray["GetRangeData"]> {
    return this.pRowFlags.GetRangeData(row);
  }
  /** Stores geometry without device pixel comparison, as used by import. @param first - First row. @param last - Last row. @param height - UInt16 twips. @returns Nothing. */
  SetRowHeightOnly(first: number, last: number, height: number): void {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last)) return;
    this.mpRowHeights.setValue(first, last, height & 0xffff || this.GetOptimalMinRowHeight());
  }
  /** Updates only the source manual-size bit. @param first - First row. @param last - Last row. @param manual - Flag. @returns Nothing. */
  SetManualHeight(first: number, last: number, manual: boolean): void {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last)) return;
    if (manual) this.pRowFlags.OrValue(first, last, CRFlags.ManualSize);
    else this.pRowFlags.AndValue(first, last, CRFlags.All & ~CRFlags.ManualSize);
  }
  /** Source no-drawing-layer pixel-change path, including the interactive single-row shrink heuristic. @param first - First row. @param last - Last row. @param height - Twips. @param ppty - Pixels per twip. @param api - Allow shrinking a single row. @returns Whether stored geometry changed. */
  SetRowHeightRange(
    first: number,
    last: number,
    height: number,
    ppty: number,
    api: boolean,
  ): boolean {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last)) return false;
    height = height & 0xffff || this.GetOptimalMinRowHeight();
    const pixels = Math.trunc(height * ppty);
    for (let row = first; row <= last;) {
      const run = this.GetRowHeightRange(row),
        oldPixels = Math.trunc(run.mnValue * ppty);
      if (
        run.mnValue !== height &&
        pixels !== oldPixels &&
        (api || last - first > 0 || pixels > oldPixels)
      ) {
        this.mpRowHeights.setValue(first, last, height);
        return true;
      }
      row = run.mnRow2 + 1;
    }
    return false;
  }
  /** Calculates native standard attribute maxima without expanding row spans; unsupported device layout retains imported geometry. @param context - Shared across selected sheets. @param first - First row. @param last - Last row. @param api - Source UI uses true. @returns Whether heights changed. */
  SetOptimalHeight(context: RowHeightContext, first: number, last: number, api: boolean): boolean {
    const patterns: { first: number; last: number; pattern: ScPatternAttr }[] = [];
    const start: [number] = [0],
      end: [number] = [0];
    for (let col = 0; col <= Math.min(this.aCol.length, this.rDocument.MaxCol()); col++)
      for (let row = first; row <= last;) {
        const pattern = this.GetColumnData(col).GetPatternRange(start, end, row) as ScPatternAttr;
        if (!supportsStandardRowHeight(pattern)) return false;
        patterns.push({ first: row, last: Math.min(last, end[0]), pattern });
        row = end[0] + 1;
      }
    const heights = context.getHeightArray();
    for (const run of patterns) {
      const height = lcl_GetAttribHeight(
        run.pattern,
        ATTR_FONT_HEIGHT,
        this.GetOptimalMinRowHeight(),
      );
      for (let row = run.first; row <= run.last;) {
        const old = heights.GetRangeData(row),
          stop = Math.min(run.last, old.mnRow2);
        if (height > old.maValue) heights.SetValue(row, stop, height);
        row = stop + 1;
      }
    }
    return SetOptimalHeightsToRows(
      context,
      /** Mutates actual sheet geometry. @param startRow - First. @param endRow - Last. @param height - Twips. @param fromApi - Shrink policy. @returns Changed. */
      (startRow, endRow, height, fromApi) =>
        this.SetRowHeightRange(startRow, endRow, height, context.getPPTY(), fromApi),
      this.pRowFlags,
      first,
      last,
      api,
    );
  }
  /** Borrows the native default column's attribute portion. @returns Owner. */
  GetDefaultColumnData(): ScColumnData {
    return this.aDefaultColData;
  }
  /** Borrows existing column attributes without allocating cell stores. @param col - Valid column. @returns Attribute owner. */
  GetColumnData(col: number): ScColumnData {
    return col < this.aCol.length ? (this.aCol[col] as ScColumn) : this.aDefaultColData;
  }
  /** Releases canonical pattern ownership on sheet removal. @returns Nothing. */
  DisposeAttributes(): void {
    for (const col of this.aCol) col.DisposeAttributes();
    this.aDefaultColData.DisposeAttributes();
  }
  /** Reads actual native/default column attributes. @param col - Column. @param row - Row. @returns Pattern or null. */
  GetPattern(col: number, row: number): ScPatternAttr | null {
    return this.rDocument.ValidColRow(col, row) ? this.GetColumnData(col).GetPattern(row) : null;
  }
  /** Applies source ordered/clamped attribute ranges and default-column optimization for an end at MaxCol. @param startCol - First column. @param startRow - First row. @param endCol - Last column. @param endRow - Last row. @param delta - Pattern delta. @returns Whether changed. */
  ApplyPatternArea(
    startCol: number,
    startRow: number,
    endCol: number,
    endRow: number,
    delta: ScPatternAttr,
  ): boolean {
    if (
      !this.rDocument.ValidColRow(startCol, startRow) ||
      !this.rDocument.ValidColRow(endCol, endRow)
    )
      return false;
    [startCol, endCol] = [Math.min(startCol, endCol), Math.max(startCol, endCol)];
    [startRow, endRow] = [Math.min(startRow, endRow), Math.max(startRow, endRow)];
    let maxCol = endCol,
      changed = false;
    if (endCol === this.rDocument.MaxCol()) {
      maxCol = Math.max(startCol, this.aCol.length) - 1;
      if (maxCol >= 0) this.CreateColumnIfNotExists(maxCol);
      changed = this.aDefaultColData.ApplyPatternArea(startRow, endRow, delta);
    }
    for (let col = startCol; col <= maxCol; col++)
      changed =
        this.CreateColumnIfNotExists(col).ApplyPatternArea(startRow, endRow, delta) || changed;
    return changed;
  }
  /** Borrows the existing sheet name. @returns Native Unicode value. */
  GetName(): OUStringConstReference {
    return this.aName;
  }
  /** Updates sheet and existing column coordinates after sheet insertion. @param tab - New position. @returns Nothing. */
  SetTabNo(tab: number): void {
    this.nTab = tab;
    this.aDefaultColData.SetTabNo(tab);
    for (const col of this.aCol) col.SetTabNo(tab);
  }
  /** Reports how many columns have actually been allocated. @returns Count. */
  GetAllocatedColumnsCount(): number {
    return this.aCol.length;
  }
  /** Allocates each preceding column,retaining native contiguous ownership. @param col - Valid column. @returns Column owner. */
  CreateColumnIfNotExists(col: number): ScColumn {
    while (this.aCol.length <= col) {
      const index = this.aCol.length,
        column = new ScColumn(this.rDocument);
      column.Init(index, this.nTab, this.aDefaultColData);
      this.aCol.push(column);
    }
    return this.aCol[col] as ScColumn;
  }
  /** Clamps to the native last allocated column, including the empty -1 sentinel. @param col - Requested column. @returns Clamped coordinate. */
  ClampToAllocatedColumns(col: number): number {
    return Math.min(col, this.aCol.length - 1);
  }
  /** Borrows an actual scalar/formula cell view without allocating columns. @param col - Column. @param row - Row. @returns Cell view. */
  GetRefCellValue(col: number, row: number): ScRefCellValue {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetCellValue(row)
      : new ScRefCellValue();
  }
  /** Borrows the actual row broadcaster. @param col - Column. @param row - Row. @returns Broadcaster or null. */
  GetBroadcaster(col: number, row: number): SvtBroadcaster<SfxHint> | null {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetBroadcaster(row)
      : null;
  }
  /** Starts actual single-cell listening, allocating only required columns. @param address - Position. @param listener - Listener. @returns Nothing. */
  StartListening(address: ScAddress, listener: SvtListener<SfxHint>): void {
    if (this.rDocument.ValidColRow(address.Col(), address.Row()))
      this.CreateColumnIfNotExists(address.Col()).StartListening(listener, address.Row());
  }
  /** Ends single-cell listening without allocating. @param address - Position. @param listener - Listener. @returns Nothing. */
  EndListening(address: ScAddress, listener: SvtListener<SfxHint>): void {
    if (
      this.rDocument.ValidColRow(address.Col(), address.Row()) &&
      address.Col() < this.aCol.length
    )
      (this.aCol[address.Col()] as ScColumn).EndListening(listener, address.Row());
  }
  /** Marks native default-context formula state without per-cell calculation. @param context - Default dirty context. @returns Nothing. */
  SetAllFormulasDirty(context: SetFormulaDirtyContext): void {
    if (context.mbClearTabDeletedFlag)
      throw new Error("Deleted-sheet flag clearing is not implemented");
    const old = this.rDocument.GetAutoCalc();
    this.rDocument.SetAutoCalc(false);
    try {
      for (const col of this.aCol) col.SetAllFormulasDirty(context);
    } finally {
      this.rDocument.SetAutoCalc(old);
    }
  }
  /** Writes a formula at valid coordinates through the actual column. @param col - Column. @param row - Row. @param source - Formula. @param grammar - ODFF grammar. @returns Nothing. */
  SetFormula(col: number, row: number, source: OUStringConstReference, grammar: Grammar): void {
    if (this.rDocument.ValidColRow(col, row))
      this.CreateColumnIfNotExists(col).SetFormula(row, source, grammar);
  }
  /** Adopts compiled formula content through the actual column. @param col - Column. @param row - Row. @param cell - Matching compiled owner. @returns Adopted cell or null. */
  SetFormulaCell(col: number, row: number, cell: ScFormulaCell): ScFormulaCell | null {
    return this.rDocument.ValidColRow(col, row)
      ? this.CreateColumnIfNotExists(col).SetFormulaCell(row, cell)
      : null;
  }
  /** Borrows a formula cell without allocating storage. @param col - Column. @param row - Row. @returns Cell or null. */
  GetFormulaCell(col: number, row: number): ScFormulaCell | null {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetFormulaCell(row)
      : null;
  }
  /** Reads the native formula error with empty default. @param position - Address. @returns Error. */
  GetErrCode(position: ScAddress): FormulaError {
    return this.rDocument.ValidColRow(position.Col(), position.Row()) &&
      position.Col() < this.aCol.length
      ? (this.aCol[position.Col()] as ScColumn).GetErrCode(position.Row())
      : FormulaError.NONE;
  }
  /** Writes numeric content only at valid coordinates. @param col - Column. @param row - Row. @param value - Number. @returns Nothing. */
  SetValue(col: number, row: number, value: number): void {
    if (this.rDocument.ValidColRow(col, row))
      this.CreateColumnIfNotExists(col).SetValue(row, value);
  }
  /** Writes an already shared literal string. @param col - Column. @param row - Row. @param value - Actual shared value. @returns Nothing. */
  SetRawString(col: number, row: number, value: SharedStringConstReference): void {
    if (this.rDocument.ValidColRow(col, row))
      this.CreateColumnIfNotExists(col).SetRawString(row, value);
  }
  /** Clears only an existing column;clearing an empty region does not allocate it. @param col - Column. @param row - Row. @returns Nothing. */
  SetEmptyCell(col: number, row: number): void {
    if (this.rDocument.ValidColRow(col, row) && col < this.aCol.length)
      (this.aCol[col] as ScColumn).Delete(row);
  }
  /** Reads numeric content with native invalid/unallocated zero result. @param col - Column. @param row - Row. @returns Value. */
  GetValue(col: number, row: number): number {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetValue(row)
      : 0;
  }
  /** Reads native scalar type with empty default. @param col - Column. @param row - Row. @returns Type. */
  GetCellType(col: number, row: number): CellType {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetCellType(row)
      : CellType.CELLTYPE_NONE;
  }
  /** Returns a copied shared string with native invalid/unallocated default. @param col - Column. @param row - Row. @returns Shared text. */
  GetSharedString(col: number, row: number): SharedString {
    return this.rDocument.ValidColRow(col, row) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn).GetSharedString(row)
      : new SharedString();
  }
}

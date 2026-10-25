/** @fileoverview ScTable scalar/local-reference,cell-attribute and standard row-height operations over lazy contiguous columns. Device layout and full sheet services remain unported. */
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { ScConditionalFormatList } from "../../../inc/conditio";
import * as table2 from "./table2";
import * as table5 from "./table5";
import * as table7 from "./table7";
import { ConvertToGroupListening } from "../../../inc/types";
import { HasAttrFlags } from "../../../inc/global";
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
import { ScAddress, INITIALCOLCOUNT } from "../../../inc/address";
import { ScColumn, ScColumnData } from "../../../inc/column";
import { CellType, InsertDeleteFlags } from "../../../inc/global";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import type { ScDocument } from "../../../inc/document";
import type { ScMergePatternState } from "../../../inc/attarray";
import type { ColumnBlockPosition } from "../../../inc/mtvelements";
import type { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
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
import { UpdateReference, SetOptimalHeightsToRows, SetStreamValid } from "./table1";
/** Original ColumnDataApply callable contract. */
type ColumnDataApply = (column: ScColumnData, first: number, last: number) => void;
/** Sheet owner for the supported scalar document operations. */
export class ScTable {
  /** Original pagination-cache bit,visible to native out-of-class friend definitions. */
  mbPageBreaksValid = false;
  private bStreamValid = false;
  private maRowManualBreaks = new Set<number>();
  private maColManualBreaks = new Set<number>();
  private readonly maRowPageBreaks = new Set<number>();
  private readonly maColPageBreaks = new Set<number>();
  /** Original validated page-break query. @param row - Native index. @returns Membership. */
  HasRowPageBreak(row: number): boolean {
    return this.rDocument.ValidRow(row) && this.maRowPageBreaks.has(row);
  }
  /** Original validated page-break query. @param col - Native index. @returns Membership. */
  HasColPageBreak(col: number): boolean {
    return this.rDocument.ValidCol(col) && this.maColPageBreaks.has(col);
  }
  /** Original validated manual-break query. @param row - Native index. @returns Membership. */
  HasRowManualBreak(row: number): boolean {
    return this.rDocument.ValidRow(row) && this.maRowManualBreaks.has(row);
  }
  /** Original validated manual-break query. @param col - Native index. @returns Membership. */
  HasColManualBreak(col: number): boolean {
    return this.rDocument.ValidCol(col) && this.maColManualBreaks.has(col);
  }
  /** Original stream validity query. @returns Whether valid. */
  IsStreamValid(): boolean {
    return this.bStreamValid;
  }
  /** Original stream state assignment respects the document lock. @param value - New state. @param ignoreLock - Native default false. @returns Nothing. */
  SetStreamValid(value: boolean, ignoreLock = false): void {
    SetStreamValid.call(this, value, ignoreLock);
  }
  /** Original page-break cache invalidation. @returns Nothing. */
  InvalidatePageBreaks(): void {
    this.mbPageBreaksValid = false;
  }
  /** Original sheet Undo dispatch on the same actual table. @param args - Context,rectangle,flags,mark and destination. @returns Nothing. */
  UndoToTable(...args: Parameters<typeof table2.UndoToTable>): void {
    table2.UndoToTable.apply(this, args);
  }
  /** Original table5 clears manual breaks. @param args - Native arguments. @returns Native result. */
  RemoveManualBreaks(...args: Parameters<typeof table5.RemoveManualBreaks>): void {
    return table5.RemoveManualBreaks.apply(this, args);
  }
  /** Original table5 queries manual breaks. @param args - Native arguments. @returns Native result. */
  HasManualBreaks(...args: Parameters<typeof table5.HasManualBreaks>): boolean {
    return table5.HasManualBreaks.apply(this, args);
  }
  /** Original table5 moves row manual breaks. @param args - Native arguments. @returns Native result. */
  SetRowManualBreaks(...args: Parameters<typeof table5.SetRowManualBreaks>): void {
    return table5.SetRowManualBreaks.apply(this, args);
  }
  /** Original table5 moves column manual breaks. @param args - Native arguments. @returns Native result. */
  SetColManualBreaks(...args: Parameters<typeof table5.SetColManualBreaks>): void {
    return table5.SetColManualBreaks.apply(this, args);
  }
  /** Original table5 collects row breaks. @param args - Native arguments. @returns Native result. */
  GetAllRowBreaks(...args: Parameters<typeof table5.GetAllRowBreaks>): void {
    return table5.GetAllRowBreaks.apply(this, args);
  }
  /** Original table5 collects column breaks. @param args - Native arguments. @returns Native result. */
  GetAllColBreaks(...args: Parameters<typeof table5.GetAllColBreaks>): void {
    return table5.GetAllColBreaks.apply(this, args);
  }
  /** Original table5 sets row break flags. @param args - Native arguments. @returns Native result. */
  SetRowBreak(...args: Parameters<typeof table5.SetRowBreak>): void {
    return table5.SetRowBreak.apply(this, args);
  }
  /** Original table5 sets column break flags. @param args - Native arguments. @returns Native result. */
  SetColBreak(...args: Parameters<typeof table5.SetColBreak>): void {
    return table5.SetColBreak.apply(this, args);
  }

  private mpCondFormatList: ScConditionalFormatList | null = new ScConditionalFormatList();
  /** Original table1 mutable getter creates an absent owned list. @returns Actual owner. */
  GetCondFormList(): ScConditionalFormatList {
    if (!this.mpCondFormatList) this.mpCondFormatList = new ScConditionalFormatList();
    return this.mpCondFormatList;
  }
  /** Original unique-pointer reset transfers ownership before destroying the previous list. @param next - New owned list or native null. @returns Nothing. */
  SetCondFormList(next: ScConditionalFormatList | null): void {
    const previous = this.mpCondFormatList;
    this.mpCondFormatList = next;
    previous?.Dispose();
  }
  /** Original table1 deletion assumes its normal non-null list owner. @param index - Conditional index. @returns Nothing. */
  DeleteConditionalFormat(index: number): void {
    (this.mpCondFormatList as ScConditionalFormatList).erase(index);
  }

  /** Original single-source-row repetition on this actual sheet. @param args - Native context,bounds and source geometry. @returns Nothing. */
  CopyOneCellFromClip(...args: Parameters<typeof table7.CopyOneCellFromClip>): void {
    table7.CopyOneCellFromClip.apply(this, args);
  }
  /** Original table7 merged-anchor query keeps sparse column allocation unchanged. @param col - Column. @param row - Row. @returns Merged anchor. */
  IsMerged(col: number, row: number): boolean {
    return table7.IsMerged.call(this, col, row);
  }
  /** Original raw height query ignores hidden state and retains the absent/invalid fallback. @param row - Source row. @returns Twips. */
  GetOriginalHeight(row: number): number {
    return this.rDocument.ValidRow(row) && this.mpRowHeights
      ? this.mpRowHeights.getValue(row)
      : this.GetOptimalMinRowHeight();
  }
  /** Original table1 reference operation on this actual sheet. @param args - Native context and defaults. @returns Nothing. */
  UpdateReference(...args: Parameters<typeof UpdateReference>): void {
    UpdateReference.apply(this, args);
  }
  /** Original table2 conditional-index removal forwarding. @param args - Ranges and key. @returns Nothing. */
  RemoveCondFormatData(...args: Parameters<typeof table2.RemoveCondFormatData>): void {
    table2.RemoveCondFormatData.apply(this, args);
  }
  /** Original table2 conditional-format attribute forwarding. @param args - Ranges and key. @returns Nothing. */
  AddCondFormatData(...args: Parameters<typeof table2.AddCondFormatData>): void {
    table2.AddCondFormatData.apply(this, args);
  }
  /** Original table2 clipboard dirty forwarding. @param args - Native bounds and changed spans. @returns Nothing. */
  SetDirtyFromClip(...args: Parameters<typeof table2.SetDirtyFromClip>): void {
    table2.SetDirtyFromClip.apply(this, args);
  }
  /** Original table2 broadcaster forwarding. @param args - Native bounds and hint. @returns Whether delivered. */
  BroadcastBroadcasters(...args: Parameters<typeof table2.BroadcastBroadcasters>): boolean {
    return table2.BroadcastBroadcasters.apply(this, args);
  }
  /** Original table2 general clipboard-copy forwarding on this actual table. @param args - Native rectangle/displacement/source arguments. @returns Nothing. */
  CopyFromClip(...args: Parameters<typeof table2.CopyFromClip>): void {
    table2.CopyFromClip.apply(this, args);
  }
  /** Original table7 pre-paste forwarding on this actual table instance. @param args - Native context/source/broadcast arguments. @returns Nothing. */
  DeleteBeforeCopyFromClip(...args: Parameters<typeof table7.DeleteBeforeCopyFromClip>): void {
    table7.DeleteBeforeCopyFromClip.apply(this, args);
  }
  /** Original table1 cleanup visits only actual allocated columns. @returns Nothing. */
  DeleteEmptyBroadcasters(): void {
    for (const column of this.aCol) column.DeleteEmptyBroadcasters();
  }
  /** Original table2 clipboard listening clamps to actual allocated columns and native bounds. @param start - Start context. @param end - End context. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @returns Nothing. */
  StartListeningFormulaCells(
    start: StartListeningContext,
    end: EndListeningContext,
    col1: number,
    row1: number,
    col2: number,
    row2: number,
  ): void {
    col2 = Math.min(col2, this.aCol.length - 1, this.rDocument.MaxCol());
    row2 = Math.min(row2, this.rDocument.MaxRow());
    if (this.rDocument.ValidColRow(col1, row1) && this.rDocument.ValidColRow(col2, row2))
      for (let col = col1; col <= col2; ++col)
        (this.aCol[col] as ScColumn).StartListeningFormulaCells(start, end, row1, row2);
  }
  /** Original table7 allocated-column regroup routing. @param col - Column. @returns Nothing. */
  RegroupFormulaCells(col: number): void {
    if (this.rDocument.ValidCol(col) && col < this.aCol.length)
      (this.aCol[col] as ScColumn).RegroupFormulaCells();
  }

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
      // INITIALCOLCOUNT=1 makes the original nonnegative guard invariant.
      this.CreateColumnIfNotExists(last);
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
  /** Original flag addition on actual columns. @param args - Native rectangle and flags. @returns Changed. */
  ApplyFlags(...args: Parameters<typeof table2.ApplyFlags>): boolean {
    return table2.ApplyFlags.apply(this, args);
  }
  /** Original flag removal without tail allocation. @param args - Native rectangle and flags. @returns Changed. */
  RemoveFlags(...args: Parameters<typeof table2.RemoveFlags>): boolean {
    return table2.RemoveFlags.apply(this, args);
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
  /** Original table2 single-item assignment validates coordinates before allocation. @param col - Column. @param row - Row. @param attr - Actual item. @returns Nothing. */
  ApplyAttr(col: number, row: number, attr: SfxPoolItem): void {
    if (this.rDocument.ValidColRow(col, row))
      this.CreateColumnIfNotExists(col).ApplyAttr(row, attr);
  }
  /** Original table.hxx allocated-column validity. @param col - Column. @returns Allocated native column. */
  IsColValid(col: number): boolean {
    return col >= 0 && col < this.aCol.length;
  }
  /** Original table2 editability dispatch. @param args - Native block bounds and policy. @returns Editable under represented normal-sheet profile. */
  IsBlockEditable(...args: Parameters<typeof table2.IsBlockEditable>): boolean {
    return table2.IsBlockEditable.apply(this, args);
  }
  /** Original matrix-fragment dispatch over actual stored cells. @param args - Native bounds and matrix policy. @returns Actual admitted fragment result. */
  HasBlockMatrixFragment(...args: Parameters<typeof table2.HasBlockMatrixFragment>): boolean {
    return table2.HasBlockMatrixFragment.apply(this, args);
  }
  /** Original DeleteSelection traverses allocated columns only and forwards the native broadcast policy. @param flags - Native deletion flags. @param marks - Actual native marks. @param broadcast - Original defaulttrue. @returns Nothing. */
  DeleteSelection(flags: InsertDeleteFlags, marks: ScMarkData, broadcast = true): void {
    for (const column of this.aCol) column.DeleteSelection(flags, marks, broadcast);
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
  /** Original table1.cxx connected-area expansion and shrinking. Uses the real uncached HasDataAt overload;native iterator hints only optimize lookup. @param firstCol - Start column reference. @param firstRow - Start row reference. @param lastCol - End column reference. @param lastRow - End row reference. @param includeOld - Retain original bounds. @param onlyDown - Change only final row. @returns Nothing. */
  GetDataArea(
    firstCol: [number],
    firstRow: [number],
    lastCol: [number],
    lastRow: [number],
    includeOld: boolean,
    onlyDown: boolean,
  ): void {
    firstCol[0] = Math.min(firstCol[0], this.aCol.length - 1);
    lastCol[0] = Math.min(lastCol[0], this.aCol.length - 1);
    let left = false,
      right = false,
      top = false,
      bottom = false,
      changed: boolean;
    do {
      changed = false;
      if (!onlyDown) {
        let start = firstRow[0],
          end = lastRow[0];
        if (start > 0) --start;
        if (end < this.rDocument.MaxRow()) ++end;
        if (
          lastCol[0] < this.aCol.length - 1 &&
          !(this.aCol[lastCol[0] + 1] as ScColumn).IsEmptyData(start, end)
        ) {
          ++lastCol[0];
          changed = true;
          right = true;
        }
        if (firstCol[0] > 0 && !(this.aCol[firstCol[0] - 1] as ScColumn).IsEmptyData(start, end)) {
          --firstCol[0];
          changed = true;
          left = true;
        }
        if (firstRow[0] > 0) {
          let extend = false;
          for (let col = firstCol[0]; col <= lastCol[0] && !extend; col++)
            if ((this.aCol[col] as ScColumn).HasDataAt(firstRow[0] - 1)) extend = true;
          if (extend) {
            --firstRow[0];
            changed = true;
            top = true;
          }
        }
      }
      if (lastRow[0] < this.rDocument.MaxRow()) {
        let extend = false;
        for (let col = firstCol[0]; col <= lastCol[0] && !extend; col++)
          if ((this.aCol[col] as ScColumn).HasDataAt(lastRow[0] + 1)) extend = true;
        if (extend) {
          ++lastRow[0];
          changed = true;
          bottom = true;
        }
      }
    } while (changed);
    if (!includeOld && !onlyDown) {
      if (!left)
        while (
          firstCol[0] < lastCol[0] &&
          firstCol[0] < this.aCol.length - 1 &&
          (this.aCol[firstCol[0]] as ScColumn).IsEmptyData(firstRow[0], lastRow[0])
        )
          ++firstCol[0];
      if (!right)
        while (
          lastCol[0] > 0 &&
          firstCol[0] < lastCol[0] &&
          (this.aCol[lastCol[0]] as ScColumn).IsEmptyData(firstRow[0], lastRow[0])
        )
          --lastCol[0];
      if (!top && firstRow[0] < this.rDocument.MaxRow() && firstRow[0] < lastRow[0]) {
        let shrink = true;
        do {
          for (let col = firstCol[0]; col <= lastCol[0] && shrink; col++)
            if ((this.aCol[col] as ScColumn).HasDataAt(firstRow[0])) shrink = false;
          if (shrink) ++firstRow[0];
        } while (shrink && firstRow[0] < this.rDocument.MaxRow() && firstRow[0] < lastRow[0]);
      }
    }
    if (!includeOld && !bottom && lastRow[0] > 0 && firstRow[0] < lastRow[0]) {
      const last = this.GetLastDataRow(firstCol[0], lastCol[0], lastRow[0]);
      if (last < lastRow[0]) lastRow[0] = Math.max(firstRow[0], last);
    }
  }
  /** Original bounded last-data-row aggregation. @param first - First allocated column. @param last - Final valid column. @param row - Inclusive row bound. @returns Row or native invalid-column sentinel. */
  GetLastDataRow(first: number, last: number, row: number): number {
    if (first < 0 || first >= this.aCol.length || !this.rDocument.ValidCol(last)) return -1;
    last = Math.min(last, this.aCol.length - 1);
    let result = 0;
    for (let col = first; col <= last; col++)
      result = Math.max(result, (this.aCol[col] as ScColumn).GetLastDataPos(row));
    return result;
  }
  /** Original table2 attribute query scans allocated columns then the real default-column tail. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @param mask - Native mask. @returns Found. */
  HasAttrib(
    firstCol: number,
    firstRow: number,
    lastCol: number,
    lastRow: number,
    mask: HasAttrFlags,
  ): boolean {
    for (let col = firstCol; col <= lastCol && col < this.aCol.length; col++)
      if ((this.aCol[col] as ScColumn).HasAttrib(firstRow, lastRow, mask)) return true;
    if (lastCol >= this.aCol.length) return this.aDefaultColData.HasAttrib(firstRow, lastRow, mask);
    return false;
  }
  /** Original table2 typed-cell block emptiness for the consumed scalar stores;notes and sparklines are unrepresented families. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @returns Empty block. */
  IsBlockEmpty(firstCol: number, firstRow: number, lastCol: number, lastRow: number): boolean {
    if (!this.rDocument.ValidCol(firstCol) || !this.rDocument.ValidCol(lastCol)) return false;
    lastCol = this.ClampToAllocatedColumns(lastCol);
    let empty = true;
    for (let col = firstCol; col <= lastCol && empty; col++)
      empty = (this.aCol[col] as ScColumn).IsEmptyData(firstRow, lastRow);
    return empty;
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
    while ((this.aCol[col[0]] as ScColumn).IsEmptyData() && col[0] > 0) --col[0];
    let current = col[0];
    while (current >= 0 && row[0] < this.rDocument.MaxRow())
      row[0] = Math.max(row[0], (this.aCol[current--] as ScColumn).GetLastDataPos());
  }
  private readonly aCol: ScColumn[] = [];
  private readonly aDefaultColData: ScColumnData;
  private readonly aName: OUString;
  private readonly mpColWidth: ScCompressedArray | null;
  declare private readonly mpColFlags: ScBitMaskCompressedArray | null;
  private readonly maFilterData: FilterData;
  private readonly mpRowHeights: ScFlatUInt16RowSegments | null;
  private readonly pRowFlags: ScBitMaskCompressedArray | null;
  private mnOptimalMinRowHeight = 0;
  /** Stores the native sheet identity without constructing unrelated services. @param rDocument - Owner. @param nTab - Sheet position. @param name - Sheet name. @param colInfo - Native width/column-flag allocation default true. @param rowInfo - Native height/row-flag allocation default true. @returns Sheet. */
  constructor(
    private readonly rDocument: ScDocument,
    private nTab: number,
    name: OUStringConstReference,
    colInfo = true,
    rowInfo = true,
  ) {
    this.aName = new OUString(name);
    this.mpColWidth = colInfo
      ? new ScCompressedArray(rDocument.MaxCol() + 1, STD_COL_WIDTH, { access: 16, value: 16 })
      : null;
    this.mpColFlags = colInfo
      ? new ScBitMaskCompressedArray(rDocument.MaxCol() + 1, CRFlags.NONE, 16)
      : null;
    this.maFilterData = new FilterData(this);
    this.mpRowHeights = rowInfo
      ? new ScFlatUInt16RowSegments(rDocument.MaxRow(), this.GetOptimalMinRowHeight())
      : null;
    this.pRowFlags = rowInfo
      ? new ScBitMaskCompressedArray(rDocument.MaxRow(), CRFlags.NONE, 32)
      : null;
    this.aDefaultColData = new ScColumnData(rDocument);
    this.aDefaultColData.Init(-1, nTab);
    this.CreateColumnIfNotExists(INITIALCOLCOUNT - 1);
  }
  /** Borrows the original document owner. @returns Actual document. */
  GetDoc(): ScDocument {
    return this.rDocument;
  }
  /** Original UInt16 column-width setter retains zero-to-standard fallback and invalidates native pagination. @param column - Column. @param width - Native unsigned16 twips. @returns Nothing. */
  SetColWidth(column: number, width: number): void {
    if (this.rDocument.ValidCol(column) && this.mpColWidth) {
      width = width & 0xffff || STD_COL_WIDTH;
      if (width !== this.mpColWidth.GetValue(column)) {
        this.mpColWidth.SetValue(column, width);
        this.InvalidatePageBreaks();
      }
    }
  }
  /** Original width-only setter shares the represented width mutation without page-break services. @param column - Column. @param width - UInt16 twips. @returns Nothing. */
  SetColWidthOnly(column: number, width: number): void {
    this.SetColWidth(column, width);
  }
  /** Original invalid-column standard fallback and optional hidden-as-zero query. @param column - Column. @param hiddenAsZero - Native default,true. @returns Twips. */
  GetColWidth(column: number, hiddenAsZero = true): number {
    if (!this.rDocument.ValidCol(column) || !this.mpColWidth) return STD_COL_WIDTH;
    return hiddenAsZero && this.ColHidden(column) ? 0 : this.mpColWidth.GetValue(column);
  }
  /** Borrows actual source compressed width runs for the browser projection;allocated column geometry is the caller precondition. @param column - Valid source column. @returns Original range data;its unused terminal sentinel may exceed MaxCol. */
  GetColWidthRange(column: number): ScCompressedArrayRangeData {
    return (this.mpColWidth as ScCompressedArray).GetRangeData(column);
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
  /** Original table2 copy on this same native sheet. @param args - Context,range,flags,destination,marks and original copy policies. @returns Nothing. */
  CopyToTable(...args: Parameters<typeof table2.CopyToTable>): void {
    table2.CopyToTable.apply(this, args);
  }
  /** Original conditional format transfer. @param args - Destination bounds,offset and source. @returns Nothing. */
  CopyConditionalFormat(...args: Parameters<typeof table2.CopyConditionalFormat>): void {
    table2.CopyConditionalFormat.apply(this, args);
  }
  /** Reads native per-sheet override or startup minimum; device-dependent global initialization remains separate. @returns Twips. */
  GetOptimalMinRowHeight(): number {
    return this.mnOptimalMinRowHeight || ScGlobal.nStdRowHeight;
  }
  /** Stores native UInt16 minimum override. @param height - Twips. @returns Nothing. */
  SetOptimalMinRowHeight(height: number): void {
    this.mnOptimalMinRowHeight = height & 0xffff;
  }
  /** Original scalar/range row-height overloads. @param first - First or scalar row. @param second - Hidden policy or last row. @param hidden - Range hidden policy. @returns Twips. */
  GetRowHeight(first: number, second: boolean | number = true, hidden = true): number {
    return table2.GetRowHeight.call(this, first, second, hidden);
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
  /** Original CopyRowHeight requires actual source/destination height stores and reads raw heights,not hidden-as-zero queries. @param source - Source table. @param first - Destination start. @param last - Destination end. @param offset - Source row offset. @returns Nothing. */
  CopyRowHeight(source: ScTable, first: number, last: number, offset: number): void {
    for (let row = first; row <= last;) {
      const run: ScFlatUInt16RowRangeData = { mnRow1: 0, mnRow2: 0, mnValue: 0 };
      if (!(source.mpRowHeights as ScFlatUInt16RowSegments).getRangeData(row + offset, run)) return;
      const end = Math.min(last, run.mnRow2 - offset);
      (this.mpRowHeights as ScFlatUInt16RowSegments).setValue(row, end, run.mnValue);
      row = end + 1;
    }
  }
  /** Borrows real compressed geometry boundaries for valid rows with allocated row information. @param row - Valid row. @returns Native range. */
  GetRowHeightRange(row: number): ScFlatUInt16RowRangeData {
    const data = { mnRow1: 0, mnRow2: 0, mnValue: 0 };
    (this.mpRowHeights as ScFlatUInt16RowSegments).getRangeData(row, data);
    return data;
  }
  /** Reads genuine compressed row flag bounds;allocated row information is required. @param row - Row. @returns Flags and range. */
  GetRowFlagsRange(row: number): ReturnType<ScBitMaskCompressedArray["GetRangeData"]> {
    return (this.pRowFlags as ScBitMaskCompressedArray).GetRangeData(row);
  }
  /** Stores geometry without device pixel comparison, as used by import. @param first - First row. @param last - Last row. @param height - UInt16 twips. @returns Nothing. */
  SetRowHeightOnly(first: number, last: number, height: number): void {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last) || !this.mpRowHeights)
      return;
    this.mpRowHeights.setValue(first, last, height & 0xffff || this.GetOptimalMinRowHeight());
  }
  /** Updates only the source manual-size bit. @param first - First row. @param last - Last row. @param manual - Flag. @returns Nothing. */
  SetManualHeight(first: number, last: number, manual: boolean): void {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last) || !this.pRowFlags)
      return;
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
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last) || !this.mpRowHeights)
      return false;
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
  /** Calculates native standard attribute maxima with allocated row information;unsupported device layout retains imported geometry. @param context - Shared across selected sheets. @param first - First row. @param last - Last row. @param api - Source UI uses true. @returns Whether heights changed. */
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
      this.pRowFlags as ScBitMaskCompressedArray,
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
  /** Original table2.cxx const FetchColumn overload returns only allocated valid columns without creating storage. The mutable allocation overload is not consumed here. @param col - Requested column. @returns Actual column or null. */
  FetchColumn(col: number): ScColumn | null {
    return this.rDocument.ValidCol(col) && col < this.aCol.length
      ? (this.aCol[col] as ScColumn)
      : null;
  }
  /** Original mutable column cursor initialization allocates a valid requested column. @param position - Actual cursor. @param col - Column. @returns Initialized. */
  InitColumnBlockPosition(position: ColumnBlockPosition, col: number): boolean {
    if (!this.rDocument.ValidCol(col)) return false;
    this.CreateColumnIfNotExists(col).InitBlockPosition(position);
    return true;
  }
  /** Original table1 broadcaster deletion does not allocate missing columns. @param position - Initialized cursor. @param col - Column. @param first - First row. @param last - Last row. @returns Nothing. */
  DeleteBroadcasters(
    position: ColumnBlockPosition,
    col: number,
    first: number,
    last: number,
  ): void {
    if (!this.rDocument.ValidCol(col) || col >= this.aCol.length) return;
    (this.aCol[col] as ScColumn).DeleteBroadcasters(position, first, last);
  }
  /** Releases native conditional-format and canonical pattern ownership on sheet teardown. @returns Nothing. */
  DisposeAttributes(): void {
    this.mpCondFormatList?.Dispose();
    for (const col of this.aCol) col.DisposeAttributes();
    this.aDefaultColData.DisposeAttributes();
  }
  /** Releases represented members in native reverse declaration order after document-level conditional listeners are cleared. @returns Nothing. */
  Dispose(): void {
    this.aDefaultColData.DisposeAttributes();
    this.mpCondFormatList?.Dispose();
    for (const column of this.aCol) column.Dispose();
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
      // INITIALCOLCOUNT=1 makes the original nonnegative guard invariant.
      this.CreateColumnIfNotExists(maxCol);
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
  StartListening(
    ...args:
      [ScAddress, SvtListener<SfxHint>] | [StartListeningContext, ScAddress, SvtListener<SfxHint>]
  ): void {
    if (args.length === 3) {
      const [context, address, listener] = args;
      if (this.rDocument.ValidCol(address.Col()))
        this.CreateColumnIfNotExists(address.Col()).StartListening(context, address, listener);
      return;
    }
    const [address, listener] = args;
    if (this.rDocument.ValidColRow(address.Col(), address.Row()))
      this.CreateColumnIfNotExists(address.Col()).StartListening(listener, address.Row());
  }
  /** Ends single-cell listening without allocating. @param address - Position. @param listener - Listener. @returns Nothing. */
  EndListening(
    ...args:
      [ScAddress, SvtListener<SfxHint>] | [EndListeningContext, ScAddress, SvtListener<SfxHint>]
  ): void {
    if (args.length === 3) {
      const [context, address, listener] = args;
      if (this.rDocument.ValidCol(address.Col()) && address.Col() < this.aCol.length)
        (this.aCol[address.Col()] as ScColumn).EndListening(context, address, listener);
      return;
    }
    const [address, listener] = args;
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
    if (!this.rDocument.ValidColRow(col, row)) {
      cell.Dispose();
      return null;
    }
    return this.CreateColumnIfNotExists(col).SetFormulaCell(row, cell, ConvertToGroupListening);
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

/** @fileoverview Native document modes, consumed pooled resources and scalar/local-reference storage, attributes and formula tracking. Full construction, formatter and shell services remain unported. */
import type { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import { ScDocOptions, type ScDocOptionsConstReference } from "../../../inc/docoptio";
import { ScViewOptions } from "../../../inc/viewopti";
import * as documen3 from "./documen3";
import * as documen2 from "./documen2";
import type { ScChartListenerCollection } from "../../../inc/chartlis";
import * as documen7 from "./documen7";
import * as documen9 from "./documen9";
import * as document10 from "./document10";
import type { ScBroadcastAreaSlotMachine } from "../inc/bcaslot";
import { ScScriptTypeData, type ScScriptServiceFactory } from "../inc/scrdata";
import type { XBreakIterator } from "../../../../offapi/com/sun/star/i18n/XBreakIterator";
import { GetStringScriptType as classifyString } from "./documen6";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemLine as InnerEdge,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../../editeng/source/items/frmitems";
import { ScRangeList } from "../../../inc/rangelst";
import type { ScMarkData } from "../../../inc/markdata";
import { ScClipParam } from "../../../inc/clipparam";
import type { ScDocumentPool } from "./docpool";
import type { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import type { ScPoolHelper } from "../inc/poolhelp";
import type { ScStyleSheetPool } from "../../../inc/stlpool";
import { CellAttributeHelper, ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScHint } from "../../../inc/brdcst";
import { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import type { SvtListener } from "../../../../svl/source/notify/listener";
import type { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScInterpreterContext } from "../../../inc/interpretercontext";
import type { ScColumn } from "../../../inc/column";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScTable } from "../../../inc/table";
import {
  ScAddress,
  ScRange,
  MAXCOL,
  MAXROW,
  MAXROWCOUNT,
  MAXTAB,
  SC_TAB_APPEND,
  ValidCol,
  ValidRow,
  ValidTab,
} from "../../../inc/address";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { CellType, InsertDeleteFlags, ScGlobal, UpdateRefMode } from "../../../inc/global";
import type { HasAttrFlags } from "../../../inc/global";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SharedString } from "../../../../svl/inc/sharedstring";
import type { SharedStringPool } from "../../../../svl/inc/sharedstringpool";
import { uppercase } from "../../../../unotools/inc/charclass";
import { MsLangId } from "../../../../i18nlangtag/inc/mslangid";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Native document construction modes from document.hxx. */
export enum ScDocumentMode {
  SCDOCMODE_DOCUMENT = 0,
  SCDOCMODE_CLIP = 1,
  SCDOCMODE_UNDO = 2,
  SCDOCMODE_FUNCTIONACCESS = 3,
}
/** Native dependency recalculation modes from document.hxx. */
export enum HardRecalcState {
  OFF,
  TEMPORARY,
  ETERNAL,
}
/** Explicit initial document subset;all supported cells live in its actual sheet/column chain. */
export class ScDocument {
  private mbStreamValidLocked = false;
  /** Original stream-validity lock query. @returns Lock state. */
  IsStreamValidLocked(): boolean {
    return this.mbStreamValidLocked;
  }
  /** Original document.cxx lock assignment. @param lock - Lock state. @returns Nothing. */
  LockStreamValid(lock: boolean): void {
    this.mbStreamValidLocked = lock;
  }
  /** Original contiguous Undo initialization. @param args - Native source,sheets and allocation defaults. @returns Nothing. */
  InitUndo(...args: Parameters<typeof documen7.InitUndo>): void {
    documen7.InitUndo.apply(this, args);
  }
  /** Original sparse selected-sheet Undo initialization. @param args - Native source,marks and allocation defaults. @returns Nothing. */
  InitUndoSelected(...args: Parameters<typeof documen7.InitUndoSelected>): void {
    documen7.InitUndoSelected.apply(this, args);
  }
  /** Original conditional-index removal dispatch. @param args - Ranges,sheet and key. @returns Nothing. */
  RemoveCondFormatData(...args: Parameters<typeof documen7.RemoveCondFormatData>): void {
    documen7.RemoveCondFormatData.apply(this, args);
  }
  /** Original conditional-index dispatch. @param args - Ranges,sheet and key. @returns Nothing. */
  AddCondFormatData(...args: Parameters<typeof documen7.AddCondFormatData>): void {
    documen7.AddCondFormatData.apply(this, args);
  }
  /** Original incremental Undo sheet allocation. @param args - Native sheet range and allocation defaults. @returns Nothing. */
  AddUndoTab(...args: Parameters<typeof documen7.AddUndoTab>): void {
    documen7.AddUndoTab.apply(this, args);
  }
  /** Original general block paste into actual selected sheets. @param args - Native context,bounds,marks and displacement. @returns Nothing. */
  CopyBlockFromClip(...args: Parameters<typeof documen7.CopyBlockFromClip>): void {
    documen7.CopyBlockFromClip.apply(this, args);
  }
  /** Original filtered-source block dispatch. @param args - Native context,bounds,marks and source row output. @returns Filtered count. */
  CopyNonFilteredFromClip(...args: Parameters<typeof documen7.CopyNonFilteredFromClip>): number {
    return documen7.CopyNonFilteredFromClip.apply(this, args);
  }
  /** Original source-row query and missing-table sentinel. @param first - First row. @param last - Last row. @param tab - Sheet. @returns Row or signed SCROW maximum. */
  FirstNonFilteredRow(first: number, last: number, tab: number): number {
    return this.FetchTable(tab)?.getFilterData().firstNonFilteredRow(first, last) ?? 2147483647;
  }
  /** Original documen3 reference update on this actual document. @param args - Native context and defaults. @returns Nothing. */
  UpdateReference(...args: Parameters<typeof documen3.UpdateReference>): void {
    documen3.UpdateReference.apply(this, args);
  }
  private bDelayedDeletingBroadcasters = false;
  /** Original document10 defers semantic broadcaster deletion. @param delay - Enable or flush. @returns Nothing. */
  EnableDelayDeletingBroadcasters(delay: boolean): void {
    document10.EnableDelayDeletingBroadcasters.call(this, delay);
  }
  /** Original broadcaster delay query. @returns Delayed. */
  IsDelayedDeletingBroadcasters(): boolean {
    return this.bDelayedDeletingBroadcasters;
  }
  /** Original range listener completion. @param range - Copied range. @returns Nothing. */
  StartAllListeners(range: ScRange): void {
    document10.StartAllListeners.call(this, range);
  }
  private pDelayedFormulaGrouping: ScRange | null = null;
  private readonly pDelayedStartListeningFormulaCells = new Map<ScColumn, [number, number]>();
  /** Original per-column start-listening delay control. @param column - Actual column. @param delay - Enable or finish. @returns Nothing. */
  EnableDelayStartListeningFormulaCells(column: ScColumn, delay: boolean): void {
    document10.EnableDelayStartListeningFormulaCells.call(this, column, delay);
  }
  /** Original per-column delay query. @param column - Actual column. @returns Enabled. */
  IsEnabledDelayStartListeningFormulaCells(column: ScColumn): boolean {
    return this.pDelayedStartListeningFormulaCells.has(column);
  }
  /** Original adjacent-span admission. @param column - Actual column. @param first - First row. @param last - Last row. @returns Deferred. */
  CanDelayStartListeningFormulaCells(column: ScColumn, first: number, last: number): boolean {
    return document10.CanDelayStartListeningFormulaCells.call(this, column, first, last);
  }
  /** Original selected-sheet clipboard dirty forwarding. @param args - Native bounds,marks,flags and deferred spans. @returns Nothing. */
  SetDirtyFromClip(...args: Parameters<typeof documen7.SetDirtyFromClip>): void {
    documen7.SetDirtyFromClip.apply(this, args);
  }
  /** Original rectangular broadcast with its native individual-broadcaster default. @param range - Changed area. @param id - Hint ID. @param singles - Individual delivery. @returns Nothing. */
  BroadcastCells(range: ScRange, id: SfxHintId, singles = true): void {
    documen7.BroadcastCells.call(this, range, id, singles);
  }
  /** Original clipboard pre-deletion forwarding on this actual document. @param args - Native arguments. @returns Nothing. */
  DeleteBeforeCopyFromClip(...args: Parameters<typeof document10.DeleteBeforeCopyFromClip>): void {
    document10.DeleteBeforeCopyFromClip.apply(this, args);
  }
  /** Original vector listener teardown forwards to the same native document. @param cells - Actual formulas. @returns Nothing. */
  EndListeningFormulaCells(cells: readonly ScFormulaCell[]): void {
    documen7.EndListeningFormulaCells.call(this, cells);
  }
  /** Original delay owner presence. @returns Delayed. */
  IsDelayedFormulaGrouping(): boolean {
    return this.pDelayedFormulaGrouping !== null;
  }
  /** Original document10 regroup overloads. @param args - Range or sheet/column. @returns Nothing. */
  RegroupFormulaCells(...args: Parameters<typeof document10.RegroupFormulaCells>): void {
    document10.RegroupFormulaCells.apply(this, args);
  }
  /** Original deferred grouping toggle. @param delay - Flag. @returns Nothing. */
  DelayFormulaGrouping(delay: boolean): void {
    document10.DelayFormulaGrouping.call(this, delay);
  }
  /** Original delayed cell registration requires an active delay owner. @param cell - Actual cell. @returns Nothing. */
  AddDelayedFormulaGroupingCell(cell: ScFormulaCell): void {
    document10.AddDelayedFormulaGroupingCell.call(this, cell);
  }
  private bDetectiveDirty = false;
  /** Original native detective-listening change flag. @returns Dirty. */
  IsDetectiveDirty(): boolean {
    return this.bDetectiveDirty;
  }
  /** Original flag assignment. @param dirty - Dirty flag. @returns Nothing. */
  SetDetectiveDirty(dirty: boolean): void {
    this.bDetectiveDirty = dirty;
  }
  /** Original actual column cursor initialization. @param args - Native cursor,sheet,column arguments. @returns Initialized. */
  InitColumnBlockPosition(...args: Parameters<typeof documen7.InitColumnBlockPosition>): boolean {
    return documen7.InitColumnBlockPosition.apply(this, args);
  }
  /** Original deferred broadcaster deletion. @param args - Native cursor,position,length arguments. @returns Nothing. */
  DeleteBroadcasters(...args: Parameters<typeof documen7.DeleteBroadcasters>): void {
    documen7.DeleteBroadcasters.apply(this, args);
  }
  static readonly HardRecalcState = HardRecalcState;
  /** Original clipboard listening delegates through actual selected sheets and columns. @param start - Listening start context. @param end - End context. @param tab - Sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @returns Nothing. */
  StartListeningFromClip(
    start: StartListeningContext,
    end: EndListeningContext,
    tab: number,
    col1: number,
    row1: number,
    col2: number,
    row2: number,
  ): void {
    this.FetchTable(tab)?.StartListeningFormulaCells(start, end, col1, row1, col2, row2);
  }
  /** Shares the actual source pool helper,string pool and canonical attribute helper. @param source - Resource owner. @returns Nothing. */
  SharePooledResources(source: ScDocument): void {
    document10.SharePooledResources.call(this, source);
  }
  /** Clears native sheet owners while retaining document resources and clipboard parameters. @returns Nothing. */
  Clear(): void {
    documen9.Clear.call(this);
  }
  /** Resets a clipboard to source-selected sheet indexes or one explicit sheet. @param source - Source document. @param selection - Source marks,null for all,or explicit sheet. @returns Nothing. */
  ResetClip(source: ScDocument, selection: ScMarkData | number | null): void {
    documen2.ResetClip.call(this, source, selection);
  }
  /** Native clipboard initialization clears old content before borrowing source resources. @param source - Source document. @returns Nothing. */
  InitClipPtrs(source: ScDocument): void {
    documen2.InitClipPtrs.call(this, source);
  }
  /** Stores a clipboard's one owned range and cut flag. @param range - Source area. @param cut - Cut mode. @returns Nothing. */
  SetClipArea(range: ScRange, cut = false): void {
    if (!this.IsClipboard()) return;
    const parameter = this.GetClipParam();
    parameter.maRanges.RemoveAll();
    parameter.maRanges.push_back(range);
    parameter.mbCutMode = cut;
  }
  /** Original clipboard dimensions on this actual document. @param args - Dimension outputs and filtered mode. @returns Nothing. */
  GetClipArea(...args: Parameters<typeof documen7.GetClipArea>): void {
    documen7.GetClipArea.apply(this, args);
  }
  private mpClipParam: ScClipParam | undefined;
  /** Original lazily owned clipboard parameters,also available on normal documents. @returns Actual document-owned clipboard parameters. */
  GetClipParam(): ScClipParam {
    return (this.mpClipParam ??= new ScClipParam());
  }
  /** Original copied clipboard parameters replace the previous owner. @param parameter - Source parameters. @returns Nothing. */
  SetClipParam(parameter: ScClipParam): void {
    this.mpClipParam = new ScClipParam(parameter);
  }
  /** Original filtered-row count through actual per-sheet segment storage. @param first - First row. @param last - Last row. @param tab - Sheet. @returns Nonfiltered count or zero for an absent sheet. */
  CountNonFilteredRows(first: number, last: number, tab: number): number {
    return this.FetchTable(tab)?.getFilterData().countNonFilteredRows(first, last) ?? 0;
  }
  private eGrammar: Grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
  /** Original current formula convention,initialized GRAM_NATIVE. @returns Grammar. */
  GetGrammar(): Grammar {
    return this.eGrammar;
  }
  /** Original documen3 assignment. @param grammar - Convention. @returns Nothing. */
  SetGrammar(grammar: Grammar): void {
    this.eGrammar = grammar;
  }
  /** Original document block emptiness forwards to the actual sheet;missing sheets retain false. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @param tab - Sheet. @returns Empty block. */
  IsBlockEmpty(
    firstCol: number,
    firstRow: number,
    lastCol: number,
    lastRow: number,
    tab: number,
  ): boolean {
    return this.FetchTable(tab)?.IsBlockEmpty(firstCol, firstRow, lastCol, lastRow) ?? false;
  }
  /** Original range overload delegates to actual sheet attribute owners. @param range - Area. @param mask - Native query. @returns Found. */
  HasAttrib(range: ScRange, mask: HasAttrFlags): boolean {
    return documen7.HasAttrib.call(this, range, mask);
  }
  private readonly pDocOptions = new ScDocOptions();
  /** Original borrowed document options,including lazy search classification. @returns Actual options. */
  GetDocOptions(): ScDocOptionsConstReference {
    return this.pDocOptions;
  }
  /** Assigns original options by value;the unported lazy formatter is never allocated in this profile. @param options - Source options. @returns Nothing. */
  SetDocOptions(options: ScDocOptionsConstReference): void {
    this.pDocOptions.assign(options);
    this.mxPoolHelper?.SetFormTableOpt(options);
  }
  private readonly pViewOptions = new ScViewOptions();
  /** Original documen3 borrowed view options. @returns Actual document-owned options. */
  GetViewOptions(): ScViewOptions {
    return this.pViewOptions;
  }
  /** Original value assignment preserves the borrowed owner identity. @param options - Source options. @returns Nothing. */
  SetViewOptions(options: ScViewOptions): void {
    this.pViewOptions.copy_assign(options);
  }
  /** Original connected-area delegation,with its parameter tuple retained from the out-of-class definition. @param args - Original sheet,coordinate references and extension controls. @returns Nothing. */
  GetDataArea(...args: Parameters<typeof documen7.GetDataArea>): void {
    return documen7.GetDataArea.apply(this, args);
  }
  private pScriptTypeData: ScScriptTypeData | undefined;
  /** Original lazily owned script service. The actual process-context factory is an explicit borrowed host port;the kernel depends only on XBreakIterator. @param factory - Real service creation binding or unavailable host port. @returns Stable borrowed service or empty reference. */
  GetBreakIterator(factory?: ScScriptServiceFactory): XBreakIterator | null {
    this.pScriptTypeData ??= new ScScriptTypeData();
    this.pScriptTypeData.xBreakIter ??= factory?.() ?? null;
    return this.pScriptTypeData.xBreakIter;
  }
  /** Original document string classifier,retaining the empty-string lazy-service guard and consumed source loop. @param string - Actual UTF16 string. @param factory - Borrowed real service creation binding. @returns Native script flags. */
  GetStringScriptType(
    string: OUStringConstReference,
    factory?: ScScriptServiceFactory,
  ): SvtScriptType {
    return string.getLength() === 0
      ? SvtScriptType.NONE
      : classifyString(string, this.GetBreakIterator(factory));
  }
  /** Original address-only const getter reads cached metadata without evaluating or updating it. @param position - Actual coordinate. @returns Stored flags or NONE. */
  GetScriptType(position: ScAddress): SvtScriptType {
    return documen7.GetScriptType.call(this, position);
  }
  /** Original address setter delegates through the actual sheet/column metadata owners. @param position - Actual coordinate. @param type - Native flags. @returns Nothing. */
  SetScriptType(position: ScAddress, type: SvtScriptType): void {
    this.FetchTable(position.Tab())?.SetScriptType(position.Col(), position.Row(), type);
  }
  /** Original absent-sheet layout fallback. @param tab - Sheet. @returns Actual RTL flag or false. */
  IsLayoutRTL(tab: number): boolean {
    return this.FetchTable(tab)?.IsLayoutRTL() ?? false;
  }
  /** Original represented table flag dispatch;drawing/visibility services remain unported. @param tab - Sheet. @param set - RTL state. @returns Nothing. */
  SetLayoutRTL(tab: number, set: boolean): void {
    this.FetchTable(tab)?.SetLayoutRTL(set);
  }
  /** Original existing-line style/color dispatch. @param marks - Actual multi marks. @param line - Source style or absence. @param colorOnly - Color mode. @returns Nothing. */
  ApplySelectionLineStyle(
    marks: ScMarkData,
    line: SvxBorderLine | undefined,
    colorOnly: boolean,
  ): void {
    if (colorOnly && !line) return;
    for (const tab of marks.GetSelectedTabs()) {
      if (tab >= this.GetTableCount()) break;
      this.FetchTable(tab)?.ApplySelectionLineStyle(marks, line, colorOnly);
    }
  }
  /** Original selection-frame query preserves traversal order and six independent mixed states. @param marks - Actual marks. @param outer - Outer result. @param inner - Inner result. @returns Nothing. */
  GetSelectionFrame(marks: ScMarkData, outer: SvxBoxItem, inner: SvxBoxInfoItem): void {
    documen7.GetSelectionFrame.call(this, marks, outer, inner);
  }
  /** Original marked selection frames and adjacent-envelope border removal. @param marks - Actual native marks. @param outer - Requested outer lines. @param inner - Requested inner lines and validity. @returns Nothing. */
  ApplySelectionFrame(marks: ScMarkData, outer: SvxBoxItem, inner: SvxBoxInfoItem): void {
    const ranges = new ScRangeList();
    marks.FillRangeListWithMarks(ranges, false);
    for (const tab of marks.GetSelectedTabs()) {
      if (tab >= this.GetTableCount()) break;
      const table = this.FetchTable(tab);
      if (table)
        for (const range of ranges)
          table.ApplyBlockFrame(
            outer,
            inner,
            range.aStart.Col(),
            range.aStart.Row(),
            range.aEnd.Col(),
            range.aEnd.Row(),
          );
    }
    if (!outer.IsRemoveAdjacentCellBorder()) return;
    const blank = new SvxBoxItem(outer);
    for (const edge of [Edge.TOP, Edge.BOTTOM, Edge.LEFT, Edge.RIGHT])
      blank.SetLine(undefined, edge);
    const left = new SvxBoxItem(blank),
      right = new SvxBoxItem(blank),
      top = new SvxBoxItem(blank),
      bottom = new SvxBoxItem(blank),
      base = new SvxBoxInfoItem(inner);
    base.SetTable(false);
    base.SetLine(undefined, InnerEdge.HORI);
    base.SetLine(undefined, InnerEdge.VERT);
    base.SetValid(Valid.ALL, false);
    base.SetValid(Valid.DISTANCE);
    const leftInfo = new SvxBoxInfoItem(base),
      rightInfo = new SvxBoxInfoItem(base),
      topInfo = new SvxBoxInfoItem(base),
      bottomInfo = new SvxBoxInfoItem(base);
    if (inner.IsValid(Valid.TOP) && !outer.GetTop()) topInfo.SetValid(Valid.BOTTOM);
    if (inner.IsValid(Valid.BOTTOM) && !outer.GetBottom()) bottomInfo.SetValid(Valid.TOP);
    if (inner.IsValid(Valid.LEFT) && !outer.GetLeft()) leftInfo.SetValid(Valid.RIGHT);
    if (inner.IsValid(Valid.RIGHT) && !outer.GetRight()) rightInfo.SetValid(Valid.LEFT);
    const topRanges = marks.GetTopEnvelope(),
      bottomRanges = marks.GetBottomEnvelope(),
      leftRanges = marks.GetLeftEnvelope(),
      rightRanges = marks.GetRightEnvelope();
    for (const tab of marks.GetSelectedTabs()) {
      if (tab >= this.GetTableCount()) break;
      const table = this.FetchTable(tab);
      if (table) {
        for (const range of topRanges)
          table.ApplyBlockFrame(
            top,
            topInfo,
            range.aStart.Col(),
            range.aStart.Row(),
            range.aEnd.Col(),
            range.aEnd.Row(),
          );
        for (const range of bottomRanges)
          table.ApplyBlockFrame(
            bottom,
            bottomInfo,
            range.aStart.Col(),
            range.aStart.Row(),
            range.aEnd.Col(),
            range.aEnd.Row(),
          );
        for (const range of leftRanges)
          table.ApplyBlockFrame(
            left,
            leftInfo,
            range.aStart.Col(),
            range.aStart.Row(),
            range.aEnd.Col(),
            range.aEnd.Row(),
          );
        for (const range of rightRanges)
          table.ApplyBlockFrame(
            right,
            rightInfo,
            range.aStart.Col(),
            range.aStart.Row(),
            range.aEnd.Col(),
            range.aEnd.Row(),
          );
      }
    }
  }
  /** Original selected-sheet indentation with removed-tab boundary. @param increment - Direction. @param marks - Real marks. @returns Nothing. */
  ChangeSelectionIndent(increment: boolean, marks: ScMarkData): void {
    for (const tab of marks.GetSelectedTabs()) {
      if (tab >= this.GetTableCount()) break;
      this.FetchTable(tab)?.ChangeSelectionIndent(marks, increment);
    }
  }
  /** Original document column-domain query. @param column - Native column. @returns Whether valid. */
  ValidCol(column: number): boolean {
    return ValidCol(column, MAXCOL);
  }
  /** Original row-height dispatch. @param first - First row. @param last - Last row. @param tab - Sheet. @param height - UInt16 twips. @returns Nothing. */
  SetRowHeightRange(first: number, last: number, tab: number, height: number): void {
    this.FetchTable(tab)?.SetRowHeightRange(first, last, height, 1.0, true);
  }
  /** Original import/raw height setter. @param first - First row. @param last - Last row. @param tab - Sheet. @param height - Twips. @returns Nothing. */
  SetRowHeightOnly(first: number, last: number, tab: number, height: number): void {
    this.FetchTable(tab)?.SetRowHeightOnly(first, last, height);
  }
  /** Original manual flag dispatch. @param first - First row. @param last - Last row. @param tab - Sheet. @param manual - Flag. @returns Nothing. */
  SetManualHeight(first: number, last: number, tab: number, manual: boolean): void {
    this.FetchTable(tab)?.SetManualHeight(first, last, manual);
  }
  /** Original missing-table row-height zero. @param row - Row. @param tab - Sheet. @param hiddenAsZero - Source default,true. @returns Twips. */
  GetRowHeight(row: number, tab: number, hiddenAsZero = true): number {
    return this.FetchTable(tab)?.GetRowHeight(row, hiddenAsZero) ?? 0;
  }
  /** Original per-sheet minimum query. @param tab - Sheet. @returns Minimum twips or native standard height. */
  GetSheetOptimalMinRowHeight(tab: number): number {
    return this.FetchTable(tab)?.GetOptimalMinRowHeight() ?? ScGlobal.nStdRowHeight;
  }
  /** Original missing-table hidden query retains outputs. @param row - Row. @param tab - Sheet. @param first - Span output. @param last - Span output. @returns Hidden. */
  RowHidden(row: number, tab: number, first?: [number], last?: [number]): boolean {
    return this.FetchTable(tab)?.RowHidden(row, first, last) ?? false;
  }
  /** Original missing-table filtered query retains outputs. @param row - Row. @param tab - Sheet. @param first - Span output. @param last - Span output. @returns Filtered. */
  RowFiltered(row: number, tab: number, first?: [number], last?: [number]): boolean {
    return this.FetchTable(tab)?.getFilterData().rowFiltered(row, first, last) ?? false;
  }
  /** Original hidden row dispatch. @param first - First row. @param last - Last row. @param tab - Sheet. @param hidden - Flag. @returns Nothing. */
  SetRowHidden(first: number, last: number, tab: number, hidden: boolean): void {
    this.FetchTable(tab)?.SetRowHidden(first, last, hidden);
  }
  /** Original filtered row dispatch. @param first - First row. @param last - Last row. @param tab - Sheet. @param filtered - Flag. @returns Nothing. */
  SetRowFiltered(first: number, last: number, tab: number, filtered: boolean): void {
    this.FetchTable(tab)?.getFilterData().setRowFiltered(first, last, filtered);
  }
  /** Original show rows dispatch. @param first - First row. @param last - Last row. @param tab - Sheet. @param show - Flag. @returns Nothing. */
  ShowRows(first: number, last: number, tab: number, show: boolean): void {
    this.FetchTable(tab)?.ShowRows(first, last, show);
  }
  /** Original selected-table width assignment. @param column - Column. @param tab - Sheet. @param width - UInt16 twips. @returns Nothing. */
  SetColWidth(column: number, tab: number, width: number): void {
    this.FetchTable(tab)?.SetColWidth(column, width);
  }
  /** Original width-only table dispatch. @param column - Column. @param tab - Sheet. @param width - UInt16 twips. @returns Nothing. */
  SetColWidthOnly(column: number, tab: number, width: number): void {
    this.FetchTable(tab)?.SetColWidthOnly(column, width);
  }
  /** Original absent-sheet zero fallback. @param column - Column. @param tab - Sheet. @param hiddenAsZero - Include hidden flag,true by default. @returns Twips. */
  GetColWidth(column: number, tab: number, hiddenAsZero = true): number {
    return this.FetchTable(tab)?.GetColWidth(column, hiddenAsZero) ?? 0;
  }
  /** Original absent-sheet false result writes the requested column into both optional span outputs. @param column - Column. @param tab - Sheet. @param first - Optional span start. @param last - Optional span end. @returns Hidden flag. */
  ColHidden(column: number, tab: number, first?: [number], last?: [number]): boolean {
    const table = this.FetchTable(tab);
    if (table) return table.ColHidden(column, first, last);
    if (first) first[0] = column;
    if (last) last[0] = column;
    return false;
  }
  /** Original column visibility assignment dispatch. @param first - First column. @param last - Last column. @param tab - Sheet. @param hidden - Hidden flag. @returns Nothing. */
  SetColHidden(first: number, last: number, tab: number, hidden: boolean): void {
    this.FetchTable(tab)?.SetColHidden(first, last, hidden);
  }
  /** Original ShowCol dispatch preserves stored widths. @param column - Column. @param tab - Sheet. @param show - Show flag. @returns Nothing. */
  ShowCol(column: number, tab: number, show: boolean): void {
    this.FetchTable(tab)?.ShowCol(column, show);
  }
  /** Consumed source DeleteArea orders coordinates and visits selected real sheets;attribute deletion does not rebuild formula listeners. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @param marks - Selected sheets. @param flags - Attribute-only deletion flags. @returns Nothing. */
  DeleteArea(
    firstCol: number,
    firstRow: number,
    lastCol: number,
    lastRow: number,
    marks: ScMarkData,
    flags: InsertDeleteFlags,
  ): void {
    documen7.DeleteArea.call(this, firstCol, firstRow, lastCol, lastRow, marks, flags);
  }
  /** Original selected-sheet deletion on this document. @param args - Native flags and marks. @returns Nothing. */
  DeleteSelection(...args: Parameters<typeof documen7.DeleteSelection>): void {
    documen7.DeleteSelection.apply(this, args);
  }
  /** Clips only to real cell data, preserving source output mutations on failure. @param tab - Sheet. @param firstCol - Start-column output. @param firstRow - Start-row output. @param lastCol - End-column output. @param lastRow - End-row output. @returns Whether the clipped area is valid. */
  ShrinkToDataArea(
    tab: number,
    firstCol: [number],
    firstRow: [number],
    lastCol: [number],
    lastRow: [number],
  ): boolean {
    return documen7.ShrinkToDataArea.call(this, tab, firstCol, firstRow, lastCol, lastRow);
  }
  private pSelectionAttr: ScPatternAttr | undefined;
  /** Original owned selection pattern assembled by native table/column/run merges. @param marks - Actual sheet and cell marks. @param deep - Include inherited items. @returns Independent pattern. */
  CreateSelectionPattern(marks: ScMarkData, deep = true): ScPatternAttr {
    return documen7.CreateSelectionPattern.call(this, marks, deep);
  }
  /** Original retained native selection result replaces the previous owned value. @param marks - Actual marks. @returns Borrowed current pattern. */
  GetSelectionPattern(marks: ScMarkData): ScPatternAttr {
    const next = this.CreateSelectionPattern(marks);
    this.pSelectionAttr?.Dispose();
    this.pSelectionAttr = next;
    return this.pSelectionAttr;
  }
  private mxPoolHelper: ScPoolHelper | null = null;
  private mpCellAttributeHelper: CellAttributeHelper | null = null;
  private readonly bIsClip: boolean;
  private readonly bIsUndo: boolean;
  private readonly bIsFunctionAccess: boolean;
  private bNoListening = false;
  private bInsertingFromOtherDoc = false;
  /** Original deferred insertion state. @returns Insertion flag. */
  IsInsertingFromOtherDoc(): boolean {
    return this.bInsertingFromOtherDoc;
  }
  /** Original flag suppresses premature column listening and broadcasts during clipboard transfer. @param inserting - Insertion flag. @returns Nothing. */
  SetInsertingFromOtherDoc(inserting: boolean): void {
    this.bInsertingFromOtherDoc = inserting;
  }
  private pFormulaTree: ScFormulaCell | null = null;
  private pEOFormulaTree: ScFormulaCell | null = null;
  private pFormulaTrack: ScFormulaCell | null = null;
  private pEOFormulaTrack: ScFormulaCell | null = null;
  private nFormulaTrackCount = 0;
  private nFormulaCodeInTree = 0;
  private bHasForcedFormulas = false;
  private bCalculatingFormulaTree = false;
  private readonly mxSheetLimits = new ScSheetLimits(MAXCOL, MAXROW);
  private readonly maInterpreterContext = new ScInterpreterContext(this, null);
  private readonly aDocName = new OUString();
  /** Original document.hxx document-name assignment. @param name - Source value. @returns Nothing. */
  SetName(name: OUStringConstReference): void {
    this.aDocName.assign(name);
  }
  private pChartListenerCollection: ScChartListenerCollection | null = null;
  private nInterpretLevel = 0;
  private bImportingXML = false;
  private bInDtorClear = false;
  /** Borrows the native chart collection,absent in Clip/Undo documents. @returns Collection or null. */
  GetChartListenerCollection(): ScChartListenerCollection | null {
    return this.pChartListenerCollection;
  }
  /** Original interpreter nesting query. @returns Active. */
  IsInInterpreter(): boolean {
    return this.nInterpretLevel !== 0;
  }
  /** Original saturating unsigned-short nesting increment. @returns Nothing. */
  IncInterpretLevel(): void {
    if (this.nInterpretLevel < 0xffff) ++this.nInterpretLevel;
  }
  /** Original nesting decrement retains zero. @returns Nothing. */
  DecInterpretLevel(): void {
    if (this.nInterpretLevel) --this.nInterpretLevel;
  }
  /** Original XML-import query. @returns Importing. */
  IsImportingXML(): boolean {
    return this.bImportingXML;
  }
  /** Original document teardown query. @returns Clearing. */
  IsInDtorClear(): boolean {
    return this.bInDtorClear;
  }
  private bAutoCalc: boolean;
  private readonly maTabs: (ScTable | null)[] = [];
  private pBASM: ScBroadcastAreaSlotMachine | null = null;
  private eHardRecalcState = HardRecalcState.OFF;
  private mbTrackFormulasPending = false;
  private mbFinalTrackFormulas = false;
  private bExpandRefs = false;
  private readonly locale = MsLangId.Conversion.convertLanguageToLocale(0, false);
  declare private mpCellStringPool: SharedStringPool;
  /** Constructs native document-mode resources and an independent shared string pool. @param mode - Native construction mode. @returns Document. */
  constructor(mode = ScDocumentMode.SCDOCMODE_DOCUMENT) {
    this.bIsClip = mode === ScDocumentMode.SCDOCMODE_CLIP;
    this.bIsUndo = mode === ScDocumentMode.SCDOCMODE_UNDO;
    this.bIsFunctionAccess = mode === ScDocumentMode.SCDOCMODE_FUNCTIONACCESS;
    this.bAutoCalc = mode === ScDocumentMode.SCDOCMODE_DOCUMENT || this.bIsFunctionAccess;
    documen2.InitializeResources.call(this);
  }
  /** Borrows the native document pool, absent before temporary-document resource sharing. @returns Pool or null. */
  GetPool(): ScDocumentPool | null {
    return this.mxPoolHelper ? this.mxPoolHelper.GetDocPool() : null;
  }
  /** Borrows the actual native style pool when this document owns pooled resources. @returns Pool or null. */
  GetStyleSheetPool(): ScStyleSheetPool | null {
    return this.mxPoolHelper ? this.mxPoolHelper.GetStylePool() : null;
  }
  /** Original documen2 formatter query through the actual shared pool. @returns Borrowed formatter. */
  GetFormatTable(): SvNumberFormatter {
    return documen2.GetFormatTable.call(this);
  }
  /** Native clipboard mode query. @returns Mode flag. */
  IsClipboard(): boolean {
    return this.bIsClip;
  }
  /** Native undo mode query. @returns Mode flag. */
  IsUndo(): boolean {
    return this.bIsUndo;
  }
  /** Native combined temporary-document query. @returns Mode flag. */
  IsClipOrUndo(): boolean {
    return this.bIsClip || this.bIsUndo;
  }
  /** Native function-access mode query. @returns Mode flag. */
  IsFunctionAccess(): boolean {
    return this.bIsFunctionAccess;
  }
  /** Sets the actual subscription suppression flag. @param value - Suppress new listening. @returns Nothing. */
  SetNoListening(value: boolean): void {
    this.bNoListening = value;
  }
  /** Reads the native subscription suppression flag. @returns Flag. */
  GetNoListening(): boolean {
    return this.bNoListening;
  }
  /** Borrows actual document pattern canonicalization. @returns Helper. */
  getCellAttributeHelper(): CellAttributeHelper {
    if (!this.mpCellAttributeHelper) {
      if (this.IsClipOrUndo())
        throw new Error(
          "CellAttributeHelper needs to be shared using SharePooledResources, not created",
        );
      const pool = this.GetPool();
      if (!pool) throw new Error("No SfxItemPool for this ScDocument");
      this.mpCellAttributeHelper = new CellAttributeHelper(pool);
    }
    return this.mpCellAttributeHelper;
  }
  /** Borrows effective cell attributes through the sheet/column/default chain. @param position - Cell. @returns Pattern or null. */
  GetPattern(position: ScAddress): ScPatternAttr | null {
    return this.FetchTable(position.Tab())?.GetPattern(position.Col(), position.Row()) ?? null;
  }
  /** Original document10 merge query over actual sparse sheets. @param position - Queried cell. @returns Merged anchor. */
  IsMerged(position: ScAddress): boolean {
    return document10.IsMerged.call(this, position);
  }
  /** Original document.cxx cursor-pattern assignment delegates through the actual sheet. @param col - Column. @param row - Row. @param tab - Sheet. @param holder - Complete canonical pattern. @returns Nothing. */
  SetPattern(col: number, row: number, tab: number, holder: CellAttributeHolder): void {
    this.FetchTable(tab)?.SetPattern(col, row, holder);
  }
  /** Original document.cxx cursor delta applies to exactly one sheet cell. @param col - Column. @param row - Row. @param tab - Sheet. @param pattern - Borrowed delta. @returns Nothing. */
  ApplyPattern(col: number, row: number, tab: number, pattern: ScPatternAttr): void {
    this.FetchTable(tab)?.ApplyPattern(col, row, pattern);
  }
  /** Applies an actual source pattern delta on a single sheet. @param startCol - First column. @param startRow - First row. @param endCol - Last column. @param endRow - Last row. @param tab - Sheet. @param delta - Pattern delta. @returns Whether changed. */
  ApplyPatternAreaTab(
    startCol: number,
    startRow: number,
    endCol: number,
    endRow: number,
    tab: number,
    delta: ScPatternAttr,
  ): boolean {
    return (
      this.FetchTable(tab)?.ApplyPatternArea(startCol, startRow, endCol, endRow, delta) ?? false
    );
  }
  /** Original document.cxx simple-area or selected-cache dispatch over actual canonical pattern owners. @param delta - Source pattern. @param marks - Actual simple/multi selection. @returns Stored attribute change. */
  ApplySelectionPattern(delta: ScPatternAttr, marks: ScMarkData): boolean {
    return documen7.ApplySelectionPattern.call(this, delta, marks);
  }
  /** Copies through the original document/table/column owner chain with native scope guards and listening completion. @param range - Source rectangle. @param flags - ATTRIB and optional STRING/EDITATTR/NOCAPTIONS undo flags. @param marked - Copy only marked row/column spans. @param destination - Real target document. @param marks - Selected sheets and optional multi marks. @returns Nothing. */
  CopyToDocument(...args: Parameters<typeof documen7.CopyToDocument>): void {
    documen7.CopyToDocument.apply(this, args);
  }
  /** Releases actual attribute registrations at document closure. @returns Nothing. */
  DisposeAttributes(): void {
    return documen2.DisposeAttributes.call(this);
  }
  /** Releases consumed native document observer lifetime,starting with area destruction before formula-cell destruction as in documen2. GC owns physical stores. @returns Nothing. */
  Dispose(): void {
    return documen2.Dispose.call(this);
  }
  /** Borrows document-independent native sheet limits. @returns Limits. */
  GetSheetLimits(): ScSheetLimits {
    return this.mxSheetLimits;
  }
  /** Borrows the actual nonthreaded numeric interpreter context. @returns Context. */
  GetNonThreadedContext(): ScInterpreterContext {
    return this.maInterpreterContext;
  }
  /** Reads the normal document's native automatic-calculation default. @returns Enabled. */
  GetAutoCalc(): boolean {
    return this.bAutoCalc;
  }
  /** Applies the native normal-document auto-calc switch and forced-formula wakeup. Shell/interpreter callback modes are unsupported. @param enabled - Enabled. @returns Nothing. */
  SetAutoCalc(enabled: boolean): void {
    const old = this.bAutoCalc;
    this.bAutoCalc = enabled;
    if (!old && enabled && this.bHasForcedFormulas && !this.bCalculatingFormulaTree)
      this.CalcFormulaTree(true);
  }
  /** Borrows the native numeric/string/formula cell view. @param position - Cell. @returns View. */
  GetRefCellValue(position: ScAddress): ScRefCellValue {
    return (
      this.FetchTable(position.Tab())?.GetRefCellValue(position.Col(), position.Row()) ??
      new ScRefCellValue()
    );
  }
  /** Borrows a source broadcaster. @param position - Cell. @returns Broadcaster or null. */
  GetBroadcaster(position: ScAddress): SvtBroadcaster<SfxHint> | null {
    return this.FetchTable(position.Tab())?.GetBroadcaster(position.Col(), position.Row()) ?? null;
  }
  /** Registers the original native listener at a cell. @param position - Cell. @param listener - Listener. @returns Nothing. */
  StartListeningCell(...args: Parameters<typeof documen7.StartListeningCell>): void {
    documen7.StartListeningCell.apply(this, args);
  }
  /** Ends an original reciprocal registration. @param position - Cell. @param listener - Listener. @returns Nothing. */
  EndListeningCell(...args: Parameters<typeof documen7.EndListeningCell>): void {
    documen7.EndListeningCell.apply(this, args);
  }
  /** Borrows the actual native area machine;null after observable destruction. @returns Machine. */
  GetBASM(): ScBroadcastAreaSlotMachine | null {
    return this.pBASM;
  }
  /** Reads native recalculation mode. @returns Mode. */
  GetHardRecalcState(): HardRecalcState {
    return this.eHardRecalcState;
  }
  /** Sets native recalculation mode. @param state - Mode. @returns Nothing. */
  SetHardRecalcState(state: HardRecalcState): void {
    this.eHardRecalcState = state;
  }
  /** Clips actual source sheet endpoints symmetrically for area start/end listening. @param range - Source range. @param limited - Output range. @param entirelyOut - Output out-of-bounds flag. @returns Whether clipping is needed. */
  LimitRangeToAvailableSheets(range: ScRange, limited: ScRange, entirelyOut: [boolean]): boolean {
    return documen7.LimitRangeToAvailableSheets.call(this, range, limited, entirelyOut);
  }
  /** Binds native area subscriptions after central sheet clipping. @param range - Area. @param group - Group mode. @param listener - Actual listener. @returns Nothing. */
  StartListeningArea(range: ScRange, group: boolean, listener: SvtListener<SfxHint>): void {
    return documen7.StartListeningArea.call(this, range, group, listener);
  }
  /** Ends subscriptions using exactly the original start-listening sheet clipping. @param range - Area. @param group - Group mode. @param listener - Listener. @returns Nothing. */
  EndListeningArea(range: ScRange, group: boolean, listener: SvtListener<SfxHint>): void {
    return documen7.EndListeningArea.call(this, range, group, listener);
  }
  /** Dispatches native hints through existing single-cell broadcasters. Area subscribers are dispatched by Broadcast. @param hint - Hint. @returns Whether delivered. */
  BroadcastHintInternal(hint: ScHint): boolean {
    return documen7.BroadcastHintInternal.call(this, hint);
  }
  /** Broadcasts a normal single-cell change and tracks its dependent formulas. @param hint - Hint. @returns Nothing. */
  Broadcast(hint: ScHint): void {
    return documen7.Broadcast.call(this, hint);
  }
  /** Original inline flag used by native final tracking. @returns Final-round state. */
  IsFinalTrackFormulas(): boolean {
    return this.mbFinalTrackFormulas;
  }
  /** Reads actual native deferred tracking state. @returns Pending. */
  IsTrackFormulasPending(): boolean {
    return this.mbTrackFormulasPending;
  }
  /** Completes native bulk-collected tracking,then performs its final non-bulk round. @param id - Hint ID. @returns Nothing. */
  FinalTrackFormulas(id: SfxHintId): void {
    return documen7.FinalTrackFormulas.call(this, id);
  }
  /** Reports native logical formula-tree membership. @param cell - Formula. @returns Membership. */
  IsInFormulaTree(cell: ScFormulaCell): boolean {
    return cell.GetPrevious() !== null || this.pFormulaTree === cell;
  }
  /** Reports native logical tracking membership. @param cell - Formula. @returns Membership. */
  IsInFormulaTrack(cell: ScFormulaCell): boolean {
    return cell.GetPreviousTrack() !== null || this.pFormulaTrack === cell;
  }
  /** Appends a formula to the native calculation list. This is logical ordering, not object lifetime management. @param cell - Formula. @returns Nothing. */
  PutInFormulaTree(cell: ScFormulaCell): void {
    this.RemoveFromFormulaTree(cell);
    if (this.pEOFormulaTree) this.pEOFormulaTree.SetNext(cell);
    else this.pFormulaTree = cell;
    cell.SetPrevious(this.pEOFormulaTree);
    cell.SetNext(null);
    this.pEOFormulaTree = cell;
    this.nFormulaCodeInTree += cell.GetCode().GetCodeLen();
  }
  /** Removes native calculation membership and preserves the normal counter/clamp result. @param cell - Formula. @returns Nothing. */
  RemoveFromFormulaTree(cell: ScFormulaCell): void {
    return documen7.RemoveFromFormulaTree.call(this, cell);
  }
  /** Reads the actual native RPN count in the calculation list. @returns Count. */
  GetFormulaCodeInTree(): number {
    return this.nFormulaCodeInTree;
  }
  /** Appends tracking membership after removing calculation membership. @param cell - Formula. @returns Nothing. */
  AppendToFormulaTrack(cell: ScFormulaCell): void {
    this.RemoveFromFormulaTrack(cell);
    this.RemoveFromFormulaTree(cell);
    if (this.pEOFormulaTrack) this.pEOFormulaTrack.SetNextTrack(cell);
    else this.pFormulaTrack = cell;
    cell.SetPreviousTrack(this.pEOFormulaTrack);
    cell.SetNextTrack(null);
    this.pEOFormulaTrack = cell;
    this.nFormulaTrackCount = (this.nFormulaTrackCount + 1) & 0xffff;
  }
  /** Removes a formula's native tracking links. @param cell - Formula. @returns Nothing. */
  RemoveFromFormulaTrack(cell: ScFormulaCell): void {
    return documen7.RemoveFromFormulaTrack.call(this, cell);
  }
  /** Performs native two-pass single-cell tracking, including contiguous-row hint compression. Bulk/area/group/script services are not represented. @param id - Hint ID. @returns Nothing. */
  TrackFormulas(id: SfxHintId = SfxHintId.ScDataChanged): void {
    return documen7.TrackFormulas.call(this, id);
  }
  /** Calculates represented dirty scalar formulas from the real tree; re-scan after recursive reads remove other tree nodes. @param onlyForced - Native forced-only mode. @returns Nothing. */
  CalcFormulaTree(onlyForced = false): void {
    return documen7.CalcFormulaTree.call(this, onlyForced);
  }
  /** Marks all represented formulas with the actual native default dirty context; deleted-tab restoration is unsupported. @param context - Dirty context. @returns Nothing. */
  SetAllFormulasDirty(context: SetFormulaDirtyContext): void {
    return documen7.SetAllFormulasDirty.call(this, context);
  }
  /** Writes supported numeric formula content through the existing sheet/column owner chain. @param position - Cell. @param source - Formula. @param grammar - ODFF grammar. @returns Nothing. */
  SetFormula(position: ScAddress, source: OUStringConstReference, grammar: Grammar): void {
    this.FetchTable(position.Tab())?.SetFormula(position.Col(), position.Row(), source, grammar);
  }
  /** Transfers a compiled formula into the canonical sheet/column store. Position/document matching is the caller precondition. @param position - Target. @param cell - Matching native owner. @returns Adopted cell or null for an absent sheet. */
  SetFormulaCell(position: ScAddress, cell: ScFormulaCell): ScFormulaCell | null {
    const table = this.FetchTable(position.Tab());
    if (table) return table.SetFormulaCell(position.Col(), position.Row(), cell);
    cell.Dispose();
    return null;
  }
  /** Borrows the actual formula cell, or native null. @param position - Cell. @returns Formula cell or null. */
  GetFormulaCell(position: ScAddress): ScFormulaCell | null {
    return this.FetchTable(position.Tab())?.GetFormulaCell(position.Col(), position.Row()) ?? null;
  }
  /** Reads the native compiler/interpreter error code. @param position - Cell. @returns Error. */
  GetErrCode(position: ScAddress): FormulaError {
    return this.FetchTable(position.Tab())?.GetErrCode(position) ?? FormulaError.NONE;
  }
  /** Borrows the actual shared string pool. @returns Pool. */
  GetSharedStringPool(): SharedStringPool {
    return this.mpCellStringPool;
  }
  /** Reads the normal native row limit. @returns Last row. */
  MaxRow(): number {
    return MAXROW;
  }
  /** Reads the normal native column limit. @returns Last column. */
  MaxCol(): number {
    return MAXCOL;
  }
  /** Reports the full logical row domain of every column store. @returns Count. */
  GetMaxRowCount(): number {
    return MAXROWCOUNT;
  }
  /** Reads the native sheet-limit column count. @returns Count. */
  GetMaxColCount(): number {
    return this.mxSheetLimits.GetMaxColCount();
  }
  /** Original reference-expansion policy getter. @returns Expand adjacent references. */
  IsExpandRefs(): boolean {
    return this.bExpandRefs;
  }
  /** Original reference-expansion policy setter. @param value - Policy. @returns Nothing. */
  SetExpandRefs(value: boolean): void {
    this.bExpandRefs = value;
  }
  /** Checks native row bounds. @param row - Row. @returns Validity. */
  ValidRow(row: number): boolean {
    return ValidRow(row, MAXROW);
  }
  /** Checks native column/row bounds. @param col - Column. @param row - Row. @returns Validity. */
  ValidColRow(col: number, row: number): boolean {
    return ValidCol(col, MAXCOL) && this.ValidRow(row);
  }
  /** Reports actual sheet ownership count. @returns Count. */
  GetTableCount(): number {
    return this.maTabs.length;
  }
  /** Borrows a real existing sheet or native null result. @param tab - Sheet. @returns Owner or null. */
  FetchTable(tab: number): ScTable | null {
    return ValidTab(tab) ? (this.maTabs[tab] ?? null) : null;
  }
  /** Copies the sheet name or clears the output for a missing sheet. @param tab - Sheet. @param output - Unicode target. @returns Found. */
  GetName(tab: number, output: OUString): boolean {
    const table = this.FetchTable(tab);
    if (!table) {
      output.clear();
      return false;
    }
    output.assign(table.GetName());
    return true;
  }
  /** Applies native editable sheet-name character constraints without a fabricated length limit. @param name - Native Unicode name. @returns Validity. */
  static ValidTabName(name: OUStringConstReference): boolean {
    const value = text(name);
    return !!value && !/[:\\/?*[\]]/.test(value) && !value.startsWith("'") && !value.endsWith("'");
  }
  /** Rejects duplicate names using the existing real uppercase operation. @param name - New name. @returns Availability. */
  ValidNewTabName(name: OUStringConstReference): boolean {
    if (!ScDocument.ValidTabName(name)) return false;
    const candidate = uppercase(name, this.locale);
    for (const table of this.maTabs)
      if (table && uppercase(table.GetName(), this.locale).equals(candidate)) return false;
    return true;
  }
  /** Inserts a normal scalar sheet and updates shifted sheet/column positions. External-document/undo-delete modes remain unsupported APIs. @param position - Position or native append sentinel. @param name - Native sheet name. @returns Inserted. */
  InsertTab(position: number, name: OUStringConstReference): boolean {
    if (this.maTabs.length > MAXTAB || !this.ValidNewTabName(name)) return false;
    if (position === SC_TAB_APPEND || position >= this.maTabs.length) position = this.maTabs.length;
    if (!ValidTab(position)) return false;
    this.maTabs.splice(position, 0, new ScTable(this, position, name));
    for (let i = position + 1; i < this.maTabs.length; i++) this.maTabs[i]?.SetTabNo(i);
    const shifted = new ScRange(0, 0, position, this.MaxCol(), this.MaxRow(), MAXTAB);
    if (position < this.maTabs.length - 1)
      this.pBASM?.UpdateBroadcastAreas(UpdateRefMode.URM_INSDEL, shifted, 0, 0, 1);
    this.SetAllFormulasDirty(new SetFormulaDirtyContext());
    return true;
  }
  /** Deletes a scalar/local-reference sheet,retaining native last-sheet protection and disposing its semantic subscriptions before index changes. Cross-sheet and other unported services remain unavailable. @param tab - Existing sheet index. @returns Whether deleted. */
  DeleteTab(tab: number): boolean {
    if (!this.FetchTable(tab) || this.maTabs.length <= 1) return false;
    const shifted = new ScRange(0, 0, tab, this.MaxCol(), this.MaxRow(), this.GetTableCount() - 1);
    this.pBASM?.DelBroadcastAreasInRange(new ScRange(0, 0, tab, this.MaxCol(), this.MaxRow(), tab));
    const iterator = new ScHorizontalCellIterator(this, tab, 0, 0, this.MaxCol(), this.MaxRow());
    const col: [number] = [0],
      row: [number] = [0];
    let cell;
    while ((cell = iterator.GetNext(col, row))) cell.getFormula()?.Dispose();
    (this.maTabs[tab] as ScTable).DisposeAttributes();
    this.maTabs.splice(tab, 1);
    for (let index = tab; index < this.maTabs.length; index++) this.maTabs[index]?.SetTabNo(index);
    this.pBASM?.UpdateBroadcastAreas(UpdateRefMode.URM_INSDEL, shifted, 0, 0, -1);
    this.SetAllFormulasDirty(new SetFormulaDirtyContext());
    return true;
  }
  /** Writes a number through the actual sheet/column chain. @param position - Cell address. @param value - Number. @returns Nothing. */
  SetValue(position: ScAddress, value: number): void {
    this.FetchTable(position.Tab())?.SetValue(position.Col(), position.Row(), value);
  }
  /** Reads numeric cells with native zero fallback. @param position - Cell address. @returns Value. */
  GetValue(position: ScAddress): number {
    return this.FetchTable(position.Tab())?.GetValue(position.Col(), position.Row()) ?? 0;
  }
  /** Reads the actual stored scalar discriminator. @param position - Cell address. @returns Type. */
  GetCellType(position: ScAddress): CellType {
    return documen7.GetCellType.call(this, position);
  }
  /** Returns an independent shared-string value. @param position - Cell address. @returns Shared text. */
  GetSharedString(position: ScAddress): SharedString {
    return documen7.GetSharedString.call(this, position);
  }
  /** Implements the literal single-line content portion of SetTextCell;rich edit-text and number-format attributes are explicit gaps. @param position - Cell address. @param value - Literal Unicode input. @returns Nothing. */
  SetTextCell(position: ScAddress, value: OUStringConstReference): void {
    documen7.SetTextCell.call(this, position, value);
  }
  /** Clears an existing scalar cell without allocating a missing column or sheet. @param position - Cell address. @returns Nothing. */
  SetEmptyCell(position: ScAddress): void {
    this.FetchTable(position.Tab())?.SetEmptyCell(position.Col(), position.Row());
  }
}

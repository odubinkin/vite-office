/** @fileoverview Consumed Calc document functions and original document-operation dispatch. */
import {
  CreateConditionalFormatUndoData,
  ScUndoConditionalFormat,
  ScUndoConditionalFormatList,
  ScUndoRemoveMerge,
} from "../undo/undoblk";
import {
  ScCondDateFormatEntry,
  ScCondFormatEntry,
  type ScConditionalFormat,
  type ScConditionalFormatList,
} from "../../../inc/conditio";
import type { ScRangeList } from "../../../inc/rangelst";
import { PreprocessAllRangeNamesUpdate } from "../../core/data/document10.rangenames";
import { CloneRangeNameMap, type ScRangeName, type ScRangeNameMap } from "../../core/tool/rangenam";
import { ScUndoAllRangeNames } from "../undo/undorangename";
import { InsertNameListOperation } from "../operation/InsertNameListOperation";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Color } from "../../../../tools/inc/color";
import { CreateNames, type ConfirmCreateName } from "./docfunc.names";
import type { CreateNameFlags } from "../inc/scui_def";
import { ScUndoPageBreak, ScUndoRangeNames } from "../undo/undocell";
import { ScUndoTabColor, type ScUndoTabColorInfo } from "../undo/undotab";
import { SetFormulaOperation } from "../operation/SetFormulaOperation";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { RowHeightContext } from "../../../inc/rowheightcontext";
import { ScRange, type ScAddress } from "../../../inc/address";
import { ChangeIndentOperation } from "../operation/ChangeIndentOperation";
import type { ScDocShell } from "./docsh";
import type { ScMarkData } from "../../../inc/markdata";
import { HasAttrFlags, InsertDeleteFlags } from "../../../inc/global";
import { DeleteContentOperation } from "../operation/DeleteContentOperation";
import { DeleteCellOperation } from "../operation/DeleteCellOperation";
import { MergeCellsOperation } from "../operation/MergeCellsOperation";
import { ScCellMergeOption } from "../view/cellmergeoption";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScMF } from "../../../inc/attrib";
import { ATTR_MERGE } from "../../../inc/scitems";
import { ScPatternAttr } from "../../../inc/patattr";
/** Native document-function owner delegates to concrete original operation classes. */
export class ScDocFunc {
  /** Borrows the actual shell. @param shell - Document owner. @returns Function owner. */
  constructor(private readonly shell: ScDocShell) {}

  /** Dispatches source merge by rectangle and selected tabs. @param option - Original merge option. @param contents - Move the covered values. @param record - Record history. @param api - Source API mode. @param empty - Clear covered contents. @returns Whether admitted. */
  MergeCells(
    option: ScCellMergeOption,
    contents: boolean,
    record: boolean,
    api: boolean,
    empty = false,
  ): boolean {
    return new MergeCellsOperation(this.shell, option, contents, record, api, empty).run();
  }

  /** Splits source merge anchors and clears overlap only across the affected extended ranges. @param selection - Range or selected-sheet option. @param record - Record history. @returns Whether admitted. */
  UnmergeCells(selection: ScRange | ScCellMergeOption, record: boolean): boolean {
    const option = new ScCellMergeOption(selection);
    if (!option.maTabs.size) return true;
    const doc = this.shell.GetDocument();
    const defaultItem = doc.GetPool()?.GetUserOrPoolDefaultItem(ATTR_MERGE);
    if (!defaultItem) return false;
    const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
    pattern.ItemSetPut(defaultItem);
    let undo: ScDocument | undefined;
    for (const tab of option.maTabs) {
      const range = option.getSingleRange(tab);
      if (!doc.HasAttrib(range, HasAttrFlags.Merged)) continue;
      const extended = new ScRange(range);
      doc.ExtendMergeRange(extended);
      const refresh = new ScRange(extended);
      doc.ExtendOverlapped(refresh);
      if (record) {
        if (!undo) {
          undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
          undo.InitUndo(doc, Math.min(...option.maTabs), Math.max(...option.maTabs));
        }
        doc.CopyToDocument(extended, InsertDeleteFlags.ATTRIB, false, undo);
      }
      const { aStart, aEnd } = extended;
      doc.ApplyPatternAreaTab(
        range.aStart.Col(),
        range.aStart.Row(),
        range.aEnd.Col(),
        range.aEnd.Row(),
        tab,
        pattern,
      );
      doc.RemoveFlagsTab(
        aStart.Col(),
        aStart.Row(),
        aEnd.Col(),
        aEnd.Row(),
        tab,
        ScMF.Hor | ScMF.Ver,
      );
      doc.ExtendMergeRange(refresh, true);
      this.AdjustRowHeight(extended, true, true);
      doc.FetchTable(tab)?.SetStreamValid(false);
    }
    pattern.Dispose();
    if (undo)
      this.shell.GetUndoManager().AddUndoAction(new ScUndoRemoveMerge(this.shell, option, undo));
    this.shell.SetDocumentModified();
    return true;
  }
  /** Commits an all-scope range manager snapshot as one source history action. @param names - Owned draft map. @returns Nothing. */
  ModifyAllRangeNames(names: ScRangeNameMap): void {
    const document = this.shell.GetDocument();
    const undo = new ScUndoAllRangeNames(
      CloneRangeNameMap(document),
      names,
      PreprocessAllRangeNamesUpdate(document, names),
    );
    undo.RedoWithContext(this.shell);
    this.shell.GetUndoManager().AddUndoAction(undo);
    this.shell.SetDocumentModified();
  }

  /** Creates range names from header labels and installs one native scope snapshot. @param range - Source selection. @param flags - Chosen edges. @param confirm - Existing name prompt. @param signal - Dialog session teardown signal. @param scope - Global or sheet-local names. @returns Whether the operation ran. */
  async CreateNames(
    range: ScRange,
    flags: CreateNameFlags,
    confirm: ConfirmCreateName,
    signal: AbortSignal,
    scope = -1,
  ): Promise<boolean> {
    const document = this.shell.GetDocument();
    const live = document.GetRangeName(scope);
    if (!live || signal.aborted) return false;
    const draft = live.Clone();
    try {
      if (
        !(await CreateNames(document, range, flags, draft, confirm)) ||
        signal.aborted ||
        document !== this.shell.GetDocument()
      )
        return false;
      this.ModifyRangeNames(draft, scope);
      return true;
    } finally {
      draft.clear();
    }
  }

  /** Installs one native scope while preserving existing formula names by spelling. @param names - Replacement definitions. @param scope - Sheet index or global. @returns Nothing. */
  ModifyRangeNames(names: ScRangeName, scope = -1): void {
    const live = this.shell.GetDocument().GetRangeName(scope);
    if (!live) return;
    const history = this.shell.GetUndoManager();
    const undo = new ScUndoRangeNames(live.Clone(), names.Clone(), scope);
    undo.RedoWithContext(this.shell);
    history.AddUndoAction(undo);
    this.shell.SetDocumentModified();
  }

  /** Inserts the native sorted name and definition text block. @param position - Upper-left cell. @returns Whether written. */
  InsertNameList(position: ScAddress): boolean {
    return new InsertNameListOperation(this.shell, position).run();
  }
  /** Replaces one source rule group and updates cell keys before publishing the change. @param oldKey - Existing key or zero for a new format. @param format - Owned replacement, or null for removal. @param tab - Active sheet. @param ranges - Replacement associations. @returns Whether the operation was accepted. */
  ReplaceConditionalFormat(
    oldKey: number,
    format: ScConditionalFormat | null,
    tab: number,
    ranges: ScRangeList,
  ): boolean {
    const doc = this.shell.GetDocument();
    const sheet = doc.FetchTable(tab);
    if (!sheet || doc.IsTabProtected(tab)) {
      format?.Dispose();
      return false;
    }
    const undo = CreateConditionalFormatUndoData(doc, tab);
    if (oldKey) {
      const previous = sheet.GetCondFormList().GetFormat(oldKey);
      if (previous) doc.RemoveCondFormatData(previous.GetRange(), tab, oldKey);
      sheet.DeleteConditionalFormat(oldKey);
    }
    if (format) {
      this.EnsureConditionStyles(format);
      doc.AddCondFormatData(ranges, tab, doc.AddCondFormat(format, tab));
    }
    sheet.SetStreamValid(false);
    const redo = CreateConditionalFormatUndoData(doc, tab);
    this.shell.GetUndoManager().AddUndoAction(new ScUndoConditionalFormat(undo, redo, tab));
    this.shell.SetDocumentModified();
    return true;
  }

  /** Replaces the manager's complete rule list with native undo. @param list - Owned accepted list. @param tab - Active sheet. @returns Whether the operation was accepted. */
  SetConditionalFormatList(list: ScConditionalFormatList, tab: number): boolean {
    const doc = this.shell.GetDocument();
    const sheet = doc.FetchTable(tab);
    if (!sheet || doc.IsTabProtected(tab)) {
      list.Dispose();
      return false;
    }
    const undo = CreateConditionalFormatUndoData(doc, tab);
    sheet.GetCondFormList().RemoveFromDocument(doc);
    for (const format of list) this.EnsureConditionStyles(format);
    list.AddToDocument(doc);
    sheet.SetCondFormList(list);
    sheet.SetStreamValid(false);
    const redo = CreateConditionalFormatUndoData(doc, tab);
    this.shell.GetUndoManager().AddUndoAction(new ScUndoConditionalFormatList(undo, redo, tab));
    this.shell.SetDocumentModified();
    return true;
  }

  /** Ensures accepted rules referring to a native stock style bind a real owner. @param format - Accepted rules. @returns Nothing. */
  private EnsureConditionStyles(format: ScConditionalFormat): void {
    const pool = this.shell.GetDocument().GetStyleSheetPool();
    for (let index = 0; index < format.size(); index++) {
      const rule = format.GetEntry(index);
      if (rule instanceof ScCondFormatEntry) pool?.EnsureConditionalStyle(rule.GetStyleName());
      if (rule instanceof ScCondDateFormatEntry)
        pool?.EnsureConditionalStyle(text(rule.GetStyleName()));
    }
  }

  /** Changes one sheet color with the native undo and API flags. @param tab - Sheet. @param color - Native color. @param record - Record history. @param api - Suppress interactive error. @returns Success. */
  SetTabBgColor(tab: number, color: Readonly<Color>, record: boolean, api: boolean): boolean;
  /** Changes a group of sheet colors as one history action. @param colors - Requested colors by tab. @param api - Suppress interactive error. @returns Success. */
  SetTabBgColor(
    colors: readonly { tab: number; newColor: Readonly<Color> }[],
    api: boolean,
  ): boolean;
  /** Dispatches the native single-sheet and grouped color operations. @param target - Sheet or group. @param value - Color or group API flag. @param record - Single-sheet recording flag. @param api - Single-sheet API flag. @returns Success. */
  SetTabBgColor(
    target: number | readonly { tab: number; newColor: Readonly<Color> }[],
    value: Readonly<Color> | boolean,
    record = true,
    api = false,
  ): boolean {
    const doc = this.shell.GetDocument();
    const colors =
      typeof target === "number" ? [{ tab: target, newColor: value as Readonly<Color> }] : target;
    const changes: ScUndoTabColorInfo[] = [];
    for (const { tab, newColor } of colors) {
      if (doc.IsTabProtected(tab)) continue;
      const oldColor = doc.GetTabBgColor(tab);
      doc.SetTabBgColor(tab, newColor);
      if (!doc.GetTabBgColor(tab).equals(newColor)) return false;
      changes.push({ tab, oldColor, newColor: new Color(newColor) });
    }
    if (changes.length === 0) {
      if (!(typeof value === "boolean" ? value : api))
        this.shell.ErrorMessage("Protected cells can not be modified.");
      return false;
    }
    if (record) this.shell.GetUndoManager().AddUndoAction(new ScUndoTabColor(changes));
    this.shell.SetDocumentModified();
    return true;
  }
  /** Inserts the original manual print break before the addressed row or column. @param columns - Column axis. @param position - Native break address. @param record - Whether to record history. @param setModified - Whether to notify the document shell. @returns Success. */
  InsertPageBreak(
    columns: boolean,
    position: ScAddress,
    record: boolean,
    setModified: boolean,
  ): boolean {
    return this.SetPageBreak(columns, position, true, record, setModified);
  }
  /** Removes only the source manual break flag. @param columns - Column axis. @param position - Native break address. @param record - Whether to record history. @param setModified - Whether to notify the document shell. @returns Success. */
  RemovePageBreak(
    columns: boolean,
    position: ScAddress,
    record: boolean,
    setModified: boolean,
  ): boolean {
    return this.SetPageBreak(columns, position, false, record, setModified);
  }
  /** Updates the axis break flag, stream state, and history in native order. @param columns - Column axis. @param position - Native break address. @param insert - Add or remove. @param record - Whether to record history. @param setModified - Whether to notify the document shell. @returns Success. */
  private SetPageBreak(
    columns: boolean,
    position: ScAddress,
    insert: boolean,
    record: boolean,
    setModified: boolean,
  ): boolean {
    const doc = this.shell.GetDocument();
    const sheet = doc.FetchTable(position.Tab());
    const index = columns ? position.Col() : position.Row();
    if (!sheet || !(columns ? doc.ValidCol(index) : doc.ValidRow(index)) || (insert && index === 0))
      return false;
    const manual = columns ? sheet.HasColManualBreak(index) : sheet.HasRowManualBreak(index);
    if (manual === insert) return insert;
    if (record)
      this.shell.GetUndoManager().AddUndoAction(new ScUndoPageBreak(position, columns, insert));
    if (columns) {
      if (insert) sheet.SetColBreak(index, false, true);
      else sheet.RemoveColBreak(index, false, true);
    } else {
      if (insert) sheet.SetRowBreak(index, false, true);
      else sheet.RemoveRowBreak(index, false, true);
    }
    sheet.SetStreamValid(false);
    if (setModified) this.shell.SetDocumentModified();
    return true;
  }
  /** Original formula dispatch consumes the prepared cell through its concrete operation. @param position - Cell position. @param cell - Transferred formula. @param interaction - User interaction. @returns Success. */
  SetFormulaCell(position: ScAddress, cell: ScFormulaCell, interaction: boolean): boolean {
    return new SetFormulaOperation(this, this.shell, position, cell, !interaction).run();
  }
  /** Original default document/sheet height path with current browser96CSSdpi context;unrepresented import locks,device layout and painting remain outside this slice. @param range - Affected rows. @param paint - Native repaint request,projected by existing React invalidation. @param api - Source shrink policy. @returns Changed. */
  AdjustRowHeight(range: ScRange, paint: boolean, api: boolean): boolean {
    void paint;
    const doc = this.shell.GetDocument(),
      context = new RowHeightContext(doc.MaxRow(), 1 / 15, 1 / 15, 1, 1, null);
    return (
      doc
        .FetchTable(range.aStart.Tab())
        ?.SetOptimalHeight(context, range.aStart.Row(), range.aEnd.Row(), api) ?? false
    );
  }
  /** Original indent operation dispatch. @param marks - Native marks. @param increment - Direction. @param api - API. @returns Result. */
  ChangeIndent(marks: ScMarkData, increment: boolean, api: boolean): boolean {
    return new ChangeIndentOperation(this.shell, marks, increment, api).run();
  }
  /** Original marked DeleteContents operation dispatch. @param marks - Selected marks. @param flags - Attribute-only flags. @param record - Record history. @param api - API request. @returns Actual result. */
  DeleteContents(
    marks: ScMarkData,
    flags: InsertDeleteFlags,
    record: boolean,
    api: boolean,
  ): boolean {
    return new DeleteContentOperation(this.shell, marks, flags, record, api).run();
  }
  /** Original cursor DeleteCell operation dispatch. @param position - Cursor. @param marks - Selected sheets. @param flags - Attribute-only flags. @param record - Record history. @param api - API request. @returns Actual result. */
  DeleteCell(
    position: ScAddress,
    marks: ScMarkData,
    flags: InsertDeleteFlags,
    record: boolean,
    api: boolean,
  ): boolean {
    return new DeleteCellOperation(this.shell, position, marks, flags, record, api).run();
  }
}

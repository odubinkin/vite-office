/** @fileoverview Browser input/viewport binding for the current scalar Calc model. Actual cells,marks,formula evaluation and undo stacks remain with native-shaped owners. */
import type { ScPaneCommand } from "../../source/ui/view/tabview";
import { ScMarkData } from "../../inc/markdata";
import { ScViewUtil } from "../../source/ui/view/viewutil";
import * as pointerInput from "./calc-pointer-selection";
import type { CalcPointerKind } from "./calc-pointer-selection";
import * as referenceInput from "./calc-reference-input";
import { GoToAddress, PositionText } from "./calc-name-box";
import * as cellInput from "./calc-cell-input";
import { ScUndoSelectionStyle } from "../../source/ui/undo/undoblk";
import { History } from "./calc-history";
import { ScModule } from "../../inc/scmod";
import { ScRefType } from "../../source/ui/inc/viewdata";
import type { CalcViewOption } from "../../sdi/tabvwsh";
import { SID_NUMBER_TIME } from "../../sdi/formatsh.numformat";
import { ViewOption } from "../../inc/viewopti";
import type { SvxShadowedItem, SvxCharReliefItem } from "../../../editeng/source/items/textitem";
import type { SfxRequest } from "../../../sfx2/source/control/request";
import { ScCellShell } from "../../source/ui/view/cellsh3";
import { ScColBar, ScRowBar } from "../../source/ui/inc/colrowba";
import { ScTabViewShell } from "../../source/ui/inc/tabvwsh";
import type { SvxContourItem } from "../../../editeng/inc/contouritem";
import { SvxCrossedOutItem } from "../../../editeng/inc/crossedoutitem";
import type { SvxOverlineItem } from "../../../editeng/source/items/textitem";
import type { CalcAlignmentAxis } from "../../source/ui/view/formatsh";
import type { SvxCellHorJustify, SvxCellVerJustify } from "../../../editeng/inc/svxenum";
import { FontLineStyle } from "../../../tools/inc/fontenum";
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import type { CalcColorKind } from "../../source/ui/view/formatsh";
import { getCalcSelectionScriptType } from "./calc-selection-script";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import type { CalcCharacterFormat } from "../../source/ui/view/formatsh";
import { ScFormatShell } from "../../source/ui/view/formatsh";
import { OpCode } from "../../../formula/inc/opcode";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ScInputMode, CellType } from "../../inc/global";
import { ScInputHandler } from "../../source/ui/inc/inputhdl";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { ScViewData } from "../../source/ui/inc/viewdata";
import { ScRangeList } from "../../inc/rangelst";
import { ScAddress, ScRange } from "../../inc/address";
import { SfxUndoAction } from "../../../svl/source/undo/undo";
import { cellInputText } from "../editor/cell-input";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { CalcViewport } from "./calc-viewport";
import type { CalcGridViewport } from "../presentation/ScGridWindow";
/** Undoable sheet append within the current scalar document slice. */
class InsertSheetAction extends SfxUndoAction<ScDocShell> {
  /** Retains the inserted sheet identity. @param tab - Tab index. @param name - Valid sheet name. @returns Action. */
  constructor(
    private readonly tab: number,
    private readonly name: string,
  ) {
    super();
  }
  /** Removes the empty sheet after subsequent edits have been undone. @param shell - Shell. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    shell.GetDocument().DeleteTab(this.tab);
  }
  /** Recreates the same sheet before subsequent edits are redone. @param shell - Shell. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    shell.GetDocument().InsertTab(this.tab, unicode(this.name));
  }
  /** Returns the source operation label. @returns Label. */
  override GetComment(): string {
    return "Insert Sheet";
  }
}
/** Transient platform state and input routing;the live workbook is always the shell's real ScDocument. */
export class CalcViewController {
  /** Queries genuine per-view/per-sheet options for source Sfx state. @param option - Original command group. @returns Native state. */
  GetViewOptionState(option: CalcViewOption): boolean {
    if (option === "headers") return this.viewData.IsHeaderMode();
    if (option === "grid") return this.viewData.GetShowGrid();
    return this.viewData.GetOptions().GetOption(ViewOption.FORMULAS);
  }
  /** Routes original view cases without committing the current input draft. @param option - Command identity. @param request - Actual native request. @returns Nothing. */
  ExecuteViewOption(option: CalcViewOption, request: SfxRequest): void {
    if (option === "headers") this.viewShell.ToggleHeaders(request);
    else if (option === "grid") this.viewShell.ToggleSheetGrid(request);
    else this.viewShell.ToggleFormula(request);
    this.Changed();
  }
  /** Reads the native format shell state. @param slot - Numeric shortcut. @returns Slot state. */
  GetNumFormatState(slot: number): ReturnType<ScFormatShell["GetNumFormatState"]> {
    return new ScFormatShell(this.viewData, this.shell).GetNumFormatState(slot);
  }
  /** Routes the number format shortcut after the source slot's input handling. @param request - Native request. @returns Whether applied. */
  ExecuteNumFormat(request: SfxRequest): boolean {
    if (request.GetSlot() !== SID_NUMBER_TIME && !this.Commit()) return false;
    const applied = new ScFormatShell(this.viewData, this.shell).ExecuteNumFormat(request);
    this.Changed();
    return applied;
  }
  /** Reads native source cell style selection. @returns Current cell style state. */
  GetCellStyleState(): ReturnType<ScTabViewShell["GetStyleState"]> {
    return this.viewShell.GetStyleState();
  }
  /** Applies a named cell style to the real view. @param request - Original request. @returns Native result mask. */
  ExecuteCellStyle(request: SfxRequest): number | undefined {
    if (!this.Commit()) {
      request.Ignore();
      return undefined;
    }
    const result = this.viewShell.ExecStyle(request);
    if (request.IsDone()) this.SyncSheetView();
    return result;
  }
  /** Reads whether the latest native style action can be repeated. @returns Repeat eligibility. */
  CanRepeat(): boolean {
    return (
      this.mode === ScInputMode.SC_INPUT_NONE &&
      this.shell.GetUndoManager().GetRepeatAction() instanceof ScUndoSelectionStyle
    );
  }
  /** Repeats the retained action against the current selection. @returns Whether applied. */
  Repeat(): boolean {
    const action = this.shell.GetUndoManager().GetRepeatAction();
    if (!(action instanceof ScUndoSelectionStyle) || !action.Repeat(this.viewShell)) return false;
    this.SyncSheetView();
    return true;
  }
  /** Routes native indentation through view,document operation and history. @param increment - Direction. @returns Result. */
  ChangeIndent(increment: boolean): boolean {
    if (!this.Commit()) return false;
    const changed = new ScCellShell(this.viewShell).ChangeIndent(increment);
    this.Changed();
    return changed;
  }
  /** Native row-height request routing. @param request - Source request. @returns Typed height present. */
  ExecuteRowHeight(request: SfxRequest): boolean {
    const consumed = new ScCellShell(this.viewShell).ExecuteRowHeight(request, this.viewData);
    if (consumed) {
      this.addressText = PositionText.call(this);
      this.Changed();
    }
    return consumed;
  }
  /** Native accepted row-height result. @param twips - Height. @returns Recorded request. */
  CompleteRowHeight(twips: number): SfxRequest {
    const request = new ScCellShell(this.viewShell).CompleteRowHeight(twips);
    this.addressText = PositionText.call(this);
    this.Changed();
    return request;
  }
  /** Native row visibility. @param show - Visible. @returns Nothing. */
  ShowRows(show: boolean): void {
    if (!this.Commit()) return;
    new ScCellShell(this.viewShell).ShowRows(show);
    this.addressText = PositionText.call(this);
    this.Changed();
  }
  /** Routes typed source width arguments through the actual cell shell. @param request - Native request. @returns Typed width consumed. */
  ExecuteColumnWidth(request: SfxRequest): boolean {
    const consumed = new ScCellShell(this.viewShell).ExecuteColumnWidth(request, this.viewData);
    if (consumed) {
      this.addressText = PositionText.call(this);
      this.Changed();
    }
    return consumed;
  }
  /** Applies accepted native dialog twips and returns its separate completed recording request. @param twips - Input twips. @returns Recording request. */
  CompleteColumnWidth(twips: number): SfxRequest {
    const request = new ScCellShell(this.viewShell).CompleteColumnWidth(twips);
    this.addressText = PositionText.call(this);
    this.Changed();
    return request;
  }
  /** Borrows real header operations with the current fixed browser96CSSdpi scale. @param width - Column or row axis. @returns Native header geometry. */
  private HeaderBar(width: boolean): ScColBar | ScRowBar {
    return width ? new ScColBar(this.viewShell, 1 / 15) : new ScRowBar(this.viewShell, 1 / 15);
  }
  /** Reads actual native pixel geometry during header tracking. @param width - Axis. @param index - Entry. @returns Pixels. */
  GetHeaderEntrySize(width: boolean, index: number): number {
    return this.HeaderBar(width).GetEntrySize(index);
  }
  /** Completes header tracking through native size/history owners;active edit views prohibit resizing. @param width - Axis. @param index - Entry. @param pixels - Native UInt16 pixel size. @returns Nothing. */
  SetHeaderEntrySize(width: boolean, index: number, pixels: number): void {
    if (this.mode !== ScInputMode.SC_INPUT_NONE) return;
    this.HeaderBar(width).SetEntrySize(index, pixels);
    this.addressText = PositionText.call(this);
    this.Changed();
  }
  /** Completes a negative header drag through the original hide-range operation. @param width - Axis. @param first - First entry. @param last - Last entry. @returns Nothing. */
  HideHeaderEntries(width: boolean, first: number, last: number): void {
    if (this.mode !== ScInputMode.SC_INPUT_NONE) return;
    this.HeaderBar(width).HideEntries(first, last);
    this.addressText = PositionText.call(this);
    this.Changed();
  }
  /** Native column visibility command over current marks. @param show - Requested visibility. @returns Nothing. */
  ShowColumns(show: boolean): void {
    if (!this.Commit()) return;
    new ScCellShell(this.viewShell).ShowColumns(show);
    this.addressText = PositionText.call(this);
    this.Changed();
  }
  /** Admits pending input then delegates native Clear through cell/view/document operation owners. @returns Whether admitted. */
  ResetAttributes(): boolean {
    if (!this.Commit()) return false;
    const changed = new ScCellShell(this.viewShell).ResetAttributes();
    this.Changed();
    return changed;
  }
  /** Queries the actual merged native wrap item. @returns Wrapped or mixed. */
  GetWrapTextState(): boolean | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetWrapTextState();
  }
  /** Admits pending input before the source line-break command and publishes actual source state. @param request - Mapped native request. @returns Native operation admission. */
  ExecuteWrapText(request: SfxRequest): boolean {
    if (!this.Commit()) return false;
    const result = new ScFormatShell(this.viewData, this.shell).ExecuteWrapText(request);
    this.Changed();
    return result;
  }
  /** Reads the actual cell protection attribute. @returns Whether locked. */
  GetCellProtectionState(): boolean {
    return new ScFormatShell(this.viewData, this.shell).GetCellProtectionState();
  }
  /** Commits pending input and applies the original protection slot. @param request - Native request. @returns Whether applied. */
  ExecuteCellProtection(request: SfxRequest): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).ExecuteCellProtection(request);
    this.Changed();
    return changed;
  }
  /** Selects unlocked cells through the actual marks owner. @returns Whether admitted. */
  SelectUnprotectedCells(): boolean {
    if (!this.Commit()) return false;
    new ScCellShell(this.viewShell).SelectUnprotectedCells();
    this.SyncSheetView();
    return true;
  }
  /** Reads actual selected cell alignment. @param axis - Native axis. @returns Original enum or mixed. */
  GetAlignment(axis: CalcAlignmentAxis): SvxCellHorJustify | SvxCellVerJustify | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetAlignment(axis);
  }
  /** Commits native input before original explicit/toggle alignment application. @param axis - Native axis. @param value - Original enum. @param toggle - Toolbar radio-toggle path. @returns Changed. */
  SetAlignment(
    axis: CalcAlignmentAxis,
    value: SvxCellHorJustify | SvxCellVerJustify,
    toggle: boolean,
  ): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetAlignment(axis, value, toggle);
    this.Changed();
    return changed;
  }
  /** Reads original selected diagonal attribute state. @param which - Native diagonal identity. @returns Original binding. */
  GetDiagonalState(which: 141 | 142): import("../../../sfx2/source/control/bindings").SfxSlotState {
    return new ScFormatShell(this.viewData, this.shell).GetDiagonalState(which);
  }
  /** Reads source border-style/color bindings. @param color - Color slot. @returns Native state. */
  GetFrameLineState(color: boolean): import("../../../sfx2/source/control/bindings").SfxSlotState {
    return new ScFormatShell(this.viewData, this.shell).GetFrameLineState(color);
  }
  /** Commits actual input before original border formatting. @param request - Typed native request. @returns Result. */
  ExecuteBorder(request: SfxRequest): boolean {
    if (!this.Commit()) return false;
    const result = new ScFormatShell(this.viewData, this.shell).ExecuteBorder(request);
    this.Changed();
    return result;
  }
  /** Reads genuine source color state. @param kind - Native slot kind. @returns Native item or mixed. */
  GetColor(kind: CalcColorKind): SvxColorItem | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetColor(kind);
  }
  /** Commits input before source color execution. @param kind - Native slot kind. @param color - Full optional toolbox item. @returns Changed. */
  SetColor(kind: CalcColorKind, color?: SvxColorItem): boolean {
    if (color !== undefined && !(color instanceof SvxColorItem))
      throw new TypeError("Color requires SvxColorItem");
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetColor(kind, color);
    this.Changed();
    return changed;
  }
  /** Reads the effective native font for source-selected scripts. @returns Uniform family or mixed. */
  GetFontFamily(): string | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetFontFamily(
      getCalcSelectionScriptType(this.viewData),
    );
  }
  /** Commits pending input before applying a complete native font value. @param font - Toolbox item. @returns Changed. */
  SetFontFamily(font: SvxFontItem): boolean {
    if (!(font instanceof SvxFontItem)) throw new TypeError("CharFontName requires SvxFontItem");
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetFontFamily(
      font,
      getCalcSelectionScriptType(this.viewData),
    );
    this.Changed();
    return changed;
  }
  viewData: ScViewData;
  private viewShell: ScTabViewShell;
  private readonly detachShell: () => void;
  readonly inputHandler = new ScInputHandler();
  /** Exposes the canonical native input mode. @returns Mode. */
  get mode(): ScInputMode {
    return this.inputHandler.GetMode();
  }
  protected pointerKind: CalcPointerKind | null = null;
  /** Routes actual pointer admission to native selection owners. @param position - Cell. @param extend - Shift. @param append - Ctrl/Cmd. @param kind - Surface. @returns Admitted. */
  StartPointer(
    position: ScAddress,
    extend = false,
    append = false,
    kind: CalcPointerKind = "cell",
  ): boolean {
    return pointerInput.StartPointer.call(this, position, extend, append, kind);
  }
  /** Tracks the admitted pointer endpoint. @param position - Cell. @returns Nothing. */ MovePointer(
    position: ScAddress,
  ): void {
    pointerInput.MovePointer.call(this, position);
  }
  /** Completes native pointer selection. @returns Nothing. */ EndPointer(): void {
    pointerInput.EndPointer.call(this);
  }
  inputSelection: readonly [number, number] = [0, 0];
  readonly scModule = new ScModule(
    /** Borrows this host's active native input handler. @returns Handler. */ () =>
      this.inputHandler,
  );
  /** Stores an actual DOM edit selection without invalidating the controlled input. @param start - UTF16 start. @param end - UTF16 end. @returns Nothing. */
  SetInputSelection(start: number, end: number): void {
    if (start === this.inputSelection[0] && end === this.inputSelection[1]) return;
    this.inputSelection = [start, end];
    this.inputHandler.ReferenceSelectionChanged();
  }
  /** Routes pointer entry through native input/reference owners before ordinary Commit. @param position - Cell. @param extend - Extend reference. @param append - Append argument. @returns Consumed. */
  PointReference(position: ScAddress, extend = false, append = false): boolean {
    return referenceInput.PointReference.call(this, position, extend, append);
  }
  /** Updates the current native reference endpoint. @param position - Cell. @returns Nothing. */
  DragReference(position: ScAddress): void {
    referenceInput.DragReference.call(this, position);
  }
  /** Moves the native reference endpoint without committing the edited cell. @param dx - Column movement. @param dy - Row movement. @param extend - Extend reference anchor. @returns Nothing. */
  NavigateReference(dx: number, dy: number, extend: boolean): void {
    referenceInput.NavigateReference.call(this, dx, dy, extend);
  }
  /** Borrows current reference geometry for grid painting. @returns Reference or null. */
  ReferenceRange(): ScRange | null {
    return referenceInput.ReferenceRange.call(this);
  }
  inputText = "";
  addressText: string;
  error = "";
  private readonly gridViewport = new CalcViewport();
  private revision = 0;
  private commandStateRevision = 0;
  /** Borrows the measured browser projection. @returns Current grid viewport. */
  get viewport(): CalcGridViewport {
    return this.gridViewport.current;
  }
  private readonly listeners = new Set<() => void>();
  private anchor: ScAddress;
  /** Binds canonical model/view owners. @param shell - Active shell. @returns Controller. */
  constructor(readonly shell: ScDocShell = new ScDocShell()) {
    this.viewShell = new ScTabViewShell(shell, this.scModule);
    this.BindViewErrorMessage();
    this.viewData = this.viewShell.GetViewData();
    this.anchor = this.Position();
    this.addressText = PositionText.call(this);
    this.detachShell = shell.Subscribe(
      /** Rebinds only when the canonical model identity changes. @returns Nothing. */ () => {
        if (this.viewData.GetDocument() !== shell.GetDocument()) {
          this.viewShell = new ScTabViewShell(shell, this.scModule);
          this.BindViewErrorMessage();
          this.viewData = this.viewShell.GetViewData();
          this.anchor = this.Position();
          this.inputHandler.SetMode(ScInputMode.SC_INPUT_NONE);
          this.inputHandler.ResetInputState();
          this.inputText = "";
          this.addressText = PositionText.call(this);
          this.error = "";
        }
        this.Changed();
      },
    );
  }
  /** Projects native ErrorMessage through the existing browser error UI and actual pointer lifetime. @returns Nothing. */
  private BindViewErrorMessage(): void {
    const report =
      /** Ends pointer tracking and shows the resolved operation error. @param message - Native resource. @returns Nothing. */ (
        message: string,
      ): void => {
        this.EndPointer();
        this.error = message;
        this.Changed();
      };
    this.viewShell.SetErrorMessageHandler(report);
    this.shell.SetErrorMessageHandler(report);
  }
  readonly GetSnapshot =
    /** Stable React external-store snapshot. @returns Revision. */ (): number => this.revision;
  /** Reads the command target revision without viewport-only changes. @returns Current command state revision. */
  GetCommandStateRevision(): number {
    return this.commandStateRevision;
  }
  readonly Subscribe =
    /** Subscribes a platform presenter. @param listener - Invalidation listener. @returns Cleanup. */ (
      listener: () => void,
    ): (() => void) => {
      this.listeners.add(listener);
      return /** Detaches the listener. @returns Whether removed. */ () =>
        this.listeners.delete(listener);
    };
  /** Publishes source/controller changes once per input operation. @param publishOrigin - Whether a scroll changed the view origin. @returns Nothing. */
  private Changed(publishOrigin = false): void {
    this.commandStateRevision++;
    this.PublishView(publishOrigin);
  }
  /** Updates the browser projection without modifying the command target. @param publishOrigin - Whether to store the browser scroll origin. @returns Nothing. */
  private PublishView(publishOrigin = false): void {
    this.gridViewport.Update(this.viewData, publishOrigin);
    this.revision++;
    for (const listener of this.listeners) listener();
  }
  /** Reads current native cursor. @returns Independent coordinate value. */
  Position(): ScAddress {
    return new ScAddress(
      this.viewData.GetCurX(),
      this.viewData.GetCurY(),
      this.viewData.GetTabNumber(),
    );
  }
  /** Gets A1 cursor text for the bounded local address convention. @returns Name-box value. */
  Address(): string {
    let col = this.viewData.GetCurX() + 1,
      name = "";
    while (col > 0) {
      col--;
      name = String.fromCharCode(65 + (col % 26)) + name;
      col = Math.floor(col / 26);
    }
    return name + (this.viewData.GetCurY() + 1);
  }
  /** Reads source content for the formula/input line. @returns Editable input. */
  Input(): string {
    return this.mode === ScInputMode.SC_INPUT_NONE
      ? cellInputText(this.shell.GetDocument(), this.Position())
      : this.inputText;
  }
  /** Sets a canonical cursor/mark range. @param col - Requested column. @param row - Requested row. @param extend - Extend from anchor. @param keepOld - Preserve a relative move's original merged-cell coordinates. @returns Whether accepted. */
  Select(col: number, row: number, extend = false, keepOld = false): boolean {
    this.shell.EnsureOpen();
    const doc = this.shell.GetDocument();
    col = Math.max(0, Math.min(doc.MaxCol(), col));
    row = Math.max(0, Math.min(doc.MaxRow(), row));
    if (!this.Commit()) return false;
    if (!this.viewShell.CanSelectCell(col, row)) return false;
    if (!keepOld) this.viewData.ResetOldCursor();
    this.viewShell.DoneBlockMode();
    this.viewShell.GetFunctionSet().SetAnchorFlag(false);
    this.viewShell.GetHeaderFunctionSet().SetAnchorFlag(false);
    this.viewData.SetCurX(col);
    this.viewData.SetCurY(row);
    const pos = this.Position(),
      marks = this.viewData.GetMarkData();
    marks.ResetMark();
    if (extend)
      marks.SetMarkArea(
        new ScRange(this.anchor.Col(), this.anchor.Row(), pos.Tab(), col, row, pos.Tab()),
      );
    else this.anchor = pos;
    this.addressText = PositionText.call(this);
    this.error = "";
    this.Changed();
    return true;
  }
  /** Routes arrow keys to native relative cursor motion or expanded block selection. @param columns - Horizontal delta. @param rows - Vertical delta. @param extend - Extend the actual selection. @returns Accepted. */
  Navigate(columns: number, rows: number, extend = false): boolean {
    if (extend) {
      if (!this.Commit() || !this.viewShell.ExpandBlock(columns, rows)) return false;
      this.Changed();
      return true;
    }
    const [column, row] = this.viewShell.GetRelativeCursor(
      this.viewData.GetCurX(),
      this.viewData.GetCurY(),
      columns,
      rows,
    );
    return this.Select(column, row, false, true);
  }
  /** Sends one row/column/all selection to the actual mark owner. @param kind - Header identity. @param index - Coordinate. @returns Nothing. */
  Header(kind: "all" | "column" | "row", index: number): void {
    if (kind === "all") {
      if (!this.Commit()) return;
      this.viewShell.SelectAll();
      this.anchor = new ScAddress(0, 0, this.viewData.GetTabNumber());
      this.Changed();
      return;
    }
    this.StartPointer(
      new ScAddress(
        kind === "column" ? index : 0,
        kind === "row" ? index : 0,
        this.viewData.GetTabNumber(),
      ),
      false,
      false,
      kind,
    );
    this.EndPointer();
  }
  /** Admits pending input before original Deselect and projects InitOwnBlockMode's current-cell anchor without moving the cursor. @returns Whether admitted. */
  DeselectCells(): boolean {
    if (!this.Commit()) return false;
    const marks = this.viewData.GetMarkData(),
      marked = marks.IsMarked() || marks.IsMultiMarked();
    new ScCellShell(this.viewShell).Deselect();
    if (marked) {
      this.anchor = this.Position();
      this.Changed();
    }
    return true;
  }
  /** Admits actual input before source hidden-row/column selection subtraction. @param rows - Row command versus column command. @returns Whether admitted. */
  SelectVisibleCells(rows: boolean): boolean {
    if (!this.Commit()) return false;
    const shell = new ScCellShell(this.viewShell);
    if (rows) shell.SelectVisibleRows(this.viewData);
    else shell.SelectVisibleColumns(this.viewData);
    this.Changed();
    return true;
  }
  /** Accepts current input before source connected-area/whole-sheet selection. @param request - Source SelectAll request;omitted for SelectData. @returns Accepted. */
  SelectCells(request?: SfxRequest): boolean {
    if (!this.Commit()) return false;
    if (request) new ScCellShell(this.viewShell).ExecuteSelectAll(request, this.viewData);
    else this.viewShell.MarkDataArea();
    const start = this.viewData.GetMarkData().GetMarkArea().aStart;
    this.anchor = new ScAddress(start.Col(), start.Row(), start.Tab());
    this.Changed();
    return true;
  }
  /** Executes original no-argument row selection after accepting the current input. @returns Whether selection was admitted. */
  MarkRows(): boolean {
    if (!this.Commit()) return false;
    this.viewShell.MarkRows();
    const start = this.viewData.GetMarkData().GetMarkArea().aStart;
    this.anchor = new ScAddress(start.Col(), start.Row(), start.Tab());
    this.Changed();
    return true;
  }
  /** Executes original no-argument column selection after accepting the current input. @returns Whether selection was admitted. */
  MarkColumns(): boolean {
    if (!this.Commit()) return false;
    this.viewShell.MarkColumns();
    const start = this.viewData.GetMarkData().GetMarkArea().aStart;
    this.anchor = new ScAddress(start.Col(), start.Row(), start.Tab());
    this.Changed();
    return true;
  }
  /** Queries actual selected font-height state through the native format owner. @returns Uniform points or mixed state. */
  GetFontSize(): number | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetFontSize(
      getCalcSelectionScriptType(this.viewData),
    );
  }
  /** Commits actual input before the native selected-script grow/shrink operation. @param grow - Source grow slot flag. @returns Changed. */
  ChangeFontSize(grow: boolean): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).ChangeFontSize(
      grow,
      getCalcSelectionScriptType(this.viewData),
    );
    this.Changed();
    return changed;
  }
  /** Commits input before the native attribute operation and publishes resulting bindings. @param points - Point height. @returns Whether changed. */
  SetFontSize(points: number): boolean {
    ScFormatShell.ValidateFontSize(points);
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetFontSize(points);
    this.Changed();
    return changed;
  }
  /** Accepts a complete native height item without flattening relative/absolute property metadata. @param height - Source item. @returns Changed. */
  SetFontHeight(height: SvxFontHeightItem): boolean {
    if (!(height instanceof SvxFontHeightItem))
      throw new TypeError("FontHeight requires SvxFontHeightItem");
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetFontHeight(height);
    this.Changed();
    return changed;
  }
  /** Reads real selected character state. @param format - Native operation. @returns Uniform state or mixed. */
  GetCharacterState(format: CalcCharacterFormat): boolean | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetCharacterState(format);
  }
  /** Queries the native Overline state. @returns Active or mixed. */
  GetOverlineState(): boolean | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetOverlineState();
  }
  /** Commits pending text before the source overline attribute operation. @param item - Optional native argument. @returns Whether attributes changed. */
  SetOverline(item?: SvxOverlineItem): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetOverline(item);
    this.Changed();
    return changed;
  }
  /** Reads actual native strikeout state. @returns Active or mixed. */
  GetStrikeoutState(): boolean | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetStrikeoutState();
  }
  /** Commits pending text before original strikeout attribute execution. @param item - Complete native item. @returns Whether changed. */
  SetStrikeout(item?: SvxCrossedOutItem): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetStrikeout(item);
    this.Changed();
    return changed;
  }
  /** Reads native contour state. @returns Enabled or mixed. */
  GetOutlineState(): boolean | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetOutlineState();
  }
  /** Commits pending input before the original contour attribute operation. @param item - Complete native item. @returns Whether changed. */
  SetOutlineFont(item?: SvxContourItem): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetOutlineFont(item);
    this.Changed();
    return changed;
  }
  /** Original shadow selection state. @returns Shadow or mixed. */
  GetShadowState(): boolean | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetShadowState();
  }
  /** Commits input before original shadow mutation. @param item - Optional native item. @returns Admitted success. */
  SetShadowed(item?: SvxShadowedItem): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetShadowed(item);
    this.Changed();
    return changed;
  }
  /** Original relief state. @returns Enum or mixed. */
  GetReliefState(): number | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetReliefState();
  }
  /** Commits input before original relief mutation. @param item - Native item. @returns Admitted success. */
  SetCharacterRelief(item: SvxCharReliefItem): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetCharacterRelief(item);
    this.Changed();
    return changed;
  }
  /** Publishes the native selected line style. @returns Style or mixed. */
  GetUnderlineStyle(): FontLineStyle | undefined {
    return new ScFormatShell(this.viewData, this.shell).GetUnderlineStyle();
  }
  /** Commits input before the source underline variant command. @param style - Requested line. @returns Changed. */
  SetUnderlineStyle(
    style: FontLineStyle.LINESTYLE_SINGLE | FontLineStyle.LINESTYLE_DOUBLE,
  ): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetUnderlineStyle(style);
    this.Changed();
    return changed;
  }
  /** Commits input before native whole-cell character formatting. @param format - Native operation. @param enabled - Optional explicit value. @returns Changed. */
  SetCharacterFormat(format: CalcCharacterFormat, enabled?: boolean): boolean {
    if (!this.Commit()) return false;
    const changed = new ScFormatShell(this.viewData, this.shell).SetCharacterFormat(
      format,
      enabled,
    );
    this.Changed();
    return changed;
  }
  /** Checks whether the browser can apply the native AutoSum operation to the copied selection. @returns The represented native action can execute. */
  CanAutoSum(): boolean {
    const marks = this.viewData.GetMarkData(),
      ranges = new ScRangeList(),
      doc = this.shell.GetDocument();
    if (marks.IsMarked() || marks.IsMultiMarked()) {
      marks.FillRangeListWithMarks(ranges, false);
      for (const range of ranges)
        if (
          doc.IsBlockEmpty(
            range.aStart.Col(),
            range.aStart.Row(),
            range.aEnd.Col(),
            range.aEnd.Row(),
            range.aStart.Tab(),
          )
        ) {
          const targets = new ScMarkData(marks);
          targets.MarkToSimple();
          return targets.IsMultiMarked() || !ScViewUtil.HasFiltered(targets.GetMarkArea(), doc);
        }
    }
    return true;
  }
  /** Runs original AutoSum and SetFuncString caret selection through real view/input owners. @returns Native selection when an input-line draft was created. */
  AutoSum(): readonly [number, number] | undefined {
    this.error = "";
    try {
      const rangeFinder: [boolean] = [false],
        subtotal: [boolean] = [false],
        formula = this.viewShell.DoAutoSum(rangeFinder, subtotal, OpCode.ocSum);
      try {
        if (formula.isEmpty()) {
          this.addressText = PositionText.call(this);
          this.Changed();
          return undefined;
        }
        const value = text(formula),
          length = value.length,
          open = value.indexOf("(");
        this.StartInput(ScInputMode.SC_INPUT_TOP, value);
        if (rangeFinder[0] && open !== -1 && length > open)
          return [open + (subtotal[0] ? 3 : 1), length - 1];
        return [length - 1, length - 1];
      } finally {
        formula.dispose();
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.Changed();
      return undefined;
    }
  }
  /** Browser projection of original ScInputWindow::StartFormula over actual cell/input owners. @returns Native UTF16 selection endpoints after entering TOP mode. */
  StartFormula(): readonly [number, number] {
    let value = this.Input(),
      start = 1,
      end = 1;
    const length = value.length;
    switch (this.shell.GetDocument().GetCellType(this.Position())) {
      case CellType.CELLTYPE_VALUE:
        end = length + 1;
        value = "=" + value;
        break;
      case CellType.CELLTYPE_STRING:
      case CellType.CELLTYPE_EDIT:
        start = 0;
        end = length;
        break;
      case CellType.CELLTYPE_FORMULA:
        end = length;
        break;
      default:
        value = "=";
        break;
    }
    this.StartInput(ScInputMode.SC_INPUT_TOP, value);
    return [start, end];
  }
  /** Starts actual transient input,optionally replacing the cell text for direct typing. @param mode - Inline or formula-line editing. @param replacement - Optional initial direct input. @returns Whether the input was accepted. */
  StartInput(mode: Exclude<ScInputMode, ScInputMode.SC_INPUT_NONE>, replacement?: string): boolean {
    this.shell.EnsureOpen();
    if (!this.viewShell.CheckCellInput(this.viewData.GetCurX(), this.viewData.GetCurY()))
      return false;
    const original = this.Input(),
      starting = !this.inputHandler.IsInputMode();
    this.inputText = replacement ?? original;
    if (starting || replacement !== undefined)
      this.inputSelection = [this.inputText.length, this.inputText.length];
    if (starting) referenceInput.BindReferenceInput.call(this);
    this.inputHandler.SetMode(mode);
    if (starting || replacement !== undefined)
      this.inputHandler.UpdateInputState(
        this.inputText,
        starting ? mode !== ScInputMode.SC_INPUT_TYPE && original.length > 0 : undefined,
      );
    if (replacement !== undefined) this.inputHandler.SetModified();
    this.error = "";
    this.Changed();
    return true;
  }
  /** Executes native SID_SETINPUTMODE:TOP commits first;TABLE/TYPE toggle without losing the draft. @returns Whether accepted. */
  SetInputMode(): boolean {
    this.shell.EnsureOpen();
    if ((!this.inputHandler.IsInputMode() || this.inputHandler.IsTopMode()) && !this.Commit())
      return false;
    const starting = !this.inputHandler.IsInputMode();
    if (
      starting &&
      !this.viewShell.CheckCellInput(this.viewData.GetCurX(), this.viewData.GetCurY())
    )
      return false;
    this.inputText = this.Input();
    this.inputHandler.StartOrToggleEditMode();
    if (starting) referenceInput.BindReferenceInput.call(this);
    if (this.mode === ScInputMode.SC_INPUT_TABLE)
      this.inputSelection = [this.inputText.length, this.inputText.length];
    this.inputHandler.UpdateInputState(
      this.inputText,
      starting ? this.inputText.length > 0 : undefined,
    );
    this.error = "";
    this.Changed();
    return true;
  }
  /** Updates the input handler's sole draft. @param value - Draft. @returns Nothing. */
  ChangeInput(value: string): void {
    this.inputText = value;
    this.inputSelection = [value.length, value.length];
    this.inputHandler.SetModified();
    this.inputHandler.UpdateInputState(value);
    this.error = "";
    this.Changed();
  }
  FormulaPreview = referenceInput.FormulaPreview;
  /** Cancels without changing cells/history. @returns Nothing. */
  Cancel(): void {
    this.inputHandler.SetMode(ScInputMode.SC_INPUT_NONE);
    this.inputHandler.ResetInputState();
    this.viewData.SetRefMode(false, ScRefType.SC_REFTYPE_NONE);
    this.inputText = "";
    this.error = "";
    this.Changed();
  }
  /** Commits actual input through the existing cell/history owners. @returns Accepted. */
  Commit(): boolean {
    return cellInput.Commit.call(this);
  }
  /** Handles the source EnterString slot payload. @param value - Input string. @param dontCommit - Retain the input-handler draft. @returns Accepted. */
  EnterString(value: string, dontCommit = false): boolean {
    if (!this.StartInput(ScInputMode.SC_INPUT_TABLE, value)) return false;
    return dontCommit || this.Commit();
  }
  /** Changes transient position text. @param value - Name-box draft. @returns Nothing. */
  ChangeAddress(value: string): void {
    this.addressText = value;
    this.Changed();
  }
  /** Dispatches a name-box address, name or new definition. @returns Whether accepted. */
  GoToAddress(): boolean {
    return GoToAddress.call(this);
  }
  /** Source ScTabControl context admission and SwitchToPageId policy:already-selected keeps canonical active sheet/group;unselected selects only its target. @param tab - Real clicked/focused sheet. @returns Whether popup may open. */
  PrepareSheetContextMenu(tab?: number): boolean {
    if (this.inputHandler.IsFormulaMode()) return false;
    if (tab === undefined) return true;
    if (!this.shell.GetDocument().FetchTable(tab)) return false;
    if (this.viewData.GetMarkData().GetTableSelect(tab)) return true;
    if (!this.Commit()) return false;
    this.SelectTab(tab);
    return true;
  }
  /** Switches actual tab/cursor/mark ownership. @param tab - Existing tab. @param extend - Toggle selected sheets. @returns Nothing. */
  SelectTab(tab: number, extend = false): void {
    if (!this.shell.GetDocument().FetchTable(tab) || !this.Commit()) return;
    this.viewShell.SetTabNo(tab, false, extend);
    this.SyncSheetView();
  }
  /** Borrows the active document's source view shell. @returns Current view shell. */
  GetViewShell(): ScTabViewShell {
    return this.viewShell;
  }
  /** Synchronizes the browser's position and command state after native sheet commands. @returns Nothing. */
  SyncSheetView(): void {
    this.anchor = this.Position();
    this.addressText = PositionText.call(this);
    this.Changed();
  }
  /** Executes native adjacent-sheet navigation after accepting pending input. @param direction - Previous or next. @param extend - Extend the selected sheet group. @returns Nothing. */
  SelectNextTab(direction: number, extend = false): void {
    if (!this.Commit()) return;
    this.viewShell.SelectNextTab(direction, extend);
    this.SyncSheetView();
  }
  /** Selects all actual sheets through the source view owner. @returns Nothing. */
  SelectAllTables(): void {
    this.viewShell.SelectAllTables();
    this.Changed();
  }
  /** Deselects the group while retaining the active sheet. @returns Nothing. */
  DeselectAllTables(): void {
    this.viewShell.DeselectAllTables();
    this.Changed();
  }
  /** Queries original tab-group state for the native deselection slot. @returns Multiple selected. */
  HasMultipleSelectedTables(): boolean {
    return this.viewData.GetMarkData().GetSelectCount() > 1;
  }
  /** Appends a real uniquely named sheet and records a reversible action. @returns Nothing. */
  InsertSheet(): void {
    if (!this.Commit()) return;
    const doc = this.shell.GetDocument();
    let index = 1;
    while (!doc.ValidNewTabName(unicode(`Sheet${index}`))) index++;
    const tab = doc.GetTableCount(),
      name = `Sheet${index}`;
    if (!doc.InsertTab(tab, unicode(name))) return;
    this.shell.GetUndoManager().AddUndoAction(new InsertSheetAction(tab, name));
    this.shell.SetDocumentModified();
    this.SelectTab(tab);
  }
  /** Queries actual action availability. @returns Can undo. */
  CanUndo(): boolean {
    return (
      this.mode === ScInputMode.SC_INPUT_NONE &&
      this.shell.GetUndoManager().GetUndoActionCount() > 0
    );
  }
  /** Queries actual redo availability. @returns Can redo. */
  CanRedo(): boolean {
    return (
      this.mode === ScInputMode.SC_INPUT_NONE &&
      this.shell.GetUndoManager().GetRedoActionCount() > 0
    );
  }
  /** Applies real shared Undo and returns the cursor to an edited cell when applicable. @returns Changed. */
  Undo(): boolean {
    return History.call(this, false);
  }
  /** Applies real shared Redo. @returns Changed. */
  Redo(): boolean {
    return History.call(this, true);
  }
  /** Commits pending input before changing the real pane layout. @param command - Source pane command. @param request - Optional typed index and completion. @returns Nothing. */
  ExecutePaneCommand(command: ScPaneCommand, request: SfxRequest): void {
    if (!this.Commit()) {
      request.Ignore();
      return;
    }
    this.viewShell.ExecutePaneCommand(
      command,
      this.gridViewport.SplitDevice(this.viewData),
      request,
    );
    this.Changed();
  }

  /** Repositions the DOM track from the adopted native sheet. @param width - Client width. @param height - Client height. @returns Browser scroll position and whether an origin was stored. */
  RestoreScrollPosition(width: number, height: number) {
    return this.gridViewport.Restore(this.viewData, width, height);
  }
  /** Measures an attached or resized grid without publishing it as a user scroll. @param left - Horizontal pixels. @param top - Vertical pixels. @param width - Client width. @param height - Client height. @returns Nothing. */
  MeasureViewport(left: number, top: number, width: number, height: number): void {
    this.gridViewport.Measure(left, top, width, height);
    this.PublishView();
  }
  /** Routes wheel input to the relevant paired pane axes. @param left - Actual DOM horizontal offset. @param top - Actual DOM vertical offset. @param width - Client width. @param height - Client height. @param dx - Horizontal wheel delta. @param dy - Vertical wheel delta. @param leadingX - Pointer lies in the normal left band. @param leadingY - Pointer lies in the normal top band. @returns New trailing DOM offsets. */
  ScrollPaneWheel(
    left: number,
    top: number,
    width: number,
    height: number,
    dx: number,
    dy: number,
    leadingX: boolean,
    leadingY: boolean,
  ) {
    this.gridViewport.ScrollLeading(leadingX ? dx : 0, leadingY ? dy : 0);
    const offsets = this.gridViewport.WheelTrailing(
      this.viewData,
      left,
      top,
      width,
      height,
      leadingX ? 0 : dx,
      leadingY ? 0 : dy,
    );
    this.gridViewport.Measure(offsets.left, offsets.top, width, height);
    this.PublishView(true);
    return offsets;
  }
  /** Scrolls the normal left and top axes by native logical pixels. @param dx - Left pane delta. @param dy - Top pane delta. @returns Nothing. */
  ScrollLeading(dx: number, dy: number): void {
    if (!dx && !dy) return;
    this.gridViewport.ScrollLeading(dx, dy);
    this.PublishView(true);
  }
  /** Publishes actual browser scrolling to the active view. @param left - Horizontal pixels. @param top - Vertical pixels. @param width - Client width. @param height - Client height. @returns Nothing. */
  Scroll(left: number, top: number, width: number, height: number): void {
    this.PublishView(this.gridViewport.Measure(left, top, width, height));
  }
  /** Projects a native column onto the browser scrollbar. @param column - First visible column. @param clientWidth - Measured width. @returns Physical offset. */
  ScrollLeftForColumn(column: number, clientWidth: number): number {
    return this.gridViewport.LeftForColumn(this.viewData, column, clientWidth);
  }
  /** Projects a native row onto the browser scrollbar. @param row - First visible row. @param clientHeight - Measured height. @returns Physical offset. */
  ScrollTopForRow(row: number, clientHeight: number): number {
    return this.gridViewport.TopForRow(this.viewData, row, clientHeight);
  }
  /** Releases shell/frame subscriber resources on workspace closure. @returns Nothing. */
  Close(): void {
    this.shell.SetErrorMessageHandler();
    this.detachShell();
    this.listeners.clear();
    this.shell.Close();
  }
}

/** @fileoverview Browser input/viewport binding for the current scalar Calc model. Actual cells,marks,formula evaluation and undo stacks remain with native-shaped owners. */
import { ScMarkData } from "../../inc/markdata";
import { ScViewUtil } from "../../source/ui/view/viewutil";
import * as pointerInput from "./calc-pointer-selection";
import type { CalcPointerKind } from "./calc-pointer-selection";
import * as referenceInput from "./calc-reference-input";
import * as cellInput from "./calc-cell-input";
import { ScModule } from "../../inc/scmod";
import { ScRefType } from "../../source/ui/inc/viewdata";
import type { CalcViewOption } from "../../sdi/tabvwsh";
import { ViewOption } from "../../inc/viewopti";
import type { SvxShadowedItem, SvxCharReliefItem } from "../../../editeng/source/items/textitem";

import { ScUndoIndent } from "../../source/ui/undo/undoblk";
import { columnPixels, columnAtPixel } from "../presentation/column-geometry";
import { ScUndoWidthOrHeight } from "../../source/ui/undo/undoblk2";
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
import type { ScTable } from "../../inc/table";
import { rowPixels, rowAtPixel } from "../presentation/row-geometry";
import { ScUndoCursorAttr } from "../../source/ui/undo/undocell";
import { ScUndoSelectionAttr, ScUndoDeleteContents } from "../../source/ui/undo/undoblk3";
import type { CalcCharacterFormat } from "../../source/ui/view/formatsh";
import { ScFormatShell } from "../../source/ui/view/formatsh";
import { OpCode } from "../../../formula/inc/opcode";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ScInputMode, CellType } from "../../inc/global";
import { ScInputHandler } from "../../source/ui/inc/inputhdl";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { ScViewData } from "../../source/ui/inc/viewdata";
import { ScRangeList } from "../../inc/rangelst";
import { ScAddress, ScRange, ScRefFlags } from "../../inc/address";
import { ScUndoSetCell } from "../../source/ui/inc/undocell";
import { SfxUndoAction, SfxListUndoAction } from "../../../svl/source/undo/undo";
import { cellInputText } from "../editor/cell-input";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
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
      this.addressText = this.Address();
      this.Changed();
    }
    return consumed;
  }
  /** Native accepted row-height result. @param twips - Height. @returns Recorded request. */
  CompleteRowHeight(twips: number): SfxRequest {
    const request = new ScCellShell(this.viewShell).CompleteRowHeight(twips);
    this.addressText = this.Address();
    this.Changed();
    return request;
  }
  /** Native row visibility. @param show - Visible. @returns Nothing. */
  ShowRows(show: boolean): void {
    if (!this.Commit()) return;
    new ScCellShell(this.viewShell).ShowRows(show);
    this.addressText = this.Address();
    this.Changed();
  }
  /** Routes typed source width arguments through the actual cell shell. @param request - Native request. @returns Typed width consumed. */
  ExecuteColumnWidth(request: SfxRequest): boolean {
    const consumed = new ScCellShell(this.viewShell).ExecuteColumnWidth(request, this.viewData);
    if (consumed) {
      this.addressText = this.Address();
      this.Changed();
    }
    return consumed;
  }
  /** Applies accepted native dialog twips and returns its separate completed recording request. @param twips - Input twips. @returns Recording request. */
  CompleteColumnWidth(twips: number): SfxRequest {
    const request = new ScCellShell(this.viewShell).CompleteColumnWidth(twips);
    this.addressText = this.Address();
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
    this.addressText = this.Address();
    this.Changed();
  }
  /** Completes a negative header drag through the original hide-range operation. @param width - Axis. @param first - First entry. @param last - Last entry. @returns Nothing. */
  HideHeaderEntries(width: boolean, first: number, last: number): void {
    if (this.mode !== ScInputMode.SC_INPUT_NONE) return;
    this.HeaderBar(width).HideEntries(first, last);
    this.addressText = this.Address();
    this.Changed();
  }
  /** Native column visibility command over current marks. @param show - Requested visibility. @returns Nothing. */
  ShowColumns(show: boolean): void {
    if (!this.Commit()) return;
    new ScCellShell(this.viewShell).ShowColumns(show);
    this.addressText = this.Address();
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
  addressText = "A1";
  error = "";
  viewport: CalcGridViewport = {
    firstColumn: 0,
    firstRow: 0,
    columns: 16,
    rows: 36,
    scrollWidth: 1_000_000,
    scrollLeft: 0,
    columnOffset: 0,
    rowHeight: 22,
    scrollTop: 0,
    rowOffset: 0,
    scrollHeight: 1_000_000,
  };
  private revision = 0;
  private client: { left: number; top: number; width: number; height: number } | undefined;
  private readonly listeners = new Set<() => void>();
  private anchor = new ScAddress();
  /** Binds canonical model/view owners. @param shell - Active shell. @returns Controller. */
  constructor(readonly shell: ScDocShell = new ScDocShell()) {
    this.viewShell = new ScTabViewShell(shell, this.scModule);
    this.BindViewErrorMessage();
    this.viewData = this.viewShell.GetViewData();
    this.detachShell = shell.Subscribe(
      /** Rebinds only when the canonical model identity changes. @returns Nothing. */ () => {
        if (this.viewData.GetDocument() !== shell.GetDocument()) {
          this.viewShell = new ScTabViewShell(shell, this.scModule);
          this.BindViewErrorMessage();
          this.viewData = this.viewShell.GetViewData();
          this.anchor = new ScAddress();
          this.inputHandler.SetMode(ScInputMode.SC_INPUT_NONE);
          this.inputHandler.ResetInputState();
          this.inputText = "";
          this.addressText = "A1";
          this.error = "";
        }
        this.Changed();
      },
    );
  }
  /** Projects native ErrorMessage through the existing browser error UI and actual pointer lifetime. @returns Nothing. */
  private BindViewErrorMessage(): void {
    this.viewShell.SetErrorMessageHandler(
      /** Replaces physical grid/header StopMarking and message presentation with the active browser controls. @param message - Native resolved resource. @returns Nothing. */ (
        message,
      ) => {
        this.EndPointer();
        this.error = message;
        this.Changed();
      },
    );
  }
  readonly GetSnapshot =
    /** Stable React external-store snapshot. @returns Revision. */ (): number => this.revision;
  readonly Subscribe =
    /** Subscribes a platform presenter. @param listener - Invalidation listener. @returns Cleanup. */ (
      listener: () => void,
    ): (() => void) => {
      this.listeners.add(listener);
      return /** Detaches the listener. @returns Whether removed. */ () =>
        this.listeners.delete(listener);
    };
  /** Publishes source/controller changes once per input operation. @returns Nothing. */
  private Changed(): void {
    this.UpdateViewport();
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
  /** Sets a canonical cursor/mark range; native callers clamp before assigning raw view fields. @param col - Requested column. @param row - Requested row. @param extend - Extend from anchor. @returns Whether accepted. */
  Select(col: number, row: number, extend = false): boolean {
    this.shell.EnsureOpen();
    const doc = this.shell.GetDocument();
    col = Math.max(0, Math.min(doc.MaxCol(), col));
    row = Math.max(0, Math.min(doc.MaxRow(), row));
    if (!this.Commit()) return false;
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
    this.addressText = this.Address();
    this.error = "";
    this.Changed();
    return true;
  }
  /** Routes relative keyboard motion through native hidden-column skipping before actual cursor/mark selection. @param columns - Horizontal delta. @param rows - Vertical delta. @param extend - Extend the actual selection. @returns Accepted. */
  Navigate(columns: number, rows: number, extend = false): boolean {
    const old = this.viewData.GetCurX(),
      proposed = Math.max(0, Math.min(this.shell.GetDocument().MaxCol(), old + columns)),
      column = columns ? this.viewShell.SkipCursorHorizontal(proposed, old, columns) : proposed;
    const oldRow = this.viewData.GetCurY(),
      proposedRow = Math.max(0, Math.min(this.shell.GetDocument().MaxRow(), oldRow + rows));
    return this.Select(
      column,
      rows ? this.viewShell.SkipCursorVertical(proposedRow, oldRow, rows) : proposedRow,
      extend,
    );
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
  /** Browser availability boundary over actual native inference and copied marks. Ordinary empty-block fill is available;SUBTOTAL and filtered paste services remain unported. @returns The represented native action can execute. */
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
          const inferred = new ScRangeList(),
            targets = new ScMarkData(marks);
          this.viewShell.GetAutoSumArea(inferred);
          targets.MarkToSimple();
          return (
            (targets.IsMultiMarked() || !ScViewUtil.HasFiltered(targets.GetMarkArea(), doc)) &&
            !this.viewShell.UseSubTotal(inferred)
          );
        }
    } else this.viewShell.GetAutoSumArea(ranges);
    return !this.viewShell.UseSubTotal(ranges);
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
          this.addressText = this.Address();
          this.Changed();
          return undefined;
        }
        const value = text(formula),
          length = value.length,
          open = value.indexOf("(");
        this.StartInput(ScInputMode.SC_INPUT_TOP, value);
        if (rangeFinder[0] && open !== -1 && length > open)
          // GetAutoSumFormula rejects SUBTOTAL before returning in this kernel slice.
          return [open + 1, length - 1];
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
  /** Starts actual transient input,optionally replacing the cell text for direct typing. @param mode - Inline or formula-line editing. @param replacement - Optional initial direct input. @returns Nothing. */
  StartInput(mode: Exclude<ScInputMode, ScInputMode.SC_INPUT_NONE>, replacement?: string): void {
    this.shell.EnsureOpen();
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
  }
  /** Executes native SID_SETINPUTMODE:TOP commits first;TABLE/TYPE toggle without losing the draft. @returns Whether accepted. */
  SetInputMode(): boolean {
    this.shell.EnsureOpen();
    if ((!this.inputHandler.IsInputMode() || this.inputHandler.IsTopMode()) && !this.Commit())
      return false;
    const starting = !this.inputHandler.IsInputMode();
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
    this.StartInput(ScInputMode.SC_INPUT_TABLE, value);
    return dontCommit || this.Commit();
  }
  /** Changes transient position text. @param value - Name-box draft. @returns Nothing. */
  ChangeAddress(value: string): void {
    this.addressText = value;
    this.Changed();
  }
  /** Parses the actual core local-A1 address convention. @returns Whether selected. */
  GoToAddress(): boolean {
    try {
      const pos = this.Position(),
        value = unicode(this.addressText);
      try {
        if (
          !(pos.Parse(value, this.shell.GetDocument(), ScAddress.detailsOOOa1) & ScRefFlags.VALID)
        )
          throw new Error("Invalid cell address.");
      } finally {
        value.dispose();
      }
      return this.Select(pos.Col(), pos.Row());
    } catch (error) {
      this.error = (error as Error).message;
      this.Changed();
      return false;
    }
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
    this.anchor = this.Position();
    this.addressText = this.Address();
    this.Changed();
  }
  /** Executes native adjacent-sheet navigation after accepting pending input. @param direction - Previous or next. @param extend - Extend the selected sheet group. @returns Nothing. */
  SelectNextTab(direction: number, extend = false): void {
    if (!this.Commit()) return;
    this.viewShell.SelectNextTab(direction, extend);
    this.anchor = this.Position();
    this.addressText = this.Address();
    this.Changed();
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
    return this.History(false);
  }
  /** Applies real shared Redo. @returns Changed. */
  Redo(): boolean {
    return this.History(true);
  }
  /** Reconciles source model,active sheet and input after history. @param redo - Direction. @returns Changed. */
  private History(redo: boolean): boolean {
    const manager = this.shell.GetUndoManager(),
      action = redo ? manager.GetRedoAction() : manager.GetUndoAction();
    if (!(redo ? this.shell.Redo() : this.shell.Undo())) return false;
    this.inputHandler.SetMode(ScInputMode.SC_INPUT_NONE);
    this.inputHandler.ResetInputState();
    let cursorAction = action;
    while (cursorAction instanceof SfxListUndoAction)
      cursorAction = cursorAction.GetUndoAction(redo ? cursorAction.GetActionCount() - 1 : 0);
    if (cursorAction instanceof ScUndoWidthOrHeight) {
      this.addressText = this.Address();
      this.Changed();
      return true;
    }
    const position =
      cursorAction instanceof ScUndoSetCell ||
      cursorAction instanceof ScUndoCursorAttr ||
      cursorAction instanceof ScUndoIndent ||
      cursorAction instanceof ScUndoSelectionAttr ||
      cursorAction instanceof ScUndoDeleteContents
        ? cursorAction.getAffectedRange().aStart
        : new ScAddress(
            0,
            0,
            Math.min(this.viewData.GetTabNumber(), this.shell.GetDocument().GetTableCount() - 1),
          );
    this.SelectTab(position.Tab());
    this.Select(position.Col(), position.Row());
    if (
      cursorAction instanceof ScUndoIndent ||
      cursorAction instanceof ScUndoSelectionAttr ||
      cursorAction instanceof ScUndoDeleteContents
    ) {
      this.viewData.GetMarkData().assign(cursorAction.GetMarkData());
      this.Changed();
    }
    return true;
  }
  /** Maps browser scroll geometry to logical sheet coordinates without CSS-size overflow. @param left - Horizontal pixels. @param top - Physical vertical pixels. @param width - Client width. @param height - Client height. @returns Nothing. */
  Scroll(left: number, top: number, width: number, height: number): void {
    this.client = { left, top, width, height };
    this.Changed();
  }
  /** Refreshes visible geometry after model changes using the last actual browser measurement. @returns Nothing. */
  private UpdateViewport(): void {
    if (!this.client) return;
    const { left, top, width, height } = this.client;
    const doc = this.shell.GetDocument(),
      table = doc.FetchTable(this.viewData.GetTabNumber());
    // Shell history emits before the controller restores a deleted active sheet.
    if (!table) return;
    const bodyHeight = Math.max(
      1,
      height - (this.viewData.IsHeaderMode() ? this.viewport.rowHeight : 0),
    );
    const logicalTop =
      Math.min(1, Math.max(0, top) / Math.max(1, this.viewport.scrollHeight - height)) *
      Math.max(0, rowPixels(table, 0, doc.MaxRow()) - bodyHeight);
    const firstRow = rowAtPixel(table, logicalTop, doc.MaxRow());
    const lastRow = rowAtPixel(table, logicalTop + bodyHeight, doc.MaxRow());
    const rows = lastRow - firstRow + 1,
      bodyWidth = Math.max(1, width - (this.viewData.IsHeaderMode() ? 48 : 0)),
      logicalLeft =
        Math.min(1, Math.max(0, left) / Math.max(1, this.viewport.scrollWidth - width)) *
        Math.max(0, columnPixels(table, 0, doc.MaxCol()) - bodyWidth),
      firstColumn = columnAtPixel(table, logicalLeft, doc.MaxCol()),
      lastColumn = columnAtPixel(table, logicalLeft + bodyWidth, doc.MaxCol());
    this.viewport = {
      ...this.viewport,
      firstColumn,
      scrollLeft: left,
      columnOffset: logicalLeft - columnPixels(table, 0, firstColumn - 1),
      firstRow: Math.min(this.shell.GetDocument().MaxRow(), firstRow),
      columns: lastColumn - firstColumn + 2,
      rows: rows + 1,
      scrollTop: top,
      rowOffset: logicalTop - rowPixels(table, 0, firstRow - 1),
    };
  }
  /** Projects native column position to the bounded horizontal browser scroll track. @param column - Target column. @param clientWidth - Measured width. @returns Physical horizontal offset. */
  ScrollLeftForColumn(column: number, clientWidth: number): number {
    const doc = this.shell.GetDocument(),
      table = doc.FetchTable(this.viewData.GetTabNumber()) as ScTable,
      maximum = Math.max(
        1,
        columnPixels(table, 0, doc.MaxCol()) -
          Math.max(1, clientWidth - (this.viewData.IsHeaderMode() ? 48 : 0)),
      );
    return (
      Math.min(1, columnPixels(table, 0, column - 1) / maximum) *
      Math.max(0, this.viewport.scrollWidth - clientWidth)
    );
  }
  /** Projects a logical row to the bounded browser scroll track. @param row - Target first row. @param clientHeight - Measured viewport. @returns Physical offset. */
  ScrollTopForRow(row: number, clientHeight: number): number {
    const doc = this.shell.GetDocument(),
      table = doc.FetchTable(this.viewData.GetTabNumber()) as ScTable;
    const maximum = Math.max(
      1,
      rowPixels(table, 0, doc.MaxRow()) -
        Math.max(1, clientHeight - (this.viewData.IsHeaderMode() ? this.viewport.rowHeight : 0)),
    );
    return (
      Math.min(1, rowPixels(table, 0, row - 1) / maximum) *
      Math.max(0, this.viewport.scrollHeight - clientHeight)
    );
  }
  /** Releases shell/frame subscriber resources on workspace closure. @returns Nothing. */
  Close(): void {
    this.detachShell();
    this.listeners.clear();
    this.shell.Close();
  }
}

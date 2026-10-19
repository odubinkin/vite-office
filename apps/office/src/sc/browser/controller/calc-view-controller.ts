/** @fileoverview Browser input/viewport binding for the current scalar Calc model. Actual cells,marks,formula evaluation and undo stacks remain with native-shaped owners. */
import type { ScCellValue } from "../../inc/cellvalue";
import { ScInputMode } from "../../inc/global";
import { ScInputHandler } from "../../source/ui/inc/inputhdl";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { ScTabView } from "../../source/ui/inc/tabview";
import { ScViewData } from "../../source/ui/inc/viewdata";
import { ScAddress, ScRange, ScRefFlags } from "../../inc/address";
import { ScUndoSetCell } from "../../source/ui/inc/undocell";
import { SfxUndoAction, SfxListUndoAction } from "../../../svl/source/undo/undo";
import { prepareCell, captureCell, parseCellInput, cellInputText } from "../editor/cell-input";
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
  viewData: ScViewData;
  private readonly detachShell: () => void;
  readonly inputHandler = new ScInputHandler();
  /** Exposes the canonical native input mode. @returns Mode. */
  get mode(): ScInputMode {
    return this.inputHandler.GetMode();
  }
  inputText = "";
  addressText = "A1";
  error = "";
  viewport: CalcGridViewport = {
    firstColumn: 0,
    firstRow: 0,
    columns: 16,
    rows: 36,
    columnWidth: 96,
    rowHeight: 22,
    scrollTop: 0,
    scrollHeight: 1_000_000,
  };
  private revision = 0;
  private readonly listeners = new Set<() => void>();
  private anchor = new ScAddress();
  /** Binds canonical model/view owners. @param shell - Active shell. @returns Controller. */
  constructor(readonly shell: ScDocShell = new ScDocShell()) {
    this.viewData = new ScViewData(shell.GetDocument());
    this.detachShell = shell.Subscribe(
      /** Rebinds only when the canonical model identity changes. @returns Nothing. */ () => {
        if (this.viewData.GetDocument() !== shell.GetDocument()) {
          this.viewData = new ScViewData(shell.GetDocument());
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
  /** Sends one row/column/all selection to the actual mark owner. @param kind - Header identity. @param index - Coordinate. @returns Nothing. */
  Header(kind: "all" | "column" | "row", index: number): void {
    if (!this.Select(kind === "column" ? index : 0, kind === "row" ? index : 0)) return;
    const doc = this.shell.GetDocument(),
      tab = this.viewData.GetTabNumber();
    this.viewData
      .GetMarkData()
      .SetMarkArea(
        new ScRange(
          kind === "column" ? index : 0,
          kind === "row" ? index : 0,
          tab,
          kind === "row" ? doc.MaxCol() : kind === "column" ? index : doc.MaxCol(),
          kind === "column" ? doc.MaxRow() : kind === "row" ? index : doc.MaxRow(),
          tab,
        ),
      );
    this.Changed();
  }
  /** Executes original no-argument row selection after accepting the current input. @returns Whether selection was admitted. */
  MarkRows(): boolean {
    if (!this.Commit()) return false;
    new ScTabView(this.viewData).MarkRows();
    const start = this.viewData.GetMarkData().GetMarkArea().aStart;
    this.anchor = new ScAddress(start.Col(), start.Row(), start.Tab());
    this.Changed();
    return true;
  }
  /** Executes original no-argument column selection after accepting the current input. @returns Whether selection was admitted. */
  MarkColumns(): boolean {
    if (!this.Commit()) return false;
    new ScTabView(this.viewData).MarkColumns();
    const start = this.viewData.GetMarkData().GetMarkArea().aStart;
    this.anchor = new ScAddress(start.Col(), start.Row(), start.Tab());
    this.Changed();
    return true;
  }
  /** Starts actual transient input,optionally replacing the cell text for direct typing. @param mode - Inline or formula-line editing. @param replacement - Optional initial direct input. @returns Nothing. */
  StartInput(mode: Exclude<ScInputMode, ScInputMode.SC_INPUT_NONE>, replacement?: string): void {
    this.shell.EnsureOpen();
    const original = this.Input(),
      starting = !this.inputHandler.IsInputMode();
    this.inputText = replacement ?? original;
    this.inputHandler.SetMode(mode);
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
    this.inputHandler.SetModified();
    this.inputHandler.UpdateInputState(value);
    this.error = "";
    this.Changed();
  }
  /** Cancels without changing cells/history. @returns Nothing. */
  Cancel(): void {
    this.inputHandler.SetMode(ScInputMode.SC_INPUT_NONE);
    this.inputHandler.ResetInputState();
    this.inputText = "";
    this.error = "";
    this.Changed();
  }
  /** Commits supported input atomically through real core setters and shared history. @returns Whether input was accepted. */
  Commit(): boolean {
    if (this.mode === ScInputMode.SC_INPUT_NONE) return true;
    this.shell.EnsureOpen();
    try {
      if (this.inputHandler.IsModified()) {
        const doc = this.shell.GetDocument(),
          pos = this.Position(),
          content = parseCellInput(this.inputText),
          manager = this.shell.GetUndoManager();
        const prepared: { position: ScAddress; value: ScCellValue }[] = [];
        try {
          for (const tab of this.viewData.GetMarkData().GetSelectedTabs()) {
            const position = new ScAddress(pos.Col(), pos.Row(), tab);
            prepared.push({ position, value: prepareCell(doc, position, content) });
          }
          manager.EnterListAction("Input");
          try {
            for (const { position, value } of prepared) {
              const before = captureCell(doc, position);
              value.release(doc, position);
              manager.AddUndoAction(
                new ScUndoSetCell(this.shell, position, before, captureCell(doc, position)),
              );
            }
          } finally {
            manager.LeaveListAction();
          }
        } finally {
          for (const { value } of prepared) value.clear();
        }
        this.shell.SetDocumentModified();
      }
      this.inputHandler.SetMode(ScInputMode.SC_INPUT_NONE);
      this.inputHandler.ResetInputState();
      this.inputText = "";
      this.error = "";
      this.Changed();
      return true;
    } catch (error) {
      this.error = (error as Error).message;
      this.Changed();
      return false;
    }
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
    new ScTabView(this.viewData).SetTabNo(tab, false, extend);
    this.anchor = this.Position();
    this.addressText = this.Address();
    this.Changed();
  }
  /** Executes native adjacent-sheet navigation after accepting pending input. @param direction - Previous or next. @param extend - Extend the selected sheet group. @returns Nothing. */
  SelectNextTab(direction: number, extend = false): void {
    if (!this.Commit()) return;
    new ScTabView(this.viewData).SelectNextTab(direction, extend);
    this.anchor = this.Position();
    this.addressText = this.Address();
    this.Changed();
  }
  /** Selects all actual sheets through the source view owner. @returns Nothing. */
  SelectAllTables(): void {
    new ScTabView(this.viewData).SelectAllTables();
    this.Changed();
  }
  /** Deselects the group while retaining the active sheet. @returns Nothing. */
  DeselectAllTables(): void {
    new ScTabView(this.viewData).DeselectAllTables();
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
    const position =
      cursorAction instanceof ScUndoSetCell
        ? cursorAction.getAffectedRange().aStart
        : new ScAddress(
            0,
            0,
            Math.min(this.viewData.GetTabNumber(), this.shell.GetDocument().GetTableCount() - 1),
          );
    this.SelectTab(position.Tab());
    this.Select(position.Col(), position.Row());
    return true;
  }
  /** Maps browser scroll geometry to logical sheet coordinates without CSS-size overflow. @param left - Horizontal pixels. @param top - Physical vertical pixels. @param width - Client width. @param height - Client height. @returns Nothing. */
  Scroll(left: number, top: number, width: number, height: number): void {
    const rows = Math.max(
        1,
        Math.floor((height - this.viewport.rowHeight) / this.viewport.rowHeight),
      ),
      columns = Math.max(1, Math.floor((width - 48) / this.viewport.columnWidth));
    const firstRow = Math.floor(
      (Math.max(0, top) / Math.max(1, this.viewport.scrollHeight - height)) *
        Math.max(0, this.shell.GetDocument().MaxRow() + 1 - rows),
    );
    this.viewport = {
      ...this.viewport,
      firstColumn: Math.min(
        this.shell.GetDocument().MaxCol(),
        Math.floor(Math.max(0, left) / this.viewport.columnWidth),
      ),
      firstRow: Math.min(this.shell.GetDocument().MaxRow(), firstRow),
      columns: columns + 1,
      rows: rows + 1,
      scrollTop: top,
    };
    this.Changed();
  }
  /** Releases shell/frame subscriber resources on workspace closure. @returns Nothing. */
  Close(): void {
    this.detachShell();
    this.listeners.clear();
    this.shell.Close();
  }
}

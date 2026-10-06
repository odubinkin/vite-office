/**
 * @fileoverview Implements the DOM-neutral Writer edit-window owner corresponding to the pinned
 * LibreOffice `sw/source/uibase/docvw/edtwin.cxx` boundary.
 */

import { SwPosition } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwDoc } from "../../core/doc/doc";
import type { WriterClipboardSelection, WriterTransferDocument } from "../dochdl/swdtflvr";
import type { WriterPasteDocument } from "../dochdl/swdtflvr";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwTextNode as SwTextNodeClass } from "../../core/txtnode/ndtxt";
import { SwTableBoxStartNode } from "../../core/docnode/node";
import * as numfunc from "../../core/doc/number";
import { SwTab, type SwTableMousePoint } from "../../../inc/fesh";
import type { SwTabFrame } from "../../core/layout/tabfrm";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { PointerStyle } from "../../../../vcl/ptrstyle";

/** Performs no invalidation for detached/test edit windows. @returns Nothing. */
function ignoreEditWindowInvalidation(): void {}

/** One canonical edit-window endpoint expressed in current SwNodes coordinates. */
export interface SwEditWindowPosition {
  readonly contentIndex: number;
  readonly nodeIndex: number;
  /** Actual table-cell frame classification; absent for model positions without view geometry. */
  readonly inRepeatedHeadline?: boolean;
}

/** Direction-preserving edit-window selection used by outer platform adapters. */
export interface SwEditWindowSelection {
  readonly mark?: SwEditWindowPosition;
  readonly point: SwEditWindowPosition;
}

/**
 * Owns platform-neutral edit-window operations over one persistent Writer shell.
 *
 * Browser adapters translate DOM events and selections into this contract; React never receives
 * mutable Writer nodes or constructs document-operation closures.
 */
export class SwEditWin {
  private readonly invalidateBindings: () => void;
  private tableMouseStart: SwTableMousePoint | undefined;
  private tableRowDrag = false;
  private pointer = PointerStyle.Null;
  private tableBorderDrag:
    | {
        readonly axis: "column" | "row";
        readonly start: SwTableMousePoint;
        readonly original: SwTabCols;
        readonly next: SwTabCols;
        readonly index: number;
        readonly initialPosition: number;
        readonly origin: number;
        readonly scale: number;
        readonly minimum: number;
        readonly maximum: number;
        position: number;
      }
    | undefined;

  /** Returns the native window pointer selected by mouse policy. @returns Current pointer style. */
  public GetPointer(): PointerStyle {
    return this.pointer;
  }

  /** Applies native table hover policy; table mode suppresses resize changes but permits enhanced selection. @param point - Device position. @returns Whether native table geometry handled the point. */
  public changeMousePointer(point: SwTableMousePoint): boolean {
    const kind = this.WhichMouseTabCol(point);
    if (kind === SwTab.COL_NONE) {
      this.pointer = PointerStyle.Null;
      return false;
    }
    let pointer: PointerStyle;
    let checkTableSelection = false;
    switch (kind) {
      case SwTab.COL_VERT:
      case SwTab.ROW_HORI:
        pointer = PointerStyle.VSizeBar;
        checkTableSelection = true;
        break;
      case SwTab.ROW_VERT:
      case SwTab.COL_HORI:
        pointer = PointerStyle.HSizeBar;
        checkTableSelection = true;
        break;
      case SwTab.SEL_HORI:
        pointer = PointerStyle.TabSelectSE;
        break;
      case SwTab.SEL_HORI_RTL:
      case SwTab.SEL_VERT:
        pointer = PointerStyle.TabSelectSW;
        break;
      case SwTab.COLSEL_HORI:
      case SwTab.ROWSEL_VERT:
        pointer = PointerStyle.TabSelectS;
        break;
      case SwTab.ROWSEL_HORI:
        pointer = PointerStyle.TabSelectE;
        break;
      case SwTab.ROWSEL_HORI_RTL:
      case SwTab.COLSEL_VERT:
        pointer = PointerStyle.TabSelectW;
        break;
    }
    if (!checkTableSelection || !this.wrtShell.IsTableMode()) this.pointer = pointer;
    return true;
  }

  /** Replaces device frame measurements before native mouse classification. @param frames - Live master/follow frames. @returns Nothing. */
  public SetTableMouseFrames(frames: readonly SwTabFrame[]): void {
    this.wrtShell.SetTableMouseFrames(frames);
  }

  /** Reports native cursor geometry without changing the selection. @param point - Device position. @returns Native table cursor kind. */
  public WhichMouseTabCol(point: SwTableMousePoint): SwTab {
    return this.wrtShell.WhichMouseTabCol(point);
  }

  /** Starts native single-left-click table edge selection and optional capture. @param point - Device position. @param button - Platform button. @param clicks - Native click count. @returns Whether handled. */
  public MouseButtonDown(point: SwTableMousePoint, button = 0, clicks = 1): boolean {
    this.tableMouseStart = undefined;
    this.tableBorderDrag = undefined;
    if (button !== 0 || clicks !== 1) return false;
    const kind = this.WhichMouseTabCol(point);
    if (!this.wrtShell.IsTableMode()) {
      if (kind === SwTab.COL_HORI) return this.RulerColumnDrag(point);
      if (kind === SwTab.ROW_HORI) return this.RulerRowDrag(point);
    }
    if (kind !== SwTab.SEL_HORI && kind !== SwTab.ROWSEL_HORI && kind !== SwTab.COLSEL_HORI)
      return false;
    this.wrtShell.EnterStdMode();
    const selected = this.wrtShell.SelectTableRowCol(point);
    if (selected && kind !== SwTab.SEL_HORI) {
      this.tableMouseStart = point;
      this.tableRowDrag = kind === SwTab.ROWSEL_HORI;
    }
    return this.Complete(selected);
  }

  /** Starts represented source ruler Border/Margin tracking over native columns with5px hit tolerance. @param point - Actual document border hit. @returns Whether tracking was admitted. */
  public RulerColumnDrag(point: SwTableMousePoint): boolean {
    const hit = this.wrtShell.GetBox(point),
      original = new SwTabCols();
    if (hit === undefined || hit.row || !this.wrtShell.GetMouseTabCols(original, point))
      return false;
    const rect = (hit.frame.mouseGeometry as NonNullable<SwTabFrame["mouseGeometry"]>).rect,
      scale = (original.GetRight() - original.GetLeft()) / (rect.right - rect.left),
      origin = rect.left - original.GetLeft() / scale;
    let index = -1,
      distance = Infinity;
    for (let i = 0; i < original.Count(); i++) {
      const difference = Math.abs(origin + original.GetEntry(i).nPos / scale - point.x);
      if (!original.IsHidden(i) && difference <= 5 && difference < distance) {
        index = i;
        distance = difference;
      }
    }
    if (index === -1) {
      if (Math.abs(rect.left - point.x) <= 5) index = -1;
      else if (Math.abs(rect.right - point.x) <= 5) index = original.Count();
      else return false;
    }
    const minimum =
      index === -1
        ? 0
        : index === original.Count()
          ? original.Count() === 0
            ? original.GetLeft()
            : original.GetEntry(index - 1).nPos
          : original.GetEntry(index).nMin;
    const maximum =
      index === -1
        ? original.Count() === 0
          ? original.GetRight()
          : original.GetEntry(0).nPos
        : index === original.Count()
          ? original.GetRightMax()
          : original.GetEntry(index).nMax;
    const position =
      index === -1
        ? original.GetLeft()
        : index === original.Count()
          ? original.GetRight()
          : original.GetEntry(index).nPos;
    this.tableBorderDrag = {
      axis: "column",
      start: point,
      original,
      next: new SwTabCols(original),
      index,
      initialPosition: position,
      origin,
      scale,
      minimum: minimum + (index === -1 ? 0 : 5 * scale),
      maximum: maximum - (index === original.Count() ? 0 : 5 * scale),
      position,
    };
    return true;
  }

  /** Starts native horizontal row-border tracking with the source following-row translation policy. @param point - Actual document hit. @returns Whether admitted. */
  public RulerRowDrag(point: SwTableMousePoint): boolean {
    const hit = this.wrtShell.GetBox(point),
      original = new SwTabCols();
    if (hit === undefined || !hit.row || !this.wrtShell.GetMouseTabRows(original, point))
      return false;
    const rect = (hit.frame.mouseGeometry as NonNullable<SwTabFrame["mouseGeometry"]>).rect,
      scale = original.GetRight() / (rect.bottom - rect.top),
      origin = rect.top;
    let index = -1,
      distance = Infinity;
    for (let i = 0; i < original.Count(); i++) {
      const difference = Math.abs(origin + original.GetEntry(i).nPos / scale - point.y);
      if (!original.IsHidden(i) && difference <= 5 && difference < distance) {
        index = i;
        distance = difference;
      }
    }
    if (index === -1) {
      if (Math.abs(rect.bottom - point.y) > 5 || !original.IsLastRowAllowedToChange()) return false;
      index = original.Count();
    }
    const minimum =
        index === original.Count()
          ? index === 0
            ? 0
            : original.GetEntry(index - 1).nPos
          : original.GetEntry(index).nMin,
      position = index === original.Count() ? original.GetRight() : original.GetEntry(index).nPos;
    this.tableBorderDrag = {
      axis: "row",
      start: point,
      original,
      next: new SwTabCols(original),
      index,
      initialPosition: position,
      origin,
      scale,
      minimum: minimum + 5 * scale,
      maximum: original.GetRightMax(),
      position,
    };
    return true;
  }
  /** Reads the transient native guide on its physical axis. @returns Axis and device coordinate or no tracking. */
  public GetTableBorderDragPosition():
    Readonly<{ axis: "column" | "row"; position: number }> | undefined {
    const drag = this.tableBorderDrag;
    return drag === undefined
      ? undefined
      : { axis: drag.axis, position: drag.origin + drag.position / drag.scale };
  }
  /** Reads the row tracking coordinate without publishing content. @returns Guide Y or no row tracking. */
  public GetTableRowDragPosition(): number | undefined {
    const drag = this.GetTableBorderDragPosition();
    return drag?.axis === "row" ? drag.position : undefined;
  }

  /** Reads the transient device guide without publishing document content. @returns Current guide X coordinate or no tracking. */
  public GetTableColumnDragPosition(): number | undefined {
    const drag = this.GetTableBorderDragPosition();
    return drag?.axis === "column" ? drag.position : undefined;
  }

  /** Extends an active native table mouse capture. @param point - Device position. @returns Whether handled. */
  public MouseMove(point: SwTableMousePoint): boolean {
    const drag = this.tableBorderDrag;
    if (drag !== undefined) {
      drag.position = Math.round(
        Math.max(
          drag.minimum,
          Math.min(
            drag.maximum,
            drag.initialPosition +
              (drag.axis === "column" ? point.x - drag.start.x : point.y - drag.start.y) *
                drag.scale,
          ),
        ),
      );
      if (drag.axis === "row") {
        const delta = drag.position - drag.initialPosition;
        drag.next.Assign(drag.original);
        for (let i = drag.index; i < drag.next.Count(); i++) drag.next.GetEntry(i).nPos += delta;
        drag.next.SetRight(drag.original.GetRight() + delta);
      } else if (drag.index === -1) drag.next.SetLeft(drag.position);
      else if (drag.index === drag.next.Count()) drag.next.SetRight(drag.position);
      else drag.next.GetEntry(drag.index).nPos = drag.position;
      return true;
    }
    return (
      this.tableMouseStart !== undefined &&
      this.Complete(this.wrtShell.SelectTableRowCol(this.tableMouseStart, point, this.tableRowDrag))
    );
  }

  /** Releases table capture and applies only accepted changed native separator geometry. @param cancelled - Discard transient ruler tracking. @param point - Optional final device position. @returns Whether capture was active. */
  public MouseButtonUp(cancelled = false, point?: SwTableMousePoint): boolean {
    const drag = this.tableBorderDrag,
      captured = this.tableMouseStart !== undefined || drag !== undefined;
    if (!cancelled && point !== undefined && drag !== undefined) this.MouseMove(point);
    this.tableMouseStart = undefined;
    this.tableBorderDrag = undefined;
    if (drag !== undefined && !cancelled) {
      if (drag.initialPosition !== drag.position)
        this.Complete(
          drag.axis === "row"
            ? this.wrtShell.SetMouseTabRows(drag.next, false, drag.start)
            : this.wrtShell.SetMouseTabCols(drag.next, false, drag.start),
        );
    }
    return captured;
  }

  /** Creates one edit-window owner for an attached Writer shell. @param wrtShell - Persistent edit shell. @param invalidateBindings - Final operation-state invalidation. @returns Nothing. */
  public constructor(
    private readonly wrtShell: SwWrtShell,
    invalidateBindings?: () => void,
  ) {
    this.invalidateBindings = invalidateBindings ?? ignoreEditWindowInvalidation;
  }

  /** Resolves the current canonical document for the view's persistent layout root. @returns Active Writer document. */
  public GetDoc(): SwDoc {
    return this.wrtShell.GetDoc();
  }

  /** Applies a current SwNodes selection to the shell PaM. @param selection - Point and optional mark. @returns Whether every endpoint was accepted. */
  public SetSelection(selection: SwEditWindowSelection): boolean {
    const point = this.ResolvePosition(selection.point);
    const mark = selection.mark === undefined ? undefined : this.ResolvePosition(selection.mark);
    if (point === undefined || (selection.mark !== undefined && mark === undefined)) return false;
    try {
      if (
        selection.point.inRepeatedHeadline === undefined &&
        selection.mark?.inRepeatedHeadline === undefined
      )
        this.wrtShell.SetPaM(point, mark);
      else
        this.wrtShell.UpdateCursor(
          point,
          mark,
          selection.point.inRepeatedHeadline === true ||
            selection.mark?.inRepeatedHeadline === true,
        );
      return true;
    } finally {
      point.Dispose();
      mark?.Dispose();
    }
  }

  /** Focuses one current text node at its Writer-defined endpoint. @param nodeIndex - Current SwNodes index. @returns Whether the node was focused. */
  public FocusNode(nodeIndex: number): boolean {
    const node = this.ResolveTextNode(nodeIndex);
    if (node === undefined) return false;
    this.wrtShell.FocusNode(node);
    return true;
  }

  /** Selects the complete Writer body. @returns Nothing. */
  public SelectAll(): void {
    this.wrtShell.SelectAll();
    this.invalidateBindings();
  }

  /** Executes Writer section/document boundary intent independently of platform geometry. @param start - Beginning direction. @param select - Extend selection. @returns Native movement result. */
  public MoveSectionBoundary(start: boolean, select = false): boolean {
    return this.Complete(
      start ? this.wrtShell.StartOfSection(select) : this.wrtShell.EndOfSection(select),
    );
  }

  /** Handles represented paragraph Tab with native numbering, cell and ordinary text priority. @param shift - Promote, previous-cell or consumed body no-op direction. @returns Whether Writer owns the key, including supported boundary no-ops. */
  public HandleTab(shift = false): boolean {
    const point = this.wrtShell.getShellCursor().GetPoint(),
      node = point.GetNode() as SwTextNode;
    if (node.GetNumRule() !== undefined && point.GetContentIndex() === 0) {
      this.Complete(
        shift || numfunc.NumDownChangesIndent(this.wrtShell)
          ? this.wrtShell.NumUpDown(!shift)
          : this.wrtShell.Insert("\t"),
      );
    } else if (node.StartOfSectionNode() instanceof SwTableBoxStartNode) {
      this.Complete(shift ? this.wrtShell.GoPrevCell() : this.wrtShell.GoNextCell());
    } else {
      const coll = node.GetTextFormatColl();
      if (
        point.GetContentIndex() === 0 &&
        coll.IsAssignedToListLevelOfOutlineStyle() &&
        (shift ? coll.GetAssignedOutlineStyleLevel() > 0 : coll.GetAssignedOutlineStyleLevel() < 9)
      )
        this.Complete(this.wrtShell.OutlineUpDown(shift ? -1 : 1));
      else if (!shift) this.Complete(this.wrtShell.Insert("\t"));
    }
    return true;
  }

  /** Inserts ordinary text through Writer typing semantics. @param text - Inserted text. @returns Whether the document changed. */
  public InsertText(text: string): boolean {
    return this.Complete(this.wrtShell.Insert(text));
  }

  /** Replaces the current selection. @param text - Replacement text. @returns Whether the document changed. */
  public ReplaceSelection(text: string): boolean {
    return this.Complete(this.wrtShell.Replace(text));
  }

  /** Handles Backspace numbering and indentation before text deletion. @param shift - ShiftBackspace restores numbering. @returns Whether the document changed. */
  public DeleteLeft(shift = false): boolean {
    const cursor = this.wrtShell.getShellCursor(),
      point = cursor.GetPoint(),
      node = point.GetNode() as SwTextNode;
    if (!cursor.HasMark() && point.GetContentIndex() === 0) {
      const rule = node.GetNumRule(),
        noNum = !node.IsCountedInList();
      if ((rule === undefined || (noNum && !shift)) && this.wrtShell.TryRemoveIndent())
        return this.Complete(true);
      if (
        (!shift && !noNum) ||
        (shift && noNum) ||
        (!shift && node.Len() === 0 && rule !== undefined && !rule.IsOutlineRule())
      ) {
        if (this.wrtShell.NumOrNoNum(shift)) return this.Complete(true);
      }
    }
    return this.Complete(this.wrtShell.DelLeft());
  }

  /** Deletes after the current cursor. @returns Whether the document changed. */
  public DeleteRight(): boolean {
    return this.Complete(this.wrtShell.DelRight());
  }

  /** Deletes the current selection. @returns Whether the document changed. */
  public DeleteSelection(): boolean {
    return this.Complete(this.wrtShell.DeleteSelection());
  }

  /** Handles ordinary Enter before deciding whether to split,as native KeyInput does. @returns Whether the document changed. */
  public InsertParagraph(): boolean {
    const cursor = this.wrtShell.getShellCursor();
    const node = cursor.GetPoint().GetNode() as SwTextNode;
    const rule = node.GetNumRule();
    if (!cursor.HasMark() && node.Len() === 0 && rule !== undefined && !rule.IsOutlineRule())
      return this.Complete(this.wrtShell.DelNumRules());
    return this.SplitNode();
  }

  /** Splits the active text node. @returns Whether the document changed. */
  public SplitNode(): boolean {
    return this.Complete(this.wrtShell.SplitNode());
  }

  /** Toggles direct character formatting. @param format - Supported Writer format. @returns Whether state changed. */
  public ToggleCharacterFormat(format: "bold" | "italic" | "underline"): boolean {
    return this.Complete(this.wrtShell.ToggleCharacterFormat(format));
  }

  /** Applies a list kind to the active paragraph. @param kind - Supported list kind. @returns Whether state changed. */
  public SetParagraphListKind(kind: "bullet" | "numbered"): boolean {
    return this.Complete(this.wrtShell.SetParagraphListKind(kind));
  }

  /** Undoes one Writer action. @returns Whether an action was undone. */
  public Undo(): boolean {
    return this.Complete(this.wrtShell.Undo());
  }

  /** Redoes one Writer action. @returns Whether an action was redone. */
  public Redo(): boolean {
    return this.Complete(this.wrtShell.Redo());
  }

  /** Starts extended-text input at the canonical selection. @returns Nothing. */
  public StartExtTextInput(): void {
    this.wrtShell.StartComposition();
  }

  /** Updates transient extended text without mutating SwDoc. @param text - Current composition text. @returns Nothing. */
  public UpdateExtTextInput(text: string): void {
    this.wrtShell.UpdateComposition(text);
  }

  /** Commits or cancels extended-text input. @returns Whether the document changed. */
  public EndExtTextInput(): boolean {
    return this.Complete(this.wrtShell.EndComposition());
  }

  /** Creates model-owned clipboard representations for the current selection. @returns Transfer payload or undefined. */
  public CreateSelectionTransfer(): WriterClipboardSelection | undefined {
    return this.wrtShell.CreateTransferable().CreateSelection();
  }

  /** Copies the current Writer selection through a native event writer. @param write - Synchronous MIME writer. @returns Nothing. */
  public CopyTransfer(write: (selection: WriterClipboardSelection) => void): void {
    this.wrtShell.CreateTransferable().Copy(write);
  }

  /** Writes the current transfer and then removes its selection. @param write - Synchronous MIME writer. @returns Nothing. */
  public CutTransfer(write: (selection: WriterClipboardSelection) => void): void {
    this.wrtShell.CreateTransferable().Cut(write);
    this.invalidateBindings();
  }

  /** Inserts a sanitized transfer document at the current PaM. @param paste - Parsed transfer document. @returns Whether the document changed. */
  public Paste(paste: WriterPasteDocument): boolean {
    return this.Complete(this.wrtShell.PasteAtCursor(paste));
  }

  /** Inserts a Writer transfer document into the current target pool through the shell. @param paste - Writer-owned transfer document. @returns Whether the document changed. */
  public PasteTransfer(paste: WriterTransferDocument): boolean {
    return this.Complete(this.wrtShell.CreateTransferable().Paste(paste));
  }

  /** Resolves one platform endpoint without exposing SwNode identity outside this owner. @param position - Current node/content coordinates. @returns Registered Writer position or undefined. */
  private ResolvePosition(position: SwEditWindowPosition): SwPosition | undefined {
    const node = this.ResolveTextNode(position.nodeIndex);
    if (node === undefined || position.contentIndex < 0 || position.contentIndex > node.Len())
      return undefined;
    return new SwPosition(node, position.contentIndex);
  }

  /** Resolves an actual connected text node, including table-cell sections. @param nodeIndex - Current SwNodes index. @returns Owned text node or undefined. */
  private ResolveTextNode(nodeIndex: number): SwTextNode | undefined {
    if (!Number.isInteger(nodeIndex)) return undefined;
    const document = this.wrtShell.GetDoc();
    if (nodeIndex < 0 || nodeIndex >= document.nodes.Count()) return undefined;
    const node = document.nodes.at(nodeIndex);
    return node instanceof SwTextNodeClass ? node : undefined;
  }

  /** Publishes final history/selection state after a completed operation. @param changed - Operation result. @returns Same result. */
  private Complete(changed: boolean): boolean {
    if (changed) this.invalidateBindings();
    return changed;
  }
}

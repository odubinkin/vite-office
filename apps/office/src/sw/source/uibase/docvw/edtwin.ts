/**
 * @fileoverview Implements the DOM-neutral Writer edit-window owner corresponding to the pinned
 * LibreOffice `sw/source/uibase/docvw/edtwin.cxx` boundary.
 */

import { SwPosition } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwDoc } from "../../core/doc/doc";
import type { WriterClipboardSelection, WriterTransferDocument } from "../dochdl/swdtflvr";
import type { WriterPasteDocument } from "../dochdl/swdtflvr";
import type { SwView } from "../uiview/view";
import { SwTextNode as SwTextNodeClass } from "../../core/txtnode/ndtxt";
import { SwTableBoxStartNode } from "../../core/docnode/node";
import * as numfunc from "../../core/doc/number";
import { SwTab, type SwTableMousePoint } from "../../../inc/fesh";
import type { SwTabFrame } from "../../core/layout/tabfrm";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { PointerStyle } from "../../../../vcl/ptrstyle";
import type { SwTextLine } from "../../core/text/txtfrm";
import type { SvxRuler } from "../../../../svx/source/dialog/svxruler";
import { RulerType } from "../../../../svtools/source/control/ruler";
import { applySwTableColumnItem, applySwTableRowItem } from "../uiview/viewtab";

/** Performs no invalidation for detached/test edit windows. @returns Nothing. */
function ignoreEditWindowInvalidation(): void {}

/** One canonical edit-window endpoint expressed in current SwNodes coordinates. */
export interface SwEditWindowPosition {
  /** Native label hit affinity supplied by the device geometry boundary. */
  readonly inFrontOfLabel?: boolean;
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
        readonly ruler: SvxRuler;
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
    if (!checkTableSelection || !this.m_rView.GetWrtShell().IsTableMode()) this.pointer = pointer;
    return true;
  }

  /** Replaces device frame measurements before native mouse classification. @param frames - Live master/follow frames. @returns Nothing. */
  public SetTableMouseFrames(frames: readonly SwTabFrame[]): void {
    this.m_rView.GetWrtShell().SetTableMouseFrames(frames);
  }

  /** Reports native cursor geometry without changing the selection. @param point - Device position. @returns Native table cursor kind. */
  public WhichMouseTabCol(point: SwTableMousePoint): SwTab {
    return this.m_rView.GetWrtShell().WhichMouseTabCol(point);
  }

  /** Starts native single-left-click table edge selection and optional capture. @param point - Device position. @param button - Platform button. @param clicks - Native click count. @param modifier - Native key mask captured at drag admission. @returns Whether handled. */
  public MouseButtonDown(point: SwTableMousePoint, button = 0, clicks = 1, modifier = 0): boolean {
    this.tableMouseStart = undefined;
    this.tableBorderDrag?.ruler.CancelDrag();
    this.tableBorderDrag = undefined;
    if (button !== 0 || clicks !== 1) return false;
    const kind = this.WhichMouseTabCol(point);
    if (!this.m_rView.GetWrtShell().IsTableMode()) {
      if (kind === SwTab.COL_HORI) return this.RulerColumnDrag(point, modifier);
      if (kind === SwTab.ROW_HORI) return this.RulerRowDrag(point, modifier);
    }
    if (kind !== SwTab.SEL_HORI && kind !== SwTab.ROWSEL_HORI && kind !== SwTab.COLSEL_HORI)
      return false;
    this.m_rView.GetWrtShell().EnterStdMode();
    const selected = this.m_rView.GetWrtShell().SelectTableRowCol(point);
    if (selected && kind !== SwTab.SEL_HORI) {
      this.tableMouseStart = point;
      this.tableRowDrag = kind === SwTab.ROWSEL_HORI;
    }
    return this.Complete(selected);
  }

  /** Delegates represented column hits to the persistent native horizontal ruler with5px tolerance. @param point - Document device hit. @param modifier - Captured native mask. @returns Whether captured. */
  public RulerColumnDrag(point: SwTableMousePoint, modifier = 0): boolean {
    const hit = this.m_rView.GetWrtShell().GetBox(point),
      original = new SwTabCols();
    if (
      hit === undefined ||
      hit.row ||
      !this.m_rView.GetWrtShell().GetMouseTabCols(original, point)
    )
      return false;
    const rect = (hit.frame.mouseGeometry as NonNullable<SwTabFrame["mouseGeometry"]>).rect,
      scale = (original.GetRight() - original.GetLeft()) / (rect.right - rect.left),
      ruler = this.m_rView.GetHRuler();
    ruler.Update(this.m_rView.GetTableRulerColumnItem(original), {
      left: original.GetLeft(),
      right: original.GetRight(),
      rightMax: original.GetRightMax(),
      origin: rect.left - original.GetLeft() / scale,
      scale,
      margin1: true,
      margin2: true,
    });
    if (
      !ruler.StartDocDrag(point, RulerType.Border, 5, modifier) &&
      !ruler.StartDocDrag(point, RulerType.Margin1, 5, modifier) &&
      !ruler.StartDocDrag(point, RulerType.Margin2, 5, modifier)
    )
      return false;
    this.tableBorderDrag = { axis: "column", start: point, original, ruler };
    return true;
  }

  /** Delegates horizontal-writing row hits to the persistent native vertical ruler. @param point - Document device hit. @param modifier - Captured native mask. @returns Whether captured. */
  public RulerRowDrag(point: SwTableMousePoint, modifier = 0): boolean {
    const hit = this.m_rView.GetWrtShell().GetBox(point),
      original = new SwTabCols();
    if (
      hit === undefined ||
      !hit.row ||
      !this.m_rView.GetWrtShell().GetMouseTabRows(original, point)
    )
      return false;
    const rect = (hit.frame.mouseGeometry as NonNullable<SwTabFrame["mouseGeometry"]>).rect,
      ruler = this.m_rView.GetVRuler();
    ruler.Update(this.m_rView.GetTableRulerRowItem(original), {
      left: original.GetLeft(),
      right: original.GetRight(),
      rightMax: original.GetRightMax(),
      origin: rect.top,
      scale: original.GetRight() / (rect.bottom - rect.top),
      margin1: false,
      margin2: original.IsLastRowAllowedToChange(),
    });
    if (
      !ruler.StartDocDrag(point, RulerType.Border, 5, modifier) &&
      !ruler.StartDocDrag(point, RulerType.Margin2, 5, modifier)
    )
      return false;
    this.tableBorderDrag = { axis: "row", start: point, original, ruler };
    return true;
  }

  /** Reads the transient native ruler guide on its physical axis. @returns Axis and device coordinate or no capture. */
  public GetTableBorderDragPosition():
    Readonly<{ axis: "column" | "row"; position: number }> | undefined {
    const drag = this.tableBorderDrag;
    return drag === undefined
      ? undefined
      : { axis: drag.axis, position: drag.ruler.GetDragPosition() as number };
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
    if (drag !== undefined) return drag.ruler.Tracking(point);
    return (
      this.tableMouseStart !== undefined &&
      this.Complete(
        this.m_rView
          .GetWrtShell()
          .SelectTableRowCol(this.tableMouseStart, point, this.tableRowDrag),
      )
    );
  }

  /** Releases table capture and applies only accepted changed native separator geometry. @param cancelled - Discard transient ruler tracking. @param point - Optional final device position. @returns Whether capture was active. */
  public MouseButtonUp(cancelled = false, point?: SwTableMousePoint): boolean {
    const drag = this.tableBorderDrag,
      captured = this.tableMouseStart !== undefined || drag !== undefined;
    if (!cancelled && point !== undefined && drag !== undefined) this.MouseMove(point);
    this.tableMouseStart = undefined;
    this.tableBorderDrag = undefined;
    if (drag !== undefined) {
      drag.ruler.EndTracking(cancelled);
      if (drag.ruler.HasChanged()) {
        const page = this.m_rView.GetDocShell().GetDoc().GetPageDesc().GetValue(),
          item = drag.ruler.GetColumnItem();
        this.Complete(
          drag.axis === "row"
            ? this.m_rView
                .GetWrtShell()
                .SetMouseTabRows(
                  applySwTableRowItem(drag.original, item, page.height),
                  drag.ruler.IsActLineOnly(),
                  drag.start,
                )
            : this.m_rView.GetWrtShell().SetMouseTabCols(
                applySwTableColumnItem(drag.original, item, page.width),
                // The represented shared-column model still rejects independent row geometry.
                // Retain its existing ordinary column contract until that core branch is ported.
                false,
                drag.start,
              ),
        );
      }
    }
    return captured;
  }

  /** Creates the native edit window for its persistent Writer view. @param m_rView - Exact owning view. @param invalidateBindings - Final operation-state invalidation. @returns Nothing. */
  public constructor(
    private readonly m_rView: SwView,
    invalidateBindings?: () => void,
  ) {
    this.invalidateBindings = invalidateBindings ?? ignoreEditWindowInvalidation;
  }

  /** Returns the exact source view retained by this edit window. @returns Owning Writer view. */
  public GetView(): SwView {
    return this.m_rView;
  }

  /** Resolves the current canonical document for the view's persistent layout root. @returns Active Writer document. */
  public GetDoc(): SwDoc {
    return this.m_rView.GetWrtShell().GetDoc();
  }

  /** Applies a current SwNodes selection to the shell PaM. @param selection - Point and optional mark. @returns Whether every endpoint was accepted. */
  public SetSelection(selection: SwEditWindowSelection): boolean {
    const point = this.ResolvePosition(selection.point);
    const mark = selection.mark === undefined ? undefined : this.ResolvePosition(selection.mark);
    if (point === undefined || (selection.mark !== undefined && mark === undefined)) return false;
    const inFrontOfLabel =
      selection.point.inFrontOfLabel === true &&
      mark === undefined &&
      !this.m_rView.GetWrtShell().IsTableMode() &&
      point.GetContentIndex() === 0 &&
      (point.GetNode() as SwTextNode).HasVisibleNumberingOrBullet();
    try {
      if (
        selection.point.inRepeatedHeadline === undefined &&
        selection.mark?.inRepeatedHeadline === undefined
      )
        this.m_rView.GetWrtShell().SetPaM(point, mark, inFrontOfLabel);
      else
        this.m_rView
          .GetWrtShell()
          .UpdateCursor(
            point,
            mark,
            selection.point.inRepeatedHeadline === true ||
              selection.mark?.inRepeatedHeadline === true,
            inFrontOfLabel,
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
    this.m_rView.GetWrtShell().FocusNode(node);
    return true;
  }

  /** Selects the complete Writer body. @returns Nothing. */
  public SelectAll(): void {
    this.m_rView.GetWrtShell().SelectAll();
    this.invalidateBindings();
  }

  /** Executes Writer section/document boundary intent independently of platform geometry. @param start - Beginning direction. @param select - Extend selection. @returns Native movement result. */
  public MoveSectionBoundary(start: boolean, select = false): boolean {
    return this.Complete(
      start
        ? this.m_rView.GetWrtShell().StartOfSection(select)
        : this.m_rView.GetWrtShell().EndOfSection(select),
    );
  }
  /** Publishes device lines for the actual current master/follow text frame. @param nodeIndex - Current native text-node index. @param lines - Browser-shaped UTF16 lines. @param start - Frame start. @param end - Frame end. @returns Whether the owner exists. */
  public SetCursorTextFrame(
    nodeIndex: number,
    lines: readonly SwTextLine[],
    start: number,
    end: number,
  ): boolean {
    const node = this.ResolveTextNode(nodeIndex);
    if (node === undefined) return false;
    this.m_rView.GetWrtShell().GetLayout().SetCursorTextFrame(node, lines, start, end);
    return true;
  }
  /** Executes source line-boundary intent through the native shell. @param left - Beginning direction. @param select - Extend selection. @returns Native admission. */
  public MoveLineBoundary(left: boolean, select = false): boolean {
    return this.Complete(
      left
        ? this.m_rView.GetWrtShell().LeftMargin(select, false)
        : this.m_rView.GetWrtShell().RightMargin(select, false),
    );
  }

  /** Handles represented paragraph Tab with native numbering, cell and ordinary text priority. @param shift - Promote, previous-cell or consumed body no-op direction. @returns Whether Writer owns the key, including supported boundary no-ops. */
  public HandleTab(shift = false): boolean {
    const point = this.m_rView.GetWrtShell().getShellCursor().GetPoint(),
      node = point.GetNode() as SwTextNode;
    if (node.GetNumRule() !== undefined && point.GetContentIndex() === 0) {
      this.Complete(
        shift || numfunc.NumDownChangesIndent(this.m_rView.GetWrtShell())
          ? this.m_rView.GetWrtShell().NumUpDown(!shift)
          : this.m_rView.GetWrtShell().Insert("\t"),
      );
    } else if (node.StartOfSectionNode() instanceof SwTableBoxStartNode) {
      this.Complete(
        shift ? this.m_rView.GetWrtShell().GoPrevCell() : this.m_rView.GetWrtShell().GoNextCell(),
      );
    } else {
      const coll = node.GetTextFormatColl();
      if (
        point.GetContentIndex() === 0 &&
        coll.IsAssignedToListLevelOfOutlineStyle() &&
        (shift ? coll.GetAssignedOutlineStyleLevel() > 0 : coll.GetAssignedOutlineStyleLevel() < 9)
      )
        this.Complete(this.m_rView.GetWrtShell().OutlineUpDown(shift ? -1 : 1));
      else if (!shift) this.Complete(this.m_rView.GetWrtShell().Insert("\t"));
    }
    return true;
  }

  /** Inserts ordinary text through Writer typing semantics. @param text - Inserted text. @returns Whether the document changed. */
  public InsertText(text: string): boolean {
    return this.Complete(this.m_rView.GetWrtShell().Insert(text));
  }

  /** Replaces the current selection. @param text - Replacement text. @returns Whether the document changed. */
  public ReplaceSelection(text: string): boolean {
    return this.Complete(this.m_rView.GetWrtShell().Replace(text));
  }

  /** Handles Backspace numbering and indentation before text deletion. @param shift - ShiftBackspace restores numbering. @returns Whether the document changed. */
  public DeleteLeft(shift = false): boolean {
    const cursor = this.m_rView.GetWrtShell().getShellCursor(),
      point = cursor.GetPoint(),
      node = point.GetNode() as SwTextNode;
    if (!cursor.HasMark() && point.GetContentIndex() === 0) {
      const rule = node.GetNumRule(),
        noNum = !node.IsCountedInList();
      if ((rule === undefined || (noNum && !shift)) && this.m_rView.GetWrtShell().TryRemoveIndent())
        return this.Complete(true);
      if (
        (!shift && !noNum) ||
        (shift && noNum) ||
        (!shift && node.Len() === 0 && rule !== undefined && !rule.IsOutlineRule())
      ) {
        if (this.m_rView.GetWrtShell().NumOrNoNum(shift)) return this.Complete(true);
      }
    }
    return this.Complete(this.m_rView.GetWrtShell().DelLeft());
  }

  /** Deletes after the current cursor. @returns Whether the document changed. */
  public DeleteRight(): boolean {
    return this.Complete(this.m_rView.GetWrtShell().DelRight());
  }

  /** Deletes the current selection. @returns Whether the document changed. */
  public DeleteSelection(): boolean {
    return this.Complete(this.m_rView.GetWrtShell().DeleteSelection());
  }

  /** Handles ordinary Enter before deciding whether to split,as native KeyInput does. @returns Whether the document changed. */
  public InsertParagraph(): boolean {
    const cursor = this.m_rView.GetWrtShell().getShellCursor();
    const node = cursor.GetPoint().GetNode() as SwTextNode;
    const rule = node.GetNumRule();
    if (!cursor.HasMark() && node.Len() === 0 && rule !== undefined && !rule.IsOutlineRule())
      return this.Complete(this.m_rView.GetWrtShell().DelNumRules());
    return this.SplitNode();
  }

  /** Splits the active text node. @returns Whether the document changed. */
  public SplitNode(): boolean {
    return this.Complete(this.m_rView.GetWrtShell().SplitNode());
  }

  /** Toggles direct character formatting. @param format - Supported Writer format. @returns Whether state changed. */
  public ToggleCharacterFormat(format: "bold" | "italic" | "underline"): boolean {
    return this.Complete(this.m_rView.GetWrtShell().ToggleCharacterFormat(format));
  }

  /** Applies a list kind to the active paragraph. @param kind - Supported list kind. @returns Whether state changed. */
  public SetParagraphListKind(kind: "bullet" | "numbered"): boolean {
    return this.Complete(this.m_rView.GetWrtShell().SetParagraphListKind(kind));
  }

  /** Undoes one Writer action. @returns Whether an action was undone. */
  public Undo(): boolean {
    return this.Complete(this.m_rView.GetWrtShell().Undo());
  }

  /** Redoes one Writer action. @returns Whether an action was redone. */
  public Redo(): boolean {
    return this.Complete(this.m_rView.GetWrtShell().Redo());
  }

  /** Starts extended-text input at the canonical selection. @returns Nothing. */
  public StartExtTextInput(): void {
    this.m_rView.GetWrtShell().StartComposition();
  }

  /** Updates transient extended text without mutating SwDoc. @param text - Current composition text. @returns Nothing. */
  public UpdateExtTextInput(text: string): void {
    this.m_rView.GetWrtShell().UpdateComposition(text);
  }

  /** Commits or cancels extended-text input. @returns Whether the document changed. */
  public EndExtTextInput(): boolean {
    return this.Complete(this.m_rView.GetWrtShell().EndComposition());
  }

  /** Creates model-owned clipboard representations for the current selection. @returns Transfer payload or undefined. */
  public CreateSelectionTransfer(): WriterClipboardSelection | undefined {
    return this.m_rView.GetWrtShell().CreateTransferable().CreateSelection();
  }

  /** Copies the current Writer selection through a native event writer. @param write - Synchronous MIME writer. @returns Nothing. */
  public CopyTransfer(write: (selection: WriterClipboardSelection) => void): void {
    this.m_rView.GetWrtShell().CreateTransferable().Copy(write);
  }

  /** Writes the current transfer and then removes its selection. @param write - Synchronous MIME writer. @returns Nothing. */
  public CutTransfer(write: (selection: WriterClipboardSelection) => void): void {
    this.m_rView.GetWrtShell().CreateTransferable().Cut(write);
    this.invalidateBindings();
  }

  /** Inserts a sanitized transfer document at the current PaM. @param paste - Parsed transfer document. @returns Whether the document changed. */
  public Paste(paste: WriterPasteDocument): boolean {
    return this.Complete(this.m_rView.GetWrtShell().PasteAtCursor(paste));
  }

  /** Inserts a Writer transfer document into the current target pool through the shell. @param paste - Writer-owned transfer document. @returns Whether the document changed. */
  public PasteTransfer(paste: WriterTransferDocument): boolean {
    return this.Complete(this.m_rView.GetWrtShell().CreateTransferable().Paste(paste));
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
    const document = this.m_rView.GetWrtShell().GetDoc();
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

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
    if (button !== 0 || clicks !== 1) return false;
    const kind = this.WhichMouseTabCol(point);
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

  /** Extends an active native table mouse capture. @param point - Device position. @returns Whether handled. */
  public MouseMove(point: SwTableMousePoint): boolean {
    return (
      this.tableMouseStart !== undefined &&
      this.Complete(this.wrtShell.SelectTableRowCol(this.tableMouseStart, point, this.tableRowDrag))
    );
  }

  /** Releases native table capture on mouse up or window teardown. @returns Whether capture was active. */
  public MouseButtonUp(): boolean {
    const captured = this.tableMouseStart !== undefined;
    this.tableMouseStart = undefined;
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

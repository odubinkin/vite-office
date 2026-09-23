/**
 * @fileoverview Writer-owned undo manager and retained undo content, following pinned
 * LibreOffice `sw/source/core/undo/docundo.cxx` and `sw/source/core/inc/UndoManager.hxx`.
 */

import { SfxUndoManager } from "../../../../svl/source/undo/undo";
import type { SwDoc } from "../doc/doc";
import type { SwTextFragment, SwTextNode } from "../txtnode/ndtxt";
import { CopyUndoFragment, type SwUndoRedoContext } from "./undobj";

/** Content removed from the live node array but needed by a retained Writer action. */
export class SwUndoNodes {
  private readonly entries = new Map<number, SwTextFragment | SwTextNode>();
  private nextId = 0;

  /** Retains a formatted text fragment in the document undo area. @param fragment - Removed text. @returns Stable undo node ID. */
  public RetainText(fragment: SwTextFragment): number {
    const id = ++this.nextId;
    this.entries.set(id, CopyUndoFragment(fragment));
    return id;
  }

  /** Retains a disconnected paragraph node with its original identity. @param node - Removed node. @returns Stable undo node ID. */
  public RetainNode(node: SwTextNode): number {
    const id = ++this.nextId;
    this.entries.set(id, node);
    return id;
  }

  /** Resolves formatted text retained by a Writer action. @param id - Undo node ID. @returns Retained fragment. */
  public GetText(id: number): SwTextFragment {
    const entry = this.entries.get(id);
    if (entry === undefined || !isTextFragment(entry)) throw new Error("Missing Writer undo text.");
    return entry;
  }

  /** Resolves a disconnected paragraph retained by a Writer action. @param id - Undo node ID. @returns Retained paragraph. */
  public GetNode(id: number): SwTextNode {
    const entry = this.entries.get(id);
    if (entry === undefined || isTextFragment(entry)) throw new Error("Missing Writer undo node.");
    return entry;
  }

  /** Releases content when its action leaves the undo or redo stack. @param id - Undo node ID. @returns Nothing. */
  public Release(id: number): void {
    this.entries.delete(id);
  }

  /** Returns retained node count for bounded-history assertions. @returns Retained count. */
  public Count(): number {
    return this.entries.size;
  }

  /** Clears retained content when the document is discarded. @returns Nothing. */
  public Clear(): void {
    this.entries.clear();
  }
}

/** Writer action manager: Sfx owns stack mechanics; Writer owns retained nodes and shell state. */
export class UndoManager extends SfxUndoManager<SwUndoRedoContext> {
  private readonly undoNodes = new SwUndoNodes();
  private historyPositionChanged: ((isSavePosition: boolean) => void) | undefined;
  private groupUndo = true;

  /** Creates the manager for one canonical Writer document. @param document - Owning SwDoc. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {
    super();
  }

  /** Returns the removed Writer content owned by this document history. @returns Undo nodes. */
  public GetUndoNodes(): SwUndoNodes {
    return this.undoNodes;
  }

  /** Connects the document shell lifecycle to successful undo/redo navigation. @param callback - Save-position receiver. @returns Nothing. */
  public SetHistoryPositionChanged(
    callback: ((isSavePosition: boolean) => void) | undefined,
  ): void {
    this.historyPositionChanged = callback;
  }

  /** Enables or disables adjacent Writer action grouping. @param enabled - Grouping state. @returns Nothing. */
  public DoGroupUndo(enabled: boolean): void {
    this.groupUndo = enabled;
    if (!enabled) this.BreakUndoGrouping();
  }

  /** Reports Writer grouping state. @returns True when adjacent actions may merge. */
  public DoesGroupUndo(): boolean {
    return this.groupUndo;
  }

  /** Begins one Writer command group using Sfx list-action mechanics. @param comment - Command label. @returns Nothing. */
  public StartUndo(comment: string): void {
    this.EnterListAction(comment);
  }

  /** Ends one Writer command group. @returns Number of actions grouped. */
  public EndUndo(): number {
    return this.LeaveListAction();
  }

  /** Records an already executed Writer action with Writer grouping policy. @param action - Action. @param tryMerge - Whether adjacent actions may merge. @returns Nothing. */
  public override AddUndoAction(
    action: Parameters<SfxUndoManager<SwUndoRedoContext>["AddUndoAction"]>[0],
    tryMerge = false,
  ): void {
    super.AddUndoAction(action, this.groupUndo && tryMerge);
  }

  /** Reverts one Writer action and reconciles document modified state. @param context - Active shell context. @returns Whether history moved. */
  public override Undo(context: SwUndoRedoContext): boolean {
    if (context.GetDoc() !== this.document)
      throw new Error("Writer undo context belongs to another document.");
    return super.Undo(context);
  }

  /** Reapplies one Writer action and reconciles document modified state. @param context - Active shell context. @returns Whether history moved. */
  public override Redo(context: SwUndoRedoContext): boolean {
    if (context.GetDoc() !== this.document)
      throw new Error("Writer redo context belongs to another document.");
    return super.Redo(context);
  }

  /** Reconciles shell state after the model notification transaction has completed. @returns Nothing. */
  public ReconcileHistoryPosition(): void {
    this.historyPositionChanged?.(this.IsAtSavePosition());
  }

  /** Discards history and retained undo nodes during document disposal. @returns Nothing. */
  public Dispose(): void {
    this.Clear();
    this.undoNodes.Clear();
    this.historyPositionChanged = undefined;
  }
}

/** Distinguishes a retained fragment from a paragraph node. @param entry - Undo content. @returns True for text. */
function isTextFragment(entry: SwTextFragment | SwTextNode): entry is SwTextFragment {
  return "text" in entry;
}

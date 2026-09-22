/**
 * @fileoverview Defines Writer undo context, cursor snapshots, and range helpers corresponding
 * to the shared SwUndo/SwUndRng infrastructure in pinned LibreOffice undobj.cxx.
 */

import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextFragment } from "../txtnode/ndtxt";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "../doc/doc";

/** Identifies one stable text-node content position without retaining a node graph. */
export interface SwUndoCursorPosition {
  /** Canonical SwTextNode identity retained like an upstream node index. */
  readonly node: SwTextNode;
  /** UTF-16 content offset in that node. */
  readonly offset: number;
}

/** Stores all Writer cursor state needed after Undo or Redo. */
export interface SwUndoCursorState {
  /** Command-target paragraph identity. */
  readonly activeParagraph: SwTextNode;
  /** Optional fixed selection endpoint; its presence retains direction. */
  readonly mark?: SwUndoCursorPosition;
  /** Direct attributes active at a collapsed Writer cursor. */
  readonly pendingCharacterItems: SfxItemSet;
  /** Moving selection endpoint. */
  readonly point: SwUndoCursorPosition;
}

/** Context supplied by SwWrtShell while one Writer action is undone or redone. */
export interface SwUndoRedoContext {
  /** Returns the current canonical document graph. @returns Active SwDoc. */
  GetDoc(): SwDoc;
  /** Restores persistent shell cursor and pending attributes. @param state - Stored action endpoint state. @returns Nothing. */
  RestoreCursor(state: SwUndoCursorState): void;
}

/** Writer action base that brackets its model payload with complete cursor states. */
export abstract class SwUndo extends SfxUndoAction<SwUndoRedoContext> {
  /** Creates a Writer undo action. @param comment - User-visible label. @param before - Cursor state before execution. @param after - Cursor state after execution. @returns Nothing. */
  protected constructor(
    private readonly comment: string,
    private readonly before: SwUndoCursorState,
    private after: SwUndoCursorState,
  ) {
    super();
  }

  /** Reverts the model payload and restores the pre-command cursor. @param context - Active Writer undo context. @returns Nothing. */
  public finalUndo(context: SwUndoRedoContext): void {
    this.UndoImpl(context);
    context.RestoreCursor(cloneCursorState(this.before));
  }

  /** Reapplies the model payload and restores the post-command cursor. @param context - Active Writer redo context. @returns Nothing. */
  public finalRedo(context: SwUndoRedoContext): void {
    this.RedoImpl(context);
    context.RestoreCursor(cloneCursorState(this.after));
  }

  /** Implements the SfxUndoAction undo entry point. @param context - Active Writer context. @returns Nothing. */
  public override UndoWithContext(context: SwUndoRedoContext): void {
    this.finalUndo(context);
  }

  /** Implements the SfxUndoAction redo entry point. @param context - Active Writer context. @returns Nothing. */
  public override RedoWithContext(context: SwUndoRedoContext): void {
    this.finalRedo(context);
  }

  /** Returns the user-visible Writer command label. @returns Action label. */
  public override GetComment(): string {
    return this.comment;
  }

  /** Replaces the post-command cursor after compatible action grouping. @param state - New grouped endpoint. @returns Nothing. */
  protected SetAfterCursor(state: SwUndoCursorState): void {
    this.after = cloneCursorState(state);
  }

  /** Returns the post-command cursor for compatible subclass grouping. @returns Independent endpoint state. */
  protected GetAfterCursorState(): SwUndoCursorState {
    return cloneCursorState(this.after);
  }

  /** Reverts only the domain payload. @param context - Active Writer context. @returns Nothing. */
  protected abstract UndoImpl(context: SwUndoRedoContext): void;

  /** Reapplies only the domain payload. @param context - Active Writer context. @returns Nothing. */
  protected abstract RedoImpl(context: SwUndoRedoContext): void;
}

/** Validates one action-target text node. @param document - Current SwDoc. @param node - Retained node reference. @returns Matching SwTextNode. */
export function GetUndoTextNode(document: SwDoc, node: SwTextNode): SwTextNode {
  if (node.GetDoc() !== document) throw new Error("Writer undo node belongs to another document.");
  return node;
}

/** Captures a native Writer text/hint fragment for undo. @param node - Source node. @param start - Inclusive offset. @param end - Exclusive offset. @returns Independent fragment. */
export function CopyTextFragment(node: SwTextNode, start: number, end: number): SwTextFragment {
  return CopyUndoFragment(node.CaptureTextFragment(start, end));
}

/** Deep-copies a native Writer fragment without browser projection. @param fragment - Source fragment. @returns Independent fragment. */
export function CopyUndoFragment(fragment: SwTextFragment): SwTextFragment {
  return { text: fragment.text, hints: fragment.hints.clone() };
}

/** Returns a native undo fragment's UTF-16 text length. @param fragment - Native fragment. @returns UTF-16 length. */
export function GetUndoFragmentLength(fragment: SwTextFragment): number {
  return fragment.text.length;
}

/** Replaces one node range without cloning its SwDoc. @param document - Mutated graph. @param node - Target node. @param start - Inclusive offset. @param end - Exclusive offset. @param fragment - Replacement native fragment. @returns Nothing. */
export function ReplaceUndoRange(
  document: SwDoc,
  node: SwTextNode,
  start: number,
  end: number,
  fragment: SwTextFragment,
): void {
  const target = GetUndoTextNode(document, node);
  const point = new SwPosition(target, end, "redline");
  const mark = new SwPosition(target, start, "redline");
  const range = new SwPaM(point, mark);
  try {
    document.GetDocumentContentOperationsManager().ReplaceRange(range, fragment);
  } finally {
    range.Dispose();
    point.Dispose();
    mark.Dispose();
  }
}

/** Deletes one retained undo range through IDocumentContentOperations. @param document - Mutated graph. @param node - Target node. @param start - Inclusive offset. @param end - Exclusive offset. @returns Nothing. */
export function DeleteUndoRange(
  document: SwDoc,
  node: SwTextNode,
  start: number,
  end: number,
): void {
  const target = GetUndoTextNode(document, node);
  const point = new SwPosition(target, end, "redline");
  const mark = new SwPosition(target, start, "redline");
  const range = new SwPaM(point, mark);
  try {
    document.GetDocumentContentOperationsManager().DeleteRange(range);
  } finally {
    range.Dispose();
    point.Dispose();
    mark.Dispose();
  }
}

/** Estimates retained native text and hint payload. @param fragment - Native fragment. @returns Approximate scalar units. */
export function GetFragmentPayloadSize(fragment: SwTextFragment): number {
  return fragment.text.length + fragment.hints.Count() * 4;
}

/** Clones one complete action cursor boundary. @param state - Stored state. @returns Independent state. */
function cloneCursorState(state: SwUndoCursorState): SwUndoCursorState {
  return {
    activeParagraph: state.activeParagraph,
    ...(state.mark === undefined ? {} : { mark: { ...state.mark, node: state.mark.node } }),
    pendingCharacterItems: state.pendingCharacterItems.Clone(),
    point: { ...state.point, node: state.point.node },
  };
}

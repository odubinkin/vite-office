/**
 * @fileoverview Defines Writer undo context, cursor snapshots, and range helpers corresponding
 * to the shared SwUndo/SwUndRng infrastructure in pinned LibreOffice undobj.cxx.
 */

import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SwTextFragment, WriterCharacterAttributes } from "../txtnode/ndtxt";
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
  readonly pendingCharacterAttributes: WriterCharacterAttributes;
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

/** Finds one action-target text node. @param document - Current SwDoc. @param paragraphId - Stable node identity. @returns Matching SwTextNode. */
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

/** Replaces one node range without cloning its SwDoc. @param document - Mutated graph. @param paragraphId - Target node. @param start - Inclusive offset. @param end - Exclusive offset. @param runs - Replacement fragments. @returns Nothing. */
export function ReplaceUndoRange(
  document: SwDoc,
  node: SwTextNode,
  start: number,
  end: number,
  fragment: SwTextFragment,
): void {
  GetUndoTextNode(document, node).ReplaceRange(start, end, fragment);
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
    pendingCharacterAttributes: { ...state.pendingCharacterAttributes },
    point: { ...state.point, node: state.point.node },
  };
}

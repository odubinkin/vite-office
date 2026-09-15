/**
 * @fileoverview Defines Writer undo context, cursor snapshots, and range helpers corresponding
 * to the shared SwUndo/SwUndRng infrastructure in pinned LibreOffice undobj.cxx.
 */

import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { WriterCharacterAttributes, WriterTextRun } from "../txtnode/ndtxt";
import { normalizeWriterTextRuns, SwTextNode } from "../txtnode/ndtxt";
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

/** Extracts exact formatted runs from one bounded node range. @param node - Source text node. @param start - Inclusive offset. @param end - Exclusive offset. @returns Copied normalized runs. */
export function CopyTextRangeRuns(
  node: SwTextNode,
  start: number,
  end: number,
): readonly WriterTextRun[] {
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    end > node.Len()
  )
    throw new Error("Writer undo range is outside the paragraph.");
  let offset = 0;
  return normalizeWriterTextRuns(
    node.runs.flatMap(
      /** Clips one source run to the requested range. @param run - Complete node run. @returns Zero or one copied fragment. */
      (run): readonly WriterTextRun[] => {
        const runStart = offset;
        const runEnd = runStart + run.text.length;
        offset = runEnd;
        const clippedStart = Math.max(start, runStart);
        const clippedEnd = Math.min(end, runEnd);
        return clippedEnd <= clippedStart
          ? []
          : [
              {
                attributes: { ...run.attributes },
                ...(run.hyperlink === undefined ? {} : { hyperlink: { ...run.hyperlink } }),
                text: run.text.slice(clippedStart - runStart, clippedEnd - runStart),
              },
            ];
      },
    ),
  );
}

/** Copies normalized runs so action payloads never retain caller-owned arrays. @param runs - Source fragments. @returns Independent normalized runs. */
export function CopyUndoRuns(runs: readonly WriterTextRun[]): readonly WriterTextRun[] {
  return normalizeWriterTextRuns(
    runs.map(
      /** Copies one formatted fragment. @param run - Source run. @returns Independent fragment. */
      (run): WriterTextRun => ({
        attributes: { ...run.attributes },
        ...(run.hyperlink === undefined ? {} : { hyperlink: { ...run.hyperlink } }),
        text: run.text,
      }),
    ),
  );
}

/** Returns visible UTF-16 length retained by formatted runs. @param runs - Action payload fragments. @returns Text length. */
export function GetUndoRunsLength(runs: readonly WriterTextRun[]): number {
  return runs.reduce(
    /** Sums one run. @param total - Prior length. @param run - Current run. @returns Updated length. */
    (total, run) => total + run.text.length,
    0,
  );
}

/** Replaces one node range without cloning its SwDoc. @param document - Mutated graph. @param paragraphId - Target node. @param start - Inclusive offset. @param end - Exclusive offset. @param runs - Replacement fragments. @returns Nothing. */
export function ReplaceUndoRange(
  document: SwDoc,
  node: SwTextNode,
  start: number,
  end: number,
  runs: readonly WriterTextRun[],
): void {
  GetUndoTextNode(document, node).ReplaceRange(start, end, runs);
}

/** Estimates retained formatted-text payload in UTF-16 and attribute booleans. @param runs - Retained fragments. @returns Approximate scalar units. */
export function GetRunsPayloadSize(runs: readonly WriterTextRun[]): number {
  return runs.reduce(
    /** Counts one run's text plus its bounded attribute tuple. @param total - Prior units. @param run - Current run. @returns Updated units. */
    (total, run) => total + run.text.length + 3 + (run.hyperlink?.url.length ?? 0),
    0,
  );
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

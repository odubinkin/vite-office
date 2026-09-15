/** @fileoverview Implements bounded Writer delete, replace, and join undo payloads from pinned undel.cxx. */

import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import { SwTextNode, type WriterTextRun } from "../txtnode/ndtxt";
import {
  CopyUndoRuns,
  GetRunsPayloadSize,
  GetUndoRunsLength,
  GetUndoTextNode,
  ReplaceUndoRange,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Identifies the two single-character deletion directions grouped separately by Writer. */
export type SwUndoDeleteDirection = "backspace" | "delete";

/** Character class retained by SwUndoDelete::CanGrouping. */
export type SwUndoDeleteGroup = "delimiter" | "word";

/** Reversible same-node deletion retaining only removed formatted fragments. */
export class SwUndoDelete extends SwUndo {
  private deletedRuns: readonly WriterTextRun[];

  /** Creates one delete action. @param paragraphId - Target node. @param start - Deleted range start. @param deletedRuns - Removed formatted fragments. @param direction - Backspace or forward delete. @param group - Optional character grouping class. @param before - Cursor before deletion. @param after - Cursor after deletion. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private start: number,
    deletedRuns: readonly WriterTextRun[],
    private readonly direction: SwUndoDeleteDirection,
    private readonly group: SwUndoDeleteGroup | undefined,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Delete", before, after);
    this.deletedRuns = CopyUndoRuns(deletedRuns);
    if (GetUndoRunsLength(this.deletedRuns) === 0)
      throw new Error("SwUndoDelete requires non-empty text.");
  }

  /** Absorbs adjacent same-direction single-character deletions. @param nextAction - Newer action candidate. @returns True when grouped. */
  public override Merge(nextAction: SfxUndoAction<SwUndoRedoContext>): boolean {
    if (
      !(nextAction instanceof SwUndoDelete) ||
      this.group === undefined ||
      nextAction.group !== this.group ||
      nextAction.direction !== this.direction ||
      nextAction.paragraph !== this.paragraph
    )
      return false;
    if (
      this.direction === "backspace" &&
      nextAction.start + GetUndoRunsLength(nextAction.deletedRuns) === this.start
    ) {
      this.start = nextAction.start;
      this.deletedRuns = CopyUndoRuns([...nextAction.deletedRuns, ...this.deletedRuns]);
    } else if (this.direction === "delete" && nextAction.start === this.start) {
      this.deletedRuns = CopyUndoRuns([...this.deletedRuns, ...nextAction.deletedRuns]);
    } else return false;
    this.SetAfterCursor(nextAction.GetAfterCursorState());
    return true;
  }

  /** Reports retained deleted runs rather than document size. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetRunsPayloadSize(this.deletedRuns);
  }

  /** Restores removed text and hints. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(context.GetDoc(), this.paragraph, this.start, this.start, this.deletedRuns);
  }

  /** Deletes the retained range again. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).EraseText(
      this.start,
      GetUndoRunsLength(this.deletedRuns),
    );
  }
}

/** Atomic replacement used by paste and fallback editing without a full-document snapshot. */
export class SwUndoReplace extends SwUndo {
  private readonly insertedRuns: readonly WriterTextRun[];
  private readonly removedRuns: readonly WriterTextRun[];

  /** Creates one range replacement. @param paragraphId - Target node. @param start - Replacement start. @param removedRuns - Original range content. @param insertedRuns - Replacement content. @param comment - Command label. @param before - Cursor before replacement. @param after - Cursor after replacement. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly start: number,
    removedRuns: readonly WriterTextRun[],
    insertedRuns: readonly WriterTextRun[],
    comment: string,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super(comment, before, after);
    this.removedRuns = CopyUndoRuns(removedRuns);
    this.insertedRuns = CopyUndoRuns(insertedRuns);
  }

  /** Reports the two changed range payloads. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetRunsPayloadSize(this.removedRuns) + GetRunsPayloadSize(this.insertedRuns);
  }

  /** Restores original range content. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoRunsLength(this.insertedRuns),
      this.removedRuns,
    );
  }

  /** Reapplies replacement content. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoRunsLength(this.removedRuns),
      this.insertedRuns,
    );
  }
}

/** Reversible paragraph join retaining only the removed trailing node snapshot. */
export class SwUndoJoinParagraphs extends SwUndo {
  /** Creates one join action. @param precedingParagraphId - Surviving leading node. @param joinOffset - Original leading text length. @param removedParagraph - Removed trailing node state. @param before - Cursor before join. @param after - Cursor after join. @returns Nothing. */
  public constructor(
    private readonly precedingParagraph: SwTextNode,
    private readonly joinOffset: number,
    private readonly removedParagraph: SwTextNode,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Join Paragraphs", before, after);
  }

  /** Reports one removed paragraph payload. @returns Approximate serialized units. */
  public override GetPayloadSize(): number {
    return this.removedParagraph.Len() + this.removedParagraph.runs.length;
  }

  /** Splits the leading node and restores the exact removed node items and hints. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const preceding = GetUndoTextNode(document, this.precedingParagraph);
    preceding.EraseText(this.joinOffset);
    document.nodes.insertTextNodeAfter(preceding, this.removedParagraph);
  }

  /** Joins the trailing node into its predecessor again. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const preceding = GetUndoTextNode(document, this.precedingParagraph);
    preceding.AppendTextNode(this.removedParagraph);
    document.nodes.removeTextNode(this.removedParagraph);
  }
}

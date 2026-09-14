/** @fileoverview Implements the bounded SwUndoInsert action from pinned LibreOffice unins.cxx. */

import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { WriterTextRun } from "../txtnode/ndtxt";
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

/** Character class retained by Writer's insert grouping policy. */
export type SwUndoInsertGroup = "delimiter" | "word";

/** Reversible insertion retaining only inserted formatted text and stable range coordinates. */
export class SwUndoInsert extends SwUndo {
  private insertedRuns: readonly WriterTextRun[];

  /** Creates one insert action before it is first redone. @param paragraphId - Target node. @param offset - Insertion start. @param insertedRuns - Inserted formatted fragments. @param group - Optional grouping class. @param before - Cursor before insertion. @param after - Cursor after insertion. @returns Nothing. */
  public constructor(
    private readonly paragraphId: string,
    private readonly offset: number,
    insertedRuns: readonly WriterTextRun[],
    private readonly group: SwUndoInsertGroup | undefined,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Insert", before, after);
    this.insertedRuns = CopyUndoRuns(insertedRuns);
    if (GetUndoRunsLength(this.insertedRuns) === 0)
      throw new Error("SwUndoInsert requires non-empty text.");
  }

  /** Absorbs adjacent same-class text like SwUndoInsert::CanGrouping. @param nextAction - Newer action candidate. @returns True when grouped. */
  public override Merge(nextAction: SfxUndoAction<SwUndoRedoContext>): boolean {
    if (
      !(nextAction instanceof SwUndoInsert) ||
      this.group === undefined ||
      nextAction.group !== this.group ||
      nextAction.paragraphId !== this.paragraphId ||
      nextAction.offset !== this.offset + GetUndoRunsLength(this.insertedRuns) ||
      !haveEqualBoundaryAttributes(this.insertedRuns, nextAction.insertedRuns)
    )
      return false;
    this.insertedRuns = CopyUndoRuns([...this.insertedRuns, ...nextAction.insertedRuns]);
    this.SetAfterCursor(nextAction.GetAfterCursorState());
    return true;
  }

  /** Reports retained inserted text rather than document size. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetRunsPayloadSize(this.insertedRuns);
  }

  /** Removes the exact inserted range. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraphId).EraseText(
      this.offset,
      GetUndoRunsLength(this.insertedRuns),
    );
  }

  /** Reinserts the retained formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraphId,
      this.offset,
      this.offset,
      this.insertedRuns,
    );
  }
}

/** Compares the two fragments that become adjacent after grouping. @param left - Earlier inserted runs. @param right - Later inserted runs. @returns Whether direct attributes agree. */
function haveEqualBoundaryAttributes(
  left: readonly WriterTextRun[],
  right: readonly WriterTextRun[],
): boolean {
  const preceding = left[left.length - 1];
  const following = right[0];
  return (
    preceding !== undefined &&
    following !== undefined &&
    preceding.attributes.bold === following.attributes.bold &&
    preceding.attributes.italic === following.attributes.italic &&
    preceding.attributes.underline === following.attributes.underline
  );
}

/** @fileoverview Implements the bounded SwUndoInsert action from pinned LibreOffice unins.cxx. */

import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SwTextFragment, SwTextNode } from "../txtnode/ndtxt";
import {
  CopyUndoFragment,
  DeleteUndoRange,
  GetFragmentPayloadSize,
  GetUndoFragmentLength,
  ReplaceUndoRange,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Character class retained by Writer's insert grouping policy. */
export type SwUndoInsertGroup = "delimiter" | "word";

/** Reversible insertion retaining only inserted formatted text and stable range coordinates. */
export class SwUndoInsert extends SwUndo {
  private insertedFragment: SwTextFragment;

  /** Creates one insert action before it is first redone. @param paragraph - Target node. @param offset - Insertion start. @param insertedFragment - Inserted native fragment. @param group - Optional grouping class. @param before - Cursor before insertion. @param after - Cursor after insertion. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly offset: number,
    insertedFragment: SwTextFragment,
    private readonly group: SwUndoInsertGroup | undefined,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Insert", before, after);
    this.insertedFragment = CopyUndoFragment(insertedFragment);
    if (GetUndoFragmentLength(this.insertedFragment) === 0)
      throw new Error("SwUndoInsert requires non-empty text.");
  }

  /** Absorbs adjacent same-class text like SwUndoInsert::CanGrouping. @param nextAction - Newer action candidate. @returns True when grouped. */
  public override Merge(nextAction: SfxUndoAction<SwUndoRedoContext>): boolean {
    if (
      !(nextAction instanceof SwUndoInsert) ||
      this.group === undefined ||
      nextAction.group !== this.group ||
      nextAction.paragraph !== this.paragraph ||
      nextAction.offset !== this.offset + GetUndoFragmentLength(this.insertedFragment) ||
      !haveEqualBoundaryHints(this.insertedFragment, nextAction.insertedFragment)
    )
      return false;
    const left = this.insertedFragment;
    const right = nextAction.insertedFragment;
    this.insertedFragment = {
      text: left.text + right.text,
      hints: left.hints.concat(right.hints, left.text.length),
    };
    this.SetAfterCursor(nextAction.GetAfterCursorState());
    return true;
  }

  /** Reports retained inserted text rather than document size. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetFragmentPayloadSize(this.insertedFragment);
  }

  /** Removes the exact inserted range. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    DeleteUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.offset,
      this.offset + GetUndoFragmentLength(this.insertedFragment),
    );
  }

  /** Reinserts the retained formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.offset,
      this.offset,
      this.insertedFragment,
    );
  }
}

/** Compares the two fragments that become adjacent after grouping. @param left - Earlier inserted fragment. @param right - Later inserted fragment. @returns Whether native hint state agrees. */
function haveEqualBoundaryHints(left: SwTextFragment, right: SwTextFragment): boolean {
  return left.hints.equals(right.hints);
}

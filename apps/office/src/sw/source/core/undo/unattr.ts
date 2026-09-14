/** @fileoverview Implements direct character and paragraph attribute undo from pinned LibreOffice unattr.cxx. */

import type { WriterParagraphAlignment, WriterTextRun } from "../txtnode/ndtxt";
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

/** Reversible direct character formatting over one same-node range. */
export class SwUndoAttr extends SwUndo {
  private readonly afterRuns: readonly WriterTextRun[];
  private readonly beforeRuns: readonly WriterTextRun[];

  /** Creates a direct-format action. @param paragraphId - Target node. @param start - Formatted range start. @param beforeRuns - Original hints projected as runs. @param afterRuns - Resulting hints projected as runs. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraphId: string,
    private readonly start: number,
    beforeRuns: readonly WriterTextRun[],
    afterRuns: readonly WriterTextRun[],
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Character Formatting", before, after);
    this.beforeRuns = CopyUndoRuns(beforeRuns);
    this.afterRuns = CopyUndoRuns(afterRuns);
  }

  /** Reports changed range hints only. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetRunsPayloadSize(this.beforeRuns) + GetRunsPayloadSize(this.afterRuns);
  }

  /** Restores original formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraphId,
      this.start,
      this.start + GetUndoRunsLength(this.afterRuns),
      this.beforeRuns,
    );
  }

  /** Reapplies formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraphId,
      this.start,
      this.start + GetUndoRunsLength(this.beforeRuns),
      this.afterRuns,
    );
  }
}

/** Reversible RES_PARATR_ADJUST change for one paragraph. */
export class SwUndoParagraphFormat extends SwUndo {
  /** Creates one alignment action. @param paragraphId - Target node. @param beforeAlignment - Original adjustment. @param afterAlignment - New adjustment. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraphId: string,
    private readonly beforeAlignment: WriterParagraphAlignment,
    private readonly afterAlignment: WriterParagraphAlignment,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Formatting", before, after);
  }

  /** Reports two scalar item values. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the previous paragraph adjustment. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraphId).SetParagraphAlignment(this.beforeAlignment);
  }

  /** Reapplies the paragraph adjustment. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraphId).SetParagraphAlignment(this.afterAlignment);
  }
}

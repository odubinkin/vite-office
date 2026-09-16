/** @fileoverview Implements direct character and paragraph attribute undo from pinned LibreOffice unattr.cxx. */

import {
  applyWriterTextRangeFont,
  type SwTextNode,
  type WriterParagraphAlignment,
  type WriterTextRun,
} from "../txtnode/ndtxt";
import {
  CopyTextRangeRuns,
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
    private readonly paragraph: SwTextNode,
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
      this.paragraph,
      this.start,
      this.start + GetUndoRunsLength(this.afterRuns),
      this.beforeRuns,
    );
  }

  /** Reapplies formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoRunsLength(this.beforeRuns),
      this.afterRuns,
    );
  }
}

/** Builds a font-family range undo action. @param paragraph - Target node. @param start - Range start. @param end - Range end. @param family - Font family. @param before - Initial cursor. @param after - Final cursor. @returns Undo action or undefined for a no-op. */
export function CreateWriterFontUndo(
  paragraph: SwTextNode,
  start: number,
  end: number,
  family: string,
  before: SwUndoCursorState,
  after: SwUndoCursorState,
): SwUndoAttr | undefined {
  const beforeRuns = CopyTextRangeRuns(paragraph, start, end);
  const afterRuns = applyWriterTextRangeFont(beforeRuns, 0, GetUndoRunsLength(beforeRuns), family);
  return JSON.stringify(beforeRuns) === JSON.stringify(afterRuns)
    ? undefined
    : new SwUndoAttr(paragraph, start, beforeRuns, afterRuns, before, after);
}

/** Reversible RES_PARATR_ADJUST change for one paragraph. */
export class SwUndoParagraphFormat extends SwUndo {
  /** Creates one alignment action. @param paragraphId - Target node. @param beforeAlignment - Original adjustment. @param afterAlignment - New adjustment. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
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
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetParagraphAlignment(this.beforeAlignment);
  }

  /** Reapplies the paragraph adjustment. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetParagraphAlignment(this.afterAlignment);
  }
}

/** Reversible direct text-left margin change for one paragraph. */
export class SwUndoMoveLeftMargin extends SwUndo {
  /** Creates a margin action. @param paragraph - Target paragraph. @param beforeMargin - Original twip margin. @param afterMargin - New twip margin. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly beforeMargin: number,
    private readonly afterMargin: number,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Move Left Margin", before, after);
  }

  /** Reports two scalar margin values. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the previous direct text-left margin. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetParagraphTextLeftMargin(this.beforeMargin);
  }

  /** Reapplies the direct text-left margin. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetParagraphTextLeftMargin(this.afterMargin);
  }
}

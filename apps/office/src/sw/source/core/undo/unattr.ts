/** @fileoverview Implements direct character and paragraph attribute undo from pinned LibreOffice unattr.cxx. */

import type { SwTextFragment, SwTextNode, WriterParagraphAlignment } from "../txtnode/ndtxt";
import {
  CopyTextFragment,
  CopyUndoFragment,
  GetFragmentPayloadSize,
  GetUndoFragmentLength,
  GetUndoTextNode,
  ReplaceUndoRange,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Reversible direct character formatting over one same-node range. */
export class SwUndoAttr extends SwUndo {
  private readonly afterFragment: SwTextFragment;
  private readonly beforeFragment: SwTextFragment;

  /** Creates a direct-format action. @param paragraph - Target node. @param start - Formatted range start. @param beforeFragment - Original native fragment. @param afterFragment - Resulting native fragment. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly start: number,
    beforeFragment: SwTextFragment,
    afterFragment: SwTextFragment,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Character Formatting", before, after);
    this.beforeFragment = CopyUndoFragment(beforeFragment);
    this.afterFragment = CopyUndoFragment(afterFragment);
  }

  /** Reports changed range hints only. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetFragmentPayloadSize(this.beforeFragment) + GetFragmentPayloadSize(this.afterFragment);
  }

  /** Restores original formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoFragmentLength(this.afterFragment),
      this.beforeFragment,
    );
  }

  /** Reapplies formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoFragmentLength(this.beforeFragment),
      this.afterFragment,
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
  const beforeFragment = CopyTextFragment(paragraph, start, end);
  const afterFragment = paragraph.CreateFontTextFragment(start, end, family);
  return beforeFragment.hints.equals(afterFragment.hints)
    ? undefined
    : new SwUndoAttr(paragraph, start, beforeFragment, afterFragment, before, after);
}

/** Reversible RES_PARATR_ADJUST change for one paragraph. */
export class SwUndoParagraphFormat extends SwUndo {
  /** Creates one alignment action. @param paragraph - Target node. @param beforeAlignment - Original adjustment. @param afterAlignment - New adjustment. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
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

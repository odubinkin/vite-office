/** @fileoverview Implements the bounded SwUndoSplitNode action from pinned LibreOffice unspnd.cxx. */

import { GetUndoTextNode, SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Reversible paragraph split retaining stable node identities and one content offset. */
export class SwUndoSplitNode extends SwUndo {
  /** Creates one split action. @param paragraphId - Original leading node. @param offset - Split offset. @param nextParagraphId - New trailing node identity. @param before - Cursor before split. @param after - Cursor after split. @returns Nothing. */
  public constructor(
    private readonly paragraphId: string,
    private readonly offset: number,
    private readonly nextParagraphId: string,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Split Paragraph", before, after);
  }

  /** Reports stable IDs plus one offset, independent of document size. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return this.paragraphId.length + this.nextParagraphId.length + 1;
  }

  /** Joins the split trailing node back into the leading node. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const source = GetUndoTextNode(document, this.paragraphId);
    const trailing = GetUndoTextNode(document, this.nextParagraphId);
    source.AppendTextNode(trailing);
    document.nodes.removeTextNode(trailing);
  }

  /** Splits the leading node at the retained content offset. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const source = GetUndoTextNode(document, this.paragraphId);
    const trailing = source.SplitContent(this.offset, this.nextParagraphId);
    document.nodes.insertTextNodeAfter(source, trailing);
  }
}

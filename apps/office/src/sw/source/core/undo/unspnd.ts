/** @fileoverview Implements the bounded SwUndoSplitNode action from pinned LibreOffice unspnd.cxx. */

import type { SwTextNode } from "../txtnode/ndtxt";
import { SwPosition } from "../crsr/pam";
import { GetUndoTextNode, SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Reversible paragraph split retaining node references and one content offset. */
export class SwUndoSplitNode extends SwUndo {
  /** Creates one split action. @param sourceParagraph - Original leading node. @param offset - Split offset. @param before - Cursor before split. @param after - Cursor after split. @returns Nothing. */
  public constructor(
    private readonly sourceParagraph: SwTextNode,
    private readonly offset: number,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Split Paragraph", before, after);
  }

  /** Reports one retained node reference plus one offset, independent of document size. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return 1;
  }

  /** Joins the split trailing node back into the leading node. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const source = GetUndoTextNode(document, this.sourceParagraph);
    const trailing = this.trailingParagraph;
    if (trailing === undefined)
      throw new Error("SwUndoSplitNode has not created its trailing node.");
    document.GetDocumentContentOperationsManager().JoinTextNodes(source, trailing);
  }

  /** Splits the leading node at the retained content offset. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const source = GetUndoTextNode(document, this.sourceParagraph);
    const splitPosition = new SwPosition(source, this.offset, "redline");
    const provisional = document.GetDocumentContentOperationsManager().SplitNode(splitPosition);
    splitPosition.Dispose();
    if (this.trailingParagraph === undefined) this.trailingParagraph = provisional;
    else document.nodes.replaceTextNode(provisional, this.trailingParagraph);
    const trailing = this.trailingParagraph;
    const after = this.GetAfterCursorState();
    this.SetAfterCursor({
      ...after,
      activeParagraph: trailing,
      point: { ...after.point, node: trailing },
    });
  }

  private trailingParagraph: SwTextNode | undefined;
}

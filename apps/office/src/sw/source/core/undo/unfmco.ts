/** @fileoverview Implements paragraph style collection undo from pinned LibreOffice unfmco.cxx. */

import type { WriterParagraphStyle } from "../doc/fmtcol";
import type { SwTextNode } from "../txtnode/ndtxt";
import { GetUndoTextNode, SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Reversible SwTextFormatColl assignment for one paragraph. */
export class SwUndoFormatColl extends SwUndo {
  /** Creates one paragraph-style action. @param paragraph - Target node. @param beforeStyle - Original collection. @param afterStyle - New collection. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly beforeStyle: WriterParagraphStyle,
    private readonly afterStyle: WriterParagraphStyle,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Style", before, after);
  }

  /** Reports two scalar collection identities. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the original paragraph style collection. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    GetUndoTextNode(document, this.paragraph).ChgFormatColl(
      document.GetTextFormatColl(this.beforeStyle),
    );
  }

  /** Reapplies the paragraph style collection. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    GetUndoTextNode(document, this.paragraph).ChgFormatColl(
      document.GetTextFormatColl(this.afterStyle),
    );
  }
}

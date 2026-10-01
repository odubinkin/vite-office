/** @fileoverview Implements paragraph style collection undo from pinned LibreOffice unfmco.cxx. */

import type { WriterParagraphStyle } from "../doc/fmtcol";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { GetUndoTextNode, SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Reversible SwTextFormatColl assignment for one paragraph. */
export class SwUndoFormatColl extends SwUndo {
  private readonly beforeListItems: SfxItemSet;
  private readonly beforeEmptyListStyle: boolean;
  /** Creates one paragraph-style action. @param paragraph - Target node. @param beforeStyle - Original collection. @param afterStyle - New collection. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly beforeStyle: WriterParagraphStyle,
    private readonly afterStyle: WriterParagraphStyle,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Style", before, after);
    this.beforeListItems = paragraph.CaptureListItems();
    this.beforeEmptyListStyle = paragraph.IsEmptyListStyleDueToSetOutlineLevelAttr();
  }

  /** Reports collection identities, marker and owned list-item history. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 3 + this.beforeListItems.Count();
  }

  /** Restores the original paragraph style collection. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const paragraph = GetUndoTextNode(document, this.paragraph);
    paragraph.ChgFormatColl(document.GetTextFormatColl(this.beforeStyle));
    paragraph.ResetEmptyListStyleDueToResetOutlineLevelAttr();
    paragraph.SetListItems(this.beforeListItems);
    if (this.beforeEmptyListStyle) paragraph.SetEmptyListStyleDueToSetOutlineLevelAttr();
  }

  /** Reapplies the paragraph style collection. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    GetUndoTextNode(document, this.paragraph).ChgFormatColl(
      document.GetTextFormatColl(this.afterStyle),
    );
  }
}

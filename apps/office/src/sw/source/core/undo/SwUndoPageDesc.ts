/** @fileoverview Implements bounded page-descriptor undo actions from SwUndoPageDesc.cxx. */

import { SwPageDesc, type WriterPageDescriptorValue } from "../layout/pagedesc";
import { applyPageStoryFormatChanges, type SwPageStoryFormatChange } from "../layout/pagedesc.hdft";
import { SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Reversible named page descriptor replacement. */
export class SwUndoPageDesc extends SwUndo {
  /** Owns the old and new native descriptors or ruler geometry. @param beforeValue - Original page attributes. @param afterValue - Replacement page attributes. @param before - Original cursor state. @param after - Result cursor state. @param descriptorName - Named page style identity. @param storyChanges - Owned geometry snapshots for retained stories. @returns Nothing. */
  public constructor(
    private readonly beforeValue: WriterPageDescriptorValue | SwPageDesc,
    private readonly afterValue: WriterPageDescriptorValue | SwPageDesc,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
    private readonly descriptorName = beforeValue instanceof SwPageDesc
      ? beforeValue.GetName()
      : beforeValue.name,
    private readonly storyChanges: readonly SwPageStoryFormatChange[] = [],
  ) {
    super("Page Style", before, after);
  }
  /** Returns the bounded page-descriptor payload estimate. @returns Payload size. */
  public override GetPayloadSize(): number {
    return 10;
  }
  /** Restores the prior page descriptor. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    applyPageStoryFormatChanges(this.storyChanges, false);
    this.ApplyPageDesc(context, this.beforeValue);
  }
  /** Reapplies the replacement page descriptor. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    applyPageStoryFormatChanges(this.storyChanges, true);
    this.ApplyPageDesc(context, this.afterValue);
  }

  /** Releases the owned copies independently of the document's registered page style. @returns Nothing. */
  public override Dispose(): void {
    for (const { before, after } of this.storyChanges) {
      before.Dispose();
      after.Dispose();
    }
    if (this.beforeValue instanceof SwPageDesc) this.beforeValue.DisposeModify();
    if (this.afterValue instanceof SwPageDesc) this.afterValue.DisposeModify();
    super.Dispose();
  }

  /** Applies native descriptor snapshots through the original index-based change. @param context - Writer history context. @param value - Saved descriptor or geometry. @returns Nothing. */
  private ApplyPageDesc(
    context: SwUndoRedoContext,
    value: SwPageDesc | WriterPageDescriptorValue,
  ): void {
    const document = context.GetDoc();
    if (!(value instanceof SwPageDesc)) {
      document.ChgPageDesc(value, this.descriptorName);
      return;
    }
    const index = [0] as [number];
    if (!document.ContainsPageDesc(document.FindPageDesc(this.descriptorName), index)) return;
    const copy = value.Clone();
    try {
      document.ChgPageDesc(index[0], copy);
    } finally {
      copy.DisposeModify();
    }
  }
}

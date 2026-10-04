/** @fileoverview Implements bounded page-descriptor undo actions from SwUndoPageDesc.cxx. */

import type { WriterPageDescriptorValue } from "../layout/pagedesc";
import { SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Reversible Standard page descriptor replacement. */
export class SwUndoPageDesc extends SwUndo {
  /** Captures the before and after Standard page descriptor values. @param beforeValue - Original geometry. @param afterValue - Replacement geometry. @param before - Original cursor state. @param after - Result cursor state. @param descriptorName - Named page style identity. @returns Nothing. */
  public constructor(
    private readonly beforeValue: WriterPageDescriptorValue,
    private readonly afterValue: WriterPageDescriptorValue,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
    private readonly descriptorName = beforeValue.name,
  ) {
    super("Page Style", before, after);
  }
  /** Returns the bounded page-descriptor payload estimate. @returns Payload size. */
  public override GetPayloadSize(): number {
    return 10;
  }
  /** Restores the prior page descriptor. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    context.GetDoc().ChgPageDesc(this.beforeValue, this.descriptorName);
  }
  /** Reapplies the replacement page descriptor. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    context.GetDoc().ChgPageDesc(this.afterValue, this.descriptorName);
  }
}

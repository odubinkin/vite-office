/** @fileoverview Implements bounded page-descriptor and ruler undo actions from SwUndoPageDesc.cxx. */

import type { WriterPageDescriptorValue } from "../layout/pagedesc";
import type { SwTextNode } from "../txtnode/ndtxt";
import { GetUndoTextNode, SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Reversible Standard page descriptor replacement. */
export class SwUndoPageDesc extends SwUndo {
  /** Captures the before and after Standard page descriptor values. @param beforeValue - Original geometry. @param afterValue - Replacement geometry. @param before - Original cursor state. @param after - Result cursor state. @returns Nothing. */
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

/** Paragraph indentation tuple manipulated by the horizontal ruler. */
export interface WriterParagraphIndentValue {
  readonly firstLine: number;
  readonly left: number;
  readonly right: number;
}

/** Reversible direct paragraph indentation replacement. */
export class SwUndoRulerIndent extends SwUndo {
  /** Captures direct paragraph indents before and after a ruler drag. @param paragraph - Target paragraph. @param beforeValue - Original indents. @param afterValue - Replacement indents. @param before - Original cursor state. @param after - Result cursor state. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly beforeValue: WriterParagraphIndentValue,
    private readonly afterValue: WriterParagraphIndentValue,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Indents", before, after);
  }
  /** Returns the bounded three-indent payload estimate. @returns Payload size. */
  public override GetPayloadSize(): number {
    return 6;
  }
  /** Restores the prior paragraph indent tuple. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    applyIndent(GetUndoTextNode(context.GetDoc(), this.paragraph), this.beforeValue);
  }
  /** Reapplies the dragged paragraph indent tuple. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    applyIndent(GetUndoTextNode(context.GetDoc(), this.paragraph), this.afterValue);
  }
}

/** Applies one paragraph indent tuple within a single model transaction. @param paragraph - Target paragraph. @param value - Indent tuple. @returns Nothing. */
function applyIndent(paragraph: SwTextNode, value: WriterParagraphIndentValue): void {
  paragraph.GetDoc().RunModelTransaction(
    /** Applies all three direct items atomically. @returns Nothing. */ () => {
      paragraph.SetParagraphTextLeftMargin(value.left);
      paragraph.SetParagraphFirstLineIndent(value.firstLine);
      paragraph.SetParagraphRightMargin(value.right);
    },
  );
}

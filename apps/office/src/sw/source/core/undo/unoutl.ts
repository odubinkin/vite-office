/** @fileoverview Implements native unoutl.cxx outline UndoRedo with numeric range and signed displacement. */
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwUndRng, SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Retains native outline delta history instead of snapshotting style or paragraph state. */
export class SwUndoOutlineLeftRight extends SwUndo {
  private readonly range: SwUndRng;
  /** Captures numeric native endpoints and signed movement with the existing portable cursor boundary. @param range - Actual operation range. @param offset - Signed level displacement. @param cursor - Shell cursor/pending item boundary. @returns Nothing. */
  public constructor(
    range: SwPaM,
    private readonly offset: number,
    cursor: SwUndoCursorState,
  ) {
    super("Outline level", cursor, cursor);
    this.range = new SwUndRng(range);
  }
  /** Reports fixed native range/delta payload independent of selected outline count. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 5;
  }
  /** Replays the same operation with the inverse displacement. @param context - Active native history context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    this.Apply(context, -this.offset);
  }
  /** Replays the original displacement. @param context - Active native history context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    this.Apply(context, this.offset);
  }
  /** Resolves numeric range against current actual node slots. @param context - Active context. @param offset - Signed displacement. @returns Nothing. */
  private Apply(context: SwUndoRedoContext, offset: number): void {
    const doc = context.GetDoc(),
      point = new SwPosition(doc.GetNodes().at(this.range.m_nSttNode) as SwTextNode, 0),
      range = new SwPaM(point);
    try {
      this.range.SetPaM(range);
      doc.OutlineUpDown(range, offset);
    } finally {
      range.Dispose();
      point.Dispose();
    }
  }
}

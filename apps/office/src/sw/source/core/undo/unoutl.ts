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

import { SwNumRule } from "../doc/number";
/** Original action owns independent old/new rules; undo and redo use the same native document operation with recording disabled by the manager. */
export class SwUndoOutlineEdit extends SwUndo {
  private readonly m_aNewNumRule: SwNumRule;
  private readonly m_aOldNumRule: SwNumRule;
  /** Original copied rule values preserve sparse formats and registrations. @param oldRule - Previous rule. @param newRule - Requested rule. @returns Action. */
  constructor(oldRule: SwNumRule, newRule: SwNumRule) {
    super("Modify outline");
    this.m_aNewNumRule = new SwNumRule(newRule);
    this.m_aOldNumRule = new SwNumRule(oldRule);
  }
  /** Native undo applies the retained old rule. @param context - Actual context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    context.GetDoc().SetOutlineNumRule(this.m_aOldNumRule);
  }
  /** Native redo applies the retained new rule. @param context - Actual context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    context.GetDoc().SetOutlineNumRule(this.m_aNewNumRule);
  }
  /** Native repeat applies the retained new rule. @param context - Actual repeat context. @returns Nothing. */
  public RepeatImpl(context: Pick<SwUndoRedoContext, "GetDoc">): void {
    context.GetDoc().SetOutlineNumRule(this.m_aNewNumRule);
  }
  /** Original owned-rule destructors release level/style registrations. @returns Nothing. */
  public override Dispose(): void {
    this.m_aNewNumRule.Dispose();
    this.m_aOldNumRule.Dispose();
    super.Dispose();
  }
}

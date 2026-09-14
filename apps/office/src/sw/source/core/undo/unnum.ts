/** @fileoverview Implements bounded numbering and list-level undo from pinned LibreOffice unnum.cxx. */

import type { WriterParagraphList } from "../doc/list";
import { GetUndoTextNode, SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Shared reversible paragraph list-item transition. */
abstract class SwUndoParagraphList extends SwUndo {
  private readonly afterList: WriterParagraphList;
  private readonly beforeList: WriterParagraphList;

  /** Creates one list transition. @param comment - Command label. @param paragraphId - Target node. @param beforeList - Original list items. @param afterList - New list items. @param before - Cursor before command. @param after - Cursor after command. @returns Nothing. */
  protected constructor(
    comment: string,
    private readonly paragraphId: string,
    beforeList: WriterParagraphList,
    afterList: WriterParagraphList,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super(comment, before, after);
    this.beforeList = { ...beforeList };
    this.afterList = { ...afterList };
  }

  /** Reports the two bounded list item tuples. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 6;
  }

  /** Restores prior paragraph numbering items. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraphId).SetParagraphList(this.beforeList);
  }

  /** Reapplies paragraph numbering items. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraphId).SetParagraphList(this.afterList);
  }
}

/** Reversible bullet, numbering, or remove-numbering command. */
export class SwUndoInsNum extends SwUndoParagraphList {
  /** Creates one list-kind action. @param paragraphId - Target node. @param beforeList - Original items. @param afterList - New items. @param before - Cursor before command. @param after - Cursor after command. @returns Nothing. */
  public constructor(
    paragraphId: string,
    beforeList: WriterParagraphList,
    afterList: WriterParagraphList,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Numbering", paragraphId, beforeList, afterList, before, after);
  }
}

/** Reversible promote or demote command retaining only old and new list items. */
export class SwUndoNumLevel extends SwUndoParagraphList {
  /** Creates one list-level action. @param paragraphId - Target node. @param beforeList - Original items. @param afterList - New items. @param before - Cursor before command. @param after - Cursor after command. @returns Nothing. */
  public constructor(
    paragraphId: string,
    beforeList: WriterParagraphList,
    afterList: WriterParagraphList,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("List Level", paragraphId, beforeList, afterList, before, after);
  }
}

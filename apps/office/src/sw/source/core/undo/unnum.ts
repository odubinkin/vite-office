/** @fileoverview Implements bounded numbering and list-level undo from pinned LibreOffice unnum.cxx. */

import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwTextNode } from "../txtnode/ndtxt";
import { GetUndoTextNode, SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Shared reversible paragraph list-item transition. */
abstract class SwUndoParagraphList extends SwUndo {
  private afterList: SfxItemSet;
  private readonly beforeList: SfxItemSet;

  /** Creates one list transition. @param comment - Command label. @param paragraph - Target node. @param beforeList - Original list items. @param afterList - New list items. @param before - Cursor before command. @param after - Cursor after command. @returns Nothing. */
  protected constructor(
    comment: string,
    private readonly paragraph: SwTextNode,
    beforeList: SfxItemSet,
    afterList: SfxItemSet,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super(comment, before, after);
    this.beforeList = beforeList.Clone();
    this.afterList = afterList.Clone();
  }

  /** Reports the two bounded list item tuples. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 6;
  }

  /** Restores prior paragraph numbering items. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetListItems(this.beforeList);
  }

  /** Reapplies paragraph numbering items. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const paragraph = GetUndoTextNode(context.GetDoc(), this.paragraph);
    paragraph.SetListItems(this.afterList);
    this.afterList = paragraph.CaptureListItems();
  }
}

/** Reversible bullet, numbering, or remove-numbering command. */
export class SwUndoInsNum extends SwUndoParagraphList {
  /** Creates one list-kind action. @param paragraph - Target node. @param beforeList - Original items. @param afterList - New items. @param before - Cursor before command. @param after - Cursor after command. @returns Nothing. */
  public constructor(
    paragraph: SwTextNode,
    beforeList: SfxItemSet,
    afterList: SfxItemSet,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Numbering", paragraph, beforeList, afterList, before, after);
  }
}

/** Reversible promote or demote command retaining only old and new list items. */
export class SwUndoNumLevel extends SwUndoParagraphList {
  /** Creates one list-level action. @param paragraph - Target node. @param beforeList - Original items. @param afterList - New items. @param before - Cursor before command. @param after - Cursor after command. @returns Nothing. */
  public constructor(
    paragraph: SwTextNode,
    beforeList: SfxItemSet,
    afterList: SfxItemSet,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("List Level", paragraph, beforeList, afterList, before, after);
  }
}

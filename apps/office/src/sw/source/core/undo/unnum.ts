/** @fileoverview Implements bounded numbering and list-level undo from pinned LibreOffice unnum.cxx. */

import { SwPaM, SwPosition } from "../crsr/pam";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "../doc/doc";
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

/** Numbering deletion history over actual native nodes and direct list attributes. */
export class SwUndoDelNum extends SwUndo {
  private readonly nodes: readonly { node: SwTextNode; items: SfxItemSet; level: number }[];
  /** Captures list-attribute history and the native selection. @param doc - Owning document. @param range - Undo cursor boundary. @returns Nothing. */
  public constructor(
    doc: SwDoc,
    private readonly range: SwUndoCursorState,
  ) {
    super("Delete numbering", range, range);
    const start = Math.min(
      range.point.node.GetIndex(),
      range.mark?.node.GetIndex() ?? range.point.node.GetIndex(),
    );
    const end = Math.max(
      range.point.node.GetIndex(),
      range.mark?.node.GetIndex() ?? range.point.node.GetIndex(),
    );
    const nodes: { node: SwTextNode; items: SfxItemSet; level: number }[] = [];
    for (let index = start; index <= end; index++) {
      const node = doc.nodes.at(index);
      if (node instanceof SwTextNode && node.GetNumRule() !== undefined)
        nodes.push({ node, items: node.CaptureListItems(), level: node.GetActualListLevel() });
    }
    this.nodes = nodes;
  }
  /** Reports retained node numbering history. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 4 + this.nodes.length * 7;
  }
  /** Restores recorded list attributes and actual levels. @param context - Active document context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    for (const entry of this.nodes) {
      const node = GetUndoTextNode(context.GetDoc(), entry.node);
      node.SetListItems(entry.items);
      node.SetAttrListLevel(entry.level);
    }
  }
  /** Replays the document-owned numbering deletion. @param context - Active document context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc();
    const point = new SwPosition(
      GetUndoTextNode(doc, this.range.point.node),
      this.range.point.offset,
    );
    const mark =
      this.range.mark === undefined
        ? undefined
        : new SwPosition(GetUndoTextNode(doc, this.range.mark.node), this.range.mark.offset);
    const range = new SwPaM(point, mark);
    try {
      doc.DelNumRules(range);
    } finally {
      range.Dispose();
      point.Dispose();
      mark?.Dispose();
    }
  }
}

/** Native-shaped range and signed-direction numbering history;list metadata is never snapshotted. */
export class SwUndoNumUpDown extends SwUndo {
  /** Retains one native range and level delta. @param range - Complete shell cursor boundary. @param offset - Down is one,up is minus one. @returns Nothing. */
  public constructor(
    private readonly range: SwUndoCursorState,
    private readonly offset: 1 | -1,
  ) {
    super(offset > 0 ? "Demote list level" : "Promote list level", range, range);
  }

  /** Reports fixed range and direction payload independent of paragraph count. @returns Scalar range units. */
  public override GetPayloadSize(): number {
    return 5;
  }

  /** Reverses only native levels over the retained range. @param context - Active document context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    this.Apply(context, this.offset !== 1);
  }

  /** Reapplies the native direction over the retained range. @param context - Active document context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    this.Apply(context, this.offset === 1);
  }

  /** Reconstructs a native PaM for the same document mutation as execution. @param context - Active document context. @param down - Demote direction. @returns Nothing. */
  private Apply(context: SwUndoRedoContext, down: boolean): void {
    const doc = context.GetDoc();
    const point = new SwPosition(
      GetUndoTextNode(doc, this.range.point.node),
      this.range.point.offset,
    );
    const mark =
      this.range.mark === undefined
        ? undefined
        : new SwPosition(GetUndoTextNode(doc, this.range.mark.node), this.range.mark.offset);
    const range = new SwPaM(point, mark);
    try {
      doc.NumUpDown(range, down);
    } finally {
      range.Dispose();
      point.Dispose();
      mark?.Dispose();
    }
  }
}

/** One selected paragraph's list state before and after continuing an earlier list. */
export interface SwContinuedListItem {
  readonly paragraph: SwTextNode;
  readonly before: SfxItemSet;
  readonly after: SfxItemSet;
}

/** Reassigns a selected list range as one reversible Continue Numbering command. */
export class SwUndoContinueNumbering extends SwUndo {
  private readonly items: readonly SwContinuedListItem[];

  /** Retains independent item sets for one atomic list join. @param items - Selected list transitions. @param cursor - Persistent shell selection. @returns Nothing. */
  public constructor(items: readonly SwContinuedListItem[], cursor: SwUndoCursorState) {
    super("Continue Numbering", cursor, cursor);
    this.items = items.map(
      /** Captures one independent transition. @param item - Source transition. @returns Owned transition. */ (
        item,
      ) => ({
        paragraph: item.paragraph,
        before: item.before.Clone(),
        after: item.after.Clone(),
      }),
    );
  }

  /** Estimates retained list-item payload. @returns Scalar item units. */
  public override GetPayloadSize(): number {
    return this.items.length * 12;
  }

  /** Restores all selected paragraphs to their original list. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    for (const item of this.items)
      GetUndoTextNode(context.GetDoc(), item.paragraph).SetListItems(item.before);
  }

  /** Continues the earlier list across the selected range. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    for (const item of this.items)
      GetUndoTextNode(context.GetDoc(), item.paragraph).SetListItems(item.after);
  }
}

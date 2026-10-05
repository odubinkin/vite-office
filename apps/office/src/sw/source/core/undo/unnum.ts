/** @fileoverview Implements bounded numbering and list-level undo from pinned LibreOffice unnum.cxx. */

import { SwPaM, SwPosition } from "../crsr/pam";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "../doc/doc";
import {
  GetUndoTextNode,
  SwUndRng,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

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

/** Native numbering on/off history changes only the counted flag. */
export class SwUndoNumOrNoNum extends SwUndo {
  private readonly m_nIndex: number;
  /** Retains one native node index and old/new flags. @param node - Actual numbered paragraph. @param oldNum - Prior counted flag. @param newNum - Next counted flag. @param cursor - Shell selection boundary. @returns Nothing. */
  public constructor(
    node: SwTextNode,
    private readonly oldNum: boolean,
    private readonly newNum: boolean,
    cursor: SwUndoCursorState,
  ) {
    super("Number On/Off", cursor, cursor);
    this.m_nIndex = node.GetIndex();
  }
  /** Reports one node and two flag units. @returns Payload size. */
  public override GetPayloadSize(): number {
    return 3;
  }
  /** Restores only the counted state. @param context - Active document context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const node = context.GetDoc().GetNodes().at(this.m_nIndex);
    if (node instanceof SwTextNode) node.SetCountedInList(this.oldNum);
  }
  /** Reapplies only the counted state. @param context - Active document context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const node = context.GetDoc().GetNodes().at(this.m_nIndex);
    if (node instanceof SwTextNode) node.SetCountedInList(this.newNum);
  }
}

/** Numbering deletion history over actual native nodes and direct list attributes. */
export class SwUndoDelNum extends SwUndo {
  private readonly range: SwUndRng;
  private readonly nodes: readonly { index: number; items: SfxItemSet; level: number }[];
  /** Captures list-attribute history and the native selection. @param doc - Owning document. @param range - Undo cursor boundary. @returns Nothing. */
  public constructor(doc: SwDoc, range: SwUndoCursorState) {
    super("Delete numbering", range, range);
    const point = new SwPosition(range.point.node, range.point.offset),
      mark =
        range.mark === undefined ? undefined : new SwPosition(range.mark.node, range.mark.offset),
      nativeRange = new SwPaM(point, mark);
    try {
      this.range = new SwUndRng(nativeRange);
    } finally {
      nativeRange.Dispose();
      point.Dispose();
      mark?.Dispose();
    }
    const start = this.range.m_nSttNode,
      end = this.range.m_nEndNode === 0 ? start : this.range.m_nEndNode;
    const nodes: { index: number; items: SfxItemSet; level: number }[] = [];
    for (let index = start; index <= end; index++) {
      const node = doc.nodes.at(index);
      if (node instanceof SwTextNode && node.GetNumRule() !== undefined)
        nodes.push({ index, items: node.CaptureListItems(), level: node.GetActualListLevel() });
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
      const node = context.GetDoc().GetNodes().at(entry.index) as SwTextNode;
      node.SetListItems(entry.items);
      node.SetAttrListLevel(entry.level);
    }
  }
  /** Replays the document-owned numbering deletion. @param context - Active document context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc();
    const point = new SwPosition(doc.GetNodes().at(this.range.m_nSttNode) as SwTextNode, 0);
    const range = new SwPaM(point);
    try {
      this.range.SetPaM(range);
      doc.DelNumRules(range);
    } finally {
      range.Dispose();
      point.Dispose();
    }
  }
}

/** Native-shaped range and signed-direction numbering history;list metadata is never snapshotted. */
export class SwUndoNumUpDown extends SwUndo {
  private readonly range: SwUndRng;
  /** Retains one native range and level delta. @param range - Complete shell cursor boundary. @param offset - Down is one,up is minus one. @returns Nothing. */
  public constructor(
    range: SwUndoCursorState,
    private readonly offset: 1 | -1,
  ) {
    super(offset > 0 ? "Demote list level" : "Promote list level", range, range);
    const point = new SwPosition(range.point.node, range.point.offset),
      mark =
        range.mark === undefined ? undefined : new SwPosition(range.mark.node, range.mark.offset),
      nativeRange = new SwPaM(point, mark);
    try {
      this.range = new SwUndRng(nativeRange);
    } finally {
      nativeRange.Dispose();
      point.Dispose();
      mark?.Dispose();
    }
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
    const point = new SwPosition(doc.GetNodes().at(this.range.m_nSttNode) as SwTextNode, 0);
    const range = new SwPaM(point);
    try {
      this.range.SetPaM(range);
      doc.NumUpDown(range, down);
    } finally {
      range.Dispose();
      point.Dispose();
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
  private readonly items: readonly {
    index: number;
    document: SwDoc;
    before: SfxItemSet;
    after: SfxItemSet;
  }[];

  /** Retains independent item sets for one atomic list join. @param items - Selected list transitions. @param cursor - Persistent shell selection. @returns Nothing. */
  public constructor(items: readonly SwContinuedListItem[], cursor: SwUndoCursorState) {
    super("Continue Numbering", cursor, cursor);
    this.items = items.map(
      /** Captures one independent transition. @param item - Source transition. @returns Owned transition. */ (
        item,
      ) => ({
        index: item.paragraph.GetIndex(),
        document: item.paragraph.GetDoc(),
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
    for (const item of this.items) {
      const node = GetUndoTextNode(
        context.GetDoc(),
        item.document.GetNodes().at(item.index) as SwTextNode,
      );
      node.SetListItems(item.before);
    }
  }

  /** Continues the earlier list across the selected range. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    for (const item of this.items) {
      const node = GetUndoTextNode(
        context.GetDoc(),
        item.document.GetNodes().at(item.index) as SwTextNode,
      );
      node.SetListItems(item.after);
    }
  }
}

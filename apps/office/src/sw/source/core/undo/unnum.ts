/** @fileoverview Implements bounded numbering and list-level undo from pinned LibreOffice unnum.cxx. */

import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT } from "../../../inc/hintids";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SfxItemState, type SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "../doc/doc";
import { SwNumRule } from "../doc/number";
import {
  GetUndoTextNode,
  SwUndRng,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Numeric native paragraph numbering history; represented attribute tuples remain independently owned. */
export class SwUndoInsNum extends SwUndo {
  private readonly afterList: SfxItemSet | undefined;
  private readonly m_rDoc: SwDoc;
  private readonly m_nNode: number;
  private readonly beforeList: SfxItemSet | undefined;
  private readonly m_pOldNumRule: SwNumRule | undefined;
  private readonly m_aNumRule: SwNumRule | undefined;

  /** Creates one list transition. @param paragraph - Target node. @param beforeList - Original list items and optional indent history. @param afterList - New items. @param before - Cursor before command. @param after - Cursor after command. @returns Nothing. */
  public constructor(
    paragraph: SwTextNode,
    beforeList: SfxItemSet,
    afterList: SfxItemSet,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  );
  /** Captures the native old/new rule-format constructor family independently of paragraph attributes. @param oldRule - Previous rule. @param newRule - Accepted rule. @param document - Owning document. @param cursor - Optional command cursor boundary. @returns Nothing. */
  public constructor(
    oldRule: SwNumRule,
    newRule: SwNumRule,
    document: SwDoc,
    cursor?: SwUndoCursorState,
  );
  /** Initializes the native rule or existing item history family. @param owner - Actual paragraph or old rule. @param previous - Previous items or new rule. @param replacement - New items or document. @param before - Retained cursor. @param after - Optional final cursor for item operations. @returns Nothing. */
  public constructor(
    owner: SwTextNode | SwNumRule,
    previous: SfxItemSet | SwNumRule,
    replacement: SfxItemSet | SwDoc,
    before?: SwUndoCursorState,
    after?: SwUndoCursorState,
  ) {
    super("Numbering", before, after ?? before);
    if (owner instanceof SwNumRule) {
      this.m_rDoc = replacement as SwDoc;
      this.m_nNode = 0;
      this.m_pOldNumRule = new SwNumRule(owner);
      this.m_aNumRule = new SwNumRule(previous as SwNumRule);
      this.beforeList = undefined;
      this.afterList = undefined;
    } else {
      this.m_rDoc = owner.GetDoc();
      this.m_nNode = owner.GetIndex();
      this.beforeList = (previous as SfxItemSet).Clone();
      this.afterList = (replacement as SfxItemSet).Clone();
      this.m_pOldNumRule = undefined;
      this.m_aNumRule = undefined;
    }
  }

  /** Releases owned rule formats, item sets and cursor history when the action leaves the stack. @returns Nothing. */
  public override Dispose(): void {
    this.m_aNumRule?.Dispose();
    this.m_pOldNumRule?.Dispose();
    this.beforeList?.Dispose();
    this.afterList?.Dispose();
    super.Dispose();
  }

  /** Reports the two bounded list item tuples. @returns Payload units. */
  public override GetPayloadSize(): number {
    if (this.m_pOldNumRule !== undefined) return 20;
    let size = 6;
    for (const which of [RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT])
      if ((this.beforeList as SfxItemSet).GetItemState(which, false) !== SfxItemState.UNKNOWN)
        size += 2;
    return size;
  }

  /** Restores prior paragraph numbering items. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    if (this.m_pOldNumRule !== undefined) {
      context.GetDoc().ChgNumRuleFormats(this.m_pOldNumRule);
      return;
    }
    const paragraph = GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    );
    for (const which of [RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT])
      if ((this.beforeList as SfxItemSet).GetItemState(which, false) !== SfxItemState.UNKNOWN)
        paragraph.ResetAttr(which);
    paragraph.SetListItems(this.beforeList as SfxItemSet);
  }

  /** Reapplies paragraph numbering items. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    if (this.m_aNumRule !== undefined) {
      context.GetDoc().ChgNumRuleFormats(this.m_aNumRule);
      return;
    }
    const paragraph = GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    );
    for (const which of [RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT])
      if ((this.afterList as SfxItemSet).GetItemState(which, false) !== SfxItemState.UNKNOWN)
        paragraph.ResetAttr(which);
    paragraph.SetListItems(this.afterList as SfxItemSet);
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
  /** Captures list-attribute history and the native selection. @param doc - Owning document. @param range - Undo cursor boundary. @param selectedRange - Optional borrowed actual editing range captured numerically. @returns Nothing. */
  public constructor(doc: SwDoc, range: SwUndoCursorState, selectedRange?: SwPaM) {
    super("Delete numbering", range, range);
    const point = new SwPosition(range.point.node, range.point.offset),
      mark =
        range.mark === undefined ? undefined : new SwPosition(range.mark.node, range.mark.offset),
      nativeRange = new SwPaM(point, mark);
    try {
      this.range = new SwUndRng(selectedRange ?? nativeRange);
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
  /** Retains one native range and level delta. @param range - Complete shell cursor boundary. @param offset - Down is one,up is minus one. @param selectedRange - Optional actual editing range separate from the command cursor. @returns Nothing. */
  public constructor(
    range: SwUndoCursorState,
    private readonly offset: 1 | -1,
    selectedRange?: SwPaM,
  ) {
    super(offset > 0 ? "Demote list level" : "Promote list level", range, range);
    const point = new SwPosition(range.point.node, range.point.offset),
      mark =
        range.mark === undefined ? undefined : new SwPosition(range.mark.node, range.mark.offset),
      nativeRange = new SwPaM(point, mark);
    try {
      this.range = new SwUndRng(selectedRange ?? nativeRange);
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

/** Native boolean numbering-start history retains only node index and requested flag. */
export class SwUndoNumRuleStart extends SwUndo {
  private readonly m_nIndex: number;
  private readonly oldStart: number;
  /** Captures the native position and new flag without retaining a text node. @param position - Actual native position. @param value - New restart flag or unsigned start. @param cursor - Displayed command boundary. @returns Nothing. */
  public constructor(
    position: SwPosition,
    private readonly value: boolean | number,
    cursor: SwUndoCursorState,
  ) {
    super("Set numbering start", cursor, cursor);
    this.m_nIndex = position.GetNodeIndex();
    const node = position.GetNode().GetTextNode();
    this.oldStart = node?.HasAttrListRestartValue()
      ? node.GetAttrListRestartValue() & 0xffff
      : 0xffff;
  }
  /** Reports the native index and flag units. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }
  /** Reverses only the restart flag through the native document owner. @param context - Native history context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    this.Apply(context, typeof this.value === "boolean" ? !this.value : this.oldStart);
  }
  /** Reapplies only the restart flag. @param context - Native history context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    this.Apply(context, this.value);
  }
  /** Reconstructs a current native position independently of physical text-node identity. @param context - Current document context. @param value - Requested flag or start value. @returns Nothing. */
  private Apply(context: SwUndoRedoContext, value: boolean | number): void {
    const doc = context.GetDoc(),
      position = new SwPosition(doc.GetNodes().at(this.m_nIndex) as SwTextNode);
    try {
      if (typeof value === "boolean") doc.SetNumRuleStart(position, value);
      else position.GetNode().GetTextNode()?.SetAttrListRestartValue(value);
    } finally {
      position.Dispose();
    }
  }
}

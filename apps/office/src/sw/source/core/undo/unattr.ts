/** @fileoverview Implements direct character and paragraph attribute undo from pinned LibreOffice unattr.cxx. */

import type { SwTextFragment, SwTextNode, WriterParagraphAlignment } from "../txtnode/ndtxt";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwDoc } from "../doc/doc";
import { SwHistory } from "./rolbck";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_CHRATR_BEGIN, RES_CHRATR_END } from "../../../inc/hintids";
import { getTextFormatCollNodes } from "../doc/docfmt";
import { SwpHints } from "../txtnode/ndhints";
import { resetFullParagraphAutoFormat, resetParagraphTextAttributes } from "../txtnode/txtedt";
import {
  CopyTextFragment,
  CopyUndoFragment,
  GetFragmentPayloadSize,
  GetUndoFragmentLength,
  GetUndoTextNode,
  ReplaceUndoRange,
  SwUndRng,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Native RES_CHRFMT reset history for StyleApply's full-node range, separate from collection history. */
export class SwUndoResetAttr extends SwUndo {
  private readonly m_rDoc: SwDoc;
  private readonly range: SwUndRng;
  private history: readonly Readonly<{ index: number; hints: SwpHints }>[];

  /** Captures the expanded range before initial exact text reset. @param range - Original inclusive paragraph range. @param state - Expanded full-node cursor state. @returns Nothing. */
  public constructor(range: SwPaM, state: SwUndoCursorState) {
    super("Reset Attributes", state, state);
    this.m_rDoc = state.point.node.GetDoc();
    this.range = new SwUndRng(range);
    this.history = getTextFormatCollNodes(state.point.node.GetDoc(), range).map(
      /** Captures independent native hint payload. @param node - Owned text node. @returns Hint history. */
      (node) => ({
        index: node.GetIndex(),
        hints: node.GetpSwpHints()?.clone() ?? new SwpHints(node.GetDoc().GetAttrPool()),
      }),
    );
  }

  /** Performs the initial exact reset without restoring a history cursor. @returns Nothing. */
  public ApplyExact(): void {
    this.history = this.history.map(
      /** Captures text reset at its own native boundary after collection/delete-set processing. @param entry - Range node. @returns Current hint history. */
      ({ index }) => {
        const node = this.m_rDoc.GetNodes().at(index) as SwTextNode;
        return {
          index,
          hints: node.GetpSwpHints()?.clone() ?? new SwpHints(node.GetDoc().GetAttrPool()),
        };
      },
    );
    for (const { index } of this.history)
      resetFullParagraphAutoFormat(this.m_rDoc.GetNodes().at(index) as SwTextNode);
  }

  /** Reports retained hint payload only. @returns Payload units. */
  public override GetPayloadSize(): number {
    return this.history.reduce(
      /** Counts native retained hints. @param size - Prior total. @param entry - Hint owner. @returns Total. */
      (size, entry) => size + entry.hints.Count(),
      0,
    );
  }

  /** Restores original hints before collection history rollback. @param context - Current native owner. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    for (const entry of this.history)
      GetUndoTextNode(
        context.GetDoc(),
        this.m_rDoc.GetNodes().at(entry.index) as SwTextNode,
      ).SetTextHints(entry.hints);
  }

  /** Uses native RES_CHRFMT redo's default non-exact reset, independent of collection name lookup. @param context - Current native owner. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc(),
      node = GetUndoTextNode(
        document,
        this.m_rDoc.GetNodes().at(this.range.m_nSttNode) as SwTextNode,
      ),
      point = new SwPosition(node, 0),
      range = new SwPaM(point);
    try {
      this.range.SetPaM(range);
      for (const current of getTextFormatCollNodes(document, range))
        resetParagraphTextAttributes(current);
    } finally {
      range.Dispose();
      point.Dispose();
    }
  }
}

/** Reversible direct character formatting over one same-node range. */
export class SwUndoAttr extends SwUndo {
  private readonly m_rDoc: SwDoc;
  private readonly m_nNode: number;
  private readonly afterFragment: SwTextFragment;
  private readonly beforeFragment: SwTextFragment;

  /** Creates a direct-format action. @param paragraph - Target node. @param start - Formatted range start. @param beforeFragment - Original native fragment. @param afterFragment - Resulting native fragment. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    paragraph: SwTextNode,
    private readonly start: number,
    beforeFragment: SwTextFragment,
    afterFragment: SwTextFragment,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Character Formatting", before, after);
    this.m_rDoc = paragraph.GetDoc();
    this.m_nNode = paragraph.GetIndex();
    this.beforeFragment = CopyUndoFragment(beforeFragment);
    this.afterFragment = CopyUndoFragment(afterFragment);
  }

  /** Reports changed range hints only. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetFragmentPayloadSize(this.beforeFragment) + GetFragmentPayloadSize(this.afterFragment);
  }

  /** Restores original formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
      this.start,
      this.start + GetUndoFragmentLength(this.afterFragment),
      this.beforeFragment,
    );
  }

  /** Reapplies formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
      this.start,
      this.start + GetUndoFragmentLength(this.beforeFragment),
      this.afterFragment,
    );
  }
}

/** Reversible replacement of one direct paragraph item, retaining inherited state. */
export class SwUndoParagraphItem extends SwUndo {
  private readonly m_rDoc: SwDoc;
  private readonly m_nNode: number;
  private readonly beforeItem: SfxPoolItem | undefined;
  private readonly afterItem: SfxPoolItem;
  /** Stores the direct item before and after a paragraph edit. @param paragraph - Target node. @param beforeItem - Previous direct item. @param afterItem - Replacement item. @param before - Prior cursor. @param after - Result cursor. */
  /** Handles Writer formatting state. @param paragraph - Input value. @param beforeItem - Input value. @param afterItem - Input value. @param before - Input value. @param after - Input value. @returns Callback result. */ public constructor(
    paragraph: SwTextNode,
    beforeItem: SfxPoolItem | undefined,
    afterItem: SfxPoolItem,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Formatting", before, after);
    this.m_rDoc = paragraph.GetDoc();
    this.m_nNode = paragraph.GetIndex();
    this.beforeItem = beforeItem?.Clone() as SfxPoolItem | undefined;
    this.afterItem = afterItem.Clone() as SfxPoolItem;
  }

  /** Reports the scalar item pair. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the previous direct or inherited item. @param context - Undo context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const node = GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    );
    if (this.beforeItem === undefined) node.ResetAttr(this.afterItem.Which());
    else node.SetAttr(this.beforeItem);
  }

  /** Applies the replacement item. @param context - Undo context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    ).SetAttr(this.afterItem);
  }
}

/** Builds a font-family range undo action. @param paragraph - Target node. @param start - Range start. @param end - Range end. @param family - Font family. @param before - Initial cursor. @param after - Final cursor. @returns Undo action or undefined for a no-op. */
export function CreateWriterFontUndo(
  paragraph: SwTextNode,
  start: number,
  end: number,
  family: string,
  before: SwUndoCursorState,
  after: SwUndoCursorState,
): SwUndoAttr | undefined {
  const beforeFragment = CopyTextFragment(paragraph, start, end);
  const afterFragment = paragraph.CreateFontTextFragment(start, end, family);
  return beforeFragment.hints.equals(afterFragment.hints)
    ? undefined
    : new SwUndoAttr(paragraph, start, beforeFragment, afterFragment, before, after);
}

/** Builds a font-height range undo action. @param paragraph - Target node. @param start - Range start. @param end - Range end. @param fontSizeTwips - Font height in twips. @param before - Initial cursor. @param after - Final cursor. @returns Undo action or undefined for a no-op. */
export function CreateWriterFontSizeUndo(
  paragraph: SwTextNode,
  start: number,
  end: number,
  fontSizeTwips: number,
  before: SwUndoCursorState,
  after: SwUndoCursorState,
): SwUndoAttr | undefined {
  const beforeFragment = CopyTextFragment(paragraph, start, end);
  const afterFragment = paragraph.CreateFontSizeTextFragment(start, end, fontSizeTwips);
  return beforeFragment.hints.equals(afterFragment.hints)
    ? undefined
    : new SwUndoAttr(paragraph, start, beforeFragment, afterFragment, before, after);
}

/** Reversible RES_PARATR_ADJUST change for one paragraph. */
export class SwUndoParagraphFormat extends SwUndo {
  private readonly m_rDoc: SwDoc;
  private readonly m_nNode: number;
  /** Creates one alignment action. @param paragraph - Target node. @param beforeAlignment - Original adjustment. @param afterAlignment - New adjustment. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    paragraph: SwTextNode,
    private readonly beforeAlignment: WriterParagraphAlignment,
    private readonly afterAlignment: WriterParagraphAlignment,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Formatting", before, after);
    this.m_rDoc = paragraph.GetDoc();
    this.m_nNode = paragraph.GetIndex();
  }

  /** Reports two scalar item values. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the previous paragraph adjustment. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    ).SetParagraphAlignment(this.beforeAlignment);
  }

  /** Reapplies the paragraph adjustment. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    ).SetParagraphAlignment(this.afterAlignment);
  }
}

/** Original range margin action owns old native history and reexecutes the document mutation on redo. */
export class SwUndoMoveLeftMargin extends SwUndo {
  private readonly range: SwUndRng;
  private readonly m_rDoc: SwDoc;
  private readonly m_pHistory = new SwHistory();
  private readonly hasCursorState: boolean;
  /** Captures native range, direction and modulus, with an optional shell cursor adjunct. @param range - Original selection. @param right - Increase direction. @param m_bModulus - Snapping policy. @param state - Optional shell cursor state. @returns Nothing. */
  public constructor(
    range: SwPaM,
    private readonly right: boolean,
    private readonly m_bModulus: boolean,
    state?: SwUndoCursorState,
  ) {
    super("Move Left Margin", state, state);
    this.range = new SwUndRng(range);
    this.m_rDoc = range.GetPoint().GetNode().GetDoc();
    this.hasCursorState = state !== undefined;
  }
  /** Borrows the original retained history for initial registered mutation. @returns Original history. */
  public GetHistory(): SwHistory {
    return this.m_pHistory;
  }
  /** Reports native retained history entries rather than obsolete scalar margin pairs. @returns Entries. */
  public override GetPayloadSize(): number {
    return this.m_pHistory.Count();
  }
  /** Restores old direct/reset entries and reenables them for the next undo cycle. @param context - Native undo owner. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    this.m_pHistory.TmpRollback(this.GetDoc(context), 0);
    this.m_pHistory.SetTmpEnd(this.m_pHistory.Count());
    const range = this.AddUndoRedoPaM(context);
    range.Dispose();
  }
  /** Reexecutes native document semantics with current defaults and undo disabled by the manager. @param context - Native redo owner. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const range = this.AddUndoRedoPaM(context);
    try {
      context.GetDoc().MoveLeftMargin(range, this.right, this.m_bModulus);
    } finally {
      range.Dispose();
    }
  }
  /** Repeats the original command on the current repeat selection. @param context - Native repeat owner and selection. @returns Nothing. */
  public RepeatImpl(context: { GetDoc(): SwDoc; GetRepeatPaM(): SwPaM }): void {
    context.GetDoc().MoveLeftMargin(context.GetRepeatPaM(), this.right, this.m_bModulus);
  }
  /** Validates original document ownership before modifying history or constructing a range. @param context - Current undo owner. @returns Matching original document. */
  private GetDoc(context: SwUndoRedoContext): SwDoc {
    GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.range.m_nSttNode) as SwTextNode,
    );
    return context.GetDoc();
  }
  /** Reconstructs the original numeric range against current native indices. @param context - Current graph and cursor destination. @returns Independent disposable native range. */
  private AddUndoRedoPaM(context: SwUndoRedoContext): SwPaM {
    const doc = this.GetDoc(context),
      position = new SwPosition(doc.GetNodes().at(this.range.m_nSttNode) as SwTextNode, 0),
      range = new SwPaM(position);
    position.Dispose();
    this.range.SetPaM(range);
    if (!this.hasCursorState)
      context.RestoreCursor({
        activeParagraph: range.GetPoint().GetNode() as SwTextNode,
        pendingCharacterItems: new SfxItemSet(doc.GetAttrPool(), [
          [RES_CHRATR_BEGIN, RES_CHRATR_END - 1],
        ]),
        point: {
          node: range.GetPoint().GetNode() as SwTextNode,
          offset: range.GetPoint().GetContentIndex(),
        },
        ...(range.HasMark()
          ? {
              mark: {
                node: range.GetMark().GetNode() as SwTextNode,
                offset: range.GetMark().GetContentIndex(),
              },
            }
          : {}),
      });
    return range;
  }
}

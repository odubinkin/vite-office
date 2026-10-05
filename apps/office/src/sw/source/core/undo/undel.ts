/** @fileoverview Implements bounded Writer delete, replace, and join undo payloads from pinned undel.cxx. */

import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { RES_CHRATR_BEGIN, RES_CHRATR_END, RES_BREAK, RES_PAGEDESC } from "../../../inc/hintids";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwHistory } from "./rolbck";
import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import { SwTextNode, type SwTextFragment } from "../txtnode/ndtxt";
import type { SwUndoNodes } from "./docundo";
import {
  CopyUndoFragment,
  DeleteUndoRange,
  GetFragmentPayloadSize,
  GetUndoFragmentLength,
  GetUndoTextNode,
  ReplaceUndoRange,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Identifies the two single-character deletion directions grouped separately by Writer. */
export type SwUndoDeleteDirection = "backspace" | "delete";

/** Character class retained by SwUndoDelete::CanGrouping. */
export type SwUndoDeleteGroup = "delimiter" | "word";

/** Reversible registered text deletion retaining raw boundary strings and original native attribute history. */
export class SwUndoDelete extends SwUndo {
  private m_aSttStr: string;
  private m_aEndStr: string | undefined;
  private m_pHistory: SwHistory | undefined;
  private m_bJoinNext = true;
  private m_nEndContent = 0;
  private m_aSelectedNodes: readonly SwTextNode[] | undefined;
  private readonly m_aUndoNodeIds: number[] = [];
  private afterRecorded = false;

  /** Creates one delete action. @param paragraph - First boundary. @param start - Deleted range start. @param deletedText - Removed native start string. @param direction - Backspace or forward delete. @param group - Optional character grouping class. @param before - Normalized cursor before deletion. @param after - Cursor after deletion. @param selection - Optional cross-node selection with native join direction. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private start: number,
    deletedText: string,
    private readonly direction: SwUndoDeleteDirection,
    private readonly group: SwUndoDeleteGroup | undefined,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
    selection?: SwPaM,
  ) {
    super("Delete", before, after);
    if (deletedText.length === 0 && selection === undefined)
      throw new Error("SwUndoDelete requires non-empty text.");
    this.m_aSttStr = deletedText;
    const history = new SwHistory();
    history.CopyAttr(paragraph.GetpSwpHints(), paragraph.GetIndex(), 0, paragraph.Len(), true);
    if (selection !== undefined) {
      const end = selection.End(),
        last = end.GetNode() as SwTextNode;
      const selected = paragraph
        .GetNodes()
        .entries()
        .slice(paragraph.GetIndex(), last.GetIndex() + 1);
      if (
        selected.length < 2 ||
        selected.some(
          /** Validates the current registered structural history profile. @param node - Selected model node. @returns Unsupported family/section. */
          (node) => !(node instanceof SwTextNode),
        )
      )
        throw new Error("SwUndoDelete selection requires text nodes in one section.");
      this.m_aSelectedNodes = selected as SwTextNode[];
      this.m_nEndContent = end.GetContentIndex();
      this.m_aEndStr = last.GetText().slice(0, this.m_nEndContent);
      this.m_bJoinNext = selection.GetPoint() === end;
      const firstDirect = paragraph.GetpSwAttrSet(),
        lastDirect = last.GetpSwAttrSet();
      if (firstDirect !== undefined) history.CopyFormatAttr(firstDirect, paragraph.GetIndex());
      history.CopyAttr(last.GetpSwpHints(), last.GetIndex(), 0, last.Len(), true);
      if (lastDirect !== undefined) history.CopyFormatAttr(lastDirect, last.GetIndex());
      history.AddColl(paragraph.GetTextFormatColl(), paragraph.GetIndex(), paragraph.GetNodeType());
      history.AddColl(last.GetTextFormatColl(), last.GetIndex(), last.GetNodeType());
      const undoNodes = paragraph.GetDoc().GetUndoManager().GetUndoNodes();
      for (const node of selected)
        if (node !== (this.m_bJoinNext ? paragraph : last))
          this.m_aUndoNodeIds.push(undoNodes.RetainNode(node as SwTextNode));
    }
    this.m_pHistory = history.Count() === 0 ? undefined : history;
  }

  /** Absorbs adjacent same-direction single-character deletions. @param nextAction - Newer action candidate. @returns True when grouped. */
  public override Merge(nextAction: SfxUndoAction<SwUndoRedoContext>): boolean {
    if (
      !(nextAction instanceof SwUndoDelete) ||
      this.group === undefined ||
      nextAction.group !== this.group ||
      nextAction.direction !== this.direction ||
      nextAction.paragraph !== this.paragraph
    )
      return false;
    if (
      this.direction === "backspace" &&
      nextAction.start + nextAction.m_aSttStr.length === this.start
    ) {
      this.start = nextAction.start;
      this.m_aSttStr = nextAction.m_aSttStr + this.m_aSttStr;
    } else if (this.direction === "delete" && nextAction.start === this.start) {
      this.m_aSttStr += nextAction.m_aSttStr;
    } else return false;
    this.SetAfterCursor(nextAction.GetAfterCursorState(this.paragraph.GetDoc()));
    return true;
  }

  /** Records the actual completed delete point, including the outer sequential cell command's final caret. @param position - Current native point after deletion. @returns Nothing. */
  public SetAfterDelete(position: SwPosition): void {
    this.SetAfterCursorPosition(position);
    this.afterRecorded = true;
  }

  /** Reports retained deleted text and native hint history without a document snapshot. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    let middle = 0;
    for (const node of this.m_aSelectedNodes?.slice(1, -1) ?? [])
      middle += node.Len() + (node.GetpSwpHints()?.Count() ?? 0) * 4;
    return (
      this.m_aSttStr.length +
      (this.m_aEndStr?.length ?? 0) +
      middle +
      (this.m_pHistory?.Count() ?? 0) * 4
    );
  }

  /** Releases removed text when history drops this action. @returns Nothing. */
  public override Dispose(): void {
    const undoNodes = this.paragraph.GetDoc().GetUndoManager().GetUndoNodes();
    for (const id of this.m_aUndoNodeIds.splice(0)) undoNodes.Release(id);
    this.m_aSelectedNodes = undefined;
    this.m_aEndStr = undefined;
    this.m_pHistory = undefined;
    this.m_aSttStr = "";
  }

  /** Restores removed text and hints. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    if (this.m_aSelectedNodes !== undefined) {
      this.UndoSelectedNodes(context);
      return;
    }
    const node = GetUndoTextNode(context.GetDoc(), this.paragraph);
    node.ClearSwpHintsArr(true);
    node.InsertText(this.m_aSttStr, this.start, SwInsertFlags.NOHINTEXPAND);
    this.m_pHistory?.TmpRollback(context.GetDoc(), 0, false);
  }

  /** Deletes the retained range again. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    this.m_pHistory?.SetTmpEnd(this.m_pHistory.Count());
    if (this.m_aSelectedNodes !== undefined) {
      const last = this.m_aSelectedNodes[this.m_aSelectedNodes.length - 1] as SwTextNode;
      const point = new SwPosition(this.paragraph, this.start, "redline"),
        mark = new SwPosition(last, this.m_nEndContent, "redline"),
        range = new SwPaM(point, mark);
      try {
        context.GetDoc().GetDocumentContentOperationsManager().DeleteAndJoin(range);
        if (!this.afterRecorded) this.SetAfterDelete(range.GetPoint());
      } finally {
        range.Dispose();
        point.Dispose();
        mark.Dispose();
      }
      return;
    }
    DeleteUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + this.m_aSttStr.length,
    );
  }

  /** Restores raw native boundary strings and fresh whole-node history around intact middle undo nodes. Boundary object identity remains the existing cursor adapter,not native recreated node indices. @param context - Writer graph. @returns Nothing. */
  private UndoSelectedNodes(context: SwUndoRedoContext): void {
    const selected = this.m_aSelectedNodes as readonly SwTextNode[],
      first = this.paragraph,
      last = selected[selected.length - 1] as SwTextNode;
    for (const node of [first, last]) {
      node.ClearSwpHintsArr(true);
      node.ResetAttr(RES_CHRATR_BEGIN, RES_CHRATR_END - 1);
      node.ResetAttr([RES_BREAK, RES_PAGEDESC]);
    }
    if (this.m_bJoinNext) {
      const suffix = first.GetText().slice(this.start);
      first.EraseText(this.start);
      last.SetText(suffix);
    }
    first.InsertText(this.m_aSttStr, this.start, SwInsertFlags.NOHINTEXPAND);
    last.InsertText(this.m_aEndStr as string, 0, SwInsertFlags.NOHINTEXPAND);
    const nodes = context.GetDoc().GetNodes();
    let previous = this.m_bJoinNext ? first : nodes.at(last.GetIndex() - 1);
    for (const node of selected) {
      if (nodes.indexOfOrUndefined(node) === undefined) nodes.insertTextNodeAfter(previous, node);
      previous = node;
    }
    this.m_pHistory?.TmpRollback(context.GetDoc(), 0, false);
  }
}

/** Atomic replacement used by paste and fallback editing without a full-document snapshot. */
export class SwUndoReplace extends SwUndo {
  private readonly insertedFragment: SwTextFragment;
  private readonly undoNodes: SwUndoNodes;
  private readonly removedNodeId: number;

  /** Creates one range replacement. @param paragraph - Target node. @param start - Replacement start. @param removedFragment - Original native fragment. @param insertedFragment - Replacement native fragment. @param comment - Command label. @param before - Cursor before replacement. @param after - Cursor after replacement. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly start: number,
    removedFragment: SwTextFragment,
    insertedFragment: SwTextFragment,
    comment: string,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super(comment, before, after);
    this.undoNodes = paragraph.GetDoc().GetUndoManager().GetUndoNodes();
    this.removedNodeId = this.undoNodes.RetainText(removedFragment);
    this.insertedFragment = CopyUndoFragment(insertedFragment);
  }

  /** Reports the two changed range payloads. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return (
      GetFragmentPayloadSize(this.undoNodes.GetText(this.removedNodeId)) +
      GetFragmentPayloadSize(this.insertedFragment)
    );
  }

  /** Releases removed text when history drops this action. @returns Nothing. */
  public override Dispose(): void {
    this.undoNodes.Release(this.removedNodeId);
  }

  /** Restores original range content. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoFragmentLength(this.insertedFragment),
      this.undoNodes.GetText(this.removedNodeId),
    );
  }

  /** Reapplies replacement content. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoFragmentLength(this.undoNodes.GetText(this.removedNodeId)),
      this.insertedFragment,
    );
  }
}

/** Reversible paragraph join retaining the trailing node and both boundaries' native attribute history. */
export class SwUndoJoinParagraphs extends SwUndo {
  private readonly undoNodes: SwUndoNodes;
  private readonly removedNodeId: number;
  private readonly m_pHistory = new SwHistory();
  /** Creates one join action. @param precedingParagraphId - Surviving leading node. @param joinOffset - Original leading text length. @param removedParagraph - Removed trailing node state. @param before - Cursor before join. @param after - Cursor after join. @returns Nothing. */
  public constructor(
    private readonly precedingParagraph: SwTextNode,
    private readonly joinOffset: number,
    removedParagraph: SwTextNode,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Join Paragraphs", before, after);
    this.undoNodes = precedingParagraph.GetDoc().GetUndoManager().GetUndoNodes();
    this.removedNodeId = this.undoNodes.RetainNode(removedParagraph);
    for (const node of [precedingParagraph, removedParagraph]) {
      this.m_pHistory.CopyAttr(node.GetpSwpHints(), node.GetIndex(), 0, node.Len(), true);
      const direct = node.GetpSwAttrSet();
      if (direct !== undefined) this.m_pHistory.CopyFormatAttr(direct, node.GetIndex());
      this.m_pHistory.AddColl(node.GetTextFormatColl(), node.GetIndex(), node.GetNodeType());
    }
  }

  /** Reports one removed paragraph payload. @returns Approximate serialized units. */
  public override GetPayloadSize(): number {
    const removedParagraph = this.undoNodes.GetNode(this.removedNodeId);
    return removedParagraph.Len() + this.m_pHistory.Count() * 4;
  }

  /** Releases the disconnected paragraph when history drops this action. @returns Nothing. */
  public override Dispose(): void {
    this.undoNodes.Release(this.removedNodeId);
  }

  /** Splits the leading node and restores the exact removed node items and hints. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const preceding = GetUndoTextNode(document, this.precedingParagraph);
    document
      .GetDocumentContentOperationsManager()
      .RestoreJoinedTextNode(
        preceding,
        this.joinOffset,
        this.undoNodes.GetNode(this.removedNodeId),
      );
    for (const node of [preceding, this.undoNodes.GetNode(this.removedNodeId)]) {
      node.ClearSwpHintsArr(true);
      node.ResetAttr(RES_CHRATR_BEGIN, RES_CHRATR_END - 1);
    }
    this.m_pHistory.TmpRollback(document, 0, false);
  }

  /** Joins the trailing node into its predecessor again. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const preceding = GetUndoTextNode(document, this.precedingParagraph);
    this.m_pHistory.SetTmpEnd(this.m_pHistory.Count());
    document
      .GetDocumentContentOperationsManager()
      .JoinTextNodes(preceding, this.undoNodes.GetNode(this.removedNodeId));
  }
}

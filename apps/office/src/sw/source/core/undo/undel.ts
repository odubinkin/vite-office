/** @fileoverview Implements bounded Writer delete, replace, and join undo payloads from pinned undel.cxx. */

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

/** Reversible same-node deletion retaining only removed formatted fragments. */
export class SwUndoDelete extends SwUndo {
  private readonly undoNodes: SwUndoNodes;
  private deletedNodeId: number;

  /** Creates one delete action. @param paragraph - Target node. @param start - Deleted range start. @param deletedFragment - Removed native fragment. @param direction - Backspace or forward delete. @param group - Optional character grouping class. @param before - Cursor before deletion. @param after - Cursor after deletion. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private start: number,
    deletedFragment: SwTextFragment,
    private readonly direction: SwUndoDeleteDirection,
    private readonly group: SwUndoDeleteGroup | undefined,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Delete", before, after);
    if (GetUndoFragmentLength(deletedFragment) === 0)
      throw new Error("SwUndoDelete requires non-empty text.");
    this.undoNodes = paragraph.GetDoc().GetUndoManager().GetUndoNodes();
    this.deletedNodeId = this.undoNodes.RetainText(deletedFragment);
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
      nextAction.start + GetUndoFragmentLength(nextAction.GetDeletedFragment()) === this.start
    ) {
      this.start = nextAction.start;
      this.ReplaceDeletedFragment(
        joinFragments(nextAction.GetDeletedFragment(), this.GetDeletedFragment()),
      );
    } else if (this.direction === "delete" && nextAction.start === this.start) {
      this.ReplaceDeletedFragment(
        joinFragments(this.GetDeletedFragment(), nextAction.GetDeletedFragment()),
      );
    } else return false;
    this.SetAfterCursor(nextAction.GetAfterCursorState());
    return true;
  }

  /** Reports retained deleted runs rather than document size. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetFragmentPayloadSize(this.GetDeletedFragment());
  }

  /** Releases removed text when history drops this action. @returns Nothing. */
  public override Dispose(): void {
    this.undoNodes.Release(this.deletedNodeId);
  }

  /** Restores removed text and hints. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start,
      this.GetDeletedFragment(),
    );
  }

  /** Deletes the retained range again. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    DeleteUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoFragmentLength(this.GetDeletedFragment()),
    );
  }

  /** Resolves text owned by the Writer undo node array. @returns Retained fragment. */
  private GetDeletedFragment(): SwTextFragment {
    return this.undoNodes.GetText(this.deletedNodeId);
  }

  /** Replaces grouped removal payload in the Writer undo node array. @param fragment - Grouped text. @returns Nothing. */
  private ReplaceDeletedFragment(fragment: SwTextFragment): void {
    this.undoNodes.Release(this.deletedNodeId);
    this.deletedNodeId = this.undoNodes.RetainText(fragment);
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

/** Concatenates native text and rebased hints for grouped delete payloads. @param left - Leading fragment. @param right - Trailing fragment. @returns Combined fragment. */
function joinFragments(left: SwTextFragment, right: SwTextFragment): SwTextFragment {
  return {
    text: left.text + right.text,
    hints: left.hints.concat(right.hints, left.text.length),
  };
}

/** Reversible paragraph join retaining only the removed trailing node snapshot. */
export class SwUndoJoinParagraphs extends SwUndo {
  private readonly undoNodes: SwUndoNodes;
  private readonly removedNodeId: number;
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
  }

  /** Reports one removed paragraph payload. @returns Approximate serialized units. */
  public override GetPayloadSize(): number {
    const removedParagraph = this.undoNodes.GetNode(this.removedNodeId);
    return removedParagraph.Len() + (removedParagraph.GetpSwpHints()?.Count() ?? 0);
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
  }

  /** Joins the trailing node into its predecessor again. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const preceding = GetUndoTextNode(document, this.precedingParagraph);
    document
      .GetDocumentContentOperationsManager()
      .JoinTextNodes(preceding, this.undoNodes.GetNode(this.removedNodeId));
  }
}

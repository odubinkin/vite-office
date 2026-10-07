/**
 * @fileoverview Defines Writer undo context, cursor snapshots, and range helpers corresponding
 * to the shared SwUndo/SwUndRng infrastructure in pinned LibreOffice undobj.cxx.
 */

import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_CHRATR_BEGIN, RES_CHRATR_END } from "../../../inc/hintids";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextFragment } from "../txtnode/ndtxt";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "../doc/doc";

/** Native numeric range coordinates; content correction for nontext sentinels remains unverified. */
export class SwUndRng {
  public m_nSttNode = 0;
  public m_nEndNode = 0;
  public m_nSttContent = 0;
  public m_nEndContent = 0;

  /** Captures optional native PaM coordinates. @param range - Optional current range. @returns Nothing. */
  public constructor(range?: SwPaM) {
    if (range !== undefined) this.SetValues(range);
  }

  /** Stores sorted absolute indices without retaining registered positions or content. @param range - Actual native range. @returns Nothing. */
  public SetValues(range: SwPaM): void {
    const start = range.Start(),
      end = range.End();
    this.m_nSttNode = start.GetNodeIndex();
    this.m_nSttContent = start.GetContentIndex();
    this.m_nEndNode = range.HasMark() ? end.GetNodeIndex() : 0;
    this.m_nEndContent = range.HasMark() ? end.GetContentIndex() : 0x7fffffff;
  }

  /** Reconstructs range endpoints against current native document indices. @param range - Destination native PaM in the document. @returns Nothing. */
  public SetPaM(range: SwPaM): void {
    const nodes = range.GetPoint().GetNode().GetNodes();
    range.DeleteMark();
    range.GetPoint().Assign(nodes.at(this.m_nSttNode) as SwTextNode, this.m_nSttContent);
    if (this.m_nEndNode === 0 && this.m_nEndContent === 0x7fffffff) return;
    range.SetMark();
    if (this.m_nSttNode === this.m_nEndNode && this.m_nSttContent === this.m_nEndContent) return;
    range.GetPoint().Assign(nodes.at(this.m_nEndNode) as SwTextNode, this.m_nEndContent);
  }
}

/** Owns removed append-only content until the native move from undo storage consumes it. Full SwNodes undo sections and non-end moves remain unverified. */
export class SwUndoSaveContent {
  private boundaryNodeId: number | undefined;
  private readonly nodeIds: number[] = [];

  /** Cuts a represented trailing range and moves actual paragraphs out of the live section. @param range - Actual insertion span. @returns Nothing. */
  public MoveToUndoNds(range: SwPaM): void {
    const start = range.Start(),
      end = range.End();
    const first = start.GetNode() as SwTextNode,
      last = end.GetNode() as SwTextNode;
    if (
      first.StartOfSectionNode() !== last.StartOfSectionNode() ||
      end.GetContentIndex() !== last.Len()
    )
      throw new Error("Writer undo content move requires an end-of-section text range.");
    const added = first
      .GetNodes()
      .entries()
      .slice(first.GetIndex() + 1, last.GetIndex() + 1);
    if (
      added.some(
        /** Performs a native undo ownership check. @param node - Native input. @returns Native operation result. */ (
          node,
        ) => !(node instanceof SwTextNode),
      )
    )
      throw new Error("Writer nontext undo content move is not implemented.");
    const undoNodes = first.GetDoc().GetUndoManager().GetUndoNodes();
    if (start.GetContentIndex() !== first.Len()) {
      const boundary = new SwTextNode(
        first.GetNodes(),
        first.StartOfSectionNode(),
        first.GetTextFormatColl(),
      );
      const items = new SfxItemSet(first.GetDoc().GetAttrPool(), [
        [RES_CHRATR_BEGIN, RES_CHRATR_END - 1],
      ]);
      const direct = first.GetpSwAttrSet();
      if (direct !== undefined) items.PutSet(direct);
      if (items.Count() !== 0) boundary.SetAttr(items);
      boundary.ReplaceRange(
        0,
        0,
        first.CutTextFragment(start.GetContentIndex(), first.Len()),
        true,
      );
      this.boundaryNodeId = undoNodes.RetainNode(boundary);
    }
    const ids: number[] = [];
    for (const node of [...added].reverse()) {
      first.GetNodes().removeTextNode(node as SwTextNode);
      ids.unshift(undoNodes.RetainNode(node as SwTextNode));
    }
    this.nodeIds.push(...ids);
  }

  /** Moves retained content back to the live document and releases consumed storage. @param position - Current insertion boundary. @returns Nothing. */
  public MoveFromUndoNds(position: SwPosition): void {
    let previous = position.GetNode() as SwTextNode;
    const undoNodes = previous.GetDoc().GetUndoManager().GetUndoNodes();
    if (this.boundaryNodeId !== undefined) {
      const boundary = undoNodes.GetNode(this.boundaryNodeId);
      boundary.FormatToTextAttr(boundary);
      previous.ReplaceRange(
        position.GetContentIndex(),
        position.GetContentIndex(),
        boundary.CutTextFragment(0, boundary.Len()),
        true,
      );
      undoNodes.Release(this.boundaryNodeId);
      this.boundaryNodeId = undefined;
    }
    for (const id of this.nodeIds.splice(0)) {
      const node = undoNodes.GetNode(id);
      previous.GetNodes().insertTextNodeAfter(previous, node);
      undoNodes.Release(id);
      previous = node;
    }
  }

  /** Counts only actually removed content retained in undo storage. @param doc - Owning document. @returns Payload units. */
  public GetPayloadSize(doc: SwDoc): number {
    const undoNodes = doc.GetUndoManager().GetUndoNodes();
    let size = 0;
    const ids =
      this.boundaryNodeId === undefined ? this.nodeIds : [this.boundaryNodeId, ...this.nodeIds];
    for (const id of ids) {
      const node = undoNodes.GetNode(id);
      size +=
        node.Len() + (node.GetpSwpHints()?.Count() ?? 0) * 4 + (node.GetpSwAttrSet()?.Count() ?? 0);
    }
    return size;
  }

  /** Drops only removed content when its history owner is discarded. @param doc - Owning document. @returns Nothing. */
  public Dispose(doc: SwDoc): void {
    const undoNodes = doc.GetUndoManager().GetUndoNodes();
    if (this.boundaryNodeId !== undefined) undoNodes.Release(this.boundaryNodeId);
    this.boundaryNodeId = undefined;
    for (const id of this.nodeIds.splice(0)) undoNodes.Release(id);
  }
}

/** Supplies one current native endpoint to an action boundary; stored history uses numeric ranges. */
export interface SwUndoCursorPosition {
  /** Current node resolved at the shell boundary. */
  readonly node: SwTextNode;
  /** UTF-16 content offset in that node. */
  readonly offset: number;
}

/** Stores all Writer cursor state needed after Undo or Redo. */
export interface SwUndoCursorState {
  /** Retains native table-mode endpoints separately from editing cell rings. */
  readonly tableSelection?: boolean;
  /** Command-target paragraph identity. */
  readonly activeParagraph: SwTextNode;
  /** Optional fixed selection endpoint; its presence retains direction. */
  readonly mark?: SwUndoCursorPosition;
  /** Direct attributes active at a collapsed Writer cursor. */
  readonly pendingCharacterItems: SfxItemSet;
  /** Moving selection endpoint. */
  readonly point: SwUndoCursorPosition;
}

/** Creates an undo cursor state from canonical node references. @param point - Moving endpoint node. @param pointOffset - Moving endpoint offset. @param mark - Optional fixed endpoint node. @param markOffset - Optional fixed endpoint offset. @param activeParagraph - Active node. @param pendingCharacterItems - Pending caret attributes. @returns Complete undo cursor state. */
export function createWriterUndoCursorState(
  point: SwTextNode,
  pointOffset: number,
  mark: SwTextNode | undefined,
  markOffset: number | undefined,
  activeParagraph: SwTextNode,
  pendingCharacterItems: SfxItemSet,
): SwUndoCursorState {
  return {
    activeParagraph,
    ...(mark === undefined || markOffset === undefined
      ? {}
      : { mark: { node: mark, offset: markOffset } }),
    pendingCharacterItems: pendingCharacterItems.Clone(),
    point: { node: point, offset: pointOffset },
  };
}

/** Creates a collapsed undo cursor endpoint. @param paragraph - Target node. @param offset - UTF-16 content offset. @param pendingCharacterItems - Pending caret attributes. @returns Complete undo cursor state. */
export function createWriterCollapsedCursorState(
  paragraph: SwTextNode,
  offset: number,
  pendingCharacterItems: SfxItemSet,
): SwUndoCursorState {
  return {
    activeParagraph: paragraph,
    pendingCharacterItems: pendingCharacterItems.Clone(),
    point: { node: paragraph, offset },
  };
}

/** Context supplied by SwWrtShell while one Writer action is undone or redone. */
export interface SwUndoRedoContext {
  /** Returns the current canonical document graph. @returns Active SwDoc. */
  GetDoc(): SwDoc;
  /** Restores persistent shell cursor and pending attributes. @param state - Stored action endpoint state. @returns Nothing. */
  RestoreCursor(state: SwUndoCursorState): void;
}

/** Writer action base that brackets its model payload with complete cursor states. */
export abstract class SwUndo extends SfxUndoAction<SwUndoRedoContext> {
  private readonly before: SwUndoCursorRange | undefined;
  private after: SwUndoCursorRange | undefined;

  /** Creates a Writer undo action. @param comment - User-visible label. @param before - Cursor state before execution. @param after - Cursor state after execution. @returns Nothing. */
  protected constructor(
    private readonly comment: string,
    before?: SwUndoCursorState,
    after?: SwUndoCursorState,
  ) {
    super();
    this.before = before === undefined ? undefined : captureCursorRange(before);
    this.after = after === undefined ? undefined : captureCursorRange(after);
  }

  /** Reverts the model payload and restores the pre-command cursor. @param context - Active Writer undo context. @returns Nothing. */
  public finalUndo(context: SwUndoRedoContext): void {
    this.UndoImpl(context);
    if (this.before !== undefined)
      context.RestoreCursor(restoreCursorRange(context.GetDoc(), this.before));
  }

  /** Reapplies the model payload and restores the post-command cursor. @param context - Active Writer redo context. @returns Nothing. */
  public finalRedo(context: SwUndoRedoContext): void {
    this.RedoImpl(context);
    if (this.after !== undefined)
      context.RestoreCursor(restoreCursorRange(context.GetDoc(), this.after));
  }

  /** Implements the SfxUndoAction undo entry point. @param context - Active Writer context. @returns Nothing. */
  public override UndoWithContext(context: SwUndoRedoContext): void {
    this.finalUndo(context);
  }

  /** Implements the SfxUndoAction redo entry point. @param context - Active Writer context. @returns Nothing. */
  public override RedoWithContext(context: SwUndoRedoContext): void {
    this.finalRedo(context);
  }

  /** Returns the user-visible Writer command label. @returns Action label. */
  public override GetComment(): string {
    return this.comment;
  }

  /** Replaces the post-command cursor after compatible action grouping. @param state - New grouped endpoint. @returns Nothing. */
  protected SetAfterCursor(state: SwUndoCursorState): void {
    this.after = captureCursorRange(state);
  }

  /** Records a completed native mutation's collapsed point while retaining its owned pending items and mode. @param position - Actual post-mutation native point. @returns Nothing. */
  protected SetAfterCursorPosition(position: SwPosition): void {
    const pam = new SwPaM(position);
    try {
      const after = this.after as SwUndoCursorRange;
      after.range.SetValues(pam);
      this.after = { ...after, pointIsStart: true, activeNode: position.GetNodeIndex() };
    } finally {
      pam.Dispose();
    }
  }

  /** Reconstructs the post-command cursor for compatible grouping against current nodes. @param document - Current native document. @returns Independent endpoint state. */
  protected GetAfterCursorState(document: SwDoc): SwUndoCursorState {
    return restoreCursorRange(document, this.after as SwUndoCursorRange);
  }

  /** Reverts only the domain payload. @param context - Active Writer context. @returns Nothing. */
  protected abstract UndoImpl(context: SwUndoRedoContext): void;

  /** Reapplies only the domain payload. @param context - Active Writer context. @returns Nothing. */
  protected abstract RedoImpl(context: SwUndoRedoContext): void;
}

/** Validates one action-target text node. @param document - Current SwDoc. @param node - Retained node reference. @returns Matching SwTextNode. */
export function GetUndoTextNode(document: SwDoc, node: SwTextNode): SwTextNode {
  if (node.GetDoc() !== document) throw new Error("Writer undo node belongs to another document.");
  return node;
}

/** Captures a native Writer text/hint fragment for undo. @param node - Source node. @param start - Inclusive offset. @param end - Exclusive offset. @returns Independent fragment. */
export function CopyTextFragment(node: SwTextNode, start: number, end: number): SwTextFragment {
  return CopyUndoFragment(node.CaptureTextFragment(start, end));
}

/** Deep-copies a native Writer fragment without browser projection. @param fragment - Source fragment. @returns Independent fragment. */
export function CopyUndoFragment(fragment: SwTextFragment): SwTextFragment {
  return { text: fragment.text, hints: fragment.hints.clone() };
}

/** Returns a native undo fragment's UTF-16 text length. @param fragment - Native fragment. @returns UTF-16 length. */
export function GetUndoFragmentLength(fragment: SwTextFragment): number {
  return fragment.text.length;
}

/** Replaces one node range without cloning its SwDoc. @param document - Mutated graph. @param node - Target node. @param start - Inclusive offset. @param end - Exclusive offset. @param fragment - Replacement native fragment. @returns Nothing. */
export function ReplaceUndoRange(
  document: SwDoc,
  node: SwTextNode,
  start: number,
  end: number,
  fragment: SwTextFragment,
): void {
  const target = GetUndoTextNode(document, node);
  const point = new SwPosition(target, end, "redline");
  const mark = new SwPosition(target, start, "redline");
  const range = new SwPaM(point, mark);
  try {
    document.GetDocumentContentOperationsManager().ReplaceRange(range, fragment);
  } finally {
    range.Dispose();
    point.Dispose();
    mark.Dispose();
  }
}

/** Deletes one retained undo range through IDocumentContentOperations. @param document - Mutated graph. @param node - Target node. @param start - Inclusive offset. @param end - Exclusive offset. @returns Nothing. */
export function DeleteUndoRange(
  document: SwDoc,
  node: SwTextNode,
  start: number,
  end: number,
): void {
  const target = GetUndoTextNode(document, node);
  const point = new SwPosition(target, end, "redline");
  const mark = new SwPosition(target, start, "redline");
  const range = new SwPaM(point, mark);
  try {
    document.GetDocumentContentOperationsManager().DeleteRange(range);
  } finally {
    range.Dispose();
    point.Dispose();
    mark.Dispose();
  }
}

/** Estimates retained native text and hint payload. @param fragment - Native fragment. @returns Approximate scalar units. */
export function GetFragmentPayloadSize(fragment: SwTextFragment): number {
  return fragment.text.length + fragment.hints.Count() * 4;
}

/** Numeric native range plus the shell's direction, active target and pending-item adjuncts. */
interface SwUndoCursorRange {
  readonly range: SwUndRng;
  readonly pointIsStart: boolean;
  readonly activeNode: number;
  readonly pendingCharacterItems: SfxItemSet;
  readonly tableSelection?: boolean;
}

/** Captures absolute coordinates without registering predicted post-action offsets in live text. @param state - Current shell boundary. @returns Owned numeric history. */
function captureCursorRange(state: SwUndoCursorState): SwUndoCursorRange {
  const pointNode = state.point.node.GetIndex(),
    markNode = state.mark?.node.GetIndex(),
    pointIsStart =
      state.mark === undefined ||
      pointNode < (markNode as number) ||
      (pointNode === markNode && state.point.offset <= state.mark.offset),
    range = new SwUndRng();
  const start = pointIsStart ? state.point : (state.mark as SwUndoCursorPosition);
  range.m_nSttNode = start.node.GetIndex();
  range.m_nSttContent = start.offset;
  if (state.mark === undefined) {
    range.m_nEndNode = 0;
    range.m_nEndContent = 0x7fffffff;
  } else {
    const end = pointIsStart ? state.mark : state.point;
    range.m_nEndNode = end.node.GetIndex();
    range.m_nEndContent = end.offset;
  }
  return {
    ...(state.tableSelection === undefined ? {} : { tableSelection: state.tableSelection }),
    range,
    pointIsStart,
    activeNode: state.activeParagraph.GetIndex(),
    pendingCharacterItems: state.pendingCharacterItems.Clone(),
  };
}

/** Rebuilds a current native PaM and releases its temporary registered indices after boundary conversion. @param document - Current document from undo context. @param state - Stored numeric boundary. @returns Ephemeral current shell endpoints. */
function restoreCursorRange(document: SwDoc, state: SwUndoCursorRange): SwUndoCursorState {
  const point = new SwPosition(document.GetNodes().at(state.range.m_nSttNode) as SwTextNode, 0),
    pam = new SwPaM(point);
  try {
    state.range.SetPaM(pam);
    if (state.pointIsStart) pam.Exchange();
    return {
      ...(state.tableSelection === undefined ? {} : { tableSelection: state.tableSelection }),
      activeParagraph: document.GetNodes().at(state.activeNode) as SwTextNode,
      ...(pam.HasMark()
        ? {
            mark: {
              node: pam.GetMark().GetNode() as SwTextNode,
              offset: pam.GetMark().GetContentIndex(),
            },
          }
        : {}),
      pendingCharacterItems: state.pendingCharacterItems.Clone(),
      point: {
        node: pam.GetPoint().GetNode() as SwTextNode,
        offset: pam.GetPoint().GetContentIndex(),
      },
    };
  } finally {
    pam.Dispose();
    point.Dispose();
  }
}

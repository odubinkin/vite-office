/** @fileoverview Implements the bounded SwUndoInsert and normal SwUndoReplace actions from pinned LibreOffice unins.cxx. */

import { SwPaM, SwPosition } from "../crsr/pam";
import { SwHistory } from "./rolbck";
import { createWriterUndoCursorState } from "./undobj";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SwTextFragment, SwTextNode } from "../txtnode/ndtxt";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwDoc } from "../doc/doc";
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

/** Character class retained by Writer's insert grouping policy. */
export type SwUndoInsertGroup = "delimiter" | "word";

/** Reversible insertion retaining only inserted formatted text and stable range coordinates. */
export class SwUndoInsert extends SwUndo {
  private readonly m_nNode: number;
  private readonly m_rDoc: SwDoc;
  private insertedFragment: SwTextFragment;
  private readonly insertionItems: SfxItemSet | undefined;

  /** Creates one insert action before it is first redone. @param paragraph - Target node. @param offset - Insertion start. @param insertedFragment - Inserted native fragment. @param group - Optional grouping class. @param before - Cursor before insertion. @param after - Cursor after insertion. @param m_nInsertFlags - Native insertion mode retained for redo. @param insertionItems - Pending character items for native text insertion;omitted for explicit fragment adapters. @returns Nothing. */
  public constructor(
    paragraph: SwTextNode,
    private readonly offset: number,
    insertedFragment: SwTextFragment,
    private readonly group: SwUndoInsertGroup | undefined,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
    private readonly m_nInsertFlags: SwInsertFlags,
    insertionItems?: SfxItemSet,
  ) {
    super("Insert", before, after);
    this.m_nNode = paragraph.GetIndex();
    this.m_rDoc = paragraph.GetDoc();
    this.insertedFragment = CopyUndoFragment(insertedFragment);
    this.insertionItems = insertionItems?.Clone();
    if (GetUndoFragmentLength(this.insertedFragment) === 0)
      throw new Error("SwUndoInsert requires non-empty text.");
  }

  /** Absorbs adjacent same-class text like SwUndoInsert::CanGrouping. @param nextAction - Newer action candidate. @returns True when grouped. */
  public override Merge(nextAction: SfxUndoAction<SwUndoRedoContext>): boolean {
    if (
      !(nextAction instanceof SwUndoInsert) ||
      (nextAction.m_nInsertFlags & SwInsertFlags.FORCEHINTEXPAND) !== 0 ||
      this.group === undefined ||
      nextAction.group !== this.group ||
      nextAction.m_rDoc !== this.m_rDoc ||
      nextAction.m_nNode !== this.m_nNode ||
      nextAction.offset !== this.offset + GetUndoFragmentLength(this.insertedFragment) ||
      (this.insertionItems === undefined) !== (nextAction.insertionItems === undefined) ||
      !haveEqualBoundaryHints(this.insertedFragment, nextAction.insertedFragment)
    )
      return false;
    const left = this.insertedFragment;
    const right = nextAction.insertedFragment;
    this.insertedFragment = {
      text: left.text + right.text,
      hints: left.hints.concat(right.hints, left.text.length),
    };
    this.SetAfterCursor(nextAction.GetAfterCursorState(this.m_rDoc));
    return true;
  }

  /** Reports retained inserted text rather than document size. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetFragmentPayloadSize(this.insertedFragment);
  }

  /** Removes the exact inserted range. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    DeleteUndoRange(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
      this.offset,
      this.offset + GetUndoFragmentLength(this.insertedFragment),
    );
  }

  /** Reinserts native text through owned Update or restores an explicit fragment adapter. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    if (this.insertionItems !== undefined) {
      const node = GetUndoTextNode(
        context.GetDoc(),
        this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
      );
      const text = this.insertedFragment.text;
      node.InsertText(text, this.offset, this.m_nInsertFlags, this.insertionItems);
      this.insertedFragment = node.CaptureTextFragment(this.offset, this.offset + text.length);
      return;
    }
    ReplaceUndoRange(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
      this.offset,
      this.offset,
      this.insertedFragment,
    );
  }
}

/** Actual normal same-node SwUndoReplace responsibility from native unins.cxx: source strings, completed end and whole-node attribute history. Native multi-node/regex/content-index histories remain unported. */
export class SwUndoReplace extends SwUndo {
  private readonly m_rDoc: SwDoc;
  private readonly m_nSttNd: number;
  private readonly m_nSttCnt: number;
  private readonly m_nSelEnd: number;
  private m_nEndCnt: number;
  private readonly m_sOld: string;
  private readonly m_pHistory: SwHistory | undefined;
  /** Captures the original native selection and complete supported hint history before mutation. @param range - Marked same-node range. @param m_sIns - Original replacement string. @param regExp - Native regex replacement mode, not implemented here. @returns Undo payload. */
  public constructor(
    range: SwPaM,
    private readonly m_sIns: string,
    regExp = false,
  ) {
    super("Replace");
    if (regExp || !range.HasMark() || range.Start().GetNode() !== range.End().GetNode())
      throw new Error("Writer replacement undo requires a normal marked same-node range.");
    const node = range.Start().GetNode() as SwTextNode;
    this.m_rDoc = node.GetDoc();
    this.m_nSttNd = node.GetIndex();
    this.m_nSttCnt = range.Start().GetContentIndex();
    this.m_nSelEnd = this.m_nEndCnt = range.End().GetContentIndex();
    this.m_sOld = node.GetText().slice(this.m_nSttCnt, this.m_nSelEnd);
    const history = new SwHistory();
    history.CopyAttr(node.GetpSwpHints(), node.GetIndex(), 0, node.Len(), true);
    this.m_pHistory = history.Count() === 0 ? undefined : history;
  }
  /** Records the actual completed replacement end rather than assuming the requested string was fully inserted. @param range - Completed native selection. @returns Nothing. */
  public SetEnd(range: SwPaM): void {
    this.m_nEndCnt = range.End().GetContentIndex();
  }
  /** Reports retained text/hint payload without inventing native allocations or ABI sizes. @returns Logical payload units. */
  public override GetPayloadSize(): number {
    return this.m_sOld.length + this.m_sIns.length + (this.m_pHistory?.Count() ?? 0) * 4;
  }
  /** Restores source text through the same document API, then the original complete hint history in forward history order. @param context - Active undo context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const range = this.MakeRange(this.m_nEndCnt);
    try {
      context
        .GetDoc()
        .GetDocumentContentOperationsManager()
        .ReplaceRange(range, this.m_sOld, false);
      if (this.m_pHistory !== undefined) {
        (range.GetPoint().GetNode() as SwTextNode).ClearSwpHintsArr(true);
        this.m_pHistory.TmpRollback(context.GetDoc(), 0, false);
      }
      this.RestoreCursor(context, range);
    } finally {
      range.Dispose();
    }
  }
  /** Repeats the original string replacement. Native history Move with an empty DelContentIndex history does not reset its temporary end; preserve that source behavior. @param context - Active redo context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const range = this.MakeRange(this.m_nSelEnd);
    try {
      context
        .GetDoc()
        .GetDocumentContentOperationsManager()
        .ReplaceRange(range, this.m_sIns, false);
      this.RestoreCursor(context, range);
    } finally {
      range.Dispose();
    }
  }
  /** Builds actual registered source coordinates against the current document array. @param end - Current source end. @returns Marked replacement range. */
  private MakeRange(end: number): SwPaM {
    const node = this.m_rDoc.GetNodes().at(this.m_nSttNd),
      start = new SwPosition(node, this.m_nSttCnt),
      stop = new SwPosition(node, end);
    try {
      return new SwPaM(stop, start);
    } finally {
      start.Dispose();
      stop.Dispose();
    }
  }
  /** Native undo/redo normalizes a nonempty replacement selection forward and collapses equal endpoints. @param context - Active context. @param range - Completed range. @returns Nothing. */
  private RestoreCursor(context: SwUndoRedoContext, range: SwPaM): void {
    if (range.GetPoint().compare(range.GetMark()) === 0) range.DeleteMark();
    else range.Normalize(false);
    const point = range.GetPoint(),
      mark = range.HasMark() ? range.GetMark() : undefined,
      node = point.GetNode() as SwTextNode;
    context.RestoreCursor(
      createWriterUndoCursorState(
        node,
        point.GetContentIndex(),
        mark?.GetNode() as SwTextNode | undefined,
        mark?.GetContentIndex(),
        node,
        node.GetCharacterItemsAt(point.GetContentIndex()),
      ),
    );
  }
}

/** Compares the two fragments that become adjacent after grouping. @param left - Earlier inserted fragment. @param right - Later inserted fragment. @returns Whether native hint state agrees. */
function haveEqualBoundaryHints(left: SwTextFragment, right: SwTextFragment): boolean {
  return left.hints.equals(right.hints);
}

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
  SwUndoSaveContent,
  DelContentType,
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
    left.hints.Dispose();
    const state = nextAction.GetAfterCursorState(this.m_rDoc);
    try {
      this.SetAfterCursor(state);
    } finally {
      state.pendingCharacterItems.Dispose();
    }
    return true;
  }

  /** Releases owned fragment and pending-item copies when insertion history is discarded. @returns Nothing. */
  public override Dispose(): void {
    this.insertedFragment.hints.Dispose();
    this.insertionItems?.Dispose();
    super.Dispose();
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
      const previous = this.insertedFragment;
      this.insertedFragment = node.CaptureTextFragment(this.offset, this.offset + text.length);
      previous.hints.Dispose();
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

/** Native replacement undo wrapper; the SaveContent-derived implementation owns source strings, ranges and partitioned history. */
export class SwUndoReplace extends SwUndo {
  private readonly m_pImpl: SwUndoReplaceImpl;
  /** Creates the original normal marked same-node replacement payload. @param range - Original range. @param inserted - Requested string. @param regExp - Unsupported regex mode. @returns Undo action. */
  public constructor(range: SwPaM, inserted: string, regExp = false) {
    super("Replace");
    this.m_pImpl = new SwUndoReplaceImpl(range, inserted, regExp);
  }
  /** Native unique implementation destruction. @returns Nothing. */
  public override Dispose(): void {
    this.m_pImpl.Dispose();
    super.Dispose();
  }
  /** Records completed insertion coordinates. @param range - Completed range. @returns Nothing. */
  public SetEnd(range: SwPaM): void {
    this.m_pImpl.SetEnd(range);
  }
  /** Logical represented payload units, without native ABI allocations. @returns Payload units. */
  public override GetPayloadSize(): number {
    return this.m_pImpl.GetPayloadSize();
  }
  /** Delegates source text/history restoration and adapts the completed PaM to the current shell context. @param context - Current context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const range = this.m_pImpl.UndoImpl(context.GetDoc());
    try {
      this.RestoreCursor(context, range);
    } finally {
      range.Dispose();
    }
  }
  /** Delegates original redo recollection and replacement. @param context - Current context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const range = this.m_pImpl.RedoImpl(context.GetDoc());
    try {
      this.RestoreCursor(context, range);
    } finally {
      range.Dispose();
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

/** Original SwUndoReplace::Impl responsibility on SwUndoSaveContent. Only normal same-node text and the existing collapsed ordinary bookmark model are represented. */
class SwUndoReplaceImpl extends SwUndoSaveContent {
  private readonly m_rDoc: SwDoc;
  private readonly m_nSttNd: number;
  private readonly m_nSttCnt: number;
  private readonly m_nSelEnd: number;
  private m_nEndCnt: number;
  private readonly m_sOld: string;
  private m_nSetPos: number;
  /** Captures original coordinates, deletes/stores affected content indices, then copies complete node hint history. @param range - Native source range. @param m_sIns - Requested string. @param regExp - Native regex mode, not represented. @returns Payload. */
  public constructor(
    range: SwPaM,
    private readonly m_sIns: string,
    regExp: boolean,
  ) {
    super();
    if (regExp || !range.HasMark() || range.Start().GetNode() !== range.End().GetNode())
      throw new Error("Writer replacement undo requires a normal marked same-node range.");
    const node = range.Start().GetNode() as SwTextNode;
    this.m_rDoc = node.GetDoc();
    this.m_nSttNd = node.GetIndex();
    this.m_nSttCnt = range.Start().GetContentIndex();
    this.m_nSelEnd = this.m_nEndCnt = range.End().GetContentIndex();
    this.m_pHistory = new SwHistory();
    this.DelContentIndex(
      range.GetMark(),
      range.GetPoint(),
      DelContentType.AllMask | DelContentType.Replace,
    );
    this.m_nSetPos = this.m_pHistory.Count();
    this.m_pHistory.CopyAttr(node.GetpSwpHints(), node.GetIndex(), 0, node.Len(), true);
    if (this.m_pHistory.Count() === 0) this.m_pHistory = undefined;
    this.m_sOld = node.GetText().slice(this.m_nSttCnt, this.m_nSelEnd);
  }
  /** Native SaveContent-base member destruction uses this implementation's actual document. @returns Nothing. */
  public override Dispose(): void {
    super.Dispose(this.m_rDoc);
  }
  /** Stores actual completed end. @param range - Completed range. @returns Nothing. */
  public SetEnd(range: SwPaM): void {
    this.m_nEndCnt = range.End().GetContentIndex();
  }
  /** Reports represented payload units. @returns Logical units. */
  public override GetPayloadSize(): number {
    return this.m_sOld.length + this.m_sIns.length + (this.m_pHistory?.Count() ?? 0) * 4;
  }
  /** Original hint suffix temporary restoration precedes destructive bookmark prefix rollback and ownership moves. @param doc - Owning graph. @returns Owned completed range for wrapper adaptation. */
  public UndoImpl(doc: SwDoc): SwPaM {
    const range = this.MakeRange(this.m_nEndCnt);
    try {
      doc.GetDocumentContentOperationsManager().ReplaceRange(range, this.m_sOld, false);
      if (this.m_pHistory !== undefined) {
        (range.GetPoint().GetNode() as SwTextNode).ClearSwpHintsArr(true);
        this.m_pHistory.TmpRollback(doc, this.m_nSetPos, false);
        if (this.m_nSetPos !== 0) {
          if (this.m_nSetPos < this.m_pHistory.Count()) {
            const history = new SwHistory();
            history.Move(0, this.m_pHistory, this.m_nSetPos);
            this.m_pHistory.Rollback(doc);
            this.m_pHistory.Move(0, history);
          } else {
            this.m_pHistory.Rollback(doc);
            this.m_pHistory = undefined;
          }
        }
      }
      return range;
    } catch (error) {
      range.Dispose();
      throw error;
    }
  }
  /** Recollects fresh content-index history before reusing source strings; Move does not reset consumed hint ends. @param doc - Owning graph. @returns Owned completed range. */
  public RedoImpl(doc: SwDoc): SwPaM {
    const range = this.MakeRange(this.m_nSelEnd);
    try {
      if (this.m_pHistory !== undefined) {
        const saved = this.m_pHistory;
        this.m_pHistory = new SwHistory();
        this.DelContentIndex(
          range.GetMark(),
          range.GetPoint(),
          DelContentType.AllMask | DelContentType.Replace,
        );
        this.m_nSetPos = this.m_pHistory.Count();
        const fresh = this.m_pHistory;
        this.m_pHistory = saved;
        this.m_pHistory.Move(0, fresh);
      } else {
        this.m_pHistory = new SwHistory();
        this.DelContentIndex(
          range.GetMark(),
          range.GetPoint(),
          DelContentType.AllMask | DelContentType.Replace,
        );
        this.m_nSetPos = this.m_pHistory.Count();
        if (this.m_nSetPos === 0) this.m_pHistory = undefined;
      }
      doc.GetDocumentContentOperationsManager().ReplaceRange(range, this.m_sIns, false);
      return range;
    } catch (error) {
      range.Dispose();
      throw error;
    }
  }
  /** Reconstructs native numeric source coordinates against current node slots. @param end - Saved content end. @returns Actual range. */
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
}

/** Compares the two fragments that become adjacent after grouping. @param left - Earlier inserted fragment. @param right - Later inserted fragment. @returns Whether native hint state agrees. */
function haveEqualBoundaryHints(left: SwTextFragment, right: SwTextFragment): boolean {
  return left.hints.equals(right.hints);
}

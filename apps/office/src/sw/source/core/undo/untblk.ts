/** @fileoverview Owns represented SwUndoInserts/SwUndoInsDoc native numeric range and removed-content history from untblk.cxx. */
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "../doc/doc";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { SwHistory } from "./rolbck";
import {
  SwUndo,
  SwUndRng,
  SwUndoSaveContent,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Captures original history and native range coordinates, with removed content owned only while undone. */
export abstract class SwUndoInserts extends SwUndo {
  private readonly doc: SwDoc;
  private readonly range: SwUndRng;
  private readonly content = new SwUndoSaveContent();
  private readonly collection: SwTextFormatColl;
  private readonly history = new SwHistory();
  private rangeRecorded = false;

  /** Captures native history before an end-of-cell import. @param point - Actual insertion point. @param before - Original display state. @returns Nothing. */
  protected constructor(point: SwPosition, before: SwUndoCursorState) {
    super("Insert Document", before, before);
    const first = point.GetNode() as SwTextNode;
    if (point.GetContentIndex() !== first.Len())
      throw new Error("SwUndoInsDoc non-end insertion is not implemented.");
    this.doc = first.GetDoc();
    const pam = new SwPaM(point);
    try {
      this.range = new SwUndRng(pam);
    } finally {
      pam.Dispose();
    }
    this.collection = first.GetTextFormatColl();
    this.history.CopyAttr(first.GetpSwpHints(), first.GetIndex(), 0, first.Len(), false);
    const items = first.GetpSwAttrSet();
    if (items !== undefined) this.history.CopyFormatAttr(items, first.GetIndex());
  }

  /** Records native range coordinates after import without retaining live content. @param end - Actual final point. @param after - Post-read display state. @returns Nothing. */
  public SetInsertRange(end: SwPosition, after: SwUndoCursorState): void {
    const first = this.doc.GetNodes().at(this.range.m_nSttNode) as SwTextNode;
    const last = end.GetNode() as SwTextNode;
    if (
      last.StartOfSectionNode() !== first.StartOfSectionNode() ||
      end.GetContentIndex() !== last.Len() ||
      last.GetIndex() < first.GetIndex()
    )
      throw new Error("SwUndoInsDoc range must end in its original text section.");
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
      throw new Error("SwUndoInsDoc nontext insertion is not implemented.");
    const start = new SwPosition(first, this.range.m_nSttContent),
      pam = new SwPaM(end, start);
    try {
      this.range.SetValues(pam);
      this.rangeRecorded = true;
      this.SetAfterCursor(after);
    } finally {
      pam.Dispose();
      start.Dispose();
    }
  }

  /** Counts original history and only actual removed native content. @returns Payload units. */
  public override GetPayloadSize(): number {
    return this.content.GetPayloadSize(this.doc) + this.history.Count() * 4;
  }

  /** Drops disconnected content when the reader action leaves history. @returns Nothing. */
  public override Dispose(): void {
    this.content.Dispose(this.doc);
  }

  /** Resolves current numeric indices, moves insertion out and restores original history. @param context - Native document context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc(),
      point = new SwPosition(
        doc.GetNodes().at(this.range.m_nSttNode) as SwTextNode,
        this.range.m_nSttContent,
      ),
      pam = new SwPaM(point);
    point.Dispose();
    try {
      this.range.SetPaM(pam);
      const first = pam.Start().GetNode() as SwTextNode;
      this.content.MoveToUndoNds(pam);
      first.ClearSwpHintsArr(true);
      first.ResetAllAttr();
      first.ChgFormatColl(this.collection);
      this.history.SetTmpEnd(this.history.Count());
      this.history.TmpRollback(doc, 0, false);
    } finally {
      pam.Dispose();
    }
  }

  /** Consumes removed content at the current native start index. @param context - Native document context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    if (!this.rangeRecorded) throw new Error("SwUndoInsDoc insertion range has not been recorded.");
    const doc = context.GetDoc(),
      point = new SwPosition(
        doc.GetNodes().at(this.range.m_nSttNode) as SwTextNode,
        this.range.m_nSttContent,
      );
    try {
      this.content.MoveFromUndoNds(point);
    } finally {
      point.Dispose();
    }
  }
}

/** Native document-read specialization of insertion history. */
export class SwUndoInsDoc extends SwUndoInserts {
  /** Captures the document-read boundary. @param point - Actual point. @param before - Original display state. @returns Nothing. */
  public constructor(point: SwPosition, before: SwUndoCursorState) {
    super(point, before);
  }
}

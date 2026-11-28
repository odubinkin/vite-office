/** @fileoverview Retains the actual Writer node section for complete table deletion and undo. */
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwDoc } from "../doc/doc";
import { PaMCorrAbs } from "../doc/doccorr";
import type { SwTableNode } from "../docnode/node";
import { SwNodes } from "../docnode/nodes";
import type { SwTextNode } from "../txtnode/ndtxt";
import {
  SwUndo,
  SwUndoSaveContent,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Retains content indices and anchored formats through the existing native undo history. */
class TableDeleteContent extends SwUndoSaveContent {
  /** Removes content owners associated with the complete table section. @param table - Selected native table. @returns Nothing. */
  public Save(table: SwTableNode): void {
    const start = new SwPosition(table);
    const end = new SwPosition(table.EndOfSectionNode());
    try {
      this.DelContentIndex(start, end);
    } finally {
      end.Dispose();
      start.Dispose();
    }
  }

  /** Restores the saved content owners once their native nodes are connected again. @param document - Owner of the section. @returns Nothing. */
  public Restore(document: SwDoc): void {
    this.m_pHistory?.Rollback(document);
    this.m_pHistory = undefined;
  }
}

/** Deletes the table's entire structural range and reattaches it on undo. */
export class SwUndoDeleteTable extends SwUndo {
  private readonly document: SwDoc;
  private readonly content = new TableDeleteContent();
  private sectionId: number | undefined;
  private position: number;
  private createdParagraph: SwTextNode | undefined;

  /** Stores the native table and the original cursor used by this deletion. @param table - Selected table node. @param before - Actual cursor before the command. @returns Nothing. */
  public constructor(
    private readonly table: SwTableNode,
    before: SwUndoCursorState,
  ) {
    super("Delete Table", before, before);
    this.document = table.GetDoc();
    this.position = table.GetIndex();
  }

  /** Moves the native table section into undo storage and moves the caret underneath it. @param context - Native shell history context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc();
    const nodes = doc.GetNodes();
    const parent = this.table.StartOfSectionNode();
    const sectionEnd = this.table.EndOfSectionNode();
    const following = nodes.at(sectionEnd.GetIndex() + 1);
    const forward = new SwPosition(sectionEnd);
    const backward = new SwPosition(this.table);
    const range = new SwPaM(forward, backward);
    try {
      const next = SwNodes.GoNext(forward)?.GetTextNode() ?? undefined;
      const previous = SwNodes.GoPrevious(backward)?.GetTextNode() ?? undefined;
      const onlyContent =
        parent.GetIndex() + 1 === this.table.GetIndex() && following === parent.EndOfSectionNode();
      const outerTable = parent.FindTableNode();
      const preferPrevious =
        previous !== undefined &&
        (next === undefined ||
          (next.FindTableNode() !== outerTable &&
            next.StartOfSectionNode().GetIndex() < previous.StartOfSectionNode().GetIndex()));
      let target = onlyContent ? undefined : preferPrevious ? previous : next;
      if (!target) {
        target = nodes.MakeTextNode(following, doc.GetDfltTextFormatColl());
        this.createdParagraph = target;
      }
      this.content.Save(this.table);
      this.position = this.table.GetIndex();
      forward.Assign(target, 0);
      PaMCorrAbs(range, forward);
      this.sectionId = doc
        .GetUndoManager()
        .GetUndoNodes()
        .RetainSection(nodes.DetachTableSection(this.table, target));
      this.SetAfterCursorPosition(forward);
    } finally {
      range.Dispose();
      backward.Dispose();
      forward.Dispose();
    }
  }

  /** Reattaches the original section before restoring registered content and cursor state. @param context - Native shell history context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const id = this.sectionId;
    if (id === undefined) throw new Error("Missing deleted Writer table section.");
    const doc = context.GetDoc();
    const nodes = doc.GetNodes();
    const section = doc.GetUndoManager().GetUndoNodes().TakeSection(id);
    this.sectionId = undefined;
    nodes.RestoreTableSection(this.position, section);
    this.content.Restore(doc);
    if (this.createdParagraph) {
      nodes.removeTextNode(this.createdParagraph);
      this.createdParagraph = undefined;
    }
  }

  /** Releases detached table and content nodes when their history is discarded. @returns Nothing. */
  public override Dispose(): void {
    super.Dispose();
    this.content.Dispose(this.document);
    if (this.sectionId !== undefined) {
      this.document.GetUndoManager().GetUndoNodes().Release(this.sectionId);
      this.sectionId = undefined;
    }
  }
}

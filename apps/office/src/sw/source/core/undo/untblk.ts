/** @fileoverview Owns append-only selected-cell SwUndoInserts/SwUndoInsDoc history from native untblk.cxx. */
import type { SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { SwHistory } from "./rolbck";
import {
  GetFragmentPayloadSize,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Captures one native reader's original boundary and retained inserted text/nodes. */
export abstract class SwUndoInserts extends SwUndo {
  private readonly first: SwTextNode;
  private readonly offset: number;
  private readonly collection: SwTextFormatColl;
  private readonly history = new SwHistory();
  private fragmentId: number | undefined;
  private readonly nodeIds: number[] = [];

  /** Captures native history before one end-of-cell read. @param point - Actual insertion position. @param before - Pre-read shell state. @returns Nothing. */
  protected constructor(point: SwPosition, before: SwUndoCursorState) {
    super("Insert Document", before, before);
    this.first = point.GetNode() as SwTextNode;
    this.offset = point.GetContentIndex();
    if (this.offset !== this.first.Len())
      throw new Error("SwUndoInsDoc non-end insertion is not implemented.");
    this.collection = this.first.GetTextFormatColl();
    this.history.CopyAttr(
      this.first.GetpSwpHints(),
      this.first.GetIndex(),
      0,
      this.first.Len(),
      false,
    );
    const items = this.first.GetpSwAttrSet();
    if (items !== undefined) this.history.CopyFormatAttr(items, this.first.GetIndex());
  }

  /** Records the native reader's completed insertion range and undo content. @param end - Actual final point. @param after - Post-read shell state. @returns Nothing. */
  public SetInsertRange(end: SwPosition, after: SwUndoCursorState): void {
    const last = end.GetNode() as SwTextNode;
    if (
      last.StartOfSectionNode() !== this.first.StartOfSectionNode() ||
      end.GetContentIndex() !== last.Len()
    )
      throw new Error("SwUndoInsDoc range must end in its original text section.");
    const added = this.first
      .GetNodes()
      .entries()
      .slice(this.first.GetIndex() + 1, last.GetIndex() + 1);
    if (
      added.some(
        /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
          node,
        ) => !(node instanceof SwTextNode),
      )
    )
      throw new Error("SwUndoInsDoc nontext insertion is not implemented.");
    const undoNodes = this.first.GetDoc().GetUndoManager().GetUndoNodes();
    this.fragmentId = undoNodes.RetainText(
      this.first.CaptureTextFragment(this.offset, this.first.Len()),
    );
    for (const node of added) this.nodeIds.push(undoNodes.RetainNode(node as SwTextNode));
    this.SetAfterCursor(after);
  }

  /** Reports actual retained reader content and original history. @returns Payload units. */
  public override GetPayloadSize(): number {
    const undoNodes = this.first.GetDoc().GetUndoManager().GetUndoNodes();
    let size =
      this.fragmentId === undefined
        ? 0
        : GetFragmentPayloadSize(undoNodes.GetText(this.fragmentId));
    for (const id of this.nodeIds) {
      const node = undoNodes.GetNode(id);
      size +=
        node.Len() + (node.GetpSwpHints()?.Count() ?? 0) * 4 + (node.GetpSwAttrSet()?.Count() ?? 0);
    }
    return size + this.history.Count() * 4;
  }

  /** Releases native inserted content when history drops this reader action. @returns Nothing. */
  public override Dispose(): void {
    const undoNodes = this.first.GetDoc().GetUndoManager().GetUndoNodes();
    if (this.fragmentId !== undefined) undoNodes.Release(this.fragmentId);
    this.fragmentId = undefined;
    for (const id of this.nodeIds.splice(0)) undoNodes.Release(id);
  }

  /** Moves inserted paragraphs out of the section and restores original hint/item history. @param context - Native document context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc(),
      undoNodes = doc.GetUndoManager().GetUndoNodes();
    for (const id of [...this.nodeIds].reverse())
      doc.GetNodes().removeTextNode(undoNodes.GetNode(id));
    this.first.EraseText(this.offset);
    this.first.ClearSwpHintsArr(true);
    this.first.ResetAllAttr();
    this.first.ChgFormatColl(this.collection);
    this.history.SetTmpEnd(this.history.Count());
    this.history.TmpRollback(doc, 0, false);
  }

  /** Moves actual retained inserted content back into the original native section. @param context - Native document context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    if (this.fragmentId === undefined)
      throw new Error("SwUndoInsDoc insertion range has not been recorded.");
    const doc = context.GetDoc(),
      undoNodes = doc.GetUndoManager().GetUndoNodes();
    this.first.ReplaceRange(this.offset, this.offset, undoNodes.GetText(this.fragmentId));
    let previous: SwTextNode = this.first;
    for (const id of this.nodeIds) {
      const node = undoNodes.GetNode(id);
      doc.GetNodes().insertTextNodeAfter(previous, node);
      previous = node;
    }
  }
}

/** Native document-read specialization of inserted-range history. */
export class SwUndoInsDoc extends SwUndoInserts {
  /** Captures the document-read boundary before import. @param point - Native reader position. @param before - Pre-read shell state. @returns Nothing. */
  public constructor(point: SwPosition, before: SwUndoCursorState) {
    super(point, before);
  }
}

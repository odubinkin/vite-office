/**
 * @fileoverview Implements bounded SwPaM content operations at the pinned LibreOffice `sw/source/core/doc/DocumentContentOperationsManager.cxx` boundary.
 */

import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";

/** Applies Writer content mutations through SwPosition and SwPaM rather than view identities. */
export class DocumentContentOperationsManager {
  /** Replaces a same-node point-and-mark range with normalized text portions. @param range - Model range to replace. @param replacementRuns - Replacement content. @returns Nothing. */
  public ReplaceRange(range: SwPaM, replacementRuns: unknown): void {
    const start = range.Start();
    const end = range.End();
    const node = start.GetNode();
    if (!(node instanceof SwTextNode) || end.GetNode() !== node)
      throw new Error("Writer replacement range must stay inside one SwTextNode.");
    node.ReplaceRange(start.GetContentIndex(), end.GetContentIndex(), replacementRuns);
  }

  /** Inserts plain text at one SwPosition using the node's inherited auto-format items. @param position - Model insertion position. @param text - Inserted plain text. @returns Nothing. */
  public InsertString(position: SwPosition, text: string): void {
    const node = position.GetNode();
    if (!(node instanceof SwTextNode)) throw new Error("Writer insertion requires a SwTextNode.");
    if (text.length === 0) return;
    node.InsertText(text, position.GetContentIndex());
  }

  /** Deletes a bounded same-node SwPaM range. @param range - Model range to delete. @returns Nothing. */
  public DeleteRange(range: SwPaM): void {
    const start = range.Start();
    const end = range.End();
    const node = start.GetNode();
    if (!(node instanceof SwTextNode) || end.GetNode() !== node)
      throw new Error("Writer deletion range must stay inside one SwTextNode.");
    if (start.compare(end) === 0) return;
    node.EraseText(start.GetContentIndex(), end.GetContentIndex() - start.GetContentIndex());
  }
}

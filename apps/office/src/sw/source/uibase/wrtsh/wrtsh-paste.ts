/** @fileoverview Coordinates Writer clipboard paragraph insertion outside the persistent shell owner. */

import { SwPosition } from "../../core/crsr/pam";
import type { SwTextNode as WriterParagraph } from "../../core/txtnode/ndtxt";
import { getWriterTextFromRuns } from "../../core/txtnode/text-run-projection";
import type {
  WriterClipboardPaste,
  WriterClipboardPasteParagraph,
} from "../../filter/html/html-filter-types";
import type { WriterTextRange } from "./wrtsh-selection";

/** Narrow shell operations required by clipboard insertion. */
export interface WriterPasteOperations {
  readonly applyParagraphList: (paragraph: WriterClipboardPasteParagraph) => boolean;
  readonly beginUndoGroup: () => void;
  readonly deleteSelection: () => void;
  readonly endUndoGroup: () => void;
  readonly getInsertionPoint: () => SwPosition;
  readonly hasSelection: () => boolean;
  readonly replaceRange: (
    range: WriterTextRange,
    runs: WriterClipboardPasteParagraph["runs"],
  ) => boolean;
  readonly setCursor: (position: SwPosition) => void;
  readonly splitParagraph: (position: SwPosition) => WriterParagraph;
}

/** Inserts one sanitized transfer document while the owning shell supplies cursor and undo operations. @param paste - Parsed clipboard content. @param operations - Narrow shell coordination surface. @returns Whether content or list formatting changed. */
export function pasteWriterTransfer(
  paste: WriterClipboardPaste,
  operations: WriterPasteOperations,
): boolean {
  const first = paste.paragraphs[0];
  if (first === undefined) return false;
  let changed = false;
  operations.beginUndoGroup();
  try {
    if (operations.hasSelection()) {
      operations.deleteSelection();
      changed = true;
    }
    const insertionPoint = operations.getInsertionPoint();
    const range: WriterTextRange = {
      end: insertionPoint.GetContentIndex(),
      node: insertionPoint.GetNode() as WriterParagraph,
      start: insertionPoint.GetContentIndex(),
    };
    changed = operations.replaceRange(range, first.runs) || changed;
    let paragraph = range.node;
    let offset = range.start + getWriterTextFromRuns(first.runs).length;
    operations.setCursor(new SwPosition(paragraph, offset));
    if (paste.isBlock) changed = operations.applyParagraphList(first) || changed;
    for (const pastedParagraph of paste.paragraphs.slice(1)) {
      paragraph = operations.splitParagraph(new SwPosition(paragraph, offset));
      changed = true;
      changed =
        operations.replaceRange({ end: 0, node: paragraph, start: 0 }, pastedParagraph.runs) ||
        changed;
      offset = getWriterTextFromRuns(pastedParagraph.runs).length;
      operations.setCursor(new SwPosition(paragraph, offset));
      changed = operations.applyParagraphList(pastedParagraph) || changed;
    }
  } finally {
    operations.endUndoGroup();
  }
  return changed;
}

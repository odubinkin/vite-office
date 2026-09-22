/** @fileoverview Coordinates Writer clipboard paragraph insertion outside the persistent shell owner. */

import { SwPosition } from "../../core/crsr/pam";
import type { SwTextFragment, SwTextNode as WriterParagraph } from "../../core/txtnode/ndtxt";
import type { WriterTextRange } from "./wrtsh-selection";

/** One native Writer paragraph prepared by an outer transfer adapter. */
export interface WriterPasteParagraph {
  readonly fragment: SwTextFragment;
  readonly listKind: "bullet" | "none" | "numbered";
  readonly listLevel: number;
}

/** Native text-plus-hints transfer accepted by the Writer shell. */
export interface WriterPasteDocument {
  readonly isBlock: boolean;
  readonly paragraphs: readonly WriterPasteParagraph[];
}

/** Narrow shell operations required by clipboard insertion. */
export interface WriterPasteOperations {
  readonly applyParagraphList: (paragraph: WriterPasteParagraph) => boolean;
  readonly beginUndoGroup: () => void;
  readonly deleteSelection: () => void;
  readonly endUndoGroup: () => void;
  readonly getInsertionPoint: () => SwPosition;
  readonly hasSelection: () => boolean;
  readonly replaceRange: (range: WriterTextRange, replacement: SwTextFragment) => boolean;
  readonly setCursor: (position: SwPosition) => void;
  readonly splitParagraph: (position: SwPosition) => WriterParagraph;
}

/** Inserts one sanitized transfer document while the owning shell supplies cursor and undo operations. @param paste - Parsed clipboard content. @param operations - Narrow shell coordination surface. @returns Whether content or list formatting changed. */
export function pasteWriterTransfer(
  paste: WriterPasteDocument,
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
    const firstFragment = first.fragment;
    changed = operations.replaceRange(range, firstFragment) || changed;
    let paragraph = range.node;
    let offset = range.start + firstFragment.text.length;
    operations.setCursor(new SwPosition(paragraph, offset));
    if (paste.isBlock) changed = operations.applyParagraphList(first) || changed;
    for (const pastedParagraph of paste.paragraphs.slice(1)) {
      paragraph = operations.splitParagraph(new SwPosition(paragraph, offset));
      changed = true;
      const fragment = pastedParagraph.fragment;
      changed = operations.replaceRange({ end: 0, node: paragraph, start: 0 }, fragment) || changed;
      offset = fragment.text.length;
      operations.setCursor(new SwPosition(paragraph, offset));
      changed = operations.applyParagraphList(pastedParagraph) || changed;
    }
  } finally {
    operations.endUndoGroup();
  }
  return changed;
}

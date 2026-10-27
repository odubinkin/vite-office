/** @fileoverview Implements Writer hyperlink shell operations from pinned LibreOffice `sw/source/core/edit/editsh.cxx`. */

import { getWriterINetFormatStateAtCursor } from "./edattr";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwDoc as WriterDocument } from "../doc/doc";
import type { SwTextNode as WriterParagraph } from "../txtnode/ndtxt";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { GetTextAttrMode } from "../../../inc/swtypes";
import type { SwFormatINetFormat, WriterHyperlink } from "../txtnode/fmtatr2";
import type { SwPaM } from "../crsr/pam";
import { SwUndoAttr } from "../undo/unattr";
import { SwUndoInsert, type SwUndoInsertGroup } from "../undo/unins";
import type { SwUndoCursorState, SwUndoRedoContext } from "../undo/undobj";
import { getWriterSelectedTextRange, type WriterTextRange } from "../crsr/pam";

/** Creates the bounded SwEditShell::Insert2 text action with native expansion policy. @param paragraph - Target text node. @param offset - Insertion position. @param text - Non-empty inserted text. @param items - Pending character items. @param group - Optional typing class. @param before - Cursor before insertion. @param after - Cursor after insertion. @param forceExpand - Whether deletion requires forced hint expansion. @returns Native text insertion action. */
export function createWriterInsertTextAction(
  paragraph: WriterParagraph,
  offset: number,
  text: string,
  items: SfxItemSet,
  group: SwUndoInsertGroup | undefined,
  before: SwUndoCursorState,
  after: SwUndoCursorState,
  forceExpand = false,
): SwUndoInsert {
  const flags = forceExpand
    ? SwInsertFlags.FORCEHINTEXPAND | SwInsertFlags.EMPTYEXPAND
    : SwInsertFlags.EMPTYEXPAND;
  const fragment = paragraph.CreateTextFragmentFromText(text, items);
  try {
    return new SwUndoInsert(paragraph, offset, fragment, group, before, after, flags, items);
  } finally {
    fragment.hints.Dispose();
  }
}

/** Projects native SET internet attributes only at the dialog boundary. @param document - Original document. @param cursor - Actual native ring. @returns Dialog fields for uniform native attributes. */
export function getWriterHyperlinkAtCursor(
  document: WriterDocument,
  cursor: SwPaM,
): WriterHyperlink | undefined {
  return (
    getWriterINetFormatStateAtCursor(document, cursor).GetItemIfSet(RES_TXTATR_INETFMT, false) as
      SwFormatINetFormat | undefined
  )?.GetHyperlink();
}

/** Creates the undo action for applying or removing a hyperlink. @param document - Active document. @param selection - Command selection. @param pendingAttributes - Caret character attributes. @param before - Cursor state before execution. @param hyperlink - Replacement hyperlink or undefined. @param text - Optional inserted link text. @returns Undo action or undefined when unchanged. */
export function createWriterHyperlinkAction(
  document: WriterDocument,
  cursor: SwPaM,
  pendingItems: SfxItemSet,
  before: SwUndoCursorState,
  hyperlink: WriterHyperlink | undefined,
  text?: string,
): SfxUndoAction<SwUndoRedoContext> | undefined {
  const selectedRange =
    getWriterSelectedTextRange(cursor) ??
    (text === undefined ? getHyperlinkRangeAtCursor(cursor) : undefined);
  if (selectedRange !== undefined) {
    const paragraph = selectedRange.node;
    if (paragraph.GetDoc() !== document) throw new Error("Writer hyperlink range is foreign.");
    const beforeFragment = paragraph.CaptureTextFragment(selectedRange.start, selectedRange.end);
    const afterFragment = paragraph.CreateHyperlinkTextFragment(
      selectedRange.start,
      selectedRange.end,
      hyperlink,
    );
    try {
      if (beforeFragment.hints.equals(afterFragment.hints)) return undefined;
      return new SwUndoAttr(
        paragraph,
        selectedRange.start,
        beforeFragment,
        afterFragment,
        before,
        before,
      );
    } finally {
      beforeFragment.hints.Dispose();
      afterFragment.hints.Dispose();
    }
  }
  if (hyperlink === undefined) return undefined;
  const value = text === undefined || text.length === 0 ? hyperlink.url : text;
  const point = cursor.GetPoint();
  const paragraph = point.GetNode() as WriterParagraph;
  if (paragraph.GetDoc() !== document) throw new Error("Writer hyperlink cursor is foreign.");
  const offset = point.GetContentIndex();
  const fragment = paragraph.CreateTextFragmentFromText(value, pendingItems, hyperlink);
  try {
    return new SwUndoInsert(
      paragraph,
      offset,
      fragment,
      undefined,
      before,
      {
        activeParagraph: paragraph,
        pendingCharacterItems: pendingItems.Clone(),
        point: { node: paragraph, offset: offset + value.length },
      },
      SwInsertFlags.DEFAULT,
    );
  } finally {
    fragment.hints.Dispose();
  }
}

/** Borrows one original internet attribute range under the represented caret inheritance policy; native UI default selection/word fallback remain separate work. @param cursor - Actual original caret. @returns Original hinted bounds or no inherited attribute. */
function getHyperlinkRangeAtCursor(cursor: SwPaM): WriterTextRange | undefined {
  if (cursor.HasMark()) return undefined;
  const point = cursor.GetPoint(),
    paragraph = point.GetNode() as WriterParagraph,
    offset = point.GetContentIndex();
  const hint = paragraph.GetTextAttrAt(
    offset,
    RES_TXTATR_INETFMT,
    offset === 0 ? GetTextAttrMode.Default : GetTextAttrMode.Expand,
  );
  return hint === undefined
    ? undefined
    : { node: paragraph, start: hint.GetStart(), end: hint.GetEnd() };
}

/** @fileoverview Implements Writer hyperlink shell operations from pinned LibreOffice `sw/source/uibase/wrtsh/wrtsh1.cxx`. */

import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwDoc as WriterDocument } from "../../core/doc/doc";
import type { SwTextNode as WriterParagraph } from "../../core/txtnode/ndtxt";
import {
  copyWriterTextRangeRuns,
  projectWriterTextRuns,
} from "../../core/txtnode/text-run-projection";
import type { WriterHyperlink } from "../../core/txtnode/fmtinfmt";
import type { SwPaM } from "../../core/crsr/pam";
import { equalWriterHyperlinks } from "../../core/txtnode/fmtinfmt";
import { SwUndoAttr } from "../../core/undo/unattr";
import { SwUndoInsert } from "../../core/undo/unins";
import type { SwUndoCursorState, SwUndoRedoContext } from "../../core/undo/undobj";
import { getWriterSelectedTextRange, type WriterTextRange } from "./wrtsh-selection";

/** Reads one uniform selected or caret hyperlink. @param document - Active Writer document. @param selection - Persistent cursor selection. @returns Hyperlink metadata or undefined. */
export function getWriterHyperlinkAtCursor(
  document: WriterDocument,
  cursor: SwPaM,
): WriterHyperlink | undefined {
  const range = getWriterSelectedTextRange(cursor) ?? getHyperlinkRangeAtCursor(cursor);
  if (range === undefined) {
    const point = cursor.GetPoint();
    const paragraph = point.GetNode() as WriterParagraph;
    return paragraph.GetDoc() === document
      ? paragraph.getHyperlinkAt(point.GetContentIndex())
      : undefined;
  }
  const paragraph = range.node;
  if (paragraph.GetDoc() !== document) return undefined;
  const runs = copyWriterTextRangeRuns(paragraph, range.start, range.end);
  const hyperlink = runs[0]?.hyperlink;
  return runs.length > 0 &&
    runs.every(
      /** Requires one uniform link across the selection. @param run - Selected run. @returns Whether hyperlink metadata matches. */
      (run) => equalWriterHyperlinks(run.hyperlink, hyperlink),
    )
    ? hyperlink
    : undefined;
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
    if (beforeFragment.hints.equals(afterFragment.hints)) return undefined;
    return new SwUndoAttr(
      paragraph,
      selectedRange.start,
      beforeFragment,
      afterFragment,
      before,
      before,
    );
  }
  if (hyperlink === undefined) return undefined;
  const value = text === undefined || text.length === 0 ? hyperlink.url : text;
  const point = cursor.GetPoint();
  const paragraph = point.GetNode() as WriterParagraph;
  if (paragraph.GetDoc() !== document) throw new Error("Writer hyperlink cursor is foreign.");
  const offset = point.GetContentIndex();
  return new SwUndoInsert(
    paragraph,
    offset,
    paragraph.CreateTextFragmentFromText(value, pendingItems, hyperlink),
    undefined,
    before,
    {
      activeParagraph: paragraph,
      pendingCharacterItems: pendingItems.Clone(),
      point: { node: paragraph, offset: offset + value.length },
    },
  );
}

/** Resolves the complete contiguous hyperlink containing a caret. @param document - Active document. @param selection - Collapsed cursor selection. @returns Hyperlink range or undefined. */
function getHyperlinkRangeAtCursor(cursor: SwPaM): WriterTextRange | undefined {
  if (cursor.HasMark()) return undefined;
  const point = cursor.GetPoint();
  const paragraph = point.GetNode() as WriterParagraph;
  const offset = point.GetContentIndex();
  const hyperlink = paragraph.getHyperlinkAt(offset);
  if (hyperlink === undefined) return undefined;
  const ranges = getRunRanges(paragraph);
  const containingIndex = ranges.findIndex(
    /** Locates the run whose inherited hyperlink contains the caret. @param range - Run offsets. @returns Whether it contains the caret. */
    (range) => range.start <= offset && offset <= range.end,
  );
  /* v8 ignore next -- A normalized hyperlink hint always covers one projected run. */
  if (containingIndex < 0) return undefined;
  let first = containingIndex;
  let last = containingIndex;
  const runs = projectWriterTextRuns(paragraph);
  while (first > 0 && equalWriterHyperlinks(runs[first - 1]?.hyperlink, hyperlink)) first -= 1;
  while (last + 1 < runs.length && equalWriterHyperlinks(runs[last + 1]?.hyperlink, hyperlink))
    last += 1;
  return {
    end: (ranges[last] as { readonly end: number }).end,
    node: paragraph,
    start: (ranges[first] as { readonly start: number }).start,
  };
}

/** Projects paragraph runs to UTF-16 ranges. @param paragraph - Source paragraph. @returns Run ranges. */
function getRunRanges(
  paragraph: WriterParagraph,
): readonly { readonly end: number; readonly start: number }[] {
  const ranges: { readonly end: number; readonly start: number }[] = [];
  let consumed = 0;
  for (const run of projectWriterTextRuns(paragraph)) {
    const start = consumed;
    consumed += run.text.length;
    ranges.push({ end: consumed, start });
  }
  return ranges;
}

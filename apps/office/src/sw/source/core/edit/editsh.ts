/** @fileoverview Implements Writer hyperlink shell operations from pinned LibreOffice `sw/source/core/edit/editsh.cxx`. */

import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import type { SwDoc as WriterDocument } from "../doc/doc";
import type { SwTextNode as WriterParagraph } from "../txtnode/ndtxt";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { GetTextAttrMode } from "../../../inc/swtypes";
import { SwFormatINetFormat, type WriterHyperlink } from "../txtnode/fmtatr2";
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
  return new SwUndoInsert(
    paragraph,
    offset,
    paragraph.CreateTextFragmentFromText(text, items),
    group,
    before,
    after,
    flags,
    items,
  );
}

/** Reads represented INET state through original native node/ring rules; generic GetCurAttr/style expansion and merged redlines remain unverified. @param document - Active Writer document. @param cursor - Actual native selection ring. @returns Final UI hyperlink fields only when the complete native item state is SET. */
export function getWriterHyperlinkAtCursor(
  document: WriterDocument,
  cursor: SwPaM,
): WriterHyperlink | undefined {
  const cursors = [...cursor.GetRingContainer()];
  if (cursors.length > 10000) return undefined;
  const state = new SfxItemSet(document.GetAttrPool(), [[RES_TXTATR_INETFMT, RES_TXTATR_INETFMT]]);
  let first = true;
  for (const current of cursors) {
    if (current.GetPoint().GetNode().GetDoc() !== document) return undefined;
    if (current.IsInFrontOfLabel()) continue;
    const start = current.Start(),
      end = current.End();
    if (end.GetNodeIndex() - start.GetNodeIndex() >= 10000) return undefined;
    for (let index = start.GetNodeIndex(); index <= end.GetNodeIndex(); index++) {
      const node = document.GetNodes().at(index);
      if (node.IsTextNode()) {
        const paragraph = node as WriterParagraph,
          local = getINetFormatState(
            paragraph,
            index === start.GetNodeIndex() ? start.GetContentIndex() : 0,
            index === end.GetNodeIndex() ? end.GetContentIndex() : paragraph.Len(),
          );
        if (first) state.PutSet(local, false);
        else mergeINetFormatState(state, local);
      }
      first = false;
    }
  }
  return (
    state.GetItemIfSet(RES_TXTATR_INETFMT, false) as SwFormatINetFormat | undefined
  )?.GetHyperlink();
}

/** Ports the represented single-INET GetParaAttr state branch from thints.cxx without text projection or ownership mutation. Node attribute ranges currently exclude INET and automatic character styles cannot supply it. @param node - Original native text owner. @param start - Sorted native start. @param end - Sorted native end. @returns SET/default/INVALID native item state. */
function getINetFormatState(node: WriterParagraph, start: number, end: number): SfxItemSet {
  const state = new SfxItemSet(node.GetDoc().GetAttrPool(), [
      [RES_TXTATR_INETFMT, RES_TXTATR_INETFMT],
    ]),
    format = new SfxItemSet(state.GetPool(), state.GetRanges());
  let previous: SwFormatINetFormat | undefined,
    previousEnd = 0,
    invalid = false;
  for (const hint of node.GetpSwpHints()?.entries() ?? []) {
    const hintStart = hint.GetStart(),
      hintEnd = hint.GetEnd();
    if (hintStart > end) break;
    if (hint.Which() !== RES_TXTATR_INETFMT) continue;
    const item = hint.GetAttr() as SwFormatINetFormat;
    if (start === end) {
      if (
        (hintStart < start && (hint.DontExpand() ? start < hintEnd : start <= hintEnd)) ||
        (start === hintStart && (hintStart === hintEnd || start === 0))
      )
        state.Put(item);
      continue;
    }
    let partial = false;
    if (hintStart <= start) {
      if (hintEnd <= start) continue;
      if (end <= hintEnd) format.Put(item);
      else partial = true;
    } else if (hintStart < end) partial = true;
    if (partial) {
      if (previous === undefined && !invalid) {
        if (!item.equals(format.Get(RES_TXTATR_INETFMT))) {
          if (hintStart > start) {
            state.InvalidateItem(RES_TXTATR_INETFMT);
            invalid = true;
          } else {
            previous = item;
            previousEnd = hintEnd;
          }
        }
      } else if (!invalid) {
        if (previousEnd === hintStart && (previous as SwFormatINetFormat).equals(item)) {
          previous = item;
          previousEnd = hintEnd;
        } else {
          state.InvalidateItem(RES_TXTATR_INETFMT);
          invalid = true;
        }
      }
    }
  }
  if (previous !== undefined && !invalid) {
    if (end <= previousEnd) {
      if (!previous.equals(format.Get(RES_TXTATR_INETFMT))) state.Put(previous);
    } else state.InvalidateItem(RES_TXTATR_INETFMT);
  }
  if (format.Count() > 0 && state.Count() === 0) state.PutSet(format);
  return state;
}

/** Applies the single represented INET MergeValues decision table from native itemset.cxx with defaults participating. @param target - Accumulated native state. @param source - Next original node state. @returns Nothing. */
function mergeINetFormatState(target: SfxItemSet, source: SfxItemSet): void {
  if (target.GetItemState(RES_TXTATR_INETFMT, false) === SfxItemState.INVALID) return;
  if (source.GetItemState(RES_TXTATR_INETFMT, false) === SfxItemState.INVALID) {
    target.InvalidateItem(RES_TXTATR_INETFMT);
    return;
  }
  const first = target.GetItemIfSet(RES_TXTATR_INETFMT, false),
    second = source.GetItemIfSet(RES_TXTATR_INETFMT, false),
    defaults = target.GetPool().GetUserOrPoolDefaultItem(RES_TXTATR_INETFMT);
  if (first === undefined) {
    if (second !== undefined && !defaults.equals(second)) target.InvalidateItem(RES_TXTATR_INETFMT);
  } else if (!first.equals(second ?? defaults)) target.InvalidateItem(RES_TXTATR_INETFMT);
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
    SwInsertFlags.DEFAULT,
  );
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

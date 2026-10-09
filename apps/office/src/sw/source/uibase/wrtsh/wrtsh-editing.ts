/** @fileoverview Implements structural Writer shell algorithms using the actual native SwWrtShell owner directly. */

import { SwPosition, type WriterTextRange } from "../../core/crsr/pam";
import {
  SwTextNode,
  type SwTextFragment,
  type SwTextNode as WriterParagraph,
} from "../../core/txtnode/ndtxt";
import {
  SwUndoDelete,
  SwUndoJoinParagraphs,
  SwUndoReplace,
  type SwUndoDeleteDirection,
} from "../../core/undo/undel";
import { createWriterInsertTextAction } from "../../core/edit/editsh";
import { createWriterDeleteSelectionOperation } from "../../core/edit/eddel";
import { createWriterReadTextOperation } from "../../filter/basflt/shellio";
import { SwUndoSplitNode } from "../../core/undo/unspnd";
import { getWriterTypingCharacterClass } from "./delete";
import type { SwWrtShell } from "./wrtsh1";

/** Finds the grapheme start immediately before a caret. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Previous grapheme boundary. */
function getWriterPreviousGraphemeBoundary(text: string, offset: number): number {
  const boundaries = getWriterGraphemeBoundaries(text);
  let previous = 0;
  for (const boundary of boundaries) {
    if (boundary >= offset) return previous;
    previous = boundary;
  }
  /* istanbul ignore next -- Boundary enumeration includes text.length for a valid cursor offset. */
  return previous;
}

/** Finds the grapheme end immediately after a caret. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Next grapheme boundary. */
function getWriterNextGraphemeBoundary(text: string, offset: number): number {
  for (const boundary of getWriterGraphemeBoundaries(text)) if (boundary > offset) return boundary;
  /* istanbul ignore next -- Callers handle the text-end cursor before requesting a boundary. */
  return text.length;
}

/** Enumerates UTF-16 grapheme boundaries with a code-point fallback. @param text - Paragraph text. @returns Ordered boundaries including zero and text length. */
function getWriterGraphemeBoundaries(text: string): readonly number[] {
  const boundaries = [0];
  if (typeof Intl.Segmenter === "function") {
    const segments = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text);
    for (const segment of segments) boundaries.push(segment.index + segment.segment.length);
    return boundaries;
  }
  let offset = 0;
  for (const character of text) {
    offset += character.length;
    boundaries.push(offset);
  }
  return boundaries;
}

/** Inserts text at the persistent point, replacing any selection. @param text - Inserted text. @param allowGrouping - Whether typing may merge with the preceding action. @param shell - Actual native cursor, document and history owner. @returns Whether changed. */
export function InsertAtCursor(shell: SwWrtShell, text: string, allowGrouping: boolean): boolean {
  const before = shell.CaptureCursorState();
  const cursor = shell.GetCursor();
  const point = cursor.GetPoint();
  const paragraph = point.GetNode() as WriterParagraph;
  const mark = cursor.HasMark() ? cursor.GetMark() : undefined;
  if (mark !== undefined) {
    return shell.RunNotificationTransaction(
      /** Brackets native deletion and forced insertion as one shell action. @returns Whether inserted. */ () => {
        const manager = shell.GetDoc().GetUndoManager();
        manager.StartUndo("Replace");
        try {
          const deleted = DeleteAtCursor(shell, "delete");
          const position = shell.GetCursor().GetPoint();
          const target = position.GetNode() as WriterParagraph,
            start = position.GetContentIndex();
          return shell.ApplyAction(
            createWriterInsertTextAction(
              target,
              start,
              text,
              shell.GetPendingCharacterItems(),
              undefined,
              shell.CaptureCursorState(),
              shell.CreateCollapsedCursorState(target, start + text.length),
              deleted,
            ),
          );
        } finally {
          manager.EndUndo();
        }
      },
    );
  }
  const offset = point.GetContentIndex();
  const group = allowGrouping ? getWriterTypingCharacterClass(text) : undefined;
  return shell.ApplyAction(
    createWriterInsertTextAction(
      paragraph,
      offset,
      text,
      shell.GetPendingCharacterItems(),
      group,
      before,
      shell.CreateCollapsedCursorState(paragraph, offset + text.length),
    ),
    group !== undefined,
  );
}

/** Deletes the active selection or one adjacent grapheme. @param direction - Logical direction. @param shell - Actual native cursor, document and history owner. @returns Whether changed. */
export function DeleteAtCursor(shell: SwWrtShell, direction: SwUndoDeleteDirection): boolean {
  const before = shell.CaptureCursorState();
  const cursor = shell.GetCursor();
  const point = cursor.GetPoint();
  const paragraph = point.GetNode() as WriterParagraph;
  const mark = cursor.HasMark() ? cursor.GetMark() : undefined;
  if (mark !== undefined || cursor.IsMultiSelection()) {
    const target =
      before.tableSelection === true
        ? (before.point.node
            .GetNodes()
            .at(before.point.node.StartOfSectionNode().GetIndex() + 1) as SwTextNode)
        : undefined;
    const after = target === undefined ? undefined : shell.CreateCollapsedCursorState(target, 0);
    const operation = createWriterDeleteSelectionOperation(cursor, direction, before, after);
    if (operation !== undefined)
      return shell.ApplyAction(operation.action, false, operation.execute);
    if (target === undefined && (mark === undefined || point.compare(mark) === 0)) return false;
    const endpoint = direction === "backspace" ? cursor.Start() : cursor.End();
    const position =
      target === undefined
        ? new SwPosition(endpoint.GetNode() as SwTextNode, endpoint.GetContentIndex())
        : new SwPosition(target, 0);
    try {
      return shell.SetCursor(position);
    } finally {
      position.Dispose();
    }
  }
  const offset = point.GetContentIndex();
  if (direction === "backspace" && offset === 0)
    return MergeParagraphWithPrevious(shell, paragraph);
  if (direction === "delete" && offset === paragraph.Len())
    return MergeParagraphWithNext(shell, paragraph);
  const start =
    direction === "backspace"
      ? getWriterPreviousGraphemeBoundary(paragraph.GetText(), offset)
      : offset;
  const end =
    direction === "backspace" ? offset : getWriterNextGraphemeBoundary(paragraph.GetText(), offset);
  /* istanbul ignore next -- Valid non-boundary cursor offsets still lie inside one grapheme. */
  if (start === end) return false;
  const deletedText = paragraph.GetText().slice(start, end);
  const group =
    deletedText.length === 1
      ? /[\p{L}\p{N}]/u.test(deletedText)
        ? "word"
        : "delimiter"
      : undefined;
  return shell.ApplyAction(
    new SwUndoDelete(
      paragraph,
      start,
      paragraph.GetText().slice(start, end),
      direction,
      group,
      before,
      shell.CreateCollapsedCursorState(paragraph, start),
    ),
    group !== undefined,
  );
}

/** Splits at the caret after replacing a selected range. @param shell - Actual native cursor, document and history owner. @returns Whether changed. */
export function SplitAtCursor(shell: SwWrtShell): boolean {
  const cursor = shell.GetCursor();
  if (cursor.HasMark()) {
    const manager = shell.GetDoc().GetUndoManager();
    manager.EnterListAction("Split Paragraph");
    try {
      DeleteAtCursor(shell, "delete");
      SplitParagraph(shell, cursor.GetPoint());
    } finally {
      manager.LeaveListAction();
    }
    return true;
  }
  SplitParagraph(shell, cursor.GetPoint());
  return true;
}

/** Replaces one same-paragraph range with a native Writer text fragment. @param range - Target range. @param replacement - Inserted native fragment. @param shell - Actual native cursor, document and history owner. @returns Whether changed. */
export function ReplaceRange(
  shell: SwWrtShell,
  range: WriterTextRange,
  replacement: SwTextFragment,
): boolean {
  const paragraph = range.node;
  if (paragraph.GetDoc() !== shell.GetDoc()) throw new Error("Writer text range is foreign.");
  if (
    !Number.isInteger(range.start) ||
    !Number.isInteger(range.end) ||
    range.start < 0 ||
    range.end < range.start ||
    range.end > paragraph.Len()
  )
    throw new Error("Writer text range is outside the paragraph.");
  const removedFragment = paragraph.CaptureTextFragment(range.start, range.end);
  if (removedFragment.text === replacement.text && removedFragment.hints.equals(replacement.hints))
    return false;
  const nextOffset = range.start + replacement.text.length;
  return shell.ApplyAction(
    new SwUndoReplace(
      paragraph,
      range.start,
      removedFragment,
      replacement,
      replacement.text.length === 0 ? "Delete" : "Paste",
      shell.CaptureCursorState(),
      shell.CreateCollapsedCursorState(paragraph, nextOffset),
    ),
  );
}

/** Reads plain clipboard text through native cursor rings and document-insertion history. @param text - Plain clipboard text. @param shell - Actual native cursor, document and history owner. @returns Whether imported. */
export function PastePlainText(shell: SwWrtShell, text: string): boolean {
  const before = shell.CaptureCursorState();
  const operation = createWriterReadTextOperation(shell.GetCursor(), text, before);
  return operation === undefined
    ? false
    : shell.ApplyAction(operation.action, false, operation.execute);
}

/** Splits one paragraph at a canonical position. @param position - Split point. @param shell - Actual native cursor, document and history owner. @returns New trailing paragraph. */
export function SplitParagraph(shell: SwWrtShell, position: SwPosition): WriterParagraph {
  const paragraph = position.GetNode() as WriterParagraph;
  const offset = position.GetContentIndex();
  if (paragraph.GetDoc() !== shell.GetDoc()) throw new Error("Writer split position is foreign.");
  /* istanbul ignore next -- SwPosition validates the same node bounds. */
  if (!Number.isInteger(offset) || offset < 0 || offset > paragraph.Len())
    throw new Error("Split offset is outside the paragraph.");
  shell.ApplyAction(
    new SwUndoSplitNode(
      paragraph,
      offset,
      shell.CaptureCursorState(),
      shell.CreateCollapsedCursorState(paragraph, 0),
    ),
  );
  return shell.GetActiveParagraph();
}

/** Joins a paragraph into its predecessor. @param paragraph - Removed trailing paragraph. @param shell - Actual native cursor, document and history owner. @returns Whether changed. */
export function MergeParagraphWithPrevious(shell: SwWrtShell, paragraph: WriterParagraph): boolean {
  const document = shell.GetDoc();
  const index = paragraph.GetIndex();
  const preceding = document.nodes.at(index - 1);
  if (
    !(preceding instanceof SwTextNode) ||
    preceding.StartOfSectionNode() !== paragraph.StartOfSectionNode()
  )
    return false;
  const offset = preceding.Len();
  return shell.ApplyAction(
    new SwUndoJoinParagraphs(
      preceding,
      offset,
      paragraph,
      shell.CaptureCursorState(),
      shell.CreateCollapsedCursorState(preceding, offset),
    ),
  );
}

/** Joins the following paragraph into the selected node. @param paragraph - Preceding paragraph. @param shell - Actual native cursor, document and history owner. @returns Whether changed. */
export function MergeParagraphWithNext(shell: SwWrtShell, paragraph: WriterParagraph): boolean {
  const document = shell.GetDoc();
  const next = document.nodes.at(paragraph.GetIndex() + 1);
  if (!(next instanceof SwTextNode) || next.StartOfSectionNode() !== paragraph.StartOfSectionNode())
    return false;
  return MergeParagraphWithPrevious(shell, next);
}

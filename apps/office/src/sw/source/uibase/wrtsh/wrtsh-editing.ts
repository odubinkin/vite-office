/** @fileoverview Implements structural Writer shell algorithms using the actual native SwWrtShell owner directly. */

import { SwPosition, SwPaM, type WriterTextRange } from "../../core/crsr/pam";
import type { SwFormatField } from "../../../inc/fmtfld";
import type { SwPostItField } from "../../core/fields/docufld";
import { SwUndoInsAnnotation } from "../../core/undo/unattr-field";
import {
  SwTextNode,
  type SwTextFragment,
  type SwTextNode as WriterParagraph,
} from "../../core/txtnode/ndtxt";
import {
  SwUndoDelete,
  SwUndoJoinParagraphs,
  type SwUndoDeleteDirection,
} from "../../core/undo/undel";
import { createWriterInsertTextAction } from "../../core/edit/editsh";
import { createWriterDeleteSelectionOperation } from "../../core/edit/eddel";
import { createWriterReadTextOperation } from "../../filter/basflt/shellio";
import { SwUndoInsert } from "../../core/undo/unins";
import { sw_GetJoinFlags } from "../../core/doc/docedt";
import { GetAutoParagraphDirectionItem } from "../../core/doc/DocumentContentOperationsManager.attr";
import { SwUndoAttr, SwUndoParagraphItem } from "../../core/undo/unattr";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SfxListUndoAction, type SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SwUndoRedoContext } from "../../core/undo/undobj";
import { SwUndoSplitNode } from "../../core/undo/unspnd";
import { getWriterTypingCharacterClass } from "./delete";
import type { SwWrtShell } from "./wrtsh1";
import { GetTableCursorStart } from "../../core/crsr/trvltbl";
import { SwUndoDeleteTable } from "../../core/undo/undel-table";
import { SvxFirstLineIndentItem } from "../../../../editeng/inc/lrspitem";
import { RES_FRAMEDIR, RES_MARGIN_FIRSTLINE, RES_TXTATR_ANNOTATION } from "../../../inc/hintids";

/** Logical paragraph indentation values accepted by the browser ruler shell boundary. */
export interface WriterParagraphIndentValue {
  readonly firstLine: number;
  readonly left: number;
  readonly right: number;
}

/** Deletes the current native table as one history action. @param shell - Active Writer shell. @returns Whether the table was removed. */
export function DeleteCurrentTable(shell: SwWrtShell): boolean {
  const table = shell.IsCursorInTable();
  if (!table || shell.GetViewOptions().IsReadonly() || !GetTableCursorStart(table, false))
    return false;
  const before = shell.CaptureCursorState();
  try {
    return shell.ApplyAction(new SwUndoDeleteTable(table, before));
  } finally {
    before.pendingCharacterItems.Dispose();
  }
}

/** Inserts an owned annotation value as one Writer history action. @param shell - Editing shell. @param range - Comment anchor or selected range. @param field - Owned field value. @returns Attached annotation format. */
export function InsertPostIt(
  shell: SwWrtShell,
  range: SwPaM,
  field: SwPostItField,
): SwFormatField | undefined {
  const before = shell.CaptureCursorState();
  const action = new SwUndoInsAnnotation(range, field, before);
  try {
    shell.ApplyAction(action);
    return action.GetFormat();
  } catch (error) {
    action.Dispose();
    throw error;
  } finally {
    before.pendingCharacterItems.Dispose();
  }
}

/** Applies the existing shell ruler-margin algorithm through actual paragraph items and shell history. @param shell - Original shell owner. @param edge - Dragged marker. @param delta - Original twip delta. @returns Whether paragraph attributes changed. */
export function AdjustParagraphRulerIndent(
  shell: SwWrtShell,
  edge: "left" | "firstLine" | "right",
  delta: number,
): boolean {
  if (!Number.isFinite(delta)) return false;
  const paragraph = shell.GetActiveParagraph();
  const before = {
    firstLine: (
      paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
    ).ResolveTextFirstLineOffset(),
    left: paragraph.GetParagraphTextLeftMargin(),
    right: paragraph.GetParagraphRightMargin(),
  };
  switch (edge) {
    case "left":
      return shell.SetParagraphRulerIndents({ ...before, left: Math.max(0, before.left + delta) });
    case "firstLine":
      return shell.SetParagraphRulerIndents({ ...before, firstLine: before.firstLine + delta });
    case "right":
      return shell.SetParagraphRulerIndents({
        ...before,
        right: Math.max(0, before.right - delta),
      });
  }
}

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

/** Adds the original automatic direction update to the same history entry as the text edit when needed. @param shell - Editing shell. @param action - Native text action. @param node - Resulting paragraph. @param text - Resulting text. @param tryMerge - Whether normal typing can merge. @param execute - Initial native operation if distinct from redo. @returns Whether the action was applied. */
function applyTextAndDirection(
  shell: SwWrtShell,
  action: SfxUndoAction<SwUndoRedoContext>,
  node: SwTextNode,
  text: string,
  tryMerge = false,
  execute?: (context: SwUndoRedoContext) => void,
): boolean {
  const item = GetAutoParagraphDirectionItem(node, text);
  if (item === undefined) return shell.ApplyAction(action, tryMerge, execute);
  return shell.RunNotificationTransaction(
    /** Groups direction with the text edit so undo restores both. @returns Whether changed. */
    () => {
      const manager = shell.GetDoc().GetUndoManager();
      manager.StartUndo(action.GetComment());
      try {
        const changed = shell.ApplyAction(action, false, execute);
        const state = shell.CaptureCursorState();
        try {
          shell.ApplyAction(
            new SwUndoParagraphItem(
              node,
              node.GetpSwAttrSet()?.GetItemIfSet(RES_FRAMEDIR, false),
              item,
              state,
              state,
            ),
          );
        } finally {
          state.pendingCharacterItems.Dispose();
        }
        return changed;
      } finally {
        manager.EndUndo();
        item.Dispose();
      }
    },
  );
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
          return applyTextAndDirection(
            shell,
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
            target,
            target.GetText().slice(0, start) + text + target.GetText().slice(start),
          );
        } finally {
          manager.EndUndo();
        }
      },
    );
  }
  const offset = point.GetContentIndex();
  const group = allowGrouping ? getWriterTypingCharacterClass(text) : undefined;
  return applyTextAndDirection(
    shell,
    createWriterInsertTextAction(
      paragraph,
      offset,
      text,
      shell.GetPendingCharacterItems(),
      group,
      before,
      shell.CreateCollapsedCursorState(paragraph, offset + text.length),
    ),
    paragraph,
    paragraph.GetText().slice(0, offset) + text + paragraph.GetText().slice(offset),
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
    if (operation !== undefined) {
      const start = cursor.Start();
      const end = cursor.End();
      const first = start.GetNode().GetTextNode();
      const last = end.GetNode().GetTextNode();
      if (
        first &&
        last &&
        mark !== undefined &&
        !cursor.IsMultiSelection() &&
        !before.tableSelection &&
        first.StartOfSectionNode() === last.StartOfSectionNode()
      ) {
        const selection = new SwPaM(point, mark);
        try {
          const survivor = sw_GetJoinFlags(selection).joinPrev ? last : first;
          return applyTextAndDirection(
            shell,
            operation.action,
            survivor,
            first.GetText().slice(0, start.GetContentIndex()) +
              last.GetText().slice(end.GetContentIndex()),
            false,
            operation.execute,
          );
        } finally {
          selection.Dispose();
        }
      }
      return shell.ApplyAction(operation.action, false, operation.execute);
    }
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
  const annotation = paragraph.GetpSwpHints()?.GetTextAttrForCharAt(start, RES_TXTATR_ANNOTATION);
  const end =
    direction === "backspace"
      ? offset
      : annotation
        ? offset + 1
        : getWriterNextGraphemeBoundary(paragraph.GetText(), offset);
  /* istanbul ignore next -- Valid non-boundary cursor offsets still lie inside one grapheme. */
  if (start === end) return false;
  const deletedText = paragraph.GetText().slice(start, end);
  const group =
    annotation === undefined && deletedText.length === 1
      ? /[\p{L}\p{N}]/u.test(deletedText)
        ? "word"
        : "delimiter"
      : undefined;
  return applyTextAndDirection(
    shell,
    new SwUndoDelete(
      paragraph,
      start,
      paragraph.GetText().slice(start, end),
      direction,
      group,
      before,
      shell.CreateCollapsedCursorState(paragraph, start),
    ),
    paragraph,
    paragraph.GetText().slice(0, start) + paragraph.GetText().slice(end),
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
  try {
    if (
      removedFragment.text === replacement.text &&
      removedFragment.hints.equals(replacement.hints)
    )
      return false;
    const before = shell.CaptureCursorState(),
      after = shell.CreateCollapsedCursorState(paragraph, range.start + replacement.text.length);
    if (removedFragment.text === replacement.text)
      return shell.ApplyAction(
        new SwUndoAttr(paragraph, range.start, removedFragment, replacement, before, after),
      );
    const action = new SfxListUndoAction<SwUndoRedoContext>(
      replacement.text.length === 0 ? "Delete" : "Paste",
    );
    const atStart = shell.CreateCollapsedCursorState(paragraph, range.start);
    if (removedFragment.text.length !== 0)
      action.AddAction(
        new SwUndoDelete(
          paragraph,
          range.start,
          removedFragment.text,
          "delete",
          undefined,
          before,
          replacement.text.length === 0 ? after : atStart,
        ),
      );
    if (replacement.text.length !== 0)
      action.AddAction(
        new SwUndoInsert(
          paragraph,
          range.start,
          replacement,
          undefined,
          removedFragment.text.length === 0 ? before : atStart,
          after,
          SwInsertFlags.DEFAULT,
        ),
      );
    return shell.ApplyAction(action);
  } finally {
    removedFragment.hints.Dispose();
  }
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
  return applyTextAndDirection(
    shell,
    new SwUndoJoinParagraphs(
      preceding,
      offset,
      paragraph,
      shell.CaptureCursorState(),
      shell.CreateCollapsedCursorState(preceding, offset),
    ),
    preceding,
    preceding.GetText() + paragraph.GetText(),
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

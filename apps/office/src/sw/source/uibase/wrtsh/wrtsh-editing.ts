/** @fileoverview Owns structural text-edit algorithms invoked by the cursor/undo-orchestrating SwWrtShell. */

import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwPosition, type SwPaM, type WriterTextRange } from "../../core/crsr/pam";
import type { SwDoc as WriterDocument } from "../../core/doc/doc";
import { createWriterListItemSet } from "../../core/doc/list";
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
import { sw_GetJoinFlags } from "../../core/doc/docedt";
import { SwUndoInsNum } from "../../core/undo/unnum";
import { SwUndoSplitNode } from "../../core/undo/unspnd";
import type { SwUndoCursorState, SwUndoRedoContext } from "../../core/undo/undobj";
import type { UndoManager } from "../../core/undo/docundo";
import { getWriterTypingCharacterClass } from "./delete";
import {
  pasteWriterTransfer,
  type WriterPasteDocument,
  type WriterPasteParagraph,
} from "../dochdl/swdtflvr";

/** Finds the grapheme start immediately before a caret. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Previous grapheme boundary. */
function getWriterPreviousGraphemeBoundary(text: string, offset: number): number {
  const boundaries = getWriterGraphemeBoundaries(text);
  let previous = 0;
  for (const boundary of boundaries) {
    if (boundary >= offset) return previous;
    previous = boundary;
  }
  /* v8 ignore next -- Boundary enumeration includes text.length for a valid cursor offset. */
  return previous;
}

/** Finds the grapheme end immediately after a caret. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Next grapheme boundary. */
function getWriterNextGraphemeBoundary(text: string, offset: number): number {
  for (const boundary of getWriterGraphemeBoundaries(text)) if (boundary > offset) return boundary;
  /* v8 ignore next -- Callers handle the text-end cursor before requesting a boundary. */
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
/** Cursor, history, and notification operations retained by SwWrtShell. */
export interface SwWrtShellEditingPort {
  readonly applyAction: (action: SfxUndoAction<SwUndoRedoContext>, tryMerge?: boolean) => boolean;
  readonly captureCursorState: () => SwUndoCursorState;
  readonly createCollapsedCursorState: (
    paragraph: WriterParagraph,
    offset: number,
  ) => SwUndoCursorState;
  readonly getActiveParagraph: () => WriterParagraph;
  readonly getCursor: () => SwPaM;
  readonly getDoc: () => WriterDocument;
  readonly getPendingCharacterItems: () => SfxItemSet;
  readonly getUndoManager: () => UndoManager;
  readonly runNotificationTransaction: (operation: () => boolean) => boolean;
  readonly setCursor: (position: SwPosition) => boolean;
}

/** Performs text, range, paste, split, and join algorithms without owning shell identity. */
export class SwWrtShellEditingOperations {
  /** Creates operations over the shell-owned cursor/history port. @param port - Shell orchestration callbacks. @returns Nothing. */
  public constructor(private readonly port: SwWrtShellEditingPort) {}

  /** Inserts text at the persistent point, replacing any selection. @param text - Inserted text. @param allowGrouping - Whether typing may merge with the preceding action. @returns Whether changed. */
  public InsertAtCursor(text: string, allowGrouping: boolean): boolean {
    const before = this.port.captureCursorState();
    const cursor = this.port.getCursor();
    const point = cursor.GetPoint();
    const paragraph = point.GetNode() as WriterParagraph;
    const mark = cursor.HasMark() ? cursor.GetMark() : undefined;
    if (mark !== undefined) {
      return this.port.runNotificationTransaction(
        /** Brackets native deletion and forced insertion as one shell action. @returns Whether inserted. */ () => {
          const manager = this.port.getUndoManager();
          manager.StartUndo("Replace");
          try {
            const deleted = this.DeleteAtCursor("delete");
            const position = this.port.getCursor().GetPoint();
            const target = position.GetNode() as WriterParagraph,
              start = position.GetContentIndex();
            return this.port.applyAction(
              createWriterInsertTextAction(
                target,
                start,
                text,
                this.port.getPendingCharacterItems(),
                undefined,
                this.port.captureCursorState(),
                this.port.createCollapsedCursorState(target, start + text.length),
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
    return this.port.applyAction(
      createWriterInsertTextAction(
        paragraph,
        offset,
        text,
        this.port.getPendingCharacterItems(),
        group,
        before,
        this.port.createCollapsedCursorState(paragraph, offset + text.length),
      ),
      group !== undefined,
    );
  }

  /** Deletes the active selection or one adjacent grapheme. @param direction - Logical direction. @returns Whether changed. */
  public DeleteAtCursor(direction: SwUndoDeleteDirection): boolean {
    const before = this.port.captureCursorState();
    const cursor = this.port.getCursor();
    const point = cursor.GetPoint();
    const paragraph = point.GetNode() as WriterParagraph;
    const mark = cursor.HasMark() ? cursor.GetMark() : undefined;
    if (mark !== undefined) {
      if (mark.GetNode() !== paragraph) return this.DeleteCrossParagraphSelection();
      const start = Math.min(mark.GetContentIndex(), point.GetContentIndex());
      const end = Math.max(mark.GetContentIndex(), point.GetContentIndex());
      if (start === end) return false;
      return this.port.applyAction(
        new SwUndoDelete(
          paragraph,
          start,
          paragraph.GetText().slice(start, end),
          direction,
          undefined,
          before,
          this.port.createCollapsedCursorState(paragraph, start),
        ),
      );
    }
    const offset = point.GetContentIndex();
    if (direction === "backspace" && offset === 0)
      return this.MergeParagraphWithPrevious(paragraph);
    if (direction === "delete" && offset === paragraph.Len())
      return this.MergeParagraphWithNext(paragraph);
    const start =
      direction === "backspace"
        ? getWriterPreviousGraphemeBoundary(paragraph.GetText(), offset)
        : offset;
    const end =
      direction === "backspace"
        ? offset
        : getWriterNextGraphemeBoundary(paragraph.GetText(), offset);
    /* v8 ignore next -- Valid non-boundary cursor offsets still lie inside one grapheme. */
    if (start === end) return false;
    const deletedText = paragraph.GetText().slice(start, end);
    const group =
      deletedText.length === 1
        ? /[\p{L}\p{N}]/u.test(deletedText)
          ? "word"
          : "delimiter"
        : undefined;
    return this.port.applyAction(
      new SwUndoDelete(
        paragraph,
        start,
        paragraph.GetText().slice(start, end),
        direction,
        group,
        before,
        this.port.createCollapsedCursorState(paragraph, start),
      ),
      group !== undefined,
    );
  }

  /** Splits at the caret after replacing a selected range. @returns Whether changed. */
  public SplitAtCursor(): boolean {
    const cursor = this.port.getCursor();
    if (cursor.HasMark()) {
      const manager = this.port.getUndoManager();
      manager.EnterListAction("Split Paragraph");
      try {
        this.DeleteAtCursor("delete");
        this.SplitParagraph(cursor.GetPoint());
      } finally {
        manager.LeaveListAction();
      }
      return true;
    }
    this.SplitParagraph(cursor.GetPoint());
    return true;
  }

  /** Replaces one same-paragraph range with a native Writer text fragment. @param range - Target range. @param replacement - Inserted native fragment. @returns Whether changed. */
  public ReplaceRange(range: WriterTextRange, replacement: SwTextFragment): boolean {
    const paragraph = range.node;
    if (paragraph.GetDoc() !== this.port.getDoc()) throw new Error("Writer text range is foreign.");
    if (
      !Number.isInteger(range.start) ||
      !Number.isInteger(range.end) ||
      range.start < 0 ||
      range.end < range.start ||
      range.end > paragraph.Len()
    )
      throw new Error("Writer text range is outside the paragraph.");
    const removedFragment = paragraph.CaptureTextFragment(range.start, range.end);
    if (
      removedFragment.text === replacement.text &&
      removedFragment.hints.equals(replacement.hints)
    )
      return false;
    const nextOffset = range.start + replacement.text.length;
    return this.port.applyAction(
      new SwUndoReplace(
        paragraph,
        range.start,
        removedFragment,
        replacement,
        replacement.text.length === 0 ? "Delete" : "Paste",
        this.port.captureCursorState(),
        this.port.createCollapsedCursorState(paragraph, nextOffset),
      ),
    );
  }

  /** Pastes one safe transfer document as a compound Writer action. @param paste - Parsed clipboard content. @returns Whether changed. */
  public Paste(paste: WriterPasteDocument): boolean {
    const manager = this.port.getUndoManager();
    const cursor = this.port.getCursor();
    return pasteWriterTransfer(paste, {
      applyParagraphList:
        /** Applies imported list state. @param paragraph - Clipboard paragraph. @returns Whether changed. */ (
          paragraph,
        ) => this.ApplyPastedParagraphList(paragraph),
      beginUndoGroup: /** Opens the paste compound action. @returns Nothing. */ () =>
        manager.EnterListAction("Paste"),
      deleteSelection: /** Removes the active selection. @returns Nothing. */ () => {
        this.DeleteAtCursor("delete");
      },
      endUndoGroup: /** Closes the paste compound action. @returns Nothing. */ () =>
        manager.LeaveListAction(),
      getInsertionPoint:
        /** Returns the current insertion point. @returns Canonical position. */ () =>
          cursor.GetPoint(),
      hasSelection: /** Reports mark state. @returns Whether selected. */ () => cursor.HasMark(),
      replaceRange:
        /** Replaces a paragraph range. @param range - Target range. @param replacement - Inserted native fragment. @returns Whether changed. */ (
          range,
          replacement,
        ) => this.ReplaceRange(range, replacement),
      setCursor:
        /** Moves the shell cursor. @param position - Canonical position. @returns Whether changed. */ (
          position,
        ) => this.port.setCursor(position),
      splitParagraph:
        /** Splits a paragraph. @param position - Split point. @returns Trailing paragraph. */ (
          position,
        ) => this.SplitParagraph(position),
    });
  }

  /** Splits one paragraph at a canonical position. @param position - Split point. @returns New trailing paragraph. */
  public SplitParagraph(position: SwPosition): WriterParagraph {
    const paragraph = position.GetNode() as WriterParagraph;
    const offset = position.GetContentIndex();
    if (paragraph.GetDoc() !== this.port.getDoc())
      throw new Error("Writer split position is foreign.");
    /* v8 ignore next 2 -- SwPosition validates the same node bounds. */
    if (!Number.isInteger(offset) || offset < 0 || offset > paragraph.Len())
      throw new Error("Split offset is outside the paragraph.");
    this.port.applyAction(
      new SwUndoSplitNode(
        paragraph,
        offset,
        this.port.captureCursorState(),
        this.port.createCollapsedCursorState(paragraph, 0),
      ),
    );
    return this.port.getActiveParagraph();
  }

  /** Joins a paragraph into its predecessor. @param paragraph - Removed trailing paragraph. @returns Whether changed. */
  public MergeParagraphWithPrevious(paragraph: WriterParagraph): boolean {
    const document = this.port.getDoc();
    const index = paragraph.GetIndex();
    const preceding = document.nodes.at(index - 1);
    if (
      !(preceding instanceof SwTextNode) ||
      preceding.StartOfSectionNode() !== paragraph.StartOfSectionNode()
    )
      return false;
    const offset = preceding.Len();
    return this.port.applyAction(
      new SwUndoJoinParagraphs(
        preceding,
        offset,
        paragraph,
        this.port.captureCursorState(),
        this.port.createCollapsedCursorState(preceding, offset),
      ),
    );
  }

  /** Joins the following paragraph into the selected node. @param paragraph - Preceding paragraph. @returns Whether changed. */
  public MergeParagraphWithNext(paragraph: WriterParagraph): boolean {
    const document = this.port.getDoc();
    const next = document.nodes.at(paragraph.GetIndex() + 1);
    if (
      !(next instanceof SwTextNode) ||
      next.StartOfSectionNode() !== paragraph.StartOfSectionNode()
    )
      return false;
    return this.MergeParagraphWithPrevious(next);
  }

  /** Deletes a cross-node selection and joins its boundaries. @returns Whether changed. */
  private DeleteCrossParagraphSelection(): boolean {
    const cursor = this.port.getCursor();
    const { joinPrev } = sw_GetJoinFlags(cursor);
    const start = cursor.Start(),
      end = cursor.End();
    const first = start.GetNode() as WriterParagraph,
      last = end.GetNode() as WriterParagraph;
    const offset = start.GetContentIndex();
    return this.port.applyAction(
      new SwUndoDelete(
        first,
        offset,
        first.GetText().slice(offset),
        "delete",
        undefined,
        this.port.captureCursorState(),
        this.port.createCollapsedCursorState(joinPrev ? last : first, offset),
        cursor,
      ),
    );
  }

  /** Applies imported list metadata through Writer numbering undo. @param paragraph - Parsed clipboard paragraph. @returns Whether changed. */
  private ApplyPastedParagraphList(paragraph: WriterPasteParagraph): boolean {
    const target = this.port.getActiveParagraph();
    const nextList = { kind: paragraph.listKind, level: paragraph.listLevel } as const;
    if (target.GetListKind() === nextList.kind && target.GetAttrListLevel() === nextList.level)
      return false;
    const cursor = this.port.captureCursorState();
    return this.port.applyAction(
      new SwUndoInsNum(
        target,
        target.CaptureListItems(),
        createWriterListItemSet(target, nextList),
        cursor,
        cursor,
      ),
    );
  }
}

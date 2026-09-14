/**
 * @fileoverview Implements the persistent Writer editing shell and SwPaM ownership from
 * pinned LibreOffice `sw/source/uibase/wrtsh/wrtsh1.cxx`.
 */

import {
  createCommandShell,
  type SfxShell,
} from "../../../../framework/source/dispatch/dispatchprovider";
import type { SfxUndoAction, SfxUndoManager } from "../../../../sfx2/source/doc/docundomanager";
import {
  SwPaM,
  SwPosition,
  type WriterCharacterAttributes,
  type WriterCharacterFormat,
  type WriterDocument,
  type WriterParagraph,
  type WriterParagraphAlignment,
  type WriterParagraphStyle,
  type WriterTextRun,
} from "../../core/doc/writer";
import type { WriterParagraphTextRange } from "../../core/doc/DocumentContentOperationsManager";
import {
  createWriterTextRuns,
  DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  getWriterTextAttributesAtOffset,
  normalizeWriterTextRuns,
  toggleWriterTextRangeFormat,
} from "../../core/txtnode/ndtxt";
import {
  isWriterParagraphListKind,
  WRITER_MAX_LIST_LEVEL,
  type WriterParagraphListKind,
} from "../../core/doc/list";
import type { WriterListLevelCommand } from "../shells/listsh";
import { createWriterTextCommandRegistry } from "../shells/writercommands";
import type { SwDocShell } from "../app/docsh";
import { getActiveWriterParagraph, getNextWriterParagraphId } from "../uiview/viewfunc";
import { SwUndoInsert, type SwUndoInsertGroup } from "../../core/undo/unins";
import {
  SwUndoDelete,
  SwUndoJoinParagraphs,
  SwUndoReplace,
  type SwUndoDeleteDirection,
  type SwUndoDeleteGroup,
} from "../../core/undo/undel";
import { SwUndoSplitNode } from "../../core/undo/unspnd";
import { SwUndoAttr, SwUndoParagraphFormat } from "../../core/undo/unattr";
import { SwUndoFormatColl } from "../../core/undo/unfmco";
import { SwUndoInsNum, SwUndoNumLevel } from "../../core/undo/unnum";
import {
  CopyTextRangeRuns,
  CopyUndoRuns,
  GetUndoRunsLength,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "../../core/undo/undobj";

/** Stable browser-neutral coordinate used to synchronize a Writer SwPaM with a rendered view. */
export interface WriterCursorPosition {
  /** Stable Writer text-node identity. */
  readonly paragraphId: string;
  /** UTF-16 content offset inside the text node. */
  readonly offset: number;
}

/** Direction-preserving projection of the persistent Writer point-and-mark cursor. */
export interface WriterCursorSelection {
  /** Optional fixed selection endpoint. */
  readonly mark?: WriterCursorPosition;
  /** Moving caret or selection endpoint. */
  readonly point: WriterCursorPosition;
}

/** Shell-owned temporary extended-text-input state corresponding to LibreOffice SwExtTextInput. */
interface WriterCompositionState {
  /** Cursor or selection replaced when the composition is committed. */
  readonly cursor: SwUndoCursorState;
  /** Latest browser composition text, not yet written into SwDoc. */
  text: string;
}

/** Persistent Writer editing shell over one document shell and one direction-preserving PaM. */
export class SwWrtShell {
  private activeParagraphId: string;
  private readonly commandShell: SfxShell;
  private composition: WriterCompositionState | undefined;
  private readonly cursor: SwPaM;
  private readonly listeners = new Set<() => void>();
  private pendingCharacterAttributes: WriterCharacterAttributes = {
    ...DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  };
  private readonly undoContext: SwUndoRedoContext;

  /** Creates a shell at the end of the first Writer paragraph. @param docShell - Persistent owning document shell. @returns Nothing. */
  public constructor(private readonly docShell: SwDocShell) {
    const paragraph = docShell.GetDoc().paragraphs[0] as WriterParagraph;
    this.activeParagraphId = paragraph.id;
    this.cursor = new SwPaM(new SwPosition(paragraph, paragraph.text.length));
    this.pendingCharacterAttributes = getWriterTextAttributesAtOffset(
      paragraph.runs,
      paragraph.text.length,
    );
    this.undoContext = {
      GetDoc: /** Returns the shell's current SwDoc. @returns Active document. */ () =>
        this.docShell.GetDoc(),
      RestoreCursor:
        /** Restores one action cursor boundary. @param state - Stored state. @returns Nothing. */ (
          state,
        ) => this.RestoreCursorState(state),
    };
    this.commandShell = createCommandShell(this, createWriterTextCommandRegistry(this));
  }

  /** Returns the persistent owning document shell. @returns SwDocShell. */
  public GetDocShell(): SwDocShell {
    return this.docShell;
  }

  /** Returns the current canonical Writer document. @returns Shell-owned SwDoc. */
  public GetDoc(): WriterDocument {
    return this.docShell.GetDoc();
  }

  /** Returns the persistent point-and-mark cursor identity. @returns Current SwPaM. */
  public GetCursor(): SwPaM {
    return this.cursor;
  }

  /** Projects the persistent SwPaM to stable Writer node coordinates. @returns Copied direction-preserving cursor state. */
  public GetCursorSelection(): WriterCursorSelection {
    const point = this.cursor.GetPoint();
    const pointNode = point.GetNode() as WriterParagraph;
    const mark = this.cursor.HasMark() ? this.cursor.GetMark() : undefined;
    const markNode = mark?.GetNode() as WriterParagraph | undefined;
    return {
      ...(mark === undefined || markNode === undefined
        ? {}
        : { mark: { offset: mark.GetContentIndex(), paragraphId: markNode.id } }),
      point: { offset: point.GetContentIndex(), paragraphId: pointNode.id },
    };
  }

  /** Returns the Writer editing command shell for top-priority frame registration. @returns SfxShell adapter. */
  public GetCommandShell(): SfxShell {
    return this.commandShell;
  }

  /** Returns the active paragraph with the Writer first-paragraph fallback. @returns Active text node. */
  public GetActiveParagraph(): WriterParagraph {
    return getActiveWriterParagraph(this.GetDoc(), this.activeParagraphId);
  }

  /** Returns pending direct attributes for a collapsed caret. @returns Copied attribute state. */
  public GetPendingCharacterAttributes(): WriterCharacterAttributes {
    return { ...this.pendingCharacterAttributes };
  }

  /** Returns whether the shell-owned history can move backward. @returns True when Undo is enabled. */
  public CanUndo(): boolean {
    return this.docShell.GetUndoManager().GetUndoActionCount() > 0;
  }

  /** Returns whether the shell-owned history can move forward. @returns True when Redo is enabled. */
  public CanRedo(): boolean {
    return this.docShell.GetUndoManager().GetRedoActionCount() > 0;
  }

  /** Subscribes to cursor and pending-attribute changes. @param listener - View invalidation callback. @returns Cleanup removing it. */
  public Subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return /** Removes one editing-shell listener. @returns Whether the listener was present. */ () =>
      this.listeners.delete(listener);
  }

  /** Rebinds the persistent PaM after explicit document replacement. @returns Nothing. */
  public DocumentReplaced(): void {
    const paragraph = this.GetDoc().paragraphs[0] as WriterParagraph;
    this.activeParagraphId = paragraph.id;
    this.composition = undefined;
    this.pendingCharacterAttributes = getWriterTextAttributesAtOffset(
      paragraph.runs,
      paragraph.text.length,
    );
    this.AssignCursor(paragraph, paragraph.text.length);
    this.Notify();
  }

  /** Selects one paragraph as the command target. @param paragraphId - Existing paragraph identity. @param offset - Optional logical caret offset, defaulting to paragraph end. @returns Nothing. */
  public SetCursor(paragraphId: string, offset?: number): void {
    const paragraph = getActiveWriterParagraph(this.GetDoc(), paragraphId);
    this.SetSelection({
      point: { offset: offset ?? paragraph.text.length, paragraphId: paragraph.id },
    });
  }

  /** Uses paragraph-end fallback only when focus crosses nodes before the browser publishes selectionchange. @param paragraphId - Focused paragraph identity. @returns Nothing. */
  public FocusParagraph(paragraphId: string): void {
    const paragraph = getActiveWriterParagraph(this.GetDoc(), paragraphId);
    if (this.cursor.GetPoint().GetNode() === paragraph) {
      this.activeParagraphId = paragraph.id;
      return;
    }
    this.SetCursor(paragraph.id);
  }

  /** Synchronizes an externally changed view selection into the persistent SwPaM. @param selection - Stable point-and-mark coordinates from a view adapter. @returns Whether canonical cursor state changed. */
  public SetSelection(selection: WriterCursorSelection): boolean {
    const document = this.GetDoc();
    const pointNode = document.nodes.findTextNode(selection.point.paragraphId);
    if (pointNode === undefined) return false;
    const markNode =
      selection.mark === undefined
        ? undefined
        : document.nodes.findTextNode(selection.mark.paragraphId);
    if (
      !isWriterCursorOffset(pointNode, selection.point.offset) ||
      (selection.mark !== undefined &&
        (markNode === undefined || !isWriterCursorOffset(markNode, selection.mark.offset)))
    )
      return false;
    const current = this.GetCursorSelection();
    if (areWriterCursorSelectionsEqual(current, selection)) return false;
    this.activeParagraphId = pointNode.id;
    this.pendingCharacterAttributes = getWriterTextAttributesAtOffset(
      pointNode.runs,
      selection.point.offset,
    );
    this.docShell.GetUndoManager().BreakUndoGrouping();
    this.cursor.Assign(
      new SwPosition(pointNode, selection.point.offset),
      selection.mark === undefined || markNode === undefined
        ? undefined
        : new SwPosition(markNode, selection.mark.offset),
    );
    this.Notify();
    return true;
  }

  /** Selects the complete current Writer body through the persistent shell cursor. @returns Nothing. */
  public SelectAll(): void {
    const document = this.GetDoc();
    const first = document.paragraphs[0] as WriterParagraph;
    const last = document.paragraphs[document.paragraphs.length - 1] as WriterParagraph;
    this.SetSelection({
      mark: { offset: 0, paragraphId: first.id },
      point: { offset: last.Len(), paragraphId: last.id },
    });
  }

  /** Executes a supported browser edit intent against the persistent SwPaM before native DOM mutation. @param inputType - Native beforeinput operation. @param data - Inserted text supplied by InputEvent. @returns True when the intent belongs to the modeled Writer input subset. */
  public HandleInput(inputType: string, data: string | null): boolean {
    switch (inputType) {
      case "insertText":
      case "insertReplacementText":
        if (data !== null && data.length > 0) this.InsertAtCursor(data, inputType === "insertText");
        return true;
      case "insertLineBreak":
      case "insertParagraph":
        this.SplitAtCursor();
        return true;
      case "deleteContentBackward":
        this.DeleteAtCursor("backspace");
        return true;
      case "deleteContentForward":
        this.DeleteAtCursor("delete");
        return true;
      case "historyUndo":
        this.Undo();
        return true;
      case "historyRedo":
        this.Redo();
        return true;
      default:
        return false;
    }
  }

  /** Begins browser extended text input while retaining the exact Writer selection it may replace. @returns Nothing. */
  public StartComposition(): void {
    if (this.composition !== undefined) return;
    this.docShell.GetUndoManager().BreakUndoGrouping();
    this.composition = { cursor: this.CaptureCursorState(), text: "" };
  }

  /** Updates temporary extended text without mutating the canonical Writer document. @param text - Latest complete browser composition string. @returns Nothing. */
  public UpdateComposition(text: string): void {
    if (this.composition === undefined) this.StartComposition();
    (this.composition as WriterCompositionState).text = text;
  }

  /** Commits one extended-text-input unit through the same selection-replacing shell insertion used upstream. @returns Whether document content changed. */
  public EndComposition(): boolean {
    const composition = this.composition;
    if (composition === undefined) return false;
    this.composition = undefined;
    this.RestoreCursorState(composition.cursor);
    if (composition.text.length === 0) {
      this.Notify();
      return false;
    }
    const changed = this.InsertAtCursor(composition.text, false);
    if (!changed) this.Notify();
    return changed;
  }

  /** Applies one explicitly isolated post-DOM fallback replacement for unsupported browser input kinds. @param paragraphId - Edited paragraph. @param text - Complete next visible text. @param caretOffset - Collapsed caret after input. @param inputType - Native input operation. @returns Whether document content changed. */
  public InsertText(
    paragraphId: string,
    text: string,
    caretOffset: number | undefined,
    inputType: string,
  ): boolean {
    const document = this.GetDoc();
    const paragraph = getActiveWriterParagraph(document, paragraphId);
    const change = getWriterTextChange(paragraph.text, text);
    const nextOffset = caretOffset ?? text.length;
    if (change === undefined && paragraph.text === text) {
      this.activeParagraphId = paragraph.id;
      this.AssignCursor(paragraph, nextOffset);
      this.Notify();
      return false;
    }
    const before =
      change?.kind === "insert"
        ? this.CreateCollapsedCursorState(paragraph.id, change.offset)
        : change?.kind === "delete"
          ? this.CreateCollapsedCursorState(
              paragraph.id,
              inputType === "deleteContentBackward" ? change.end : change.start,
            )
          : this.CaptureCursorState();
    const after = this.CreateCollapsedCursorState(paragraph.id, nextOffset);
    if (change?.kind === "insert") {
      const group = getWriterInsertGroup(change, inputType, before, caretOffset);
      return this.ApplyAction(
        new SwUndoInsert(
          paragraph.id,
          change.offset,
          [{ attributes: { ...this.pendingCharacterAttributes }, text: change.text }],
          group,
          before,
          after,
        ),
        group !== undefined,
      );
    }
    if (change?.kind === "delete") {
      const grouping = getWriterDeleteGrouping(change, inputType, before, caretOffset);
      return this.ApplyAction(
        new SwUndoDelete(
          paragraph.id,
          change.start,
          CopyTextRangeRuns(paragraph, change.start, change.end),
          grouping?.direction ?? (inputType === "deleteContentBackward" ? "backspace" : "delete"),
          grouping?.group,
          before,
          after,
        ),
        grouping !== undefined,
      );
    }
    return this.ApplyAction(
      new SwUndoReplace(
        paragraph.id,
        0,
        CopyTextRangeRuns(paragraph, 0, paragraph.Len()),
        createWriterTextRuns(text),
        "Replace",
        before,
        after,
      ),
    );
  }

  /** Inserts text at the persistent point, replacing a same-node selection like SwWrtShell::Insert. @param text - Non-empty inserted text. @param allowGrouping - Whether ordinary typing may merge with the preceding insert action. @returns Whether the document changed. */
  private InsertAtCursor(text: string, allowGrouping: boolean): boolean {
    const before = this.CaptureCursorState();
    const point = this.cursor.GetPoint();
    const paragraph = point.GetNode() as WriterParagraph;
    const mark = this.cursor.HasMark() ? this.cursor.GetMark() : undefined;
    if (mark !== undefined) {
      if (mark.GetNode() !== paragraph) return false;
      const start = Math.min(mark.GetContentIndex(), point.GetContentIndex());
      const end = Math.max(mark.GetContentIndex(), point.GetContentIndex());
      return this.ApplyAction(
        new SwUndoReplace(
          paragraph.id,
          start,
          CopyTextRangeRuns(paragraph, start, end),
          [{ attributes: { ...this.pendingCharacterAttributes }, text }],
          "Replace",
          before,
          this.CreateCollapsedCursorState(paragraph.id, start + text.length),
        ),
      );
    }
    const offset = point.GetContentIndex();
    const group = allowGrouping ? getWriterTypingCharacterClass(text) : undefined;
    return this.ApplyAction(
      new SwUndoInsert(
        paragraph.id,
        offset,
        [{ attributes: { ...this.pendingCharacterAttributes }, text }],
        group,
        before,
        this.CreateCollapsedCursorState(paragraph.id, offset + text.length),
      ),
      group !== undefined,
    );
  }

  /** Deletes the active same-node selection or one adjacent grapheme through DelLeft/DelRight semantics. @param direction - Logical deletion direction. @returns Whether the document changed. */
  private DeleteAtCursor(direction: SwUndoDeleteDirection): boolean {
    const before = this.CaptureCursorState();
    const point = this.cursor.GetPoint();
    const paragraph = point.GetNode() as WriterParagraph;
    const mark = this.cursor.HasMark() ? this.cursor.GetMark() : undefined;
    if (mark !== undefined) {
      if (mark.GetNode() !== paragraph) return false;
      const start = Math.min(mark.GetContentIndex(), point.GetContentIndex());
      const end = Math.max(mark.GetContentIndex(), point.GetContentIndex());
      if (start === end) return false;
      return this.ApplyAction(
        new SwUndoDelete(
          paragraph.id,
          start,
          CopyTextRangeRuns(paragraph, start, end),
          direction,
          undefined,
          before,
          this.CreateCollapsedCursorState(paragraph.id, start),
        ),
      );
    }
    const offset = point.GetContentIndex();
    if (direction === "backspace" && offset === 0)
      return this.MergeParagraphWithPrevious(paragraph.id);
    if (direction === "delete" && offset === paragraph.Len())
      return this.MergeParagraphWithNext(paragraph.id);
    const start =
      direction === "backspace"
        ? getWriterPreviousGraphemeBoundary(paragraph.text, offset)
        : offset;
    const end =
      direction === "backspace" ? offset : getWriterNextGraphemeBoundary(paragraph.text, offset);
    /* v8 ignore next -- Valid non-boundary cursor offsets still lie strictly inside one grapheme. */
    if (start === end) return false;
    const deletedText = paragraph.text.slice(start, end);
    const group =
      deletedText.length === 1
        ? /[\p{L}\p{N}]/u.test(deletedText)
          ? "word"
          : "delimiter"
        : undefined;
    return this.ApplyAction(
      new SwUndoDelete(
        paragraph.id,
        start,
        CopyTextRangeRuns(paragraph, start, end),
        direction,
        group,
        before,
        this.CreateCollapsedCursorState(paragraph.id, start),
      ),
      group !== undefined,
    );
  }

  /** Splits the paragraph at the persistent caret, first replacing a bounded same-node selection when present. @returns Whether a paragraph break was inserted. */
  private SplitAtCursor(): boolean {
    const mark = this.cursor.HasMark() ? this.cursor.GetMark() : undefined;
    if (mark !== undefined) {
      const point = this.cursor.GetPoint();
      if (mark.GetNode() !== point.GetNode()) return false;
      const manager = this.docShell.GetUndoManager();
      manager.EnterListAction("Split Paragraph");
      try {
        this.DeleteAtCursor("delete");
        const nextPoint = this.cursor.GetPoint();
        this.SplitParagraph(
          (nextPoint.GetNode() as WriterParagraph).id,
          nextPoint.GetContentIndex(),
        );
      } finally {
        manager.LeaveListAction();
      }
      return true;
    }
    const point = this.cursor.GetPoint();
    this.SplitParagraph((point.GetNode() as WriterParagraph).id, point.GetContentIndex());
    return true;
  }

  /** Replaces one same-paragraph range with Writer text runs. @param range - Target range. @param runs - Inserted safe runs. @returns Whether document content changed. */
  public ReplaceRange(range: WriterParagraphTextRange, runs: readonly WriterTextRun[]): boolean {
    const paragraph = this.GetDoc().nodes.findTextNode(range.paragraphId);
    if (paragraph === undefined) throw new Error(`Unknown paragraph: ${range.paragraphId}`);
    if (
      !Number.isInteger(range.start) ||
      !Number.isInteger(range.end) ||
      range.start < 0 ||
      range.end < range.start ||
      range.end > paragraph.Len()
    )
      throw new Error("Writer text range is outside the paragraph.");
    const removedRuns = CopyTextRangeRuns(paragraph, range.start, range.end);
    const insertedRuns = CopyUndoRuns(normalizeWriterTextRuns(runs));
    if (JSON.stringify(removedRuns) === JSON.stringify(insertedRuns)) return false;
    const insertionLength = GetUndoRunsLength(insertedRuns);
    const nextOffset = range.start + insertionLength;
    return this.ApplyAction(
      new SwUndoReplace(
        paragraph.id,
        range.start,
        removedRuns,
        insertedRuns,
        insertedRuns.length === 0 ? "Delete" : "Paste",
        this.CaptureCursorState(),
        this.CreateCollapsedCursorState(paragraph.id, nextOffset),
      ),
    );
  }

  /** Splits one paragraph at the logical caret. @param paragraphId - Source paragraph. @param offset - Split offset. @returns New paragraph identity. */
  public SplitParagraph(paragraphId: string, offset: number): string {
    const document = this.GetDoc();
    const paragraph = document.nodes.findTextNode(paragraphId);
    if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
    if (!Number.isInteger(offset) || offset < 0 || offset > paragraph.Len())
      throw new Error("Split offset is outside the paragraph.");
    const nextParagraphId = getNextWriterParagraphId(document);
    this.ApplyAction(
      new SwUndoSplitNode(
        paragraph.id,
        offset,
        nextParagraphId,
        this.CaptureCursorState(),
        this.CreateCollapsedCursorState(nextParagraphId, 0),
      ),
    );
    return nextParagraphId;
  }

  /** Joins a non-first paragraph into its preceding node. @param paragraphId - Paragraph whose preceding break is removed. @returns Whether a merge occurred. */
  public MergeParagraphWithPrevious(paragraphId: string): boolean {
    const document = this.GetDoc();
    const index = document.paragraphs.findIndex(
      /** Matches the paragraph selected for joining. @param paragraph - Candidate paragraph. @returns Whether IDs match. */
      (paragraph) => paragraph.id === paragraphId,
    );
    if (index <= 0) return false;
    const preceding = document.paragraphs[index - 1] as WriterParagraph;
    const offset = preceding.text.length;
    const removed = document.paragraphs[index] as WriterParagraph;
    return this.ApplyAction(
      new SwUndoJoinParagraphs(
        preceding.id,
        offset,
        removed.toSnapshot(),
        this.CaptureCursorState(),
        this.CreateCollapsedCursorState(preceding.id, offset),
      ),
    );
  }

  /** Joins the following paragraph into the selected node. @param paragraphId - Paragraph whose following break is removed. @returns Whether a merge occurred. */
  public MergeParagraphWithNext(paragraphId: string): boolean {
    const document = this.GetDoc();
    const index = document.paragraphs.findIndex(
      /** Matches the paragraph selected before the following break. @param paragraph - Candidate paragraph. @returns Whether IDs match. */
      (paragraph) => paragraph.id === paragraphId,
    );
    if (index < 0 || index === document.paragraphs.length - 1) return false;
    return this.MergeParagraphWithPrevious((document.paragraphs[index + 1] as WriterParagraph).id);
  }

  /** Returns on/off/mixed state for one direct character format at the persistent cursor. @param format - Writer direct character format. @returns Selection-aware slot state. */
  public GetCharacterFormatState(format: WriterCharacterFormat): "mixed" | "off" | "on" {
    const range = this.GetSelectedTextRange();
    if (range === undefined)
      return this.cursor.HasMark()
        ? "mixed"
        : this.pendingCharacterAttributes[format]
          ? "on"
          : "off";
    const paragraph = this.GetDoc().nodes.findTextNode(range.paragraphId) as WriterParagraph;
    const values = new Set(
      CopyTextRangeRuns(paragraph, range.start, range.end).map(
        /** Reads the selected fragment's format value. @param run - Selected Writer text run. @returns Applied flag. */ (
          run,
        ) => run.attributes[format],
      ),
    );
    return values.size > 1 ? "mixed" : values.has(true) ? "on" : "off";
  }

  /** Toggles direct character formatting over a range or pending caret state. @param format - Writer character format. @param range - Optional same-paragraph selection. @returns Whether document content changed. */
  public ToggleCharacterFormat(
    format: WriterCharacterFormat,
    range?: WriterParagraphTextRange,
  ): boolean {
    if (range !== undefined) {
      const paragraph = this.GetDoc().nodes.findTextNode(range.paragraphId);
      if (paragraph === undefined) throw new Error(`Unknown paragraph: ${range.paragraphId}`);
      if (
        !Number.isInteger(range.start) ||
        !Number.isInteger(range.end) ||
        range.start < 0 ||
        range.end < range.start ||
        range.end > paragraph.Len()
      )
        throw new Error("Writer text range is outside the paragraph.");
      const currentRange = this.GetSelectedTextRange();
      if (
        currentRange?.paragraphId !== range.paragraphId ||
        currentRange.start !== range.start ||
        currentRange.end !== range.end
      )
        this.SetSelection({
          mark: { offset: range.start, paragraphId: range.paragraphId },
          point: { offset: range.end, paragraphId: range.paragraphId },
        });
    }
    const before = this.CaptureCursorState();
    const selectedRange = this.GetSelectedTextRange();
    this.pendingCharacterAttributes = {
      ...this.pendingCharacterAttributes,
      [format]: this.GetCharacterFormatState(format) !== "on",
    };
    if (selectedRange === undefined) {
      if (this.cursor.HasMark()) {
        this.Notify();
        return false;
      }
      this.docShell.GetUndoManager().BreakUndoGrouping();
      this.Notify();
      return false;
    }
    const paragraph = this.GetDoc().nodes.findTextNode(selectedRange.paragraphId);
    /* v8 ignore next -- A canonical same-node selection retains its indexed SwTextNode. */
    if (paragraph === undefined) throw new Error(`Unknown paragraph: ${selectedRange.paragraphId}`);
    const beforeRuns = CopyTextRangeRuns(paragraph, selectedRange.start, selectedRange.end);
    /* v8 ignore next 3 -- A validated non-empty text range always copies at least one run. */
    if (beforeRuns.length === 0) {
      this.Notify();
      return false;
    }
    const afterRuns = toggleWriterTextRangeFormat(
      beforeRuns,
      0,
      GetUndoRunsLength(beforeRuns),
      format,
    );
    return this.ApplyAction(
      new SwUndoAttr(paragraph.id, selectedRange.start, beforeRuns, afterRuns, before, before),
    );
  }

  /** Applies paragraph alignment through one shell-owned history transition. @param alignment - Next alignment. @returns Whether content changed. */
  public SetParagraphAlignment(alignment: WriterParagraphAlignment): boolean {
    const paragraph = this.GetActiveParagraph();
    if (paragraph.alignment === alignment) return false;
    const cursor = this.CaptureCursorState();
    return this.ApplyAction(
      new SwUndoParagraphFormat(paragraph.id, paragraph.alignment, alignment, cursor, cursor),
    );
  }

  /** Applies a paragraph style through one shell-owned history transition. @param style - Next style. @returns Whether content changed. */
  public SetParagraphStyle(style: WriterParagraphStyle): boolean {
    const paragraph = this.GetActiveParagraph();
    if (paragraph.style === style) return false;
    const cursor = this.CaptureCursorState();
    return this.ApplyAction(
      new SwUndoFormatColl(paragraph.id, paragraph.style, style, cursor, cursor),
    );
  }

  /** Applies or removes the active paragraph's default list. @param kind - Next list kind. @returns Whether content changed. */
  public SetParagraphListKind(kind: WriterParagraphListKind): boolean {
    if (!isWriterParagraphListKind(kind))
      throw new Error(`Unsupported Writer paragraph list kind: ${kind}`);
    const paragraph = this.GetActiveParagraph();
    if (paragraph.list.kind === kind) return false;
    const cursor = this.CaptureCursorState();
    return this.ApplyAction(
      new SwUndoInsNum(paragraph.id, paragraph.list, { ...paragraph.list, kind }, cursor, cursor),
    );
  }

  /** Promotes or demotes the active list paragraph. @param command - Level transition. @returns Whether content changed. */
  public ChangeParagraphListLevel(command: WriterListLevelCommand): boolean {
    if (command !== "demote" && command !== "promote")
      throw new Error(`Unsupported Writer list-level command: ${command}`);
    const paragraph = this.GetActiveParagraph();
    if (paragraph.list.kind === "none") return false;
    const level = paragraph.list.level + (command === "demote" ? 1 : -1);
    if (level < 0 || level > WRITER_MAX_LIST_LEVEL) return false;
    const cursor = this.CaptureCursorState();
    return this.ApplyAction(
      new SwUndoNumLevel(
        paragraph.id,
        paragraph.list,
        { ...paragraph.list, level },
        cursor,
        cursor,
      ),
    );
  }

  /** Restores the preceding Writer history state. @returns Whether navigation occurred. */
  public Undo(): boolean {
    const changed = this.docShell.Undo(this.undoContext);
    if (changed) this.Notify();
    return changed;
  }

  /** Restores the following Writer history state. @returns Whether navigation occurred. */
  public Redo(): boolean {
    const changed = this.docShell.Redo(this.undoContext);
    if (changed) this.Notify();
    return changed;
  }

  /** Moves the save mark without recording an undo action. @param savedGeneration - Persisted content generation. @returns Whether history state changed. */
  public AcknowledgeSave(savedGeneration: number): boolean {
    return this.docShell.AcknowledgeSave(savedGeneration);
  }

  /** Executes one semantic action and publishes cursor-state invalidation. @param action - Reversible Writer action. @param tryMerge - Whether adjacent typing/deletion grouping is allowed. @returns True after successful execution. */
  private ApplyAction(action: SfxUndoAction<SwUndoRedoContext>, tryMerge = false): boolean {
    this.docShell.ApplyUndoAction(action, this.undoContext, tryMerge);
    this.Notify();
    return true;
  }

  /** Returns an ordered non-empty same-node selection from the persistent SwPaM. @returns Bounded range or undefined for a caret/cross-node selection. */
  private GetSelectedTextRange(): WriterParagraphTextRange | undefined {
    if (!this.cursor.HasMark()) return undefined;
    const point = this.cursor.GetPoint();
    const mark = this.cursor.GetMark();
    if (point.GetNode() !== mark.GetNode()) return undefined;
    const start = Math.min(point.GetContentIndex(), mark.GetContentIndex());
    const end = Math.max(point.GetContentIndex(), mark.GetContentIndex());
    return start === end
      ? undefined
      : { end, paragraphId: (point.GetNode() as WriterParagraph).id, start };
  }

  /** Captures point, mark direction, active paragraph, and pending attributes for one action boundary. @returns Complete cursor state. */
  private CaptureCursorState(): SwUndoCursorState {
    const point = this.cursor.GetPoint();
    const pointNode = point.GetNode() as WriterParagraph;
    const mark = this.cursor.HasMark() ? this.cursor.GetMark() : undefined;
    const markNode = mark?.GetNode() as WriterParagraph | undefined;
    return {
      activeParagraphId: this.activeParagraphId,
      ...(mark === undefined || markNode === undefined
        ? {}
        : { mark: { offset: mark.GetContentIndex(), paragraphId: markNode.id } }),
      pendingCharacterAttributes: { ...this.pendingCharacterAttributes },
      point: { offset: point.GetContentIndex(), paragraphId: pointNode.id },
    };
  }

  /** Creates a collapsed action endpoint while retaining pending direct attributes. @param paragraphId - Target node identity. @param offset - Target content offset. @returns Complete cursor state. */
  private CreateCollapsedCursorState(paragraphId: string, offset: number): SwUndoCursorState {
    return {
      activeParagraphId: paragraphId,
      pendingCharacterAttributes: { ...this.pendingCharacterAttributes },
      point: { offset, paragraphId },
    };
  }

  /** Restores action-owned cursor state against the current mutable SwDoc graph. @param state - Stored cursor boundary. @returns Nothing. */
  private RestoreCursorState(state: SwUndoCursorState): void {
    const document = this.GetDoc();
    const pointNode =
      document.nodes.findTextNode(state.point.paragraphId) ??
      (document.paragraphs[0] as WriterParagraph);
    const point = new SwPosition(pointNode, Math.min(state.point.offset, pointNode.Len()));
    const markNode =
      state.mark === undefined ? undefined : document.nodes.findTextNode(state.mark.paragraphId);
    const mark =
      state.mark === undefined || markNode === undefined
        ? undefined
        : new SwPosition(markNode, Math.min(state.mark.offset, markNode.Len()));
    this.activeParagraphId =
      document.nodes.findTextNode(state.activeParagraphId)?.id ?? pointNode.id;
    this.pendingCharacterAttributes = { ...state.pendingCharacterAttributes };
    this.cursor.Assign(point, mark);
  }

  /** Mutates the existing PaM identity to a collapsed model position. @param paragraph - Target node. @param offset - UTF-16 content offset. @returns Nothing. */
  private AssignCursor(paragraph: WriterParagraph, offset: number): void {
    this.cursor.Assign(new SwPosition(paragraph, offset));
  }

  /** Publishes shell-local selection state invalidation. @returns Nothing. */
  private Notify(): void {
    for (const listener of this.listeners) listener();
  }
}

/** Validates one stable cursor offset against its current Writer text node. @param paragraph - Target text node. @param offset - Candidate UTF-16 offset. @returns Whether the position is representable. */
function isWriterCursorOffset(paragraph: WriterParagraph, offset: number): boolean {
  return Number.isInteger(offset) && offset >= 0 && offset <= paragraph.Len();
}

/** Compares two direction-preserving browser-neutral cursor projections. @param left - Current selection. @param right - Candidate selection. @returns True when point and optional mark are identical. */
function areWriterCursorSelectionsEqual(
  left: WriterCursorSelection,
  right: WriterCursorSelection,
): boolean {
  return (
    left.point.paragraphId === right.point.paragraphId &&
    left.point.offset === right.point.offset &&
    left.mark?.paragraphId === right.mark?.paragraphId &&
    left.mark?.offset === right.mark?.offset
  );
}

/** Finds the grapheme start immediately before a caret, matching Writer character deletion rather than raw UTF-16 units. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Previous grapheme boundary. */
function getWriterPreviousGraphemeBoundary(text: string, offset: number): number {
  const boundaries = getWriterGraphemeBoundaries(text);
  let previous = 0;
  for (const boundary of boundaries) {
    if (boundary >= offset) return previous;
    previous = boundary;
  }
  /* v8 ignore next -- Boundary enumeration always includes text.length for a valid cursor offset. */
  return previous;
}

/** Finds the grapheme end immediately after a caret. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Next grapheme boundary. */
function getWriterNextGraphemeBoundary(text: string, offset: number): number {
  for (const boundary of getWriterGraphemeBoundaries(text)) if (boundary > offset) return boundary;
  /* v8 ignore next -- Callers handle the text-end cursor before asking for a following boundary. */
  return text.length;
}

/** Enumerates browser-standard grapheme boundaries with a code-point fallback for older engines. @param text - Paragraph text. @returns Ordered UTF-16 boundaries including zero and text length. */
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

/** Detects one contiguous insertion, deletion, or fallback replacement. @param previousText - Canonical text. @param nextText - Browser text. @returns Exact change when representable. */
function getWriterTextChange(
  previousText: string,
  nextText: string,
):
  | Readonly<{ kind: "delete"; end: number; start: number; text: string }>
  | Readonly<{ kind: "insert"; offset: number; text: string }>
  | undefined {
  if (nextText === previousText) return undefined;
  let prefixLength = 0;
  while (
    prefixLength < previousText.length &&
    previousText.charAt(prefixLength) === nextText.charAt(prefixLength)
  )
    prefixLength += 1;
  let suffixLength = 0;
  while (
    suffixLength < previousText.length - prefixLength &&
    previousText.charAt(previousText.length - suffixLength - 1) ===
      nextText.charAt(nextText.length - suffixLength - 1)
  )
    suffixLength += 1;
  const previousEnd = previousText.length - suffixLength;
  const removedText = previousText.slice(prefixLength, previousEnd);
  const insertedText = nextText.slice(prefixLength, nextText.length - suffixLength);
  if (removedText.length === 0 && insertedText.length > 0)
    return { kind: "insert", offset: prefixLength, text: insertedText };
  if (insertedText.length === 0 && removedText.length > 0)
    return { kind: "delete", end: previousEnd, start: prefixLength, text: removedText };
  return undefined;
}

/** Applies SwUndoInsert::CanGrouping preconditions to browser input. @param change - Exact insertion. @param inputType - Native edit kind. @param before - Canonical cursor before input. @param nextCaretOffset - Native caret after input. @returns Character group when compatible. */
function getWriterInsertGroup(
  change: Readonly<{ kind: "insert"; offset: number; text: string }>,
  inputType: string,
  before: SwUndoCursorState,
  nextCaretOffset: number | undefined,
): SwUndoInsertGroup | undefined {
  if (
    inputType !== "insertText" ||
    nextCaretOffset !== change.offset + change.text.length ||
    before.mark !== undefined ||
    before.point.offset !== change.offset
  )
    return undefined;
  return getWriterTypingCharacterClass(change.text);
}

/** Applies SwUndoDelete::CanGrouping position and direction rules. @param change - Exact deletion. @param inputType - Native edit kind. @param before - Canonical cursor before input. @param nextCaretOffset - Native caret after input. @returns Direction and class when compatible. */
function getWriterDeleteGrouping(
  change: Readonly<{ kind: "delete"; end: number; start: number; text: string }>,
  inputType: string,
  before: SwUndoCursorState,
  nextCaretOffset: number | undefined,
): Readonly<{ direction: SwUndoDeleteDirection; group: SwUndoDeleteGroup }> | undefined {
  if (change.text.length !== 1 || before.mark !== undefined) return undefined;
  const group = /[\p{L}\p{N}]/u.test(change.text) ? "word" : "delimiter";
  if (
    inputType === "deleteContentBackward" &&
    before.point.offset === change.end &&
    nextCaretOffset === change.start
  )
    return { direction: "backspace", group };
  if (
    inputType === "deleteContentForward" &&
    before.point.offset === change.start &&
    nextCaretOffset === change.start
  )
    return { direction: "delete", group };
  return undefined;
}

/** Classifies one grouped edit as alphanumeric word or delimiter input. @param text - Non-empty changed text. @returns Shared class or undefined for mixed input. */
function getWriterTypingCharacterClass(text: string): "delimiter" | "word" | undefined {
  const characters = [...text];
  const firstCharacter = characters[0];
  /* c8 ignore next -- detected insertions and deletions always contain text. */
  if (firstCharacter === undefined) return undefined;
  const firstIsWord = /[\p{L}\p{N}]/u.test(firstCharacter);
  return characters.every(
    /** Compares one character class with the first changed character. @param character - Changed character. @returns Whether its class matches. */
    (character) => /[\p{L}\p{N}]/u.test(character) === firstIsWord,
  )
    ? firstIsWord
      ? "word"
      : "delimiter"
    : undefined;
}

/** Exposes the current shell history type for command-state tests without duplicating ownership. */
export type SwWrtShellHistory = SfxUndoManager<SwUndoRedoContext>;

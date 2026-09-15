/** @fileoverview Implements the persistent Writer editing shell and SwPaM ownership from pinned LibreOffice `sw/source/uibase/wrtsh/wrtsh1.cxx`. */

import {
  createCommandShell,
  type SfxShell,
} from "../../../../framework/source/dispatch/dispatchprovider";
import type { SfxUndoAction, SfxUndoManager } from "../../../../svl/source/undo/undo";
import { SwModify, subscribeToSwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwDoc as WriterDocument } from "../../core/doc/doc";
import type { WriterParagraphStyle } from "../../core/doc/fmtcol";
import type { WriterHyperlink } from "../../core/txtnode/fmtinfmt";
import type {
  SwTextNode as WriterParagraph,
  WriterCharacterAttributes,
  WriterCharacterFormat,
  WriterParagraphAlignment,
  WriterTextRun,
} from "../../core/txtnode/ndtxt";
import {
  createWriterTextRuns,
  DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  getWriterNextGraphemeBoundary,
  getWriterPreviousGraphemeBoundary,
  getWriterTextAttributesAtOffset,
  getWriterTextChange,
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
import { getActiveWriterParagraph } from "../uiview/viewfunc";
import { SwUndoInsert } from "../../core/undo/unins";
import {
  SwUndoDelete,
  SwUndoJoinParagraphs,
  SwUndoReplace,
  type SwUndoDeleteDirection,
} from "../../core/undo/undel";
import { SwUndoSplitNode } from "../../core/undo/unspnd";
import { CreateWriterFontUndo, SwUndoAttr, SwUndoParagraphFormat } from "../../core/undo/unattr";
import { SwUndoFormatColl } from "../../core/undo/unfmco";
import { SwUndoInsNum, SwUndoNumLevel } from "../../core/undo/unnum";
import type { WriterClipboardPaste, WriterClipboardPasteParagraph } from "../dochdl/swdtflvr";
import {
  CopyTextRangeRuns,
  CopyUndoRuns,
  GetUndoRunsLength,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "../../core/undo/undobj";
import {
  getWriterDeleteGrouping,
  getWriterInsertGroup,
  getWriterTypingCharacterClass,
} from "./delete";
import {
  areWriterCursorSelectionsEqual,
  createWriterCollapsedCursorState,
  createWriterRangeSelection,
  createWriterUndoCursorState,
  getWriterSelectedTextRange,
  isWriterCursorOffset,
  type WriterCompositionState,
  type WriterCursorSelection,
  type WriterParagraphTextRange,
} from "./wrtsh-selection";
import { createWriterHyperlinkAction, getWriterHyperlinkAtCursor } from "./wrtsh-hyperlink";

export type {
  WriterCursorPosition,
  WriterCursorSelection,
  WriterParagraphTextRange,
} from "./wrtsh-selection";

/** Persistent Writer editing shell over one document shell and one direction-preserving PaM. */
export class SwWrtShell extends SwModify {
  private activeParagraphId: string;
  private readonly commandShell: SfxShell;
  private composition: WriterCompositionState | undefined;
  private readonly cursor: SwPaM;
  private readonly docShellSubscription: () => void;
  private pendingCharacterAttributes: WriterCharacterAttributes = {
    ...DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  };
  private readonly undoContext: SwUndoRedoContext;
  /** Creates a shell at the end of the first Writer paragraph. @param docShell - Persistent owning document shell. @returns Nothing. */
  public constructor(private readonly docShell: SwDocShell) {
    super();
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
    this.docShellSubscription = docShell.Subscribe(
      /** Relays one document-shell hint into the editing shell. @param hint - Typed shell hint. @returns Nothing. */ (
        hint,
      ) => this.ReceiveDocShellHint(hint),
    );
  }
  /** Returns the persistent owning document shell. @returns SwDocShell. */
  public GetDocShell(): SwDocShell {
    return this.docShell;
  }
  /** Returns the current canonical Writer document. @returns Shell-owned SwDoc. */
  public GetDoc(): WriterDocument {
    this.docShell.EnsureOpen();
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
    this.docShell.EnsureOpen();
    return this.docShell.GetUndoManager().GetUndoActionCount() > 0;
  }

  /** Returns whether the shell-owned history can move forward. @returns True when Redo is enabled. */
  public CanRedo(): boolean {
    this.docShell.EnsureOpen();
    return this.docShell.GetUndoManager().GetRedoActionCount() > 0;
  }

  /** Subscribes to cursor and pending-attribute changes. @param listener - View invalidation callback. @returns Cleanup removing it. */
  public Subscribe(listener: (hint: SwModelHint) => void): () => void {
    return subscribeToSwModify(
      this,
      /** Forwards one editing-shell hint. @param _source - Editing shell. @param hint - Typed hint. @returns Nothing. */ (
        _source,
        hint,
      ) => listener(hint),
    );
  }

  /** Rebinds cursor state before propagating one document-shell hint. @param hint - Typed shell hint. @returns Nothing. */
  private ReceiveDocShellHint(hint: SwModelHint): void {
    this.RunNotificationTransaction(
      /** Rebinds and propagates one parent hint atomically. @returns Nothing. */ () => {
        if (
          hint.kind === "document-replaced" ||
          (hint.kind === "model-transaction" &&
            hint.hints.some(
              /** Detects a replacement inside a transaction. @param nested - Atomic hint. @returns Whether it replaces the model. */ (
                nested,
              ) => nested.kind === "document-replaced",
            ))
        )
          this.DocumentReplaced();
        if (hint.kind === "model-transaction")
          for (const nested of hint.hints) this.CallSwClientNotify(nested);
        else this.CallSwClientNotify(hint);
      },
    );
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
    this.NotifySelection();
  }

  /** Releases the persistent PaM and broadcaster registrations. @returns Nothing. */
  public Close(): void {
    this.docShellSubscription();
    this.cursor.Dispose();
    this.DisposeModify();
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
    this.NotifySelection();
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
      this.NotifySelection();
      return false;
    }
    const changed = this.InsertAtCursor(composition.text, false);
    /* v8 ignore next -- non-empty composition at a valid registered cursor always inserts. */
    if (!changed) this.NotifySelection();
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
      this.NotifySelection();
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
          paragraph,
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
          paragraph,
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
        paragraph,
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
      if (mark.GetNode() !== paragraph) {
        const manager = this.docShell.GetUndoManager();
        manager.EnterListAction("Replace");
        try {
          this.DeleteCrossParagraphSelection();
          return this.InsertAtCursor(text, false);
        } finally {
          manager.LeaveListAction();
        }
      }
      const start = Math.min(mark.GetContentIndex(), point.GetContentIndex());
      const end = Math.max(mark.GetContentIndex(), point.GetContentIndex());
      return this.ApplyAction(
        new SwUndoReplace(
          paragraph,
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
        paragraph,
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
      if (mark.GetNode() !== paragraph) return this.DeleteCrossParagraphSelection();
      const start = Math.min(mark.GetContentIndex(), point.GetContentIndex());
      const end = Math.max(mark.GetContentIndex(), point.GetContentIndex());
      if (start === end) return false;
      return this.ApplyAction(
        new SwUndoDelete(
          paragraph,
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
        paragraph,
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

  /** Deletes a canonical visible selection, including ranges spanning text nodes. @param selection - Optional browser-mapped selection to install first. @returns Whether content changed. */
  public DeleteSelection(selection?: WriterCursorSelection): boolean {
    if (selection !== undefined) this.SetSelection(selection);
    return this.cursor.HasMark() && this.DeleteAtCursor("delete");
  }

  /** Deletes a cross-node SwPaM as one Writer list action and joins the surviving boundary nodes. @returns Whether content changed. */
  private DeleteCrossParagraphSelection(): boolean {
    const point = this.cursor.GetPoint();
    const mark = this.cursor.GetMark();
    const document = this.GetDoc();
    const pointNode = point.GetNode() as WriterParagraph;
    const markNode = mark.GetNode() as WriterParagraph;
    const pointIndex = document.paragraphs.indexOf(pointNode);
    const markIndex = document.paragraphs.indexOf(markNode);
    const startsAtPoint = pointIndex < markIndex;
    const startNode = startsAtPoint ? pointNode : markNode;
    const endNode = startsAtPoint ? markNode : pointNode;
    const startOffset = startsAtPoint ? point.GetContentIndex() : mark.GetContentIndex();
    const endOffset = startsAtPoint ? mark.GetContentIndex() : point.GetContentIndex();
    const startIndex = Math.min(pointIndex, markIndex);
    const endIndex = Math.max(pointIndex, markIndex);
    const selectedIds = document.paragraphs
      .slice(startIndex, endIndex + 1)
      .map(
        /** Reads a selected paragraph's stable ID. @param selected - Selected paragraph. @returns Stable paragraph ID. */ (
          selected,
        ) => selected.id,
      );
    const manager = this.docShell.GetUndoManager();
    manager.EnterListAction("Delete");
    try {
      this.ReplaceRange(
        { end: startNode.Len(), paragraphId: startNode.id, start: startOffset },
        [],
      );
      for (const paragraphId of selectedIds.slice(1, -1)) {
        const selected = document.nodes.findTextNode(paragraphId) as WriterParagraph;
        this.ReplaceRange({ end: selected.Len(), paragraphId, start: 0 }, []);
      }
      this.ReplaceRange({ end: endOffset, paragraphId: endNode.id, start: 0 }, []);
      for (const paragraphId of selectedIds.slice(1)) this.MergeParagraphWithPrevious(paragraphId);
    } finally {
      manager.LeaveListAction();
    }
    this.SetCursor(startNode.id, startOffset);
    return true;
  }

  /** Splits the paragraph at the persistent caret, first replacing a bounded same-node selection when present. @returns Whether a paragraph break was inserted. */
  private SplitAtCursor(): boolean {
    const mark = this.cursor.HasMark() ? this.cursor.GetMark() : undefined;
    if (mark !== undefined) {
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
        paragraph,
        range.start,
        removedRuns,
        insertedRuns,
        insertedRuns.length === 0 ? "Delete" : "Paste",
        this.CaptureCursorState(),
        this.CreateCollapsedCursorState(paragraph.id, nextOffset),
      ),
    );
  }

  /** Pastes one safe transfer document at a canonical caret or selection as a single Writer undo transaction. @param target - Cursor selection or legacy same-paragraph range. @param paste - Parsed clipboard paragraphs and list metadata. @returns Whether document content or paragraph formatting changed. */
  public Paste(
    target: WriterCursorSelection | WriterParagraphTextRange,
    paste: WriterClipboardPaste,
  ): boolean {
    const first = paste.paragraphs[0];
    if (first === undefined) return false;
    const manager = this.docShell.GetUndoManager();
    let changed = false;
    manager.EnterListAction("Paste");
    try {
      if ("paragraphId" in target)
        this.SetSelection({
          ...(target.start === target.end
            ? {}
            : { mark: { offset: target.start, paragraphId: target.paragraphId } }),
          point: { offset: target.end, paragraphId: target.paragraphId },
        });
      else this.SetSelection(target);
      if (this.cursor.HasMark()) {
        this.DeleteAtCursor("delete");
        changed = true;
      }
      const insertionPoint = this.cursor.GetPoint();
      const range: WriterParagraphTextRange = {
        end: insertionPoint.GetContentIndex(),
        paragraphId: (insertionPoint.GetNode() as WriterParagraph).id,
        start: insertionPoint.GetContentIndex(),
      };
      changed = this.ReplaceRange(range, first.runs) || changed;
      let paragraphId = range.paragraphId;
      let offset = range.start + GetUndoRunsLength(first.runs);
      this.SetCursor(paragraphId, offset);
      if (paste.isBlock) changed = this.ApplyPastedParagraphList(first) || changed;
      for (const paragraph of paste.paragraphs.slice(1)) {
        paragraphId = this.SplitParagraph(paragraphId, offset);
        changed = true;
        changed = this.ReplaceRange({ end: 0, paragraphId, start: 0 }, paragraph.runs) || changed;
        offset = GetUndoRunsLength(paragraph.runs);
        this.SetCursor(paragraphId, offset);
        changed = this.ApplyPastedParagraphList(paragraph) || changed;
      }
    } finally {
      manager.LeaveListAction();
    }
    return changed;
  }

  /** Splits one paragraph at the logical caret. @param paragraphId - Source paragraph. @param offset - Split offset. @returns New paragraph identity. */
  public SplitParagraph(paragraphId: string, offset: number): string {
    const document = this.GetDoc();
    const paragraph = document.nodes.findTextNode(paragraphId);
    if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
    if (!Number.isInteger(offset) || offset < 0 || offset > paragraph.Len())
      throw new Error("Split offset is outside the paragraph.");
    this.ApplyAction(
      new SwUndoSplitNode(
        paragraph,
        offset,
        this.CaptureCursorState(),
        this.CreateCollapsedCursorState(paragraph.id, 0),
      ),
    );
    return this.GetActiveParagraph().id;
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
        preceding,
        offset,
        removed,
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
    const range = getWriterSelectedTextRange(this.GetCursorSelection());
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
      const currentRange = getWriterSelectedTextRange(this.GetCursorSelection());
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
    const selectedRange = getWriterSelectedTextRange(this.GetCursorSelection());
    this.pendingCharacterAttributes = {
      ...this.pendingCharacterAttributes,
      [format]: this.GetCharacterFormatState(format) !== "on",
    };
    if (selectedRange === undefined) {
      if (this.cursor.HasMark()) {
        this.NotifySelection();
        return false;
      }
      this.docShell.GetUndoManager().BreakUndoGrouping();
      this.NotifySelection();
      return false;
    }
    const paragraph = this.GetDoc().nodes.findTextNode(selectedRange.paragraphId);
    /* v8 ignore next -- A canonical same-node selection retains its indexed SwTextNode. */
    if (paragraph === undefined) throw new Error(`Unknown paragraph: ${selectedRange.paragraphId}`);
    const beforeRuns = CopyTextRangeRuns(paragraph, selectedRange.start, selectedRange.end);
    /* v8 ignore next 3 -- A validated non-empty text range always copies at least one run. */
    if (beforeRuns.length === 0) {
      this.NotifySelection();
      return false;
    }
    const afterRuns = toggleWriterTextRangeFormat(
      beforeRuns,
      0,
      GetUndoRunsLength(beforeRuns),
      format,
    );
    return this.ApplyAction(
      new SwUndoAttr(paragraph, selectedRange.start, beforeRuns, afterRuns, before, before),
    );
  }

  /** Reads one uniform selected or caret hyperlink for dialog editing. @returns Hyperlink metadata or undefined. */
  public GetHyperlinkAtCursor(): WriterHyperlink | undefined {
    return getWriterHyperlinkAtCursor(this.GetDoc(), this.GetCursorSelection());
  }

  /** Applies or removes a hyperlink using the persistent Writer selection. @param hyperlink - Replacement metadata or undefined. @param text - Text inserted for a collapsed caret. @param range - Optional DOM-resolved range. @returns Whether the document changed. */
  public SetHyperlink(
    hyperlink: WriterHyperlink | undefined,
    text?: string,
    range?: WriterParagraphTextRange,
  ): boolean {
    if (range !== undefined && !this.SetSelection(createWriterRangeSelection(range))) return false;
    const action = createWriterHyperlinkAction(
      this.GetDoc(),
      this.GetCursorSelection(),
      this.pendingCharacterAttributes,
      this.CaptureCursorState(),
      hyperlink,
      text,
    );
    return action === undefined ? false : this.ApplyAction(action);
  }

  /** Applies a font family. @param fontFamily - Selected family. @returns Whether document content changed. */
  public SetFontFamily(fontFamily: string): boolean {
    const family = fontFamily.trim();
    if (family.length === 0) throw new Error("Writer font family must not be blank.");
    const before = this.CaptureCursorState();
    const selectedRange = getWriterSelectedTextRange(this.GetCursorSelection());
    this.pendingCharacterAttributes = { ...this.pendingCharacterAttributes, fontFamily: family };
    if (selectedRange === undefined) {
      this.docShell.GetUndoManager().BreakUndoGrouping();
      this.NotifySelection();
      return false;
    }
    const paragraph = this.GetDoc().nodes.findTextNode(selectedRange.paragraphId);
    /* v8 ignore next -- SetSelection validates paragraph identity before it becomes active. */
    if (paragraph === undefined) throw new Error(`Unknown paragraph: ${selectedRange.paragraphId}`);
    const action = CreateWriterFontUndo(
      paragraph,
      selectedRange.start,
      selectedRange.end,
      family,
      before,
      this.CaptureCursorState(),
    );
    return action === undefined ? false : this.ApplyAction(action);
  }

  /** Applies paragraph alignment through one shell-owned history transition. @param alignment - Next alignment. @returns Whether content changed. */
  public SetParagraphAlignment(alignment: WriterParagraphAlignment): boolean {
    const paragraph = this.GetActiveParagraph();
    if (paragraph.alignment === alignment) return false;
    const cursor = this.CaptureCursorState();
    return this.ApplyAction(
      new SwUndoParagraphFormat(paragraph, paragraph.alignment, alignment, cursor, cursor),
    );
  }

  /** Applies a paragraph style through one shell-owned history transition. @param style - Next style. @returns Whether content changed. */
  public SetParagraphStyle(style: WriterParagraphStyle): boolean {
    const paragraph = this.GetActiveParagraph();
    if (paragraph.style === style) return false;
    const cursor = this.CaptureCursorState();
    return this.ApplyAction(
      new SwUndoFormatColl(paragraph, paragraph.style, style, cursor, cursor),
    );
  }

  /** Applies or removes the active paragraph's default list. @param kind - Next list kind. @returns Whether content changed. */
  public SetParagraphListKind(kind: WriterParagraphListKind): boolean {
    if (!isWriterParagraphListKind(kind))
      throw new Error(`Unsupported Writer paragraph list kind: ${kind}`);
    const paragraph = this.GetActiveParagraph();
    if (paragraph.list.kind === kind) return false;
    const cursor = this.CaptureCursorState();
    const before = paragraph.CaptureParagraphListState();
    return this.ApplyAction(
      new SwUndoInsNum(paragraph, before, { ...paragraph.list, kind }, cursor, cursor),
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
    const before = paragraph.CaptureParagraphListState();
    return this.ApplyAction(
      new SwUndoNumLevel(paragraph, before, { ...before, level }, cursor, cursor),
    );
  }

  /** Applies one clipboard paragraph's complete bounded list tuple through Writer numbering undo. @param paragraph - Parsed clipboard paragraph. @returns Whether list metadata changed. */
  private ApplyPastedParagraphList(paragraph: WriterClipboardPasteParagraph): boolean {
    const target = this.GetActiveParagraph();
    const nextList = { kind: paragraph.listKind, level: paragraph.listLevel } as const;
    if (target.list.kind === nextList.kind && target.list.level === nextList.level) return false;
    const cursor = this.CaptureCursorState();
    return this.ApplyAction(
      new SwUndoInsNum(target, target.CaptureParagraphListState(), nextList, cursor, cursor),
    );
  }

  /** Restores the preceding Writer history state. @returns Whether navigation occurred. */
  public Undo(): boolean {
    return this.NavigateHistory(
      /** Runs shell Undo. @returns Whether navigation occurred. */ () =>
        this.docShell.Undo(this.undoContext),
    );
  }

  /** Restores the following Writer history state. @returns Whether navigation occurred. */
  public Redo(): boolean {
    return this.NavigateHistory(
      /** Runs shell Redo. @returns Whether navigation occurred. */ () =>
        this.docShell.Redo(this.undoContext),
    );
  }

  /** Executes one semantic action and publishes cursor-state invalidation. @param action - Reversible Writer action. @param tryMerge - Whether adjacent typing/deletion grouping is allowed. @returns True after successful execution. */
  private ApplyAction(action: SfxUndoAction<SwUndoRedoContext>, tryMerge = false): boolean {
    return this.RunNotificationTransaction(
      /** Aggregates model, lifecycle, and cursor changes. @returns True after execution. */ () => {
        this.docShell.ApplyUndoAction(action, this.undoContext, tryMerge);
        this.NotifySelection();
        return true;
      },
    );
  }

  /** Runs one history navigation as one editing-shell notification transaction. @param navigate - Undo or Redo callback. @returns Whether navigation occurred. */
  private NavigateHistory(navigate: () => boolean): boolean {
    return this.RunNotificationTransaction(
      /** Adds cursor invalidation to the parent transaction. @returns Whether navigation occurred. */ () => {
        const changed = navigate();
        if (changed) this.NotifySelection();
        return changed;
      },
    );
  }

  /** Captures point, mark direction, active paragraph, and pending attributes for one action boundary. @returns Complete cursor state. */
  private CaptureCursorState(): SwUndoCursorState {
    const point = this.cursor.GetPoint();
    const mark = this.cursor.HasMark() ? this.cursor.GetMark() : undefined;
    return createWriterUndoCursorState(
      point.GetNode() as WriterParagraph,
      point.GetContentIndex(),
      mark?.GetNode() as WriterParagraph | undefined,
      mark?.GetContentIndex(),
      this.GetActiveParagraph(),
      this.pendingCharacterAttributes,
    );
  }

  /** Creates a collapsed action endpoint while retaining pending direct attributes. @param paragraphId - Target node identity. @param offset - Target content offset. @returns Complete cursor state. */
  private CreateCollapsedCursorState(paragraphId: string, offset: number): SwUndoCursorState {
    const paragraph = this.GetDoc().nodes.findTextNode(paragraphId);
    if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
    return createWriterCollapsedCursorState(paragraph, offset, this.pendingCharacterAttributes);
  }

  /** Restores action-owned cursor state against the current mutable SwDoc graph. @param state - Stored cursor boundary. @returns Nothing. */
  private RestoreCursorState(state: SwUndoCursorState): void {
    const document = this.GetDoc();
    const pointNode =
      state.point.node.GetDoc() === document
        ? state.point.node
        : (document.paragraphs[0] as WriterParagraph);
    const point = new SwPosition(pointNode, Math.min(state.point.offset, pointNode.Len()));
    const markNode = state.mark?.node.GetDoc() === document ? state.mark.node : undefined;
    const mark =
      state.mark === undefined || markNode === undefined
        ? undefined
        : new SwPosition(markNode, Math.min(state.mark.offset, markNode.Len()));
    this.activeParagraphId =
      state.activeParagraph.GetDoc() === document ? state.activeParagraph.id : pointNode.id;
    this.pendingCharacterAttributes = { ...state.pendingCharacterAttributes };
    this.cursor.Assign(point, mark);
  }

  /** Mutates the existing PaM identity to a collapsed model position. @param paragraph - Target node. @param offset - UTF-16 content offset. @returns Nothing. */
  private AssignCursor(paragraph: WriterParagraph, offset: number): void {
    this.cursor.Assign(new SwPosition(paragraph, offset));
  }

  /** Publishes shell-local selection state invalidation. @returns Nothing. */
  private NotifySelection(): void {
    this.CallSwClientNotify({ kind: "cursor-selection-changed" });
  }
}

/** Exposes the current shell history type for command-state tests without duplicating ownership. */
export type SwWrtShellHistory = SfxUndoManager<SwUndoRedoContext>;

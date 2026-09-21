/** @fileoverview Implements the persistent Writer editing shell and SwPaM ownership from pinned LibreOffice `sw/source/uibase/wrtsh/wrtsh1.cxx`. */

import type { SfxShell } from "../../../../sfx2/source/control/dispatch";
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
} from "../../core/txtnode/ndtxt";
import {
  getWriterNextGraphemeBoundary,
  getWriterPreviousGraphemeBoundary,
} from "../../core/txtnode/ndtxt";
import {
  DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  copyWriterTextRangeRuns,
  createWriterTextFragment,
  getWriterTextFromRuns,
  normalizeWriterTextRuns,
  type WriterTextRun,
} from "../../core/txtnode/text-run-projection";
import type { WriterParagraphListKind } from "../../core/doc/list";
import { SwListShell, type WriterListLevelCommand } from "../shells/listsh";
import { SwTextShell } from "../shells/textsh";
import type { SwDocShell } from "../app/docsh";
import { SwUndoInsert } from "../../core/undo/unins";
import {
  SwUndoDelete,
  SwUndoJoinParagraphs,
  SwUndoReplace,
  type SwUndoDeleteDirection,
} from "../../core/undo/undel";
import { SwUndoSplitNode } from "../../core/undo/unspnd";
import { SwUndoInsNum } from "../../core/undo/unnum";
import { SwTransferable } from "../dochdl/swdtflvr";
import type {
  WriterClipboardPaste,
  WriterClipboardPasteParagraph,
} from "../../filter/html/html-filter-types";
import type { SwUndoCursorState, SwUndoRedoContext } from "../../core/undo/undobj";
import { getWriterTypingCharacterClass } from "./delete";
import {
  createWriterCollapsedCursorState,
  createWriterUndoCursorState,
  type WriterCompositionState,
  type WriterTextRange,
} from "./wrtsh-selection";
import { RES_CHRATR_FONT } from "../../../inc/hintids";
import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import { WriterDialogController } from "../dialog/writer-dialog-controller";
import { pasteWriterTransfer } from "./wrtsh-paste";

/** Persistent Writer editing shell over one document shell and one direction-preserving PaM. */
export class SwWrtShell extends SwModify {
  private activeParagraph: WriterParagraph;
  private readonly textShell: SwTextShell;
  private composition: WriterCompositionState | undefined;
  private readonly cursor: SwPaM;
  private readonly docShellSubscription: () => void;
  private readonly listShell: SwListShell;
  private pendingCharacterAttributes: WriterCharacterAttributes = {
    ...DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  };
  private readonly undoContext: SwUndoRedoContext;
  /** Creates a shell at the end of the first Writer paragraph. @param docShell - Persistent owning document shell. @param dialogController - Writer dialog lifecycle controller. @returns Nothing. */
  public constructor(
    private readonly docShell: SwDocShell,
    dialogController: WriterDialogController = new WriterDialogController(),
  ) {
    super();
    const paragraph = docShell.GetDoc().paragraphs[0] as WriterParagraph;
    this.activeParagraph = paragraph;
    this.cursor = new SwPaM(new SwPosition(paragraph, paragraph.text.length));
    this.pendingCharacterAttributes = paragraph.getCharacterAttributesAt(paragraph.text.length);
    this.undoContext = {
      GetDoc: /** Returns the shell's current SwDoc. @returns Active document. */ () =>
        this.docShell.GetDoc(),
      RestoreCursor:
        /** Restores one action cursor boundary. @param state - Stored state. @returns Nothing. */ (
          state,
        ) => this.RestoreCursorState(state),
    };
    this.textShell = new SwTextShell(this, dialogController);
    this.listShell = new SwListShell(this);
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
  /** Creates a model-based transfer object over the current persistent selection. @returns Transfer object. */
  public CreateTransferable(): SwTransferable {
    return new SwTransferable(this.GetDoc(), this.cursor);
  }
  /** Returns the Writer editing command shell for top-priority frame registration. @returns SfxShell adapter. */
  public GetCommandShell(): SfxShell {
    return this.textShell.GetShell();
  }
  /** Returns the context shell that owns list toolbar execution and state. @returns Active list shell. */
  public GetListShell(): SwListShell {
    return this.listShell;
  }
  /** Returns the active document-owned paragraph. @returns Active text node. */
  public GetActiveParagraph(): WriterParagraph {
    return this.activeParagraph;
  }
  /** Returns pending direct attributes for a collapsed caret. @returns Copied attribute state. */
  public GetPendingCharacterAttributes(): WriterCharacterAttributes {
    return { ...this.pendingCharacterAttributes };
  }
  /** Replaces pending direct attributes on behalf of the active text shell. @param attributes - Next caret attributes. @returns Nothing. */
  public SetPendingCharacterAttributes(attributes: WriterCharacterAttributes): void {
    this.pendingCharacterAttributes = { ...attributes };
  }
  /** Publishes a cursor/attribute state change owned by a child context shell. @returns Nothing. */
  public NotifySelectionChanged(): void {
    this.NotifySelection();
  }
  /** Returns the locale/device-resolved Western text default. @returns Font family. */
  public GetDefaultFontFamily(): string {
    return (
      this.GetDoc().GetAttrPool().GetUserOrPoolDefaultItem(RES_CHRATR_FONT) as SvxFontItem
    ).GetFamilyName();
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
    this.activeParagraph = paragraph;
    this.composition = undefined;
    this.pendingCharacterAttributes = paragraph.getCharacterAttributesAt(paragraph.text.length);
    this.AssignCursor(paragraph, paragraph.text.length);
    this.NotifySelection();
  }
  /** Releases the persistent PaM and broadcaster registrations. @returns Nothing. */
  public Close(): void {
    this.docShellSubscription();
    this.cursor.Dispose();
    this.DisposeModify();
  }
  /** Collapses the persistent cursor to one canonical Writer position. @param position - Document-owned node/content position. @returns Whether the cursor changed. */
  public SetCursor(position: SwPosition): boolean {
    return this.SetPaM(position);
  }
  /** Assigns canonical Writer positions to the persistent PaM. @param point - Moving endpoint. @param mark - Optional fixed endpoint. @returns Whether the cursor changed. */
  public SetPaM(point: SwPosition, mark?: SwPosition): boolean {
    const pointNode = point.GetNode() as WriterParagraph;
    const markNode = mark?.GetNode() as WriterParagraph | undefined;
    if (
      pointNode.GetDoc() !== this.GetDoc() ||
      (markNode !== undefined && markNode.GetDoc() !== this.GetDoc())
    )
      return false;
    const currentPoint = this.cursor.GetPoint();
    const currentMark = this.cursor.HasMark() ? this.cursor.GetMark() : undefined;
    if (
      currentPoint.GetNode() === pointNode &&
      currentPoint.GetContentIndex() === point.GetContentIndex() &&
      currentMark?.GetNode() === markNode &&
      currentMark?.GetContentIndex() === mark?.GetContentIndex()
    )
      return false;
    this.activeParagraph = pointNode;
    this.pendingCharacterAttributes = pointNode.getCharacterAttributesAt(point.GetContentIndex());
    this.docShell.GetUndoManager().BreakUndoGrouping();
    this.cursor.Assign(point, mark);
    this.NotifySelection();
    return true;
  }
  /** Focuses a canonical text node without accepting a UI key. @param paragraph - Document-owned node. @returns Nothing. */
  public FocusNode(paragraph: WriterParagraph): void {
    if (paragraph.GetDoc() !== this.GetDoc()) return;
    if (this.cursor.GetPoint().GetNode() === paragraph) {
      this.activeParagraph = paragraph;
      return;
    }
    this.SetPaM(new SwPosition(paragraph, paragraph.Len()));
  }
  /** Selects the complete current Writer body through the persistent shell cursor. @returns Nothing. */
  public SelectAll(): void {
    const document = this.GetDoc();
    const first = document.paragraphs[0] as WriterParagraph;
    const last = document.paragraphs[document.paragraphs.length - 1] as WriterParagraph;
    this.SetPaM(new SwPosition(last, last.Len()), new SwPosition(first, 0));
  }
  /** Pastes at the current canonical PaM without a projected string selection. @param paste - Parsed clipboard content. @returns Whether content changed. */
  public PasteAtCursor(paste: WriterClipboardPaste): boolean {
    return this.Paste(paste);
  }

  /** Inserts text at the persistent Writer cursor, matching the bounded SwWrtShell insertion boundary. @param text - Text to insert or replace the selection with. @returns Whether the document changed. */
  public Insert(text: string): boolean {
    return text.length > 0 && this.InsertAtCursor(text, true);
  }

  /** Replaces the current Writer selection without joining ordinary typing undo groups. @param text - Replacement text. @returns Whether content changed. */
  public Replace(text: string): boolean {
    return text.length > 0 && this.InsertAtCursor(text, false);
  }

  /** Inserts a paragraph break at the persistent Writer cursor. @returns Whether a break was inserted. */
  public SplitNode(): boolean {
    return this.SplitAtCursor();
  }

  /** Deletes the preceding grapheme or the current selection. @returns Whether content changed. */
  public DelLeft(): boolean {
    return this.DeleteAtCursor("backspace");
  }

  /** Deletes the following grapheme or the current selection. @returns Whether content changed. */
  public DelRight(): boolean {
    return this.DeleteAtCursor("delete");
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
          paragraph.CaptureTextFragment(start, end),
          paragraph.CreateTextFragmentFromText(text, this.pendingCharacterAttributes),
          "Replace",
          before,
          this.CreateCollapsedCursorState(paragraph, start + text.length),
        ),
      );
    }
    const offset = point.GetContentIndex();
    const group = allowGrouping ? getWriterTypingCharacterClass(text) : undefined;
    return this.ApplyAction(
      new SwUndoInsert(
        paragraph,
        offset,
        paragraph.CreateTextFragmentFromText(text, this.pendingCharacterAttributes),
        group,
        before,
        this.CreateCollapsedCursorState(paragraph, offset + text.length),
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
          paragraph.CaptureTextFragment(start, end),
          direction,
          undefined,
          before,
          this.CreateCollapsedCursorState(paragraph, start),
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
        paragraph.CaptureTextFragment(start, end),
        direction,
        group,
        before,
        this.CreateCollapsedCursorState(paragraph, start),
      ),
      group !== undefined,
    );
  }

  /** Deletes the canonical visible selection, including ranges spanning text nodes. @returns Whether content changed. */
  public DeleteSelection(): boolean {
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
    const selectedNodes = document.paragraphs.slice(startIndex, endIndex + 1);
    const manager = this.docShell.GetUndoManager();
    manager.EnterListAction("Delete");
    try {
      this.ReplaceRange({ end: startNode.Len(), node: startNode, start: startOffset }, []);
      for (const selected of selectedNodes.slice(1, -1))
        this.ReplaceRange({ end: selected.Len(), node: selected, start: 0 }, []);
      this.ReplaceRange({ end: endOffset, node: endNode, start: 0 }, []);
      for (const selected of selectedNodes.slice(1)) this.MergeParagraphWithPrevious(selected);
    } finally {
      manager.LeaveListAction();
    }
    this.SetCursor(new SwPosition(startNode, startOffset));
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
        this.SplitParagraph(nextPoint);
      } finally {
        manager.LeaveListAction();
      }
      return true;
    }
    const point = this.cursor.GetPoint();
    this.SplitParagraph(point);
    return true;
  }

  /** Replaces one same-paragraph range with Writer text runs. @param range - Target range. @param runs - Inserted safe runs. @returns Whether document content changed. */
  public ReplaceRange(range: WriterTextRange, runs: readonly WriterTextRun[]): boolean {
    const paragraph = range.node;
    if (paragraph.GetDoc() !== this.GetDoc()) throw new Error("Writer text range is foreign.");
    if (
      !Number.isInteger(range.start) ||
      !Number.isInteger(range.end) ||
      range.start < 0 ||
      range.end < range.start ||
      range.end > paragraph.Len()
    )
      throw new Error("Writer text range is outside the paragraph.");
    const removedRuns = copyWriterTextRangeRuns(paragraph, range.start, range.end);
    const insertedRuns = normalizeWriterTextRuns(runs);
    if (JSON.stringify(removedRuns) === JSON.stringify(insertedRuns)) return false;
    const insertionLength = getWriterTextFromRuns(insertedRuns).length;
    const nextOffset = range.start + insertionLength;
    return this.ApplyAction(
      new SwUndoReplace(
        paragraph,
        range.start,
        paragraph.CaptureTextFragment(range.start, range.end),
        createWriterTextFragment(paragraph, insertedRuns),
        insertedRuns.length === 0 ? "Delete" : "Paste",
        this.CaptureCursorState(),
        this.CreateCollapsedCursorState(paragraph, nextOffset),
      ),
    );
  }

  /** Pastes one safe transfer document at the persistent SwPaM as a single Writer undo transaction. @param paste - Parsed clipboard paragraphs and list metadata. @returns Whether document content or paragraph formatting changed. */
  public Paste(paste: WriterClipboardPaste): boolean {
    const manager = this.docShell.GetUndoManager();
    return pasteWriterTransfer(paste, {
      /** Applies imported list metadata. @param paragraph - Parsed paragraph. @returns Whether list state changed. */
      applyParagraphList: (paragraph) => this.ApplyPastedParagraphList(paragraph),
      /** Opens the compound undo action. @returns Nothing. */
      beginUndoGroup: () => manager.EnterListAction("Paste"),
      /** Removes the current selection. @returns Nothing. */
      deleteSelection: () => {
        this.DeleteAtCursor("delete");
      },
      /** Closes the compound undo action. @returns Nothing. */
      endUndoGroup: () => manager.LeaveListAction(),
      /** Reads the current insertion point. @returns Canonical point. */
      getInsertionPoint: () => this.cursor.GetPoint(),
      /** Reports current mark state. @returns Whether selected. */
      hasSelection: () => this.cursor.HasMark(),
      /** Replaces one paragraph range. @param range - Target range. @param runs - Sanitized runs. @returns Whether changed. */
      replaceRange: (range, runs) => this.ReplaceRange(range, runs),
      /** Moves the persistent cursor. @param position - Canonical position. @returns Nothing. */
      setCursor: (position) => this.SetCursor(position),
      /** Splits one paragraph. @param position - Split point. @returns Trailing paragraph. */
      splitParagraph: (position) => this.SplitParagraph(position),
    });
  }

  /** Splits one paragraph at a canonical Writer position. @param position - Source node and content offset. @returns New trailing paragraph. */
  public SplitParagraph(position: SwPosition): WriterParagraph {
    const paragraph = position.GetNode() as WriterParagraph;
    const offset = position.GetContentIndex();
    if (paragraph.GetDoc() !== this.GetDoc()) throw new Error("Writer split position is foreign.");
    /* v8 ignore next 2 -- SwPosition validates the same node bounds before this shell method. */
    if (!Number.isInteger(offset) || offset < 0 || offset > paragraph.Len())
      throw new Error("Split offset is outside the paragraph.");
    this.ApplyAction(
      new SwUndoSplitNode(
        paragraph,
        offset,
        this.CaptureCursorState(),
        this.CreateCollapsedCursorState(paragraph, 0),
      ),
    );
    return this.GetActiveParagraph();
  }

  /** Joins a non-first paragraph into its preceding node. @param paragraph - Paragraph whose preceding break is removed. @returns Whether a merge occurred. */
  public MergeParagraphWithPrevious(paragraph: WriterParagraph): boolean {
    const document = this.GetDoc();
    const index = document.paragraphs.indexOf(paragraph);
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
        this.CreateCollapsedCursorState(preceding, offset),
      ),
    );
  }

  /** Joins the following paragraph into the selected node. @param paragraph - Paragraph whose following break is removed. @returns Whether a merge occurred. */
  public MergeParagraphWithNext(paragraph: WriterParagraph): boolean {
    const document = this.GetDoc();
    const index = document.paragraphs.indexOf(paragraph);
    if (index < 0 || index === document.paragraphs.length - 1) return false;
    return this.MergeParagraphWithPrevious(document.paragraphs[index + 1] as WriterParagraph);
  }

  /** Toggles direct character formatting over a range or pending caret state. @param format - Writer character format. @param range - Optional same-paragraph selection. @returns Whether document content changed. */
  public ToggleCharacterFormat(format: WriterCharacterFormat, range?: WriterTextRange): boolean {
    return this.textShell.ToggleCharacterFormat(format, range);
  }

  /** Reads one uniform selected or caret hyperlink for dialog editing. @returns Hyperlink metadata or undefined. */
  public GetHyperlinkAtCursor(): WriterHyperlink | undefined {
    return this.textShell.GetHyperlinkAtCursor();
  }

  /** Applies or removes a hyperlink using the persistent Writer selection. @param hyperlink - Replacement metadata or undefined. @param text - Text inserted for a collapsed caret. @param range - Optional DOM-resolved range. @returns Whether the document changed. */
  public SetHyperlink(
    hyperlink: WriterHyperlink | undefined,
    text?: string,
    range?: WriterTextRange,
  ): boolean {
    return this.textShell.SetHyperlink(hyperlink, text, range);
  }

  /** Applies a font family. @param fontFamily - Selected family. @returns Whether document content changed. */
  public SetFontFamily(fontFamily: string): boolean {
    return this.textShell.SetFontFamily(fontFamily);
  }

  /** Applies paragraph alignment through one shell-owned history transition. @param alignment - Next alignment. @returns Whether content changed. */
  public SetParagraphAlignment(alignment: WriterParagraphAlignment): boolean {
    return this.textShell.SetParagraphAlignment(alignment);
  }

  /** Applies a paragraph style through one shell-owned history transition. @param style - Next style. @returns Whether content changed. */
  public SetParagraphStyle(style: WriterParagraphStyle): boolean {
    return this.textShell.SetParagraphStyle(style);
  }

  /** Applies or removes the active paragraph's default list. @param kind - Next list kind. @returns Whether content changed. */
  public SetParagraphListKind(kind: WriterParagraphListKind): boolean {
    return this.listShell.SetParagraphListKind(kind);
  }

  /** Promotes or demotes the active list paragraph. @param command - Level transition. @returns Whether content changed. */
  public ChangeParagraphListLevel(command: WriterListLevelCommand): boolean {
    return this.listShell.Execute(command);
  }

  /** Executes the text-shell indent command: list levels for list items and a direct left margin otherwise. @param increase - Whether to increase indentation. @returns Whether content changed. */
  public ChangeParagraphIndent(increase: boolean): boolean {
    return this.textShell.ChangeParagraphIndent(increase);
  }

  /** Reports whether the text-shell indent command has an available transition. @param increase - Whether to increase indentation. @returns Whether enabled. */
  public CanChangeParagraphIndent(increase: boolean): boolean {
    return this.textShell.CanChangeParagraphIndent(increase);
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
  public ApplyAction(action: SfxUndoAction<SwUndoRedoContext>, tryMerge = false): boolean {
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
  public CaptureCursorState(): SwUndoCursorState {
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

  /** Creates a collapsed action endpoint while retaining pending direct attributes. @param paragraph - Target node. @param offset - Target content offset. @returns Complete cursor state. */
  private CreateCollapsedCursorState(
    paragraph: WriterParagraph,
    offset: number,
  ): SwUndoCursorState {
    if (paragraph.GetDoc() !== this.GetDoc()) throw new Error("Writer cursor node is foreign.");
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
    this.activeParagraph =
      state.activeParagraph.GetDoc() === document ? state.activeParagraph : pointNode;
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

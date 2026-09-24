/** @fileoverview Implements the persistent Writer editing shell and SwPaM ownership from pinned LibreOffice `sw/source/uibase/wrtsh/wrtsh1.cxx`. */

import type { SfxShell } from "../../../../sfx2/source/control/dispatch";
import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwModify, subscribeToSwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
import { SwPaM, SwPosition, type WriterTextRange } from "../../core/crsr/pam";
import type { SwDoc as WriterDocument } from "../../core/doc/doc";
import type { SwLineNumberInfo } from "../../../inc/lineinfo";
import type { WriterParagraphStyle } from "../../core/doc/fmtcol";
import type { WriterHyperlink } from "../../core/txtnode/fmtatr2";
import type {
  SwTextFragment,
  SwTextNode as WriterParagraph,
  WriterCharacterFormat,
  WriterParagraphAlignment,
} from "../../core/txtnode/ndtxt";
import type { WriterParagraphListKind } from "../../core/doc/list";
import { SwListShell } from "../shells/listsh";
import type { WriterListLevelCommand } from "../../core/edit/ednumber";
import { SwTextShell, type WriterParagraphFormatValue } from "../shells/textsh1";
import { SvxTabStop, SvxTabStopItem } from "../../../../editeng/source/items/paraitem";
import type { SwDocShell } from "../app/docsh";
import { SwTransferable } from "../dochdl/swdtflvr";
import {
  createWriterCollapsedCursorState,
  createWriterUndoCursorState,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "../../core/undo/undobj";
import type { UndoManager } from "../../core/undo/docundo";
import { RES_CHRATR_FONT, RES_CHRATR_FONTSIZE, RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { SvxFontHeightItem, SvxFontItem } from "../../../../editeng/source/items/textitem";
import { WriterDialogController } from "../dialog/writer-dialog-controller";
import { SwWrtShellEditingOperations } from "./wrtsh-editing";
import { createMoveLeftMarginAction, isMoveLeftMargin } from "../../core/edit/edattr";
import type { WriterPasteDocument } from "../dochdl/swdtflvr";
import type { WriterPageDescriptorValue } from "../../core/layout/pagedesc";
import { equalWriterPageDescriptors } from "../../core/layout/pagedesc";
import {
  SwUndoPageDesc,
  SwUndoRulerIndent,
  type WriterParagraphIndentValue,
} from "../../core/undo/SwUndoPageDesc";

/** Shell-owned temporary extended-text-input state corresponding to LibreOffice SwExtTextInput. */
interface WriterCompositionState {
  /** Cursor or selection replaced when the composition is committed. */
  readonly cursor: SwUndoCursorState;
  /** Latest browser composition text, not yet written into SwDoc. */
  text: string;
}

/** Persistent Writer editing shell over one document shell and one direction-preserving PaM. */
export class SwWrtShell extends SwModify {
  private activeParagraph: WriterParagraph;
  private readonly textShell: SwTextShell;
  private composition: WriterCompositionState | undefined;
  private readonly cursor: SwPaM;
  private readonly docShellSubscription: () => void;
  private readonly editing: SwWrtShellEditingOperations;
  private readonly listShell: SwListShell;
  private pendingCharacterItems: SfxItemSet;
  private readonly undoContext: SwUndoRedoContext;
  /** Creates a shell at the end of the first Writer paragraph. @param docShell - Persistent owning document shell. @param dialogController - Writer dialog lifecycle controller. @returns Nothing. */
  public constructor(
    private readonly docShell: SwDocShell,
    dialogController: WriterDialogController = new WriterDialogController(),
  ) {
    super();
    const paragraph = docShell.GetDoc().paragraphs[0] as WriterParagraph;
    this.activeParagraph = paragraph;
    this.cursor = new SwPaM(new SwPosition(paragraph, paragraph.Len()));
    this.pendingCharacterItems = paragraph.GetCharacterItemsAt(paragraph.Len());
    this.undoContext = {
      GetDoc: /** Returns the shell's current SwDoc. @returns Active document. */ () =>
        this.docShell.GetDoc(),
      RestoreCursor:
        /** Restores one action cursor boundary. @param state - Stored state. @returns Nothing. */ (
          state,
        ) => this.RestoreCursorState(state),
    };
    this.editing = new SwWrtShellEditingOperations({
      applyAction:
        /** Applies one editing action through shell notification orchestration. @param action - Undo action. @param tryMerge - Whether history grouping is allowed. @returns Whether applied. */ (
          action,
          tryMerge,
        ) => this.ApplyAction(action, tryMerge),
      captureCursorState: /** Captures the shell cursor boundary. @returns Cursor state. */ () =>
        this.CaptureCursorState(),
      createCollapsedCursorState:
        /** Creates a collapsed action endpoint. @param target - Target paragraph. @param offset - Content offset. @returns Cursor state. */ (
          target,
          offset,
        ) => this.CreateCollapsedCursorState(target, offset),
      getActiveParagraph: /** Returns the shell target. @returns Active paragraph. */ () =>
        this.GetActiveParagraph(),
      getCursor: /** Returns the persistent PaM. @returns Cursor. */ () => this.GetCursor(),
      getDoc: /** Returns the active document. @returns Writer document. */ () => this.GetDoc(),
      getPendingCharacterItems: /** Returns caret items. @returns Copied item set. */ () =>
        this.GetPendingCharacterItems(),
      getUndoManager: /** Returns document history. @returns Undo manager. */ () =>
        this.docShell.GetUndoManager(),
      setCursor:
        /** Moves the persistent cursor. @param position - Canonical position. @returns Whether changed. */ (
          position,
        ) => this.SetCursor(position),
    });
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
  /** Returns document-owned line-number state. @returns Independent configuration. */
  public GetLineNumberInfo(): SwLineNumberInfo {
    return this.GetDoc().GetLineNumberInfo();
  }
  /** Replaces the document line-number configuration. @param info - New configuration. @returns Whether changed. */
  public SetLineNumberInfo(info: SwLineNumberInfo): boolean {
    return this.GetDoc().SetLineNumberInfo(info);
  }
  /** Changes line-number painting through the Writer shell. @param paint - Visible state. @returns Whether changed. */
  public SetPaintLineNumbers(paint: boolean): boolean {
    const info = this.GetLineNumberInfo();
    info.SetPaintLineNumbers(paint);
    return this.SetLineNumberInfo(info);
  }
  /** Returns the persistent point-and-mark cursor identity. @returns Current SwPaM. */
  public GetCursor(): SwPaM {
    return this.cursor;
  }
  /** Creates a model-based transfer object over the current persistent selection. @returns Transfer object. */
  public CreateTransferable(): SwTransferable {
    return new SwTransferable(this);
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
  public GetPendingCharacterItems(): SfxItemSet {
    return this.pendingCharacterItems.Clone();
  }
  /** Replaces pending direct attributes on behalf of the active text shell. @param attributes - Next caret attributes. @returns Nothing. */
  public SetPendingCharacterItems(items: SfxItemSet): void {
    this.pendingCharacterItems = items.Clone();
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
  /** Returns the active paragraph's effective Western text height. @returns Font height in points. */
  public GetDefaultFontSizePt(): number {
    return (
      (this.GetActiveParagraph().GetAttr(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight() / 20
    );
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
    this.pendingCharacterItems = paragraph.GetCharacterItemsAt(paragraph.Len());
    this.AssignCursor(paragraph, paragraph.Len());
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
    this.pendingCharacterItems = pointNode.GetCharacterItemsAt(point.GetContentIndex());
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
  public PasteAtCursor(paste: WriterPasteDocument): boolean {
    return this.editing.Paste(paste);
  }

  /** Inserts text at the persistent Writer cursor, matching the bounded SwWrtShell insertion boundary. @param text - Text to insert or replace the selection with. @returns Whether the document changed. */
  public Insert(text: string): boolean {
    return text.length > 0 && this.editing.InsertAtCursor(text, true);
  }

  /** Replaces the current Writer selection without joining ordinary typing undo groups. @param text - Replacement text. @returns Whether content changed. */
  public Replace(text: string): boolean {
    return text.length > 0 && this.editing.InsertAtCursor(text, false);
  }

  /** Inserts a paragraph break at the persistent Writer cursor. @returns Whether a break was inserted. */
  public SplitNode(): boolean {
    return this.editing.SplitAtCursor();
  }

  /** Deletes the preceding grapheme or the current selection. @returns Whether content changed. */
  public DelLeft(): boolean {
    return this.editing.DeleteAtCursor("backspace");
  }

  /** Deletes the following grapheme or the current selection. @returns Whether content changed. */
  public DelRight(): boolean {
    return this.editing.DeleteAtCursor("delete");
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
    const changed = this.editing.InsertAtCursor(composition.text, false);
    /* v8 ignore next -- non-empty composition at a valid registered cursor always inserts. */
    if (!changed) this.NotifySelection();
    return changed;
  }

  /** Deletes the canonical visible selection, including ranges spanning text nodes. @returns Whether content changed. */
  public DeleteSelection(): boolean {
    return this.cursor.HasMark() && this.editing.DeleteAtCursor("delete");
  }

  /** Replaces one same-paragraph range with a native Writer text fragment. @param range - Target range. @param replacement - Inserted native fragment. @returns Whether document content changed. */
  public ReplaceRange(range: WriterTextRange, replacement: SwTextFragment): boolean {
    return this.editing.ReplaceRange(range, replacement);
  }

  /** Pastes one safe transfer document at the persistent SwPaM as a single Writer undo transaction. @param paste - Parsed clipboard paragraphs and list metadata. @returns Whether document content or paragraph formatting changed. */
  public Paste(paste: WriterPasteDocument): boolean {
    return this.editing.Paste(paste);
  }

  /** Splits one paragraph at a canonical Writer position. @param position - Source node and content offset. @returns New trailing paragraph. */
  public SplitParagraph(position: SwPosition): WriterParagraph {
    return this.editing.SplitParagraph(position);
  }

  /** Joins a non-first paragraph into its preceding node. @param paragraph - Paragraph whose preceding break is removed. @returns Whether a merge occurred. */
  public MergeParagraphWithPrevious(paragraph: WriterParagraph): boolean {
    return this.editing.MergeParagraphWithPrevious(paragraph);
  }

  /** Joins the following paragraph into the selected node. @param paragraph - Paragraph whose following break is removed. @returns Whether a merge occurred. */
  public MergeParagraphWithNext(paragraph: WriterParagraph): boolean {
    return this.editing.MergeParagraphWithNext(paragraph);
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

  /** Applies a font height. @param fontSizePt - Selected height in points. @returns Whether document content changed. */
  public SetFontSize(fontSizePt: number): boolean {
    return this.textShell.SetFontSize(fontSizePt);
  }

  /** Applies a foreground or highlight color through the text shell. */
  /** Handles Writer formatting state. @param property - Input value. @param value - Input value. @returns Callback result. */ public SetCharacterColor(
    property: "color" | "highlight",
    value: string,
  ): boolean {
    return this.textShell.SetCharacterColor(property, value);
  }

  /** Applies a direct paragraph item through the text shell. */
  /** Handles Writer formatting state. @param item - Input value. @returns Callback result. */ public SetParagraphItem(
    item: SfxPoolItem,
  ): boolean {
    return this.textShell.SetParagraphItem(item);
  }

  /** Applies one paragraph dialog transaction through the text shell. */
  /** Handles Writer formatting state. @param items - Input value. @returns Callback result. */ public SetParagraphItems(
    items: readonly SfxPoolItem[],
  ): boolean {
    return this.textShell.SetParagraphItems(items);
  }

  /** Commits accepted paragraph dialog values in one undo entry. @param value - Primitive dialog draft. @returns Whether changed. */
  public ApplyParagraphFormat(value: WriterParagraphFormatValue): boolean {
    return this.textShell.ApplyParagraphFormat(value);
  }

  /** Applies proportional line spacing. @param percent - Percent. @returns Whether changed. */
  public SetLineSpacingPercent(percent: number): boolean {
    return this.textShell.SetLineSpacingPercent(percent);
  }

  /** Replaces explicit tab positions through the text shell. @param positions - Twip positions. @returns Whether changed. */
  public SetTabStopPositions(positions: readonly number[]): boolean {
    return this.textShell.SetTabStopPositions(positions);
  }

  /** Adds a ruler tab at an absolute position. @param position - Twip position. @returns Whether changed. */
  public AddRulerTabStop(position: number): boolean {
    const current = this.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    const positions = current
      .GetStops()
      .map(
        /** Reads a tab position. @param stop - Existing stop. @returns Twips. */ (stop) =>
          stop.GetTabPos(),
      );
    return this.SetTabStopPositions([...positions, position]);
  }

  /** Moves one displayed tab marker by its drag delta. @param index - Sorted stop index. @param delta - Twip delta. @returns Whether changed. */
  public MoveRulerTabStop(index: number, delta: number): boolean {
    const current = this.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= current.Count() ||
      !Number.isFinite(delta)
    )
      return false;
    const position = Math.round(current.At(index).GetTabPos() + delta);
    if (position > 32767) return false;
    const stops = current
      .GetStops()
      .flatMap(
        /** Repositions or removes only the dragged stop. @param stop - Existing stop. @param stopIndex - Sorted index. @returns Retained stops. */ (
          stop,
          stopIndex,
        ) =>
          stopIndex !== index
            ? [stop]
            : position <= 0
              ? []
              : [new SvxTabStop(position, stop.GetAdjustment(), stop.GetDecimal(), stop.GetFill())],
      );
    return this.SetParagraphItem(
      SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, stops, current.GetDefaultDistance()),
    );
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

  /** Continues the selected list from the nearest earlier list. @returns Whether a list was joined. */
  public ContinueNumbering(): boolean {
    return this.listShell.ContinueNumbering();
  }

  /** Promotes or demotes the active list paragraph. @param command - Level transition. @returns Whether content changed. */
  public ChangeParagraphListLevel(command: WriterListLevelCommand): boolean {
    return this.listShell.Execute(command);
  }

  /** Executes the text-shell indent command: list levels for list items and a direct left margin otherwise. @param increase - Whether to increase indentation. @param modulus - Snap to the document tab grid. @returns Whether content changed. */
  public ChangeParagraphIndent(increase: boolean, modulus = true): boolean {
    return this.textShell.ChangeParagraphIndent(increase, modulus);
  }

  /** Executes the upstream edit-shell margin operation on the whole selected node range. @param right - Increase direction. @param modulus - Snap to default tabs. @returns Whether changed. */
  public MoveLeftMargin(right: boolean, modulus = true): boolean {
    const action = createMoveLeftMarginAction(
      this.GetDoc(),
      this.GetCursor(),
      right,
      modulus,
      this.CaptureCursorState(),
    );
    return action === undefined ? false : this.ApplyAction(action);
  }

  /** Reports upstream edit-shell margin availability for the selected node range. @param right - Increase direction. @param modulus - Snap to default tabs. @returns Whether enabled. */
  public IsMoveLeftMargin(right: boolean, modulus = true): boolean {
    return isMoveLeftMargin(this.GetDoc(), this.GetCursor(), right, modulus);
  }

  /** Changes a list paragraph by one numbering level. @param down - Demote when true. @returns Whether changed. */
  public NumUpDown(down: boolean): boolean {
    return this.listShell.Execute(down ? "demote" : "promote");
  }
  /** Applies named page geometry as one Writer undo action. @param value - Replacement geometry. @param descriptorName - Target identity. @returns Whether it changed. */
  public SetPageDescriptor(value: WriterPageDescriptorValue, descriptorName = value.name): boolean {
    const descriptor = this.GetDoc().FindPageDesc(descriptorName);
    if (descriptor === undefined) return false;
    const before = descriptor.GetValue();
    if (equalWriterPageDescriptors(before, value)) return false;
    const cursor = this.CaptureCursorState();
    return this.ApplyAction(new SwUndoPageDesc(before, value, cursor, cursor, descriptorName));
  }
  /** Applies a page ruler drag to the current descriptor. @param edge - Dragged margin. @param delta - Twip drag delta. @returns Whether changed. */
  public AdjustPageMargin(edge: "left" | "right" | "top" | "bottom", delta: number): boolean {
    if (!Number.isFinite(delta)) return false;
    const page = this.GetDoc().GetPageDesc().GetValue();
    const clamp =
      /** Keeps a minimum text area. @param value - Candidate margin. @param oppositeBoundary - Opposite edge. @returns Clamped margin. */ (
        value: number,
        oppositeBoundary: number,
      ): number => Math.max(0, Math.min(value, oppositeBoundary - 567));
    switch (edge) {
      case "left":
        return this.SetPageDescriptor({
          ...page,
          leftMargin: clamp(page.leftMargin + delta, page.width - page.rightMargin),
        });
      case "right":
        return this.SetPageDescriptor({
          ...page,
          rightMargin: clamp(page.rightMargin - delta, page.width - page.leftMargin),
        });
      case "top":
        return this.SetPageDescriptor({
          ...page,
          topMargin: clamp(page.topMargin + delta, page.height - page.bottomMargin),
        });
      case "bottom":
        return this.SetPageDescriptor({
          ...page,
          bottomMargin: clamp(page.bottomMargin - delta, page.height - page.topMargin),
        });
    }
  }
  /** Applies direct active-paragraph ruler indents as one Writer undo action. @param value - Replacement indent tuple. @returns Whether it changed. */
  public SetParagraphRulerIndents(value: WriterParagraphIndentValue): boolean {
    const paragraph = this.GetActiveParagraph();
    const before = {
      firstLine: paragraph.GetParagraphFirstLineIndent(),
      left: paragraph.GetParagraphTextLeftMargin(),
      right: paragraph.GetParagraphRightMargin(),
    };
    if (
      before.firstLine === value.firstLine &&
      before.left === value.left &&
      before.right === value.right
    )
      return false;
    const cursor = this.CaptureCursorState();
    return this.ApplyAction(new SwUndoRulerIndent(paragraph, before, value, cursor, cursor));
  }
  /** Applies one paragraph ruler drag to the active paragraph. @param edge - Dragged marker. @param delta - Twip drag delta. @returns Whether changed. */
  public AdjustParagraphRulerIndent(edge: "left" | "firstLine" | "right", delta: number): boolean {
    if (!Number.isFinite(delta)) return false;
    const paragraph = this.GetActiveParagraph();
    const before = {
      firstLine: paragraph.GetParagraphFirstLineIndent(),
      left: paragraph.GetParagraphTextLeftMargin(),
      right: paragraph.GetParagraphRightMargin(),
    };
    switch (edge) {
      case "left":
        return this.SetParagraphRulerIndents({ ...before, left: Math.max(0, before.left + delta) });
      case "firstLine":
        return this.SetParagraphRulerIndents({ ...before, firstLine: before.firstLine + delta });
      case "right":
        return this.SetParagraphRulerIndents({
          ...before,
          right: Math.max(0, before.right - delta),
        });
    }
  }

  /** Reports whether the text-shell indent command has an available transition. @param increase - Whether to increase indentation. @returns Whether enabled. */
  public CanChangeParagraphIndent(increase: boolean): boolean {
    return this.textShell.CanChangeParagraphIndent(increase);
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
      this.pendingCharacterItems,
    );
  }

  /** Creates a collapsed action endpoint while retaining pending direct attributes. @param paragraph - Target node. @param offset - Target content offset. @returns Complete cursor state. */
  private CreateCollapsedCursorState(
    paragraph: WriterParagraph,
    offset: number,
  ): SwUndoCursorState {
    if (paragraph.GetDoc() !== this.GetDoc()) throw new Error("Writer cursor node is foreign.");
    return createWriterCollapsedCursorState(paragraph, offset, this.pendingCharacterItems);
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
    this.pendingCharacterItems = state.pendingCharacterItems.Clone();
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
export type SwWrtShellHistory = UndoManager;

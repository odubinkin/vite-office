/** @fileoverview Adapts the browser rich comment surface to the native Writer annotation EditEngine. */
import type { SearchEditView } from "../../../editeng/source/editeng/impedit4.search";
import { SvxAdjust, SvxAdjustItem } from "../../../editeng/inc/adjustitem";
import {
  EE_FEATURE_LINEBR,
  EE_PARA_JUST,
  EE_PARA_SBL,
  EE_PARA_ULSPACE,
} from "../../../editeng/inc/eeitem";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import { SvxULSpaceItem } from "../../../editeng/inc/ulspitem";
import type { ContentNode } from "../../../editeng/source/editeng/ContentNode";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxVoidItem } from "../../../svl/source/items/voiditem";
import { FontLineStyle } from "../../../tools/inc/fontenum";
import { ASIAN, COMPLEX } from "../../../offapi/com/sun/star/i18n/ScriptType";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../inc/hintids";
import { projectWriterCharacterAttributes } from "../../source/core/txtnode/txatbase";
import { projectWriterLineSpacing } from "../../source/core/text/itrform2";
import { browserTextLineStyle } from "./writer-view-projection";
import { browserFontFamily } from "../editor/writer-font-family";
import { getWriterTextCaretPoint } from "../editor/writer-selection";
import { EditPaM } from "../../../editeng/inc/EditPaM";
import { EditSelection } from "../../../editeng/inc/EditSelection";
import type { EditTextObject } from "../../../editeng/source/editeng/editobj";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Rectangle } from "../../../tools/inc/gen";
import type { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { putAnnotationCharacterItems, SwTextAPIEditSource } from "../../source/core/fields/textapi";
import type { SwView } from "../../source/uibase/uiview/view";
import { WRITER_COMMAND_IDS as CMD } from "../../uiconfig/swriter/menubar/menubar-commands";
import { SwUndo } from "../../source/core/undo/undobj";

/** Writer model undo for the value committed by its comment editor. */
class AnnotationTextUndo extends SwUndo {
  private readonly type: SwPostItFieldType;
  private readonly id: number;
  private readonly resolved: boolean;

  /** Owns before and after native text snapshots. @param field - Model comment. @param beforeText - Previous note text. @param beforeObject - Previous rich text. @param afterText - Updated note text. @param afterObject - Updated rich text. @returns Undo record. */
  constructor(
    field: SwPostItField,
    private readonly beforeText: string,
    private readonly beforeObject: EditTextObject | undefined,
    private readonly afterText: string,
    private readonly afterObject: EditTextObject,
  ) {
    super("Edit Comment");
    this.type = field.GetTyp();
    this.id = field.GetPostItId();
    this.resolved = field.IsResolved();
  }

  /** Publishes a saved note value through the document state owner. @param value - Plain text. @param object - Rich text snapshot. @param field - Mounted field for the initial edit, resolved from history on replay. @param beforeNotify - Allows the mounted editor to acknowledge the field copy. @returns Nothing. */
  Apply(
    value: string,
    object: EditTextObject | undefined,
    field = this.type.FindField(this.id),
    beforeNotify?: () => void,
  ): void {
    if (!field) throw new Error("Writer comment history has no attached field.");
    field.SetPar2(value);
    field.SetTextObject(object);
    field.SetResolved(this.resolved);
    beforeNotify?.();
    this.type.GetDoc().NotifyModelChange({ kind: "document-modified", modified: true });
  }

  /** Restores the previous note value. @returns Nothing. */
  protected override UndoImpl(): void {
    this.Apply(this.beforeText, this.beforeObject);
  }

  /** Restores the edited note value. @returns Nothing. */
  protected override RedoImpl(): void {
    this.Apply(this.afterText, this.afterObject);
  }

  /** Releases action-owned editor values. @returns Nothing. */
  override Dispose(): void {
    this.beforeObject?.dispose();
    this.afterObject.dispose();
    super.Dispose();
  }
}

/** Paragraph alignment in the browser's native rich text host. */
const alignments = new Map<SvxAdjust, string>([
  [SvxAdjust.Left, "left"],
  [SvxAdjust.Right, "right"],
  [SvxAdjust.ParaStart, "start"],
  [SvxAdjust.ParaEnd, "end"],
  [SvxAdjust.Center, "center"],
  [SvxAdjust.Block, "justify"],
  [SvxAdjust.BlockLine, "justify"],
]);

/** Browser text boundaries for a platform deletion without an explicit target range. */
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Binds native EditEngine text and selection to the mounted annotation window. */
export class WriterCommentEditor extends SwTextAPIEditSource {
  private readonly selection = new EditSelection();
  private storedText: string | undefined;
  private storedObject: EditTextObject | undefined;
  private compositionSelection: EditSelection | undefined;

  /** Connects the browser editing host to the native annotation owner. @param field - Actual field. @param input - Mounted editable host. @param view - Active Writer view. @param selectionChanged - Selection invalidation callback. @returns Connected editor. */
  constructor(
    private readonly field: SwPostItField,
    private readonly input: HTMLDivElement,
    private readonly view: SwView,
    private readonly selectionChanged: () => void,
  ) {
    super();
    this.SyncContent();
    input.addEventListener("beforeinput", this.OnBeforeInput);
    input.addEventListener("paste", this.OnPaste);
    input.addEventListener("compositionstart", this.OnCompositionStart);
    input.addEventListener("compositionend", this.OnCompositionEnd);
    input.ownerDocument.addEventListener("selectionchange", this.OnSelectionChange);
  }

  /** Loads the new text object while retaining native positions for a formatting-only change. @returns Nothing. */
  SyncContent(): void {
    const value = this.field.GetPar2();
    const object = this.field.GetTextObject();
    if (this.storedText === value && this.storedObject === object) return;
    const engine = this.getImpl();
    const saved = this.storedText === value ? engine.CreateESel(this.selection) : undefined;
    this.storedText = value;
    this.storedObject = object;
    if (object) this.SetText(object);
    else {
      const plain = unicode(value);
      try {
        this.SetText(plain);
      } finally {
        plain.dispose();
      }
    }
    this.selection.assign(saved ? this.CreateSelection(saved) : engine.GetEditDoc().GetStartPaM());
    this.Render();
    this.ShowCursor();
  }

  /** Publishes the browser selection only when its endpoints belong to this annotation. @returns Whether read. */
  ReadSelection(): boolean {
    const selection = this.input.ownerDocument.getSelection();
    if (!selection?.anchorNode || !selection.focusNode) return false;
    return this.SetDomRange(
      selection.anchorNode,
      selection.anchorOffset,
      selection.focusNode,
      selection.focusOffset,
    );
  }

  /** Focuses and reveals the annotation selected by the native comment manager. @returns Nothing. */
  MakeVisible(): void {
    this.input.focus({ preventScroll: true });
    this.input.scrollIntoView?.({ block: "nearest" });
    this.ShowCursor();
  }

  /** Paints the native cursor when this annotation owns browser focus. @returns Nothing. */
  ShowCursor(): void {
    const document = this.input.ownerDocument;
    if (document.activeElement !== this.input) return;
    const start = this.DomPoint(this.selection.Min());
    const end = this.DomPoint(this.selection.Max());
    if (start && end)
      document.getSelection()?.setBaseAndExtent(start.node, start.offset, end.node, end.offset);
  }

  /** Inserts replacement text into the active native note selection. @param value - Replacement value. @returns Nothing. */
  InsertNoteText(value: OUStringConstReference): void {
    this.ReplaceSelection(this.selection, value);
  }

  /** Supplies the annotation's EditEngine operations to Writer search. @returns Search view. */
  GetSearchView(): SearchEditView {
    return {
      /** Exposes the actual edit view state. @returns Search editor. */
      getImpl: () => this,
      /** Uses the default output area for the native search callback. @returns Output area. */
      GetOutputArea: () => new Rectangle(),
      /** Defers invalidation to the browser. @returns Nothing. */
      InvalidateWindow: () => {},
      /** Mirrors the match in the browser selection when active. @returns Nothing. */
      ShowCursor: () => this.ShowCursor(),
      /** Replaces the current model selection. @param value - Replacement text. @returns Nothing. */
      InsertText: (value) => this.InsertNoteText(value),
    };
  }

  /** Returns the actual note selection. @returns Native selection. */
  GetEditSelection(): EditSelection {
    return this.selection;
  }

  /** Updates the original editor selection. @param value - Selection. @returns Nothing. */
  SetEditSelection(value: EditSelection): void {
    if (this.selection.equals(value)) return;
    this.selection.assign(value);
    this.selectionChanged();
  }

  /** The platform paints the selected DOM text. @returns Nothing. */
  DrawSelectionXOR(): void {}

  /** Keeps undo ownership with the Writer document. @returns No separate shell. */
  GetViewShell(): null {
    return null;
  }

  /** Delivers annotation undo and redo to Writer before browser history can mutate the DOM. @param event - Keyboard event. @returns Nothing. */
  HandleKeyDown(event: KeyboardEvent): void {
    if (event.isComposing || event.altKey || (!event.ctrlKey && !event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (!["z", "y", "b", "i", "u"].includes(key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (this.input.getAttribute("aria-readonly") === "true") return;
    this.ReadSelection();
    const command =
      key === "b"
        ? CMD.bold
        : key === "i"
          ? CMD.italic
          : key === "u"
            ? CMD.underline
            : key === "y" || event.shiftKey
              ? CMD.redo
              : CMD.undo;
    this.view.Execute(command);
    this.SyncContent();
  }

  /** Releases the registered browser events and actual editor. @returns Nothing. */
  override Dispose(): void {
    this.input.removeEventListener("beforeinput", this.OnBeforeInput);
    this.input.removeEventListener("paste", this.OnPaste);
    this.input.removeEventListener("compositionstart", this.OnCompositionStart);
    this.input.removeEventListener("compositionend", this.OnCompositionEnd);
    this.input.ownerDocument.removeEventListener("selectionchange", this.OnSelectionChange);
    super.Dispose();
  }

  private readonly OnSelectionChange =
    /** Reads device cursor moves without observing the IME's temporary DOM. @returns Nothing. */ (): void => {
      if (!this.compositionSelection && this.input.ownerDocument.activeElement === this.input)
        this.ReadSelection();
    };

  private readonly OnCompositionStart =
    /** Keeps the model range from before the IME inserts its temporary text. @returns Nothing. */ (): void => {
      this.ReadSelection();
      this.compositionSelection = new EditSelection(this.selection);
    };

  private readonly OnCompositionEnd =
    /** Commits the platform composition to EditEngine and restores its projection. @param event - Completed composition. @returns Nothing. */ (
      event: CompositionEvent,
    ): void => {
      const selection = this.compositionSelection;
      this.compositionSelection = undefined;
      if (!selection) return;
      if (event.data) this.InsertString(event.data, selection);
      else {
        this.Render();
        this.ShowCursor();
      }
    };

  private readonly OnBeforeInput =
    /** Routes a native browser edit intent through EditEngine. @param event - Pre-mutation input event. @returns Nothing. */ (
      event: InputEvent,
    ): void => {
      if (event.isComposing || this.compositionSelection || !event.cancelable) return;
      event.preventDefault();
      if (this.input.getAttribute("aria-readonly") === "true") return;
      this.ReadSelection();
      const target = event.getTargetRanges?.()[0];
      if (target)
        this.SetDomRange(
          target.startContainer,
          target.startOffset,
          target.endContainer,
          target.endOffset,
        );
      switch (event.inputType) {
        case "insertText":
        case "insertReplacementText":
          if (event.data !== null) this.InsertString(event.data);
          break;
        case "insertParagraph":
          this.InsertString("\n");
          break;
        case "insertLineBreak": {
          const empty = unicode("");
          try {
            this.ReplaceSelection(this.selection, empty, true);
          } finally {
            empty.dispose();
          }
          break;
        }
        case "deleteContentBackward":
        case "deleteContentForward":
        case "deleteWordBackward":
        case "deleteWordForward":
          this.Delete(
            event.inputType.endsWith("Backward"),
            event.inputType.startsWith("deleteWord"),
          );
          break;
        case "deleteByCut":
        case "deleteContent":
          if (this.selection.HasRange()) this.InsertString("");
          break;
        case "formatBold":
          this.view.Execute(CMD.bold);
          break;
        case "formatItalic":
          this.view.Execute(CMD.italic);
          break;
        case "formatUnderline":
          this.view.Execute(CMD.underline);
          break;
        case "historyUndo":
        case "historyRedo":
          this.view.Execute(event.inputType === "historyRedo" ? CMD.redo : CMD.undo);
          this.SyncContent();
          break;
      }
    };

  private readonly OnPaste =
    /** Inserts clipboard text through the same history transaction as typing. @param event - Platform paste. @returns Nothing. */ (
      event: ClipboardEvent,
    ): void => {
      event.preventDefault();
      if (!event.clipboardData || this.input.getAttribute("aria-readonly") === "true") return;
      const value = event.clipboardData.getData("text/plain");
      if (!value) return;
      this.ReadSelection();
      this.InsertString(value);
    };

  /** Deletes the selection or one adjacent character or word using the platform boundary. @param backward - Delete toward the start. @param word - Request a word boundary when the browser provides no range. @returns Nothing. */
  private Delete(backward: boolean, word: boolean): void {
    if (this.selection.HasRange()) {
      this.InsertString("");
      return;
    }
    const value = this.GetValue();
    const offset = this.AbsoluteOffset(this.selection.Min());
    if ((!backward && offset >= value.length) || (backward && offset === 0)) return;
    const segments = (
      word ? new Intl.Segmenter(undefined, { granularity: "word" }) : graphemes
    ).segment(value);
    const segment = segments.containing(backward ? offset - 1 : offset);
    if (!segment) return;
    const edge = backward ? segment.index : segment.index + segment.segment.length;
    this.InsertString(
      "",
      new EditSelection(
        this.AbsolutePoint(Math.min(offset, edge)),
        this.AbsolutePoint(Math.max(offset, edge)),
      ),
    );
  }

  /** Inserts counted native text using the supplied range. @param value - Browser text. @param selection - Note range. @returns Nothing. */
  private InsertString(value: string, selection = this.selection): void {
    const native = unicode(value);
    try {
      this.ReplaceSelection(selection, native);
    } finally {
      native.dispose();
    }
  }

  /** Publishes one edit as a field snapshot and a Writer history entry. @param selection - Note range. @param value - Inserted text. @param softBreak - Whether to insert an EditEngine line-break feature. @returns Nothing. */
  private ReplaceSelection(
    selection: EditSelection,
    value: OUStringConstReference,
    softBreak = false,
  ): void {
    if (!softBreak && value.isEmpty() && !selection.HasRange()) return;
    const before = this.field.GetPar2();
    const beforeObject = this.field.GetTextObject()?.Clone();
    const engine = this.getImpl();
    const end = softBreak
      ? engine.ImpInsertFeature(selection, new SfxVoidItem(EE_FEATURE_LINEBR))
      : engine.InsertText(selection, value);
    this.selection.assign(end);
    this.CommitEdit(before, beforeObject);
  }

  /** Applies prepared native attributes through the annotation's history owner. @param items - Native character or paragraph items. @returns Whether changed. */
  ApplyAttributes(items: SfxItemSet): boolean {
    const before = this.field.GetPar2();
    const beforeObject = this.field.GetTextObject()?.Clone();
    this.QuickSetAttribs(items, this.getImpl().CreateESel(this.selection));
    this.CommitEdit(before, beforeObject);
    return true;
  }

  /** Updates the field state before publishing the annotation snapshot, as in SwAnnotationWin. @param value - Whether resolved. @returns Nothing. */
  SetResolved(value: boolean): void {
    if (value === this.field.IsResolved()) return;
    this.field.SetResolved(value);
    this.CommitEdit(this.field.GetPar2(), this.field.GetTextObject()?.Clone(), true);
  }

  /** Selects the entire actual annotation. @returns Nothing. */
  SelectAll(): void {
    const doc = this.getImpl().GetEditDoc();
    this.SetEditSelection(new EditSelection(doc.GetStartPaM(), doc.GetEndPaM()));
    this.MakeVisible();
  }

  /** Commits an engine or resolution change to document history and refreshes the projection. @param before - Previous field text. @param beforeObject - Previous owned snapshot. @param resolvedStateUpdated - Whether the resolution flag was updated before the snapshot. @returns Nothing. */
  private CommitEdit(
    before: string,
    beforeObject: EditTextObject | undefined,
    resolvedStateUpdated = false,
  ): void {
    const after = this.GetValue();
    const afterObject = this.CreateTextObject();
    this.Render();
    this.ShowCursor();
    if (
      !resolvedStateUpdated &&
      after === before &&
      beforeObject &&
      afterObject.Equals(beforeObject)
    ) {
      beforeObject?.dispose();
      afterObject.dispose();
      return;
    }
    const action = new AnnotationTextUndo(this.field, before, beforeObject, after, afterObject);
    const undo = this.field.GetTyp().GetDoc().GetUndoManager();
    action.Apply(
      after,
      afterObject,
      this.field,
      /** Acknowledges the cloned model value before observers render. @returns Nothing. */ () => {
        this.storedText = after;
        this.storedObject = this.field.GetTextObject();
      },
    );
    if (undo.DoesUndo()) undo.AddUndoAction(action);
    else action.Dispose();
  }

  /** Reads the native expanded text. @returns Browser string. */
  private GetValue(): string {
    const value = this.GetText();
    try {
      return text(value);
    } finally {
      value.dispose();
    }
  }

  /** Maps a browser range onto the annotation's native positions. @param start - First DOM node. @param startOffset - First node index. @param end - Second DOM node. @param endOffset - Second node index. @returns Whether both endpoints were represented. */
  private SetDomRange(start: Node, startOffset: number, end: Node, endOffset: number): boolean {
    const first = this.ReadDomPoint(start, startOffset);
    const last = this.ReadDomPoint(end, endOffset);
    if (!first || !last) return false;
    const selection = new EditSelection(first, last);
    selection.Adjust(this.getImpl().GetEditDoc());
    this.SetEditSelection(selection);
    return true;
  }

  /** Converts browser boundary coordinates to a raw EditEngine position. @param node - DOM node on either endpoint. @param offset - Node offset. @returns Model point, if inside this note. */
  private ReadDomPoint(node: Node, offset: number): EditPaM | undefined {
    if (!this.input.contains(node)) return undefined;
    const doc = this.getImpl().GetEditDoc();
    if (node === this.input)
      return offset >= doc.Count() ? doc.GetEndPaM() : new EditPaM(doc.GetObject(offset), 0);
    const element = node instanceof HTMLElement ? node : node.parentElement;
    const paragraph = element?.closest("p");
    if (!paragraph || paragraph.parentElement !== this.input) return undefined;
    const index = [...this.input.children].indexOf(paragraph);
    const content = doc.GetObject(index);
    if (!content) return undefined;
    const prefix = this.input.ownerDocument.createRange();
    prefix.selectNodeContents(paragraph);
    prefix.setEnd(node, offset);
    const raw: [number] = [prefix.toString().length];
    content.UnExpandPosition(raw, true);
    return new EditPaM(content, raw[0]);
  }

  /** Resolves a native position to the corresponding DOM text node. @param position - Native text point. @returns Browser selection boundary. */
  private DomPoint(position: EditPaM): ReturnType<typeof getWriterTextCaretPoint> | undefined {
    const node = position.GetNode();
    if (!node) return undefined;
    const index = this.getImpl().GetEditDoc().GetPos(node);
    const paragraph = this.input.children[index];
    return paragraph instanceof HTMLParagraphElement
      ? getWriterTextCaretPoint(paragraph, expandedLength(node, position.GetIndex()))
      : undefined;
  }

  /** Reads an expanded linear offset for platform deletion boundaries. @param position - Native point. @returns Expanded UTF-16 offset. */
  private AbsoluteOffset(position: EditPaM): number {
    const doc = this.getImpl().GetEditDoc();
    const node = position.GetNode();
    let result = node ? expandedLength(node, position.GetIndex()) : 0;
    for (let index = 0; index < doc.GetPos(node); ++index)
      result += (doc.GetObject(index)?.GetExpandedLen() ?? 0) + 1;
    return result;
  }

  /** Converts an expanded linear offset into a raw native text position. @param offset - Expanded UTF-16 offset. @returns Native point. */
  private AbsolutePoint(offset: number): EditPaM {
    const doc = this.getImpl().GetEditDoc();
    for (let index = 0; index < doc.Count(); ++index) {
      const node = doc.GetObject(index);
      if (!node) break;
      const length = node.GetExpandedLen();
      if (offset <= length) {
        const raw: [number] = [offset];
        node.UnExpandPosition(raw, true);
        return new EditPaM(node, raw[0]);
      }
      offset -= length + 1;
    }
    return doc.GetEndPaM();
  }

  /** Draws the actual EditEngine text portions and paragraph properties with native DOM elements. @returns Nothing. */
  private Render(): void {
    const document = this.input.ownerDocument;
    const layer = document.createDocumentFragment();
    const doc = this.getImpl().GetEditDoc();
    for (let index = 0; index < doc.Count(); ++index) {
      const node = doc.GetObject(index);
      if (!node) continue;
      const paragraph = document.createElement("p");
      this.RenderParagraph(index, node, paragraph);
      layer.append(paragraph);
    }
    this.input.replaceChildren(layer);
  }

  /** Paints one model paragraph. @param index - EditEngine paragraph index. @param node - Native paragraph. @param paragraph - Browser projection. @returns Nothing. */
  private RenderParagraph(index: number, node: ContentNode, paragraph: HTMLParagraphElement): void {
    const source = node.GetContentAttribs().GetItems();
    const align = source.GetItemIfSet(EE_PARA_JUST, true);
    if (align instanceof SvxAdjustItem)
      paragraph.style.textAlign = alignments.get(align.GetAdjust()) ?? "";
    const spacing = source.GetItemIfSet(EE_PARA_ULSPACE, true);
    if (spacing instanceof SvxULSpaceItem) {
      paragraph.style.marginBlockStart = `${spacing.GetUpper() / 20}pt`;
      paragraph.style.marginBlockEnd = `${spacing.GetLower() / 20}pt`;
    }
    const line = source.GetItemIfSet(EE_PARA_SBL, true);
    if (line instanceof SvxLineSpacingItem) paragraph.style.lineHeight = annotationLineHeight(line);
    const parent = new SfxItemSet(
      this.field.GetTyp().GetDoc().GetAttrPool(),
      WRITER_CHARACTER_WHICH_RANGES,
    );
    try {
      putAnnotationCharacterItems(parent, source.entries());
      const base = projectWriterCharacterAttributes(parent);
      if (base.fontSizeTwips !== undefined)
        paragraph.style.fontSize = `${base.fontSizeTwips / 20}pt`;
      const attributes = node.GetCharAttribs().GetAttribs();
      const boundaries = new Set([0, node.Len()]);
      const engine = this.getImpl();
      engine.InitScriptTypes(index);
      const scripts = engine.GetParaPortions().SafeGetObject(index)?.getScriptTypePosInfos() ?? [];
      for (const script of scripts) {
        boundaries.add(script.nStartPos);
        boundaries.add(script.nEndPos);
      }
      for (const attribute of attributes) {
        boundaries.add(attribute.GetStart());
        boundaries.add(attribute.GetEnd());
      }
      const offsets = [...boundaries].sort(
        /** Orders native offsets. @param a - First. @param b - Second. @returns Ordering. */ (
          a,
          b,
        ) => a - b,
      );
      for (let index = 1; index < offsets.length; index++) {
        const start = offsets[index - 1] as number;
        const end = offsets[index] as number;
        const items = new SfxItemSet(parent);
        const value = node.GetExpandedText(start, end);
        try {
          for (const attribute of attributes) {
            const item = attribute.GetItem();
            if (item && attribute.GetStart() <= start && attribute.GetEnd() >= end)
              putAnnotationCharacterItems(items, [item]);
          }
          const run = paragraph.ownerDocument.createElement("span");
          run.textContent = text(value);
          const script = scripts.find(
            /** Selects the native script for this portion's first unit. @param span - Script span. @returns Whether it contains the beginning. */
            (span) => start >= span.nStartPos && start < span.nEndPos,
          );
          applyTextStyle(run, projectAnnotationRun(items, script?.nScriptType));
          paragraph.append(run);
        } finally {
          value.dispose();
          items.Dispose();
        }
      }
      if (!paragraph.hasChildNodes()) paragraph.append(paragraph.ownerDocument.createElement("br"));
    } finally {
      parent.Dispose();
    }
  }
}

/** Projects EditEngine spacing against the browser editor's natural line height. @param item - Native spacing rule with measurements in twips. @returns CSS line height. */
function annotationLineHeight(item: SvxLineSpacingItem): string {
  const { mode, value } = projectWriterLineSpacing(item);
  const distance = `${value / 20}pt`;
  switch (mode) {
    case "fixed":
      return distance;
    case "minimum":
      return `max(1lh, ${distance})`;
    case "leading":
      return `calc(1lh + ${distance})`;
    case "proportional":
      return `${(value || 100) / 100}lh`;
  }
}

/** Measures native expanded text for a DOM boundary. @param node - Native paragraph. @param index - Raw UTF-16 boundary. @returns Expanded length. */
function expandedLength(node: ContentNode, index: number): number {
  const value = node.GetExpandedText(0, index);
  try {
    return value.getLength();
  } finally {
    value.dispose();
  }
}

/** Matches Writer character format items across native script groups. */
const displayScripts = [
  [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT],
  [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE],
  [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE],
  [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT],
] as const;

/** Projects the EditEngine script's font and weight through the shared Writer text display shape. @param items - Owned run format. @param script - Native script value. @returns Equivalent display attributes. */
function projectAnnotationRun(
  items: SfxItemSet,
  script: number | undefined,
): ReturnType<typeof projectWriterCharacterAttributes> {
  if (script === ASIAN || script === COMPLEX) {
    for (const [latin, asian, complex] of displayScripts) {
      const item = items.GetItemIfSet(script === ASIAN ? asian : complex, false);
      if (item) items.PutAsTargetWhich(item, latin);
    }
  }
  return projectWriterCharacterAttributes(items);
}

/** Paints effective Writer text attributes using browser font and decoration primitives. @param element - Display portion. @param attributes - Effective native items. @returns Nothing. */
function applyTextStyle(
  element: HTMLElement,
  attributes: ReturnType<typeof projectWriterCharacterAttributes>,
): void {
  const style = element.style;
  if (attributes.bold) style.fontWeight = "bold";
  if (attributes.italic) style.fontStyle = "italic";
  if (attributes.color && attributes.color !== "auto") style.color = attributes.color;
  if (attributes.highlight) style.backgroundColor = attributes.highlight;
  if (attributes.fontFamily)
    style.fontFamily = browserFontFamily(attributes.fontFamily, undefined) ?? "";
  if (attributes.fontSizeTwips !== undefined) style.fontSize = `${attributes.fontSizeTwips / 20}pt`;
  if (attributes.kerningTwips !== undefined)
    style.letterSpacing = `${attributes.kerningTwips / 20}pt`;
  if (attributes.underline) {
    style.textDecorationLine = "underline";
    style.textDecorationStyle = browserTextLineStyle(
      attributes.underlineStyle ?? FontLineStyle.LINESTYLE_SINGLE,
    );
    if (attributes.underlineColor) style.textDecorationColor = attributes.underlineColor;
  }
  if (attributes.strikeout)
    style.textDecorationLine = attributes.underline ? "underline line-through" : "line-through";
  if (attributes.escapement?.offset) {
    style.verticalAlign = attributes.escapement.offset > 0 ? "super" : "sub";
    style.fontSize = `${attributes.escapement.height}%`;
  }
}

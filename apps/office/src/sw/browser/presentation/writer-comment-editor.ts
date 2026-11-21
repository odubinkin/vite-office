/** @fileoverview Adapts the browser comment textarea to the native Writer annotation EditEngine. */
import { EditEngine } from "../../../editeng/source/editeng/editeng.lifecycle";
import { DocumentImpEditEngine } from "../../../editeng/source/editeng/impedit2.document";
import type { SearchEditView } from "../../../editeng/source/editeng/impedit4.search";
import { EditPaM } from "../../../editeng/inc/EditPaM";
import { EditSelection } from "../../../editeng/inc/EditSelection";
import type { EditTextObject } from "../../../editeng/source/editeng/editobj";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Rectangle } from "../../../tools/inc/gen";
import type { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { SwUndo } from "../../source/core/undo/undobj";

/** Actual comment editor document with paragraph-aware selection deletion. */
class AnnotationEditDocument extends DocumentImpEditEngine {
  /** Deletes a normalized editor selection while retaining the first paragraph. @param selection - Native edit selection. @returns Original start. */
  override ImpDeleteSelection(selection: EditSelection): EditPaM {
    const doc = this.GetEditDoc();
    const ordered = new EditSelection(selection);
    ordered.Adjust(doc);
    const start = ordered.Min();
    const end = ordered.Max();
    const first = start.GetNode();
    const last = end.GetNode();
    if (!first || !last) throw new Error("Writer comment selection has no paragraph.");
    if (first === last) doc.RemoveChars(start, end.GetIndex() - start.GetIndex());
    else {
      const firstIndex = doc.GetPos(first);
      const lastIndex = doc.GetPos(last);
      doc.RemoveChars(start, first.Len() - start.GetIndex());
      doc.RemoveChars(new EditPaM(last, 0), end.GetIndex());
      for (let index = lastIndex - 1; index > firstIndex; index--) {
        doc.Remove(index);
        this.GetParaPortions().Remove(index);
      }
      doc.ConnectParagraphs(first, last);
      this.GetParaPortions().Remove(firstIndex + 1);
    }
    return new EditPaM(start);
  }
}

/** Writer model undo for the value committed by its comment editor. */
class AnnotationTextUndo extends SwUndo {
  private readonly type: SwPostItFieldType;
  private readonly id: number;

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
  }

  /** Publishes a saved note value through the document state owner. @param value - Plain text. @param object - Rich text snapshot. @param field - Mounted field for the initial edit, resolved from history on replay. @returns Nothing. */
  Apply(
    value: string,
    object: EditTextObject | undefined,
    field = this.type.FindField(this.id),
  ): void {
    if (!field) throw new Error("Writer comment history has no attached field.");
    field.SetPar2(value);
    field.SetTextObject(object);
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

/** Binds the public text engine APIs and sidebar search operations to one mounted comment. */
export class WriterCommentEditor extends EditEngine {
  private readonly pool = EditEngine.CreatePool();
  private readonly engine = new AnnotationEditDocument(this, this.pool);
  private readonly selection = new EditSelection();
  private storedText: string | undefined;

  /** Connects a native textarea to its actual annotation owner. @param field - Stored field. @param input - Mounted textarea. @returns Connected editor. */
  constructor(
    private readonly field: SwPostItField,
    private readonly input: HTMLTextAreaElement,
  ) {
    super();
    this.engine.SetUpdateLayout(false);
    this.engine.EnableUndo(false);
    this.SyncContent();
  }

  /** Returns the actual edit document. @returns Editor implementation. */
  getImpl(): AnnotationEditDocument {
    return this.engine;
  }

  /** Splits the selected editor paragraph. @param paragraph - Paragraph index. @param position - UTF-16 offset. @returns Position after split. */
  SplitContent(paragraph: number, position: number): EditPaM {
    return this.engine.ImpInsertParaBreak(
      new EditPaM(this.engine.GetEditDoc().GetObject(paragraph), position),
    );
  }

  /** Joins adjacent editor paragraphs. @param left - First paragraph index. @returns Join position. */
  ConnectContents(left: number): EditPaM {
    const doc = this.engine.GetEditDoc();
    const first = doc.GetObject(left);
    const second = doc.GetObject(left + 1);
    if (!first || !second) throw new Error("Writer comment join is outside its editor.");
    const position = doc.ConnectParagraphs(first, second);
    this.engine.GetParaPortions().Remove(left + 1);
    return position;
  }

  /** Loads committed text after model undo, redo or a field update. @returns Nothing. */
  SyncContent(): void {
    const value = this.field.GetPar2();
    if (this.storedText === value) return;
    this.storedText = value;
    const object = this.field.GetTextObject();
    if (object) this.engine.SetTextObject(object);
    else {
      const plain = unicode(value);
      try {
        this.engine.SetText(plain);
      } finally {
        plain.dispose();
      }
    }
    this.input.value = this.GetValue();
    this.selection.assign(this.engine.GetEditDoc().GetStartPaM());
  }

  /** Maps browser LF textarea offsets onto the native editor selection. @returns Nothing. */
  ReadSelection(): void {
    this.selection.assign(
      new EditSelection(
        this.Position(this.input.selectionStart),
        this.Position(this.input.selectionEnd),
      ),
    );
  }

  /** Applies a textarea edit without replacing unaffected rich text. @returns Nothing. */
  ReadInput(): void {
    const previous = this.GetValue();
    const value = this.input.value;
    let start = 0;
    let oldEnd = previous.length;
    let newEnd = value.length;
    while (start < oldEnd && start < newEnd && previous[start] === value[start]) start++;
    while (oldEnd > start && newEnd > start && previous[oldEnd - 1] === value[newEnd - 1]) {
      oldEnd--;
      newEnd--;
    }
    const inserted = unicode(value.slice(start, newEnd));
    try {
      this.ReplaceSelection(
        new EditSelection(this.Position(start), this.Position(oldEnd)),
        inserted,
      );
    } finally {
      inserted.dispose();
    }
  }

  /** Focuses the editor selected by the Writer comment manager. @returns Nothing. */
  MakeVisible(): void {
    this.input.focus({ preventScroll: true });
    this.input.scrollIntoView?.({ block: "nearest" });
    this.ShowCursor();
  }

  /** Updates the platform selection from native paragraph coordinates. @returns Nothing. */
  ShowCursor(): void {
    this.input.setSelectionRange(
      this.Offset(this.selection.Min()),
      this.Offset(this.selection.Max()),
    );
  }

  /** Inserts replacement text into the active native note selection. @param value - Replacement value. @returns Nothing. */
  InsertNoteText(value: OUStringConstReference): void {
    this.ReplaceSelection(this.selection, value);
  }

  /** Supplies native selection and drawing operations to the comment search owner. @returns Search view. */
  GetSearchView(): SearchEditView {
    return {
      /** Exposes the editor and selection to the search view. @returns Search editor. */
      getImpl: () => this,
      /** Uses the default output area for the native search callback. @returns Output area. */
      GetOutputArea: () => new Rectangle(),
      /** Leaves repainting to the platform textarea. @returns Nothing. */
      InvalidateWindow: () => {},
      /** Mirrors the search selection in the textarea. @returns Nothing. */
      ShowCursor: () => this.ShowCursor(),
      /** Replaces the current selection. @param value - Replacement text. @returns Nothing. */
      InsertText: (value) => this.InsertNoteText(value),
    };
  }

  /** Returns the actual comment selection. @returns Selected range. */
  GetEditSelection(): EditSelection {
    return this.selection;
  }

  /** Applies the original editor selection. @param value - Selection. @returns Nothing. */
  SetEditSelection(value: EditSelection): void {
    this.selection.assign(value);
  }

  /** The platform textarea paints its selected text. @returns Nothing. */
  DrawSelectionXOR(): void {}

  /** Uses the Writer document view for undo. @returns No separate shell. */
  GetViewShell(): null {
    return null;
  }

  /** Releases the native edit document. @returns Nothing. */
  Dispose(): void {
    this.engine.Dispose();
  }

  /** Replaces the actual editor range and publishes the new Writer field. @param selection - Note text range. @param value - Inserted text. @returns Nothing. */
  private ReplaceSelection(selection: EditSelection, value: OUStringConstReference): void {
    const before = this.field.GetPar2();
    const beforeObject = this.field.GetTextObject()?.Clone();
    const insertedEnd = this.engine.InsertText(selection, value);
    const after = this.GetValue();
    this.selection.assign(insertedEnd);
    this.input.value = after;
    this.ShowCursor();
    if (after === before) {
      beforeObject?.dispose();
      return;
    }
    const doc = this.engine.GetEditDoc();
    const afterObject = this.engine.CreateTextObject(
      new EditSelection(doc.GetStartPaM(), doc.GetEndPaM()),
      null,
    );
    const action = new AnnotationTextUndo(this.field, before, beforeObject, after, afterObject);
    const undo = this.field.GetTyp().GetDoc().GetUndoManager();
    this.storedText = after;
    action.Apply(after, afterObject, this.field);
    if (undo.DoesUndo()) undo.AddUndoAction(action);
    else action.Dispose();
  }

  /** Reads current native note text. @returns Browser value. */
  private GetValue(): string {
    const value = this.GetText();
    try {
      return text(value);
    } finally {
      value.dispose();
    }
  }

  /** Resolves a browser text offset against the actual edit paragraphs. @param offset - LF-delimited UTF-16 offset. @returns Native position. */
  private Position(offset: number): EditPaM {
    const doc = this.engine.GetEditDoc();
    for (let index = 0; index < doc.Count(); index++) {
      const node = doc.GetObject(index);
      if (!node) break;
      if (offset <= node.Len()) return new EditPaM(node, offset);
      offset -= node.Len() + 1;
    }
    return doc.GetEndPaM();
  }

  /** Resolves a native point in a browser textarea. @param position - Native position. @returns LF-delimited UTF-16 offset. */
  private Offset(position: EditPaM): number {
    const doc = this.engine.GetEditDoc();
    const paragraph = doc.GetPos(position.GetNode());
    let offset = position.GetIndex();
    for (let index = 0; index < paragraph; index++)
      offset += (doc.GetObject(index)?.Len() ?? 0) + 1;
    return offset;
  }
}

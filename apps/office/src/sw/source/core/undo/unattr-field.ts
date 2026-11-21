/** @fileoverview Writer insertion history for the annotation branch of field attributes. */
import type { SwFormatField } from "../../../inc/fmtfld";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwPostItField } from "../fields/docufld";
import { SwUndo, SwUndRng, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Records insertion of the native annotation's point and range in a single Writer action. */
export class SwUndoInsAnnotation extends SwUndo {
  private readonly range: SwUndRng;
  private format: SwFormatField | undefined;

  /** Stores the source selection and value for subsequent undo and redo. @param range - Current selection. @param field - Owned annotation value. @param before - Selection and pending properties before insertion. @returns Annotation edit. */
  constructor(
    range: SwPaM,
    private readonly field: SwPostItField,
    before: SwUndoCursorState,
  ) {
    super("Insert Comment", before, { ...before, tableSelection: false });
    this.range = new SwUndRng(range);
  }

  /** Borrows the model field to request the original comment focus. @returns Attached field. */
  GetFormat(): SwFormatField | undefined {
    return this.format;
  }

  /** Removes the inserted native point and the range it owns. @returns Nothing. */
  protected override UndoImpl(): void {
    const hint = this.format?.GetTextField();
    const owner = hint?.GetTextNode();
    if (!hint || !owner) throw new Error("Writer annotation insertion history has no field.");
    owner.EraseText(hint.GetStart(), 1);
    this.format = undefined;
  }

  /** Reattaches a field using its original numeric selection and cursor. @param context - Active history owner. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc();
    const node = doc.GetNodes().at(this.range.m_nSttNode);
    const point = new SwPosition(node, this.range.m_nSttContent);
    const range = new SwPaM(point);
    try {
      this.range.SetPaM(range);
      const format = doc.GetDocumentContentOperationsManager().InsertPostItField(range, this.field);
      this.format = format;
      const hint = format.GetTextField();
      const owner = hint?.GetTextNode();
      if (!hint || !owner) throw new Error("Writer insert did not attach an annotation.");
      this.field.SetName(format.GetField().GetName());
      point.Assign(owner, hint.GetStart());
      this.SetAfterCursorPosition(point);
    } finally {
      range.Dispose();
      point.Dispose();
    }
  }

  /** Releases the saved field and owned cursor properties. @returns Nothing. */
  public override Dispose(): void {
    this.field.Dispose();
    super.Dispose();
  }
}

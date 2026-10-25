/** @fileoverview Consumed DocFuncUtil attribute-only undo capture;native plain-string snapshots accompany EDITATTR;rich edit/notes/drawing spans remain unported. */
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScRange } from "../../../inc/address";
import type { ScMarkData } from "../../../inc/markdata";
import { InsertDeleteFlags } from "../../../inc/global";
/** Original Format/Standard snapshot copies all attributes rather than only HARDATTR;plain scalar cells have no rich EditEngine payload. @param doc - Actual document. @param marks - Original selected sheets/spans. @param range - Native affected range. @param onlyMarked - Copy disjoint marks. @param flags - Original delete flags. @returns Owned attribute undo document. */
export function createDeleteContentsUndoDoc(
  doc: ScDocument,
  marks: ScMarkData,
  range: ScRange,
  onlyMarked: boolean,
  flags: InsertDeleteFlags,
): ScDocument {
  const undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    tab = range.aStart.Tab();
  undo.InitUndo(doc, tab, tab);
  for (const selected of marks) if (selected !== tab) undo.AddUndoTab(selected, selected);
  const copy = new ScRange(range);
  copy.aStart.SetTab(0);
  copy.aEnd.SetTab(doc.GetTableCount() - 1);
  let copyFlags = flags;
  if (flags & InsertDeleteFlags.ATTRIB) copyFlags |= InsertDeleteFlags.ATTRIB;
  if (flags & InsertDeleteFlags.EDITATTR) copyFlags |= InsertDeleteFlags.STRING;
  if (flags & InsertDeleteFlags.NOTE) copyFlags |= InsertDeleteFlags.CONTENTS;
  copyFlags |= InsertDeleteFlags.NOCAPTIONS;
  doc.CopyToDocument(copy, copyFlags, onlyMarked, undo, marks);
  return undo;
}

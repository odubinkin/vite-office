/** @fileoverview Consumed DocFuncUtil attribute-only undo capture;native plain-string snapshots accompany EDITATTR;rich edit/notes/drawing spans remain unported. */
import { ScDocument } from "../../../inc/document";
import { ScRange } from "../../../inc/address";
import type { ScMarkData } from "../../../inc/markdata";
import { InsertDeleteFlags } from "../../../inc/global";
import { OUString } from "../../../../sal/inc/rtl/ustring";
/** Original Format/Standard snapshot copies all attributes rather than only HARDATTR;plain scalar cells have no rich EditEngine payload. @param doc - Actual document. @param marks - Original selected sheets/spans. @param range - Native affected range. @param onlyMarked - Copy disjoint marks. @param flags - Original delete flags. @returns Owned attribute undo document. */
export function createDeleteContentsUndoDoc(
  doc: ScDocument,
  marks: ScMarkData,
  range: ScRange,
  onlyMarked: boolean,
  flags: InsertDeleteFlags,
): ScDocument {
  const undo = new ScDocument(),
    name = new OUString();
  try {
    for (let tab = 0; tab < doc.GetTableCount(); tab++) {
      doc.GetName(tab, name);
      undo.InsertTab(tab, name);
    }
  } finally {
    name.dispose();
  }
  const copy = new ScRange(range);
  copy.aStart.SetTab(0);
  copy.aEnd.SetTab(doc.GetTableCount() - 1);
  const copyFlags =
    flags |
    InsertDeleteFlags.ATTRIB |
    InsertDeleteFlags.NOCAPTIONS |
    (flags & InsertDeleteFlags.EDITATTR ? InsertDeleteFlags.STRING : InsertDeleteFlags.NONE);
  doc.CopyToDocument(copy, copyFlags, onlyMarked, undo, marks);
  return undo;
}

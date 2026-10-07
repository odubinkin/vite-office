/** @fileoverview Native table rename from pinned docchart.cxx; formulas and OLE charts remain outside the implemented profile. */
import type { SwDoc } from "./doc";
import type { SwFrameFormat } from "../layout/atrfrm";
import { SwUndoRenameTable } from "../undo/untbl";

/** Renames the actual frame owner, admitting collisions through the document unique-name allocator. @param doc - Owning document. @param format - Native table frame. @param name - Requested raw name. @returns Nothing. */
export function SetTableName(doc: SwDoc, format: SwFrameFormat, name: string): void {
  const oldName = format.GetName();
  if (oldName === name) return;
  const newName =
    name === "" || doc.FindTableFormatByName(name) !== undefined ? doc.GetUniqueTableName() : name;
  doc.RunModelTransaction(
    /** Publishes the rename and its native history together. @returns Nothing. */ () => {
      format.SetFormatName(newName, true);
      const undo = doc.GetUndoManager();
      if (undo.DoesUndo()) undo.AddUndoAction(new SwUndoRenameTable(oldName, newName));
    },
  );
}

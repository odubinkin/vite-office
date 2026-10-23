/** @fileoverview Consumed paragraph GetItemSetForPreview/FillPreview and lcl_SwFormatToFlatItemSet from sw/source/uibase/app/docstyle.cxx; no alternate style pool. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwFormat } from "../../core/attr/format";
import type { SwDoc } from "../../core/doc/doc";
import { getWriterMaterializedParagraphStyleDefinition } from "../../../inc/poolfmt";

/** Copies root-first parent items before child overrides, leaving no temporary-parent references. @param format - Actual native format owner. @returns Independent flattened item set. */
export function flattenSwFormatForPreview(format: SwFormat): SfxItemSet {
  const sets: SfxItemSet[] = [format.GetAttrSet()];
  let parent = (sets[0] as SfxItemSet).GetParent();
  while (parent !== undefined) {
    sets.push(parent);
    parent = parent.GetParent();
  }
  const flattened = new SfxItemSet(sets.pop() as SfxItemSet);
  for (const set of sets.reverse()) flattened.PutSet(set);
  return flattened;
}

/** Uses actual owned styles, or creates/flattens/removes unused pool styles in the native FillPreview order. @param document - Real Writer document. @param id - Existing model identity or represented pool identity. @returns Native preview set, or no set for an unknown style. */
export function getParagraphStyleItemSetForPreview(
  document: SwDoc,
  id: string,
): SfxItemSet | undefined {
  const physical = document.FindTextFormatColl(id);
  if (physical !== undefined) return flattenSwFormatForPreview(physical);
  if (getWriterMaterializedParagraphStyleDefinition(id) === undefined) return undefined;
  const access = document.getIDocumentStylePoolAccess();
  const savedStyles = new Set(document.GetTextFormatColls());
  const undo = document.GetUndoManager();
  const recording = undo.DoesUndo();
  try {
    undo.DoUndo(false);
    const format = access.GetTextFormatColl(id);
    undo.DoUndo(recording);
    return flattenSwFormatForPreview(format);
  } finally {
    undo.DoUndo(false);
    try {
      // Native DeleteInfoStyles collects new table indices and deletes them from back to front.
      for (const format of [...access.GetTextFormatColls()].reverse()) {
        if (savedStyles.has(format)) continue;
        // This preview-only pool path emits no document edit notification: native callers disable
        // SetModified around FillPreview. Ordinary SwDoc::DelTextFormatColl remains an editing path.
        access.RemoveTextFormatColl(format);
        format.DisposeModify();
      }
    } finally {
      undo.DoUndo(recording);
    }
  }
}

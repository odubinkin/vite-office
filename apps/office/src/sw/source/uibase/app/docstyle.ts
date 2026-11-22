/** @fileoverview Writer style item exchange and paragraph previews from sw/source/uibase/app/docstyle.cxx. */
import { SID_ATTR_NUMBERING_RULE } from "../../../../editeng/inc/editids";
import { SvxNumBulletItem } from "../../../../editeng/inc/numitem";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import type { SwFormat } from "../../core/attr/format";
import type { SwDoc } from "../../core/doc/doc";
import { SwNumRule } from "../../core/doc/number";
import { GetNumRuleFromPool } from "../../core/doc/poolfmt-num";
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

/** Reads the Pseudo style family's native template input. @param document - Current owner. @param name - Named list style selected in the paragraph dialog. @returns Independent native item set for the style editor. */
export function getListStyleItemSet(document: SwDoc, name: string): SfxItemSet | undefined {
  const rule = GetNumRuleFromPool(document, name);
  if (!rule || rule.IsOutlineRule() || rule.IsAutoRule()) return undefined;
  const set = new SfxItemSet(document.GetAttrPool(), [
    [SID_ATTR_NUMBERING_RULE, SID_ATTR_NUMBERING_RULE],
  ]);
  set.Put(new SvxNumBulletItem(rule.MakeSvxNumRule()), true);
  return set;
}

/** Applies the Pseudo style family's accepted item or explicit default reset. @param document - Current owner. @param name - Native style name. @param set - Accepted style attributes. @returns Whether a rule change was applied. */
export function setListStyleItemSet(document: SwDoc, name: string, set: SfxItemSet): boolean {
  const rule = document.FindNumRulePtr(name);
  if (!rule || rule.IsOutlineRule() || rule.IsAutoRule()) return false;
  const input = set.GetItemIfSet(SID_ATTR_NUMBERING_RULE, false);
  const reset = set.GetItemState(SID_ATTR_NUMBERING_RULE, false) === SfxItemState.INVALID;
  if (!(input instanceof SvxNumBulletItem) && !reset) return false;
  const changed = reset ? new SwNumRule(name, "label-alignment") : new SwNumRule(rule);
  try {
    if (input instanceof SvxNumBulletItem) changed.SetSvxRule(input.GetNumRule(), document);
    document.ChgNumRuleFormats(changed);
    return true;
  } finally {
    changed.Dispose();
  }
}

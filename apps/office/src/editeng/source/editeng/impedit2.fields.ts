/** @fileoverview Original text-field value update for the no-layout document editor. */
import type { ContentNode } from "../../inc/ContentNode";
import { EE_FEATURE_FIELD } from "../../inc/eeitem";
import { EditCharAttribField } from "../../inc/editattr";
import type { SvxFieldItem } from "../../inc/flditem";
import type { ImpEditEngine } from "./impedit.lifecycle";

/** Refreshes field representations through the outer editor's original virtual call and invalidates changed paragraphs. @param engine - Actual editor. @returns Whether field values changed. */
export function UpdateFields(engine: ImpEditEngine): boolean {
  const doc = engine.GetEditDoc();
  let changed = false;
  for (let paragraph = 0; paragraph < doc.Count(); paragraph++) {
    const node = doc.GetObject(paragraph) as ContentNode;
    let paragraphChanged = false;
    for (const attribute of node.GetCharAttribs().GetAttribs()) {
      if (attribute.Which() !== EE_FEATURE_FIELD) continue;
      const field = attribute as EditCharAttribField;
      const previous = new EditCharAttribField(field);
      try {
        field.Reset();
        const value = engine
          .GetEditEnginePtr()
          .CalcFieldValue(
            field.GetItem() as SvxFieldItem,
            paragraph,
            field.GetStart(),
            field.GetTextColor(),
            field.GetFieldColor(),
            field.GetFldLineStyle(),
          );
        try {
          field.SetFieldValue(value);
          if (!field.equals(previous)) paragraphChanged = true;
        } finally {
          value.dispose();
        }
      } finally {
        previous.dispose();
      }
    }
    if (paragraphChanged) {
      changed = true;
      engine.GetParaPortions().getRef(paragraph).MarkSelectionInvalid(0);
    }
  }
  return changed;
}

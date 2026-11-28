/** @fileoverview Transfers Writer conditional and hidden text fields through the ODT Worker. */
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import { SwHiddenTextField, type SwHiddenTextFieldData } from "../../../source/core/fields/docufld";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

/** Structured clone representation of a native inline condition field. */
export interface WriterHiddenTextFieldRecord extends SwHiddenTextFieldData {
  readonly offset: number;
}

/** Copies the original field values from the native hints. @param node - Text node. @returns Worker records. */
export function encodeHiddenTextFields(node: SwTextNode): readonly WriterHiddenTextFieldRecord[] {
  const fields: WriterHiddenTextFieldRecord[] = [];
  for (const hint of node.GetpSwpHints()?.GetOrdinaryFields() ?? []) {
    const field = hint.GetAttr().GetField();
    if (field instanceof SwHiddenTextField)
      fields.push({ offset: hint.GetStart(), ...field.GetData() });
  }
  return fields;
}

/** Reattaches the fields to the restored text dummies. @param node - Text node. @param fields - Worker records. */
export function decodeHiddenTextFields(
  node: SwTextNode,
  fields: readonly WriterHiddenTextFieldRecord[] | undefined,
): void {
  if (fields === undefined) return;
  if (!Array.isArray(fields)) throw new Error("Stored Writer condition fields are invalid.");
  const type = node.GetDoc().getIDocumentFieldsAccess().GetHiddenTextFieldType();
  for (const field of fields as readonly WriterHiddenTextFieldRecord[]) {
    if (
      !field ||
      !Number.isInteger(field.offset) ||
      node.GetText()[field.offset] !== CH_TXTATR_BREAKWORD ||
      typeof field.conditional !== "boolean" ||
      typeof field.hidden !== "boolean" ||
      typeof field.condition !== "string" ||
      typeof field.trueContent !== "string" ||
      typeof field.falseContent !== "string" ||
      (field.currentPresentation !== undefined && typeof field.currentPresentation !== "string")
    )
      throw new Error("Stored Writer condition field is invalid.");
    const hint = new SwTextField(
      new SwFormatField(new SwHiddenTextField(type, field), RES_TXTATR_FIELD),
      field.offset,
    );
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer condition field could not be attached.");
  }
}

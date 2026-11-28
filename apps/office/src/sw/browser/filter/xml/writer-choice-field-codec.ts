/** @fileoverview Transfers native Writer JumpEdit and DropDown field points through the Worker. */
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import { SwJumpEditField, SwJumpEditFormat } from "../../../source/core/fields/docufld.jumpedit";
import { SwDropDownField, type SwDropDownFieldData } from "../../../source/core/fields/flddropdown";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

/** Worker representation of authored placeholder and drop-down point values. */
export type WriterChoiceFieldRecord =
  | {
      readonly kind: "placeholder";
      readonly offset: number;
      readonly format: SwJumpEditFormat;
      readonly text: string;
      readonly help: string;
    }
  | { readonly kind: "drop-down"; readonly offset: number; readonly data: SwDropDownFieldData };

/** Copies native field settings from their text anchors. @param node - Text owner. @returns Worker records. */
export function encodeChoiceFields(node: SwTextNode): readonly WriterChoiceFieldRecord[] {
  const hints = node.GetpSwpHints();
  const records: WriterChoiceFieldRecord[] = [];
  for (const hint of hints?.GetJumpEditFields() ?? []) {
    const field = hint.GetAttr().GetField();
    records.push({
      kind: "placeholder",
      offset: hint.GetStart(),
      format: field.GetFormat(),
      text: field.GetPar2(),
      help: field.GetPar1(),
    });
  }
  for (const hint of hints?.GetDropDownFields() ?? [])
    records.push({
      kind: "drop-down",
      offset: hint.GetStart(),
      data: hint.GetAttr().GetField().GetData(),
    });
  return records;
}

/** Reconnects the native fields over the serialized text dummies. @param node - Text owner. @param records - Worker records. @returns Nothing. */
export function decodeChoiceFields(
  node: SwTextNode,
  records: readonly WriterChoiceFieldRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer choice fields are invalid.");
  const types = node.GetDoc().getIDocumentFieldsAccess();
  for (const value of records as readonly WriterChoiceFieldRecord[]) {
    if (
      !value ||
      !Number.isInteger(value.offset) ||
      value.offset < 0 ||
      node.GetText()[value.offset] !== CH_TXTATR_BREAKWORD
    )
      throw new Error("Stored Writer choice field position is invalid.");
    let hint;
    if (value.kind === "placeholder") {
      if (
        !Number.isInteger(value.format) ||
        value.format < SwJumpEditFormat.Text ||
        value.format > SwJumpEditFormat.OLE ||
        typeof value.text !== "string" ||
        typeof value.help !== "string"
      )
        throw new Error("Stored Writer placeholder is invalid.");
      const field = new SwJumpEditField(
        types.GetJumpEditFieldType(),
        value.format,
        value.text,
        value.help,
      );
      hint = new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), value.offset);
    } else if (value.kind === "drop-down") {
      const data = value.data;
      if (
        !data ||
        !Array.isArray(data.items) ||
        data.items.some(
          /** Rejects non-string options. @param item - Transferred choice. @returns Whether invalid. */
          (item) => typeof item !== "string",
        ) ||
        typeof data.selectedItem !== "string" ||
        typeof data.name !== "string" ||
        typeof data.help !== "string" ||
        typeof data.toolTip !== "string"
      )
        throw new Error("Stored Writer drop-down is invalid.");
      hint = new SwTextField(
        new SwFormatField(
          new SwDropDownField(types.GetDropDownFieldType(), data),
          RES_TXTATR_FIELD,
        ),
        value.offset,
      );
    } else throw new Error("Stored Writer choice field is invalid.");
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer choice field could not be attached.");
  }
}

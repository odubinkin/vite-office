/** @fileoverview Transfers native Writer GetReference fields across the Worker boundary. */
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { RefFieldFormat } from "../../../inc/reffld";
import { ReferencesSubtype } from "../../../inc/reffldsubtype";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import { SwGetRefField, type SwGetRefFieldData } from "../../../source/core/fields/reffld";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

/** Primitive native reference field at its original dummy character. */
export interface WriterReferenceFieldRecord extends SwGetRefFieldData {
  readonly offset: number;
}

/** Copies the original reference field value and its paragraph coordinate. @param node - Native paragraph. @returns Detached reference fields. */
export function encodeReferenceFields(node: SwTextNode): readonly WriterReferenceFieldRecord[] {
  return (node.GetpSwpHints()?.GetReferenceFields() ?? []).map(
    /** Copies the native field record. @param hint - Actual hint. @returns Transport value. */
    (hint) => ({ ...hint.GetAttr().GetField().GetData(), offset: hint.GetStart() }),
  );
}

/** Reattaches the original reference fields to restored text. @param node - Destination paragraph. @param records - Optional native field records. */
export function decodeReferenceFields(
  node: SwTextNode,
  records: readonly WriterReferenceFieldRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer reference fields are invalid.");
  const type = node.GetDoc().getIDocumentFieldsAccess().GetReferenceFieldType();
  for (const record of records as readonly WriterReferenceFieldRecord[]) {
    if (
      !record ||
      !Number.isInteger(record.offset) ||
      record.offset < 0 ||
      node.GetText()[record.offset] !== CH_TXTATR_BREAKWORD ||
      typeof record.name !== "string" ||
      typeof record.language !== "string" ||
      typeof record.presentation !== "string" ||
      !Number.isInteger(record.format) ||
      RefFieldFormat[record.format] === undefined ||
      (record.source !== ReferencesSubtype.SetRefAttr &&
        record.source !== ReferencesSubtype.Bookmark) ||
      !Number.isInteger(record.flags) ||
      record.flags < 0 ||
      record.flags > 0xffff
    )
      throw new Error("Stored Writer reference field is invalid.");
    const field = new SwGetRefField(type, record);
    const hint = new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), record.offset);
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer reference field could not be attached.");
  }
}

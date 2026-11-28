/** @fileoverview Transfers native Writer date and time fields with their document-local format. */
import { SwDateTimeSubType } from "../../../inc/fldbas";
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import { SwDateTimeField } from "../../../source/core/fields/flddat";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import {
  decodeNumberFormat,
  encodeNumberFormat,
  type WriterNumberFormatRecord,
} from "./writer-table-value-codec";

/** Date/time field wire state at its original point position. */
export interface WriterDateTimeFieldRecord {
  readonly offset: number;
  readonly subtype: SwDateTimeSubType;
  readonly value: number;
  readonly adjust: number;
  readonly automaticLanguage: boolean;
  readonly numberFormat?: WriterNumberFormatRecord;
}

/** Records native fields without carrying process-specific number format identifiers. @param node - Source paragraph. @returns Portable fields. */
export function encodeDateTimeFields(node: SwTextNode): readonly WriterDateTimeFieldRecord[] {
  return (node.GetpSwpHints()?.GetDateTimeFields() ?? []).map(
    /** Snapshots one date/time value. @param hint - Native field hint. @returns Portable field. */
    (hint) => {
      const field = hint.GetAttr().GetField();
      const numberFormat = encodeNumberFormat(node.GetDoc(), field.GetFormat());
      return {
        offset: hint.GetStart(),
        subtype: field.GetSubType(),
        value: field.GetValue(),
        adjust: field.GetOffset(),
        automaticLanguage: field.IsAutomaticLanguage(),
        ...(numberFormat ? { numberFormat } : {}),
      };
    },
  );
}

/** Reattaches native fields at the transported dummy characters. @param node - Restored paragraph. @param records - Portable fields. @returns Nothing. */
export function decodeDateTimeFields(
  node: SwTextNode,
  records: readonly WriterDateTimeFieldRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer date/time fields are invalid.");
  const document = node.GetDoc();
  const type = document.getIDocumentFieldsAccess().GetDateTimeFieldType();
  for (const record of records as readonly WriterDateTimeFieldRecord[]) {
    if (
      !record ||
      !Number.isInteger(record.offset) ||
      record.offset < 0 ||
      node.GetText()[record.offset] !== CH_TXTATR_BREAKWORD ||
      !Number.isInteger(record.subtype) ||
      record.subtype < 2 ||
      record.subtype > 5 ||
      !Number.isFinite(record.value) ||
      !Number.isSafeInteger(record.adjust) ||
      typeof record.automaticLanguage !== "boolean"
    )
      throw new Error("Stored Writer date/time field is invalid.");
    const key =
      record.numberFormat === undefined ? 0 : decodeNumberFormat(document, record.numberFormat);
    const field = new SwDateTimeField(type, record.subtype, key);
    field.SetValue(record.value);
    field.SetOffset(record.adjust);
    field.SetAutomaticLanguage(record.automaticLanguage);
    const hint = new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), record.offset);
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer date/time field could not be attached.");
  }
}

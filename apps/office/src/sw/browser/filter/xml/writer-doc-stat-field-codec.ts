/** @fileoverview Browser Worker transfer of the native Writer document count field. */
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import { SwDocStatField, SwDocStatSubType } from "../../../source/core/fields/docufld";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

/** Portable state of one count field at its original model point. */
export interface WriterDocStatFieldRecord {
  readonly offset: number;
  readonly subtype: SwDocStatSubType;
  readonly numberingType: SvxNumType;
  readonly virtualPageCount: number;
}

/** Retains count fields and the virtual range from the originating layout. @param node - Source paragraph. @returns Transfer records. */
export function encodeDocStatFields(node: SwTextNode): readonly WriterDocStatFieldRecord[] {
  return (node.GetpSwpHints()?.GetDocStatFields() ?? []).map(
    /** Projects a native count hint. @param hint - Original field. @returns Portable count field. */
    (hint) => {
      const field = hint.GetAttr().GetField();
      return {
        offset: hint.GetStart(),
        subtype: field.GetSubType(),
        numberingType: field.GetFormat(),
        virtualPageCount: field.GetVirtPageCount(),
      };
    },
  );
}

/** Reconnects transferred native count fields at the original dummy characters. @param node - Restored paragraph. @param records - Stored fields. */
export function decodeDocStatFields(
  node: SwTextNode,
  records: readonly WriterDocStatFieldRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer statistics fields are invalid.");
  const type = node.GetDoc().getIDocumentFieldsAccess().GetDocStatFieldType();
  for (const record of records as readonly WriterDocStatFieldRecord[]) {
    if (
      !record ||
      !Number.isInteger(record.offset) ||
      record.offset < 0 ||
      node.GetText()[record.offset] !== CH_TXTATR_BREAKWORD ||
      !Number.isInteger(record.subtype) ||
      record.subtype < SwDocStatSubType.Page ||
      record.subtype > SwDocStatSubType.OLE ||
      !Number.isInteger(record.numberingType) ||
      record.numberingType < -32768 ||
      record.numberingType > 32767 ||
      !Number.isInteger(record.virtualPageCount) ||
      record.virtualPageCount < 0 ||
      record.virtualPageCount > 65535
    )
      throw new Error("Stored Writer statistic field is invalid.");
    const field = new SwDocStatField(
      type,
      record.subtype,
      record.numberingType,
      record.virtualPageCount,
    );
    const hint = new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), record.offset);
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer statistic field could not be attached.");
  }
}

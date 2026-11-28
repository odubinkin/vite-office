/** @fileoverview Transfers Writer document information fields at their native point hints. */
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import {
  docInfoServiceSubTypes,
  SwDocInfoField,
  SwDocInfoSubType,
} from "../../../source/core/fields/docufld";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

/** Original document information subtype, expansion and paragraph coordinate. */
export interface WriterDocInfoFieldRecord {
  readonly offset: number;
  readonly subtype: number;
  readonly presentation: string;
}

const supported = new Set<number>(Object.values(docInfoServiceSubTypes));

/** Copies native field values and point positions. @param node - Native paragraph. @returns Detached records. */
export function encodeDocInfoFields(node: SwTextNode): readonly WriterDocInfoFieldRecord[] {
  return (node.GetpSwpHints()?.GetDocInfoFields() ?? []).map(
    /** Captures the original dummy and field expansion. @param hint - Actual field hint. @returns Transfer record. */
    (hint) => {
      const field = hint.GetAttr().GetField();
      return { offset: hint.GetStart(), subtype: field.GetSubType(), presentation: field.Expand() };
    },
  );
}

/** Reattaches original fields at their existing markers. @param node - Destination paragraph. @param records - Optional fields. */
export function decodeDocInfoFields(
  node: SwTextNode,
  records: readonly WriterDocInfoFieldRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records))
    throw new Error("Stored Writer document information fields are invalid.");
  const type = node.GetDoc().getIDocumentFieldsAccess().GetDocInfoFieldType();
  for (const record of records as readonly WriterDocInfoFieldRecord[]) {
    if (
      !record ||
      !Number.isInteger(record.offset) ||
      record.offset < 0 ||
      node.GetText()[record.offset] !== CH_TXTATR_BREAKWORD ||
      typeof record.presentation !== "string" ||
      !Number.isInteger(record.subtype) ||
      record.subtype < 0 ||
      record.subtype > 0xffff ||
      !supported.has(record.subtype & ~SwDocInfoSubType.SubFixed)
    )
      throw new Error("Stored Writer document information field is invalid.");
    const field = new SwDocInfoField(type, record.subtype, record.presentation);
    const hint = new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), record.offset);
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer document information field could not be attached.");
  }
}

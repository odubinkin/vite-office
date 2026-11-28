/** @fileoverview Transfers Writer PageNumber and continuation points through the browser Worker. */
import type { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import {
  SwPageNumberField,
  SwPageNumSubType,
} from "../../../source/core/fields/docufld.pagenumber";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

/** Native PageNumber point and exact authored values. */
export interface WriterPageNumberFieldRecord {
  readonly offset: number;
  readonly subtype: SwPageNumSubType;
  readonly numberingType: SvxNumType;
  readonly adjustment: number;
  readonly userText: string;
  readonly expansion?: string;
}

/** Copies the owned fields and their cached formatted occurrences. @param node - Text owner. @returns Worker records. */
export function encodePageNumberFields(node: SwTextNode): readonly WriterPageNumberFieldRecord[] {
  return (node.GetpSwpHints()?.GetPageNumberFields() ?? []).map(
    /** Copies the authored field and optional source layout cache. @param hint - Native point. @returns Field record. */
    (hint) => {
      const field = hint.GetAttr().GetField();
      const expansion = field.GetCachedExpansion();
      return {
        offset: hint.GetStart(),
        subtype: field.GetSubType(),
        numberingType: field.GetFormat(),
        adjustment: field.GetOffset(),
        userText: field.GetUserString(),
        ...(expansion === undefined ? {} : { expansion }),
      };
    },
  );
}

/** Reattaches the detached field points over existing dummy characters. @param node - Restored text owner. @param records - Worker records. */
export function decodePageNumberFields(
  node: SwTextNode,
  records: readonly WriterPageNumberFieldRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer page number fields are invalid.");
  const type = node.GetDoc().getIDocumentFieldsAccess().GetPageNumberFieldType();
  for (const value of records as readonly WriterPageNumberFieldRecord[]) {
    if (
      !value ||
      !Number.isInteger(value.offset) ||
      value.offset < 0 ||
      node.GetText()[value.offset] !== CH_TXTATR_BREAKWORD ||
      !Number.isInteger(value.subtype) ||
      value.subtype < SwPageNumSubType.Random ||
      value.subtype > SwPageNumSubType.Previous ||
      !Number.isInteger(value.numberingType) ||
      value.numberingType < -32768 ||
      value.numberingType > 32767 ||
      !Number.isInteger(value.adjustment) ||
      value.adjustment < -32768 ||
      value.adjustment > 32767 ||
      typeof value.userText !== "string" ||
      (value.expansion !== undefined && typeof value.expansion !== "string")
    )
      throw new Error("Stored Writer page number field is invalid.");
    const field = new SwPageNumberField(
      type,
      value.subtype,
      value.numberingType,
      value.adjustment,
      value.userText,
      value.expansion,
    );
    const hint = new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), value.offset);
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer page number field could not be attached.");
  }
}

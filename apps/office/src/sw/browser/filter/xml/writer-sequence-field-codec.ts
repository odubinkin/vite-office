/** @fileoverview Transfers native Writer sequence fields across the browser Worker boundary. */
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import { SwSetExpField } from "../../../source/core/fields/expfld";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

/** A native numbered sequence point with its independent reference identity. */
export interface WriterSequenceFieldRecord {
  readonly offset: number;
  readonly name: string;
  readonly format: number;
  readonly formula: string;
  readonly sequenceNumber: number;
  readonly value: number;
  readonly presentation: string;
  readonly showFormula: boolean;
}

/** Transfers native owned sequence settings and caches. @param node - Actual text owner. @returns Worker record list. */
export function encodeSequenceFields(node: SwTextNode): readonly WriterSequenceFieldRecord[] {
  return (node.GetpSwpHints()?.GetSequenceFields() ?? []).map(
    /** Copies a field and its sequence master's name. @param hint - Native text point. @returns Field data. */
    (hint) => {
      const field = hint.GetAttr().GetField();
      return {
        offset: hint.GetStart(),
        name: field.GetTyp().GetName(),
        format: field.GetFormat(),
        formula: field.GetFormula(),
        sequenceNumber: field.GetSeqNumber(),
        value: field.GetValue(),
        presentation: field.GetExpStr(),
        showFormula: field.IsShowFormula(),
      };
    },
  );
}

/** Reconnects sequence points to the document's named masters. @param node - Restored text owner. @param records - Worker field records. */
export function decodeSequenceFields(
  node: SwTextNode,
  records: readonly WriterSequenceFieldRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer sequence fields are invalid.");
  const types = node.GetDoc().getIDocumentFieldsAccess();
  for (const value of records as readonly WriterSequenceFieldRecord[]) {
    if (
      !value ||
      !Number.isInteger(value.offset) ||
      value.offset < 0 ||
      node.GetText()[value.offset] !== CH_TXTATR_BREAKWORD ||
      typeof value.name !== "string" ||
      !Number.isInteger(value.format) ||
      typeof value.formula !== "string" ||
      !Number.isInteger(value.sequenceNumber) ||
      value.sequenceNumber < 0 ||
      value.sequenceNumber > 65535 ||
      typeof value.value !== "number" ||
      !Number.isFinite(value.value) ||
      typeof value.presentation !== "string" ||
      typeof value.showFormula !== "boolean"
    )
      throw new Error("Stored Writer sequence field is invalid.");
    const type = types.GetSequenceFieldType(value.name);
    const field = new SwSetExpField(type, value.formula, value.format, value.presentation);
    field.SetFormula(value.formula);
    field.SetSeqNumber(value.sequenceNumber);
    field.SetValue(value.value);
    field.ChgExpStr(value.presentation);
    field.SetShowFormula(value.showFormula);
    const hint = new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), value.offset);
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer sequence field could not be attached.");
  }
}

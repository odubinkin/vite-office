/** @fileoverview Reconnects Writer variable and user fields with their masters after Worker transport. */
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import type { SwDoc } from "../../../source/core/doc/doc";
import { SwGetExpField, SwGetSetExpType, SwSetExpField } from "../../../source/core/fields/expfld";
import { SwUserField } from "../../../source/core/fields/usrfld";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import {
  decodeNumberFormat,
  encodeNumberFormat,
  type WriterNumberFormatRecord,
} from "./writer-table-value-codec";

/** Named native masters ordered by their original registration. */
export type WriterVariableMasterRecord =
  | Readonly<{ family: "variable"; name: string; string: boolean }>
  | Readonly<{ family: "user"; name: string; expression: boolean; content: string; value: number }>;

/** A native variable occurrence at one UTF-16 text point. */
export type WriterVariableFieldRecord = Readonly<{
  offset: number;
  numberFormat?: WriterNumberFormatRecord;
  showFormula: boolean;
}> &
  (
    | Readonly<{ kind: "user"; name: string; visible: boolean }>
    | Readonly<{
        kind: "get";
        formula: string;
        subtype: SwGetSetExpType;
        presentation: string;
        value: number;
      }>
    | Readonly<{
        kind: "set";
        name: string;
        formula: string;
        presentation: string;
        value: number;
        visible: boolean;
        input: boolean;
        prompt: string;
      }>
  );

/** Records named masters, even when a field has no visible dependent occurrence. @param document - Writer owner. @returns Detached Worker records. */
export function encodeVariableMasters(document: SwDoc): WriterVariableMasterRecord[] {
  const fields = document.getIDocumentFieldsAccess();
  const records: WriterVariableMasterRecord[] = [];
  for (const type of fields.GetSetExpFieldTypes())
    if (type.GetType() !== SwGetSetExpType.Sequence)
      records.push({
        family: "variable",
        name: type.GetName(),
        string: type.GetType() === SwGetSetExpType.String,
      });
  for (const type of fields.GetUserFieldTypes())
    records.push({
      family: "user",
      name: type.name,
      expression: type.expression,
      content: type.content,
      value: type.value,
    });
  return records;
}

/** Restores the native named master registry before its text occurrences. @param document - Writer owner. @param records - Detached Worker records. @returns Nothing. */
export function decodeVariableMasters(
  document: SwDoc,
  records: readonly WriterVariableMasterRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer variable masters are invalid.");
  const fields = document.getIDocumentFieldsAccess();
  for (const record of records as readonly WriterVariableMasterRecord[]) {
    if (!record || typeof record.name !== "string")
      throw new Error("Stored Writer variable master is invalid.");
    if (record.family === "variable" && typeof record.string === "boolean") {
      fields.GetSetExpFieldType(
        record.name,
        record.string ? SwGetSetExpType.String : SwGetSetExpType.Expr,
      );
    } else if (
      record.family === "user" &&
      typeof record.expression === "boolean" &&
      typeof record.content === "string" &&
      Number.isFinite(record.value)
    ) {
      const type = fields.GetUserFieldType(record.name);
      type.expression = record.expression;
      type.content = record.content;
      type.value = record.value;
    } else throw new Error("Stored Writer variable master is invalid.");
  }
}

/** Records each supported occurrence with a portable formatter definition. @param node - Text owner. @returns Detached Worker records. */
export function encodeVariableFields(node: SwTextNode): WriterVariableFieldRecord[] {
  const records: WriterVariableFieldRecord[] = [];
  const document = node.GetDoc();
  for (const hint of node.GetpSwpHints()?.GetOrdinaryFields() ?? []) {
    const field = hint.GetAttr().GetField();
    const offset = hint.GetStart();
    if (field instanceof SwUserField) {
      const numberFormat = encodeNumberFormat(document, field.format);
      records.push({
        kind: "user",
        offset,
        name: field.type.name,
        visible: field.visible,
        showFormula: field.showFormula,
        ...(numberFormat ? { numberFormat } : {}),
      });
    } else if (field instanceof SwGetExpField) {
      const numberFormat = encodeNumberFormat(document, field.format);
      records.push({
        kind: "get",
        offset,
        formula: field.formula,
        subtype: field.subtype,
        presentation: field.GetExpStr(),
        value: field.value,
        showFormula: field.showFormula,
        ...(numberFormat ? { numberFormat } : {}),
      });
    } else if (field instanceof SwSetExpField && !field.IsSequenceField()) {
      const numberFormat = encodeNumberFormat(document, field.GetFormat());
      records.push({
        kind: "set",
        offset,
        name: field.GetTyp().GetName(),
        formula: field.GetFormula(),
        presentation: field.GetExpStr(),
        value: field.GetValue(),
        showFormula: field.IsShowFormula(),
        visible: field.IsVisible(),
        input: field.IsInput(),
        prompt: field.GetPromptText(),
        ...(numberFormat ? { numberFormat } : {}),
      });
    }
  }
  return records;
}

/** Reconnects fields at their original text points. @param node - Restored text owner. @param records - Detached Worker records. @returns Nothing. */
export function decodeVariableFields(
  node: SwTextNode,
  records: readonly WriterVariableFieldRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer variable fields are invalid.");
  for (const record of records as readonly WriterVariableFieldRecord[]) {
    if (
      !record ||
      !Number.isInteger(record.offset) ||
      node.GetText()[record.offset] !== CH_TXTATR_BREAKWORD ||
      typeof record.showFormula !== "boolean"
    )
      throw new Error("Stored Writer variable field is invalid.");
    const hint = restoreVariableField(node, record);
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer variable field could not be attached.");
  }
}

/** Builds the original typed hint for a validated Worker record. @param node - Text owner. @param record - Occurrence data. @returns Native text hint. */
function restoreVariableField(node: SwTextNode, record: WriterVariableFieldRecord) {
  const document = node.GetDoc();
  const fields = document.getIDocumentFieldsAccess();
  const format =
    record.numberFormat === undefined ? 0 : decodeNumberFormat(document, record.numberFormat);
  if (
    record.kind === "user" &&
    typeof record.name === "string" &&
    typeof record.visible === "boolean"
  ) {
    const type = fields.FindUserFieldType(record.name);
    if (type)
      return new SwTextField(
        new SwFormatField(
          new SwUserField(type, format, record.visible, record.showFormula),
          RES_TXTATR_FIELD,
        ),
        record.offset,
      );
  } else if (
    record.kind === "get" &&
    typeof record.formula === "string" &&
    typeof record.presentation === "string" &&
    Number.isFinite(record.value) &&
    (record.subtype === SwGetSetExpType.Expr ||
      record.subtype === SwGetSetExpType.Formula ||
      record.subtype === SwGetSetExpType.String)
  ) {
    const field = new SwGetExpField(
      fields.GetGetExpFieldType(),
      record.formula,
      record.subtype,
      format,
      record.showFormula,
      record.presentation,
      record.value,
    );
    return new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), record.offset);
  } else if (
    record.kind === "set" &&
    typeof record.name === "string" &&
    typeof record.formula === "string" &&
    typeof record.presentation === "string" &&
    Number.isFinite(record.value) &&
    typeof record.visible === "boolean" &&
    typeof record.input === "boolean" &&
    typeof record.prompt === "string"
  ) {
    const type = fields.FindSetExpFieldType(record.name);
    if (type && type.GetType() !== SwGetSetExpType.Sequence) {
      const field = new SwSetExpField(type, record.formula, format);
      field.SetValue(record.value);
      field.ChgExpStr(record.presentation);
      field.SetShowFormula(record.showFormula);
      field.SetVisible(record.visible);
      field.SetInput(record.input);
      field.SetPromptText(record.prompt);
      return new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), record.offset);
    }
  }
  throw new Error("Stored Writer variable field is invalid.");
}

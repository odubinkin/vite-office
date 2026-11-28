/** @fileoverview Transfers native reference mark hints with their original Writer paragraph. */
import { CH_TXTATR_INWORD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwFormatRefMark, SwTextRefMark } from "../../../source/core/txtnode/atrref";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

/** Primitive paragraph-owned reference mark record. */
export interface WriterReferenceMarkRecord {
  readonly start: number;
  readonly end?: number;
  readonly name: string;
  readonly dontExpand: boolean;
}

/** Copies the original name, offsets and mutable expansion flag. @param node - Paragraph. @returns Detached reference marks. */
export function encodeReferenceMarks(node: SwTextNode): readonly WriterReferenceMarkRecord[] {
  const records: WriterReferenceMarkRecord[] = [];
  for (const hint of node.GetpSwpHints()?.GetReferenceMarks() ?? []) {
    const end = hint.GetEnd();
    records.push({
      start: hint.GetStart(),
      ...(end === undefined ? {} : { end }),
      name: hint.GetAttr().GetRefName(),
      dontExpand: hint.dontExpand,
    });
  }
  return records;
}

/** Reattaches each mark against the already restored text. @param node - Actual paragraph. @param records - Optional reference marks. @returns Nothing. */
export function decodeReferenceMarks(
  node: SwTextNode,
  records: readonly WriterReferenceMarkRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer reference marks are invalid.");
  for (const record of records as readonly WriterReferenceMarkRecord[]) {
    if (
      !record ||
      typeof record.name !== "string" ||
      typeof record.dontExpand !== "boolean" ||
      !Number.isInteger(record.start) ||
      record.start < 0 ||
      record.start > node.Len() ||
      (record.end === undefined
        ? node.GetText()[record.start] !== CH_TXTATR_INWORD
        : !Number.isInteger(record.end) || record.end < record.start || record.end > node.Len())
    )
      throw new Error("Stored Writer reference mark is invalid.");
    const hint = new SwTextRefMark(new SwFormatRefMark(record.name), record.start, record.end);
    hint.SetDontExpand(record.dontExpand);
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer reference mark could not be attached.");
  }
}

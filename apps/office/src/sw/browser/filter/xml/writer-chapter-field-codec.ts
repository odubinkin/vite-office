/** @fileoverview Transfers native Writer chapter-field points through the browser Worker. */
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import {
  SwChapterField,
  SwChapterFormat,
  type SwChapterFieldState,
} from "../../../source/core/fields/chpfld";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

/** Native chapter point, authored display format and current expansion state. */
export interface WriterChapterFieldRecord {
  readonly offset: number;
  readonly format: SwChapterFormat;
  readonly level: number;
  readonly state: SwChapterFieldState;
}

/** Copies the native Chapter fields at the text node's dummy positions. @param node - Text owner. @returns Worker records. */
export function encodeChapterFields(node: SwTextNode): readonly WriterChapterFieldRecord[] {
  return (node.GetpSwpHints()?.GetChapterFields() ?? []).map(
    /** Copies chapter settings and layout values. @param hint - Attached chapter point. @returns Field record. */
    (hint) => {
      const field = hint.GetAttr().GetField();
      return {
        offset: hint.GetStart(),
        format: field.GetFormat(),
        level: field.GetLevel(),
        state: field.GetState(),
      };
    },
  );
}

/** Reconnects chapter fields to the target model over its existing dummy characters. @param node - Restored text owner. @param records - Worker records. */
export function decodeChapterFields(
  node: SwTextNode,
  records: readonly WriterChapterFieldRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer chapter fields are invalid.");
  const type = node.GetDoc().getIDocumentFieldsAccess().GetChapterFieldType();
  for (const value of records as readonly WriterChapterFieldRecord[]) {
    const state = value?.state;
    if (
      !value ||
      !Number.isInteger(value.offset) ||
      value.offset < 0 ||
      node.GetText()[value.offset] !== CH_TXTATR_BREAKWORD ||
      !Number.isInteger(value.format) ||
      value.format < SwChapterFormat.Number ||
      value.format > SwChapterFormat.NumberNoPrePostAndTitle ||
      !Number.isInteger(value.level) ||
      value.level < 0 ||
      value.level > 0xff ||
      typeof state?.number !== "string" ||
      typeof state.title !== "string" ||
      typeof state.prefix !== "string" ||
      typeof state.suffix !== "string" ||
      typeof state.followedBy !== "string"
    )
      throw new Error("Stored Writer chapter field is invalid.");
    const field = new SwChapterField(type, value.format, value.level, state);
    const hint = new SwTextField(new SwFormatField(field, RES_TXTATR_FIELD), value.offset);
    if (!node.InsertHint(hint, SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer chapter field could not be attached.");
  }
}

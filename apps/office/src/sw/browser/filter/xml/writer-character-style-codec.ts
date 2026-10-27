/** @fileoverview Preserves actual Writer character-format identity and derivation at the browser graph boundary. */
import { SwCharFormat } from "../../../inc/charfmt";
import type { SwDoc } from "../../../source/core/doc/doc";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { encodeSfxItemSet, decodeSfxItemSet } from "./item-codec";

/** Primitive owned-style record; indices retain identity even when native UI names repeat. */
export interface WriterCharacterStyleRecord {
  readonly name: string;
  readonly poolId: number;
  readonly automatic: boolean;
  readonly parent?: number;
  readonly items: readonly SfxPoolItemSnapshot[];
}
/** Encodes document-owned formats in creation order, including the default owner. @param doc - Actual model. @returns Primitive records. */
export function encodeCharacterStyles(doc: SwDoc): readonly WriterCharacterStyleRecord[] {
  const formats = doc.GetCharFormats();
  return formats.map(
    /** Projects one native style without flattening its inherited items. @param format - Owner. @returns Primitive style. */
    (format) => {
      const parent = format.DerivedFrom();
      const index = parent === undefined ? undefined : formats.indexOf(parent as SwCharFormat);
      if (index === -1) throw new Error("Writer character style has a foreign parent.");
      return {
        name: format.GetName(),
        poolId: format.GetPoolFormatId(),
        automatic: format.IsAuto(),
        ...(index === undefined ? {} : { parent: index }),
        items: encodeSfxItemSet(format.GetAttrSet()),
      };
    },
  );
}
/** Restores all owners before linking parents, avoiding name-based merging or recomputed pool defaults. @param doc - Destination. @param records - Current or absent legacy graph field. @returns Nothing. */
export function restoreCharacterStyles(
  doc: SwDoc,
  records: readonly WriterCharacterStyleRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records) || records.length === 0)
    throw new Error("Stored Writer character styles are invalid.");
  for (const record of records) {
    if (
      record === null ||
      typeof record !== "object" ||
      typeof record.name !== "string" ||
      !Number.isInteger(record.poolId) ||
      record.poolId < 0 ||
      record.poolId > 65535 ||
      typeof record.automatic !== "boolean" ||
      !Array.isArray(record.items) ||
      (record.parent !== undefined &&
        (!Number.isInteger(record.parent) || record.parent < 0 || record.parent >= records.length))
    )
      throw new Error("Stored Writer character style is invalid.");
  }
  for (let index = 0; index < records.length; index++) {
    const visited = new Set<number>();
    let next: number | undefined = index;
    while (next !== undefined) {
      if (visited.has(next)) throw new Error("Stored Writer character style derivation is cyclic.");
      visited.add(next);
      next = records[next]?.parent;
    }
  }
  if (records[0]?.parent !== undefined)
    throw new Error("Stored Writer default character style has a parent.");
  for (const [index, record] of records.entries()) {
    const format =
      index === 0 ? doc.GetDfltCharFormat() : doc.MakeCharFormat(record.name, undefined);
    format.SetFormatName(record.name);
    format.SetPoolFormatId(record.poolId);
    format.SetAuto(record.automatic);
    format.ResetAllFormatAttr();
    decodeSfxItemSet(format.GetAttrSet(), record.items);
  }
  records.forEach(
    /** Links the exact native parent owner after creation. @param record - Primitive style. @param index - Native table position. @returns Nothing. */
    (record, index) => {
      const format = doc.GetCharFormats()[index];
      if (format === undefined) throw new Error("Stored Writer character style owner is absent.");
      format.SetDerivedFrom(
        record.parent === undefined ? undefined : doc.GetCharFormats()[record.parent],
      );
    },
  );
}
/** Encodes an optional actual style pointer as a document table position. @param doc - Owner. @param format - Registered native owner. @returns Index or undefined. */
export function encodeCharacterStyleReference(
  doc: SwDoc,
  format: SwCharFormat | undefined,
): number | undefined {
  if (format === undefined) return undefined;
  const index = doc.GetCharFormats().indexOf(format);
  if (index < 0) throw new Error("Writer character format belongs to another document.");
  return index;
}
/** Resolves a validated optional style reference. @param doc - Destination. @param index - Primitive index. @returns Actual owner or undefined. */
export function decodeCharacterStyleReference(
  doc: SwDoc,
  index: number | undefined,
): SwCharFormat | undefined {
  if (index === undefined) return undefined;
  if (!Number.isInteger(index) || index < 0 || index >= doc.GetCharFormats().length)
    throw new Error("Stored Writer character format reference is invalid.");
  return doc.GetCharFormats()[index];
}

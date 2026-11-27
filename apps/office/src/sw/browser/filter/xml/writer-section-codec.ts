/** @fileoverview Browser transport of native Writer section data and direct format items. */
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { RES_CNTNT } from "../../../inc/hintids";
import type { SwDoc } from "../../../source/core/doc/doc";
import type { SwSectionNode } from "../../../source/core/docnode/ndsect";
import type { SwNode } from "../../../source/core/docnode/node";
import { SectionType, SwSectionData } from "../../../source/core/docnode/section";
import { decodeSfxPoolItem, encodeSfxPoolItem } from "./item-codec";

/** Worker section properties with no node index or UNO identity in the record. */
export interface WriterSectionRecord {
  readonly name: string;
  readonly type: SectionType;
  readonly condition: string;
  readonly hidden: boolean;
  readonly condHidden: boolean;
  readonly password: readonly number[];
  readonly linkFileName: string;
  readonly format: readonly SfxPoolItemSnapshot[];
}

/** Encodes the content section's own data and direct attributes. @param node - Native section owner. @returns Cloneable properties. */
export function encodeSection(node: SwSectionNode): WriterSectionRecord {
  const section = node.GetSection();
  const data = section.GetSectionData();
  const format: SfxPoolItemSnapshot[] = [];
  for (const item of section.GetFormat().GetAttrSet().entries()) {
    if (item.Which() !== RES_CNTNT) format.push(encodeSfxPoolItem(item));
  }
  return {
    name: data.name,
    type: data.type,
    condition: data.condition,
    hidden: data.hidden,
    condHidden: data.condHidden,
    password: Array.from(data.password),
    linkFileName: data.linkFileName,
    format,
  };
}

/** Recreates the native section at an existing structural insertion boundary. @param document - Destination document. @param position - Existing position after the new section. @param record - Stored properties. @returns Actual connected section owner. */
export function decodeSection(
  document: SwDoc,
  position: SwNode,
  record: WriterSectionRecord,
): SwSectionNode {
  if (
    (record.type !== SectionType.Content && record.type !== SectionType.FileLink) ||
    typeof record.name !== "string" ||
    typeof record.condition !== "string" ||
    typeof record.hidden !== "boolean" ||
    typeof record.condHidden !== "boolean" ||
    typeof record.linkFileName !== "string" ||
    !Array.isArray(record.password) ||
    !record.password.every(
      /** Checks one original octet before restoring the native digest. @param byte - Stored value. @returns Whether it is an octet. */
      (byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255,
    ) ||
    !Array.isArray(record.format)
  )
    throw new Error("Stored Writer text section is invalid.");
  const data = new SwSectionData(record.type, record.name);
  data.condition = record.condition;
  data.hidden = record.hidden;
  data.condHidden = record.condHidden;
  data.password = new Uint8Array(record.password);
  data.linkFileName = record.linkFileName;
  const section = document.GetNodes().InsertTextSection(position, data);
  const format = section.GetSection().GetFormat();
  for (const value of record.format) {
    if (value.which === RES_CNTNT)
      throw new Error("Stored Writer section cannot own a node index.");
    const item = decodeSfxPoolItem(document.GetAttrPool(), value);
    try {
      format.SetFormatAttr(item);
    } finally {
      item.Dispose();
    }
  }
  return section;
}

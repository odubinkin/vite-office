/** @fileoverview Browser-only transfer of canonical four-page-frame item sets and native usage/default-grid state; core page descriptors never own a parallel JSON geometry catalog. */
import {
  type SwPageDesc,
  validateWriterPageDescriptor,
} from "../../../source/core/layout/pagedesc";
import type { SwDoc } from "../../../source/core/doc/doc";
import { RES_TEXTGRID } from "../../../inc/hintids";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import {
  encodeSfxItemSet,
  encodeSfxPoolItem,
  decodeSfxItemSet,
  decodeSfxPoolItem,
} from "./item-codec";

/** Page geometry/follow identity stays in its existing record; this record carries canonical item deltas and usage flags. */
export interface WriterPageFormatRecord {
  readonly useOn: number;
  readonly formats: readonly (readonly SfxPoolItemSnapshot[])[];
  readonly names?: readonly string[];
}
/** Serializes the four actual frame item sets without flattening inherited/default attributes. @param page - Native descriptor. @returns Record. */
export function encodePageFormats(page: SwPageDesc): WriterPageFormatRecord {
  return {
    names: [page.GetMaster(), page.GetLeft(), page.GetFirstMaster(), page.GetFirstLeft()].map(
      /** Copies independent original frame-format names. @param frame - Frame. @returns Name. */ (
        frame,
      ) => frame.GetName(),
    ),
    useOn: page.ReadUseOn(),
    formats: [page.GetMaster(), page.GetLeft(), page.GetFirstMaster(), page.GetFirstLeft()].map(
      /** Serializes native direct items only. @param format - Frame. @returns Snapshots. */ (
        format,
      ) => encodeSfxItemSet(format.GetAttrSet()),
    ),
  };
}
/** Restores four independent canonical sets; omitted data is the existing pre-frame-record browser format. @param page - Descriptor. @param candidate - Untrusted boundary value. @returns Nothing. */
export function restorePageFormats(page: SwPageDesc, candidate: unknown): void {
  if (candidate === undefined) return;
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    !("useOn" in candidate) ||
    !("formats" in candidate) ||
    typeof candidate.useOn !== "number" ||
    !Number.isInteger(candidate.useOn) ||
    candidate.useOn < 0 ||
    candidate.useOn > 65535 ||
    !Array.isArray(candidate.formats) ||
    candidate.formats.length !== 4
  )
    throw new Error("Writer page format record is invalid.");
  const frames = [page.GetMaster(), page.GetLeft(), page.GetFirstMaster(), page.GetFirstLeft()];
  if (
    "names" in candidate &&
    (!Array.isArray(candidate.names) ||
      candidate.names.length !== 4 ||
      candidate.names.some(
        /** Validates original logical names. @param name - Name. @returns Invalid. */ (name) =>
          typeof name !== "string",
      ))
  )
    throw new Error("Writer page frame names are invalid.");
  for (let index = 0; index < 4; ++index) {
    const frame = frames[index] as (typeof frames)[number],
      row: unknown = candidate.formats[index];
    if ("names" in candidate) frame.SetFormatName((candidate.names as string[])[index] as string);
    if (!Array.isArray(row)) throw new Error("Writer page frame items are invalid.");
    const seen = new Set<number>();
    for (const item of row) {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof item.which !== "number" ||
        !Number.isInteger(item.which) ||
        seen.has(item.which) ||
        !frame
          .GetAttrSet()
          .GetRanges()
          .some(
            /** Checks actual frame admission ranges. @param range - Range. @returns Admission. */ ([
              first,
              last,
            ]) => item.which >= first && item.which <= last,
          )
      )
        throw new Error("Writer page frame item identity is invalid.");
      seen.add(item.which);
    }
    frame.ResetAllFormatAttr();
    decodeSfxItemSet(frame.GetAttrSet(), row as SfxPoolItemSnapshot[]);
  }
  page.WriteUseOn(candidate.useOn);
  validateWriterPageDescriptor(page.GetValue());
}
/** Encodes a real document-pool grid override; absence retains native static defaults. @param doc - Document. @returns Snapshot or undefined. */
export function encodeTextGridDefault(doc: SwDoc): SfxPoolItemSnapshot | undefined {
  const item = doc.GetAttrPool().GetUserDefaultItem(RES_TEXTGRID);
  return item === null ? undefined : encodeSfxPoolItem(item);
}
/** Restores the native pool override before page frames are resolved. @param doc - Document. @param candidate - Optional snapshot. @returns Nothing. */
export function restoreTextGridDefault(doc: SwDoc, candidate: unknown): void {
  if (candidate === undefined) return;
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    !("which" in candidate) ||
    candidate.which !== RES_TEXTGRID ||
    !("value" in candidate)
  )
    throw new Error("Writer default grid record is invalid.");
  doc
    .GetAttrPool()
    .SetUserDefaultItem(decodeSfxPoolItem(doc.GetAttrPool(), candidate as SfxPoolItemSnapshot));
}

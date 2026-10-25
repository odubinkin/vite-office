/** @fileoverview Browser-owned page descriptor snapshots distinguish native absent and zero offsets without JSON in core QueryValue. */
import { SwFormatPageDesc } from "../../../source/core/attr/fmtpdsc";
import { RES_PAGEDESC } from "../../../inc/hintids";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
/** Encodes an independent structured-clone record. @param item - Native descriptor. @returns Named scalar snapshot. */
export function encodePageDesc(item: SwFormatPageDesc): SfxPoolItemSnapshot {
  const offset = item.GetNumOffset();
  return {
    which: item.Which(),
    value: { name: item.GetPageDescName(), ...(offset === undefined ? {} : { numOffset: offset }) },
  };
}
/** Decodes current named fields and historical pairs at the browser boundary. @param snapshot - Current or historical worker record. @returns Native item or undefined for another Which. */
export function decodePageDesc(snapshot: SfxPoolItemSnapshot): SwFormatPageDesc | undefined {
  if (snapshot.which !== RES_PAGEDESC) return undefined;
  const value = snapshot.value;
  // Historical pairs used zero as absence;new named snapshots preserve a genuine zero.
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    typeof value[1] === "number"
  )
    return new SwFormatPageDesc(value[0], value[1] === 0 ? undefined : value[1]);
  if (typeof value !== "object" || Array.isArray(value))
    throw Error("Writer page descriptor snapshot is invalid.");
  const record = value as { readonly name?: unknown; readonly numOffset?: unknown };
  if (
    typeof record.name !== "string" ||
    (record.numOffset !== undefined && typeof record.numOffset !== "number")
  )
    throw Error("Writer page descriptor snapshot is invalid.");
  return new SwFormatPageDesc(record.name, record.numOffset);
}

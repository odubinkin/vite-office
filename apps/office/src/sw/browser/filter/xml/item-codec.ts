/**
 * @fileoverview Worker transfer codec for the bounded SfxPoolItem graph.
 * Core items expose values and equality only; JSON type discrimination lives here.
 */

import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUnoAnyItem } from "../../../../sfx2/source/view/frame";
import { type SfxPoolItem, type SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { normalizeWriterHyperlink, SwFormatINetFormat } from "../../../source/core/txtnode/fmtatr2";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";

/** Encodes one pooled item without adding persistence methods to the model class. @param item - Core item. @returns JSON record. */
export function encodeSfxPoolItem(item: SfxPoolItem): SfxPoolItemSnapshot {
  if (item instanceof SfxUnoAnyItem)
    throw new Error("SfxUnoAnyItem is a request argument and cannot be persisted.");
  const value = item.QueryValue();
  if (!isSfxPoolItemValue(value)) throw new Error("SfxPoolItem is not persistence-safe.");
  return {
    value,
    which: item.Which(),
  };
}

/** Narrows values supported by the browser/filter persistence record. @param value - Candidate item value. @returns Whether JSON-safe. */
function isSfxPoolItemValue(value: unknown): value is SfxPoolItemSnapshot["value"] {
  return (
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    typeof value === "string" ||
    (Array.isArray(value) && value.every(isSfxPoolItemValue)) ||
    (typeof value === "object" &&
      value !== null &&
      Object.getPrototypeOf(value) === Object.prototype &&
      Object.values(value).every(isSfxPoolItemValue))
  );
}

/** Encodes direct deltas in ascending WhichId order. @param set - Core item set. @returns JSON records. */
export function encodeSfxItemSet(set: SfxItemSet): readonly SfxPoolItemSnapshot[] {
  return set.entries().map(encodeSfxPoolItem);
}

/** Restores one item via the document pool's registered concrete factory. @param pool - Destination pool. @param snapshot - Current-schema record. @returns Core item. */
export function decodeSfxPoolItem(pool: SfxItemPool, snapshot: SfxPoolItemSnapshot): SfxPoolItem {
  return pool.CreateItem(snapshot);
}

/** Restores direct deltas into an existing set. @param set - Destination set. @param snapshots - Current-schema records. @returns Nothing. */
export function decodeSfxItemSet(set: SfxItemSet, snapshots: readonly SfxPoolItemSnapshot[]): void {
  for (const snapshot of snapshots) set.Put(decodeSfxPoolItem(set.GetPool(), snapshot));
}

/** Decodes the Writer hyperlink item at the browser persistence boundary. @param snapshot - Stored item. @returns Hyperlink item. */
export function decodeSwFormatINetFormat(snapshot: SfxPoolItemSnapshot): SwFormatINetFormat {
  if (snapshot.which !== RES_TXTATR_INETFMT || typeof snapshot.value !== "string")
    throw new Error("SwFormatINetFormat snapshot is invalid.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(snapshot.value);
  } catch {
    throw new Error("SwFormatINetFormat snapshot is invalid.");
  }
  const hyperlink = normalizeWriterHyperlink(parsed);
  if (hyperlink === undefined) throw new Error("SwFormatINetFormat snapshot is invalid.");
  return new SwFormatINetFormat(hyperlink);
}

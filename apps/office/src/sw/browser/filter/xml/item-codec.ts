/**
 * @fileoverview Worker transfer codec for the bounded SfxPoolItem graph.
 * Core items expose values and equality only; JSON type discrimination lives here.
 */

import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUnoAnyItem } from "../../../../sfx2/source/view/frame";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import { type SfxPoolItem, type SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import {
  normalizeWriterHyperlink,
  SwFormatINetFormat,
  type WriterHyperlink,
} from "../../../source/core/txtnode/fmtatr2";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { SwPoolFormatId } from "../../../inc/poolfmt";

/** Browser-owned internet value record; omitted native IDs retain the existing ZERO contract. */
export interface WriterInternetFormatRecord extends WriterHyperlink {
  readonly inetFormatId?: number;
  readonly visitedFormatId?: number;
}

/** Encodes native internet strings and independent style identities without retaining an item backlink. @param item - Native internet item. @returns Cloneable value record. */
export function encodeSwFormatINetFormatRecord(
  item: SwFormatINetFormat,
): WriterInternetFormatRecord {
  const normal = item.GetINetFormatId(),
    visited = item.GetVisitedFormatId();
  return {
    ...item.GetHyperlink(),
    ...(normal === SwPoolFormatId.ZERO ? {} : { inetFormatId: normal }),
    ...(visited === SwPoolFormatId.ZERO ? {} : { visitedFormatId: visited }),
  };
}

/** Restores the supported native internet fields at a browser boundary. @param candidate - Untrusted cloneable record. @returns Detached native item. */
export function decodeSwFormatINetFormatRecord(candidate: unknown): SwFormatINetFormat {
  const hyperlink = normalizeWriterHyperlink(candidate);
  if (hyperlink === undefined) throw new Error("SwFormatINetFormat snapshot is invalid.");
  const value = candidate as Record<string, unknown>;
  const normal = decodeInternetStyleId(value.inetFormatId),
    visited = decodeInternetStyleId(value.visitedFormatId);
  const item = new SwFormatINetFormat(hyperlink);
  item.SetINetFormatAndId(item.GetINetFormat(), normal);
  item.SetVisitedFormatAndId(item.GetVisitedFormat(), visited);
  return item;
}

/** Validates a provided native unsigned16 identity while retaining omitted ZERO values. @param candidate - Optional persisted ID. @returns Native pool identity. */
function decodeInternetStyleId(candidate: unknown): SwPoolFormatId {
  if (candidate === undefined) return SwPoolFormatId.ZERO;
  if (
    typeof candidate !== "number" ||
    !Number.isInteger(candidate) ||
    candidate < 0 ||
    candidate > 65535
  )
    throw new Error("SwFormatINetFormat snapshot is invalid.");
  return candidate as SwPoolFormatId;
}

/** Encodes one pooled item without adding persistence methods to the model class. @param item - Core item. @returns JSON record. */
export function encodeSfxPoolItem(item: SfxPoolItem): SfxPoolItemSnapshot {
  if (item instanceof SfxUnoAnyItem)
    throw new Error("SfxUnoAnyItem is a request argument and cannot be persisted.");
  const value =
    item instanceof SvxULSpaceItem
      ? encodeULSpaceValue(item)
      : item instanceof SwFormatINetFormat
        ? JSON.stringify(encodeSwFormatINetFormatRecord(item))
        : item instanceof SvxFontItem && item.GetGenericFamily() !== undefined
          ? {
              familyName: item.GetFamilyName(),
              resolvedFamilyName: item.GetResolvedFamilyName(),
              genericFamily: item.GetGenericFamily() as string,
            }
          : item.QueryValue();
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
  return decodeSwFormatINetFormatRecord(parsed);
}

/** Writes native UL fields only at the browser tuple boundary; old default-proportion payloads stay compatible. @param item - Original native item. @returns Complete primitive spacing value. */
function encodeULSpaceValue(item: SvxULSpaceItem): readonly number[] {
  const upper = item.GetUpper(),
    lower = item.GetLower(),
    context = item.GetContext();
  if (item.GetPropUpper() !== 100 || item.GetPropLower() !== 100)
    return [upper, lower, context ? 1 : 0, item.GetPropUpper(), item.GetPropLower()];
  return context ? [upper, lower, 1] : [upper, lower];
}

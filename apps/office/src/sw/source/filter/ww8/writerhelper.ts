/** @fileoverview Original Writer/EditEngine pool identity translation from writerhelper.cxx; frame/OLE/string helpers remain outside this owner slice. */
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwDoc } from "../../core/doc/doc";
import { RES_WHICHHINT_END } from "../../../inc/hintids";
/** Original file-local validation does not invent a slot mapping for identity/zero values. @param slot - Native unsigned16 slot. @param which - Native unsigned16 Which. @returns Whether translation is valid. */
export function IsValidSlotWhich(slot: number, which: number): boolean {
  slot &= 0xffff;
  which &= 0xffff;
  return slot !== 0 && which !== 0 && slot !== which;
}
/** Original source-slot/destination-Which conversion. @param destination - Actual destination pool. @param source - Actual source pool. @param which - Original Writer identity. @returns Destination identity or0. */
export function TransformWhichBetweenPools(
  destination: SfxItemPool,
  source: SfxItemPool,
  which: number,
): number {
  which &= 0xffff;
  const slot = source.GetSlotId(which);
  return IsValidSlotWhich(slot, which) ? destination.GetWhichIDFromSlotID(slot) : 0;
}
/** Original first-range test distinguishes Writer and EditEngine sets; nonempty ranges are the native caller precondition. @param set - Actual current item set. @param document - Actual Writer document. @param which - Writer identity. @returns Current set identity. */
export function GetSetWhichFromSwDocWhich(set: SfxItemSet, document: SwDoc, which: number): number {
  which &= 0xffff;
  return RES_WHICHHINT_END < (set.GetRanges()[0] as readonly [number, number])[0]
    ? TransformWhichBetweenPools(set.GetPool(), document.GetAttrPool(), which)
    : which;
}

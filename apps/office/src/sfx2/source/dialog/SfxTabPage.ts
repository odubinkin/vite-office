/** @fileoverview Original SfxTabPage GetItem/GetOldItem scalar queries over actual item sets. No general tab-page, frame, dialog or configuration facade is supplied. */
import { SfxItemSet, SfxItemState } from "../../../svl/inc/itemset";
import type { SfxPoolItem } from "../../../svl/inc/poolitem";
/** Original slot resolution and pool-default fallback, including an invalid direct state. @param set - Actual set. @param slot - Native slot. @param deep - Search secondary pool. @returns Borrowed item or absent. */
export function GetItem(set: SfxItemSet, slot: number, deep = true): SfxPoolItem | undefined {
  const pool = set.GetPool(),
    which = pool.GetWhichIDFromSlotID(slot, deep);
  return (
    set.GetItemIfSet(which, true) ??
    (which !== slot ? pool.GetUserOrPoolDefaultItem(which) : undefined)
  );
}
/** Original old-item selection from standard parent, invalid output parent or original input. @param input - Actual original page item set. @param output - Actual output set. @param slot - Native slot. @param standard - Original Standard reset flag. @param deep - Search secondary pool. @returns Original borrowed comparison item. */
export function GetOldItem(
  input: SfxItemSet,
  output: SfxItemSet,
  slot: number,
  standard = false,
  deep = true,
): SfxPoolItem | undefined {
  const which = input.GetPool().GetWhichIDFromSlotID(slot, deep),
    parent = input.GetParent();
  if (standard && parent) return GetItem(parent, slot);
  const outputParent = output.GetParent();
  return outputParent && output.GetItemState(which) === SfxItemState.INVALID
    ? GetItem(outputParent, slot)
    : GetItem(input, slot);
}

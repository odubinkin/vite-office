/** @fileoverview Test-only construction and value inspection through canonical native tab item methods. */
import {
  SvxTabStopItem,
  SvxTabStop,
  SvxTabAdjust,
  type SvxTabStopConstReference,
} from "../src/editeng/inc/tstpitem";
/** Builds a fixture by original counted construction, direct distance and insertion. @param which - Identity. @param values - Source values. @param distance - Direct default distance. @returns Native item. */
export function createTabs(
  which: number,
  values: readonly SvxTabStopConstReference[],
  distance = 0,
): SvxTabStopItem {
  const item = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, which);
  item.SetDefaultDistance(distance);
  for (const value of values) item.Insert(value);
  return item;
}
/** Inspects detached values through real copy constructors, without extending the production core. @param item - Item. @returns Copied values. */
export function tabStops(item: SvxTabStopItem): SvxTabStop[] {
  return Array.from(
    { length: item.Count() },
    /** Reads and copies one actual native value. @param unused - Empty slot. @param index - Native index. @returns Copy. */
    (unused, index) => {
      void unused;
      return new SvxTabStop(item.At(index));
    },
  );
}

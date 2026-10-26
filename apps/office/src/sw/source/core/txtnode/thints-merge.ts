/** @fileoverview Ports MergePortions for the represented character/automatic families from thints.cxx; RSID items remain outside the registered kernel. */
import type { SwpHints } from "./ndhints";
import { SwFormatAutoFormat, type SwTextAttrEnd } from "./txatbase";
import { SwFormatCharFormat, type SwFormatINetFormat } from "./fmtatr2";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
/** Actual registered native ranged item families. */
type Hint = SwTextAttrEnd<SwFormatAutoFormat | SwFormatCharFormat | SwFormatINetFormat>;
/** Compares source portions, preserving independent character owners and automatic-handle identity. @param first - Earlier portion. @param second - Next portion. @returns Match, differing equal-layout automatic handles, or different. */
function compare(first: readonly Hint[], second: readonly Hint[]): "match" | "layout" | "differ" {
  if (first.length !== second.length || first.length === 0) return "differ";
  let result: "match" | "layout" = "match";
  for (let index = 0; index < first.length; index++) {
    const left = first[index] as Hint,
      right = second[index] as Hint;
    if (left.end < right.start || left.Which() !== right.Which()) return "differ";
    if (left.format.equals(right.format)) continue;
    if (
      !(left.format instanceof SwFormatAutoFormat) ||
      !(right.format instanceof SwFormatAutoFormat)
    )
      return "differ";
    const a = left.format.GetStyleHandle().entries(),
      b = right.format.GetStyleHandle().entries();
    if (
      a.length !== b.length ||
      a.some(
        /** Compares actual ordered values rather than style references. @param item - Earlier value. @param position - Native item position. @returns Difference. */
        (item, position) => !SfxPoolItem.areSame(item, b[position]),
      )
    )
      return "differ";
    result = "layout";
  }
  return result;
}
/** Merges complete matching native portions together; independent families at the same boundary must all match before any owner is merged. @param hints - Actual owned maps. @returns Whether owners were removed. */
export function MergeTextHintPortions(hints: SwpHints): boolean {
  if (!hints.Count()) return false;
  hints.SortIfNeedBe();
  const portions = new Map<number, Hint[]>();
  let key = 0,
    lastStart = 0x7fffffff;
  for (const hint of hints.entries()) {
    if (
      !(hint.format instanceof SwFormatAutoFormat) &&
      !(hint.format instanceof SwFormatCharFormat)
    )
      continue;
    if (hint.start === hint.end) continue;
    if (hint.start !== lastStart) key++;
    lastStart = hint.start;
    const portion = portions.get(key) ?? [];
    portion.push(hint);
    portions.set(key, portion);
  }
  let changed = false,
    firstKey = 0,
    nextKey = 1;
  while (firstKey <= key) {
    const first = portions.get(firstKey) ?? [],
      second = portions.get(nextKey) ?? [];
    const result = compare(first, second);
    if (result === "match") {
      let end = 0;
      for (const hint of second) {
        end = hint.end;
        hints.DeleteAtPos(hints.entries().indexOf(hint));
      }
      portions.delete(nextKey++);
      for (const hint of first) {
        hints.NoteInHistory(hint);
        hint.SetEnd(end);
        hints.NoteInHistory(hint, true);
        changed = true;
      }
      if (changed) hints.SortIfNeedBe();
    } else {
      for (const hint of first) {
        if (hint.IsFormatIgnoreEnd() !== (result === "layout")) {
          hints.NoteInHistory(hint);
          hint.SetFormatIgnoreEnd(result === "layout");
          hints.NoteInHistory(hint, true);
        }
      }
      for (const hint of second) {
        if (hint.IsFormatIgnoreStart() !== (result === "layout")) {
          hints.NoteInHistory(hint);
          hint.SetFormatIgnoreStart(result === "layout");
          hints.NoteInHistory(hint, true);
        }
      }
      firstKey = nextKey++;
    }
  }
  return changed;
}

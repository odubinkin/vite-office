/** @fileoverview Original SvxSearchAttributeDialog slot selection and confirmation. */
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { WhichRangesContainer } from "../../../svl/source/items/itemset";
import { SearchAttrItemList } from "../../../svx/source/dialog/srchdlg";
import { AttributeNames } from "../../../svx/source/dialog/strarray";

/** One admitted slot, its native text and its initial checklist state. */
interface SearchAttributeRow {
  readonly slot: number;
  readonly label: string;
  readonly checked: boolean;
}

/** Resolves native checklist rows from the real document pool and search ranges. @param pool - Active document pool. @param ranges - Native Which ranges. @param criteria - Current ordered search criteria. @returns Document-supported attribute rows. */
export function GetSearchAttributeRows(
  pool: SfxItemPool,
  ranges: WhichRangesContainer,
  criteria?: SearchAttrItemList,
): SearchAttributeRow[] {
  const rows: SearchAttributeRow[] = [];
  const entries = criteria?.GetEntries() ?? [];
  for (const [slot, label] of AttributeNames) {
    const which = pool.GetTrueWhichIDFromSlotID(slot);
    if (
      !ranges.some(
        /** Admits slots in the document’s native search ranges. @param range - Inclusive Which range. @returns Whether the slot belongs to the range. */
        ([start, end]) => which >= start && which <= end,
      )
    )
      continue;
    const entry = entries.find(
      /** Uses the first matching slot as in the native checklist constructor. @param item - Current criterion. @returns Whether the slot matches. */
      (item) => item.slot === slot,
    );
    rows.push({ slot, label, checked: entry !== undefined && entry.item === undefined });
  }
  return rows;
}

/** Applies the native checklist confirmation in displayed row order. @param rows - Sorted native rows. @param selected - Checked slots. @param initial - Current search criteria. @returns Updated criteria. */
export function ApplySearchAttributeChecks(
  rows: readonly SearchAttributeRow[],
  selected: ReadonlySet<number>,
  initial?: SearchAttrItemList,
): SearchAttrItemList {
  const result = new SearchAttrItemList(initial);
  const entries = result.GetEntries();
  for (const { slot } of rows) {
    const match = result.FindLast(slot);
    if (selected.has(slot)) {
      if (match === -1) result.Insert({ slot });
      else result.Replace(match, { slot });
    } else if (match !== -1 && entries[match]?.item === undefined) {
      result.Remove(match);
    }
  }
  return result;
}

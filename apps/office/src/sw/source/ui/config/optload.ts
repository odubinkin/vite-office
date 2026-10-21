/** @fileoverview Consumed SwLoadOptPage General measurement selector,Reset and metric FillItemSet;other General settings remain unported. */
import { FieldUnit as F } from "../../../../tools/inc/fldunit";
import { STR_ARR_METRIC } from "../../../inc/optload";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SID_ATTR_METRIC } from "../../../../sfx2/inc/sfxsids";
/** Original General-page metric draft;CHAR/LINE remain View/Web-only choices. */
export class SwLoadOptPage {
  private active = -1;
  private saved = -1;
  /** Source metric control initialization. @param set - Native option input. @returns Draft. */
  constructor(set: SfxItemSet) {
    this.Reset(set);
  }
  /** Original allowed units in resource order. @returns Catalog. */
  GetMetricUnits(): readonly (readonly [string, F])[] {
    return STR_ARR_METRIC.filter(
      /** Original constructor switch. @param entry - Resource pair. @returns Allowed entry. */ (
        entry,
      ) => [F.MM, F.CM, F.POINT, F.PICA, F.INCH].includes(entry[1]),
    );
  }
  /** Reads selected unit,if active. @returns Unit or no active row. */
  GetMetricSelection(): F | undefined {
    return this.GetMetricUnits()[this.active]?.[1];
  }
  /** Selects original numeric ID. @param unit - Resource ID. @returns Nothing. */
  SetMetricSelection(unit: F): void {
    this.active = this.GetMetricUnits().findIndex(
      /** Matches resource ID. @param entry - Catalog entry. @returns Whether selected. */ (
        entry,
      ) => entry[1] === unit,
    );
  }
  /** Original saved selection initialization. @param set - Native input. @returns Nothing. */
  Reset(set: SfxItemSet): void {
    this.active = -1;
    const item = set.GetItemIfSet(SID_ATTR_METRIC, false);
    if (item instanceof SfxUInt16Item) this.SetMetricSelection(item.GetValue());
    this.saved = this.active;
  }
  /** Original changed-only metric item emission. @param set - Actual changed-item output. @returns Whether metric changed. */
  FillItemSet(set: SfxItemSet): boolean {
    if (this.active === this.saved) return false;
    set.Put(new SfxUInt16Item(SID_ATTR_METRIC, this.GetMetricSelection() ?? 0));
    return true;
  }
}

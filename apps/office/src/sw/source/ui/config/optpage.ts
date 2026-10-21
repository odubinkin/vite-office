/** @fileoverview Original SwContentOptPage metric catalog,Reset and FillItemSet subset over real SfxUInt16Items;React replaces weld combo boxes. */
import { FieldUnit as F } from "../../../../tools/inc/fldunit";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SID_ATTR_METRIC } from "../../../../sfx2/inc/sfxsids";
import { FN_HSCROLL_METRIC, FN_VSCROLL_METRIC } from "../../../inc/cmdid";
import { STR_ARR_METRIC } from "../../../inc/optload";
/** The three native combo identities. */
export type WriterMetricOption = "metric" | "horizontal" | "vertical";
/** Genuine metric draft uses native selected indices and saved indices,not inferred unit equality. */
export class SwContentOptPage {
  private readonly active: Record<WriterMetricOption, number> = {
    metric: -1,
    horizontal: -1,
    vertical: -1,
  };
  private readonly saved: Record<WriterMetricOption, number> = {
    metric: -1,
    horizontal: -1,
    vertical: -1,
  };
  /** Initializes represented native controls from original input items. @param set - Actual option input. @returns Metric page draft. */
  constructor(set: SfxItemSet) {
    this.Reset(set);
  }
  /** Original metric/H omit LINE;V omits CHAR. @param option - Native combo. @returns Source catalog. */
  GetMetricUnits(option: WriterMetricOption): readonly (readonly [string, F])[] {
    return STR_ARR_METRIC.filter(
      /** Original constructor unit switch. @param entry - Source resource. @returns Whether supported by this page. */ (
        entry,
      ) => [F.MM, F.CM, F.POINT, F.PICA, F.INCH, F.CHAR, F.LINE].includes(entry[1]),
    ).filter(
      /** Applies original axis filtering. @param entry - Source resource pair. @returns Whether present. */ (
        entry,
      ) => (option === "vertical" ? entry[1] !== F.CHAR : entry[1] !== F.LINE),
    );
  }
  /** Reads the real selected unit,if the native control has an active row. @param option - Native combo. @returns Unit or absent selection. */
  GetMetricSelection(option: WriterMetricOption): F | undefined {
    return this.GetMetricUnits(option)[this.active[option]]?.[1];
  }
  /** Selects one native resource ID. @param option - Native combo. @param unit - Resource ID. @returns Nothing. */
  SetMetricSelection(option: WriterMetricOption, unit: F): void {
    this.active[option] = this.GetMetricUnits(option).findIndex(
      /** Matches original numeric unit ID. @param entry - Catalog entry. @returns Whether selected. */ (
        entry,
      ) => entry[1] === unit,
    );
  }
  /** Original saved selection initialization;missing/unknown items retain minus-one selection. @param set - Native input. @returns Nothing. */
  Reset(set: SfxItemSet): void {
    for (const [option, which] of [
      ["metric", SID_ATTR_METRIC],
      ["horizontal", FN_HSCROLL_METRIC],
      ["vertical", FN_VSCROLL_METRIC],
    ] as const) {
      this.active[option] = -1;
      const item = set.GetItemIfSet(which, false);
      if (item instanceof SfxUInt16Item) this.SetMetricSelection(option, item.GetValue());
      this.saved[option] = this.active[option];
    }
  }
  /** Original active-index comparisons and UInt16 output,including original empty-ID-to-zero behavior. @param set - Native changed-item output. @returns Whether metric items were emitted. */
  FillItemSet(set: SfxItemSet): boolean {
    let changed = false;
    for (const [option, which] of [
      ["metric", SID_ATTR_METRIC],
      ["horizontal", FN_HSCROLL_METRIC],
      ["vertical", FN_VSCROLL_METRIC],
    ] as const) {
      if (
        this.active[option] !== this.saved[option] ||
        (option !== "metric" && this.active[option] !== this.active.metric)
      ) {
        set.Put(new SfxUInt16Item(which, this.GetMetricSelection(option) ?? 0));
        changed = true;
      }
    }
    return changed;
  }
}

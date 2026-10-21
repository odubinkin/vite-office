/** @fileoverview Metric field projection of original SwModule CreateItemSet/ApplyItemSet;all other application option responsibilities remain unported. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SID_ATTR_METRIC } from "../../../../sfx2/inc/sfxsids";
import { FN_HSCROLL_METRIC, FN_VSCROLL_METRIC } from "../../../inc/cmdid";
import type { SwModule, SwMetricView } from "./swmodule";
/** Original global/current-view inputs carried by actual typed slot items. @param module - Actual module. @param pool - Actual item pool. @param view - Matching current view,if present. @param web - Native document kind. @returns Metric subset item set. */
export function CreateWriterMetricItemSet(
  module: SwModule,
  pool: SfxItemPool,
  view?: SwMetricView,
  web = false,
): SfxItemSet {
  const pref = module.GetUsrPref(web),
    set = new SfxItemSet(pool, [
      [SID_ATTR_METRIC, SID_ATTR_METRIC],
      [FN_HSCROLL_METRIC, FN_VSCROLL_METRIC],
    ]);
  set.Put(
    new SfxUInt16Item(
      FN_HSCROLL_METRIC,
      view === undefined ? pref.GetHScrollMetric() : view.GetHRulerMetric(),
    ),
  );
  set.Put(
    new SfxUInt16Item(
      FN_VSCROLL_METRIC,
      view === undefined ? pref.GetVScrollMetric() : view.GetVRulerMetric(),
    ),
  );
  set.Put(new SfxUInt16Item(SID_ATTR_METRIC, pref.GetMetric()));
  return set;
}
/** Original global-before-H-before-V application;axis options update the current view only,unlike ApplyRulerMetric. @param module - Actual module. @param set - Accepted typed fields. @param view - Matching current view. @param web - Native document kind. @returns Nothing. */
export function ApplyWriterMetricItemSet(
  module: SwModule,
  set: SfxItemSet,
  view?: SwMetricView,
  web = false,
): void {
  const pref = module.GetUsrPref(web),
    metric = set.GetItemIfSet(SID_ATTR_METRIC, false),
    horizontal = set.GetItemIfSet(FN_HSCROLL_METRIC, false),
    vertical = set.GetItemIfSet(FN_VSCROLL_METRIC, false);
  if (metric instanceof SfxUInt16Item) module.ApplyUserMetric(metric.GetValue(), web);
  if (horizontal instanceof SfxUInt16Item) {
    pref.SetHScrollMetric(horizontal.GetValue());
    view?.ChangeTabMetric(horizontal.GetValue());
  }
  if (vertical instanceof SfxUInt16Item) {
    pref.SetVScrollMetric(vertical.GetValue());
    view?.ChangeVRulerMetric(vertical.GetValue());
  }
}

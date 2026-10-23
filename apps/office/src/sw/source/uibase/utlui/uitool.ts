/** @fileoverview Original GetTabDist scalar tab-default query from sw/source/uibase/utlui/uitool.cxx. */
import { SVX_TAB_DEFDIST, type SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
/** Reads the first native position, independent of the tab item's default-distance field. @param tabs - Actual native item. @returns Original default interval. */
export function GetTabDist(tabs: SvxTabStopItem): number {
  return tabs.Count() ? tabs.At(0).GetTabPos() : SVX_TAB_DEFDIST;
}

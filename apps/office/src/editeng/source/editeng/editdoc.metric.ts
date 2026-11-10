/** @fileoverview Original edit-document item metric conversion from editdoc.cxx. */
import { MeasureUnit } from "../../../offapi/com/sun/star/util/MeasureUnit";
import { SfxItemState, type SfxItemSet } from "../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { MapUnit } from "../../../tools/inc/mapunit";
import { LogicToLogic } from "../../../vcl/source/outdev/map";
import {
  EE_CHAR_END,
  EE_CHAR_FONTHEIGHT,
  EE_CHAR_FONTHEIGHT_CJK,
  EE_CHAR_FONTHEIGHT_CTL,
  EE_PARA_LRSPACE,
  EE_PARA_SBL,
  EE_PARA_START,
  EE_PARA_TABS,
  EE_PARA_ULSPACE,
} from "../../inc/eeitem";
import { SvxIndentValue, type SvxLRSpaceItem } from "../../inc/lrspitem";
import { SvxLineSpaceRule } from "../../inc/svxenum";
import type { SvxULSpaceItem } from "../../inc/ulspitem";
import { SvxTabStop } from "../items/paraitem";
import type { SvxLineSpacingItem } from "../items/paraitem.spacing";
import { SvxTabStopItem } from "../items/paraitem.tabs";
import type { SvxFontHeightItem } from "../items/textitem.height";

/** Converts an owned item, replacing the tab-stop value when required by the original operation. @param item - Owned item. @param source - Source metric. @param destination - Destination metric. @returns Owned converted item. */
export function ConvertItem(item: SfxPoolItem, source: MapUnit, destination: MapUnit): SfxPoolItem {
  /** Applies the original integral OutputDevice conversion. @param value - Native scalar. @returns Converted scalar. */
  function convert(value: number): number {
    return Number(LogicToLogic(BigInt(Math.trunc(value)), source, destination));
  }
  switch (item.Which()) {
    case EE_PARA_LRSPACE: {
      const spacing = item as SvxLRSpaceItem;
      if (spacing.GetTextFirstLineOffset().m_nUnit === MeasureUnit.TWIP)
        spacing.SetTextFirstLineOffset(
          SvxIndentValue.twips((convert(spacing.ResolveTextFirstLineOffset()) << 16) >> 16),
        );
      spacing.SetTextLeft(SvxIndentValue.twips(convert(spacing.ResolveTextLeft())));
      if (spacing.GetRight().m_nUnit === MeasureUnit.TWIP)
        spacing.SetRight(SvxIndentValue.twips(convert(spacing.ResolveRight())));
      break;
    }
    case EE_PARA_ULSPACE: {
      const spacing = item as SvxULSpaceItem;
      spacing.SetUpper(convert(spacing.GetUpper()) & 0xffff);
      spacing.SetLower(convert(spacing.GetLower()) & 0xffff);
      break;
    }
    case EE_PARA_SBL: {
      const spacing = item as SvxLineSpacingItem;
      if (spacing.GetLineSpaceRule() === SvxLineSpaceRule.Min)
        spacing.SetLineHeight(convert(spacing.GetLineHeight()) & 0xffff);
      break;
    }
    case EE_PARA_TABS: {
      const tabs = item as SvxTabStopItem;
      const replacement = new SvxTabStopItem(EE_PARA_TABS);
      const distance = tabs.GetDefaultDistance();
      if (distance) replacement.SetDefaultDistance(convert(distance));
      for (let index = 0; index < tabs.Count(); index++) {
        const tab = tabs.At(index);
        replacement.Insert(
          new SvxTabStop(
            convert(tab.GetTabPos()),
            tab.GetAdjustment(),
            tab.GetDecimal(),
            tab.GetFill(),
          ),
        );
      }
      item.Dispose();
      return replacement;
    }
    case EE_CHAR_FONTHEIGHT:
    case EE_CHAR_FONTHEIGHT_CJK:
    case EE_CHAR_FONTHEIGHT_CTL: {
      const font = item as SvxFontHeightItem;
      font.SetHeight(convert(font.GetHeight()) >>> 0);
      break;
    }
  }
  return item;
}

/** Copies source SET items through the original slot identities and metrics. @param destination - Destination set. @param source - Borrowed source set. @param sourceUnit - Optional metric override. @param destinationUnit - Optional destination override. @returns Nothing. */
export function ConvertAndPutItems(
  destination: SfxItemSet,
  source: SfxItemSet,
  sourceUnit?: MapUnit,
  destinationUnit?: MapUnit,
): void {
  const sourcePool = source.GetPool(),
    destinationPool = destination.GetPool();
  for (let which = EE_PARA_START; which <= EE_CHAR_END; which++) {
    const slot = destinationPool.GetTrueSlotId(which);
    const sourceWhich = (slot && sourcePool.GetTrueWhichIDFromSlotID(slot)) || which;
    if (source.GetItemState(sourceWhich, false) !== SfxItemState.SET) continue;

    const from = sourceUnit ?? sourcePool.GetMetric(sourceWhich);
    const to = destinationUnit ?? destinationPool.GetMetric(which);
    const item = source.Get(sourceWhich);
    if (from === to) destination.PutAsTargetWhich(item, which);
    else {
      const converted = ConvertItem(item.Clone() as SfxPoolItem, from, to);
      try {
        converted.SetWhich(which);
        destination.Put(converted);
      } finally {
        converted.Dispose();
      }
    }
  }
}

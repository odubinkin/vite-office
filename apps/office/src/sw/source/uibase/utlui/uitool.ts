/** @fileoverview Represented Writer UI utilities from sw/source/uibase/utlui/uitool.cxx. */
import { SVX_TAB_DEFDIST, type SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { COL_TRANSPARENT, type Color } from "../../../../tools/inc/color";
import {
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_GRABBAG,
  RES_CHRATR_HIGHLIGHT,
} from "../../../inc/hintids";
import { writerColorFromPrimitive } from "../../core/attr/swatrset";
import type { SwPaM } from "../../core/crsr/pam";
import { SvxPageItem, type SvxPageUsage } from "../../../../svx/inc/pageitem";
import {
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags,
} from "../../../../editeng/source/items/frmitems";
import { MIN_BORDER_DIST } from "../../../inc/swtypes";
import { SID_ATTR_BORDER_INNER, SID_ATTR_PAGE } from "../../../../svx/inc/svxids";
import { headerFooterSetSlot } from "../../../../svx/source/dialog/hdft";
import { ItemSetToPageStories, PageDescToStoryItemSet } from "./uitool.hdft";
import type { SwPageStoryFormatChange } from "../../core/layout/pagedesc.hdft";
import type { SwPageDesc } from "../../core/layout/pagedesc";
import type { SwEditShell } from "../../core/edit/edatmisc";

/** Projects the visible imported highlight as the Character dialog background. @param input - Owned Writer Character input set. @returns Nothing. */
export function ConvertAttrCharToGen(input: SfxItemSet): void {
  const highlight = input.GetItemIfSet(RES_CHRATR_HIGHLIGHT, false);
  if (highlight instanceof SvxBrushItem && !highlight.GetColor().equals(COL_TRANSPARENT))
    input.PutAsTargetWhich(highlight, RES_CHRATR_BACKGROUND);
}

/** Clears imported highlight and its shading marker whenever the dialog changes the background. @param output - Owned Character output set. @param original - Original Character attributes. @returns Nothing. */
export function ConvertAttrGenToChar(output: SfxItemSet, original: SfxItemSet): void {
  if (output.GetItemState(RES_CHRATR_BACKGROUND, false) !== SfxItemState.SET) return;
  output.Put(new SvxBrushItem(RES_CHRATR_HIGHLIGHT), true);
  const bag = original.GetItemIfSet(RES_CHRATR_GRABBAG, false);
  if (bag instanceof SfxGrabBagItem && bag.GetGrabBag().has("CharShadingMarker")) {
    const disabled = new Any([false], "bool");
    try {
      const properties = new Map(bag.GetGrabBag());
      properties.set("CharShadingMarker", disabled);
      output.Put(new SfxGrabBagItem(RES_CHRATR_GRABBAG, properties), true);
    } finally {
      disabled.dispose();
    }
  }
}

/** Applies Writer's background brush, clears imported highlight, and removes the imported shading marker in one undo action. @param color - Resolved color. @param complex - Native complex color. @param shell - Active editing shell contract. @returns Whether the document changed. */
export function ApplyCharBackground(
  color: Readonly<Color>,
  complex: Readonly<ComplexColor>,
  shell: Pick<SwEditShell, "GetCurAttr" | "GetDoc" | "SetAttrSet">,
): boolean {
  const pool = shell.GetDoc().GetAttrPool();
  const state = new SfxItemSet(pool, [[RES_CHRATR_GRABBAG, RES_CHRATR_GRABBAG]]);
  const delta = new SfxItemSet(pool, [
    [RES_CHRATR_BACKGROUND, RES_CHRATR_BACKGROUND],
    [RES_CHRATR_HIGHLIGHT, RES_CHRATR_GRABBAG],
  ]);
  try {
    shell.GetCurAttr(state);
    delta.Put(new SvxBrushItem(color, complex, RES_CHRATR_BACKGROUND), true);
    ConvertAttrGenToChar(delta, state);
    return shell.SetAttrSet(delta);
  } finally {
    delta.Dispose();
    state.Dispose();
  }
}

/** Toggles the current character background for a selection. @param value - Chosen color. @param shell - Active editing shell. @returns Whether the document changed. */
export function ToggleCharBackground(
  value: string,
  shell: Pick<SwEditShell, "GetCurAttr" | "GetDoc" | "SetAttrSet"> & { GetCursor(): SwPaM },
): boolean {
  const current = new SfxItemSet(shell.GetDoc().GetAttrPool(), [
    [RES_CHRATR_BACKGROUND, RES_CHRATR_BACKGROUND],
  ]);
  try {
    shell.GetCurAttr(current);
    const brush = current.Get(RES_CHRATR_BACKGROUND);
    const cursor = shell.GetCursor();
    const hasSelection = cursor.IsMultiSelection() || cursor.Start().compare(cursor.End()) !== 0;
    const color = writerColorFromPrimitive(value, "transparent");
    const background =
      hasSelection && brush instanceof SvxBrushItem && brush.GetColor().equals(color)
        ? COL_TRANSPARENT
        : color;
    return ApplyCharBackground(background, new ComplexColor(), shell);
  } finally {
    current.Dispose();
  }
}

/** Reads the first native position, independent of the tab item's default-distance field. @param tabs - Actual native item. @returns Original default interval. */
export function GetTabDist(tabs: SvxTabStopItem): number {
  return tabs.Count() ? tabs.At(0).GetTabPos() : SVX_TAB_DEFDIST;
}

/** Builds the represented native page dialog input with nested story groups. @param descriptor - Active page style. @returns Owned dialog input. */
export function PageDescToItemSet(descriptor: SwPageDesc): SfxItemSet {
  const items = descriptor.GetMaster().GetAttrSet().Clone();
  items.MergeRange(SID_ATTR_PAGE, SID_ATTR_PAGE);
  items.MergeRange(headerFooterSetSlot(true), headerFooterSetSlot(false));
  const page = new SvxPageItem(SID_ATTR_PAGE);
  page.SetPageUsage(Number(descriptor.GetUseOn()) as SvxPageUsage);
  page.SetLandscape(descriptor.GetLandscape());
  items.Put(page, true);
  items.MergeRange(SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER);
  const borders = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  borders.SetTable(false);
  borders.SetDist(true);
  borders.SetMinDist(false);
  borders.SetDefDist(MIN_BORDER_DIST);
  borders.SetValid(SvxBoxInfoItemValidFlags.DISABLE);
  items.Put(borders, true);
  PageDescToStoryItemSet(descriptor, items);
  return items;
}

/** Transfers general items and prepares native page story references. @param items - Page Style tab output. @param descriptor - Detached page style copy. @returns Owned Story format changes. */
export function ItemSetToPageDesc(
  items: SfxItemSet,
  descriptor: SwPageDesc,
): SwPageStoryFormatChange[] {
  const frames = items.Clone();
  try {
    frames.ClearItem(headerFooterSetSlot(true));
    frames.ClearItem(headerFooterSetSlot(false));
    descriptor.GetMaster().SetFormatAttrSet(frames);
  } finally {
    frames.Dispose();
  }
  return ItemSetToPageStories(items, descriptor);
}

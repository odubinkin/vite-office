/** @fileoverview PageDescToItemSet and ItemSetToPageDesc bindings for Writer's native story flags. */
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { SfxItemSet } from "../../../../svl/inc/itemset";
import type { SvxSetItem } from "../../../../svx/inc/pageitem";
import {
  headerFooterSetSlot,
  putHeaderFooterSet,
  readHeaderFooterSet,
} from "../../../../svx/source/dialog/hdft";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { RES_HEADER_FOOTER_EAT_SPACING, RES_LR_SPACE, RES_UL_SPACE } from "../../../inc/hintids";
import { getActivePageStory } from "../../core/layout/atrfrm";
import {
  createPageStoryFormatChange,
  preparePageStory,
  type SwPageStoryFormatChange,
} from "../../core/layout/pagedesc.hdft";
import type { SwPageDesc } from "../../core/layout/pagedesc";

/** Maps the common SVX fields to actual Writer format attributes. */
export const writerPageStoryIds = {
  margins: RES_LR_SPACE,
  spacing: RES_UL_SPACE,
  dynamicSpacing: RES_HEADER_FOOTER_EAT_SPACING,
} as const;

/** Writes native nested Header and Footer page sets from the current descriptor. @param descriptor - Actual Writer page style. @param output - Owned dialog snapshot. @returns Nothing. */
export function PageDescToStoryItemSet(descriptor: SwPageDesc, output: SfxItemSet): void {
  for (const header of [true, false]) {
    const format = getActivePageStory(descriptor.GetMaster(), header);
    if (!format) {
      putHeaderFooterSet(output, header, writerPageStoryIds, {
        ...readHeaderFooterSet(undefined, header, writerPageStoryIds),
        sharedFirst: descriptor.IsFirstShared(),
      });
      continue;
    }
    const ul = format.GetULSpace();
    const spacing = header ? ul.GetLower() : ul.GetUpper();
    const lr = format.GetLRSpace();
    const size = format.GetFrameSize();
    putHeaderFooterSet(output, header, writerPageStoryIds, {
      enabled: true,
      shared: header ? descriptor.IsHeaderShared() : descriptor.IsFooterShared(),
      sharedFirst: descriptor.IsFirstShared(),
      left: lr.ResolveLeft(),
      right: lr.ResolveRight(),
      spacing,
      height: Math.max(0, size.GetHeight() - spacing),
      dynamicHeight: size.GetHeightSizeType() !== SwFrameSize.Fixed,
      dynamicSpacing: (
        format.GetAttrSet().Get(RES_HEADER_FOOTER_EAT_SPACING) as SfxBoolItem
      ).GetValue(),
    });
  }
}

/** Prepares Story changes on a detached descriptor and keeps geometry edits with the undo action. @param items - Accepted dialog output. @param descriptor - Detached copy of the original style. @returns Owned changes to bound story formats. */
export function ItemSetToPageStories(
  items: SfxItemSet,
  descriptor: SwPageDesc,
): SwPageStoryFormatChange[] {
  const header = items.GetItemIfSet(headerFooterSetSlot(true), false) as SvxSetItem | undefined;
  const footer = items.GetItemIfSet(headerFooterSetSlot(false), false) as SvxSetItem | undefined;
  if (!header && !footer) return [];
  const changes = [];
  const head = header && readHeaderFooterSet(header, true, writerPageStoryIds);
  const foot = footer && readHeaderFooterSet(footer, false, writerPageStoryIds);
  const previousFirst = descriptor.IsFirstShared();
  // ItemSetToPageDesc handles the first-page bit once, with an enabled header taking precedence.
  const sharedFirst = head?.enabled
    ? head.sharedFirst
    : foot?.enabled
      ? foot.sharedFirst
      : previousFirst;
  for (const [header, state] of [
    [true, head],
    [false, foot],
  ] as const) {
    const formats = preparePageStory(descriptor, header, state, previousFirst, sharedFirst);
    if (state)
      for (const format of formats)
        changes.push(createPageStoryFormatChange(format, header, state));
  }
  descriptor.ChgFirstShare(sharedFirst);
  return changes;
}

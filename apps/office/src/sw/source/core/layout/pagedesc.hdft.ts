/** @fileoverview Writer page descriptor header/footer frames, prepared sharing links and undo geometry. */
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import type { SvxHFPageState } from "../../../../svx/source/dialog/hdft";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatFooter, SwFormatHeader } from "../../../inc/fmthdft";
import { SwHeaderAndFooterEatSpacingItem } from "../../../inc/hfspacingitem";
import {
  RES_CNTNT,
  RES_FRM_SIZE,
  RES_HEADER_FOOTER_EAT_SPACING,
  RES_LR_SPACE,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { CopyNodes } from "../docnode/ndcopy";
import { getActivePageStory, type SwFrameFormat } from "./atrfrm";
import type { SwPageDesc } from "./pagedesc";

/** Native registration for a single page-owned story. */
type StoryItem = SwFormatHeader | SwFormatFooter;

/** Keeps a format's independent story geometry on both sides of a page-style change. */
export interface SwPageStoryFormatChange {
  readonly format: SwFrameFormat;
  readonly before: SfxItemSet;
  readonly after: SfxItemSet;
}

const formatIds = [
  RES_FRM_SIZE,
  RES_LR_SPACE,
  RES_UL_SPACE,
  RES_HEADER_FOOTER_EAT_SPACING,
] as const;

/** Borrows the actual header or footer item. @param page - Page variant. @param header - Whether to read the header. @returns Native item. */
function story(page: SwFrameFormat, header: boolean): StoryItem {
  return header ? page.GetHeader() : page.GetFooter();
}

/** Creates the native section and, when separating a previously shared story, copies its content. @param page - Detached target page frame. @param header - Whether to create a header. @param master - Original shared story frame. @returns Newly connected story item. */
function makeStory(page: SwFrameFormat, header: boolean, master?: SwFrameFormat): StoryItem {
  page.SetFormatAttr(header ? new SwFormatHeader(true) : new SwFormatFooter(true));
  const result = story(page, header);
  const target = getActivePageStory(page, header);
  if (!target || !master) return result;
  const attrs = master.GetAttrSet().Clone();
  try {
    attrs.ClearItem(RES_CNTNT);
    target.SetFormatAttrSet(attrs);
  } finally {
    attrs.Dispose();
  }
  const source = master.GetContent().GetContentIdx()?.GetNode();
  const destination = target.GetContent().GetContentIdx()?.GetNode();
  if (source?.IsStartNode() && destination?.IsStartNode()) {
    const nodes = destination.GetNodes();
    const placeholder = nodes.at(destination.GetIndex() + 1).GetTextNode();
    if (CopyNodes(source, destination, destination.EndOfSectionNode()) && placeholder)
      nodes.removeTextNode(placeholder);
  }
  return result;
}

/** Reads the owned frame otherwise hidden by sharing, or makes a separate section. @param desc - Working descriptor. @param frame - Target page variant. @param header - Header or footer. @param key - Retained story slot. @param wasShared - Whether this variant reused another section. @param master - Current master story for linking or copying. @returns Selected native region. */
function independentStory(
  desc: SwPageDesc,
  frame: SwFrameFormat,
  header: boolean,
  key: number,
  wasShared: boolean,
  master: SwFrameFormat | undefined,
): StoryItem {
  const stashed = desc.GetStashedStoryFormat(key);
  if (stashed) {
    frame.SetFormatAttr(stashed);
    desc.StashStoryFormat(key);
    return story(frame, header);
  }
  if (!wasShared && story(frame, header).IsActive() && getActivePageStory(frame, header) !== master)
    return story(frame, header);
  return makeStory(frame, header, master);
}

/** Sets the new live story links while retaining native section references for a later unshare or undo. @param desc - Detached page descriptor. @param header - Whether to configure the header. @param state - Accepted nested options, if edited. @param previousFirst - Original shared-first bit for both stories. @param changedFirst - Accepted shared-first bit. @returns Story frames requiring a format update. */
export function preparePageStory(
  desc: SwPageDesc,
  header: boolean,
  state: SvxHFPageState | undefined,
  previousFirst: boolean,
  changedFirst: boolean,
): Set<SwFrameFormat> {
  const result = new Set<SwFrameFormat>();
  const masterFrame = desc.GetMaster();
  const original = getActivePageStory(masterFrame, header) ?? undefined;
  if (!state && (previousFirst === changedFirst || !original)) return result;
  const shared = header ? desc.IsHeaderShared() : desc.IsFooterShared();
  const nextShared = state?.shared ?? shared;
  const left = desc.GetLeft();
  const first = desc.GetFirstMaster();
  const firstLeft = desc.GetFirstLeft();
  const slot = header ? 0 : 2;
  if (state && !state.enabled) {
    if (!original) return result;
    for (const frame of [masterFrame, left, first, firstLeft])
      frame.SetFormatAttr(header ? new SwFormatHeader(false) : new SwFormatFooter(false));
    desc.StashStoryFormat(slot);
    desc.StashStoryFormat(slot + 1);
    if (header) desc.ChgHeaderShare(false);
    else desc.ChgFooterShare(false);
    return result;
  }
  if (!original) makeStory(masterFrame, header);
  const master = story(masterFrame, header);
  if (
    nextShared &&
    !shared &&
    getActivePageStory(left, header) &&
    getActivePageStory(left, header) !== original
  )
    desc.StashStoryFormat(slot, story(left, header));
  if (
    changedFirst &&
    !previousFirst &&
    getActivePageStory(first, header) &&
    getActivePageStory(first, header) !== original
  )
    desc.StashStoryFormat(slot + 1, story(first, header));
  left.SetFormatAttr(
    nextShared ? master : independentStory(desc, left, header, slot, shared, original),
  );
  first.SetFormatAttr(
    changedFirst
      ? master
      : independentStory(desc, first, header, slot + 1, previousFirst, original),
  );
  firstLeft.SetFormatAttr(story(changedFirst ? left : first, header));
  if (header) desc.ChgHeaderShare(nextShared);
  else desc.ChgFooterShare(nextShared);
  for (const frame of [masterFrame, left, first, firstLeft]) {
    const format = getActivePageStory(frame, header);
    if (format) result.add(format);
  }
  return result;
}

/** Captures old and new attributes without creating a second content-section owner. @param format - Live header/footer frame retained through a descriptor. @param header - Whether the settings apply to a header. @param state - Accepted settings. @returns Owned edit. */
export function createPageStoryFormatChange(
  format: SwFrameFormat,
  header: boolean,
  state: SvxHFPageState,
): SwPageStoryFormatChange {
  const before = new SfxItemSet(
    format.GetAttrSet().GetPool(),
    formatIds.map(
      /** Makes one finite format range. @param which - Format attribute. @returns Inclusive range. */
      (which) => [which, which] as const,
    ),
  );
  for (const which of formatIds) {
    const item = format.GetAttrSet().GetItemIfSet(which, false);
    if (item) before.Put(item);
  }
  const after = before.Clone(false);
  const size = format.GetFrameSize().Clone();
  size.SetHeight(state.height + state.spacing);
  size.SetHeightSizeType(state.dynamicHeight ? SwFrameSize.Minimum : SwFrameSize.Fixed);
  after.Put(size, true);
  after.Put(
    new SvxLRSpaceItem(
      SvxIndentValue.twips(state.left),
      SvxIndentValue.twips(state.right),
      SvxIndentValue.zero(),
      RES_LR_SPACE,
    ),
  );
  after.Put(
    new SvxULSpaceItem(header ? 0 : state.spacing, header ? state.spacing : 0, RES_UL_SPACE),
  );
  after.Put(
    new SwHeaderAndFooterEatSpacingItem(RES_HEADER_FOOTER_EAT_SPACING, state.dynamicSpacing),
  );
  return { format, before, after };
}

/** Reapplies the stored frame items without moving the page-story contents. @param changes - Page style history changes. @param redo - Whether to apply the edited values. @returns Nothing. */
export function applyPageStoryFormatChanges(
  changes: readonly SwPageStoryFormatChange[],
  redo: boolean,
): void {
  for (const { format, before, after } of changes) {
    const items = redo ? after : before;
    for (const which of formatIds)
      if (!items.GetItemIfSet(which, false)) format.ResetFormatAttr(which);
    format.SetFormatAttrSet(items);
  }
}

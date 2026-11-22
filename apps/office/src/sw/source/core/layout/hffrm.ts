/** @fileoverview Connected Writer page header and footer format and print geometry. */
import type { SwDoc } from "../doc/doc";
import type { SwStartNode } from "../docnode/node";
import {
  getActivePageStory,
  getPageFrameBorderSpace,
  getPageFrameMargins,
  type SwFrameFormat,
} from "./atrfrm";
import type { SwPageFrame } from "./newfrm";
import type { SwPageDesc, WriterPageDescriptorValue } from "./pagedesc";

/** Native page-story print bounds and connected text section. */
export interface SwPageStory {
  readonly start: SwStartNode;
  readonly header: boolean;
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly page: WriterPageDescriptorValue;
}

/** Checks the first-page format switch for the physical page. @param descriptor - Native descriptor. @param page - Page to resolve. @param previous - Optional preceding physical page. @returns Whether this page uses its own first format. */
function isFirstPageFormat(
  descriptor: SwPageDesc,
  page: SwPageFrame,
  previous?: SwPageFrame,
): boolean {
  return previous?.descriptor.name !== page.descriptor.name && !descriptor.IsFirstShared();
}

/** Gets the same registered format used by stories and background paint for this physical page. @param descriptor - Native descriptor. @param page - Page to resolve. @param previous - Optional preceding physical page. @returns Page frame format. */
export function ResolvePageFrameFormat(
  descriptor: SwPageDesc,
  page: SwPageFrame,
  previous?: SwPageFrame,
): SwFrameFormat {
  const left = page.number % 2 === 0;
  if (isFirstPageFormat(descriptor, page, previous))
    return left ? descriptor.GetFirstLeft() : descriptor.GetFirstMaster();
  return left ? descriptor.GetLeft() : descriptor.GetMaster();
}

/** Prepares the live header and footer of the current physical page format. @param doc - Canonical Writer document. @param page - Physical page. @param previous - Preceding physical page when present. @returns Connected story print areas. */
export function PreparePageStories(
  doc: SwDoc,
  page: SwPageFrame,
  previous: SwPageFrame | undefined,
): SwPageStory[] {
  const descriptor = doc.FindPageDesc(page.descriptor.name);
  if (!descriptor) return [];
  const firstFormat = isFirstPageFormat(descriptor, page, previous);
  const leftPage = page.number % 2 === 0;
  const format = ResolvePageFrameFormat(descriptor, page, previous);
  const margins = getPageFrameMargins(format);
  const border = getPageFrameBorderSpace(format);
  const left = margins.left + border.left;
  const right = margins.right + border.right;
  const top = margins.top + border.top;
  const bottom = margins.bottom + border.bottom;
  const width = page.descriptor.width - left - right;
  const pageGeometry = {
    ...page.descriptor,
    leftMargin: left,
    rightMargin: right,
    topMargin: top,
    bottomMargin: bottom,
  };
  const result: SwPageStory[] = [];
  for (const header of [true, false]) {
    const shared = header ? descriptor.IsHeaderShared() : descriptor.IsFooterShared();
    const storyFormat = leftPage && shared && !firstFormat ? descriptor.GetMaster() : format;
    const story = getActivePageStory(storyFormat, header);
    const start = story?.GetContent().GetContentIdx()?.GetNode();
    if (!story || !start?.IsStartNode()) continue;
    const height = story.GetFrameSize().GetHeight();
    const spacing = story.GetULSpace();
    const storyLeft = story.GetLRSpace().ResolveLeft();
    const storyRight = story.GetLRSpace().ResolveRight();
    result.push({
      start,
      header,
      top: (header ? top : page.descriptor.height - bottom - height) + spacing.GetUpper(),
      left: left + storyLeft,
      width: width - storyLeft - storyRight,
      height: Math.max(0, height - spacing.GetUpper() - spacing.GetLower()),
      page: pageGeometry,
    });
  }
  return result;
}

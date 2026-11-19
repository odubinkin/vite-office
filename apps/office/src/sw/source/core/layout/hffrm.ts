/** @fileoverview Connected Writer page header and footer format and print geometry. */
import { SvxBoxItemLine as BoxEdge } from "../../../../editeng/source/items/frmitems";
import type { SwDoc } from "../doc/doc";
import type { SwStartNode } from "../docnode/node";
import { getActivePageStory } from "./atrfrm";
import type { SwPageFrame } from "./newfrm";
import type { WriterPageDescriptorValue } from "./pagedesc";

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

/** Prepares the live header and footer of the current physical page format. @param doc - Canonical Writer document. @param page - Physical page. @param previous - Preceding physical page when present. @returns Connected story print areas. */
export function PreparePageStories(
  doc: SwDoc,
  page: SwPageFrame,
  previous: SwPageFrame | undefined,
): SwPageStory[] {
  const descriptor = doc.FindPageDesc(page.descriptor.name);
  if (!descriptor) return [];
  const first = previous?.descriptor.name !== page.descriptor.name;
  const leftPage = page.number % 2 === 0;
  const firstFormat = first && !descriptor.IsFirstShared();
  const format = firstFormat
    ? leftPage
      ? descriptor.GetFirstLeft()
      : descriptor.GetFirstMaster()
    : leftPage
      ? descriptor.GetLeft()
      : descriptor.GetMaster();
  const margins = format.GetLRSpace();
  const vertical = format.GetULSpace();
  const box = format.GetBox();
  const gutter = margins.GetGutterMargin();
  const topGutter = doc.GetDocumentSettingManager().get("GUTTER_AT_TOP");
  const left =
    margins.ResolveLeft() + box.CalcLineSpace(BoxEdge.LEFT, true) + (topGutter ? 0 : gutter);
  const right = margins.ResolveRight() + box.CalcLineSpace(BoxEdge.RIGHT, true);
  const top = vertical.GetUpper() + box.CalcLineSpace(BoxEdge.TOP, true) + (topGutter ? gutter : 0);
  const bottom = vertical.GetLower() + box.CalcLineSpace(BoxEdge.BOTTOM, true);
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

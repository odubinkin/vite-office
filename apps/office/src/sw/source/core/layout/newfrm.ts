/** @fileoverview Creates Writer page frames from measured text-frame lines. */

import type { WriterPageDescriptorValue } from "./pagedesc";
import {
  getSwTextFrameGap,
  makeSwTextFrame,
  type SwTextFrame,
  type SwTextFrameInput,
  type SwTextFrameSettings,
  type SwTextLine,
} from "../text/txtfrm";

/** One physical page and its ordered text-frame fragments. */
export interface SwPageFrame {
  readonly descriptor: WriterPageDescriptorValue;
  readonly number: number;
  readonly textFrames: readonly SwTextFrame[];
}

/** Immutable descriptor graph supplied to DOM-neutral page-frame creation. */
export interface SwPageDescriptorLayout {
  readonly descriptors: readonly Readonly<{
    followName: string;
    value: WriterPageDescriptorValue;
  }>[];
  readonly initialName: string;
}

/** Creates at least the initial page; splits a text node only at measured line boundaries. @param paragraphs - Ordered text node measurements. @param descriptor - Physical page geometry. @param settings - Paragraph spacing policy. @returns Ordered page frames. */
export function createSwPageFrames(
  paragraphs: readonly SwTextFrameInput[],
  descriptor: WriterPageDescriptorValue | SwPageDescriptorLayout,
  settings?: SwTextFrameSettings,
): readonly SwPageFrame[] {
  const descriptorRecords =
    "descriptors" in descriptor
      ? descriptor.descriptors
      : [{ followName: descriptor.name, value: descriptor }];
  if (descriptorRecords.length === 0) throw new Error("Writer layout requires a page descriptor.");
  const descriptorByName = new Map(
    descriptorRecords.map(
      /** Indexes one immutable page descriptor. @param record - Descriptor record. @returns Name and record. */ (
        record,
      ) => [record.value.name, record] as const,
    ),
  );
  let activeDescriptor = descriptorByName.get(
    "initialName" in descriptor ? descriptor.initialName : descriptor.name,
  );
  if (activeDescriptor === undefined)
    throw new Error("Writer layout initial page descriptor is missing.");
  const pages: SwTextFrame[][] = [[]];
  const pageDescriptors: WriterPageDescriptorValue[] = [activeDescriptor.value];
  let used = 0;
  for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
    const gap = getSwTextFrameGap(paragraphs[paragraphIndex - 1], paragraph, settings);
    const nextParagraph = paragraphs[paragraphIndex + 1];
    const currentPage = pages[pages.length - 1] as SwTextFrame[];
    const currentDescriptor = pageDescriptors[pages.length - 1] as WriterPageDescriptorValue;
    const availableHeight =
      currentDescriptor.height - currentDescriptor.topMargin - currentDescriptor.bottomMargin;
    const wholeParagraphHeight = paragraph.lines.reduce(
      /** Handles Writer formatting state. @param sum - Input value. @param line - Input value. @returns Callback result. */ (
        sum,
        line,
      ) => sum + line.height,
      0,
    );
    const nextFirstLine = nextParagraph?.lines[0];
    if (
      paragraph.keepWithNext &&
      nextParagraph !== undefined &&
      nextFirstLine !== undefined &&
      currentPage.length > 0 &&
      wholeParagraphHeight + nextFirstLine.height <= availableHeight &&
      used +
        gap +
        wholeParagraphHeight +
        getSwTextFrameGap(paragraph, nextParagraph, settings) +
        nextFirstLine.height >
        availableHeight
    ) {
      pages.push([]);
      activeDescriptor = descriptorByName.get(activeDescriptor.followName);
      if (activeDescriptor === undefined)
        throw new Error("Writer layout follow page descriptor is missing.");
      pageDescriptors.push(activeDescriptor.value);
      used = 0;
    }
    let firstLine = 0;
    while (firstLine < paragraph.lines.length) {
      const page = pages[pages.length - 1] as SwTextFrame[];
      const pageDescriptor = pageDescriptors[pages.length - 1] as WriterPageDescriptorValue;
      const bodyHeight =
        pageDescriptor.height - pageDescriptor.topMargin - pageDescriptor.bottomMargin;
      const topSpacing = firstLine === 0 ? gap : 0;
      const line = paragraph.lines[firstLine] as (typeof paragraph.lines)[number];
      if (page.length > 0 && used + topSpacing + line.height > bodyHeight) {
        pages.push([]);
        activeDescriptor = descriptorByName.get(activeDescriptor.followName);
        if (activeDescriptor === undefined)
          throw new Error("Writer layout follow page descriptor is missing.");
        pageDescriptors.push(activeDescriptor.value);
        used = 0;
        continue;
      }
      let lastLine = firstLine;
      let height = topSpacing + line.height;
      while (
        lastLine + 1 < paragraph.lines.length &&
        used + height + (paragraph.lines[lastLine + 1] as SwTextLine).height <= bodyHeight
      ) {
        lastLine += 1;
        height += (paragraph.lines[lastLine] as SwTextLine).height;
      }
      page.push(makeSwTextFrame(paragraph, firstLine, lastLine, topSpacing));
      used += height;
      firstLine = lastLine + 1;
      if (firstLine < paragraph.lines.length) {
        pages.push([]);
        activeDescriptor = descriptorByName.get(activeDescriptor.followName);
        if (activeDescriptor === undefined)
          throw new Error("Writer layout follow page descriptor is missing.");
        pageDescriptors.push(activeDescriptor.value);
        used = 0;
      }
    }
  }
  return Object.freeze(
    pages.map(
      /** Freezes one physical page. @param textFrames - Page content frames. @param index - Page index. @returns Immutable page frame. */ (
        textFrames,
        index,
      ) =>
        Object.freeze({
          descriptor: pageDescriptors[index] as WriterPageDescriptorValue,
          number: index + 1,
          textFrames: Object.freeze(textFrames),
        }),
    ),
  );
}

/** @fileoverview Creates Writer page frames from measured text-frame lines. */

import type { WriterPageDescriptorValue } from "./pagedesc";
import {
  getSwTextFrameGap,
  makeSwTextFrame,
  type SwTextFrame,
  type SwTextFrameInput,
  type SwTextLine,
} from "../text/txtfrm";

/** One physical page and its ordered text-frame fragments. */
export interface SwPageFrame {
  readonly number: number;
  readonly textFrames: readonly SwTextFrame[];
}

/** Creates at least the initial page; splits a text node only at measured line boundaries. @param paragraphs - Ordered text node measurements. @param descriptor - Physical page geometry. @returns Ordered page frames. */
export function createSwPageFrames(
  paragraphs: readonly SwTextFrameInput[],
  descriptor: WriterPageDescriptorValue,
): readonly SwPageFrame[] {
  const bodyHeight = descriptor.height - descriptor.topMargin - descriptor.bottomMargin;
  const pages: SwTextFrame[][] = [[]];
  let used = 0;
  for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
    const gap = getSwTextFrameGap(paragraphs[paragraphIndex - 1], paragraph);
    let firstLine = 0;
    while (firstLine < paragraph.lines.length) {
      const page = pages[pages.length - 1] as SwTextFrame[];
      const topSpacing = firstLine === 0 ? gap : 0;
      const line = paragraph.lines[firstLine] as (typeof paragraph.lines)[number];
      if (page.length > 0 && used + topSpacing + line.height > bodyHeight) {
        pages.push([]);
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
        used = 0;
      }
    }
  }
  return Object.freeze(
    pages.map(
      /** Freezes one physical page. @param textFrames - Page content frames. @param index - Page index. @returns Immutable page frame. */ (
        textFrames,
        index,
      ) => Object.freeze({ number: index + 1, textFrames: Object.freeze(textFrames) }),
    ),
  );
}

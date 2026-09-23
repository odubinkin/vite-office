/** @fileoverview Projects Writer's text-frame paragraph spacing into browser point values. */

import { getSwTextFrameGap, type SwTextFrameInput } from "../../source/core/text/txtfrm";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";

/** Computes the upstream-shaped adjacent paragraph gap for a browser paragraph projection. @param previous - Previous paragraph. @param current - Current paragraph. @returns Gap in points. */
export function getWriterParagraphGap(
  previous: WriterParagraphProjection | undefined,
  current: WriterParagraphProjection,
): number {
  const toInput =
    /** Converts one view paragraph to Writer spacing input. @param paragraph - View paragraph. @returns Text frame input. */ (
      paragraph: WriterParagraphProjection,
    ): SwTextFrameInput => ({
      id: paragraph.id,
      lines: [],
      lowerSpacing: paragraph.computedStyle.lowerSpacingPt * 20,
      style: paragraph.style,
      contextualSpacing: paragraph.computedStyle.contextualSpacing ?? false,
      upperSpacing: paragraph.computedStyle.upperSpacingPt * 20,
    });
  return (
    getSwTextFrameGap(previous === undefined ? undefined : toInput(previous), toInput(current)) / 20
  );
}

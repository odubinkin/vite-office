/** @fileoverview Source-relative size calculation for native Writer fly frames. */
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import type { WriterPageDescriptorValue } from "./pagedesc";

/** Native upper frame print dimensions in twips. */
export interface SwFlyPrintExtent {
  readonly width: number;
  readonly height: number;
}

/** Original SwFlyFrame::CalcRel dimension and proportional sync arithmetic for the paged layout. @param size - Native frame size. @param upper - Original upper print extent. @param page - Actual page dimensions. @returns Resolved frame size. */
export function CalcFlyRelativeSize(
  size: SwFormatFrameSize,
  upper: SwFlyPrintExtent,
  page: WriterPageDescriptorValue,
): SwFlyPrintExtent {
  const widthPercent = size.GetWidthPercent();
  const heightPercent = size.GetHeightPercent();
  const originalWidth = size.GetWidth();
  const originalHeight = size.GetHeight();
  let width = originalWidth;
  let height = originalHeight;
  if (widthPercent !== 0 && widthPercent !== SwFormatFrameSize.SYNCED) {
    const extent =
      size.GetWidthPercentRelation() === RelOrientation.PAGE_FRAME
        ? page.width
        : Math.min(upper.width, page.width - page.leftMargin - page.rightMargin);
    width = Math.round((extent * widthPercent) / 100);
  }
  if (heightPercent !== 0 && heightPercent !== SwFormatFrameSize.SYNCED) {
    const extent =
      size.GetHeightPercentRelation() === RelOrientation.PAGE_FRAME
        ? page.height
        : Math.min(upper.height, page.height - page.topMargin - page.bottomMargin);
    height = Math.round((extent * heightPercent) / 100);
  }
  if (originalHeight !== 0 && widthPercent === SwFormatFrameSize.SYNCED)
    width = Math.trunc((width * height) / originalHeight);
  else if (originalWidth !== 0 && heightPercent === SwFormatFrameSize.SYNCED)
    height = Math.trunc((height * width) / originalWidth);
  return { width, height };
}

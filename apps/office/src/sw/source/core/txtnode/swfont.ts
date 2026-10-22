/** @fileoverview Consumed horizontal SwSubFont::CalcEsc arithmetic from swfont.cxx; original font metrics are supplied by the platform device, not invented font services. */
import { DFLT_ESC_AUTO_SUB, DFLT_ESC_AUTO_SUPER } from "../../../../editeng/inc/escapementitem";
/** Original horizontal baseline displacement in platform metric units, including signed truncation. @param escapement - Actual signed16 offset. @param originalHeight - Original device height. @param originalAscent - Original device ascent. @param height - Proportional device height. @param ascent - Proportional device ascent. @returns Downward baseline displacement. */
export function getHorizontalEscapementOffset(
  escapement: number,
  originalHeight: number,
  originalAscent: number,
  height: number,
  ascent: number,
): number {
  switch (escapement) {
    case DFLT_ESC_AUTO_SUB:
      return originalHeight - originalAscent - height + ascent;
    case DFLT_ESC_AUTO_SUPER:
      return ascent - originalAscent;
    default:
      return -Math.trunc((originalHeight * escapement) / 100) || 0;
  }
}

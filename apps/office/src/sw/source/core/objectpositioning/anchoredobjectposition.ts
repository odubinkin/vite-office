/** @fileoverview Source positioning arithmetic for the horizontal paged Writer text fly. */
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import type { SwFlyFrameFormat } from "../layout/atrfrm";
import type { WriterPageDescriptorValue } from "../layout/pagedesc";

/** Horizontal anchor and alignment extent in native twips. */
export interface SwFlyHoriEnvironment {
  readonly availableWidth: number;
  readonly page: WriterPageDescriptorValue;
  readonly pageNumber: number;
  readonly paragraphLeft: number;
  readonly paragraphRight: number;
  readonly rightToLeft: boolean;
}

/** Computes native manual/center/right/left offsets using the represented page and paragraph alignments. @param format - Actual fly format. @param width - Resolved native width. @param environment - Native anchor's alignment extent. @returns Left position and resolved orientation. */
export function CalcRelPosX(
  format: SwFlyFrameFormat,
  width: number,
  environment: SwFlyHoriEnvironment,
): { readonly left: number; readonly orientation: number } {
  const item = format.GetHoriOrient();
  const toggle = item.IsPosToggle() && environment.pageNumber % 2 === 0;
  let orientation = item.GetHoriOrient();
  if (toggle && orientation === H.LEFT) orientation = H.RIGHT;
  else if (toggle && orientation === H.RIGHT) orientation = H.LEFT;
  const relation = item.GetRelationOrient();
  const { page, paragraphLeft, paragraphRight, availableWidth } = environment;
  let offset = 0;
  let alignmentWidth = availableWidth;
  if (relation === R.PAGE_FRAME) {
    offset = -page.leftMargin;
    alignmentWidth = page.width;
  } else if (relation === R.PAGE_PRINT_AREA)
    alignmentWidth = page.width - page.leftMargin - page.rightMargin;
  else if (relation === R.PRINT_AREA) {
    offset = paragraphLeft;
    alignmentWidth -= paragraphLeft + paragraphRight;
  }
  const spacing = format.GetLRSpace();
  if (orientation === H.NONE)
    offset +=
      toggle || (!item.IsPosToggle() && environment.rightToLeft)
        ? alignmentWidth - width - item.GetPos()
        : item.GetPos();
  else if (orientation === H.CENTER)
    offset += Math.trunc(alignmentWidth / 2) - Math.trunc(width / 2);
  else if (orientation === H.RIGHT) offset += alignmentWidth - width - spacing.ResolveRight();
  else offset += spacing.ResolveLeft();
  return { left: offset, orientation };
}

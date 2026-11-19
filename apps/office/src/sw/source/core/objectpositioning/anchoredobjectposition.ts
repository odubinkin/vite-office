/** @fileoverview Source positioning arithmetic for the horizontal paged Writer text fly. */
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
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

/** Printable reference geometry for vertical placement relative to an actual paragraph. */
export interface SwFlyVertEnvironment {
  readonly page: WriterPageDescriptorValue;
  readonly body: WriterPageDescriptorValue;
  readonly anchorTop: number;
  readonly anchorHeight: number;
}

/** Resolves the native vertical relation and alignment in the paragraph coordinate system. @param format - Actual fly format. @param height - Graphic height in twips. @param environment - Native page and paragraph bounds. @returns Relative top in twips. */
export function CalcRelPosY(
  format: SwFlyFrameFormat,
  height: number,
  environment: SwFlyVertEnvironment,
): number {
  const item = format.GetVertOrient();
  const relation = item.GetRelationOrient();
  const { page, body, anchorTop, anchorHeight } = environment;
  let start = anchorTop;
  let length = anchorHeight;
  switch (relation) {
    case R.PAGE_FRAME:
    case R.PAGE_PRINT_AREA_TOP:
      start = 0;
      length = page.height;
      break;
    case R.PAGE_PRINT_AREA:
      start = body.topMargin;
      length = page.height - body.topMargin - body.bottomMargin;
      break;
    case R.PAGE_PRINT_AREA_BOTTOM:
      start = page.height - body.bottomMargin;
      length = body.bottomMargin;
      break;
    case R.TEXT_LINE:
      length = 0;
      break;
  }
  const offset = start - anchorTop;
  const spacing = format.GetULSpace();
  const upper = spacing.GetUpper();
  const lower = spacing.GetLower();
  const atLine = relation === R.TEXT_LINE;
  switch (item.GetVertOrient()) {
    case V.CENTER:
      if (relation === R.PAGE_PRINT_AREA_TOP)
        return (
          Math.trunc(offset / 2) +
          Math.trunc((offset + body.topMargin) / 2) -
          Math.trunc(height / 2)
        );
      return offset + Math.trunc(length / 2) - Math.trunc(height / 2);
    case V.CHAR_CENTER:
    case V.LINE_CENTER:
      return offset + Math.trunc(length / 2) - Math.trunc(height / 2);
    case V.BOTTOM:
      if (relation === R.PAGE_PRINT_AREA_TOP) return offset + body.topMargin - height - lower;
      if (
        atLine ||
        ((relation === R.FRAME || relation === R.PRINT_AREA) &&
          format.GetSurround().GetSurround() === WrapTextMode.NONE)
      )
        return offset + length + upper;
      return offset + length - height - lower;
    case V.CHAR_BOTTOM:
    case V.LINE_BOTTOM:
      return offset + length + upper;
    case V.NONE:
      return offset + (atLine || relation === R.CHAR ? -item.GetPos() : item.GetPos());
    case V.TOP:
    case V.LINE_TOP:
      return offset + (atLine ? -height - lower : upper);
    default:
      return offset;
  }
}

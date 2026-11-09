/** @fileoverview Native RTF text fly shape syntax from rtfattributeoutput.cxx. */
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { ConvertBorderWidthToWord } from "../../../../editeng/source/items/borderline";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import type { XFillColorItem } from "../../../../svx/inc/xflclit";
import type { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import type { Color } from "../../../../tools/inc/color";
import { XATTR_FILLCOLOR, XATTR_FILLSTYLE } from "../../../../svx/inc/xdef";
import { RES_FRAMEDIR, RES_SURROUND } from "../../../inc/hintids";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import type { SwFrameFormat } from "../../core/layout/atrfrm";

/** Converts a native RGB color to the OfficeArt BGR value. @param color - Native color. @returns BGR. */
function RGBToBGR(color: Readonly<Color>): number {
  return color.GetRed() | (color.GetGreen() << 8) | (color.GetBlue() << 16);
}

/** Writes an ordinary Writer text frame as an RTF text-box shape. @param format - Actual text fly. @param text - Owned native text range written with a fresh table depth. @param defaultDirection - Original Word export context direction. @returns Shape group. */
export function OutputFlyFrame(
  format: SwFrameFormat,
  text: string,
  defaultDirection: SvxFrameDirection,
): string {
  const properties: [string, number][] = [["shapeType", 202]];
  const lr = format.GetLRSpace();
  const ul = format.GetULSpace();
  properties.push(
    ["dxWrapDistLeft", lr.ResolveLeft() * 635],
    ["dxWrapDistRight", lr.ResolveRight() * 635],
    ["dyWrapDistTop", ul.GetUpper() * 635],
    ["dyWrapDistBottom", ul.GetLower() * 635],
  );

  const surround = format.GetSurround();
  const directWrap = format.GetAttrSet().GetItemState(RES_SURROUND, false) === SfxItemState.SET;
  const wrap = directWrap ? surround.GetSurround() : WrapTextMode.NONE;
  let wr = 2;
  let wrk: number | undefined;
  switch (wrap) {
    case WrapTextMode.NONE:
      wr = 1;
      break;
    case WrapTextMode.THROUGH:
      wr = 3;
      break;
    case WrapTextMode.PARALLEL:
      wrk = 0;
      break;
    default:
      wrk = 3;
      break;
  }
  if (directWrap && surround.IsContour()) wr = 4;
  let controls = `\\shpwr${wr}`;
  if (wrk !== undefined) controls += `\\shpwrk${wrk}`;

  const size = format.GetFrameSize();
  const vertical = format.GetVertOrient();
  const top = vertical.GetPos();
  const verticalPage = vertical.GetRelationOrient() === RelOrientation.PAGE_FRAME;
  properties.push(["posrelv", verticalPage ? 1 : 2]);
  if (!verticalPage) controls += "\\shpbypara\\shpbyignore";
  switch (vertical.GetVertOrient()) {
    case VertOrientation.TOP:
    case VertOrientation.LINE_TOP:
      properties.push(["posv", 1]);
      break;
    case VertOrientation.CENTER:
    case VertOrientation.LINE_CENTER:
      properties.push(["posv", 2]);
      break;
    case VertOrientation.BOTTOM:
    case VertOrientation.LINE_BOTTOM:
      properties.push(["posv", 3]);
      break;
  }
  controls += `\\shptop${top}\\shpbottom${top + size.GetHeight()}`;

  const horizontal = format.GetHoriOrient();
  const left = horizontal.GetPos();
  const horizontalPage = horizontal.GetRelationOrient() === RelOrientation.PAGE_FRAME;
  properties.push(["posrelh", horizontalPage ? 1 : 2]);
  if (!horizontalPage) controls += "\\shpbxcolumn\\shpbxignore";
  switch (horizontal.GetHoriOrient()) {
    case HoriOrientation.LEFT:
      properties.push(["posh", 1]);
      break;
    case HoriOrientation.CENTER:
      properties.push(["posh", 2]);
      break;
    case HoriOrientation.RIGHT:
      properties.push(["posh", 3]);
      break;
  }
  controls += `\\shpleft${left}\\shpright${left + size.GetWidth()}`;

  const box = format.GetBox();
  properties.push(
    ["dxTextLeft", box.GetDistance(SvxBoxItemLine.LEFT) * 635],
    ["dyTextTop", box.GetDistance(SvxBoxItemLine.TOP) * 635],
    ["dxTextRight", box.GetDistance(SvxBoxItemLine.RIGHT) * 635],
    ["dyTextBottom", box.GetDistance(SvxBoxItemLine.BOTTOM) * 635],
  );
  const border = [box.GetTop(), box.GetBottom(), box.GetLeft(), box.GetRight()].find(
    /** Selects the source's first drawn edge. @param line - Native border. @returns Whether it is drawn. */
    (line) => line !== undefined && line.GetBorderLineStyle() !== BorderLineStyle.NONE,
  );
  if (border === undefined) properties.push(["fLine", 0]);
  else
    properties.push(
      ["lineColor", RGBToBGR(border.GetColor())],
      [
        "lineWidth",
        Math.trunc(ConvertBorderWidthToWord(border.GetBorderLineStyle(), border.GetWidth()) * 635),
      ],
    );

  const fill = format.GetAttrSet().GetItem(XATTR_FILLSTYLE) as XFillStyleItem | undefined;
  if (fill?.GetValue() === FillStyle.SOLID) {
    const color = format.GetAttrSet().GetItem(XATTR_FILLCOLOR) as XFillColorItem | undefined;
    if (color !== undefined) properties.push(["fillColor", RGBToBGR(color.GetColorValue())]);
  }
  if (format.GetAttrSet().GetItemIfSet(RES_FRAMEDIR, false)) {
    const direction = format.GetFrameDir().GetValue();
    const effective = direction === SvxFrameDirection.Environment ? defaultDirection : direction;
    if (effective === SvxFrameDirection.Vertical_RL_TB) properties.push(["txflTextFlow", 3]);
    else if (direction === SvxFrameDirection.Vertical_LR_BT) properties.push(["txflTextFlow", 2]);
  }
  const width = size.GetWidthPercent();
  const height = size.GetHeightPercent();
  if (width && width !== SwFormatFrameSize.SYNCED)
    properties.push(
      ["pctHoriz", width * 10],
      ["sizerelh", size.GetWidthPercentRelation() === RelOrientation.PAGE_FRAME ? 1 : 0],
    );
  if (height && height !== SwFormatFrameSize.SYNCED)
    properties.push(
      ["pctVert", height * 10],
      ["sizerelv", size.GetHeightPercentRelation() === RelOrientation.PAGE_FRAME ? 1 : 0],
    );

  let result = "{\\shp{\\*\\shpinst" + controls;
  for (const [name, value] of properties) result += `{\\sp{\\sn ${name}}{\\sv ${value}}}`;
  return result + "{\\shptxt" + text + "\\pard}}}\n";
}

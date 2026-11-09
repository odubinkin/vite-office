/** @fileoverview Native Writer text frame resolution from RTFSdrImport::resolve. */
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import { round } from "../../../../sal/inc/rtl/math";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { XFillColorItem } from "../../../../svx/inc/xflclit";
import { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import { COL_BLACK, Color } from "../../../../tools/inc/color";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import { RES_BOX, RES_FRAMEDIR, RES_LR_SPACE, RES_UL_SPACE } from "../../../inc/hintids";
import { MINLAY } from "../../../inc/swtypes";
import { aFrameFormatSetRange } from "../../core/bastyp/init";
import { SwPosition } from "../../core/crsr/pam";
import { MakeFlySection } from "../../core/doc/doclay";
import type { SwFlyFrameFormat } from "../../core/layout/atrfrm";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { RTFShape } from "./rtfdocumentimpl.shape";

/** Restores a Writer RGB value from its source OfficeArt BGR channels. @param value - Original color. @returns Native color. */
function BGRToRGB(value: number): Color {
  return new Color(value & 255, (value >>> 8) & 255, (value >>> 16) & 255);
}

/** Uses the original integral UNO metric boundary. @param mm100 - Original distance. @returns Twips. */
function fromMm100(mm100: number): number {
  return Number(toTwips(BigInt(mm100), Length.mm100));
}

/** Restores a native shape margin from the original EMU property. @param value - Original value. @returns Twips after integral mm100 conversion. */
function wrapDistance(value: number): number {
  return fromMm100(Math.trunc(value / 360));
}

/** Resolves the consumed portion of RTFSdrImport's TextFrame service properties on the native fly owner. @param shape - Source state at shape text. @param anchor - Actual paragraph. @param offset - Native character anchor. @returns Registered text frame. */
export function ResolveTextFrame(
  shape: RTFShape,
  anchor: SwTextNode,
  offset: number,
): SwFlyFrameFormat {
  const document = anchor.GetDoc();
  const set = new SfxItemSet(document.GetAttrPool(), aFrameFormatSetRange);
  /** Transfers a temporary UNO-resolved native item into the format set. @param item - Native value. @returns Nothing. */
  function put(item: SfxPoolItem): void {
    try {
      set.Put(item);
    } finally {
      item.Dispose();
    }
  }

  let name = "";
  let hori = HoriOrientation.NONE;
  let vert = VertOrientation.NONE;
  let horiRelation = shape.horizontalRelation;
  let vertRelation = shape.verticalRelation;
  let widthRelation = RelOrientation.PAGE_FRAME;
  let heightRelation = RelOrientation.PAGE_FRAME;
  let widthPercent = 0;
  let heightPercent = 0;
  let autoHeight = false;
  let direction = SvxFrameDirection.Horizontal_LR_TB;
  let lineWidth = 26;
  let lineColor: Readonly<Color> = COL_BLACK;
  let line = true;
  let leftMargin = 0;
  let rightMargin = 0;
  let upperMargin = 0;
  let lowerMargin = 0;

  const position = new SwPosition(anchor, offset);
  try {
    for (const [index, [key, value]] of shape.properties.entries()) {
      // After SHPTXT the original append() applies only the generic shape properties.
      if (
        index >= shape.initialPropertyCount &&
        key !== "posh" &&
        key !== "posv" &&
        key !== "fFitShapeToText" &&
        key !== "fFilled"
      )
        continue;
      const number = toInt32(value);
      switch (key) {
        case "wzName":
          name = value;
          break;
        case "posh":
          hori =
            [
              undefined,
              HoriOrientation.LEFT,
              HoriOrientation.CENTER,
              HoriOrientation.RIGHT,
              HoriOrientation.INSIDE,
              HoriOrientation.OUTSIDE,
            ][number] ?? hori;
          break;
        case "posv":
          vert =
            [undefined, VertOrientation.TOP, VertOrientation.CENTER, VertOrientation.BOTTOM][
              number
            ] ?? vert;
          break;
        case "posrelh":
          if (number === 1) horiRelation = RelOrientation.PAGE_FRAME;
          break;
        case "posrelv":
          if (number === 1) vertRelation = RelOrientation.PAGE_FRAME;
          break;
        case "pctHoriz":
        case "pctVert": {
          const percent = round(Number(value) / 10);
          if (percent && key === "pctHoriz") widthPercent = percent;
          if (percent && key === "pctVert") heightPercent = percent;
          break;
        }
        case "sizerelh":
          if (number === 0 || number === 1)
            widthRelation = number ? RelOrientation.PAGE_FRAME : RelOrientation.FRAME;
          break;
        case "sizerelv":
          if (number === 0 || number === 1)
            heightRelation = number ? RelOrientation.PAGE_FRAME : RelOrientation.FRAME;
          break;
        case "fFitShapeToText":
          autoHeight = number === 1;
          break;
        case "dxWrapDistLeft":
          leftMargin = wrapDistance(number);
          break;
        case "dxWrapDistRight":
          rightMargin = wrapDistance(number);
          break;
        case "dyWrapDistTop":
          upperMargin = wrapDistance(number);
          break;
        case "dyWrapDistBottom":
          lowerMargin = wrapDistance(number);
          break;
        case "lineColor":
          lineColor = BGRToRGB(number);
          break;
        case "lineWidth":
          lineWidth = Math.trunc(number / 360);
          break;
        case "fLine":
          line = number !== 0;
          break;
        case "fillColor":
          put(new XFillStyleItem(FillStyle.SOLID));
          put(new XFillColorItem("", BGRToRGB(number)));
          break;
        case "fFilled":
          if (number !== 1) put(new XFillTransparenceItem(100));
          break;
        case "fillOpacity":
          put(new XFillTransparenceItem(100 - Math.trunc((number * 100) / 65536)));
          break;
        case "txflTextFlow":
          if (number === 1 || number === 3) direction = SvxFrameDirection.Vertical_RL_TB;
          else if (number === 2) direction = SvxFrameDirection.Vertical_LR_BT;
          break;
      }
    }
    const size = new SwFormatFrameSize(
      autoHeight ? SwFrameSize.Minimum : SwFrameSize.Fixed,
      Math.max(MINLAY, fromMm100(shape.right - shape.left)),
      Math.max(MINLAY, fromMm100(shape.bottom - shape.top)),
    );
    if (widthPercent > 0 && widthPercent <= 254) {
      size.SetWidthPercent(widthPercent);
      size.SetWidthPercentRelation(widthRelation);
    }
    if (heightPercent > 0 && heightPercent <= 254) {
      size.SetHeightPercent(heightPercent);
      size.SetHeightPercentRelation(heightRelation);
    }
    put(size);
    put(new SwFormatHoriOrient(fromMm100(shape.left), hori, horiRelation));
    put(new SwFormatVertOrient(fromMm100(shape.top), vert, vertRelation));
    const lr = new SvxLRSpaceItem(RES_LR_SPACE);
    lr.SetLeft(SvxIndentValue.twips(leftMargin));
    lr.SetRight(SvxIndentValue.twips(rightMargin));
    put(lr);
    put(new SvxULSpaceItem(upperMargin, lowerMargin, RES_UL_SPACE));
    put(new SvxFrameDirectionItem(direction, RES_FRAMEDIR));
    if (shape.wrap !== undefined) put(new SwFormatSurround(shape.wrap));
    const box = new SvxBoxItem(RES_BOX);
    for (const edge of [
      SvxBoxItemLine.TOP,
      SvxBoxItemLine.BOTTOM,
      SvxBoxItemLine.LEFT,
      SvxBoxItemLine.RIGHT,
    ]) {
      box.SetDistance(
        fromMm100(edge === SvxBoxItemLine.TOP || edge === SvxBoxItemLine.BOTTOM ? 127 : 254),
        edge,
      );
      if (line && lineWidth > 0)
        box.SetLine(new SvxBorderLine(lineColor, fromMm100(lineWidth)), edge);
    }
    put(box);
    const type = RndStdIds.FLY_AT_CHAR;
    const item = new SwFormatAnchor(type);
    item.SetAnchor(position);
    put(item);
    const frame = MakeFlySection(document, type, position, set);
    if (name && !document.GetSpzFrameFormats().FindFormatByName(name)) frame.SetFormatName(name);
    return frame;
  } finally {
    position.Dispose();
    set.Dispose();
  }
}

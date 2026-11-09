/** @fileoverview Native paragraph-frame property construction and deferred conversion from DomainMapper_Impl.cxx. */
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { SizeType } from "../../../../offapi/com/sun/star/text/SizeType";
import { WrapTextMode as W } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import { RES_BOX, RES_BREAK, RES_LR_SPACE, RES_UL_SPACE } from "../../../inc/hintids";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import { MINLAY } from "../../../inc/swtypes";
import { aFrameFormatSetRange } from "../../core/bastyp/init";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { convertParagraphsToSwTextFrame } from "../../core/unocore/unotext.frame";
import type { ParagraphProperties } from "./PropertyMap";

/** Final source paragraph-frame properties expressed in the original UNO units. */
interface FrameProperties {
  readonly width: number;
  readonly height: number;
  readonly heightType: SwFrameSize;
  readonly horizontal: number;
  readonly horizontalRelation: number;
  readonly x: number;
  readonly vertical: number;
  readonly verticalRelation: number;
  readonly y: number;
  readonly wrap: W;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/** Builds the consumed direct paragraph frame properties with the source defaults and edge rules. @param props - Original mapped paragraph properties. @returns Effective frame geometry. */
export function MakeFrameProperties(props: ParagraphProperties): FrameProperties {
  const width = Math.max(0, props.Getw());
  const height = Math.max(0, props.Geth());
  const heightType =
    props.GethRule() === SizeType.FIX
      ? SwFrameSize.Fixed
      : props.GethRule() === SizeType.MIN || (props.GethRule() < 0 && height > 0)
        ? SwFrameSize.Minimum
        : SwFrameSize.Variable;
  const horizontal = props.GetxAlign() < 0 ? H.NONE : props.GetxAlign();
  const horizontalRelation = props.GethAnchor() < 0 ? R.FRAME : props.GethAnchor();
  const x = props.IsxValid() ? props.Getx() : 0;
  const y = props.IsyValid() ? props.Gety() : 0;
  let vertical = props.IsyValid() || props.GetyAlign() < 0 ? V.NONE : props.GetyAlign();
  const verticalRelation =
    props.GetvAnchor() >= 0
      ? props.GetvAnchor()
      : !y && (props.IsyValid() || vertical === V.NONE)
        ? R.FRAME
        : R.PAGE_PRINT_AREA;
  if (props.GetvAnchor() === R.FRAME) vertical = V.NONE;
  const hSpace = Math.max(0, props.GethSpace());
  const vSpace = Math.max(0, props.GetvSpace());
  return {
    width,
    height,
    heightType,
    horizontal,
    horizontalRelation,
    x,
    vertical,
    verticalRelation,
    y,
    wrap: props.GetWrap() === W.MAKE_FIXED_SIZE ? W.NONE : props.GetWrap(),
    left: horizontal === H.LEFT ? 0 : hSpace,
    right: horizontal === H.RIGHT ? 0 : hSpace,
    top: vertical === V.TOP ? 0 : vSpace,
    bottom: vertical === V.BOTTOM ? 0 : vSpace,
  };
}

/** One native body paragraph scheduled for conversion after table import. */
export interface PendingParagraphFrame {
  readonly node: SwTextNode;
  readonly properties: FrameProperties;
}

/** Uses the original integral UNO measure conversion. @param value - Original measure. @returns Twips. */
function twips(value: number): number {
  return Number(toTwips(BigInt(value), Length.mm100));
}

/** Builds the native frame set and moves the original border lines from the paragraph range. @param first - Starting paragraph. @param last - Ending paragraph. @param value - Effective frame properties. @returns Nothing. */
function ConvertFrame(first: SwTextNode, last: SwTextNode, value: FrameProperties): void {
  const doc = first.GetDoc();
  const set = new SfxItemSet(doc.GetAttrPool(), aFrameFormatSetRange);
  /** Transfers an owned native frame item. @param item - Temporary value. @returns Nothing. */
  function put(item: SfxPoolItem): void {
    try {
      set.Put(item);
    } finally {
      item.Dispose();
    }
  }
  try {
    const size = new SwFormatFrameSize(
      value.heightType,
      Math.max(MINLAY, twips(value.width)),
      Math.max(MINLAY, twips(value.height)),
    );
    size.SetWidthSizeType(value.width ? SwFrameSize.Fixed : SwFrameSize.Minimum);
    put(size);
    put(new SwFormatHoriOrient(twips(value.x), value.horizontal, value.horizontalRelation));
    put(new SwFormatVertOrient(twips(value.y), value.vertical, value.verticalRelation));
    put(new SwFormatSurround(value.wrap));
    const lr = new SvxLRSpaceItem(RES_LR_SPACE);
    lr.SetLeft(SvxIndentValue.twips(twips(value.left)));
    lr.SetRight(SvxIndentValue.twips(twips(value.right)));
    put(lr);
    put(new SvxULSpaceItem(twips(value.top), twips(value.bottom), RES_UL_SPACE));
    put(new XFillTransparenceItem(100));
    const box = new SvxBoxItem(RES_BOX);
    const nodes = first.GetNodes();
    for (const edge of [
      SvxBoxItemLine.LEFT,
      SvxBoxItemLine.RIGHT,
      SvxBoxItemLine.TOP,
      SvxBoxItemLine.BOTTOM,
    ]) {
      const line = (first.GetAttr(RES_BOX) as SvxBoxItem).GetLine(edge);
      let same = true;
      for (let index = first.GetIndex() + 1; index <= last.GetIndex(); index++) {
        const candidate = (
          nodes.at(index).GetTextNode()?.GetAttr(RES_BOX) as SvxBoxItem | undefined
        )?.GetLine(edge);
        if (
          (line === undefined && candidate !== undefined) ||
          (line && (!candidate || !line.equals(candidate)))
        )
          same = false;
      }
      if (same) box.SetLine(line, edge);
    }
    put(box);
    for (let index = first.GetIndex(); index <= last.GetIndex(); index++) {
      const node = nodes.at(index).GetTextNode();
      if (!node) throw new Error("assert(native frame paragraph)");
      const paragraphBox = (node.GetAttr(RES_BOX) as SvxBoxItem).Clone();
      try {
        for (const edge of [
          SvxBoxItemLine.LEFT,
          SvxBoxItemLine.RIGHT,
          SvxBoxItemLine.TOP,
          SvxBoxItemLine.BOTTOM,
        ])
          paragraphBox.SetLine(undefined, edge);
        node.SetAttr(paragraphBox);
      } finally {
        paragraphBox.Dispose();
      }
      node.ResetAttr(RES_BREAK);
    }
    convertParagraphsToSwTextFrame(first, last, set);
  } finally {
    set.Dispose();
  }
}

/** Groups adjacent paragraphs by the effective native property sequence and converts after tables. @param pending - Ordered frame paragraphs. @returns Nothing. */
export function ExecuteFrameConversion(pending: readonly PendingParagraphFrame[]): void {
  for (let index = 0; index < pending.length;) {
    const first = pending[index] as PendingParagraphFrame;
    const values = Object.values(first.properties);
    let last = first.node;
    index++;
    while (index < pending.length) {
      const next = pending[index] as PendingParagraphFrame;
      if (
        next.node.GetIndex() !== last.GetIndex() + 1 ||
        !Object.values(next.properties).every(
          /** Checks the corresponding property in the original sequence. @param value - Actual native value. @param slot - Sequence position. @returns Whether equal. */
          (value, slot) => value === values[slot],
        )
      )
        break;
      last = next.node;
      index++;
    }
    ConvertFrame(first.node, last, first.properties);
  }
}

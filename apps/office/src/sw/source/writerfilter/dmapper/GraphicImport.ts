/** @fileoverview Imports an embedded inline or anchored picture into Writer's graphic node and frame owners. */
import type { EmbeddedGraphic } from "../../../../oox/source/helper/graphichelper";
import { SvxOpaqueItem } from "../../../../editeng/inc/opaqitem";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { toTwips, Length } from "../../../../o3tl/inc/unit_conversion";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { Size } from "../../../../tools/inc/gen";
import { Graphic } from "../../../../vcl/source/gdi/graph";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import { SwFormatWrapInfluenceOnObjPos } from "../../../inc/fmtwrapinfluenceonobjpos";
import { RES_LR_SPACE, RES_UL_SPACE, RES_OPAQUE } from "../../../inc/hintids";
import type { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { aFrameFormatSetRange } from "../../core/bastyp/init";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwXHeadFootText } from "../../core/unocore/unotext";
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import {
  emuToWriterTwip,
  horizontalPosition,
  verticalPosition,
  type DrawingPosition,
} from "./GraphicHelpers";

const wrapTextValues: ReadonlyMap<string, WrapTextMode> = new Map([
  ["bothSides", WrapTextMode.PARALLEL],
  ["left", WrapTextMode.LEFT],
  ["right", WrapTextMode.RIGHT],
  ["largest", WrapTextMode.DYNAMIC],
]);

/** Resolves the native square-wrap side value. @param value - DrawingML wrapText token. @returns Native mode or no change. */
export function handleWrapTextValue(value: string): WrapTextMode | undefined {
  return wrapTextValues.get(value);
}

/** Source WordprocessingDrawing anchor after resolution of its fast-token resources. */
export interface DrawingAnchor {
  readonly inline: boolean;
  readonly width: number;
  readonly height: number;
  readonly horizontal: DrawingPosition;
  readonly vertical: DrawingPosition;
  readonly behindDocument: boolean;
  readonly wrap: WrapTextMode;
  readonly allowOverlap: boolean;
  readonly distances: { left: number; right: number; top: number; bottom: number };
}

/** Creates a positioned graphic using the active text append owner. @param mapper - Native mapper with the current Writer story. @param data - Resolved embedded graphic. @param drawing - Parsed anchor properties. @returns Nothing. */
export function ImportGraphic(
  mapper: DomainMapper_Impl,
  data: EmbeddedGraphic,
  drawing: DrawingAnchor,
): void {
  const text = mapper.body;
  const node = text.GetTextNodes().at(-1);
  if (!node) throw new Error("DrawingML picture requires a Writer text anchor.");
  const document = text.GetDoc();
  const position = new SwPosition(node, node.Len());
  const selection = new SwPaM(position);
  const items = new SfxItemSet(document.GetAttrPool(), aFrameFormatSetRange);
  /** Passes a frame item to the native item set and releases the temporary. @param item - New attribute. @returns Nothing. */
  function put(item: SfxPoolItem): void {
    try {
      items.Put(item);
    } finally {
      item.Dispose();
    }
  }
  try {
    const width = emuToWriterTwip(drawing.width);
    const height = emuToWriterTwip(drawing.height);
    put(new SwFormatAnchor(drawing.inline ? RndStdIds.FLY_AS_CHAR : RndStdIds.FLY_AT_CHAR));
    put(new SwFormatFrameSize(SwFrameSize.Fixed, width, height));
    let { left, right, top, bottom } = drawing.distances;
    if (!drawing.inline) {
      const compatibility = mapper.GetSettingsTable().GetWordCompatibilityMode();
      const horizontal = horizontalPosition(drawing.horizontal);
      const vertical = verticalPosition(drawing.vertical);
      ({ left, right, top, bottom } = adjustMarginsAndOrientation(
        drawing,
        horizontal,
        vertical,
        compatibility,
      ));
      if (vertical.GetRelationOrient() === RelOrientation.TEXT_LINE)
        vertical.SetPos(-vertical.GetPos());
      put(horizontal);
      put(vertical);
      put(new SwFormatSurround(drawing.wrap));
      const overlap = new SwFormatWrapInfluenceOnObjPos();
      overlap.SetAllowOverlap(drawing.allowOverlap);
      put(overlap);
      const behind =
        drawing.behindDocument && (drawing.wrap === WrapTextMode.THROUGH || compatibility <= 14);
      put(new SvxOpaqueItem(RES_OPAQUE, !(text instanceof SwXHeadFootText) && !behind));
    }
    const lr = new SvxLRSpaceItem(RES_LR_SPACE);
    lr.SetLeft(SvxIndentValue.twips(left));
    lr.SetRight(SvxIndentValue.twips(right));
    put(lr);
    put(new SvxULSpaceItem(top, bottom, RES_UL_SPACE));
    const graphic = new Graphic(data.GetNativeData(), data.mediaType, new Size(width, height));
    document.GetDocumentContentOperationsManager().InsertGraphic(selection, graphic, items);
  } finally {
    items.Dispose();
    selection.Dispose();
    position.Dispose();
  }
}

/** Applies GraphicImport margin and page-relative alignment rules. @param drawing - DrawingML anchor. @param horizontal - Native horizontal orientation to adjust. @param vertical - Native vertical orientation. @param compatibility - Word compatibility mode. @returns Writer distances in twips. */
function adjustMarginsAndOrientation(
  drawing: DrawingAnchor,
  horizontal: SwFormatHoriOrient,
  vertical: SwFormatVertOrient,
  compatibility: number,
): DrawingAnchor["distances"] {
  let { left, right, top, bottom } = drawing.distances;
  if (drawing.wrap === WrapTextMode.THROUGH) left = right = top = bottom = 0;
  const alignment = horizontal.GetHoriOrient();
  const relation = horizontal.GetRelationOrient();
  const page =
    relation === RelOrientation.PAGE_PRINT_AREA || relation === RelOrientation.PAGE_FRAME;
  if (
    relation === RelOrientation.FRAME &&
    compatibility < 15 &&
    (alignment === HoriOrientation.LEFT ||
      alignment === HoriOrientation.RIGHT ||
      alignment === HoriOrientation.INSIDE ||
      alignment === HoriOrientation.OUTSIDE)
  )
    horizontal.SetRelationOrient(RelOrientation.PRINT_AREA);
  if (relation !== RelOrientation.CHAR) {
    if (alignment === HoriOrientation.LEFT && relation !== RelOrientation.PAGE_RIGHT) left = 0;
    else if (alignment === HoriOrientation.RIGHT && relation !== RelOrientation.PAGE_LEFT)
      right = 0;
    else if (
      page &&
      (alignment === HoriOrientation.INSIDE || alignment === HoriOrientation.OUTSIDE)
    ) {
      horizontal.SetPosToggle(true);
      horizontal.SetHoriOrient(
        alignment === HoriOrientation.INSIDE ? HoriOrientation.LEFT : HoriOrientation.RIGHT,
      );
      left = right = 0;
    }
  }
  const verticalRelation = vertical.GetRelationOrient();
  if (
    verticalRelation === RelOrientation.PAGE_PRINT_AREA ||
    verticalRelation === RelOrientation.PAGE_FRAME
  ) {
    if (vertical.GetVertOrient() === VertOrientation.TOP) top = 0;
    if (vertical.GetVertOrient() === VertOrientation.BOTTOM) bottom = 0;
  }
  return {
    left: distance(left),
    right: distance(right),
    top: distance(top),
    bottom: distance(bottom),
  };
}

/** Matches ProcessShapeOptions integer hundredths of a millimetre before the frame property conversion. @param value - Source EMUs. @returns Nonnegative Writer twips. */
function distance(value: number): number {
  return Number(toTwips(BigInt(Math.max(0, Math.trunc(value / 360))), Length.mm100));
}

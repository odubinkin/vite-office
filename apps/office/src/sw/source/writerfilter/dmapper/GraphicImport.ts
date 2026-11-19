/** @fileoverview Imports an embedded floating picture into Writer's graphic node and frame owners. */
import type { EmbeddedGraphic } from "../../../../oox/source/helper/graphichelper";
import { SvxOpaqueItem } from "../../../../editeng/inc/opaqitem";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { Size } from "../../../../tools/inc/gen";
import { Graphic } from "../../../../vcl/source/gdi/graph";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import { RES_OPAQUE } from "../../../inc/hintids";
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

/** Source WordprocessingDrawing anchor after resolution of its fast-token resources. */
export interface DrawingAnchor {
  readonly width: number;
  readonly height: number;
  readonly horizontal: DrawingPosition;
  readonly vertical: DrawingPosition;
  readonly behindDocument: boolean;
  readonly wrap: WrapTextMode;
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
  const anchor = new SwFormatAnchor(RndStdIds.FLY_AT_CHAR);
  try {
    const width = emuToWriterTwip(drawing.width);
    const height = emuToWriterTwip(drawing.height);
    items.Put(anchor);
    items.Put(new SwFormatFrameSize(SwFrameSize.Fixed, width, height));
    items.Put(horizontalPosition(drawing.horizontal));
    items.Put(verticalPosition(drawing.vertical));
    items.Put(new SwFormatSurround(drawing.wrap));
    const behind =
      drawing.behindDocument &&
      (drawing.wrap === WrapTextMode.THROUGH ||
        mapper.GetSettingsTable().GetWordCompatibilityMode() <= 14);
    items.Put(new SvxOpaqueItem(RES_OPAQUE, !(text instanceof SwXHeadFootText) && !behind));
    const graphic = new Graphic(data.GetNativeData(), data.mediaType, new Size(width, height));
    document.GetDocumentContentOperationsManager().InsertGraphic(selection, graphic, items);
  } finally {
    anchor.Dispose();
    items.Dispose();
    selection.Dispose();
    position.Dispose();
  }
}

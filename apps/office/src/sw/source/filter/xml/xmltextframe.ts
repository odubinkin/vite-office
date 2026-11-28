/** @fileoverview Writer native frame properties and fly text cursor at the shared ODF SAX boundary. */
import { Graphic } from "../../../../vcl/source/gdi/graph";
import { Size } from "../../../../tools/inc/gen";
import { SvxOpaqueItem } from "../../../../editeng/inc/opaqitem";
import type { XMLGraphic, SvXMLGraphicHelper } from "../../../../xmloff/source/core/xmlgrhlp";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { aFrameFormatSetRange } from "../../core/bastyp/init";
import {
  getBitmapFillItem,
  getBitmapFillProperties,
  getFillProperties,
  type XMLBitmapStyleExport,
} from "./xmlexp-fill";
import type { XFillBitmapItem } from "../../../../svx/inc/xbtmpit";
import { importBoxProperties, putFrameFillProperties } from "./xmlimpit";
import { exportBoxProperties } from "./xmlexpit";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SwFormatFlySplit } from "../../../inc/formatflysplit";
import { SwFormatFollowTextFlow } from "../../../inc/fmtfollowtextflow";
import {
  RES_FOLLOW_TEXT_FLOW,
  RES_OPAQUE,
  RES_WRAP_INFLUENCE_ON_OBJPOS,
} from "../../../inc/hintids";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import type { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { MINLAY } from "../../../inc/swtypes";
import { RES_BOX, RES_FRAMEDIR, RES_LR_SPACE, RES_UL_SPACE } from "../../../inc/hintids";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type {
  XMLTextFrameAttributes,
  XMLTextFrameStyle,
} from "../../../../xmloff/source/text/XMLTextFrameContext";
import type { XMLTextFrameExportSource } from "../../../../xmloff/source/text/XMLTextFrameExport";
import type { XMLTextExportBlock } from "../../../../xmloff/source/table/XMLTableExport";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import type { SwSectionBlock } from "../../core/docnode/nodes";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { XMLTextParagraphMarker } from "../../../../xmloff/source/text/txtparae";
import type { SwFlyFrameFormat } from "../../core/layout/atrfrm";
import type { BoundGraphicFrame, BoundTextFrames } from "../../core/layout/flycnt";
import { MakeFlySection } from "../../core/doc/doclay";
import type { SwXTextCursor } from "../../core/unocore/unoobj";
import { SwXText } from "../../core/unocore/unotext";

/** Creates native frame attributes from the original size and automatic style members, then opens its original XText cursor. @param parent - Enclosing paragraph cursor. @param value - Frame and textbox attributes. @param style - Resolved frame style. @param bitmap - Named fill item. @returns New native frame cursor. */
export function importTextFrame(
  parent: SwXTextCursor,
  value: XMLTextFrameAttributes,
  style: XMLTextFrameStyle,
  bitmap?: XFillBitmapItem,
): SwXTextCursor {
  const doc = parent.GetDoc();
  const format = importFrame(parent, value, style, bitmap);
  const start = format.GetContent().GetContentIdx()?.GetNode();
  if (!start?.IsStartNode()) throw new Error("assert(Writer text frame section)");
  return new SwXText(doc, start).createTextCursor();
}

/** Inserts a native Writer graphic in the same frame attributes used by the text frame owner. @param parent - Actual text cursor. @param value - Source dimensions and anchor. @param style - Effective frame properties. @param graphic - Embedded package asset. @param bitmap - Named fill item. @returns Nothing. */
export function importGraphicFrame(
  parent: SwXTextCursor,
  value: XMLTextFrameAttributes,
  style: XMLTextFrameStyle,
  graphic: XMLGraphic,
  bitmap?: XFillBitmapItem,
): void {
  importFrame(parent, value, style, bitmap, graphic);
}

/** Constructs a native anchored frame with the appropriate native content owner. @param parent - Enclosing paragraph cursor. @param value - Original frame attributes. @param style - Effective style. @param bitmap - Named fill item. @param graphic - Optional encoded image. @returns Registered fly frame. */
function importFrame(
  parent: SwXTextCursor,
  value: XMLTextFrameAttributes,
  style: XMLTextFrameStyle,
  bitmap?: XFillBitmapItem,
  graphic?: XMLGraphic,
): SwFlyFrameFormat {
  const doc = parent.GetDoc();
  const position = parent.GetPaM().GetPoint();
  const type =
    value.anchor === "as-char"
      ? RndStdIds.FLY_AS_CHAR
      : value.anchor === "char"
        ? RndStdIds.FLY_AT_CHAR
        : RndStdIds.FLY_AT_PARA;
  const set = new SfxItemSet(doc.GetAttrPool(), aFrameFormatSetRange);
  /** Transfers a native item value into the original frame item set. @param item - Temporary item. @returns Nothing. */
  function put(item: SfxPoolItem): void {
    try {
      set.Put(item);
    } finally {
      item.Dispose();
    }
  }
  try {
    const anchor = new SwFormatAnchor(type);
    anchor.SetAnchor(position);
    put(anchor);
    const defaults = doc
      .getIDocumentStylePoolAccess()
      .GetFrameFormatFromPool(
        graphic === undefined ? SwPoolFormatId.FRM_FRAME : SwPoolFormatId.FRM_GRAPHIC,
      );
    if (!defaults) throw new Error("assert(Writer Frame format)");
    const horizontal = defaults.GetHoriOrient();
    const vertical = defaults.GetVertOrient();
    put(
      new SwFormatHoriOrient(
        value.x,
        style.horizontal ?? horizontal.GetHoriOrient(),
        style.horizontalRelation ?? horizontal.GetRelationOrient(),
        style.toggle ?? horizontal.IsPosToggle(),
      ),
    );
    put(
      new SwFormatVertOrient(
        value.y,
        style.vertical ?? vertical.GetVertOrient(),
        style.verticalRelation ?? vertical.GetRelationOrient(),
      ),
    );
    if (style.wrap !== undefined || style.anchorOnly !== undefined) {
      const surround = defaults.GetSurround().Clone();
      if (style.wrap !== undefined) surround.SetSurround(style.wrap as WrapTextMode);
      if (style.anchorOnly !== undefined) surround.SetAnchorOnly(style.anchorOnly);
      put(surround);
    }
    if (style.marginLeft !== undefined || style.marginRight !== undefined) {
      const lr = new SvxLRSpaceItem(RES_LR_SPACE);
      lr.SetLeft(SvxIndentValue.twips(style.marginLeft ?? 0));
      lr.SetRight(SvxIndentValue.twips(style.marginRight ?? 0));
      put(lr);
    }
    if (style.marginTop !== undefined || style.marginBottom !== undefined)
      put(new SvxULSpaceItem(style.marginTop ?? 0, style.marginBottom ?? 0, RES_UL_SPACE));
    const box = importBoxProperties(style, RES_BOX);
    if (box !== undefined) put(box);
    putFrameFillProperties(set, style, bitmap);
    if (value.splitAllowed) put(new SwFormatFlySplit(true));
    if (style.followTextFlow !== undefined) put(new SwFormatFollowTextFlow(style.followTextFlow));
    if (style.allowOverlap !== undefined || style.wrapInfluence !== undefined) {
      const item = defaults.GetWrapInfluenceOnObjPos().Clone();
      if (style.allowOverlap !== undefined) item.SetAllowOverlap(style.allowOverlap);
      if (style.wrapInfluence !== undefined) item.SetWrapInfluenceOnObjPos(style.wrapInfluence);
      put(item);
    }
    const size = defaults.GetFrameSize().Clone();
    applyFrameSize(size, value);
    if (style.relativeWidthRelation !== undefined)
      size.SetWidthPercentRelation(style.relativeWidthRelation);
    if (style.relativeHeightRelation !== undefined)
      size.SetHeightPercentRelation(style.relativeHeightRelation);
    if (style.writingMode !== undefined) {
      const direction = new SvxFrameDirectionItem(SvxFrameDirection.Environment, RES_FRAMEDIR);
      try {
        if (direction.PutValue(style.writingMode)) set.Put(direction);
      } finally {
        direction.Dispose();
      }
    }
    const embedded =
      graphic === undefined
        ? undefined
        : new Graphic(
            graphic.bytes,
            graphic.mediaType,
            new Size(size.GetWidth(), size.GetHeight()),
          );
    put(size);

    if (style.opaque !== undefined) put(new SvxOpaqueItem(RES_OPAQUE, style.opaque));
    const format =
      embedded === undefined
        ? MakeFlySection(doc, type, position, set)
        : doc.GetDocumentContentOperationsManager().InsertGraphic(parent.GetPaM(), embedded, set);
    if (value.name && !doc.GetSpzFrameFormats().FindFormatByName(value.name))
      format.SetFormatName(value.name);
    return format;
  } finally {
    set.Dispose();
  }
}

/** Applies the consumed UNO size members in native descriptor order. @param size - Actual copied frame size. @param value - Original frame size attributes. @returns Nothing. */
function applyFrameSize(size: SwFormatFrameSize, value: XMLTextFrameAttributes): void {
  const width = value.width ?? value.minimumWidth ?? 0;
  const height = value.height ?? value.minimumHeight ?? 0;
  const hasSize =
    width > 0 ||
    height > 0 ||
    value.minimumWidth !== undefined ||
    value.minimumHeight !== undefined ||
    value.relativeWidth !== undefined ||
    value.relativeHeight !== undefined;
  if (!hasSize) {
    size.SetWidth(567);
    size.SetHeight(567);
    return;
  }
  size.SetWidth(width > 0 ? Math.max(width, MINLAY) : size.GetWidth() || MINLAY);
  size.SetHeight(height > 0 ? Math.max(height, MINLAY) : size.GetHeight() || MINLAY);
  if (value.relativeWidth !== undefined) size.SetWidthPercent(value.relativeWidth);
  if (value.relativeHeight !== undefined) size.SetHeightPercent(value.relativeHeight);
  if (value.minimumWidth !== undefined || width > 0 || value.relativeWidth !== undefined)
    size.SetWidthSizeType(
      value.minimumWidth === undefined ? SwFrameSize.Fixed : SwFrameSize.Minimum,
    );
  if (value.minimumHeight !== undefined || height > 0 || value.relativeHeight !== undefined)
    size.SetHeightSizeType(
      value.minimumHeight === undefined ? SwFrameSize.Fixed : SwFrameSize.Minimum,
    );
}

/** Removes the cursor's empty import terminator when the text box already owns content. @param cursor - Native text frame cursor. @returns Nothing. */
export function endTextFrame(cursor: SwXTextCursor): void {
  const node = cursor.GetPaM().GetPoint().GetNode();
  const nodes = node.GetNodes();
  const content = nodes.GetSectionContent(node.StartOfSectionNode());
  if (node.GetTextNode()?.Len() === 0 && content.length > 1) {
    cursor.dispose();
    nodes.RemoveNode(node.GetIndex(), 1, true);
  }
}

/** Projects original native fly members for shared XML frame export. @param format - Actual native format. @param content - Already projected direct section content. @param bitmapStyles - Named bitmap catalogue. @returns Neutral frame element properties. */
export function exportTextFrame(
  format: SwFlyFrameFormat,
  content: readonly XMLTextExportBlock[],
  bitmapStyles?: XMLBitmapStyleExport,
): XMLTextFrameExportSource {
  const size = format.GetFrameSize();
  const horizontal = format.GetHoriOrient();
  const vertical = format.GetVertOrient();
  const wrap = format.GetSurround();
  const items = format.GetAttrSet();
  const lr = items.GetItemIfSet(RES_LR_SPACE, false) as SvxLRSpaceItem | undefined;
  const ul = items.GetItemIfSet(RES_UL_SPACE, false) as SvxULSpaceItem | undefined;
  const widthType = size.GetWidthSizeType();
  const heightType = size.GetHeightSizeType();
  const relativeHeight = size.GetHeightPercent();
  const anchor = format.GetAnchor().GetAnchorId();
  const fill = getFillProperties(items);
  const bitmap = getBitmapFillItem(items);
  const image = bitmap && bitmapStyles?.registerBitmap(bitmap);
  const bitmapFill = getBitmapFillProperties(items, image?.name);
  return {
    name: format.GetName(),
    parentStyle: format.DerivedFrom()?.GetName() ?? "",
    anchor:
      anchor === RndStdIds.FLY_AS_CHAR
        ? "as-char"
        : anchor === RndStdIds.FLY_AT_CHAR
          ? "char"
          : "paragraph",
    x: horizontal.GetPos(),
    y: vertical.GetPos(),
    width: widthType === SwFrameSize.Fixed ? size.GetWidth() : undefined,
    minimumWidth:
      widthType === SwFrameSize.Fixed
        ? undefined
        : widthType === SwFrameSize.Variable
          ? 0
          : size.GetWidth(),
    height: heightType === SwFrameSize.Fixed || relativeHeight > 0 ? size.GetHeight() : undefined,
    minimumHeight:
      heightType === SwFrameSize.Fixed || relativeHeight > 0
        ? undefined
        : heightType === SwFrameSize.Variable
          ? 0
          : size.GetHeight(),
    relativeWidth: size.GetWidthPercent(),
    relativeHeight,
    splitAllowed: format.GetFlySplit().GetValue(),
    ...(image === undefined
      ? {}
      : {
          backgroundImage: {
            href: image.href,
            ...(bitmapFill.bitmapMode === undefined ? {} : { mode: bitmapFill.bitmapMode }),
            ...(bitmapFill.bitmapGeometry?.point === undefined
              ? {}
              : { point: bitmapFill.bitmapGeometry.point }),
            ...(fill.fillTransparency === undefined ? {} : { transparency: fill.fillTransparency }),
          },
        }),
    style: {
      ...fill,
      ...bitmapFill,
      ...exportBoxProperties(items.GetItemIfSet(RES_BOX, false) as SvxBoxItem | undefined),
      horizontal: horizontal.GetHoriOrient(),
      horizontalRelation: horizontal.GetRelationOrient(),
      toggle: horizontal.IsPosToggle(),
      vertical: vertical.GetVertOrient(),
      verticalRelation: vertical.GetRelationOrient(),
      wrap: wrap.GetSurround(),
      anchorOnly: wrap.IsAnchorOnly(),
      writingMode: items.GetItemIfSet(RES_FRAMEDIR, false)
        ? format.GetFrameDir().QueryValue()
        : undefined,
      relativeWidthRelation: size.GetWidthPercentRelation(),
      relativeHeightRelation: size.GetHeightPercentRelation(),
      followTextFlow: items.GetItemIfSet(RES_FOLLOW_TEXT_FLOW, false)
        ? format.GetFollowTextFlow().GetValue()
        : undefined,
      allowOverlap: items.GetItemIfSet(RES_WRAP_INFLUENCE_ON_OBJPOS, false)
        ? format.GetWrapInfluenceOnObjPos().GetAllowOverlap()
        : undefined,
      wrapInfluence: items.GetItemIfSet(RES_WRAP_INFLUENCE_ON_OBJPOS, false)
        ? format.GetWrapInfluenceOnObjPos().GetWrapInfluenceOnObjPos()
        : undefined,
      marginLeft: lr?.ResolveLeft(),
      marginRight: lr?.ResolveRight(),
      marginTop: ul?.GetUpper(),
      marginBottom: ul?.GetLower(),
    },
    content,
  };
}

/** Package-aware bindings for the existing automatic graphic style exporter. */
export interface XMLBoundWriterFrames {
  readonly text: BoundTextFrames;
  readonly bitmapStyles?: XMLBitmapStyleExport;
  readonly graphics?: ReadonlyMap<SwTextNode, readonly BoundGraphicFrame[]>;
  readonly graphicHelper?: SvXMLGraphicHelper;
  readonly exportNumberStyle?: (key: number, systemLanguage?: boolean) => string | undefined;
}

/** Projects native frame portions at the original paragraph or character position. @param node - Native anchor paragraph. @param anchored - Actual bound frames. @param projectBlock - Projects direct text and table children. @returns XML frame portions. */
export function projectAnchoredTextFrames(
  node: SwTextNode,
  anchored: XMLBoundWriterFrames | undefined,
  projectBlock: (block: SwSectionBlock, frames: XMLBoundWriterFrames) => XMLTextExportBlock,
): XMLTextParagraphMarker[] {
  if (anchored === undefined) return [];
  const markers: XMLTextParagraphMarker[] = (anchored.text.get(node) ?? []).map(
    /** Projects one bound frame with its direct native section. @param item - Native frame owner and content. @returns Inline frame portion. */
    ({ format }) => {
      const start = format.GetContent().GetContentIdx()?.GetNode();
      if (!start?.IsStartNode()) throw new Error("assert(Writer text fly section)");
      return {
        kind: "frame",
        frame: exportTextFrame(
          format,
          start
            .GetNodes()
            .GetSectionBlocks(start)
            .map(
              /** Projects a structural text frame child. @param block - Actual direct child. @returns Neutral ODF block. */
              (block) => projectBlock(block, anchored),
            ),
          anchored.bitmapStyles,
        ),
        offset: format.GetAnchor().GetAnchorContentOffset(),
      };
    },
  );
  const helper = anchored.graphicHelper;
  if (helper) {
    for (const { format, graphic } of anchored.graphics?.get(node) ?? []) {
      const picture = graphic.GetGraphic();
      const mediaType = picture.mediaType;
      const href = helper.saveGraphic({ bytes: picture.GetNativeData(), mediaType });
      const frame = exportTextFrame(format, [], anchored.bitmapStyles);
      markers.push({
        kind: "frame",
        offset: format.GetAnchor().GetAnchorContentOffset(),
        frame: {
          ...frame,
          graphic: { href, mediaType },
          style: { ...frame.style, opaque: format.GetOpaque().GetValue() },
        },
      });
    }
  }
  return markers;
}

/** Enumerates the actual text paragraphs in one body or fly section. @param blocks - Direct section blocks. @returns Paragraphs used by the export pass. */
export function* sectionParagraphs(
  blocks: readonly (SwTextNode | SwTableNode)[],
): Generator<SwTextNode> {
  for (const block of blocks) {
    if (!(block instanceof SwTableNode)) yield block;
    else
      for (const row of block.GetTable().GetTabLines())
        for (const cell of row.GetTabBoxes()) yield* sectionParagraphs(cell.GetContentNodes());
  }
}

/** Visits body text followed by the bound text-frame content for automatic styles. @param document - Actual native model. @param anchored - Bound text frame sets. @returns Original text nodes. */
export function* getTextFrameExportParagraphs(
  document: SwDoc,
  anchored: BoundTextFrames,
): Generator<SwTextNode> {
  yield* sectionParagraphs(document.nodes.getBodyContent());
  for (const frames of anchored.values())
    for (const frame of frames) yield* sectionParagraphs(frame.content);
}

/** Orders the original bookmark phases around floating frames and inline fly characters. @param left - First marker. @param right - Second marker. @param framed - Positions of floating frames. @returns Portion order. */
export function compareParagraphMarkers(
  left: XMLTextParagraphMarker,
  right: XMLTextParagraphMarker,
  framed: ReadonlySet<number>,
): number {
  if (left.offset !== right.offset) return left.offset - right.offset;
  const frameAtOffset = framed.has(left.offset);
  /** Returns the native phase of a zero-width portion. @param marker - Paragraph portion. @returns Phase order. */
  function phase(marker: XMLTextParagraphMarker): number {
    switch (marker.kind) {
      case "bookmark-end":
        return frameAtOffset ? (marker.collapsedAroundFrame ? 4 : 3) : 0;
      case "bookmark":
        return 1;
      case "bookmark-start":
        return frameAtOffset ? (marker.collapsedAroundFrame ? 0 : 1) : 2;
      case "frame":
        return marker.frame.anchor === "as-char" ? 6 : 2;
      case "soft-page-break":
        return 5;
      case "annotation":
        return marker.consumesMarker ? 6 : 2;
      case "index-mark-end":
      case "reference-mark-end":
      case "change-end":
        return 3;
      case "index-mark-start":
      case "reference-mark-start":
      case "change-start":
      case "change":
        return 4;
      case "annotation-end":
      case "index-mark":
      case "reference-mark":
      case "reference-field":
      case "doc-info-field":
      case "count-field":
      case "date-time-field":
        return 6;
    }
  }
  return phase(left) - phase(right);
}

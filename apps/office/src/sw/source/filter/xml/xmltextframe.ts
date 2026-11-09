/** @fileoverview Writer native frame properties and fly text cursor at the shared ODF SAX boundary. */
import { aFrameFormatSetRange } from "../../core/bastyp/init";
import { getFillProperties } from "./xmlexp-fill";
import { importBoxProperties } from "./xmlimpit";
import { exportBoxProperties } from "./xmlexpit";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import { XFillColorItem } from "../../../../svx/inc/xflclit";
import { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import type { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { Color } from "../../../../tools/inc/color";
import { SwFormatFlySplit } from "../../../inc/formatflysplit";
import { SwFormatFollowTextFlow } from "../../../inc/fmtfollowtextflow";
import { RES_FOLLOW_TEXT_FLOW, RES_WRAP_INFLUENCE_ON_OBJPOS } from "../../../inc/hintids";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import type { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { MINLAY } from "../../../inc/swtypes";
import { RES_BOX, RES_LR_SPACE, RES_UL_SPACE } from "../../../inc/hintids";
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
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { XMLTextParagraphMarker } from "../../../../xmloff/source/text/txtparae";
import type { SwFlyFrameFormat } from "../../core/layout/atrfrm";
import type { BoundTextFrames } from "../../core/layout/flycnt";
import { MakeFlySection } from "../../core/doc/doclay";
import type { SwXTextCursor } from "../../core/unocore/unoobj";
import { SwXText } from "../../core/unocore/unotext";

/** Creates native frame attributes from the original size and automatic style members, then opens its original XText cursor. @param parent - Enclosing paragraph cursor. @param value - Frame and textbox attributes. @param style - Resolved frame style. @returns New native frame cursor. */
export function importTextFrame(
  parent: SwXTextCursor,
  value: XMLTextFrameAttributes,
  style: XMLTextFrameStyle,
): SwXTextCursor {
  const doc = parent.GetDoc();
  const position = parent.GetPaM().GetPoint();
  const type = value.anchor === "char" ? RndStdIds.FLY_AT_CHAR : RndStdIds.FLY_AT_PARA;
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
      .GetFrameFormatFromPool(SwPoolFormatId.FRM_FRAME);
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
    if (style.fillStyle !== undefined) put(new XFillStyleItem(style.fillStyle as FillStyle));
    if (style.fillColor !== undefined) put(new XFillColorItem("", new Color(style.fillColor)));
    if (style.fillTransparency !== undefined)
      put(new XFillTransparenceItem(style.fillTransparency));
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
    put(size);

    const format = MakeFlySection(doc, type, position, set);
    if (value.name && !doc.GetSpzFrameFormats().FindFormatByName(value.name))
      format.SetFormatName(value.name);
    const start = format.GetContent().GetContentIdx()?.GetNode();
    if (!start?.IsStartNode()) throw new Error("assert(Writer text frame section)");
    return new SwXText(doc, start).createTextCursor();
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

/** Projects original native fly members for shared XML frame export. @param format - Actual native format. @param content - Already projected direct section content. @returns Neutral frame element properties. */
export function exportTextFrame(
  format: SwFlyFrameFormat,
  content: readonly XMLTextExportBlock[],
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
  return {
    name: format.GetName(),
    parentStyle: format.DerivedFrom()?.GetName() ?? "",
    anchor: format.GetAnchor().GetAnchorId() === RndStdIds.FLY_AT_CHAR ? "char" : "paragraph",
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
    style: {
      ...getFillProperties(items),
      ...exportBoxProperties(items.GetItemIfSet(RES_BOX, false) as SvxBoxItem | undefined),
      horizontal: horizontal.GetHoriOrient(),
      horizontalRelation: horizontal.GetRelationOrient(),
      toggle: horizontal.IsPosToggle(),
      vertical: vertical.GetVertOrient(),
      verticalRelation: vertical.GetRelationOrient(),
      wrap: wrap.GetSurround(),
      anchorOnly: wrap.IsAnchorOnly(),
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

/** Projects native frame portions at the original paragraph or character position. @param node - Native anchor paragraph. @param anchored - Actual bound frames. @param projectBlock - Projects direct text and table children. @returns XML frame portions. */
export function projectAnchoredTextFrames(
  node: SwTextNode,
  anchored: BoundTextFrames | undefined,
  projectBlock: (block: SwTextNode | SwTableNode, frames: BoundTextFrames) => XMLTextExportBlock,
): XMLTextParagraphMarker[] {
  if (anchored === undefined) return [];
  return (anchored.get(node) ?? []).map(
    /** Projects one bound frame with its direct native section. @param item - Native frame owner and content. @returns Inline frame portion. */
    ({ format, content }) => ({
      kind: "frame",
      frame: exportTextFrame(
        format,
        content.map(
          /** Projects a native text or table child. @param block - Actual direct child. @returns Neutral ODF block. */
          (block) => projectBlock(block, anchored),
        ),
      ),
      offset: format.GetAnchor().GetAnchorContentOffset(),
    }),
  );
}

/** Enumerates the actual text paragraphs in one body or fly section. @param blocks - Direct section blocks. @returns Paragraphs used by the export pass. */
function* sectionParagraphs(blocks: readonly (SwTextNode | SwTableNode)[]): Generator<SwTextNode> {
  for (const block of blocks) {
    if (!(block instanceof SwTableNode)) yield block;
    else
      for (const row of block.GetTable().GetTabLines())
        for (const cell of row.GetTabBoxes()) yield* cell.GetParagraphs();
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

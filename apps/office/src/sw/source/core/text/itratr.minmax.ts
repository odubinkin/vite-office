/** @fileoverview Original itratr.cxx paragraph offset and anchored Writer fly contributions to import-time text width. */
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwTableNode } from "../docnode/node";
import type { SwFrameFormat } from "../layout/atrfrm";
import {
  resolveSwLeftMarginWithNum,
  resolveSwListFirstLineIndent,
} from "../txtnode/ndtxt-list-indent";
import { RES_FLYFRMFMT, RES_MARGIN_FIRSTLINE } from "../../../inc/hintids";
import type { SvxFirstLineIndentItem } from "../../../../editeng/inc/lrspitem";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";

/** Native preliminary minimum, maximum, and common offset for the text-width calculation. */
export interface SwMinMaxNodeMetrics {
  readonly minimum: number;
  readonly maximum: number;
  readonly margin: number;
}

/** Original mutable width accumulators for anchored content. */
interface SwMinMaxNodeArgs {
  minimum: number;
  maximum: number;
  leftRest: number;
  rightRest: number;
  leftDiff: number;
  rightDiff: number;
  index: number;
}

/** Measures the actual format or first/last contained table through the original item/layout owners. @param format - Actual Writer fly format. @param args - Native accumulating arguments. @returns Nothing. */
function lcl_MinMaxNode(format: SwFrameFormat, args: SwMinMaxNodeArgs): void {
  const anchor = format.GetAnchor(),
    id = anchor.GetAnchorId();
  if (
    (id !== RndStdIds.FLY_AT_PARA && id !== RndStdIds.FLY_AT_CHAR) ||
    anchor.GetAnchorNode()?.GetIndex() !== args.index
  )
    return;
  const content = format.GetContent().GetContentIdx();
  if (content === null) throw new Error("assert(anchored Writer fly content)");
  const nodes = format.GetDoc().GetNodes();
  let table = nodes.at(content.GetIndex() + 1);
  if (!(table instanceof SwTableNode)) {
    const last = nodes.at(content.GetNode().EndOfSectionIndex() - 1);
    if (last.IsEndNode()) table = last.StartOfSectionNode();
  }
  const layout = table instanceof SwTableNode ? table.GetTable().GetHTMLTableLayout() : null;
  const sizeMin = layout ? layout.GetMin() : format.GetFrameSize().GetWidth(),
    sizeMax = layout ? layout.GetMax() : sizeMin,
    difference = sizeMax - sizeMin,
    spacing = format.GetLRSpace(),
    inset = spacing.ResolveLeft() + spacing.ResolveRight(),
    minimum = sizeMin + inset;

  if (format.GetSurround().GetSurround() === WrapTextMode.THROUGH) {
    args.minimum = Math.max(args.minimum, minimum);
    return;
  }
  const orientation = format.GetHoriOrient(),
    relation = orientation.GetRelationOrient();
  switch (orientation.GetHoriOrient()) {
    case HoriOrientation.RIGHT:
      if (difference) {
        args.rightRest -= args.rightDiff;
        args.rightDiff = difference;
      }
      if (relation !== RelOrientation.FRAME && args.rightRest > 0) args.rightRest = 0;
      args.rightRest -= minimum;
      break;
    case HoriOrientation.LEFT:
      if (difference) {
        args.leftRest -= args.leftDiff;
        args.leftDiff = difference;
      }
      if (relation !== RelOrientation.FRAME && args.leftRest < 0) args.leftRest = 0;
      args.leftRest -= minimum;
      break;
    default:
      args.maximum += sizeMax + inset;
      args.minimum = Math.max(args.minimum, minimum);
  }
}

/** Resolves original paragraph indents and anchored Writer fly widths ahead of text measurement. @param node - Actual source text node. @param index - Native anchor-node index or zero to omit the anchored scan. @returns Original preliminary measurements. */
export function GetMinMaxNodeMetrics(node: SwTextNode, index: number): SwMinMaxNodeMetrics {
  let left = node.GetParagraphTextLeftMargin() + resolveSwLeftMarginWithNum(node, true);
  const numbered = node.GetNum()?.GetNumRule() !== undefined;
  const first = numbered
    ? resolveSwListFirstLineIndent(node)
    : ((
        node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
      ).ResolveTextFirstLineOffset() <<
        16) >>
      16;
  if (!numbered || first > left) left = first;
  const right = node.GetParagraphRightMargin();
  const args: SwMinMaxNodeArgs = {
    minimum: 0,
    maximum: 0,
    leftRest: left,
    rightRest: right,
    leftDiff: 0,
    rightDiff: 0,
    index,
  };
  if (index) {
    // The current Writer graph contains actual Writer fly formats; native drawing-object bounds require the drawing owner.
    for (const format of node.GetDoc().GetSpzFrameFormats())
      if (format.Which() === RES_FLYFRMFMT) lcl_MinMaxNode(format, args);
  }
  if (args.leftRest < 0) args.minimum = Math.max(args.minimum, left - args.leftRest);
  args.leftRest -= args.leftDiff;
  if (args.leftRest < 0) args.maximum -= args.leftRest;
  if (args.rightRest < 0) args.minimum = Math.max(args.minimum, right - args.rightRest);
  args.rightRest -= args.rightDiff;
  if (args.rightRest < 0) args.maximum -= args.rightRest;
  return { minimum: args.minimum, maximum: args.maximum, margin: left + right };
}

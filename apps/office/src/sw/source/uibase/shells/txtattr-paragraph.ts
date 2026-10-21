/** @fileoverview Projects SwTextShell::GetAttrState's combined indent item from Writer's three native paragraph attributes. */
import {
  SvxFirstLineIndentItem,
  SvxLRSpaceItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SID_ATTR_PARA_LRSPACE } from "../../../../editeng/inc/editids";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_RIGHT, RES_MARGIN_TEXTLEFT } from "../../../inc/hintids";
import type { SwTextNode } from "../../core/txtnode/ndtxt";

/** Recombines source attributes without resolving relative units or losing percentages and automatic indentation. @param paragraph - Actual text node. @returns Independent slot item. */
export function createSwParagraphLRSpaceItem(paragraph: SwTextNode): SvxLRSpaceItem {
  const first = paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem,
    left = paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem,
    right = paragraph.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem,
    item = new SvxLRSpaceItem(SID_ATTR_PARA_LRSPACE);
  item.SetTextFirstLineOffset(first.GetTextFirstLineOffset(), first.GetPropTextFirstLineOffset());
  item.SetAutoFirst(first.IsAutoFirst());
  item.SetTextLeft(left.GetTextLeft(), left.GetPropLeft());
  item.SetRight(right.GetRight(), right.GetPropRight());
  return item;
}

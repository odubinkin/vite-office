/** @fileoverview Projects SwTextShell::GetAttrState's combined indent item from Writer's three native paragraph attributes. */
import {
  SvxFirstLineIndentItem,
  SvxLRSpaceItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SID_ATTR_PARA_LRSPACE } from "../../../../editeng/inc/editids";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SwFormatLineNumber } from "../../../inc/fmtline";
import {
  RES_LINENUMBER,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
} from "../../../inc/hintids";
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

/** Primitive values accepted by the supported Writer paragraph dialog. */
export interface WriterParagraphFormatValue {
  readonly upperPt: number;
  readonly lowerPt: number;
  readonly contextual: boolean;
  readonly lineMode: "proportional" | "fixed" | "minimum" | "leading";
  readonly lineValue: number;
  readonly tabStopsPt: readonly number[];
  readonly keepWithNext: boolean;
  readonly keepTogether?: boolean;
  readonly orphans?: number;
  readonly widows?: number;
  readonly breakBefore?: "auto" | "page";
  readonly breakAfter?: "auto" | "page";
  readonly firstLineIndentPt?: number;
  readonly autoTextIndent?: boolean;
  readonly pageStyleName?: string;
  readonly pageNumber?: number | "auto";
  readonly countLineNumbers: boolean;
}

/** Changes the scalar compatibility flag while retaining the paragraph's native start value. @param paragraph - Actual text node. @param count - Requested participation. @returns Native item. */
export function createParagraphLineCountItem(
  paragraph: SwTextNode,
  count: boolean,
): SwFormatLineNumber {
  const item = (paragraph.GetAttr(RES_LINENUMBER) as SwFormatLineNumber).Clone();
  item.SetCountLines(count);
  return item;
}

/** Resolves the paragraph page assignment only when one was submitted. @param value - Dialog page assignment. @returns Present native page item. */
export function createParagraphPageDescItems(
  value: WriterParagraphFormatValue,
): readonly SwFormatPageDesc[] {
  if (value.pageStyleName === undefined && value.pageNumber === undefined) return [];
  return [
    new SwFormatPageDesc(
      value.pageStyleName ?? "",
      value.pageNumber === "auto" ? undefined : value.pageNumber,
    ),
  ];
}

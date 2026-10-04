/** @fileoverview Resolves supported first-line margins from pinned SwTextMargin in itrcrsr.cxx. */

import type { SwTextNode } from "../txtnode/ndtxt";
import type { SvxFirstLineIndentItem } from "../../../../editeng/source/items/frmitems";
import type { SvxLineSpacingItem } from "../../../../editeng/source/items/paraitem";
import type { SvxFontHeightItem } from "../../../../editeng/source/items/textitem";
import {
  RES_CHRATR_FONTSIZE,
  RES_MARGIN_FIRSTLINE,
  RES_PARATR_LINESPACING,
} from "../../../inc/hintids";

/** Resolves Western paragraph layout without changing authored first-line items or list geometry. @param paragraph - Canonical text node. @returns First-line layout offset in twips. */
export function resolveSwTextFirstLineIndent(paragraph: SwTextNode): number {
  const item = paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem;
  if (paragraph.GetNum()?.GetNumRule() !== undefined) return item.ResolveTextFirstLineOffset();
  // GetFirstLineOfsWithNum writes the manual offset through short before
  // SwTextMargin widens it for placement; the pooled item remains unchanged.
  if (!item.IsAutoFirst()) return (item.ResolveTextFirstLineOffset() << 16) >> 16;
  const height = (paragraph.GetAttr(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight() * 2;
  if (
    paragraph
      .GetDoc()
      .GetDocumentSettingManager()
      .get("AUTO_FIRST_LINE_INDENT_DISREGARD_LINE_SPACE")
  )
    return height;
  const spacing = paragraph.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
  const value = spacing.GetValue();
  switch (spacing.GetMode()) {
    case "fixed":
      return value;
    case "minimum":
      return Math.max(height, value);
    case "leading":
      return height + value;
    case "proportional":
      return Math.max(1, Math.trunc((height * (value === 0 ? 100 : Math.max(50, value))) / 100));
  }
}

/** @fileoverview Implements Writer's document-wide font auto-style pool from xmlfonte.cxx. */

import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT, RES_CHRATR_FONT } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/text-run-projection";

/** Collects pool defaults and every direct Writer font item in deterministic family order. @param document - Source document. @returns Populated font pool. */
export function createWriterFontAutoStylePool(document: SwDoc): XMLFontAutoStylePool {
  const families: string[] = [];
  for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
    families.push(
      (document.GetAttrPool().GetUserOrPoolDefaultItem(which) as SvxFontItem).GetFamilyName(),
    );
  for (const collection of document.GetTextFormatColls())
    for (const item of collection.GetAttrSet().entries())
      if (item instanceof SvxFontItem) families.push(item.GetFamilyName());
  for (const node of document.paragraphs) {
    for (const item of node.GetSwAttrSet().entries())
      if (item instanceof SvxFontItem) families.push(item.GetFamilyName());
    for (const run of projectWriterTextRuns(node))
      if (run.attributes.fontFamily !== undefined) families.push(run.attributes.fontFamily);
  }
  families.sort();
  const fonts = new XMLFontAutoStylePool();
  for (const family of families) fonts.Add(family);
  return fonts;
}

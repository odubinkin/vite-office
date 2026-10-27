/** @fileoverview Native document font-item enumeration from sw/source/core/doc/doc.cxx. */
import type { SwDoc } from "./doc";
import { SwContentNode } from "../docnode/node";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT } from "../../../inc/hintids";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";

/** Original named-character, paragraph, fixed-count content-node and automatic-style order; false stops immediately. @param doc - Actual document. @param which - One of the three font identities. @param ignoreAutoStyles - Skip the pool under construction. @param callback - Native borrowed item callback. @returns Nothing. */
export function ForEachCharacterFontItem(
  doc: SwDoc,
  which: number,
  ignoreAutoStyles: boolean,
  callback: (font: SvxFontItem) => boolean,
): void {
  if (which !== RES_CHRATR_FONT && which !== RES_CHRATR_CJK_FONT && which !== RES_CHRATR_CTL_FONT)
    throw new Error("ForEachCharacterFontItem requires a character font identity");
  for (const format of doc.GetCharFormats()) {
    const item = format.GetAttrSet().GetItemIfSet(which) as SvxFontItem | undefined;
    if (item !== undefined && !callback(item)) return;
  }
  for (const format of doc.GetTextFormatColls()) {
    const item = format.GetAttrSet().GetItemIfSet(which) as SvxFontItem | undefined;
    if (item !== undefined && !callback(item)) return;
  }
  const nodes = doc.GetNodes(),
    count = nodes.Count();
  for (let index = 0; index < count; ++index) {
    const node = nodes.at(index);
    if (node instanceof SwContentNode && node.HasSwAttrSet()) {
      const item = node.GetSwAttrSet().GetItemIfSet(which) as SvxFontItem | undefined;
      if (item !== undefined && !callback(item)) return;
    }
  }
  if (!ignoreAutoStyles) {
    const styles: SfxItemSet[] = [];
    try {
      doc.GetIStyleAccess().getAllStyles(styles, SwAutoStyleFamily.AUTO_STYLE_CHAR);
      for (const set of styles) {
        const item = set.GetItemIfSet(which) as SvxFontItem | undefined;
        if (item !== undefined && !callback(item)) return;
      }
    } finally {
      for (const set of styles) releaseStyleHandle(set);
    }
  }
}
